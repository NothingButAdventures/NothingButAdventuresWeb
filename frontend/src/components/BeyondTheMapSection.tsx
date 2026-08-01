"use client";

import React from "react";
import Link from "next/link";

type Blog = {
    _id: string;
    title: string;
    slug: string;
    excerpt?: string;
    featuredImage?: {
        url: string;
        caption?: string;
        alt?: string;
    };
    category?: string;
    publishedAt?: string;
};

type BeyondTheMapSectionProps = {
    blogs?: Blog[];
};

export default function BeyondTheMapSection({ blogs = [] }: BeyondTheMapSectionProps) {
    const featuredBlogs = [
        {
            id: blogs[0]?._id || "1",
            slug: blogs[0]?.slug || "best-time-to-visit-india",
            title: blogs[0]?.title || "Best Time to Visit India",
            date: "Dec 6, 2026",
            image: blogs[0]?.featuredImage?.url || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=3540&auto=format&fit=crop",
        },
        {
            id: blogs[1]?._id || "2",
            slug: blogs[1]?.slug || "what-to-pack",
            title: blogs[1]?.title || "What to Pack?",
            date: "Dec 5, 2026",
            image: blogs[1]?.featuredImage?.url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=3540&auto=format&fit=crop",
        },
    ];

    return (
        <section className="mx-auto mt-20 sm:mt-24 md:mt-28 lg:mt-32 mb-16">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10">
                <div>
                    <div className="inline-block px-3.5 py-1 bg-[#F4F4F5] text-[#71717A] rounded-full text-[13px] font-medium tracking-normal mb-3 font-outfit">
                        Reviews
                    </div>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[66px] font-normal leading-tight text-[#18181B] tracking-tight font-outfit">
                        Beyond the <span className="font-gochi text-[#4F6D38]">map</span>
                    </h2>
                </div>

                <div className="flex items-center gap-3 mt-4 md:mt-0 group">
                    <Link
                        href="/blogs"
                        className="inline-flex items-center justify-center bg-[#18181B] text-white px-6 py-3 rounded-full font-medium text-sm hover:bg-black transition-all border-2 border-[#18181B] cursor-pointer font-outfit"
                    >
                        See All Articles
                    </Link>
                    <Link
                        href="/blogs"
                        className="inline-flex items-center justify-center bg-[#18181B] text-white w-11 h-11 rounded-full hover:bg-black transition-all border-2 border-[#18181B] shrink-0 cursor-pointer"
                        aria-label="See All Articles"
                    >
                        <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* 2 Feature Article Cards Grid (Wider Card 1 + Square Card 2) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4 h-auto md:h-[470px]">
                {/* Card 1: Wider Landscape Card */}
                <Link
                    href={`/blogs/${featuredBlogs[0].slug}`}
                    className="col-span-1 md:col-span-8 relative rounded-[24px] overflow-hidden min-h-[340px] md:h-full bg-gray-900 shadow-xs group cursor-pointer block"
                >
                    <img
                        src={featuredBlogs[0].image}
                        alt={featuredBlogs[0].title}
                        className="absolute inset-0 w-full h-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-[2s]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none"></div>

                    <div className="absolute bottom-6 left-6 right-6 text-white z-10 font-outfit">
                        <p className="text-white/80 text-xs sm:text-sm mb-1 font-normal">{featuredBlogs[0].date}</p>
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-normal text-white leading-tight">
                            {featuredBlogs[0].title}
                        </h3>
                    </div>
                </Link>

                {/* Card 2: Square Card */}
                <Link
                    href={`/blogs/${featuredBlogs[1].slug}`}
                    className="col-span-1 md:col-span-4 relative rounded-[24px] overflow-hidden aspect-square md:aspect-auto md:h-full bg-gray-900 shadow-xs group cursor-pointer block"
                >
                    <img
                        src={featuredBlogs[1].image}
                        alt={featuredBlogs[1].title}
                        className="absolute inset-0 w-full h-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-[2s]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none"></div>

                    <div className="absolute bottom-6 left-6 right-6 text-white z-10 font-outfit">
                        <p className="text-white/80 text-xs sm:text-sm mb-1 font-normal">{featuredBlogs[1].date}</p>
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-normal text-white leading-tight">
                            {featuredBlogs[1].title}
                        </h3>
                    </div>
                </Link>
            </div>
        </section>
    );
}
