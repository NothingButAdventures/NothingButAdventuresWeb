import React from "react";

const tags = [
    {
        icon: (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
        ), label: "5+ Years of Experience"
    },
    {
        icon: (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ), label: "Local Experts"
    },
    {
        icon: (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ), label: "Support"
    },
    {
        icon: (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ), label: "Certified Desert Tours"
    },
    {
        icon: (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
        ), label: "Multilanguages"
    },
    {
        icon: (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
        ), label: "Safe Routes"
    },
];

export default function MeetLocalGuidesSection() {
    return (
        <section className="mx-auto mt-20 sm:mt-24 md:mt-28 lg:mt-32 mb-16">

            {/* Top Header Section aligned to 2-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-end mb-10">
                {/* Left Side: 6 Feature Pills (Aligned over Column 1) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-xl">
                    {tags.map((tag, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-[#F4F4F5] text-[#52525B] px-3.5 py-1.5 rounded-full font-medium text-xs font-outfit shadow-2xs">
                            <span className="text-[#52525B]">{tag.icon}</span>
                            <span>{tag.label}</span>
                        </div>
                    ))}
                </div>

                {/* Right Side: Heading starting at exact start of Column 2 (where 400+ Local Guides image begins) */}
                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[66px] font-normal leading-tight text-[#4F6D38] tracking-tight font-outfit text-left">
                    Meet Your Local Guides
                </h2>
            </div>

            {/* Cards Container */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

                {/* Left Card: Half-Image Half-Text */}
                <div className="bg-[#F5F5F3] rounded-[24px] flex flex-col sm:flex-row overflow-hidden h-full min-h-[360px] sm:min-h-[380px] shadow-xs">
                    {/* Image */}
                    <div className="w-full sm:w-1/2 min-h-[280px] sm:min-h-full relative shrink-0">
                        <img
                            src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=3540&auto=format&fit=crop"
                            alt="Guides smiling together"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 p-6 sm:p-8 md:p-9 flex flex-col justify-between font-outfit">
                        <div>
                            <h3 className="text-lg sm:text-xl font-semibold text-[#18181B] mb-3 leading-snug">
                                Step inside a journey guided by passion and experience
                            </h3>
                            <p className="text-sm sm:text-base text-gray-500 font-normal leading-relaxed mb-6">
                                Each tour is led by people who know every dune, story, and sunrise of AlUla guides who turn every route into a journey worth remembering.
                            </p>
                        </div>

                        {/* Social Media Circular Buttons */}
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#E4E4E7] text-[#52525B] flex items-center justify-center text-xs hover:bg-[#D4D4D8] transition-colors cursor-pointer" aria-label="Facebook">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            </div>
                            <div className="w-7 h-7 rounded-full bg-[#E4E4E7] text-[#52525B] flex items-center justify-center text-xs hover:bg-[#D4D4D8] transition-colors cursor-pointer" aria-label="Instagram">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                            </div>
                            <div className="w-7 h-7 rounded-full bg-[#E4E4E7] text-[#52525B] flex items-center justify-center text-xs hover:bg-[#D4D4D8] transition-colors cursor-pointer" aria-label="Twitter">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            </div>
                            <div className="w-7 h-7 rounded-full bg-[#E4E4E7] text-[#52525B] flex items-center justify-center text-xs hover:bg-[#D4D4D8] transition-colors cursor-pointer" aria-label="YouTube">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Card: Guide Profile Card */}
                <div className="bg-white rounded-[24px] flex flex-col sm:flex-row items-center gap-6 p-4 sm:p-0 h-full min-h-[360px] sm:min-h-[380px]">
                    <div className="w-full sm:w-1/2 min-h-[280px] sm:min-h-full rounded-[24px] overflow-hidden relative shrink-0 bg-gray-900 group shadow-xs">
                        <img
                            src="https://images.unsplash.com/photo-1620311488184-e9ed711c1109?q=80&w=3540&auto=format&fit=crop"
                            alt="Amir - Founder & Lead Guide"
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
                        />
                        {/* Carousel Dots */}
                        <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-1.5 z-10">
                            <div className="w-6 h-1 rounded-full bg-white"></div>
                            <div className="w-1.5 h-1 rounded-full bg-white/50"></div>
                            <div className="w-1.5 h-1 rounded-full bg-white/50"></div>
                            <div className="w-1.5 h-1 rounded-full bg-white/50"></div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                    </div>

                    <div className="flex-1 p-4 sm:p-8 md:p-9 flex flex-col justify-between font-outfit">
                        <div>
                            <div className="inline-block px-3.5 py-1 bg-[#3B5424] text-white rounded-full text-xs font-medium mb-3">
                                400+ Local Guides
                            </div>
                            <p className="text-sm sm:text-base md:text-lg text-[#18181B] font-normal leading-relaxed mb-4">
                                “Every trip is personal. We keep groups small to make sure your experience feels private, safe, and unforgettable.”
                            </p>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400 font-normal">
                            — Amir , Founder & Lead Guide
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
