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

const defaultDestinations = [
    {
        _id: "def-1",
        name: "Rajasthan",
        slug: "rajasthan",
        continent: "asia",
        subtitle: "100+ successful planned trips",
        image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1000&auto=format&fit=crop"
    },
    {
        _id: "def-2",
        name: "Nepal",
        slug: "nepal",
        continent: "asia",
        subtitle: "40+ successful planned trips",
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1000&auto=format&fit=crop"
    },
    {
        _id: "def-3",
        name: "Luxurious Jodhpur",
        slug: "jodhpur",
        continent: "asia",
        subtitle: "500+ successful planned trips",
        image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=1000&auto=format&fit=crop"
    },
    {
        _id: "def-4",
        name: "Kerala",
        slug: "kerala",
        continent: "asia",
        subtitle: "300+ successful planned trips",
        image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1000&auto=format&fit=crop"
    }
];

export default function PopularDestinationsSection({ countries = [] }: PopularDestinationsSectionProps) {
    const fallbackImage = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=3506&auto=format&fit=crop";

    const [selectedCountries, setSelectedCountries] = React.useState<any[]>([]);
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
        if (!countries || countries.length === 0) {
            setSelectedCountries(defaultDestinations);
            return;
        }

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
        
        // Pick top countries per continent
        const chosenCountries = continentSlugs.map(slug => {
            const group = continentGroups[slug];
            group.sort((a, b) => {
                const aScore = a.statistics?.totalTours || a.statistics?.popularityScore || 0;
                const bScore = b.statistics?.totalTours || b.statistics?.popularityScore || 0;
                return bScore - aScore;
            });
            return group[0];
        });

        if (chosenCountries.length > 0) {
            setSelectedCountries(chosenCountries);
        } else {
            setSelectedCountries(defaultDestinations);
        }
    }, [countries]);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = scrollRef.current.clientWidth * 0.75; 
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth"
            });
        }
    };

    return (
        <section className="mt-16 sm:mt-20 md:mt-24 lg:mt-28 mb-16 relative font-outfit">
            {/* Header Area (#5091:7556) */}
            <div className="flex flex-col mb-8 md:mb-10">
                <div className="inline-flex items-center justify-center w-fit px-3.5 py-1 bg-[rgba(26,26,26,0.05)] text-[rgba(26,26,26,0.55)] rounded-[110px] text-[14px] font-medium tracking-normal mb-3 font-outfit">
                    Tours Snippets
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-[44px] lg:text-[48px] font-normal leading-[1.15] text-[#1A1A1A] tracking-tight font-outfit">
                    Curate your <span className="font-gochi text-[#254B02]">Destination</span>
                </h2>
            </div>

            {/* Destination Carousel (#5091:7560) */}
            <div className="relative group/carousel w-full">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .hide-scroll::-webkit-scrollbar {
                        display: none;
                    }
                    .hide-scroll {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}} />

                {/* Left Navigation Arrow */}
                {canScrollLeft && (
                    <button
                        onClick={() => scroll("left")}
                        className="absolute -left-3 md:-left-5 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 bg-white/95 text-[#1A1A1A] rounded-full flex items-center justify-center transition-all duration-300 z-30 hover:scale-105 shadow-[0px_4px_16px_rgba(0,0,0,0.15)] cursor-pointer"
                        aria-label="Scroll left"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}

                {/* Right Navigation Arrow */}
                {canScrollRight && (
                    <button
                        onClick={() => scroll("right")}
                        className="absolute -right-3 md:-right-5 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 bg-white/95 text-[#1A1A1A] rounded-full flex items-center justify-center transition-all duration-300 z-30 hover:scale-105 shadow-[0px_4px_16px_rgba(0,0,0,0.15)] cursor-pointer"
                        aria-label="Scroll right"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}

                {/* Cards Container (#5091:7560: gap: 16px, cards: 290x404) */}
                <div 
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto pb-4 hide-scroll snap-x snap-mandatory"
                >
                    {selectedCountries.map((country, index) => {
                        const continentSlug = 
                            (typeof country.continent === "object" && country.continent?.slug) || 
                            (typeof country.continent === "string" && country.continent) ||
                            getContinentSlug(country.name);
                        const linkHref = `/destinations/${continentSlug}/${country.slug}`;

                        const tripCount = country.statistics?.totalTours ? `${country.statistics.totalTours * 10}+` : `${(index + 1) * 100}+`;
                        const subtitleText = country.subtitle || country.shortDescription || `${tripCount} successful planned trips`;

                        return (
                            <Link
                                key={country._id || country.slug || index}
                                href={linkHref}
                                className="relative w-[80%] min-w-[80%] sm:w-[calc((100%-16px)/2)] sm:min-w-[calc((100%-16px)/2)] md:w-[calc((100%-32px)/3)] md:min-w-[calc((100%-32px)/3)] lg:w-[calc((100%-48px)/4)] lg:min-w-[calc((100%-48px)/4)] h-[380px] sm:h-[395px] lg:h-[404px] rounded-[12px] overflow-hidden snap-start shrink-0 block group/card shadow-sm hover:shadow-md transition-shadow duration-300"
                            >
                                {/* Card Background Image (#5091:7562) */}
                                <img
                                    src={country.image || fallbackImage}
                                    alt={country.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover/card:scale-105"
                                />

                                {/* Top Right Circular Arrow Pill (#5091:7564: 34x34px solid white with black arrow) */}
                                <div
                                    className="absolute top-[17px] right-[17px] w-[34px] h-[34px] rounded-full bg-white flex items-center justify-center text-[#1A1A1A] z-20 shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                                >
                                    <svg 
                                        className="w-[18px] h-[18px] text-[#1A1A1A] transition-transform duration-300 ease-out group-hover/card:rotate-45" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="2.2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    >
                                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                                    </svg>
                                </div>

                                {/* Bottom Gradient Overlay (#5091:7563: y=283, h=121, linear-gradient(180deg, rgba(0,0,0,0) 12%, rgba(0,0,0,1) 100%)) */}
                                <div 
                                    className="absolute bottom-0 left-0 right-0 h-[135px] pointer-events-none z-10 rounded-b-[12px]"
                                    style={{
                                        background: "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.45) 30%, rgba(0, 0, 0, 0.95) 100%)"
                                    }}
                                ></div>

                                {/* Text Content (#5091:7572, #5091:7573 at x=22, y=343 / y=357) */}
                                <div className="absolute bottom-[20px] left-[22px] right-[22px] z-20 flex flex-col justify-end pointer-events-none">
                                    <h3 className="text-white text-[20px] font-normal leading-tight font-outfit tracking-[-0.01em] drop-shadow-sm">
                                        {country.name}
                                    </h3>
                                    <p className="text-white/60 text-[12px] font-normal leading-tight font-outfit tracking-normal mt-1 drop-shadow-xs">
                                        {subtitleText}
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

