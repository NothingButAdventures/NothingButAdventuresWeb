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
        fetchCountries();
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

    const fetchCountries = async () => {
        try {
            const res = await fetch(`${api.baseURL}${api.endpoints.countries.getAll}`);
            const data = await res.json();
            if (data.status === "success") {
                setCountries(data.data.countries);
            }
        } catch (err) {
            console.error("Error fetching countries:", err);
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

    const filteredPromoCodes = promoCodes.filter(
        (promo) =>
            promo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (promo.description && promo.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const isPromoExpired = (endDate: string) => new Date(endDate) < new Date();
    const isPromoExhausted = (promo: PromoCode) => promo.usedCount >= promo.maxUsers;

    const getStatusBadge = (promo: PromoCode) => {
        if (!promo.isActive) return { label: "Inactive", className: "bg-gray-100 text-gray-600", dotClass: "bg-gray-400" };
        if (isPromoExpired(promo.endDate)) return { label: "Expired", className: "bg-red-50 text-red-700", dotClass: "bg-red-500" };
        if (isPromoExhausted(promo)) return { label: "Exhausted", className: "bg-orange-50 text-orange-700", dotClass: "bg-orange-500" };
        return { label: "Active", className: "bg-green-50 text-green-700", dotClass: "bg-green-500" };
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-48"></div>
                    <div className="h-12 bg-gray-200 rounded w-full max-w-md"></div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Promo Codes</h1>
                    <p className="text-gray-500 mt-1">
                        Manage promotional codes for tours ({promoCodes.length} total)
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition shadow-lg"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Promo Code
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <input
                        type="text"
                        placeholder="Search promo codes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                    />
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No promo codes found</h3>
                    <p className="text-gray-500">Create your first promo code to get started</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Code</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Discount</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Usage</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Validity</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Scope</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPromoCodes.map((promo) => {
                                const status = getStatusBadge(promo);
                                return (
                                    <tr key={promo._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-black text-white font-bold text-xs shadow-md">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <span className="font-mono font-bold text-gray-900 text-sm tracking-wider">
                                                        {promo.code}
                                                    </span>
                                                    {promo.description && (
                                                        <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                                            {promo.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-emerald-50 text-emerald-700">
                                                {promo.discountType === "percentage"
                                                    ? `${promo.discountValue}% OFF`
                                                    : `$${promo.discountValue} OFF`}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 max-w-[80px]">
                                                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-black rounded-full transition-all"
                                                            style={{
                                                                width: `${Math.min((promo.usedCount / promo.maxUsers) * 100, 100)}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <span className="text-sm text-gray-600 font-medium">
                                                    {promo.usedCount}/{promo.maxUsers}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-700">
                                                <div>{new Date(promo.startDate).toLocaleDateString()}</div>
                                                <div className="text-xs text-gray-400">
                                                    to {new Date(promo.endDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1 max-w-[180px]">
                                                {(!promo.travelStyles || promo.travelStyles.length === 0) &&
                                                    (!promo.countries || promo.countries.length === 0) ? (
                                                    <span className="text-xs text-gray-500 italic">All tours</span>
                                                ) : (
                                                    <>
                                                        {promo.travelStyles?.map((s) => (
                                                            <span key={s} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] rounded font-medium">
                                                                {s}
                                                            </span>
                                                        ))}
                                                        {promo.countries?.map((c) => (
                                                            <span key={c._id} className="px-1.5 py-0.5 bg-purple-50 text-purple-700 text-[10px] rounded font-medium">
                                                                {c.name}
                                                            </span>
                                                        ))}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status.dotClass}`} />
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(promo)}
                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Edit"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(promo._id, promo.code)}
                                                    disabled={deleteLoading === promo._id}
                                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                                    title="Delete"
                                                >
                                                    {deleteLoading === promo._id ? (
                                                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {editingPromo ? "Edit Promo Code" : "Create New Promo Code"}
                            </h2>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    resetForm();
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Promo Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition font-mono uppercase tracking-wider"
                                    placeholder="e.g., SUMMER2026"
                                    required
                                    disabled={!!editingPromo}
                                />
                                {editingPromo && (
                                    <p className="text-xs text-gray-400 mt-1">Code cannot be changed after creation</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                                    placeholder="Brief description of the promo..."
                                    maxLength={500}
                                />
                            </div>

                            {/* Discount Type & Value */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition bg-white"
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount ($)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Max Users <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.maxUsers}
                                        onChange={(e) => setFormData({ ...formData, maxUsers: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                                        placeholder="e.g., 100"
                                        required
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Maximum number of times this code can be used</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Duration (days) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                                        placeholder="e.g., 30"
                                        required
                                    />
                                    <p className="text-xs text-gray-400 mt-1">How many days the promo code remains valid</p>
                                </div>
                            </div>

                            {/* Max Discount Amount & Min Order Value */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Min Order Value ($)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.minOrderValue}
                                        onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                                        placeholder="e.g., 500"
                                    />
                                </div>
                                {formData.discountType === "percentage" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Max Discount Amount ($)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.maxDiscountAmount}
                                            onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                                            placeholder="e.g., 200"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Cap on max discount amount</p>
                                    </div>
                                )}
                            </div>

                            {/* Travel Styles (optional) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Travel Styles <span className="text-gray-400 text-xs font-normal">(leave empty for all)</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {travelStyles.map((style) => (
                                        <button
                                            type="button"
                                            key={style._id}
                                            onClick={() => toggleTravelStyle(style.name)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${formData.travelStyles.includes(style.name)
                                                ? "bg-black text-white border-black"
                                                : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                                                }`}
                                        >
                                            {style.name}
                                        </button>
                                    ))}
                                    {travelStyles.length === 0 && (
                                        <span className="text-sm text-gray-400">No travel styles available</span>
                                    )}
                                </div>
                            </div>

                            {/* Countries (optional) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Countries <span className="text-gray-400 text-xs font-normal">(leave empty for all)</span>
                                </label>
                                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                    {countries.map((country) => (
                                        <button
                                            type="button"
                                            key={country._id}
                                            onClick={() => toggleCountry(country._id)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${formData.countries.includes(country._id)
                                                ? "bg-black text-white border-black"
                                                : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                                                }`}
                                        >
                                            {country.name}
                                        </button>
                                    ))}
                                    {countries.length === 0 && (
                                        <span className="text-sm text-gray-400">No countries available</span>
                                    )}
                                </div>
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isActive ? "bg-black" : "bg-gray-200"
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? "translate-x-6" : "translate-x-1"
                                            }`}
                                    />
                                </button>
                                <span className="text-sm font-medium text-gray-700">
                                    {formData.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition font-medium"
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
