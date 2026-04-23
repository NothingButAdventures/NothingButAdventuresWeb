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
    Lock
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
            // Assuming endpoint for holds by tour and date
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

    const handleTourClick = (tour: Tour) => {
        setSelectedTour(tour);
        setIsDatesModalOpen(true);
    };

    const handleViewBookings = (date: string) => {
        setSelectedDate(date);
        setBookingsTableType("bookings");
        setIsBookingsModalOpen(true);
        if (selectedTour) fetchBookingsForDate(selectedTour._id, date);
    };

    const handleViewHolds = (date: string) => {
        setSelectedDate(date);
        setBookingsTableType("holds");
        setIsBookingsModalOpen(true);
        if (selectedTour) fetchHoldsForDate(selectedTour._id, date);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    const destinationOptions = Array.from(
        new Set(tours.map((tour) => tour.country?.name).filter(Boolean) as string[])
    ).sort((a, b) => a.localeCompare(b));

    const paymentMethodOptions = Array.from(
        new Set(
            allBookings
                .map((booking) => booking.payment?.method)
                .filter((method): method is string => Boolean(method))
        )
    ).sort((a, b) => a.localeCompare(b));

    const nationalityOptions = Array.from(
        new Set(
            allBookings
                .map((booking) => booking.user?.nationality)
                .filter((nationality): nationality is string => Boolean(nationality))
        )
    ).sort((a, b) => a.localeCompare(b));

    const filteredTours = tours.filter((tour) => {
        const query = searchTerm.toLowerCase();
        const matchesSearch =
            tour.name.toLowerCase().includes(query) ||
            tour.country?.name?.toLowerCase().includes(query);

        const activeDates = tour.startDates.filter((date) => date.isActive);
        const activeDeparturesCount = activeDates.length;
        const totalAvailableSpots = activeDates.reduce((sum, date) => sum + (date.availableSpots || 0), 0);
        const hasAvailableDeparture = totalAvailableSpots > 0;
        const hasAnyDeparture = tour.startDates.length > 0;
        const now = new Date();
        const in30Days = new Date();
        in30Days.setDate(in30Days.getDate() + 30);
        const hasUpcoming30Days = activeDates.some((date) => {
            const start = new Date(date.startDate);
            return start >= now && start <= in30Days;
        });
        const isNearlyFull = hasAvailableDeparture && totalAvailableSpots <= Math.max(10, activeDeparturesCount * 3);

        const matchesDestination =
            toursDestinationFilter === "all" ||
            tour.country?.name === toursDestinationFilter;

        const matchesAvailability =
            toursAvailabilityFilter === "all" ||
            (toursAvailabilityFilter === "available" && hasAvailableDeparture) ||
            (toursAvailabilityFilter === "soldout" && hasAnyDeparture && !hasAvailableDeparture) ||
            (toursAvailabilityFilter === "nearly-full" && isNearlyFull);

        const matchesPrice =
            toursPriceFilter === "all" ||
            (toursPriceFilter === "low" && tour.price.amount < 1000) ||
            (toursPriceFilter === "mid" && tour.price.amount >= 1000 && tour.price.amount <= 3000) ||
            (toursPriceFilter === "high" && tour.price.amount > 3000);

        const days = tour.duration?.days || 0;
        const matchesDuration =
            toursDurationFilter === "all" ||
            (toursDurationFilter === "short" && days > 0 && days <= 5) ||
            (toursDurationFilter === "medium" && days >= 6 && days <= 10) ||
            (toursDurationFilter === "long" && days >= 11);

        const matchesDepartures =
            toursDeparturesFilter === "all" ||
            (toursDeparturesFilter === "none" && activeDeparturesCount === 0) ||
            (toursDeparturesFilter === "few" && activeDeparturesCount >= 1 && activeDeparturesCount <= 3) ||
            (toursDeparturesFilter === "many" && activeDeparturesCount >= 4) ||
            (toursDeparturesFilter === "upcoming-30" && hasUpcoming30Days);

        return (
            matchesSearch &&
            matchesDestination &&
            matchesAvailability &&
            matchesPrice &&
            matchesDuration &&
            matchesDepartures
        );
    });

    const filteredUsersBookings = allBookings.filter((booking) => {
        const query = searchTerm.toLowerCase();

        const matchesSearch = (
            booking.user?.name?.toLowerCase().includes(query) ||
            booking.user?.email?.toLowerCase().includes(query) ||
            booking.bookingReference?.toLowerCase().includes(query) ||
            booking.tour?.name?.toLowerCase().includes(query)
        );

        const matchesStatus =
            usersStatusFilter === "all" ||
            booking.status === usersStatusFilter;

        const matchesPayment =
            usersPaymentFilter === "all" ||
            booking.payment?.status === usersPaymentFilter;

        const matchesPaymentMethod =
            usersMethodFilter === "all" ||
            booking.payment?.method === usersMethodFilter;

        const travelers = booking.numberOfTravelers || 0;
        const matchesTravelers =
            usersTravelersFilter === "all" ||
            (usersTravelersFilter === "solo" && travelers === 1) ||
            (usersTravelersFilter === "small-group" && travelers >= 2 && travelers <= 4) ||
            (usersTravelersFilter === "large-group" && travelers >= 5);

        const amount = booking.price?.totalPrice ?? 0;
        const matchesAmount =
            usersAmountFilter === "all" ||
            (usersAmountFilter === "budget" && amount < 1000) ||
            (usersAmountFilter === "mid" && amount >= 1000 && amount <= 2500) ||
            (usersAmountFilter === "premium" && amount > 2500);

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
                    <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-500 font-medium">Initialising management console...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="px-8 py-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Manage users, tours, departures and guest reservations
                        </p>
                    </div>
                    <Link
                        href="/admin"
                        className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-medium py-2.5 px-4 rounded-lg transition flex items-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        Close
                    </Link>
                </div>
            </div>

            <div className="p-8">
                <div className="mb-4 inline-flex items-center p-1 rounded-lg border border-gray-200 bg-white">
                    <button
                        onClick={() => setActiveView("users")}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            activeView === "users"
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                    >
                        Users View
                    </button>
                    <button
                        onClick={() => setActiveView("tours")}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            activeView === "tours"
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                    >
                        Tours View
                    </button>
                </div>

                <div className="mb-6 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder={activeView === "users" ? "Search users, email, booking ref or tour..." : "Search tours or countries..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                        />
                        <Search
                            className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                        />
                    </div>
                </div>

                {activeView === "users" ? (
                    <div className="mb-6 flex flex-wrap items-center gap-3">
                        <select
                            value={usersStatusFilter}
                            onChange={(e) => setUsersStatusFilter(e.target.value)}
                            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                            <option value="all">All Group Sizes</option>
                            <option value="solo">Solo (1)</option>
                            <option value="small-group">Small Group (2-4)</option>
                            <option value="large-group">Large Group (5+)</option>
                        </select>

                        <select
                            value={usersMethodFilter}
                            onChange={(e) => setUsersMethodFilter(e.target.value)}
                            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                            <option value="all">All Amount Bands</option>
                            <option value="budget">Under $1000</option>
                            <option value="mid">$1000 - $2500</option>
                            <option value="premium">Above $2500</option>
                        </select>

                        <select
                            value={usersDepartureWindowFilter}
                            onChange={(e) => setUsersDepartureWindowFilter(e.target.value)}
                            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="mb-6 flex flex-wrap items-center gap-3">
                        <select
                            value={toursDestinationFilter}
                            onChange={(e) => setToursDestinationFilter(e.target.value)}
                            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                            <option value="all">All Availability</option>
                            <option value="available">Has Available Spots</option>
                            <option value="soldout">Sold Out</option>
                            <option value="nearly-full">Nearly Full</option>
                        </select>

                        <select
                            value={toursPriceFilter}
                            onChange={(e) => setToursPriceFilter(e.target.value)}
                            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                            <option value="all">All Prices</option>
                            <option value="low">Under $1000</option>
                            <option value="mid">$1000 - $3000</option>
                            <option value="high">Above $3000</option>
                        </select>

                        <select
                            value={toursDurationFilter}
                            onChange={(e) => setToursDurationFilter(e.target.value)}
                            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                            <option value="all">All Durations</option>
                            <option value="short">Short (1-5 days)</option>
                            <option value="medium">Medium (6-10 days)</option>
                            <option value="long">Long (11+ days)</option>
                        </select>

                        <select
                            value={toursDeparturesFilter}
                            onChange={(e) => setToursDeparturesFilter(e.target.value)}
                            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}

                {activeView === "users" ? (
                    filteredUsersBookings.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
                            <p className="text-gray-500">Try adjusting your search query.</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Booking Ref</th>
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tour</th>
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Departure</th>
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Travelers</th>
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {paginatedUsersBookings.map((booking) => (
                                            <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-900">{booking.user?.name || "N/A"}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{booking.user?.email || "N/A"}</td>
                                                <td className="px-6 py-4 text-xs font-medium text-gray-600">#{booking.bookingReference}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{booking.tour?.name || "N/A"}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{formatDate(booking.startDate)}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{booking.numberOfTravelers}</td>
                                                <td className="px-6 py-4 text-sm font-semibold text-gray-900">${booking.price?.totalPrice ?? 0}</td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                                                            booking.status === "confirmed"
                                                                ? "bg-green-50 text-green-700"
                                                                : "bg-orange-50 text-orange-700"
                                                        }`}
                                                    >
                                                        {booking.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => setSelectedBookingDetails(booking)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                                <p className="text-sm text-gray-500">
                                    Showing {paginatedUsersBookings.length} of {filteredUsersBookings.length} bookings
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setUsersPage((prev) => Math.max(1, prev - 1))}
                                        disabled={safeUsersPage === 1}
                                        className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Prev
                                    </button>
                                    <span className="px-3 py-2 text-sm text-gray-600">
                                        Page {safeUsersPage} of {usersTotalPages}
                                    </span>
                                    <button
                                        onClick={() => setUsersPage((prev) => Math.min(usersTotalPages, prev + 1))}
                                        disabled={safeUsersPage === usersTotalPages}
                                        className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )
                ) : filteredTours.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No tours found</h3>
                        <p className="text-gray-500">Try adjusting your search query.</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tour Name</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Country</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Departures</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Base Price</th>
                                        <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {paginatedTours.map((tour) => (
                                        <tr key={tour._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden relative border border-gray-100 flex-shrink-0">
                                                        <Image
                                                            src={tour.images.find((img) => img.isPrimary)?.url || tour.images[0]?.url || "/placeholder-tour.jpg"}
                                                            alt=""
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{tour.name}</div>
                                                        <p className="text-xs text-gray-500">{tour.tourCode}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {tour.country?.name || "Global"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {tour.startDates.length}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                ${tour.price.amount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button
                                                    onClick={() => handleTourClick(tour)}
                                                    className="px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-gray-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors"
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
                            <p className="text-sm text-gray-500">
                                Showing {paginatedTours.length} of {filteredTours.length} tours
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setToursPage((prev) => Math.max(1, prev - 1))}
                                    disabled={safeToursPage === 1}
                                    className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Prev
                                </button>
                                <span className="px-3 py-2 text-sm text-gray-600">
                                    Page {safeToursPage} of {toursTotalPages}
                                </span>
                                <button
                                    onClick={() => setToursPage((prev) => Math.min(toursTotalPages, prev + 1))}
                                    disabled={safeToursPage === toursTotalPages}
                                    className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setIsDatesModalOpen(false)}></div>
                    <div className="relative bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/40">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 truncate max-w-xl">{selectedTour.name}</h2>
                                <p className="text-gray-500 text-sm mt-1">Select a departure date to manage guest bookings and hold spaces</p>
                            </div>
                            <button onClick={() => setIsDatesModalOpen(false)} className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        
                        {/* Table Style Dates List (Check Availability UI) */}
                        <div className="flex-1 overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="sticky top-0 z-10 bg-white">
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Departure Date</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Available Spots</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {selectedTour.startDates
                                        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                                        .map((date, idx) => {
                                            const isSoldOut = date.availableSpots === 0 || !date.isActive;
                                            return (
                                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {new Date(date.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                            </span>
                                                            <span className="text-xs text-gray-500 mt-1">
                                                                Ends: {new Date(date.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {isSoldOut ? (
                                                            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-50 text-red-700">Sold Out</span>
                                                        ) : (
                                                            <span className="text-sm text-gray-700">{date.availableSpots} remaining</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-semibold text-gray-900">${selectedTour.price.amount}</div>
                                                        {date.discount && <div className="text-xs text-green-600 mt-1">Discount active</div>}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-3">
                                                            <button 
                                                                onClick={() => handleViewHolds(date.startDate)}
                                                                className="px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition-colors"
                                                            >
                                                                View Holds
                                                            </button>
                                                            <button 
                                                                onClick={() => handleViewBookings(date.startDate)}
                                                                className="px-3 py-2 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
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
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-md" onClick={() => setIsBookingsModalOpen(false)}></div>
                    <div className="relative bg-white rounded-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-500">
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium uppercase rounded-full">
                                        {bookingsTableType}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">{formatDate(selectedDate)}</h2>
                                <p className="text-gray-500 text-sm mt-1">{selectedTour?.name}</p>
                            </div>
                            <button onClick={() => setIsBookingsModalOpen(false)} className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors mt-1">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* List Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {loadingBookings ? (
                                <div className="h-64 flex flex-col items-center justify-center">
                                    <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                                    <p className="mt-4 text-sm text-gray-500">Gathering records...</p>
                                </div>
                            ) : bookingsTableType === "bookings" ? (
                                bookings.length === 0 ? (
                                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">No guest records found</p>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Guest</th>
                                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Booking Ref</th>
                                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Travelers</th>
                                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-100">
                                                {bookings.map((booking) => (
                                                    <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 text-sm text-gray-900">{booking.user.name}</td>
                                                        <td className="px-6 py-4 text-xs font-medium text-gray-600">#{booking.bookingReference}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-700">{booking.numberOfTravelers}</td>
                                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">${booking.price.totalPrice}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-700 capitalize">{booking.payment.status}</td>
                                                        <td className="px-6 py-4">
                                                            <span
                                                                className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                                                                    booking.status === "confirmed"
                                                                        ? "bg-green-50 text-green-700"
                                                                        : "bg-orange-50 text-orange-700"
                                                                }`}
                                                            >
                                                                {booking.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => setSelectedBookingDetails(booking)}
                                                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                                        <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">No active hold spaces</p>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Guest</th>
                                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expires At</th>
                                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Held On</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-100">
                                                {holds.map((hold) => (
                                                    <tr key={hold._id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 text-sm text-gray-900">{hold.user.name}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-700">{hold.user.email}</td>
                                                        <td className="px-6 py-4">
                                                            <span
                                                                className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                                                                    hold.status === "active"
                                                                        ? "bg-orange-50 text-orange-700"
                                                                        : "bg-gray-100 text-gray-700"
                                                                }`}
                                                            >
                                                                {hold.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-700">
                                                            {new Date(hold.expiresAt).toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-700">
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
        </div>
    );
}
