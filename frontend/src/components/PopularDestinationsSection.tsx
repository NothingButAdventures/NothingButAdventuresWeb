"use client";

import React from "react";
import Link from "next/link";

type Country = {
    _id: string;
    name: string;
    slug: string;
    shortDescription?: string;
    image?: string;
    statistics?: {
        totalTours: number;
        averageRating: number;
        totalReviews: number;
        popularityScore: number;
    };
};

type PopularDestinationsSectionProps = {
    countries?: Country[];
};

export default function PopularDestinationsSection({ countries = [] }: PopularDestinationsSectionProps) {
    // Fallback placeholder image if a country has no image
    const fallbackImage = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=3506&auto=format&fit=crop";

    return (
        <section className="mx-auto mt-24 mb-16">
            <div className="mb-10">
                <h2 className="text-[48px] md:text-[64px] font-medium leading-[1.1] text-black mb-4">
                    Popular Destinations
                </h2>
                <p className="text-[17px] md:text-[18px] text-black font-semibold leading-[1.6]">
                    From the Himalayas to the tropical south, discover India's diverse landscapes
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {countries.map((country) => (
                    <Link
                        key={country._id}
                        href={`/tours?country=${country.slug}`}
                        className="relative w-full aspect-[4/5] md:aspect-[3/4] rounded-[20px] overflow-hidden block group cursor-pointer"
                    >
                        <img
                            src={country.image || fallbackImage}
                            alt={country.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                        />

                        {/* Dark Overlay for Text */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none z-10"></div>

                        {/* Tour count badge */}
                        {country.statistics && country.statistics.totalTours > 0 && (
                            <div className="absolute top-4 right-4 bg-white text-black text-[13px] font-semibold px-4 py-1.5 rounded-full z-20 shadow-md">
                                {country.statistics.totalTours} {country.statistics.totalTours === 1 ? "Tour" : "Tours"}
                            </div>
                        )}

                        {/* Content */}
                        <div className="absolute bottom-6 left-6 right-6 z-20">
                            <h3 className="text-white text-[24px] font-bold leading-tight mb-1.5">
                                {country.name}
                            </h3>
                            {country.shortDescription && (
                                <p className="text-white/80 text-[14.5px] font-medium">
                                    {country.shortDescription}
                                </p>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
