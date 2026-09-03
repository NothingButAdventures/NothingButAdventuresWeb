"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { getTourPricing, fetchDiscountsMap } from "@/lib/discounts";

export interface TourCardProps {
  tour: {
    _id: string;
    name: string;
    title?: string;
    slug?: string;
    tourCode?: string;
    price?: {
      amount?: number;
      discountPercent?: number;
      currency?: string;
    };
    pricing?: {
      startingPrice?: number;
      currency?: string;
    };
    duration?: {
      days?: number;
    };
    durationDays?: number;
    images?: Array<any>;
    descriptionImage?: string;
    country?: {
      name?: string;
    };
    summary?: string;
    startDates?: Array<{
      startDate?: string;
      discount?: any;
      isActive?: boolean;
    }>;
    travelStyle?: any;
    rating?: number;
    location?: {
      startCity?: string;
      endCity?: string;
    };
    startLocation?: {
      name?: string;
    };
    endLocation?: {
      name?: string;
    };
    physicalRating?: {
      level?: number;
      description?: string;
    };
    ageRequirement?: {
      min?: number;
      max?: number;
      description?: string;
    };
    maxGroupSize?: number;
    interests?: string[];
    destinationsCount?: number;
    nextDepartureDate?: string;
  };
  showDetailsByDefault?: boolean;
}

export default function TourCard({ tour }: TourCardProps) {
  const [discountsMap, setDiscountsMap] = useState<Record<
    string,
    number
  > | null>(null);

  useEffect(() => {
    fetchDiscountsMap().then((map) => {
      if (map && Object.keys(map).length > 0) {
        setDiscountsMap(map);
      }
    });
  }, []);

  const tourName = tour.name || tour.title || "Tour Name";
  const primaryImage =
    tour.images?.find((img: any) => img.isPrimary) || tour.images?.[0];
  const cardImageUrl =
    tour.descriptionImage ||
    (typeof primaryImage === "string" ? primaryImage : primaryImage?.url) ||
    "/mountain_hikers.png";
  const cardImageAlt = tourName;

  const {
    basePrice,
    discountedPrice,
    effectiveDiscount,
    hasDiscount,
    displayDate,
    currency,
  } = getTourPricing(tour, discountsMap);

  const formattedStartDate = displayDate
    ? new Date(displayDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Aug 29, 2026";

  // Location text (Non-hovered: destinations count, Hovered: route e.g. Delhi to Jaipur)
  const startCity =
    tour.location?.startCity || tour.startLocation?.name || "Delhi";
  const endCity = tour.location?.endCity || tour.endLocation?.name || "Jaipur";
  const routeText = `${startCity} to ${endCity}`;
  const destinationsCount = tour.destinationsCount || 3;

  // Physical rating
  const physicalLevel = tour.physicalRating?.level || 4;
  const physicalMax = 5;
  const physicalPercent = (physicalLevel / physicalMax) * 100;
  const physicalLabels: Record<number, string> = {
    1: "Easy",
    2: "Light",
    3: "Average",
    4: "Demanding",
    5: "Challenging",
  };
  const ratingName =
    (tour.physicalRating as any)?.name ||
    physicalLabels[physicalLevel] ||
    "Demanding";
  const physicalLabel = `${physicalLevel}/${physicalMax} ${ratingName}`;

  // Age requirement
  const ageMin = tour.ageRequirement?.min ?? 20;
  const ageMax = tour.ageRequirement?.max ?? 99;
  const ageText =
    ageMax >= 99 ? `${ageMin}+ Years` : `${ageMin}-${ageMax} Years`;
  const agePercent = Math.min(((ageMax - ageMin) / 80) * 100, 75);

  // Group size
  const groupSize = tour.maxGroupSize || 12;
  const groupPercent = Math.min((groupSize / 20) * 100, 60);

  // Travel style label
  const styleName =
    typeof tour.travelStyle === "string"
      ? tour.travelStyle
      : tour.travelStyle?.name || "Classic";

  // Interest tags (fallback if empty)
  const interests =
    tour.interests && tour.interests.length > 0
      ? tour.interests
      : ["Bestseller", "Wildlife", "Hiking", "Culture", "Sightseeing"];
  const visibleTags = interests.slice(0, 3);
  const overflowCount = Math.max(0, interests.length - 3);

  return (
    <Link
      href={`/trips/${tour.slug || "trip"}/${tour.tourCode || "code"}`}
      className="block h-full cursor-pointer group/card w-full font-outfit select-none"
    >
      <div className="flex flex-col bg-white rounded-[7.4px] xl:rounded-[10px] shadow-[0px_1px_15px_-2px_rgba(0,0,0,0.08)] overflow-hidden h-full transition-all duration-300 hover:shadow-lg">
        {/* Image Section (#5640:7256 on 785px: 189.5px x 178px / #5091:7505 on 1280px: 309px x 290px) */}
        <div className="relative w-full h-[290px] md:h-[178px] lg:h-[235px] xl:h-[290px] group-hover/card:h-[195px] md:group-hover/card:h-[120px] lg:group-hover/card:h-[160px] xl:group-hover/card:h-[195px] transition-all duration-300 ease-in-out bg-gray-100 overflow-hidden shrink-0">
          {cardImageUrl ? (
            <img
              src={cardImageUrl}
              alt={cardImageAlt}
              className="w-full h-full object-cover transition-all duration-500 ease-out group-hover/card:scale-105 group-hover/card:blur-[2px]"
            />
          ) : (
            <div className="w-full h-full bg-gray-200"></div>
          )}

          {/* Travel Style Badge (Bottom Left of Image #5640:7258) */}
          <div className="absolute left-2.5 md:left-2 lg:left-2.5 xl:left-3 bottom-2.5 md:bottom-2 lg:bottom-2.5 xl:bottom-3 z-10">
            <div className="flex items-center gap-1 md:gap-1 xl:gap-1.5 bg-black/40 backdrop-blur-xs border border-white/80 text-white px-2 md:px-1.5 lg:px-2 xl:px-2.5 py-0.5 rounded-full text-[10px] md:text-[7.4px] lg:text-[9px] xl:text-[11px] font-normal tracking-wide">
              <span className="text-white text-[9px] md:text-[7px] xl:text-[11px]">★</span>
              <span className="capitalize">{styleName}</span>
            </div>
          </div>
        </div>

        {/* Content Section (#5640:7239) */}
        <div className="p-3.5 md:p-[9.8px] lg:p-[13px] xl:p-4 flex flex-col grow bg-white">
          {/* Title (#5640:7241 / #5091:7509) */}
          <h3 className="text-[16px] md:text-[9.8px] lg:text-[13px] xl:text-[16px] font-medium text-[#1A1A1A] leading-[22px] md:leading-[13.5px] lg:leading-[18px] xl:leading-[22px] line-clamp-1 mb-1.5 md:mb-1 lg:mb-1.5 xl:mb-2 font-outfit">
            {tourName}
          </h3>

          {/* Row 1: Duration & Price (#5640:7243) */}
          <div className="flex justify-between items-center gap-2 mb-1.5 md:mb-[3.7px] lg:mb-1.5">
            <div className="flex items-center gap-1 text-[rgba(26,26,26,0.6)] text-[12px] md:text-[7.4px] lg:text-[10px] xl:text-[12px] font-normal font-outfit">
              <svg
                className="w-3.5 h-3.5 md:w-[9px] md:h-[9px] lg:w-3 lg:h-3 xl:w-3.5 xl:h-3.5 text-[rgba(26,26,26,0.6)] shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.6}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{tour.duration?.days || tour.durationDays || 12} Days</span>
            </div>

            <div className="text-right">
              <span className="text-[rgba(26,26,26,0.6)] text-[12px] md:text-[7.4px] lg:text-[10px] xl:text-[12px] font-light font-outfit">
                From{" "}
              </span>
              <span className="text-[16px] md:text-[9.8px] lg:text-[13px] xl:text-[16px] font-bold text-[#1A1A1A] font-outfit">
                ${Math.round(discountedPrice).toLocaleString()} {currency}
              </span>
            </div>
          </div>

          {/* Row 2: Location & Date / Reg. Price Discount (#5640:7245 / #5640:7251) */}
          <div className="flex justify-between items-center gap-2">
            {/* Left: Destinations (normal) vs Route (hovered) */}
            <div className="flex items-center gap-1 text-[rgba(26,26,26,0.6)] text-[12px] md:text-[7.4px] lg:text-[10px] xl:text-[12px] font-normal font-outfit">
              <svg
                className="w-3.5 h-3.5 md:w-[9px] md:h-[9px] lg:w-3 lg:h-3 xl:w-3.5 xl:h-3.5 text-[rgba(26,26,26,0.6)] shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.6}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.6}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="block group-hover/card:hidden">
                {destinationsCount} Destinations
              </span>
              <span className="hidden group-hover/card:block truncate">
                {routeText}
              </span>
            </div>

            {/* Right: Date (normal) vs Reg Price + Discount (hovered) */}
            <div className="text-[12px] md:text-[7.4px] lg:text-[10px] xl:text-[12px] text-[rgba(26,26,26,0.6)] font-normal text-right font-outfit">
              <span className="block group-hover/card:hidden">
                on {formattedStartDate}
              </span>
              <span className="hidden group-hover/card:block text-[12px] md:text-[7.4px] lg:text-[10px] xl:text-[12px]">
                {hasDiscount ? (
                  <>
                    <span className="text-[#1A1A1A] font-light">
                      Reg. Price{" "}
                    </span>
                    <span className="line-through text-[#1A1A1A]">
                      ${Math.round(basePrice).toLocaleString()}
                    </span>
                    <span className="text-[#FF8F5F] font-normal ml-1">
                      -{effectiveDiscount}%
                    </span>
                  </>
                ) : (
                  <span className="text-[#1A1A1A] font-light">
                    on {formattedStartDate}
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Expandable Hover Section (Tags & Indicators) */}
          <div className="grid grid-rows-[0fr] group-hover/card:grid-rows-[1fr] transition-all duration-300 ease-in-out">
            <div className="overflow-hidden">
              <div className="flex flex-col pt-2 md:pt-1.5 xl:pt-2.5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                {/* Tags */}
                <div className="flex flex-wrap gap-1 md:gap-0.5 xl:gap-1.5 mb-1.5 md:mb-1 xl:mb-2.5">
                  {visibleTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 md:px-1 lg:px-1.5 xl:px-2 py-0.5 rounded-[17.6px] text-[10px] md:text-[6.5px] lg:text-[8.5px] xl:text-[10px] font-normal text-[rgba(26,26,26,0.7)] bg-[rgba(181,185,177,0.25)] font-outfit"
                    >
                      {tag}
                    </span>
                  ))}
                  {overflowCount > 0 && (
                    <span className="px-2 md:px-1 lg:px-1.5 xl:px-2 py-0.5 rounded-[17.6px] text-[10px] md:text-[6.5px] lg:text-[8.5px] xl:text-[10px] font-normal text-[rgba(26,26,26,0.7)] bg-[rgba(181,185,177,0.25)] font-outfit">
                      +{overflowCount}
                    </span>
                  )}
                </div>

                {/* Metrics Progress Bars */}
                <div className="grid grid-cols-3 gap-1.5 md:gap-1 xl:gap-2">
                  {/* Physical Rating */}
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-0.5 xl:gap-1 mb-0.5 md:mb-0.5 xl:mb-1">
                      <svg
                        className="w-3 h-3 md:w-2 md:h-2 lg:w-2.5 lg:h-2.5 xl:w-3 xl:h-3 text-[#1A1A1A]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span className="text-[10px] md:text-[6.5px] lg:text-[8px] xl:text-[10px] font-normal text-[#1A1A1A] font-outfit">
                        Physical Rating
                      </span>
                    </div>
                    <div className="w-full h-[1.5px] md:h-[1px] xl:h-[2px] bg-[#E5E7EB] rounded-full relative overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#1A1A1A]"
                        style={{ width: `${physicalPercent}%` }}
                      ></div>
                    </div>
                    <span className="text-[8.5px] md:text-[5.5px] lg:text-[7px] xl:text-[8.5px] font-light text-[rgba(26,26,26,0.6)] font-outfit mt-0.5">
                      {physicalLabel}
                    </span>
                  </div>

                  {/* Age Requirement */}
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-0.5 xl:gap-1 mb-0.5 md:mb-0.5 xl:mb-1">
                      <svg
                        className="w-3 h-3 md:w-2 md:h-2 lg:w-2.5 lg:h-2.5 xl:w-3 xl:h-3 text-[#1A1A1A]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="text-[10px] md:text-[6.5px] lg:text-[8px] xl:text-[10px] font-normal text-[#1A1A1A] font-outfit">
                        Age Req.
                      </span>
                    </div>
                    <div className="w-full h-[1.5px] md:h-[1px] xl:h-[2px] bg-[#E5E7EB] rounded-full relative overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#1A1A1A]"
                        style={{ width: `${agePercent}%` }}
                      ></div>
                    </div>
                    <span className="text-[8.5px] md:text-[5.5px] lg:text-[7px] xl:text-[8.5px] font-light text-[rgba(26,26,26,0.6)] font-outfit mt-0.5">
                      {ageText}
                    </span>
                  </div>

                  {/* Group Size */}
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-0.5 xl:gap-1 mb-0.5 md:mb-0.5 xl:mb-1">
                      <svg
                        className="w-3 h-3 md:w-2 md:h-2 lg:w-2.5 lg:h-2.5 xl:w-3 xl:h-3 text-[#1A1A1A]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <span className="text-[10px] md:text-[6.5px] lg:text-[8px] xl:text-[10px] font-normal text-[#1A1A1A] font-outfit">
                        Group Size
                      </span>
                    </div>
                    <div className="w-full h-[1.5px] md:h-[1px] xl:h-[2px] bg-[#E5E7EB] rounded-full relative overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#1A1A1A]"
                        style={{ width: `${groupPercent}%` }}
                      ></div>
                    </div>
                    <span className="text-[8.5px] md:text-[5.5px] lg:text-[7px] xl:text-[8.5px] font-light text-[rgba(26,26,26,0.6)] font-outfit mt-0.5">
                      Max {groupSize} People
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
