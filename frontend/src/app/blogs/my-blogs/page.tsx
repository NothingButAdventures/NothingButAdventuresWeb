"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import MyBlogsLoading from "./loading";

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
}

interface Blog {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    featuredImage: {
        url: string;
    };
    category: string;
    status: "draft" | "published" | "archived";
    viewCount: number;
    readTime: number;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export default function MyBlogsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [filter, setFilter] = useState<"all" | "draft" | "published">("all");

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/auth/login?redirect=/blogs/my-blogs");
                return;
            }

            const response = await fetch(`${api.baseURL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                router.push("/auth/login?redirect=/blogs/my-blogs");
                return;
            }

            const data = await response.json();
            const currentUser = data.data.user;

            if (currentUser.role !== "copywriter" && currentUser.role !== "admin") {
                router.push("/dashboard");
                return;
            }

            setUser(currentUser);
            fetchMyBlogs();
        } catch (error) {
            console.error("Auth check failed:", error);
            router.push("/auth/login?redirect=/blogs/my-blogs");
        }
    };

    const fetchMyBlogs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${api.baseURL}/blogs/me/blogs`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setBlogs(data.data.blogs || []);
            }
        } catch (error) {
            console.error("Failed to fetch blogs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this blog post?")) return;

        try {
            setDeleting(id);
            const token = localStorage.getItem("token");
            const response = await fetch(`${api.baseURL}/blogs/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                setBlogs(blogs.filter((blog) => blog._id !== id));
            } else {
                alert("Failed to delete blog post");
            }
        } catch (error) {
            console.error("Failed to delete blog:", error);
            alert("Failed to delete blog post");
        } finally {
            setDeleting(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
        });
    };

    const filteredBlogs = blogs.filter((blog) => {
        if (filter === "all") return true;
        return blog.status === filter;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "published":
                return (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Published
                    </span>
                );
            case "draft":
                return (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        Draft
                    </span>
                );
            case "archived":
                return (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        Archived
                    </span>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return <MyBlogsLoading />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Blogs</h1>
                        <p className="text-gray-600 mt-1">
                            Manage and create your travel articles
                        </p>
                    </div>
                    <Link
                        href="/blogs/write"
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        Write New Article
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-500 mb-1">Total Articles</p>
                        <p className="text-3xl font-bold text-gray-900">{blogs.length}</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-500 mb-1">Published</p>
                        <p className="text-3xl font-bold text-green-600">
                            {blogs.filter((b) => b.status === "published").length}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-500 mb-1">Drafts</p>
                        <p className="text-3xl font-bold text-yellow-600">
                            {blogs.filter((b) => b.status === "draft").length}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-500 mb-1">Total Views</p>
                        <p className="text-3xl font-bold text-blue-600">
                            {blogs.reduce((acc, b) => acc + (b.viewCount || 0), 0)}
                        </p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 mb-6">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === "all"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        All ({blogs.length})
                    </button>
                    <button
                        onClick={() => setFilter("published")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === "published"
                            ? "bg-green-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        Published ({blogs.filter((b) => b.status === "published").length})
                    </button>
                    <button
                        onClick={() => setFilter("draft")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === "draft"
                            ? "bg-yellow-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        Drafts ({blogs.filter((b) => b.status === "draft").length})
                    </button>
                </div>

                {/* Blog List */}
                {filteredBlogs.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                                        Article
                                    </th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                                        Category
                                    </th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                                        Status
                                    </th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                                        Views
                                    </th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                                        Date
                                    </th>
                                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredBlogs.map((blog) => (
                                    <tr key={blog._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                    {blog.featuredImage?.url ? (
                                                        <img
                                                            src={blog.featuredImage.url}
                                                            alt={blog.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <svg
                                                                className="w-6 h-6 text-gray-400"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={1}
                                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                                                        {blog.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {blog.readTime} min read
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">
                                                {blog.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(blog.status)}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">
                                                {blog.viewCount || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">
                                                {formatDate(blog.publishedAt || blog.createdAt)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {blog.status === "published" && (
                                                    <Link
                                                        href={`/blogs/${blog.slug}`}
                                                        target="_blank"
                                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="View"
                                                    >
                                                        <svg
                                                            className="w-5 h-5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                            />
                                                        </svg>
                                                    </Link>
                                                )}
                                                <Link
                                                    href={`/blogs/edit/${blog._id}`}
                                                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <svg
                                                        className="w-5 h-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                        />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(blog._id)}
                                                    disabled={deleting === blog._id}
                                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Delete"
                                                >
                                                    {deleting === blog._id ? (
                                                        <div className="w-5 h-5 animate-spin rounded-full border-b-2 border-red-600" />
                                                    ) : (
                                                        <svg
                                                            className="w-5 h-5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                            />
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
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg
                                className="w-10 h-10 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {filter === "all"
                                ? "No articles yet"
                                : `No ${filter} articles`}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {filter === "all"
                                ? "Start writing your first travel article!"
                                : `You don't have any ${filter} articles.`}
                        </p>
                        <Link
                            href="/blogs/write"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            Write Your First Article
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
