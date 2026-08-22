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
      <div className="relative w-full mb-6 sm:mb-8 lg:mb-10">
        <div className="relative w-full h-[500px] sm:h-[560px] md:h-[600px] lg:h-[640px] overflow-hidden bg-[#242239] group flex flex-col justify-start pt-[170px] sm:pt-[210px] lg:pt-[250px] px-4 sm:px-8 lg:px-[47px]">
          {/* Background Image with Overlay */}
          <div
            className="absolute inset-0 z-0 transition-transform duration-[2s] ease-out group-hover:scale-[1.02]"
            style={{
              backgroundImage: 'url("/hero-1.svg")',
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-transparent z-10 pointer-events-none"></div>

          {/* Main Headline Content */}
          <div className="relative z-20 mb-4 sm:mb-6 md:mb-6 max-w-4xl">
            <h1 className="font-outfit text-white text-4xl sm:text-5xl md:text-6xl lg:text-[76px] font-normal leading-[1.05em] drop-shadow-sm">
              See yourself & the World
            </h1>
            <div className="font-gochi text-white text-4xl sm:text-5xl md:text-6xl lg:text-[80px] font-normal leading-[1.05em] mt-1 drop-shadow-sm">
              Differently.
            </div>
          </div>

          {/* Search Box — Inside the hero, positioned at bottom with gap from text */}
          <div className="relative z-20 mb-6 sm:mb-8 md:mb-10 w-[90%] sm:w-[80%] md:w-[65%] lg:w-[684px]">
            <form action="/search" method="GET" className="w-full">
              <div className="relative flex items-center w-full bg-white rounded-[210px] py-[6px] pl-6 sm:pl-8 pr-[6px] shadow-[1px_1px_10px_0px_rgba(0,0,0,0.09)]">
                <input
                  type="text"
                  name="q"
                  placeholder="Search Plans"
                  className="w-full bg-transparent border-none outline-none text-[#1A1A1A] placeholder:text-[#1A1A1A]/60 font-outfit text-base sm:text-lg md:text-[22px] font-normal"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="w-[42px] h-[42px] sm:w-[46px] sm:h-[46px] md:w-[51px] md:h-[51px] rounded-full bg-[#1A1A1A] hover:bg-black transition-all duration-200 flex items-center justify-center text-white shrink-0 ml-auto cursor-pointer shadow-md hover:scale-[1.02] active:scale-95"
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

          {/* Bottom-Right White Logo Watermark */}
          <div className="absolute -bottom-6 -right-6 sm:-bottom-8 sm:-right-8 md:-bottom-10 md:-right-10 lg:-bottom-12 lg:-right-12 z-10 pointer-events-none overflow-hidden select-none">
            <img
              src="/nba_logo1.svg"
              alt=""
              className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] md:w-[250px] md:h-[250px] lg:w-[270px] lg:h-[270px] opacity-95 invert brightness-0 object-contain"
            />
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-8 lg:px-[35px]">
        <RecentlyViewedSection />
      </div>

      {/* Small Group Adventures Section (#5091:7989) */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-[35px] mt-16 sm:mt-20 md:mt-24">
        <div className="bg-[rgba(244,236,217,0.25)] rounded-[12px] p-8 sm:p-12 md:p-14 lg:p-16 relative overflow-hidden">
          {/* Subheading & Title (#5091:7992) */}
          <div className="mb-10 sm:mb-14">
            <div className="font-gochi text-[#254B02] text-2xl sm:text-[28px] md:text-[32px] font-normal mb-1 leading-[1.2em]">
              Small Group Adventures
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-[44px] lg:text-[48px] font-normal leading-[1.2em] text-[#1A1A1A] tracking-tight font-outfit">
              Changing the way you see life and Yourself
            </h2>
          </div>

          {/* 3 Illustration Columns - Left, Center, Right aligned */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 items-end mb-0">
            <div className="flex justify-center items-end">
              <img src="/sg_1.svg" alt="Shared adventures" className="h-48 sm:h-52 md:h-[200px] lg:h-[215px] w-auto object-contain" />
            </div>
            <div className="flex justify-center items-end">
              <img src="/sg_2.svg" alt="1000s of experiences" className="h-48 sm:h-52 md:h-[200px] lg:h-[215px] w-auto object-contain" />
            </div>
            <div className="flex justify-center items-end">
              <img src="/sg_3.svg" alt="Creating positive change" className="h-48 sm:h-52 md:h-[200px] lg:h-[215px] w-auto object-contain" />
            </div>
          </div>

          {/* Timeline: Dashed Line with 3 NBA Logos */}
          <div className="relative w-full py-4 hidden md:block">
            <svg className="absolute left-[16.666%] right-[16.666%] top-1/2 -translate-y-1/2 overflow-visible" style={{ width: '66.666%', height: '2px' }} preserveAspectRatio="none">
              <line x1="0" y1="1" x2="100%" y2="1" stroke="rgba(26,26,26,0.4)" strokeWidth="1" strokeDasharray="8 8" />
            </svg>
            <div className="relative grid grid-cols-3 gap-12 lg:gap-16">
              <div className="flex justify-center items-center">
                <div className="w-[22px] h-[22px] z-10 flex items-center justify-center">
                  <img src="/nba_logo1.svg" alt="NBA Logo" className="w-full h-full object-contain" />
                </div>
              </div>
              <div className="flex justify-center items-center">
                <div className="w-[22px] h-[22px] z-10 flex items-center justify-center">
                  <img src="/nba_logo1.svg" alt="NBA Logo" className="w-full h-full object-contain" />
                </div>
              </div>
              <div className="flex justify-center items-center">
                <div className="w-[22px] h-[22px] z-10 flex items-center justify-center">
                  <img src="/nba_logo1.svg" alt="NBA Logo" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>
          </div>

          {/* Text Labels below Dots (#5091:8181 - #5091:8183) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 pt-2">
            <div className="flex justify-center">
              <p className="text-[#1A1A1A] font-normal text-sm sm:text-base leading-snug max-w-[260px] text-center font-outfit">
                Shared adventures with<br className="hidden sm:inline" /> like-minded people
              </p>
            </div>
            <div className="flex justify-center">
              <p className="text-[#1A1A1A] font-normal text-sm sm:text-base leading-snug max-w-[260px] text-center font-outfit">
                1000s of experiences,<br className="hidden sm:inline" /> over 100 countries
              </p>
            </div>
            <div className="flex justify-center">
              <p className="text-[#1A1A1A] font-normal text-sm sm:text-base leading-snug max-w-[260px] text-center font-outfit">
                Creating positive change around the<br className="hidden sm:inline" /> place you visit
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-8 lg:px-[35px]">
        <PopularToursSection tours={tours} />
      </div>
      <div className="px-4 sm:px-6 md:px-8 lg:px-[35px]">
        <ExploreSection />
      </div>
      <div className="px-4 sm:px-6 md:px-8 lg:px-[35px]">
        <PostcardsInMotionSection />
      </div>
      <WhyNothingButAdventuresSection />
      <div className="px-4 sm:px-6 md:px-8 lg:px-[35px]">
        <PopularDestinationsSection countries={countries} />
      </div>
      <div className="px-4 sm:px-6 md:px-8 lg:px-[35px]">
        <ReviewsSection />
      </div>
      <div className="px-4 sm:px-6 md:px-8 lg:px-[35px]">
        <MeetLocalGuidesSection />
      </div>
      <div className="px-4 sm:px-6 md:px-8 lg:px-[35px]">
        <StartPlanningSection />
      </div>
      <div className="px-4 sm:px-6 md:px-8 lg:px-[35px]">
        <BeyondTheMapSection blogs={blogs} />
      </div>
      <div className="px-4 sm:px-6 md:px-8 lg:px-[35px]">
        <FaqSection />
      </div>
    </main>
  );
}
