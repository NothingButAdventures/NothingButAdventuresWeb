"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface TripType {
    _id: string;
    id: string;
    name: string;
    slug: string;
    shortDescription?: string;
    description?: string;
    icon?: string;
    image?: string;
    color?: string;
    isActive: boolean;
}

export default function TripTypesPage() {
    const [tripTypes, setTripTypes] = useState<TripType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTypeName, setNewTypeName] = useState("");
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchTripTypes();
    }, []);

    const fetchTripTypes = async () => {
        try {
            const res = await fetch(`${api.baseURL}/trip-types`);
            const data = await res.json();
            if (data.status === "success") {
                setTripTypes(data.data.tripTypes);
            }
        } catch (err) {
            console.error("Error fetching trip types:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateType = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${api.baseURL}/trip-types`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newTypeName }),
                credentials: "include",
            });
            const data = await res.json();
            if (data.status === "success") {
                setNewTypeName("");
                setIsModalOpen(false);
                fetchTripTypes();
            } else {
                alert('Error creating trip type: ' + data.message);
            }
        } catch (err) {
            console.error("Error creating trip type:", err);
        }
    };

    const handleDelete = async (typeId: string, typeName: string) => {
        if (!confirm(`Are you sure you want to delete "${typeName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            setDeleteLoading(typeId);
            const res = await fetch(`${api.baseURL}/trip-types/${typeId}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (res.status === 204) {
                setTripTypes(tripTypes.filter((type) => type._id !== typeId));
                alert("Trip type deleted successfully!");
            } else {
                const data = await res.json();
                alert(`Failed to delete: ${data.message}`);
            }
        } catch (error) {
            console.error("Error deleting trip type:", error);
            alert("Failed to delete trip type. Please try again.");
        } finally {
            setDeleteLoading(null);
        }
    };

    const filteredTypes = tripTypes.filter((type) =>
        type.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                        <h1 className="text-2xl font-bold text-[#3F3F42]">Trip Types</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Manage trip types for your tours ({tripTypes.length} total)
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Trip Type
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
                            placeholder="Search trip types..."
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

                {/* Trip Types List */}
                {filteredTypes.length === 0 ? (
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
                                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                            />
                        </svg>
                        <h3 className="text-lg font-semibold text-[#3F3F42] mb-2">
                            {searchQuery ? "No trip types found" : "No trip types yet"}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchQuery
                                ? "Try adjusting your search query"
                                : "Get started by creating your first trip type"}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition"
                            >
                                Add Trip Type
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Trip Type
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Color
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
                                {filteredTypes.map((type) => (
                                    <tr key={type._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                                    style={{ backgroundColor: type.color || '#3B82F6' }}
                                                >
                                                    {type.icon ? (
                                                        <img src={type.icon} alt={type.name} className="w-5 h-5" />
                                                    ) : (
                                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div>
                                                    <Link
                                                        href={`/admin/trip-types/${type._id}`}
                                                        className="text-sm font-medium text-[#3F3F42] hover:text-blue-600 transition-colors"
                                                    >
                                                        {type.name}
                                                    </Link>
                                                    <p className="text-xs text-gray-500 truncate max-w-xs">
                                                        {type.shortDescription || "No description"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-4 h-4 rounded-full border border-gray-200"
                                                    style={{ backgroundColor: type.color || '#3B82F6' }}
                                                ></div>
                                                <span className="text-sm text-gray-500">{type.color || '#3B82F6'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2.5 py-1 text-xs font-medium rounded-full ${type.isActive
                                                    ? "bg-green-50 text-green-700"
                                                    : "bg-gray-100 text-gray-600"
                                                    }`}
                                            >
                                                {type.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/admin/trip-types/${type._id}`}
                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(type._id, type.name)}
                                                    disabled={deleteLoading === type._id}
                                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Delete"
                                                >
                                                    {deleteLoading === type._id ? (
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

            {/* Add Trip Type Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3F3F42]/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-[#3F3F42]">Add Trip Type</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreateType} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#3F3F42] mb-1">Trip Type Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={newTypeName}
                                    onChange={(e) => setNewTypeName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                                    placeholder="e.g. Group Tour, Private Tour, Self-Guided"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-[#3F3F42] hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
                                >
                                    Create Trip Type
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
