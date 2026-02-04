"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";

interface User {
    name: string;
    email: string;
    role: string;
}

const menuItems = [
    {
        name: "Dashboard",
        href: "/admin",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        name: "Tours",
        href: "/admin/tours-management",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
        ),
    },
    {
        name: "Location",
        href: "/admin/location",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        name: "Travel Style",
        href: "/admin/travel-styles",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 8V5a2 2 0 002-2zm0 0h.01" />
            </svg>
        ),
    },
    {
        name: "Physical Rating",
        href: "/admin/physical-rating",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
    },
    {
        name: "Trip Type",
        href: "/admin/trip-types",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
        ),
    },
    {
        name: "Discounts",
        href: "/admin/discounts",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
        ),
    },
    {
        name: "Promo Codes",
        href: "/admin/promo-codes",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
        ),
    },
    {
        name: "Users",
        href: "/admin/users",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
    },
    {
        name: "Bookings",
        href: "/admin/bookings",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        ),
    },
    {
        name: "Reviews",
        href: "/admin/reviews",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
        ),
    },
    {
        name: "Settings",
        href: "/admin/settings",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
];

function AdminLayoutSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar Skeleton */}
            <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-40">
                {/* Logo Section */}
                <div className="h-16 px-6 flex items-center border-b border-gray-100">
                    <div className="flex items-center gap-3 animate-pulse">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                        <div className="h-5 bg-gray-200 rounded w-24"></div>
                    </div>
                </div>

                {/* Navigation Skeleton */}
                <nav className="p-4 space-y-1">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg animate-pulse"
                        >
                            <div className="w-5 h-5 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                    ))}
                </nav>

                {/* User Profile Skeleton */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 animate-pulse">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-24 mb-1.5"></div>
                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Skeleton */}
            <div className="ml-64">
                {/* Header Skeleton */}
                <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between">
                    <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
                </header>

                {/* Content Skeleton */}
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                                    <div className="h-5 bg-gray-100 rounded w-12"></div>
                                </div>
                                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/auth/login");
                return;
            }

            const response = await fetch(`${api.baseURL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                router.push("/auth/login");
                return;
            }

            const data = await response.json();

            if (data.data.user.role !== "admin") {
                router.push("/dashboard");
                return;
            }

            setUser(data.data.user);
        } catch (error) {
            router.push("/auth/login");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/auth/login");
    };

    const isActiveRoute = (href: string) => {
        if (href === "/admin") {
            return pathname === "/admin";
        }
        return pathname?.startsWith(href);
    };

    if (loading) {
        return <AdminLayoutSkeleton />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-40 transition-all duration-300 ${sidebarCollapsed ? "w-[72px]" : "w-64"
                    }`}
            >
                {/* Logo Section */}
                <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100">
                    {!sidebarCollapsed && (
                        <Link href="/admin" className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">A</span>
                            </div>
                            <span className="font-semibold text-gray-900">Admin Panel</span>
                        </Link>
                    )}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {sidebarCollapsed ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-3 space-y-1 overflow-y-auto" style={{ height: "calc(100vh - 180px)" }}>
                    {menuItems.map((item) => {
                        const isActive = isActiveRoute(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive
                                    ? "bg-blue-50 text-blue-600 font-medium"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                                title={sidebarCollapsed ? item.name : undefined}
                            >
                                <span className={`flex-shrink-0 ${isActive ? "text-blue-600" : "text-gray-500"}`}>
                                    {item.icon}
                                </span>
                                {!sidebarCollapsed && <span>{item.name}</span>}
                            </Link>
                        );
                    })}

                    {/* Divider */}
                    <div className="my-3 border-t border-gray-200"></div>

                    {/* Leave Admin Panel Link */}
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200"
                        title={sidebarCollapsed ? "Leave Admin Panel" : undefined}
                    >
                        <span className="flex-shrink-0 text-gray-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                        </span>
                        {!sidebarCollapsed && <span>Leave Admin Panel</span>}
                    </Link>
                </nav>

                {/* User Profile Section */}
                <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-100 bg-white">
                    <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}>
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 font-semibold text-sm">
                                {user?.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        {!sidebarCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                                <p className="text-xs text-gray-500 truncate">Admin</p>
                            </div>
                        )}
                        {!sidebarCollapsed && (
                            <button
                                onClick={handleLogout}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Logout"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div
                className={`min-h-screen transition-all duration-300 ${sidebarCollapsed ? "ml-[72px]" : "ml-64"
                    }`}
            >
                {children}
            </div>
        </div>
    );
}
