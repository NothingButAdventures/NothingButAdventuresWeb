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
        subtitle: "100+ successful planed trips",
        image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1000&auto=format&fit=crop"
    },
    {
        _id: "def-2",
        name: "Nepal",
        slug: "nepal",
        continent: "asia",
        subtitle: "40+ successful planed trips",
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1000&auto=format&fit=crop"
    },
    {
        _id: "def-3",
        name: "Luxurious Jodhpur",
        slug: "jodhpur",
        continent: "asia",
        subtitle: "500+ successful planed trips",
        image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=1000&auto=format&fit=crop"
    },
    {
        _id: "def-4",
        name: "Kerala",
        slug: "kerala",
        continent: "asia",
        subtitle: "300+ successful planed trips",
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
        <section className="w-full relative font-outfit mt-8 sm:mt-16 md:mt-[60px] lg:mt-[90px] xl:mt-[120px] mb-8 md:mb-12 xl:mb-20">
            {/* Mobile Header Area (#5640:5568 / Curate your Destination) */}
            <div className="block md:hidden mb-5">
                {/* Badge (width: 73.33px, height: 15.17px) */}
                <div className="inline-flex items-center justify-center w-[73.33px] h-[15.17px] bg-[rgba(26,26,26,0.05)] text-[rgba(26,26,26,0.55)] rounded-[69.54px] text-[8.85px] font-medium tracking-normal mb-[8px] font-outfit">
                    Tours Snippets
                </div>

                {/* Title + Navigation Buttons Row */}
                <div className="flex items-center justify-between w-full">
                    <h2 className="text-[30.34px] font-normal leading-[1.12] text-[#1A1A1A] tracking-normal font-outfit">
                        Curate your <span className="font-gochi text-[#254B02]">Destination</span>
                    </h2>

                    <div className="flex items-center gap-[5px] shrink-0">
                        <button
                            onClick={() => scroll("left")}
                            disabled={!canScrollLeft}
                            className={`w-[28px] h-[28px] rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                canScrollLeft
                                    ? "bg-[#1A1A1A] hover:bg-black text-white"
                                    : "bg-[#B5B9B1]/60 text-white/70 cursor-not-allowed"
                            }`}
                            aria-label="Previous destination"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.6}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            disabled={!canScrollRight}
                            className={`w-[28px] h-[28px] rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                canScrollRight
                                    ? "bg-[#1A1A1A] hover:bg-black text-white"
                                    : "bg-[#B5B9B1]/60 text-white/70 cursor-not-allowed"
                            }`}
                            aria-label="Next destination"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.6}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop Header Area (#5640:7561 on 785px / #5091:7556 on 1280px) */}
            <div className="hidden md:flex flex-col mb-3.5 md:mb-4 lg:mb-5 xl:mb-[26px]">
                {/* Badge (#5640:7562 on 785px: 71px x 14.72px / 1280px: 116px x 24px) */}
                <div className="inline-flex items-center justify-center w-[71px] lg:w-[94px] xl:w-[116px] h-[14.7px] lg:h-[19px] xl:h-[24px] bg-[rgba(26,26,26,0.05)] text-[rgba(26,26,26,0.55)] rounded-[67px] xl:rounded-[110px] text-[8.59px] lg:text-[11px] xl:text-[14px] font-medium tracking-normal mb-[6.1px] lg:mb-[8px] xl:mb-[10px] font-outfit">
                    Tours Snippets
                </div>
                {/* Title (#5640:7564 on 785px: 29.44px Outfit / 1280px: 48px Outfit) */}
                <h2 className="text-[29.44px] lg:text-[38px] xl:text-[48px] font-normal leading-[32px] lg:leading-[42px] xl:leading-[52px] text-[#1A1A1A] tracking-normal font-outfit mt-0">
                    Curate your <span className="font-gochi text-[#254B02]">Destination</span>
                </h2>
            </div>

            {/* Destination Carousel Container */}
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

                {/* Desktop Left Navigation Arrow */}
                {canScrollLeft && (
                    <button
                        onClick={() => scroll("left")}
                        className="hidden md:flex absolute -left-3 md:-left-4 xl:-left-5 top-1/2 -translate-y-1/2 w-8 h-8 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-11 xl:h-11 bg-white/95 text-[#1A1A1A] rounded-full items-center justify-center transition-all duration-300 z-30 hover:scale-105 shadow-[0px_4px_16px_rgba(0,0,0,0.15)] cursor-pointer"
                        aria-label="Scroll left"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 xl:w-5 xl:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}

                {/* Desktop Right Navigation Arrow */}
                {canScrollRight && (
                    <button
                        onClick={() => scroll("right")}
                        className="hidden md:flex absolute -right-3 md:-right-4 xl:-right-5 top-1/2 -translate-y-1/2 w-8 h-8 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-11 xl:h-11 bg-white/95 text-[#1A1A1A] rounded-full items-center justify-center transition-all duration-300 z-30 hover:scale-105 shadow-[0px_4px_16px_rgba(0,0,0,0.15)] cursor-pointer"
                        aria-label="Scroll right"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 xl:w-5 xl:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}

                {/* Cards Container (#5640:7565 on 785px: 177.85px x 247.77px / #5091:7560 on 1280px: 290px x 404px) */}
                <div 
                    ref={scrollRef}
                    className="flex gap-[12px] md:gap-[9.8px] lg:gap-[13px] xl:gap-[16px] overflow-x-auto pb-4 hide-scroll snap-x snap-mandatory"
                >
                    {selectedCountries.map((country, index) => {
                        const continentSlug = 
                            (typeof country.continent === "object" && country.continent?.slug) || 
                            (typeof country.continent === "string" && country.continent) ||
                            getContinentSlug(country.name);
                        const linkHref = `/destinations/${continentSlug}/${country.slug}`;

                        const tripCount = country.statistics?.totalTours ? `${country.statistics.totalTours * 10}+` : `${(index + 1) * 100}+`;
                        const subtitleText = country.subtitle || country.shortDescription || `${tripCount} successful planed trips`;

                        return (
                            <Link
                                key={country._id || country.slug || index}
                                href={linkHref}
                                className="relative w-[238px] min-w-[238px] h-[332px] md:w-[177.85px] md:min-w-[177.85px] md:h-[247.77px] lg:w-[234px] lg:min-w-[234px] lg:h-[326px] xl:w-[290px] xl:min-w-[290px] xl:h-[404px] rounded-[10px] md:rounded-[7.4px] xl:rounded-[12px] overflow-hidden snap-start shrink-0 block group/card shadow-sm hover:shadow-md transition-shadow duration-300"
                            >
                                {/* Card Background Image (#5640:7567 / #5091:7562) */}
                                <img
                                    src={country.image || fallbackImage}
                                    alt={country.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover/card:scale-105"
                                />

                                {/* Top Right Circular Arrow Pill (#5640:7569) */}
                                <div
                                    className="absolute top-[12px] md:top-[10px] lg:top-[13px] xl:top-[17px] right-[12px] md:right-[10px] lg:right-[13px] xl:right-[17px] w-[28px] h-[28px] md:w-[24.5px] md:h-[24.5px] lg:w-[28px] lg:h-[28px] xl:w-[34px] xl:h-[34px] rounded-full bg-white flex items-center justify-center text-[#1A1A1A] z-20 shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-transform duration-300 group-hover/card:scale-110"
                                >
                                    <svg 
                                        className="w-[13px] h-[13px] md:w-[11px] md:h-[11px] lg:w-[14px] lg:h-[14px] xl:w-[17px] xl:h-[17px] text-[#1A1A1A] transition-transform duration-300 ease-out group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5" 
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

                                {/* Bottom Gradient Overlay */}
                                <div 
                                    className="absolute bottom-0 left-0 right-0 h-[120px] pointer-events-none z-10 rounded-b-[10px] md:rounded-b-[7.4px] xl:rounded-b-[12px]"
                                    style={{
                                        background: "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 35%, rgba(0, 0, 0, 0.95) 100%)"
                                    }}
                                ></div>

                                {/* Text Content (#5640:7577 / #5640:7578) */}
                                <div className="absolute bottom-[16px] md:bottom-[12px] lg:bottom-[16px] xl:bottom-[20px] left-[16px] md:left-[13.5px] lg:left-[18px] xl:left-[22px] right-[16px] md:right-[13.5px] lg:right-[18px] xl:right-[22px] z-20 flex flex-col justify-end pointer-events-none">
                                    <h3 className="text-white text-[16px] md:text-[12.27px] lg:text-[16px] xl:text-[20px] font-normal leading-normal font-outfit drop-shadow-sm">
                                        {country.name}
                                    </h3>
                                    <p className="text-white/60 text-[10.5px] md:text-[8px] lg:text-[10px] xl:text-[12px] font-normal leading-normal font-outfit tracking-normal mt-0.5 drop-shadow-xs">
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

