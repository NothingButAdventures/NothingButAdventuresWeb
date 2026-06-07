"use client";

import Link from "next/link";

interface WhyUsMegaMenuProps {
  isHovered: boolean;
}

export default function WhyUsMegaMenu({ isHovered }: WhyUsMegaMenuProps) {
  if (!isHovered) return null;

  return (
    <div className="absolute left-0 top-full z-50 w-full bg-[#f8f9fb] px-4 pb-6 pt-4 md:px-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] border-b border-black/5">
      <div className="mx-auto w-full max-w-[1600px]">
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            height: "calc(90vh - 72px)",
          }}
        >
          {/* Card 01 - Why NBA */}
          <Link
            href="/why-nba"
            className="flex flex-col justify-between rounded-[8px] bg-[#f0f2f5] p-6 hover:bg-[#ebedf1] transition-all duration-300"
          >
            <div>
              <span className="text-[14px] text-[#3F3F42] tracking-wider">01</span>
              <h3 className="text-[22px] font-medium text-[#3F3F42] mt-1">Why NBA</h3>
              <div className="w-12 h-[2px] bg-[#3F3F42] mt-2 mb-4" />
              <p className="text-[14px] text-[#3F3F42] leading-relaxed">
                We are young and wise enough to know, Best Adventures are
                experienced in Small Groups. Big stories, flexible itineraries, freedom
                to roam, safety, peace of mind, and locally based guides and
                experiences that's how we roll.
              </p>
            </div>
            
            <div className="space-y-3 mt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center">
                </div>
                <span className="text-[13px] text-[#3F3F42]">Reschedule Your Trips for free</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center">
                </div>
                <span className="text-[13px] text-[#3F3F42]">Hold Your Space</span>
              </div>
            </div>
          </Link>

          {/* Card 02 - About Us */}
          <Link
            href="/about-us"
            className="flex flex-col rounded-[8px] bg-[#f0f2f5] p-6 hover:bg-[#ebedf1] transition-all duration-300"
          >
            <div>
              <span className="text-[14px] text-[#3F3F42] tracking-wider">02</span>
              <h3 className="text-[22px] font-medium text-[#3F3F42] mt-1">About Us</h3>
              <div className="w-12 h-[2px] bg-[#3F3F42] mt-2 mb-4" />
              
              <div className="w-full aspect-[4/4.5] rounded-md bg-white my-4"></div>
            </div>
            
            <p className="text-[14px] text-[#3F3F42] mt-auto leading-relaxed">
              Changing the world through travel: that's our Goal.
            </p>
          </Link>

          {/* Column 3 - Cards 03 & 05 */}
          <div className="grid grid-rows-2 gap-4">
            {/* Card 03 - NBA Club */}
            <Link
              href="/nba-club"
              className="flex flex-col rounded-[8px] bg-[#f0f2f5] p-6 hover:bg-[#ebedf1] transition-all duration-300"
            >
              <div>
                <span className="text-[14px] text-[#3F3F42] tracking-wider">03</span>
                <h3 className="text-[20px] font-medium text-[#3F3F42] mt-1">
                  NBA Club
                </h3>
                <div className="w-12 h-[2px] bg-[#3F3F42] mt-2 mb-3" />
                <p className="text-[14px] text-[#3F3F42] leading-relaxed">
                  Exclusive perks. Priority access. Unforgettable rewards. Travel with
                  us three times or more and unlock your place in our all-new club —
                  created for the world's most adventurous travellers.
                </p>
              </div>
            </Link>

            {/* Card 05 - The Furkind Initiative */}
            <Link
              href="/why-nba"
              className="flex flex-col rounded-[8px] bg-[#f0f2f5] p-6 hover:bg-[#ebedf1] transition-all duration-300"
            >
              <div>
                <span className="text-[14px] text-[#3F3F42] tracking-wider">05</span>
                <h3 className="text-[20px] font-medium text-[#3F3F42] mt-1">
                  The Furkind Initiative
                </h3>
                <div className="w-12 h-[2px] bg-[#3F3F42] mt-2 mb-3" />
                <p className="text-[14px] text-[#3F3F42] leading-relaxed">
                  Spread a little more kindness around the world — one bowl at a time.
                  Every Journey with helps provide food, care, and support to stray and
                  vulnerable animals in destinations around the globe leaving positive
                  pawprint behind.
                </p>
              </div>
            </Link>
          </div>

          {/* Column 4 - Cards 04 & 06 */}
          <div className="grid grid-rows-2 gap-4">
            {/* Card 04 - The Living Planet */}
            <Link
              href="/tree-planting"
              className="flex flex-col rounded-[8px] bg-[#f0f2f5] p-6 hover:bg-[#ebedf1] transition-all duration-300"
            >
              <div>
                <span className="text-[14px] text-[#3F3F42] tracking-wider">04</span>
                <h3 className="text-[20px] font-medium text-[#3F3F42] mt-1">
                  The Living Planet
                </h3>
                <div className="w-12 h-[2px] bg-[#3F3F42] mt-2 mb-3" />
                <p className="text-[14px] text-[#3F3F42] leading-relaxed">
                  Travel with purpose. For every day on tour, we'll plant a tree on your
                  behalf and support forests around the world as they grow and flourish
                </p>
              </div>
            </Link>

            {/* Card 06 - Blank card */}
            <div className="rounded-[8px] bg-[#f0f2f5]">
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

