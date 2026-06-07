"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Interest {
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

export default function InterestsPage() {
    const [interests, setInterests] = useState<Interest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newInterestName, setNewInterestName] = useState("");
    const [newShortDescription, setNewShortDescription] = useState("");
    const [newColor, setNewColor] = useState("#3B82F6");
    const [newUrl, setNewUrl] = useState("");
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchInterests();
    }, []);

    const fetchInterests = async () => {
        try {
            const res = await fetch(`${api.baseURL}${api.endpoints.interests.getAll}`);
            const data = await res.json();
            if (data.status === "success") {
                setInterests(data.data.interests);
            }
        } catch (err) {
            console.error("Error fetching interests:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateInterest = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${api.baseURL}${api.endpoints.interests.create}`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newInterestName,
                    shortDescription: newShortDescription,
                    color: newColor,
                    url: newUrl,
                })
            });
            const data = await res.json();
            if (data.status === "success") {
                setNewInterestName("");
                setNewShortDescription("");
                setNewColor("#3B82F6");
                setNewUrl("");
                setIsModalOpen(false);
                fetchInterests();
            } else {
                alert('Error creating interest: ' + data.message);
            }
        } catch (err) {
            console.error("Error creating interest:", err);
        }
    };

    const handleDelete = async (interestId: string, interestName: string) => {
        if (!confirm(`Are you sure you want to delete "${interestName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            setDeleteLoading(interestId);
            const token = localStorage.getItem("token");
            const res = await fetch(`${api.baseURL}${api.endpoints.interests.delete(interestId)}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.status === 204) {
                setInterests(interests.filter((interest) => interest._id !== interestId));
                alert("Interest deleted successfully!");
            } else {
                const data = await res.json();
                alert(`Failed to delete: ${data.message}`);
            }
        } catch (error) {
            console.error("Error deleting interest:", error);
            alert("Failed to delete interest. Please try again.");
        } finally {
            setDeleteLoading(null);
        }
    };

    const filteredInterests = interests.filter((interest) =>
        interest.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                        <h1 className="text-2xl font-bold text-[#3F3F42]">Interests</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Manage interests for your tours ({interests.length} total)
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Interest
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
                            placeholder="Search interests..."
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

                {/* Interests List */}
                {filteredInterests.length === 0 ? (
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
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                        </svg>
                        <h3 className="text-lg font-semibold text-[#3F3F42] mb-2">
                            {searchQuery ? "No interests found" : "No interests yet"}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchQuery
                                ? "Try adjusting your search query"
                                : "Get started by creating your first interest"}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition"
                            >
                                Add Interest
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Interest
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
                                {filteredInterests.map((interest) => (
                                    <tr key={interest._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                                    style={{ backgroundColor: interest.color || '#3B82F6' }}
                                                >
                                                    {interest.icon ? (
                                                        <img src={interest.icon} alt={interest.name} className="w-5 h-5" />
                                                    ) : (
                                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div>
                                                    <Link
                                                        href={`/admin/interests/${interest._id}`}
                                                        className="text-sm font-medium text-[#3F3F42] hover:text-blue-600 transition-colors"
                                                    >
                                                        {interest.name}
                                                    </Link>
                                                    <p className="text-xs text-gray-500 truncate max-w-xs">
                                                        {interest.shortDescription || "No description"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-4 h-4 rounded-full border border-gray-200"
                                                    style={{ backgroundColor: interest.color || '#3B82F6' }}
                                                ></div>
                                                <span className="text-sm text-gray-500">{interest.color || '#3B82F6'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2.5 py-1 text-xs font-medium rounded-full ${interest.isActive
                                                    ? "bg-green-50 text-green-700"
                                                    : "bg-gray-100 text-gray-600"
                                                    }`}
                                            >
                                                {interest.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/admin/interests/${interest._id}`}
                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(interest._id, interest.name)}
                                                    disabled={deleteLoading === interest._id}
                                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Delete"
                                                >
                                                    {deleteLoading === interest._id ? (
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

             {/* Add Interest Modal */}
             {isModalOpen && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3F3F42]/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                     <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                         <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                             <h2 className="text-lg font-bold text-[#3F3F42]">Add Interest</h2>
                             <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                             </button>
                         </div>
                         <form onSubmit={handleCreateInterest} className="p-6 space-y-4">
                             <div>
                                 <label className="block text-sm font-medium text-[#3F3F42] mb-1">Interest Name <span className="text-red-500">*</span></label>
                                 <input
                                     type="text"
                                     required
                                     value={newInterestName}
                                     onChange={(e) => setNewInterestName(e.target.value)}
                                     className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                                     placeholder="e.g. Wildlife, Hiking, Cultural, Food"
                                 />
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-[#3F3F42] mb-1">Short Description</label>
                                 <input
                                     type="text"
                                     value={newShortDescription}
                                     onChange={(e) => setNewShortDescription(e.target.value)}
                                     className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                     placeholder="Brief summary for cards"
                                 />
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-[#3F3F42] mb-1">Brand Color</label>
                                 <div className="flex items-center gap-3">
                                     <input
                                         type="color"
                                         value={newColor}
                                         onChange={(e) => setNewColor(e.target.value)}
                                         className="h-10 w-12 rounded-md border border-gray-200 cursor-pointer"
                                     />
                                     <input
                                         type="text"
                                         value={newColor}
                                         onChange={(e) => setNewColor(e.target.value)}
                                         className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition uppercase"
                                         placeholder="#3B82F6"
                                     />
                                 </div>
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-[#3F3F42] mb-1">URL</label>
                                 <input
                                     type="text"
                                     value={newUrl}
                                     onChange={(e) => setNewUrl(e.target.value)}
                                     className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                     placeholder="/interests/wildlife"
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
                                     Create Interest
                                 </button>
                             </div>
                         </form>
                     </div>
                 </div>
             )}
         </div>
     );
}
