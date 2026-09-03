"use client";

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
        <section className="w-full relative font-outfit mt-8 sm:mt-16 md:mt-[60px] lg:mt-[90px] xl:mt-[120px] mb-8 md:mb-12 xl:mb-20">
            {/* Mobile View (#5640:5744, #5640:5745, #5640:5753, #5640:5754) */}
            <div className="block md:hidden w-full max-w-[359px] mx-auto">
                {/* Title (#5640:5744) */}
                <h2 className="text-[30px] font-normal leading-tight text-[#1A1A1A] tracking-normal font-outfit mb-4 text-left">
                    Meet Your <span className="font-gochi text-[#254B02]">Local Guides</span>
                </h2>

                {/* Top Split Section: Guide Photo (Left) + Quote Block (Right) (#5640:5753 & #5640:5745) */}
                <div className="flex items-center gap-3 w-full mb-4">
                    {/* Guide Portrait Photo (#5640:5753, 155px x 155px, rounded: 8.25px) */}
                    <div className="w-[155px] h-[155px] rounded-[8.25px] overflow-hidden relative shrink-0 bg-gray-900 shadow-xs">
                        <img
                            src="https://images.unsplash.com/photo-1620311488184-e9ed711c1109?q=80&w=3540&auto=format&fit=crop"
                            alt="Amir - Founder & Lead Guide"
                            className="w-full h-full object-cover"
                        />
                        {/* Carousel Dots */}
                        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
                            <div className="w-3.5 h-0.5 rounded-full bg-white"></div>
                            <div className="w-1 h-0.5 rounded-full bg-white/50"></div>
                            <div className="w-1 h-0.5 rounded-full bg-white/50"></div>
                            <div className="w-1 h-0.5 rounded-full bg-white/50"></div>
                        </div>
                    </div>

                    {/* Right Quote Info (#5640:5745) */}
                    <div className="flex flex-col justify-center flex-1">
                        {/* 400+ Local Guides Badge (#5640:5748, bg: #254B02) */}
                        <div className="inline-flex items-center justify-center w-fit px-2.5 py-0.5 bg-[#254B02] text-white rounded-[70px] text-[8.95px] font-normal mb-2 font-outfit">
                            400+ Local Guides
                        </div>
                        {/* Quote Text (#5640:5751) */}
                        <p className="text-[11.5px] text-[#1A1A1A] font-light leading-[14px] font-outfit mb-1.5">
                            “Every trip is personal. We keep groups small to make sure your experience feels private, safe, and unforgettable.”
                        </p>
                        {/* Author (#5640:5752) */}
                        <p className="text-[10px] text-[#1A1A1A]/50 font-normal font-outfit">
                            — Amir , Founder &amp; Lead Guide
                        </p>
                    </div>
                </div>

                {/* Team Card (#5640:5755, width: 359px, bg: rgba(244, 236, 217, 0.25)) */}
                <div className="w-full rounded-[16px] bg-[rgba(244,236,217,0.25)] p-[20px] flex flex-col gap-[18px]">
                    {/* Large Team Image (#5640:5756, height: 310px, rounded: 16.5px) */}
                    <div className="w-full h-[310px] rounded-[16.5px] overflow-hidden relative bg-gray-900 shadow-xs">
                        <img
                            src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=3540&auto=format&fit=crop"
                            alt="Local Guides team in desert"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Text Block & Socials (#5640:5759) */}
                    <div className="flex flex-col font-outfit">
                        <h3 className="text-[20px] font-bold text-[#1A1A1A] leading-[25px] font-sans mb-2">
                            Step inside a journey guided by passion and experience
                        </h3>
                        <p className="text-[13px] text-[#404040] font-normal leading-[19px] font-outfit mb-4">
                            Each tour is led by people who know every dune, story, and sunrise of AlUla — guides who turn every route into a journey worth remembering.
                        </p>

                        {/* Social Media Circular Buttons (#5640:5767) */}
                        <div className="flex items-center gap-[8px]">
                            <div className="w-[26px] h-[26px] rounded-full bg-black/5 hover:bg-black/10 text-[#1A1A1A] flex items-center justify-center text-xs transition-colors cursor-pointer" aria-label="Facebook">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            </div>
                            <div className="w-[26px] h-[26px] rounded-full bg-black/5 hover:bg-black/10 text-[#1A1A1A] flex items-center justify-center text-xs transition-colors cursor-pointer" aria-label="Instagram">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                            </div>
                            <div className="w-[26px] h-[26px] rounded-full bg-black/5 hover:bg-black/10 text-[#1A1A1A] flex items-center justify-center text-xs transition-colors cursor-pointer" aria-label="LinkedIn">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop View (#5640:8211 on 785px / #5091:8189 on 1280px) */}
            <div className="hidden md:block">
                {/* Top Row: Left Pills and Right Title aligned */}
                <div className="grid grid-cols-2 gap-4 lg:gap-5 xl:gap-[24px] items-end mb-3.5 lg:mb-5 xl:mb-[24px]">
                    {/* Left Side: 6 Feature Pills (#5640:8226 on 785px / #5091:8191 on 1280px) */}
                    <div className="grid grid-cols-3 gap-1.5 lg:gap-2 xl:gap-2.5 max-w-[462px]">
                        {tags.map((tag, idx) => (
                            <div 
                                key={idx} 
                                className="inline-flex items-center justify-center gap-1 xl:gap-1.5 h-[17.2px] lg:h-[22px] xl:h-[28px] px-2 lg:px-2.5 xl:px-3 bg-[rgba(26,26,26,0.05)] text-[rgba(26,26,26,0.75)] rounded-[67px] xl:rounded-[110px] text-[8px] lg:text-[10.5px] xl:text-[13px] font-normal font-outfit transition-colors hover:bg-[rgba(26,26,26,0.08)] whitespace-nowrap"
                            >
                                <span className="text-[#254B02] shrink-0">{tag.icon}</span>
                                <span className="truncate">{tag.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Right Side: Title (#5640:8211 on 785px: 33.7px / #5091:8213 on 1280px: 54px) */}
                    <h2 className="text-[33.1px] lg:text-[43px] xl:text-[54px] font-normal leading-[33.7px] lg:leading-[44px] xl:leading-[55px] text-[#1A1A1A] tracking-normal font-outfit text-left">
                        Meet Your <span className="font-gochi text-[#254B02]">Local Guides</span>
                    </h2>
                </div>

                {/* Cards Row: 2 Parallel Cards (#5640:8191 & #5640:8213 on 785px: height 185.4px, gap 14.7px / 1280px: height 303px, gap 24px) */}
                <div className="grid grid-cols-2 gap-[14.7px] lg:gap-[19px] xl:gap-[24px] items-stretch">
                    {/* Left Card (#5640:8191 on 785px: 356.34px x 185.35px / #5091:8192 on 1280px: 581px x 303px) */}
                    <div className="bg-[rgba(181,185,177,0.2)] rounded-[7.5px] xl:rounded-[12.2px] flex flex-row overflow-hidden h-[185.4px] lg:h-[240px] xl:h-[303px] shadow-xs">
                        {/* Left Photo (#5640:8192 on 785px: 188.47px x 185.97px / #5091:8194 on 1280px: 307px x 303px) */}
                        <div className="w-[188.5px] lg:w-[245px] xl:w-[307px] h-full relative shrink-0">
                            <img
                                src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=3540&auto=format&fit=crop"
                                alt="Guides smiling together"
                                className="absolute inset-0 w-full h-full object-cover rounded-l-[7.5px] xl:rounded-l-[12.2px]"
                            />
                        </div>

                        {/* Right Text Content (#5640:8193, #5640:8194, #5640:8195) */}
                        <div className="flex-1 p-[14px] lg:p-[19px] xl:p-[24px] pl-[16px] lg:pl-[20px] xl:pl-[26px] flex flex-col justify-between font-outfit">
                            <div>
                                <h3 className="text-[9.81px] lg:text-[13px] xl:text-[16px] font-medium text-[#1A1A1A] mb-1 xl:mb-2 leading-[14.35px] lg:leading-[18px] xl:leading-[23.4px] tracking-[-0.0286em] font-outfit">
                                    Step inside a journey guided by passion and experience
                                </h3>
                                <p className="text-[7.36px] lg:text-[9.5px] xl:text-[12px] text-[#1A1A1A]/80 font-normal leading-[12.27px] lg:leading-[16px] xl:leading-[20px] tracking-[-0.0381em] font-outfit mb-2 xl:mb-4">
                                    Each tour is led by people who know every dune, story, and sunrise of AlUla guides who turn every route into a journey worth remembering.
                                </p>
                            </div>

                            {/* Social Media Circular Buttons (#5640:8195) */}
                            <div className="flex items-center gap-[6px] lg:gap-[7.5px] xl:gap-[9px]">
                                <div className="w-[14px] h-[14px] lg:w-[18px] lg:h-[18px] xl:w-[23px] xl:h-[23px] rounded-full bg-black/5 hover:bg-black/10 text-[#1A1A1A] flex items-center justify-center text-xs transition-colors cursor-pointer" aria-label="Facebook">
                                    <svg className="w-2 h-2 lg:w-2.5 lg:h-2.5 xl:w-3 xl:h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                </div>
                                <div className="w-[14px] h-[14px] lg:w-[18px] lg:h-[18px] xl:w-[23px] xl:h-[23px] rounded-full bg-black/5 hover:bg-black/10 text-[#1A1A1A] flex items-center justify-center text-xs transition-colors cursor-pointer" aria-label="Instagram">
                                    <svg className="w-2 h-2 lg:w-2.5 lg:h-2.5 xl:w-3 xl:h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                                </div>
                                <div className="w-[14px] h-[14px] lg:w-[18px] lg:h-[18px] xl:w-[23px] xl:h-[23px] rounded-full bg-black/5 hover:bg-black/10 text-[#1A1A1A] flex items-center justify-center text-xs transition-colors cursor-pointer" aria-label="Twitter">
                                    <svg className="w-2 h-2 lg:w-2.5 lg:h-2.5 xl:w-3 xl:h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                </div>
                                <div className="w-[14px] h-[14px] lg:w-[18px] lg:h-[18px] xl:w-[23px] xl:h-[23px] rounded-full bg-black/5 hover:bg-black/10 text-[#1A1A1A] flex items-center justify-center text-xs transition-colors cursor-pointer" aria-label="YouTube">
                                    <svg className="w-2 h-2 lg:w-2.5 lg:h-2.5 xl:w-3 xl:h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Card: Guide Profile Card (#5640:8213 on 785px: 356.34px x 185.35px / #5091:8214 on 1280px: 581px x 303px) */}
                    <div className="bg-white rounded-[7.5px] xl:rounded-[12.2px] flex flex-row items-stretch h-[185.4px] lg:h-[240px] xl:h-[303px] border border-[rgba(26,26,26,0.06)] shadow-xs overflow-hidden">
                        {/* Left Guide Photo (#5640:8213 photo on 785px: 171.7px / 1280px: 280px) */}
                        <div className="w-[171.7px] lg:w-[224px] xl:w-[280px] h-full relative shrink-0 bg-gray-900 group">
                            <img
                                src="https://images.unsplash.com/photo-1620311488184-e9ed711c1109?q=80&w=3540&auto=format&fit=crop"
                                alt="Amir - Founder & Lead Guide"
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
                            />
                            {/* Carousel Dots */}
                            <div className="absolute bottom-2 xl:bottom-4 left-0 right-0 flex justify-center gap-1 xl:gap-1.5 z-10">
                                <div className="w-3 xl:w-5 h-0.5 xl:h-1 rounded-full bg-white"></div>
                                <div className="w-1 xl:w-1.5 h-0.5 xl:h-1 rounded-full bg-white/50"></div>
                                <div className="w-1 xl:w-1.5 h-0.5 xl:h-1 rounded-full bg-white/50"></div>
                                <div className="w-1 xl:w-1.5 h-0.5 xl:h-1 rounded-full bg-white/50"></div>
                            </div>
                            <div className="absolute inset-x-0 bottom-0 h-12 xl:h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                        </div>

                        {/* Right Quote Content (#5640:8217) */}
                        <div className="flex-1 p-[14px] lg:p-[19px] xl:p-[24px] pl-[16px] lg:pl-[20px] xl:pl-[26px] flex flex-col justify-between font-outfit">
                            <div>
                                {/* 400+ Local Guides Badge (#5640:8214 on 785px: 92.98px x 14.98px / 1280px: 152px x 24.4px) */}
                                <div className="inline-flex items-center justify-center w-[93px] lg:w-[120px] xl:w-[152px] h-[15px] lg:h-[19px] xl:h-[24.4px] bg-[#254B02] text-white rounded-[68px] xl:rounded-[111px] text-[8.69px] lg:text-[11px] xl:text-[14px] font-normal mb-1.5 xl:mb-3 font-outfit">
                                    400+ Local Guides
                                </div>
                                <p className="text-[9.81px] lg:text-[13px] xl:text-[16px] text-[#1A1A1A] font-normal leading-[14.35px] lg:leading-[18px] xl:leading-[23.4px] tracking-[-0.0286em] font-outfit mb-2 xl:mb-4">
                                    “Every trip is personal. We keep groups small to make sure your experience feels private, safe, and unforgettable.”
                                </p>
                            </div>
                            <div>
                                <p className="text-[7.36px] lg:text-[9.5px] xl:text-[12px] text-[#1A1A1A]/50 font-normal leading-[14.35px] lg:leading-[18px] xl:leading-[23.4px] tracking-[-0.0381em] font-outfit">
                                    — Amir , Founder &amp; Lead Guide
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
