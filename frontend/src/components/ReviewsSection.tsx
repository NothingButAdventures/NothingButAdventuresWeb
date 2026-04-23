"use client";

import React from "react";

const reviews = [
    {
        id: 1,
        name: "Nishant Yadav",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
        rating: 4.8,
        review: "Beautiful beaches, vibrant nightlife, delicious seafood. Can be crowded in peak season but perfect for relaxing holidays.",
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
        <div className={`bg-[#f4f5f6] rounded-[20px] p-6 shrink-0 ${className}`}>
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                    <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                </div>
                <div>
                    <h4 className="font-semibold text-[15px] text-gray-500 mb-0.5">{review.name}</h4>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-[15px] text-black">{review.rating}</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg key={star} className="w-3.5 h-3.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <p className="text-[16px] font-medium text-black leading-[1.4]">
                {review.review}
            </p>
        </div>
    );
}

export default function ReviewsSection({
    title = "What travellers say about our tours",
    pillClasses = "bg-[#e8e9eb] text-gray-500",
    btnClasses = "bg-[#111] hover:bg-black",
    btnText = "Plan Your Trip",
    titleClassName = "text-[32px] md:text-[40px] font-medium leading-tight text-gray-900",
}: {
    title?: string;
    pillClasses?: string;
    btnClasses?: string;
    btnText?: string;
    titleClassName?: string;
} = {}) {
    return (
        <section className="mx-auto mt-32 mb-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-transparent">
                <div className="max-w-[700px]">
                    <div className={`inline-block px-5 py-2 rounded-full text-[13px] font-semibold tracking-wide mb-6 ${pillClasses}`}>
                        Reviews
                    </div>
                    <h2 className={titleClassName}>
                        {title}
                    </h2>
                </div>
                <div className="max-w-[320px] text-right mt-6 md:mt-0">
                    <p className="text-[15px] font-medium text-black leading-[1.4]">
                        Enjoy journey we organise is built on trust, safety and unforgettable views
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[420px]">
                {/* Left Card: CTA */}
                <div className="bg-[#f4f5f6] rounded-[24px] p-8 md:p-10 flex flex-col justify-between h-full min-h-[300px]">
                    <div className="flex items-center gap-4">
                        <div className="flex items-baseline font-medium text-black">
                            <span className="text-[56px] leading-none tracking-tight">4.9</span>
                            <span className="text-[24px] text-gray-400">/5</span>
                        </div>
                        <p className="text-[16px] font-medium text-black leading-tight max-w-[140px]">
                            Based on 280+ verified travlers
                        </p>
                    </div>

                    <div>
                        <p className="text-[20px] text-black font-medium leading-tight mb-6 max-w-[220px]">
                            Ready to plan your own journey? Let's get started!
                        </p>
                        <div className="flex items-center gap-3 group">
                            <button className={`${btnClasses} text-white px-6 py-3.5 rounded-full font-medium text-[15px] transition-all`}>
                                {btnText}
                            </button>
                            <button className={`${btnClasses} text-white w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0`}>
                                <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19L19 5M19 5v10M19 5H9" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Middle Card: Image Review */}
                <div className="relative rounded-[24px] overflow-hidden h-full min-h-[350px]">
                    <img
                        src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=3540&auto=format&fit=crop"
                        alt="Travellers exploring"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

                    <div className="absolute bottom-8 left-8 right-8 text-white z-10">
                        <p className="text-white/80 text-[14px] mb-2 font-medium">Alexa, 23 March 2025</p>
                        <p className="text-[18px] font-medium leading-[1.3]">
                            Beautiful beaches, vibrant nightlife, delicious seafood.
                        </p>
                    </div>
                </div>

                {/* Right Card: Auto-scrolling Reviews */}
                <div className="flex flex-col overflow-hidden relative h-[420px]">
                    {/* Top fade */}
                    <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent pointer-events-none z-20"></div>

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
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none z-20"></div>
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
