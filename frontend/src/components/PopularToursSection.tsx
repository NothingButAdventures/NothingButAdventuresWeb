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

    const displayTours = (tours && tours.length > 0) ? tours : [
      {
        _id: "demo-1",
        name: "Purani Dilli Adventure Full Name",
        durationDays: 12,
        slug: "purani-dilli-adventure",
        tourCode: "DEL123",
        pricing: { startingPrice: 2399, currency: "USD" },
        startLocation: { name: "Delhi" },
        endLocation: { name: "Jaipur" },
        destinationsCount: 3,
        travelStyle: { name: "Classic" },
        images: ["/mountain_hikers.png"],
        nextDepartureDate: "2026-08-29",
      },
      {
        _id: "demo-2",
        name: "Purani Dilli Adventure Full Name",
        durationDays: 12,
        slug: "purani-dilli-adventure-2",
        tourCode: "DEL124",
        pricing: { startingPrice: 2399, currency: "USD" },
        startLocation: { name: "Delhi" },
        endLocation: { name: "Jaipur" },
        destinationsCount: 3,
        travelStyle: { name: "Classic" },
        images: ["/mountain_hikers.png"],
        nextDepartureDate: "2026-08-29",
      },
      {
        _id: "demo-3",
        name: "Purani Dilli Adventure Full Name",
        durationDays: 12,
        slug: "purani-dilli-adventure-3",
        tourCode: "DEL125",
        pricing: { startingPrice: 2399, currency: "USD" },
        startLocation: { name: "Delhi" },
        endLocation: { name: "Jaipur" },
        destinationsCount: 3,
        travelStyle: { name: "Classic" },
        images: ["/mountain_hikers.png"],
        nextDepartureDate: "2026-08-29",
      },
      {
        _id: "demo-4",
        name: "Purani Dilli Adventure Full Name",
        durationDays: 12,
        slug: "purani-dilli-adventure-4",
        tourCode: "DEL126",
        pricing: { startingPrice: 2399, currency: "USD" },
        startLocation: { name: "Delhi" },
        endLocation: { name: "Jaipur" },
        destinationsCount: 3,
        travelStyle: { name: "Classic" },
        images: ["/mountain_hikers.png"],
        nextDepartureDate: "2026-08-29",
      },
    ];

    return (
        <section className="w-full relative font-outfit mt-[80px] md:mt-[60px] lg:mt-[90px] xl:mt-[127px] mb-0 md:mb-12 xl:mb-20">
            {/* Mobile Header Area (#5640:5193) */}
            <div className="block md:hidden mb-6">
                {/* Badge (#5640:5190, width: 82.46px, height: 17.52px) */}
                <div className="inline-flex items-center justify-center w-[82.46px] h-[17.52px] bg-[rgba(26,26,26,0.05)] text-[rgba(26,26,26,0.55)] rounded-[69.54px] text-[8.85px] font-medium tracking-normal mb-[10px] font-outfit">
                    Popular Tours
                </div>

                {/* Title (#5640:5192, 30.34px font size, Outfit + Gochi Hand) */}
                <h2 className="text-[30.34px] font-normal leading-[1.12] text-[#1A1A1A] tracking-normal font-outfit mb-[18px]">
                    Loved by travellers, fuelled <br />
                    <span className="font-gochi text-[#254B02]">by purpose</span>
                </h2>

                {/* Action Bar with View All Trips & Nav Controls (#5640:5893, height: 30px) */}
                <div className="flex items-center justify-between w-full">
                    <Link
                        href="/trips"
                        className="inline-flex items-center justify-center w-[108px] h-[30px] bg-[#1A1A1A] hover:bg-black text-white rounded-[40px] text-[14px] font-normal tracking-[-0.0137em] font-outfit transition-colors"
                    >
                        View All Trips
                    </Link>

                    <div className="flex items-center gap-[5px]">
                        <button
                            onClick={scrollPrev}
                            disabled={!canScrollLeft}
                            className={`w-[28px] h-[28px] rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                canScrollLeft
                                    ? "bg-[#1A1A1A] hover:bg-black text-white"
                                    : "bg-[#B5B9B1]/60 text-white/70 cursor-not-allowed"
                            }`}
                            aria-label="Previous tours"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.6}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={scrollNext}
                            disabled={!canScrollRight}
                            className={`w-[28px] h-[28px] rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                canScrollRight
                                    ? "bg-[#1A1A1A] hover:bg-black text-white"
                                    : "bg-[#B5B9B1]/60 text-white/70 cursor-not-allowed"
                            }`}
                            aria-label="Next tours"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.6}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop Header Area (#5640:7509 on 785px / #5091:7499 on 1280px) */}
            <div className="hidden md:flex flex-col md:flex-row md:items-end justify-between mb-5 md:mb-[22px] lg:mb-[30px] xl:mb-10">
                <div>
                    {/* Badge (#5640:7510 on 785px: 79.73px x 14.72px, font 8.59px / 1280px: 130px x 24px, font 14px) */}
                    <div className="inline-flex items-center justify-center w-[79.7px] lg:w-[105px] xl:w-[130px] h-[14.7px] lg:h-[19px] xl:h-[24px] bg-[rgba(26,26,26,0.05)] text-[rgba(26,26,26,0.55)] rounded-[67px] xl:rounded-[110px] text-[8.59px] lg:text-[11px] xl:text-[14px] font-medium tracking-normal mb-[8.6px] lg:mb-[11px] xl:mb-[14px] font-outfit">
                        Popular Tours
                    </div>
                    {/* Title (#5640:7512 on 785px: 29.44px Outfit / 1280px: 48px Outfit) */}
                    <h2 className="text-[29.44px] lg:text-[38px] xl:text-[48px] font-normal leading-[36.8px] lg:leading-[48px] xl:leading-[60px] text-[#1A1A1A] tracking-normal font-outfit">
                        Loved by travellers, fuelled <br className="hidden sm:inline" />
                        <span className="font-gochi text-[#254B02]">by purpose</span>
                    </h2>
                </div>

                {/* View All & Controls Top Right (#5640:8240 on 785px / #5091:8240 on 1280px) */}
                <div className="flex flex-col items-start md:items-end gap-[6.1px] lg:gap-[8px] xl:gap-2.5 mt-4 md:mt-0">
                    <Link
                        href="/trips"
                        className="text-[9.81px] lg:text-[13px] xl:text-[16px] font-normal text-[#1A1A1A] underline underline-offset-4 hover:opacity-80 transition font-outfit"
                    >
                        View All Trips
                    </Link>
                    <div className="flex items-center gap-[3px] lg:gap-[4px] xl:gap-[5px]">
                        <button
                            onClick={scrollPrev}
                            disabled={!canScrollLeft}
                            className={`w-[17.17px] h-[17.17px] lg:w-[22px] lg:h-[22px] xl:w-[28px] xl:h-[28px] rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                canScrollLeft
                                    ? "bg-[#1A1A1A] hover:bg-black text-white"
                                    : "bg-[#B5B9B1]/60 text-white/70 cursor-not-allowed"
                            }`}
                            aria-label="Previous tours"
                        >
                            <svg className="w-[9px] h-[9px] lg:w-[11px] lg:h-[11px] xl:w-3.5 xl:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.6}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={scrollNext}
                            disabled={!canScrollRight}
                            className={`w-[17.17px] h-[17.17px] lg:w-[22px] lg:h-[22px] xl:w-[28px] xl:h-[28px] rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                canScrollRight
                                    ? "bg-[#1A1A1A] hover:bg-black text-white"
                                    : "bg-[#B5B9B1]/60 text-white/70 cursor-not-allowed"
                            }`}
                            aria-label="Next tours"
                            >
                            <svg className="w-[9px] h-[9px] lg:w-[11px] lg:h-[11px] xl:w-3.5 xl:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.6}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Cards Slider (#5640:7236 on 785px: 189.5px card width / #5091:7503 on 1280px: 309px card width) */}
            <div className="relative group">
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
            .hide-scroll::-webkit-scrollbar {
              display: none;
            }
            .hide-scroll {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `,
                    }}
                />

                <div
                    ref={scrollContainerRef}
                    className="flex gap-3 sm:gap-4 md:gap-[13.5px] lg:gap-[18px] xl:gap-[22px] overflow-x-auto pb-4 hide-scroll snap-x snap-mandatory"
                >
                    {displayTours.map((tour: any) => (
                        <div
                            key={tour._id || tour.id}
                            className="w-[262px] min-w-[262px] sm:w-[280px] sm:min-w-[280px] md:w-[calc((100%-40.5px)/3.7)] md:min-w-[calc((100%-40.5px)/3.7)] lg:w-[calc((100%-54px)/3.7)] lg:min-w-[calc((100%-54px)/3.7)] xl:w-[calc((100%-66px)/3.7)] xl:min-w-[calc((100%-66px)/3.7)] snap-start shrink-0"
                        >
                            <TourCard tour={tour} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
