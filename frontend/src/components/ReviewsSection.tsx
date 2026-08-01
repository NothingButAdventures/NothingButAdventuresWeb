"use client";

import React from "react";
import Link from "next/link";

const reviews = [
    {
        id: 1,
        name: "Nishant Yadav",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
        rating: 4.8,
        review: "Beautiful beaches, vibrant nightlife, delicious seafood. Can be crowded in peak season but perfect for relaxing holidays. Thank you Nothing but Adventures",
    },
    {
        id: 2,
        name: "Josef",
        avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop",
        rating: 4.8,
        review: "Amazing trekking experience through the Himalayas. The guides were incredibly knowledgeable and made every moment memorable.",
    },
    {
        id: 3,
        name: "Priya Sharma",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
        rating: 5.0,
        review: "The Rajasthan tour was a dream come true. Every palace, every sunset over the dunes — absolutely breathtaking and well organised.",
    },
    {
        id: 4,
        name: "Marcus Chen",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
        rating: 4.7,
        review: "Kerala backwaters were serene and the houseboat experience was unlike anything else. Food was outstanding throughout the trip.",
    },
    {
        id: 5,
        name: "Emily Watson",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
        rating: 4.9,
        review: "Varanasi left me speechless. The spiritual energy, the Ganga aarti, and the local stories — a truly life-changing journey.",
    },
    {
        id: 6,
        name: "Arjun Mehta",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
        rating: 4.6,
        review: "Desert safari was an adventure of a lifetime. Camel rides, campfire under the stars, and the warmth of the Rajasthani hospitality.",
    },
];

function ReviewCard({ review, className = "" }: { review: typeof reviews[0]; className?: string }) {
    return (
        <div className={`bg-[#F5F5F3] rounded-[20px] p-5 shrink-0 ${className}`}>
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                    <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                </div>
                <div>
                    <h4 className="font-semibold text-sm text-[#18181B] mb-0.5 font-outfit">{review.name}</h4>
                    <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-[#18181B] font-outfit">{review.rating}</span>
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg key={star} className="w-3 h-3 text-[#18181B]" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 font-normal leading-relaxed font-outfit mt-2.5">
                {review.review}
            </p>
        </div>
    );
}

export default function ReviewsSection({
    title,
    pillClasses,
    btnClasses,
    btnText,
    titleClassName,
}: {
    title?: string;
    pillClasses?: string;
    btnClasses?: string;
    btnText?: string;
    titleClassName?: string;
} = {}) {
    return (
        <section className="mx-auto mt-20 sm:mt-24 md:mt-28 lg:mt-32 mb-16">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10">
                <div>
                    <div className="inline-block px-3.5 py-1 bg-[#F4F4F5] text-[#71717A] rounded-full text-[13px] font-medium tracking-normal mb-3">
                        Reviews
                    </div>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[66px] font-normal leading-tight text-[#18181B] tracking-tight font-outfit">
                        What travellers say about<br />
                        our tours
                    </h2>
                </div>
                <div className="max-w-[300px] md:text-right mt-4 md:mt-0 self-end">
                    <p className="text-xs sm:text-sm text-[#4F6D38] font-normal leading-snug font-outfit">
                        Enjoy journey we organise is built on trust,<br className="hidden sm:inline" /> safety and unforgettable views
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[450px]">
                {/* Left Card: Rating & CTA */}
                <div className="bg-[#F5F5F3] rounded-[24px] p-7 sm:p-9 flex flex-col justify-between h-full min-h-[380px]">
                    <div className="flex items-center gap-3">
                        <div className="flex items-baseline font-normal text-[#18181B] font-outfit">
                            <span className="text-5xl sm:text-6xl leading-none">4.9</span>
                            <span className="text-xl text-gray-400 font-normal ml-1">/5</span>
                        </div>
                        <p className="text-xs text-gray-600 font-normal leading-snug font-outfit max-w-[130px] ml-2">
                            Based on 280+ verified travlers
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-[#18181B] font-normal leading-snug mb-5 max-w-[220px] font-outfit">
                            Ready to plan your own journey? Let's get started!
                        </p>
                        <div className="flex items-center gap-3 group">
                            <Link
                                href="/trips"
                                className="inline-flex items-center justify-center bg-[#18181B] text-white px-6 py-3.5 rounded-full font-medium text-sm hover:bg-black transition-all border-2 border-[#18181B] cursor-pointer"
                            >
                                Plan Your Trip
                            </Link>
                            <Link
                                href="/trips"
                                className="inline-flex items-center justify-center bg-[#18181B] text-white w-12 h-12 rounded-full hover:bg-black transition-all border-2 border-[#18181B] shrink-0 cursor-pointer"
                                aria-label="Plan Your Trip"
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Middle Card: Image Review */}
                <div className="relative rounded-[24px] overflow-hidden min-h-[380px] lg:h-full w-full bg-gray-900 shadow-xs">
                    <img
                        src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=3540&auto=format&fit=crop"
                        alt="Travellers exploring"
                        className="absolute inset-0 w-full h-full object-cover opacity-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none"></div>

                    <div className="absolute bottom-6 left-6 right-6 text-white z-10 font-outfit">
                        <p className="text-white/80 text-xs mb-1 font-normal">Alexa, 23 March 2025</p>
                        <p className="text-base sm:text-lg font-medium leading-snug">
                            Beautiful beaches, vibrant nightlife, delicious seafood.
                        </p>
                    </div>
                </div>

                {/* Right Card: Auto-scrolling Reviews */}
                <div className="flex flex-col overflow-hidden relative h-[450px]">
                    {/* Top fade */}
                    <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white to-transparent pointer-events-none z-20"></div>

                    {/* Scrolling container */}
                    <div className="reviews-scroll-container flex flex-col gap-4">
                        <div className="reviews-scroll-track flex flex-col gap-4">
                            {reviews.map((review) => (
                                <ReviewCard key={review.id} review={review} />
                            ))}
                            {/* Duplicate for seamless loop */}
                            {reviews.map((review) => (
                                <ReviewCard key={`dup-${review.id}`} review={review} />
                            ))}
                        </div>
                    </div>

                    {/* Bottom fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none z-20"></div>
                </div>
            </div>

            <style jsx>{`
                .reviews-scroll-container {
                    overflow: hidden;
                    height: 100%;
                }

                .reviews-scroll-track {
                    animation: scrollUp 30s linear infinite;
                }

                .reviews-scroll-track:hover {
                    animation-play-state: paused;
                }

                @keyframes scrollUp {
                    0% {
                        transform: translateY(0);
                    }
                    100% {
                        transform: translateY(-50%);
                    }
                }
            `}</style>
        </section>
    );
}
