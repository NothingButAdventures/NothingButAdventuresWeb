"use client";

import React, { useRef, useState, useEffect } from "react";
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
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScrollLimits = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 15);
            setCanScrollRight(scrollWidth - scrollLeft - clientWidth > 15);
        }
    };

    useEffect(() => {
        const container = scrollRef.current;
        if (container) {
            checkScrollLimits();
            container.addEventListener("scroll", checkScrollLimits);
            window.addEventListener("resize", checkScrollLimits);
            return () => {
                container.removeEventListener("scroll", checkScrollLimits);
                window.removeEventListener("resize", checkScrollLimits);
            };
        }
    }, []);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = scrollRef.current.clientWidth * 0.75;
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth"
            });
        }
    };

    return (
        <section className="mt-16 sm:mt-20 md:mt-24 lg:mt-28 mb-16 relative font-outfit">
            {/* Header Area (#5091:7531) */}
            <div className="flex flex-col mb-8 md:mb-10">
                <div className="inline-flex items-center justify-center w-fit px-3.5 py-1 bg-[rgba(26,26,26,0.05)] text-[rgba(26,26,26,0.55)] rounded-[110px] text-[14px] font-medium tracking-normal mb-3 font-outfit">
                    Tours Snippets
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-[44px] lg:text-[48px] font-normal leading-[1.15] text-[#1A1A1A] tracking-tight font-outfit">
                    Postcards in <span className="font-gochi text-[#254B02]">Motion</span>
                </h2>
            </div>

            {/* Carousel Container (#5091:7535: gap: 16px, cards: 290x404) */}
            <div className="relative group/carousel w-full">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .hide-scroll::-webkit-scrollbar {
                        display: none;
                    }
                    .hide-scroll {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}} />

                {/* Left Navigation Arrow */}
                {canScrollLeft && (
                    <button
                        onClick={() => scroll("left")}
                        className="absolute -left-3 md:-left-5 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 bg-white/95 text-[#1A1A1A] rounded-full flex items-center justify-center transition-all duration-300 z-30 hover:scale-105 shadow-[0px_4px_16px_rgba(0,0,0,0.15)] cursor-pointer"
                        aria-label="Scroll left"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}

                {/* Right Navigation Arrow */}
                {canScrollRight && (
                    <button
                        onClick={() => scroll("right")}
                        className="absolute -right-3 md:-right-5 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 bg-white/95 text-[#1A1A1A] rounded-full flex items-center justify-center transition-all duration-300 z-30 hover:scale-105 shadow-[0px_4px_16px_rgba(0,0,0,0.15)] cursor-pointer"
                        aria-label="Scroll right"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}

                {/* Cards Container */}
                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto pb-4 hide-scroll snap-x snap-mandatory"
                >
                    {hardcodedPostcards.map((card) => (
                        <Link
                            key={card.id}
                            href={card.link}
                            className="relative w-[80%] min-w-[80%] sm:w-[calc((100%-16px)/2)] sm:min-w-[calc((100%-16px)/2)] md:w-[calc((100%-32px)/3)] md:min-w-[calc((100%-32px)/3)] lg:w-[calc((100%-48px)/4)] lg:min-w-[calc((100%-48px)/4)] h-[380px] sm:h-[395px] lg:h-[404px] rounded-[12px] overflow-hidden snap-start shrink-0 block group/card shadow-sm hover:shadow-md transition-shadow duration-300"
                        >
                            {/* Card Background Image (#5091:7536) */}
                            <img
                                src={card.image}
                                alt={card.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover/card:scale-105"
                            />

                            {/* Center Play Icon (using ppc.svg) */}
                            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                                <img
                                    src="/ppc.svg"
                                    alt="Play"
                                    className="w-[74px] h-[74px] sm:w-[84px] sm:h-[84px] lg:w-[92px] lg:h-[92px] drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-transform duration-300 group-hover/card:scale-108"
                                />
                            </div>

                            {/* Bottom Gradient Overlay (#5091:7537: y=283, h=121, linear-gradient(180deg, rgba(0,0,0,0) 12%, rgba(0,0,0,1) 100%)) */}
                            <div
                                className="absolute bottom-0 left-0 right-0 h-[135px] pointer-events-none z-10 rounded-b-[12px]"
                                style={{
                                    background: "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.45) 30%, rgba(0, 0, 0, 0.95) 100%)"
                                }}
                            ></div>

                            {/* Text Content (#5091:7538, #5091:7539 at x=22, y=343 / y=357) */}
                            <div className="absolute bottom-[20px] left-[22px] right-[22px] z-20 flex flex-col justify-end pointer-events-none">
                                <h3 className="text-white text-[20px] font-normal leading-tight font-outfit tracking-[-0.01em] drop-shadow-sm">
                                    {card.title}
                                </h3>
                                <p className="text-white/60 text-[12px] font-normal leading-tight font-outfit tracking-normal mt-1 drop-shadow-xs">
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

