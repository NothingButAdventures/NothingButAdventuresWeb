"use client";

export default function ToursLoading() {
    return (
        <div className="min-h-screen">
            {/* Tours Section */}
            <div className="max-w-7xl mx-auto px-4 py-4">
                {/* Header Skeleton */}
                <div className="mb-4 animate-pulse">
                    <div className="h-8 bg-gray-200 rounded-lg w-48 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-28"></div>
                </div>

                {/* Tours Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className="bg-white border rounded-xl overflow-hidden h-full flex flex-col animate-pulse"
                        >
                            {/* Image Skeleton */}
                            <div className="relative w-full h-64 bg-gray-200">
                                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
                            </div>

                            {/* Content Skeleton */}
                            <div className="p-6 flex-1 flex flex-col">
                                {/* Duration Badge Skeleton */}
                                <div className="mb-3">
                                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                                </div>

                                {/* Tour Name Skeleton */}
                                <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>

                                {/* Spacing */}
                                <div className="flex-1"></div>

                                {/* Price Section Skeleton */}
                                <div className="flex items-baseline gap-2 mb-4">
                                    <div className="h-9 bg-gray-200 rounded w-20"></div>
                                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                                </div>

                                {/* CTA Button Skeleton */}
                                <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                            </div>
                        </div>
                    ))}
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
