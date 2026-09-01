"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import TourCard from "@/components/TourCard";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import { api } from "@/lib/api";

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

    // Fetch real tours from DB when localStorage is empty
    fetch(`${api.baseURL}${api.endpoints.tours.getAll}?limit=6`)
      .then((res) => res.json())
      .then((data) => {
        const fetchedTours = data?.data?.tours || data?.data || [];
        if (fetchedTours.length > 0) {
          setTours(fetchedTours);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch tours for recently viewed section:", err);
      });
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
    <section className="w-full relative font-outfit mt-8 sm:mt-16 md:mt-20 xl:mt-[127px] mb-12 sm:mb-20">
      {/* Mobile Header Area (#5640:5888) */}
      <div className="block md:hidden mb-6">
        {/* Badge (#5640:5890, width: 82.46px, height: 17.52px) */}
        <div className="inline-flex items-center justify-center w-[82.46px] h-[17.52px] bg-[rgba(26,26,26,0.05)] text-[rgba(26,26,26,0.55)] rounded-[69.54px] text-[8.85px] font-medium tracking-normal mb-[10px] font-outfit">
          Recently Viewed
        </div>

        {/* Title (#5640:5892, 30.34px font size, Outfit + Gochi Hand) */}
        <h2 className="text-[30.34px] font-normal leading-[1.12] text-[#1A1A1A] tracking-normal font-outfit mb-[18px]">
          Still thinking about these? <br />
          <span className="font-gochi text-[#254B02]">So are we.</span>
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
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.6}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
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
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.6}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Header Area (#5091:7222) */}
      <div className="hidden md:flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-9 md:mb-10">
        <div>
          {/* Badge (EL-36f1c12d, width: 130px, height: 24px) */}
          <div className="inline-flex items-center justify-center w-[130px] h-[24px] bg-[rgba(26,26,26,0.05)] text-[rgba(26,26,26,0.55)] rounded-[110px] text-[14px] font-medium tracking-normal mb-[14px] font-outfit">
            Recently Viewed
          </div>
          {/* Title (#5091:7225, 48px Outfit + Gochi Hand) */}
          <h2 className="text-[32px] sm:text-[38px] md:text-[44px] xl:text-[48px] font-normal leading-[1.15] xl:leading-[56px] text-[#1A1A1A] tracking-normal font-outfit">
            Still thinking about these? <br className="hidden sm:inline" />
            <span className="font-gochi text-[#254B02]">So are we.</span>
          </h2>
        </div>

        {/* View All & Controls Top Right (#5091:8226) */}
        <div className="flex flex-col items-start md:items-end gap-2.5 mt-4 md:mt-0">
          <Link
            href="/trips"
            className="text-[16px] font-normal text-[#1A1A1A] underline underline-offset-4 hover:opacity-80 transition font-outfit"
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
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.6}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
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
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.6}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Cards Slider (#5091:7226 / #5640:5908, 262px on mobile / 309px on desktop) */}
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
          className="flex gap-3 sm:gap-5 md:gap-[22px] overflow-x-auto pb-4 hide-scroll snap-x snap-mandatory"
        >
          {tours.map((tour: any) => (
            <div
              key={tour._id}
              className="w-[262px] sm:w-[300px] md:w-[309px] xl:w-[309px] min-w-[262px] sm:min-w-[300px] md:min-w-[309px] snap-start shrink-0"
            >
              <TourCard tour={tour} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
