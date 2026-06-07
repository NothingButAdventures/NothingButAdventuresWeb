"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface User {
    _id: string;
    name: string;
    walletBalance?: number;
    walletExpiresAt?: string;
    // Add other properties if needed
}

export default function WalletPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/auth/login");
                return;
            }

            const response = await fetch(`${api.baseURL}/auth/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.data.user);
            } else {
                localStorage.removeItem("token");
                router.push("/auth/login");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <main className="min-h-screen pt-24 pb-12 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#3F3F42]">My Wallet</h1>
                    <p className="text-gray-600 mt-2">Manage your travel credits and rewards</p>
                </div>

                {/* Wallet Card */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden mb-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <p className="text-gray-400 text-sm font-medium mb-1">Available Balance</p>
                                <h2 className="text-5xl font-bold text-amber-400 flex items-center">
                                    <span className="text-3xl mr-2">$</span>
                                    {(user.walletBalance || 0).toLocaleString()}
                                    <span className="text-xl text-gray-400 font-normal ml-2">USD</span>
                                </h2>
                                {user.walletExpiresAt && (
                                    <p className="text-sm text-red-400 font-medium mt-2 bg-red-400/10 inline-block px-3 py-1 rounded-full border border-red-400/20">
                                        Expires on {new Date(user.walletExpiresAt).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-sm">
                                <h3 className="text-lg font-semibold mb-2">Use your credits</h3>
                                <p className="text-sm text-gray-300 mb-4">
                                    Your credits can be applied to any trip booking at checkout. Start planning your next adventure today!
                                </p>
                                <Link
                                    href="/trips"
                                    className="inline-block bg-amber-400 hover:bg-amber-500 text-[#3F3F42] font-bold py-2 px-6 rounded-lg transition-colors text-sm"
                                >
                                    Explore Trips
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Usage Rules */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-[#3F3F42]">Usage Rules</h3>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></span>
                                <div>
                                    <p className="text-sm font-semibold text-[#3F3F42]">12-Month Booking Window</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Credits must be used to book a trip within 12 months from the issue date.</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></span>
                                <div>
                                    <p className="text-sm font-semibold text-[#3F3F42]">24-Month Departure Window</p>
                                    <p className="text-xs text-gray-500 mt-0.5">The trip you book must depart within 24 months of receiving your credit.</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></span>
                                <div>
                                    <p className="text-sm font-semibold text-[#3F3F42]">Single Use Policy</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Only one credit can be applied per booking. Credits cannot be stacked.</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* How to Earn */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-[#3F3F42]">NBA Club Rewards</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-bold text-[#3F3F42]">Silver Traveler</p>
                                    <p className="text-xs text-gray-500">4-9 Trips Completed</p>
                                </div>
                                <span className="text-sm font-bold text-green-600">$100 Credit</span>
                            </div>
                            <div className="p-3 bg-amber-50 rounded-xl flex justify-between items-center border border-amber-100">
                                <div>
                                    <p className="text-sm font-bold text-[#3F3F42]">Gold Explorer</p>
                                    <p className="text-xs text-gray-500">10-14 Trips Completed</p>
                                </div>
                                <span className="text-sm font-bold text-amber-600">$150 Credit</span>
                            </div>
                            <div className="p-3 bg-[#3F3F42] text-white rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-bold">Platinum Adventurer</p>
                                    <p className="text-xs text-gray-400">15+ Trips Completed</p>
                                </div>
                                <span className="text-sm font-bold text-blue-400">$250 Credit</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaction History Placeholder (for future) */}
                <div className="mt-8 border-t border-gray-200 pt-8">
                    <h3 className="text-lg font-bold text-[#3F3F42] mb-4">History</h3>
                    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                        <p>No transactions yet</p>
                    </div>
                </div>

            </div>
        </main>
    );
}
