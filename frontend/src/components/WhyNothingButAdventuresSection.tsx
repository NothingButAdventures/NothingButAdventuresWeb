"use client";

import React from "react";
import Link from "next/link";

const row1Data = [
    {
        id: 1,
        icon: "/why_nba_1.svg",
        fallbackIcon: "/uu1.svg",
        title: "Small Groups, Big Adventures",
        description: "Small groups means deeper connections. Meet travellers from around the world and make every adventure feel like a shared passport stamp."
    },
    {
        id: 2,
        icon: "/why_nba_2.svg",
        fallbackIcon: "/uu2.svg",
        title: "Solo or Sociable, your Choice",
        description: "Choose to roam along with group or explore at your own pace, your choice"
    },
    {
        id: 3,
        icon: "/why_nba_3.svg",
        fallbackIcon: "/uu3.svg",
        title: "They are called Adventure Captains",
        description: "Choose to roam along with group or explore at your own pace, your choice"
    }
];

const row2Data = [
    {
        id: 4,
        icon: "/why_nba_4.svg",
        fallbackIcon: "/uu4.svg",
        title: "Immersive experiences are how we roll",
        description: "No sidelines, nothing but adventures here. Cook, craft, climb, and dive yourself fully in the heartbeat of local culture."
    },
    {
        id: 5,
        icon: "/why_nba_5.svg",
        fallbackIcon: "/uu5.svg",
        title: "Doing Good has never been so fun",
        description: "Travel powered by our community Tourism Model supporting people, places and planet while making memories that matter."
    },
    {
        id: 6,
        icon: "/why_nba_6.svg",
        fallbackIcon: "/uu6.svg",
        title: "Book with all the confidence in the wold",
        description: "Worry-free travel, flexible booking options, guaranteed departures, Lifetime Deposits and support whenever and wherever you need it."
    }
];

export default function WhyNothingButAdventuresSection() {
    return (
        <section className="mx-auto mt-20 sm:mt-24 md:mt-28 lg:mt-32 mb-16">
            <div className="bg-[#FAF7F2] rounded-2xl p-8 sm:p-12 md:p-14 lg:p-16 relative overflow-hidden">
                {/* Header Area */}
                <div className="mb-10 sm:mb-12">
                    <div className="inline-block px-3.5 py-1 bg-[#F4F4F5] text-[#71717A] rounded-full text-[13px] font-medium tracking-normal mb-3">
                        Why
                    </div>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[66px] font-normal leading-tight text-[#18181B] tracking-tight font-outfit">
                        Why <span className="font-gochi text-[#4F6D38]">Nothing but Adventures</span>
                    </h2>
                </div>

                {/* Row 1: Indented Row with gap at start and end */}
                <div className="pl-0 lg:pl-[15%] pr-0 lg:pr-8 mb-4 sm:mb-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                        {row1Data.map((card) => (
                            <div
                                key={card.id}
                                className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col justify-start shadow-xs h-full transition-all duration-300 hover:shadow-md min-h-[220px]"
                            >
                                <div className="mb-6 flex justify-start">
                                    <img
                                        src={card.icon}
                                        onError={(e) => {
                                            const target = e.currentTarget;
                                            if (target.src !== card.fallbackIcon) {
                                                target.src = card.fallbackIcon;
                                            }
                                        }}
                                        className="h-20 sm:h-24 w-auto object-contain"
                                        alt={card.title}
                                    />
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold text-[#18181B] mb-2 font-outfit leading-snug">
                                    {card.title}
                                </h3>
                                <p className="text-gray-500 text-xs sm:text-sm font-normal leading-relaxed font-outfit">
                                    {card.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Row 2: 3 cards starting from extreme left, ending with right gap */}
                <div className="pr-0 lg:pr-[15%] mb-12 sm:mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                        {row2Data.map((card) => (
                            <div
                                key={card.id}
                                className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col justify-start shadow-xs h-full transition-all duration-300 hover:shadow-md min-h-[220px]"
                            >
                                <div className="mb-6 flex justify-start">
                                    <img
                                        src={card.icon}
                                        onError={(e) => {
                                            const target = e.currentTarget;
                                            if (target.src !== card.fallbackIcon) {
                                                target.src = card.fallbackIcon;
                                            }
                                        }}
                                        className="h-20 sm:h-24 w-auto object-contain"
                                        alt={card.title}
                                    />
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold text-[#18181B] mb-2 font-outfit leading-snug">
                                    {card.title}
                                </h3>
                                <p className="text-gray-500 text-xs sm:text-sm font-normal leading-relaxed font-outfit">
                                    {card.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Bar CTA */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-4">
                    <p className="text-lg sm:text-xl md:text-2xl font-normal text-[#18181B] font-outfit max-w-2xl leading-snug pl-0 lg:pl-[15%]">
                        Would you like to explore more routes<br className="hidden sm:inline" /> or customise this trip for your group?
                    </p>

                    <div className="flex items-center gap-3 shrink-0">
                        <Link
                            href="/trips"
                            className="inline-flex items-center justify-center bg-[#18181B] text-white px-7 py-3.5 rounded-full font-medium text-base hover:bg-black transition-all border-2 border-[#18181B] cursor-pointer"
                        >
                            Start Exploring
                        </Link>
                        <Link
                            href="/trips"
                            className="inline-flex items-center justify-center bg-[#18181B] text-white w-13 h-13 rounded-full hover:bg-black transition-all border-2 border-[#18181B] shrink-0 cursor-pointer"
                            aria-label="Start Exploring"
                        >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
