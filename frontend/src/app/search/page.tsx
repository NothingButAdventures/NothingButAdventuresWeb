"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import QuickViewModal from "@/components/QuickViewModal";

interface Tour {
    _id: string;
    name: string;
    slug: string;
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

export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Parse URL params
    const query = searchParams.get("s") || "";
    const selectedCountries = searchParams.get("destinations")?.split(",").filter(Boolean) || [];
    const selectedStyles = searchParams.get("styles")?.split(",").filter(Boolean) || [];
    const selectedDurations = searchParams.get("durations")?.split(",").filter(Boolean) || [];
    const selectedCollections = searchParams.get("collections")?.split(",").filter(Boolean) || [];
    const selectedDates = searchParams.get("dates")?.split(",").filter(Boolean) || [];
    const selectedPrices = searchParams.get("prices")?.split(",").filter(Boolean) || [];
    const selectedDiscounts = searchParams.get("discounts")?.split(",").filter(Boolean) || [];
    const selectedPhysical = searchParams.get("physical")?.split(",").filter(Boolean) || [];
    const selectedService = searchParams.get("service")?.split(",").filter(Boolean) || [];

    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [selectedTour, setSelectedTour] = useState<Tour | null>(null);

    // Initial load
    useEffect(() => {
        fetchTours();
    }, []);

    // Active state for dropdowns (UI only)
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    const fetchTours = async () => {
        try {
            const response = await fetch(
                `${api.baseURL}${api.endpoints.tours.getAll}`,
            );
            const data = await response.json();

            if (response.ok) {
                const tourData = data.data.tours || data.data;
                setTours(tourData);

                // Extract unique tags and dates
                const tags = Array.from(new Set(tourData.flatMap((t: Tour) => t.tags || []))).sort() as string[];
                setAvailableTags(tags);

                const dates = Array.from(new Set(tourData.flatMap((t: Tour) => t.startDates?.map((d: any) => {
                    const date = new Date(d.startDate);
                    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
                }) || []))).sort((a: any, b: any) => {
                    return new Date(a).getTime() - new Date(b).getTime();
                }) as string[];
                setAvailableDates(dates);
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
        if (selectedCountries.length > 0) {
            if (!selectedCountries.includes(tour.country.name)) return false;
        }

        // Travel Style Check
        if (selectedStyles.length > 0) {
            if (!selectedStyles.includes(tour.travelStyle)) return false;
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
            const discount = tour.price.discountPercent || 0;
            const matchesDiscount = selectedDiscounts.some(range => {
                if (range === "Any Discount") return discount > 0;
                if (range.includes("20%")) return discount >= 20;
                if (range.includes("30%")) return discount >= 30;
                if (range.includes("40%")) return discount >= 40;
                if (range.includes("50%")) return discount >= 50;
                return false;
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
                    className={`flex items-center space-x-2 px-4 py-2 bg-white border ${activeFilter === label || selected.length > 0 ? 'border-blue-600 ring-1 ring-blue-600' : 'border-gray-200 hover:border-gray-300'} rounded-lg text-sm font-medium text-gray-700 transition-colors`}
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
                                                className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 text-left font-medium text-gray-900"
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
                                                            <span className="ml-3 text-sm text-gray-700">{country}</span>
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
                                            <span className="ml-3 text-sm text-gray-700">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-3 border-t border-gray-100 flex justify-between">
                            <button
                                onClick={() => updateUrl(paramKey, [])}
                                className="text-xs font-medium text-gray-500 hover:text-gray-900"
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
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Link href="/" className="hover:text-blue-600">Home</Link>
                        <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-gray-900 font-medium">Search results</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {filteredTours.length} tours <span className="font-normal text-gray-500">found</span>
                    </h1>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-[72px] z-30">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <FilterDropdown
                            label="Destinations"
                            type="nested"
                            data={DESTINATIONS_DATA}
                            selected={selectedCountries}
                            paramKey="destinations"
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
                            data={DISCOUNTS}
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
                </div>
            </div>

            {/* Results Section */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-600">
                        Showing <span className="font-bold text-gray-900">1-{filteredTours.length}</span> of <span className="font-bold text-gray-900">{filteredTours.length}</span> tours:
                    </p>

                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Sort by:</span>
                        <select className="border-none bg-transparent text-sm font-bold text-gray-900 focus:ring-0 cursor-pointer">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredTours.map((tour) => {
                            const primaryImage =
                                tour.images?.find((img) => img.isPrimary) || tour.images?.[0];
                            const discountedPrice =
                                tour.price.discountPercent > 0
                                    ? tour.price.amount * (1 - tour.price.discountPercent / 100)
                                    : tour.price.amount;

                            return (
                                <Link href={`/tours/${tour.slug}`} key={tour._id}>
                                    <div className="group bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform h-full flex flex-col">
                                        {/* Image Container */}
                                        <div className="relative w-full h-64 overflow-hidden bg-gray-100 group-hover:opacity-95 transition-opacity">
                                            {primaryImage?.url ? (
                                                <img
                                                    src={primaryImage.url}
                                                    alt={primaryImage.caption || tour.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                                    <svg
                                                        className="w-16 h-16 text-gray-400"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={1}
                                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                </div>
                                            )}

                                            {/* Quick View Button */}
                                            <div className="absolute bottom-4 left-4 z-20">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setSelectedTour(tour);
                                                    }}
                                                    className="flex items-center space-x-2 bg-white text-[#432360] px-4 py-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors font-bold text-sm"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                                    </svg>
                                                    <span>Quick View</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6 flex-1 flex flex-col">
                                            {/* Duration Badge */}
                                            <div className="mb-3">
                                                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    {tour.duration.days} Day Tour
                                                </span>
                                            </div>

                                            {/* Tour Name */}
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                                                {tour.name}
                                            </h3>

                                            {/* Spacing for push to bottom */}
                                            <div className="flex-1"></div>

                                            {/* Price Section */}
                                            <div className="flex items-baseline gap-2 mb-4">
                                                <span className="text-3xl font-bold text-gray-900">
                                                    ${Math.round(discountedPrice)}
                                                </span>
                                                <span className="text-sm text-gray-600">per person</span>
                                            </div>

                                            {/* CTA Button */}
                                            <button className="w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-all duration-200">
                                                View itinerary
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
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
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                No tours found for "{query}"
                            </h3>
                            <p className="text-gray-500 mb-6">
                                We couldn't find any tours matching your search. Try adjusting your search terms or filters.
                            </p>
                            <button
                                onClick={() => window.location.href = '/tours'}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                            >
                                View all tours
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
