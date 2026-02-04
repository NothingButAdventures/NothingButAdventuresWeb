"use client";

export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4">
                {/* Greeting Section Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
                    <div className="md:col-span-2 animate-pulse">
                        {/* Title skeleton */}
                        <div className="h-10 bg-gray-200 rounded-lg w-80 mb-3"></div>
                        {/* Subtitle skeleton */}
                        <div className="h-5 bg-gray-200 rounded w-64 mb-4"></div>
                        {/* Link skeleton */}
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>

                    {/* Status Cards Column Skeleton */}
                    <div className="space-y-4 animate-pulse">
                        {/* Write Blog Card Skeleton - Shown for potential copywriter/admin users */}
                        <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="h-3 bg-white/40 rounded w-24 mb-2"></div>
                                    <div className="h-5 bg-white/40 rounded w-28 mb-2"></div>
                                    <div className="h-3 bg-white/40 rounded w-36"></div>
                                </div>
                                <div className="w-12 h-12 bg-white/30 rounded-full"></div>
                            </div>
                            <div className="mt-4 h-10 bg-white/50 rounded-lg"></div>
                        </div>

                        {/* Tour Status Card Skeleton */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-40 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                                <div className="h-3 bg-gray-200 rounded w-48 mt-1"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ready to find your next adventure Banner Skeleton */}
                <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg overflow-hidden mb-16 animate-pulse">
                    <div className="grid grid-cols-2 items-center">
                        <div className="p-8">
                            <div className="h-8 bg-white/40 rounded-lg w-3/4 mb-4"></div>
                            <div className="h-4 bg-white/30 rounded w-full mb-2"></div>
                            <div className="h-4 bg-white/30 rounded w-5/6 mb-6"></div>
                            <div className="h-12 bg-gray-400/50 rounded-lg w-36"></div>
                        </div>
                        <div className="h-64 bg-gray-300/50"></div>
                    </div>
                </div>

                {/* Our top picks Section Skeleton */}
                <div className="mb-16 animate-pulse">
                    <div className="h-8 bg-gray-200 rounded-lg w-48 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-80 mb-8"></div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Tour Card Skeletons */}
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl shadow-md overflow-hidden h-full flex flex-col"
                            >
                                {/* Image Skeleton */}
                                <div className="relative w-full h-56 bg-gray-200">
                                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
                                </div>

                                {/* Content Skeleton */}
                                <div className="p-6 flex-1 flex flex-col">
                                    {/* Badge skeleton */}
                                    <div className="h-3 bg-gray-200 rounded w-24 mb-3"></div>

                                    {/* Title skeleton */}
                                    <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
                                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>

                                    {/* Spacing */}
                                    <div className="flex-1"></div>

                                    {/* Price skeleton */}
                                    <div className="flex items-baseline gap-2 mb-4">
                                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                                    </div>

                                    {/* Button skeleton */}
                                    <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Build your wishlist Section Skeleton */}
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg overflow-hidden py-12 px-8 mb-16 animate-pulse">
                    <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
                        <div>
                            <div className="h-8 bg-gray-300/60 rounded-lg w-56 mb-4"></div>
                            <div className="h-4 bg-gray-300/50 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-300/50 rounded w-5/6 mb-2"></div>
                            <div className="h-4 bg-gray-300/50 rounded w-4/5 mb-6"></div>
                            <div className="h-4 bg-gray-400/60 rounded w-28"></div>
                        </div>
                        <div className="h-64 bg-gray-300/40 rounded-lg"></div>
                    </div>
                </div>
            </div>

            {/* Add shimmer animation */}
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
