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
    <section className="hidden md:block w-full bg-[rgba(244,236,217,0.25)] py-8 md:py-[41.7px] xl:py-[68px] my-8 md:my-[30px] xl:my-16 font-outfit">
      <div className="w-full max-w-[742.1px] lg:max-w-[970px] xl:max-w-[1210px] mx-auto px-4 md:px-0">
        {/* Header Area (#5640:7850 on 785px: gap 36.8px / #5091:7842 on 1280px: gap 60px) */}
        <div className="flex flex-row gap-4 md:gap-[36.8px] xl:gap-[60px] items-start mb-4 md:mb-[25px] xl:mb-[30px]">
          {/* Badge (#5640:7851 on 785px: 34.34px x 14.72px / 1280px: 56px x 24px) */}
          <div className="w-[34.34px] lg:w-[45px] xl:w-[56px] h-[14.72px] lg:h-[19px] xl:h-[24px] bg-[rgba(26,26,26,0.05)] text-[rgba(26,26,26,0.55)] rounded-[67px] xl:rounded-[110px] text-[8.59px] lg:text-[11px] xl:text-[14px] font-medium font-outfit flex items-center justify-center shrink-0 mt-1 xl:mt-2">
            Why
          </div>
          {/* Title (#5640:7853 on 785px: 29.44px Outfit / 1280px: 48px Outfit) */}
          <h2 className="text-[29.44px] lg:text-[38px] xl:text-[48px] font-normal leading-[31.9px] lg:leading-[42px] xl:leading-[52px] text-[#1A1A1A] tracking-normal font-outfit">
            Why <span className="font-gochi text-[#254B02]">Nothing but</span>
            <br />
            <span className="font-gochi text-[#254B02]">Adventures</span>
          </h2>
        </div>

        {/* Row 1: 3 Cards (offset by 36.8px on 785px / 60px on 1280px to align right side) */}
        <div className="flex justify-end w-full mb-3 md:mb-[27.6px] xl:mb-[45px]">
          <div className="grid grid-cols-3 gap-3 md:gap-[12.27px] lg:gap-[16px] xl:gap-[20px] w-full md:w-[705.27px] lg:w-[920px] xl:w-[1150px]">
            {row1Data.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-[4.9px] xl:rounded-[8px] p-[12px] md:p-[12.27px] md:pt-[15.3px] md:pb-[12.27px] lg:p-[16px] lg:pt-[20px] lg:pb-[16px] xl:p-[20px] xl:pt-[25px] xl:pb-[20px] flex flex-col justify-start shadow-[0px_1px_15px_-2px_rgba(0,0,0,0.08)] min-h-[141px] md:h-[141.05px] lg:h-[185px] xl:h-[230px] transition-all duration-300 hover:shadow-md"
              >
                {/* Fixed Height Illustration (#5640:7855 on 785px: 52.13px / 1280px: 85px) */}
                <div className="mb-[7.36px] lg:mb-[9.5px] xl:mb-[12px] flex justify-start items-center h-[52.13px] lg:h-[68px] xl:h-[85px]">
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
                      className="h-[52.13px] lg:h-[68px] xl:h-[85px] max-h-[52.13px] lg:max-h-[68px] xl:max-h-[85px] max-w-[65px] lg:max-w-[80px] xl:max-w-[100px] w-auto object-contain"
                      alt={card.title}
                    />
                  ) : null}
                </div>
                {/* Title (#5640:7896 on 785px: 12.27px / 1280px: 20px) */}
                <h3 className="text-[12.27px] lg:text-[16px] xl:text-[20px] font-normal text-[#1A1A1A] mb-0.5 xl:mb-1 font-outfit leading-[14.1px] lg:leading-[18px] xl:leading-[23px] tracking-[-0.0234em]">
                  {card.title}
                </h3>
                {/* Description (#5640:7895 on 785px: 9.81px, 11.65px leading / 1280px: 16px, 19px leading) */}
                <p className="text-[#1A1A1A]/70 text-[9.81px] lg:text-[13px] xl:text-[16px] font-light leading-[11.65px] lg:leading-[15px] xl:leading-[19px] font-outfit tracking-[-0.0203em] whitespace-pre-line">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: 3 Cards (aligned to the left) */}
        <div className="flex justify-start w-full">
          <div className="grid grid-cols-3 gap-3 md:gap-[12.27px] lg:gap-[16px] xl:gap-[20px] w-full md:w-[705.27px] lg:w-[920px] xl:w-[1150px]">
            {row2Data.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-[4.9px] xl:rounded-[8px] p-[12px] md:p-[12.27px] md:pt-[15.3px] md:pb-[12.27px] lg:p-[16px] lg:pt-[20px] lg:pb-[16px] xl:p-[20px] xl:pt-[25px] xl:pb-[20px] flex flex-col justify-start shadow-[0px_1px_15px_-2px_rgba(0,0,0,0.08)] min-h-[141px] md:h-[141.05px] lg:h-[185px] xl:h-[230px] transition-all duration-300 hover:shadow-md"
              >
                {/* Fixed Height Illustration (#5640:7900 on 785px: 52.13px / 1280px: 85px) */}
                <div className="mb-[7.36px] lg:mb-[9.5px] xl:mb-[12px] flex justify-start items-center h-[52.13px] lg:h-[68px] xl:h-[85px]">
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
                      className="h-[52.13px] lg:h-[68px] xl:h-[85px] max-h-[52.13px] lg:max-h-[68px] xl:max-h-[85px] max-w-[65px] lg:max-w-[80px] xl:max-w-[100px] w-auto object-contain"
                      alt={card.title}
                    />
                  ) : null}
                </div>
                {/* Title */}
                <h3 className="text-[12.27px] lg:text-[16px] xl:text-[20px] font-normal text-[#1A1A1A] mb-0.5 xl:mb-1 font-outfit leading-[14.1px] lg:leading-[18px] xl:leading-[23px] tracking-[-0.0234em]">
                  {card.title}
                </h3>
                {/* Description */}
                <div className="text-[#1A1A1A]/70 text-[9.81px] lg:text-[13px] xl:text-[16px] font-light leading-[11.65px] lg:leading-[15px] xl:leading-[19px] font-outfit tracking-[-0.0203em]">
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
