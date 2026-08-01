import Link from "next/link";
import React from "react";

export default function ExploreSection() {
    return (
        <section className="mx-auto mt-16 sm:mt-20 md:mt-24 mb-16">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 md:gap-12 lg:gap-14">
                {/* Left Content */}
                <div className="flex flex-col justify-center max-w-xl">
                    <div className="inline-block px-4 py-1.5 bg-red-600 text-white rounded-full text-xs sm:text-[13px] font-semibold tracking-wide w-fit mb-4">
                        Sale
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-normal leading-tight text-[#18181B] tracking-tight font-outfit mb-2.5">
                        The Adventure Sale is On
                    </h2>
                    <p className="text-gray-500 text-xs sm:text-sm md:text-base font-normal mb-7 font-outfit">
                        New to Sale Upto 50% OFF
                    </p>
                    <div className="flex items-center gap-3.5 group">
                        <Link
                            href="/trips"
                            className="inline-flex items-center justify-center bg-[#18181B] text-white px-8 py-3.5 rounded-full font-medium text-base sm:text-lg hover:bg-black transition-all border-2 border-[#18181B] cursor-pointer"
                        >
                            Start Exploring
                        </Link>
                        <Link
                            href="/trips"
                            className="inline-flex items-center justify-center bg-[#18181B] text-white w-13 h-13 rounded-full hover:bg-black transition-all border-2 border-[#18181B] shrink-0 cursor-pointer"
                            aria-label="Start Exploring"
                        >
                            <svg className="w-5.5 h-5.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* Right Cards Container */}
                <div className="flex flex-col sm:flex-row items-start gap-6 shrink-0 w-full lg:w-auto">
                    {/* Square Green Card */}
                    <div className="w-[235px] h-[235px] sm:w-[260px] sm:h-[260px] bg-[#234D0B] rounded-[22px] p-6 sm:p-7 flex flex-col justify-between shrink-0 shadow-xs">
                        <div>
                            <div className="text-5xl sm:text-6xl font-normal text-white leading-none font-outfit mb-1">
                                50%
                            </div>
                            <div className="text-xl sm:text-2xl text-white/95 font-normal leading-snug font-outfit">
                                Discount<br />on new<br />tours
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Link
                                href="/trips"
                                className="w-11 h-11 bg-white text-[#234D0B] rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-md"
                                aria-label="View discount tours"
                            >
                                <svg className="w-4.5 h-4.5 text-[#234D0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* Photo & Text Card */}
                    <div className="w-full sm:w-[330px] lg:w-[360px] flex flex-col justify-between shrink-0">
                        <div className="w-full h-[170px] rounded-[20px] overflow-hidden relative bg-gray-900">
                            <img
                                src="https://images.unsplash.com/photo-1517824806704-9040b037703b?q=80&w=1200&auto=format&fit=crop"
                                alt="Campfire under stars"
                                className="w-full h-full object-cover opacity-90"
                            />
                            {/* Live Sale Badge */}
                            <div className="absolute top-3.5 right-3.5 z-10">
                                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-xs border border-white/70 text-white px-3.5 py-1 rounded-full text-xs font-normal">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                    <span>Live Sale</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm sm:text-base text-[#18181B] font-normal leading-snug font-outfit mt-3.5">
                            Discover beautiful routes and scenic spots across Asia Region.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
