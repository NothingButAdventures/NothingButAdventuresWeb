"use client";

import React, { useRef, useState, useEffect } from "react";

interface WelcomeMomentSectionProps {
  images?: string[];
}

const fallbackImages = [
  "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop",
];

export default function WelcomeMomentSection({ images }: WelcomeMomentSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Ensure we have at least 7 images by duplicating if necessary
  const displayImages = React.useMemo(() => {
    let list = images && images.length > 0 ? images : fallbackImages;
    while (list.length < 7) {
      list = [...list, ...fallbackImages];
    }
    return list.slice(0, 8);
  }, [images]);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Distance scrolled within the section
      const totalScrollable = rect.height - windowHeight;
      if (totalScrollable <= 0) return;

      const currentScroll = -rect.top;
      const progress = Math.max(0, Math.min(1, currentScroll / totalScrollable));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full h-[150vh] bg-white">
      {/* Sticky viewport frame */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center items-center py-2">
        
        {/* Title Heading */}
        <div className="text-center z-20 mb-0 shrink-0 px-4">
          <h2 className="text-[32px] font-normal text-[#1A1A1A] font-outfit tracking-tight" style={{ lineHeight: '0.9em' }}>
            The Welcome Moment
          </h2>
        </div>

        {/* Track Container */}
        <div className="relative w-full mt-6 sm:mt-8 flex items-center overflow-hidden min-h-[320px]">
          <div
            ref={trackRef}
            className="flex items-center gap-6 sm:gap-8 md:gap-10 transition-transform duration-75 ease-out"
            style={{
              // Translate horizontally from left to right as vertical scroll progress increases
              transform: `translateX(calc(50vw - 140px - ${scrollProgress * (displayImages.length - 1) * 260}px))`,
              willChange: "transform",
            }}
          >
            {displayImages.map((imgUrl, idx) => {
              // Calculate center proximity for item scaling
              const itemCenterOffset = (idx - scrollProgress * (displayImages.length - 1)) * 260;
              const distFromCenter = Math.abs(itemCenterOffset);
              
              // Dynamic scale calculation: center image gets bigger (~1.25x), side images stay smaller (~0.85x)
              const scale = Math.max(0.82, Math.min(1.22, 1.22 - (distFromCenter / 450) * 0.4));
              const isCenter = distFromCenter < 130;

              return (
                <div
                  key={idx}
                  className="shrink-0 transition-all duration-300 ease-out cursor-pointer"
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: "center center",
                  }}
                >
                  <div
                    className={`relative w-[210px] h-[210px] sm:w-[240px] sm:h-[240px] md:w-[260px] md:h-[260px] rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 ${
                      isCenter
                        ? "shadow-2xl ring-2 ring-black/10"
                        : "shadow-md opacity-85"
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Welcome moment ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
