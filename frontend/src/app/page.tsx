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
    const res = await fetch(`${api.baseURL}${api.endpoints.tours.getAll}?limit=4`, { next: { revalidate: 60 } });
    const data = await res.json();
    return data?.data?.tours || data?.data || [];
  } catch (error) {
    console.error("Failed to fetch featured tours:", error);
    return [];
  }
}

async function getContinents() {
  try {
    const res = await fetch(`${api.baseURL}${api.endpoints.continents.getAll}`, {
      next: { revalidate: 60 },
    });
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
      { next: { revalidate: 60 } }
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
      { next: { revalidate: 60 } }
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
      const foundContinent = continents.find((c: any) => c._id === country.continent || c.id === country.continent);
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

            {/* Feature Pills (#5640:5160, #5640:5171, #5640:5184) */}
            <div className="flex flex-col gap-[11.53px]">
              <div className="flex items-center gap-[6.18px] flex-wrap">
                {/* Pill 1: Private Trips (#5640:5160) */}
                <div className="inline-flex items-center justify-center gap-[6.18px] bg-[rgba(255,255,255,0.1)] px-[16.49px] py-[8.25px] rounded-[51.54px] select-none">
                  <img
                    src="/tickpp.svg"
                    alt=""
                    className="w-[16.49px] h-[16.49px] object-contain shrink-0"
                  />
                  <span className="font-sans text-white text-[13.3px] font-medium leading-[17.32px] whitespace-nowrap">
                    Private Trips
                  </span>
                </div>

                {/* Pill 2: Transport Included (#5640:5171) */}
                <div className="inline-flex items-center justify-center gap-[6.18px] bg-[rgba(255,255,255,0.1)] px-[16.49px] py-[8.25px] rounded-[51.54px] select-none">
                  <img
                    src="/tickpp.svg"
                    alt=""
                    className="w-[16.49px] h-[16.49px] object-contain shrink-0"
                  />
                  <span className="font-sans text-white text-[13.5px] font-medium leading-[17.32px] whitespace-nowrap">
                    Transport Included
                  </span>
                </div>
              </div>

              {/* Pill 3: Custom Route (#5640:5184) */}
              <div className="flex items-center gap-[6.18px]">
                <div className="inline-flex items-center justify-center gap-[6.18px] bg-[rgba(255,255,255,0.1)] px-[16.49px] py-[8.25px] rounded-[51.54px] select-none">
                  <img
                    src="/tickpp.svg"
                    alt=""
                    className="w-[16.49px] h-[16.49px] object-contain shrink-0"
                  />
                  <span className="font-sans text-white text-[13.6px] font-medium leading-[17.32px] whitespace-nowrap">
                    Custom Route
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Hero Section (#5091:7209, height: 573px on 1280px width) */}
      <div className="hidden md:block relative w-full mb-6 sm:mb-8 lg:mb-10">
        <div className="relative w-full h-[480px] sm:h-[520px] md:h-[550px] xl:h-[573px] overflow-hidden bg-[#242239] group">
          {/* Background Image */}
          <div
            className="absolute inset-0 z-0 transition-transform duration-[2s] ease-out group-hover:scale-[1.01]"
            style={{
              backgroundImage: 'url("/hero-1.svg")',
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>

          {/* Hero Content Container (starts at x: 47px, y: 259px on 1280px) */}
          <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 xl:px-[47px] relative h-full flex flex-col justify-start pt-[140px] sm:pt-[180px] md:pt-[220px] xl:pt-[259px] z-20">
            {/* Main Headline Content (#5091:7219, width: 704px, height: 154px) */}
            <div className="mb-[25px] w-full max-w-[704px]">
              <h1 className="font-outfit text-white text-[36px] sm:text-[46px] md:text-[54px] xl:text-[64px] font-normal leading-[1.08] xl:leading-[70px] drop-shadow-sm">
                See yourself & the World
              </h1>
              <div className="font-gochi text-white text-[40px] sm:text-[50px] md:text-[58px] xl:text-[68px] font-normal leading-[1.08] xl:leading-[70px] drop-shadow-sm">
                Differently<span className="font-gochi text-[48px] sm:text-[60px] md:text-[70px] xl:text-[82px] leading-[70px]">.</span>
              </div>
            </div>

            {/* Search Box (#5091:7213, width: 684px, height: 55px, rounded-[210px]) */}
            <div className="w-full max-w-[684px]">
              <form action="/search" method="GET" className="w-full">
                <div className="relative flex items-center w-full h-[55px] bg-white rounded-[210px] pl-6 md:pl-[30px] pr-[2px] shadow-[1px_1px_10px_0px_rgba(0,0,0,0.09)]">
                  <input
                    type="text"
                    name="q"
                    placeholder="Search Plans"
                    className="w-full bg-transparent border-none outline-none text-[#1A1A1A] placeholder:text-[#1A1A1A]/60 font-outfit text-base sm:text-lg md:text-[24px] font-normal"
                  />
                  <button
                    type="submit"
                    aria-label="Search"
                    className="w-[51px] h-[51px] rounded-full bg-[#1A1A1A] hover:bg-black transition-all duration-200 flex items-center justify-center text-white shrink-0 cursor-pointer shadow-md hover:scale-[1.02] active:scale-95"
                  >
                    <svg
                      className="w-5 h-5"
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

          {/* Bottom-Right White Logo Watermark (#5091:7210, width: 269px, height: 273.41px) */}
          <div className="absolute -bottom-10 -right-10 md:-bottom-11 md:-right-11 xl:-bottom-[45px] xl:-right-[48px] z-10 pointer-events-none overflow-hidden select-none">
            <img
              src="/nba_logo1.svg"
              alt=""
              className="w-[200px] h-[200px] md:w-[240px] md:h-[240px] xl:w-[269px] xl:h-[273.41px] opacity-95 invert brightness-0 object-contain"
            />
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1280px] mx-auto px-5 sm:px-6 md:px-8 xl:px-[35px]">
        <RecentlyViewedSection />
      </div>

      {/* Small Group Adventures Section (#5091:7989 / Mobile #5640:5330) */}
      <div className="w-full max-w-[1280px] mx-auto px-5 sm:px-6 md:px-8 xl:px-[35px] mt-10 sm:mt-20 md:mt-24 xl:mt-[120px]">
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
            className="absolute left-[65.59px] top-[166.74px] w-[109.26px] h-[109.26px] object-contain"
          />
          {/* Text 1 (#5640:5382, x: 208.86px, y: 205.91px, width: 133px) */}
          <p className="absolute left-[208.86px] top-[205.91px] w-[133px] font-outfit text-[#1A1A1A] text-[12.64px] font-normal text-center leading-[16px]">
            Shared adventures with<br />like-minded people
          </p>

          {/* Row 2 */}
          {/* Vector Pin 2 (#5640:5384, x: 20.23px, y: 386.29px, width: 12.01px, height: 12.65px) */}
          <img
            src="/nba_logo1.svg"
            alt=""
            className="absolute left-[20.23px] top-[386.29px] w-[12.01px] h-[12.65px] object-contain z-10"
          />
          {/* Text 2 (#5640:5433, x: 64.55px, y: 377.02px, width: 123px) */}
          <p className="absolute left-[64.55px] top-[377.02px] w-[123px] font-outfit text-[#1A1A1A] text-[12.64px] font-normal text-center leading-[16px]">
            1000s of experiences,<br />over 100 countries
          </p>
          {/* Image 2 (#5640:5386, x: 219.16px, y: 341.97px, width: 122.39px, height: 101.02px) */}
          <img
            src="/sg_2.svg"
            alt="1000s of experiences"
            className="absolute left-[219.16px] top-[341.97px] w-[122.39px] h-[101.02px] object-contain"
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
            className="absolute left-[60.43px] top-[501.74px] w-[115.83px] h-[113.79px] object-contain"
          />
          {/* Text 3 (#5640:5528, x: 204.74px, y: 547.09px, width: 142.23px) */}
          <p className="absolute left-[204.74px] top-[547.09px] w-[142.23px] font-outfit text-[#1A1A1A] text-[12.64px] font-normal text-center leading-[16px]">
            Creating positive change around the place you visit
          </p>
        </div>

        {/* Desktop View (#5091:7989, width: 1209px, height: 558px on 1280px width) */}
        <div className="hidden md:block bg-[rgba(244,236,217,0.25)] rounded-[12px] pt-[40px] sm:pt-[48px] xl:pt-[53px] px-6 sm:px-10 md:px-12 xl:px-[64px] pb-[40px] sm:pb-[48px] xl:pb-[50px] relative overflow-hidden">
          {/* Subheading & Title (#5091:7991 & #5091:7992 - zero excess gap) */}
          <div className="mb-[30px] sm:mb-[38px] xl:mb-[46px]">
            <div className="font-gochi text-[#254B02] text-2xl sm:text-[28px] md:text-[32px] font-normal leading-[1.05em] mb-0">
              Small Group Adventures
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-[44px] xl:text-[48px] font-normal leading-[1.15em] text-[#1A1A1A] tracking-normal font-outfit mt-0">
              Changing the way you see life and Yourself
            </h2>
          </div>

          {/* 3-Tier Row Structure matching Figma with dashed line locked to the exact center of the NBA marker icons */}
          <div className="w-full flex flex-col">
            {/* Row 1: Illustrations (180px height, justify-between) */}
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8 md:gap-0 w-full mb-4">
              <div className="flex justify-center items-end w-full md:w-[220px] h-[150px] sm:h-[165px] md:h-[180px] shrink-0">
                <img src="/sg_1.svg" alt="Shared adventures" className="h-full w-auto object-contain" />
              </div>
              <div className="flex justify-center items-end w-full md:w-[220px] h-[150px] sm:h-[165px] md:h-[180px] shrink-0">
                <img src="/sg_2.svg" alt="1000s of experiences" className="h-full w-auto object-contain" />
              </div>
              <div className="flex justify-center items-end w-full md:w-[225px] h-[150px] sm:h-[165px] md:h-[180px] shrink-0">
                <img src="/sg_3.svg" alt="Creating positive change" className="h-full w-auto object-contain" />
              </div>
            </div>

            {/* Row 2: Dashed Line perfectly intersecting the exact center of NBA marker icons */}
            <div className="relative w-full hidden md:block my-3">
              {/* Dashed line locked at vertical 50% center of the marker row */}
              <svg className="absolute left-[110px] right-[112.5px] top-1/2 -translate-y-1/2 w-[calc(100%-222.5px)] h-[2px] pointer-events-none z-0 overflow-visible" preserveAspectRatio="none">
                <line x1="0" y1="1" x2="100%" y2="1" stroke="rgba(26, 26, 26, 0.4)" strokeWidth="1" strokeDasharray="8 8" />
              </svg>

              {/* 3 Marker icons centered over each column */}
              <div className="flex items-center justify-between w-full relative z-10">
                <div className="w-[220px] flex justify-center items-center shrink-0">
                  <div className="w-[20px] h-[20px] bg-[#f7efe0] rounded-full flex items-center justify-center">
                    <img src="/nba_logo1.svg" alt="NBA Marker" className="w-[18px] h-[18px] object-contain" />
                  </div>
                </div>
                <div className="w-[220px] flex justify-center items-center shrink-0">
                  <div className="w-[20px] h-[20px] bg-[#f7efe0] rounded-full flex items-center justify-center">
                    <img src="/nba_logo1.svg" alt="NBA Marker" className="w-[18px] h-[18px] object-contain" />
                  </div>
                </div>
                <div className="w-[225px] flex justify-center items-center shrink-0">
                  <div className="w-[20px] h-[20px] bg-[#f7efe0] rounded-full flex items-center justify-center">
                    <img src="/nba_logo1.svg" alt="NBA Marker" className="w-[18px] h-[18px] object-contain" />
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: Captions (#5091:8181 - #5091:8183, text-center) */}
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 md:gap-0 w-full mt-2">
              <div className="w-full md:w-[220px] flex justify-center text-center shrink-0">
                <p className="text-[#1A1A1A] font-normal text-base sm:text-lg md:text-[20px] leading-snug text-center max-w-[210px] mx-auto font-outfit">
                  Shared adventures with<br className="hidden sm:inline" /> like-minded people
                </p>
              </div>
              <div className="w-full md:w-[220px] flex justify-center text-center shrink-0">
                <p className="text-[#1A1A1A] font-normal text-base sm:text-lg md:text-[20px] leading-snug text-center max-w-[194px] mx-auto font-outfit">
                  1000s of experiences,<br className="hidden sm:inline" /> over 100 countries
                </p>
              </div>
              <div className="w-full md:w-[225px] flex justify-center text-center shrink-0">
                <p className="text-[#1A1A1A] font-normal text-base sm:text-lg md:text-[20px] leading-snug text-center max-w-[225px] mx-auto font-outfit">
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
