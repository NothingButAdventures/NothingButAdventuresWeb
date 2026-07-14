"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Search, ShieldCheck, UserCheck, UserX, RefreshCw } from "lucide-react";

type UserRole = "user" | "admin" | "partner" | "copywriter";

interface AdminUser {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    nationality?: string;
    isEmailVerified?: boolean;
    isActive?: boolean;
    walletBalance?: number;
    createdAt: string;
}

interface UsersStatsResponse {
    usersByRole: Array<{ _id: string; count: number }>;
    totalUsers: number;
    totalBookings: number;
    totalReviews: number;
}

const PAGE_SIZE = 12;

const roleOptions: Array<{ value: UserRole; label: string }> = [
    { value: "user", label: "User" },
    { value: "admin", label: "Admin" },
    { value: "partner", label: "Partner" },
    { value: "copywriter", label: "Copywriter" },
];

export default function UsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [stats, setStats] = useState<UsersStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [verificationFilter, setVerificationFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [updatingRoleUserId, setUpdatingRoleUserId] = useState<string | null>(null);
    const [updatingStatusUserId, setUpdatingStatusUserId] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    useEffect(() => {
        void loadData();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [searchQuery, roleFilter, statusFilter, verificationFilter]);

    const authHeaders = () => {
        const token = localStorage.getItem("token");
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    };

    const loadData = async (silent = false) => {
        try {
            if (silent) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError("");

            const usersPromise = fetch(
                `${api.baseURL}${api.endpoints.users.getAllAdmin}?limit=500&sort=-createdAt&fields=name,email,role,phone,nationality,isEmailVerified,walletBalance,createdAt,+isActive`,
                { headers: authHeaders() }
            );

            const statsPromise = fetch(
                `${api.baseURL}${api.endpoints.users.getStats}`,
                { headers: authHeaders() }
            );

            const [usersRes, statsRes] = await Promise.all([usersPromise, statsPromise]);

            if (!usersRes.ok) {
                throw new Error("Failed to load users.");
            }

            const usersData = await usersRes.json();
            setUsers(usersData?.data?.users || []);

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData?.data || null);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unable to fetch user data.";
            setError(message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRoleUpdate = async (userId: string, role: UserRole) => {
        try {
            setUpdatingRoleUserId(userId);
            setError("");
            setNotice("");

            const response = await fetch(
                `${api.baseURL}${api.endpoints.users.updateById(userId)}`,
                {
                    method: "PATCH",
                    headers: authHeaders(),
                    body: JSON.stringify({ role }),
                }
            );

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data?.message || "Failed to update role.");
            }

            setUsers((prev) =>
                prev.map((u) => (u._id === userId ? { ...u, role } : u))
            );

            if (selectedUser?._id === userId) {
                setSelectedUser({ ...selectedUser, role });
            }

            setNotice("User role updated successfully.");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update role.";
            setError(message);
        } finally {
            setUpdatingRoleUserId(null);
        }
    };

    const handleToggleStatus = async (user: AdminUser) => {
        const currentlyActive = user.isActive !== false;
        const actionLabel = currentlyActive ? "deactivate" : "reactivate";

        if (!confirm(`Are you sure you want to ${actionLabel} ${user.name}?`)) {
            return;
        }

        try {
            setUpdatingStatusUserId(user._id);
            setError("");
            setNotice("");

            if (currentlyActive) {
                const response = await fetch(
                    `${api.baseURL}${api.endpoints.users.deactivateById(user._id)}`,
                    {
                        method: "DELETE",
                        headers: authHeaders(),
                    }
                );

                if (!response.ok) {
                    const data = await response.json().catch(() => ({}));
                    throw new Error(data?.message || "Failed to deactivate user.");
                }
            } else {
                const response = await fetch(
                    `${api.baseURL}${api.endpoints.users.updateById(user._id)}`,
                    {
                        method: "PATCH",
                        headers: authHeaders(),
                        body: JSON.stringify({ isActive: true }),
                    }
                );

                if (!response.ok) {
                    const data = await response.json().catch(() => ({}));
                    throw new Error(data?.message || "Failed to reactivate user.");
                }
            }

            setUsers((prev) =>
                prev.map((u) =>
                    u._id === user._id ? { ...u, isActive: !currentlyActive } : u
                )
            );

            if (selectedUser?._id === user._id) {
                setSelectedUser({ ...selectedUser, isActive: !currentlyActive });
            }

            setNotice(`User ${currentlyActive ? "deactivated" : "reactivated"} successfully.`);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update user status.";
            setError(message);
        } finally {
            setUpdatingStatusUserId(null);
        }
    };

    const filteredUsers = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return users.filter((user) => {
            const active = user.isActive !== false;
            const verified = Boolean(user.isEmailVerified);

            const matchesSearch =
                !query ||
                user.name?.toLowerCase().includes(query) ||
                user.email?.toLowerCase().includes(query) ||
                user.phone?.toLowerCase().includes(query) ||
                user.nationality?.toLowerCase().includes(query);

            const matchesRole = roleFilter === "all" || user.role === roleFilter;
            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && active) ||
                (statusFilter === "inactive" && !active);
            const matchesVerification =
                verificationFilter === "all" ||
                (verificationFilter === "verified" && verified) ||
                (verificationFilter === "unverified" && !verified);

            return matchesSearch && matchesRole && matchesStatus && matchesVerification;
        });
    }, [users, searchQuery, roleFilter, statusFilter, verificationFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const paginatedUsers = filteredUsers.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE
    );

    const roleCounts = useMemo(() => {
        const fallback = users.reduce<Record<string, number>>((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, {});

        if (!stats?.usersByRole?.length) {
            return fallback;
        }

        return stats.usersByRole.reduce<Record<string, number>>((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});
    }, [stats, users]);

    const activeUsersCount = users.filter((u) => u.isActive !== false).length;
    const verifiedUsersCount = users.filter((u) => Boolean(u.isEmailVerified)).length;

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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-md border border-gray-200 p-6 animate-pulse">
                                <div className="h-10 w-10 rounded-md bg-gray-100 mb-3"></div>
                                <div className="h-7 w-14 bg-gray-200 rounded-md mb-2"></div>
                                <div className="h-4 w-32 bg-gray-200 rounded-md"></div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-white rounded-md border border-gray-200 animate-pulse p-6 h-[460px]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200">
                <div className="px-8 h-16 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-zinc-800 leading-none">Users Management</h1>
                        <p className="text-gray-550 text-xs mt-1 leading-none">
                            Manage roles, status, and verification for all platform users
                        </p>
                    </div>
                    <button
                        onClick={() => void loadData(true)}
                        disabled={refreshing}
                        className="bg-white border border-gray-300 hover:bg-gray-50 text-zinc-700 font-semibold py-1.5 px-3 rounded-md transition inline-flex items-center gap-1.5 disabled:opacity-60 text-xs shadow-sm cursor-pointer"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="p-8">
                {(error || notice) && (
                    <div
                        className={`mb-6 rounded-md border px-4 py-3 text-sm font-medium ${
                            error
                                ? "border-red-200 bg-red-50 text-red-700"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        }`}
                    >
                        {error || notice}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
                        <div className="w-10 h-10 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200 flex items-center justify-center mb-3">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <p className="text-2xl font-bold text-zinc-800">{users.length}</p>
                        <p className="text-sm text-gray-500 mt-1">Total users</p>
                    </div>

                    <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
                        <div className="w-10 h-10 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-3">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <p className="text-2xl font-bold text-zinc-800">{activeUsersCount}</p>
                        <p className="text-sm text-gray-500 mt-1">Active users</p>
                    </div>

                    <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
                        <div className="w-10 h-10 rounded-md bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mb-3">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <p className="text-2xl font-bold text-zinc-800">{verifiedUsersCount}</p>
                        <p className="text-sm text-gray-500 mt-1">Email verified</p>
                    </div>

                    <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
                        <div className="w-10 h-10 rounded-md bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mb-3">
                            <UserX className="w-5 h-5" />
                        </div>
                        <p className="text-2xl font-bold text-zinc-800">{users.length - activeUsersCount}</p>
                        <p className="text-sm text-gray-500 mt-1">Inactive users</p>
                    </div>
                </div>

                <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[240px]">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search by name, email, phone, nationality..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm placeholder:text-gray-400"
                            />
                        </div>

                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 shadow-sm"
                        >
                            <option value="all">All Roles</option>
                            {roleOptions.map((role) => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 shadow-sm"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        <select
                            value={verificationFilter}
                            onChange={(e) => setVerificationFilter(e.target.value)}
                            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 shadow-sm"
                        >
                            <option value="all">All Verification</option>
                            <option value="verified">Verified</option>
                            <option value="unverified">Unverified</option>
                        </select>
                    </div>

                    {filteredUsers.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-14 h-14 rounded-md bg-gray-100 mx-auto mb-4 flex items-center justify-center border border-gray-200">
                                <Search className="w-6 h-6 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-zinc-800">No users found</h3>
                            <p className="text-sm text-gray-500 mt-1">Adjust your filters or search query.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Verification</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Joined</th>
                                        <th className="px-6 py-3.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {paginatedUsers.map((user) => {
                                        const isActive = user.isActive !== false;
                                        const isUpdatingRole = updatingRoleUserId === user._id;
                                        const isUpdatingStatus = updatingStatusUserId === user._id;

                                        return (
                                            <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => setSelectedUser(user)}
                                                        className="text-left group cursor-pointer"
                                                    >
                                                        <p className="text-sm font-semibold text-zinc-800 group-hover:underline transition-colors">
                                                            {user.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">{user.email}</p>
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={user.role}
                                                        disabled={isUpdatingRole}
                                                        onChange={(e) =>
                                                            void handleRoleUpdate(user._id, e.target.value as UserRole)
                                                        }
                                                        className="px-2 py-1 bg-white border border-gray-300 rounded-md text-xs text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 disabled:opacity-70 shadow-sm"
                                                    >
                                                        {roleOptions.map((role) => (
                                                            <option key={role.value} value={role.value}>
                                                                {role.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-zinc-800">{user.phone || "-"}</p>
                                                    <p className="text-xs text-gray-500">{user.nationality || "Unknown"}</p>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 py-0.5 text-xs font-medium border rounded-md ${
                                                            user.isEmailVerified
                                                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                                : "bg-amber-50 text-amber-700 border-amber-100"
                                                        }`}
                                                    >
                                                        {user.isEmailVerified ? "Verified" : "Unverified"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 py-0.5 text-xs font-medium border rounded-md ${
                                                            isActive
                                                                ? "bg-zinc-100 text-zinc-800 border-zinc-200"
                                                                : "bg-red-50 text-red-700 border-red-100"
                                                        }`}
                                                    >
                                                        {isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700">
                                                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex justify-end gap-1.5">
                                                        <button
                                                            onClick={() => setSelectedUser(user)}
                                                            className="px-2.5 py-1 text-xs font-medium rounded-md border border-gray-300 text-zinc-700 bg-white hover:bg-gray-50 transition shadow-sm"
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            onClick={() => void handleToggleStatus(user)}
                                                            disabled={isUpdatingStatus}
                                                            className={`px-2.5 py-1 text-xs font-medium rounded-md transition disabled:opacity-60 shadow-sm border ${
                                                                isActive
                                                                    ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                                                    : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                            }`}
                                                        >
                                                            {isUpdatingStatus
                                                                ? "Saving..."
                                                                : isActive
                                                                    ? "Deactivate"
                                                                    : "Reactivate"}
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

                    <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-xs text-gray-500">
                            Showing {(safePage - 1) * PAGE_SIZE + 1} to {Math.min(safePage * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length} users
                        </div>
                        <div className="inline-flex items-center gap-2">
                            <button
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                disabled={safePage === 1}
                                className="px-2.5 py-1 text-xs rounded-md border border-gray-300 bg-white text-zinc-700 hover:bg-gray-50 disabled:opacity-50 shadow-sm"
                            >
                                Prev
                            </button>
                            <span className="text-xs text-gray-500 px-2 font-medium">
                                Page {safePage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={safePage === totalPages}
                                className="px-2.5 py-1 text-xs rounded-md border border-gray-300 bg-white text-zinc-700 hover:bg-gray-50 disabled:opacity-50 shadow-sm"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
                    <div className="bg-white rounded-md border border-gray-200 p-6 xl:col-span-2 shadow-sm">
                        <h2 className="text-base font-semibold text-zinc-800 mb-4 border-b border-gray-100 pb-3">Role Distribution</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {roleOptions.map((role) => (
                                <div key={role.value} className="rounded-md border border-gray-200 bg-gray-50 p-4">
                                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">{role.label}</p>
                                    <p className="text-xl font-bold text-zinc-800 mt-1">{roleCounts[role.value] || 0}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-zinc-800 mb-4 border-b border-gray-100 pb-3">Global Activity</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Total bookings</span>
                                <span className="font-semibold text-zinc-800">{stats?.totalBookings ?? 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Total reviews</span>
                                <span className="font-semibold text-zinc-800">{stats?.totalReviews ?? 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Backend total users</span>
                                <span className="font-semibold text-zinc-800">{stats?.totalUsers ?? users.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {selectedUser && (
                <div className="fixed inset-0 z-50 bg-zinc-900/50 backdrop-blur-sm flex items-end md:items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-lg bg-white rounded-md border border-gray-200 shadow-lg overflow-hidden transform transition-all scale-100">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-zinc-800">User Details</h3>
                                <p className="text-xs text-gray-400">{selectedUser._id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="w-8 h-8 rounded-md border border-gray-300 text-zinc-500 hover:text-zinc-800 hover:bg-gray-100 flex items-center justify-center transition-colors shadow-sm bg-white"
                            >
                                <span className="text-lg font-semibold">&times;</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-xs uppercase font-semibold text-gray-400">Name</p>
                                <p className="text-sm font-medium text-zinc-800">{selectedUser.name}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase font-semibold text-gray-400">Email</p>
                                <p className="text-sm font-medium text-zinc-800">{selectedUser.email}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs uppercase font-semibold text-gray-400">Role</p>
                                    <p className="text-sm font-medium text-zinc-800 capitalize">{selectedUser.role}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase font-semibold text-gray-400">Status</p>
                                    <p className="text-sm font-medium text-zinc-800">
                                        {selectedUser.isActive !== false ? "Active" : "Inactive"}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs uppercase font-semibold text-gray-400">Phone</p>
                                    <p className="text-sm font-medium text-zinc-800">{selectedUser.phone || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase font-semibold text-gray-400">Nationality</p>
                                    <p className="text-sm font-medium text-zinc-800">{selectedUser.nationality || "-"}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs uppercase font-semibold text-gray-400">Email Verified</p>
                                    <p className="text-sm font-medium text-zinc-800">
                                        {selectedUser.isEmailVerified ? "Yes" : "No"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase font-semibold text-gray-400">Wallet Balance</p>
                                    <p className="text-sm font-medium text-zinc-800">
                                        ${selectedUser.walletBalance ?? 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
