"use client";

import React, { useState } from "react";

interface ParsedBlock {
  type: "text" | "list";
  content: string;
}

interface TabData {
  left: ParsedBlock[];
  right: ParsedBlock[];
}

interface BeforeYouBookData {
  isTourForMe?: TabData | string;
  visaInformation?: TabData | string;
  accommodation?: TabData | string;
  joiningPoint?: TabData | string;
}

interface BeforeYouBookSectionProps {
  data?: BeforeYouBookData;
}

const TABS = [
  { key: "isTourForMe" as const, label: "Is the tour for me" },
  { key: "visaInformation" as const, label: "Visa Information" },
  { key: "accommodation" as const, label: "Accommodation" },
  { key: "joiningPoint" as const, label: "Joining Point" },
];

export default function BeforeYouBookSection({ data }: BeforeYouBookSectionProps) {
  const [activeTab, setActiveTab] = useState(0);

  const hasContent = data && Object.values(data).some((tab) => {
    if (typeof tab === "string") return tab.trim().length > 0;
    return tab && (tab.left?.length > 0 || tab.right?.length > 0);
  });
  if (!hasContent) return null;

  const currentKey = TABS[activeTab].key;
  function parseHtml(html: string): TabData {
    const leftBlocks: ParsedBlock[] = [];
    const rightBlocks: ParsedBlock[] = [];

    const decodeHTML = (h: string) => {
      if (typeof window === "undefined") return h;
      const textarea = document.createElement("textarea");
      textarea.innerHTML = h;
      return textarea.value;
    };

    let doc: Document;
    if (typeof window !== "undefined") {
      const decodedValue = decodeHTML(html);
      const parser = new DOMParser();
      doc = parser.parseFromString(decodedValue, "text/html");
    } else {
      return { left: [], right: [] };
    }

    const body = doc.body;

    const leftCol = doc.querySelector(".col-left");
    const rightCol = doc.querySelector(".col-right");

    function walkAndExtract(node: Node, targetArray: ParsedBlock[]) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.tagName === "UL" || el.tagName === "OL") {
          el.childNodes.forEach((child) => walkAndExtract(child, targetArray));
        } else if (el.tagName === "LI") {
          const text = el.innerHTML?.trim();
          if (text) targetArray.push({ type: "list", content: text });
        } else if (["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6"].includes(el.tagName)) {
          if (el.querySelector("ul, ol, li, p, div, h1, h2, h3, h4, h5, h6")) {
            el.childNodes.forEach((child) => walkAndExtract(child, targetArray));
          } else {
            const text = el.outerHTML;
            if (text) targetArray.push({ type: "text", content: text });
          }
        } else {
          el.childNodes.forEach((child) => walkAndExtract(child, targetArray));
        }
      } else if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) targetArray.push({ type: "text", content: text });
      }
    }

    if (leftCol || rightCol) {
      if (leftCol) walkAndExtract(leftCol, leftBlocks);
      if (rightCol) walkAndExtract(rightCol, rightBlocks);
    } else {
      body.childNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          if (el.tagName === "UL" || el.tagName === "OL") {
            walkAndExtract(el, rightBlocks);
          } else {
            walkAndExtract(el, leftBlocks);
          }
        } else {
          walkAndExtract(node, leftBlocks);
        }
      });
    }

    return { left: leftBlocks, right: rightBlocks };
  }

  const currentTabRaw = data?.[currentKey] || { left: [], right: [] };
  const currentTab = typeof currentTabRaw === "string" ? parseHtml(currentTabRaw) : currentTabRaw;
  const leftBlocks = currentTab.left || [];
  const rightBlocks = currentTab.right || [];

  const renderBlock = (block: ParsedBlock, i: number) => {
    if (block.type === "text") {
      return (
        <div
          key={i}
          className="text-[14px] md:text-[15px] text-[#4A4A4A] leading-[1.75] prose prose-sm max-w-none prose-p:my-1 prose-headings:mb-2 prose-headings:mt-4 prose-a:text-[#7C3AED]"
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      );
    }
    return (
      <div
        key={i}
        className="flex items-center gap-3 bg-[#F5F3FA] rounded-[12px] px-4 py-3.5"
      >
        {/* Left outlined check circle */}
        <div className="w-[30px] h-[30px] rounded-full border-[2px] border-[#7C3AED] flex items-center justify-center shrink-0">
          <svg className="w-[14px] h-[14px] text-[#7C3AED]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Text */}
        <span className="flex-1 text-[13px] md:text-[14px] text-[#3F3F42] leading-snug" dangerouslySetInnerHTML={{ __html: block.content }}></span>

        {/* Right filled check circle */}
        <div className="w-[30px] h-[30px] rounded-full bg-[#7C3AED] flex items-center justify-center shrink-0">
          <svg className="w-[14px] h-[14px] text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 pb-12">
      <div className="rounded-[20px] overflow-hidden shadow-xl">

        {/* ===== HEADER ===== */}
        <div className="relative bg-[#1E1040] px-8 md:px-12 py-10 md:py-14 overflow-hidden">
          {/* Decorative swirl — bottom left */}
          <svg className="absolute left-[-30px] bottom-[-40px] w-[260px] h-[260px] opacity-50" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="90" stroke="#5B3A9E" strokeWidth="8" />
            <circle cx="100" cy="100" r="70" stroke="#5B3A9E" strokeWidth="6" />
            <circle cx="100" cy="100" r="50" stroke="#5B3A9E" strokeWidth="5" />
            <circle cx="100" cy="100" r="30" stroke="#5B3A9E" strokeWidth="4" />
          </svg>
          {/* Decorative circle — right side */}
          <svg className="absolute right-[60px] top-[50%] -translate-y-1/2 w-[120px] h-[120px] opacity-25" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="45" stroke="#7C3AED" strokeWidth="6" />
            <circle cx="50" cy="50" r="30" stroke="#7C3AED" strokeWidth="5" />
          </svg>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-white/60 text-[20px] md:text-[24px] italic font-light mb-0.5" style={{ fontFamily: '"Georgia", serif' }}>
                Before you book,
              </p>
              <h2 className="text-white text-[34px] md:text-[46px] font-extrabold leading-[1.1]">
                You should know
              </h2>
              <svg width="140" height="12" viewBox="0 0 140 12" className="mt-2">
                <path d="M2 9 Q 18 2, 35 9 Q 52 16, 70 9 Q 87 2, 105 9 Q 122 16, 138 9" stroke="#7C3AED" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </div>

            {/* Logo */}
            <div className="flex items-center gap-3.5">
              <div className="relative w-[56px] h-[56px] md:w-[68px] md:h-[68px]">
                <div className="absolute inset-0 rounded-full border-[3px] border-[#7C3AED]/40" />
                <div className="absolute inset-[8px] rounded-full border-[3px] border-[#7C3AED]/55" />
                <div className="absolute inset-[16px] rounded-full border-[2.5px] border-[#7C3AED]/70" />
                <div className="absolute inset-[24px] rounded-full bg-[#7C3AED]/50" />
              </div>
              <div className="text-white leading-tight">
                <span className="text-[15px] md:text-[17px] font-light tracking-wide">Nothing but</span>
                <br />
                <span className="text-[24px] md:text-[30px] font-extrabold tracking-tight">Adventures.</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== TABS ===== */}
        <div className="bg-white">
          <div className="flex">
            {TABS.map((tab, index) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(index)}
                className={`flex-1 text-center py-3.5 text-[13px] md:text-[15px] font-semibold transition-all cursor-pointer relative ${
                  activeTab === index
                    ? "bg-[#512AA7] text-white"
                    : "bg-white text-[#3F3F42] hover:bg-gray-50"
                } ${index > 0 ? "border-l border-gray-200" : ""}`}
                style={
                  activeTab === index
                    ? { borderRadius: index === 0 ? "0" : "0", }
                    : {}
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ===== CONTENT ===== */}
        <div className="bg-white">
          {(leftBlocks.length > 0 || rightBlocks.length > 0) ? (
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* LEFT COLUMN */}
              <div className="px-8 md:px-10 py-8 md:py-10 border-r border-gray-200">
                {/* Content */}
                {leftBlocks.length > 0 && (
                  <div className="space-y-4">
                    {leftBlocks.map((block, i) => renderBlock(block, i))}
                  </div>
                )}

                {leftBlocks.length === 0 && rightBlocks.length === 0 && (
                  <p className="text-[15px] text-gray-400 italic">No content added yet.</p>
                )}

              </div>

              {/* RIGHT COLUMN */}
              <div className="px-6 md:px-8 py-8 md:py-10 flex flex-col">
                <div className="flex flex-col gap-3 flex-1">
                  {rightBlocks.map((block, i) => renderBlock(block, i))}
                </div>

                {/* CTA Button */}
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    className="bg-[#2D1B52] text-white px-7 py-3 rounded-[10px] text-[14px] font-semibold flex items-center gap-2 hover:bg-[#3d2570] transition-colors cursor-pointer"
                  >
                    {TABS[activeTab].label}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-8 md:px-12 py-12 text-center text-gray-400 italic">
              No information available for this tab.
            </div>
          )}
        </div>

        {/* ===== FOOTER (dark purple with decorative swirl) ===== */}
        <div className="relative bg-[#1E1040] h-[80px] overflow-hidden">
          <svg className="absolute left-[-20px] bottom-[-60px] w-[220px] h-[220px] opacity-60" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="90" stroke="#5B3A9E" strokeWidth="10" />
            <circle cx="100" cy="100" r="68" stroke="#5B3A9E" strokeWidth="8" />
            <circle cx="100" cy="100" r="48" stroke="#5B3A9E" strokeWidth="6" />
            <circle cx="100" cy="100" r="30" stroke="#5B3A9E" strokeWidth="5" />
            <circle cx="100" cy="100" r="14" stroke="#5B3A9E" strokeWidth="4" />
          </svg>
        </div>

      </div>
    </div>
  );
}
