"use client";

export default function BlogsLoading() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section Skeleton */}
            <div className="relative h-[500px] bg-gradient-to-r from-gray-300 to-gray-200 overflow-hidden animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
                <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
                    {/* Title skeleton */}
                    <div className="h-14 bg-white/30 rounded-xl w-80 md:w-[500px] mb-4"></div>
                    {/* Subtitle skeleton */}
                    <div className="h-6 bg-white/20 rounded-lg w-64 md:w-[450px] mb-8"></div>
                    {/* Search bar skeleton */}
                    <div className="w-full max-w-xl">
                        <div className="h-14 bg-white/90 rounded-full w-full"></div>
                    </div>
                </div>
            </div>

            {/* Categories Section Skeleton */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="relative h-40 rounded-xl overflow-hidden bg-gray-200 animate-pulse"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                            <div className="absolute inset-0 flex items-end justify-center pb-4">
                                <div className="h-5 bg-white/40 rounded w-24"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Featured Section Skeleton */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                {/* Section header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="h-8 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
                    <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Featured Article Skeleton */}
                    <div className="lg:col-span-2 animate-pulse">
                        <div className="relative h-[500px] rounded-2xl overflow-hidden bg-gray-200">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-8">
                                <div className="h-8 bg-white/30 rounded-lg w-3/4 mb-4"></div>
                                <div className="h-4 bg-white/20 rounded w-48 mb-4"></div>
                                <div className="h-4 bg-white/20 rounded w-full mb-2"></div>
                                <div className="h-4 bg-white/20 rounded w-5/6"></div>
                                <div className="flex gap-2 mt-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-4 bg-white/30 rounded w-16"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Side Featured Articles Skeleton */}
                    <div className="flex flex-col gap-8">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex gap-4 animate-pulse">
                                <div className="w-32 h-32 flex-shrink-0 rounded-xl bg-gray-200"></div>
                                <div className="flex flex-col justify-center flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-40 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                                    <div className="flex gap-2 mt-2">
                                        {[1, 2].map((j) => (
                                            <div key={j} className="h-3 bg-gray-200 rounded w-12"></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* All Blogs Section Skeleton */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="h-8 bg-gray-200 rounded-lg w-48 mb-8 animate-pulse"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="animate-pulse">
                            {/* Image skeleton */}
                            <div className="relative h-56 rounded-xl overflow-hidden mb-4 bg-gray-200">
                                <div className="absolute top-4 left-4">
                                    <div className="h-6 bg-white/70 rounded-full w-20"></div>
                                </div>
                            </div>
                            {/* Title skeleton */}
                            <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                            {/* Author/date skeleton */}
                            <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                            {/* Excerpt skeleton */}
                            <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6 mb-3"></div>
                            {/* Tags skeleton */}
                            <div className="flex gap-2">
                                {[1, 2, 3].map((j) => (
                                    <div key={j} className="h-3 bg-gray-200 rounded w-14"></div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
