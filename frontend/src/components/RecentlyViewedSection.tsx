"use client";

import React, { useEffect, useState, useRef } from "react";
import TourCard from "@/components/TourCard";

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
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
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
    <section className="mx-auto mt-20 sm:mt-24 md:mt-28 lg:mt-32 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10">
        <div>
          <div className="inline-block px-3.5 py-1 bg-[#F4F4F5] text-[#71717A] rounded-full text-[13px] font-medium tracking-normal mb-3">
            Recently Viewed
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[66px] font-normal leading-tight text-[#18181B] tracking-tight font-outfit">
            Still thinking about these?
          </h2>
          <div className="font-gochi text-[#4F6D38] text-4xl sm:text-5xl md:text-6xl lg:text-[66px] font-normal leading-tight mt-1 sm:mt-1.5">
            So are we.
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

      {/* Mobile View Scroll Buttons */}
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
      </div>
    </section>
  );
}
