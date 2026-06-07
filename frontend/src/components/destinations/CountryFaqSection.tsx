"use client";

import { useState } from "react";

interface CountryFaqItem {
  question: string;
  answer?: string;
}

interface CountryFaqSectionProps {
  title?: string;
  subtitle?: string;
  items?: CountryFaqItem[];
}

export default function CountryFaqSection({
  title = "FAQ",
  subtitle = "Everything you need to know before your desert journey - from booking to what to pack.",
  items = [],
}: CountryFaqSectionProps = {}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const resolvedItems = items.filter((item) => item.question?.trim());

  return (
    <section className="mt-14 md:mt-16">
      <span className="inline-flex rounded-full bg-[#e8ebf0] px-4 py-1 text-[12px] font-medium text-[#3F3F42]">{title}</span>

      <h2 className="mt-4 max-w-[920px] text-[24px] font-medium leading-tight text-[#3F3F42] sm:text-[26px] md:text-[28px] lg:text-[30px] lg:whitespace-nowrap">
        {subtitle}
      </h2>

      <div className="mt-6 max-w-[980px] space-y-3">
        {resolvedItems.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <div key={item.question} className="rounded-[16px] bg-[#eef1f6] px-5 py-4 md:px-6 md:py-5">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 text-left"
                aria-expanded={isOpen}
                aria-controls={`country-faq-${index}`}
              >
                <span className="text-[18px] font-medium leading-tight text-[#3F3F42] md:text-[22px]">{item.question}</span>
                <svg
                  className={`h-5 w-5 shrink-0 text-[#3F3F42] transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {isOpen && item.answer && (
                <p id={`country-faq-${index}`} className="pt-3 text-[15px] leading-[1.5] text-[#3F3F42] md:text-[17px]">
                  {item.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}