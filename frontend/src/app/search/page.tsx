"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import QuickViewModal from "@/components/QuickViewModal";
import TourCard from "@/components/TourCard";

interface Tour {
    _id: string;
    name: string;
    slug: string;
    tourCode: string;
    price: {
        amount: number;
        currency: string;
        discountPercent: number;
    };
    duration: {
        days: number;
        nights: number;
    };
    ratingsAverage: number;
    ratingsQuantity: number;
    summary: string;
    images: Array<{
        url: string;
        caption: string;
        isPrimary: boolean;
    }>;
    country: {
        _id: string;
        name: string;
    };
    startDates: any[];
    travelStyle: string;
    interests?: string[];
    physicalRating: {
        level: number;
    };
    serviceLevel: string;
    tags: string[];
    itineraryMapImage?: string;
    ageRequirement?: {
        min: number;
        max: number;
    };
    location?: {
        startCity: string;
        endCity: string;
    };
    itinerary?: Array<{
        day: number;
        title: string;
        description: string;
    }>;
}

const DESTINATIONS_DATA: Record<string, string[]> = {
    Asia: ["India", "Thailand", "Vietnam", "Japan", "Cambodia", "Indonesia", "Nepal", "Bhutan", "Sri Lanka", "Maldives"],
    Africa: ["Egypt", "Morocco", "South Africa", "Kenya", "Tanzania", "Namibia", "Botswana", "Uganda"],
    Europe: ["France", "Italy", "Spain", "Greece", "Switzerland", "Iceland", "Norway", "Ireland", "Portugal", "Croatia"],
    "North America": ["USA", "Canada", "Mexico", "Costa Rica", "Guatemala"],
    "South America": ["Peru", "Brazil", "Argentina", "Chile", "Colombia", "Ecuador"],
    Oceania: ["Australia", "New Zealand", "Fiji"]
};

const TRAVEL_STYLES = ["Adventure", "Luxury", "Cultural", "Wildlife", "Marine", "Family", "Hiking"];
const DURATIONS = ["1-3 Days", "4-7 Days", "8-14 Days", "15+ Days"];
const PRICES = ["Under $1000", "$1000 - $2000", "$2000 - $3000", "$3000 - $5000", "$5000+"];
const DISCOUNTS = ["Any Discount", "20% off or more", "30% off or more", "40% off or more", "50% off or more"];
const PHYSICAL_RATINGS = ["1 - Easy", "2 - Light", "3 - Average", "4 - Demanding", "5 - Challenging"];
const SERVICE_LEVELS = ["Standard", "Comfort", "Premium", "Luxury"];

function SearchContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Parse URL params
    const query = searchParams.get("s") || "";
    const selectedCountries = searchParams.get("destinations")?.split(",").filter(Boolean) || [];
    const selectedStyles = searchParams.get("styles")?.split(",").filter(Boolean) || [];
    const selectedInterests = searchParams.get("interests")?.split(",").filter(Boolean) || [];
    const selectedDurations = searchParams.get("durations")?.split(",").filter(Boolean) || [];
    const selectedCollections = searchParams.get("collections")?.split(",").filter(Boolean) || [];
    const selectedDates = searchParams.get("dates")?.split(",").filter(Boolean) || [];
    const selectedPrices = searchParams.get("prices")?.split(",").filter(Boolean) || [];
    const selectedDiscounts = searchParams.get("discounts")?.split(",").filter(Boolean) || [];
    const selectedPhysical = searchParams.get("physical")?.split(",").filter(Boolean) || [];
    const selectedService = searchParams.get("service")?.split(",").filter(Boolean) || [];
    const fromDeals = searchParams.get("fromDeals") === "true";
    const dealPercentage = searchParams.get("percentage") || "";

    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [availableInterests, setAvailableInterests] = useState<string[]>([]);
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
    const [discountsList, setDiscountsList] = useState<{ name: string; percentage: number }[]>([]);

    const discountsOptions = [
        "Any Discount",
        ...discountsList.map(d => d.name),
        ...selectedDiscounts.filter(val => val !== "Any Discount" && !discountsList.some(d => d.name === val))
    ];

    const [continents, setContinents] = useState<any[]>([]);
    const [selectedContinentSlug, setSelectedContinentSlug] = useState<string>("all");
    const [continentCountries, setContinentCountries] = useState<string[]>([]);
    const [fetchingContinentCountries, setFetchingContinentCountries] = useState(false);

    // Active state for dropdowns (UI only)
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    // Carousel state
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScrollLimits = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 5);
            setCanScrollRight(scrollWidth - scrollLeft - clientWidth > 5);
        }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            checkScrollLimits();
            container.addEventListener("scroll", checkScrollLimits);
            window.addEventListener("resize", checkScrollLimits);
            return () => {
                container.removeEventListener("scroll", checkScrollLimits);
                window.removeEventListener("resize", checkScrollLimits);
            };
        }
    }, [tours, selectedContinentSlug, activeFilter]); // Re-check when results change

    const scrollNext = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const firstChild = container.firstElementChild as HTMLElement;
            if (firstChild) {
                const gap = parseFloat(window.getComputedStyle(container).gap) || 24;
                const scrollAmount = firstChild.clientWidth + gap;
                container.scrollBy({ left: scrollAmount, behavior: "smooth" });
            }
        }
    };

    const scrollPrev = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const firstChild = container.firstElementChild as HTMLElement;
            if (firstChild) {
                const gap = parseFloat(window.getComputedStyle(container).gap) || 24;
                const scrollAmount = firstChild.clientWidth + gap;
                container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
            }
        }
    };

    // Fetch continents if fromDeals
    useEffect(() => {
        if (fromDeals) {
            fetch(`${api.baseURL}${api.endpoints.continents.getAll}`)
                .then(res => res.json())
                .then(data => {
                    if (data.status === "success") {
                        setContinents([{ name: "All", slug: "all" }, ...(data.data.continents || [])]);
                    }
                })
                .catch(err => console.error(err));
        }
    }, [fromDeals]);

    // Fetch countries for selected continent
    useEffect(() => {
        if (selectedContinentSlug !== "all") {
            setFetchingContinentCountries(true);
            fetch(`${api.baseURL}/countries/continent/${selectedContinentSlug}`)
                .then(res => res.json())
                .then(data => {
                    const countries = data?.data?.countries || data?.data || [];
                    setContinentCountries(countries.map((c: any) => c.name));
                })
                .catch(err => console.error(err))
                .finally(() => setFetchingContinentCountries(false));
        } else {
            setContinentCountries([]);
            setFetchingContinentCountries(false);
        }
    }, [selectedContinentSlug]);

    // Initial load
    useEffect(() => {
        fetchTours();
    }, []);

    const fetchTours = async () => {
        try {
            const response = await fetch(
                `${api.baseURL}${api.endpoints.tours.getAll}`,
            );
            const data = await response.json();

            if (response.ok) {
                const tourData = data.data.tours || data.data;
                setTours(tourData);

                // Extract unique tags, interests and dates
                const tags = Array.from(new Set(tourData.flatMap((t: Tour) => t.tags || []))).sort() as string[];
                setAvailableTags(tags);

                const interests = Array.from(new Set(tourData.flatMap((t: Tour) => t.interests || []))).sort() as string[];
                setAvailableInterests(interests);

                const dates = Array.from(new Set(tourData.flatMap((t: Tour) => t.startDates?.map((d: any) => {
                    const date = new Date(d.startDate);
                    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
                }) || []))).sort((a: any, b: any) => {
                    return new Date(a).getTime() - new Date(b).getTime();
                }) as string[];
                setAvailableDates(dates);
            }

            // Fetch active discounts
            try {
                const discountsRes = await fetch(`${api.baseURL}/discounts/active`);
                if (discountsRes.ok) {
                    const discountsData = await discountsRes.json();
                    if (discountsData.status === "success") {
                        setDiscountsList(discountsData.data.discounts || []);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch active discounts:", err);
            }
        } catch (error) {
            console.error("Failed to fetch tours:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateUrl = (key: string, values: string[]) => {
        const params = new URLSearchParams(searchParams.toString());
        if (values.length > 0) {
            params.set(key, values.join(","));
        } else {
            params.delete(key);
        }
        router.push(`/search?${params.toString()}`);
    };

    const handleFilterChange = (item: string, currentList: string[], paramKey: string) => {
        const newList = currentList.includes(item)
            ? currentList.filter(i => i !== item)
            : [...currentList, item];
        updateUrl(paramKey, newList);
    };

    const clearAllFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("destinations");
        params.delete("styles");
        params.delete("interests");
        params.delete("durations");
        params.delete("collections");
        params.delete("dates");
        params.delete("prices");
        params.delete("discounts");
        params.delete("physical");
        params.delete("service");
        router.push(`/search?${params.toString()}`);
    };

    const isDurationMatch = (days: number, durationLabels: string[]) => {
        return durationLabels.some(label => {
            if (label === "1-3 Days") return days >= 1 && days <= 3;
            if (label === "4-7 Days") return days >= 4 && days <= 7;
            if (label === "8-14 Days") return days >= 8 && days <= 14;
            if (label === "15+ Days") return days >= 15;
            return false;
        });
    };

    const filteredTours = tours.filter((tour) => {
        // Search Query Check
        if (query) {
            const lowerQuery = query.toLowerCase();
            const matchesSearch =
                tour.name.toLowerCase().includes(lowerQuery) ||
                tour.country.name.toLowerCase().includes(lowerQuery);
            if (!matchesSearch) return false;
        }

        // Destinations Check
        if (selectedCountries.length > 0 && !fromDeals) {
            if (!selectedCountries.includes(tour.country.name)) return false;
        }

        // Continent Check (Deals Mega Menu)
        if (fromDeals && selectedContinentSlug !== "all") {
            if (fetchingContinentCountries) return false; // hide until loaded
            if (!continentCountries.includes(tour.country.name)) return false;
        }

        // Travel Style Check
        if (selectedStyles.length > 0) {
            if (!selectedStyles.includes(tour.travelStyle)) return false;
        }

        // Interests Check
        if (selectedInterests.length > 0) {
            if (!tour.interests || !selectedInterests.some(interest => tour.interests?.includes(interest))) return false;
        }

        // Duration Check
        if (selectedDurations.length > 0) {
            if (!isDurationMatch(tour.duration.days, selectedDurations)) return false;
        }

        // Collections (Tags) Check
        if (selectedCollections.length > 0) {
            if (!tour.tags || !selectedCollections.some(tag => tour.tags.includes(tag))) return false;
        }

        // Dates Check
        if (selectedDates.length > 0) {
            const tourDates = tour.startDates?.map((d: any) =>
                new Date(d.startDate).toLocaleString('default', { month: 'long', year: 'numeric' })
            ) || [];
            if (!selectedDates.some(date => tourDates.includes(date))) return false;
        }

        // Price Check
        if (selectedPrices.length > 0) {
            const price = tour.price.discountPercent > 0
                ? tour.price.amount * (1 - tour.price.discountPercent / 100)
                : tour.price.amount;

            const matchesPrice = selectedPrices.some(range => {
                if (range === "Under $1000") return price < 1000;
                if (range === "$1000 - $2000") return price >= 1000 && price <= 2000;
                if (range === "$2000 - $3000") return price >= 2000 && price <= 3000;
                if (range === "$3000 - $5000") return price >= 3000 && price <= 5000;
                if (range === "$5000+") return price >= 5000;
                return false;
            });
            if (!matchesPrice) return false;
        }

        // Discount Check
        if (selectedDiscounts.length > 0) {
            const tourDiscountPercent = tour.price.discountPercent || 0;
            const matchesDiscount = selectedDiscounts.some(selectedName => {
                if (selectedName === "Any Discount") {
                    return tourDiscountPercent > 0 || tour.startDates?.some((d: any) => d.discount);
                }

                // Find matching active discount object from database
                const dbDiscount = discountsList.find(d => d.name === selectedName);
                if (dbDiscount) {
                    const matchesGlobal = tourDiscountPercent >= dbDiscount.percentage;
                    const matchesDate = tour.startDates?.some((d: any) => d.discount === dbDiscount.name);
                    return matchesGlobal || matchesDate;
                }

                // Fallback to old hardcoded ranges
                if (selectedName.includes("20%")) return tourDiscountPercent >= 20;
                if (selectedName.includes("30%")) return tourDiscountPercent >= 30;
                if (selectedName.includes("40%")) return tourDiscountPercent >= 40;
                if (selectedName.includes("50%")) return tourDiscountPercent >= 50;

                // Fallback to check if name matches date.discount directly
                return tour.startDates?.some((d: any) => d.discount === selectedName);
            });
            if (!matchesDiscount) return false;
        }

        // Physical Rating Check
        if (selectedPhysical.length > 0) {
            const matchesPhysical = selectedPhysical.some(ratingStr => {
                const level = parseInt(ratingStr.split(" - ")[0]);
                return tour.physicalRating.level === level;
            });
            if (!matchesPhysical) return false;
        }

        // Service Level Check
        if (selectedService.length > 0) {
            if (!selectedService.includes(tour.serviceLevel)) return false;
        }

        return true;
    });

    const FilterDropdown = ({
        label,
        type = "flat",
        data,
        selected,
        paramKey
    }: {
        label: string,
        type?: "flat" | "nested",
        data: string[] | Record<string, string[]>,
        selected: string[],
        paramKey: string
    }) => {
        const [openContinent, setOpenContinent] = useState<string | null>(null);

        return (
            <div className="relative">
                <button
                    onClick={() => setActiveFilter(activeFilter === label ? null : label)}
                    className={`flex items-center space-x-2 px-4 py-2 bg-white border ${activeFilter === label || selected.length > 0 ? 'border-blue-600 ring-1 ring-blue-600' : 'border-gray-200 hover:border-gray-300'} rounded-lg text-sm font-medium text-[#3F3F42] transition-colors`}
                >
                    <span>{label} {selected.length > 0 && `(${selected.length})`}</span>
                    <svg className={`w-4 h-4 transition-transform ${activeFilter === label ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {activeFilter === label && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                        <div className="max-h-80 overflow-y-auto">
                            {type === "nested" ? (
                                // Nested Destination Layout
                                <div className="space-y-1">
                                    {Object.entries(data as Record<string, string[]>).map(([continent, countries]) => (
                                        <div key={continent}>
                                            <button
                                                onClick={() => setOpenContinent(openContinent === continent ? null : continent)}
                                                className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 text-left font-medium text-[#3F3F42]"
                                            >
                                                <span>{continent}</span>
                                                <svg className={`w-4 h-4 transition-transform ${openContinent === continent ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            {openContinent === continent && (
                                                <div className="bg-gray-50 py-1">
                                                    {countries.map(country => (
                                                        <label key={country} className="flex items-center px-8 py-2 hover:bg-gray-100 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={selected.includes(country)}
                                                                onChange={() => handleFilterChange(country, selected, paramKey)}
                                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                            />
                                                            <span className="ml-3 text-sm text-[#3F3F42]">{country}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // Flat Layout
                                <div>
                                    {(data as string[]).map((option) => (
                                        <label key={option} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selected.includes(option)}
                                                onChange={() => handleFilterChange(option, selected, paramKey)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="ml-3 text-sm text-[#3F3F42]">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-3 border-t border-gray-100 flex justify-between">
                            <button
                                onClick={() => updateUrl(paramKey, [])}
                                className="text-xs font-medium text-gray-500 hover:text-[#3F3F42]"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => setActiveFilter(null)}
                                className="text-xs font-medium text-blue-600 hover:text-blue-700"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb & Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="w-full mx-auto px-4 md:px-6 py-6 md:py-8">
                    <div className="flex items-center text-sm text-gray-500 mb-6">
                        <Link href="/" className="hover:text-blue-600">Home</Link>
                        <svg className="w-4 h-4 mx-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        <span className="text-[#3F3F42] font-medium">
                            {fromDeals && selectedDiscounts.length > 0
                                ? `Discount : ${selectedDiscounts[0]} and ${dealPercentage}%`
                                : "Search results"}
                        </span>
                    </div>

                    {fromDeals && selectedDiscounts.length > 0 ? (
                        <div className="mb-2">
                            <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mb-2">
                                <h1 className="text-5xl md:text-[64px] font-bold text-[#3F3F42] tracking-tight leading-none">
                                    {dealPercentage}% <span className="text-3xl md:text-[40px] text-[#3F3F42]/80">OFF</span>
                                </h1>
                                <h2 className="text-2xl md:text-3xl font-medium text-[#3F3F42] md:border-l-2 md:border-gray-200 md:pl-4">
                                    {selectedDiscounts[0]}
                                </h2>
                            </div>
                            <p className="text-gray-500 mt-4 text-lg">
                                {filteredTours.length} qualifying trips found
                            </p>
                        </div>
                    ) : (
                        <h1 className="text-2xl font-bold text-[#3F3F42]">
                            {filteredTours.length} trips <span className="font-normal text-gray-500">found</span>
                        </h1>
                    )}
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-[72px] z-30">
                <div className="w-full mx-auto px-4 md:px-6 py-3">
                    {fromDeals ? (
                        <div className="flex flex-wrap items-center gap-3">
                            {continents.map(continent => (
                                <button
                                    key={continent.slug}
                                    onClick={() => setSelectedContinentSlug(continent.slug)}
                                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${selectedContinentSlug === continent.slug ? 'bg-[#3F3F42] text-white shadow-md' : 'bg-[#f0f2f5] text-[#3F3F42] hover:bg-[#e4e6e9]'}`}
                                >
                                    {continent.name}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-wrap items-center gap-3">
                            <FilterDropdown
                                label="Destinations"
                                type="nested"
                                data={DESTINATIONS_DATA}
                                selected={selectedCountries}
                                paramKey="destinations"
                            />
                            <FilterDropdown
                                label="Interests"
                                data={availableInterests}
                                selected={selectedInterests}
                                paramKey="interests"
                            />
                            <FilterDropdown
                                label="Travel Style"
                                data={TRAVEL_STYLES}
                                selected={selectedStyles}
                                paramKey="styles"
                            />
                            <FilterDropdown
                                label="Duration"
                                data={DURATIONS}
                                selected={selectedDurations}
                                paramKey="durations"
                            />
                            <FilterDropdown
                                label="Collections"
                                data={availableTags}
                                selected={selectedCollections}
                                paramKey="collections"
                            />
                            <FilterDropdown
                                label="Dates"
                                data={availableDates}
                                selected={selectedDates}
                                paramKey="dates"
                            />
                            <FilterDropdown
                                label="Price"
                                data={PRICES}
                                selected={selectedPrices}
                                paramKey="prices"
                            />
                            <FilterDropdown
                                label="Discount"
                                data={discountsOptions}
                                selected={selectedDiscounts}
                                paramKey="discounts"
                            />
                            <FilterDropdown
                                label="Physical Rating"
                                data={PHYSICAL_RATINGS}
                                selected={selectedPhysical}
                                paramKey="physical"
                            />
                            <FilterDropdown
                                label="Service Level"
                                data={SERVICE_LEVELS}
                                selected={selectedService}
                                paramKey="service"
                            />

                            <div className="h-6 w-px bg-gray-200 mx-2"></div>

                            <button
                                onClick={clearAllFilters}
                                className="flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                                <span>Clear all filters</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Section */}
            <div className="w-full mx-auto px-4 md:px-6 py-8">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-600">
                        Showing <span className="font-bold text-[#3F3F42]">1-{filteredTours.length}</span> of <span className="font-bold text-[#3F3F42]">{filteredTours.length}</span> trips:
                    </p>

                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Sort by:</span>
                        <select className="border-none bg-transparent text-sm font-bold text-[#3F3F42] focus:ring-0 cursor-pointer">
                            <option>Relevance</option>
                            <option>Price: Low to High</option>
                            <option>Price: High to Low</option>
                            <option>Duration: Short to Long</option>
                            <option>Duration: Long to Short</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredTours.length > 0 ? (
                    <div className="relative group">
                        <style dangerouslySetInnerHTML={{
                            __html: `
                            .hide-scroll::-webkit-scrollbar {
                                display: none;
                            }
                            .hide-scroll {
                                -ms-overflow-style: none; /* IE and Edge */
                                scrollbar-width: none; /* Firefox */
                            }
                        `}} />

                        {/* Left Arrow Button */}
                        <button
                            onClick={scrollPrev}
                            className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 bg-[#b3b3b3] hover:bg-[#999] text-white w-12 h-12 rounded-full items-center justify-center cursor-pointer transition-all duration-200 ${canScrollLeft ? "opacity-0 group-hover:opacity-100" : "opacity-0 pointer-events-none"
                                }`}
                            aria-label="Previous tours"
                        >
                            <svg className="w-5 h-5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Right Arrow Button */}
                        <button
                            onClick={scrollNext}
                            className={`hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-30 bg-[#3F3F42] hover:bg-[#3F3F42] text-white w-12 h-12 rounded-full items-center justify-center cursor-pointer transition-all duration-200 ${canScrollRight ? "opacity-0 group-hover:opacity-100" : "opacity-0 pointer-events-none"
                                }`}
                            aria-label="Next tours"
                        >
                            <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        <div
                            ref={scrollContainerRef}
                            className="flex gap-4 md:gap-6 overflow-x-auto pb-4 hide-scroll snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0"
                        >
                            {filteredTours.map((tour) => (
                                <div key={tour._id} className="w-[calc((100%-16px)/1.3)] md:w-[calc((100%-72px)/3.6)] snap-start shrink-0">
                                    <TourCard tour={tour} />
                                </div>
                            ))}
                        </div>

                        {/* Mobile view buttons */}
                        <div className="mt-8 flex items-center justify-center gap-4 md:hidden">
                            <button
                                onClick={scrollPrev}
                                className="bg-[#b3b3b3] text-white w-10 h-10 rounded-full flex items-center justify-center"
                                aria-label="Previous tours"
                            >
                                <svg className="w-5 h-5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={scrollNext}
                                className="bg-[#3F3F42] text-white w-10 h-10 rounded-full flex items-center justify-center"
                                aria-label="Next tours"
                            >
                                <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-[#3F3F42] mb-2">
                                No trips found for "{query}"
                            </h3>
                            <p className="text-gray-500 mb-6">
                                We couldn't find any trips matching your search. Try adjusting your search terms or filters.
                            </p>
                            <button
                                onClick={() => window.location.href = '/trips'}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                            >
                                View all trips
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {/* Quick View Modal */}
            {selectedTour && (
                <QuickViewModal
                    tour={selectedTour}
                    onClose={() => setSelectedTour(null)}
                />
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
