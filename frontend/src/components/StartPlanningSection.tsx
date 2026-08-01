"use client";

import React from "react";
import Link from "next/link";

export default function StartPlanningSection() {
    return (
        <section className="mx-auto mt-20 sm:mt-24 md:mt-28 lg:mt-32 mb-16">
            <div className="bg-[#FAF7F2] rounded-[28px] sm:rounded-[36px] p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14 shadow-2xs">
                {/* Left Text & CTA Area */}
                <div className="flex-1 max-w-xl">
                    <div className="inline-block px-3.5 py-1 bg-[#F4F4F5] text-[#71717A] rounded-full text-xs font-medium font-outfit mb-5">
                        Tours Snippets
                    </div>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[60px] font-normal leading-[1.12] text-[#18181B] tracking-tight font-outfit mb-5">
                        Subscribe to save 10%<br />
                        off <span className="font-gochi text-[#4F6D38]">on your next</span><br />
                        <span className="font-gochi text-[#4F6D38]">Adventure</span>
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-gray-600 font-normal leading-relaxed max-w-lg mb-8 font-outfit">
                        Share your travel dreams with us, and we'll craft a<br className="hidden sm:inline" /> personalised itinerary just for you
                    </p>
                    <div className="flex items-center gap-3 group">
                        <Link
                            href="/trips"
                            className="inline-flex items-center justify-center bg-[#18181B] text-white px-7 py-3.5 rounded-full font-medium text-sm hover:bg-black transition-all border-2 border-[#18181B] cursor-pointer"
                        >
                            Start Exploring
                        </Link>
                        <Link
                            href="/trips"
                            className="inline-flex items-center justify-center bg-[#18181B] text-white w-12 h-12 rounded-full hover:bg-black transition-all border-2 border-[#18181B] shrink-0 cursor-pointer"
                            aria-label="Start Exploring"
                        >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* Right Photos (2 Images) */}
                <div className="flex items-start gap-4 sm:gap-5 shrink-0 w-full lg:w-auto justify-center lg:justify-end">
                    {/* Image 1: Tall Portrait */}
                    <div className="w-[220px] sm:w-[260px] lg:w-[300px] h-[320px] sm:h-[370px] lg:h-[400px] rounded-[24px] overflow-hidden relative shadow-xs shrink-0 bg-gray-900 group">
                        <img
                            src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=3540&auto=format&fit=crop"
                            alt="Travellers watching sunset"
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
                        />
                    </div>

                    {/* Image 2: Square */}
                    <div className="w-[170px] sm:w-[200px] lg:w-[230px] aspect-square rounded-[24px] overflow-hidden relative shadow-xs shrink-0 bg-gray-900 self-start group">
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
