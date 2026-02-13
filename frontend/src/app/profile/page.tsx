"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase";
import { api } from "@/lib/api";
import BookingDetailsModal from "@/components/BookingDetailsModal";

// Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const BUCKET_NAME = "user-images";

// Types
interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    phone?: string;
    dateOfBirth?: string;
    nationality?: string;
    preferences?: {
        activityLevel?: string;
        budgetRange?: { min: number; max: number };
        interests?: string[];
    };
    createdAt: string;
}

interface Booking {
    _id: string;
    bookingReference: string;
    status: string;
    startDate: string;
    numberOfTravelers: number;
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
        transactions?: Array<{
            transactionId: string;
            amount: number;
            paymentDate: string;
        }>;
    };
    travelers: Array<{
        firstName: string;
        lastName: string;
        email?: string;
        phone?: string;
    }>;
    extras?: {
        activities?: Array<{
            name: string;
            price: number;
            count: number;
        }>;
        accommodationUpgrade?: {
            name: string;
            price: number;
            count: number;
        };
    };
    tour: {
        _id: string;
        name: string;
        slug: string;
        images?: Array<{ url: string; caption?: string; isPrimary?: boolean }>;
        duration?: {
            days: number;
            nights: number;
        };
        location?: {
            startCity: string;
            endCity: string;
        };
        price?: {
            amount: number;
            currency: string;
        };
    };
    createdAt: string;
}

interface Review {
    _id: string;
    rating: number;
    review: string;
    createdAt: string;
    tour: {
        _id: string;
        name: string;
        slug: string;
    };
}



// Helper function
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [holdSpaces, setHoldSpaces] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "reviews" | "hold spaces" | "settings">("overview");
    const [releasingHold, setReleasingHold] = useState<string | null>(null);

    // Edit mode
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: "",
        phone: "",
        dateOfBirth: "",
        nationality: "",
    });
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // Password change state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [changingPassword, setChangingPassword] = useState(false);

    // Booking details modal state
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    // Countdown tick for real-time timer
    const [, setCountdownTick] = useState(0);

    useEffect(() => {
        fetchUserData();
    }, []);

    // Real-time countdown timer - ticks every second when on hold spaces tab
    useEffect(() => {
        if (activeTab !== "hold spaces") return;

        const interval = setInterval(() => {
            setCountdownTick(prev => prev + 1);

            // Auto-expire holds locally
            setHoldSpaces(prev => prev.map(h => {
                if (h.status === 'active' && new Date(h.expiresAt) <= new Date()) {
                    return { ...h, status: 'expired' };
                }
                return h;
            }));
        }, 1000);

        return () => clearInterval(interval);
    }, [activeTab]);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/auth/login");
                return;
            }

            // Fetch user profile
            const userRes = await fetch(`${api.baseURL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!userRes.ok) {
                localStorage.removeItem("token");
                router.push("/auth/login");
                return;
            }

            const userData = await userRes.json();
            setUser(userData.data.user);
            setEditForm({
                name: userData.data.user.name || "",
                phone: userData.data.user.phone || "",
                dateOfBirth: userData.data.user.dateOfBirth
                    ? new Date(userData.data.user.dateOfBirth).toISOString().split("T")[0]
                    : "",
                nationality: userData.data.user.nationality || "",
            });

            // Fetch bookings
            const bookingsRes = await fetch(`${api.baseURL}/users/my-bookings`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (bookingsRes.ok) {
                const bookingsData = await bookingsRes.json();
                setBookings(bookingsData.data.bookings || []);
            }

            // Fetch reviews
            const reviewsRes = await fetch(`${api.baseURL}/users/my-reviews`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (reviewsRes.ok) {
                const reviewsData = await reviewsRes.json();
                setReviews(reviewsData.data.reviews || []);
            }

            // Fetch hold spaces
            const holdsRes = await fetch(`${api.baseURL}/hold-spaces/my-holds`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (holdsRes.ok) {
                const holdsData = await holdsRes.json();
                setHoldSpaces(holdsData.data.holdSpaces || []);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        try {
            setUploadingAvatar(true);
            const fileExt = file.name.split(".").pop();
            const fileName = `${user._id}-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
            const avatarUrl = data.publicUrl;

            // Update user avatar
            const token = localStorage.getItem("token");
            const res = await fetch(`${api.baseURL}/users/update-me`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ avatar: avatarUrl }),
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.data.user);
            }
        } catch (error) {
            console.error("Avatar upload error:", error);
            alert("Failed to upload avatar");
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem("token");
            const res = await fetch(`${api.baseURL}/users/update-me`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editForm),
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.data.user);
                setIsEditing(false);
                alert("Profile updated successfully!");
            } else {
                const error = await res.json();
                alert("Error: " + error.message);
            }
        } catch (error) {
            console.error("Save error:", error);
            alert("Failed to save profile");
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert("New passwords do not match!");
            return;
        }

        if (passwordForm.newPassword.length < 8) {
            alert("Password must be at least 8 characters long");
            return;
        }

        try {
            setChangingPassword(true);
            const token = localStorage.getItem("token");
            const res = await fetch(`${api.baseURL}/auth/update-password`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    passwordCurrent: passwordForm.currentPassword,
                    password: passwordForm.newPassword,
                    passwordConfirm: passwordForm.confirmPassword,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.token) {
                    localStorage.setItem("token", data.token);
                }
                alert("Password updated successfully!");
                setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                alert("Error: " + (data.message || "Failed to update password"));
            }
        } catch (error) {
            console.error("Password change error:", error);
            alert("An error occurred while changing password");
        } finally {
            setChangingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <div className="animate-pulse">
                        <div className="bg-white rounded-2xl p-8 mb-6">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                                <div className="flex-1">
                                    <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Not logged in</h2>
                    <Link href="/auth/login" className="text-blue-600 hover:underline">
                        Sign in to view your profile
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 overflow-hidden">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                {uploadingAvatar ? (
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                            </label>
                        </div>

                        {/* User Info */}
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
                            <p className="text-white/80 mb-2">{user.email}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium capitalize">
                                    {user.role}
                                </span>
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                                    Member since {formatDate(user.createdAt)}
                                </span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-8 mt-4 md:mt-0">
                            <div className="text-center">
                                <div className="text-3xl font-bold">{bookings.length}</div>
                                <div className="text-sm text-white/70">Bookings</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">{holdSpaces.filter(h => h.status === 'active').length}</div>
                                <div className="text-sm text-white/70">Holds</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">{reviews.length}</div>
                                <div className="text-sm text-white/70">Reviews</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex gap-8">
                        {(["overview", "bookings", "hold spaces", "reviews", "settings"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Profile Info Card */}
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    {isEditing ? "Cancel" : "Edit"}
                                </button>
                            </div>

                            {isEditing ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            value={editForm.phone}
                                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                            placeholder="+1 234 567 890"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                        <input
                                            type="date"
                                            value={editForm.dateOfBirth}
                                            onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                                        <input
                                            type="text"
                                            value={editForm.nationality}
                                            onChange={(e) => setEditForm({ ...editForm, nationality: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                            placeholder="e.g. Indian"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={saving}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
                                    >
                                        {saving ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <InfoRow label="Email" value={user.email} />
                                    <InfoRow label="Phone" value={user.phone || "Not provided"} />
                                    <InfoRow label="Date of Birth" value={user.dateOfBirth ? formatDate(user.dateOfBirth) : "Not provided"} />
                                    <InfoRow label="Nationality" value={user.nationality || "Not provided"} />
                                </div>
                            )}
                        </div>

                        {/* Quick Stats Card */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Travel Stats</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Total Trips</span>
                                        <span className="font-semibold text-gray-900">{bookings.filter(b => b.status === "completed").length}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Upcoming</span>
                                        <span className="font-semibold text-blue-600">{bookings.filter(b => b.status === "confirmed").length}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Reviews Written</span>
                                        <span className="font-semibold text-gray-900">{reviews.length}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Booking Preview */}
                            {bookings.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-semibold text-gray-900">Latest Booking</h2>
                                        <button onClick={() => setActiveTab("bookings")} className="text-sm text-blue-600 hover:underline">View all</button>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                            {bookings[0].tour.images?.[0]?.url ? (
                                                <img src={bookings[0].tour.images[0].url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 truncate">{bookings[0].tour.name}</h3>
                                            <p className="text-sm text-gray-500">{formatDate(bookings[0].startDate)}</p>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${bookings[0].status === "confirmed" ? "bg-green-100 text-green-700" :
                                                bookings[0].status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                                    "bg-gray-100 text-gray-600"
                                                }`}>
                                                {bookings[0].status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}



                {/* Bookings Tab */}
                {activeTab === "bookings" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">My Bookings</h2>
                            <p className="text-sm text-gray-500 mt-1">{bookings.length} total bookings</p>
                        </div>
                        {bookings.length === 0 ? (
                            <div className="p-12 text-center">
                                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <h3 className="font-medium text-gray-900 mb-1">No bookings yet</h3>
                                <p className="text-gray-500 mb-4">Start exploring our amazing tours!</p>
                                <Link href="/tours" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition">
                                    Explore Tours
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {bookings.map((booking) => (
                                    <div
                                        key={booking._id}
                                        className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => setSelectedBooking(booking)}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                                            <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                                {booking.tour.images?.[0]?.url ? (
                                                    <img src={booking.tour.images[0].url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <Link href={`/tours/${booking.tour.slug}`} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                                            {booking.tour.name}
                                                        </Link>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Ref: {booking.bookingReference} • {booking.numberOfTravelers} traveler{booking.numberOfTravelers > 1 ? "s" : ""}
                                                        </p>
                                                    </div>
                                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${booking.status === "confirmed" ? "bg-green-100 text-green-700" :
                                                        booking.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                                            booking.status === "completed" ? "bg-blue-100 text-blue-700" :
                                                                booking.status === "cancelled" ? "bg-red-100 text-red-700" :
                                                                    "bg-gray-100 text-gray-600"
                                                        }`}>
                                                        {booking.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 mt-3 text-sm">
                                                    <span className="text-gray-600">
                                                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        {formatDate(booking.startDate)}
                                                    </span>
                                                    <span className="font-semibold text-gray-900">
                                                        {booking.price.currency} {booking.price.totalPrice.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Hold Spaces Tab */}
                {activeTab === "hold spaces" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Hold Spaces</h2>
                            <p className="text-sm text-gray-500 mt-1">{holdSpaces.filter(h => h.status === 'active').length} active holds</p>
                        </div>
                        {holdSpaces.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="text-5xl mb-4">🔒</div>
                                <h3 className="font-medium text-gray-900 mb-1">No held spaces</h3>
                                <p className="text-gray-500">Hold a tour date for 48 hours without payment!</p>
                                <button
                                    onClick={() => router.push('/search')}
                                    className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 transition"
                                >
                                    Browse Tours
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {holdSpaces.map((hold) => {
                                    const isActive = hold.status === 'active' && new Date(hold.expiresAt) > new Date();
                                    const isExpired = hold.status === 'expired' || (hold.status === 'active' && new Date(hold.expiresAt) <= new Date());
                                    const remaining = isActive ? new Date(hold.expiresAt).getTime() - Date.now() : 0;
                                    const hoursLeft = Math.floor(remaining / (1000 * 60 * 60));
                                    const minutesLeft = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                                    const secondsLeft = Math.floor((remaining % (1000 * 60)) / 1000);

                                    return (
                                        <div key={hold._id} className={`p-6 ${isActive ? 'hover:bg-amber-50/30' : 'opacity-60'} transition-colors`}>
                                            <div className="flex items-start gap-4">
                                                {/* Tour Image */}
                                                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative bg-gray-100">
                                                    {hold.tour?.images?.[0] ? (
                                                        <img
                                                            src={hold.tour.images[0].url}
                                                            alt={hold.tour.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">🏔️</div>
                                                    )}
                                                </div>

                                                {/* Hold Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900 text-sm truncate">
                                                                {hold.tour?.name || 'Tour'}
                                                            </h3>
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                Departure: {formatDate(hold.startDate)}
                                                            </p>
                                                        </div>
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${isActive
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : hold.status === 'converted'
                                                                ? 'bg-green-100 text-green-700'
                                                                : hold.status === 'released'
                                                                    ? 'bg-gray-100 text-gray-600'
                                                                    : 'bg-red-100 text-red-600'
                                                            }`}>
                                                            {isExpired ? '⏰ Expired' : hold.status === 'active' ? '🔒 Active' : hold.status === 'converted' ? '✓ Booked' : '↩ Released'}
                                                        </span>
                                                    </div>

                                                    {/* Countdown Timer */}
                                                    {isActive && (
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <div className="flex items-center gap-1 text-xs">
                                                                <span className="text-amber-600">⏱️</span>
                                                                <span className="font-semibold text-amber-700">{hoursLeft}h {minutesLeft}m {secondsLeft}s remaining</span>
                                                            </div>
                                                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                                                <div
                                                                    className="bg-gradient-to-r from-amber-400 to-orange-500 h-1.5 rounded-full transition-all"
                                                                    style={{ width: `${Math.min(100, (remaining / (48 * 60 * 60 * 1000)) * 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-3 mt-3">
                                                        <span className="text-xs text-gray-500">Ref: {hold.holdReference}</span>
                                                        <span className="text-xs text-gray-400">•</span>
                                                        <span className="text-xs font-semibold text-gray-700">
                                                            ${hold.priceAtHold?.amount?.toLocaleString() || '—'} / person
                                                        </span>
                                                    </div>

                                                    {/* Actions */}
                                                    {isActive && (
                                                        <div className="flex items-center gap-2 mt-3">
                                                            <button
                                                                onClick={() => router.push(`/tours/${hold.tour?.slug}/checkout`)}
                                                                className="px-4 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition shadow-sm"
                                                            >
                                                                Book Now
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    setReleasingHold(hold._id);
                                                                    try {
                                                                        const token = localStorage.getItem('token');
                                                                        const res = await fetch(`${api.baseURL}/hold-spaces/${hold._id}/release`, {
                                                                            method: 'PATCH',
                                                                            headers: { Authorization: `Bearer ${token}` },
                                                                        });
                                                                        if (res.ok) {
                                                                            setHoldSpaces(prev => prev.map(h => h._id === hold._id ? { ...h, status: 'released' } : h));
                                                                        }
                                                                    } catch (err) {
                                                                        console.error('Failed to release hold:', err);
                                                                    } finally {
                                                                        setReleasingHold(null);
                                                                    }
                                                                }}
                                                                disabled={releasingHold === hold._id}
                                                                className="px-4 py-1.5 border border-gray-300 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                                                            >
                                                                {releasingHold === hold._id ? 'Releasing...' : 'Release Hold'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Reviews Tab */}
                {activeTab === "reviews" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">My Reviews</h2>
                            <p className="text-sm text-gray-500 mt-1">{reviews.length} reviews written</p>
                        </div>
                        {reviews.length === 0 ? (
                            <div className="p-12 text-center">
                                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                                <h3 className="font-medium text-gray-900 mb-1">No reviews yet</h3>
                                <p className="text-gray-500">Complete a tour to leave a review!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {reviews.map((review) => (
                                    <div key={review._id} className="p-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <Link href={`/tours/${review.tour.slug}`} className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                                                {review.tour.name}
                                            </Link>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <svg
                                                        key={i}
                                                        className={`w-4 h-4 ${i < review.rating ? "text-yellow-400" : "text-gray-200"}`}
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm">{review.review}</p>
                                        <p className="text-xs text-gray-400 mt-2">{formatDate(review.createdAt)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === "settings" && (
                    <div className="max-w-2xl">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                    <div>
                                        <h3 className="font-medium text-gray-900">Email Address</h3>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Verified</span>
                                </div>
                                <div className="py-3">
                                    <h3 className="font-medium text-gray-900 mb-4">Change Password</h3>
                                    <div className="space-y-3">
                                        <input
                                            type="password"
                                            placeholder="Current Password"
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                            className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                        />
                                        <input
                                            type="password"
                                            placeholder="New Password"
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                            className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                        />
                                        <input
                                            type="password"
                                            placeholder="Confirm New Password"
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                            className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                        />
                                        <button
                                            onClick={handlePasswordChange}
                                            disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                                            className="w-full bg-gray-900 hover:bg-black text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                        >
                                            {changingPassword ? "Updating..." : "Update Password"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-red-50 rounded-2xl border border-red-100 p-6">
                            <h2 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h2>
                            <p className="text-sm text-red-700 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                            <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition text-sm">
                                Delete Account
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Booking Details Modal */}
            {selectedBooking && (
                <BookingDetailsModal
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                />
            )}
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center py-2">
            <span className="text-sm text-gray-500 w-32 flex-shrink-0">{label}</span>
            <span className="text-gray-900 font-medium">{value}</span>
        </div>
    );
}
