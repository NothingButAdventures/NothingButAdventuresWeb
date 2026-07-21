"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import Image from "next/image";
import { 
    Calendar,
    Search,
    Eye,
    X,
    Lock,
    FileText,
    Shield,
    CheckCircle2,
    XCircle,
    Loader2,
} from "lucide-react";
import BookingDetailsModal from "@/components/BookingDetailsModal";

interface Tour {
    _id: string;
    name: string;
    slug: string;
    tourCode: string;
    summary: string;
    price: {
        amount: number;
        currency: string;
    };
    duration: {
        days: number;
        nights: number;
    };
    country: {
        _id: string;
        name: string;
    };
    images: Array<{
        url: string;
        caption: string;
        isPrimary: boolean;
    }>;
    startDates: Array<{
        _id: string;
        startDate: string;
        endDate: string;
        availableSpots: number;
        isActive: boolean;
        discount?: string;
    }>;
}

interface Booking {
    _id: string;
    tour: {
        _id: string;
        name: string;
        slug: string;
        tourCode: string;
        images?: any[];
        duration?: any;
        location?: any;
    };
    user: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
        avatar?: string;
        nationality?: string;
    };
    startDate: string;
    numberOfTravelers: number;
    travelers: Array<{
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        dateOfBirth?: string;
        nationality?: string;
        passportNumber?: string;
        specialRequests?: string;
    }>;
    price: {
        basePrice: number;
        discountAmount: number;
        taxes: number;
        totalPrice: number;
        currency: string;
    };
    payment: {
        method: string;
        status: string;
        transactions: any[];
    };
    status: string;
    bookingReference: string;
    specialRequests?: {
        dietary: string[];
        accessibility: string;
        roomPreference: string;
        other: string;
    };
    createdAt: string;
}

interface HoldSpace {
    _id: string;
    user: {
        name: string;
        email: string;
    };
    startDate: string;
    expiresAt: string;
    status: "active" | "expired" | "released" | "converted";
    tour: string;
}

export default function BookingsManagementPage() {
    const PAGE_SIZE = 20;
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState<"users" | "tours">("users");
    const [tours, setTours] = useState<Tour[]>([]);
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [usersStatusFilter, setUsersStatusFilter] = useState("all");
    const [usersPaymentFilter, setUsersPaymentFilter] = useState("all");
    const [usersMethodFilter, setUsersMethodFilter] = useState("all");
    const [usersTravelersFilter, setUsersTravelersFilter] = useState("all");
    const [usersAmountFilter, setUsersAmountFilter] = useState("all");
    const [usersDepartureWindowFilter, setUsersDepartureWindowFilter] = useState("all");
    const [usersNationalityFilter, setUsersNationalityFilter] = useState("all");
    const [toursDestinationFilter, setToursDestinationFilter] = useState("all");
    const [toursAvailabilityFilter, setToursAvailabilityFilter] = useState("all");
    const [toursPriceFilter, setToursPriceFilter] = useState("all");
    const [toursDurationFilter, setToursDurationFilter] = useState("all");
    const [toursDeparturesFilter, setToursDeparturesFilter] = useState("all");
    const [usersPage, setUsersPage] = useState(1);
    const [toursPage, setToursPage] = useState(1);
    
    // Nested Modal States
    const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
    const [isDatesModalOpen, setIsDatesModalOpen] = useState(false);
    
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isBookingsModalOpen, setIsBookingsModalOpen] = useState(false);
    const [bookingsTableType, setBookingsTableType] = useState<"bookings" | "holds">("bookings");
    
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [holds, setHolds] = useState<HoldSpace[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    
    const [selectedBookingDetails, setSelectedBookingDetails] = useState<any | null>(null);

    // Docs verification modal
    const [docsModalBooking, setDocsModalBooking] = useState<any | null>(null);
    const [docsActiveTab, setDocsActiveTab] = useState(0);
    const [togglingDoc, setTogglingDoc] = useState<string | null>(null);

    const handleToggleVerification = async (bookingId: string, travelerIndex: number, docType: string) => {
        const key = `${travelerIndex}-${docType}`;
        setTogglingDoc(key);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${api.baseURL}${api.endpoints.bookings.toggleDocVerification(bookingId)}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ travelerIndex, docType }),
            });
            const data = await res.json();
            if (res.ok) {
                setDocsModalBooking(data.data.booking);
                // Update in allBookings too
                setAllBookings(prev => prev.map(b => b._id === bookingId ? { ...b, ...data.data.booking } : b));
            }
        } catch (err) {
            console.error("Toggle verification failed:", err);
        } finally {
            setTogglingDoc(null);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        setUsersPage(1);
    }, [
        searchTerm,
        usersStatusFilter,
        usersPaymentFilter,
        usersMethodFilter,
        usersTravelersFilter,
        usersAmountFilter,
        usersDepartureWindowFilter,
        usersNationalityFilter,
    ]);

    useEffect(() => {
        setToursPage(1);
    }, [
        searchTerm,
        toursDestinationFilter,
        toursAvailabilityFilter,
        toursPriceFilter,
        toursDurationFilter,
        toursDeparturesFilter,
    ]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            await Promise.all([fetchTours(), fetchAllBookings()]);
        } finally {
            setLoading(false);
        }
    };

    const fetchTours = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${api.baseURL}/tours`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setTours(data.data.tours);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const fetchAllBookings = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${api.baseURL}/bookings`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setAllBookings(data.data.bookings || []);
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
    };

    const fetchBookingsForDate = async (tourId: string, date: string) => {
        try {
            setLoadingBookings(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${api.baseURL}/bookings?tour=${tourId}&startDate=${date}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setBookings(data.data.bookings || []);
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setLoadingBookings(false);
        }
    };

    const fetchHoldsForDate = async (tourId: string, date: string) => {
        try {
            setLoadingBookings(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${api.baseURL}/hold-spaces?tour=${tourId}&startDate=${date}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setHolds(data.data.holds || []);
            }
        } catch (error) {
            console.error("Error fetching holds:", error);
        } finally {
            setLoadingBookings(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const handleTourClick = (tour: Tour) => {
        setSelectedTour(tour);
        setIsDatesModalOpen(true);
    };

    const handleViewBookings = (date: string) => {
        if (!selectedTour) return;
        setSelectedDate(date);
        setBookingsTableType("bookings");
        setIsBookingsModalOpen(true);
        fetchBookingsForDate(selectedTour._id, date);
    };

    const handleViewHolds = (date: string) => {
        if (!selectedTour) return;
        setSelectedDate(date);
        setBookingsTableType("holds");
        setIsBookingsModalOpen(true);
        fetchHoldsForDate(selectedTour._id, date);
    };

    // Extract Nationality list
    const nationalityOptions = Array.from(
        new Set(
            allBookings
                .map((b) => b.user?.nationality)
                .filter((n): n is string => typeof n === "string" && n.trim() !== "")
        )
    ).sort();

    // Extract Destination list
    const destinationOptions = Array.from(
        new Set(
            tours
                .map((t) => t.country?.name)
                .filter((name): name is string => typeof name === "string" && name.trim() !== "")
        )
    ).sort();

    // Extract unique payment methods
    const paymentMethodOptions = Array.from(
        new Set(
            allBookings
                .map((b) => b.payment?.method)
                .filter((m): m is string => typeof m === "string" && m.trim() !== "")
        )
    ).sort();

    // Filter Users Bookings
    const filteredUsersBookings = allBookings.filter((booking) => {
        const query = searchTerm.toLowerCase();
        const matchesSearch =
            searchTerm === "" ||
            (booking.user?.name || "").toLowerCase().includes(query) ||
            (booking.user?.email || "").toLowerCase().includes(query) ||
            (booking.bookingReference || "").toLowerCase().includes(query) ||
            (booking.tour?.name || "").toLowerCase().includes(query);

        const matchesStatus =
            usersStatusFilter === "all" ||
            (booking.status || "").toLowerCase() === usersStatusFilter;

        const matchesPayment =
            usersPaymentFilter === "all" ||
            (booking.payment?.status || "").toLowerCase() === usersPaymentFilter;

        const matchesPaymentMethod =
            usersMethodFilter === "all" ||
            (booking.payment?.method || "").toLowerCase() === usersMethodFilter;

        const groupSize = booking.numberOfTravelers || 1;
        const matchesTravelers =
            usersTravelersFilter === "all" ||
            (usersTravelersFilter === "solo" && groupSize === 1) ||
            (usersTravelersFilter === "small-group" && groupSize >= 2 && groupSize <= 4) ||
            (usersTravelersFilter === "large-group" && groupSize >= 5);

        const totalPrice = booking.price?.totalPrice || 0;
        const matchesAmount =
            usersAmountFilter === "all" ||
            (usersAmountFilter === "budget" && totalPrice < 1000) ||
            (usersAmountFilter === "mid" && totalPrice >= 1000 && totalPrice <= 2500) ||
            (usersAmountFilter === "premium" && totalPrice > 2500);

        const now = new Date();
        const departureDate = new Date(booking.startDate);
        const in30Days = new Date();
        in30Days.setDate(in30Days.getDate() + 30);
        const in90Days = new Date();
        in90Days.setDate(in90Days.getDate() + 90);
        const matchesDepartureWindow =
            usersDepartureWindowFilter === "all" ||
            (usersDepartureWindowFilter === "upcoming-30" && departureDate >= now && departureDate <= in30Days) ||
            (usersDepartureWindowFilter === "upcoming-90" && departureDate >= now && departureDate <= in90Days) ||
            (usersDepartureWindowFilter === "past" && departureDate < now) ||
            (usersDepartureWindowFilter === "this-year" && departureDate.getFullYear() === now.getFullYear());

        const matchesNationality =
            usersNationalityFilter === "all" ||
            (booking.user?.nationality || "") === usersNationalityFilter;

        return (
            matchesSearch &&
            matchesStatus &&
            matchesPayment &&
            matchesPaymentMethod &&
            matchesTravelers &&
            matchesAmount &&
            matchesDepartureWindow &&
            matchesNationality
        );
    });

    // Filter Tours View
    const filteredTours = tours.filter((tour) => {
        const query = searchTerm.toLowerCase();
        const matchesSearch =
            searchTerm === "" ||
            tour.name.toLowerCase().includes(query) ||
            tour.tourCode.toLowerCase().includes(query);

        const matchesDestination =
            toursDestinationFilter === "all" ||
            tour.country?.name === toursDestinationFilter;

        const hasAvailableSpots = tour.startDates.some((date) => date.availableSpots > 0 && date.isActive);
        const isSoldOut = tour.startDates.every((date) => date.availableSpots === 0 || !date.isActive);
        const nearlyFull = tour.startDates.some((date) => date.availableSpots > 0 && date.availableSpots <= 3 && date.isActive);
        
        const matchesAvailability =
            toursAvailabilityFilter === "all" ||
            (toursAvailabilityFilter === "available" && hasAvailableSpots) ||
            (toursAvailabilityFilter === "soldout" && isSoldOut) ||
            (toursAvailabilityFilter === "nearly-full" && nearlyFull);

        const amount = tour.price.amount;
        const matchesPrice =
            toursPriceFilter === "all" ||
            (toursPriceFilter === "low" && amount < 1000) ||
            (toursPriceFilter === "mid" && amount >= 1000 && amount <= 3000) ||
            (toursPriceFilter === "high" && amount > 3000);

        const days = tour.duration.days;
        const matchesDuration =
            toursDurationFilter === "all" ||
            (toursDurationFilter === "short" && days <= 5) ||
            (toursDurationFilter === "medium" && days >= 6 && days <= 10) ||
            (toursDurationFilter === "long" && days >= 11);

        const now = new Date();
        const in30Days = new Date();
        in30Days.setDate(in30Days.getDate() + 30);
        
        const upcoming30DaysDeparture = tour.startDates.some((date) => {
            const depDate = new Date(date.startDate);
            return depDate >= now && depDate <= in30Days && date.isActive;
        });

        const matchesDepartures =
            toursDeparturesFilter === "all" ||
            (toursDeparturesFilter === "none" && tour.startDates.length === 0) ||
            (toursDeparturesFilter === "few" && tour.startDates.length >= 1 && tour.startDates.length <= 3) ||
            (toursDeparturesFilter === "many" && tour.startDates.length >= 4) ||
            (toursDeparturesFilter === "upcoming-30" && upcoming30DaysDeparture);

        return (
            matchesSearch &&
            matchesDestination &&
            matchesAvailability &&
            matchesPrice &&
            matchesDuration &&
            matchesDepartures
        );
    });

    const usersTotalPages = Math.max(1, Math.ceil(filteredUsersBookings.length / PAGE_SIZE));
    const toursTotalPages = Math.max(1, Math.ceil(filteredTours.length / PAGE_SIZE));
    const safeUsersPage = Math.min(usersPage, usersTotalPages);
    const safeToursPage = Math.min(toursPage, toursTotalPages);

    const paginatedUsersBookings = filteredUsersBookings.slice(
        (safeUsersPage - 1) * PAGE_SIZE,
        safeUsersPage * PAGE_SIZE
    );

    const paginatedTours = filteredTours.slice(
        (safeToursPage - 1) * PAGE_SIZE,
        safeToursPage * PAGE_SIZE
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-zinc-500 font-medium animate-pulse text-sm">Initialising management console...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="px-8 h-16 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-zinc-800 leading-none">Bookings Management</h1>
                        <p className="text-gray-500 text-xs mt-1 leading-none">
                            Manage users, tours, departures and guest reservations
                        </p>
                    </div>
                    <Link
                        href="/admin"
                        className="bg-white hover:bg-gray-50 text-zinc-700 border border-gray-300 font-semibold py-1.5 px-3 rounded-md transition shadow-sm flex items-center gap-1.5 text-xs"
                    >
                        <X className="w-3.5 h-3.5" />
                        Close
                    </Link>
                </div>
            </div>

            <div className="p-8">
                {/* View Selector */}
                <div className="mb-4 inline-flex items-center p-1 rounded-md border border-gray-200 bg-white shadow-sm">
                    <button
                        onClick={() => setActiveView("users")}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors cursor-pointer border-none ${
                            activeView === "users"
                                ? "bg-zinc-900 text-white"
                                : "text-zinc-600 hover:text-zinc-900 hover:bg-gray-50"
                        }`}
                    >
                        Users View
                    </button>
                    <button
                        onClick={() => setActiveView("tours")}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors cursor-pointer border-none ${
                            activeView === "tours"
                                ? "bg-zinc-900 text-white"
                                : "text-zinc-600 hover:text-zinc-900 hover:bg-gray-50"
                        }`}
                    >
                        Tours View
                    </button>
                </div>

                {/* Search Term */}
                <div className="mb-6 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder={activeView === "users" ? "Search users, email, booking ref or tour..." : "Search tours or countries..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-800"
                        />
                        <Search
                            className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2"
                        />
                    </div>
                </div>

                {/* Filters */}
                {activeView === "users" ? (
                    <div className="mb-6 flex flex-wrap items-center gap-2.5">
                        <select
                            value={usersStatusFilter}
                            onChange={(e) => setUsersStatusFilter(e.target.value)}
                            className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-350 rounded-md text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 shadow-sm"
                        >
                            <option value="all">All Booking Status</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="pending">Pending</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                        </select>

                        <select
                            value={usersPaymentFilter}
                            onChange={(e) => setUsersPaymentFilter(e.target.value)}
                            className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-355 rounded-md text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 shadow-sm"
                        >
                            <option value="all">All Payment Status</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                        </select>

                        <select
                            value={usersTravelersFilter}
                            onChange={(e) => setUsersTravelersFilter(e.target.value)}
                            className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-355 rounded-md text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 shadow-sm"
                        >
                            <option value="all">All Group Sizes</option>
                            <option value="solo">Solo (1)</option>
                            <option value="small-group">Small Group (2-4)</option>
                            <option value="large-group">Large Group (5+)</option>
                        </select>

                        <select
                            value={usersMethodFilter}
                            onChange={(e) => setUsersMethodFilter(e.target.value)}
                            className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-355 rounded-md text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 shadow-sm"
                        >
                            <option value="all">All Payment Methods</option>
                            {paymentMethodOptions.map((method) => (
                                <option key={method} value={method}>
                                    {method.replace(/[_-]/g, " ")}
                                </option>
                            ))}
                        </select>

                        <select
                            value={usersAmountFilter}
                            onChange={(e) => setUsersAmountFilter(e.target.value)}
                            className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-355 rounded-md text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 shadow-sm"
                        >
                            <option value="all">All Amount Bands</option>
                            <option value="budget">Under $1000</option>
                            <option value="mid">$1000 - $2500</option>
                            <option value="premium">Above $2500</option>
                        </select>

                        <select
                            value={usersDepartureWindowFilter}
                            onChange={(e) => setUsersDepartureWindowFilter(e.target.value)}
                            className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-355 rounded-md text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 shadow-sm"
                        >
                            <option value="all">All Departure Windows</option>
                            <option value="upcoming-30">Departing in 30 days</option>
                            <option value="upcoming-90">Departing in 90 days</option>
                            <option value="past">Past departures</option>
                            <option value="this-year">This year</option>
                        </select>

                        <select
                            value={usersNationalityFilter}
                            onChange={(e) => setUsersNationalityFilter(e.target.value)}
                            className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-355 rounded-md text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 shadow-sm"
                        >
                            <option value="all">All Nationalities</option>
                            {nationalityOptions.map((nationality) => (
                                <option key={nationality} value={nationality}>
                                    {nationality}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={() => {
                                setUsersStatusFilter("all");
                                setUsersPaymentFilter("all");
                                setUsersMethodFilter("all");
                                setUsersTravelersFilter("all");
                                setUsersAmountFilter("all");
                                setUsersDepartureWindowFilter("all");
                                setUsersNationalityFilter("all");
                            }}
                            className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-md text-zinc-700 hover:bg-gray-50 transition shadow-sm cursor-pointer"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="mb-6 flex flex-wrap items-center gap-2.5">
                        <select
                            value={toursDestinationFilter}
                            onChange={(e) => setToursDestinationFilter(e.target.value)}
                            className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-355 rounded-md text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 shadow-sm"
                        >
                            <option value="all">All Destinations</option>
                            {destinationOptions.map((destination) => (
                                <option key={destination} value={destination}>
                                    {destination}
                                </option>
                            ))}
                        </select>

                        <select
                            value={toursAvailabilityFilter}
                            onChange={(e) => setToursAvailabilityFilter(e.target.value)}
                            className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-355 rounded-md text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 shadow-sm"
                        >
                            <option value="all">All Availability</option>
                            <option value="available">Has Available Spots</option>
                            <option value="soldout">Sold Out</option>
                            <option value="nearly-full">Nearly Full</option>
                        </select>

                        <select
                            value={toursPriceFilter}
                            onChange={(e) => setToursPriceFilter(e.target.value)}
                            className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-355 rounded-md text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 shadow-sm"
                        >
                            <option value="all">All Prices</option>
                            <option value="low">Under $1000</option>
                            <option value="mid">$1000 - $3000</option>
                            <option value="high">Above $3000</option>
                        </select>

                        <select
                            value={toursDurationFilter}
                            onChange={(e) => setToursDurationFilter(e.target.value)}
                            className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-355 rounded-md text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 shadow-sm"
                        >
                            <option value="all">All Durations</option>
                            <option value="short">Short (1-5 days)</option>
                            <option value="medium">Medium (6-10 days)</option>
                            <option value="long">Long (11+ days)</option>
                        </select>

                        <select
                            value={toursDeparturesFilter}
                            onChange={(e) => setToursDeparturesFilter(e.target.value)}
                            className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-355 rounded-md text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 shadow-sm"
                        >
                            <option value="all">All Departure Depth</option>
                            <option value="none">No Active Departures</option>
                            <option value="few">Few Active (1-3)</option>
                            <option value="many">Many Active (4+)</option>
                            <option value="upcoming-30">Has Departure in 30 Days</option>
                        </select>

                        <button
                            onClick={() => {
                                setToursDestinationFilter("all");
                                setToursAvailabilityFilter("all");
                                setToursPriceFilter("all");
                                setToursDurationFilter("all");
                                setToursDeparturesFilter("all");
                            }}
                            className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-md text-zinc-700 hover:bg-gray-50 transition shadow-sm cursor-pointer"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}

                {/* Lists view */}
                {activeView === "users" ? (
                    filteredUsersBookings.length === 0 ? (
                        <div className="bg-white rounded-md border border-gray-200 p-12 text-center shadow-sm">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-zinc-800 mb-2">No bookings found</h3>
                            <p className="text-gray-500 text-sm">Try adjusting your search query.</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-650 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-655 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-655 uppercase tracking-wider">Booking Ref</th>
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-655 uppercase tracking-wider">Tour</th>
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-655 uppercase tracking-wider">Departure</th>
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-655 uppercase tracking-wider">Travelers</th>
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-655 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-655 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-655 uppercase tracking-wider">Docs</th>
                                            <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-655 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedUsersBookings.map((booking) => (
                                            <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-semibold text-zinc-800">{booking.user?.name || "N/A"}</td>
                                                <td className="px-6 py-4 text-sm text-zinc-600">{booking.user?.email || "N/A"}</td>
                                                <td className="px-6 py-4 text-xs font-bold text-gray-500">#{booking.bookingReference}</td>
                                                <td className="px-6 py-4 text-sm text-zinc-700">{booking.tour?.name || "N/A"}</td>
                                                <td className="px-6 py-4 text-sm text-zinc-600">{formatDate(booking.startDate)}</td>
                                                <td className="px-6 py-4 text-sm text-zinc-600">{booking.numberOfTravelers}</td>
                                                <td className="px-6 py-4 text-sm font-semibold text-zinc-800">${booking.price?.totalPrice ?? 0}</td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${
                                                            booking.status === "confirmed"
                                                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                                : "bg-amber-50 text-amber-700 border-amber-100"
                                                        }`}
                                                    >
                                                        {booking.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {(booking as any).documentsSubmitted ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${(booking as any).documentsVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                                                {(booking as any).documentsVerified ? 'Verified' : 'Not Verified'}
                                                            </span>
                                                            <button
                                                                onClick={() => { setDocsModalBooking(booking); setDocsActiveTab(0); }}
                                                                className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors cursor-pointer"
                                                                title="View documents"
                                                            >
                                                                <FileText className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => setSelectedBookingDetails(booking)}
                                                        className="p-1.5 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition-colors border border-transparent hover:border-gray-200 shadow-none hover:shadow-sm cursor-pointer"
                                                        title="View booking"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-xs font-semibold text-gray-500">
                                    Showing {paginatedUsersBookings.length} of {filteredUsersBookings.length} bookings
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setUsersPage((prev) => Math.max(1, prev - 1))}
                                        disabled={safeUsersPage === 1}
                                        className="px-3 py-1.5 text-xs font-semibold rounded-md border border-gray-300 text-zinc-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
                                    >
                                        Prev
                                    </button>
                                    <span className="px-3 py-1.5 text-xs font-semibold text-zinc-600">
                                        Page {safeUsersPage} of {usersTotalPages}
                                    </span>
                                    <button
                                        onClick={() => setUsersPage((prev) => Math.min(usersTotalPages, prev + 1))}
                                        disabled={safeUsersPage === usersTotalPages}
                                        className="px-3 py-1.5 text-xs font-semibold rounded-md border border-gray-300 text-zinc-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )
                ) : filteredTours.length === 0 ? (
                    <div className="bg-white rounded-md border border-gray-200 p-12 text-center shadow-sm">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-zinc-800 mb-2">No tours found</h3>
                        <p className="text-gray-500 text-sm">Try adjusting your search query.</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-650 uppercase tracking-wider">Tour Name</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-655 uppercase tracking-wider">Country</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-655 uppercase tracking-wider">Departures</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-655 uppercase tracking-wider">Base Price</th>
                                        <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-655 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedTours.map((tour) => (
                                        <tr key={tour._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden relative border border-gray-200 flex-shrink-0 shadow-sm">
                                                        <Image
                                                            src={tour.images.find((img) => img.isPrimary)?.url || tour.images[0]?.url || "/placeholder-tour.jpg"}
                                                            alt=""
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-zinc-800">{tour.name}</div>
                                                        <p className="text-[10px] font-bold text-gray-500">{tour.tourCode}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700">
                                                {tour.country?.name || "Global"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                                                {tour.startDates.length} departures
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-zinc-800">
                                                ${tour.price.amount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button
                                                    onClick={() => handleTourClick(tour)}
                                                    className="px-2.5 py-1.5 text-xs font-semibold rounded-md border border-gray-300 text-zinc-700 hover:text-zinc-950 hover:bg-gray-50 shadow-sm transition-colors cursor-pointer bg-white"
                                                >
                                                    View Departures
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-xs font-semibold text-gray-500">
                                Showing {paginatedTours.length} of {filteredTours.length} tours
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setToursPage((prev) => Math.max(1, prev - 1))}
                                    disabled={safeToursPage === 1}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-md border border-gray-300 text-zinc-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
                                >
                                    Prev
                                </button>
                                <span className="px-3 py-1.5 text-xs font-semibold text-zinc-650">
                                    Page {safeToursPage} of {toursTotalPages}
                                </span>
                                <button
                                    onClick={() => setToursPage((prev) => Math.min(toursTotalPages, prev + 1))}
                                    disabled={safeToursPage === toursTotalPages}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-md border border-gray-300 text-zinc-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Modal 1: Dates (Check Availability Style) */}
            {isDatesModalOpen && selectedTour && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm" onClick={() => setIsDatesModalOpen(false)}></div>
                    <div className="relative bg-white rounded-md border border-gray-250 w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-lg flex flex-col animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-zinc-800 truncate max-w-xl">{selectedTour.name}</h2>
                                <p className="text-gray-500 text-xs mt-1">Select a departure date to manage guest bookings and hold spaces</p>
                            </div>
                            <button onClick={() => setIsDatesModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-md transition-colors cursor-pointer border-none">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        
                        {/* Table Style Dates List (Check Availability UI) */}
                        <div className="flex-1 overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="sticky top-0 z-10 bg-white">
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Departure Date</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Available Spots</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {selectedTour.startDates
                                        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                                        .map((date, idx) => {
                                            const isSoldOut = date.availableSpots === 0 || !date.isActive;
                                            return (
                                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold text-zinc-850">
                                                                {new Date(date.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                            </span>
                                                            <span className="text-xs text-gray-500 mt-1">
                                                                Ends: {new Date(date.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {isSoldOut ? (
                                                            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md border bg-red-50 text-red-700 border-red-100">Sold Out</span>
                                                        ) : (
                                                            <span className="text-sm text-zinc-700 font-semibold">{date.availableSpots} remaining</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-semibold text-zinc-800">${selectedTour.price.amount}</div>
                                                        {date.discount && <div className="text-xs text-emerald-700 font-semibold mt-1">Discount active</div>}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2.5">
                                                            <button 
                                                                onClick={() => handleViewHolds(date.startDate)}
                                                                className="px-3 py-1.5 text-xs font-semibold rounded-md border border-gray-300 text-zinc-700 hover:bg-gray-50 transition bg-white shadow-sm cursor-pointer"
                                                            >
                                                                View Holds
                                                            </button>
                                                            <button 
                                                                onClick={() => handleViewBookings(date.startDate)}
                                                                className="px-3 py-1.5 text-xs font-semibold rounded-md bg-zinc-900 border border-zinc-900 text-white hover:bg-zinc-800 transition shadow-sm cursor-pointer"
                                                            >
                                                                View Bookings
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal 2: Bookings or Holds List */}
            {isBookingsModalOpen && selectedDate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm" onClick={() => setIsBookingsModalOpen(false)}></div>
                    <div className="relative bg-white rounded-md border border-gray-250 w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-lg flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-200">
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-start bg-gray-50/50">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2.5 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-700 text-[10px] font-bold uppercase rounded-md">
                                        {bookingsTableType}
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold text-zinc-850">{formatDate(selectedDate)}</h2>
                                <p className="text-gray-500 text-xs mt-1">{selectedTour?.name}</p>
                            </div>
                            <button onClick={() => setIsBookingsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-md transition-colors mt-1 cursor-pointer border-none">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* List Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {loadingBookings ? (
                                <div className="h-64 flex flex-col items-center justify-center">
                                    <div className="w-8 h-8 border-4 border-zinc-350 border-t-zinc-900 rounded-full animate-spin"></div>
                                    <p className="mt-4 text-xs font-semibold text-zinc-500 animate-pulse">Gathering records...</p>
                                </div>
                            ) : bookingsTableType === "bookings" ? (
                                bookings.length === 0 ? (
                                    <div className="bg-white rounded-md border border-gray-200 p-12 text-center shadow-inner">
                                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-zinc-550 text-sm font-semibold">No guest records found</p>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Guest</th>
                                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking Ref</th>
                                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Travelers</th>
                                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {bookings.map((booking) => (
                                                    <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4 text-sm font-semibold text-zinc-800">{booking.user.name}</td>
                                                        <td className="px-6 py-4 text-xs font-bold text-gray-550">#{booking.bookingReference}</td>
                                                        <td className="px-6 py-4 text-sm text-zinc-650">{booking.numberOfTravelers}</td>
                                                        <td className="px-6 py-4 text-sm font-semibold text-zinc-805">${booking.price.totalPrice}</td>
                                                        <td className="px-6 py-4 text-sm text-zinc-600 capitalize">{booking.payment.status}</td>
                                                        <td className="px-6 py-4">
                                                            <span
                                                                className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${
                                                                    booking.status === "confirmed"
                                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                                        : "bg-amber-50 text-amber-700 border-amber-100"
                                                                }`}
                                                            >
                                                                {booking.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => setSelectedBookingDetails(booking)}
                                                                className="p-1.5 text-zinc-550 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition-colors border border-transparent hover:border-gray-200 shadow-none hover:shadow-sm cursor-pointer"
                                                                title="View booking"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            ) : (
                                holds.length === 0 ? (
                                    <div className="bg-white rounded-md border border-gray-200 p-12 text-center shadow-inner">
                                        <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-zinc-550 text-sm font-semibold">No active hold spaces</p>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Guest</th>
                                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Expires At</th>
                                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Held On</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {holds.map((hold) => (
                                                    <tr key={hold._id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4 text-sm font-semibold text-zinc-800">{hold.user.name}</td>
                                                        <td className="px-6 py-4 text-sm text-zinc-600">{hold.user.email}</td>
                                                        <td className="px-6 py-4">
                                                            <span
                                                                className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${
                                                                    hold.status === "active"
                                                                        ? "bg-amber-50 text-amber-700 border-amber-100"
                                                                        : "bg-zinc-100 text-zinc-800 border-zinc-200"
                                                                }`}
                                                            >
                                                                {hold.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-zinc-650">
                                                            {new Date(hold.expiresAt).toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-zinc-600">
                                                            {new Date(hold.startDate).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal 3: Booking Details (Profile Style) */}
            {selectedBookingDetails && (
                <BookingDetailsModal 
                    booking={selectedBookingDetails} 
                    onClose={() => setSelectedBookingDetails(null)} 
                />
            )}

            {/* Modal: Docs Verification */}
            {docsModalBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDocsModalBooking(null)} />
                    <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-zinc-800 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-purple-600" />
                                    Document Verification
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    #{docsModalBooking.bookingReference} • {docsModalBooking.tour?.name || 'Tour'}
                                </p>
                            </div>
                            <button onClick={() => setDocsModalBooking(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Traveller Tabs */}
                        <div className="px-6 pt-4 pb-0 border-b border-gray-100">
                            <div className="flex gap-2 overflow-x-auto">
                                {(docsModalBooking.travelers || []).map((t: any, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setDocsActiveTab(i)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium whitespace-nowrap transition border-b-2 ${
                                            docsActiveTab === i
                                                ? 'border-purple-600 text-purple-700 bg-purple-50/50'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className={`w-7 h-7 rounded-full ${i === 0 ? 'bg-zinc-800' : 'bg-teal-700'} text-white flex items-center justify-center text-xs font-bold`}>
                                            {t.firstName?.charAt(0)?.toUpperCase() || 'T'}
                                        </span>
                                        {t.firstName} {t.lastName}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Docs Content */}
                        <div className="p-6 overflow-y-auto flex-1">
                            {(() => {
                                const travelerDoc = docsModalBooking.travelerDocuments?.find((d: any) => d.travelerIndex === docsActiveTab);
                                if (!travelerDoc) {
                                    return (
                                        <div className="text-center py-12">
                                            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 text-sm">No documents submitted for this traveller.</p>
                                        </div>
                                    );
                                }

                                const docTypes = [
                                    { key: 'passport', label: 'Passport', icon: '🛂' },
                                    { key: 'visa', label: 'Visa', icon: '📋' },
                                    { key: 'medicalCertificate', label: 'Medical Certificate / Vaccination', icon: '💉' },
                                    { key: 'insurance', label: 'Insurance Details', icon: '🛡️' },
                                ];

                                return (
                                    <div className="space-y-4">
                                        {docTypes.map(dt => {
                                            const doc = travelerDoc[dt.key];
                                            if (!doc || !doc.url) return null;
                                            const isToggling = togglingDoc === `${docsActiveTab}-${dt.key}`;

                                            return (
                                                <div key={dt.key} className={`border rounded-xl p-4 flex items-center justify-between gap-4 ${doc.verified ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <span className="text-lg">{dt.icon}</span>
                                                        <div className="min-w-0">
                                                            <h4 className="font-medium text-zinc-800 text-sm">{dt.label}</h4>
                                                            <p className="text-xs text-gray-500 truncate">{doc.fileName}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 flex-shrink-0">
                                                        <a
                                                            href={doc.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-purple-600 hover:text-purple-800 text-xs font-medium flex items-center gap-1"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" /> View PDF
                                                        </a>
                                                        <button
                                                            onClick={() => handleToggleVerification(docsModalBooking._id, docsActiveTab, dt.key)}
                                                            disabled={isToggling}
                                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border cursor-pointer ${
                                                                doc.verified
                                                                    ? 'bg-green-100 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                                                                    : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200'
                                                            } disabled:opacity-50`}
                                                        >
                                                            {isToggling ? (
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                            ) : doc.verified ? (
                                                                <><CheckCircle2 className="w-3 h-3" /> Verified</>
                                                            ) : (
                                                                <><XCircle className="w-3 h-3" /> Not Verified</>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                                {docsModalBooking.documentsVerified ? (
                                    <span className="flex items-center gap-1 text-green-600 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> All documents verified</span>
                                ) : (
                                    <span className="flex items-center gap-1 text-amber-600 font-semibold"><XCircle className="w-3.5 h-3.5" /> Verification incomplete</span>
                                )}
                            </div>
                            <button
                                onClick={() => setDocsModalBooking(null)}
                                className="px-4 py-2 text-sm font-semibold text-zinc-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
