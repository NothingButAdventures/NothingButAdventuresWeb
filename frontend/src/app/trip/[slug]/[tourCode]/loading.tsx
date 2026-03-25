"use client";

export default function TourDetailLoading() {
    return (
        <div className="min-h-screen">
            {/* Tour Header */}
            <div className="bg-white">
                <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4 py-4">
                    {/* Breadcrumb Skeleton */}
                    <div className="flex items-center gap-2 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                        <span className="text-gray-300">/</span>
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                        <span className="text-gray-300">/</span>
                        <div className="h-4 bg-gray-200 rounded w-48"></div>
                    </div>

                    {/* Photo Gallery with Booking Panel Skeleton */}
                    <div className="mt-6 mb-6 bg-white">
                        <div className="max-w-7xl mx-auto py-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                                {/* Images Grid (left) */}
                                <div className="lg:col-span-2 animate-pulse">
                                    {/* Title skeleton */}
                                    <div className="h-10 bg-gray-200 rounded-lg w-3/4 mb-4"></div>

                                    {/* Rating skeleton */}
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="flex flex-col items-center pr-3 border-r">
                                            <div className="h-8 bg-gray-200 rounded w-10 mb-1"></div>
                                            <div className="h-3 bg-gray-200 rounded w-6"></div>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1 mb-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-5 h-5 bg-gray-200 rounded"
                                                    ></div>
                                                ))}
                                            </div>
                                            <div className="h-3 bg-gray-200 rounded w-20"></div>
                                        </div>
                                    </div>

                                    {/* Main Image skeleton */}
                                    <div className="relative aspect-[4/2] rounded-sm overflow-hidden bg-gray-200">
                                        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
                                    </div>
                                </div>

                                {/* Booking Panel (right) Skeleton */}
                                <aside className="bg-gradient-to-br from-white to-gray-50 rounded-xl border shadow-lg overflow-hidden animate-pulse">
                                    {/* Top Seller Badge skeleton */}
                                    <div className="bg-gradient-to-r from-gray-300 to-gray-400 px-6 py-3">
                                        <div className="h-4 bg-white/40 rounded w-20 mx-auto"></div>
                                    </div>

                                    <div className="p-6">
                                        {/* Title skeleton */}
                                        <div className="mb-6">
                                            <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
                                            <div className="h-4 bg-gray-200 rounded w-40"></div>
                                        </div>

                                        {/* Price Section skeleton */}
                                        <div className="mb-6 pb-6 border-b">
                                            <div className="h-4 bg-gray-200 rounded w-12 mb-2"></div>
                                            <div className="flex items-end gap-2 mb-2">
                                                <div className="h-12 bg-gray-200 rounded w-28"></div>
                                                <div className="h-5 bg-gray-200 rounded w-10"></div>
                                            </div>
                                            <div className="h-3 bg-gray-200 rounded w-16 mt-2"></div>
                                        </div>

                                        {/* Valid Date skeleton */}
                                        <div className="mb-6 pb-6 border-b">
                                            <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                                            <div className="h-4 bg-gray-200 rounded w-28"></div>
                                        </div>

                                        {/* Rating skeleton */}
                                        <div className="mb-6 pb-6 border-b flex items-center gap-3">
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-5 h-5 bg-gray-200 rounded"
                                                    ></div>
                                                ))}
                                            </div>
                                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                                        </div>

                                        {/* CTA Buttons skeleton */}
                                        <div className="space-y-3">
                                            <div className="h-12 bg-gray-300 rounded-lg w-full"></div>
                                            <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
                                        </div>
                                    </div>
                                </aside>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation Skeleton */}
            <div className="bg-white border-t pt-4">
                <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4">
                    <nav className="flex space-x-8 animate-pulse">
                        <div className="h-5 bg-gray-200 rounded w-20"></div>
                        <div className="h-5 bg-gray-200 rounded w-28"></div>
                        <div className="h-5 bg-gray-200 rounded w-24"></div>
                    </nav>
                </div>
            </div>

            {/* Tab Content Skeleton */}
            <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Skeleton */}
                    <div className="lg:col-span-2 animate-pulse">
                        <div className="bg-white p-2">
                            {/* Section title */}
                            <div className="h-7 bg-gray-200 rounded-lg w-40 mb-6"></div>

                            {/* Description paragraphs */}
                            <div className="space-y-3 mb-8">
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                            </div>

                            {/* Is This Tour For Me Section skeleton */}
                            <div className="mb-12 border-t pt-8">
                                <div className="h-7 bg-gray-200 rounded-lg w-48 mb-6"></div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i}>
                                                <div className="h-5 bg-gray-200 rounded w-44 mb-2"></div>
                                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                                <div className="h-4 bg-gray-200 rounded w-5/6 mt-1"></div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="lg:border-l lg:pl-12 border-gray-200">
                                        <div className="h-5 bg-gray-200 rounded w-52 mb-3"></div>
                                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-4/5 mb-4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-48"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="space-y-6 animate-pulse">
                        {/* Whats Included card skeleton */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
                            <div className="space-y-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Transportation card skeleton */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="h-5 bg-gray-200 rounded w-28 mb-4"></div>
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shimmer animation style */}
            <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
        </div>
    );
}
