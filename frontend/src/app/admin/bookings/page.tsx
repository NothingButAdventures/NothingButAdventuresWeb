"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Image from "next/image";

interface Tour {
    _id: string;
    name: string;
    slug: string;
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
    }>;
}

interface Booking {
    _id: string;
    tour: {
        _id: string;
        name: string;
        slug: string;
    };
    user: {
        _id: string;
        name: string;
        email: string;
    };
    startDate: string;
    numberOfTravelers: number;
    travelers: Array<{
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
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
    };
    status: string;
    bookingReference: string;
    createdAt: string;
}

type ViewMode = "tours" | "bookings";

export default function BookingsManagementPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [tours, setTours] = useState<Tour[]>([]);
    const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("tours");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

    useEffect(() => {
        checkAuthAndFetchTours();
    }, []);

    const checkAuthAndFetchTours = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/auth/login");
                return;
            }

            // Check if user is admin
            const authResponse = await fetch(`${api.baseURL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!authResponse.ok) {
                router.push("/auth/login");
                return;
            }

            const authData = await authResponse.json();

            if (authData.data.user.role !== "admin") {
                router.push("/dashboard");
                return;
            }

            // Fetch all tours
            const toursResponse = await fetch(`${api.baseURL}/tours`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (toursResponse.ok) {
                const toursData = await toursResponse.json();
                setTours(toursData.data.tours);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBookingsForTour = async (tour: Tour) => {
        try {
            setLoadingBookings(true);
            const token = localStorage.getItem("token");

            const response = await fetch(`${api.baseURL}/bookings?tour=${tour._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setBookings(data.data.bookings || []);
            } else {
                // If no bookings exist, just set empty array
                setBookings([]);
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
            setBookings([]);
        } finally {
            setLoadingBookings(false);
        }
    };

    const handleTourSelect = (tour: Tour) => {
        setSelectedTour(tour);
        setViewMode("bookings");
        fetchBookingsForTour(tour);
    };

    const handleBackToTours = () => {
        setSelectedTour(null);
        setViewMode("tours");
        setBookings([]);
    };

    const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
        try {
            setUpdatingStatus(bookingId);
            const token = localStorage.getItem("token");

            const response = await fetch(`${api.baseURL}/bookings/${bookingId}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                // Update local state
                setBookings((prev) =>
                    prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
                );
            } else {
                const data = await response.json();
                alert(`Failed to update status: ${data.message}`);
            }
        } catch (error) {
            console.error("Error updating booking status:", error);
            alert("Failed to update booking status");
        } finally {
            setUpdatingStatus(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatPrice = (amount: number, currency: string = "USD") => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "confirmed":
                return "bg-green-100 text-green-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            case "completed":
                return "bg-blue-100 text-blue-800";
            case "no_show":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case "paid":
                return "bg-green-100 text-green-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "refunded":
                return "bg-purple-100 text-purple-800";
            case "failed":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // Filter tours based on search
    const filteredTours = tours.filter((tour) =>
        tour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.country?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter bookings based on status
    const filteredBookings = statusFilter === "all"
        ? bookings
        : bookings.filter((b) => b.status === statusFilter);

    // Calculate stats for selected tour
    const bookingStats = {
        total: bookings.length,
        confirmed: bookings.filter((b) => b.status === "confirmed").length,
        pending: bookings.filter((b) => b.status === "pending").length,
        cancelled: bookings.filter((b) => b.status === "cancelled").length,
        totalRevenue: bookings
            .filter((b) => b.status !== "cancelled")
            .reduce((sum, b) => sum + (b.price?.totalPrice || 0), 0),
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        {viewMode === "bookings" && (
                            <button
                                onClick={handleBackToTours}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <svg
                                    className="w-6 h-6 text-gray-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                    />
                                </svg>
                            </button>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {viewMode === "tours" ? "Bookings Management" : `Bookings for ${selectedTour?.name}`}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {viewMode === "tours"
                                    ? "Select a tour to view and manage its bookings"
                                    : `Manage all bookings for this tour`}
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    {viewMode === "tours" && (
                        <div className="mt-6">
                            <div className="relative max-w-md">
                                <input
                                    type="text"
                                    placeholder="Search tours by name or country..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <svg
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tours List View */}
                {viewMode === "tours" && (
                    <>
                        {filteredTours.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                <svg
                                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                    />
                                </svg>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    No tours found
                                </h3>
                                <p className="text-gray-600">
                                    {searchTerm ? "Try a different search term" : "Create tours first to manage bookings"}
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Tour
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Country
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Duration
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Price
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Upcoming Dates
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredTours.map((tour) => {
                                            const primaryImage = tour.images?.find((img) => img.isPrimary) || tour.images?.[0];
                                            const upcomingDates = tour.startDates?.filter(
                                                (d) => d.isActive && new Date(d.startDate) > new Date()
                                            ).length || 0;

                                            return (
                                                <tr
                                                    key={tour._id}
                                                    className="hover:bg-gray-50 cursor-pointer transition"
                                                    onClick={() => handleTourSelect(tour)}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                                {primaryImage?.url ? (
                                                                    <Image
                                                                        src={primaryImage.url}
                                                                        alt={tour.name}
                                                                        width={64}
                                                                        height={48}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-xl">
                                                                        🏔️
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-semibold text-gray-900">
                                                                    {tour.name}
                                                                </div>
                                                                <div className="text-xs text-gray-500 truncate max-w-xs">
                                                                    {tour.summary}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {tour.country?.name || "N/A"}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {tour.duration.days} days
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {formatPrice(tour.price.amount, tour.price.currency)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${upcomingDates > 0
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-gray-100 text-gray-600"
                                                            }`}>
                                                            {upcomingDates} upcoming
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <button
                                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 ml-auto"
                                                        >
                                                            View Bookings
                                                            <svg
                                                                className="w-4 h-4"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M9 5l7 7-7 7"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* Bookings View for Selected Tour */}
                {viewMode === "bookings" && selectedTour && (
                    <>
                        {/* Tour Info Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                            <div className="flex items-start gap-6">
                                <div className="w-24 h-24 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                    {selectedTour.images?.[0]?.url ? (
                                        <Image
                                            src={selectedTour.images[0].url}
                                            alt={selectedTour.name}
                                            width={96}
                                            height={96}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl">
                                            🏔️
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-gray-900">{selectedTour.name}</h2>
                                    <p className="text-gray-600 mt-1">{selectedTour.summary}</p>
                                    <div className="flex items-center gap-4 mt-3">
                                        <span className="text-sm text-gray-500">
                                            📍 {selectedTour.country?.name}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            📅 {selectedTour.duration.days} days
                                        </span>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {formatPrice(selectedTour.price.amount, selectedTour.price.currency)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="text-sm text-gray-500">Total Bookings</div>
                                <div className="text-2xl font-bold text-gray-900">{bookingStats.total}</div>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="text-sm text-gray-500">Confirmed</div>
                                <div className="text-2xl font-bold text-green-600">{bookingStats.confirmed}</div>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="text-sm text-gray-500">Pending</div>
                                <div className="text-2xl font-bold text-yellow-600">{bookingStats.pending}</div>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="text-sm text-gray-500">Cancelled</div>
                                <div className="text-2xl font-bold text-red-600">{bookingStats.cancelled}</div>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="text-sm text-gray-500">Total Revenue</div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {formatPrice(bookingStats.totalRevenue)}
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="text-sm text-gray-600">Filter by status:</div>
                            <div className="flex gap-2">
                                {["all", "pending", "confirmed", "cancelled", "completed"].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${statusFilter === status
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Bookings Table */}
                        {loadingBookings ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Loading bookings...</p>
                            </div>
                        ) : filteredBookings.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                <svg
                                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    No bookings found
                                </h3>
                                <p className="text-gray-600">
                                    {statusFilter !== "all"
                                        ? `No ${statusFilter} bookings for this tour`
                                        : "No bookings have been made for this tour yet"}
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Booking Ref
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Customer
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Travel Date
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Travellers
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Total
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Payment
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredBookings.map((booking) => (
                                            <tr key={booking._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-mono font-semibold text-gray-900">
                                                        {booking.bookingReference}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {formatDate(booking.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {booking.user?.name || "N/A"}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {booking.user?.email || "N/A"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {formatDate(booking.startDate)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {booking.numberOfTravelers} {booking.numberOfTravelers === 1 ? "person" : "people"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {formatPrice(booking.price?.totalPrice || 0, booking.price?.currency)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                                                            booking.payment?.status || "pending"
                                                        )}`}
                                                    >
                                                        {booking.payment?.status || "pending"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                                            booking.status
                                                        )}`}
                                                    >
                                                        {booking.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <select
                                                            value={booking.status}
                                                            onChange={(e) => handleUpdateBookingStatus(booking._id, e.target.value)}
                                                            disabled={updatingStatus === booking._id}
                                                            className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="confirmed">Confirmed</option>
                                                            <option value="cancelled">Cancelled</option>
                                                            <option value="completed">Completed</option>
                                                            <option value="no_show">No Show</option>
                                                        </select>
                                                        <button
                                                            onClick={() => {
                                                                // View booking details - could open a modal
                                                                alert(`Booking Details:\n\nRef: ${booking.bookingReference}\nCustomer: ${booking.user?.name}\nEmail: ${booking.user?.email}\nTravellers: ${booking.numberOfTravelers}\nDate: ${formatDate(booking.startDate)}\nTotal: ${formatPrice(booking.price?.totalPrice || 0)}\nStatus: ${booking.status}\nPayment: ${booking.payment?.status || 'pending'}`);
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                                        >
                                                            <svg
                                                                className="w-5 h-5"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* Back to Admin */}
                <div className="mt-6">
                    <Link
                        href="/admin"
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Back to Admin Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
