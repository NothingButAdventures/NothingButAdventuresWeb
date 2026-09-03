import Link from "next/link";
import TourCard from "@/components/TourCard";
import PopularToursSection from "@/components/PopularToursSection";
import ExploreSection from "@/components/ExploreSection";
import PostcardsInMotionSection from "@/components/PostcardsInMotionSection";
import WhyNothingButAdventuresSection from "@/components/WhyNothingButAdventuresSection";
import PopularDestinationsSection from "@/components/PopularDestinationsSection";
import ReviewsSection from "@/components/ReviewsSection";
import MeetLocalGuidesSection from "@/components/MeetLocalGuidesSection";
import StartPlanningSection from "@/components/StartPlanningSection";
import BeyondTheMapSection from "@/components/BeyondTheMapSection";
import FaqSection from "@/components/FaqSection";
import RecentlyViewedSection from "@/components/RecentlyViewedSection";
import { api } from "@/lib/api";

async function getFeaturedTours() {
  try {
    const res = await fetch(
      `${api.baseURL}${api.endpoints.tours.getAll}?limit=4`,
      { next: { revalidate: 60 } },
    );
    const data = await res.json();
    return data?.data?.tours || data?.data || [];
  } catch (error) {
    console.error("Failed to fetch featured tours:", error);
    return [];
  }
}

async function getContinents() {
  try {
    const res = await fetch(
      `${api.baseURL}${api.endpoints.continents.getAll}`,
      {
        next: { revalidate: 60 },
      },
    );
    if (!res.ok) throw new Error("Failed to fetch continents");
    const data = await res.json();
    return data?.data?.continents || [];
  } catch (error) {
    console.error("Error fetching continents:", error);
    return [];
  }
}

async function getCountries() {
  try {
    const res = await fetch(
      `${api.baseURL}${api.endpoints.countries.getAll}?limit=100&sort=-statistics.popularityScore`,
      { next: { revalidate: 60 } },
    );
    const data = await res.json();
    return data?.data?.countries || data?.data || [];
  } catch (error) {
    console.error("Failed to fetch countries:", error);
    return [];
  }
}

async function getBlogs() {
  try {
    const res = await fetch(
      `${api.baseURL}${api.endpoints.blogs.getAll}?limit=3&sort=-publishedAt&status=published`,
      { next: { revalidate: 60 } },
    );
    const data = await res.json();
    return data?.data?.blogs || data?.data || [];
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
    return [];
  }
}

export default async function Home() {
  const tours = await getFeaturedTours();
  const rawCountries = await getCountries();
  const continents = await getContinents();
  const blogs = await getBlogs();

  // Map country continent IDs to actual continent objects
  const countries = rawCountries.map((country: any) => {
    if (typeof country.continent === "string") {
      const foundContinent = continents.find(
        (c: any) => c._id === country.continent || c.id === country.continent,
      );
      if (foundContinent) {
        return { ...country, continent: foundContinent };
      }
    }
    return country;
  });

  return (
    <main className="w-full mx-auto font-sans">
      {/* Mobile Hero Section (Width <= 402px: #5640:5158, card width: 386px, height: 669px, borderRadius: 16px) */}
      <div className="block md:hidden w-full px-2 pt-2 mb-6">
        <div className="relative w-full max-w-[386px] h-[669px] mx-auto rounded-[16px] overflow-hidden bg-[#242239] shadow-sm flex flex-col justify-end p-[20.86px] pb-[34px]">
          {/* Background Image & Gradient Overlay */}
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: 'url("/hero-1.svg")',
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 z-1 bg-gradient-to-b from-transparent via-black/20 to-black/80 rounded-[16px]" />

          {/* Hero Content (#5640:5168, #5640:5169) */}
          <div className="relative z-10 w-full">
            <h1 className="font-outfit text-white text-[42px] font-normal leading-[1.05] tracking-normal drop-shadow-sm mb-1">
              See Yourself <br />
              and the world
            </h1>
            <div className="font-gochi text-white text-[54px] font-normal leading-[1.0] drop-shadow-sm mb-5">
              Differently.
            </div>

            {/* Divider Line (#5640:5170, width: 245.32px, stroke: rgba(255,255,255,0.5)) */}
            <div className="w-[245.32px] max-w-full h-[1px] bg-white/50 backdrop-blur-[2.06px] mb-[22px]" />

            {/* Feature Pills with Pure Glass Effect (#5640:5160, #5640:5171, #5640:5184) */}
            <div className="flex flex-col gap-[11.53px]">
              <div className="flex items-center gap-[8px] flex-wrap">
                {/* Pill 1: Private Trips */}
                <div className="inline-flex items-center justify-center gap-[8px] bg-white/[0.1] backdrop-blur-xl shadow-lg shadow-black/10 px-[18px] py-[8.5px] rounded-full select-none hover:bg-white/[0.15] transition-all border-0">
                  <svg
                    className="w-[18px] h-[18px] text-white shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                  <span className="font-sans text-white text-[15px] font-medium leading-none tracking-normal whitespace-nowrap">
                    Private Trips
                  </span>
                </div>

                {/* Pill 2: Transport Included */}
                <div className="inline-flex items-center justify-center gap-[8px] bg-white/[0.1] backdrop-blur-xl shadow-lg shadow-black/10 px-[18px] py-[8.5px] rounded-full select-none hover:bg-white/[0.15] transition-all border-0">
                  <svg
                    className="w-[18px] h-[18px] text-white shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 3h6" />
                    <path d="M5 9l2-4h10l2 4" />
                    <rect x="3" y="9" width="18" height="9" rx="2" />
                    <circle
                      cx="7"
                      cy="13.5"
                      r="1.5"
                      fill="currentColor"
                      stroke="none"
                    />
                    <circle
                      cx="17"
                      cy="13.5"
                      r="1.5"
                      fill="currentColor"
                      stroke="none"
                    />
                    <path d="M5 18v2M19 18v2" />
                  </svg>
                  <span className="font-sans text-white text-[15px] font-medium leading-none tracking-normal whitespace-nowrap">
                    Transport Included
                  </span>
                </div>
              </div>

              {/* Pill 3: Custom Route */}
              <div className="flex items-center gap-[8px]">
                <div className="inline-flex items-center justify-center gap-[8px] bg-white/[0.1] backdrop-blur-xl shadow-lg shadow-black/10 px-[18px] py-[8.5px] rounded-full select-none hover:bg-white/[0.15] transition-all border-0">
                  <svg
                    className="w-[18px] h-[18px] text-white shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="5" cy="18" r="2.5" />
                    <circle cx="19" cy="6" r="2.5" />
                    <path d="M7.5 18h4.5a4 4 0 0 0 4-4v0a4 4 0 0 0-4-4H8a4 4 0 0 1-4-4v0a4 4 0 0 1 4-4h8.5" />
                  </svg>
                  <span className="font-sans text-white text-[15px] font-medium leading-none tracking-normal whitespace-nowrap">
                    Custom Route
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Hero Section (#5091:7209 on 1280px / #5640:7218 on 785px) */}
      <div className="hidden md:block relative w-full mb-6 sm:mb-8 lg:mb-10">
        <div className="relative w-full h-[351.4px] lg:h-[460px] xl:h-[573px] overflow-hidden bg-[#242239] group">
          {/* Background Image */}
          <div
            className="absolute inset-0 z-0 transition-transform duration-[2s] ease-out group-hover:scale-[1.01]"
            style={{
              backgroundImage: 'url("/hero-1.svg")',
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>

          {/* Hero Content Container (x: 28.83px, y: 158.84px on 785px / x: 47px, y: 259px on 1280px) */}
          <div className="w-full max-w-[1280px] mx-auto px-[28.8px] lg:px-[38px] xl:px-[47px] relative h-full flex flex-col justify-start pt-[158.8px] lg:pt-[205px] xl:pt-[259px] z-20">
            {/* Main Headline Content (#5640:7229 on 785px: 432px x 94px / #5091:7219 on 1280px: 704px x 154px) */}
            <div className="mb-[15.3px] lg:mb-[20px] xl:mb-[25px] w-full max-w-[432px] lg:max-w-[560px] xl:max-w-[704px]">
              <h1 className="font-outfit text-white text-[39.25px] lg:text-[50px] xl:text-[64px] font-normal leading-[42.93px] lg:leading-[55px] xl:leading-[70px] drop-shadow-sm">
                See yourself & the World
              </h1>
              <div className="font-gochi text-white text-[41.7px] lg:text-[54px] xl:text-[68px] font-normal leading-[42.93px] lg:leading-[55px] xl:leading-[70px] drop-shadow-sm">
                Differently
                <span className="font-gochi text-[50.29px] lg:text-[65px] xl:text-[82px] leading-[42.93px] lg:leading-[55px] xl:leading-[70px]">
                  .
                </span>
              </div>
            </div>

            {/* Search Box (#5640:7223 on 785px: 419.48px x 33.73px / #5091:7213 on 1280px: 684px x 55px) */}
            <div className="w-full max-w-[419.5px] lg:max-w-[545px] xl:max-w-[684px]">
              <form action="/search" method="GET" className="w-full">
                <div className="relative flex items-center w-full h-[33.73px] lg:h-[44px] xl:h-[55px] bg-white rounded-[128.8px] xl:rounded-[210px] pl-[18.4px] lg:pl-[24px] xl:pl-[30px] pr-[1.2px] xl:pr-[2px] shadow-[0.61px_0.61px_6.13px_0px_rgba(0,0,0,0.09)] xl:shadow-[1px_1px_10px_0px_rgba(0,0,0,0.09)]">
                  <input
                    type="text"
                    name="q"
                    placeholder="Search Plans"
                    className="w-full bg-transparent border-none outline-none text-[#1A1A1A] placeholder:text-[#1A1A1A]/60 font-outfit text-[14.8px] lg:text-[19px] xl:text-[24px] font-normal"
                  />
                  <button
                    type="submit"
                    aria-label="Search"
                    className="w-[31.28px] h-[31.28px] lg:w-[40px] lg:h-[40px] xl:w-[51px] xl:h-[51px] rounded-full bg-[#1A1A1A] hover:bg-black transition-all duration-200 flex items-center justify-center text-white shrink-0 cursor-pointer shadow-md hover:scale-[1.02] active:scale-95"
                  >
                    <svg
                      className="w-[13.5px] h-[13.5px] lg:w-[17px] lg:h-[17px] xl:w-[22px] xl:h-[22px]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Bottom-Right White Logo Watermark (#5640:7220 on 785px: 164.97px x 167.68px / #5091:7210 on 1280px: 269px x 273.41px) */}
          <div className="absolute -bottom-[27.6px] -right-[29.4px] lg:-bottom-[36px] lg:-right-[38px] xl:-bottom-[45px] xl:-right-[48px] z-10 pointer-events-none overflow-hidden select-none">
            <img
              src="/nba_logo1.svg"
              alt=""
              className="w-[164.97px] h-[167.68px] lg:w-[215px] lg:h-[218px] xl:w-[269px] xl:h-[273.41px] opacity-95 invert brightness-0 object-contain"
            />
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1280px] mx-auto px-5 sm:px-6 md:px-8 xl:px-[35px]">
        <RecentlyViewedSection />
      </div>

      {/* Small Group Adventures Section (#5091:7989 / Mobile #5640:5330) */}
      <div className="w-full max-w-[1280px] mx-auto px-5 sm:px-6 md:px-8 xl:px-[35px] mt-[65px] md:mt-24 xl:mt-[120px]">
        {/* Mobile View (#5640:5330, width: 359px, height: 648px, rounded: 16px) */}
        <div className="block md:hidden relative w-full max-w-[359px] h-[648px] mx-auto bg-[rgba(244,236,217,0.25)] rounded-[16px] overflow-hidden">
          {/* Header (#5640:5334, x: 12.95px, y: 41.74px, width: 338.09px) */}
          <div className="absolute left-[13px] top-[41.74px] w-[338px] text-left">
            <div className="font-gochi text-[#254B02] text-[16px] leading-tight">
              Small Group Adventures
            </div>
            <h2 className="font-outfit text-[#1A1A1A] text-[28px] font-normal leading-[36px] mt-1">
              Changing the way you see life and Yourself
            </h2>
          </div>

          {/* Vertical Dashed Line (#5640:5332, x: 26.41px, y: 224.46px, height: 336.55px) */}
          <div
            className="absolute left-[26.41px] top-[224.46px] h-[336.55px] border-l border-dashed border-[#1A1A1A]/40 z-0 pointer-events-none"
            style={{ width: "1px" }}
          />

          {/* Row 1 */}
          {/* Vector Pin 1 (#5640:5383, x: 20.23px, y: 215.19px, width: 12.01px, height: 12.65px) */}
          <img
            src="/nba_logo1.svg"
            alt=""
            className="absolute left-[20.23px] top-[215.19px] w-[12.01px] h-[12.65px] object-contain z-10"
          />
          {/* Image 1 (#5640:5335, x: 65.59px, y: 166.74px, width: 109.26px, height: 109.26px) */}
          <img
            src="/sg_1.svg"
            alt="Shared adventures"
            className="absolute left-[65.59px] top-[166.74px] w-[109.26px] max-[395px]:w-[95px] max-[375px]:w-[88px] h-[109.26px] max-[395px]:h-[95px] max-[375px]:h-[88px] object-contain"
          />
          {/* Text 1 (#5640:5382, x: 208.86px, y: 205.91px, width: 133px) */}
          <p className="absolute left-[208.86px] max-[395px]:left-auto max-[395px]:right-[10px] max-[395px]:w-[125px] top-[205.91px] w-[133px] font-outfit text-[#1A1A1A] text-[12.64px] font-normal text-center leading-[16px]">
            Shared adventures with like minded people
          </p>

          {/* Row 2 */}
          {/* Vector Pin 2 (#5640:5384, x: 20.23px, y: 386.29px, width: 12.01px, height: 12.65px) */}
          <img
            src="/nba_logo1.svg"
            alt=""
            className="absolute left-[20.23px] top-[386.29px] w-[12.01px] h-[12.65px] object-contain z-10"
          />
          {/* Text 2 (#5640:5433, x: 64.55px, y: 377.02px, width: 123px) */}
          <p className="absolute left-[64.55px] max-[395px]:left-[45px] max-[395px]:w-[115px] top-[377.02px] w-[123px] font-outfit text-[#1A1A1A] text-[12.64px] font-normal text-center leading-[16px]">
            1000s of experiences,
            <br />
            over 100 countries
          </p>
          {/* Image 2 (#5640:5386, x: 219.16px, y: 341.97px, width: 122.39px, height: 101.02px) */}
          <img
            src="/sg_2.svg"
            alt="1000s of experiences"
            className="absolute left-[219.16px] top-[341.97px] w-[122.39px] max-[395px]:w-[105px] max-[375px]:w-[98px] h-[101.02px] max-[395px]:h-[87px] max-[375px]:h-[81px] object-contain"
          />

          {/* Row 3 */}
          {/* Vector Pin 3 (#5640:5385, x: 20.23px, y: 557.4px, width: 12.01px, height: 12.65px) */}
          <img
            src="/nba_logo1.svg"
            alt=""
            className="absolute left-[20.23px] top-[557.4px] w-[12.01px] h-[12.65px] object-contain z-10"
          />
          {/* Image 3 (#5640:5434, x: 60.43px, y: 501.74px, width: 115.83px, height: 113.79px) */}
          <img
            src="/sg_3.svg"
            alt="Creating positive change"
            className="absolute left-[60.43px] top-[501.74px] w-[115.83px] max-[395px]:w-[100px] max-[375px]:w-[92px] h-[113.79px] max-[395px]:h-[98px] max-[375px]:h-[90px] object-contain"
          />
          {/* Text 3 (#5640:5528, x: 204.74px, y: 547.09px, width: 142.23px) */}
          <p className="absolute left-[204.74px] max-[395px]:left-auto max-[395px]:right-[10px] max-[395px]:w-[130px] top-[547.09px] w-[142.23px] font-outfit text-[#1A1A1A] text-[12.64px] font-normal text-center leading-[16px]">
            Creating positive change around the place you visit
          </p>
        </div>

        {/* Desktop View (#5640:7987 on 785px: 741.46px x 342.21px / #5091:7989 on 1280px: 1209px x 558px) */}
        <div className="hidden md:block bg-[rgba(244,236,217,0.25)] rounded-[7.4px] xl:rounded-[12px] pt-[32.5px] lg:pt-[42px] xl:pt-[53px] px-[39px] lg:px-[50px] xl:px-[64px] pb-[30.7px] lg:pb-[40px] xl:pb-[50px] relative overflow-hidden">
          {/* Subheading & Title (#5640:7989 on 785px / #5091:7991 & #5091:7992 on 1280px) */}
          <div className="mb-[28px] lg:mb-[36px] xl:mb-[46px]">
            <div className="font-gochi text-[#254B02] text-[19.6px] lg:text-[25px] xl:text-[32px] font-normal leading-[1.05em] mb-0">
              Small Group Adventures
            </div>
            <h2 className="text-[29.4px] lg:text-[38px] xl:text-[48px] font-normal leading-[1.15em] text-[#1A1A1A] tracking-normal font-outfit mt-0">
              Changing the way you see life and Yourself
            </h2>
          </div>

          {/* 3-Tier Row Structure matching Figma with dashed line locked to the exact center of the NBA marker icons */}
          <div className="w-full flex flex-col">
            {/* Row 1: Illustrations (#5640:8038, #5640:7991, #5640:8085 on 785px: 110.39px height / 1280px: 180px height) */}
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8 md:gap-0 w-full mb-2 lg:mb-3 xl:mb-4">
              <div className="flex justify-center items-end w-full md:w-[135px] lg:w-[175px] xl:w-[220px] h-[110px] lg:h-[145px] xl:h-[180px] shrink-0">
                <img
                  src="/sg_1.svg"
                  alt="Shared adventures"
                  className="h-full w-auto object-contain"
                />
              </div>
              <div className="flex justify-center items-end w-full md:w-[135px] lg:w-[175px] xl:w-[220px] h-[110px] lg:h-[145px] xl:h-[180px] shrink-0">
                <img
                  src="/sg_2.svg"
                  alt="1000s of experiences"
                  className="h-full w-auto object-contain"
                />
              </div>
              <div className="flex justify-center items-end w-full md:w-[138px] lg:w-[180px] xl:w-[225px] h-[110px] lg:h-[145px] xl:h-[180px] shrink-0">
                <img
                  src="/sg_3.svg"
                  alt="Creating positive change"
                  className="h-full w-auto object-contain"
                />
              </div>
            </div>

            {/* Row 2: Dashed Line (#5640:8182) perfectly intersecting the exact center of NBA marker icons */}
            <div className="relative w-full hidden md:block my-2 xl:my-3">
              {/* Dashed line locked at vertical 50% center of the marker row */}
              <svg
                className="absolute left-[67.5px] lg:left-[87.5px] xl:left-[110px] right-[69px] lg:right-[90px] xl:right-[112.5px] top-1/2 -translate-y-1/2 w-[calc(100%-136.5px)] lg:w-[calc(100%-177.5px)] xl:w-[calc(100%-222.5px)] h-[2px] pointer-events-none z-0 overflow-visible"
                preserveAspectRatio="none"
              >
                <line
                  x1="0"
                  y1="1"
                  x2="100%"
                  y2="1"
                  stroke="rgba(26, 26, 26, 0.4)"
                  strokeWidth="1"
                  strokeDasharray="6 6"
                />
              </svg>

              {/* 3 Marker icons centered over each column */}
              <div className="flex items-center justify-between w-full relative z-10">
                <div className="w-[135px] lg:w-[175px] xl:w-[220px] flex justify-center items-center shrink-0">
                  <div className="w-[12.3px] h-[12.3px] lg:w-[16px] lg:h-[16px] xl:w-[20px] xl:h-[20px] bg-[#f7efe0] rounded-full flex items-center justify-center">
                    <img
                      src="/nba_logo1.svg"
                      alt="NBA Marker"
                      className="w-[11.6px] h-[11.6px] lg:w-[15px] lg:h-[15px] xl:w-[18px] xl:h-[18px] object-contain"
                    />
                  </div>
                </div>
                <div className="w-[135px] lg:w-[175px] xl:w-[220px] flex justify-center items-center shrink-0">
                  <div className="w-[12.3px] h-[12.3px] lg:w-[16px] lg:h-[16px] xl:w-[20px] xl:h-[20px] bg-[#f7efe0] rounded-full flex items-center justify-center">
                    <img
                      src="/nba_logo1.svg"
                      alt="NBA Marker"
                      className="w-[11.6px] h-[11.6px] lg:w-[15px] lg:h-[15px] xl:w-[18px] xl:h-[18px] object-contain"
                    />
                  </div>
                </div>
                <div className="w-[138px] lg:w-[180px] xl:w-[225px] flex justify-center items-center shrink-0">
                  <div className="w-[12.3px] h-[12.3px] lg:w-[16px] lg:h-[16px] xl:w-[20px] xl:h-[20px] bg-[#f7efe0] rounded-full flex items-center justify-center">
                    <img
                      src="/nba_logo1.svg"
                      alt="NBA Marker"
                      className="w-[11.6px] h-[11.6px] lg:w-[15px] lg:h-[15px] xl:w-[18px] xl:h-[18px] object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: Captions (#5640:8179 - #5640:8181 on 785px: 12.27px font / #5091:8181 - #5091:8183 on 1280px: 20px font) */}
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 md:gap-0 w-full mt-1.5 xl:mt-2">
              <div className="w-full md:w-[135px] lg:w-[175px] xl:w-[220px] flex justify-center text-center shrink-0">
                <p className="text-[#1A1A1A] font-normal text-[12.3px] lg:text-[16px] xl:text-[20px] leading-tight xl:leading-snug text-center max-w-[130px] lg:max-w-[170px] xl:max-w-[210px] mx-auto font-outfit">
                  Shared adventures with
                  <br className="hidden sm:inline" /> like-minded people
                </p>
              </div>
              <div className="w-full md:w-[135px] lg:w-[175px] xl:w-[220px] flex justify-center text-center shrink-0">
                <p className="text-[#1A1A1A] font-normal text-[12.3px] lg:text-[16px] xl:text-[20px] leading-tight xl:leading-snug text-center max-w-[120px] lg:max-w-[160px] xl:max-w-[194px] mx-auto font-outfit">
                  1000s of experiences,
                  <br className="hidden sm:inline" /> over 100 countries
                </p>
              </div>
              <div className="w-full md:w-[138px] lg:w-[180px] xl:w-[225px] flex justify-center text-center shrink-0">
                <p className="text-[#1A1A1A] font-normal text-[12.3px] lg:text-[16px] xl:text-[20px] leading-tight xl:leading-snug text-center max-w-[140px] lg:max-w-[180px] xl:max-w-[225px] mx-auto font-outfit">
                  Creating positive change around the place you visit
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1280px] mx-auto px-5 sm:px-6 md:px-8 xl:px-[35px]">
        <PopularToursSection tours={tours} />
      </div>
      <div className="w-full max-w-[1280px] mx-auto px-5 sm:px-6 md:px-8 xl:px-[35px]">
        <ExploreSection />
      </div>
      <div className="w-full max-w-[1280px] mx-auto px-5 sm:px-6 md:px-8 xl:px-[35px]">
        <PostcardsInMotionSection />
      </div>
      <WhyNothingButAdventuresSection />
      <div className="w-full max-w-[1280px] mx-auto px-5 sm:px-6 md:px-8 xl:px-[35px]">
        <PopularDestinationsSection countries={countries} />
      </div>
      <div className="w-full max-w-[1280px] mx-auto px-5 sm:px-6 md:px-8 xl:px-[35px]">
        <ReviewsSection />
      </div>
      <div className="w-full max-w-[1280px] mx-auto px-5 sm:px-6 md:px-8 xl:px-[35px]">
        <MeetLocalGuidesSection />
      </div>
      <div className="w-full max-w-[1280px] mx-auto px-5 sm:px-6 md:px-8 xl:px-[35px]">
        <StartPlanningSection />
      </div>
      <div className="w-full max-w-[1280px] mx-auto px-5 sm:px-6 md:px-8 xl:px-[35px]">
        <BeyondTheMapSection blogs={blogs} />
      </div>
      <div className="w-full max-w-[1280px] mx-auto px-5 sm:px-6 md:px-8 xl:px-[35px]">
        <FaqSection />
      </div>
    </main>
  );
}
