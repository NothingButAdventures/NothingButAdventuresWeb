import React from "react";
import Link from "next/link";

type Blog = {
    _id: string;
    title: string;
    slug: string;
    excerpt?: string;
    featuredImage?: {
        url: string;
        caption?: string;
        alt?: string;
    };
    category?: string;
    readTime?: number;
};

type BeyondTheMapSectionProps = {
    blogs?: Blog[];
};

const igImages = [
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504150558240-0b4fd8946624?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=400&auto=format&fit=crop",
];

const fallbackImage = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=800&auto=format&fit=crop";

export default function BeyondTheMapSection({ blogs = [] }: BeyondTheMapSectionProps) {
    return (
        <section className="mx-auto mt-24 mb-16">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 md:gap-0">
                <div>
                    <div className="inline-block px-5 py-2 bg-[#DEECFF] text-gray-500 rounded-full text-[14px] font-semibold tracking-wide mb-6">
                        Blogs
                    </div>
                    <h2 className="text-[48px] md:text-[56px] font-medium leading-[1.1] text-[#3F3F42]">
                        Beyond the Map
                    </h2>
                </div>
                <div className="md:pb-2">
                    <p className="text-[17px] font-medium text-[#3F3F42]">
                        For those who choose the long way.
                    </p>
                </div>
            </div>

            {/* Grid Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6">

                {/* 3 Blog Postcards */}
                {blogs.map((blog) => (
                    <Link
                        key={blog._id}
                        href={`/blogs/${blog.slug}`}
                        className="relative w-full h-[450px] rounded-[24px] overflow-hidden block group/blog"
                    >
                        <img
                            src={blog.featuredImage?.url || fallbackImage}
                            alt={blog.featuredImage?.alt || blog.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover/blog:scale-105"
                        />

                        {/* Gradient Overlay for Text Readability */}
                        <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-10"></div>

                        {/* Content */}
                        <div className="absolute bottom-6 left-6 right-6 z-20">
                            <h3 className="text-white text-[22px] font-medium leading-tight mb-1">
                                {blog.title}
                            </h3>
                            <p className="text-white/80 text-[14px] font-normal">
                                {blog.excerpt || blog.category || ""}
                            </p>
                        </div>
                    </Link>
                ))}

                {/* Instagram Widget */}
                <div className="relative w-full h-[450px] rounded-[24px] overflow-hidden bg-white border border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-stretch">

                    {/* Top Content */}
                    <div className="p-4 bg-white z-10 w-full">
                        {/* Avatar and Handle */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gray-100">
                                <img
                                    src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=100&auto=format&fit=crop"
                                    alt="Nothing But Adventures"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[16px] font-bold text-[#3F3F42] leading-tight">Nothing But Adventures</span>
                                <span className="text-[13px] text-gray-500 leading-tight">@nothingbadv</span>
                            </div>
                        </div>

                        {/* Stats and Button */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col items-center">
                                    <span className="text-[15px] font-bold text-[#3F3F42] leading-none">300</span>
                                    <span className="text-[11px] text-gray-500 mt-1">Posts</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[15px] font-bold text-[#3F3F42] leading-none">88.7K</span>
                                    <span className="text-[11px] text-gray-500 mt-1">Followers</span>
                                </div>
                            </div>

                            <a href="#" className="flex items-center justify-center gap-1.5 bg-[#3b82f6] text-white px-4 py-1.5 rounded-md hover:bg-blue-600 transition-colors">
                                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                </svg>
                                <span className="text-[13px] font-semibold">Follow</span>
                            </a>
                        </div>
                    </div>

                    {/* Image Grid */}
                    <div className="flex-1 w-full grid grid-cols-3 gap-[2px] bg-white overflow-hidden pb-0 mt-2 rounded-b-[24px]">
                        {igImages.map((img, idx) => (
                            <div key={idx} className="relative w-full h-[105px]">
                                <img
                                    src={img}
                                    alt={`Instagram post ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>

                </div>

            </div>
        </section>
    );
}
