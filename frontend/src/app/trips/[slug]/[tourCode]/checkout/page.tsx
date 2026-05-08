"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { Tag, WarningCircle, X } from "@phosphor-icons/react";

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
    };
    ownRoomAvailable: boolean;
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
            name: string;
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
    lastName: string;
}

interface SelectedActivity {
    dayNumber: number;
    activityIndex: number;
    name: string;
    price: number;
    currency: string;
    count: number;
}

interface AccommodationUpgrade {
    name: string;
    description: string;
    price: number;
    currency: string;
    count: number;
}

type CheckoutStep = 1 | 2 | 3 | 4 | 5;

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
        lastName: "",
    });

    // Step 2: Date Selection
    const [selectedDateId, setSelectedDateId] = useState<string | null>(null);
    const [calendarMonth, setCalendarMonth] = useState(new Date());

    // Step 3: Activities & Extras
    const [selectedActivities, setSelectedActivities] = useState<SelectedActivity[]>([]);
    const [expandedDays, setExpandedDays] = useState<number[]>([]);

    // Step 4: Accommodation & Travel Extras
    const [accommodationUpgrade, setAccommodationUpgrade] = useState<AccommodationUpgrade | null>(null);
    const [arrivalOption, setArrivalOption] = useState<"same-day" | "earlier" | "later">("same-day");
    const [departureOption, setDepartureOption] = useState<"same-day" | "earlier" | "later">("same-day");

    // Step 5: Contact Info
    const [contactInfo, setContactInfo] = useState({
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "",
        postalCode: "",
    });

    // Payment Simulation State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isBooking, setIsBooking] = useState(false);
    const [bookingError, setBookingError] = useState("");
    const [paymentOption, setPaymentOption] = useState<"full" | "deposit">("full");

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
            prev.map((a) => ({
                ...a,
                count: Math.min(a.count, adultCount),
            }))
        );

        if (accommodationUpgrade && accommodationUpgrade.count > adultCount) {
            setAccommodationUpgrade({
                ...accommodationUpgrade,
                count: adultCount,
            });
        }
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

    const payNowAmount = useMemo(() => {
        return paymentOption === "deposit" && isDepositAvailable ? depositAmount : calculateTotalPrice;
    }, [paymentOption, isDepositAvailable, depositAmount, calculateTotalPrice]);

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
                            ? { ...a, count: newCount }
                            : a
                    );
                } else {
                    return [
                        ...prev,
                        {
                            dayNumber,
                            activityIndex,
                            name: activity.name,
                            price: activityPrice,
                            currency: activityCurrency,
                            count: newCount,
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
                name: "My Own Room",
                description: "Private room upgrade",
                price: 279,
                currency: "USD",
                count: newCount,
            });
        }
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
                return primaryTraveller.firstName && primaryTraveller.lastName;
            case 2:
                return selectedDateId !== null;
            case 3:
                return true; // Optional step
            case 4:
                return true; // Optional step
            case 5:
                return contactInfo.email && contactInfo.phone;
            default:
                return false;
        }
    };

    const handleContinue = () => {
        if (currentStep < 5) {
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
        // Open the payment simulation modal
        setShowPaymentModal(true);
        setBookingError("");
    };

    const handlePaymentSimulation = async (success: boolean) => {
        if (!success) {
            setBookingError("Payment declined. Please try again.");
            return;
        }

        setIsBooking(true);
        setBookingError("");

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setBookingError("Please log in to complete your booking");
                setIsBooking(false);
                // Optionally redirect to login
                // router.push("/auth/login?redirect=...");
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
                email: contactInfo.email,
                phone: contactInfo.phone,
            });

            // Add other travelers as placeholders
            for (let i = 1; i < adultCount; i++) {
                travelersList.push({
                    firstName: `Guest ${i + 1}`,
                    lastName: "Traveller",
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
                    status: paymentOption === 'deposit' && isDepositAvailable ? 'partially_paid' : 'paid',
                    transactions: [{
                        transactionId: `sim_${Date.now()}`,
                        amount: payNowAmount,
                        currency: 'USD',
                        status: 'completed',
                        paymentDate: new Date()
                    }]
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

            // Success
            alert("Booking Successful! Redirecting to dashboard...");
            router.push("/dashboard");

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
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Trip not found</h1>
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <nav className="flex text-sm mb-4">
                        <Link href="/" className="text-gray-500 hover:text-gray-700">
                            Home
                        </Link>
                        <span className="mx-2 text-gray-400">/</span>
                        <Link href="/trips" className="text-gray-500 hover:text-gray-700">
                            Trips
                        </Link>
                        <span className="mx-2 text-gray-400">/</span>
                        <Link href={`/trips/${tour.slug}/${tour.tourCode}`} className="text-gray-500 hover:text-gray-700">
                            {tour.name}
                        </Link>
                        <span className="mx-2 text-gray-400">/</span>
                        <span className="text-gray-900">Checkout</span>
                    </nav>

                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{tour.name}</h1>
                    <p className="text-gray-600 mt-1">Depart from {tour.location.startCity}, {tour.country.name}</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Checkout Steps */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Step 1: Who's Travelling */}
                        {currentStep >= 1 && (
                            <div className={`bg-white rounded-xl shadow-sm border p-6 ${currentStep !== 1 ? "opacity-60" : ""}`}>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">Who&apos;s travelling?</h2>
                                    {currentStep > 1 && (
                                        <button
                                            onClick={() => setCurrentStep(1)}
                                            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>

                                {currentStep === 1 ? (
                                    <>
                                        {/* Adult Counter */}
                                        <div className="flex items-center gap-4 mb-8">
                                            <button
                                                onClick={() => setAdultCount(Math.max(1, adultCount - 1))}
                                                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition text-xl font-medium"
                                            >
                                                −
                                            </button>
                                            <span className="w-12 text-center text-xl font-semibold">{adultCount}</span>
                                            <button
                                                onClick={() => setAdultCount(Math.min(tour.maxGroupSize, adultCount + 1))}
                                                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition text-xl font-medium"
                                            >
                                                +
                                            </button>
                                            <span className="text-gray-600">adults (ages 12+)</span>
                                        </div>

                                        {/* Primary Traveller */}
                                        <div className="border-t pt-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary traveller</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">
                                                        Title <span className="text-gray-400">ⓘ</span>
                                                    </label>
                                                    <select
                                                        value={primaryTraveller.title}
                                                        onChange={(e) =>
                                                            setPrimaryTraveller({ ...primaryTraveller, title: e.target.value })
                                                        }
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    >
                                                        <option value="">--</option>
                                                        <option value="Mr">Mr</option>
                                                        <option value="Mrs">Mrs</option>
                                                        <option value="Ms">Ms</option>
                                                        <option value="Dr">Dr</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">First name</label>
                                                    <input
                                                        type="text"
                                                        value={primaryTraveller.firstName}
                                                        onChange={(e) =>
                                                            setPrimaryTraveller({ ...primaryTraveller, firstName: e.target.value })
                                                        }
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        placeholder="Anmol"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">Last name</label>
                                                    <input
                                                        type="text"
                                                        value={primaryTraveller.lastName}
                                                        onChange={(e) =>
                                                            setPrimaryTraveller({ ...primaryTraveller, lastName: e.target.value })
                                                        }
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        placeholder="Singh"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-gray-700">
                                        {adultCount} traveller(s) • {primaryTraveller.title} {primaryTraveller.firstName} {primaryTraveller.lastName}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Select Departure Date */}
                        {currentStep >= 2 && (
                            <div className={`bg-white rounded-xl shadow-sm border p-6 ${currentStep !== 2 ? "opacity-60" : ""}`}>
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-purple-700">Select a departure date below</h2>
                                        <p className="text-sm text-gray-500 mt-1">All prices displayed in US Dollars (USD)</p>
                                    </div>
                                    <div className="text-sm text-gray-600">{adultCount} traveller{adultCount > 1 ? "s" : ""}</div>
                                    {currentStep > 2 && (
                                        <button
                                            onClick={() => setCurrentStep(2)}
                                            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>

                                {currentStep === 2 ? (
                                    <>
                                        {/* Calendar */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                            {[0, 1].map((offset) => {
                                                const monthDate = new Date(calendarMonth);
                                                monthDate.setMonth(monthDate.getMonth() + offset);
                                                const days = getDaysInMonth(monthDate);
                                                const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

                                                return (
                                                    <div key={offset} className="border rounded-lg p-4">
                                                        <div className="flex items-center justify-between mb-4">
                                                            {offset === 0 && (
                                                                <button
                                                                    onClick={() => navigateMonth("prev")}
                                                                    className="p-2 hover:bg-gray-100 rounded-full transition"
                                                                >
                                                                    ‹
                                                                </button>
                                                            )}
                                                            <h3 className="font-semibold text-gray-900 flex-1 text-center">
                                                                {monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                                            </h3>
                                                            {offset === 1 && (
                                                                <button
                                                                    onClick={() => navigateMonth("next")}
                                                                    className="p-2 hover:bg-gray-100 rounded-full transition"
                                                                >
                                                                    ›
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
                                                            {weekdays.map((day) => (
                                                                <div key={day} className="py-1">{day}</div>
                                                            ))}
                                                        </div>

                                                        <div className="grid grid-cols-7 gap-1">
                                                            {days.map((day, idx) => {
                                                                if (day === null) {
                                                                    return <div key={idx} className="h-10" />;
                                                                }

                                                                const checkDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
                                                                const dateStatus = getDateStatus(day, monthDate);
                                                                const isSelected = dateStatus && selectedDateId === dateStatus._id;
                                                                const isPast = checkDate < new Date(new Date().setHours(0, 0, 0, 0));

                                                                return (
                                                                    <button
                                                                        key={idx}
                                                                        onClick={() => dateStatus && setSelectedDateId(dateStatus._id!)}
                                                                        disabled={!dateStatus || isPast}
                                                                        className={`h-10 rounded-lg text-sm font-medium transition relative ${isSelected
                                                                            ? "bg-purple-600 text-white"
                                                                            : dateStatus && !isPast
                                                                                ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                                                                                : isPast
                                                                                    ? "text-gray-300"
                                                                                    : "text-gray-400"
                                                                            }`}
                                                                    >
                                                                        {day}
                                                                        {dateStatus && !isPast && dateStatus.price && (
                                                                            <span className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 text-[8px] text-purple-600">
                                                                                ${Math.round(dateStatus.price.amount)}
                                                                            </span>
                                                                        )}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Available Dates List */}
                                        <div className="border-t pt-6">
                                            <div className="space-y-3">
                                                {tour.startDates
                                                    .filter((d) => d.isActive && d.availableSpots > 0 && new Date(d.startDate) > new Date())
                                                    .slice(0, 5)
                                                    .map((date, idx) => (
                                                        <div
                                                            key={date._id || idx}
                                                            className={`flex items-center justify-between p-4 rounded-lg border ${selectedDateId === date._id
                                                                ? "border-purple-500 bg-purple-50"
                                                                : "border-gray-200 hover:border-gray-300"
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div>
                                                                    <div className="font-semibold text-gray-900">
                                                                        {formatDate(date.startDate)} to {formatDate(date.endDate)}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        {tour.price.discountPercent > 0 && (
                                                                            <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded">
                                                                                Sale
                                                                            </span>
                                                                        )}
                                                                        {date.availableSpots <= 3 && (
                                                                            <span className="text-orange-600 text-xs font-medium">
                                                                                Only {date.availableSpots} spot{date.availableSpots > 1 ? "s" : ""} left!
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <div className="text-right">
                                                                    <div className="font-bold text-gray-900">
                                                                        ${Math.round(tour.price.amount * (1 - getBestDiscountPct(getDiscountPercentage(date.discount), tour.price.amount) / 100))}
                                                                        <span className="text-xs font-normal text-gray-500"> USD</span>
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">per person</div>
                                                                </div>
                                                                <button
                                                                    onClick={() => setSelectedDateId(date._id!)}
                                                                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${selectedDateId === date._id
                                                                        ? "bg-purple-600 text-white"
                                                                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                                                        }`}
                                                                >
                                                                    {selectedDateId === date._id ? "Selected" : "Select"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>

                                            {selectedDateId && (
                                                <button
                                                    onClick={() => setSelectedDateId(null)}
                                                    className="text-purple-600 hover:text-purple-700 text-sm font-medium mt-4"
                                                >
                                                    Clear dates
                                                </button>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    selectedDate && (
                                        <div className="text-gray-700">
                                            {formatShortDate(selectedDate.startDate)} - {formatShortDate(selectedDate.endDate)}
                                        </div>
                                    )
                                )}
                            </div>
                        )}

                        {/* Step 3: Activities & Extras */}
                        {currentStep >= 3 && (
                            <div className={`bg-white rounded-xl shadow-sm border p-6 ${currentStep !== 3 ? "opacity-60" : ""}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900">Activities & Extras</h2>
                                    {currentStep > 3 && (
                                        <button
                                            onClick={() => setCurrentStep(3)}
                                            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>

                                {currentStep === 3 ? (
                                    <>
                                        {/* Info Banner */}
                                        <div className="bg-purple-50 rounded-lg p-4 mb-6 flex items-start gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-purple-200 flex-shrink-0 overflow-hidden">
                                                {primaryImage?.url && (
                                                    <Image
                                                        src={primaryImage.url}
                                                        alt={tour.name}
                                                        width={48}
                                                        height={48}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">We&apos;re showing you add-ons and extras for all tours selected</p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Below are your options for &apos;{tour.name}&apos;
                                                </p>
                                            </div>
                                        </div>

                                        {/* Activities Section */}
                                        <div className="mb-8">
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                                Activities for {tour.name}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-6">
                                                Your itinerary is loaded with things to see and do, but it includes plenty of free time. Here you can customize your tour, book optional activities before you go, and make the most of your time in each area.
                                            </p>

                                            {/* Day Activities */}
                                            <div className="space-y-4">
                                                {tour.itinerary
                                                    .filter((day) => day.optionalActivities && day.optionalActivities.length > 0)
                                                    .map((day) => (
                                                        <div key={day.day} className="border rounded-lg overflow-hidden">
                                                            <button
                                                                onClick={() => toggleDayExpanded(day.day)}
                                                                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition"
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                                                        <span className="text-lg">📅</span>
                                                                    </div>
                                                                    <div className="text-left">
                                                                        <div className="font-bold text-gray-900">Day {day.day}</div>
                                                                        {selectedDate && (
                                                                            <div className="text-sm text-gray-500">
                                                                                {new Date(
                                                                                    new Date(selectedDate.startDate).getTime() + (day.day - 1) * 24 * 60 * 60 * 1000
                                                                                ).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full">
                                                                        {day.optionalActivities.length} {day.optionalActivities.length === 1 ? "activity" : "activities"}
                                                                    </span>
                                                                    <span className={`transform transition ${expandedDays.includes(day.day) ? "rotate-180" : ""}`}>
                                                                        ▼
                                                                    </span>
                                                                </div>
                                                            </button>

                                                            {expandedDays.includes(day.day) && (
                                                                <div className="p-4 space-y-4">
                                                                    {day.optionalActivities.map((activity, actIdx) => {
                                                                        const currentCount = getActivityCount(day.day, actIdx);
                                                                        return (
                                                                            <div key={actIdx} className="border rounded-lg p-4">
                                                                                <div className="flex gap-4">
                                                                                    <div className="w-32 h-24 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                                                                                        <div className="w-full h-full flex items-center justify-center text-3xl">
                                                                                            🎯
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex-1">
                                                                                        <h4 className="font-bold text-gray-900">{activity.name}</h4>
                                                                                        <p className="text-xs text-gray-500 uppercase mt-1">
                                                                                            {activity.duration} • {activity.place}
                                                                                        </p>
                                                                                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                                                                            {activity.description}
                                                                                        </p>
                                                                                        <div className="flex items-center justify-between mt-4">
                                                                                            {currentCount > 0 ? (
                                                                                                <div className="flex items-center gap-3">
                                                                                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                                                                                        <button
                                                                                                            onClick={() => updateActivityCount(day.day, actIdx, activity, currentCount - 1)}
                                                                                                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-lg transition"
                                                                                                        >
                                                                                                            −
                                                                                                        </button>
                                                                                                        <span className="w-8 text-center text-sm font-semibold">{currentCount}</span>
                                                                                                        <button
                                                                                                            onClick={() => updateActivityCount(day.day, actIdx, activity, Math.min(adultCount, currentCount + 1))}
                                                                                                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-lg transition"
                                                                                                        >
                                                                                                            +
                                                                                                        </button>
                                                                                                    </div>
                                                                                                    <span className="text-sm text-purple-700 font-medium">Selected for {currentCount} traveller{currentCount > 1 ? 's' : ''}</span>
                                                                                                </div>
                                                                                            ) : (
                                                                                                <button
                                                                                                    onClick={() => updateActivityCount(day.day, actIdx, activity, 1)}
                                                                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm border border-purple-300 text-purple-600 hover:bg-purple-50 transition"
                                                                                                >
                                                                                                    + Add to tour
                                                                                                </button>
                                                                                            )}
                                                                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                                                                ℹ️ Learn more
                                                                                            </span>
                                                                                            <span className="font-bold text-gray-900">
                                                                                                {typeof activity.price === "number"
                                                                                                    ? (activity.price > 0 ? `$${activity.price.toLocaleString()}` : "Free")
                                                                                                    : (activity.price?.amount > 0
                                                                                                        ? `${activity.price.currency || "$"}${Number(activity.price.amount).toLocaleString()}`
                                                                                                        : "Free")}
                                                                                                <span className="text-xs font-normal text-gray-500"> USD per person</span>
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                            </div>

                                            <button
                                                onClick={() => setExpandedDays(tour.itinerary.filter(d => d.optionalActivities?.length > 0).map(d => d.day))}
                                                className="mt-4 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition"
                                            >
                                                View activities for all days
                                            </button>
                                        </div>

                                        {/* Accommodation Customization */}
                                        {tour.ownRoomAvailable && (
                                            <div className="border-t pt-6">
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">Customize your accommodation</h3>
                                                <p className="text-gray-600 text-sm mb-4">
                                                    Basic accommodation is included in your tour, but you can customize and upgrade your options below
                                                </p>

                                                <div className="border rounded-lg p-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-16 h-16 rounded-lg bg-purple-100 flex items-center justify-center">
                                                            <span className="text-2xl">🏨</span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-gray-900">My Own Room</h4>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                During your tour, sometimes it&apos;s more convenient and comfortable to have your own room. We offer this option so you can treat yourself.
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-bold text-gray-900">
                                                                $279<span className="text-xs font-normal text-gray-500"> USD per person</span>
                                                            </div>
                                                            {accommodationUpgrade ? (
                                                                <div className="mt-2 flex items-center justify-end gap-3">
                                                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                                                        <button
                                                                            onClick={() => updateAccommodationCount(accommodationUpgrade.count - 1)}
                                                                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-lg transition"
                                                                        >
                                                                            −
                                                                        </button>
                                                                        <span className="w-8 text-center text-sm font-semibold">{accommodationUpgrade.count}</span>
                                                                        <button
                                                                            onClick={() => updateAccommodationCount(Math.min(adultCount, accommodationUpgrade.count + 1))}
                                                                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-lg transition"
                                                                        >
                                                                            +
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => updateAccommodationCount(1)}
                                                                    className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm border border-purple-300 text-purple-600 hover:bg-purple-50 transition"
                                                                >
                                                                    + Add to tour
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-gray-700">
                                        {selectedActivities.length} activities selected
                                        {accommodationUpgrade && " • Room upgrade included"}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 4: Travel Extras */}
                        {currentStep >= 4 && (
                            <div className={`bg-white rounded-xl shadow-sm border p-6 ${currentStep !== 4 ? "opacity-60" : ""}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900">Travel extras</h2>
                                    {currentStep > 4 && (
                                        <button
                                            onClick={() => setCurrentStep(4)}
                                            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>

                                {currentStep === 4 ? (
                                    <>
                                        <p className="text-gray-600 text-sm mb-6">
                                            In addition to what&apos;s included on your tour, some extras are optional so you have the freedom and flexibility to choose what&apos;s right for you.
                                        </p>

                                        <div className="mb-6">
                                            <h3 className="font-bold text-gray-900 mb-2">Extra days</h3>
                                            <p className="text-gray-600 text-sm mb-4">
                                                Do you need to arrive earlier or leave later? Select the dates you need and we will help you with transport and accommodation.
                                            </p>

                                            {selectedDate && (
                                                <div className="border rounded-lg p-4 mb-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden">
                                                            {primaryImage?.url && (
                                                                <Image
                                                                    src={primaryImage.url}
                                                                    alt={tour.name}
                                                                    width={64}
                                                                    height={64}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-900">{tour.name}</h4>
                                                            <p className="text-sm text-gray-500">
                                                                From {formatShortDate(selectedDate.startDate)} to {formatShortDate(selectedDate.endDate)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                        <div>
                                                            <div className="text-sm text-gray-600 mb-1">Arrive</div>
                                                            <div className="font-semibold text-gray-900">
                                                                {new Date(selectedDate.startDate).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1">You&apos;re arriving the same day as your tour starts</p>
                                                            <div className="flex gap-2 mt-2">
                                                                <button
                                                                    onClick={() => setArrivalOption("earlier")}
                                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${arrivalOption === "earlier"
                                                                        ? "bg-purple-600 text-white"
                                                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                                        }`}
                                                                >
                                                                    Earlier
                                                                </button>
                                                                <button
                                                                    onClick={() => setArrivalOption("later")}
                                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${arrivalOption === "later"
                                                                        ? "bg-purple-600 text-white"
                                                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                                        }`}
                                                                >
                                                                    Later
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <div className="text-sm text-gray-600 mb-1">Depart</div>
                                                            <div className="font-semibold text-gray-900">
                                                                {new Date(selectedDate.endDate).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1">You&apos;re leaving the same day as your tour ends</p>
                                                            <div className="flex gap-2 mt-2">
                                                                <button
                                                                    onClick={() => setDepartureOption("earlier")}
                                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${departureOption === "earlier"
                                                                        ? "bg-purple-600 text-white"
                                                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                                        }`}
                                                                >
                                                                    Earlier
                                                                </button>
                                                                <button
                                                                    onClick={() => setDepartureOption("later")}
                                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${departureOption === "later"
                                                                        ? "bg-purple-600 text-white"
                                                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                                        }`}
                                                                >
                                                                    Later
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-gray-700">
                                        Arrival: {arrivalOption} • Departure: {departureOption}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 5: Traveller Details & Contact Info */}
                        {currentStep >= 5 && (
                            <div className={`bg-white rounded-xl shadow-sm border p-6 ${currentStep !== 5 ? "opacity-60" : ""}`}>
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Traveller & Contact Information</h2>

                                {currentStep === 5 && (
                                    <>
                                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                            <p className="text-sm text-gray-600">
                                                To book your adventure, another traveller&apos;s first and last name is required below. Remember that traveller&apos;s first and last names need to be entered <strong>exactly how they appear on their passport or travel documentation</strong>, so that they are properly named on any flights booked through us or otherwise.
                                            </p>
                                        </div>

                                        <div className="mb-8">
                                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                <span className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm">1</span>
                                                {primaryTraveller.title} {primaryTraveller.firstName} {primaryTraveller.lastName}
                                            </h3>
                                        </div>

                                        <div className="border-t pt-6 mb-8">
                                            <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">Email *</label>
                                                    <input
                                                        type="email"
                                                        value={contactInfo.email}
                                                        onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        placeholder="email@example.com"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">Phone *</label>
                                                    <input
                                                        type="tel"
                                                        value={contactInfo.phone}
                                                        onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        placeholder="+1 234 567 8900"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm text-gray-600 mb-1">Address</label>
                                                    <input
                                                        type="text"
                                                        value={contactInfo.address}
                                                        onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        placeholder="Street address"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">City</label>
                                                    <input
                                                        type="text"
                                                        value={contactInfo.city}
                                                        onChange={(e) => setContactInfo({ ...contactInfo, city: e.target.value })}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        placeholder="City"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">Postal Code</label>
                                                    <input
                                                        type="text"
                                                        value={contactInfo.postalCode}
                                                        onChange={(e) => setContactInfo({ ...contactInfo, postalCode: e.target.value })}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        placeholder="Postal code"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">Country</label>
                                                    <input
                                                        type="text"
                                                        value={contactInfo.country}
                                                        onChange={(e) => setContactInfo({ ...contactInfo, country: e.target.value })}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        placeholder="Country"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment Options */}
                                        <div className="border-t pt-6">
                                            <h3 className="font-semibold text-gray-900 mb-4">Payment Options</h3>

                                            <div className="grid grid-cols-1 gap-4">
                                                {/* Full Payment Option */}
                                                <div
                                                    className={`border rounded-xl p-4 cursor-pointer transition-all ${paymentOption === 'full'
                                                        ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600'
                                                        : 'border-gray-300 hover:border-gray-400'
                                                        }`}
                                                    onClick={() => setPaymentOption('full')}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentOption === 'full' ? 'border-purple-600' : 'border-gray-400'
                                                            }`}>
                                                            {paymentOption === 'full' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-semibold text-gray-900">Pay Full Amount</span>
                                                                <span className="font-bold text-gray-900">{formatPrice(calculateTotalPrice)}</span>
                                                            </div>
                                                            <p className="text-sm text-gray-500 mt-1">Pay the total amount now and you&apos;re all set!</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Partial Payment Option */}
                                                <div
                                                    className={`border rounded-xl p-4 transition-all ${!isDepositAvailable
                                                        ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-75'
                                                        : paymentOption === 'deposit'
                                                            ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600 cursor-pointer'
                                                            : 'border-gray-300 hover:border-gray-400 cursor-pointer'
                                                        }`}
                                                    onClick={() => isDepositAvailable && setPaymentOption('deposit')}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${!isDepositAvailable ? 'border-gray-300 bg-gray-100' :
                                                            paymentOption === 'deposit' ? 'border-purple-600' : 'border-gray-400'
                                                            }`}>
                                                            {paymentOption === 'deposit' && isDepositAvailable && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <span className={`font-semibold ${!isDepositAvailable ? 'text-gray-500' : 'text-gray-900'}`}>
                                                                    Pay Deposit ({tour.price.bookingPercentage || 20}%)
                                                                </span>
                                                                <span className={`font-bold ${!isDepositAvailable ? 'text-gray-500' : 'text-gray-900'}`}>
                                                                    {formatPrice(depositAmount)}
                                                                </span>
                                                            </div>
                                                            {isDepositAvailable ? (
                                                                <p className="text-sm text-gray-500 mt-1">
                                                                    Pay {formatPrice(depositAmount)} now. The remaining {formatPrice(calculateTotalPrice - depositAmount)} is due later.
                                                                </p>
                                                            ) : (
                                                                <p className="text-sm text-red-500 mt-1">
                                                                    Partial payment is only available for trips booked at least 3 months in advance.
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between pt-4">
                            <button
                                onClick={handleBack}
                                disabled={currentStep === 1}
                                className={`px-6 py-3 rounded-lg font-semibold transition ${currentStep === 1
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "border border-purple-600 text-purple-600 hover:bg-purple-50"
                                    }`}
                            >
                                Previous
                            </button>

                            <div className="flex items-center gap-4">
                                {currentStep === 2 && (
                                    <button className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-2">
                                        💾 Save my spot
                                        <span className="text-gray-500 font-normal">We&apos;ll save your spot for 48 hours. No deposit required.</span>
                                    </button>
                                )}
                                <button
                                    onClick={handleContinue}
                                    disabled={!canProceed()}
                                    className={`px-8 py-3 rounded-lg font-semibold transition ${canProceed()
                                        ? "bg-purple-600 text-white hover:bg-purple-700"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        }`}
                                >
                                    {currentStep === 5 ? "Complete Booking" : "Continue"}
                                </button>
                            </div>
                        </div>

                        <p className="text-center text-sm text-gray-500 mt-4">
                            To update your trip selections, please return to the trip detail page.
                        </p>
                    </div>

                    {/* Right Column - Tour Summary with Background Image */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 h-[calc(100vh-8rem)] rounded-2xl overflow-hidden shadow-xl">
                            {/* Background Image */}
                            <div className="absolute inset-0">
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
                                {/* Delicate gradient overlay to make the card pop slightly if needed */}
                                <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/20 pointer-events-none"></div>
                            </div>

                            {/* Floating Summary Card */}
                            <div className="relative z-10 p-4 h-full overflow-y-auto no-scrollbar">
                                <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 overflow-hidden">
                                    <div className="p-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Trip summary</h3>
                                        <div className="text-sm text-gray-500 mb-4">
                                            {adultCount} traveller{adultCount > 1 ? "s" : ""}
                                            {selectedDate && (
                                                <div className="mt-1">
                                                    {formatShortDate(selectedDate.startDate)} - {formatShortDate(selectedDate.endDate)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Your Impact */}
                                        <div className="py-3 border-t border-gray-100">
                                            <button className="w-full flex items-center justify-between text-gray-700 hover:text-gray-900 group">
                                                <span className="font-medium group-hover:text-purple-700 transition-colors">Your impact</span>
                                                <span className="text-gray-400">▼</span>
                                            </button>
                                        </div>

                                        {/* Tours Section */}
                                        <div className="py-3 border-t border-gray-100">
                                            <button className="w-full flex items-center justify-between text-gray-700 hover:text-gray-900 mb-3 group">
                                                <span className="font-medium group-hover:text-purple-700 transition-colors">Trips</span>
                                                <span className="text-purple-600">▲</span>
                                            </button>

                                            <div className="flex items-start gap-3 bg-gray-50/80 rounded-lg p-3">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 relative">
                                                    {primaryImage?.url ? (
                                                        <Image
                                                            src={primaryImage.url}
                                                            alt={tour.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                            <span className="text-sm">🏔️</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">{tour.name}</h4>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold text-gray-900">{formatPrice(pricePerPerson * adultCount)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Extras Section */}
                                        {(selectedActivities.length > 0 || accommodationUpgrade) && (
                                            <div className="py-3 border-t border-gray-100">
                                                <button className="w-full flex items-center justify-between text-gray-700 hover:text-gray-900 mb-3 group">
                                                    <span className="font-medium group-hover:text-purple-700 transition-colors">Extras</span>
                                                    <span className="text-purple-600">▲</span>
                                                </button>

                                                <div className="space-y-2">
                                                    {selectedActivities.map((activity, idx) => (
                                                        <div key={idx} className="flex items-center justify-between bg-gray-50/80 rounded-lg p-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                                                                    <span className="text-sm">🎯</span>
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{activity.name}</div>
                                                                    <div className="text-xs text-gray-500">x{activity.count} traveller{activity.count > 1 ? 's' : ''}</div>
                                                                </div>
                                                            </div>
                                                            <span className="font-bold text-gray-900 text-sm">{formatPrice(activity.price * activity.count)}</span>
                                                        </div>
                                                    ))}

                                                    {accommodationUpgrade && (
                                                        <div className="flex items-center justify-between bg-gray-50/80 rounded-lg p-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                                                    <span className="text-sm">🏨</span>
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{accommodationUpgrade.name}</div>
                                                                    <div className="text-xs text-gray-500">x{accommodationUpgrade.count} traveller{accommodationUpgrade.count > 1 ? 's' : ''}</div>
                                                                </div>
                                                            </div>
                                                            <span className="font-bold text-gray-900 text-sm">{formatPrice(accommodationUpgrade.price * accommodationUpgrade.count)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Promo Code Section */}
                                        <div className="py-3 border-t border-gray-100">
                                            <div className="text-sm font-bold text-gray-900 mb-2">Promo Code</div>
                                            {promoData ? (
                                                <div className="flex items-center gap-2 bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                                                    <Tag size={18} className="text-emerald-600" weight="fill" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-bold text-emerald-700 font-mono tracking-wider">{promoData.code}</div>
                                                        <div className="text-xs text-emerald-600">
                                                            {promoData.discountType === "percentage"
                                                                ? `${promoData.discountValue}% off`
                                                                : `$${promoData.discountAmount} off`}
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={clearPromoCode}
                                                        className="p-1 hover:bg-emerald-100 rounded-full transition-colors"
                                                    >
                                                        <X size={14} className="text-emerald-600" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={promoCodeInput}
                                                            onChange={(e) => {
                                                                setPromoCodeInput(e.target.value.toUpperCase());
                                                                setPromoError(null);
                                                            }}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleApplyPromoCode()}
                                                            placeholder="Enter code"
                                                            className={`flex-1 text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition uppercase font-mono tracking-wider ${
                                                                promoError ? "border-red-300 bg-red-50" : "border-gray-300"
                                                            }`}
                                                        />
                                                        <button
                                                            onClick={handleApplyPromoCode}
                                                            disabled={promoLoading || !promoCodeInput.trim()}
                                                            className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50 transition shadow-sm"
                                                        >
                                                            {promoLoading ? "..." : "Apply"}
                                                        </button>
                                                    </div>
                                                    {promoError && (
                                                        <div className="flex items-center gap-1.5 text-xs text-red-600 px-1">
                                                            <WarningCircle size={14} weight="fill" />
                                                            <span>{promoError}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Total Price */}
                                        <div className="pt-4 mt-2 border-t border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-bold text-gray-900">Total price</div>
                                                    <div className="text-xs text-gray-500">Taxes included</div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-2xl font-extrabold text-blue-900">{formatPrice(calculateTotalPrice)}</span>
                                                    {promoData && tour && (
                                                        <div className="text-xs text-gray-400 line-through">
                                                            {formatPrice(tour.price.amount * adultCount)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Simulation Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => !isBooking && setShowPaymentModal(false)}></div>

                        {/* Modal panel */}
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl relative z-50 sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <span className="text-green-600 text-lg">💳</span>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                            Payment Simulation
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 mb-4">
                                                Since this is a demo, please choose an outcome for the payment process.
                                            </p>

                                            {bookingError && (
                                                <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">
                                                    {bookingError}
                                                </div>
                                            )}

                                            <div className="bg-gray-50 p-4 rounded-md mb-4">
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span className="text-gray-600">Total Booking Value:</span>
                                                    <span className="font-semibold">{formatPrice(calculateTotalPrice)}</span>
                                                </div>
                                                <div className="flex justify-between text-lg mb-2 font-bold text-gray-900 border-t border-gray-200 pt-2">
                                                    <span>Pay Now:</span>
                                                    <span>{formatPrice(payNowAmount)}</span>
                                                </div>
                                                {paymentOption === 'deposit' && isDepositAvailable && (
                                                    <div className="flex justify-between text-sm text-gray-500">
                                                        <span>Due Later:</span>
                                                        <span>{formatPrice(calculateTotalPrice - payNowAmount)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between text-sm mt-3 pt-2 border-t border-gray-200">
                                                    <span className="text-gray-600">Card:</span>
                                                    <span className="font-mono">**** **** **** 4242</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                                <button
                                    type="button"
                                    onClick={() => handlePaymentSimulation(true)}
                                    disabled={isBooking}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isBooking ? "Processing..." : "Simulate Success"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handlePaymentSimulation(false)}
                                    disabled={isBooking}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Simulate Failure
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(false)}
                                    disabled={isBooking}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
