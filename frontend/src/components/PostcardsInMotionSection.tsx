"use client";

import React, { useRef } from "react";
import Link from "next/link";

const hardcodedPostcards = [
    {
        id: 1,
        title: "Desert Safari",
        subtitle: "100+ successful planed trips",
        image: "https://images.unsplash.com/photo-1545645607-775b111ad5a4?q=80&w=1200&auto=format&fit=crop",
        link: "#",
    },
    {
        id: 2,
        title: "K2 Treck",
        subtitle: "40+ successful planed trips",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop",
        link: "#",
    },
    {
        id: 3,
        title: "Luxurious Jodhpur",
        subtitle: "500+ successful planed trips",
        image: "https://images.unsplash.com/photo-1598418012643-4f9db2ea6cbb?q=80&w=1200&auto=format&fit=crop",
        link: "#",
    },
    {
        id: 4,
        title: "Jungle Trails",
        subtitle: "300+ successful planed trips",
        image: "https://images.unsplash.com/photo-1536697246787-1fa68bc3e5ed?q=80&w=1200&auto=format&fit=crop",
        link: "#",
    }
];

export default function PostcardsInMotionSection() {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = 400;
            if (direction === "left") {
                scrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
            } else {
                scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
            }
        }
    };

    return (
        <section className="md:-mx-6 mt-32 mb-16 relative">
            <div className="mb-10 px-4 md:px-6">
                <div className="inline-block px-5 py-2 bg-[#e8e9eb] text-gray-500 rounded-full text-[14px] font-semibold tracking-wide mb-6">
                    Tours Snippets
                </div>
                <h2 className="text-[48px] md:text-[56px] font-medium leading-[1.1] text-black">
                    Postcards in Motion
                </h2>
            </div>

            <div className="relative group w-full">
                {/* Left Arrow */}
                <button
                    onClick={() => scroll("left")}
                    className="absolute left-1 md:left-3 bottom-9 md:bottom-10 z-10 w-5 h-8 md:w-6 md:h-10 bg-[#111] text-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                >
                    <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

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
                    className="flex gap-6 overflow-x-auto pb-4 hide-scroll snap-x snap-mandatory px-4 md:px-6 lg:px-6"
                >
                    {hardcodedPostcards.map((card) => (
                        <Link
                            key={card.id}
                            href={card.link}
                            className="relative min-w-[300px] md:min-w-[340px] w-full max-w-[360px] h-[450px] md:h-[500px] rounded-[28px] overflow-hidden snap-center shrink-0 block group/card shadow-sm"
                        >
                            <img
                                src={card.image}
                                alt={card.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover/card:scale-105"
                            />

                            {/* Top Right Arrow Pill */}
                            <div className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg transition-transform group-hover/card:scale-110 z-20">
                                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19L19 5M19 5v10M19 5H9" />
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

                {/* Right Arrow */}
                <button
                    onClick={() => scroll("right")}
                    className="absolute right-1 md:right-3 bottom-9 md:bottom-10 z-10 w-5 h-8 md:w-6 md:h-10 bg-[#111] text-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                >
                    <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </section>
    );
}
