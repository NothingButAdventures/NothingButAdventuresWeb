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
        summary?: string;
        startDates?: Array<{
            startDate?: string;
        }>;
        travelStyle?: string;
        rating?: number;
    };
    showDetailsByDefault?: boolean;
}

export default function TourCard({ tour }: TourCardProps) {
    const primaryImage =
        tour.images?.find((img) => img.isPrimary) || tour.images?.[0];
    const cardImageUrl = tour.descriptionImage || primaryImage?.url || "";
    const cardImageAlt = tour.name;
    const discountedPrice =
        tour.price?.discountPercent > 0
            ? tour.price.amount * (1 - tour.price.discountPercent / 100)
            : tour.price?.amount || 0;

    const descriptionText =
        tour.summary ||
        (tour.country?.name
            ? `${tour.country.name}, exploring natural beauty and heritage sites.`
            : "Explore beautiful destinations around the world with our exclusive tour.");

    return (
        <Link href={`/trips/${tour.slug}/${tour.tourCode}`} className="block h-full cursor-pointer group/card w-full">
            <div className="flex flex-col bg-white rounded-[16px] border border-gray-200 shadow-sm overflow-hidden h-full transition-transform duration-300 hover:shadow-md">
                {/* Image Section */}
                <div className="relative w-full aspect-square bg-gray-100 overflow-hidden shrink-0">
                    {cardImageUrl ? (
                        <img
                            src={cardImageUrl}
                            alt={cardImageAlt}
                            className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover/card:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200"></div>
                    )}

                    {/* Badge at bottom left */}
                    <div className="absolute left-4 bottom-4 z-10">
                        <div
                            className="flex items-center gap-1 bg-white text-[#512AA7] px-2.5 py-0.5 rounded-full text-[12px] font-bold ring-2 ring-white"
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
                    {/* Title and Price */}
                    <div className="flex justify-between items-start gap-4 mb-1">
                        <h3 className="text-[19px] md:text-[21px] font-bold text-[#3F3F42] leading-tight flex-1 line-clamp-1">
                            {tour.name}
                        </h3>
                        <div className="text-[19px] md:text-[21px] font-bold text-[#3F3F42] shrink-0">
                            ${Math.round(discountedPrice).toLocaleString()}
                        </div>
                    </div>

                    {/* Subtitle / Description */}
                    <p className="text-[14px] text-[#3F3F42] line-clamp-1 mb-3">
                        {descriptionText}
                    </p>

                    {/* Spacer to push footer down if card grows */}
                    <div className="grow"></div>

                    {/* Divider */}
                    <hr className="border-gray-100 mb-4" />

                    {/* Footer */}
                    <div className="flex justify-between items-center text-[13px] md:text-[14px] text-[#3F3F42]">
                        <div className="flex items-center gap-1.5">
                            <svg className="w-[18px] h-[18px] text-[#3F3F42]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {tour.duration?.days || 0} Days
                        </div>
                        <div className="flex items-center gap-1.5">
                            <svg className="w-[18px] h-[18px] text-[#3F3F42]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate max-w-[120px]">{tour.country?.name || "3 Destinations"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <svg className="w-[18px] h-[18px] text-[#3F3F42]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            {tour.rating || "4.8"}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
