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
    <main className="w-full mx-auto mt-2 font-sans">
      <div className="px-4 md:px-6">
        <div
          className="relative w-full h-[calc(100vh)] min-h-[800px] md:min-h-[850px] rounded-[16px] mx-auto overflow-hidden bg-[#3F3F42] group"
        >
          {/* Background Image with Overlay */}
          <div
            className="absolute inset-0 z-0 transition-transform duration-[2s] ease-out group-hover:scale-105"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=3506&auto=format&fit=crop")',
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
          <div className="absolute inset-0 bg-[#3F3F42]/30 z-10 pointer-events-none"></div>

          {/* Main Content */}
          <div className="relative z-20 h-full flex flex-col justify-center px-8 md:px-24">
            <h1 className="text-white text-5xl md:text-[85px] font-normal leading-[1.1] mb-12 max-w-2xl">
              <span className="block">Explore the Soul</span>
              <span className="block">Natural Places</span>
            </h1>

            {/* Search Box */}
            <div className="max-w-[500px] w-full mt-4">
              <div className="relative flex items-center w-full bg-white/40 backdrop-blur-md rounded-full overflow-hidden p-1 min-h-[64px]">
                <input
                  type="text"
                  placeholder="Search Plans"
                  className="w-full bg-transparent border-none outline-none text-[#3F3F42] placeholder:text-[#3F3F42] px-6 text-xl"
                />
                <button className="flex items-center justify-center w-12 h-12 mr-2 bg-transparent text-[#3F3F42] shrink-0">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right Side Scroll Indicator Setup */}
          <div className="absolute z-20 right-8 md:right-16 top-1/2 -translate-y-1/2 hidden md:flex items-center space-x-6">
            <div className="flex flex-col space-y-24 items-end text-white/80 font-medium text-lg tracking-wide py-12">
              <span className="cursor-pointer hover:text-white transition-colors">Adventure</span>
              <span className="cursor-pointer hover:text-white transition-colors">Journeys</span>
              <span className="cursor-pointer hover:text-white transition-colors">Classic</span>
            </div>

            <div className="w-[3px] h-[300px] bg-white/20 rounded-full relative">
              <div className="absolute top-0 left-0 w-full h-1/3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.7)]"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6">
        <RecentlyViewedSection />
      </div>

      <section className="py-20 bg-white">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-6xl md:text-[68px] font-medium text-[#3F3F42] max-w-full leading-tight tracking-tight">
            Small Group Adventures Changing<br />the way you see life and Yourself
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x md:divide-gray-200  lg:mx-32 max-w-full items-stretch mt-16">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center md:pr-12 pb-8 md:pb-0">
              <div className="mb-6 flex justify-center">
                <img src="/ns-1.svg" className="w-[96px] h-[96px] object-contain" alt="1000s of experiences" />
              </div>
              <p className="text-[#3F3F42] font-semibold text-[15px] leading-snug max-w-[280px]">
                1000s of experiences,<br />over 100 countries
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center md:px-12 py-8 md:py-0">
              <div className="mb-6 flex justify-center">
                <img src="/ns-2.svg" className="w-[96px] h-[96px] object-contain" alt="Shared adventures" />
              </div>
              <p className="text-[#3F3F42] font-semibold text-[15px] leading-snug max-w-[280px]">
                Shared adventures with<br />like-minded people
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center md:pl-12 pt-8 md:pt-0">
              <div className="mb-6 flex justify-center">
                <img src="/sss3.svg" className="w-[96px] h-[96px] object-contain" alt="Creating positive change" />
              </div>
              <p className="text-[#3F3F42] font-semibold text-[15px] leading-snug max-w-[280px]">
                Creating positive change around the<br />place you visit
              </p>
            </div>
          </div>
        </div>
      </section>

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
      <StartPlanningSection />

      <div className="px-4 md:px-6">
        <BeyondTheMapSection blogs={blogs} />
      </div>

    </main>
  );
}
