import Link from "next/link";
import React from "react";

export default function ExploreSection() {
    return (
        <section className="w-full relative font-outfit mt-10 sm:mt-16 md:mt-20 xl:mt-[120px] mb-12 sm:mb-20">
            {/* Mobile View (#5640:5529, #5640:5537, #5640:5550) */}
            <div className="block lg:hidden w-full max-w-[359px] mx-auto">
                {/* Header (#5640:5529) */}
                <div className="mb-[18px]">
                    {/* Sale Badge (#5640:5530, width: 42.99px, height: 15.17px, bg: #FF0000) */}
                    <div className="inline-flex items-center justify-center w-[43px] h-[15.17px] bg-[#FF0000] text-white rounded-[69.54px] text-[8.85px] font-medium tracking-normal mb-[8px] font-outfit">
                        Sale
                    </div>

                    {/* Headline & Dual Action Button Row (#5640:5532) */}
                    <div className="flex items-end justify-between gap-3 w-full">
                        <div>
                            <h2 className="text-[20.23px] font-normal leading-[24px] text-[#1A1A1A] tracking-normal font-outfit mb-0">
                                The Adventure Sale <br />
                                is On
                            </h2>
                            <p className="text-[#1A1A1A] text-[8px] font-normal leading-normal font-outfit mt-[3px]">
                                New to Sale Upto 50% OFF
                            </p>
                        </div>

                        {/* Dual Action Pill Button (#5640:5536) */}
                        <div className="flex items-center gap-[2.5px] shrink-0 group">
                            <Link
                                href="/trips"
                                className="relative inline-flex items-center justify-center w-[115px] h-[34.14px] bg-[#1A1A1A] group-hover:bg-black text-white rounded-[44.25px] font-medium text-[12.64px] font-sans transition-all cursor-pointer overflow-hidden p-[1px]"
                            >
                                <span className="relative z-10">Start Exploring</span>
                                <span className="absolute inset-[1px] rounded-[44.25px] border border-white/20 pointer-events-none" />
                            </Link>

                            <Link
                                href="/trips"
                                className="relative inline-flex items-center justify-center w-[34.14px] h-[34.14px] bg-[#1A1A1A] group-hover:bg-black text-white rounded-full transition-all shrink-0 cursor-pointer overflow-hidden p-[1px]"
                                aria-label="Start Exploring"
                            >
                                <svg className="w-[10px] h-[10px] text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 13L13 1M13 1H3M13 1V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="absolute inset-[1px] rounded-full border border-[#F4F4F4]/30 pointer-events-none" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Cards Container */}
                <div className="flex flex-col gap-[14px] w-full">
                    {/* Card 1: Green 50% Banner Card (#5640:5537, 359px x 82.46px, bg: #254B02) */}
                    <div className="relative w-full h-[82.46px] bg-[#254B02] rounded-[16px] px-[16px] py-[8px] flex items-center justify-between overflow-hidden">
                        <div className="flex flex-col justify-center">
                            <div className="text-[37.3px] font-normal text-white font-outfit leading-none">
                                50%
                            </div>
                            <div className="text-[18.33px] font-normal text-white font-outfit leading-tight mt-0.5">
                                Discount on new tours
                            </div>
                        </div>

                        {/* Circular Arrow Button (#5640:5541, 25.19px x 25.29px) */}
                        <Link
                            href="/trips"
                            className="relative w-[25.19px] h-[25.29px] rounded-full border border-white flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform shrink-0"
                            aria-label="View discount tours"
                        >
                            <svg className="w-[8px] h-[8px] text-white" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 13L13 1M13 1H3M13 1V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                    </div>

                    {/* Card 2: Photo + Caption Card (#5640:5550, 359px x 177.34px) */}
                    <div className="flex flex-col w-full">
                        {/* Image Frame (#5640:5552, 359px x 144.74px) */}
                        <div className="w-full h-[144.74px] rounded-[16px] overflow-hidden relative bg-gray-900">
                            <img
                                src="https://images.unsplash.com/photo-1517824806704-9040b037703b?q=80&w=1200&auto=format&fit=crop"
                                alt="Scenic adventure landscape"
                                className="w-full h-full object-cover"
                            />
                            {/* Live Sale Badge (#5640:5554, 63.72px x 13.4px) */}
                            <div className="absolute top-[11.22px] right-[11.22px] z-10">
                                <div className="flex items-center gap-[5px] bg-black/40 backdrop-blur-xs border border-white text-white px-[8px] py-[2px] rounded-[50px] text-[10px] font-normal leading-[10px] font-outfit">
                                    <span className="w-[6px] h-[6px] rounded-full bg-[#FF0000] shrink-0 animate-pulse"></span>
                                    <span>Live Sale</span>
                                </div>
                            </div>
                        </div>

                        {/* Caption Text (#5640:5553, fontSize: 12.37px, fontWeight: 300) */}
                        <p className="text-[12.37px] text-[#1A1A1A] font-light leading-normal font-outfit mt-[6px] max-w-[267px]">
                            Discover beautiful routes and scenic spots across Asia Region.
                        </p>
                    </div>
                </div>
            </div>

            {/* Desktop View (#5091:7503, width: 1210px, gap: 68px) */}
            <div className="hidden lg:flex flex-row items-center justify-between gap-[68px] w-full">
                {/* Left Content (#5091:7504, width: 533px, gap: 36px) */}
                <div className="flex flex-col justify-center w-[533px] shrink-0">
                    {/* Sale Badge (#5091:7505, width: 68px, height: 24px, bg: #FF0000) */}
                    <div className="inline-flex items-center justify-center w-[68px] h-[24px] bg-[#FF0000] text-white rounded-[110px] text-[14px] font-medium tracking-normal mb-[36px] font-outfit">
                        Sale
                    </div>

                    {/* Headline & Subtitle (#5091:7508) */}
                    <div className="flex flex-col">
                        <h2 className="text-[32px] font-normal leading-[38px] text-[#1A1A1A] tracking-normal font-outfit mb-0">
                            The Adventure Sale is On
                        </h2>
                        <p className="text-[#1A1A1A] text-[12px] font-normal leading-normal font-outfit mt-[4px]">
                            New to Sale Upto 50% OFF
                        </p>
                    </div>

                    {/* Dual Action Pill Button (#5091:7511) */}
                    <div className="flex items-center gap-[4px] mt-[20px] w-fit group">
                        {/* Main Button Pill (#I5091:7511;2951:1032, 182px x 54px) */}
                        <Link
                            href="/trips"
                            className="relative inline-flex items-center justify-center w-[182px] h-[54px] bg-[#1A1A1A] group-hover:bg-black text-white rounded-[70px] font-medium text-[20px] font-outfit transition-all cursor-pointer overflow-hidden p-[2px]"
                        >
                            <span className="relative z-10">Start Exploring</span>
                            {/* Inner 1px border (#I5091:7511;2951:1034) */}
                            <span className="absolute inset-[2px] rounded-[25px] border border-white/20 pointer-events-none" />
                        </Link>

                        {/* Circular Arrow Button (#I5091:7511;2951:1035, 54px x 54px) */}
                        <Link
                            href="/trips"
                            className="relative inline-flex items-center justify-center w-[54px] h-[54px] bg-[#1A1A1A] group-hover:bg-black text-white rounded-full transition-all shrink-0 cursor-pointer overflow-hidden p-[2px]"
                            aria-label="Start Exploring"
                        >
                            <svg className="w-[14px] h-[14px] text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 13L13 1M13 1H3M13 1V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {/* Outer ellipse ring stroke (#I5091:7511;2951:1042) */}
                            <span className="absolute inset-[2px] rounded-full border border-[#F4F4F4]/30 pointer-events-none" />
                        </Link>
                    </div>
                </div>

                {/* Right Cards Container (#5091:7512, width: 610px, gap: 16px) */}
                <div className="flex flex-row items-start gap-[16px] w-[610px] shrink-0">
                    {/* Square Green 50% Discount Card (#5091:7513, 226px x 210px) */}
                    <div className="w-[226px] h-[210px] bg-[#254B02] rounded-[10px] p-[20px] pt-[24px] flex flex-col justify-between shrink-0 relative overflow-hidden">
                        <div>
                            {/* 50% (#ts18) */}
                            <div className="text-[58px] font-normal text-white leading-none font-outfit mb-0.5">
                                50%
                            </div>
                            {/* Discount on new tours (#5091:7516, fontSize: 27px, fontWeight: 400, lineHeight: 35px) */}
                            <div className="text-[27px] text-white font-normal leading-[35px] font-outfit mt-1 tracking-normal">
                                Discount<br />on new<br />tours
                            </div>
                        </div>

                        {/* Circular Arrow Button (#5091:7517, 40px x 40px at bottom-right) */}
                        <div className="absolute right-[16px] bottom-[16px]">
                            <Link
                                href="/trips"
                                className="relative w-[40px] h-[40px] bg-white text-[#254B02] rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                                aria-label="View discount tours"
                            >
                                <svg className="w-[14px] h-[14px] text-[#254B02]" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 13L13 1M13 1H3M13 1V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="absolute inset-0 rounded-full border border-white pointer-events-none" />
                            </Link>
                        </div>
                    </div>

                    {/* Photo + Caption Card (#5091:7514 & #5091:7515, width: 365px) */}
                    <div className="w-[365px] flex flex-col shrink-0">
                        {/* Image Frame (#5091:7514, 365px x 147px) */}
                        <div className="w-full h-[147px] rounded-[10px] overflow-hidden relative bg-gray-900">
                            <img
                                src="https://images.unsplash.com/photo-1517824806704-9040b037703b?q=80&w=1200&auto=format&fit=crop"
                                alt="Scenic adventure landscape"
                                className="w-full h-full object-cover"
                            />
                            {/* Live Sale Badge (#5091:7527, 90px x 19px, border-radius: 50px) */}
                            <div className="absolute top-[8px] right-[8px] z-10">
                                <div className="flex items-center gap-[6px] bg-black/40 backdrop-blur-xs border border-white text-white px-[8px] py-[2px] rounded-[50px] text-[13px] font-normal leading-[13px] font-outfit">
                                    <span className="w-[8px] h-[8px] rounded-full bg-[#FF0000] shrink-0 animate-pulse"></span>
                                    <span>Live Sale</span>
                                </div>
                            </div>
                        </div>

                        {/* Caption Text (#5091:7515, 363px x 53px, 16px font, 26px line-height) */}
                        <p className="text-[16px] text-[#1A1A1A] font-medium leading-[26.09px] font-outfit mt-[10px]">
                            Discover beautiful routes and scenic spots across Asia Region.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
