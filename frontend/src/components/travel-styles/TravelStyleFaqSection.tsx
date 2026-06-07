"use client";

import { useState } from "react";

const faqs = [
  {
    question: "What should I bring for the tour?",
    answer:
      "Bring comfortable walking shoes, weather-appropriate layers, a reusable water bottle, sunscreen, and your personal essentials. A detailed packing list can be shared before departure.",
  },
  {
    question: "Is pickup and drop-off included?",
    answer:
      "Yes, airport or central-city pickup and drop-off is included on selected itineraries. Final logistics are confirmed in your pre-trip briefing.",
  },
  {
    question: "Are the tours suitable for children?",
    answer:
      "Many itineraries are family-friendly, but suitability depends on route difficulty and activity level. We can recommend the best option based on your group.",
  },
  {
    question: "What happens in case of bad weather?",
    answer:
      "Our team monitors conditions continuously and may adjust activities for safety while preserving the core experience. Alternate plans are always prepared.",
  },
];

function Arrow({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 text-[#3F3F42] transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function TravelStyleFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mt-16 md:mt-20">
      <span className="inline-flex rounded-full bg-[#e9ecf0] px-4 py-1 text-[12px] font-medium text-[#3F3F42]">FAQ</span>

      <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <div>
          <h2 className="max-w-[760px] text-[36px] font-semibold leading-tight text-[#3F3F42] md:text-[50px]">
            Everything you need to know before your desert journey - from booking to what to pack.
          </h2>

          <div className="mt-8 space-y-3">
            {faqs.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={item.question} className="rounded-[12px] bg-[#f2f4f7] px-5 py-4 md:px-6">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 text-left"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span className="text-[17px] font-medium text-[#3F3F42] md:text-[18px]">{item.question}</span>
                    <Arrow open={isOpen} />
                  </button>

                  {isOpen && (
                    <div id={`faq-answer-${index}`} className="pt-3">
                      <p className="text-[15px] leading-relaxed text-[#3F3F42] md:text-[16px]">{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <aside className="rounded-[16px] border border-[#e5e9ef] bg-white p-6 md:p-8 lg:sticky lg:top-24">
          <h3 className="text-[42px] font-semibold leading-tight text-[#3F3F42] md:text-[46px]">Still Have Questions</h3>
          <p className="mt-4 text-[26px] leading-[1.35] text-[#3F3F42] md:text-[28px]">
            Our travel experts are here to help you plan the perfect trip
          </p>

          <div className="mt-8 flex items-center gap-3">
            <button className="rounded-full bg-[#42c46e] px-6 py-3 text-[16px] font-semibold text-white transition hover:bg-[#33b55e]">
              Book This Trip
            </button>
            <button
              aria-label="Proceed"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#42c46e] text-white transition hover:bg-[#33b55e]"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 19L19 5M19 5v10M19 5H9" />
              </svg>
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}