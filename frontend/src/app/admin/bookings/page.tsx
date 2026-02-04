"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
        fetchTours();
    }, []);

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
                return "bg-green-50 text-green-700";
            case "pending":
                return "bg-yellow-50 text-yellow-700";
            case "cancelled":
                return "bg-red-50 text-red-700";
            case "completed":
                return "bg-blue-50 text-blue-700";
            case "no_show":
                return "bg-gray-100 text-gray-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case "paid":
                return "bg-green-50 text-green-700";
            case "pending":
                return "bg-yellow-50 text-yellow-700";
            case "refunded":
                return "bg-purple-50 text-purple-700";
            case "failed":
                return "bg-red-50 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
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
            <div className="min-h-screen bg-gray-50">
                {/* Page Header Skeleton */}
                <div className="bg-white border-b border-gray-200">
                    <div className="px-8 py-6">
                        <div className="h-7 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                    </div>
                </div>
                {/* Content Skeleton */}
                <div className="p-8">
                    <div className="bg-white rounded-xl border border-gray-200 animate-pulse">
                        <div className="p-4 border-b border-gray-100">
                            <div className="h-10 bg-gray-200 rounded-lg w-64"></div>
                        </div>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="p-4 border-b border-gray-100 flex items-center gap-4">
                                <div className="w-16 h-12 bg-gray-200 rounded-lg"></div>
                                <div className="h-5 bg-gray-200 rounded w-48"></div>
                                <div className="h-5 bg-gray-200 rounded w-24"></div>
                                <div className="flex-1"></div>
                                <div className="h-8 bg-gray-200 rounded w-28"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="px-8 py-6">
                    <div className="flex items-center gap-4">
                        {viewMode === "bookings" && (
                            <button
                                onClick={handleBackToTours}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <svg
                                    className="w-5 h-5 text-gray-600"
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
                            <h1 className="text-2xl font-bold text-gray-900">
                                {viewMode === "tours" ? "Bookings Management" : `Bookings: ${selectedTour?.name}`}
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">
                                {viewMode === "tours"
                                    ? "Select a tour to view and manage its bookings"
                                    : `Manage all bookings for this tour`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-8">     {/* Back to Admin */}
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
