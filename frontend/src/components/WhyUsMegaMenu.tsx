"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface WhyUsMegaMenuProps {
  isHovered: boolean;
  closeMenu?: () => void;
}

export default function WhyUsMegaMenu({ isHovered, closeMenu }: WhyUsMegaMenuProps) {
  if (!isHovered) return null;

  return (
    <div
      className="absolute left-0 top-full z-[60] w-full px-2 pt-0.5 pb-8 pointer-events-auto -mt-1 cursor-pointer"
      onClick={closeMenu}
      onMouseLeave={closeMenu}
    >
      <div className="w-full relative cursor-default" onClick={(e) => e.stopPropagation()}>
        {/* Pointer Triangle */}
        <div
          className="absolute -top-2 left-[62%] -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l border-t border-gray-200 z-50 shadow-xs"
        />

        {/* Main Popup White Card */}
        <div
          className="relative rounded-xl bg-white p-6 shadow-[0px_1px_75px_0px_rgba(0,0,0,0.1)] border border-gray-100/80 overflow-hidden font-outfit w-full cursor-default"
          onMouseLeave={closeMenu}
        >
          {/* Header Row: "Why Us" title + "See More" button */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-gochi text-[28px] text-[#3B5D1B] font-normal leading-tight">
              Why Us
            </h2>
            <div className="flex items-center gap-1.5">
              <Link
                href="/why-nba"
                onClick={closeMenu}
                className="inline-flex items-center justify-center bg-[#1A1A1A] text-white px-5 py-2 rounded-full text-[13px] font-medium hover:bg-black transition-all"
              >
                See More
              </Link>
              <Link
                href="/why-nba"
                onClick={closeMenu}
                className="inline-flex items-center justify-center bg-[#1A1A1A] text-white w-[36px] h-[36px] rounded-full hover:bg-black transition-all shrink-0"
                aria-label="See More"
              >
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 4-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 items-stretch min-h-[400px]">

            {/* ── Card 01 — Why NBA ── */}
            <div className="flex flex-col justify-between rounded-xl bg-[#f0f2f5] p-5 transition-all duration-300 hover:bg-[#ebedf1]">
              <div>
                <span className="text-[13px] text-[#8E8E93] tracking-wider">01</span>
                <h3 className="font-gochi text-[24px] text-[#1A1A1A] mt-0.5 leading-tight font-normal">
                  Why NBA
                </h3>
                <div className="w-8 h-[2.5px] bg-[#1A1A1A] mt-2 mb-5" />

                {/* Feature list items */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white rounded-md shrink-0" />
                    <span className="text-[13px] text-[#3F3F42] leading-snug font-outfit">
                      Hold Your Space for 2 days
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white rounded-md shrink-0" />
                    <span className="text-[13px] text-[#3F3F42] leading-snug font-outfit">
                      Payment in chunks
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white rounded-md shrink-0" />
                    <span className="text-[13px] text-[#3F3F42] leading-snug font-outfit">
                      Reschedule Your Trips for free
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white rounded-md shrink-0" />
                    <span className="text-[13px] text-[#3F3F42] leading-snug font-outfit">
                      Hold Your Space
                    </span>
                  </div>
                </div>
              </div>

              {/* Read More button */}
              <div className="flex items-center gap-1.5 mt-5">
                <Link
                  href="/why-nba"
                  onClick={closeMenu}
                  className="inline-flex items-center justify-center bg-[#1A1A1A] text-white px-4 py-2 rounded-full text-[12px] font-medium hover:bg-black transition-all"
                >
                  Read More
                </Link>
                <Link
                  href="/why-nba"
                  onClick={closeMenu}
                  className="inline-flex items-center justify-center bg-[#1A1A1A] text-white w-[32px] h-[32px] rounded-full hover:bg-black transition-all shrink-0"
                  aria-label="Read More"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* ── Card 02 — About Us ── */}
            <Link
              href="/about-us"
              onClick={closeMenu}
              className="flex flex-col rounded-xl bg-[#f0f2f5] p-5 hover:bg-[#ebedf1] transition-all duration-300 group"
            >
              <span className="text-[13px] text-[#8E8E93] tracking-wider">02</span>
              <h3 className="font-gochi text-[24px] text-[#1A1A1A] mt-0.5 leading-tight font-normal">
                About Us
              </h3>
              <div className="w-8 h-[2.5px] bg-[#1A1A1A] mt-2 mb-4" />

              {/* Image area */}
              <div className="w-full flex-1 rounded-lg overflow-hidden bg-white min-h-[180px]">
                <img
                  src="/mountain_hikers.png"
                  alt="About Us"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.onerror = null;
                    target.src = "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=600&auto=format&fit=crop";
                  }}
                />
              </div>
            </Link>

            {/* ── Column 3: Cards 03 & 04 stacked ── */}
            <div className="flex flex-col gap-3.5 h-full">
              {/* Card 03 — NBA Club */}
              <Link
                href="/nba-club"
                onClick={closeMenu}
                className="flex flex-col flex-1 rounded-xl bg-[#f0f2f5] p-5 hover:bg-[#ebedf1] transition-all duration-300 group"
              >
                <span className="text-[13px] text-[#8E8E93] tracking-wider">03</span>
                <h3 className="font-gochi text-[24px] text-[#1A1A1A] mt-0.5 leading-tight font-normal">
                  NBA Club
                </h3>
                <div className="w-8 h-[2.5px] bg-[#1A1A1A] mt-2 mb-3" />
                <p className="text-[12.5px] text-[#3F3F42] leading-relaxed font-outfit">
                  Priority access. Exclusive Perks. Unforgettable rewards. Travel with us three times or more and unlock your place in our all new club- created for the world&apos;s most adventurous travellers.
                </p>
              </Link>

              {/* Card 04 — Furkind Initiative */}
              <Link
                href="/why-nba"
                onClick={closeMenu}
                className="flex flex-col flex-1 rounded-xl bg-[#f0f2f5] p-5 hover:bg-[#ebedf1] transition-all duration-300 group"
              >
                <span className="text-[13px] text-[#8E8E93] tracking-wider">04</span>
                <h3 className="font-gochi text-[24px] text-[#1A1A1A] mt-0.5 leading-tight font-normal">
                  Furkind Initiative
                </h3>
                <div className="w-8 h-[2.5px] bg-[#1A1A1A] mt-2 mb-3" />
              </Link>
            </div>

            {/* ── Card 05 — The Living Planet (full height) ── */}
            <Link
              href="/tree-planting"
              onClick={closeMenu}
              className="flex flex-col rounded-xl bg-[#f0f2f5] p-5 hover:bg-[#ebedf1] transition-all duration-300 group"
            >
              <span className="text-[13px] text-[#8E8E93] tracking-wider">05</span>
              <h3 className="font-gochi text-[24px] text-[#1A1A1A] mt-0.5 leading-tight font-normal">
                The Living Planet
              </h3>
              <div className="w-8 h-[2.5px] bg-[#1A1A1A] mt-2 mb-4" />

              {/* Image area */}
              <div className="w-full flex-1 rounded-lg overflow-hidden bg-white min-h-[180px]">
                <img
                  src="/tree_planting_story.png"
                  alt="The Living Planet"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.onerror = null;
                    target.src = "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=600&auto=format&fit=crop";
                  }}
                />
              </div>
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}
