import Link from "next/link";
import React from "react";

export default function ExploreSection() {
    return (
        <section className="mx-auto mt-32 mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                {/* Left Side */}
                <div className="pr-0 md:pr-10">
                    <div className="inline-block px-4 py-1 bg-[#e8e9eb] text-gray-500 rounded-full text-[13px] font-medium tracking-wide mb-6">
                        Explore
                    </div>
                    <h2 className="text-[32px] md:text-[36px] lg:text-[40px] font-medium leading-[1.2] text-[#1a1a1a] mb-8">
                        Discover beautiful routes and scenic spots across Asia Region.
                    </h2>
                    <div className="flex items-center gap-3 group">
                        <Link href="/tours" className="inline-flex items-center justify-center bg-[#111] text-white px-7 py-3 rounded-full font-medium text-[16px] hover:bg-black hover:scale-105 transition-all">
                            Start Exploring
                        </Link>
                        <Link href="/tours" className="inline-flex items-center justify-center bg-[#111] text-white w-12 h-12 rounded-full hover:bg-black hover:scale-105 transition-all shrink-0">
                            <svg className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 19L19 5M19 5v10M19 5H9" />
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* Right Side */}
                <div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Green Stats Card */}
                        <div className="bg-[#24362b] h-60 text-white rounded-[16px] p-6 lg:p-7 flex flex-col justify-between relative aspect-square overflow-hidden group">
                            <div>
                                <div className="text-[44px] md:text-[52px] font-semibold leading-none mb-2.5">50+</div>
                                <div className="text-[18px] md:text-[20px] font-medium leading-[1.3] text-white/95">
                                    Hidden Places<br />In Asia
                                </div>
                            </div>
                            <div className="absolute bottom-5 right-5 lg:bottom-6 lg:right-6">
                                <Link href="/tours?region=asia" className="w-9 h-9 md:w-10 md:h-10 bg-white text-black rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-md">
                                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19L19 5M19 5v10M19 5H9" />
                                    </svg>
                                </Link>
                            </div>
                        </div>

                        {/* Image & Text Card */}
                        <div className="flex flex-col gap-3 flex-1 min-w-0">
                            <div className="w-full flex-1 rounded-[16px] overflow-hidden min-h-[200px] max-h-[200px] md:max-h-[160px]">
                                <img
                                    src="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=2000&auto=format&fit=crop"
                                    alt="Scenic spots across Asia"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <p className="text-[16px] md:text-[17px] text-[#1a1a1a] font-medium leading-[1.3] pr-2">
                                Discover beautiful routes and scenic spots across Asia Region.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
