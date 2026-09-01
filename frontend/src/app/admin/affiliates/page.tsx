"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

interface AffiliateUser {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    phone?: string;
}

interface Affiliate {
    _id: string;
    user: AffiliateUser;
    type: "affiliate" | "rep";
    companyName?: string;
    website?: string;
    socialMedia?: Record<string, string>;
    audienceSize?: string;
    niche?: string;
    whyJoin?: string;
    country?: string;
    status: "pending" | "approved" | "rejected" | "suspended";
    affiliateCode?: string;
    commissionRate: number;
    tier: string;
    stats: {
        totalClicks: number;
        totalSignups: number;
        totalBookings: number;
        totalRevenue: number;
        totalCommissionEarned: number;
        totalCommissionPaid: number;
        conversionRate: number;
    };
    payouts: Array<{
        amount: number;
        method: string;
        status: string;
        paidAt?: string;
        transactionId?: string;
        notes?: string;
    }>;
    createdAt: string;
    approvedAt?: string;
    rejectionReason?: string;
}

interface AggregateStats {
    statusCounts: Array<{ _id: string; count: number }>;
    totals: Array<{
        totalAffiliates: number;
        totalRevenue: number;
        totalCommissionEarned: number;
        totalCommissionPaid: number;
        totalBookings: number;
        totalClicks: number;
    }>;
    tierCounts: Array<{ _id: string; count: number }>;
}

const audienceLabels: Record<string, string> = {
    under_1k: "Under 1K",
    "1k_5k": "1K – 5K",
    "5k_10k": "5K – 10K",
    "10k_50k": "10K – 50K",
    "50k_100k": "50K – 100K",
    "100k_500k": "100K – 500K",
    "500k_plus": "500K+",
};

export default function AdminAffiliatesPage() {
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [stats, setStats] = useState<AggregateStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
    const [actionLoading, setActionLoading] = useState("");
    const [payoutAmount, setPayoutAmount] = useState("");
    const [payoutMethod, setPayoutMethod] = useState("manual");
    const [payoutNotes, setPayoutNotes] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [commissionRate, setCommissionRate] = useState("");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const headers: Record<string, string> = {};
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const [affiliatesRes, statsRes] = await Promise.all([
                fetch(`${api.baseURL}${api.endpoints.affiliates.getAll}${statusFilter ? `?status=${statusFilter}` : ""}`, {
                    headers,
                    credentials: "include",
                }),
                fetch(`${api.baseURL}${api.endpoints.affiliates.stats}`, {
                    headers,
                    credentials: "include",
                }),
            ]);

            const affiliatesData = await affiliatesRes.json();
            const statsData = await statsRes.json();

            if (affiliatesData.status === "success") setAffiliates(affiliatesData.data.affiliates || []);
            if (statsData.status === "success") setStats(statsData.data.stats || null);
        } catch (err) {
            console.error("Failed to fetch affiliates:", err);
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAction = async (action: string, affiliateId: string, body?: Record<string, unknown>) => {
        setActionLoading(action);
        try {
            const token = localStorage.getItem("token");
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const url = action === "approve"
                ? `${api.baseURL}${api.endpoints.affiliates.approve(affiliateId)}`
                : action === "reject"
                    ? `${api.baseURL}${api.endpoints.affiliates.reject(affiliateId)}`
                    : action === "suspend"
                        ? `${api.baseURL}${api.endpoints.affiliates.suspend(affiliateId)}`
                        : action === "commission"
                            ? `${api.baseURL}${api.endpoints.affiliates.updateCommission(affiliateId)}`
                            : `${api.baseURL}${api.endpoints.affiliates.payout(affiliateId)}`;

            const method = action === "payout" ? "POST" : "PATCH";
            const res = await fetch(url, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
                credentials: "include",
            });
            const data = await res.json();
            if (data.status === "success") {
                await fetchData();
                setSelectedAffiliate(null);
                setPayoutAmount("");
                setPayoutNotes("");
                setRejectionReason("");
                setCommissionRate("");
            } else {
                alert(data.message || "Action failed");
            }
        } catch {
            alert("Network error. Failed to execute action.");
        } finally {
            setActionLoading("");
        }
    };

    const getStatusCount = (status: string) => {
        return stats?.statusCounts?.find(s => s._id === status)?.count || 0;
    };

    const totals = stats?.totals?.[0] || {
        totalAffiliates: 0,
        totalRevenue: 0,
        totalCommissionEarned: 0,
        totalCommissionPaid: 0,
        totalBookings: 0,
        totalClicks: 0,
    };

    const formatCurrency = (n: number) => `$${(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved":
                return { label: "Approved", className: "bg-emerald-50 text-emerald-700 border-emerald-100", dotClass: "bg-emerald-500" };
            case "pending":
                return { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-100", dotClass: "bg-amber-500" };
            case "rejected":
                return { label: "Rejected", className: "bg-red-50 text-red-700 border-red-100", dotClass: "bg-red-500" };
            case "suspended":
                return { label: "Suspended", className: "bg-zinc-100 text-zinc-600 border-zinc-200", dotClass: "bg-zinc-400" };
            default:
                return { label: status, className: "bg-zinc-100 text-zinc-600 border-zinc-200", dotClass: "bg-zinc-400" };
        }
    };

    const getTierBadge = (tier: string) => {
        switch (tier?.toLowerCase()) {
            case "platinum":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "gold":
                return "bg-amber-50 text-amber-800 border-amber-200";
            case "silver":
                return "bg-zinc-100 text-zinc-700 border-zinc-200";
            default:
                return "bg-orange-50 text-orange-700 border-orange-200";
        }
    };

    const filteredAffiliates = affiliates.filter((aff) => {
        const query = searchQuery.toLowerCase();
        const nameMatch = aff.user?.name?.toLowerCase().includes(query) || false;
        const emailMatch = aff.user?.email?.toLowerCase().includes(query) || false;
        const codeMatch = aff.affiliateCode?.toLowerCase().includes(query) || false;
        const companyMatch = aff.companyName?.toLowerCase().includes(query) || false;
        return nameMatch || emailMatch || codeMatch || companyMatch;
    });

    if (loading && affiliates.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white border-b border-gray-200">
                    <div className="px-8 py-6">
                        <div className="h-7 bg-gray-200 rounded-md w-48 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded-md w-64 animate-pulse"></div>
                    </div>
                </div>
                <div className="p-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-24 bg-white rounded-md border border-gray-200 animate-pulse p-4"></div>
                        ))}
                    </div>
                    <div className="bg-white rounded-md border border-gray-200 animate-pulse p-6 space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-14 bg-gray-100 rounded-md animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12 font-sans">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="px-8 h-16 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-zinc-800 leading-none">Affiliate Partners</h1>
                        <p className="text-gray-500 text-xs mt-1 leading-none">
                            Manage affiliate applications, commission tracking & payouts ({affiliates.length} total)
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 border border-zinc-200 rounded-md text-xs font-medium text-zinc-700">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Active Program
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-md border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Affiliates</span>
                            <span className="p-1.5 bg-zinc-100 rounded text-zinc-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-zinc-800 mt-2">{totals.totalAffiliates}</p>
                        <p className="text-xs text-gray-500 mt-1">{getStatusCount("approved")} approved, {getStatusCount("pending")} pending</p>
                    </div>

                    <div className={`rounded-md border p-5 shadow-sm ${getStatusCount("pending") > 0 ? "bg-amber-50/70 border-amber-200" : "bg-white border-gray-200"}`}>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pending Review</span>
                            <span className="p-1.5 bg-amber-100 text-amber-700 rounded">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-zinc-800 mt-2">{getStatusCount("pending")}</p>
                        <p className="text-xs text-amber-700 font-medium mt-1">{getStatusCount("pending") > 0 ? "Needs attention" : "All reviewed"}</p>
                    </div>

                    <div className="bg-white rounded-md border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Commission Earned</span>
                            <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-zinc-800 mt-2">{formatCurrency(totals.totalCommissionEarned)}</p>
                        <p className="text-xs text-gray-500 mt-1">From {formatCurrency(totals.totalRevenue)} tour revenue</p>
                    </div>

                    <div className="bg-white rounded-md border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pending Payout</span>
                            <span className="p-1.5 bg-zinc-100 text-zinc-700 rounded">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-emerald-600 mt-2">
                            {formatCurrency(totals.totalCommissionEarned - totals.totalCommissionPaid)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{formatCurrency(totals.totalCommissionPaid)} already paid out</p>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md w-full">
                        <input
                            type="text"
                            placeholder="Search by name, email, code or company..."
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

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                        {[
                            { label: "All", value: "" },
                            { label: `Pending (${getStatusCount("pending")})`, value: "pending" },
                            { label: `Approved (${getStatusCount("approved")})`, value: "approved" },
                            { label: `Rejected (${getStatusCount("rejected")})`, value: "rejected" },
                            { label: `Suspended (${getStatusCount("suspended")})`, value: "suspended" },
                        ].map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setStatusFilter(tab.value)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${statusFilter === tab.value
                                    ? "bg-zinc-900 border-zinc-900 text-white shadow-sm"
                                    : "bg-white border-gray-300 text-zinc-700 hover:bg-gray-50"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Affiliates List Table */}
                {filteredAffiliates.length === 0 ? (
                    <div className="bg-white rounded-md border border-gray-200 p-12 text-center shadow-sm">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-zinc-800 mb-1">No affiliates found</h3>
                        <p className="text-gray-500 text-xs">
                            {searchQuery ? "Try refining your search keyword" : "New applications will appear here once submitted"}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Partner</th>
                                        <th className="px-6 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Code</th>
                                        <th className="px-6 py-3.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Rate</th>
                                        <th className="px-6 py-3.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Bookings</th>
                                        <th className="px-6 py-3.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Earned</th>
                                        <th className="px-6 py-3.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pending</th>
                                        <th className="px-6 py-3.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {filteredAffiliates.map((aff) => {
                                        const status = getStatusBadge(aff.status);
                                        const pendingCommission = (aff.stats?.totalCommissionEarned || 0) - (aff.stats?.totalCommissionPaid || 0);

                                        return (
                                            <tr key={aff._id} className="hover:bg-gray-50/50 transition-colors">
                                                {/* Partner */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-md flex items-center justify-center bg-zinc-100 text-zinc-700 border border-zinc-200 font-bold text-xs shadow-sm flex-shrink-0">
                                                            {aff.user?.name ? aff.user.name.charAt(0).toUpperCase() : "A"}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-zinc-800 text-sm">
                                                                {aff.user?.name || "Unknown"}
                                                            </div>
                                                            <div className="text-xs text-gray-400">
                                                                {aff.companyName ? `${aff.companyName} • ` : ""}{aff.user?.email || "No email"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Type */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200 capitalize">
                                                        {aff.type === "affiliate" ? "Organization" : "Individual Rep"}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2 py-0.5 border rounded-md text-xs font-medium ${status.className}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status.dotClass}`} />
                                                        {status.label}
                                                    </span>
                                                </td>

                                                {/* Code */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {aff.affiliateCode ? (
                                                        <span className="font-mono text-xs font-bold text-zinc-800 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded">
                                                            {aff.affiliateCode}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">Not assigned</span>
                                                    )}
                                                </td>

                                                {/* Rate */}
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium text-zinc-700">
                                                    <span className="inline-block px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-100 font-bold">
                                                        {aff.commissionRate}%
                                                    </span>
                                                </td>

                                                {/* Bookings */}
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-xs text-zinc-600">
                                                    <span className="font-semibold text-zinc-800">{aff.stats?.totalBookings || 0}</span>
                                                    <span className="text-gray-400 text-[11px] ml-1">({aff.stats?.totalClicks || 0} clicks)</span>
                                                </td>

                                                {/* Earned */}
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold text-zinc-800">
                                                    {formatCurrency(aff.stats?.totalCommissionEarned || 0)}
                                                </td>

                                                {/* Pending */}
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-bold text-emerald-600">
                                                    {formatCurrency(pendingCommission)}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex justify-end gap-1.5">
                                                        <button
                                                            onClick={() => setSelectedAffiliate(aff)}
                                                            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
                                                            title="View Details & Manage"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </button>

                                                        {aff.status === "pending" && (
                                                            <button
                                                                onClick={() => handleAction("approve", aff._id)}
                                                                disabled={actionLoading === "approve"}
                                                                className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                                                                title="Quick Approve"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </button>
                                                        )}
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

            {/* Modal Detail / Management */}
            {selectedAffiliate && (
                <div className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-md w-full max-w-2xl shadow-lg border border-gray-200 max-h-[90vh] overflow-y-auto transform transition-all scale-100">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold text-zinc-800">
                                        {selectedAffiliate.user?.name || "Affiliate Details"}
                                    </h2>
                                    <span className={`inline-flex items-center px-2 py-0.5 border rounded-md text-xs font-medium ${getStatusBadge(selectedAffiliate.status).className}`}>
                                        {getStatusBadge(selectedAffiliate.status).label}
                                    </span>
                                    {selectedAffiliate.tier && selectedAffiliate.status === "approved" && (
                                        <span className={`inline-flex items-center px-2 py-0.5 border rounded-md text-xs font-semibold uppercase ${getTierBadge(selectedAffiliate.tier)}`}>
                                            {selectedAffiliate.tier}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">{selectedAffiliate.user?.email}</p>
                            </div>
                            <button
                                onClick={() => setSelectedAffiliate(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Profile Details Grid */}
                            <div>
                                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Partner Information</h3>
                                <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-4 rounded-md border border-gray-200">
                                    <div>
                                        <span className="text-gray-400 block mb-0.5">Partner Type</span>
                                        <span className="font-semibold text-zinc-800 capitalize">
                                            {selectedAffiliate.type === "affiliate" ? "Organization / Company" : "Individual Rep"}
                                        </span>
                                    </div>
                                    {selectedAffiliate.companyName && (
                                        <div>
                                            <span className="text-gray-400 block mb-0.5">Company Name</span>
                                            <span className="font-semibold text-zinc-800">{selectedAffiliate.companyName}</span>
                                        </div>
                                    )}
                                    {selectedAffiliate.website && (
                                        <div>
                                            <span className="text-gray-400 block mb-0.5">Website</span>
                                            <a href={selectedAffiliate.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                                                {selectedAffiliate.website}
                                            </a>
                                        </div>
                                    )}
                                    {selectedAffiliate.audienceSize && (
                                        <div>
                                            <span className="text-gray-400 block mb-0.5">Audience Size</span>
                                            <span className="font-semibold text-zinc-800">
                                                {audienceLabels[selectedAffiliate.audienceSize] || selectedAffiliate.audienceSize}
                                            </span>
                                        </div>
                                    )}
                                    {selectedAffiliate.niche && (
                                        <div>
                                            <span className="text-gray-400 block mb-0.5">Target Niche</span>
                                            <span className="font-semibold text-zinc-800">{selectedAffiliate.niche}</span>
                                        </div>
                                    )}
                                    {selectedAffiliate.country && (
                                        <div>
                                            <span className="text-gray-400 block mb-0.5">Country</span>
                                            <span className="font-semibold text-zinc-800">{selectedAffiliate.country}</span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-400 block mb-0.5">Applied Date</span>
                                        <span className="font-semibold text-zinc-800">
                                            {new Date(selectedAffiliate.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {selectedAffiliate.affiliateCode && (
                                        <div>
                                            <span className="text-gray-400 block mb-0.5">Affiliate Tracking Code</span>
                                            <span className="font-mono font-bold text-zinc-800">{selectedAffiliate.affiliateCode}</span>
                                        </div>
                                    )}
                                </div>

                                {selectedAffiliate.whyJoin && (
                                    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Motivation / Strategy</span>
                                        <p className="text-xs text-zinc-700 leading-relaxed">{selectedAffiliate.whyJoin}</p>
                                    </div>
                                )}

                                {selectedAffiliate.socialMedia && Object.entries(selectedAffiliate.socialMedia).some(([, v]) => v) && (
                                    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-2">Social Channels</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {Object.entries(selectedAffiliate.socialMedia).filter(([, v]) => v).map(([platform, link]) => (
                                                <a
                                                    key={platform}
                                                    href={link.startsWith("http") ? link : `https://${link}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center px-2 py-1 bg-white border border-gray-300 rounded text-xs font-medium text-zinc-700 hover:bg-gray-50 transition"
                                                >
                                                    <span className="capitalize">{platform}:</span>&nbsp;<span className="text-blue-600">{link}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Performance Numbers */}
                            {selectedAffiliate.status === "approved" && (
                                <div>
                                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Performance Metrics</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-center">
                                            <span className="text-xs text-gray-400 block">Total Clicks</span>
                                            <span className="text-lg font-bold text-zinc-800">{selectedAffiliate.stats?.totalClicks || 0}</span>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-center">
                                            <span className="text-xs text-gray-400 block">Total Bookings</span>
                                            <span className="text-lg font-bold text-zinc-800">{selectedAffiliate.stats?.totalBookings || 0}</span>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-center">
                                            <span className="text-xs text-gray-400 block">Conv. Rate</span>
                                            <span className="text-lg font-bold text-zinc-800">
                                                {(selectedAffiliate.stats?.conversionRate || 0).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-center">
                                            <span className="text-xs text-gray-400 block">Revenue Generated</span>
                                            <span className="text-lg font-bold text-zinc-800">{formatCurrency(selectedAffiliate.stats?.totalRevenue || 0)}</span>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-center">
                                            <span className="text-xs text-gray-400 block">Total Earned</span>
                                            <span className="text-lg font-bold text-zinc-800">{formatCurrency(selectedAffiliate.stats?.totalCommissionEarned || 0)}</span>
                                        </div>
                                        <div className="bg-emerald-50 p-3 rounded-md border border-emerald-200 text-center">
                                            <span className="text-xs text-emerald-600 block">Unpaid Commission</span>
                                            <span className="text-lg font-bold text-emerald-700">
                                                {formatCurrency((selectedAffiliate.stats?.totalCommissionEarned || 0) - (selectedAffiliate.stats?.totalCommissionPaid || 0))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Actions Area */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Management Actions</h3>

                                {/* Pending Review Action */}
                                {selectedAffiliate.status === "pending" && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleAction("approve", selectedAffiliate._id)}
                                                disabled={actionLoading === "approve"}
                                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {actionLoading === "approve" ? "Approving..." : "Approve Application"}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (rejectionReason || confirm("Reject this application without a detailed reason?")) {
                                                        handleAction("reject", selectedAffiliate._id, { reason: rejectionReason });
                                                    }
                                                }}
                                                disabled={actionLoading === "reject"}
                                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                {actionLoading === "reject" ? "Rejecting..." : "Reject Application"}
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="Optional rejection reason to send via email..."
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition"
                                        />
                                    </div>
                                )}

                                {/* Approved Affiliate Actions */}
                                {selectedAffiliate.status === "approved" && (
                                    <div className="space-y-4">
                                        {/* Commission Rate Config */}
                                        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                                            <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
                                                Update Commission Rate (Currently {selectedAffiliate.commissionRate}%)
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={commissionRate}
                                                    onChange={(e) => setCommissionRate(e.target.value)}
                                                    placeholder={`e.g. 7.5`}
                                                    min="0"
                                                    max="50"
                                                    step="0.5"
                                                    className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500"
                                                />
                                                <button
                                                    onClick={() => commissionRate && handleAction("commission", selectedAffiliate._id, { commissionRate: parseFloat(commissionRate) })}
                                                    disabled={!commissionRate || actionLoading === "commission"}
                                                    className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-1.5 px-3 rounded-md text-xs transition disabled:opacity-50 cursor-pointer"
                                                >
                                                    {actionLoading === "commission" ? "Saving..." : "Update Rate"}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Process Payout */}
                                        <div className="bg-emerald-50/60 border border-emerald-200 rounded-md p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-xs font-bold text-emerald-900">
                                                    Process Commission Payout
                                                </label>
                                                <span className="text-xs text-emerald-700 font-semibold">
                                                    Pending: {formatCurrency((selectedAffiliate.stats?.totalCommissionEarned || 0) - (selectedAffiliate.stats?.totalCommissionPaid || 0))}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                                                <input
                                                    type="number"
                                                    value={payoutAmount}
                                                    onChange={(e) => setPayoutAmount(e.target.value)}
                                                    placeholder="Payout Amount ($)"
                                                    min="0"
                                                    step="0.01"
                                                    className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                                />
                                                <select
                                                    value={payoutMethod}
                                                    onChange={(e) => setPayoutMethod(e.target.value)}
                                                    className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs focus:outline-none cursor-pointer"
                                                >
                                                    <option value="manual">Manual Transfer</option>
                                                    <option value="bank_transfer">Bank Transfer</option>
                                                    <option value="paypal">PayPal</option>
                                                    <option value="stripe">Stripe</option>
                                                </select>
                                                <button
                                                    onClick={() => payoutAmount && handleAction("payout", selectedAffiliate._id, { amount: parseFloat(payoutAmount), method: payoutMethod, notes: payoutNotes })}
                                                    disabled={!payoutAmount || actionLoading === "payout"}
                                                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-1.5 px-3 rounded-md text-xs transition disabled:opacity-50 cursor-pointer"
                                                >
                                                    {actionLoading === "payout" ? "Processing..." : "Record Payout"}
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                value={payoutNotes}
                                                onChange={(e) => setPayoutNotes(e.target.value)}
                                                placeholder="Optional transaction reference or note..."
                                                className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs focus:outline-none"
                                            />
                                        </div>

                                        {/* Suspend Action */}
                                        <button
                                            onClick={() => confirm("Are you sure you want to suspend this affiliate account?") && handleAction("suspend", selectedAffiliate._id)}
                                            disabled={actionLoading === "suspend"}
                                            className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-700 font-medium rounded-md text-xs transition cursor-pointer disabled:opacity-50"
                                        >
                                            {actionLoading === "suspend" ? "Suspending..." : "Suspend Affiliate Account"}
                                        </button>
                                    </div>
                                )}

                                {/* Suspended Affiliate Action */}
                                {selectedAffiliate.status === "suspended" && (
                                    <button
                                        onClick={() => handleAction("approve", selectedAffiliate._id)}
                                        disabled={actionLoading === "approve"}
                                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md text-xs transition cursor-pointer disabled:opacity-50"
                                    >
                                        {actionLoading === "approve" ? "Reactivating..." : "Reactivate Affiliate"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
