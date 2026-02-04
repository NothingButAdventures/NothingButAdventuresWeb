"use client";

export default function MyBlogsLoading() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between mb-8 animate-pulse">
                    <div>
                        <div className="h-9 bg-gray-200 rounded-lg w-40 mb-2"></div>
                        <div className="h-5 bg-gray-200 rounded w-64"></div>
                    </div>
                    <div className="h-12 bg-gray-200 rounded-lg w-44"></div>
                </div>

                {/* Stats Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total Articles", color: "bg-gray-200" },
                        { label: "Published", color: "bg-green-100" },
                        { label: "Drafts", color: "bg-yellow-100" },
                        { label: "Total Views", color: "bg-blue-100" },
                    ].map((stat, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse"
                        >
                            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                            <div className={`h-9 ${stat.color} rounded-lg w-16`}></div>
                        </div>
                    ))}
                </div>

                {/* Filter Tabs Skeleton */}
                <div className="flex items-center gap-2 mb-6 animate-pulse">
                    <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
                    <div className="h-10 bg-gray-200 rounded-lg w-28"></div>
                    <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
                </div>

                {/* Blog Table Skeleton */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                        <div className="grid grid-cols-6 gap-4">
                            <div className="col-span-2">
                                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                            </div>
                            <div>
                                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                            </div>
                            <div>
                                <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                            </div>
                            <div>
                                <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                            </div>
                            <div className="text-right">
                                <div className="h-4 bg-gray-200 rounded w-14 ml-auto animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    {/* Table Rows */}
                    <div className="divide-y divide-gray-200">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="px-6 py-4 animate-pulse">
                                <div className="grid grid-cols-6 gap-4 items-center">
                                    {/* Article column */}
                                    <div className="col-span-2 flex items-center gap-4">
                                        <div className="w-16 h-12 rounded-lg bg-gray-200 flex-shrink-0"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-20"></div>
                                        </div>
                                    </div>
                                    {/* Category column */}
                                    <div>
                                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                                    </div>
                                    {/* Status column */}
                                    <div>
                                        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                                    </div>
                                    {/* Views column */}
                                    <div>
                                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                                    </div>
                                    {/* Actions column */}
                                    <div className="flex items-center justify-end gap-2">
                                        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                                        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                                        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
