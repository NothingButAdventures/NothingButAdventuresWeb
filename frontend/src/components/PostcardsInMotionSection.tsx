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
        <section className="md:-mx-6 mt-20 sm:mt-24 md:mt-28 lg:mt-32 mb-16 relative">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 px-4 md:px-6">
                <div>
                    <div className="inline-block px-3.5 py-1 bg-[#F4F4F5] text-[#71717A] rounded-full text-[13px] font-medium tracking-normal mb-3">
                        Tours Snippets
                    </div>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[66px] font-normal leading-tight text-[#18181B] tracking-tight font-outfit">
                        Postcards in <span className="font-gochi text-[#4F6D38]">motion</span>
                    </h2>
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
                            className="relative w-[calc((100%-16px)/1.3)] md:w-[calc((100%-24px)/2.4)] lg:w-[calc((100%-72px)/4)] lg:min-w-[calc((100%-72px)/4)] h-[450px] md:h-[500px] rounded-2xl overflow-hidden snap-start shrink-0 block group/card shadow-xs"
                        >
                            <img
                                src={card.image}
                                alt={card.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover/card:scale-105"
                            />

                            {/* Top Right Arrow Pill */}
                            <div
                                className="absolute top-5 right-5 w-10 h-10 bg-white/90 backdrop-blur-xs text-[#18181B] rounded-full flex items-center justify-center transition-all duration-300 group-hover/card:scale-110 z-20 shadow-md"
                            >
                                <svg className="w-4.5 h-4.5 transition-transform duration-300 group-hover/card:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
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
        </section>
    );
}
