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
                    <h1 className="text-2xl font-bold text-gray-900">Discounts</h1>
                    <p className="text-gray-500 mt-1">
                        Manage discount options for tours ({discounts.length} total)
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition shadow-lg"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Discount
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <input
                        type="text"
                        placeholder="Search discounts..."
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

            {/* Discounts List */}
            {filteredDiscounts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No discounts found</h3>
                    <p className="text-gray-500">Create your first discount to get started</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Name</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Percentage</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Color</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDiscounts.map((discount) => (
                                <tr key={discount._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md"
                                                style={{ backgroundColor: discount.color || "#22C55E" }}
                                            >
                                                %
                                            </div>
                                            <div>
                                                <Link
                                                    href={`/admin/discounts/${discount._id}`}
                                                    className="font-medium text-gray-900 hover:text-blue-600 transition"
                                                >
                                                    {discount.name}
                                                </Link>
                                                {discount.shortDescription && (
                                                    <p className="text-sm text-gray-500 truncate max-w-xs">
                                                        {discount.shortDescription}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold"
                                            style={{
                                                backgroundColor: `${discount.color}15` || "#22C55E15",
                                                color: discount.color || "#22C55E",
                                            }}
                                        >
                                            {discount.percentage}% OFF
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-6 h-6 rounded-lg border border-gray-200"
                                                style={{ backgroundColor: discount.color || "#22C55E" }}
                                            />
                                            <span className="text-sm text-gray-600 uppercase">
                                                {discount.color || "#22C55E"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${discount.isActive
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${discount.isActive ? "bg-green-500" : "bg-gray-400"
                                                    }`}
                                            />
                                            {discount.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/discounts/${discount._id}`}
                                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                title="Edit"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(discount._id, discount.name)}
                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                title="Delete"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            )}

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900">Create New Discount</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateDiscount} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Discount Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newDiscount.name}
                                    onChange={(e) => setNewDiscount({ ...newDiscount, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                                    placeholder="e.g., Early Bird, Summer Special"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Percentage <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={newDiscount.percentage}
                                        onChange={(e) => setNewDiscount({ ...newDiscount, percentage: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                                        placeholder="e.g., 10"
                                        required
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">%</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Short Description
                                </label>
                                <input
                                    type="text"
                                    value={newDiscount.shortDescription}
                                    onChange={(e) => setNewDiscount({ ...newDiscount, shortDescription: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                                    placeholder="Brief description..."
                                    maxLength={200}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Brand Color
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={newDiscount.color}
                                        onChange={(e) => setNewDiscount({ ...newDiscount, color: e.target.value })}
                                        className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={newDiscount.color}
                                        onChange={(e) => setNewDiscount({ ...newDiscount, color: e.target.value })}
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition uppercase"
                                        placeholder="#22C55E"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition font-medium"
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
