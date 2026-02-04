"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Author {
    _id: string;
    name: string;
    avatar: string | null;
}

interface RelatedCountry {
    _id: string;
    name: string;
    slug: string;
}

interface RelatedTour {
    _id: string;
    name: string;
    slug: string;
    price: {
        amount: number;
        currency: string;
    };
    images: Array<{
        url: string;
        isPrimary: boolean;
    }>;
}

interface Blog {
    _id: string;
    title: string;
    slug: string;
    content: string;
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
    viewCount: number;
    relatedCountries: RelatedCountry[];
    relatedTours: RelatedTour[];
}

interface RelatedBlog {
    _id: string;
    title: string;
    slug: string;
    featuredImage: {
        url: string;
        alt?: string;
    };
    author: Author;
    publishedAt: string;
    readTime: number;
}

export default function BlogPostPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const resolvedParams = use(params);
    const [blog, setBlog] = useState<Blog | null>(null);
    const [relatedBlogs, setRelatedBlogs] = useState<RelatedBlog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchBlog();
    }, [resolvedParams.slug]);

    const fetchBlog = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(
                `${api.baseURL}/blogs/${resolvedParams.slug}`
            );

            if (!response.ok) {
                if (response.status === 404) {
                    setError("Blog post not found");
                } else {
                    setError("Failed to load blog post");
                }
                return;
            }

            const data = await response.json();
            setBlog(data.data.blog);

            // Fetch related blogs by category
            if (data.data.blog.category) {
                fetchRelatedBlogs(data.data.blog.category, data.data.blog._id);
            }
        } catch (error) {
            console.error("Failed to fetch blog:", error);
            setError("Failed to load blog post");
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedBlogs = async (category: string, currentId: string) => {
        try {
            const response = await fetch(
                `${api.baseURL}/blogs/category/${encodeURIComponent(category)}?limit=4`
            );
            if (response.ok) {
                const data = await response.json();
                const related = (data.data.blogs || []).filter(
                    (b: RelatedBlog) => b._id !== currentId
                );
                setRelatedBlogs(related.slice(0, 3));
            }
        } catch (error) {
            console.error("Failed to fetch related blogs:", error);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "2-digit",
        });
    };

    // Helper to decode HTML entities if content was double-escaped
    const decodeHTML = (html: string) => {
        if (typeof window === 'undefined') return html;
        const textarea = document.createElement('textarea');
        textarea.innerHTML = html;
        return textarea.value;
    };

    const handleShare = async (platform: string) => {
        const url = window.location.href;
        const title = blog?.title || "";

        switch (platform) {
            case "twitter":
                window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
                    "_blank"
                );
                break;
            case "facebook":
                window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                    "_blank"
                );
                break;
            case "linkedin":
                window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
                    "_blank"
                );
                break;
            case "copy":
                await navigator.clipboard.writeText(url);
                alert("Link copied to clipboard!");
                break;
        }
    };

    // Show skeleton while loading
    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                {/* Breadcrumb Skeleton */}
                <div className="bg-white border-b border-gray-100">
                    <div className="max-w-4xl mx-auto px-4 py-4">
                        <div className="flex items-center gap-2">
                            <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                            <span className="text-gray-300">/</span>
                            <div className="h-4 bg-gray-200 rounded w-10 animate-pulse"></div>
                            <span className="text-gray-300">/</span>
                            <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
                        </div>
                    </div>
                </div>

                <article className="max-w-4xl mx-auto px-4 py-12">
                    <header className="mb-8">
                        {/* Category and read time skeleton */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-7 bg-gray-200 rounded-full w-28 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                        </div>

                        {/* Title skeleton */}
                        <div className="space-y-3 mb-6">
                            <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
                            <div className="h-10 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        </div>

                        {/* Author and share skeleton */}
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
                                <div>
                                    <div className="h-5 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-9 h-9 bg-gray-200 rounded-full animate-pulse"></div>
                                ))}
                            </div>
                        </div>
                    </header>

                    {/* Featured image skeleton */}
                    <div className="h-[400px] md:h-[500px] bg-gray-200 rounded-2xl mb-10 animate-pulse"></div>

                    {/* Content skeleton */}
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-[95%]"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-[88%]"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-[75%]"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-[92%]"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-[80%]"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse mt-8"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-[90%]"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-[85%]"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-[78%]"></div>
                    </div>

                    {/* Tags skeleton */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <div className="h-4 bg-gray-200 rounded w-12 mb-4 animate-pulse"></div>
                        <div className="flex gap-2">
                            <div className="h-9 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                            <div className="h-9 bg-gray-200 rounded-full w-24 animate-pulse"></div>
                            <div className="h-9 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                        </div>
                    </div>

                    {/* Author box skeleton */}
                    <div className="mt-12 p-8 bg-gray-100 rounded-2xl animate-pulse">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-gray-200 flex-shrink-0"></div>
                            <div className="flex-1">
                                <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                                <div className="h-6 bg-gray-200 rounded w-32 mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        );
    }

    // Show error only after loading is complete
    if (error || !blog) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg
                            className="w-10 h-10 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        {error || "Blog post not found"}
                    </h1>
                    <Link
                        href="/blogs"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        Back to Blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link href="/" className="text-gray-500 hover:text-blue-600">
                            Home
                        </Link>
                        <span className="text-gray-400">/</span>
                        <Link href="/blogs" className="text-gray-500 hover:text-blue-600">
                            Blog
                        </Link>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-900 font-medium truncate max-w-[200px]">
                            {blog.title}
                        </span>
                    </nav>
                </div>
            </div>

            {/* Article Header */}
            <article className="max-w-4xl mx-auto px-4 py-12">
                <header className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Link
                            href={`/blogs?category=${encodeURIComponent(blog.category)}`}
                            className="bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full hover:bg-blue-200 transition-colors"
                        >
                            {blog.category}
                        </Link>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500 text-sm">
                            {blog.readTime} min read
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                        {blog.title}
                    </h1>

                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                                {blog.author.avatar ? (
                                    <img
                                        src={blog.author.avatar}
                                        alt={blog.author.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    blog.author.name.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">
                                    {blog.author.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {formatDate(blog.publishedAt)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleShare("twitter")}
                                className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 transition-colors"
                                title="Share on Twitter"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => handleShare("facebook")}
                                className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 transition-colors"
                                title="Share on Facebook"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => handleShare("linkedin")}
                                className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 transition-colors"
                                title="Share on LinkedIn"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => handleShare("copy")}
                                className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 transition-colors"
                                title="Copy link"
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
                                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Featured Image */}
                <figure className="mb-10">
                    <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
                        <img
                            src={blog.featuredImage.url}
                            alt={blog.featuredImage.alt || blog.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {blog.featuredImage.caption && (
                        <figcaption className="text-center text-sm text-gray-500 mt-3">
                            {blog.featuredImage.caption}
                        </figcaption>
                    )}
                </figure>

                {/* Article Content */}
                <div
                    className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-img:rounded-xl"
                    dangerouslySetInnerHTML={{ __html: decodeHTML(blog.content) }}
                />

                {/* Tags */}
                {blog.tags.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {blog.tags.map((tag) => (
                                <Link
                                    key={tag}
                                    href={`/blogs?tag=${encodeURIComponent(tag)}`}
                                    className="bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                                >
                                    {tag}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Related Countries */}
                {blog.relatedCountries && blog.relatedCountries.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">
                            Destinations Mentioned
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {blog.relatedCountries.map((country) => (
                                <Link
                                    key={country._id}
                                    href={`/tours?country=${country.slug}`}
                                    className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                                >
                                    {country.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Related Tours */}
                {blog.relatedTours && blog.relatedTours.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">
                            Explore Related Tours
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {blog.relatedTours.map((tour) => {
                                const primaryImage =
                                    tour.images?.find((img) => img.isPrimary) || tour.images?.[0];
                                return (
                                    <Link
                                        key={tour._id}
                                        href={`/tours/${tour.slug}`}
                                        className="group flex gap-4 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors"
                                    >
                                        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                            {primaryImage?.url ? (
                                                <img
                                                    src={primaryImage.url}
                                                    alt={tour.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                    <svg
                                                        className="w-8 h-8 text-gray-400"
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
                                        <div className="flex flex-col justify-center">
                                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                                {tour.name}
                                            </h4>
                                            <p className="text-lg font-bold text-blue-600 mt-1">
                                                ${tour.price.amount}
                                                <span className="text-sm font-normal text-gray-500">
                                                    {" "}
                                                    / person
                                                </span>
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Author Box */}
                <div className="mt-12 p-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl overflow-hidden flex-shrink-0">
                            {blog.author.avatar ? (
                                <img
                                    src={blog.author.avatar}
                                    alt={blog.author.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                blog.author.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Written by</p>
                            <h3 className="text-xl font-bold text-gray-900">
                                {blog.author.name}
                            </h3>
                            <p className="text-gray-600 mt-2">
                                Travel writer and adventure enthusiast sharing stories from
                                around the world.
                            </p>
                        </div>
                    </div>
                </div>
            </article>

            {/* Related Articles */}
            {relatedBlogs.length > 0 && (
                <section className="bg-gray-50 py-16">
                    <div className="max-w-7xl mx-auto px-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">
                            More in {blog.category}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedBlogs.map((related) => (
                                <Link key={related._id} href={`/blogs/${related.slug}`}>
                                    <article className="group">
                                        <div className="relative h-48 rounded-xl overflow-hidden mb-4">
                                            <img
                                                src={related.featuredImage.url}
                                                alt={related.featuredImage.alt || related.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                                            {related.title}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {related.readTime} min read •{" "}
                                            {formatDate(related.publishedAt)}
                                        </p>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
