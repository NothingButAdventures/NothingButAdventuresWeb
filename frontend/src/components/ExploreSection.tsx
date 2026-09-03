import Link from "next/link";
import React from "react";

export default function ExploreSection() {
    return (
        <section className="w-full relative font-outfit mt-8 sm:mt-16 md:mt-[60px] lg:mt-[90px] xl:mt-[120px] mb-8 md:mb-12 xl:mb-20">
            {/* Mobile View (#5640:5529, #5640:5537, #5640:5550) */}
            <div className="block md:hidden w-full max-w-[359px] mx-auto">
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

            {/* Desktop View (#5640:7513 on 785px: width 742px, gap 41.7px / #5091:7503 on 1280px: width 1210px, gap 68px) */}
            <div className="hidden md:flex flex-row items-center justify-between gap-[24px] lg:gap-[45px] xl:gap-[68px] w-full">
                {/* Left Content (#5640:7514 on 785px: 326.88px / #5091:7504 on 1280px: 533px) */}
                <div className="flex flex-col justify-center w-[326.9px] lg:w-[430px] xl:w-[533px] shrink-0">
                    {/* Sale Badge (#5640:7515 on 785px: 41.7px x 14.72px / #5091:7505 on 1280px: 68px x 24px) */}
                    <div className="inline-flex items-center justify-center w-[41.7px] lg:w-[55px] xl:w-[68px] h-[14.72px] lg:h-[19px] xl:h-[24px] bg-[#FF0000] text-white rounded-[67px] xl:rounded-[110px] text-[8.59px] lg:text-[11px] xl:text-[14px] font-medium tracking-normal mb-[22px] lg:mb-[28px] xl:mb-[36px] font-outfit">
                        Sale
                    </div>

                    {/* Headline & Subtitle (#5640:7518) */}
                    <div className="flex flex-col">
                        <h2 className="text-[19.63px] lg:text-[26px] xl:text-[32px] font-normal leading-[23.3px] lg:leading-[30px] xl:leading-[38px] text-[#1A1A1A] tracking-normal font-outfit mb-0">
                            The Adventure Sale is On
                        </h2>
                        <p className="text-[#1A1A1A] text-[7.36px] lg:text-[9.5px] xl:text-[12px] font-normal leading-normal font-outfit mt-[2.5px] lg:mt-[3px] xl:mt-[4px]">
                            New to Sale Upto 50% OFF
                        </p>
                    </div>

                    {/* Dual Action Pill Button (#5640:7521 on 785px / #5091:7511 on 1280px) */}
                    <div className="flex items-center gap-[2.45px] lg:gap-[3.2px] xl:gap-[4px] mt-[12px] lg:mt-[16px] xl:mt-[20px] w-fit group">
                        {/* Main Button Pill (#I5640:7521;2951:1032 on 785px: 111.62px x 33.12px / 1280px: 182px x 54px) */}
                        <Link
                            href="/trips"
                            className="relative inline-flex items-center justify-center w-[111.6px] lg:w-[146px] xl:w-[182px] h-[33.12px] lg:h-[43px] xl:h-[54px] bg-[#1A1A1A] group-hover:bg-black text-white rounded-[42px] xl:rounded-[70px] font-medium text-[12.27px] lg:text-[16px] xl:text-[20px] font-outfit transition-all cursor-pointer overflow-hidden p-[1.5px] xl:p-[2px]"
                        >
                            <span className="relative z-10">Start Exploring</span>
                            {/* Inner 1px border */}
                            <span className="absolute inset-[1.5px] xl:inset-[2px] rounded-[15px] xl:rounded-[25px] border border-white/20 pointer-events-none" />
                        </Link>

                        {/* Circular Arrow Button (#I5640:7521;2951:1035 on 785px: 33.12px x 33.12px / 1280px: 54px x 54px) */}
                        <Link
                            href="/trips"
                            className="relative inline-flex items-center justify-center w-[33.12px] lg:w-[43px] xl:w-[54px] h-[33.12px] lg:h-[43px] xl:h-[54px] bg-[#1A1A1A] group-hover:bg-black text-white rounded-full transition-all shrink-0 cursor-pointer overflow-hidden p-[1.5px] xl:p-[2px]"
                            aria-label="Start Exploring"
                        >
                            <svg className="w-[8px] h-[8px] lg:w-[11px] lg:h-[11px] xl:w-[14px] xl:h-[14px] text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 13L13 1M13 1H3M13 1V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {/* Outer ellipse ring stroke */}
                            <span className="absolute inset-[1.5px] xl:inset-[2px] rounded-full border border-[#F4F4F4]/30 pointer-events-none" />
                        </Link>
                    </div>
                </div>

                {/* Right Cards Container (#5640:7522 on 785px: 374.1px / #5091:7512 on 1280px: 610px) */}
                <div className="flex flex-row items-start gap-[9.8px] lg:gap-[13px] xl:gap-[16px] w-[374.1px] lg:w-[490px] xl:w-[610px] shrink-0">
                    {/* Square Green 50% Discount Card (#5640:7523 on 785px: 138.6px x 128.79px / #5091:7513 on 1280px: 226px x 210px) */}
                    <div className="w-[138.6px] lg:w-[182px] xl:w-[226px] h-[128.79px] lg:h-[170px] xl:h-[210px] bg-[#254B02] rounded-[6.1px] xl:rounded-[10px] p-[12px] lg:p-[16px] xl:p-[20px] pt-[14px] lg:pt-[19px] xl:pt-[24px] flex flex-col justify-between shrink-0 relative overflow-hidden">
                        <div>
                            {/* 50% (#ts18 on 785px: 35.6px / 1280px: 58px) */}
                            <div className="text-[35.6px] lg:text-[46px] xl:text-[58px] font-normal text-white leading-none font-outfit mb-0.5">
                                50%
                            </div>
                            {/* Discount on new tours (#5640:7526 on 785px: 16.56px / 1280px: 27px) */}
                            <div className="text-[16.56px] lg:text-[22px] xl:text-[27px] text-white font-normal leading-[21.46px] lg:leading-[28px] xl:leading-[35px] font-outfit mt-1 tracking-normal">
                                Discount<br />on new<br />tours
                            </div>
                        </div>

                        {/* Circular Arrow Button (#5640:7527 on 785px: 24.53px x 24.53px / #5091:7517 on 1280px: 40px x 40px) */}
                        <div className="absolute right-[10px] bottom-[10px] lg:right-[13px] lg:bottom-[13px] xl:right-[16px] xl:bottom-[16px]">
                            <Link
                                href="/trips"
                                className="relative w-[24.53px] lg:w-[32px] xl:w-[40px] h-[24.53px] lg:h-[32px] xl:h-[40px] bg-white text-[#254B02] rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                                aria-label="View discount tours"
                            >
                                <svg className="w-[8.5px] h-[8.5px] lg:w-[11px] lg:h-[11px] xl:w-[14px] xl:h-[14px] text-[#254B02]" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 13L13 1M13 1H3M13 1V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="absolute inset-0 rounded-full border border-white pointer-events-none" />
                            </Link>
                        </div>
                    </div>

                    {/* Photo + Caption Card (#5640:7524 on 785px: 223.85px / #5091:7514 on 1280px: 365px) */}
                    <div className="w-[223.85px] lg:w-[295px] xl:w-[365px] flex flex-col shrink-0">
                        {/* Image Frame (#5640:7524 on 785px: 223.85px x 90.15px / 1280px: 365px x 147px) */}
                        <div className="w-full h-[90.15px] lg:h-[118px] xl:h-[147px] rounded-[6.1px] xl:rounded-[10px] overflow-hidden relative bg-gray-900">
                            <img
                                src="https://images.unsplash.com/photo-1517824806704-9040b037703b?q=80&w=1200&auto=format&fit=crop"
                                alt="Scenic adventure landscape"
                                className="w-full h-full object-cover"
                            />
                            {/* Live Sale Badge (#5640:7537 on 785px: 55.2px x 11.65px / 1280px: 90px x 19px) */}
                            <div className="absolute top-[4px] right-[4px] lg:top-[6px] lg:right-[6px] xl:top-[8px] xl:right-[8px] z-10">
                                <div className="flex items-center gap-[4px] lg:gap-[5px] xl:gap-[6px] bg-black/40 backdrop-blur-xs border border-white text-white px-[5px] lg:px-[6px] xl:px-[8px] py-[1.5px] xl:py-[2px] rounded-[50px] text-[8px] lg:text-[10px] xl:text-[13px] font-normal leading-[8px] lg:leading-[10px] xl:leading-[13px] font-outfit">
                                    <span className="w-[5px] h-[5px] lg:w-[6.5px] lg:h-[6.5px] xl:w-[8px] xl:h-[8px] rounded-full bg-[#FF0000] shrink-0 animate-pulse"></span>
                                    <span>Live Sale</span>
                                </div>
                            </div>
                        </div>

                        {/* Caption Text (#5640:7525 on 785px: 9.81px font, 16px line-height / 1280px: 16px font, 26px line-height) */}
                        <p className="text-[9.81px] lg:text-[13px] xl:text-[16px] text-[#1A1A1A] font-medium leading-[16px] lg:leading-[21px] xl:leading-[26.09px] font-outfit mt-[6px] lg:mt-[8px] xl:mt-[10px]">
                            Discover beautiful routes and scenic spots across Asia Region.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
