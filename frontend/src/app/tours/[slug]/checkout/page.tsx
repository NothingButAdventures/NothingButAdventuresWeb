"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";

interface Tour {
    _id: string;
    name: string;
    slug: string;
    summary: string;
    description: string;
    descriptionImage?: string;
    price: {
        amount: number;
        currency: string;
        discountPercent: number;
        bookingPercentage?: number;
    };
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
            price: {
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
        price: {
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

    // Pre-selected date from query params
    const preSelectedDateParam = searchParams.get("date");

    const [tour, setTour] = useState<Tour | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);

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

    const fetchTour = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${api.baseURL}/tours/${slug}`);
            const data = await response.json();

            if (response.ok) {
                setTour(data.data.tour);
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

        let basePrice = selectedDate?.price?.amount || tour.price.amount;
        if (tour.price.discountPercent > 0 && !selectedDate?.price?.amount) {
            basePrice = basePrice * (1 - tour.price.discountPercent / 100);
        }

        const activitiesTotal = selectedActivities.reduce((sum, act) => sum + act.price * act.count, 0);
        const accommodationTotal = accommodationUpgrade ? accommodationUpgrade.price * accommodationUpgrade.count : 0;

        return (basePrice * adultCount) + activitiesTotal + accommodationTotal;
    }, [tour, selectedDate, adultCount, selectedActivities, accommodationUpgrade]);

    const pricePerPerson = useMemo(() => {
        if (!tour) return 0;
        let basePrice = selectedDate?.price?.amount || tour.price.amount;
        if (tour.price.discountPercent > 0 && !selectedDate?.price?.amount) {
            basePrice = basePrice * (1 - tour.price.discountPercent / 100);
        }
        return basePrice;
    }, [tour, selectedDate]);

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

    const getDateStatus = (day: number) => {
        if (!tour) return null;
        const dateStr = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

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
                            price: activity.price.amount,
                            currency: activity.price.currency,
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
        // For now, just show an alert since payment is not implemented
        alert("Booking submitted! Payment integration coming soon.");
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
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Tour not found</h1>
                    <p className="text-gray-600 mb-4">The tour you&apos;re looking for doesn&apos;t exist.</p>
                    <Link href="/tours" className="text-purple-600 hover:underline">
                        Browse all tours
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
                        <Link href="/tours" className="text-gray-500 hover:text-gray-700">
                            Tours
                        </Link>
                        <span className="mx-2 text-gray-400">/</span>
                        <Link href={`/tours/${tour.slug}`} className="text-gray-500 hover:text-gray-700">
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
                                                                const dateStatus = getDateStatus(day);
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
                                                                        {dateStatus && !isPast && (
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
                                                                        ${Math.round(date.price.amount)}
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
                                                                                                ${activity.price.amount}
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

                                        <div className="border-t pt-6">
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
                            To update your tour selections, please return to the tour detail page.
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
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Tour summary</h3>
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
                                                <span className="font-medium group-hover:text-purple-700 transition-colors">Tours</span>
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

                                        {/* Total Price */}
                                        <div className="pt-4 mt-2 border-t border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-bold text-gray-900">Total price</div>
                                                    <div className="text-xs text-gray-500">Taxes included</div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-2xl font-extrabold text-blue-900">{formatPrice(calculateTotalPrice)}</span>
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
        </div>
    );
}
