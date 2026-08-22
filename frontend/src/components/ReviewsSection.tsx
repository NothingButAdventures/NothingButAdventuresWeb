"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const reviews = [
  {
    id: 1,
    name: "Nishant Yadav",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
    rating: 4.8,
    review: "Beautiful beaches, vibrant nightlife, delicious seafood. Can be crowded in peak season but perfect for relaxing holidays. Thank you Nothing but Adventures",
  },
  {
    id: 2,
    name: "Josef",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop",
    rating: 4.8,
    review: "Amazing trekking experience through the Himalayas. The guides were incredibly knowledgeable and made every moment memorable.",
  },
  {
    id: 3,
    name: "Priya Sharma",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    rating: 5.0,
    review: "The Rajasthan tour was a dream come true. Every palace, every sunset over the dunes — absolutely breathtaking and well organised.",
  },
  {
    id: 4,
    name: "Marcus Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    rating: 4.7,
    review: "Kerala backwaters were serene and the houseboat experience was unlike anything else. Food was outstanding throughout the trip.",
  },
  {
    id: 5,
    name: "Emily Watson",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
    rating: 4.9,
    review: "Varanasi left me speechless. The spiritual energy, the Ganga aarti, and the local stories — a truly life-changing journey.",
  },
  {
    id: 6,
    name: "Arjun Mehta",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    rating: 4.6,
    review: "Desert safari was an adventure of a lifetime. Camel rides, campfire under the stars, and the warmth of the Rajasthani hospitality.",
  },
  {
    id: 7,
    name: "Sarah Jenkins",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
    rating: 5.0,
    review: "Unbelievable wildlife encounters in South Africa. The lodges were top notch and the itinerary was paced perfectly.",
  },
  {
    id: 8,
    name: "David Miller",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
    rating: 4.9,
    review: "From seamless booking to incredible daily adventures, NBA delivered beyond expectations. Will definitely book again soon!",
  },
];

function ReviewCard({ review, className = "" }: { review: typeof reviews[0]; className?: string }) {
  return (
    <div
      className={`rounded-[12.2px] p-5 shrink-0 transition-colors ${className}`}
      style={{ backgroundColor: "rgba(181, 185, 177, 0.1)" }}
    >
      <div className="flex items-center gap-3.5 mb-3">
        <div className="w-[46px] h-[46px] rounded-full overflow-hidden shrink-0 relative bg-gray-200">
          <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <h4 className="font-normal text-[16px] text-[#1A1A1A] mb-0.5">{review.name}</h4>
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-[12px] text-[#1A1A1A]">{review.rating}</span>
            <div className="flex gap-0.5 text-[#3B5D1B]">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-3 h-3 text-[#3B5D1B]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="text-[15px] font-light text-[rgba(26,26,26,0.7)] leading-[26px] tracking-[-0.0286em]">
        {review.review}
      </p>
    </div>
  );
}

export default function ReviewsSection({
  title,
  pillClasses,
  btnClasses,
  btnText,
  titleClassName,
}: {
  title?: string;
  pillClasses?: string;
  btnClasses?: string;
  btnText?: string;
  titleClassName?: string;
} = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    let animationFrameId: number;

    const updateScroll = () => {
      if (!containerRef.current || !scrollWrapperRef.current || !trackRef.current) return;
      
      // Only apply sticky-scroll translation on desktop screens
      if (window.innerWidth < 1024) {
        setTranslateY(0);
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const stickyTop = 50;
      const totalScrollDistance = containerRect.height - viewportHeight;

      if (totalScrollDistance <= 0) {
        setTranslateY(0);
        return;
      }

      // Calculate progress of scroll through the tall container starting from when it pins
      const scrolled = stickyTop - containerRect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalScrollDistance));

      const wrapperHeight = scrollWrapperRef.current.clientHeight;
      const trackHeight = trackRef.current.scrollHeight;
      const maxTrackScroll = Math.max(0, trackHeight - wrapperHeight);

      setTranslateY(progress * maxTrackScroll);
    };

    const handleScroll = () => {
      animationFrameId = requestAnimationFrame(updateScroll);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    updateScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full relative lg:min-h-[220vh]">
      {/* Sticky Inner Section */}
      <section className="w-full lg:sticky lg:top-[50px]">
        {/* Header Area (#5091:7614) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-4 font-outfit">
          <div>
            {/* Reviews Pill Badge (#5091:7615) */}
            <div className="inline-flex items-center justify-center px-3.5 py-1 bg-[rgba(26,26,26,0.05)] text-[rgba(26,26,26,0.55)] rounded-[110px] text-[14px] font-medium tracking-normal mb-3 font-outfit">
              Reviews
            </div>
            {/* Title (#5091:7619) */}
            <h2 className="text-[36px] sm:text-[44px] lg:text-[48px] font-normal leading-tight text-[#1A1A1A] tracking-tight font-outfit">
              What travellers say about <br />
              <span className="font-gochi text-[#254B02]">our tours</span>
            </h2>
          </div>
          {/* Subtitle (#5091:7620) */}
          <div className="max-w-[290px] md:text-right self-start md:self-end">
            <p className="text-[16px] text-[#254B02] font-normal leading-[24.42px] tracking-[-0.0286em] font-outfit">
              Enjoy journey we organise is built on trust, safety and unforgettable views
            </p>
          </div>
        </div>

        {/* 3-Column Reviews Grid (#5091:8518) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[418px] items-stretch">
          {/* Left Card: Rating & CTA (#5091:8519) */}
          <div
            className="rounded-[12.2px] p-7 sm:p-8 flex flex-col justify-between h-[380px] lg:h-[418px] shadow-2xs"
            style={{ backgroundColor: "rgba(181, 185, 177, 0.1)" }}
          >
            {/* Rating Block */}
            <div className="flex items-start gap-4">
              <div className="flex items-baseline font-normal text-[#1A1A1A]">
                <span className="text-[48px] font-normal leading-[58px] tracking-[0.0083em]">4.9</span>
                <span className="text-[24px] text-[rgba(26,26,26,0.4)] font-normal ml-1">/5</span>
              </div>
              <p className="text-[16px] text-[#1A1A1A] font-normal leading-[24px] tracking-[-0.0286em] mt-2">
                Based on 280+ verified <br /> travellers
              </p>
            </div>

            {/* Checklist Feature Points (#5303:8916, #5303:8917, #5303:8918) */}
            <div className="flex flex-col gap-2.5 my-2">
              <div className="flex items-center gap-2.5 text-[15px] font-normal text-[rgba(26,26,26,0.6)] font-outfit">
                <span className="font-bold text-[#1A1A1A]">✓</span> Verified &amp; Trusted Trips
              </div>
              <div className="flex items-center gap-2.5 text-[15px] font-normal text-[rgba(26,26,26,0.6)] font-outfit">
                <span className="font-bold text-[#1A1A1A]">✓</span> Flexible Booking Options
              </div>
              <div className="flex items-center gap-2.5 text-[15px] font-normal text-[rgba(26,26,26,0.6)] font-outfit">
                <span className="font-bold text-[#1A1A1A]">✓</span> Real Experiences, Real People
              </div>
            </div>

            {/* CTA Block */}
            <div>
              <p className="text-[15px] sm:text-[16px] text-[#1A1A1A] font-normal leading-[24px] tracking-[-0.0286em] mb-4 max-w-[280px]">
                Ready to plan your own journey? Let’s get started!
              </p>
              <div className="group flex items-center gap-3">
                <Link
                  href="/trips"
                  className="inline-flex items-center justify-center bg-[#1A1A1A] hover:bg-black text-white px-7 py-2.5 rounded-full font-normal text-[16px] transition-all cursor-pointer shadow-xs"
                >
                  Plan Your Trip
                </Link>
                <Link
                  href="/trips"
                  className="inline-flex items-center justify-center bg-[#1A1A1A] hover:bg-black text-white w-[42px] h-[42px] rounded-full transition-all shrink-0 cursor-pointer shadow-xs"
                  aria-label="Plan Your Trip"
                >
                  <svg className="w-4 h-4 text-white transition-transform duration-300 group-hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Middle Card: Feature Image Review (#5091:8525) */}
          <div className="relative rounded-[12.2px] overflow-hidden h-[380px] lg:h-[418px] w-full bg-gray-900 shadow-2xs">
            <Image
              src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=3540&auto=format&fit=crop"
              alt="Travellers exploring"
              fill
              className="object-cover"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(0deg, rgba(0, 0, 0, 0.92) 0%, rgba(0, 0, 0, 0) 75%)",
              }}
            />

            <div className="absolute bottom-6 left-6 right-6 text-white z-10">
              <p className="text-white/70 text-[16px] mb-1 font-normal tracking-[-0.0281em]">
                Alexa, 23 March 2025
              </p>
              <p className="text-[20px] font-normal leading-[26.46px] tracking-[-0.0225em] text-white">
                “Beautiful beaches, vibrant nightlife, delicious seafood.”
              </p>
            </div>
          </div>

          {/* Right Column: User Scroll-linked Testimonials (#5091:8531) */}
          <div
            ref={scrollWrapperRef}
            className="flex flex-col overflow-hidden relative h-[380px] lg:h-[418px]"
          >
            {/* Top subtle fade */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent pointer-events-none z-20" />

            {/* Scrollable Track - driven smoothly by page scroll */}
            <div
              ref={trackRef}
              className="flex flex-col gap-3.5 will-change-transform"
              style={{
                transform: `translate3d(0, -${translateY}px, 0)`,
                transition: "transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)",
              }}
            >
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {/* Bottom subtle fade */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none z-20" />
          </div>
        </div>
      </section>
    </div>
  );
}
