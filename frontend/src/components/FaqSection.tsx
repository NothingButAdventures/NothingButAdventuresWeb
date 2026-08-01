"use client";

import React, { useState } from "react";

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
        <section className="mx-auto mt-20 sm:mt-24 md:mt-28 lg:mt-32 mb-16 font-outfit">
            {/* Top Header Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-10">
                {/* Left Badge */}
                <div className="col-span-1 lg:col-span-3">
                    <div className="inline-block px-3.5 py-1 bg-[#F4F4F5] text-[#71717A] rounded-full text-xs font-medium tracking-normal mb-3">
                        FAQ
                    </div>
                </div>

                {/* Right Heading */}
                <div className="col-span-1 lg:col-span-9">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[58px] font-normal leading-[1.12] text-[#18181B] tracking-tight">
                        Everything you need to know before your<br className="hidden sm:inline" />{" "}
                        journey — <span className="font-gochi text-[#4F6D38]">from booking to what to pack.</span>
                    </h2>
                </div>
            </div>

            {/* Bottom Content Grid (Image + Accordion) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                {/* Left Side: Photo Card (Narrower width 3 cols) */}
                <div className="col-span-1 lg:col-span-3 relative rounded-[24px] overflow-hidden h-[420px] sm:h-[480px] lg:h-[520px] bg-gray-900 shadow-xs group">
                    <img
                        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=3540&auto=format&fit=crop"
                        alt="Friends enjoying lake view"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
                    />
                </div>

                {/* Right Side: Accordion Items (Wider width 9 cols) */}
                <div className="col-span-1 lg:col-span-9 flex flex-col gap-3.5">
                    {faqData.map((faq) => {
                        const isOpen = openId === faq.id;
                        return (
                            <div
                                key={faq.id}
                                onClick={() => toggleFaq(faq.id)}
                                className="bg-[#F5F5F3] hover:bg-[#EFEFEF] transition-all rounded-[20px] px-6 py-3.5 sm:py-4 cursor-pointer"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <h3 className="text-base sm:text-lg font-medium text-[#18181B] font-outfit">
                                        {faq.question}
                                    </h3>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#18181B] shrink-0">
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
                                    <p className="mt-3.5 text-xs sm:text-sm text-gray-600 font-normal leading-relaxed pt-2 border-t border-black/5">
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
