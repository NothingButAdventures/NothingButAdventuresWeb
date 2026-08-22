"use client";

import React, { useState } from "react";
import Link from "next/link";

const faqData = [
    {
        id: 1,
        question: "What should I bring for the tour?",
        answer: "We recommend comfortable walking shoes, weather-appropriate clothing, a reusable water bottle, sunscreen, a hat, and your camera to capture unforgettable moments."
    },
    {
        id: 2,
        question: "Is pickup and drop-off included?",
        answer: "Yes, complimentary hotel pickup and drop-off are included for most of our guided experiences. Detailed instructions will be shared after booking."
    },
    {
        id: 3,
        question: "Are the tours suitable for children?",
        answer: "Our tours are family-friendly and designed to be enjoyable for all age groups. Small group sizes ensure safety and personalized attention throughout."
    },
    {
        id: 4,
        question: "What happens in case of bad weather?",
        answer: "Safety is our highest priority. In the event of severe weather, we offer free rescheduling or full refunds for affected outdoor activities."
    }
];

export default function FaqSection() {
    const [openId, setOpenId] = useState<number | null>(null);

    const toggleFaq = (id: number) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <section className="mx-auto mt-20 sm:mt-24 md:mt-28 mb-16 font-outfit">
            {/* Top Header Section (#5091:7671) */}
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 md:mb-10 gap-4">
                <div className="inline-flex items-center justify-center px-3.5 py-1 bg-[rgba(26,26,26,0.05)] text-[rgba(26,26,26,0.55)] rounded-[110px] text-[14px] font-medium tracking-normal font-outfit w-fit">
                    FAQ
                </div>

                {/* Heading (#5091:7676) */}
                <h2 className="text-3xl sm:text-4xl md:text-[44px] lg:text-[48px] font-normal leading-tight text-[#1A1A1A] tracking-tight font-outfit max-w-3xl text-left md:text-right">
                    Everything you need to know before your journey — <br className="hidden sm:inline" />
                    <span className="font-gochi text-[#254B02]">from booking to what to pack.</span>
                </h2>
            </div>

            {/* Bottom Content Grid (Left Photo + Right Accordion #5091:7674, #5091:7677) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Side: Travel Photo Card (#5091:7674) */}
                <div className="col-span-1 lg:col-span-4 h-[360px] lg:h-[420px] rounded-[11px] overflow-hidden relative shadow-xs bg-gray-900 group">
                    <img
                        src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=3540&auto=format&fit=crop"
                        alt="Adventure traveller"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
                    />
                    <div className="absolute inset-0 bg-[rgba(26,26,26,0.2)] pointer-events-none" />
                </div>

                {/* Right Side: Accordion Items (#5091:7678) */}
                <div className="col-span-1 lg:col-span-8 flex flex-col gap-3">
                    {faqData.map((faq) => {
                        const isOpen = openId === faq.id;
                        return (
                            <div
                                key={faq.id}
                                onClick={() => toggleFaq(faq.id)}
                                className="bg-[rgba(181,185,177,0.12)] hover:bg-[rgba(181,185,177,0.2)] transition-all rounded-[12px] px-6 py-4.5 cursor-pointer"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <h3 className="text-base sm:text-[18px] font-normal text-[#1A1A1A] font-outfit">
                                        {faq.question}
                                    </h3>
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[#1A1A1A] shrink-0">
                                        <svg
                                            className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </div>
                                </div>

                                {isOpen && (
                                    <p className="mt-3.5 text-sm text-[#1A1A1A]/70 font-light leading-relaxed pt-2 border-t border-black/5">
                                        {faq.answer}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
