"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import BlogsLoading from "./loading";

interface Author {
    _id: string;
    name: string;
    avatar: string | null;
}

interface Blog {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    featuredImage: {
        url: string;
        caption?: string;
        alt?: string;
    };
    author: Author;
    category: string;
    tags: string[];
    readTime: number;
    publishedAt: string;
    isFeatured: boolean;
}

interface Category {
    _id: string;
    count: number;
}

const CATEGORIES = [
    { name: "Active Travel", image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop" },
    { name: "Food & Drink", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop" },
    { name: "Guides", image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop" },
    { name: "Wildlife", image: "https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=400&h=300&fit=crop" },
];

export default function BlogsPage() {
    const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchBlogs();
        fetchFeaturedBlogs();
        fetchCategories();
    }, [selectedCategory]);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            let url = `${api.baseURL}/blogs?limit=12`;
            if (selectedCategory) {
                url = `${api.baseURL}/blogs/category/${encodeURIComponent(selectedCategory)}?limit=12`;
            }
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setBlogs(data.data.blogs || []);
            }
        } catch (error) {
            console.error("Failed to fetch blogs:", error);
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    };

    const fetchFeaturedBlogs = async () => {
        try {
            const response = await fetch(`${api.baseURL}/blogs/featured?limit=4`);
            if (response.ok) {
                const data = await response.json();
                setFeaturedBlogs(data.data.blogs || []);
            }
        } catch (error) {
            console.error("Failed to fetch featured blogs:", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${api.baseURL}/blogs/categories`);
            if (response.ok) {
                const data = await response.json();
                setCategories(data.data.categories || []);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        try {
            setLoading(true);
            const response = await fetch(
                `${api.baseURL}/blogs/search?q=${encodeURIComponent(searchQuery)}`
            );
            if (response.ok) {
                const data = await response.json();
                setBlogs(data.data.blogs || []);
            }
        } catch (error) {
            console.error("Failed to search blogs:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "2-digit",
        });
    };

    const mainFeatured = featuredBlogs[0];
    const sideFeatured = featuredBlogs.slice(1, 3);

    // Show skeleton during initial page load
    if (initialLoading) {
        return <BlogsLoading />;
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative h-[500px] bg-gradient-to-r from-gray-900 to-gray-700 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-60"
                    style={{
                        backgroundImage:
                            "url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=600&fit=crop)",
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
                <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                        Travel Stories & Guides
                    </h1>
                    <p className="text-xl text-gray-200 max-w-2xl mb-8">
                        Discover inspiring travel stories, expert guides, and tips from our
                        adventure writers around the world.
                    </p>
                    <form onSubmit={handleSearch} className="w-full max-w-xl">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-6 py-4 rounded-full bg-white/95 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xl"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-colors font-medium"
                            >
                                Search
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Categories Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category.name}
                            onClick={() =>
                                setSelectedCategory(
                                    selectedCategory === category.name ? null : category.name
                                )
                            }
                            className={`relative group overflow-hidden rounded-xl h-40 transition-all ${selectedCategory === category.name
                                ? "ring-4 ring-blue-500"
                                : ""
                                }`}
                        >
                            <img
                                src={category.image}
                                alt={category.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                            <div className="absolute inset-0 flex items-end justify-center pb-4">
                                <span className="text-white font-semibold text-lg">
                                    {category.name}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
                {selectedCategory && (
                    <div className="mt-4 flex items-center gap-2">
                        <span className="text-gray-600">
                            Showing articles in:{" "}
                            <span className="font-semibold text-blue-600">
                                {selectedCategory}
                            </span>
                        </span>
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className="text-sm text-gray-500 hover:text-red-500 underline"
                        >
                            Clear filter
                        </button>
                    </div>
                )}
            </div>

            {/* Featured Section */}
            {!selectedCategory && featuredBlogs.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Featured</h2>
                        <Link
                            href="/blogs?featured=true"
                            className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
                        >
                            See More
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Featured Article */}
                        {mainFeatured && (
                            <div className="lg:col-span-2">
                                <Link href={`/blogs/${mainFeatured.slug}`}>
                                    <article className="group relative h-[500px] rounded-2xl overflow-hidden">
                                        <img
                                            src={mainFeatured.featuredImage.url}
                                            alt={mainFeatured.featuredImage.alt || mainFeatured.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 p-8">
                                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
                                                {mainFeatured.title}
                                            </h3>
                                            <p className="text-gray-300 text-sm mb-4">
                                                Written by{" "}
                                                <span className="font-medium text-white">
                                                    {mainFeatured.author.name}
                                                </span>{" "}
                                                on {formatDate(mainFeatured.publishedAt)}
                                            </p>
                                            <p className="text-gray-200 line-clamp-2">
                                                {mainFeatured.excerpt}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {mainFeatured.tags.slice(0, 5).map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            </div>
                        )}

                        {/* Side Featured Articles */}
                        <div className="flex flex-col gap-8">
                            {sideFeatured.map((blog) => (
                                <Link key={blog._id} href={`/blogs/${blog.slug}`}>
                                    <article className="group flex gap-4">
                                        <div className="relative w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden">
                                            <img
                                                src={blog.featuredImage.url}
                                                alt={blog.featuredImage.alt || blog.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                                                {blog.title}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                Written by{" "}
                                                <span className="font-medium">{blog.author.name}</span>{" "}
                                                on {formatDate(blog.publishedAt)}
                                            </p>
                                            <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                                                {blog.excerpt}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {blog.tags.slice(0, 3).map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="text-xs text-blue-500 hover:text-blue-600"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* All Blogs Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                    {selectedCategory || "Latest Articles"}
                </h2>

                {blogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map((blog) => (
                            <Link key={blog._id} href={`/blogs/${blog.slug}`}>
                                <article className="group h-full">
                                    <div className="relative h-56 rounded-xl overflow-hidden mb-4">
                                        <img
                                            src={blog.featuredImage.url}
                                            alt={blog.featuredImage.alt || blog.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-white/90 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">
                                                {blog.category}
                                            </span>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                                        {blog.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-2">
                                        Written by{" "}
                                        <span className="font-medium text-gray-700">
                                            {blog.author.name}
                                        </span>{" "}
                                        on {formatDate(blog.publishedAt)}
                                    </p>
                                    <p className="text-gray-600 line-clamp-2 mb-3">
                                        {blog.excerpt}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {blog.tags.slice(0, 5).map((tag) => (
                                            <span
                                                key={tag}
                                                className="text-xs text-blue-500 hover:text-blue-600"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
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
                            No articles found
                        </h3>
                        <p className="text-gray-500">
                            {selectedCategory
                                ? `No articles in the ${selectedCategory} category yet.`
                                : "Check back soon for new travel stories and guides."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
