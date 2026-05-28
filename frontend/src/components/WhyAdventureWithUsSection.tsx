import React from "react";

const reasons = [
    {
        icon: (
            <svg className="w-5 h-5 text-[#24362b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
        title: "Go Anywhere, Guaranteed",
        description: "The World is worth exploring, join a small group of explorers",
    },
    {
        icon: (
            <svg className="w-5 h-5 text-[#24362b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
        title: "Expert Local Guides",
        description: "Passionate, knowledgeable guides who bring India's stories and culture to life",
    },
    {
        icon: (
            <svg className="w-5 h-5 text-[#24362b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        ),
        title: "Authentic Experiences",
        description: "Beyond tourist spots, we create genuine connections with local communities and traditions",
    },
    {
        icon: (
            <svg className="w-5 h-5 text-[#24362b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 9l.5-1.5L10 7l-1.5-.5L8 5l-.5 1.5L6 7l1.5.5L8 9zm8 8l.5-1.5L18 15l-1.5-.5L16 13l-.5 1.5L14 15l1.5.5L16 17z" />
            </svg>
        ),
        title: "Curated Excellence",
        description: "Handpicked accommodations, restaurants, and activities for unforgettable moments",
    },
    {
        icon: (
            <svg className="w-5 h-5 text-[#24362b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="7" y="4" width="10" height="16" rx="1" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
                <circle cx="12" cy="10" r="1.5" fill="currentColor" />
            </svg>
        ),
        title: "Flexible Itineraries",
        description: "Fully customizable trips designed around your interests, pace, and preferences",
    },
    {
        icon: (
            <svg className="w-5 h-5 text-[#24362b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10V8a9 9 0 0118 0v2M3 10v4a2 2 0 002 2h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2zm18 0v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4a2 2 0 012-2h2a2 2 0 012 2z" />
            </svg>
        ),
        title: "Seamless Support",
        description: "From planning to return, dedicated support ensures a stress-free experience",
    }
];

export default function WhyAdventureWithUsSection() {
    return (
        <section className="mx-auto mt-24 mb-16">
            <div className="mb-10">
                <div className="inline-block px-4 py-1.5 bg-[#DEECFF] text-gray-500 rounded-full text-[13px] font-semibold tracking-wide mb-6">
                    About
                </div>
                <h2 className="text-[48px] md:text-[64px] font-medium leading-[1.1] text-black mb-4">
                    Why Travel With Us
                </h2>
                <p className="text-[17px] md:text-[18px] text-black font-semibold leading-[1.6]">
                    We're not just a tour operator—we're your trusted partner in creating life-changing journeys
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {reasons.map((reason, index) => (
                    <div key={index} className="bg-[#f8f9fa] rounded-[20px] p-6 lg:p-8 flex flex-col h-full hover:shadow-sm transition-shadow">
                        <div className="w-12 h-12 bg-[#eaeeec] rounded-full flex items-center justify-center mb-5 shrink-0">
                            {reason.icon}
                        </div>
                        <h3 className="text-[18px] font-semibold text-[#1a1a1a] mb-2 leading-tight">
                            {reason.title}
                        </h3>
                        <p className="text-[#5b6360] text-[15px] leading-[1.6]">
                            {reason.description}
                        </p>
                    </div>
                ))}
            </div>

            {/* Dark Stats Banner */}
            <div className="bg-[#18181A] text-white rounded-[20px] py-10 px-6 md:px-12 flex flex-col md:flex-row items-center justify-around gap-8 md:gap-4">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="text-[36px] md:text-[40px] font-semibold leading-none mb-2.5">100%</div>
                    <div className="text-[14px] font-medium text-white/60">Money-Back Guarantee</div>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="text-[36px] md:text-[40px] font-semibold leading-none mb-2.5">24/7</div>
                    <div className="text-[14px] font-medium text-white/60">Travel Support</div>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="text-[36px] md:text-[40px] font-semibold leading-none mb-2.5">8+</div>
                    <div className="text-[14px] font-medium text-white/60">Years Experience</div>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="text-[36px] md:text-[40px] font-semibold leading-none mb-2.5">98%</div>
                    <div className="text-[14px] font-medium text-white/60">Customer Satisfaction</div>
                </div>
            </div>
        </section>
    );
}
