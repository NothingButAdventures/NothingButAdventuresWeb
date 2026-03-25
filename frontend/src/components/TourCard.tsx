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
        travelStyle?: string;
        rating?: number;
    };
}

export default function TourCard({ tour }: TourCardProps) {
    // Use descriptionImage first, then fall back to primary/first gallery image
    const primaryImage =
        tour.images?.find((img) => img.isPrimary) || tour.images?.[0];
    const cardImageUrl = tour.descriptionImage || primaryImage?.url || "";
    const cardImageAlt = tour.name;
    const discountedPrice =
        tour.price?.discountPercent > 0
            ? tour.price.amount * (1 - tour.price.discountPercent / 100)
            : tour.price?.amount || 0;

    // Determine pill colors based on travel style
    let pillBg = "bg-[#2b4c3e]"; // default adventure green
    const styleStr = (tour.travelStyle || "").toLowerCase();

    if (styleStr.includes("journey") || styleStr.includes("classic")) {
        pillBg = "bg-[#d88941]"; // orange
    }

    return (
        <Link href={`/trip/${tour.slug}/${tour.tourCode}`} className="block h-full cursor-pointer group/card w-full">
            <div className="transition-all duration-500 transform h-[460px] md:h-[480px] flex flex-col rounded-[16px]">
                {/* Image Container - flex-1 allows it to grow/shrink based on remaining space */}
                <div className="relative w-full flex-1 min-h-0 overflow-hidden bg-gray-100 transition-all duration-500 rounded-t-[16px] z-10">
                    {cardImageUrl ? (
                        <img
                            src={cardImageUrl}
                            alt={cardImageAlt}
                            className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover/card:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200"></div>
                    )}

                    {/* Inverted Corner Badge (Top Left) */}
                    <div className="absolute top-0 left-0 bg-white pt-1.5 pl-1.5 pr-2 pb-2 rounded-br-[18px] z-10 before:content-[''] before:absolute before:top-0 before:-right-[12px] before:w-[12px] before:h-[12px] before:bg-transparent before:rounded-tl-[12px] before:shadow-[-5px_-5px_0_5px_white] after:content-[''] after:absolute after:-bottom-[12px] after:left-0 after:w-[12px] after:h-[12px] after:bg-transparent after:rounded-tl-[12px] after:shadow-[-5px_-5px_0_5px_white]">
                        <div className={`relative z-10 px-3 py-1 ${pillBg} text-white text-xs font-semibold rounded-full shadow-sm capitalize`}>
                            {tour.travelStyle || "Adventure"}
                        </div>
                    </div>
                </div>

                {/* Content - flex-shrink-0 ensures it occupies exactly what it needs */}
                <div className="p-4 md:p-5 shrink-0 flex flex-col bg-white z-0 rounded-b-[16px] shadow-[0_8px_20px_rgba(0,0,0,0.06),-4px_4px_15px_rgba(0,0,0,0.03),4px_4px_15px_rgba(0,0,0,0.03)] relative">
                    {/* Title and Price */}
                    <div className="flex justify-between items-start mb-1 gap-2">
                        <h3 className="text-[17px] md:text-[19px] font-bold text-gray-900 leading-[1.2] line-clamp-1">
                            {tour.name}
                        </h3>
                        <div className="text-[17px] md:text-[19px] font-bold text-black shrink-0">
                            ${Math.round(discountedPrice).toLocaleString()}
                        </div>
                    </div>

                    {/* Subtitle / Description */}
                    <p className="text-gray-500 text-[13px] md:text-[14px] line-clamp-1 group-hover/card:line-clamp-2 mb-3 leading-relaxed min-h-[20px]">
                        {tour.country?.name
                            ? `${tour.country.name}, exploring natural beauty and heritage sites.`
                            : "Explore beautiful destinations around the world with our exclusive tour."}
                    </p>

                    {/* Divider */}
                    <div className="border-t border-gray-100 mb-3"></div>

                    {/* Footer (Days, Location, Rating) */}
                    <div className="flex items-center justify-between text-gray-500 text-[13px] md:text-[14px]">
                        <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {String(tour.duration?.days || 0).padStart(2, '0')} Days
                        </div>
                        <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate max-w-[120px]">{tour.country?.name || "Multiple"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            {tour.rating || "4.8"}
                        </div>
                    </div>

                    {/* Expandable Hover Content */}
                    <div className="grid grid-rows-[0fr] group-hover/card:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                        <div className="overflow-hidden">
                            <div className="pt-5 flex flex-col gap-4 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 delay-100">
                                {/* Tags */}
                                <div className="flex flex-wrap gap-2">
                                    <span className="bg-[#111] text-white text-[11px] font-semibold px-3 py-1.5 rounded-full">Bestseller</span>
                                    <span className="bg-[#111] text-white text-[11px] font-semibold px-3 py-1.5 rounded-full">NBA Club</span>
                                    {tour.travelStyle && (
                                        <span className="bg-[#111] text-white text-[11px] font-semibold px-3 py-1.5 rounded-full capitalize">{tour.travelStyle}</span>
                                    )}
                                </div>

                                {/* View Tour Button */}
                                <div className="w-full bg-[#111] text-white text-[16px] font-medium py-3.5 rounded-xl hover:bg-black transition-colors text-center cursor-pointer">
                                    View Trip
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
