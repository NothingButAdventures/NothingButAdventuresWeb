"use client";

import React from "react";
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
};

type PopularDestinationsSectionProps = {
    countries?: Country[];
};

export default function PopularDestinationsSection({ countries = [] }: PopularDestinationsSectionProps) {
    const fallbackImage = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=3506&auto=format&fit=crop";

    const [selectedCountries, setSelectedCountries] = React.useState<Country[]>([]);

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
        
        // Shuffle and pick up to 4 unique continents
        const shuffledContinents = [...continentSlugs].sort(() => Math.random() - 0.5);
        const selectedContinents = shuffledContinents.slice(0, 4);

        // For each selected continent, pick a random country
        const chosenCountries = selectedContinents.map(slug => {
            const group = continentGroups[slug];
            const randomIndex = Math.floor(Math.random() * group.length);
            return group[randomIndex];
        });

        setSelectedCountries(chosenCountries);
    }, [countries]);

    return (
        <section className="mx-auto mt-24 mb-16">
            {/* Header Area */}
            <div className="mb-10">
                <div className="inline-block px-4 py-1.5 bg-[#DEECFF] text-gray-500 rounded-full text-[13px] font-semibold tracking-wide mb-6">
                    Views
                </div>
                <h2 className="text-6xl md:text-[68px] font-medium leading-tight text-gray-900 tracking-tight mb-4">
                    Popular Destinations
                </h2>
                <p className="text-[17px] md:text-[18px] text-gray-500 font-medium leading-[1.6]">
                    From the Himalayas to the tropical south, discover India's diverse landscapes
                </p>
            </div>

            {/* Destination Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {selectedCountries.map((country, index) => {
                    // Resolve the continent slug dynamically from the backend data or local map fallback
                    const continentSlug = 
                        (typeof country.continent === "object" && country.continent?.slug) || 
                        getContinentSlug(country.name);
                    const linkHref = `/destinations/${continentSlug}/${country.slug}`;

                    return (
                        <Link
                            key={country._id || country.slug}
                            href={linkHref}
                            className="relative w-full aspect-[4/5] md:aspect-[4/5] rounded-[20px] overflow-hidden block group cursor-pointer shadow-sm"
                        >
                            <img
                                src={country.image || fallbackImage}
                                alt={country.name}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                            />

                            {/* Dark Overlay for Text Readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none z-10"></div>

                            {/* Coming Soon Badge (applied to the 4th item to balance the Figma mockup design) */}
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
        </section>
    );
}
