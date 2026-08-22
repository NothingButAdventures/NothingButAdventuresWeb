"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Discount {
  _id: string;
  name: string;
  slug?: string;
  percentage: number;
  shortDescription?: string;
  description?: string;
  color?: string;
}

interface DealsMegaMenuProps {
  isHovered: boolean;
}

export default function DealsMegaMenu({ isHovered }: DealsMegaMenuProps) {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveDiscounts();
  }, []);

  const fetchActiveDiscounts = async () => {
    try {
      const response = await fetch(`${api.baseURL}${api.endpoints.discounts.getActive}`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === "success") {
          setDiscounts(data.data.discounts || []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch active discounts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isHovered) return null;

  // Helper function to map discount name to the search filters
  const getSearchLink = (name: string, percentage: number) => {
    return `/search?discounts=${encodeURIComponent(name)}&fromDeals=true&percentage=${percentage}`;
  };

  // Helper to render skeleton loading cards
  const renderSkeletons = () => (
    <div className="absolute left-0 top-full z-50 w-full bg-[#f8f9fb] px-2 pb-6 pt-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]">
      <div className="w-full">
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            minHeight: "calc(50vh - 72px)",
          }}
        >
          <div className="animate-pulse bg-[#f0f2f5] rounded-[8px] h-full p-6 space-y-4">
            <div className="h-4 bg-gray-300/60 rounded w-8"></div>
            <div className="h-6 bg-gray-300/60 rounded w-1/2"></div>
            <div className="h-[2px] bg-gray-300/60 w-12 mt-2"></div>
            <div className="h-10 bg-gray-300/60 rounded w-3/4"></div>
            <div className="h-24 bg-gray-300/60 rounded w-full"></div>
          </div>
          <div className="animate-pulse bg-[#f0f2f5] rounded-[8px] h-full p-6 space-y-4">
            <div className="h-4 bg-gray-300/60 rounded w-8"></div>
            <div className="h-6 bg-gray-300/60 rounded w-1/2"></div>
            <div className="h-[2px] bg-gray-300/60 w-12 mt-2"></div>
            <div className="h-10 bg-gray-300/60 rounded w-3/4"></div>
            <div className="h-24 bg-gray-300/60 rounded w-full"></div>
          </div>
          <div className="animate-pulse bg-[#f0f2f5] rounded-[8px] h-full p-6 space-y-4">
            <div className="h-4 bg-gray-300/60 rounded w-8"></div>
            <div className="h-6 bg-gray-300/60 rounded w-1/2"></div>
            <div className="h-[2px] bg-gray-300/60 w-12 mt-2"></div>
            <div className="h-10 bg-gray-300/60 rounded w-3/4"></div>
            <div className="h-24 bg-gray-300/60 rounded w-full"></div>
          </div>
          <div className="animate-pulse bg-[#f0f2f5] rounded-[8px] h-full p-6 space-y-4">
            <div className="h-4 bg-gray-300/60 rounded w-8"></div>
            <div className="h-6 bg-gray-300/60 rounded w-1/2"></div>
            <div className="h-[2px] bg-gray-300/60 w-12 mt-2"></div>
            <div className="h-10 bg-gray-300/60 rounded w-3/4"></div>
            <div className="h-24 bg-gray-300/60 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return renderSkeletons();
  }

  // Extract deals from array (only display actual DB data)
  const deal1 = discounts[0];
  const deal2 = discounts[1];
  const deal3 = discounts[2];
  const deal4 = discounts[3];

  return (
    <div className="absolute left-0 top-full z-50 w-full bg-[#f8f9fb] px-2 pb-6 pt-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]">
      <div className="w-full">
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            minHeight: "calc(50vh - 72px)",
          }}
        >
          {/* Card 01 - Column 1 - Static Info */}
          <div className="flex flex-col justify-center text-center rounded-[8px] bg-[#f0f2f5] p-6 hover:bg-[#ebedf1] transition-all duration-300">
            <div>
              <h3 className="text-[26px] font-bold text-[#3F3F42] leading-tight mt-1">
                NothingButAdventures deals
              </h3>
              <div className="w-12 h-[2px] bg-[#3F3F42] mx-auto mt-4 mb-4" />
              <p className="text-[15px] text-[#3F3F42] leading-relaxed">
                Explore our many discounts deals and exclusive offers to create your next adventure.
              </p>
            </div>
          </div>

          {/* Card 02 - Column 2 */}
          {deal1 ? (
            <Link
              href={getSearchLink(deal1.name, deal1.percentage)}
              className="flex flex-col justify-between rounded-[8px] bg-[#f0f2f5] p-6 hover:bg-[#ebedf1] transition-all duration-300 group"
            >
              <div>
                <span className="text-[14px] text-[#3F3F42]/60 tracking-wider font-mono">01</span>
                <div className="flex items-center gap-2 mt-1">
                  <h3 className="text-[22px] font-medium text-[#3F3F42] group-hover:text-blue-600 transition-colors">
                    {deal1.name}
                  </h3>
                  {deal1.color && (
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: deal1.color }}
                    />
                  )}
                </div>
                <div className="w-12 h-[2px] bg-[#3F3F42] mt-2 mb-4" />
                <div className="text-[42px] font-bold text-[#3F3F42] tracking-tight mb-2">
                  {deal1.percentage}% <span className="text-[24px] font-semibold text-[#3F3F42]/80">OFF</span>
                </div>
                <p className="text-[14px] text-[#3F3F42] leading-relaxed">
                  {deal1.shortDescription || "Special active discount on various tours. Book now to save!"}
                </p>
              </div>
              <div className="text-[13px] font-bold text-blue-600 mt-6 inline-flex items-center gap-1">
                View Qualifying Trips
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ) : (
            <div className="rounded-[8px] bg-[#f0f2f5]" />
          )}

          {/* Card 03 - Column 3 */}
          {deal2 ? (
            <Link
              href={getSearchLink(deal2.name, deal2.percentage)}
              className="flex flex-col justify-between rounded-[8px] bg-[#f0f2f5] p-6 hover:bg-[#ebedf1] transition-all duration-300 group"
            >
              <div>
                <span className="text-[14px] text-[#3F3F42]/60 tracking-wider font-mono">02</span>
                <div className="flex items-center gap-2 mt-1">
                  <h3 className="text-[22px] font-medium text-[#3F3F42] group-hover:text-blue-600 transition-colors">
                    {deal2.name}
                  </h3>
                  {deal2.color && (
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: deal2.color }}
                    />
                  )}
                </div>
                <div className="w-12 h-[2px] bg-[#3F3F42] mt-2 mb-4" />
                <div className="text-[42px] font-bold text-[#3F3F42] tracking-tight mb-2">
                  {deal2.percentage}% <span className="text-[24px] font-semibold text-[#3F3F42]/80">OFF</span>
                </div>
                <p className="text-[14px] text-[#3F3F42] leading-relaxed">
                  {deal2.shortDescription || "Limited-time discount event. Discover amazing adventures at unbeatable rates."}
                </p>
              </div>
              <div className="text-[13px] font-bold text-blue-600 mt-6 inline-flex items-center gap-1">
                View Qualifying Trips
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ) : (
            <div className="rounded-[8px] bg-[#f0f2f5]" />
          )}

          {/* Card 04 - Column 4 */}
          {deal3 ? (
            <Link
              href={getSearchLink(deal3.name, deal3.percentage)}
              className="flex flex-col justify-between rounded-[8px] bg-[#f0f2f5] p-6 hover:bg-[#ebedf1] transition-all duration-300 group"
            >
              <div>
                <span className="text-[14px] text-[#3F3F42]/60 tracking-wider font-mono">03</span>
                <div className="flex items-center gap-2 mt-1">
                  <h3 className="text-[22px] font-medium text-[#3F3F42] group-hover:text-blue-600 transition-colors">
                    {deal3.name}
                  </h3>
                  {deal3.color && (
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: deal3.color }}
                    />
                  )}
                </div>
                <div className="w-12 h-[2px] bg-[#3F3F42] mt-2 mb-4" />
                <div className="text-[42px] font-bold text-[#3F3F42] tracking-tight mb-2">
                  {deal3.percentage}% <span className="text-[24px] font-semibold text-[#3F3F42]/80">OFF</span>
                </div>
                <p className="text-[14px] text-[#3F3F42] leading-relaxed">
                  {deal3.shortDescription || "Limited-time discount event. Discover amazing adventures at unbeatable rates."}
                </p>
              </div>
              <div className="text-[13px] font-bold text-blue-600 mt-6 inline-flex items-center gap-1">
                View Qualifying Trips
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ) : (
            <div className="rounded-[8px] bg-[#f0f2f5]" />
          )}
        </div>
      </div>
    </div>
  );
}
