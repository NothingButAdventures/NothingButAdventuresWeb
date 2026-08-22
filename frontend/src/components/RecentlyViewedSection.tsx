"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import TourCard from "@/components/TourCard";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@phosphor-icons/react";

export default function RecentlyViewedSection() {
  const [tours, setTours] = useState<any[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const recentlyViewedStr = localStorage.getItem("nba-recently-viewed");
      if (recentlyViewedStr) {
        const parsed = JSON.parse(recentlyViewedStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTours(parsed);
          return;
        }
      }
    } catch (err) {
      console.error("Failed to read recently viewed tours:", err);
    }

    // Fallback tours for preview when localStorage is empty
    setTours([
      {
        _id: "demo-1",
        title: "Purani Dilli Adventure Full Name",
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
        title: "Purani Dilli Adventure Full Name",
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
        title: "Purani Dilli Adventure Full Name",
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
        title: "Purani Dilli Adventure Full Name",
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
    ]);
  }, []);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollLimits = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollWidth - scrollLeft - clientWidth > 5);
    }
  };

  useEffect(() => {
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

  if (tours.length === 0) return null;

  return (
    <section className="mx-auto mt-20 sm:mt-24 mb-16 relative font-outfit">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <div className="inline-flex items-center justify-center px-3.5 py-1 bg-[rgba(26,26,26,0.05)] text-[rgba(26,26,26,0.55)] rounded-[110px] text-[14px] font-medium tracking-normal mb-3 font-outfit">
            Recently Viewed
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-[44px] lg:text-[48px] font-normal leading-tight text-[#1A1A1A] tracking-tight font-outfit">
            Still thinking about these? <br className="hidden sm:inline" />
            <span className="font-gochi text-[#254B02]">So are we.</span>
          </h2>
        </div>

        {/* View All & Controls Top Right */}
        <div className="flex flex-col items-start md:items-end gap-2.5 mt-4 md:mt-0">
          <Link
            href="/trips"
            className="text-[15px] sm:text-[16px] font-normal text-[#1A1A1A] underline underline-offset-4 hover:opacity-80 transition font-outfit"
          >
            View All Trips
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={scrollPrev}
              disabled={!canScrollLeft}
              className={`w-[30px] h-[30px] sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                canScrollLeft
                  ? "bg-[#9C9C9C] hover:bg-[#7E7E7E] text-white"
                  : "bg-[#9C9C9C]/70 text-white/80 cursor-not-allowed"
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
              className={`w-[30px] h-[30px] sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                canScrollRight
                  ? "bg-[#1A1A1A] hover:bg-black text-white"
                  : "bg-[#1A1A1A]/70 text-white/80 cursor-not-allowed"
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
          className="flex gap-4 sm:gap-5 md:gap-6 overflow-x-auto pb-4 hide-scroll snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0"
        >
          {tours.map((tour: any) => (
            <div
              key={tour._id}
              className="w-[calc((100%-16px)/1.3)] sm:w-[calc((100%-32px)/2.3)] md:w-[calc((100%-72px)/3.6)] snap-start shrink-0"
            >
              <TourCard tour={tour} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
