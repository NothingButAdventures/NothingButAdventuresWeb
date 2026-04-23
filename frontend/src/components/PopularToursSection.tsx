"use client";

import Link from "next/link";
import React, { useRef } from "react";
import TourCard from "@/components/TourCard";

interface PopularToursSectionProps {
    tours: any[];
}

export default function PopularToursSection({ tours }: PopularToursSectionProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollNext = () => {
        if (scrollContainerRef.current) {
            const firstChild = scrollContainerRef.current.firstElementChild as HTMLElement;
            const scrollAmount = firstChild ? firstChild.clientWidth + 24 : 400; // 24px gap
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    const scrollPrev = () => {
        if (scrollContainerRef.current) {
            const firstChild = scrollContainerRef.current.firstElementChild as HTMLElement;
            const scrollAmount = firstChild ? firstChild.clientWidth + 24 : 400;
            scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
        }
    };

    return (
        <section className="mx-auto mt-24 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
                <div>
                    <div className="inline-block px-4 py-1.5 bg-[#e8e9eb] text-gray-500 rounded-full text-[13px] font-semibold tracking-wide mb-6">
                        Popular
                    </div>
                    <h2 className="text-[32px] md:text-[40px] font-medium leading-tight text-gray-900">
                        Find your perfect trip experience
                    </h2>
                </div>
                <div className="hidden md:flex flex-col items-end gap-3 mt-6">
                    <Link
                        href="/trips"
                        className="font-medium text-[16px] text-black hover:text-gray-600 underline underline-offset-4 decoration-1"
                    >
                        View All Trips
                    </Link>
                    <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={scrollPrev}
                            className="bg-[#b3b3b3] hover:bg-[#999] text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                            aria-label="Previous tours"
                        >
                            <svg className="w-4 h-4 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={scrollNext}
                            className="bg-[#4d4d4d] hover:bg-[#333] text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                            aria-label="Next tours"
                        >
                            <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className="relative group">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .hide-scroll::-webkit-scrollbar {
                        display: none;
                    }
                    .hide-scroll {
                        -ms-overflow-style: none; /* IE and Edge */
                        scrollbar-width: none; /* Firefox */
                    }
                `}} />
                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 md:gap-6 overflow-x-auto md:overflow-x-hidden pb-4 hide-scroll snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0"
                >
                    {tours.map((tour: any) => (
                        <div key={tour._id} className="w-full min-w-[320px] max-w-[400px] md:min-w-0 md:max-w-none md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] snap-center shrink-0">
                            <TourCard tour={tour} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile View All Trips Link and Buttons */}
            <div className="mt-8 flex flex-col items-center gap-6 md:hidden">
                <div className="flex items-center gap-4">
                    <button
                        onClick={scrollPrev}
                        className="bg-[#b3b3b3] text-white w-10 h-10 rounded-full flex items-center justify-center"
                        aria-label="Previous tours"
                    >
                        <svg className="w-5 h-5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={scrollNext}
                        className="bg-[#4d4d4d] text-white w-10 h-10 rounded-full flex items-center justify-center"
                        aria-label="Next tours"
                    >
                        <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                <Link
                    href="/trips"
                    className="inline-block font-medium text-lg text-black underline underline-offset-4 decoration-1"
                >
                    View All Trips
                </Link>
            </div>
        </section>
    );
}
