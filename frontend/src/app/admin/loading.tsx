"use client";

export default function AdminLoading() {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Skeleton */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900 border-r border-zinc-800">
                {/* Logo Section */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-800">
                    <div className="flex items-center gap-3 animate-pulse">
                        <div className="w-8 h-8 bg-zinc-800 rounded-md"></div>
                        <div className="h-5 bg-zinc-800 rounded-md w-16"></div>
                    </div>
                    <div className="w-8 h-8 bg-zinc-800 rounded-md animate-pulse"></div>
                </div>

                {/* Navigation Skeleton */}
                <nav className="p-4 space-y-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div
                            key={i}
                            className={`flex items-center gap-3 px-3 py-3 rounded-md animate-pulse ${i === 1 ? "bg-zinc-800/50" : ""
                                }`}
                        >
                            <div className="w-5 h-5 bg-zinc-800 rounded-md"></div>
                            <div className="h-4 bg-zinc-800 rounded-md w-24"></div>
                        </div>
                    ))}
                </nav>

                {/* User Profile Section Skeleton */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800">
                    <div className="flex items-center gap-3 animate-pulse">
                        <div className="w-10 h-10 bg-zinc-800 rounded-full"></div>
                        <div className="flex-1">
                            <div className="h-4 bg-zinc-800 rounded-md w-24 mb-2"></div>
                            <div className="h-3 bg-zinc-800 rounded-md w-32"></div>
                        </div>
                    </div>
                    <div className="mt-4 h-9 bg-zinc-800/50 rounded-md animate-pulse"></div>
                </div>
            </aside>

            {/* Main Content Skeleton */}
            <main className="flex-1 ml-64 bg-gray-50">
                {/* Top Header Skeleton */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                    <div className="flex items-center justify-between px-8 py-4">
                        <div className="animate-pulse">
                            <div className="h-7 bg-gray-200 rounded-md w-48 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded-md w-36"></div>
                        </div>
                        <div className="flex items-center gap-4 animate-pulse">
                            <div className="w-64 h-10 bg-gray-100 rounded-md"></div>
                            <div className="w-10 h-10 bg-gray-100 rounded-md"></div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content Skeleton */}
                <div className="p-8">
                    {/* Stats Grid Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[
                            { color: "bg-zinc-100" },
                            { color: "bg-zinc-150" },
                            { color: "bg-zinc-100" },
                            { color: "bg-zinc-150" },
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-md p-6 border border-gray-200 shadow-sm animate-pulse"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 ${stat.color} rounded-md border border-zinc-200`}></div>
                                    <div className="h-5 bg-gray-100 rounded-md w-12"></div>
                                </div>
                                <div className="h-9 bg-gray-200 rounded-md w-20 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded-md w-24"></div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions Skeleton */}
                    <div className="mb-8">
                        <div className="h-5 bg-gray-200 rounded-md w-28 mb-4 animate-pulse"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="bg-white border border-gray-200 rounded-md p-6 animate-pulse shadow-sm"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gray-200 rounded-md"></div>
                                        <div>
                                            <div className="h-5 bg-gray-200 rounded-md w-32 mb-2"></div>
                                            <div className="h-4 bg-gray-200 rounded-md w-40"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity & Analytics Row Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Bookings Skeleton */}
                        <div className="bg-white rounded-md border border-gray-200 p-6 animate-pulse shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="h-5 bg-gray-200 rounded-md w-36"></div>
                                <div className="h-4 bg-gray-200 rounded-md w-16"></div>
                            </div>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-md border border-gray-150"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                            <div>
                                                <div className="h-4 bg-gray-200 rounded-md w-28 mb-2"></div>
                                                <div className="h-3 bg-gray-200 rounded-md w-36"></div>
                                            </div>
                                        </div>
                                        <div className="h-6 bg-gray-200 rounded-md w-20"></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Chart Placeholder Skeleton */}
                        <div className="bg-white rounded-md border border-gray-200 p-6 animate-pulse shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="h-5 bg-gray-200 rounded-md w-32"></div>
                                <div className="h-8 bg-gray-200 rounded-md w-28"></div>
                            </div>
                            <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-55 rounded-md border border-gray-150"></div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
