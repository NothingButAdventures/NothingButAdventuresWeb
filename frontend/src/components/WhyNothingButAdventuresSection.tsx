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
    description:
      "Small groups means deeper connections. Meet travellers from around the world and make every adventure feel like a shared passport stamp.",
  },
  {
    id: 2,
    icon: "/iig2.svg",
    fallbackIcon: "/why_nba_2.svg",
    title: "Solo or Sociable, your Choice",
    description:
      "Choose to roam along with group or explore at your own pace, your choice. No sidelines, nothing but adventures here.",
  },
  {
    id: 3,
    icon: "/iig3.svg",
    fallbackIcon: "/why_nba_3.svg",
    title: "They are called Adventure Captains",
    description:
      "Choose to roam along with group or explore at your own pace, your choice. \nNo sidelines, nothing but adventures here.",
  },
];

const row2Data: WhyCard[] = [
  {
    id: 4,
    icon: "/iig4.svg",
    fallbackIcon: "/why_nba_4.svg",
    title: "Immersive experiences are how we roll",
    description:
      "No sidelines, nothing but adventures here. Cook, craft, climb, and dive yourself fully in the heartbeat of local culture.",
  },
  {
    id: 5,
    icon: "/why_nba_5.svg",
    fallbackIcon: "/why_nba_5.svg",
    title: "Doing Good has never been so fun",
    description:
      "Travel powered by our community Tourism Model supporting people, places and planet while making memories that matter.",
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
        , guaranteed departures, Lifetime Deposits and support whenever and
        wherever you need it.
      </>
    ),
  },
];

export default function WhyNothingButAdventuresSection() {
  return (
    <section className="hidden md:block w-full bg-[rgba(244,236,217,0.25)] py-12 sm:py-14 xl:py-[68px] my-12 sm:my-14 md:my-16 font-outfit">
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 xl:px-[35px]">
        {/* Header Area (#5091:7842, gap: 60px, width: 376px title wrapping Adventures to next line) */}
        <div className="flex flex-row gap-4 sm:gap-[60px] items-start mb-6 sm:mb-8 xl:mb-[30px]">
          {/* Badge (#5091:7843, 56px x 24px) */}
          <div className="w-[56px] h-[24px] bg-[rgba(26,26,26,0.05)] text-[rgba(26,26,26,0.55)] rounded-[110px] text-[14px] font-medium font-outfit flex items-center justify-center shrink-0 mt-1.5 sm:mt-2">
            Why
          </div>
          {/* Title (#5091:7845, 48px Outfit + Gochi Hand) */}
          <h2 className="text-[32px] sm:text-[38px] md:text-[44px] xl:text-[48px] font-normal leading-[1.05] xl:leading-[52px] text-[#1A1A1A] tracking-normal font-outfit">
            Why <span className="font-gochi text-[#254B02]">Nothing but</span>
            <br />
            <span className="font-gochi text-[#254B02]">Adventures</span>
          </h2>
        </div>

        {/* Row 1: 3 Cards (offset by 60px on desktop to align to the right side, width: 370px each, gap: 20px) */}
        <div className="flex justify-end w-full mb-5 lg:mb-[35px] xl:mb-[45px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 xl:gap-[20px] w-full xl:max-w-[1150px]">
            {row1Data.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-[8px] p-5 sm:p-6 xl:p-[20px] xl:pt-[25px] xl:pb-[20px] flex flex-col justify-start shadow-[0px_1px_15px_-2px_rgba(0,0,0,0.08)] min-h-[230px] xl:h-[230px] transition-all duration-300 hover:shadow-md"
              >
                {/* 85px Fixed Height Illustration */}
                <div className="mb-[12px] flex justify-start items-center h-[85px]">
                  {card.icon ? (
                    <img
                      src={card.icon}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (
                          card.fallbackIcon &&
                          target.src !== card.fallbackIcon
                        ) {
                          target.src = card.fallbackIcon;
                        }
                      }}
                      className="h-[85px] max-h-[85px] max-w-[100px] w-auto object-contain"
                      alt={card.title}
                    />
                  ) : null}
                </div>
                {/* Title (20px Outfit Regular, tight leading) */}
                <h3 className="text-[20px] font-normal text-[#1A1A1A] mb-1 font-outfit leading-[23px] tracking-[-0.0234em]">
                  {card.title}
                </h3>
                {/* Description (16px Outfit Light, tighter line-height) */}
                <p className="text-[#1A1A1A]/70 text-[16px] font-light leading-[19px] sm:leading-[20px] font-outfit tracking-[-0.0203em] whitespace-pre-line">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: 3 Cards (aligned to the left, leaves 60px space on the right, width: 370px each, gap: 20px) */}
        <div className="flex justify-start w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 xl:gap-[20px] w-full xl:max-w-[1150px]">
            {row2Data.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-[8px] p-5 sm:p-6 xl:p-[20px] xl:pt-[25px] xl:pb-[20px] flex flex-col justify-start shadow-[0px_1px_15px_-2px_rgba(0,0,0,0.08)] min-h-[230px] xl:h-[230px] transition-all duration-300 hover:shadow-md"
              >
                {/* 85px Fixed Height Illustration */}
                <div className="mb-[12px] flex justify-start items-center h-[85px]">
                  {card.icon ? (
                    <img
                      src={card.icon}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (
                          card.fallbackIcon &&
                          target.src !== card.fallbackIcon
                        ) {
                          target.src = card.fallbackIcon;
                        }
                      }}
                      className="h-[85px] max-h-[85px] max-w-[100px] w-auto object-contain"
                      alt={card.title}
                    />
                  ) : null}
                </div>
                {/* Title (20px Outfit Regular, tight leading) */}
                <h3 className="text-[20px] font-normal text-[#1A1A1A] mb-1 font-outfit leading-[23px] tracking-[-0.0234em]">
                  {card.title}
                </h3>
                {/* Description (16px Outfit Light, tighter line-height) */}
                <div className="text-[#1A1A1A]/70 text-[16px] font-light leading-[19px] sm:leading-[20px] font-outfit tracking-[-0.0203em]">
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
