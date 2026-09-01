"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import ImagePickerModal from "@/components/ImagePickerModal";

// --- Types ---
interface Continent {
    id: string;
    _id: string; // Handle both id and _id from backend
    name: string;
    slug: string;
    icon?: string;
    image?: string;
    description?: string;
    countries: Country[];
}

interface Country {
    id: string;
    _id: string; // Handle both id and _id
    name: string;
    code: string;
    image?: string; // Updated to match single image schema
    continent: string; // ID only
    currency?: {
        code: string;
        name: string;
        symbol: string;
    };
    destinations?: Destination[];
}

interface Destination {
    id: string;
    _id: string;
    name: string;
    slug?: string;
    description?: string;
    image?: string;
    isActive?: boolean;
}

// --- Icons ---
const Icons = {
    ChevronDown: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6" /></svg>
    ),
    ChevronRight: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6" /></svg>
    ),
    Plus: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
    ),
    Trash2: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
    ),
    Edit2: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
    ),
    Globe: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z" /></svg>
    ),
};

export default function LocationPage() {
    const [continents, setContinents] = useState<Continent[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedContinent, setExpandedContinent] = useState<string | null>(null);
    const [expandedCountry, setExpandedCountry] = useState<string | null>(null);

    // Modals
    const [isContinentModalOpen, setIsContinentModalOpen] = useState(false);
    const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
    const [isDestinationModalOpen, setIsDestinationModalOpen] = useState(false);
    const [selectedContinentId, setSelectedContinentId] = useState<string | null>(null);
    const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
    const [editingDestinationId, setEditingDestinationId] = useState<string | null>(null);

    // Form State
    const [newContinentName, setNewContinentName] = useState("");
    const [newContinentIcon, setNewContinentIcon] = useState("");
    const [showContinentIconPicker, setShowContinentIconPicker] = useState(false);
    const [newCountryData, setNewCountryData] = useState({
        name: "",
        code: "",
        description: "",
        shortDescription: "",
        currencyCode: "",
        currencyName: "",
        currencySymbol: ""
    });
    const [newDestinationData, setNewDestinationData] = useState({
        name: "",
        description: "",
    });

    useEffect(() => {
        fetchContinents();
    }, []);

    const fetchContinents = async () => {
        try {
            const res = await fetch(`${api.baseURL}/continents`);
            const data = await res.json();
            if (data.status === "success") {
                setContinents(data.data.continents);
            }
        } catch (err) {
            console.error("Error fetching continents:", err);
        } finally {
            setLoading(false);
        }
    };

    const getCountryKey = (country: Country) => country.id || country._id;

    const getDestinationKey = (destination: Destination) => destination.id || destination._id;

    const updateCountryInState = (updatedCountry: Country) => {
        const countryId = getCountryKey(updatedCountry);

        setContinents((prev) =>
            prev.map((continent) => ({
                ...continent,
                countries: (continent.countries || []).map((country) =>
                    getCountryKey(country) === countryId ? { ...country, ...updatedCountry } : country
                ),
            }))
        );
    };

    const persistCountryDestinations = async (countryId: string, destinations: Destination[]) => {
        try {
            const res = await fetch(`${api.baseURL}/countries/${countryId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ destinations }),
                credentials: "include",
            });

            const data = await res.json();
            if (data.status === "success") {
                updateCountryInState(data.data.country);
                return true;
            }

            alert("Error saving destination: " + (data.message || "Unknown error"));
            return false;
        } catch (err) {
            console.error("Error saving destination:", err);
            alert("Failed to save destination.");
            return false;
        }
    };

    const handleCreateContinent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${api.baseURL}/continents`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newContinentName.trim(),
                    icon: newContinentIcon.trim() || undefined,
                }),
                credentials: "include",
            });
            const data = await res.json();
            if (data.status === "success") {
                setNewContinentName("");
                setNewContinentIcon("");
                setIsContinentModalOpen(false);
                fetchContinents();
            } else {
                alert('Error creating continent: ' + data.message);
            }
        } catch (err) {
            console.error("Error creating continent:", err);
        }
    };

    const handleCreateCountry = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedContinentId) return;

        const payload = {
            name: newCountryData.name,
            code: newCountryData.code || undefined, // Send undefined if empty to avoid unique constraint issues if not sparse
            continent: selectedContinentId,
            description: newCountryData.description,
            shortDescription: newCountryData.shortDescription,
            currency: {
                code: newCountryData.currencyCode,
                name: newCountryData.currencyName,
                symbol: newCountryData.currencySymbol
            },
            image: "",
            language: [],
            timezone: [],
            travelRequirements: {},
            statistics: {
                totalTours: 0,
                averageRating: 0,
                totalReviews: 0,
                popularityScore: 0
            },
            seo: {}
        };
        console.log("Submitting Country Payload:", payload);

        try {
            const res = await fetch(`${api.baseURL}/countries`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include",
            });
            const data = await res.json();
            if (data.status === "success") {
                setNewCountryData({
                    name: "",
                    code: "",
                    description: "",
                    shortDescription: "",
                    currencyCode: "",
                    currencyName: "",
                    currencySymbol: ""
                });
                setIsCountryModalOpen(false);
                fetchContinents();
            } else {
                alert('Error creating country: ' + (data.message || JSON.stringify(data)));
            }
        } catch (err) {
            console.error("Error creating country:", err);
        }
    };

    const toggleContinent = (id: string) => {
        setExpandedContinent(expandedContinent === id ? null : id);
    };

    const toggleCountry = (id: string) => {
        setExpandedCountry(expandedCountry === id ? null : id);
    };

    const openAddCountryModal = (continentId: string) => {
        setSelectedContinentId(continentId);
        setIsCountryModalOpen(true);
    };

    const openAddDestinationModal = (countryId: string) => {
        setSelectedCountryId(countryId);
        setEditingDestinationId(null);
        setNewDestinationData({ name: "", description: "" });
        setIsDestinationModalOpen(true);
    };

    const openEditDestinationModal = (countryId: string, dest: Destination) => {
        setSelectedCountryId(countryId);
        setEditingDestinationId(getDestinationKey(dest));
        setNewDestinationData({
            name: dest.name,
            description: dest.description || "",
        });
        setIsDestinationModalOpen(true);
    };

    const closeDestinationModal = () => {
        setIsDestinationModalOpen(false);
        setEditingDestinationId(null);
        setNewDestinationData({ name: "", description: "" });
    };

    const handleSaveDestination = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCountryId) return;

        // Find current country from hierarchy to extract existing destinations
        let currentCountry: Country | undefined;
        for (const c of continents) {
            currentCountry = (c.countries || []).find((country) => getCountryKey(country) === selectedCountryId);
            if (currentCountry) break;
        }

        if (!currentCountry) return;

        let updatedDestinations = [...(currentCountry.destinations || [])];

        if (editingDestinationId) {
            // Edit mode
            updatedDestinations = updatedDestinations.map((d) =>
                getDestinationKey(d) === editingDestinationId
                    ? { ...d, name: newDestinationData.name, description: newDestinationData.description }
                    : d
            );
        } else {
            // Create mode
            const newDest: any = {
                name: newDestinationData.name,
                description: newDestinationData.description,
            };
            updatedDestinations.push(newDest);
        }

        const success = await persistCountryDestinations(selectedCountryId, updatedDestinations);
        if (success) {
            closeDestinationModal();
        }
    };

    const handleDeleteDestination = async (countryId: string, destToDelete: Destination) => {
        if (!confirm(`Are you sure you want to delete Kyoto/destination "${destToDelete.name}"?`)) return;

        // Find current country from hierarchy to extract existing destinations
        let currentCountry: Country | undefined;
        for (const c of continents) {
            currentCountry = (c.countries || []).find((country) => getCountryKey(country) === countryId);
            if (currentCountry) break;
        }

        if (!currentCountry) return;

        const updatedDestinations = (currentCountry.destinations || []).filter(
            (d) => getDestinationKey(d) !== getDestinationKey(destToDelete)
        );

        await persistCountryDestinations(countryId, updatedDestinations);
    };

    const handleDeleteCountry = async (continentId: string, countryId: string, countryName: string) => {
        if (!confirm(`Are you sure you want to delete country "${countryName}"? This will delete all destinations in it.`)) {
            return;
        }

        try {
            const res = await fetch(`${api.baseURL}/countries/${countryId}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (res.status === 204) {
                setContinents((prev) =>
                    prev.map((c) =>
                        (c.id === continentId || c._id === continentId)
                            ? { ...c, countries: (c.countries || []).filter((country) => getCountryKey(country) !== countryId) }
                            : c
                    )
                );
                alert("Country deleted successfully.");
            } else {
                const data = await res.json();
                alert(`Failed to delete country: ${data.message}`);
            }
        } catch (err) {
            console.error("Error deleting country:", err);
            alert("Failed to delete country.");
        }
    };

    const handleDeleteContinent = async (continentId: string, continentName: string) => {
        if (!confirm(`Are you sure you want to delete continent "${continentName}"? This will delete all countries and destinations inside.`)) {
            return;
        }

        try {
            const res = await fetch(`${api.baseURL}/continents/${continentId}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (res.status === 204) {
                setContinents((prev) => prev.filter((c) => c.id !== continentId && c._id !== continentId));
                alert("Continent deleted successfully.");
            } else {
                const data = await res.json();
                alert(`Failed to delete continent: ${data.message}`);
            }
        } catch (err) {
            console.error("Error deleting continent:", err);
            alert("Failed to delete continent.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white border-b border-gray-200">
                    <div className="px-8 py-6">
                        <div className="h-7 bg-gray-200 rounded-md w-48 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded-md w-64 animate-pulse"></div>
                    </div>
                </div>
                <div className="p-8">
                    <div className="bg-white rounded-md border border-gray-200 p-12 text-center text-zinc-500 animate-pulse font-medium shadow-sm">
                        Loading destination settings...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="px-8 h-16 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-zinc-800 leading-none">Destination Management</h1>
                        <p className="text-gray-550 text-xs mt-1 leading-none">
                            Configure hierarchical geography: continents &rarr; countries &rarr; destinations
                        </p>
                    </div>
                    <button
                        onClick={() => setIsContinentModalOpen(true)}
                        className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-900 text-white font-medium py-1.5 px-3 rounded-md shadow-sm transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                        <Icons.Plus className="w-3.5 h-3.5" />
                        Add Continent
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-8">
                <div className="space-y-4">
                    {continents.length === 0 ? (
                        <div className="bg-white rounded-md border border-gray-200 p-16 text-center shadow-sm">
                            <div className="w-16 h-16 bg-zinc-55 text-zinc-600 rounded-md flex items-center justify-center mx-auto mb-4 border border-gray-200">
                                <Icons.Globe className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-semibold text-zinc-800 mb-2">No continents created yet</h3>
                            <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm">
                                Get started by adding a continent to structure your tour itineraries.
                            </p>
                            <button
                                onClick={() => setIsContinentModalOpen(true)}
                                className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2 px-6 rounded-md shadow-sm transition-colors text-sm"
                            >
                                Add Continent
                            </button>
                        </div>
                    ) : (
                        continents.map((continent) => (
                            <div
                                key={continent.id || continent._id}
                                className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                            >
                                {/* Continent Row */}
                                <div
                                    className="px-6 py-5 flex items-center justify-between cursor-pointer select-none bg-white hover:bg-gray-50/50 transition-colors"
                                    onClick={() => toggleContinent(continent.id || continent._id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-zinc-100 border border-zinc-200 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {continent.icon ? (
                                                <img src={continent.icon} alt={continent.name} className="w-full h-full object-contain p-1" />
                                            ) : (
                                                <svg className="w-5 h-5 text-zinc-650" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <circle cx="12" cy="12" r="10" strokeWidth={2} />
                                                    <path strokeWidth={2} d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10" />
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-zinc-800 flex items-center gap-2">
                                                {continent.name}
                                                <span className="text-xs font-normal text-gray-500">
                                                    ({continent.countries?.length || 0} countries)
                                                </span>
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                        <Link
                                            href={`/admin/location/continent/${continent.id || continent._id}`}
                                            className="px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-150 rounded-md transition border border-gray-300 shadow-sm bg-white"
                                        >
                                            Edit Details
                                        </Link>
                                        <button
                                            onClick={() => openAddCountryModal(continent.id || continent._id)}
                                            className="px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-150 rounded-md transition border border-gray-300 shadow-sm bg-white flex items-center gap-1"
                                        >
                                            <Icons.Plus className="w-3.5 h-3.5" />
                                            Add Country
                                        </button>
                                        <button
                                            onClick={() => handleDeleteContinent(continent.id || continent._id, continent.name)}
                                            className="p-1 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                                            title="Delete Continent"
                                        >
                                            <Icons.Trash2 className="w-4 h-4" />
                                        </button>
                                         <div
                                             className={`text-zinc-500 transition-transform duration-205 ml-2 cursor-pointer ${expandedContinent === (continent.id || continent._id) ? "rotate-180" : ""}`}
                                             onClick={(e) => {
                                                 e.stopPropagation();
                                                 toggleContinent(continent.id || continent._id);
                                             }}
                                         >
                                             <Icons.ChevronDown className="w-5 h-5" />
                                         </div>
                                    </div>
                                </div>

                                {/* Countries List */}
                                {expandedContinent === (continent.id || continent._id) && (
                                    <div className="border-t border-gray-200 bg-gray-50/20 p-6 space-y-3">
                                        {continent.countries && continent.countries.length > 0 ? (
                                            continent.countries.map((country) => (
                                                <div
                                                    key={getCountryKey(country)}
                                                    className="overflow-hidden rounded-md border border-gray-200 bg-white transition-all duration-200 shadow-sm"
                                                >
                                                    <div
                                                        className="w-full px-4 py-4 flex items-center justify-between gap-4 text-left hover:bg-gray-50/50 transition-colors cursor-pointer"
                                                        onClick={() => toggleCountry(getCountryKey(country))}
                                                    >
                                                        <div className="flex items-center gap-4 min-w-0">
                                                            <div className="w-10 h-10 rounded-md bg-zinc-105 flex-shrink-0 flex items-center justify-center border border-zinc-200 text-xs font-bold text-zinc-700">
                                                                {country.code || country.name.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <h5 className="font-semibold text-zinc-800 truncate text-sm">{country.name}</h5>
                                                                    <span className="text-[10px] text-zinc-700 bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded-md font-semibold">
                                                                        {country.destinations?.length || 0} destinations
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                                            <Link
                                                                href={`/admin/location/country/${getCountryKey(country)}`}
                                                                className="px-2.5 py-1 text-xs font-semibold text-zinc-750 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition border border-gray-300 shadow-sm bg-white"
                                                            >
                                                                Edit Details
                                                            </Link>
                                                            <button
                                                                onClick={() => openAddDestinationModal(getCountryKey(country))}
                                                                className="px-2.5 py-1 text-xs font-semibold text-zinc-750 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition border border-gray-300 shadow-sm bg-white flex items-center gap-1"
                                                            >
                                                                <Icons.Plus className="w-3.5 h-3.5" />
                                                                Add Destination
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteCountry(continent.id || continent._id, getCountryKey(country), country.name)}
                                                                className="p-1 text-zinc-500 hover:text-red-650 hover:bg-red-50 rounded-md transition"
                                                                title="Delete Country"
                                                            >
                                                                <Icons.Trash2 className="w-4 h-4" />
                                                            </button>
                                                             <div
                                                                 className={`text-zinc-500 transition-transform duration-200 ml-2 cursor-pointer ${expandedCountry === getCountryKey(country) ? "rotate-180" : ""}`}
                                                                 onClick={(e) => {
                                                                     e.stopPropagation();
                                                                     toggleCountry(getCountryKey(country));
                                                                 }}
                                                             >
                                                                 <Icons.ChevronDown className="w-5 h-5" />
                                                             </div></div>
                                                    </div>

                                                    {/* Destinations List */}
                                                    {expandedCountry === getCountryKey(country) && (
                                                        <div className="border-t border-gray-200 bg-gray-50/10 px-4 py-4">
                                                            <h6 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-3 px-2">
                                                                Kyoto &amp; Destinations inside {country.name}
                                                            </h6>
                                                            <div className="space-y-2">
                                                                {country.destinations && country.destinations.length > 0 ? (
                                                                    country.destinations.map((destination) => (
                                                                        <div
                                                                            key={getDestinationKey(destination)}
                                                                            className="flex items-center justify-between gap-4 rounded-md border border-gray-200 bg-white p-3 hover:bg-gray-50/50 transition duration-150 shadow-sm"
                                                                        >
                                                                            <div className="min-w-0 px-1">
                                                                                <p className="font-semibold text-zinc-800 text-sm">{destination.name}</p>
                                                                                {destination.description && (
                                                                                    <p className="text-xs text-gray-500 truncate max-w-md mt-0.5">
                                                                                        {destination.description}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openEditDestinationModal(getCountryKey(country), destination)}
                                                                                    className="px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition border border-gray-300 bg-white shadow-sm flex items-center gap-1"
                                                                                >
                                                                                    <Icons.Edit2 className="w-3 h-3" />
                                                                                    Edit
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleDeleteDestination(getCountryKey(country), destination)}
                                                                                    className="px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:text-red-800 hover:bg-red-50 rounded-md transition flex items-center gap-1 border border-red-200 bg-white shadow-sm"
                                                                                >
                                                                                    <Icons.Trash2 className="w-3 h-3" />
                                                                                    Delete
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="rounded-md border-2 border-dashed border-gray-200 bg-white px-4 py-8 text-center shadow-inner">
                                                                        <p className="text-sm text-gray-500 mb-3 font-medium">No destinations added yet.</p>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => openAddDestinationModal(getCountryKey(country))}
                                                                            className="text-zinc-800 hover:text-zinc-950 font-bold text-sm hover:underline"
                                                                        >
                                                                            Add the first destination to {country.name}
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-md bg-white shadow-inner">
                                                <p className="text-gray-400 text-sm mb-3 font-medium">No countries added yet.</p>
                                                <button
                                                    onClick={() => openAddCountryModal(continent.id || continent._id)}
                                                    className="text-zinc-800 hover:text-zinc-955 font-bold text-sm hover:underline"
                                                >
                                                    Add the first country to {continent.name}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Add / Edit Destination Modal */}
            {isDestinationModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-md shadow-lg border border-gray-200 w-full max-w-xl overflow-hidden transform transition-all scale-100">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center sticky top-0 z-10">
                            <h2 className="text-lg font-bold text-zinc-800">
                                {editingDestinationId ? "Edit Destination" : "Add Destination"}
                            </h2>
                            <button onClick={closeDestinationModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSaveDestination} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Destination / City Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newDestinationData.name}
                                    onChange={(e) => setNewDestinationData({ ...newDestinationData, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm placeholder:text-gray-400 text-zinc-800"
                                    placeholder="e.g. Kyoto"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
                                <textarea
                                    value={newDestinationData.description}
                                    onChange={(e) => setNewDestinationData({ ...newDestinationData, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm placeholder:text-gray-400 text-zinc-800 h-24 resize-none"
                                    placeholder="Short note about the destination..."
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={closeDestinationModal}
                                    className="px-4 py-2 border border-gray-300 text-zinc-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-zinc-900 text-white border border-zinc-900 rounded-md hover:bg-zinc-800 transition-colors font-medium text-sm shadow-sm cursor-pointer"
                                >
                                    {editingDestinationId ? "Save Destination" : "Create Destination"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Continent Modal */}
            {isContinentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-md shadow-lg border border-gray-200 w-full max-w-md overflow-hidden transform transition-all scale-100">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-zinc-800">Add New Continent</h2>
                            <button onClick={() => { setIsContinentModalOpen(false); setNewContinentIcon(""); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreateContinent} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Continent Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newContinentName}
                                    onChange={(e) => setNewContinentName(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm placeholder:text-gray-400 text-zinc-800"
                                    placeholder="e.g. Asia"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Continent Icon</label>
                                <div className="flex items-center gap-3">
                                    {newContinentIcon ? (
                                        <div className="relative w-12 h-12 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 group">
                                            <img src={newContinentIcon} alt="Icon Preview" className="w-full h-full object-contain p-1" />
                                            <button
                                                type="button"
                                                onClick={() => setNewContinentIcon("")}
                                                className="absolute inset-0 bg-black/50 text-white text-[10px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : null}
                                    <button
                                        type="button"
                                        onClick={() => setShowContinentIconPicker(true)}
                                        className="px-3 py-2 bg-white border border-gray-300 text-zinc-700 hover:bg-gray-50 rounded-md transition text-xs font-medium shadow-sm cursor-pointer"
                                    >
                                        {newContinentIcon ? "Change Icon" : "Select / Upload Icon"}
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={newContinentIcon}
                                    onChange={(e) => setNewContinentIcon(e.target.value)}
                                    className="w-full mt-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs focus:outline-none focus:border-zinc-400 transition placeholder:text-gray-400 text-zinc-700"
                                    placeholder="Or paste icon image URL..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => { setIsContinentModalOpen(false); setNewContinentIcon(""); }}
                                    className="px-4 py-2 border border-gray-300 text-zinc-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-zinc-900 text-white border border-zinc-900 rounded-md hover:bg-zinc-800 transition-colors font-medium text-sm shadow-sm cursor-pointer"
                                >
                                    Create Continent
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Country Modal */}
            {isCountryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-md shadow-lg border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all scale-100">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center sticky top-0 z-10">
                            <h2 className="text-lg font-bold text-zinc-800">Add Country</h2>
                            <button onClick={() => setIsCountryModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreateCountry} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Country Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={newCountryData.name}
                                        onChange={(e) => setNewCountryData({ ...newCountryData, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-800"
                                        placeholder="e.g. Japan"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Country Code (ISO)</label>
                                    <input
                                        type="text"
                                        value={newCountryData.code}
                                        onChange={(e) => setNewCountryData({ ...newCountryData, code: e.target.value.toUpperCase() })}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm uppercase placeholder:normal-case placeholder:text-gray-400 text-zinc-800"
                                        placeholder="e.g. JP"
                                        maxLength={3}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Short Description</label>
                                <input
                                    type="text"
                                    maxLength={200}
                                    value={newCountryData.shortDescription}
                                    onChange={(e) => setNewCountryData({ ...newCountryData, shortDescription: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-800"
                                    placeholder="Brief summary used in cards..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Full Description</label>
                                <textarea
                                    value={newCountryData.description}
                                    onChange={(e) => setNewCountryData({ ...newCountryData, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-800 h-24 resize-none"
                                    placeholder="Detailed description..."
                                />
                            </div>

                            <div className="bg-gray-50 p-5 rounded-md border border-gray-200 shadow-inner">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Currency Details</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 mb-1">Code</label>
                                        <input
                                            type="text"
                                            placeholder="JPY"
                                            value={newCountryData.currencyCode}
                                            onChange={(e) => setNewCountryData({ ...newCountryData, currencyCode: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm uppercase text-zinc-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 mb-1">Name</label>
                                        <input
                                            type="text"
                                            placeholder="Yen"
                                            value={newCountryData.currencyName}
                                            onChange={(e) => setNewCountryData({ ...newCountryData, currencyName: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 mb-1">Symbol</label>
                                        <input
                                            type="text"
                                            placeholder="¥"
                                            value={newCountryData.currencySymbol}
                                            onChange={(e) => setNewCountryData({ ...newCountryData, currencySymbol: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-800"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setIsCountryModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 text-zinc-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-zinc-900 text-white border border-zinc-900 rounded-md hover:bg-zinc-800 transition-colors font-medium text-sm shadow-sm cursor-pointer"
                                >
                                    Add Country
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
