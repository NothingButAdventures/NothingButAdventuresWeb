import Link from "next/link";
import React from "react";

export default function ExploreSection() {
    return (
        <section className="mx-auto mt-16 sm:mt-20 md:mt-24 mb-16">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 md:gap-12 lg:gap-[68px]">
                {/* Left Content */}
                <div className="flex flex-col justify-center max-w-[533px]">
                    <div className="inline-flex items-center justify-center px-3.5 py-0.5 bg-[#FF0000] text-white rounded-full text-xs sm:text-[13px] font-semibold tracking-wide w-fit mb-4">
                        Sale
                    </div>
                    <div className="flex flex-col gap-3">
                        <h2 className="text-3xl sm:text-4xl lg:text-[32px] font-normal leading-[38px] text-[#1A1A1A] tracking-tight font-outfit mb-0">
                            The Adventure Sale is On
                        </h2>
                        <p className="text-[#1A1A1A] text-xs sm:text-[12px] font-normal font-outfit">
                            New to Sale Upto 50% OFF
                        </p>
                    </div>
                    <div className="group flex items-center gap-1 shrink-0 mt-8">
                        <Link
                            href="/trips"
                            className="inline-flex items-center justify-center bg-[#1A1A1A] group-hover:bg-black text-white px-5 py-3.5 rounded-[70px] font-medium text-[17px] font-outfit transition-all cursor-pointer ring-1 ring-[#1A1A1A] ring-offset-2 ring-offset-white"
                        >
                            Start Exploring
                        </Link>
                        <Link
                            href="/trips"
                            className="inline-flex items-center justify-center bg-[#1A1A1A] group-hover:bg-black text-white w-[54px] h-[54px] rounded-full transition-all shrink-0 cursor-pointer ring-1 ring-[#1A1A1A] ring-offset-2 ring-offset-white"
                            aria-label="Start Exploring"
                        >
                            <svg className="w-4.5 h-4.5 text-white transition-transform duration-300 group-hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* Right Cards Container */}
                <div className="flex flex-col sm:flex-row items-start gap-4 shrink-0 w-full lg:w-auto relative">
                    {/* Square Green Card */}
                    <div className="w-[226px] h-[210px] bg-[#254B02] rounded-[10px] p-5 flex flex-col justify-between shrink-0 relative">
                        <div>
                            <div className="text-[59px] font-normal text-white leading-none font-outfit mb-0">
                                50%
                            </div>
                            <div className="text-xl text-white/95 font-normal leading-snug font-outfit">
                                Discount<br />on new<br />tours
                            </div>
                        </div>
                        <div className="absolute bottom-4 right-4">
                            <Link
                                href="/trips"
                                className="w-9 h-9 bg-white text-[#254B02] rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform border border-[#1A1A1A]"
                                aria-label="View discount tours"
                            >
                                <svg className="w-4 h-4 text-[#254B02]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* Photo & Text Card */}
                    <div className="w-full sm:w-[365px] flex flex-col justify-between shrink-0">
                        <div className="w-full h-[147px] rounded-[10px] overflow-hidden relative bg-gray-900">
                            <img
                                src="https://images.unsplash.com/photo-1517824806704-9040b037703b?q=80&w=1200&auto=format&fit=crop"
                                alt="Campfire under stars"
                                className="w-full h-full object-cover opacity-90"
                            />
                            {/* Live Sale Badge */}
                            <div className="absolute top-2 right-2 z-10">
                                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-xs border border-white/70 text-white px-3 py-0.5 rounded-full text-xs font-normal">
                                    <span className="w-[11px] h-[11px] rounded-full bg-red-500 animate-pulse"></span>
                                    <span>Live Sale</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-base text-[#1A1A1A] font-medium leading-[26px] font-outfit mt-2.5">
                            Discover beautiful routes and scenic spots across Asia Region.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
