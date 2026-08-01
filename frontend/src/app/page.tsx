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
      <div className="relative w-full mb-12 sm:mb-16 lg:mb-20">
        <div className="relative w-full h-[580px] sm:h-[650px] md:h-[720px] lg:h-[780px] overflow-hidden bg-[#242239] group flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-28">
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

          {/* Main Headline Content (positioned lower) */}
          <div className="relative z-20 mt-auto mb-10 sm:mb-14 md:mb-16 max-w-5xl pt-16">
            <h1 className="text-white text-4xl sm:text-6xl md:text-7xl lg:text-[84px] xl:text-[92px] font-normal tracking-tight leading-[1.12] font-outfit">
              See yourself & the World
            </h1>
            <div className="font-gochi text-[#9AE600] text-5xl sm:text-7xl md:text-8xl lg:text-[108px] xl:text-[120px] font-normal leading-none mt-1 sm:mt-2 drop-shadow-sm">
              DifferentLy.
            </div>
          </div>

          {/* Bottom-Right White Logo Watermark (40% smaller) */}
          <div className="absolute -bottom-6 -right-6 sm:-bottom-8 sm:-right-8 md:-bottom-10 md:-right-10 lg:-bottom-12 lg:-right-12 z-10 pointer-events-none overflow-hidden select-none">
            <img
              src="/nba_logo1.svg"
              alt=""
              className="w-[180px] h-[180px] sm:w-[250px] sm:h-[250px] md:w-[320px] md:h-[320px] lg:w-[400px] lg:h-[400px] opacity-95 invert brightness-0 object-contain"
            />
          </div>
        </div>

        {/* Floating Search Box (Sleeker height & lower padding) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-30 w-[95%]">
          <form action="/search" method="GET" className="w-full">
            <div className="relative flex items-center w-full bg-white rounded-full p-1.5 sm:p-2 pl-5 sm:pl-7 shadow-xl shadow-black/10 border border-gray-100/80">
              <input
                type="text"
                name="q"
                placeholder="Search Plans"
                className="w-full bg-transparent border-none outline-none text-[#18181B] placeholder:text-gray-400 font-outfit text-base sm:text-lg font-normal"
              />
              <button
                type="submit"
                aria-label="Search"
                className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-[#18181B] hover:bg-black transition-all duration-200 flex items-center justify-center text-white shrink-0 ml-auto cursor-pointer shadow-md hover:scale-[1.02] active:scale-95"
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
                    strokeWidth={2.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="px-4 md:px-6">
        <RecentlyViewedSection />
      </div>

      {/* Small Group Adventures Section */}
      <div className="px-4 md:px-6 mt-16 sm:mt-20 md:mt-24">
        <div className="bg-[#FAF7F2] rounded-2xl p-8 sm:p-12 md:p-14 lg:p-16 relative overflow-hidden">
          {/* Subheading & Title */}
          <div className="mb-10 sm:mb-14">
            <div className="font-gochi text-[#4F6D38] text-2xl sm:text-3xl md:text-4xl font-normal mb-1">
              Small Group Adventures
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-normal leading-tight text-[#18181B] tracking-tight font-outfit">
              Changing the way you see life and Yourself
            </h2>
          </div>

          {/* 3 Illustration Columns - Left, Center, Right aligned */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 items-end mb-8">
            <div className="flex justify-center md:justify-start items-center">
              <img src="/sg_1.svg" alt="Shared adventures" className="h-56 sm:h-64 md:h-[280px] lg:h-[300px] w-auto object-contain" />
            </div>
            <div className="flex justify-center items-center">
              <img src="/sg_2.svg" alt="1000s of experiences" className="h-56 sm:h-64 md:h-[280px] lg:h-[300px] w-auto object-contain" />
            </div>
            <div className="flex justify-center md:justify-end items-center">
              <img src="/sg_3.svg" alt="Creating positive change" className="h-56 sm:h-64 md:h-[280px] lg:h-[300px] w-auto object-contain" />
            </div>
          </div>

          {/* Timeline Dashed Line (Starts at Middle of 1st Col & Ends at Middle of 3rd Col) & 3 Dots */}
          <div className="relative w-full mb-6 hidden md:block">
            <div
              className="absolute left-[16.666%] right-[16.666%] top-1/2 -translate-y-1/2 border-t-2 border-dashed border-[#18181B]/70 pointer-events-none"
              aria-hidden="true"
            ></div>
            <div className="relative grid grid-cols-3 gap-12 lg:gap-16">
              <div className="flex justify-center items-center">
                <div className="w-3.5 h-3.5 bg-[#18181B] rounded-full z-10"></div>
              </div>
              <div className="flex justify-center items-center">
                <div className="w-3.5 h-3.5 bg-[#18181B] rounded-full z-10"></div>
              </div>
              <div className="flex justify-center items-center">
                <div className="w-3.5 h-3.5 bg-[#18181B] rounded-full z-10"></div>
              </div>
            </div>
          </div>

          {/* Text Labels below Dots - Centered in Middle of Each Column */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 pt-1">
            <div className="flex justify-center">
              <p className="text-[#18181B] font-semibold text-sm sm:text-base leading-snug max-w-[260px] text-center font-outfit">
                Shared adventures with<br className="hidden sm:inline" /> like-minded people
              </p>
            </div>
            <div className="flex justify-center">
              <p className="text-[#18181B] font-semibold text-sm sm:text-base leading-snug max-w-[260px] text-center font-outfit">
                1000s of experiences,<br className="hidden sm:inline" /> over 100 countries
              </p>
            </div>
            <div className="flex justify-center">
              <p className="text-[#18181B] font-semibold text-sm sm:text-base leading-snug max-w-[260px] text-center font-outfit">
                Creating positive change around the<br className="hidden sm:inline" /> place you visit
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6">
        <PopularToursSection tours={tours} /> </div>
      <div className="px-4 md:px-6">
        <ExploreSection /></div> <div className="px-4 md:px-6">
        <PostcardsInMotionSection /></div>
      <WhyNothingButAdventuresSection />
      <div className="px-4 md:px-6">
        <PopularDestinationsSection countries={countries} /></div> <div className="px-4 md:px-6">
        <ReviewsSection /></div> <div className="px-4 md:px-6">
        <MeetLocalGuidesSection /></div>
      <div className="px-4 md:px-6">
        <StartPlanningSection />
      </div>

      <div className="px-4 md:px-6">
        <BeyondTheMapSection blogs={blogs} />
      </div>

      <div className="px-4 md:px-6">
        <FaqSection />
      </div>

    </main>
  );
}
