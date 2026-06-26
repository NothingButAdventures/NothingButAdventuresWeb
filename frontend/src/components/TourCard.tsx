import Link from "next/link";
import React from "react";

export interface TourCardProps {
    tour: {
        _id: string;
        name: string;
        slug: string;
        tourCode: string;
        price: {
            amount: number;
            discountPercent: number;
            currency?: string;
        };
        duration: {
            days: number;
        };
        images: Array<{
            url: string;
            caption?: string;
            isPrimary?: boolean;
        }>;
        descriptionImage?: string;
        country: {
            name: string;
        };
        summary?: string;
        startDates?: Array<{
            startDate?: string;
            discount?: string;
        }>;
        travelStyle?: string;
        rating?: number;
        location?: {
            startCity?: string;
            endCity?: string;
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
    };
    showDetailsByDefault?: boolean;
}

export default function TourCard({ tour }: TourCardProps) {
    const primaryImage =
        tour.images?.find((img) => img.isPrimary) || tour.images?.[0];
    const cardImageUrl = tour.descriptionImage || primaryImage?.url || "";
    const cardImageAlt = tour.name;

    const basePrice = tour.price?.amount || 0;

    // Find the maximum discount from startDates and its corresponding date
    let maxStartDateDiscount = 0;
    let highestDiscountStartDate = "";

    (tour.startDates || []).forEach((sd) => {
        const discountVal = sd.discount ? parseFloat(sd.discount.replace(/[^0-9.]/g, "")) : 0;
        const validDiscount = isNaN(discountVal) ? 0 : discountVal;
        
        if (validDiscount > maxStartDateDiscount || (validDiscount === maxStartDateDiscount && highestDiscountStartDate === "")) {
            maxStartDateDiscount = validDiscount;
            if (sd.startDate) {
                highestDiscountStartDate = sd.startDate;
            }
        }
    });

    const formattedStartDate = highestDiscountStartDate
        ? new Date(highestDiscountStartDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        })
        : "";

    // Use the highest discount available (from price.discountPercent or startDates)
    const effectiveDiscount = Math.max(tour.price?.discountPercent || 0, maxStartDateDiscount);
    const hasDiscount = effectiveDiscount > 0;
    const discountedPrice = hasDiscount
        ? basePrice * (1 - effectiveDiscount / 100)
        : basePrice;

    const showSaleBadge = hasDiscount;

    // Location text
    const locationText =
        tour.location?.startCity && tour.location?.endCity
            ? `${tour.location.startCity} to ${tour.location.endCity}`
            : tour.country?.name || "Multiple Destinations";

    // Physical rating
    const physicalLevel = tour.physicalRating?.level || 3;
    const physicalMax = 5;
    const physicalPercent = (physicalLevel / physicalMax) * 100;
    const physicalLabels: Record<number, string> = {
        1: "Easy",
        2: "Moderate",
        3: "Challenging",
        4: "Demanding",
        5: "Extreme",
    };
    const physicalLabel = `${physicalLevel}/${physicalMax} ${physicalLabels[physicalLevel] || "Moderate"}`;

    // Age requirement
    const ageMin = tour.ageRequirement?.min ?? 18;
    const ageMax = tour.ageRequirement?.max ?? 99;
    const ageText =
        ageMax >= 99
            ? `${ageMin}+ Years Old`
            : `${ageMin} to ${ageMax} Years Old`;
    // Normalize the age range to a visual percentage (wider range = more filled)
    const agePercent = Math.min(((ageMax - ageMin) / 80) * 100, 100);

    // Group size
    const groupSize = tour.maxGroupSize || 12;
    const groupPercent = Math.min((groupSize / 20) * 100, 100);

    // Interest tags (show max 3 + overflow count)
    const interests = tour.interests || [];
    const visibleTags = interests.slice(0, 3);
    const overflowCount = Math.max(0, interests.length - 3);

    return (
        <Link href={`/trips/${tour.slug}/${tour.tourCode}`} className="block h-full cursor-pointer group/card w-full">
            <div className="flex flex-col bg-white rounded-[16px] border border-gray-200 shadow-sm overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                {/* Image Section */}
                <div className="relative w-full aspect-[4/3.5] group-hover/card:aspect-[4/2.5] transition-all duration-300 ease-in-out bg-gray-100 overflow-hidden shrink-0">
                    {cardImageUrl ? (
                        <img
                            src={cardImageUrl}
                            alt={cardImageAlt}
                            className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover/card:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200"></div>
                    )}

                    {/* Sale Badge - top right */}
                    {showSaleBadge && (
                        <div className="absolute top-3 right-3 z-10">
                            <div className="bg-[#F97316] text-white px-4 py-1.5 rounded-full text-[13px] font-bold shadow-md">
                                Sale
                            </div>
                        </div>
                    )}

                    {/* Travel Style Badge - bottom left */}
                    <div className="absolute left-4 bottom-4 z-10">
                        <div
                            className="flex items-center gap-1.5 bg-white text-[#512AA7] px-3 py-1 rounded-full text-[12px] font-bold ring-2 ring-white"
                            style={{ border: '1.5px solid #512AA7' }}
                        >
                            <svg className="w-[12px] h-[12px]" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="capitalize">{tour.travelStyle || "Classic"}</span>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-4 md:p-5 flex flex-col grow bg-white">
                    {/* Title */}
                    <h3 className="text-[20px] md:text-[24px] font-bold text-[#3F3F42] leading-tight line-clamp-1 mb-2">
                        {tour.name}
                    </h3>

                    {/* Duration and Location + Price Row */}
                    <div className="flex justify-between items-start gap-3 mb-3">
                        <div className="flex flex-col gap-1.5 min-w-0">
                            {/* Duration */}
                            <div className="flex items-center gap-2 text-[18px] text-[#3F3F42]">
                                <svg className="w-[18px] h-[18px] text-[#3F3F42] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{tour.duration?.days || 0} Days</span>
                            </div>
                            {/* Location */}
                            <div className="flex items-center gap-2 text-[18px] text-[#3F3F42]">
                                <svg className="w-[18px] h-[18px] text-[#3F3F42] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="truncate">{locationText}</span>
                            </div>
                        </div>

                        {/* Price Section */}
                        <div className="text-right shrink-0">
                            <div className="text-[22px] md:text-[26px] font-bold text-[#3F3F42] leading-tight">
                                <span className="text-[15px] font-medium text-[#3F3F42]">From </span>${Math.round(hasDiscount ? discountedPrice : basePrice).toLocaleString()} <span className="text-[14px] font-semibold text-[#3F3F42]">USD</span>
                            </div>
                            <div className="text-[15px] text-[#3F3F42] leading-tight mt-0.5">
                                <div className="block group-hover/card:hidden">
                                    {formattedStartDate ? (
                                        <>Starts <span className="font-medium text-[18px] text-[#3F3F42]">{formattedStartDate}</span></>
                                    ) : (
                                        <>Reg. Price <span className="font-medium text-[22px] text-[#3F3F42]">${basePrice.toLocaleString()}</span></>
                                    )}
                                </div>
                                <div className="hidden group-hover/card:block">
                                    Reg. Price <span className="font-medium text-[22px] text-[#3F3F42]">${basePrice.toLocaleString()}</span>{hasDiscount && (
                                        <span className="text-[#F97316] font-bold"> -{effectiveDiscount}%</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Expandable Content on Hover */}
                    <div className="grid grid-rows-[0fr] group-hover/card:grid-rows-[1fr] transition-all duration-300 ease-in-out">
                        <div className="overflow-hidden">
                            <div className="flex flex-col pt-1 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">

                                {/* Tags */}
                                {interests.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {visibleTags.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="rounded-full text-[13px] font-semibold text-white"
                                                style={{
                                                    background: '#512AA7',
                                                    border: '2.5px solid #512AA7',
                                                    outline: '2px solid white',
                                                    outlineOffset: '-4px',
                                                    padding: '4px 14px',
                                                }}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {overflowCount > 0 && (
                                            <span
                                                className="rounded-full text-[13px] font-semibold text-white"
                                                style={{
                                                    background: '#512AA7',
                                                    border: '2.5px solid #512AA7',
                                                    outline: '2px solid white',
                                                    outlineOffset: '-4px',
                                                    padding: '4px 14px',
                                                }}
                                            >
                                                +{overflowCount}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Progress Bar Indicators */}
                                <div className="grid grid-cols-3 gap-3 pt-3 mt-2">
                                    {/* Physical Rating */}
                                    <div className="flex flex-col items-center text-center">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <svg className="w-[16px] h-[16px] text-[#3F3F42]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-[13px] md:text-[14px] font-medium text-[#3F3F42]">Physical Rating</span>
                                        </div>
                                        <div className="w-full h-[3px] bg-gray-200 rounded-full relative">
                                            <div
                                                className="h-full rounded-full bg-[#512AA7]"
                                                style={{ width: `${physicalPercent}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-[12px] md:text-[13px] text-[#3F3F42] mt-1.5">{physicalLabel}</span>
                                    </div>

                                    {/* Age Requirement */}
                                    <div className="flex flex-col items-center text-center">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <svg className="w-[16px] h-[16px] text-[#3F3F42]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-[13px] md:text-[14px] font-medium text-[#3F3F42]">Age Req.</span>
                                        </div>
                                        <div className="w-full h-[3px] bg-gray-200 rounded-full relative">
                                            <div
                                                className="h-full rounded-full bg-[#512AA7]"
                                                style={{ width: `${agePercent}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-[12px] md:text-[13px] text-[#3F3F42] mt-1.5">{ageText}</span>
                                    </div>

                                    {/* Group Size */}
                                    <div className="flex flex-col items-center text-center">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <svg className="w-[16px] h-[16px] text-[#3F3F42]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-[13px] md:text-[14px] font-medium text-[#3F3F42]">Group Size</span>
                                        </div>
                                        <div className="w-full h-[3px] bg-gray-200 rounded-full relative">
                                            <div
                                                className="h-full rounded-full bg-[#512AA7]"
                                                style={{ width: `${groupPercent}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-[12px] md:text-[13px] text-[#3F3F42] mt-1.5">{groupSize} People</span>
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
