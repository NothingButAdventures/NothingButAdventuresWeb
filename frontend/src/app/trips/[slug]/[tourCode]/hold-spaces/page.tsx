"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import {
    WarningCircle,
    User,
    CalendarBlank,
    CheckCircle,
    Info,
    Armchair,
    ArrowRight,
    ShieldCheck,
    HourglassHigh,
    LockKey
} from "@phosphor-icons/react";
import AuthModal from "@/components/AuthModal";

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

interface ActiveHold {
    _id: string;
    holdReference: string;
    status: string;
    expiresAt: string;
    tour: {
        _id: string;
        name: string;
        slug: string;
    };
}

type Step = 1 | 2 | 3;

export default function HoldSpacesPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const slug = params.slug as string;

    const preSelectedDateParam = searchParams.get("date");

    const [tour, setTour] = useState<Tour | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalInitialView, setAuthModalInitialView] = useState<"login" | "register">("login");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isTravellerInfoModalOpen, setIsTravellerInfoModalOpen] = useState(false);

    // Active hold check state
    const [activeHold, setActiveHold] = useState<ActiveHold | null>(null);

    // Step 1: Travellers - MAX 6 FOR HOLD SPACE
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

    // Step 2: Calendar Month state & Date select
    const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
    const [selectedDateId, setSelectedDateId] = useState<string>("");

    const [specialRequests, setSpecialRequests] = useState("");
    const [discountsMap, setDiscountsMap] = useState<{ [name: string]: number }>({});

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [currentStep]);

    // Check user auth and active hold space
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsLoggedIn(true);

            fetch(`${api.baseURL}${api.endpoints.auth.me}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success' && data.data.user) {
                        const nameParts = data.data.user.name.split(' ');
                        const firstName = nameParts[0] || data.data.user.name;
                        const lastName = nameParts.slice(1).join(' ') || '';
                        setPrimaryTraveller(prev => ({
                            ...prev,
                            firstName: prev.firstName || firstName,
                            lastName: prev.lastName || lastName,
                            email: prev.email || data.data.user.email || ''
                        }));
                    }
                })
                .catch(() => { });

            fetch(`${api.baseURL}/hold-spaces/my-holds`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success' && data.data.holdSpaces) {
                        const now = new Date();
                        const active = data.data.holdSpaces.find(
                            (h: any) => h.status === 'active' && new Date(h.expiresAt) > now
                        );
                        if (active) {
                            setActiveHold(active);
                        }
                    }
                })
                .catch(err => console.error("Error fetching hold spaces:", err));
        }
    }, []);

    // Sync other travellers array when adultCount changes (MAX 6)
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

    // Fetch tour details
    useEffect(() => {
        if (slug) {
            fetchTour();
        }
    }, [slug]);

    const fetchTour = async () => {
        try {
            setLoading(true);
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

    // Pre-select date from query params or default to nearest available
    useEffect(() => {
        if (tour && !selectedDateId) {
            let dateToSelect = null;
            if (preSelectedDateParam) {
                dateToSelect = tour.startDates.find(
                    (d) => new Date(d.startDate).toISOString().split("T")[0] === preSelectedDateParam
                );
            }
            if (!dateToSelect) {
                dateToSelect = tour.startDates.find((d) => d.availableSpots > 0 && new Date(d.startDate) > new Date());
            }
            if (dateToSelect && dateToSelect._id) {
                setSelectedDateId(dateToSelect._id);
                setCalendarMonth(new Date(dateToSelect.startDate));
            }
        }
    }, [tour, preSelectedDateParam, selectedDateId]);

    const selectedDate = useMemo(() => {
        if (!tour || !selectedDateId) return null;
        return tour.startDates.find((d) => d._id === selectedDateId) || null;
    }, [tour, selectedDateId]);

    const getDiscountPercentage = (discountName: string | undefined): number => {
        if (!discountName) return 0;
        return discountsMap[discountName] || 0;
    };

    const getBestDiscountPct = (discountNamePct: number, tourPriceAmount: number) => {
        const globalDiscountPct = tour?.price?.discountPercent || 0;
        return Math.max(discountNamePct, globalDiscountPct);
    };

    const baseTourPrice = useMemo(() => {
        if (!tour) return 0;
        let pricePerPerson = tour.price.amount;
        const dateDiscount = getDiscountPercentage(selectedDate?.discount);
        const bestDiscount = getBestDiscountPct(dateDiscount, tour.price.amount);

        if (bestDiscount > 0) {
            pricePerPerson = tour.price.amount * (1 - bestDiscount / 100);
        } else if (selectedDate?.price?.amount) {
            pricePerPerson = selectedDate.price.amount;
        }

        return Math.round(pricePerPerson * adultCount);
    }, [tour, selectedDate, adultCount, discountsMap]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: tour?.price?.currency || 'USD',
            maximumFractionDigits: 0
        }).format(price);
    };

    const formatShortDate = (dateStr: string) => {
        if (!dateStr) return "";
        const [year, month, day] = dateStr.split("T")[0].split("-").map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "2-digit" }).replace(/(\d{2})$/, "'$1");
    };

    // Calendar Helper Functions (Identical to Checkout)
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return days;
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

    const getDateStatus = (day: number, monthDate: Date) => {
        if (!tour?.startDates) return null;
        const checkDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
        const dateStr = checkDate.toISOString().split("T")[0];

        return tour.startDates.find((d) => {
            const startDateStr = new Date(d.startDate).toISOString().split("T")[0];
            return startDateStr === dateStr && d.isActive && d.availableSpots > 0;
        });
    };

    const canProceed = (): boolean => {
        if (currentStep === 1) {
            if (!primaryTraveller.title || !primaryTraveller.firstName || !primaryTraveller.lastName) return false;
            for (let i = 0; i < otherTravellers.length; i++) {
                if (!otherTravellers[i].title || !otherTravellers[i].firstName || !otherTravellers[i].lastName) return false;
            }
            return true;
        }
        if (currentStep === 2) {
            return !!selectedDateId;
        }
        if (currentStep === 3) {
            if (!primaryTraveller.email || !primaryTraveller.phone || !primaryTraveller.dobDay || !primaryTraveller.dobMonth || !primaryTraveller.dobYear) return false;
            for (let i = 0; i < otherTravellers.length; i++) {
                const t = otherTravellers[i];
                if (!t.email || !t.phone || !t.dobDay || !t.dobMonth || !t.dobYear) return false;
            }
            return true;
        }
        return false;
    };

    const handleContinue = () => {
        if (currentStep === 1) {
            setCurrentStep(2);
        } else if (currentStep === 2) {
            setCurrentStep(3);
        } else if (currentStep === 3) {
            handleHoldSpaceSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => (prev - 1) as Step);
        }
    };

    // Handle Hold Space submission
    const handleHoldSpaceSubmit = async () => {
        if (!isLoggedIn) {
            setAuthModalInitialView("login");
            setIsAuthModalOpen(true);
            return;
        }

        if (activeHold) {
            setSubmitError(`You already have an active hold space. Please release your active hold from your profile before creating a new one.`);
            return;
        }

        try {
            setIsSubmitting(true);
            setSubmitError(null);

            const token = localStorage.getItem("token");
            if (!token) {
                setSubmitError("Authentication required. Please log in.");
                setIsAuthModalOpen(true);
                return;
            }

            if (!selectedDate?.startDate) {
                setSubmitError("Please select a valid tour date.");
                return;
            }

            const allTravelers = [primaryTraveller, ...otherTravellers];

            const payload = {
                tour: tour?._id,
                startDate: selectedDate.startDate,
                numberOfSpots: adultCount,
                travelers: allTravelers,
                specialRequests
            };

            const res = await fetch(`${api.baseURL}/hold-spaces`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to hold space");
            }

            router.push("/profile?tab=hold spaces");
        } catch (err: any) {
            console.error("Hold space submission error:", err);
            setSubmitError(err.message || "An error occurred while holding space. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6A38C2]"></div>
                    <p className="mt-3 text-gray-600 font-medium">Loading hold space details...</p>
                </div>
            </div>
        );
    }

    if (!tour) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-xl border max-w-md">
                    <h1 className="text-2xl font-bold text-[#3F3F42] mb-2">Trip Not Found</h1>
                    <p className="text-gray-600 mb-6">The tour you are looking to hold space for does not exist.</p>
                    <Link href="/trips" className="bg-[#6A38C2] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#582cb1] transition inline-block">
                        Browse All Trips
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
                <div className="max-w-full mx-auto px-4 md:px-12 lg:px-24 py-4 md:py-6">
                    <div className="text-[13px] text-gray-500 mb-4">
                        Home / Destinations / {tour.country?.continent?.name || "Continent"} / {tour.country?.name || "Country"} / {tour.name} / Hold Space
                    </div>
                    <h1 className="text-3xl md:text-4xl font-semibold text-[#4C1D95] mb-2">{tour.name}</h1>
                    <div className="text-gray-500 text-sm">
                        Depart from {tour.location?.startCity || ""}, {tour.country?.name || ""}, {tour.duration?.days} Days
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-full mx-auto px-4 md:px-12 lg:px-24 py-8">
                {/* ACTIVE HOLD SPACE WARNING CARD */}
                {activeHold && (
                    <div className="mb-8 bg-amber-50 border-2 border-amber-300 rounded-xl p-6 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="bg-amber-500 text-white p-3 rounded-full shrink-0">
                                <WarningCircle size={28} weight="fill" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-amber-900 font-bold text-lg mb-1">
                                    Active Hold Space Found
                                </h3>
                                <p className="text-amber-800 text-sm mb-3 leading-relaxed">
                                    You currently have an active hold space for <strong className="font-semibold text-amber-950">&quot;{activeHold.tour?.name || 'another trip'}&quot;</strong> (Ref: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">{activeHold.holdReference}</code>).
                                    <br />
                                    To hold spots for <strong>{tour.name}</strong>, you must release your current hold space first. Each traveler can hold 1 active space at a time.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href="/profile?tab=hold spaces"
                                        className="inline-flex items-center gap-2 bg-amber-800 text-white px-5 py-2 rounded-lg font-medium hover:bg-amber-900 transition text-sm shadow-sm"
                                    >
                                        Manage / Release Active Hold in Profile
                                        <ArrowRight size={16} weight="bold" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Hold Space Steps */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Progress Stepper */}
                        <div className="bg-white rounded-xl border p-6 flex items-start justify-between relative overflow-hidden">
                            <div className="absolute left-[16.6%] right-[16.6%] top-[48px] h-[1px] bg-gray-300 z-0"></div>

                            {[
                                { label: "Passenger Details", step: 1, icon: User },
                                { label: "Select tour Dates", step: 2, icon: CalendarBlank },
                                { label: "Traveler Details & Hold", step: 3, icon: ShieldCheck }
                            ].map((s, index) => {
                                const isCompleted = currentStep > s.step;
                                const isCurrent = currentStep === s.step;
                                const Icon = s.icon;

                                return (
                                    <div key={index} className="flex flex-col items-center relative z-10 flex-1">
                                        <div className="bg-white px-2 mb-3">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center relative text-white ${isCompleted || isCurrent ? 'bg-[#6A38C2]' : 'bg-[#2f3d44]'}`}>
                                                <Icon size={24} weight={isCompleted || isCurrent ? "fill" : "bold"} />
                                                {isCompleted && (
                                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px]">
                                                        <CheckCircle size={16} weight="fill" className="text-[#6A38C2]" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`text-[17px] text-center font-medium ${isCurrent ? 'text-[#6A38C2]' : 'text-[#4E4E4E]'}`}>
                                            {s.label}
                                        </span>
                                        <span className={`text-[13px] mt-1 ${isCompleted ? 'text-[#6A38C2]' : 'text-gray-500'}`}>
                                            {isCompleted ? 'Completed' : `Step ${s.step}`}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Step 1: Who's Travelling */}
                        {currentStep >= 1 && currentStep !== 3 && (
                            <div className="space-y-4">
                                {currentStep === 1 && (
                                    <>
                                        {!isLoggedIn && (
                                            <>
                                                <div className="bg-purple-50 rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 border border-purple-100">
                                                    <div>
                                                        <h3 className="text-[#2C3238] font-semibold text-[18px]">Already have an account?</h3>
                                                        <p className="text-gray-600 text-[15px] mt-1">Log in for a faster experience.</p>
                                                    </div>
                                                    <div className="flex gap-3 w-full md:w-auto">
                                                        <button
                                                            onClick={() => {
                                                                setAuthModalInitialView("login");
                                                                setIsAuthModalOpen(true);
                                                            }}
                                                            className="px-6 py-2.5 border border-[#6A38C2] text-[#6A38C2] font-medium rounded-lg hover:bg-purple-100 transition w-full md:w-auto text-center"
                                                        >
                                                            Login
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setAuthModalInitialView("register");
                                                                setIsAuthModalOpen(true);
                                                            }}
                                                            className="px-6 py-2.5 bg-[#6A38C2] text-white font-medium rounded-lg hover:bg-purple-900 transition w-full md:w-auto text-center"
                                                        >
                                                            Sign up
                                                        </button>
                                                    </div>
                                                </div>
                                                <AuthModal
                                                    isOpen={isAuthModalOpen}
                                                    onClose={() => setIsAuthModalOpen(false)}
                                                    initialView={authModalInitialView}
                                                    onSuccess={() => window.location.reload()}
                                                />
                                            </>
                                        )}
                                        <div className="flex items-center justify-between px-1 mb-4">
                                            <div className="flex flex-col">
                                                <h2 className="text-[42px] font-medium text-[#2C3238] mb-1 leading-tight">Who is Travelling?</h2>
                                            </div>
                                        </div>
                                    </>
                                )}
                                <div className="bg-white rounded-xl shadow-sm border p-6">
                                    {currentStep === 1 ? (
                                        <>
                                            {/* Adult Counter (Max 6 for Hold Space) */}
                                            <div className="flex items-center justify-between border border-gray-200 rounded-xl p-4 mb-8">
                                                <div className="text-[19px] text-[#3F3F42] font-medium">
                                                    Select the number of travellers <span className="text-gray-400 font-normal text-[16px]">(max 6 for hold space)</span>
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
                                                        onClick={() => setAdultCount(Math.min(6, adultCount + 1))}
                                                        className="w-7 h-7 rounded-full bg-[#4C1D95] text-white flex items-center justify-center hover:bg-purple-900 transition text-lg font-bold"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Passenger Details Forms */}
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

                                                                {/* Title */}
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

                                                                {/* First, Middle, Last Name */}
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                                    <div>
                                                                        <label className="block text-[17px] text-gray-600 mb-1">First name <span className="text-orange-400">*</span></label>
                                                                        <input
                                                                            type="text"
                                                                            value={traveller.firstName}
                                                                            onChange={(e) => updateField('firstName', e.target.value)}
                                                                            disabled={isPrimary && isLoggedIn}
                                                                            className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-[17px] ${isPrimary && isLoggedIn ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
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
                                                    <div
                                                        onClick={() => setCurrentStep(1)}
                                                        className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-2 min-w-[200px] cursor-pointer hover:bg-gray-50 transition"
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-[#3F3F42] text-white flex items-center justify-center font-bold text-base">
                                                            {primaryTraveller.firstName?.charAt(0).toUpperCase() || "U"}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[13px] text-gray-500 font-medium">Traveller 1 ( Primary )</span>
                                                            <span className="text-[17px] font-semibold text-black">
                                                                {primaryTraveller.firstName || "Traveler"} {primaryTraveller.lastName || "1"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {otherTravellers.map((t, i) => (
                                                        <div
                                                            key={i}
                                                            onClick={() => setCurrentStep(1)}
                                                            className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-2 min-w-[200px] cursor-pointer hover:bg-gray-50 transition"
                                                        >
                                                            <div className="w-10 h-10 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-base">
                                                                {t.firstName?.charAt(0).toUpperCase() || "T"}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[13px] text-gray-500 font-medium">Traveller {i + 2}</span>
                                                                <span className="text-[17px] font-semibold text-black">
                                                                    {t.firstName || "Traveler"} {t.lastName || `${i + 2}`}
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

                        {/* Step 2: Select Departure Date (Identical to Checkout) */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <div className="bg-white rounded-xl shadow-sm border p-8">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="flex flex-col">
                                            <h2 className="text-[42px] font-medium text-[#2C3238] mb-1 leading-tight">Select a Departure Date</h2>
                                            <div className="text-[17px] text-gray-500 font-medium">All prices displayed in US Dollars (USD)</div>
                                        </div>
                                    </div>

                                    {/* Dual Calendar View */}
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

                                                        <div className="flex flex-col items-center select-none">
                                                            <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                                                                {monthDate.getFullYear()}
                                                            </span>
                                                            <span className="font-semibold text-black text-[18px]">
                                                                {monthDate.toLocaleDateString("en-US", { month: "long" })}
                                                            </span>
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
                                                            const isSelected = dateStatus && selectedDateId === dateStatus._id;

                                                            return (
                                                                <div key={idx} className="relative flex items-center justify-center h-12">
                                                                    <button
                                                                        onClick={() => dateStatus && setSelectedDateId(dateStatus._id!)}
                                                                        disabled={!dateStatus || isPast}
                                                                        className={`w-[40px] h-[40px] flex flex-col items-center justify-center rounded-full text-[18px] transition relative z-10 ${isSelected
                                                                            ? "bg-[#53319C] text-white font-medium shadow-md"
                                                                            : dateStatus && !isPast
                                                                                ? "text-black hover:bg-gray-100 font-medium cursor-pointer"
                                                                                : "text-gray-300 font-normal cursor-not-allowed"
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

                                    {/* All Available Dates List */}
                                    <div className="pt-6">
                                        <div className="flex items-end justify-between mb-4">
                                            <h3 className="text-[20px] font-medium text-black pl-1">All Available Dates</h3>
                                            <span className="text-[14px] text-gray-500 pr-1">Do you want Sooner dates?</span>
                                        </div>
                                        <div className="space-y-4 mb-4">
                                            {tour.startDates
                                                .filter((d) => d.isActive && d.availableSpots > 0 && new Date(d.startDate) > new Date())
                                                .map((date, idx) => {
                                                    const dateDiscount = getDiscountPercentage(date.discount);
                                                    const bestDiscount = getBestDiscountPct(dateDiscount, tour.price.amount);
                                                    let priceForDate = tour.price.amount;
                                                    if (bestDiscount > 0) {
                                                        priceForDate = priceForDate * (1 - bestDiscount / 100);
                                                    } else if (date.price?.amount) {
                                                        priceForDate = date.price.amount;
                                                    } else if (tour.price.discountPercent > 0) {
                                                        priceForDate = priceForDate * (1 - tour.price.discountPercent / 100);
                                                    }
                                                    priceForDate = Math.round(priceForDate);

                                                    return (
                                                        <div
                                                            key={date._id || idx}
                                                            onClick={() => {
                                                                setSelectedDateId(date._id!);
                                                                setCalendarMonth(new Date(date.startDate));
                                                            }}
                                                            className={`flex items-center justify-between px-6 py-4 rounded-2xl transition-all cursor-pointer ${selectedDateId === date._id ? 'bg-[#F4F0FF] ring-2 ring-[#53319C]' : 'bg-[#F1F2F3] hover:bg-gray-200'}`}
                                                        >
                                                            <div className="flex flex-col flex-1">
                                                                {bestDiscount > 0 ? (
                                                                    <span className="text-[12px] font-medium text-[#FF4835] mb-0.5">On Sale</span>
                                                                ) : (
                                                                    <span className="h-[18px] mb-0.5"></span>
                                                                )}
                                                                <span className="font-medium text-[#2C3238] text-[16px]">
                                                                    {new Date(date.startDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })} to {new Date(date.endDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                                                                </span>
                                                            </div>

                                                            <div className="flex flex-1 justify-center items-center mt-2">
                                                                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
                                                                    <Armchair size={15} className="text-gray-400" weight="fill" />
                                                                    <span className="text-[12px] font-medium text-gray-500">{date.availableSpots}+ Seats Available</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-1 justify-end items-center gap-6 mt-2">
                                                                <div className="flex items-baseline gap-1">
                                                                    <span className="text-[14px] font-bold text-[#1A1F24] translate-y-[-8px]">$</span>
                                                                    <span className="text-[34px] font-bold text-[#1A1F24] leading-none tracking-tight">{priceForDate}</span>
                                                                    <span className="text-[10px] font-bold text-black mt-auto mb-1.5">USD/Per Person</span>
                                                                </div>

                                                                <div className="relative">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedDateId(date._id!);
                                                                            setCalendarMonth(new Date(date.startDate));
                                                                        }}
                                                                        className={`px-8 py-3 rounded-full font-medium text-[15px] transition text-white relative z-0 ${selectedDateId === date._id ? 'bg-[#53319C] hover:bg-[#40257a]' : 'bg-[#37414A] hover:bg-black'}`}
                                                                    >
                                                                        {selectedDateId === date._id ? "Selected" : "Select"}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>

                                        {selectedDateId && (
                                            <button
                                                onClick={() => setSelectedDateId("")}
                                                className="text-[#53319C] font-medium text-[15px] pl-2 transition"
                                            >
                                                Clear date
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Traveler Info & Finalize Hold Space */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl shadow-sm border p-8">
                                    <h2 className="text-[32px] font-medium text-[#2C3238] mb-2 leading-tight">Complete Traveler Details</h2>
                                    <p className="text-gray-500 text-sm mb-6">
                                        Names from Step 1 are locked in below. Please provide contact & passport details for all travellers to finalize your 48-hour free hold space.
                                    </p>

                                    {submitError && (
                                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
                                            <WarningCircle size={20} weight="fill" className="shrink-0" />
                                            <span className="text-sm font-medium">{submitError}</span>
                                        </div>
                                    )}

                                    {/* Primary + Other Travellers Full Info Forms */}
                                    <div className="space-y-6">
                                        {[primaryTraveller, ...otherTravellers].map((traveller, idx) => {
                                            const isPrimary = idx === 0;
                                            const updateField = (field: keyof Traveller, value: string) => {
                                                if (isPrimary) {
                                                    setPrimaryTraveller(prev => ({ ...prev, [field]: value }));
                                                } else {
                                                    setOtherTravellers(prev => {
                                                        const copy = [...prev];
                                                        copy[idx - 1] = { ...copy[idx - 1], [field]: value };
                                                        return copy;
                                                    });
                                                }
                                            };

                                            return (
                                                <div key={idx} className="border border-gray-300 rounded-xl p-6 bg-white">
                                                    <div className="mb-4 flex items-center justify-between">
                                                        <h3 className="text-[20px] font-semibold text-[#2C3238]">
                                                            {isPrimary ? 'Primary Traveller (Contact Person)' : `Traveller ${idx + 1}`}
                                                        </h3>
                                                    </div>

                                                    {/* Step 1 Fields (Title, First, Middle, Last) - DISABLED */}
                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-100">
                                                        <div>
                                                            <label className="block text-[14px] text-gray-500 mb-1 font-medium">Title</label>
                                                            <input
                                                                type="text"
                                                                value={traveller.title || "-"}
                                                                disabled
                                                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-500 cursor-not-allowed text-[15px]"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[14px] text-gray-500 mb-1 font-medium">First name</label>
                                                            <input
                                                                type="text"
                                                                value={traveller.firstName || "-"}
                                                                disabled
                                                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-500 cursor-not-allowed text-[15px]"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[14px] text-gray-500 mb-1 font-medium">Middle name</label>
                                                            <input
                                                                type="text"
                                                                value={traveller.middleName || "-"}
                                                                disabled
                                                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-500 cursor-not-allowed text-[15px]"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[14px] text-gray-500 mb-1 font-medium">Last name</label>
                                                            <input
                                                                type="text"
                                                                value={traveller.lastName || "-"}
                                                                disabled
                                                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-500 cursor-not-allowed text-[15px]"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Contact & Passport Info */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                        <div>
                                                            <label className="block text-[15px] text-gray-600 mb-1 font-medium">Email address <span className="text-orange-400">*</span></label>
                                                            <input
                                                                type="email"
                                                                value={traveller.email}
                                                                onChange={(e) => updateField('email', e.target.value)}
                                                                placeholder="email@example.com"
                                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-[16px]"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[15px] text-gray-600 mb-1 font-medium">Phone number <span className="text-orange-400">*</span></label>
                                                            <div className="flex gap-2">
                                                                <select
                                                                    value={traveller.countryCode}
                                                                    onChange={(e) => updateField('countryCode', e.target.value)}
                                                                    className="w-2/5 border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-purple-500 bg-white text-[15px]"
                                                                >
                                                                    <option value="+1 - United States">+1 (US)</option>
                                                                    <option value="+44 - United Kingdom">+44 (UK)</option>
                                                                    <option value="+91 - India">+91 (IN)</option>
                                                                    <option value="+61 - Australia">+61 (AU)</option>
                                                                    <option value="+49 - Germany">+49 (DE)</option>
                                                                    <option value="+33 - France">+33 (FR)</option>
                                                                </select>
                                                                <input
                                                                    type="tel"
                                                                    value={traveller.phone}
                                                                    onChange={(e) => updateField('phone', e.target.value)}
                                                                    placeholder="Phone number"
                                                                    className="w-3/5 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-[16px]"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-[15px] text-gray-600 mb-1 font-medium">Date of birth <span className="text-orange-400">*</span></label>
                                                            <input
                                                                type="date"
                                                                value={
                                                                    traveller.dobYear && traveller.dobMonth && traveller.dobDay
                                                                        ? `${traveller.dobYear}-${String(traveller.dobMonth).padStart(2, '0')}-${String(traveller.dobDay).padStart(2, '0')}`
                                                                        : ''
                                                                }
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    if (val) {
                                                                        const [y, m, d] = val.split('-');
                                                                        updateField('dobYear', y);
                                                                        updateField('dobMonth', String(parseInt(m, 10)));
                                                                        updateField('dobDay', String(parseInt(d, 10)));
                                                                    } else {
                                                                        updateField('dobYear', '');
                                                                        updateField('dobMonth', '');
                                                                        updateField('dobDay', '');
                                                                    }
                                                                }}
                                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-[16px] bg-white cursor-pointer"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[15px] text-gray-600 mb-1 font-medium">Nationality <span className="text-orange-400">*</span></label>
                                                            <input
                                                                type="text"
                                                                value={traveller.nationality}
                                                                onChange={(e) => updateField('nationality', e.target.value)}
                                                                placeholder="e.g. American, British, Indian"
                                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-[16px]"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Special Requests */}
                                    <div className="mt-6">
                                        <label className="block text-[15px] text-gray-700 font-medium mb-2">Special Requests (Optional)</label>
                                        <textarea
                                            value={specialRequests}
                                            onChange={(e) => setSpecialRequests(e.target.value)}
                                            rows={3}
                                            placeholder="Dietary requirements, accessibility needs, or special notes..."
                                            className="w-full border border-gray-300 rounded-xl p-4 text-[15px] focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                    </div>
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
                                    disabled={!canProceed() || (currentStep === 3 && (isSubmitting || !!activeHold))}
                                    className={`px-8 py-2.5 rounded-full font-semibold transition text-[16px] shadow-sm ${canProceed() && !(currentStep === 3 && (isSubmitting || !!activeHold))
                                        ? "bg-[#4C1D95] text-white hover:bg-purple-900"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        }`}
                                >
                                    {currentStep === 3
                                        ? (isSubmitting ? "Holding Space..." : "Hold Space Now")
                                        : "Continue"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Booking Summary (100% same UI as checkout) */}
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

                            <div className="mb-5 px-1">
                                <div className="flex items-start justify-between">
                                    <h3 className="text-3xl font-medium text-[#2C3238] pr-4 leading-tight">{tour.name}</h3>
                                </div>
                                <div className="mt-2 text-[15px] text-gray-500">
                                    Trip Code: <span className="font-semibold">{tour.tourCode}</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-5 mb-5 px-1">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3 text-gray-500 text-[15px]">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                                        <span>Duration</span>
                                    </div>
                                    <span className="text-[15px] text-gray-600 font-medium">{tour.duration?.days} days</span>
                                </div>

                                {selectedDate && (
                                    <>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3 text-gray-500 text-[15px]">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                                                <span>Start date</span>
                                            </div>
                                            <span className="text-[13px] text-gray-600 font-medium">
                                                {formatShortDate(selectedDate.startDate)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-gray-500 text-[15px]">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                                                <span>End date</span>
                                            </div>
                                            <span className="text-[13px] text-gray-600 font-medium">
                                                {formatShortDate(selectedDate.endDate)}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="border-t border-gray-200 pt-5 mb-5 px-1">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-[20px] font-medium text-[#2C3238]">Trip</h4>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-start justify-between text-[16px] text-gray-500">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-black"></div>
                                            <span>{adultCount} {adultCount > 1 ? "Travellers" : "Traveller"}</span>
                                        </div>
                                        <div>
                                            <span>{formatPrice(baseTourPrice)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between font-medium text-[#2C3238] pb-1 pt-3 mt-2 border-t border-gray-100">
                                        <span className="text-[16px]">Total Held Amount</span>
                                        <span className="text-[18px] font-bold text-[#4C1D95]">{formatPrice(baseTourPrice)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Free Hold Info Banner */}
                            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 text-center">
                                <div className="text-[#6A38C2] font-semibold text-sm mb-1 flex items-center justify-center gap-1.5">
                                    <ShieldCheck size={18} weight="fill" />
                                    48-Hour Free Hold Guarantee
                                </div>
                                <p className="text-gray-600 text-xs leading-relaxed">
                                    No payment or deposit required today. Spots are reserved for 48 hours to give you time to confirm your trip details.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
