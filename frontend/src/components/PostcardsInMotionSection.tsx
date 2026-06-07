"use client";

import React, { useRef } from "react";
import Link from "next/link";

const hardcodedPostcards = [
    {
        id: 1,
        title: "Desert Safari",
        subtitle: "100+ successful planed trips",
        image: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=800&auto=format&fit=crop",
        link: "#",
    },
    {
        id: 2,
        title: "K2 Treck",
        subtitle: "40+ successful planed trips",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop",
        link: "#",
    },
    {
        id: 3,
        title: "Luxurious Jodhpur",
        subtitle: "500+ successful planed trips",
        image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&auto=format&fit=crop",
        link: "#",
    },
    {
        id: 4,
        title: "Jungle Trails",
        subtitle: "300+ successful planed trips",
        image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop",
        link: "#",
    }
];

export default function PostcardsInMotionSection() {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const firstChild = container.firstElementChild as HTMLElement;
            if (firstChild) {
                const gap = parseFloat(window.getComputedStyle(container).gap) || 24;
                const scrollAmount = firstChild.clientWidth + gap;
                if (direction === "left") {
                    container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
                } else {
                    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
                }
            }
        }
    };

    return (
        <section className="md:-mx-6 mt-32 mb-16 relative">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 px-4 md:px-6">
                <div>
                    <div className="inline-block px-5 py-2 bg-[#DEECFF] text-gray-500 rounded-full text-[14px] font-semibold tracking-wide mb-6">
                        Tours Snipits
                    </div>
                    <h2 className="text-6xl md:text-[68px] font-medium leading-tight text-[#3F3F42] tracking-tight">
                        Postcards in Motion
                    </h2>
                </div>
                <div className="hidden md:flex flex-col items-end gap-3 mt-6 md:mt-0">
                    <Link
                        href="/trips"
                        className="font-medium text-[16px] text-[#3F3F42] hover:text-gray-600 underline underline-offset-4 decoration-1"
                    >
                        View All Trips
                    </Link>
                    <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={() => scroll("left")}
                            className="bg-[#b3b3b3] hover:bg-[#999] text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                            aria-label="Previous tours"
                        >
                            <svg className="w-4 h-4 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            className="bg-[#3F3F42] hover:bg-[#3F3F42] text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                            aria-label="Next tours"
                        >
                            <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className="relative group w-full px-4 md:px-6">
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

                {/* Scroll Container */}
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto pb-4 hide-scroll snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0"
                >
                    {hardcodedPostcards.map((card) => (
                        <Link
                            key={card.id}
                            href={card.link}
                            className="relative w-[calc((100%-16px)/1.3)] md:w-[calc((100%-24px)/2.4)] lg:w-[calc((100%-72px)/4)] lg:min-w-[calc((100%-72px)/4)] h-[450px] md:h-[500px] rounded-[28px] overflow-hidden snap-start shrink-0 block group/card shadow-sm"
                        >
                            <img
                                src={card.image}
                                alt={card.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover/card:scale-105"
                            />

                            {/* Top Right Arrow Pill */}
                            <div
                                className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center transition-all duration-300 group-hover/card:scale-110 z-20"
                                style={{ border: '2px solid #512AA7', boxShadow: '0 0 0 2.5px white' }}
                            >
                                <svg className="w-5 h-5 transition-transform duration-300 group-hover/card:rotate-45" fill="none" stroke="#512AA7" viewBox="0 0 24 24" style={{ stroke: '#512AA7' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 19L19 5M19 5v10M19 5H9" />
                                </svg>
                            </div>

                            {/* Bottom Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none z-10"></div>

                            {/* Text content */}
                            <div className="absolute bottom-6 left-6 right-6 z-20">
                                <h3 className="text-white text-[24px] font-bold leading-tight mb-1">
                                    {card.title}
                                </h3>
                                <p className="text-white/80 text-[15px] font-medium">
                                    {card.subtitle}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Mobile View All Trips Link and Buttons */}
            <div className="mt-8 flex flex-col items-center gap-6 md:hidden">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => scroll("left")}
                        className="bg-[#b3b3b3] text-white w-10 h-10 rounded-full flex items-center justify-center"
                        aria-label="Previous tours"
                    >
                        <svg className="w-5 h-5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => scroll("right")}
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
