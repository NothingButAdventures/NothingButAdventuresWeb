"use client";

import React from "react";
import Link from "next/link";

export default function StartPlanningSection() {
    return (
        <section className="w-full relative font-outfit mt-10 sm:mt-16 md:mt-20 xl:mt-[120px] mb-12 sm:mb-20">
            {/* Mobile View (#5640:5792, max-width: 359px, bg: rgba(244, 236, 217, 0.2)) */}
            <div className="block lg:hidden w-full max-w-[359px] mx-auto bg-[rgba(244,236,217,0.2)] rounded-[16px] p-4 sm:p-5 flex flex-col justify-start">
                {/* Two Top Images Row (#5640:5794, width: 327.87px, height: 233.24px) */}
                <div className="flex items-start gap-[6.5px] w-full justify-center">
                    {/* Tall Portrait Image (#5640:5795, 174.77px x 233.03px) */}
                    <div className="w-[174.77px] h-[233.03px] rounded-[7.33px] overflow-hidden relative shadow-xs shrink-0 bg-gray-900">
                        <img
                            src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=3540&auto=format&fit=crop"
                            alt="Travellers watching sunset"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Square Image (#5640:5796, 146.54px x 146.54px) */}
                    <div className="w-[146.54px] h-[146.54px] rounded-[7.33px] overflow-hidden relative shadow-xs shrink-0 bg-gray-900 self-start">
                        <img
                            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=3540&auto=format&fit=crop"
                            alt="Travellers crossing mountain bridge"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Content Below Images (#5640:5797) */}
                <div className="flex flex-col mt-4 font-outfit">
                    {/* Badge (#5640:5798, 65px x 15px, white) */}
                    <div className="inline-flex items-center justify-center w-[65px] h-[15px] bg-white text-[rgba(26,26,26,0.55)] rounded-[69.54px] text-[8.85px] font-medium font-outfit mb-2">
                        Newsletter
                    </div>

                    {/* Title (#5640:5800, 30.34px Outfit + Gochi Hand) */}
                    <h2 className="text-[28px] sm:text-[30.34px] font-normal leading-[1.15] text-[#1A1A1A] tracking-normal font-outfit mb-3">
                        Subscribe to save 10% off{" "}
                        <span className="font-gochi text-[#254B02]">on your next</span>
                        <br />
                        <span className="font-gochi text-[#254B02]">Adventure</span>
                    </h2>

                    {/* Subtitle (#5640:5801, 12.64px Outfit Light) */}
                    <p className="text-[12.64px] text-[#3F3F42] font-light leading-[17.7px] tracking-[-0.0225em] font-outfit mb-4">
                        Share your travel dreams with us, and we&apos;ll craft a <strong className="font-normal text-[#1A1A1A]">personalised itinerary</strong> just for you
                    </p>

                    {/* Dual Action Button (#5640:5802) */}
                    <div className="flex items-center gap-[2.5px] group w-fit">
                        <Link
                            href="/trips"
                            className="relative inline-flex items-center justify-center w-[115px] h-[34.14px] bg-[#1A1A1A] group-hover:bg-black text-white rounded-[44.25px] font-medium text-[12.64px] font-sans transition-all cursor-pointer overflow-hidden p-[1px]"
                        >
                            <span className="relative z-10">Start Exploring</span>
                            <span className="absolute inset-[1px] rounded-[44.25px] border border-white/20 pointer-events-none" />
                        </Link>

                        <Link
                            href="/trips"
                            className="relative inline-flex items-center justify-center w-[34.14px] h-[34.14px] bg-[#1A1A1A] group-hover:bg-black text-white rounded-full transition-all shrink-0 cursor-pointer overflow-hidden p-[1px]"
                            aria-label="Start Exploring"
                        >
                            <svg className="w-[10px] h-[10px] text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 13L13 1M13 1H3M13 1V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="absolute inset-[1px] rounded-full border border-[#F4F4F4]/30 pointer-events-none" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Desktop View (#5091:7813, hidden lg:flex) */}
            <div className="hidden lg:flex w-full bg-[rgba(244,236,217,0.2)] rounded-[12px] p-6 sm:p-10 md:p-12 xl:py-[84px] xl:px-[32px] flex-row items-center justify-between gap-8 lg:gap-10 xl:h-[549px]">
                {/* Left Text & CTA Area (#5091:7817, width: 512px) */}
                <div className="flex-1 max-w-[512px] font-outfit flex flex-col justify-center">
                    {/* Newsletter Badge (#5091:7818, 116px x 24px) */}
                    <div className="inline-flex items-center justify-center w-[116px] h-[24px] bg-[rgba(26,26,26,0.05)] text-[rgba(26,26,26,0.55)] rounded-[110px] text-[14px] font-medium font-outfit mb-[14px]">
                        Newsletter
                    </div>

                    {/* Title (#5091:7820, 48px Outfit + Gochi Hand) */}
                    <h2 className="text-[48px] font-normal leading-[54px] text-[#1A1A1A] tracking-normal font-outfit mb-[24px]">
                        Subscribe to save 10% off{" "}
                        <span className="font-gochi text-[#254B02]">on your next</span>
                        <br />
                        <span className="font-gochi text-[#254B02]">Adventure</span>
                    </h2>

                    {/* Subtext (#5091:7821, width: 428px, 20px Outfit Light) */}
                    <p className="text-[20px] text-[#3F3F42] font-light leading-[28px] max-w-[428px] mb-[45px] font-outfit tracking-[-0.0225em]">
                        Share your travel dreams with us, and we&apos;ll craft a <strong className="font-normal text-[#1A1A1A]">personalised itinerary</strong> just for you
                    </p>

                    {/* Composite Action Buttons (#5091:7822, gap: 3.4px) */}
                    <div className="flex items-center gap-[3.4px] w-fit group">
                        {/* Main Button Pill (#I5091:7822;2951:1032, 155px x 46px) */}
                        <Link
                            href="/trips"
                            className="relative inline-flex items-center justify-center w-[155px] h-[46px] bg-[#1A1A1A] group-hover:bg-black text-white rounded-[60px] font-light text-[17px] font-outfit transition-all cursor-pointer overflow-hidden p-[2px]"
                        >
                            <span className="relative z-10">Start Exploring</span>
                            {/* Inner 1px border (#I5091:7822;2951:1034) */}
                            <span className="absolute inset-[2px] rounded-[21px] border border-white/20 pointer-events-none" />
                        </Link>

                        {/* Circular Arrow Button (#I5091:7822;2951:1035, 46px x 46px) */}
                        <Link
                            href="/trips"
                            className="relative inline-flex items-center justify-center w-[46px] h-[46px] bg-[#1A1A1A] group-hover:bg-black text-white rounded-full transition-all shrink-0 cursor-pointer overflow-hidden p-[2px]"
                            aria-label="Start Exploring"
                        >
                            <svg className="w-[14px] h-[14px] text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 13L13 1M13 1H3M13 1V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {/* Outer ellipse ring stroke (#I5091:7822;2951:1042) */}
                            <span className="absolute inset-[2px] rounded-full border border-white/30 pointer-events-none" />
                        </Link>
                    </div>
                </div>

                {/* Right Photos (2 Images: 286x382px and 240x240px, gap: 11px) */}
                <div className="flex items-start gap-[11px] shrink-0 justify-end">
                    {/* Image 1: Tall Portrait (#5091:7815, 286px x 382px) */}
                    <div className="w-[286px] h-[382px] rounded-[12px] overflow-hidden relative shadow-xs shrink-0 bg-gray-900 group">
                        <img
                            src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=3540&auto=format&fit=crop"
                            alt="Travellers watching sunset"
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
                        />
                    </div>

                    {/* Image 2: Square (#5091:7816, 240px x 240px) */}
                    <div className="w-[240px] h-[240px] rounded-[12px] overflow-hidden relative shadow-xs shrink-0 bg-gray-900 self-start group">
                        <img
                            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=3540&auto=format&fit=crop"
                            alt="Travellers crossing mountain bridge"
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
