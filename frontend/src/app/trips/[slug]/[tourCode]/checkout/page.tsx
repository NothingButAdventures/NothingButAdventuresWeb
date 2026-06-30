"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { Tag, WarningCircle, X, Coins, HourglassHigh, User, CalendarBlank, Plus, CurrencyDollar, Money, CheckCircle } from "@phosphor-icons/react";

interface Tour {
    _id: string;
    name: string;
    slug: string;
    tourCode: string;
    summary: string;
    description: string;
    descriptionImage?: string;
    price: {
        amount: number;
        currency: string;
        discountPercent: number;
        bookingPercentage?: number;
        ownRoomPrice?: number;
    };
    ownRoomAvailable: boolean;
    ownRoomPrice?: number;
    duration: {
        days: number;
        nights: number;
    };
    maxGroupSize: number;
    ratingsAverage: number;
    ratingsQuantity: number;
    images: Array<{
        url: string;
        caption: string;
        isPrimary: boolean;
    }>;
    itinerary: Array<{
        day: number;
        title: string;
        description: string;
        activities: Array<{
            name: string;
            description: string;
            placeName: string;
            duration: string;
            icon: string;
        }>;
        optionalActivities: Array<{
            name?: string;
            title?: string;
            price: number | {
                amount: number;
                currency: string;
            };
            place: string;
            description: string;
            duration: string;
            icon: string;
        }>;
        accommodations: Array<{
            name: string;
            type: string;
            rating?: number;
            description?: string;
        }>;
    }>;
    location: {
        startCity: string;
        endCity: string;
        visitedCities: string[];
    };
    country: {
        _id: string;
        name: string;
        slug: string;
        continent?: {
            _id: string;
            name: string;
            slug: string;
        };
    };
    startDates: Array<{
        _id?: string;
        startDate: string;
        endDate: string;
        availableSpots: number;
        discount?: string;
        price?: {
            amount: number;
            currency: string;
        };
        isActive: boolean;
    }>;
}

interface Traveller {
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    countryCode: string;
    phone: string;
    dobDay: string;
    dobMonth: string;
    dobYear: string;
    nationality: string;
}

interface SelectedActivity {
    dayNumber: number;
    activityIndex: number;
    name: string;
    price: number;
    currency: string;
    count: number;
    participants?: number[];
}

interface AccommodationUpgrade {
    name: string;
    description: string;
    price: number;
    currency: string;
    count: number;
    participants?: number[];
}

type CheckoutStep = 1 | 2 | 3 | 4;

export default function CheckoutPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const slug = params.slug as string;
    const tourCode = params.tourCode as string;

    // Pre-selected date from query params
    const preSelectedDateParam = searchParams.get("date");

    const [tour, setTour] = useState<Tour | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
    const [discountsMap, setDiscountsMap] = useState<{ [name: string]: number }>({});

    // Promo code state
    const [promoData, setPromoData] = useState<{
        code: string;
        discountType: string;
        discountValue: number;
        discountAmount: number;
    } | null>(null);
    const [promoCodeInput, setPromoCodeInput] = useState("");
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoError, setPromoError] = useState<string | null>(null);

    // Helper function to get discount percentage by name
    const getDiscountPercentage = (discountName: string | undefined): number => {
        if (!discountName) return 0;
        return discountsMap[discountName] || 0;
    };

    // Helper: get best discount considering promo
    const getBestDiscountPct = (dateDiscountPct: number, basePrice: number): number => {
        let promoDiscountPct = 0;
        if (promoData) {
            if (promoData.discountType === "percentage") {
                promoDiscountPct = promoData.discountValue;
            } else {
                promoDiscountPct = (promoData.discountAmount / basePrice) * 100;
            }
        }
        return Math.max(dateDiscountPct, promoDiscountPct);
    };

    // Step 1: Travellers
    const [adultCount, setAdultCount] = useState(1);
    const [primaryTraveller, setPrimaryTraveller] = useState<Traveller>({
        title: "",
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        countryCode: "+1 - United States",
        phone: "",
        dobDay: "",
        dobMonth: "",
        dobYear: "",
        nationality: "British",
    });
    const [otherTravellers, setOtherTravellers] = useState<Traveller[]>([]);

    useEffect(() => {
        setOtherTravellers(prev => {
            if (prev.length === adultCount - 1) return prev;
            if (prev.length > adultCount - 1) return prev.slice(0, adultCount - 1);

            const newTravellers = [...prev];
            while (newTravellers.length < adultCount - 1) {
                newTravellers.push({
                    title: "",
                    firstName: "",
                    middleName: "",
                    lastName: "",
                    email: "",
                    countryCode: "+1 - United States",
                    phone: "",
                    dobDay: "",
                    dobMonth: "",
                    dobYear: "",
                    nationality: "British",
                });
            }
            return newTravellers;
        });
    }, [adultCount]);

    // Step 2: Date Selection
    const [selectedDateId, setSelectedDateId] = useState<string | null>(null);
    const [calendarMonth, setCalendarMonth] = useState(new Date());

    // Step 3: Activities & Extras
    const [selectedActivities, setSelectedActivities] = useState<SelectedActivity[]>([]);
    const [expandedDays, setExpandedDays] = useState<number[]>([]);
    const [openActivityDropdown, setOpenActivityDropdown] = useState<string | null>(null);

    // Step 4: Accommodation & Travel Extras
    const [accommodationUpgrade, setAccommodationUpgrade] = useState<AccommodationUpgrade | null>(null);
    const [arrivalOption, setArrivalOption] = useState<"same-day" | "earlier" | "later">("same-day");
    const [departureOption, setDepartureOption] = useState<"same-day" | "earlier" | "later">("same-day");

    // Payment Simulation State
    const [isBooking, setIsBooking] = useState(false);
    const [bookingError, setBookingError] = useState("");
    const [paymentOption, setPaymentOption] = useState<"full" | "deposit" | "installments">("full");

    useEffect(() => {
        if (slug) {
            fetchTour();
        }
    }, [slug]);

    // Pre-select date from query params
    useEffect(() => {
        if (tour && preSelectedDateParam && !selectedDateId) {
            const matchingDate = tour.startDates.find(
                (d) => new Date(d.startDate).toISOString().split("T")[0] === preSelectedDateParam
            );
            if (matchingDate && matchingDate._id) {
                setSelectedDateId(matchingDate._id);
                // Also set calendar month to show the selected date
                setCalendarMonth(new Date(matchingDate.startDate));
            }
        }
    }, [tour, preSelectedDateParam, selectedDateId]);

    // Ensure activity and accommodation counts don't exceed adult count
    useEffect(() => {
        setSelectedActivities((prev) =>
            prev.map((a) => {
                const newCount = Math.min(a.count, adultCount);
                let newParticipants = a.participants;
                if (newParticipants) {
                    newParticipants = newParticipants.filter(p => p < adultCount);
                }
                return {
                    ...a,
                    count: newParticipants ? newParticipants.length : newCount,
                    participants: newParticipants
                };
            }).filter(a => a.count > 0)
        );

        if (accommodationUpgrade && accommodationUpgrade.count > adultCount) {
            setAccommodationUpgrade({
                ...accommodationUpgrade,
                count: adultCount,
            });
        }

        setOtherTravellers((prev) => {
            const newTravellers = [...prev];
            if (adultCount - 1 > newTravellers.length) {
                for (let i = newTravellers.length; i < adultCount - 1; i++) {
                    newTravellers.push({ title: "", firstName: "", middleName: "", lastName: "", email: "", countryCode: "+1 - United States", phone: "", dobDay: "", dobMonth: "", dobYear: "", nationality: "" } as Traveller);
                }
            } else if (adultCount - 1 < newTravellers.length) {
                newTravellers.splice(adultCount - 1);
            }
            return newTravellers;
        });
    }, [adultCount]);

    const handleApplyPromoCode = async () => {
        if (!promoCodeInput.trim() || !tour) return;

        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/auth/login");
            return;
        }

        setPromoLoading(true);
        setPromoError(null);

        try {
            const res = await fetch(`${api.baseURL}${api.endpoints.promoCodes.apply}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    code: promoCodeInput.trim(),
                    tourId: tour._id,
                }),
            });
            const data = await res.json();

            if (res.ok && data.status === "success") {
                setPromoData({
                    code: data.data.promoCode.code,
                    discountType: data.data.promoCode.discountType,
                    discountValue: data.data.promoCode.discountValue,
                    discountAmount: data.data.promoCode.discountAmount,
                });
                setPromoError(null);
            } else {
                setPromoError(data.message || "Invalid promo code");
            }
        } catch (e) {
            setPromoError("Something went wrong. Please try again.");
        } finally {
            setPromoLoading(false);
        }
    };

    const clearPromoCode = () => {
        setPromoData(null);
        setPromoCodeInput("");
        setPromoError(null);
    };

    const fetchTour = async () => {
        try {
            setLoading(true);

            // Fetch discounts first to build the lookup map
            try {
                const discountsResponse = await fetch(`${api.baseURL}/discounts`);
                if (discountsResponse.ok) {
                    const discountsData = await discountsResponse.json();
                    const discounts = discountsData.data.discounts || [];
                    const map: { [name: string]: number } = {};
                    discounts.forEach((d: { name: string; percentage: number }) => {
                        map[d.name] = d.percentage;
                    });
                    setDiscountsMap(map);
                }
            } catch (error) {
                console.error("Failed to fetch discounts:", error);
            }

            const response = await fetch(`${api.baseURL}/tours/${slug}`);
            const data = await response.json();

            if (response.ok) {
                const fetchedTour = data.data.tour;
                setTour(fetchedTour);

                // Check for active promo code on this tour
                try {
                    const token = localStorage.getItem("token");
                    if (token && fetchedTour._id) {
                        const promoRes = await fetch(
                            `${api.baseURL}${api.endpoints.promoCodes.checkStatus(fetchedTour._id)}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        const promoResData = await promoRes.json();
                        if (promoResData.status === "success" && promoResData.data.hasActivePromo) {
                            setPromoData({
                                code: promoResData.data.promoCode.code,
                                discountType: promoResData.data.promoCode.discountType,
                                discountValue: promoResData.data.promoCode.discountValue,
                                discountAmount: promoResData.data.promoCode.discountAmount,
                            });
                        }
                    }
                } catch (e) {
                    // silent fail
                }
            } else {
                console.error("Failed to fetch tour:", data.message);
            }
        } catch (error) {
            console.error("Error fetching tour:", error);
        } finally {
            setLoading(false);
        }
    };

    const selectedDate = useMemo(() => {
        if (!tour || !selectedDateId) return null;
        return tour.startDates.find((d) => d._id === selectedDateId) || null;
    }, [tour, selectedDateId]);

    const calculateTotalPrice = useMemo(() => {
        if (!tour) return 0;

        let basePrice = tour.price.amount;

        // Apply date-specific discount if available
        const dateDiscount = getDiscountPercentage(selectedDate?.discount);
        const bestDiscount = getBestDiscountPct(dateDiscount, tour.price.amount);

        if (bestDiscount > 0) {
            basePrice = tour.price.amount * (1 - bestDiscount / 100);
        } else if (selectedDate?.price?.amount) {
            basePrice = selectedDate.price.amount;
        } else if (tour.price.discountPercent > 0) {
            basePrice = basePrice * (1 - tour.price.discountPercent / 100);
        }

        const activitiesTotal = selectedActivities.reduce((sum, act) => sum + act.price * act.count, 0);
        const accommodationTotal = accommodationUpgrade ? accommodationUpgrade.price * accommodationUpgrade.count : 0;

        return Math.round((basePrice * adultCount) + activitiesTotal + accommodationTotal);
    }, [tour, selectedDate, adultCount, selectedActivities, accommodationUpgrade, promoData]);

    const isDepositAvailable = useMemo(() => {
        if (!selectedDate) return false;
        const now = new Date();
        const start = new Date(selectedDate.startDate);
        const differenceInTime = start.getTime() - now.getTime();
        const differenceInDays = differenceInTime / (1000 * 3600 * 24);
        return differenceInDays >= 90;
    }, [selectedDate]);

    const depositAmount = useMemo(() => {
        if (!tour) return 0;
        const percentage = tour.price.bookingPercentage || 20;
        return Math.round(calculateTotalPrice * (percentage / 100));
    }, [calculateTotalPrice, tour]);

    const finalPaymentDate = useMemo(() => {
        if (!selectedDate) return new Date();
        const start = new Date(selectedDate.startDate);
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() - 90); // Must be fully paid 90 days before tour
        return start;
    }, [selectedDate]);

    const installmentPlan = useMemo(() => {
        if (!selectedDate || !isDepositAvailable) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const deadline = new Date(finalPaymentDate);
        const msPerDay = 24 * 60 * 60 * 1000;
        const daysUntilDeadline = Math.floor((deadline.getTime() - today.getTime()) / msPerDay);

        if (daysUntilDeadline < 60) return null;

        const availableMonths = Math.floor(daysUntilDeadline / 30);
        const numberOfInstallments = Math.min(Math.max(availableMonths, 2), 12);

        const bookingPercentage = tour?.price?.bookingPercentage || 20;
        const rawRemaining = calculateTotalPrice * (1 - bookingPercentage / 100);
        const installmentAmount = Math.floor((rawRemaining / numberOfInstallments) * 100) / 100;
        const totalFromInstallments = Math.round(installmentAmount * numberOfInstallments * 100) / 100;
        const upfrontAmount = Math.round((calculateTotalPrice - totalFromInstallments) * 100) / 100;

        const schedule = [];
        for (let i = 0; i < numberOfInstallments; i++) {
            const dueDate = new Date(today);
            dueDate.setMonth(dueDate.getMonth() + i + 1);
            if (dueDate > deadline) {
                dueDate.setTime(deadline.getTime() - msPerDay);
            }
            schedule.push({
                index: i + 1,
                amount: installmentAmount,
                date: dueDate
            });
        }

        return {
            upfrontAmount,
            installmentAmount,
            schedule
        };
    }, [selectedDate, isDepositAvailable, calculateTotalPrice, finalPaymentDate, tour]);

    const payNowAmount = useMemo(() => {
        if (paymentOption === "installments" && installmentPlan) {
            return installmentPlan.upfrontAmount;
        }
        return paymentOption === "deposit" && isDepositAvailable ? depositAmount : calculateTotalPrice;
    }, [paymentOption, isDepositAvailable, depositAmount, calculateTotalPrice, installmentPlan]);

    const pricePerPerson = useMemo(() => {
        if (!tour) return 0;
        let basePrice = tour.price.amount;

        // Apply date-specific discount if available
        const dateDiscount = getDiscountPercentage(selectedDate?.discount);
        const bestDiscount = getBestDiscountPct(dateDiscount, tour.price.amount);

        if (bestDiscount > 0) {
            basePrice = tour.price.amount * (1 - bestDiscount / 100);
        } else if (selectedDate?.price?.amount) {
            basePrice = selectedDate.price.amount;
        } else if (tour.price.discountPercent > 0) {
            basePrice = basePrice * (1 - tour.price.discountPercent / 100);
        }

        return Math.round(basePrice);
    }, [tour, selectedDate, promoData]);

    const formatPrice = (amount: number, currency: string = "USD") => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatShortDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    // Calendar helpers
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const days: (number | null)[] = [];
        for (let i = 0; i < startingDay; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return days;
    };

    const getDateStatus = (day: number, currentMonthDate: Date) => {
        if (!tour) return null;
        const dateStr = `${currentMonthDate.getFullYear()}-${String(currentMonthDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const matchingDate = tour.startDates.find((d) => {
            const startDateStr = new Date(d.startDate).toISOString().split("T")[0];
            return startDateStr === dateStr && d.isActive && d.availableSpots > 0;
        });

        return matchingDate || null;
    };

    const navigateMonth = (direction: "prev" | "next") => {
        setCalendarMonth((prev) => {
            const newDate = new Date(prev);
            if (direction === "prev") {
                newDate.setMonth(newDate.getMonth() - 1);
            } else {
                newDate.setMonth(newDate.getMonth() + 1);
            }
            return newDate;
        });
    };

    const toggleActivityParticipant = (dayNumber: number, activityIndex: number, participantIndex: number, isSelected: boolean, activity: Tour["itinerary"][0]["optionalActivities"][0]) => {
        setSelectedActivities((prev) => {
            const existingIndex = prev.findIndex((a) => a.dayNumber === dayNumber && a.activityIndex === activityIndex);
            if (existingIndex !== -1) {
                const existing = prev[existingIndex];
                let newParticipants = existing.participants || Array.from({ length: existing.count }, (_, i) => i);
                if (isSelected) {
                    if (!newParticipants.includes(participantIndex)) {
                        newParticipants = [...newParticipants, participantIndex].sort((a, b) => a - b);
                    }
                } else {
                    newParticipants = newParticipants.filter(p => p !== participantIndex);
                }

                if (newParticipants.length === 0) {
                    return prev.filter((_, i) => i !== existingIndex);
                } else {
                    const newArr = [...prev];
                    newArr[existingIndex] = { ...existing, participants: newParticipants, count: newParticipants.length };
                    return newArr;
                }
            } else if (isSelected) {
                const activityPrice = typeof activity.price === "number"
                    ? activity.price
                    : (activity.price?.amount || 0);
                const activityCurrency = typeof activity.price === "number"
                    ? "USD"
                    : (activity.price?.currency || "USD");

                return [
                    ...prev,
                    {
                        dayNumber,
                        activityIndex,
                        name: activity.name || activity.title || "",
                        price: activityPrice,
                        currency: activityCurrency,
                        count: 1,
                        participants: [participantIndex]
                    }
                ];
            }
            return prev;
        });
    };

    const updateActivityCount = (dayNumber: number, activityIndex: number, activity: Tour["itinerary"][0]["optionalActivities"][0], newCount: number) => {
        if (newCount === 0) {
            setSelectedActivities((prev) =>
                prev.filter((a) => !(a.dayNumber === dayNumber && a.activityIndex === activityIndex))
            );
        } else {
            const activityPrice = typeof activity.price === "number"
                ? activity.price
                : (activity.price?.amount || 0);
            const activityCurrency = typeof activity.price === "number"
                ? "USD"
                : (activity.price?.currency || "USD");

            setSelectedActivities((prev) => {
                const existing = prev.find((a) => a.dayNumber === dayNumber && a.activityIndex === activityIndex);
                if (existing) {
                    return prev.map((a) =>
                        a.dayNumber === dayNumber && a.activityIndex === activityIndex
                            ? { ...a, count: newCount, participants: Array.from({ length: newCount }, (_, i) => i) }
                            : a
                    );
                } else {
                    return [
                        ...prev,
                        {
                            dayNumber,
                            activityIndex,
                            name: activity.name || activity.title || "",
                            price: activityPrice,
                            currency: activityCurrency,
                            count: newCount,
                            participants: Array.from({ length: newCount }, (_, i) => i)
                        },
                    ];
                }
            });
        }
    };

    const updateAccommodationCount = (newCount: number) => {
        if (newCount === 0) {
            setAccommodationUpgrade(null);
        } else {
            setAccommodationUpgrade({
                name: "Add your own room",
                description: "Private room upgrade",
                price: tour?.price?.ownRoomPrice ?? tour?.ownRoomPrice ?? 0,
                currency: "USD",
                count: newCount,
            });
        }
    };

    const toggleAccommodationParticipant = (participantIndex: number, isSelected: boolean) => {
        setAccommodationUpgrade((prev) => {
            let newParticipants = prev?.participants || (prev ? Array.from({ length: prev.count }, (_, i) => i) : []);

            if (isSelected) {
                if (!newParticipants.includes(participantIndex)) {
                    newParticipants = [...newParticipants, participantIndex].sort((a, b) => a - b);
                }
            } else {
                newParticipants = newParticipants.filter(p => p !== participantIndex);
            }

            if (newParticipants.length === 0) {
                return null;
            } else {
                return {
                    name: "Add your own room",
                    description: "Private room upgrade",
                    price: tour?.price?.ownRoomPrice ?? tour?.ownRoomPrice ?? 0,
                    currency: "USD",
                    count: newParticipants.length,
                    participants: newParticipants
                };
            }
        });
    };

    const getActivityCount = (dayNumber: number, activityIndex: number) => {
        const activity = selectedActivities.find(
            (a) => a.dayNumber === dayNumber && a.activityIndex === activityIndex
        );
        return activity ? activity.count : 0;
    };

    const toggleDayExpanded = (dayNumber: number) => {
        setExpandedDays((prev) =>
            prev.includes(dayNumber)
                ? prev.filter((d) => d !== dayNumber)
                : [...prev, dayNumber]
        );
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                const isPrimaryValid = !!(primaryTraveller.title && primaryTraveller.firstName && primaryTraveller.lastName);
                const areOthersValid = otherTravellers.every(t => !!(t.title && t.firstName && t.lastName));
                return isPrimaryValid && areOthersValid;
            case 2:
                return selectedDateId !== null;
            case 3:
                return true; // Optional step
            case 4:
                const isPrimaryFullValid = !!(primaryTraveller.email && primaryTraveller.phone && primaryTraveller.dobDay && primaryTraveller.dobMonth && primaryTraveller.dobYear && primaryTraveller.nationality);
                const areOthersFullValid = otherTravellers.every(t => !!(t.email && t.phone && t.dobDay && t.dobMonth && t.dobYear && t.nationality));
                return paymentOption !== null && isPrimaryFullValid && areOthersFullValid;
            default:
                return false;
        }
    };

    const handleContinue = () => {
        if (currentStep < 4) {
            setCurrentStep((prev) => (prev + 1) as CheckoutStep);
        } else {
            // Submit booking
            handleSubmitBooking();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => (prev - 1) as CheckoutStep);
        }
    };

    const handleSubmitBooking = async () => {
        setIsBooking(true);
        setBookingError("");

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setBookingError("Please log in to complete your booking");
                setIsBooking(false);
                return;
            }

            if (!tour || !selectedDate) {
                setBookingError("Missing tour details");
                setIsBooking(false);
                return;
            }

            const travelersList = [];
            // Add primary traveller
            travelersList.push({
                firstName: primaryTraveller.firstName,
                lastName: primaryTraveller.lastName,
                email: primaryTraveller.email,
                phone: `${primaryTraveller.countryCode} ${primaryTraveller.phone}`,
                dateOfBirth: new Date(`${primaryTraveller.dobYear}-${primaryTraveller.dobMonth}-${primaryTraveller.dobDay}`),
                nationality: primaryTraveller.nationality,
            });

            // Add other travelers from state
            for (let i = 0; i < otherTravellers.length; i++) {
                travelersList.push({
                    firstName: otherTravellers[i].firstName || `Guest ${i + 2}`,
                    lastName: otherTravellers[i].lastName || "Traveller",
                    email: otherTravellers[i].email,
                    phone: `${otherTravellers[i].countryCode} ${otherTravellers[i].phone}`,
                    dateOfBirth: (otherTravellers[i].dobYear && otherTravellers[i].dobMonth && otherTravellers[i].dobDay) ? new Date(`${otherTravellers[i].dobYear}-${otherTravellers[i].dobMonth}-${otherTravellers[i].dobDay}`) : undefined,
                    nationality: otherTravellers[i].nationality,
                });
            }

            const bookingData = {
                tour: tour._id,
                startDate: selectedDate.startDate,
                travelers: travelersList,
                pricePerPerson,
                totalPrice: calculateTotalPrice,
                extras: {
                    activities: selectedActivities.map(activity => ({
                        name: activity.name,
                        price: activity.price,
                        count: activity.count
                    })),
                    accommodationUpgrade: accommodationUpgrade ? {
                        name: accommodationUpgrade.name,
                        price: accommodationUpgrade.price,
                        count: accommodationUpgrade.count
                    } : undefined
                },
                payment: {
                    method: 'credit_card',
                    status: 'pending',
                    transactions: []
                }
            };

            const response = await fetch(`${api.baseURL}/bookings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(bookingData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Booking failed");
            }

            // Redirect to real payment page
            router.push(`/payment/${data.data.booking._id}?payNowAmount=${payNowAmount}&paymentOption=${paymentOption}`);

        } catch (err: any) {
            console.error("Booking error:", err);
            setBookingError(err.message || "Something went wrong processing your booking");
        } finally {
            setIsBooking(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <p className="mt-3 text-gray-600">Loading checkout...</p>
                </div>
            </div>
        );
    }

    if (!tour) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-[#3F3F42] mb-2">Trip not found</h1>
                    <p className="text-gray-600 mb-4">The tour you&apos;re looking for doesn&apos;t exist.</p>
                    <Link href="/trips" className="text-purple-600 hover:underline">
                        Browse all trips
                    </Link>
                </div>
            </div>
        );
    }

    const primaryImage = tour.images?.find((img) => img.isPrimary) || tour.images?.[0];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header & Breadcrumbs */}
            <div className="w-full bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
                    <div className="text-[13px] text-gray-500 mb-4">
                        Home / Destinations / {tour.country?.continent?.name || "Continent"} / {tour.country?.name || "Country"} / {tour.name} / Checkout
                    </div>
                    <h1 className="text-3xl md:text-4xl font-semibold text-[#4C1D95] mb-2">{tour.name}</h1>
                    <div className="text-gray-500 text-sm">
                        Depart from {tour.location?.startCity || ""}, {tour.country?.name || ""}, {tour.duration?.days} Days
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Checkout Steps */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Progress Stepper (in left column) */}
                        <div className="bg-white rounded-xl border p-6 flex items-start justify-between relative overflow-hidden">
                            {/* Background Line */}
                            <div className="absolute left-[10%] right-[10%] top-[40px] h-[1px] bg-gray-300 z-0"></div>

                            {[
                                { label: "Passenger Details", step: 1, icon: User },
                                { label: "Select tour Dates", step: 2, icon: CalendarBlank },
                                { label: "Add ons", step: 3, icon: Plus },
                                { label: "Payment Options", step: 4, icon: CurrencyDollar },
                                { label: "Booking Complete", step: 5, icon: Money }
                            ].map((s, index) => {
                                const isCompleted = currentStep > s.step;
                                const isCurrent = currentStep === s.step;
                                const Icon = s.icon;

                                return (
                                    <div key={index} className="flex flex-col items-center relative z-10 flex-1">
                                        <div className="bg-white px-2 mb-3">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center relative ${isCompleted || isCurrent ? 'bg-[#6A38C2] text-white' : 'bg-white border-2 border-[#3F3F42] text-[#3F3F42]'}`}>
                                                <Icon size={24} weight={isCompleted || isCurrent ? "fill" : "bold"} />
                                                {isCompleted && (
                                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px]">
                                                        <CheckCircle size={16} weight="fill" className="text-[#6A38C2]" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`text-sm text-center font-medium ${isCurrent ? 'text-[#6A38C2]' : 'text-[#4E4E4E]'}`}>
                                            {s.label}
                                        </span>
                                        <span className={`text-[10px] mt-1 ${isCompleted ? 'text-[#6A38C2]' : 'text-gray-500'}`}>
                                            {isCompleted ? 'Completed' : `Step ${s.step}`}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                        {/* Step 1: Who's Travelling */}
                        {currentStep >= 1 && (
                            <div className="space-y-4">
                                {currentStep === 1 && (
                                    <div className="flex items-center justify-between px-1 mb-4">
                                        <div className="flex flex-col">
                                            <h2 className="text-[42px] font-medium text-[#2C3238] mb-1 leading-tight">Passenger Details</h2>
                                        </div>
                                    </div>
                                )}
                                <div className={`bg-white rounded-xl shadow-sm border p-6`}>
                                    {currentStep === 1 ? (
                                        <>
                                            {/* Adult Counter */}
                                            <div className="flex items-center justify-between border border-gray-200 rounded-xl p-4 mb-8">
                                                <div className="text-[19px] text-[#3F3F42] font-medium">
                                                    Select the number of travellers <span className="text-gray-400 font-normal text-[16px]">(above age 12)</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => setAdultCount(Math.max(1, adultCount - 1))}
                                                        className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-300 transition text-lg font-bold"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="w-4 text-center text-base font-bold text-[#3F3F42]">{adultCount}</span>
                                                    <button
                                                        onClick={() => setAdultCount(Math.min(tour.maxGroupSize, adultCount + 1))}
                                                        className="w-7 h-7 rounded-full bg-[#4C1D95] text-white flex items-center justify-center hover:bg-purple-900 transition text-lg font-bold"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Passenger Details */}
                                            <div className="pt-2">
                                                {(() => {
                                                    const renderTravellerForm = (traveller: Traveller, index: number, isPrimary: boolean) => {
                                                        const updateField = (field: keyof Traveller, value: string) => {
                                                            if (isPrimary) {
                                                                setPrimaryTraveller(prev => ({ ...prev, [field]: value }));
                                                            } else {
                                                                setOtherTravellers(prev => {
                                                                    const newTravellers = [...prev];
                                                                    newTravellers[index] = { ...newTravellers[index], [field]: value };
                                                                    return newTravellers;
                                                                });
                                                            }
                                                        };

                                                        return (
                                                            <div key={isPrimary ? 'primary' : index} className="border border-gray-300 rounded-xl p-6 mb-6">
                                                                <div className="mb-6 flex items-center gap-2">
                                                                    <h3 className="text-[22px] font-medium text-[#3F3F42]">{isPrimary ? 'Primary Traveller' : `Traveller ${index + 2}`}</h3>
                                                                    <span className="text-gray-400 text-[16px]">(Names as displayed on passport)</span>
                                                                </div>

                                                                {/* Row 1 */}
                                                                <div className="mb-4 w-1/3 md:w-1/4 pr-2">
                                                                    <label className="block text-[17px] text-gray-600 mb-1">Title <span className="text-orange-400">*</span></label>
                                                                    <select
                                                                        value={traveller.title}
                                                                        onChange={(e) => updateField('title', e.target.value)}
                                                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-[17px]"
                                                                    >
                                                                        <option value=""></option>
                                                                        <option value="Mr">Mr</option>
                                                                        <option value="Mrs">Mrs</option>
                                                                        <option value="Ms">Ms</option>
                                                                        <option value="Dr">Dr</option>
                                                                    </select>
                                                                </div>

                                                                {/* Row 2 */}
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                                    <div>
                                                                        <label className="block text-[17px] text-gray-600 mb-1">First name <span className="text-orange-400">*</span></label>
                                                                        <input
                                                                            type="text"
                                                                            value={traveller.firstName}
                                                                            onChange={(e) => updateField('firstName', e.target.value)}
                                                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-[17px]"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-[17px] text-gray-600 mb-1">Middle name(s)</label>
                                                                        <input
                                                                            type="text"
                                                                            value={traveller.middleName}
                                                                            onChange={(e) => updateField('middleName', e.target.value)}
                                                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-[17px]"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-[17px] text-gray-600 mb-1">Last name <span className="text-orange-400">*</span></label>
                                                                        <input
                                                                            type="text"
                                                                            value={traveller.lastName}
                                                                            onChange={(e) => updateField('lastName', e.target.value)}
                                                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-[17px]"
                                                                        />
                                                                    </div>
                                                                </div>


                                                            </div>
                                                        );
                                                    };

                                                    return (
                                                        <>
                                                            {renderTravellerForm(primaryTraveller, 0, true)}
                                                            {otherTravellers.map((traveller, index) => renderTravellerForm(traveller, index, false))}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                            <div className="flex flex-col gap-4 w-full">
                                                <h3 className="text-[22px] font-medium text-black">Who Is Travelling?</h3>
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-2 min-w-[200px]">
                                                        <div className="w-10 h-10 rounded-full bg-[#3F3F42] text-white flex items-center justify-center font-bold text-base">
                                                            {primaryTraveller.firstName?.charAt(0).toUpperCase() || "U"}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[13px] text-gray-500 font-medium">Traveller 1 ( Primary )</span>
                                                            <span className="text-[17px] font-semibold text-black">
                                                                {primaryTraveller.firstName || "Utsav"} {primaryTraveller.lastName || "Singh"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {otherTravellers.map((t, i) => (
                                                        <div key={i} className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-2 min-w-[200px]">
                                                            <div className="w-10 h-10 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-base">
                                                                {t.firstName?.charAt(0).toUpperCase() || "I"}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[13px] text-gray-500 font-medium">Traveller {i + 2}</span>
                                                                <span className="text-[17px] font-semibold text-black">
                                                                    {t.firstName || "Ishita"} {t.lastName || "Singh"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setCurrentStep(1)}
                                                className="border border-purple-200 text-purple-600 rounded-full px-5 py-2 text-sm font-medium flex items-center justify-center gap-2 whitespace-nowrap hover:bg-purple-50 transition"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                Edit Travellers
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Select Departure Date */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <div className={`bg-white rounded-xl shadow-sm border p-8 ${currentStep !== 2 ? "opacity-60" : ""}`}>
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="flex flex-col">
                                            <h2 className="text-[42px] font-medium text-[#2C3238] mb-1 leading-tight">Select a Departure Date</h2>
                                            {currentStep === 2 && <div className="text-[17px] text-gray-500 font-medium">All prices displayed in US Dollars (USD)</div>}
                                        </div>
                                        {currentStep > 2 && (
                                            <button
                                                onClick={() => setCurrentStep(2)}
                                                className="text-[#6A38C2] hover:text-purple-900 text-[15px] font-medium transition mt-3"
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </div>
                                    {currentStep === 2 ? (
                                        <>
                                            {/* Calendar */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                {[0, 1].map((offset) => {
                                                    const monthDate = new Date(calendarMonth);
                                                    monthDate.setMonth(monthDate.getMonth() + offset);
                                                    const days = getDaysInMonth(monthDate);
                                                    const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

                                                    return (
                                                        <div key={offset} className="border border-gray-200 rounded-2xl p-6">
                                                            <div className="flex items-center justify-between mb-6 px-1">
                                                                <button
                                                                    onClick={() => navigateMonth("prev")}
                                                                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition text-black font-bold"
                                                                >
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                                                </button>

                                                                <div className={`border border-gray-200 rounded-full px-5 py-2 flex items-center justify-between min-w-[140px] shadow-sm cursor-pointer hover:bg-gray-50`}>
                                                                    <span className="font-medium text-black text-[15px]">
                                                                        {monthDate.toLocaleDateString("en-US", { month: "short" })}
                                                                    </span>
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="m6 9 6 6 6-6" /></svg>
                                                                </div>

                                                                <button
                                                                    onClick={() => navigateMonth("next")}
                                                                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition text-black font-bold"
                                                                >
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                                                </button>
                                                            </div>

                                                            <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-400 mb-4">
                                                                {weekdays.map((day) => (
                                                                    <div key={day} className="py-1">{day}</div>
                                                                ))}
                                                            </div>

                                                            <div className="grid grid-cols-7 gap-y-2">
                                                                {days.map((day, idx) => {
                                                                    if (day === null) {
                                                                        return <div key={idx} className="h-12" />;
                                                                    }

                                                                    const checkDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
                                                                    const dateStatus = getDateStatus(day, monthDate);
                                                                    const isPast = checkDate < new Date(new Date().setHours(0, 0, 0, 0));

                                                                    const selectedDateObj = selectedDate;
                                                                    let isInSelectedRange = false;
                                                                    let isSelectedStart = false;
                                                                    let isSelectedEnd = false;

                                                                    if (selectedDateObj) {
                                                                        const parseLocal = (dateStr: string) => {
                                                                            const [year, month, d] = dateStr.split('T')[0].split('-').map(Number);
                                                                            return new Date(year, month - 1, d).getTime();
                                                                        };
                                                                        const sTime = parseLocal(selectedDateObj.startDate);
                                                                        const eTime = parseLocal(selectedDateObj.endDate);
                                                                        const checkTime = checkDate.getTime();

                                                                        if (checkTime === sTime) isSelectedStart = true;
                                                                        if (checkTime === eTime) isSelectedEnd = true;
                                                                        if (checkTime > sTime && checkTime < eTime) {
                                                                            isInSelectedRange = true;
                                                                        }
                                                                    }

                                                                    const isSelected = dateStatus && selectedDateId === dateStatus._id;

                                                                    // Classes for the wrapper (for continuous background)
                                                                    let wrapperClass = "relative flex items-center justify-center h-12";

                                                                    return (
                                                                        <div key={idx} className={wrapperClass}>
                                                                            <button
                                                                                onClick={() => dateStatus && setSelectedDateId(dateStatus._id!)}
                                                                                disabled={!dateStatus || isPast}
                                                                                className={`w-[40px] h-[40px] flex flex-col items-center justify-center rounded-full text-[15px] transition relative z-10 ${isSelectedStart || isSelectedEnd || isSelected
                                                                                    ? "bg-[#2C3238] text-white font-medium shadow-md"
                                                                                    : isInSelectedRange
                                                                                        ? "bg-gray-100 text-black font-medium"
                                                                                        : dateStatus && !isPast
                                                                                            ? "text-black hover:bg-gray-100 font-medium cursor-pointer"
                                                                                            : isPast
                                                                                                ? "text-gray-300 font-normal cursor-not-allowed"
                                                                                                : "text-gray-600 font-normal hover:bg-gray-100 cursor-default"
                                                                                    }`}
                                                                            >
                                                                                {day}
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Available Dates List */}
                                            <div className="border-t pt-6">
                                                <div className="space-y-4 mb-4">
                                                    {tour.startDates
                                                        .filter((d) => d.isActive && d.availableSpots > 0 && new Date(d.startDate) > new Date())
                                                        .slice(0, 5)
                                                        .map((date, idx) => (
                                                            <div
                                                                key={date._id || idx}
                                                                className={`flex items-center justify-between p-4 rounded-xl transition-all ${selectedDateId === date._id
                                                                    ? "border border-purple-300 bg-[#F4F0FF]"
                                                                    : "border border-gray-200 bg-gray-50/50"
                                                                    }`}
                                                            >
                                                                <span className="font-semibold text-black pl-2 text-[15px]">
                                                                    {formatDate(date.startDate)} to {formatDate(date.endDate)}
                                                                </span>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedDateId(date._id!);
                                                                        setCalendarMonth(new Date(date.startDate));
                                                                    }}
                                                                    className={`px-8 py-2 rounded-lg font-medium text-sm transition ${selectedDateId === date._id
                                                                        ? "bg-[#6A38C2] hover:bg-purple-800 text-white"
                                                                        : "bg-[#2C3238] hover:bg-black text-white"
                                                                        }`}
                                                                >
                                                                    {selectedDateId === date._id ? "Selected" : "Select"}
                                                                </button>
                                                            </div>
                                                        ))}
                                                </div>

                                                {selectedDateId && (
                                                    <button
                                                        onClick={() => setSelectedDateId(null)}
                                                        className="text-[#6A38C2] hover:text-purple-900 font-medium text-[15px] pl-2 transition"
                                                    >
                                                        Clear date
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        selectedDate && (
                                            <div className="text-[#3F3F42]">
                                                {formatShortDate(selectedDate.startDate)} - {formatShortDate(selectedDate.endDate)}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Customize your trip */}
                        {currentStep >= 3 && (
                            <div className="space-y-4">
                                <div className={`bg-white rounded-xl ${currentStep !== 3 ? "opacity-60" : ""}`}>
                                    {currentStep === 3 ? (
                                        <>
                                            {/* Accommodation Customization */}
                                            {(tour.ownRoomAvailable || (tour.price?.ownRoomPrice !== undefined && tour.price.ownRoomPrice > 0)) && (
                                                <div className="mb-8">
                                                    <h3 className="text-[42px] font-medium text-[#2C3238] mb-6 leading-tight">Room Selection</h3>

                                                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                                                        <div className="px-5 py-4 text-[16px] font-medium text-gray-600">
                                                            <span className="text-[#6A38C2] font-semibold">All travellers</span> have been assigned to a room.
                                                        </div>
                                                        <div className="p-4 space-y-3">
                                                            {/* Twin Option */}
                                                            <label className={`flex items-start justify-between p-4 rounded-lg border-2 cursor-pointer transition ${(!accommodationUpgrade?.participants || accommodationUpgrade.participants.length === 0) ? "border-[#6A38C2] bg-[#F4F0FF]" : "border-transparent bg-gray-50 hover:bg-gray-100"}`}>
                                                                <div className="flex-1">
                                                                    <div className="font-bold text-[#2C3238] text-[17px] mb-2">Twin</div>
                                                                    <p className="text-[14px] text-gray-600 mb-4 max-w-xl">
                                                                        Twin Room, if you're a single traveller you will be paired with another traveller of the same gender.
                                                                    </p>
                                                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EAE0FF] text-[#6A38C2] rounded-md text-[13px] font-semibold mb-3">
                                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                                                                        You will be sharing the cheapest available room
                                                                    </div>
                                                                    <div>
                                                                        <span className="bg-[#6A38C2] text-white text-[12px] font-bold px-3 py-1 rounded-full">Good Availability</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-start gap-4">
                                                                    <div className="text-right">
                                                                        <div className="font-bold text-[#2C3238] text-[19px]">${tour.price?.amount?.toLocaleString() ?? 0}.00 <span className="text-[14px] text-gray-500 font-medium">Per Person</span></div>
                                                                    </div>
                                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${(!accommodationUpgrade?.participants || accommodationUpgrade.participants.length === 0) ? "border-[#6A38C2]" : "border-gray-300"}`}>
                                                                        {(!accommodationUpgrade?.participants || accommodationUpgrade.participants.length === 0) && <div className="w-2.5 h-2.5 rounded-full bg-[#6A38C2]"></div>}
                                                                    </div>
                                                                </div>
                                                                <input type="radio" name="room" className="hidden" checked={!accommodationUpgrade?.participants || accommodationUpgrade.participants.length === 0} onChange={() => setAccommodationUpgrade({ name: "Twin", description: "", price: 0, currency: "USD", count: 0, participants: [] })} />
                                                            </label>

                                                            {/* My Own Room Option */}
                                                            <label className={`flex items-start justify-between p-4 rounded-lg border-2 cursor-pointer transition ${accommodationUpgrade?.participants?.length === adultCount ? "border-[#6A38C2] bg-[#F4F0FF]" : "border-gray-200 bg-white hover:bg-gray-50"}`}>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <div className="font-bold text-[#2C3238] text-[17px]">My Own Room - Private Single</div>
                                                                        <span className="bg-[#2C3238] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">Private</span>
                                                                    </div>
                                                                    <p className="text-[14px] text-gray-600 mb-4 max-w-xl">
                                                                        Private room for single occupancy.
                                                                    </p>
                                                                    <div>
                                                                        <span className="bg-orange-500 text-white text-[12px] font-bold px-3 py-1 rounded-full">Low Availability</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-start gap-4">
                                                                    <div className="text-right">
                                                                        <div className="font-bold text-[#2C3238] text-[19px]">${((tour.price?.amount || 0) + (tour.price?.ownRoomPrice || 0)).toLocaleString()}.00 <span className="text-[14px] text-gray-500 font-medium">Per Person</span></div>
                                                                    </div>
                                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${accommodationUpgrade?.participants?.length === adultCount ? "border-[#6A38C2]" : "border-gray-300"}`}>
                                                                        {accommodationUpgrade?.participants?.length === adultCount && <div className="w-2.5 h-2.5 rounded-full bg-[#6A38C2]"></div>}
                                                                    </div>
                                                                </div>
                                                                <input type="radio" name="room" className="hidden" checked={accommodationUpgrade?.participants?.length === adultCount} onChange={() => setAccommodationUpgrade({ name: "My Own Room", description: "", price: tour.price?.ownRoomPrice || 0, currency: "USD", count: adultCount, participants: Array.from({ length: adultCount }, (_, i) => i) })} />
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {/* Activities Section */}
                                            <div className="mb-8">
                                                <h3 className="text-[42px] font-medium text-[#2C3238] mb-2 leading-tight">
                                                    Add Activities and Experiences
                                                </h3>
                                                <p className="text-[17px] text-gray-500 mb-6 max-w-2xl">
                                                    Add Optional Activities to make your trip even more memorable<br />
                                                    Choose which activity to add for traveller.
                                                </p>

                                                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                                                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                                                        <span className="text-[20px] font-medium text-gray-500">Add ons and Extras</span>
                                                        <button
                                                            onClick={() => setExpandedDays(tour.itinerary.filter(d => d.optionalActivities?.length > 0).map(d => d.day))}
                                                            className="bg-[#2C3238] text-white px-5 py-2 rounded-full text-[14px] font-bold hover:bg-black transition"
                                                        >
                                                            View All Activities
                                                        </button>
                                                    </div>

                                                    <div className="max-h-[750px] overflow-y-auto custom-scrollbar">
                                                        {tour.itinerary
                                                            .filter((day) => day.optionalActivities && day.optionalActivities.length > 0)
                                                            .map((day) => (
                                                                <div key={day.day} className="border-b border-gray-200 last:border-b-0">
                                                                    <div className="p-6">
                                                                        <div className="flex items-center justify-between mb-6">
                                                                            <span className="bg-[#2C3238] text-white text-[13px] font-bold px-4 py-1.5 rounded-full tracking-wide">Day {day.day}</span>
                                                                            <span className="bg-[#F4F0FF] text-[#6A38C2] text-[13px] font-bold px-4 py-1.5 rounded-full">{day.optionalActivities.length} Activities</span>
                                                                        </div>

                                                                        <div className="flex flex-col gap-6">
                                                                            {day.optionalActivities.map((activity, actIdx) => {
                                                                                const dropdownId = `${day.day}-${actIdx}`;
                                                                                const isDropdownOpen = openActivityDropdown === dropdownId;
                                                                                const selectedParticipants = selectedActivities.find(a => a.dayNumber === day.day && a.activityIndex === actIdx)?.participants || [];

                                                                                return (
                                                                                    <div key={actIdx} className="flex flex-col gap-6">
                                                                                        {actIdx > 0 && <div className="h-px bg-gray-200 -mx-6" />}
                                                                                        <div className="flex">
                                                                                            <div className="flex gap-6 pr-6 flex-1">
                                                                                                <div className="w-[240px] h-[160px] rounded-xl bg-gray-200 flex-shrink-0 overflow-hidden relative">
                                                                                                    {primaryImage?.url ? (
                                                                                                        <Image src={primaryImage.url} alt={activity.name || activity.title || "Activity"} fill className="object-cover" />
                                                                                                    ) : (
                                                                                                        <div className="w-full h-full flex items-center justify-center text-3xl">🎯</div>
                                                                                                    )}
                                                                                                </div>
                                                                                                <div className="flex-1 flex flex-col justify-between py-1">
                                                                                                    <div>
                                                                                                        <h4 className="font-medium text-[20px] text-[#2C3238] mb-2 leading-tight">{activity.name || activity.title}</h4>
                                                                                                        <p className="text-[15px] text-gray-500 leading-relaxed max-w-md">
                                                                                                            {activity.description}
                                                                                                        </p>
                                                                                                    </div>
                                                                                                    <div className="mt-4">
                                                                                                        <div className="font-bold text-[20px] text-[#2C3238]">
                                                                                                            {typeof activity.price === "number"
                                                                                                                ? (activity.price > 0 ? `$${activity.price.toLocaleString()}` : "Free")
                                                                                                                : (activity.price?.amount > 0
                                                                                                                    ? `${activity.price.currency || "$"}${Number(activity.price.amount).toLocaleString()}`
                                                                                                                    : "Free")}
                                                                                                        </div>
                                                                                                        <div className="text-[14px] text-gray-500">Per Person</div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="w-[260px] flex-shrink-0 pl-6 border-l border-gray-200 py-1 flex flex-col">
                                                                                                <div className="relative">
                                                                                                    <button
                                                                                                        onClick={() => setOpenActivityDropdown(isDropdownOpen ? null : dropdownId)}
                                                                                                        className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-4 py-2.5 text-[15px] text-gray-700 bg-white hover:bg-gray-50"
                                                                                                    >
                                                                                                        <span>Who is This tour for?</span>
                                                                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
                                                                                                    </button>

                                                                                                    {isDropdownOpen && (
                                                                                                        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] z-20 overflow-hidden">
                                                                                                            <div className="max-h-48 overflow-y-auto">
                                                                                                                {[primaryTraveller, ...otherTravellers].slice(0, adultCount).map((traveller, idx) => {
                                                                                                                    const isSelected = selectedParticipants.includes(idx);
                                                                                                                    const name = traveller.firstName || `Traveller ${String.fromCharCode(65 + idx)}`;
                                                                                                                    return (
                                                                                                                        <label key={idx} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer">
                                                                                                                            <span className="text-[15px] text-[#2C3238]">{name}</span>
                                                                                                                            <input
                                                                                                                                type="checkbox"
                                                                                                                                checked={isSelected}
                                                                                                                                onChange={(e) => toggleActivityParticipant(day.day, actIdx, idx, e.target.checked, activity)}
                                                                                                                                className="w-5 h-5 rounded border-gray-300 text-[#6A38C2] focus:ring-[#6A38C2] cursor-pointer"
                                                                                                                            />
                                                                                                                        </label>
                                                                                                                    );
                                                                                                                })}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>

                                                                                                {/* Display selected names below */}
                                                                                                {selectedParticipants.length > 0 && (
                                                                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                                                                        {[primaryTraveller, ...otherTravellers].slice(0, adultCount).map((traveller, idx) => {
                                                                                                            if (!selectedParticipants.includes(idx)) return null;
                                                                                                            const name = traveller.firstName || `Traveller ${String.fromCharCode(65 + idx)}`;
                                                                                                            return (
                                                                                                                <div key={idx} className="flex items-center gap-1.5 text-[13px] text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                                                                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6A38C2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                                                                                    <span>{name}</span>
                                                                                                                </div>
                                                                                                            );
                                                                                                        })}
                                                                                                    </div>
                                                                                                )}

                                                                                                <div className="flex items-center justify-between mt-auto pt-4">
                                                                                                    <button
                                                                                                        onClick={() => {
                                                                                                            const currentItem = selectedActivities.find(a => a.dayNumber === day.day && a.activityIndex === actIdx);
                                                                                                            if (currentItem) {
                                                                                                                [...Array(adultCount)].forEach((_, i) => toggleActivityParticipant(day.day, actIdx, i, false, activity));
                                                                                                            }
                                                                                                        }}
                                                                                                        className="px-5 py-1.5 border border-gray-400 rounded-full text-[13px] font-bold text-[#2C3238] hover:bg-gray-50 transition"
                                                                                                    >
                                                                                                        Clear
                                                                                                    </button>
                                                                                                    <button
                                                                                                        onClick={() => {
                                                                                                            [...Array(adultCount)].forEach((_, i) => {
                                                                                                                const isSelected = selectedActivities.find(a => a.dayNumber === day.day && a.activityIndex === actIdx)?.participants?.includes(i);
                                                                                                                if (!isSelected) {
                                                                                                                    toggleActivityParticipant(day.day, actIdx, i, true, activity);
                                                                                                                }
                                                                                                            });
                                                                                                        }}
                                                                                                        className="px-5 py-1.5 bg-[#2C3238] text-white rounded-full text-[13px] font-bold hover:bg-black transition"
                                                                                                    >
                                                                                                        Select all
                                                                                                    </button>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                    </div>

                                                </div>
                                            </div>



                                        </>
                                    ) : (
                                        <div className="text-[#3F3F42]">
                                            {selectedActivities.length} activities selected
                                            {accommodationUpgrade && " • Room upgrade included"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* Step 4: Payment Options */}
                        {currentStep >= 4 && (
                            <div className="space-y-4">
                                <div className="px-1 mb-2">
                                    <h2 className="text-[28px] font-medium text-[#2C3238] mb-1">Payment Options</h2>
                                </div>
                                <div className={`bg-white rounded-xl shadow-sm border p-6 ${currentStep !== 4 ? "opacity-60" : ""}`}>
                                    {currentStep === 4 && (
                                        <>
                                            <div className="pt-2">
                                                {/* Full Passenger Details for Step 4 */}
                                                <div className="mb-8">
                                                    <h3 className="text-[22px] font-medium text-black mb-4">Complete Passenger Details</h3>
                                                    {(() => {
                                                        const renderTravellerFullForm = (traveller: Traveller, index: number, isPrimary: boolean) => {
                                                            const updateField = (field: keyof Traveller, value: string) => {
                                                                if (isPrimary) {
                                                                    setPrimaryTraveller(prev => ({ ...prev, [field]: value }));
                                                                } else {
                                                                    setOtherTravellers(prev => {
                                                                        const newTravellers = [...prev];
                                                                        newTravellers[index] = { ...newTravellers[index], [field]: value };
                                                                        return newTravellers;
                                                                    });
                                                                }
                                                            };

                                                            const updateFields = (updates: Partial<Traveller>) => {
                                                                if (isPrimary) {
                                                                    setPrimaryTraveller(prev => ({ ...prev, ...updates }));
                                                                } else {
                                                                    setOtherTravellers(prev => {
                                                                        const newTravellers = [...prev];
                                                                        newTravellers[index] = { ...newTravellers[index], ...updates };
                                                                        return newTravellers;
                                                                    });
                                                                }
                                                            };

                                                            return (
                                                                <div key={isPrimary ? 'primary' : index} className="border border-gray-300 rounded-xl p-6 mb-6 bg-white">
                                                                    <div className="mb-6 flex items-center gap-2">
                                                                        <h3 className="text-[20px] font-medium text-[#3F3F42]">{isPrimary ? 'Primary Traveller' : `Traveller ${index + 2}`}</h3>
                                                                    </div>

                                                                    {/* Row 1: Title */}
                                                                    <div className="mb-4 w-1/3 md:w-1/4 pr-2">
                                                                        <label className="block text-[15px] text-gray-600 mb-1">Title <span className="text-orange-400">*</span></label>
                                                                        <input type="text" value={traveller.title} disabled className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-500 text-[15px] cursor-not-allowed" />
                                                                    </div>

                                                                    {/* Row 2: Names */}
                                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                                        <div>
                                                                            <label className="block text-[15px] text-gray-600 mb-1">First name <span className="text-orange-400">*</span></label>
                                                                            <input type="text" value={traveller.firstName} disabled className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-500 text-[15px] cursor-not-allowed" />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-[15px] text-gray-600 mb-1">Middle name(s)</label>
                                                                            <input type="text" value={traveller.middleName} disabled className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-500 text-[15px] cursor-not-allowed" />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-[15px] text-gray-600 mb-1">Last name <span className="text-orange-400">*</span></label>
                                                                            <input type="text" value={traveller.lastName} disabled className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-500 text-[15px] cursor-not-allowed" />
                                                                        </div>
                                                                    </div>

                                                                    {!isPrimary && (
                                                                        <div className="flex justify-end mb-4">
                                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    className="w-5 h-5 border-gray-300 rounded text-purple-600 focus:ring-purple-500"
                                                                                    onChange={(e) => {
                                                                                        if (e.target.checked) {
                                                                                            updateFields({
                                                                                                email: primaryTraveller.email,
                                                                                                countryCode: primaryTraveller.countryCode,
                                                                                                phone: primaryTraveller.phone,
                                                                                                dobDay: primaryTraveller.dobDay,
                                                                                                dobMonth: primaryTraveller.dobMonth,
                                                                                                dobYear: primaryTraveller.dobYear,
                                                                                                nationality: primaryTraveller.nationality
                                                                                            });
                                                                                        } else {
                                                                                            updateFields({
                                                                                                email: '',
                                                                                                phone: '',
                                                                                                dobDay: '',
                                                                                                dobMonth: '',
                                                                                                dobYear: '',
                                                                                                nationality: ''
                                                                                            });
                                                                                        }
                                                                                    }}
                                                                                />
                                                                                <span className="text-[15px] text-gray-600">Copy Information from Primary Traveller</span>
                                                                            </label>
                                                                        </div>
                                                                    )}

                                                                    {/* Row 3: Email */}
                                                                    <div className="mb-4">
                                                                        <label className="block text-[15px] text-gray-600 mb-1">Email <span className="text-orange-400">*</span></label>
                                                                        <input
                                                                            type="email"
                                                                            value={traveller.email}
                                                                            onChange={(e) => updateField('email', e.target.value)}
                                                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-[15px]"
                                                                        />
                                                                    </div>

                                                                    {/* Row 4: Phone Number */}
                                                                    <div className="mb-6">
                                                                        <label className="block text-[15px] text-gray-600 mb-1">Phone Number <span className="text-orange-400">*</span></label>
                                                                        <div className="flex gap-2">
                                                                            <div className="w-1/3">
                                                                                <select
                                                                                    value={traveller.countryCode}
                                                                                    onChange={(e) => updateField('countryCode', e.target.value)}
                                                                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-[15px] bg-white"
                                                                                >
                                                                                    <option value="+1 - United States">+1 - United States</option>
                                                                                    <option value="+1 - Canada">+1 - Canada</option>
                                                                                    <option value="+91 - India">+91 - India</option>
                                                                                    <option value="+44 - United Kingdom">+44 - United Kingdom</option>
                                                                                    <option value="+61 - Australia">+61 - Australia</option>
                                                                                </select>
                                                                            </div>
                                                                            <div className="w-2/3">
                                                                                <input
                                                                                    type="tel"
                                                                                    value={traveller.phone}
                                                                                    onChange={(e) => updateField('phone', e.target.value)}
                                                                                    placeholder="Mobile number..."
                                                                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-[15px]"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Row 5: DOB & Nationality */}
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        <div>
                                                                            <label className="block text-[15px] text-gray-600 mb-1">Date of Birth <span className="text-orange-400">*</span></label>
                                                                            <input
                                                                                type="date"
                                                                                value={traveller.dobYear && traveller.dobMonth && traveller.dobDay ? `${traveller.dobYear}-${traveller.dobMonth.padStart(2, '0')}-${traveller.dobDay.padStart(2, '0')}` : ''}
                                                                                onChange={(e) => {
                                                                                    const val = e.target.value;
                                                                                    if (val) {
                                                                                        const [y, m, d] = val.split('-');
                                                                                        updateFields({ dobYear: y, dobMonth: m, dobDay: d });
                                                                                    } else {
                                                                                        updateFields({ dobYear: '', dobMonth: '', dobDay: '' });
                                                                                    }
                                                                                }}
                                                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-[15px] bg-white"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-[15px] text-gray-600 mb-1">Nationality <span className="text-orange-400">*</span></label>
                                                                            <select
                                                                                value={traveller.nationality}
                                                                                onChange={(e) => updateField('nationality', e.target.value)}
                                                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-[15px] bg-white"
                                                                            >
                                                                                <option value="">Select Nationality</option>
                                                                                <option value="American">American</option>
                                                                                <option value="Canadian">Canadian</option>
                                                                                <option value="Indian">Indian</option>
                                                                                <option value="British">British</option>
                                                                                <option value="Australian">Australian</option>
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        };

                                                        return (
                                                            <>
                                                                {renderTravellerFullForm(primaryTraveller, 0, true)}
                                                                {otherTravellers.map((traveller, index) => renderTravellerFullForm(traveller, index, false))}
                                                            </>
                                                        );
                                                    })()}
                                                </div>

                                                {/* Cards Row */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 pt-2">
                                                    <div
                                                        className={`border-2 rounded-xl p-6 cursor-pointer text-center relative transition-all flex flex-col items-center justify-center ${paymentOption === 'deposit'
                                                            ? 'bg-[#2D3748] border-[#2D3748] text-white'
                                                            : 'bg-white border-gray-200 hover:border-gray-300 text-[#3F3F42]'
                                                            } ${!isDepositAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        onClick={() => isDepositAvailable && setPaymentOption('deposit')}
                                                    >
                                                        {paymentOption === 'deposit' && (
                                                            <div className="absolute top-3 right-3 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs">
                                                                ✓
                                                            </div>
                                                        )}
                                                        <div className="font-medium text-[19px] mb-1">Low deposit</div>
                                                        <div className="font-bold text-[32px]">{formatPrice(depositAmount)}</div>
                                                    </div>

                                                    <div
                                                        className={`border-2 rounded-xl p-6 cursor-pointer text-center relative transition-all flex flex-col items-center justify-center ${paymentOption === 'installments'
                                                            ? 'bg-[#2D3748] border-[#2D3748] text-white'
                                                            : 'bg-white border-gray-200 hover:border-gray-300 text-[#3F3F42]'
                                                            } ${!isDepositAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        onClick={() => isDepositAvailable && setPaymentOption('installments')}
                                                    >
                                                        {paymentOption === 'installments' && (
                                                            <div className="absolute top-3 right-3 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs">
                                                                ✓
                                                            </div>
                                                        )}
                                                        <div className="font-medium text-[19px] mb-1">Monthly Payment Plan</div>
                                                        <div className="font-bold text-[32px]">{formatPrice(installmentPlan?.upfrontAmount || Math.round(calculateTotalPrice * 0.25))}</div>
                                                        <div className={`mt-2 text-[13px] px-3 py-1 rounded-full whitespace-nowrap font-bold tracking-wide shadow-sm ${paymentOption === 'installments' ? 'bg-white text-[#2D3748]' : 'bg-[#2D3748] text-white'}`}>
                                                            Most popular
                                                        </div>
                                                    </div>

                                                    <div
                                                        className={`border-2 rounded-xl p-6 cursor-pointer text-center relative transition-all flex flex-col items-center justify-center ${paymentOption === 'full'
                                                            ? 'bg-[#2D3748] border-[#2D3748] text-white'
                                                            : 'bg-white border-gray-200 hover:border-gray-300 text-[#3F3F42]'
                                                            }`}
                                                        onClick={() => setPaymentOption('full')}
                                                    >
                                                        {paymentOption === 'full' && (
                                                            <div className="absolute top-3 right-3 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs">
                                                                ✓
                                                            </div>
                                                        )}
                                                        <div className="font-medium text-[19px] mb-1">Pay in full</div>
                                                        <div className="font-bold text-[32px]">{formatPrice(calculateTotalPrice)}</div>
                                                    </div>
                                                </div>

                                                {/* Details Section */}
                                                <div className="border border-gray-200 rounded-xl p-6">
                                                    {paymentOption === 'deposit' && (
                                                        <div className="w-full border border-gray-100 rounded-lg overflow-hidden">
                                                            <div className="flex justify-between items-center px-4 py-4 text-[17px] border-b border-gray-100 last:border-b-0">
                                                                <div>
                                                                    <div className="font-medium text-[#3F3F42]">Due today</div>
                                                                </div>
                                                                <div className="font-bold text-[#3F3F42]">{formatPrice(depositAmount)}</div>
                                                            </div>
                                                            <div className="flex justify-between items-center px-4 py-4 text-[17px] border-b border-gray-100 last:border-b-0">
                                                                <div>
                                                                    <div className="font-medium text-[#3F3F42]">Final payment</div>
                                                                    <div className="text-[15px] text-gray-500 mt-0.5">Debited on {formatShortDate(finalPaymentDate.toISOString())}</div>
                                                                </div>
                                                                <div className="font-bold text-[#3F3F42]">{formatPrice(calculateTotalPrice - depositAmount)}</div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {paymentOption === 'full' && (
                                                        <div className="w-full border border-gray-100 rounded-lg overflow-hidden">
                                                            <div className="flex justify-between items-center px-4 py-3 text-sm border-b border-gray-100 last:border-b-0">
                                                                <div>
                                                                    <div className="font-medium text-[#3F3F42]">Due today</div>
                                                                </div>
                                                                <div className="font-bold text-[#3F3F42]">{formatPrice(calculateTotalPrice)}</div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {paymentOption === 'installments' && (
                                                        <div className="w-full border border-gray-100 rounded-lg overflow-hidden">
                                                            <div className="grid grid-cols-4 gap-2 px-4 py-3 text-[14px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100 rounded-t-lg">
                                                                <span>Payment</span>
                                                                <span>Amount</span>
                                                                <span>Due Date</span>
                                                                <span>Status</span>
                                                            </div>
                                                            <div className="grid grid-cols-4 gap-2 px-4 py-4 text-[17px] border-b border-gray-100 last:border-b-0">
                                                                <span className="text-[#3F3F42] font-medium truncate flex items-center gap-1.5">
                                                                    <Coins size={16} weight="fill" className="text-yellow-500" /> Upfront
                                                                </span>
                                                                <span className="text-[#3F3F42] font-semibold">
                                                                    {formatPrice(installmentPlan?.upfrontAmount || 0)}
                                                                </span>
                                                                <span className="text-gray-600 text-[15px] truncate">
                                                                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                </span>
                                                                <span>
                                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[14px] font-semibold bg-gray-100 text-gray-600">
                                                                        <HourglassHigh size={14} weight="bold" /> Pending
                                                                    </span>
                                                                </span>
                                                            </div>
                                                            {installmentPlan?.schedule?.map((inst) => (
                                                                <div
                                                                    key={inst.index}
                                                                    className="grid grid-cols-4 gap-2 px-4 py-4 text-[17px] border-b border-gray-100 last:border-b-0"
                                                                >
                                                                    <span className="text-[#3F3F42] font-medium truncate flex items-center">
                                                                        #{inst.index}
                                                                    </span>
                                                                    <span className="text-[#3F3F42] font-semibold">
                                                                        {formatPrice(inst.amount)}
                                                                    </span>
                                                                    <span className="text-gray-600 text-[15px] truncate">
                                                                        {new Date(inst.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                    </span>
                                                                    <span>
                                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[14px] font-semibold bg-gray-100 text-gray-600">
                                                                            <HourglassHigh size={14} weight="bold" /> Pending
                                                                        </span>
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {!isDepositAvailable && paymentOption !== 'full' && (
                                                        <p className="text-sm text-red-500 mt-4">
                                                            This option is only available for trips booked at least 3 months in advance.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between pt-4">
                            <button
                                onClick={handleBack}
                                disabled={currentStep === 1}
                                className={`px-6 py-2 rounded-full font-medium transition ${currentStep === 1
                                    ? "bg-transparent text-transparent cursor-default"
                                    : "bg-[#A6AAB4] text-white hover:bg-gray-500"
                                    }`}
                            >
                                Previous
                            </button>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleContinue}
                                    disabled={!canProceed()}
                                    className={`px-8 py-2 rounded-full font-medium transition ${canProceed()
                                        ? "bg-[#4C1D95] text-white hover:bg-purple-900"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        }`}
                                >
                                    {currentStep === 4 ? "Complete Booking" : "Continue"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Booking Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl border border-gray-200 p-3 sticky top-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                            <div className="w-full aspect-square relative rounded-xl overflow-hidden mb-5">
                                {(tour.descriptionImage || primaryImage?.url) ? (
                                    <Image
                                        src={tour.descriptionImage || primaryImage?.url || ""}
                                        alt={tour.name}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-4xl">🏔️</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-start justify-between mb-5 px-1">
                                <h3 className="text-3xl font-medium text-[#2C3238] pr-4 leading-tight">{tour.name}</h3>
                                <div className="text-right whitespace-nowrap pt-1 flex items-start text-[#1A1F24]">
                                    <span className="text-xs font-bold mr-0.5 mt-2">$</span>
                                    <span className="text-4xl font-bold tracking-tight">{formatPrice(calculateTotalPrice).replace(/[^0-9]/g, '')}</span>
                                    <span className="text-[10px] font-bold ml-1 mt-2">USD</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-5 mb-5 px-1">
                                <div className={`flex items-center justify-between ${currentStep >= 2 ? 'mb-4' : ''}`}>
                                    <div className="flex items-center gap-3 text-gray-500 text-[15px]">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                                        <span>Duration</span>
                                    </div>
                                    <span className="text-[15px] text-gray-600 font-medium">{tour.duration?.days} days</span>
                                </div>
                                {currentStep >= 2 && (
                                    <div className={`flex items-center justify-between ${currentStep >= 3 ? 'mb-4' : ''}`}>
                                        <div className="flex items-center gap-3 text-gray-500 text-[15px]">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                            <span>Number of travellers</span>
                                        </div>
                                        <span className="text-[15px] text-gray-600 font-medium">{adultCount < 10 ? `0${adultCount}` : adultCount}</span>
                                    </div>
                                )}
                                {currentStep >= 3 && selectedDate && (
                                    <>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3 text-gray-500 text-[15px]">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                                                <span>Start date</span>
                                            </div>
                                            <span className="text-[13px] text-gray-600 font-medium">
                                                {new Date(selectedDate.startDate).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "2-digit" }).replace(/(\d{2})$/, "'$1")}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-gray-500 text-[15px]">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                                                <span>End date</span>
                                            </div>
                                            <span className="text-[13px] text-gray-600 font-medium">
                                                {new Date(selectedDate.endDate).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "2-digit" }).replace(/(\d{2})$/, "'$1")}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {currentStep >= 4 && accommodationUpgrade && (
                                <div className="border-t border-gray-200 pt-5 mb-5 px-1">
                                    <h4 className="text-[17px] font-medium text-[#2C3238] mb-4">Room Selected</h4>
                                    <div className="flex items-start justify-between text-[14px]">
                                        <div className="flex items-start gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#2C3238] mt-2"></div>
                                            <div>
                                                <div className="text-[#2C3238] font-medium">{accommodationUpgrade.name}</div>
                                                <div className="text-gray-400 text-[13px]">( {accommodationUpgrade.count} Travellers )</div>
                                            </div>
                                        </div>
                                        <div className="text-gray-400 text-[13px] mt-0.5">
                                            {accommodationUpgrade.price > 0 ? `$${accommodationUpgrade.price}` : "$ Included in Tour Price"}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep >= 4 && selectedActivities.length > 0 && (
                                <div className="border-t border-gray-200 pt-5 mb-5 px-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-[17px] font-medium text-[#2C3238]">Selected Add-Ons</h4>
                                        <button className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                        </button>
                                    </div>

                                    <div className="bg-[#EAEBEF] rounded-xl overflow-hidden mb-4 border border-gray-200">
                                        <div className="divide-y divide-white">
                                            {selectedActivities.map((act, idx) => {
                                                const activityName = tour.itinerary.find(d => d.day === act.dayNumber)?.optionalActivities?.[act.activityIndex]?.title || tour.itinerary.find(d => d.day === act.dayNumber)?.optionalActivities?.[act.activityIndex]?.name || "Activity";
                                                return (
                                                    <div key={idx} className="flex items-start justify-between text-[14px] p-4 bg-[#EAEBEF]">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#2C3238] mt-2"></div>
                                                            <div>
                                                                <div className="text-[#2C3238] font-medium text-[13px] leading-tight">{activityName}</div>
                                                                <div className="text-gray-500 text-[12px] mt-0.5">( {act.count} Travellers )</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-[#2C3238] font-medium text-[13px] mt-0.5">
                                                            {act.price > 0 ? `$${act.price}` : "Free"}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-5 font-medium text-[#2C3238]">
                                        <span className="text-[16px]">Subtotal</span>
                                        <span className="text-[16px]">+{formatPrice(selectedActivities.reduce((sum, act) => sum + act.price * act.count, 0))}</span>
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-gray-200 pt-5 mb-5 px-1">
                                <div className="text-[14px] font-bold tracking-wide uppercase mb-4 text-[#2C3238]">PROMO CODE</div>
                                {promoData ? (
                                    <div className="flex items-center justify-between bg-[#F4F0FF] rounded-lg p-3 border border-purple-200">
                                        <div>
                                            <span className="font-bold text-[#6A38C2]">{promoData.code}</span>
                                            <span className="text-xs text-purple-600 ml-2">
                                                ({promoData.discountType === "percentage" ? `${promoData.discountValue}% off` : `$${promoData.discountAmount} off`})
                                            </span>
                                        </div>
                                        <button onClick={clearPromoCode} className="text-gray-400 hover:text-gray-600">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={promoCodeInput}
                                            onChange={(e) => {
                                                setPromoCodeInput(e.target.value.toUpperCase());
                                                setPromoError(null);
                                            }}
                                            onKeyDown={(e) => e.key === 'Enter' && handleApplyPromoCode()}
                                            placeholder="TAP TO ENTER"
                                            className="flex-1 bg-[#F9FAFB] text-[13px] px-4 py-2.5 rounded-lg border border-gray-200 outline-none uppercase font-mono tracking-wider focus:border-purple-400 placeholder:text-gray-400 transition"
                                        />
                                        <button
                                            onClick={handleApplyPromoCode}
                                            disabled={promoLoading || !promoCodeInput.trim()}
                                            className="px-6 py-2.5 bg-[#9B87D7] hover:bg-[#8F74D4] text-white text-[15px] font-medium rounded-lg disabled:opacity-50 transition"
                                        >
                                            {promoLoading ? "..." : "Apply"}
                                        </button>
                                    </div>
                                )}
                                {promoError && (
                                    <div className="text-xs text-red-500 mt-2">{promoError}</div>
                                )}
                            </div>

                            <div className="border-t border-gray-200 pt-6 px-1">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[22px] font-medium text-[#2C3238]">Total Price</span>
                                        <span className="text-[12px] text-gray-400 mt-1.5">(Taxes Included)</span>
                                    </div>
                                    <span className="text-[26px] font-bold text-[#2C3238] tracking-tight">${formatPrice(calculateTotalPrice).replace(/[^0-9]/g, '')}</span>
                                </div>
                                <div className="h-[3px] w-full bg-[#6A38C2] rounded-full mt-2"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
}
