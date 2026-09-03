"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const reviews = [
  {
    id: 1,
    name: "Nishant Yadav",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
    rating: 5.0,
    review:
      "Beautiful beaches, vibrant nightlife, delicious seafood. Can be crowded in peak season but perfect for relaxing holidays. Thank you Nothing but Adventures",
  },
  {
    id: 2,
    name: "Josef",
    avatar:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop",
    rating: 5.0,
    review:
      "Amazing trekking experience through the Himalayas. The guides were incredibly knowledgeable and made every moment memorable.",
  },
  {
    id: 3,
    name: "Priya Sharma",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    rating: 5.0,
    review:
      "The Rajasthan tour was a dream come true. Every palace, every sunset over the dunes — absolutely breathtaking and well organised.",
  },
  {
    id: 4,
    name: "Marcus Chen",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    rating: 4.9,
    review:
      "Kerala backwaters were serene and the houseboat experience was unlike anything else. Food was outstanding throughout the trip.",
  },
  {
    id: 5,
    name: "Emily Watson",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
    rating: 5.0,
    review:
      "Varanasi left me speechless. The spiritual energy, the Ganga aarti, and the local stories — a truly life-changing journey.",
  },
  {
    id: 6,
    name: "Arjun Mehta",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    rating: 4.8,
    review:
      "Desert safari was an adventure of a lifetime. Camel rides, campfire under the stars, and the warmth of the Rajasthani hospitality.",
  },
  {
    id: 7,
    name: "Sarah Jenkins",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
    rating: 5.0,
    review:
      "Unbelievable wildlife encounters in South Africa. The lodges were top notch and the itinerary was paced perfectly.",
  },
  {
    id: 8,
    name: "David Miller",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
    rating: 5.0,
    review:
      "From seamless booking to incredible daily adventures, NBA delivered beyond expectations. Will definitely book again soon!",
  },
];

function ReviewCard({
  review,
  className = "",
}: {
  review: (typeof reviews)[0];
  className?: string;
}) {
  return (
    <div
      className={`rounded-[7.5px] xl:rounded-[12.2px] p-3 lg:p-4 xl:p-5 shrink-0 bg-[rgba(181,185,177,0.12)] border border-[rgba(181,185,177,0.15)] transition-colors ${className}`}
    >
      <div className="flex items-center gap-2 lg:gap-2.5 xl:gap-3.5 mb-1.5 xl:mb-3">
        <div className="w-[29.4px] lg:w-[38px] xl:w-[48px] h-[29.4px] lg:h-[38px] xl:h-[48px] rounded-full overflow-hidden shrink-0 relative bg-gray-200">
          <img
            src={review.avatar}
            alt={review.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h4 className="font-medium text-[9.81px] lg:text-[12px] xl:text-[14px] text-[#1A1A1A] mb-0.5 font-outfit">
            {review.name}
          </h4>
          <div className="flex items-center gap-1 xl:gap-1.5">
            <span className="font-normal text-[7.36px] lg:text-[10px] xl:text-[12px] text-[#1A1A1A]/70 font-outfit">
              {review.rating}
            </span>
            <div className="flex gap-0.5 text-[#254B02]">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className="w-2 h-2 lg:w-2.5 lg:h-2.5 xl:w-3 xl:h-3 text-[#254B02]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="text-[8.59px] lg:text-[11px] xl:text-[14px] font-normal text-[rgba(26,26,26,0.65)] leading-[13.5px] lg:leading-[17px] xl:leading-[22px] tracking-[-0.015em] font-outfit">
        {review.review}
      </p>
    </div>
  );
}

interface ReviewsSectionProps {
  title?: React.ReactNode;
  pillClasses?: string;
  btnClasses?: string;
  btnText?: string;
  titleClassName?: string;
}

export default function ReviewsSection({
  title,
  pillClasses,
  btnClasses,
  btnText,
  titleClassName,
}: ReviewsSectionProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    let animationFrameId: number;

    const updateScroll = () => {
      if (
        !containerRef.current ||
        !scrollWrapperRef.current ||
        !trackRef.current
      )
        return;

      // Apply sticky-scroll translation on tablet and desktop screens (>= 768px)
      if (window.innerWidth < 768) {
        setTranslateY(0);
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const stickyTop = window.innerWidth >= 1280 ? 60 : 40;
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
    <div
      ref={containerRef}
      className="w-full relative font-outfit mt-8 sm:mt-16 md:mt-[60px] lg:mt-[90px] xl:mt-[120px] mb-8 md:mb-12 xl:mb-20 md:min-h-[220vh]"
    >
      <div className="block md:hidden w-full max-w-[360px] mx-auto">
        <div className="mb-5">
          <div className="h-[15.35px] bg-[rgba(26,26,26,0.05)] rounded-[70.35px] px-[6.4px] inline-flex items-center text-[8.85px] text-[rgba(26,26,26,0.55)] font-medium font-outfit mb-2">
            Testimonials
          </div>

          <div className="flex items-end justify-between gap-2 w-full">
            <h2 className="text-[26px] font-normal leading-[1.15] text-[#1A1A1A] tracking-normal font-outfit">
              What travellers say <br />
              <span className="font-gochi text-[#254B02]">about our tours</span>
            </h2>
            <p className="text-[9.8px] text-[#254B02] font-normal leading-[13px] text-right font-outfit max-w-[120px]">
              Enjoy journey we organise is built on trust, safety and unforgettable views
            </p>
          </div>
        </div>

        {/* 3 Mobile Cards Stack */}
        <div className="flex flex-col gap-[14px] w-full">
          {/* Card 1: Rating & Trust Card (#5640:5607, 360px x 368px, bg: rgba(181, 185, 177, 0.15)) */}
          <div className="w-full h-[368px] rounded-[16px] p-[24px] bg-[rgba(181,185,177,0.15)] flex flex-col justify-between relative overflow-hidden">
            {/* Rating */}
            <div className="flex items-start justify-between">
              <div className="flex items-baseline font-normal text-[#1A1A1A]">
                <span className="text-[44.77px] font-normal leading-none font-outfit">
                  4.9
                </span>
                <span className="text-[22.39px] text-[rgba(26,26,26,0.4)] font-normal ml-1 font-outfit">
                  /5
                </span>
              </div>
              <p className="text-[12px] text-[#1A1A1A] font-normal leading-[16px] text-right font-outfit">
                Based on 280+ verified <br /> travellers
              </p>
            </div>

            {/* Checklist */}
            <div className="flex flex-col gap-2.5 my-1">
              <div className="flex items-center gap-2 text-[13px] font-normal text-[rgba(26,26,26,0.6)] font-outfit">
                <span className="font-bold text-[#1A1A1A]">✓</span> Verified &amp; Trusted Trips
              </div>
              <div className="flex items-center gap-2 text-[13px] font-normal text-[rgba(26,26,26,0.6)] font-outfit">
                <span className="font-bold text-[#1A1A1A]">✓</span> Flexible Booking Options
              </div>
              <div className="flex items-center gap-2 text-[13px] font-normal text-[rgba(26,26,26,0.6)] font-outfit">
                <span className="font-bold text-[#1A1A1A]">✓</span> Real Experiences, Real People
              </div>
            </div>

            {/* CTA + Dual Button (#5640:5609) */}
            <div>
              <p className="text-[13px] text-[#1A1A1A] font-normal leading-[18px] mb-3 font-outfit">
                Ready to plan your own journey? Let’s get started!
              </p>
              <div className="flex items-center gap-[2.5px] group">
                <Link
                  href="/trips"
                  className="relative inline-flex items-center justify-center w-[115px] h-[34.14px] bg-[#1A1A1A] group-hover:bg-black text-white rounded-[44.25px] font-medium text-[12.64px] font-sans transition-all cursor-pointer overflow-hidden p-[1px]"
                >
                  <span className="relative z-10">Start Exploring</span>
                  <span className="absolute inset-[1px] rounded-[44.25px] border border-white/20 pointer-events-none" />
                </Link>

                <Link
                  href="/trips"
                  className="relative inline-flex items-center justify-center w-[34.14px] h-[34.14px] bg-[#1A1A1A] group-hover:bg-black text-white rounded-full transition-all shrink-0 cursor-pointer overflow-hidden p-[1px]"
                  aria-label="Start Exploring"
                >
                  <svg className="w-[10px] h-[10px] text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 13L13 1M13 1H3M13 1V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="absolute inset-[1px] rounded-full border border-[#F4F4F4]/30 pointer-events-none" />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Featured Testimonial Card (#5640:5617, 360px x 376px) */}
          <div className="relative rounded-[16px] overflow-hidden h-[376px] w-full bg-gray-900 shadow-xs">
            <Image
              src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=3540&auto=format&fit=crop"
              alt="Traveler exploring"
              fill
              className="object-cover"
            />
            {/* Lower Blur & Gradient Overlay (#5640:5620, #5640:5624) */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(180deg, rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0.4) 60%, rgba(0, 0, 0, 0.95) 100%)",
              }}
            />

            <div className="absolute bottom-[20px] left-[20px] right-[20px] text-white z-10 font-outfit">
              <p className="text-[17.94px] font-bold leading-[24px] tracking-[-0.031em] text-white font-sans mb-2">
                “We expected sand and silence — we found peace, stars, and people who love what they do.”
              </p>
              <p className="text-[12px] text-white/90 font-outfit">
                — Amir, Desert Sky tour, March 2025
              </p>
            </div>
          </div>

          {/* Card 3: User Testimonials List (#5640:5632) */}
          <div className="flex flex-col gap-3 w-full">
            {reviews.slice(0, 2).map((rev) => (
              <div
                key={rev.id}
                className="rounded-[12px] p-4 bg-[rgba(181,185,177,0.12)] border border-[rgba(181,185,177,0.15)] flex flex-col justify-between"
              >
                {/* 5 Stars */}
                <div className="flex gap-1 text-[#254B02] mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-3.5 h-3.5 text-[#254B02]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-[14px] font-normal text-[#1A1A1A] leading-[20px] font-outfit mb-3">
                  “{rev.review}”
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-[38px] h-[38px] rounded-full overflow-hidden shrink-0 bg-gray-200">
                    <img src={rev.avatar} alt={rev.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[14px] text-[#1A1A1A] font-outfit leading-tight">
                      — {rev.name}
                    </h4>
                    <p className="text-[11px] text-[rgba(26,26,26,0.6)] font-outfit">
                      Evening Safari, May 2025
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="hidden md:block w-full md:sticky md:top-[40px] xl:top-[60px]">
        <div className="flex flex-row items-end justify-between mb-5 md:mb-[25px] lg:mb-[32px] xl:mb-[41px] gap-4 font-outfit">
          <div className="flex flex-col items-start">
            <div
              className={`w-fit inline-flex items-center justify-center px-2 lg:px-2.5 xl:px-3 py-0.5 xl:py-1 h-[14.7px] lg:h-[19px] xl:h-[24px] rounded-[67px] xl:rounded-[110px] text-[8.59px] lg:text-[11px] xl:text-[14px] font-medium tracking-normal mb-[6.1px] lg:mb-[8px] xl:mb-[10px] font-outfit ${
                pillClasses || "bg-[rgba(26,26,26,0.05)] text-[rgba(26,26,26,0.55)]"
              }`}
            >
              Reviews
            </div>
            {title ? (
              <h2
                className={`font-normal tracking-normal font-outfit mt-0 ${
                  titleClassName ||
                  "text-[29.44px] lg:text-[38px] xl:text-[48px] leading-[32px] lg:leading-[42px] xl:leading-[52px] text-[#1A1A1A]"
                }`}
              >
                {title}
              </h2>
            ) : (
              <h2
                className={`font-normal leading-[32px] lg:leading-[42px] xl:leading-[52px] text-[#1A1A1A] tracking-normal font-outfit mt-0 ${
                  titleClassName || "text-[29.44px] lg:text-[38px] xl:text-[48px]"
                }`}
              >
                What travellers say about <br />
                <span className="font-gochi text-[#254B02]">our tours</span>
              </h2>
            )}
          </div>
          <div className="max-w-[176.6px] lg:max-w-[230px] xl:max-w-[288px] text-right self-end">
            <p className="text-[9.81px] lg:text-[13px] xl:text-[16px] text-[#254B02] font-normal leading-[15px] lg:leading-[19px] xl:leading-[24.42px] tracking-[-0.0286em] font-outfit">
              Enjoy journey we organise is built on trust, safety and
              unforgettable views
            </p>
          </div>
        </div>

        <div className="grid grid-cols-[386fr_427fr_351fr] gap-[9.98px] lg:gap-[13px] xl:gap-[16px] h-[256.5px] lg:h-[335px] xl:h-[418px] items-stretch">
          <div className="rounded-[7.5px] xl:rounded-[12.2px] p-[19.5px] lg:p-[25px] xl:p-[32px] flex flex-col justify-between h-[256.5px] lg:h-[335px] xl:h-[418px] bg-[rgba(181,185,177,0.2)] shadow-xs">
            <div className="flex items-start gap-2.5 lg:gap-3 xl:gap-4">
              <div className="flex items-baseline font-normal text-[#1A1A1A]">
                <span className="text-[29.44px] lg:text-[38px] xl:text-[48px] font-normal leading-[35.6px] lg:leading-[46px] xl:leading-[58px] tracking-[0.0083em]">
                  4.9
                </span>
                <span className="text-[14.7px] lg:text-[19px] xl:text-[24px] text-[rgba(26,26,26,0.4)] font-normal ml-0.5 xl:ml-1">
                  /5
                </span>
              </div>
              <p className="text-[8.59px] lg:text-[11px] xl:text-[14px] text-[#1A1A1A] font-normal leading-[12px] lg:leading-[16px] xl:leading-[20px] tracking-normal mt-1 xl:mt-2 font-outfit">
                Based on 280+ verified <br /> travellers
              </p>
            </div>

            <div className="flex flex-col gap-1.5 lg:gap-2 xl:gap-2.5 my-1 lg:my-1.5 xl:my-2">
              <div className="flex items-center gap-1.5 xl:gap-2 text-[8.59px] lg:text-[11px] xl:text-[14px] font-medium text-[rgba(26,26,26,0.6)] font-outfit">
                <span className="font-bold text-[#1A1A1A]">✓</span> Verified
                &amp; Trusted Trips
              </div>
              <div className="flex items-center gap-1.5 xl:gap-2 text-[8.59px] lg:text-[11px] xl:text-[14px] font-medium text-[rgba(26,26,26,0.6)] font-outfit">
                <span className="font-bold text-[#1A1A1A]">✓</span> Flexible
                Booking Options
              </div>
              <div className="flex items-center gap-1.5 xl:gap-2 text-[8.59px] lg:text-[11px] xl:text-[14px] font-medium text-[rgba(26,26,26,0.6)] font-outfit">
                <span className="font-bold text-[#1A1A1A]">✓</span> Real
                Experiences, Real People
              </div>
            </div>

            <div>
              <p className="text-[8.59px] lg:text-[11px] xl:text-[14px] text-[#1A1A1A] font-normal leading-[13.5px] lg:leading-[17px] xl:leading-[22px] tracking-normal mb-2 xl:mb-3 max-w-[280px] font-outfit">
                Ready to plan your own journey? Let’s get started!
              </p>
              <div className="flex items-center gap-1.5 xl:gap-2.5">
                <Link
                  href="/trips"
                  className={`inline-flex items-center justify-center text-white h-[28.2px] lg:h-[37px] xl:h-[46px] px-3.5 lg:px-5 xl:px-6 rounded-full font-light text-[9.81px] lg:text-[13px] xl:text-[16px] transition-all cursor-pointer shadow-xs font-outfit ${
                    btnClasses || "bg-[#1A1A1A] hover:bg-black"
                  }`}
                >
                  {btnText || "Plan Your Trip"}
                </Link>
                <Link
                  href="/trips"
                  className="inline-flex items-center justify-center border border-[rgba(26,26,26,0.25)] hover:border-[#1A1A1A] hover:bg-[#1A1A1A] text-[#1A1A1A] hover:text-white w-[28.2px] lg:w-[37px] xl:w-[46px] h-[28.2px] lg:h-[37px] xl:h-[46px] rounded-full transition-all shrink-0 cursor-pointer shadow-xs group"
                  aria-label="Plan Your Trip"
                >
                  <svg
                    className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 17L17 7M17 7H7M17 7V17"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <div className="relative rounded-[7.5px] xl:rounded-[12.2px] overflow-hidden h-[256.5px] lg:h-[335px] xl:h-[418px] w-full bg-gray-900 shadow-xs">
            <Image
              src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=3540&auto=format&fit=crop"
              alt="Travellers exploring"
              fill
              className="object-cover"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(0deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0) 100%)",
              }}
            />

            <div className="absolute bottom-3.5 lg:bottom-5 xl:bottom-6 left-3.5 lg:left-5 xl:left-6 right-3.5 lg:right-5 xl:right-6 text-white z-10 font-outfit">
              <p className="text-white/60 text-[8.59px] lg:text-[11px] xl:text-[14px] mb-1 xl:mb-1.5 font-normal tracking-normal font-outfit">
                Alexa, 23 March 2025
              </p>
              <p className="text-[12.27px] lg:text-[16px] xl:text-[20px] font-normal leading-[16.2px] lg:leading-[21px] xl:leading-[26.46px] tracking-[-0.0225em] text-white font-outfit">
                “Beautiful beaches, vibrant nightlife, delicious seafood.”
              </p>
            </div>
          </div>

          <div
            ref={scrollWrapperRef}
            className="flex flex-col overflow-hidden relative h-[256.5px] lg:h-[335px] xl:h-[418px] rounded-[7.5px] xl:rounded-[12.2px]"
          >
            <div className="absolute top-0 left-0 right-0 h-[28px] xl:h-[45px] bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none z-20" />

            <div
              ref={trackRef}
              className="flex flex-col gap-2 lg:gap-2.5 xl:gap-3.5 will-change-transform py-1"
              style={{
                transform: `translate3d(0, -${translateY}px, 0)`,
                transition: "transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)",
              }}
            >
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-[43px] xl:h-[70px] bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-20" />
          </div>
        </div>
      </section>
    </div>
  );
}
