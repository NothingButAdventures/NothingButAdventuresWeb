"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// --- Types ---
interface Continent {
    id: string;
    _id: string; // Handle both id and _id from backend
    name: string;
    slug: string;
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
}

// --- Icons ---
const Icons = {
    ChevronDown: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6" /></svg>
    ),
    ChevronRight: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6" /></svg>
    ),
    Plus: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
    ),
    Trash2: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
    ),
    Edit2: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
    ),
    Globe: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z" /></svg>
    ),
};

export default function LocationPage() {
    const [continents, setContinents] = useState<Continent[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedContinent, setExpandedContinent] = useState<string | null>(null);

    // Modals
    const [isContinentModalOpen, setIsContinentModalOpen] = useState(false);
    const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
    const [selectedContinentId, setSelectedContinentId] = useState<string | null>(null);

    // Form State
    const [newContinentName, setNewContinentName] = useState("");
    const [newCountryData, setNewCountryData] = useState({
        name: "",
        code: "",
        description: "",
        shortDescription: "",
        currencyCode: "",
        currencyName: "",
        currencySymbol: ""
    });

    useEffect(() => {
        fetchContinents();
    }, []);

    const fetchContinents = async () => {
        try {
            const res = await fetch("http://localhost:3001/api/v1/continents");
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

    const handleCreateContinent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:3001/api/v1/continents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newContinentName }),
                credentials: "include",
            });
            const data = await res.json();
            if (data.status === "success") {
                setNewContinentName("");
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
            const res = await fetch("http://localhost:3001/api/v1/countries", {
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

    const openAddCountryModal = (continentId: string) => {
        setSelectedContinentId(continentId);
        setIsCountryModalOpen(true);
    };

    // --- RENDER ---
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white border-b border-gray-200">
                    <div className="px-8 py-6">
                        <div className="h-7 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                    </div>
                </div>
                <div className="p-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
                        Loading locations...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Location Management</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage continents and countries for your tours ({continents.length} continents)</p>
                    </div>
                    <button
                        onClick={() => setIsContinentModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition flex items-center justify-center gap-2 shadow-sm active:scale-95"
                    >
                        <Icons.Plus className="w-5 h-5" />
                        Add Continent
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-8">
                <div className="space-y-4 max-w-6xl mx-auto">
                    {continents.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
                            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Icons.Globe className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No continents found</h3>
                            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Start by adding a continent to begin organizing your tour destinations.</p>
                            <button
                                onClick={() => setIsContinentModalOpen(true)}
                                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition"
                            >
                                Add Continent
                            </button>
                        </div>
                    ) : (
                        continents.map((continent) => (
                            <div
                                key={continent.id || continent._id}
                                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                            >
                                {/* Continent Header Row */}
                                <div
                                    className="px-6 py-5 flex items-center justify-between cursor-pointer select-none bg-white hover:bg-gray-50 transition-colors"
                                    onClick={() => toggleContinent(continent.id || continent._id)}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                                            {continent.image ? (
                                                <img src={continent.image} alt={continent.name} className="w-full h-full object-cover rounded-xl" />
                                            ) : (
                                                <Icons.Globe className="w-6 h-6" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                {continent.name}
                                                <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                                                    {continent.countries?.length || 0} Countries
                                                </span>
                                            </h3>
                                            <p className="text-sm text-gray-400 mt-0.5 truncate max-w-md">
                                                {continent.countries?.map(c => c.name).slice(0, 5).join(", ")}
                                                {(continent.countries?.length || 0) > 5 && "..."}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Link
                                            href={`/admin/location/continent/${continent.id || continent._id}`}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                            title="Edit Continent Details"
                                        >
                                            <Icons.Edit2 className="w-5 h-5" />
                                        </Link>
                                        <div className="w-px h-8 bg-gray-200 mx-1"></div>
                                        <div className={`text-gray-400 transition-transform duration-200 ${expandedContinent === (continent.id || continent._id) ? "rotate-180" : ""}`}>
                                            <Icons.ChevronDown className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Countries Grid */}
                                {expandedContinent === (continent.id || continent._id) && (
                                    <div className="border-t border-gray-100 bg-gray-50/50 p-6 animate-in slide-in-from-top-1">
                                        <div className="flex items-center justify-between mb-5">
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest pl-1">
                                                Countries in {continent.name}
                                            </h4>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openAddCountryModal(continent.id || continent._id);
                                                }}
                                                className="text-sm flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors font-medium border border-transparent hover:border-blue-100"
                                            >
                                                <Icons.Plus className="w-4 h-4" />
                                                Add Country
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {continent.countries && continent.countries.length > 0 ? (
                                                continent.countries.map((country) => (
                                                    <div
                                                        key={country.id || country._id}
                                                        className="group bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 flex items-start gap-4"
                                                    >
                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100">
                                                            {country.image ? (
                                                                <img src={country.image} alt={country.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">
                                                                    {country.code}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0 pt-0.5">
                                                            <Link
                                                                href={`/admin/location/country/${country.id || country._id}`}
                                                                className="block font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors"
                                                            >
                                                                {country.name}
                                                            </Link>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                                    {country.code}
                                                                </span>
                                                                {country.currency && (
                                                                    <span className="text-xs text-gray-400 truncate">
                                                                        {country.currency.code}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Link
                                                            href={`/admin/location/country/${country.id || country._id}`}
                                                            className="p-1.5 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors -mr-1 -mt-1"
                                                        >
                                                            <Icons.Edit2 className="w-4 h-4" />
                                                        </Link>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-white/50">
                                                    <p className="text-gray-400 text-sm mb-3">No countries added yet.</p>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openAddCountryModal(continent.id || continent._id);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline"
                                                    >
                                                        Add the first country to {continent.name}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Add Continent Modal */}
            {isContinentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">Add New Continent</h2>
                            <button onClick={() => setIsContinentModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreateContinent} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Continent Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newContinentName}
                                    onChange={(e) => setNewContinentName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                                    placeholder="e.g. Asia"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setIsContinentModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all scale-100">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center sticky top-0 bg-gray-50/95 backdrop-blur z-10">
                            <h2 className="text-lg font-bold text-gray-900">Add Country</h2>
                            <button onClick={() => setIsCountryModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreateCountry} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Country Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={newCountryData.name}
                                        onChange={(e) => setNewCountryData({ ...newCountryData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        placeholder="e.g. Japan"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Country Code (2 chars)</label>
                                    <input
                                        type="text"
                                        maxLength={2}
                                        value={newCountryData.code}
                                        onChange={(e) => setNewCountryData({ ...newCountryData, code: e.target.value.toUpperCase() })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all uppercase"
                                        placeholder="e.g. JP"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                                <input
                                    type="text"
                                    maxLength={200}
                                    value={newCountryData.shortDescription}
                                    onChange={(e) => setNewCountryData({ ...newCountryData, shortDescription: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Brief summary used in cards..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
                                <textarea
                                    value={newCountryData.description}
                                    onChange={(e) => setNewCountryData({ ...newCountryData, description: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all h-24 resize-none"
                                    placeholder="Detailed description..."
                                />
                            </div>

                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Currency Details</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Code</label>
                                        <input
                                            type="text"
                                            placeholder="JPY"
                                            value={newCountryData.currencyCode}
                                            onChange={(e) => setNewCountryData({ ...newCountryData, currencyCode: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm uppercase"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Name</label>
                                        <input
                                            type="text"
                                            placeholder="Yen"
                                            value={newCountryData.currencyName}
                                            onChange={(e) => setNewCountryData({ ...newCountryData, currencyName: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Symbol</label>
                                        <input
                                            type="text"
                                            placeholder="¥"
                                            value={newCountryData.currencySymbol}
                                            onChange={(e) => setNewCountryData({ ...newCountryData, currencySymbol: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCountryModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
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
