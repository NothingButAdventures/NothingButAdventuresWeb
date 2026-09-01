"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";

const hardcodedPostcards = [
  {
    id: 1,
    title: "Desert Safari",
    subtitle: "100+ successful planed trips",
    image:
      "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=800&auto=format&fit=crop",
    link: "#",
  },
  {
    id: 2,
    title: "K2 Treck",
    subtitle: "40+ successful planed trips",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop",
    link: "#",
  },
  {
    id: 3,
    title: "Luxurious Jodhpur",
    subtitle: "500+ successful planed trips",
    image:
      "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&auto=format&fit=crop",
    link: "#",
  },
  {
    id: 4,
    title: "Jungle Trails",
    subtitle: "300+ successful planed trips",
    image:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop",
    link: "#",
  },
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
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="w-full relative font-outfit mt-10 sm:mt-16 md:mt-20 xl:mt-[120px] mb-12 sm:mb-20">
      {/* Mobile Header Area (#5640:5568, #5640:5588) */}
      <div className="block md:hidden mb-5">
        {/* Badge (#5640:5569, width: 73.33px, height: 15.17px) */}
        <div className="inline-flex items-center justify-center w-[73.33px] h-[15.17px] bg-[rgba(26,26,26,0.05)] text-[rgba(26,26,26,0.55)] rounded-[69.54px] text-[8.85px] font-medium tracking-normal mb-[8px] font-outfit">
          Tours Snippets
        </div>

        {/* Title + Navigation Buttons Row (#5640:5571, #5640:5588) */}
        <div className="flex items-center justify-between w-full">
          <h2 className="text-[30.34px] font-normal leading-[1.12] text-[#1A1A1A] tracking-normal font-outfit">
            Postcards in <span className="font-gochi text-[#254B02]">Motion</span>
          </h2>

          <div className="flex items-center gap-[5px] shrink-0">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`w-[28px] h-[28px] rounded-full flex items-center justify-center transition-all cursor-pointer ${
                canScrollLeft
                  ? "bg-[#1A1A1A] hover:bg-black text-white"
                  : "bg-[#B5B9B1]/60 text-white/70 cursor-not-allowed"
              }`}
              aria-label="Previous snippet"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`w-[28px] h-[28px] rounded-full flex items-center justify-center transition-all cursor-pointer ${
                canScrollRight
                  ? "bg-[#1A1A1A] hover:bg-black text-white"
                  : "bg-[#B5B9B1]/60 text-white/70 cursor-not-allowed"
              }`}
              aria-label="Next snippet"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Header Area (#5091:7531) */}
      <div className="hidden md:flex flex-col mb-5 sm:mb-6 xl:mb-[26px]">
        {/* Badge (EL-19bb8319, width: 116px, height: 24px) */}
        <div className="inline-flex items-center justify-center w-[116px] h-[24px] bg-[rgba(26,26,26,0.05)] text-[rgba(26,26,26,0.55)] rounded-[110px] text-[14px] font-medium tracking-normal mb-[10px] font-outfit">
          Tours Snippets
        </div>
        {/* Title (#5091:7534, 48px Outfit + Gochi Hand) */}
        <h2 className="text-[30px] sm:text-[36px] md:text-[42px] xl:text-[48px] font-normal leading-[1.1] xl:leading-[52px] text-[#1A1A1A] tracking-normal font-outfit mt-0">
          Postcards in <span className="font-gochi text-[#254B02]">Motion</span>
        </h2>
      </div>

      {/* Carousel Container */}
      <div className="relative group/carousel w-full">
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

        {/* Desktop Left Navigation Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="hidden md:flex absolute -left-3 md:-left-5 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 bg-white/95 text-[#1A1A1A] rounded-full items-center justify-center transition-all duration-300 z-30 hover:scale-105 shadow-[0px_4px_16px_rgba(0,0,0,0.15)] cursor-pointer"
            aria-label="Scroll left"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Desktop Right Navigation Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="hidden md:flex absolute -right-3 md:-right-5 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 bg-white/95 text-[#1A1A1A] rounded-full items-center justify-center transition-all duration-300 z-30 hover:scale-105 shadow-[0px_4px_16px_rgba(0,0,0,0.15)] cursor-pointer"
            aria-label="Scroll right"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Cards Container (#5640:5572 for Mobile: 238px x 332px; Desktop: 290px x 404px) */}
        <div
          ref={scrollRef}
          className="flex gap-[12px] md:gap-[16px] overflow-x-auto pb-4 hide-scroll snap-x snap-mandatory"
        >
          {hardcodedPostcards.map((card) => (
            <Link
              key={card.id}
              href={card.link}
              className="relative w-[238px] min-w-[238px] h-[332px] md:w-[290px] md:min-w-[290px] md:h-[404px] rounded-[10px] md:rounded-[12px] overflow-hidden snap-start shrink-0 block group/card shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Card Background Image (#5640:5574 / #5091:7536) */}
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover/card:scale-105"
              />

              {/* Story Top Progress Indicator (#5640:5578, #5640:5579) */}
              <div className="absolute top-[8px] left-[8px] right-[8px] h-[2.5px] bg-white/40 rounded-full overflow-hidden z-20 pointer-events-none">
                <div className="w-[43%] h-full bg-[#545454]/90 rounded-full"></div>
              </div>

              {/* Center Play Icon (#5640:5586, #5640:5587) */}
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="w-[70px] h-[70px] md:w-[106px] md:h-[106px] rounded-full bg-[rgba(26,26,26,0.4)] flex items-center justify-center border-2 md:border-4 border-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-transform duration-300 group-hover/card:scale-105">
                  <svg
                    className="w-[24px] h-[24px] md:w-[36px] md:h-[36px] text-white ml-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="6 3 20 12 6 21 6 3" fill="none" />
                  </svg>
                </div>
              </div>

              {/* Bottom Gradient Overlay (#5640:5575 / #5091:7537) */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[120px] pointer-events-none z-10 rounded-b-[10px] md:rounded-b-[12px]"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 35%, rgba(0, 0, 0, 0.9) 100%)",
                }}
              ></div>

              {/* Text Content (#5640:5576, #5640:5577 at bottom) */}
              <div className="absolute bottom-[16px] md:bottom-[20px] left-[16px] md:left-[22px] right-[16px] md:right-[22px] z-20 flex flex-col justify-end pointer-events-none">
                <h3 className="text-white text-[15px] md:text-[16px] font-normal leading-normal font-outfit drop-shadow-sm">
                  {card.title}
                </h3>
                <p className="text-white/60 text-[10.5px] md:text-[12px] font-normal leading-normal font-outfit mt-0.5 drop-shadow-xs">
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
