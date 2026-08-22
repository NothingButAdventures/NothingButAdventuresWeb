"use client";

import React from "react";
import Link from "next/link";

export default function StartPlanningSection() {
    return (
        <section className="mx-auto mt-20 sm:mt-24 md:mt-28 lg:mt-32 mb-16">
            <div className="bg-[rgba(244,236,217,0.2)] rounded-xl p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-start justify-between gap-10 lg:gap-14">
                {/* Left Text & CTA Area */}
                <div className="flex-1 max-w-xl font-outfit">
                    <div className="inline-flex items-center justify-center px-3.5 py-1 bg-[rgba(26,26,26,0.05)] text-[rgba(26,26,26,0.55)] rounded-[110px] text-[14px] font-medium font-outfit mb-3">
                        Newsletter
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-[44px] lg:text-[48px] font-normal leading-tight text-[#1A1A1A] tracking-tight font-outfit mb-5">
                        Subscribe to save 10% off<br />
                        <span className="font-gochi text-[#254B02]">on your next Adventure</span>
                    </h2>
                    <p className="text-lg sm:text-xl text-[#3F3F42] font-light leading-[28px] max-w-lg mb-8 font-outfit tracking-[-0.0225em]">
                        Share your travel dreams with us, and we&apos;ll craft a<br className="hidden sm:inline" /> <strong className="font-normal text-[#1A1A1A]">personalised itinerary</strong> just for you
                    </p>
                    <div className="group flex items-center gap-3">
                        <Link
                            href="/trips"
                            className="inline-flex items-center justify-center bg-[#1A1A1A] group-hover:bg-black text-white px-7 py-3 rounded-full font-normal text-base font-outfit transition-all cursor-pointer ring-1 ring-[#1A1A1A] ring-offset-2 ring-offset-[#FAF6EE]"
                        >
                            Start Exploring
                        </Link>
                        <Link
                            href="/trips"
                            className="inline-flex items-center justify-center bg-[#1A1A1A] group-hover:bg-black text-white w-[48px] h-[48px] rounded-full transition-all shrink-0 cursor-pointer ring-1 ring-[#1A1A1A] ring-offset-2 ring-offset-[#FAF6EE]"
                            aria-label="Start Exploring"
                        >
                            <svg className="w-5 h-5 text-white transition-transform duration-300 group-hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* Right Photos (2 Images) */}
                <div className="flex items-start gap-4 shrink-0 w-full lg:w-auto justify-center lg:justify-end">
                    {/* Image 1: Tall Portrait */}
                    <div className="w-[220px] sm:w-[260px] lg:w-[286px] h-[300px] sm:h-[350px] lg:h-[382px] rounded-xl overflow-hidden relative shadow-xs shrink-0 bg-gray-900 group">
                        <img
                            src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=3540&auto=format&fit=crop"
                            alt="Travellers watching sunset"
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
                        />
                    </div>

                    {/* Image 2: Square */}
                    <div className="w-[180px] sm:w-[210px] lg:w-[240px] h-[180px] sm:h-[210px] lg:h-[240px] rounded-xl overflow-hidden relative shadow-xs shrink-0 bg-gray-900 self-start group">
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
