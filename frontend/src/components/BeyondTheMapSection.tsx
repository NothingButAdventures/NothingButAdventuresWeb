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
        <section className="w-full relative font-outfit my-8 md:my-[30px] xl:my-16">
            {/* Mobile View (#5640:5803 – #5640:5819) */}
            <div className="block md:hidden w-full max-w-[360px] mx-auto">
                {/* Header (#5640:5803) */}
                <div className="mb-4">
                    {/* Badge (#5640:5805, 46.05px x 15.35px) */}
                    <div className="inline-flex items-center justify-center w-[54px] h-[15.35px] bg-[rgba(26,26,26,0.05)] text-[rgba(26,26,26,0.55)] rounded-[70.35px] text-[8.85px] font-medium tracking-normal font-outfit mb-2">
                        Articles
                    </div>

                    {/* Title + Dual Action Button Row (#5640:5807 & #5640:5809) */}
                    <div className="flex items-center justify-between gap-2 w-full">
                        <h2 className="text-[30.34px] font-normal leading-[1.12] text-[#1A1A1A] tracking-normal font-outfit">
                            Beyond the <span className="font-gochi text-[#254B02]">Map</span>
                        </h2>

                        <div className="flex items-center gap-[2.1px] group shrink-0">
                            <Link
                                href="/blogs"
                                className="relative inline-flex items-center justify-center w-[95.88px] h-[28.45px] bg-[#1A1A1A] group-hover:bg-black text-white rounded-[36.88px] font-medium text-[10px] font-sans transition-all cursor-pointer overflow-hidden p-[1px]"
                            >
                                <span className="relative z-10">See All Articles</span>
                                <span className="absolute inset-[1px] rounded-[36.88px] border border-white/20 pointer-events-none" />
                            </Link>

                            <Link
                                href="/blogs"
                                className="relative inline-flex items-center justify-center w-[28.45px] h-[28.45px] bg-[#1A1A1A] group-hover:bg-black text-white rounded-full transition-all shrink-0 cursor-pointer overflow-hidden p-[1px]"
                                aria-label="See All Articles"
                            >
                                <svg className="w-[8.5px] h-[8.5px] text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 13L13 1M13 1H3M13 1V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="absolute inset-[1px] rounded-full border border-white/30 pointer-events-none" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Mobile Cards Stack (#5640:5810 & #5640:5815) */}
                <div className="flex flex-col gap-3.5 w-full">
                    {/* Card 1 (#5640:5810, 359px x 284px, rounded: 7.58px) */}
                    <Link
                        href={`/blogs/${featuredBlogs[0].slug}`}
                        className="relative w-full h-[284px] rounded-[8px] overflow-hidden bg-gray-900 shadow-xs block group cursor-pointer"
                    >
                        <img
                            src={featuredBlogs[0].image}
                            alt={featuredBlogs[0].title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
                        />
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: "linear-gradient(0deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.25) 50%, rgba(0, 0, 0, 100%)",
                            }}
                        />
                        <div className="absolute bottom-[16px] left-[17.7px] right-[17.7px] text-white z-10 font-outfit">
                            <p className="text-white/80 text-[10px] font-normal font-outfit mb-0.5">
                                {featuredBlogs[0].date}
                            </p>
                            <h3 className="text-[18px] font-normal text-white leading-tight font-outfit">
                                {featuredBlogs[0].title}
                            </h3>
                        </div>
                    </Link>

                    {/* Card 2 (#5640:5815, 360px x 284px, rounded: 10.85px) */}
                    <Link
                        href={`/blogs/${featuredBlogs[1].slug}`}
                        className="relative w-full h-[284px] rounded-[11px] overflow-hidden bg-gray-900 shadow-xs block group cursor-pointer"
                    >
                        <img
                            src={featuredBlogs[1].image}
                            alt={featuredBlogs[1].title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
                        />
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: "linear-gradient(0deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.25) 50%, rgba(0, 0, 0, 100%)",
                            }}
                        />
                        <div className="absolute bottom-[16px] left-[16.4px] right-[16.4px] text-white z-10 font-outfit">
                            <p className="text-white/80 text-[10px] font-normal font-outfit mb-0.5">
                                {featuredBlogs[1].date}
                            </p>
                            <h3 className="text-[18px] font-normal text-white leading-tight font-outfit">
                                {featuredBlogs[1].title}
                            </h3>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Desktop View (#5640:7831 on 785px / #5091:7824 on 1280px) */}
            <div className="hidden md:block">
                {/* Header Area (#5640:7832 on 785px / #5091:7824 on 1280px) */}
                <div className="flex flex-row items-end justify-between mb-3.5 lg:mb-4 xl:mb-[20px] gap-4">
                    <div className="flex flex-col">
                        {/* Badge (#5640:7834 on 785px: 48px x 14.72px / #5091:7825 on 1280px: 78px x 24px) */}
                        <div className="inline-flex items-center justify-center w-[48px] lg:w-[62px] xl:w-[78px] h-[14.7px] lg:h-[19px] xl:h-[24px] bg-[rgba(26,26,26,0.05)] text-[rgba(26,26,26,0.55)] rounded-[67px] xl:rounded-[110px] text-[8.59px] lg:text-[11px] xl:text-[14px] font-medium tracking-normal font-outfit mb-1.5 xl:mb-[10px]">
                            Articles
                        </div>
                        {/* Title (#5640:7837 on 785px: 29.44px / #5091:7829 on 1280px: 48px) */}
                        <h2 className="text-[29.44px] lg:text-[38px] xl:text-[48px] font-normal leading-[32px] lg:leading-[42px] xl:leading-[55px] text-[#1A1A1A] tracking-[0.0078em] font-outfit mt-0">
                            Beyond the <span className="font-gochi text-[#254B02]">Map</span>
                        </h2>
                    </div>

                    {/* Top Right Composite Button (#5640:7846 on 785px / #5091:7838 on 1280px) */}
                    <div className="flex items-center gap-[2px] xl:gap-[3.33px] w-fit group">
                        {/* Main Button Pill (#I5640:7846;2951:1032, 93px x 27.6px on 785px / 151.67px x 45px on 1280px) */}
                        <Link
                            href="/blogs"
                            className="relative inline-flex items-center justify-center w-[93px] lg:w-[120px] xl:w-[151.67px] h-[27.6px] lg:h-[36px] xl:h-[45px] bg-[#1A1A1A] group-hover:bg-black text-white rounded-[36px] xl:rounded-[58.3px] font-light text-[9.81px] lg:text-[12.5px] xl:text-[15px] font-outfit transition-all cursor-pointer overflow-hidden p-[1.5px] xl:p-[2px]"
                        >
                            <span className="relative z-10">See All Articles</span>
                            {/* Inner 1px border */}
                            <span className="absolute inset-[1.5px] xl:inset-[2px] rounded-[13px] xl:rounded-[20.8px] border border-white/20 pointer-events-none" />
                        </Link>

                        {/* Circular Arrow Button (#I5640:7846;2951:1035, 27.6px x 27.6px on 785px / 45px x 45px on 1280px) */}
                        <Link
                            href="/blogs"
                            className="relative inline-flex items-center justify-center w-[27.6px] lg:w-[36px] xl:w-[45px] h-[27.6px] lg:h-[36px] xl:h-[45px] bg-[#1A1A1A] group-hover:bg-black text-white rounded-full transition-all shrink-0 cursor-pointer overflow-hidden p-[1.5px] xl:p-[2px]"
                            aria-label="See All Articles"
                        >
                            <svg className="w-2.5 h-2.5 lg:w-3 lg:h-3 xl:w-3.5 xl:h-3.5 text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 13L13 1M13 1H3M13 1V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {/* Outer ellipse ring stroke */}
                            <span className="absolute inset-[1.5px] xl:inset-[2px] rounded-full border border-white/30 pointer-events-none" />
                        </Link>
                    </div>
                </div>

                {/* 2 Feature Article Cards Grid (#5640:7838 & #5640:7840 on 785px: height 247.8px, gap 9.8px / 1280px: height 452px, gap 16px) */}
                <div className="grid grid-cols-[476fr_256fr] xl:grid-cols-[802fr_399fr] gap-[9.8px] lg:gap-[13px] xl:gap-[16px] h-[247.8px] lg:h-[340px] xl:h-[452px]">
                    {/* Card 1: Wider Landscape Card (#5640:7838 on 785px: 475.9px x 247.8px / #5091:7830 on 1280px: 802px x 452px) */}
                    <Link
                        href={`/blogs/${featuredBlogs[0].slug}`}
                        className="relative rounded-[7.36px] xl:rounded-[12px] overflow-hidden h-full bg-gray-900 shadow-xs group cursor-pointer block"
                    >
                        <img
                            src={featuredBlogs[0].image}
                            alt={featuredBlogs[0].title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
                        />
                        {/* Dark Tint & Gradient Overlay */}
                        <div className="absolute inset-0 bg-[rgba(26,26,26,0.2)] pointer-events-none" />
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: "linear-gradient(0deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 100%)",
                            }}
                        />

                        {/* Card Content (#5640:7842 & #5640:7843 on 785px / #5091:7834 & #5091:7835 on 1280px) */}
                        <div className="absolute bottom-3.5 lg:bottom-5 xl:bottom-[28px] left-3.5 lg:left-5 xl:left-[28px] right-3.5 lg:right-5 xl:right-[28px] text-white z-10 font-outfit">
                            <p className="text-white/80 text-[8.59px] lg:text-[11px] xl:text-[14px] font-normal font-outfit mb-0.5 xl:mb-1">
                                {featuredBlogs[0].date}
                            </p>
                            <h3 className="text-[19.63px] lg:text-[25px] xl:text-[32px] font-normal text-white leading-tight font-outfit">
                                {featuredBlogs[0].title}
                            </h3>
                        </div>
                    </Link>

                    {/* Card 2: Narrower Card (#5640:7840 on 785px: 256.4px x 247.8px / #5091:7832 on 1280px: 399px x 452px) */}
                    <Link
                        href={`/blogs/${featuredBlogs[1].slug}`}
                        className="relative rounded-[7.36px] xl:rounded-[12px] overflow-hidden h-full bg-gray-900 shadow-xs group cursor-pointer block"
                    >
                        <img
                            src={featuredBlogs[1].image}
                            alt={featuredBlogs[1].title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
                        />
                        {/* Dark Tint & Gradient Overlay */}
                        <div className="absolute inset-0 bg-[rgba(26,26,26,0.2)] pointer-events-none" />
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: "linear-gradient(0deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 100%)",
                            }}
                        />

                        {/* Card Content (#5640:7844 & #5640:7845 on 785px / #5091:7836 & #5091:7837 on 1280px) */}
                        <div className="absolute bottom-3.5 lg:bottom-5 xl:bottom-[28px] left-3.5 lg:left-5 xl:left-[28px] right-3.5 lg:right-5 xl:right-[28px] text-white z-10 font-outfit">
                            <p className="text-white/80 text-[8.59px] lg:text-[11px] xl:text-[14px] font-normal font-outfit mb-0.5 xl:mb-1">
                                {featuredBlogs[1].date}
                            </p>
                            <h3 className="text-[19.63px] lg:text-[25px] xl:text-[32px] font-normal text-white leading-tight font-outfit">
                                {featuredBlogs[1].title}
                            </h3>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
}
