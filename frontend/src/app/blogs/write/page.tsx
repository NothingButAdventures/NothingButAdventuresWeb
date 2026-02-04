"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { createClient } from "@supabase/supabase-js";
import { api } from "@/lib/api";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CATEGORIES = [
    "Active Travel",
    "Food & Drink",
    "Guides",
    "Wildlife",
    "Culture",
    "Adventure",
    "Photography",
    "Tips & Tricks",
    "Destinations",
    "Stories",
    "Other",
];

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
}

interface Country {
    _id: string;
    name: string;
    slug: string;
}

interface Tour {
    _id: string;
    name: string;
    slug: string;
}

export default function WriteBlogPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [authChecking, setAuthChecking] = useState(true);

    // Form state
    const [title, setTitle] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [category, setCategory] = useState("Other");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [featuredImage, setFeaturedImage] = useState<{
        url: string;
        caption: string;
        alt: string;
    }>({ url: "", caption: "", alt: "" });
    const [status, setStatus] = useState<"draft" | "published">("draft");
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [countries, setCountries] = useState<Country[]>([]);
    const [tours, setTours] = useState<Tour[]>([]);
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
    const [selectedTours, setSelectedTours] = useState<string[]>([]);

    // Image upload state
    const [uploadingFeaturedImage, setUploadingFeaturedImage] = useState(false);
    const [uploadingContentImage, setUploadingContentImage] = useState(false);

    // TipTap Editor
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4],
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: "rounded-lg max-w-full h-auto mx-auto",
                },
            }),
            LinkExtension.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-blue-600 hover:text-blue-800 underline",
                },
            }),
            Placeholder.configure({
                placeholder: "Start writing your travel story...",
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Underline,
            Highlight.configure({
                multicolor: true,
            }),
        ],
        content: "",
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class:
                    "prose prose-lg max-w-none focus:outline-none min-h-[400px] px-6 py-4",
            },
        },
    });

    useEffect(() => {
        checkAuth();
        fetchCountries();
        fetchTours();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/auth/login?redirect=/blogs/write");
                return;
            }

            const response = await fetch(`${api.baseURL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                router.push("/auth/login?redirect=/blogs/write");
                return;
            }

            const data = await response.json();
            const currentUser = data.data.user;

            // Check if user has permission (copywriter or admin)
            if (currentUser.role !== "copywriter" && currentUser.role !== "admin") {
                router.push("/dashboard");
                return;
            }

            setUser(currentUser);
        } catch (error) {
            console.error("Auth check failed:", error);
            router.push("/auth/login?redirect=/blogs/write");
        } finally {
            setAuthChecking(false);
            setLoading(false);
        }
    };

    const fetchCountries = async () => {
        try {
            const response = await fetch(`${api.baseURL}/countries`);
            if (response.ok) {
                const data = await response.json();
                setCountries(data.data.countries || data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch countries:", error);
        }
    };

    const fetchTours = async () => {
        try {
            const response = await fetch(`${api.baseURL}/tours?limit=100`);
            if (response.ok) {
                const data = await response.json();
                setTours(data.data.tours || data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch tours:", error);
        }
    };

    const uploadImage = async (file: File): Promise<string | null> => {
        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `blogs/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("blog-images")
                .upload(filePath, file);

            if (uploadError) {
                console.error("Upload error:", uploadError);
                throw uploadError;
            }

            const { data } = supabase.storage
                .from("blog-images")
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error("Failed to upload image:", error);
            alert("Failed to upload image. Please try again.");
            return null;
        }
    };

    const handleFeaturedImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingFeaturedImage(true);
        const url = await uploadImage(file);
        if (url) {
            setFeaturedImage((prev) => ({ ...prev, url }));
        }
        setUploadingFeaturedImage(false);
    };

    const handleContentImageUpload = useCallback(async () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file || !editor) return;

            setUploadingContentImage(true);
            const url = await uploadImage(file);
            if (url) {
                editor.chain().focus().setImage({ src: url }).run();
            }
            setUploadingContentImage(false);
        };
        input.click();
    }, [editor]);

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const newTag = tagInput.trim();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    const handleAddLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("Enter URL:", previousUrl);

        if (url === null) return;

        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }, [editor]);

    const handleSubmit = async (publishStatus: "draft" | "published") => {
        if (!title.trim()) {
            alert("Please enter a title");
            return;
        }

        if (!featuredImage.url) {
            alert("Please upload a featured image");
            return;
        }

        if (!editor?.getHTML() || editor.getHTML() === "<p></p>") {
            alert("Please write some content");
            return;
        }

        try {
            setSaving(true);
            const token = localStorage.getItem("token");

            const blogData = {
                title,
                content: editor.getHTML(),
                excerpt: excerpt || title.substring(0, 200),
                featuredImage: {
                    url: featuredImage.url,
                    caption: featuredImage.caption,
                    alt: featuredImage.alt || title,
                },
                category,
                tags,
                status: publishStatus,
                metaTitle: metaTitle || title,
                metaDescription: metaDescription || excerpt || title.substring(0, 160),
                relatedCountries: selectedCountries,
                relatedTours: selectedTours,
            };

            const response = await fetch(`${api.baseURL}/blogs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(blogData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to create blog post");
            }

            const data = await response.json();
            alert(
                `Blog post ${publishStatus === "published" ? "published" : "saved as draft"} successfully!`
            );
            router.push(`/blogs/${data.data.blog.slug}`);
        } catch (error: unknown) {
            console.error("Failed to save blog:", error);
            const errorMessage =
                error instanceof Error ? error.message : "Failed to save blog post";
            alert(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    if (authChecking || !user) {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* Header Skeleton */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
                                <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                                <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Editor Section Skeleton */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Title Skeleton */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="h-9 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                            </div>

                            {/* Featured Image Skeleton */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="h-4 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
                                <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse"></div>
                            </div>

                            {/* Editor Skeleton */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                {/* Toolbar Skeleton */}
                                <div className="flex flex-wrap items-center gap-2 p-3 border-b border-gray-200">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                                        <div key={i} className="w-9 h-9 bg-gray-200 rounded animate-pulse"></div>
                                    ))}
                                </div>
                                {/* Content Area Skeleton */}
                                <div className="px-6 py-4 space-y-4">
                                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Skeleton */}
                        <div className="space-y-6">
                            {/* Excerpt Skeleton */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="h-4 bg-gray-200 rounded w-16 mb-3 animate-pulse"></div>
                                <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
                            </div>

                            {/* Category Skeleton */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="h-4 bg-gray-200 rounded w-20 mb-3 animate-pulse"></div>
                                <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                            </div>

                            {/* Tags Skeleton */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="h-4 bg-gray-200 rounded w-12 mb-3 animate-pulse"></div>
                                <div className="flex gap-2 mb-3">
                                    <div className="h-7 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                                    <div className="h-7 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                                </div>
                                <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                            </div>

                            {/* Related Countries Skeleton */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="h-4 bg-gray-200 rounded w-32 mb-3 animate-pulse"></div>
                                <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                            </div>

                            {/* Related Tours Skeleton */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="h-4 bg-gray-200 rounded w-28 mb-3 animate-pulse"></div>
                                <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                            </div>

                            {/* SEO Settings Skeleton */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="h-4 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
                                <div className="space-y-4">
                                    <div>
                                        <div className="h-3 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
                                        <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                                    </div>
                                    <div>
                                        <div className="h-3 bg-gray-200 rounded w-28 mb-2 animate-pulse"></div>
                                        <div className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/blogs"
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg
                                    className="w-5 h-5 text-gray-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                    />
                                </svg>
                            </Link>
                            <h1 className="text-xl font-bold text-gray-900">
                                Write New Article
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleSubmit("draft")}
                                disabled={saving}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save Draft"}
                            </button>
                            <button
                                onClick={() => handleSubmit("published")}
                                disabled={saving}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {saving ? "Publishing..." : "Publish"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Editor Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter your article title..."
                                className="w-full text-3xl font-bold text-gray-900 placeholder-gray-400 focus:outline-none border-none"
                            />
                        </div>

                        {/* Featured Image */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">
                                Featured Image
                            </h3>
                            {featuredImage.url ? (
                                <div className="relative">
                                    <img
                                        src={featuredImage.url}
                                        alt="Featured"
                                        className="w-full h-64 object-cover rounded-lg"
                                    />
                                    <button
                                        onClick={() =>
                                            setFeaturedImage({ url: "", caption: "", alt: "" })
                                        }
                                        className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                                    >
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
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                    <div className="mt-4 space-y-3">
                                        <input
                                            type="text"
                                            value={featuredImage.caption}
                                            onChange={(e) =>
                                                setFeaturedImage((prev) => ({
                                                    ...prev,
                                                    caption: e.target.value,
                                                }))
                                            }
                                            placeholder="Image caption"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <input
                                            type="text"
                                            value={featuredImage.alt}
                                            onChange={(e) =>
                                                setFeaturedImage((prev) => ({
                                                    ...prev,
                                                    alt: e.target.value,
                                                }))
                                            }
                                            placeholder="Alt text (for accessibility)"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <label className="relative block w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFeaturedImageUpload}
                                        className="hidden"
                                        disabled={uploadingFeaturedImage}
                                    />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        {uploadingFeaturedImage ? (
                                            <>
                                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3" />
                                                <p className="text-gray-500">Uploading...</p>
                                            </>
                                        ) : (
                                            <>
                                                <svg
                                                    className="w-12 h-12 text-gray-400 mb-3"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1.5}
                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                <p className="text-gray-600 font-medium">
                                                    Click to upload featured image
                                                </p>
                                                <p className="text-gray-400 text-sm mt-1">
                                                    Recommended: 1200 x 630 pixels
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </label>
                            )}
                        </div>

                        {/* Editor Toolbar */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="flex flex-wrap items-center gap-1 p-3 border-b border-gray-200">
                                {/* Text Formatting */}
                                <button
                                    onClick={() => editor?.chain().focus().toggleBold().run()}
                                    className={`p-2 rounded hover:bg-gray-100 transition-colors ${editor?.isActive("bold") ? "bg-gray-200" : ""
                                        }`}
                                    title="Bold"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                                    className={`p-2 rounded hover:bg-gray-100 transition-colors ${editor?.isActive("italic") ? "bg-gray-200" : ""
                                        }`}
                                    title="Italic"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => editor?.chain().focus().toggleUnderline().run()}
                                    className={`p-2 rounded hover:bg-gray-100 transition-colors ${editor?.isActive("underline") ? "bg-gray-200" : ""
                                        }`}
                                    title="Underline"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => editor?.chain().focus().toggleStrike().run()}
                                    className={`p-2 rounded hover:bg-gray-100 transition-colors ${editor?.isActive("strike") ? "bg-gray-200" : ""
                                        }`}
                                    title="Strikethrough"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z" />
                                    </svg>
                                </button>

                                <div className="w-px h-6 bg-gray-300 mx-2" />

                                {/* Headings */}
                                <button
                                    onClick={() =>
                                        editor?.chain().focus().toggleHeading({ level: 2 }).run()
                                    }
                                    className={`p-2 rounded hover:bg-gray-100 transition-colors ${editor?.isActive("heading", { level: 2 }) ? "bg-gray-200" : ""
                                        }`}
                                    title="Heading 2"
                                >
                                    <span className="font-bold text-sm">H2</span>
                                </button>
                                <button
                                    onClick={() =>
                                        editor?.chain().focus().toggleHeading({ level: 3 }).run()
                                    }
                                    className={`p-2 rounded hover:bg-gray-100 transition-colors ${editor?.isActive("heading", { level: 3 }) ? "bg-gray-200" : ""
                                        }`}
                                    title="Heading 3"
                                >
                                    <span className="font-bold text-sm">H3</span>
                                </button>

                                <div className="w-px h-6 bg-gray-300 mx-2" />

                                {/* Lists */}
                                <button
                                    onClick={() =>
                                        editor?.chain().focus().toggleBulletList().run()
                                    }
                                    className={`p-2 rounded hover:bg-gray-100 transition-colors ${editor?.isActive("bulletList") ? "bg-gray-200" : ""
                                        }`}
                                    title="Bullet List"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() =>
                                        editor?.chain().focus().toggleOrderedList().run()
                                    }
                                    className={`p-2 rounded hover:bg-gray-100 transition-colors ${editor?.isActive("orderedList") ? "bg-gray-200" : ""
                                        }`}
                                    title="Numbered List"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
                                    </svg>
                                </button>

                                <div className="w-px h-6 bg-gray-300 mx-2" />

                                {/* Quote */}
                                <button
                                    onClick={() =>
                                        editor?.chain().focus().toggleBlockquote().run()
                                    }
                                    className={`p-2 rounded hover:bg-gray-100 transition-colors ${editor?.isActive("blockquote") ? "bg-gray-200" : ""
                                        }`}
                                    title="Quote"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
                                    </svg>
                                </button>

                                {/* Highlight */}
                                <button
                                    onClick={() => editor?.chain().focus().toggleHighlight().run()}
                                    className={`p-2 rounded hover:bg-gray-100 transition-colors ${editor?.isActive("highlight") ? "bg-gray-200" : ""
                                        }`}
                                    title="Highlight"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M15.24 2c.74 0 1.46.3 1.99.83l2.94 2.94c.52.52.83 1.24.83 1.99s-.3 1.46-.83 1.99l-8.49 8.49c-.52.52-1.23.83-1.98.83H4.5c-.28 0-.5-.22-.5-.5v-5.2c0-.75.31-1.46.83-1.98l8.49-8.49c.52-.52 1.24-.83 1.99-.83M16 15l5.01 5.01c.57.57 1.32.88 2.12.94V22H8v-2h7.17l.83-.99zm-4.59-3.59l2.83 2.83 5.66-5.66-2.83-2.83z" />
                                    </svg>
                                </button>

                                <div className="w-px h-6 bg-gray-300 mx-2" />

                                {/* Link */}
                                <button
                                    onClick={handleAddLink}
                                    className={`p-2 rounded hover:bg-gray-100 transition-colors ${editor?.isActive("link") ? "bg-gray-200" : ""
                                        }`}
                                    title="Add Link"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
                                    </svg>
                                </button>

                                {/* Image */}
                                <button
                                    onClick={handleContentImageUpload}
                                    disabled={uploadingContentImage}
                                    className="p-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
                                    title="Add Image"
                                >
                                    {uploadingContentImage ? (
                                        <div className="w-5 h-5 animate-spin rounded-full border-b-2 border-gray-600" />
                                    ) : (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                        </svg>
                                    )}
                                </button>

                                <div className="w-px h-6 bg-gray-300 mx-2" />

                                {/* Alignment */}
                                <button
                                    onClick={() =>
                                        editor?.chain().focus().setTextAlign("left").run()
                                    }
                                    className={`p-2 rounded hover:bg-gray-100 transition-colors ${editor?.isActive({ textAlign: "left" }) ? "bg-gray-200" : ""
                                        }`}
                                    title="Align Left"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() =>
                                        editor?.chain().focus().setTextAlign("center").run()
                                    }
                                    className={`p-2 rounded hover:bg-gray-100 transition-colors ${editor?.isActive({ textAlign: "center" }) ? "bg-gray-200" : ""
                                        }`}
                                    title="Align Center"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() =>
                                        editor?.chain().focus().setTextAlign("right").run()
                                    }
                                    className={`p-2 rounded hover:bg-gray-100 transition-colors ${editor?.isActive({ textAlign: "right" }) ? "bg-gray-200" : ""
                                        }`}
                                    title="Align Right"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z" />
                                    </svg>
                                </button>

                                <div className="w-px h-6 bg-gray-300 mx-2" />

                                {/* Undo/Redo */}
                                <button
                                    onClick={() => editor?.chain().focus().undo().run()}
                                    disabled={!editor?.can().undo()}
                                    className="p-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-30"
                                    title="Undo"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => editor?.chain().focus().redo().run()}
                                    disabled={!editor?.can().redo()}
                                    className="p-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-30"
                                    title="Redo"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Editor Content */}
                            <EditorContent editor={editor} />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Excerpt */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                Excerpt
                            </h3>
                            <textarea
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                placeholder="Brief summary of your article..."
                                rows={4}
                                maxLength={500}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                {excerpt.length}/500 characters
                            </p>
                        </div>

                        {/* Category */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                Category
                            </h3>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tags */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Tags</h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                                    >
                                        {tag}
                                        <button
                                            onClick={() => handleRemoveTag(tag)}
                                            className="hover:text-blue-900"
                                        >
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
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                placeholder="Add tag and press Enter"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Related Countries */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                Related Destinations
                            </h3>
                            <select
                                multiple
                                value={selectedCountries}
                                onChange={(e) =>
                                    setSelectedCountries(
                                        Array.from(e.target.selectedOptions, (opt) => opt.value)
                                    )
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
                            >
                                {countries.map((country) => (
                                    <option key={country._id} value={country._id}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-400 mt-1">
                                Hold Ctrl/Cmd to select multiple
                            </p>
                        </div>

                        {/* Related Tours */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                Related Tours
                            </h3>
                            <select
                                multiple
                                value={selectedTours}
                                onChange={(e) =>
                                    setSelectedTours(
                                        Array.from(e.target.selectedOptions, (opt) => opt.value)
                                    )
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
                            >
                                {tours.map((tour) => (
                                    <option key={tour._id} value={tour._id}>
                                        {tour.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-400 mt-1">
                                Hold Ctrl/Cmd to select multiple
                            </p>
                        </div>

                        {/* SEO Settings */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                SEO Settings
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">
                                        Meta Title
                                    </label>
                                    <input
                                        type="text"
                                        value={metaTitle}
                                        onChange={(e) => setMetaTitle(e.target.value)}
                                        placeholder={title || "Meta title..."}
                                        maxLength={60}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        {metaTitle.length}/60
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">
                                        Meta Description
                                    </label>
                                    <textarea
                                        value={metaDescription}
                                        onChange={(e) => setMetaDescription(e.target.value)}
                                        placeholder={excerpt || "Meta description..."}
                                        rows={3}
                                        maxLength={160}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        {metaDescription.length}/160
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
