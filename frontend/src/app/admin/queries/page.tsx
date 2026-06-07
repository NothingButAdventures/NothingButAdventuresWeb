"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface QueryItem {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    preferredDestination?: string;
    travelDates?: string;
    numberOfTravelers?: string;
    dreamTripDetails: string;
    status: string;
    createdAt: string;
}

export default function QueriesManagementPage() {
    const [queries, setQueries] = useState<QueryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchQueries();
    }, []);

    const fetchQueries = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${api.baseURL}/queries`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setQueries(data.data.queries);
            }
        } catch (error) {
            console.error("Error fetching queries:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            setUpdatingId(id);
            const token = localStorage.getItem("token");

            const response = await fetch(`${api.baseURL}/queries/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                setQueries(queries.map((q) => (q._id === id ? { ...q, status: newStatus } : q)));
            } else {
                const data = await response.json();
                alert(`Failed to update status: ${data.message}`);
            }
        } catch (error) {
            console.error("Error updating query status:", error);
            alert("Failed to update status. Please try again.");
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredQueries = queries.filter(
        (q) =>
            q.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.preferredDestination?.toLowerCase().includes(searchQuery.toLowerCase())
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
                                <div className="h-5 bg-gray-200 rounded w-32"></div>
                                <div className="flex-1"></div>
                                <div className="h-8 bg-gray-200 rounded w-24"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200">
                <div className="px-8 py-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[#3F3F42]">User Inquiries (Queries)</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Manage custom trip inquiries ({queries.length} total)
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-8">
                <div className="mb-6 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search by name, email or destination..."
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {filteredQueries.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-[#3F3F42] mb-2">
                            {searchQuery ? "No queries found" : "No queries yet"}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchQuery ? "Try adjusting your search query" : "User trip inquiries will appear here"}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User Details</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trip Details</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Message</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {filteredQueries.map((q) => (
                                    <tr key={q._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-[#3F3F42]">{q.fullName}</div>
                                                <div className="text-xs text-blue-600 mt-0.5">{q.email}</div>
                                                {q.phoneNumber && <div className="text-xs text-gray-500 mt-0.5">{q.phoneNumber}</div>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-[#3F3F42]">
                                                {q.preferredDestination && <div><span className="font-semibold text-gray-600">To:</span> {q.preferredDestination}</div>}
                                                {q.travelDates && <div className="mt-0.5"><span className="font-semibold text-gray-600">When:</span> {q.travelDates}</div>}
                                                {q.numberOfTravelers && <div className="mt-0.5"><span className="font-semibold text-gray-600">Pax:</span> {q.numberOfTravelers}</div>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-[#3F3F42] max-w-xs break-words line-clamp-3" title={q.dreamTripDetails}>
                                                {q.dreamTripDetails}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-[#3F3F42]">
                                                {new Date(q.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {updatingId === q._id ? (
                                                <span className="text-sm text-gray-500 italic">Updating...</span>
                                            ) : (
                                                <select
                                                    value={q.status}
                                                    onChange={(e) => updateStatus(q._id, e.target.value)}
                                                    className={`text-sm px-3 py-1.5 rounded-full font-medium focus:outline-none appearance-none cursor-pointer border-r-8 border-transparent pr-4 ${q.status === 'resolved' ? 'bg-green-100 text-green-700 border-green-100' :
                                                            q.status === 'in-progress' ? 'bg-orange-100 text-orange-700 border-orange-100' :
                                                                'bg-gray-100 text-[#3F3F42] border-gray-100'
                                                        }`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="in-progress">In Progress</option>
                                                    <option value="resolved">Resolved</option>
                                                </select>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
