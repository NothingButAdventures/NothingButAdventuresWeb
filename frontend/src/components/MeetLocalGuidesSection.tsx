import React from "react";

const tags = [
    {
        icon: (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
        ), label: "5+ Years of Experience"
    },
    {
        icon: (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ), label: "Local Experts"
    },
    {
        icon: (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ), label: "Support"
    },
    {
        icon: (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ), label: "Certified Desert Tours"
    },
    {
        icon: (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
        ), label: "Multilanguages"
    },
    {
        icon: (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
        ), label: "Safe Routes"
    },
];

export default function MeetLocalGuidesSection() {
    return (
        <section className="mx-auto mt-24 mb-16">

            {/* Top Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-12">
                <div className="flex flex-wrap gap-3 max-w-[600px]">
                    {tags.map((tag, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-[#f4f5f6] text-[#1a1a1a] px-4 py-2 rounded-full font-medium text-[13px] border border-transparent shadow-sm">
                            <span className="text-[#5b6360]">{tag.icon}</span>
                            {tag.label}
                        </div>
                    ))}
                </div>
                <h2 className="text-[48px] md:text-[64px] font-medium leading-[1.1] text-black">
                    Meet Your Local Guides
                </h2>
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto">

                {/* Left Side: Half-Image Half-Text Card */}
                <div className="bg-[#fbfafe] rounded-[24px] flex flex-col sm:flex-row overflow-hidden h-full drop-shadow-sm border border-black/[0.03]">
                    {/* Image */}
                    <div className="w-full sm:w-[45%] h-[300px] sm:h-full relative shrink-0">
                        <img
                            src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=3540&auto=format&fit=crop"
                            alt="Guides smiling together"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 p-8 md:p-10 flex flex-col justify-center bg-[#fafafc]">
                        <h3 className="text-[28px] md:text-[32px] font-semibold text-black leading-[1.2] mb-6">
                            Step inside a journey guided by passion and experience
                        </h3>
                        <p className="text-[17px] text-[#1a1a1a] font-medium leading-[1.6] mb-10">
                            Each tour is led by people who know every dune, story, and sunrise of AlUla guides who turn every route into a journey worth remembering.
                        </p>

                        {/* Social Icons Placeholder */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors cursor-pointer"><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg></div>
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors cursor-pointer"><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg></div>
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors cursor-pointer"><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg></div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Guide Profile Card */}
                <div className="flex flex-col sm:flex-row items-center gap-8 md:gap-12 pl-0 md:pl-6">
                    <div className="relative w-full sm:w-[50%] h-[350px] sm:h-full max-h-[480px] rounded-[24px] overflow-hidden shrink-0 group">
                        <img
                            src="https://images.unsplash.com/photo-1620311488184-e9ed711c1109?q=80&w=3540&auto=format&fit=crop"
                            alt="Guide Portrait"
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
                        />
                        {/* Carousel Dots Placeholder */}
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
                            <div className="w-6 h-1 rounded-full bg-white"></div>
                            <div className="w-2 h-1 rounded-full bg-white/40"></div>
                            <div className="w-2 h-1 rounded-full bg-white/40"></div>
                            <div className="w-2 h-1 rounded-full bg-white/40"></div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                    </div>

                    <div className="flex-1 pb-6 sm:pb-0">
                        <div className="inline-block px-4 py-1.5 bg-[#DEECFF] text-gray-500 rounded-full text-[13px] font-semibold tracking-wide mb-6 shadow-sm">
                            400+ Local Guides
                        </div>
                        <p className="text-[20px] md:text-[22px] font-medium text-black leading-[1.5] mb-6 relative">
                            "Every trip is personal. We keep groups small to make sure your experience feels private, safe, and unforgettable."
                        </p>
                        <div className="text-[#5b6360] font-medium text-[15px]">
                            — Amir , Founder & Lead Guide
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
