"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface PhysicalRating {
    _id: string;
    id: string;
    name: string;
    slug: string;
    level: number;
    shortDescription?: string;
    description?: string;
    icon?: string;
    color?: string;
    isActive: boolean;
}

export default function PhysicalRatingsPage() {
    const [physicalRatings, setPhysicalRatings] = useState<PhysicalRating[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRatingName, setNewRatingName] = useState("");
    const [newRatingLevel, setNewRatingLevel] = useState(1);
    const [newRatingDescription, setNewRatingDescription] = useState("");
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchPhysicalRatings();
    }, []);

    const fetchPhysicalRatings = async () => {
        try {
            const res = await fetch(`${api.baseURL}/physical-ratings`);
            let data: any = null;
            const contentType = res.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                data = await res.json();
            } else {
                const text = await res.text();
                throw new Error(`Unexpected response from server: ${text.slice(0, 200)}`);
            }

            if (data?.status === "success") {
                setPhysicalRatings(data.data.physicalRatings);
            }
        } catch (err) {
            console.error("Error fetching physical ratings:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRating = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${api.baseURL}/physical-ratings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newRatingName,
                    level: newRatingLevel,
                    description: newRatingDescription
                }),
                credentials: "include",
            });
            let data: any = null;
            if (res.headers.get('content-type')?.includes('application/json')) {
                try {
                    data = await res.json();
                } catch (parseErr) {
                    const text = await res.text();
                    throw new Error(`Failed to parse JSON response: ${text.slice(0, 200)}`);
                }
            } else {
                const text = await res.text();
                throw new Error(`Server returned non-JSON response: ${text.slice(0, 200)}`);
            }

            if (res.ok && data?.status === "success") {
                setNewRatingName("");
                setNewRatingLevel(1);
                setNewRatingDescription("");
                setIsModalOpen(false);
                fetchPhysicalRatings();
            } else {
                const msg = data?.message || `Request failed with status ${res.status}`;
                alert('Error creating physical rating: ' + msg);
            }
        } catch (err) {
            console.error("Error creating physical rating:", err);
            alert((err as Error).message || 'Failed to create physical rating');
        }
    };

    const handleDelete = async (ratingId: string, ratingName: string) => {
        if (!confirm(`Are you sure you want to delete "${ratingName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            setDeleteLoading(ratingId);
            const res = await fetch(`${api.baseURL}/physical-ratings/${ratingId}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (res.status === 204) {
                setPhysicalRatings(physicalRatings.filter((rating) => rating._id !== ratingId));
                alert("Physical rating deleted successfully!");
            } else {
                let msg = `Failed to delete (status ${res.status})`;
                try {
                    const contentType = res.headers.get('content-type') || '';
                    if (contentType.includes('application/json')) {
                        const data = await res.json();
                        msg = data?.message || msg;
                    } else {
                        const text = await res.text();
                        msg = text || msg;
                    }
                } catch (parseErr) {
                    // keep fallback msg
                }
                alert(`Failed to delete: ${msg}`);
            }
        } catch (error) {
            console.error("Error deleting physical rating:", error);
            alert("Failed to delete physical rating. Please try again.");
        } finally {
            setDeleteLoading(null);
        }
    };

    const filteredRatings = physicalRatings.filter((rating) =>
        rating.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getLevelColor = (level: number) => {
        const colors = {
            1: '#22C55E', // Green - Easy
            2: '#84CC16', // Lime - Moderate
            3: '#EAB308', // Yellow - Challenging
            4: '#F97316', // Orange - Difficult
            5: '#EF4444', // Red - Expert
        };
        return colors[level as keyof typeof colors] || '#3B82F6';
    };

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
                    <div className="bg-white rounded-xl border border-gray-200 animate-pulse">
                        <div className="p-4 border-b border-gray-100">
                            <div className="h-10 bg-gray-200 rounded-lg w-64"></div>
                        </div>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="p-4 border-b border-gray-100 flex items-center gap-4">
                                <div className="h-5 bg-gray-200 rounded w-48"></div>
                                <div className="h-5 bg-gray-200 rounded w-24"></div>
                                <div className="flex-1"></div>
                                <div className="h-8 bg-gray-200 rounded w-20"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="px-8 py-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Physical Ratings</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Manage physical rating levels for your tours ({physicalRatings.length} total)
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Physical Rating
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
                            placeholder="Search physical ratings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                        />
                        <svg
                            className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2"
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
                </div>

                {/* Physical Ratings List */}
                {filteredRatings.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <svg
                            className="w-16 h-16 text-gray-300 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {searchQuery ? "No physical ratings found" : "No physical ratings yet"}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchQuery
                                ? "Try adjusting your search query"
                                : "Get started by creating your first physical rating"}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition"
                            >
                                Add Physical Rating
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Physical Rating
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Level
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {filteredRatings.map((rating) => (
                                    <tr key={rating._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                                    style={{ backgroundColor: getLevelColor(rating.level) }}
                                                >
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <Link
                                                        href={`/admin/physical-ratings/${rating._id}`}
                                                        className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                                                    >
                                                        {rating.name}
                                                    </Link>
                                                    <p className="text-xs text-gray-500 truncate max-w-xs">
                                                        {rating.shortDescription || rating.description || "No description"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((level) => (
                                                        <div
                                                            key={level}
                                                            className={`w-3 h-3 rounded-full ${level <= rating.level ? '' : 'opacity-20'}`}
                                                            style={{ backgroundColor: getLevelColor(rating.level) }}
                                                        ></div>
                                                    ))}
                                                </div>
                                                <span className="text-sm text-gray-500">Level {rating.level}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2.5 py-1 text-xs font-medium rounded-full ${rating.isActive
                                                    ? "bg-green-50 text-green-700"
                                                    : "bg-gray-100 text-gray-600"
                                                    }`}
                                            >
                                                {rating.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/admin/physical-ratings/${rating._id}`}
                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(rating._id, rating.name)}
                                                    disabled={deleteLoading === rating._id}
                                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Delete"
                                                >
                                                    {deleteLoading === rating._id ? (
                                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Physical Rating Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">Add Physical Rating</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreateRating} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rating Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={newRatingName}
                                    onChange={(e) => setNewRatingName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                                    placeholder="e.g. Easy, Moderate, Challenging"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Level (1-5) <span className="text-red-500">*</span></label>
                                <select
                                    value={newRatingLevel}
                                    onChange={(e) => setNewRatingLevel(Number(e.target.value))}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                >
                                    <option value={1}>1</option>
                                    <option value={2}>2</option>
                                    <option value={3}>3</option>
                                    <option value={4}>4</option>
                                    <option value={5}>5</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={newRatingDescription}
                                    onChange={(e) => setNewRatingDescription(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                                    placeholder="Describe the physical requirements..."
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
                                >
                                    Create Physical Rating
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
