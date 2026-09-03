"use client";

import React, { useState } from "react";

const faqData = [
  {
    id: 1,
    question: "What should I bring for the tour?",
    answer:
      "We recommend comfortable walking shoes, weather-appropriate clothing, a reusable water bottle, sunscreen, a hat, and your camera to capture unforgettable moments.",
  },
  {
    id: 2,
    question: "Is pickup and drop-off included?",
    answer:
      "Yes, complimentary hotel pickup and drop-off are included for most of our guided experiences. Detailed instructions will be shared after booking.",
  },
  {
    id: 3,
    question: "Are the tours suitable for children?",
    answer:
      "Our tours are family-friendly and designed to be enjoyable for all age groups. Small group sizes ensure safety and personalized attention throughout.",
  },
  {
    id: 4,
    question: "What happens in case of bad weather?",
    answer:
      "Safety is our highest priority. In the event of severe weather, we offer free rescheduling or full refunds for affected outdoor activities.",
  },
];

export default function FaqSection() {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleFaq = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="w-full relative font-outfit mt-[80px] mb-[80px] md:my-[30px] xl:my-16">
      {/* Mobile View (#5640:5820 – #5640:5863) */}
      <div className="block md:hidden w-full max-w-[360px] mx-auto">
        {/* Title (#5640:5820, 30.34px Outfit + Gochi Hand) */}
        <h2 className="text-[26px] sm:text-[30.34px] font-normal leading-[1.2] text-[#1A1A1A] tracking-[0.0078em] font-outfit text-left mb-5">
          Everything you need to know before your <br />
          journey —{" "}
          <span className="font-gochi text-[#254B02]">
            from booking to what to pack.
          </span>
        </h2>

        {/* Accordion Items List (#5640:5822) */}
        <div className="flex flex-col gap-[5px] w-full">
          {faqData.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                onClick={() => toggleFaq(faq.id)}
                className="bg-[rgba(181,185,177,0.12)] hover:bg-[rgba(181,185,177,0.18)] transition-all rounded-[8px] px-3.5 py-2 cursor-pointer shadow-none"
              >
                <div className="flex items-center justify-between gap-2.5">
                  <h3 className="text-[14px] font-normal leading-[19px] text-[#1A1A1A] font-outfit tracking-[-0.015em]">
                    {faq.question}
                  </h3>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[#1A1A1A] shrink-0">
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </div>
                </div>

                {isOpen && (
                  <p className="mt-2 text-[12.5px] text-[#1A1A1A]/75 font-light leading-relaxed pt-1.5 border-t border-black/5 font-outfit">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop View (#5640:7678 on 785px / #5091:7671 on 1280px) */}
      <div className="hidden md:block">
        {/* Top Header Section (#5640:7679 & #5640:7684 on 785px / #5091:7671 & #5091:7676 on 1280px) */}
        <div className="flex flex-row items-start justify-between mb-4 md:mb-[18px] lg:mb-[24px] xl:mb-[32px] gap-4">
          {/* Badge (#5640:7680 on 785px: 44.67px x 14.89px / #5091:7671 on 1280px: 73px x 24px) */}
          <div className="inline-flex items-center justify-center w-[44.7px] lg:w-[58px] xl:w-[73px] h-[14.9px] lg:h-[19px] xl:h-[24px] bg-[rgba(26,26,26,0.05)] text-[rgba(26,26,26,0.55)] rounded-[68px] xl:rounded-[111px] text-[8.59px] lg:text-[11px] xl:text-[14px] font-medium tracking-normal font-outfit shrink-0">
            FAQ
          </div>

          {/* Heading (#5640:7684 on 785px: 29.44px / #5091:7676 on 1280px: 48px) */}
          <h2 className="text-[29.44px] lg:text-[38px] xl:text-[48px] font-normal leading-[33.7px] lg:leading-[44px] xl:leading-[55px] text-[#1A1A1A] tracking-[0.0078em] font-outfit max-w-[539px] lg:max-w-[700px] xl:max-w-[879px] text-right mt-0 pt-0 md:pt-[14px] xl:pt-[38px]">
            Everything you need to know before your{" "}
            <br />
            journey —{" "}
            <span className="font-gochi text-[#254B02]">
              from booking to what to pack.
            </span>
          </h2>
        </div>

        {/* Bottom Content Grid (#5640:7682 & #5640:7685 on 785px: 186.4px + 540.9px, gap 14.7px / #5091:7674 & #5091:7677 on 1280px: 304px + 882px, gap 24px) */}
        <div className="grid grid-cols-[186.4px_1fr] lg:grid-cols-[245px_1fr] xl:grid-cols-[304px_1fr] gap-3 md:gap-[14.7px] lg:gap-[19px] xl:gap-[24px] items-start">
          {/* Left Side: Travel Photo Card (#5640:7682 on 785px: 186.44px x 256.92px / #5091:7674 on 1280px: 304px x 419px) */}
          <div className="w-[186.4px] lg:w-[245px] xl:w-[304px] h-[256.9px] lg:h-[335px] xl:h-[419px] rounded-[6.82px] xl:rounded-[11.12px] overflow-hidden relative shadow-xs bg-gray-900 shrink-0 group">
            <img
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=3540&auto=format&fit=crop"
              alt="Adventure traveller"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
            />
            {/* Dark Tint Overlay */}
            <div className="absolute inset-0 bg-[rgba(26,26,26,0.2)] pointer-events-none" />
          </div>

          {/* Right Side: Accordion Items (#5640:7686 on 785px / #5091:7677 on 1280px) */}
          <div className="flex flex-col gap-1.5 md:gap-[7.2px] lg:gap-[9.5px] xl:gap-[12px] w-full">
            {faqData.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  onClick={() => toggleFaq(faq.id)}
                  className="bg-[rgba(181,185,177,0.12)] hover:bg-[rgba(181,185,177,0.2)] transition-all rounded-[7.36px] xl:rounded-[12px] px-3.5 md:px-[14.7px] lg:px-[19px] xl:px-6 py-1.5 md:py-[6.5px] lg:py-[8px] xl:py-2.5 cursor-pointer shadow-xs"
                >
                  <div className="flex items-center justify-between gap-3 xl:gap-4">
                    <h3 className="text-[12.27px] lg:text-[16px] xl:text-[20px] font-normal leading-[15px] lg:leading-[19px] xl:leading-[23px] text-[#1A1A1A] font-outfit tracking-[-0.0266em]">
                      {faq.question}
                    </h3>
                    <div className="w-4 h-4 lg:w-5 lg:h-5 xl:w-7 xl:h-7 rounded-full flex items-center justify-center text-[#1A1A1A] shrink-0">
                      <svg
                        className={`w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </div>
                  </div>

                  {isOpen && (
                    <p className="mt-2 xl:mt-3.5 text-[9.81px] lg:text-[12.5px] xl:text-[15px] text-[#1A1A1A]/75 font-light leading-relaxed pt-1.5 xl:pt-2.5 border-t border-black/5 font-outfit">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
