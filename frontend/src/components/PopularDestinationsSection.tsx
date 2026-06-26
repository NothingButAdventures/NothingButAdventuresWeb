"use client";

import React, { useRef } from "react";
import Link from "next/link";

const CONTINENT_MAP: Record<string, string> = {
    "united states of america": "north-america",
    "usa": "north-america", "canada": "north-america", "mexico": "north-america",
    "brazil": "south-america", "colombia": "south-america", "argentina": "south-america", "peru": "south-america", "chile": "south-america",
    "united kingdom": "europe", "uk": "europe", "france": "europe", "germany": "europe", "italy": "europe", "spain": "europe", "switzerland": "europe", "greece": "europe",
    "china": "asia", "japan": "asia", "india": "asia", "indonesia": "asia", "thailand": "asia", "vietnam": "asia", "philippines": "asia", "malaysia": "asia", "singapore": "asia", "nepal": "asia", "sri lanka": "asia", "united arab emirates": "asia",
    "egypt": "africa", "south africa": "africa", "kenya": "africa", "tanzania": "africa", "morocco": "africa",
    "australia": "oceania", "new zealand": "oceania", "fiji": "oceania",
};

function getContinentSlug(countryName: string): string {
    return CONTINENT_MAP[countryName.trim().toLowerCase()] || "asia";
}

type Country = {
    _id: string;
    name: string;
    slug: string;
    shortDescription?: string;
    image?: string;
    continent?: string | { _id: string; slug: string; name: string };
    statistics?: { totalTours?: number; popularityScore?: number };
};

type PopularDestinationsSectionProps = {
    countries?: Country[];
};

export default function PopularDestinationsSection({ countries = [] }: PopularDestinationsSectionProps) {
    const fallbackImage = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=3506&auto=format&fit=crop";

    const [selectedCountries, setSelectedCountries] = React.useState<Country[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = React.useState(false);
    const [canScrollRight, setCanScrollRight] = React.useState(true);

    const checkScrollLimits = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 15);
            setCanScrollRight(scrollWidth - scrollLeft - clientWidth > 15);
        }
    };

    React.useEffect(() => {
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
    }, [selectedCountries]);

    React.useEffect(() => {
        if (countries.length === 0) return;

        // Group countries by continent
        const continentGroups: Record<string, Country[]> = {};
        countries.forEach(country => {
            const slug = (typeof country.continent === "object" && country.continent?.slug) || getContinentSlug(country.name);
            if (!continentGroups[slug]) {
                continentGroups[slug] = [];
            }
            continentGroups[slug].push(country);
        });

        const continentSlugs = Object.keys(continentGroups);
        
        // Pick all continents, and for each find the country with the most tours
        const chosenCountries = continentSlugs.map(slug => {
            const group = continentGroups[slug];
            // Sort by totalTours descending, or popularityScore if totalTours is missing
            group.sort((a, b) => {
                const aScore = a.statistics?.totalTours || a.statistics?.popularityScore || 0;
                const bScore = b.statistics?.totalTours || b.statistics?.popularityScore || 0;
                return bScore - aScore;
            });
            return group[0];
        });

        setSelectedCountries(chosenCountries);
    }, [countries]);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = scrollRef.current.clientWidth * 0.8; 
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth"
            });
        }
    };

    return (
        <section className="mx-auto mt-24 mb-16">
            {/* Header Area */}
            <div className="mb-10">
                <div className="inline-block px-4 py-1.5 bg-[#DEECFF] text-gray-500 rounded-full text-[13px] font-semibold tracking-wide mb-6">
                    Views
                </div>
                <h2 className="text-6xl md:text-[68px] font-medium leading-tight text-[#3F3F42] tracking-tight mb-4">
                    Popular Destinations
                </h2>
                <p className="text-[17px] md:text-[18px] text-gray-500 font-medium leading-[1.6]">
                    From the Himalayas to the tropical south, discover India's diverse landscapes
                </p>
            </div>

            {/* Destination Carousel */}
            <div className="relative group/carousel">
                {/* Navigation Buttons */}
                <button
                    onClick={() => scroll("left")}
                    className={`absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#3F3F42] text-white rounded-full flex items-center justify-center transition-all duration-300 z-30 hover:scale-105 shadow-lg ${
                        canScrollLeft ? "opacity-0 group-hover/carousel:opacity-100" : "hidden"
                    }`}
                    aria-label="Scroll left"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <button
                    onClick={() => scroll("right")}
                    className={`absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#3F3F42] text-white rounded-full flex items-center justify-center transition-all duration-300 z-30 hover:scale-105 shadow-lg ${
                        canScrollRight ? "opacity-0 group-hover/carousel:opacity-100" : "hidden"
                    }`}
                    aria-label="Scroll right"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Carousel Container */}
                <div 
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-2"
                >
                    {selectedCountries.map((country, index) => {
                        // Resolve the continent slug dynamically
                        const continentSlug = 
                            (typeof country.continent === "object" && country.continent?.slug) || 
                            getContinentSlug(country.name);
                        const linkHref = `/destinations/${continentSlug}/${country.slug}`;

                        return (
                            <Link
                                key={country._id || country.slug}
                                href={linkHref}
                                className="relative w-[85vw] sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] flex-shrink-0 aspect-[4/5] rounded-[20px] overflow-hidden block group cursor-pointer shadow-sm snap-start"
                            >
                                <img
                                    src={country.image || fallbackImage}
                                    alt={country.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                                />

                                {/* Dark Overlay for Text Readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none z-10"></div>

                                {/* Coming Soon Badge */}
                                {index === 3 && (
                                    <div className="absolute top-4 left-4 bg-[#FF5A36] text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full z-20 tracking-wide uppercase shadow-sm">
                                        Coming Soon
                                    </div>
                                )}

                                {/* Content */}
                                <div className="absolute bottom-6 left-6 right-6 z-20">
                                    <h3 className="text-white text-[24px] font-bold leading-tight mb-1">
                                        {country.name}
                                    </h3>
                                    <p className="text-white/80 text-[14.5px] font-medium">
                                        {country.shortDescription || "Palaces, forts & deserts"}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
