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
    <section className="w-full relative font-outfit mt-[80px] md:mt-[60px] lg:mt-[90px] xl:mt-[120px] mb-0 md:mb-12 xl:mb-20">
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

      {/* Desktop Header Area (#5640:7541 on 785px / #5091:7531 on 1280px) */}
      <div className="hidden md:flex flex-col mb-3.5 md:mb-4 lg:mb-5 xl:mb-[26px]">
        {/* Badge (#5640:7542 on 785px: 71px x 14.72px / 1280px: 116px x 24px) */}
        <div className="inline-flex items-center justify-center w-[71px] lg:w-[94px] xl:w-[116px] h-[14.7px] lg:h-[19px] xl:h-[24px] bg-[rgba(26,26,26,0.05)] text-[rgba(26,26,26,0.55)] rounded-[67px] xl:rounded-[110px] text-[8.59px] lg:text-[11px] xl:text-[14px] font-medium tracking-normal mb-[6.1px] lg:mb-[8px] xl:mb-[10px] font-outfit">
          Tours Snippets
        </div>
        {/* Title (#5640:7544 on 785px: 29.44px Outfit / 1280px: 48px Outfit) */}
        <h2 className="text-[29.44px] lg:text-[38px] xl:text-[48px] font-normal leading-[32px] lg:leading-[42px] xl:leading-[52px] text-[#1A1A1A] tracking-normal font-outfit mt-0">
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
            className="hidden md:flex absolute -left-3 md:-left-4 xl:-left-5 top-1/2 -translate-y-1/2 w-8 h-8 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-11 xl:h-11 bg-white/95 text-[#1A1A1A] rounded-full items-center justify-center transition-all duration-300 z-30 hover:scale-105 shadow-[0px_4px_16px_rgba(0,0,0,0.15)] cursor-pointer"
            aria-label="Scroll left"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 xl:w-5 xl:h-5"
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
            className="hidden md:flex absolute -right-3 md:-right-4 xl:-right-5 top-1/2 -translate-y-1/2 w-8 h-8 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-11 xl:h-11 bg-white/95 text-[#1A1A1A] rounded-full items-center justify-center transition-all duration-300 z-30 hover:scale-105 shadow-[0px_4px_16px_rgba(0,0,0,0.15)] cursor-pointer"
            aria-label="Scroll right"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 xl:w-5 xl:h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Cards Container (#5640:7545, #5640:8266 on 785px: 177.85px x 247.77px / #5091:7536 on 1280px: 290px x 404px) */}
        <div
          ref={scrollRef}
          className="flex gap-[12px] md:gap-[9.8px] lg:gap-[13px] xl:gap-[16px] overflow-x-auto pb-4 hide-scroll snap-x snap-mandatory"
        >
          {hardcodedPostcards.map((card) => (
            <Link
              key={card.id}
              href={card.link}
              className="relative w-[238px] min-w-[238px] h-[332px] sm:w-[260px] sm:min-w-[260px] sm:h-[362px] md:w-[calc((100%-29.4px)/4)] md:min-w-[calc((100%-29.4px)/4)] md:h-[247.8px] lg:w-[calc((100%-39px)/4)] lg:min-w-[calc((100%-39px)/4)] lg:h-[326px] xl:w-[calc((100%-48px)/4)] xl:min-w-[calc((100%-48px)/4)] xl:h-[404px] rounded-[10px] md:rounded-[7.4px] xl:rounded-[12px] overflow-hidden snap-start shrink-0 block group/card shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Card Background Image (#5640:7546 / #5091:7536) */}
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover/card:scale-105"
              />

              {/* Story Top Progress Indicator (#5640:5578, #5640:5579) */}
              <div className="absolute top-[8px] md:top-[6px] xl:top-[8px] left-[8px] md:left-[6px] xl:left-[8px] right-[8px] md:right-[6px] xl:right-[8px] h-[2.5px] bg-white/40 rounded-full overflow-hidden z-20 pointer-events-none">
                <div className="w-[43%] h-full bg-[#545454]/90 rounded-full"></div>
              </div>

              {/* Center Play Icon (#5640:5586, #5640:5587 on 785px: 65px x 65px / 1280px: 106px x 106px) */}
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="w-[70px] h-[70px] md:w-[65px] md:h-[65px] lg:w-[85px] lg:h-[85px] xl:w-[106px] xl:h-[106px] rounded-full bg-[rgba(26,26,26,0.4)] flex items-center justify-center border-2 md:border-[2.5px] xl:border-4 border-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-transform duration-300 group-hover/card:scale-105">
                  <svg
                    className="w-[24px] h-[24px] md:w-[22px] md:h-[22px] lg:w-[28px] lg:h-[28px] xl:w-[36px] xl:h-[36px] text-white ml-0.5 md:ml-0.5 xl:ml-1"
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

              {/* Bottom Gradient Overlay (#5640:7547 / #5091:7537) */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[120px] pointer-events-none z-10 rounded-b-[10px] md:rounded-b-[7.4px] xl:rounded-b-[12px]"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 35%, rgba(0, 0, 0, 0.9) 100%)",
                }}
              ></div>

              {/* Text Content (#5640:7548, #5640:7549 at bottom) */}
              <div className="absolute bottom-[16px] md:bottom-[12px] lg:bottom-[16px] xl:bottom-[20px] left-[16px] md:left-[13.5px] lg:left-[18px] xl:left-[22px] right-[16px] md:right-[13.5px] lg:right-[18px] xl:right-[22px] z-20 flex flex-col justify-end pointer-events-none">
                <h3 className="text-white text-[15px] md:text-[12.27px] lg:text-[14px] xl:text-[16px] font-normal leading-normal font-outfit drop-shadow-sm">
                  {card.title}
                </h3>
                <p className="text-white/60 text-[10.5px] md:text-[8px] lg:text-[10px] xl:text-[12px] font-normal leading-normal font-outfit mt-0.5 drop-shadow-xs">
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
