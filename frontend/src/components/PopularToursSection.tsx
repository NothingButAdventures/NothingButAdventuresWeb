"use client";

import Link from "next/link";
import React, { useRef } from "react";
import TourCard from "@/components/TourCard";

interface PopularToursSectionProps {
    tours: any[];
}

export default function PopularToursSection({ tours }: PopularToursSectionProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = React.useState(false);
    const [canScrollRight, setCanScrollRight] = React.useState(true);

    const checkScrollLimits = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 5);
            setCanScrollRight(scrollWidth - scrollLeft - clientWidth > 5);
        }
    };

    React.useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            checkScrollLimits();
            container.addEventListener("scroll", checkScrollLimits);
            window.addEventListener("resize", checkScrollLimits);
            return () => {
                container.removeEventListener("scroll", checkScrollLimits);
                window.removeEventListener("resize", checkScrollLimits);
            };
        }
    }, [tours]);

    const scrollNext = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const firstChild = container.firstElementChild as HTMLElement;
            if (firstChild) {
                const gap = parseFloat(window.getComputedStyle(container).gap) || 24;
                const scrollAmount = firstChild.clientWidth + gap;
                container.scrollBy({ left: scrollAmount, behavior: "smooth" });
            }
        }
    };

    const scrollPrev = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const firstChild = container.firstElementChild as HTMLElement;
            if (firstChild) {
                const gap = parseFloat(window.getComputedStyle(container).gap) || 24;
                const scrollAmount = firstChild.clientWidth + gap;
                container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
            }
        }
    };

    return (
        <section className="mx-auto mt-24 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
                <div>
                    <div className="inline-block px-4 py-1.5 bg-[#DEECFF] text-gray-500 rounded-full text-[13px] font-semibold tracking-wide mb-6">
                        Popular Deals
                    </div>
                    <h2 className="text-6xl md:text-[68px] font-medium leading-tight text-[#3F3F42] tracking-tight">
                        Loved by travellers,<br />fueled by purpose
                    </h2>
                </div>
                <div className="hidden md:flex flex-col items-end justify-end mt-6">
                    <Link
                        href="/trips"
                        className="font-medium text-[16px] text-[#3F3F42] hover:text-gray-600 underline underline-offset-4 decoration-1"
                    >
                        View All Trips
                    </Link>
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

                {/* Left Arrow Button */}
                <button
                    onClick={scrollPrev}
                    className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 bg-[#b3b3b3] hover:bg-[#999] text-white w-12 h-12 rounded-full items-center justify-center cursor-pointer transition-all duration-200 ${
                        canScrollLeft ? "opacity-0 group-hover:opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                    aria-label="Previous tours"
                >
                    <svg className="w-5 h-5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Right Arrow Button */}
                <button
                    onClick={scrollNext}
                    className={`hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-30 bg-[#3F3F42] hover:bg-[#3F3F42] text-white w-12 h-12 rounded-full items-center justify-center cursor-pointer transition-all duration-200 ${
                        canScrollRight ? "opacity-0 group-hover:opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                    aria-label="Next tours"
                >
                    <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 md:gap-6 overflow-x-auto pb-4 hide-scroll snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0"
                >
                    {tours.map((tour: any) => (
                        <div key={tour._id} className="w-[calc((100%-16px)/1.3)] md:w-[calc((100%-72px)/3.6)] snap-start shrink-0">
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
                        className="bg-[#3F3F42] text-white w-10 h-10 rounded-full flex items-center justify-center"
                        aria-label="Next tours"
                    >
                        <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                <Link
                    href="/trips"
                    className="inline-block font-medium text-lg text-[#3F3F42] underline underline-offset-4 decoration-1"
                >
                    View All Trips
                </Link>
            </div>
        </section>
    );
}
