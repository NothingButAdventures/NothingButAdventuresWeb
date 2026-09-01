"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import ImagePickerModal from "@/components/ImagePickerModal";

interface TravelStyle {
    _id: string;
    id: string;
    name: string;
    slug: string;
    shortDescription?: string;
    description?: string;
    icon?: string;
    image?: string;
    color?: string;
    url?: string;
    isActive: boolean;
}

export default function TravelStylesPage() {
    const [travelStyles, setTravelStyles] = useState<TravelStyle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newStyleName, setNewStyleName] = useState("");
    const [newShortDescription, setNewShortDescription] = useState("");
    const [newIcon, setNewIcon] = useState("");
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [newColor, setNewColor] = useState("#3B82F6");
    const [newUrl, setNewUrl] = useState("");
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchTravelStyles();
    }, []);

    const fetchTravelStyles = async () => {
        try {
            const res = await fetch(`${api.baseURL}/travel-styles`);
            const data = await res.json();
            if (data.status === "success") {
                setTravelStyles(data.data.travelStyles);
            }
        } catch (err) {
            console.error("Error fetching travel styles:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStyle = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${api.baseURL}/travel-styles`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newStyleName.trim(),
                    shortDescription: newShortDescription.trim(),
                    icon: newIcon.trim() || undefined,
                    color: newColor,
                    url: newUrl.trim(),
                }),
                credentials: "include",
            });
            const data = await res.json();
            if (data.status === "success") {
                setNewStyleName("");
                setNewShortDescription("");
                setNewIcon("");
                setNewColor("#3B82F6");
                setNewUrl("");
                setIsModalOpen(false);
                fetchTravelStyles();
            } else {
                alert('Error creating travel style: ' + data.message);
            }
        } catch (err) {
            console.error("Error creating travel style:", err);
        }
    };

    const handleDelete = async (styleId: string, styleName: string) => {
        if (!confirm(`Are you sure you want to delete "${styleName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            setDeleteLoading(styleId);
            const res = await fetch(`${api.baseURL}/travel-styles/${styleId}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (res.status === 204) {
                setTravelStyles(travelStyles.filter((style) => style._id !== styleId));
                alert("Travel style deleted successfully!");
            } else {
                const data = await res.json();
                alert(`Failed to delete: ${data.message}`);
            }
        } catch (error) {
            console.error("Error deleting travel style:", error);
            alert("Failed to delete travel style. Please try again.");
        } finally {
            setDeleteLoading(null);
        }
    };

    const filteredStyles = travelStyles.filter((style) =>
        style.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                          <div className="h-10 bg-gray-200 rounded-md w-64"></div>
                        </div>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="p-4 border-b border-gray-100 flex items-center gap-4">
                                <div className="h-5 bg-gray-200 rounded-md w-48"></div>
                                <div className="h-5 bg-gray-200 rounded-md w-24"></div>
                                <div className="flex-1"></div>
                                <div className="h-8 bg-gray-200 rounded-md w-20"></div>
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
                <div className="px-8 h-16 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-zinc-800 leading-none">Travel Styles</h1>
                        <p className="text-gray-555 text-xs mt-1 leading-none">
                            Manage travel styles for your tours ({travelStyles.length} total)
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-900 text-white font-medium py-1.5 px-3 rounded-md shadow-sm transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Travel Style
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
                            placeholder="Search travel styles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm"
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

                {/* Table */}
                {filteredStyles.length === 0 ? (
                    <div className="bg-white rounded-md border border-gray-200 p-12 text-center shadow-sm">
                        <svg
                          className="w-12 h-12 text-gray-400 mx-auto mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                            />
                        </svg>
                        <h3 className="text-lg font-semibold text-zinc-800 mb-2">
                            {searchQuery ? "No travel styles found" : "No travel styles yet"}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchQuery
                                ? "Try adjusting your search query"
                                : "Get started by creating your first travel style"}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="inline-block bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2 px-6 rounded-md shadow-sm transition text-sm"
                            >
                                Add Travel Style
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            Travel Style
                                        </th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            Color
                                        </th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {filteredStyles.map((style) => (
                                        <tr key={style._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden"
                                                        style={{ backgroundColor: style.color || '#3B82F6' }}
                                                    >
                                                        {style.icon ? (
                                                            <img src={style.icon} alt={style.name} className="w-6 h-6 object-contain" />
                                                        ) : (
                                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <Link
                                                            href={`/admin/travel-styles/${style._id}`}
                                                            className="text-sm font-medium text-zinc-800 hover:text-zinc-900 hover:underline transition-colors"
                                                        >
                                                            {style.name}
                                                        </Link>
                                                        <p className="text-xs text-gray-500 truncate max-w-xs">
                                                            {style.shortDescription || "No description"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-4 h-4 rounded-full border border-gray-200"
                                                        style={{ backgroundColor: style.color || '#3B82F6' }}
                                                    ></div>
                                                    <span className="text-sm text-gray-500">{style.color || '#3B82F6'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-0.5 text-xs font-medium border rounded-md ${style.isActive
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                        : "bg-zinc-100 text-zinc-600 border-zinc-200"
                                                        }`}
                                                >
                                                    {style.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <Link
                                                        href={`/admin/travel-styles/${style._id}`}
                                                        className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(style._id, style.name)}
                                                        disabled={deleteLoading === style._id}
                                                        className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                                                        title="Delete"
                                                    >
                                                        {deleteLoading === style._id ? (
                                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"></circle>
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
                    </div>
                )}
            </div>

            {/* Add Travel Style Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-md shadow-lg w-full max-w-md overflow-hidden border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-zinc-800">Add Travel Style</h2>
                            <button onClick={() => { setIsModalOpen(false); setNewIcon(""); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreateStyle} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Travel Style Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={newStyleName}
                                    onChange={(e) => setNewStyleName(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm placeholder:text-gray-400"
                                    placeholder="e.g. Adventure, Luxury, Cultural"
                                />
                            </div>

                            {/* Icon Field */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Travel Style Icon</label>
                                <div className="flex items-center gap-3">
                                    {newIcon ? (
                                        <div className="relative w-12 h-12 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 group">
                                            <img src={newIcon} alt="Icon Preview" className="w-full h-full object-contain p-1" />
                                            <button
                                                type="button"
                                                onClick={() => setNewIcon("")}
                                                className="absolute inset-0 bg-black/50 text-white text-[10px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : null}
                                    <button
                                        type="button"
                                        onClick={() => setShowIconPicker(true)}
                                        className="px-3 py-2 bg-white border border-gray-300 text-zinc-700 hover:bg-gray-50 rounded-md transition text-xs font-medium shadow-sm cursor-pointer"
                                    >
                                        {newIcon ? "Change Icon" : "Select / Upload Icon"}
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={newIcon}
                                    onChange={(e) => setNewIcon(e.target.value)}
                                    className="w-full mt-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs focus:outline-none focus:border-zinc-400 transition placeholder:text-gray-400 text-zinc-700"
                                    placeholder="Or paste icon image URL..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Short Description</label>
                                <input
                                    type="text"
                                    value={newShortDescription}
                                    onChange={(e) => setNewShortDescription(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm placeholder:text-gray-400"
                                    placeholder="Brief summary for cards"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Brand Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={newColor}
                                        onChange={(e) => setNewColor(e.target.value)}
                                        className="h-9 w-12 rounded-md border border-gray-300 cursor-pointer shadow-sm"
                                    />
                                    <input
                                        type="text"
                                        value={newColor}
                                        onChange={(e) => setNewColor(e.target.value)}
                                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm uppercase placeholder:text-gray-400"
                                        placeholder="#3B82F6"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">URL</label>
                                <input
                                    type="text"
                                    value={newUrl}
                                    onChange={(e) => setNewUrl(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm placeholder:text-gray-400"
                                    placeholder="/travel-styles/classic"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => { setIsModalOpen(false); setNewIcon(""); }}
                                    className="px-4 py-2 text-zinc-700 hover:bg-gray-100 rounded-md border border-gray-300 transition-colors font-medium text-sm shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-zinc-900 text-white border border-zinc-900 rounded-md hover:bg-zinc-800 transition-colors font-medium text-sm shadow-sm"
                                >
                                    Create Travel Style
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ImagePickerModal
                isOpen={showIconPicker}
                onClose={() => setShowIconPicker(false)}
                onSelect={(urls) => {
                    if (urls.length > 0) setNewIcon(urls[0]);
                    setShowIconPicker(false);
                }}
                multiple={false}
                folder="travel-style-images"
            />
        </div>
    );
}
