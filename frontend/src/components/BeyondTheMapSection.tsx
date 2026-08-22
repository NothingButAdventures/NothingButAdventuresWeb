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
        <section className="mx-auto mt-20 sm:mt-24 md:mt-28 lg:mt-32 mb-16 font-outfit">
            {/* Header Area (#5091:7824) */}
            <div className="flex flex-col gap-3 mb-8 md:mb-10">
                <div>
                    <div className="inline-flex items-center justify-center px-3.5 py-1 bg-[rgba(26,26,26,0.05)] text-[rgba(26,26,26,0.55)] rounded-[110px] text-[14px] font-medium tracking-normal font-outfit">
                        Articles
                    </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between">
                    <h2 className="text-3xl sm:text-4xl md:text-[44px] lg:text-[48px] font-normal leading-[55px] text-[#1A1A1A] tracking-[0.0078em] font-outfit">
                        Beyond the <span className="font-gochi text-[#254B02]">Map</span>
                    </h2>

                    <div className="group flex items-center gap-1 mt-4 md:mt-0">
                        <Link
                            href="/blogs"
                            className="inline-flex items-center justify-center bg-[#1A1A1A] group-hover:bg-black text-white px-5 py-3 rounded-[58px] font-light text-[15px] font-outfit transition-all cursor-pointer ring-1 ring-[#1A1A1A] ring-offset-2 ring-offset-white"
                        >
                            See All Articles
                        </Link>
                        <Link
                            href="/blogs"
                            className="inline-flex items-center justify-center bg-[#1A1A1A] group-hover:bg-black text-white w-[45px] h-[45px] rounded-full transition-all shrink-0 cursor-pointer ring-1 ring-[#1A1A1A] ring-offset-2 ring-offset-white"
                            aria-label="See All Articles"
                        >
                            <svg className="w-4 h-4 text-white transition-transform duration-300 group-hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>

            {/* 2 Feature Article Cards Grid — 67/33 ratio matching Figma 802:399 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4 h-auto md:h-[452px]">
                {/* Card 1: Wider Landscape Card */}
                <Link
                    href={`/blogs/${featuredBlogs[0].slug}`}
                    className="col-span-1 md:col-span-8 relative rounded-xl overflow-hidden min-h-[340px] md:h-full bg-gray-900 shadow-xs group cursor-pointer block"
                >
                    <img
                        src={featuredBlogs[0].image}
                        alt={featuredBlogs[0].title}
                        className="absolute inset-0 w-full h-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-[2s]"
                    />
                    <div className="absolute inset-0 bg-[rgba(26,26,26,0.2)] pointer-events-none"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none"></div>

                    <div className="absolute bottom-6 left-7 right-6 text-white z-10 font-outfit">
                        <p className="text-white/80 text-sm font-light mb-1">{featuredBlogs[0].date}</p>
                        <h3 className="text-2xl md:text-[32px] font-normal text-white leading-tight">
                            {featuredBlogs[0].title}
                        </h3>
                    </div>
                </Link>

                {/* Card 2: Narrower Card */}
                <Link
                    href={`/blogs/${featuredBlogs[1].slug}`}
                    className="col-span-1 md:col-span-4 relative rounded-xl overflow-hidden aspect-square md:aspect-auto md:h-full bg-gray-900 shadow-xs group cursor-pointer block"
                >
                    <img
                        src={featuredBlogs[1].image}
                        alt={featuredBlogs[1].title}
                        className="absolute inset-0 w-full h-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-[2s]"
                    />
                    <div className="absolute inset-0 bg-[rgba(26,26,26,0.2)] pointer-events-none"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none"></div>

                    <div className="absolute bottom-6 left-7 right-6 text-white z-10 font-outfit">
                        <p className="text-white/80 text-sm font-light mb-1">{featuredBlogs[1].date}</p>
                        <h3 className="text-xl sm:text-2xl md:text-[32px] font-normal text-white leading-tight">
                            {featuredBlogs[1].title}
                        </h3>
                    </div>
                </Link>
            </div>
        </section>
    );
}
