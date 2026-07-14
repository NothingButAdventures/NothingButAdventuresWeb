"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface PromoCode {
    _id: string;
    code: string;
    description?: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    maxUsers: number;
    usedCount: number;
    duration: number;
    startDate: string;
    endDate: string;
    travelStyles: string[];
    countries: Array<{ _id: string; name: string; slug: string }>;
    minOrderValue?: number;
    maxDiscountAmount?: number;
    isActive: boolean;
    createdAt: string;
}

interface TravelStyle {
    _id: string;
    name: string;
}

interface Country {
    _id: string;
    name: string;
    continent?: string;
}

interface Continent {
    _id: string;
    id?: string;
    name: string;
    countries: Country[];
}

export default function PromoCodesPage() {
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
    const [creating, setCreating] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

    // Lookup data
    const [travelStyles, setTravelStyles] = useState<TravelStyle[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [continents, setContinents] = useState<Continent[]>([]);
    const [expandedContinents, setExpandedContinents] = useState<string[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        code: "",
        description: "",
        discountType: "percentage" as "percentage" | "fixed",
        discountValue: "",
        maxUsers: "",
        duration: "",
        travelStyles: [] as string[],
        countries: [] as string[],
        minOrderValue: "",
        maxDiscountAmount: "",
        isActive: true,
    });

    useEffect(() => {
        fetchPromoCodes();
        fetchTravelStyles();
        fetchContinents();
    }, []);

    const fetchPromoCodes = async () => {
        try {
            const res = await fetch(`${api.baseURL}${api.endpoints.promoCodes.getAll}`);
            const data = await res.json();
            if (data.status === "success") {
                setPromoCodes(data.data.promoCodes);
            }
        } catch (err) {
            console.error("Error fetching promo codes:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTravelStyles = async () => {
        try {
            const res = await fetch(`${api.baseURL}${api.endpoints.travelStyles.getAll}`);
            const data = await res.json();
            if (data.status === "success") {
                setTravelStyles(data.data.travelStyles);
            }
        } catch (err) {
            console.error("Error fetching travel styles:", err);
        }
    };

    const fetchContinents = async () => {
        try {
            const res = await fetch(`${api.baseURL}${api.endpoints.continents.getAll}`);
            const data = await res.json();
            if (data.status === "success") {
                setContinents(data.data.continents);
                const allCountries = data.data.continents.flatMap((con: Continent) => con.countries || []);
                setCountries(allCountries);
            }
        } catch (err) {
            console.error("Error fetching continents:", err);
        }
    };

    const resetForm = () => {
        setFormData({
            code: "",
            description: "",
            discountType: "percentage",
            discountValue: "",
            maxUsers: "",
            duration: "",
            travelStyles: [],
            countries: [],
            minOrderValue: "",
            maxDiscountAmount: "",
            isActive: true,
        });
        setEditingPromo(null);
    };

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (promo: PromoCode) => {
        setEditingPromo(promo);
        setFormData({
            code: promo.code,
            description: promo.description || "",
            discountType: promo.discountType,
            discountValue: String(promo.discountValue),
            maxUsers: String(promo.maxUsers),
            duration: String(promo.duration),
            travelStyles: promo.travelStyles || [],
            countries: promo.countries?.map((c) => c._id) || [],
            minOrderValue: promo.minOrderValue ? String(promo.minOrderValue) : "",
            maxDiscountAmount: promo.maxDiscountAmount ? String(promo.maxDiscountAmount) : "",
            isActive: promo.isActive,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.code || !formData.discountValue || !formData.maxUsers || !formData.duration) {
            alert("Please fill all required fields");
            return;
        }

        setCreating(true);
        try {
            const payload = {
                code: formData.code.toUpperCase().trim(),
                description: formData.description,
                discountType: formData.discountType,
                discountValue: parseFloat(formData.discountValue),
                maxUsers: parseInt(formData.maxUsers),
                duration: parseInt(formData.duration),
                travelStyles: formData.travelStyles.length > 0 ? formData.travelStyles : [],
                countries: formData.countries.length > 0 ? formData.countries : [],
                minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : 0,
                maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : undefined,
                isActive: formData.isActive,
            };

            let res;
            if (editingPromo) {
                res = await fetch(
                    `${api.baseURL}${api.endpoints.promoCodes.update(editingPromo._id)}`,
                    {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                        credentials: "include",
                    }
                );
            } else {
                res = await fetch(`${api.baseURL}${api.endpoints.promoCodes.create}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                    credentials: "include",
                });
            }

            const data = await res.json();
            if (data.status === "success") {
                resetForm();
                setIsModalOpen(false);
                fetchPromoCodes();
            } else {
                alert("Error: " + data.message);
            }
        } catch (err) {
            console.error("Error saving promo code:", err);
            alert("Failed to save promo code");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (promoId: string, promoCode: string) => {
        if (!confirm(`Are you sure you want to delete promo code "${promoCode}"? This action cannot be undone.`)) return;

        try {
            setDeleteLoading(promoId);
            const res = await fetch(
                `${api.baseURL}${api.endpoints.promoCodes.delete(promoId)}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );
            if (res.ok) {
                setPromoCodes(promoCodes.filter((p) => p._id !== promoId));
            } else {
                alert("Failed to delete promo code");
            }
        } catch (err) {
            console.error("Error deleting promo code:", err);
            alert("Failed to delete promo code");
        } finally {
            setDeleteLoading(null);
        }
    };

    const toggleTravelStyle = (style: string) => {
        setFormData((prev) => ({
            ...prev,
            travelStyles: prev.travelStyles.includes(style)
                ? prev.travelStyles.filter((s) => s !== style)
                : [...prev.travelStyles, style],
        }));
    };

    const toggleCountry = (countryId: string) => {
        setFormData((prev) => ({
            ...prev,
            countries: prev.countries.includes(countryId)
                ? prev.countries.filter((c) => c !== countryId)
                : [...prev.countries, countryId],
        }));
    };

    const toggleContinentGroup = (continent: Continent) => {
        const continentCountryIds = continent.countries?.map(c => c._id) || [];
        const allSelected = continentCountryIds.every(id => formData.countries.includes(id));

        if (allSelected) {
            setFormData(prev => ({
                ...prev,
                countries: prev.countries.filter(id => !continentCountryIds.includes(id))
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                countries: Array.from(new Set([...prev.countries, ...continentCountryIds]))
            }));
        }
    };

    const isContinentFullySelected = (continent: Continent) => {
        const continentCountryIds = continent.countries?.map(c => c._id) || [];
        if (continentCountryIds.length === 0) return false;
        return continentCountryIds.every(id => formData.countries.includes(id));
    };

    const isContinentPartiallySelected = (continent: Continent) => {
        const continentCountryIds = continent.countries?.map(c => c._id) || [];
        if (continentCountryIds.length === 0) return false;
        const selectedCount = continentCountryIds.filter(id => formData.countries.includes(id)).length;
        return selectedCount > 0 && selectedCount < continentCountryIds.length;
    };

    const toggleContinentExpand = (id: string) => {
        setExpandedContinents(prev =>
            prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
        );
    };

    const filteredPromoCodes = promoCodes.filter(
        (promo) =>
            promo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (promo.description && promo.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const isPromoExpired = (endDate: string) => new Date(endDate) < new Date();
    const isPromoExhausted = (promo: PromoCode) => promo.usedCount >= promo.maxUsers;

    const getStatusBadge = (promo: PromoCode) => {
        if (!promo.isActive) return { label: "Inactive", className: "bg-zinc-100 text-zinc-600 border-zinc-200", dotClass: "bg-zinc-400" };
        if (isPromoExpired(promo.endDate)) return { label: "Expired", className: "bg-red-50 text-red-700 border-red-100", dotClass: "bg-red-500" };
        if (isPromoExhausted(promo)) return { label: "Exhausted", className: "bg-amber-50 text-amber-700 border-amber-100", dotClass: "bg-amber-500" };
        return { label: "Active", className: "bg-emerald-50 text-emerald-700 border-emerald-100", dotClass: "bg-emerald-500" };
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
                    <div className="bg-white rounded-md border border-gray-200 animate-pulse">
                        <div className="p-4 border-b border-gray-100">
                            <div className="h-10 bg-gray-200 rounded-md w-64"></div>
                        </div>
                        <div className="p-6 space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-16 bg-gray-200 rounded-md animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="px-8 h-16 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-zinc-800 leading-none">Promo Codes</h1>
                        <p className="text-gray-550 text-xs mt-1 leading-none">
                            Manage promotional codes for tours ({promoCodes.length} total)
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-900 text-white font-medium py-1.5 px-3 rounded-md shadow-sm transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Promo Code
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-8">
                {/* Search */}
                <div className="mb-6 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search promo codes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm placeholder:text-gray-400"
                        />
                        <svg
                            className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Promo Codes List */}
                {filteredPromoCodes.length === 0 ? (
                    <div className="bg-white rounded-md border border-gray-200 p-12 text-center shadow-sm">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-zinc-800 mb-2">No promo codes found</h3>
                        <p className="text-gray-500">Create your first promo code to get started</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Code</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Discount</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Usage</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Validity</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Scope</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {filteredPromoCodes.map((promo) => {
                                        const status = getStatusBadge(promo);
                                        return (
                                            <tr key={promo._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-md flex items-center justify-center bg-zinc-100 text-zinc-700 border border-zinc-200 font-bold text-xs shadow-sm flex-shrink-0">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <span className="font-mono font-bold text-zinc-800 text-sm tracking-wider">
                                                                {promo.code}
                                                            </span>
                                                            {promo.description && (
                                                                <p className="text-xs text-gray-400 truncate max-w-[200px]">
                                                                    {promo.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                        {promo.discountType === "percentage"
                                                            ? `${promo.discountValue}% OFF`
                                                            : `$${promo.discountValue} OFF`}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 min-w-[80px]">
                                                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-zinc-800 rounded-full transition-all"
                                                                    style={{
                                                                        width: `${Math.min((promo.usedCount / promo.maxUsers) * 100, 100)}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-gray-500 font-medium">
                                                            {promo.usedCount}/{promo.maxUsers}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-xs text-zinc-700 space-y-0.5">
                                                        <div>{new Date(promo.startDate).toLocaleDateString()}</div>
                                                        <div className="text-gray-400">
                                                            to {new Date(promo.endDate).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                                                        {(!promo.travelStyles || promo.travelStyles.length === 0) &&
                                                            (!promo.countries || promo.countries.length === 0) ? (
                                                            <span className="text-xs text-gray-400 italic">All tours</span>
                                                        ) : (
                                                            <>
                                                                {promo.travelStyles?.map((s) => (
                                                                    <span key={s} className="px-1.5 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-700 text-[9px] rounded-md font-semibold">
                                                                        {s}
                                                                    </span>
                                                                ))}
                                                                {promo.countries?.map((c) => (
                                                                    <span key={c._id} className="px-1.5 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-700 text-[9px] rounded-md font-semibold">
                                                                        {c.name}
                                                                    </span>
                                                                ))}
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 border rounded-md text-xs font-medium ${status.className}`}
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status.dotClass}`} />
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex justify-end gap-1.5">
                                                        <button
                                                            onClick={() => openEditModal(promo)}
                                                            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(promo._id, promo.code)}
                                                            disabled={deleteLoading === promo._id}
                                                            className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                                                            title="Delete"
                                                        >
                                                            {deleteLoading === promo._id ? (
                                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-md w-full max-w-2xl shadow-lg border border-gray-200 max-h-[90vh] overflow-y-auto transform transition-all scale-100">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                            <h2 className="text-lg font-bold text-zinc-800">
                                {editingPromo ? "Edit Promo Code" : "Create New Promo Code"}
                            </h2>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    resetForm();
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Code */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">
                                    Promo Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm font-mono uppercase tracking-wider placeholder:text-gray-400"
                                    placeholder="e.g., SUMMER2026"
                                    required
                                    disabled={!!editingPromo}
                                />
                                {editingPromo && (
                                    <p className="text-xs text-gray-400 mt-1.5">Code cannot be changed after creation</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm placeholder:text-gray-400"
                                    placeholder="Brief description of the promo..."
                                    maxLength={500}
                                />
                            </div>

                            {/* Discount Type & Value */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                        Discount Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.discountType}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                discountType: e.target.value as "percentage" | "fixed",
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm"
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount ($)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                        Discount Value <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            max={formData.discountType === "percentage" ? "100" : undefined}
                                            step="0.01"
                                            value={formData.discountValue}
                                            onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm placeholder:text-gray-400"
                                            placeholder={formData.discountType === "percentage" ? "e.g., 15" : "e.g., 50"}
                                            required
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                                            {formData.discountType === "percentage" ? "%" : "$"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Max Users & Duration */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                        Max Users <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.maxUsers}
                                        onChange={(e) => setFormData({ ...formData, maxUsers: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm placeholder:text-gray-400"
                                        placeholder="e.g., 100"
                                        required
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Maximum number of times this code can be used</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                        Duration (days) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm placeholder:text-gray-400"
                                        placeholder="e.g., 30"
                                        required
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">How many days the promo code remains valid</p>
                                </div>
                            </div>

                            {/* Max Discount Amount & Min Order Value */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                        Min Order Value ($)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.minOrderValue}
                                        onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm placeholder:text-gray-400"
                                        placeholder="e.g., 500"
                                    />
                                </div>
                                {formData.discountType === "percentage" && (
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">
                                            Max Discount Amount ($)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.maxDiscountAmount}
                                            onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm placeholder:text-gray-400"
                                            placeholder="e.g., 200"
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1">Cap on max discount amount</p>
                                    </div>
                                )}
                            </div>

                            {/* Travel Styles (optional) */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">
                                    Travel Styles <span className="text-gray-400 text-[10px] font-normal">(leave empty for all)</span>
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {travelStyles.map((style) => (
                                        <button
                                            type="button"
                                            key={style._id}
                                            onClick={() => toggleTravelStyle(style.name)}
                                            className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors shadow-sm ${formData.travelStyles.includes(style.name)
                                                ? "bg-zinc-900 text-white border-zinc-900"
                                                : "bg-white text-zinc-750 border-gray-300 hover:bg-zinc-50"
                                                }`}
                                        >
                                            {style.name}
                                        </button>
                                    ))}
                                    {travelStyles.length === 0 && (
                                        <span className="text-xs text-gray-400 italic">No travel styles available</span>
                                    )}
                                </div>
                            </div>

                            {/* Countries (optional) */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">
                                    Countries <span className="text-gray-400 text-[10px] font-normal">(leave empty for all tours)</span>
                                </label>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 border border-gray-200 rounded-md p-3 bg-gray-50/50 shadow-inner">
                                    {continents.length === 0 ? (
                                        <span className="text-xs text-gray-400 italic">No country data available</span>
                                    ) : (
                                        continents.map((continent) => {
                                            const isFullySelected = isContinentFullySelected(continent);
                                            const isPartiallySelected = isContinentPartiallySelected(continent);
                                            const isExpanded = expandedContinents.includes(continent._id);

                                            return (
                                                <div key={continent._id} className="bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm">
                                                    <div 
                                                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                                        onClick={() => toggleContinentExpand(continent._id)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div 
                                                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                                                                    isFullySelected ? "bg-zinc-900 border-zinc-900" : "bg-white border-gray-300"
                                                                }`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleContinentGroup(continent);
                                                                }}
                                                            >
                                                                {isFullySelected ? (
                                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                ) : isPartiallySelected ? (
                                                                    <div className="w-2 h-0.5 bg-gray-400 rounded" />
                                                                ) : null}
                                                            </div>
                                                            <span className="font-bold text-zinc-700 text-sm">{continent.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] bg-zinc-100 border border-zinc-200 text-zinc-650 px-2 py-0.5 rounded-md font-semibold">
                                                                {continent.countries?.filter(c => formData.countries.includes(c._id)).length || 0} / {continent.countries?.length || 0}
                                                            </span>
                                                            <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </div>
                                                    </div>

                                                    {isExpanded && (
                                                        <div className="p-3 bg-gray-50/50 border-t border-gray-200 grid grid-cols-2 md:grid-cols-3 gap-2">
                                                            {continent.countries?.map((country) => {
                                                                const isSelected = formData.countries.includes(country._id);
                                                                return (
                                                                    <button
                                                                        type="button"
                                                                        key={country._id}
                                                                        onClick={() => toggleCountry(country._id)}
                                                                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-semibold border transition-all shadow-sm ${
                                                                            isSelected
                                                                                ? "bg-zinc-900 text-white border-zinc-900"
                                                                                : "bg-white text-zinc-750 border-gray-300 hover:bg-zinc-50"
                                                                        }`}
                                                                    >
                                                                        <div className={`w-3 h-3 rounded border flex items-center justify-center ${
                                                                            isSelected ? "bg-white border-white" : "border-gray-305"
                                                                        }`}>
                                                                            {isSelected && <div className="w-1.5 h-1.5 bg-zinc-900 rounded-sm" />}
                                                                        </div>
                                                                        <span className="truncate">{country.name}</span>
                                                                    </button>
                                                                );
                                                            })}
                                                            {(!continent.countries || continent.countries.length === 0) && (
                                                                <span className="text-[10px] text-gray-400 italic col-span-full">No countries in this continent</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${formData.isActive ? "bg-zinc-900" : "bg-gray-200"
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${formData.isActive ? "translate-x-4.5" : "translate-x-1"
                                            }`}
                                    />
                                </button>
                                <span className="text-sm font-semibold text-zinc-700">
                                    {formData.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-zinc-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 disabled:opacity-50 transition-colors border border-zinc-900 font-medium text-sm shadow-sm"
                                >
                                    {creating
                                        ? "Saving..."
                                        : editingPromo
                                            ? "Update Promo Code"
                                            : "Create Promo Code"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
