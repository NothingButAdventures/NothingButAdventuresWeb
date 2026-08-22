"use client";

import React from "react";
import Link from "next/link";

interface WhyCard {
    id: number;
    icon: string;
    fallbackIcon: string;
    title: string;
    description: React.ReactNode;
}

const row1Data: WhyCard[] = [
    {
        id: 1,
        icon: "/iig1.svg",
        fallbackIcon: "/why_nba_1.svg",
        title: "Small Groups, Big Adventure",
        description: "Small groups means deeper connections. Meet travellers from around the world and make every adventure feel like a shared passport stamp."
    },
    {
        id: 2,
        icon: "/iig2.svg",
        fallbackIcon: "/why_nba_2.svg",
        title: "Solo or Sociable, your Choice",
        description: "Choose to roam along with group or explore at your own pace, your choice. No sidelines, nothing but adventures here."
    },
    {
        id: 3,
        icon: "/iig3.svg",
        fallbackIcon: "/why_nba_3.svg",
        title: "They are called Adventure Captains",
        description: "Choose to roam along with group or explore at your own pace, your choice. \nNo sidelines, nothing but adventures here."
    }
];

const row2Data: WhyCard[] = [
    {
        id: 4,
        icon: "/iig4.svg",
        fallbackIcon: "/why_nba_4.svg",
        title: "Immersive experiences are how we roll",
        description: "No sidelines, nothing but adventures here. Cook, craft, climb, and dive yourself fully in the heartbeat of local culture."
    },
    {
        id: 5,
        icon: "",
        fallbackIcon: "",
        title: "Doing Good has never been so fun",
        description: "Travel powered by our community Tourism Model supporting people, places and planet while making memories that matter."
    },
    {
        id: 6,
        icon: "/iig6.svg",
        fallbackIcon: "/why_nba_6.svg",
        title: "Book with all the confidence in the world",
        description: (
            <>
                Worry-free travel,{" "}
                <Link
                    href="/flexible-bookings"
                    className="underline hover:text-[#1A1A1A] transition-colors"
                >
                    flexible booking options
                </Link>
                , guaranteed departures, Lifetime Deposits and support whenever and wherever you need it.
            </>
        )
    }
];

export default function WhyNothingButAdventuresSection() {
    return (
        <section className="w-full bg-[rgba(244,236,217,0.25)] py-12 sm:py-14 lg:py-16 my-12 sm:my-14 md:my-16 font-outfit">
            <div className="w-full px-4 sm:px-6 md:px-8 lg:px-[35px]">
                {/* Header Area (#5091:7842) */}
                <div className="flex flex-row gap-4 sm:gap-[60px] items-start mb-8 sm:mb-10 lg:mb-10">
                    <div className="w-[56px] h-[24px] bg-[rgba(26,26,26,0.05)] text-[rgba(26,26,26,0.55)] rounded-[110px] text-[14px] font-medium font-outfit flex items-center justify-center shrink-0 mt-1.5 sm:mt-2.5">
                        Why
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-[44px] lg:text-[48px] font-normal leading-[1.08] text-[#1A1A1A] tracking-tight font-outfit">
                        Why <span className="font-gochi text-[#254B02]">Nothing but</span>
                        <br />
                        <span className="font-gochi text-[#254B02]">Adventures</span>
                    </h2>
                </div>

                {/* Row 1: 3 Cards (offset right on desktop) */}
                <div className="pl-0 lg:pl-[40px] xl:pl-[60px] pr-0 mb-5 lg:mb-[30px]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                        {row1Data.map((card) => (
                            <div
                                key={card.id}
                                className="bg-white rounded-[8px] p-6 lg:px-[22px] lg:pt-[24px] lg:pb-[24px] flex flex-col justify-start shadow-[0px_1px_15px_-2px_rgba(0,0,0,0.08)] min-h-[230px] transition-all duration-300 hover:shadow-md"
                            >
                                <div className="mb-3 flex justify-start items-center h-[70px] sm:h-[80px]">
                                    {card.icon ? (
                                        <img
                                            src={card.icon}
                                            onError={(e) => {
                                                const target = e.currentTarget;
                                                if (card.fallbackIcon && target.src !== card.fallbackIcon) {
                                                    target.src = card.fallbackIcon;
                                                }
                                            }}
                                            className="max-h-[75px] max-w-[95px] w-auto object-contain"
                                            alt={card.title}
                                        />
                                    ) : null}
                                </div>
                                <h3 className="text-[20px] font-normal text-[#1A1A1A] mb-2 font-outfit leading-tight tracking-[-0.0234em]">
                                    {card.title}
                                </h3>
                                <p className="text-[#1A1A1A]/70 text-[15px] sm:text-[16px] font-light leading-snug font-outfit tracking-[-0.0203em] whitespace-pre-line">
                                    {card.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Row 2: 3 Cards (offset left / space on right on desktop) */}
                <div className="pr-0 lg:pr-[40px] xl:pr-[60px] pl-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                        {row2Data.map((card) => (
                            <div
                                key={card.id}
                                className="bg-white rounded-[8px] p-6 lg:px-[22px] lg:pt-[24px] lg:pb-[24px] flex flex-col justify-start shadow-[0px_1px_15px_-2px_rgba(0,0,0,0.08)] min-h-[230px] transition-all duration-300 hover:shadow-md"
                            >
                                <div className="mb-3 flex justify-start items-center h-[70px] sm:h-[80px]">
                                    {card.icon ? (
                                        <img
                                            src={card.icon}
                                            onError={(e) => {
                                                const target = e.currentTarget;
                                                if (card.fallbackIcon && target.src !== card.fallbackIcon) {
                                                    target.src = card.fallbackIcon;
                                                }
                                            }}
                                            className="max-h-[75px] max-w-[95px] w-auto object-contain"
                                            alt={card.title}
                                        />
                                    ) : null}
                                </div>
                                <h3 className="text-[20px] font-normal text-[#1A1A1A] mb-2 font-outfit leading-tight tracking-[-0.0234em]">
                                    {card.title}
                                </h3>
                                <div className="text-[#1A1A1A]/70 text-[15px] sm:text-[16px] font-light leading-snug font-outfit tracking-[-0.0203em]">
                                    {card.description}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

