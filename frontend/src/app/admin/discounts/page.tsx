"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Discount {
    _id: string;
    id: string;
    name: string;
    slug: string;
    percentage: number;
    shortDescription?: string;
    color?: string;
    isActive: boolean;
    validFrom?: string;
    validUntil?: string;
    createdAt: string;
}

export default function DiscountsPage() {
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDiscount, setNewDiscount] = useState({
        name: "",
        percentage: "",
        shortDescription: "",
        color: "#22C55E",
    });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const fetchDiscounts = async () => {
        try {
            const res = await fetch(`${api.baseURL}/discounts`);
            const data = await res.json();
            if (data.status === "success") {
                setDiscounts(data.data.discounts);
            }
        } catch (err) {
            console.error("Error fetching discounts:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDiscount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDiscount.name || !newDiscount.percentage) return;

        setCreating(true);
        try {
            const res = await fetch(`${api.baseURL}/discounts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newDiscount.name,
                    percentage: parseInt(newDiscount.percentage),
                    shortDescription: newDiscount.shortDescription,
                    color: newDiscount.color,
                }),
                credentials: "include",
            });
            const data = await res.json();
            if (data.status === "success") {
                setDiscounts([data.data.discount, ...discounts]);
                setNewDiscount({ name: "", percentage: "", shortDescription: "", color: "#22C55E" });
                setIsModalOpen(false);
            } else {
                alert("Error: " + data.message);
            }
        } catch (err) {
            console.error("Error creating discount:", err);
            alert("Failed to create discount");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (discountId: string, discountName: string) => {
        if (!confirm(`Are you sure you want to delete "${discountName}"?`)) return;

        try {
            const res = await fetch(`${api.baseURL}/discounts/${discountId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (res.ok) {
                setDiscounts(discounts.filter((d) => d._id !== discountId));
            } else {
                alert("Failed to delete discount");
            }
        } catch (err) {
            console.error("Error deleting discount:", err);
            alert("Failed to delete discount");
        }
    };

    const filteredDiscounts = discounts.filter((discount) =>
        discount.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                            <div className="h-10 bg-gray-200 rounded-md w-64 animate-pulse"></div>
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
                        <h1 className="text-lg font-bold text-zinc-800 leading-none">Discounts</h1>
                        <p className="text-gray-555 text-xs mt-1 leading-none">
                            Manage discount options for tours ({discounts.length} total)
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-900 text-white font-medium py-1.5 px-3 rounded-md shadow-sm transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Discount
                    </button>
                </div>
            </div>

            <div className="p-8">
                {/* Search */}
                <div className="mb-6 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search discounts..."
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

                {/* Discounts List */}
                {filteredDiscounts.length === 0 ? (
                    <div className="bg-white rounded-md border border-gray-200 p-12 text-center shadow-sm">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                        <h3 className="text-lg font-semibold text-zinc-800 mb-2">No discounts found</h3>
                        <p className="text-gray-500">Create your first discount to get started</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Percentage</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Color</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {filteredDiscounts.map((discount) => (
                                        <tr key={discount._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-10 h-10 rounded-md flex items-center justify-center text-white font-bold text-sm shadow-sm"
                                                        style={{ backgroundColor: discount.color || "#22C55E" }}
                                                    >
                                                        %
                                                    </div>
                                                    <div>
                                                        <Link
                                                            href={`/admin/discounts/${discount._id}`}
                                                            className="text-sm font-medium text-zinc-800 hover:text-zinc-950 hover:underline transition-colors"
                                                        >
                                                            {discount.name}
                                                        </Link>
                                                        {discount.shortDescription && (
                                                            <p className="text-xs text-gray-500 truncate max-w-xs">
                                                                {discount.shortDescription}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold"
                                                    style={{
                                                        backgroundColor: `${discount.color}15` || "#22C55E15",
                                                        color: discount.color || "#22C55E",
                                                    }}
                                                >
                                                    {discount.percentage}% OFF
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-4 h-4 rounded-full border border-gray-200"
                                                        style={{ backgroundColor: discount.color || "#22C55E" }}
                                                    />
                                                    <span className="text-sm text-gray-500 uppercase">
                                                        {discount.color || "#22C55E"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-0.5 text-xs font-medium border rounded-md ${discount.isActive
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                        : "bg-zinc-100 text-zinc-600 border-zinc-200"
                                                        }`}
                                                >
                                                    {discount.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <Link
                                                        href={`/admin/discounts/${discount._id}`}
                                                        className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(discount._id, discount.name)}
                                                        className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-md w-full max-w-lg shadow-lg border border-gray-200 overflow-hidden transform transition-all scale-100">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
                            <h2 className="text-lg font-bold text-zinc-800">Create New Discount</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateDiscount} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">
                                    Discount Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newDiscount.name}
                                    onChange={(e) => setNewDiscount({ ...newDiscount, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm placeholder:text-gray-400"
                                    placeholder="e.g., Early Bird, Summer Special"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">
                                    Percentage <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={newDiscount.percentage}
                                        onChange={(e) => setNewDiscount({ ...newDiscount, percentage: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm placeholder:text-gray-400"
                                        placeholder="e.g., 10"
                                        required
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">%</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">
                                    Short Description
                                </label>
                                <input
                                    type="text"
                                    value={newDiscount.shortDescription}
                                    onChange={(e) => setNewDiscount({ ...newDiscount, shortDescription: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm placeholder:text-gray-400"
                                    placeholder="Brief description..."
                                    maxLength={200}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">
                                    Brand Color
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={newDiscount.color}
                                        onChange={(e) => setNewDiscount({ ...newDiscount, color: e.target.value })}
                                        className="h-10 w-12 rounded-md border border-gray-300 cursor-pointer shadow-sm"
                                    />
                                    <input
                                        type="text"
                                        value={newDiscount.color}
                                        onChange={(e) => setNewDiscount({ ...newDiscount, color: e.target.value })}
                                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm uppercase placeholder:text-gray-400"
                                        placeholder="#22C55E"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-zinc-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 disabled:opacity-50 transition-colors border border-zinc-900 font-medium text-sm shadow-sm"
                                >
                                    {creating ? "Creating..." : "Create Discount"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
