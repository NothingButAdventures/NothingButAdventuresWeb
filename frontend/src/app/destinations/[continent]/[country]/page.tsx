import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import TourCard from "@/components/TourCard";
import ReviewsSection from "@/components/ReviewsSection";
import CountryFaqSection from "@/components/destinations/CountryFaqSection";
import CountryTravelStoriesToursSection from "@/components/destinations/CountryTravelStoriesToursSection";
import CountryNeedToKnowSection from "@/components/destinations/CountryNeedToKnowSection";

interface Country {
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  image?: string;
  videoUrl?: string;
  faqSection?: {
    title?: string;
    subtitle?: string;
    items?: Array<{
      question: string;
      answer?: string;
    }>;
  };
  bestTimeInsights?: {
    mostPopularTime?: string;
    budgetFriendly?: string;
    favouriteSeason?: string;
    culturallySignificantTimes?: string;
  };
  needToKnow?: {
    timeZone?: string;
    climate?: string;
    currency?: string;
    transportation?: string;
    localCuisine?: string;
    languagesSpoken?: string;
  };
  localStoryBlogs?: Array<LocalStoryBlog | string>;
  localActivities?: Array<LocalActivity | string>;
  travelStoryBlogs?: Array<LocalStoryBlog | string>;
  continent?: string | { _id?: string; id?: string; name?: string; slug?: string };
}

interface LocalActivity {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  coverImage?: string;
}

interface LocalStoryBlog {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featuredImage?: {
    url: string;
  };
  status?: string;
}

interface TourCardLike {
  _id: string;
  name: string;
  slug: string;
  tourCode: string;
  price: {
    amount: number;
    discountPercent: number;
  };
  duration: {
    days: number;
  };
  images: Array<{
    url: string;
    isPrimary?: boolean;
  }>;
  descriptionImage?: string;
  country: {
    name: string;
  };
  travelStyle?: string;
  rating?: number;
  tags?: string[];
  serviceLevel?: string;
  physicalRating?: {
    level: number;
  };
  startDates?: Array<{
    startDate?: string;
  }>;
}

function normalizeParam(value: string) {
  return decodeURIComponent(value).trim().toLowerCase();
}

function stripHtml(value?: string) {
  return (value || "").replace(/<[^>]*>?/gm, "").trim();
}

function getCountryVideoEmbedUrl(rawUrl?: string) {
  if (!rawUrl) return "";

  const value = rawUrl.trim();
  if (!value) return "";

  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace("www.", "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname.startsWith("/embed/")) return url.toString();

      const videoId = url.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;

      if (url.pathname.startsWith("/shorts/")) {
        const id = url.pathname.split("/")[2];
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
    }

    if (host === "youtu.be") {
      const id = url.pathname.replace("/", "").split("/")[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }

    if (host === "vimeo.com") {
      const id = url.pathname.replace("/", "").split("/")[0];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }

    if (host === "player.vimeo.com" && url.pathname.startsWith("/video/")) {
      return url.toString();
    }

    return value;
  } catch {
    return "";
  }
}

const DEFAULT_COUNTRY_DESCRIPTION_TEXT =
  "Immersive travel is about experiencing a destination through the eyes of a Local. It's eating at Family restaurants, Learning traditions crafts, and sleeping in authentic accommodations that tells stories. It's eating at Family restaurants, Learning traditions crafts, and sleeping in authentic accommodations that tells stories.\n\nWe believe travel should transform you, it's not about checking boxes - its about creating Meaningful connections, pushing our boundaries, and coming home with stories that matter.";

const FALLBACK_TRAVEL_STORIES = [
  {
    title: "Desert Safari",
    subtitle: "100+ successful planned trips",
    image: "https://images.unsplash.com/photo-1545645607-775b111ad5a4?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "K2 Trek",
    subtitle: "40+ successful planned trips",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Luxurious Jodhpur",
    subtitle: "500+ successful planned trips",
    image: "https://images.unsplash.com/photo-1598418012643-4f9db2ea6cbb?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Jungle Trails",
    subtitle: "300+ successful planned trips",
    image: "https://images.unsplash.com/photo-1536697246787-1fa68bc3e5ed?q=80&w=1200&auto=format&fit=crop",
  },
];

async function getCountryByRouteParam(countryParam: string): Promise<Country | null> {
  const safeParam = encodeURIComponent(countryParam);

  try {
    const directRes = await fetch(`${api.baseURL}${api.endpoints.countries.getById(safeParam)}`, {
      cache: "no-store",
    });

    if (directRes.ok) {
      const directData = await directRes.json();
      const directCountry = directData?.data?.country;
      if (directCountry) {
        return directCountry;
      }
    }
  } catch {
    // Fallback to list endpoint below
  }

  try {
    const listRes = await fetch(`${api.baseURL}${api.endpoints.countries.getAll}?limit=500`, {
      cache: "no-store",
    });

    if (!listRes.ok) return null;

    const listData = await listRes.json();
    const countries: Country[] = listData?.data?.countries || [];
    const needle = normalizeParam(countryParam);

    const matched = countries.find((country) => {
      const slug = (country.slug || "").toLowerCase();
      const name = (country.name || "").toLowerCase();
      return slug === needle || name === needle;
    });

    return matched || null;
  } catch (error) {
    console.error("Error fetching country by route param:", error);
    return null;
  }
}

function normalizeTourForCard(tour: any, index: number, countryName: string): TourCardLike {
  const primaryImage = tour?.images?.find?.((img: any) => img?.isPrimary)?.url || tour?.images?.[0]?.url;
  const styleValue =
    typeof tour?.travelStyle === "string"
      ? tour.travelStyle
      : tour?.travelStyle?.name || tour?.travelStyle?.title || "Adventure";

  return {
    _id: String(tour?._id || `country-tour-${index}`),
    name: tour?.name || "Untitled Tour",
    slug: tour?.slug || `tour-${index}`,
    tourCode: tour?.tourCode || `TOUR${index + 1}`,
    price: {
      amount: Number(tour?.price?.amount ?? tour?.price ?? 0),
      discountPercent: Number(tour?.price?.discountPercent ?? 0),
    },
    duration: {
      days: Number(tour?.duration?.days ?? tour?.duration ?? 0),
    },
    images: primaryImage ? [{ url: primaryImage, isPrimary: true }] : [],
    descriptionImage: tour?.descriptionImage,
    country: {
      name:
        typeof tour?.country === "string"
          ? tour.country
          : tour?.country?.name || countryName,
    },
    travelStyle: styleValue,
    rating: Number(tour?.ratingsAverage ?? tour?.rating ?? 4.8),
    tags: Array.isArray(tour?.tags) ? tour.tags.filter(Boolean) : [],
    serviceLevel: typeof tour?.serviceLevel === "string" ? tour.serviceLevel : "",
    physicalRating: {
      level: Number(tour?.physicalRating?.level ?? 0),
    },
    startDates: Array.isArray(tour?.startDates)
      ? tour.startDates.map((date: any) => ({ startDate: date?.startDate }))
      : [],
  };
}

async function getToursForCountry(country: Country): Promise<TourCardLike[]> {
  try {
    const res = await fetch(`${api.baseURL}${api.endpoints.tours.getAll}?limit=500`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    const tours = data?.data?.tours || data?.data || [];
    if (!Array.isArray(tours)) return [];

    const countryId = String(country._id || "");
    const countrySlug = String(country.slug || "").toLowerCase();
    const countryName = String(country.name || "").toLowerCase();

    const filtered = tours.filter((tour: any) => {
      const tourCountryId = String(tour?.country?._id || tour?.country?.id || "");
      const tourCountrySlug = String(tour?.country?.slug || "").toLowerCase();
      const tourCountryName = String(tour?.country?.name || "").toLowerCase();

      return (
        (countryId && tourCountryId === countryId) ||
        (countrySlug && tourCountrySlug === countrySlug) ||
        (countryName && tourCountryName === countryName)
      );
    });

    return filtered.map((tour: any, index: number) => normalizeTourForCard(tour, index, country.name));
  } catch (error) {
    console.error("Error fetching country tours:", error);
    return [];
  }
}

async function getSiblingDestinations(country: Country): Promise<Country[]> {
  const continentId =
    typeof country.continent === "string"
      ? country.continent
      : country.continent?._id || country.continent?.id;

  if (!continentId) {
    return [];
  }

  try {
    const res = await fetch(`${api.baseURL}${api.endpoints.countries.getByContinent(continentId)}?limit=100`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    const countries: Country[] = data?.data?.countries || [];
    const currentId = String(country._id || "");
    const currentSlug = String(country.slug || "").toLowerCase();
    const currentName = String(country.name || "").toLowerCase();

    return countries
      .filter((item) => {
        const id = String(item._id || "");
        const slug = String(item.slug || "").toLowerCase();
        const name = String(item.name || "").toLowerCase();

        return id !== currentId && slug !== currentSlug && name !== currentName;
      })
      .slice(0, 3);
  } catch (error) {
    console.error("Error fetching sibling destinations:", error);
    return [];
  }
}

async function resolveCountryLocalStoryBlogs(country: Country): Promise<LocalStoryBlog[]> {
  const selected = country.localStoryBlogs || [];
  if (selected.length === 0) return [];

  const selectedIds = selected
    .map((item) => (typeof item === "string" ? item : item?._id))
    .filter((id): id is string => Boolean(id));

  const hasFullData = selected.every(
    (item) => typeof item !== "string" && !!item.title && !!item.slug
  );

  if (hasFullData) {
    return (selected as LocalStoryBlog[]).filter(
      (blog) => blog && blog.status !== "draft" && blog.status !== "archived"
    );
  }

  try {
    const res = await fetch(`${api.baseURL}/blogs?limit=500`, {
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data = await res.json();
    const allBlogs: LocalStoryBlog[] = data?.data?.blogs || [];

    return allBlogs.filter((blog) => selectedIds.includes(blog._id));
  } catch (error) {
    console.error("Error resolving local story blogs:", error);
    return [];
  }
}

async function resolveCountryLocalActivities(country: Country): Promise<LocalActivity[]> {
  const selected = country.localActivities || [];
  if (selected.length === 0) return [];

  const selectedIds = selected
    .map((item) => (typeof item === "string" ? item : item?._id))
    .filter((id): id is string => Boolean(id));

  const hasFullData = selected.every(
    (item) => typeof item !== "string" && !!item.title
  );

  if (hasFullData) {
    return (selected as LocalActivity[]).filter((activity) => activity && activity.title);
  }

  try {
    const res = await fetch(`${api.baseURL}/activities?limit=500`, {
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data = await res.json();
    const allActivities: LocalActivity[] = data?.data?.activities || [];

    return allActivities.filter((activity) => selectedIds.includes(activity._id));
  } catch (error) {
    console.error("Error resolving local activities:", error);
    return [];
  }
}

async function resolveCountryTravelStoryBlogs(country: Country): Promise<LocalStoryBlog[]> {
  const selected = country.travelStoryBlogs || [];
  if (selected.length === 0) return [];

  const selectedIds = selected
    .map((item) => (typeof item === "string" ? item : item?._id))
    .filter((id): id is string => Boolean(id));

  const hasFullData = selected.every(
    (item) => typeof item !== "string" && !!item.title && !!item.slug
  );

  if (hasFullData) {
    return (selected as LocalStoryBlog[]).filter(
      (blog) => blog && blog.status !== "draft" && blog.status !== "archived"
    );
  }

  try {
    const res = await fetch(`${api.baseURL}/blogs?limit=500`, {
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data = await res.json();
    const allBlogs: LocalStoryBlog[] = data?.data?.blogs || [];

    return allBlogs.filter((blog) => selectedIds.includes(blog._id));
  } catch (error) {
    console.error("Error resolving travel story blogs:", error);
    return [];
  }
}

export default async function CountryDestinationsPage({
  params,
}: {
  params: Promise<{ continent: string; country: string }>;
}) {
  const { continent, country: countryname } = await params;
  const country = await getCountryByRouteParam(countryname);

  if (!country) {
    notFound();
  }

  const countryName = country.name;
  const heroDescription =
    stripHtml(country.shortDescription) ||
    stripHtml(country.description) ||
    "Immersive travel is about experiencing a destination through the eyes of a local. It is eating at family restaurants, learning traditions and crafts, and sleeping in authentic accommodations that tell stories.";
  const countryDescriptionText =
    (country.description && country.description.trim()) ||
    (country.shortDescription && country.shortDescription.trim()) ||
    DEFAULT_COUNTRY_DESCRIPTION_TEXT;

  const heroImage =
    country.image && country.image.trim() !== "" && country.image !== "default.jpg"
      ? country.image
      : "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=2400&auto=format&fit=crop";
  const tours = await getToursForCountry(country);
  const popularTours = tours.slice(0, 4);
  const heroBullets = tours.slice(0, 5).map((tour) => tour.name);
  const siblingDestinations = await getSiblingDestinations(country);
  const localActivities = await resolveCountryLocalActivities(country);
  const travelStoryBlogs = await resolveCountryTravelStoryBlogs(country);
  const videoBannerImage =
    localActivities[0]?.coverImage?.trim() ||
    travelStoryBlogs[0]?.featuredImage?.url?.trim() ||
    heroImage;
  const countryVideoEmbedUrl = getCountryVideoEmbedUrl(country.videoUrl);
  const travelStoryCards =
    (travelStoryBlogs.length > 0
      ? travelStoryBlogs.slice(0, 4).map((blog, index) => ({
          id: blog._id,
          title: blog.title,
          subtitle:
            stripHtml(blog.excerpt) ||
            stripHtml(blog.content).slice(0, 80) ||
            `${countryName} travel story`,
          image:
            blog.featuredImage?.url && blog.featuredImage.url.trim() !== ""
              ? blog.featuredImage.url
              : FALLBACK_TRAVEL_STORIES[index % FALLBACK_TRAVEL_STORIES.length].image,
        }))
      : FALLBACK_TRAVEL_STORIES).slice(0, 4);
  const bestTimeItems = [
    {
      title: "Most Popular Time",
      description: country.bestTimeInsights?.mostPopularTime?.trim() || "",
    },
    {
      title: "Budget Friendly",
      description: country.bestTimeInsights?.budgetFriendly?.trim() || "",
    },
    {
      title: "Favourite Season",
      description: country.bestTimeInsights?.favouriteSeason?.trim() || "",
    },
    {
      title: "Culturally Significant Times",
      description: country.bestTimeInsights?.culturallySignificantTimes?.trim() || "",
    },
  ];

  return (
    <main className="min-h-screen w-full bg-white pb-24">
      <div className="w-full px-4 py-8 md:px-8 md:py-10 lg:px-12 xl:px-16">
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)] lg:items-start xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)]">
          <div className="rounded-2xl bg-[#ededed] p-7 md:p-10">
            <h1 className="text-balance text-[42px] font-semibold leading-[0.95] tracking-[-0.02em] text-[#171717] md:text-[58px]">
              {countryName}
            </h1>
            <p className="mt-8 max-w-[38ch] text-[18px] leading-[1.5] text-[#3f3f3f]">
              {heroDescription}
            </p>
            {heroBullets.length > 0 && (
              <ul className="mt-3 list-disc pl-6 text-[16px] leading-[1.5] text-[#2f2f2f]">
                {heroBullets.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            )}
            <Link
              href="/trips"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#101010] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              View all Tours
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/40 text-[11px] leading-none">↗</span>
            </Link>
          </div>

          <div className="relative h-[380px] overflow-hidden rounded-2xl md:h-[560px] lg:aspect-square lg:h-auto lg:min-h-[680px] xl:min-h-[760px]">
            <Image src={heroImage} alt={`${countryName} hero`} fill priority className="object-cover" />
          </div>
        </section>

        <section className="mt-14 md:mt-16">
          <span className="inline-flex rounded-full bg-[#e8ebf0] px-4 py-1 text-[12px] font-medium text-[#5e6678]">Popular tours</span>

          <div className="mt-3">
            <h2 className="text-[40px] font-semibold leading-tight text-[#121b2f] md:text-[56px]">See {countryName} in your way</h2>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {popularTours.length > 0 ? (
              popularTours.map((tour) => (
                <div key={tour._id} className="h-full">
                  <TourCard tour={tour} />
                </div>
              ))
            ) : (
              <div className="col-span-full rounded-[12px] border border-[#d9dee8] bg-white px-5 py-8 text-[16px] text-[#5e6678]">
                No tours found for this country yet.
              </div>
            )}
          </div>
        </section>

        <section className="mt-14 md:mt-16">
          <span className="inline-flex rounded-full bg-[#e8ebf0] px-4 py-1 text-[12px] font-medium text-[#5e6678]">Popular Activities</span>

          <p className="mt-3 text-[20px] font-medium text-[#121b2f] md:text-[36px]">Things to do and see</p>

          <h2 className="mt-2 text-[40px] font-semibold leading-tight text-[#121b2f] md:text-[56px]">
            Experiences that define {countryName}
          </h2>

          <div className="mt-5 space-y-5">
            {localActivities.length > 0 ? (
              localActivities.map((activity) => {
                const storyImage =
                  activity.coverImage && activity.coverImage.trim() !== ""
                    ? activity.coverImage
                    : "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1900&auto=format&fit=crop";

                const storyDescription =
                  stripHtml(activity.description).slice(0, 280) ||
                  "Immersive travel is about experiencing a destination through the eys of a Local. It's eating at Family restaurants, Learning traditions crafts, and sleeping in authentic accommodations that tells stories.";

                return (
                  <div key={activity._id} className="overflow-hidden rounded-[14px] border border-[#e0e4eb] bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 md:items-stretch">
                      <div className="p-6 md:p-8 lg:p-10">
                        <h3 className="text-[38px] font-semibold leading-tight text-[#121b2f] md:text-[44px]">{activity.title}</h3>

                        <p className="mt-4 max-w-[64ch] text-[13px] leading-[1.45] text-[#4f586b] md:text-[14px]">
                          {storyDescription}
                        </p>

                        <div className="mt-6 flex items-center gap-3">
                          <Link
                            href="/trips"
                            className="rounded-full bg-[#0f1117] px-6 py-3 text-[16px] font-semibold text-white transition hover:bg-black"
                          >
                            Read Story
                          </Link>
                          <Link
                            href="/trips"
                            aria-label="Read story"
                            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0f1117] text-white transition hover:bg-black"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 19L19 5M19 5v10M19 5H9" />
                            </svg>
                          </Link>
                        </div>
                      </div>

                      <div className="relative min-h-[280px] md:min-h-[420px]">
                        <Image
                          src={storyImage}
                          alt={`${countryName} local story`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="overflow-hidden rounded-[14px] border border-[#e0e4eb] bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 md:items-stretch">
                  <div className="p-6 md:p-8 lg:p-10">
                    <h3 className="text-[38px] font-semibold leading-tight text-[#121b2f] md:text-[44px]">Chatting with chai</h3>

                    <p className="mt-4 max-w-[64ch] text-[13px] leading-[1.45] text-[#4f586b] md:text-[14px]">
                      Immersive travel is about experiencing a destination through the eys of a Local. It&apos;s eating at Family restaurants,
                      Learning traditions crafts, and sleeping in authentic accommodations that tells stories. It&apos;s eating at Family
                      restaurants, Learning traditions crafts, and sleeping in authentic accommodations that tells stories.
                    </p>

                    <div className="mt-6 flex items-center gap-3">
                      <button className="rounded-full bg-[#0f1117] px-6 py-3 text-[16px] font-semibold text-white transition hover:bg-black">
                        Read Story
                      </button>
                      <button
                        aria-label="Read story"
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0f1117] text-white transition hover:bg-black"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 19L19 5M19 5v10M19 5H9" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="relative min-h-[280px] md:min-h-[420px]">
                    <Image
                      src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1900&auto=format&fit=crop"
                      alt={`${countryName} local story`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="relative left-1/2 right-1/2 mt-14 w-screen -translate-x-1/2 bg-[#F7FAFE] py-14 md:mt-16 md:py-16">
          <div className="mx-auto w-full px-4 md:px-8 lg:px-12 xl:px-16">
            <span className="inline-flex rounded-full bg-[#d7d9de] px-5 py-2 text-[12px] font-medium leading-none text-[#8b919c] md:text-[14px]">
              About
            </span>

            <h3 className="mt-5 text-[40px] font-semibold leading-tight text-[#121b2f] md:text-[56px]">
              Best Time to Travel
            </h3>

            <p className="mt-4 text-[16px] leading-[1.4] text-[#4e5564] md:text-[22px]">
              {country.bestTimeInsights?.mostPopularTime?.trim() || `Best seasons to visit ${countryName}`}
            </p>

            <div className="mt-14 grid grid-cols-1 gap-x-12 gap-y-12 md:grid-cols-2 xl:grid-cols-4">
              {bestTimeItems.map((item, index) => (
                <div key={`${item.title}-${index}`}>
                  <div className="mb-8 h-20 w-20 text-[#101114]">
                    {index === 0 && (
                      <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M2.5 7.5h9l1.3 7.6H5.4L2.5 7.5Z" />
                        <circle cx="8.2" cy="18.2" r="1.8" strokeWidth={1.6} />
                        <circle cx="14.4" cy="18.2" r="1.8" strokeWidth={1.6} />
                        <circle cx="18" cy="12" r="4.1" strokeWidth={1.6} />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M18 9.7V12l1.5 1.1" />
                      </svg>
                    )}
                    {index === 1 && (
                      <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M7.7 13.8c0-2.8 2.3-5.1 5.1-5.1 2.6 0 4.7 1.9 5 4.3 1.2.3 2.1 1.4 2.1 2.7 0 1.6-1.3 2.9-2.9 2.9H7.4c-1.9 0-3.4-1.5-3.4-3.4 0-1.6 1.1-3 2.6-3.3.3-2.1 2.1-3.8 4.3-3.8" />
                        <circle cx="11.8" cy="6" r="2" strokeWidth={1.6} />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M6.2 14.9v-1.2M9 14.9v-1.2M11.8 14.9v-1.2" />
                      </svg>
                    )}
                    {index === 2 && (
                      <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="9" cy="10" r="4.5" strokeWidth={1.6} />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 3.5v1.8M9 14.7v1.8M2.6 10h1.8M13.6 10h1.8M4.7 5.7l1.3 1.3M12 13l1.3 1.3M4.7 14.3l1.3-1.3" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M13.8 17.8h-4a2.8 2.8 0 0 1 0-5.7c.4 0 .8.1 1.1.2a3.5 3.5 0 0 1 6.7 1.3 2.2 2.2 0 1 1 0 4.2h-3.8" />
                      </svg>
                    )}
                    {index === 3 && (
                      <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 7.6h18" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="m3.5 7.6 3.2 2.7V7.6m3.2 0 3.2 2.7V7.6m3.2 0 3.2 2.7V7.6" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 14.5h18" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="m3.5 14.5 3.2 2.7v-2.7m3.2 0 3.2 2.7v-2.7m3.2 0 3.2 2.7v-2.7" />
                      </svg>
                    )}
                  </div>

                  <p className="text-[27px] font-semibold leading-[1.08] tracking-[-0.01em] text-[#0f1730] md:text-[32px]">
                    {item.title}
                  </p>

                  {item.description && (
                    <p className="mt-3 text-[13px] leading-[1.45] text-[#545d6d] md:text-[15px]">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <CountryTravelStoriesToursSection countryName={countryName} tours={tours} />

        <section className="mt-14 md:mt-16">
          <span className="inline-flex rounded-full bg-[#e8ebf0] px-4 py-1 text-[12px] font-medium text-[#5e6678]">
            {countryName} Tour
          </span>

          <h2 className="mt-3 text-[40px] font-semibold leading-tight text-[#121b2f] md:text-[56px]">
            {countryName} Travel Stories
          </h2>

          <div className="relative aspect-video overflow-hidden rounded-[14px]">
            {countryVideoEmbedUrl ? (
              <iframe
                src={countryVideoEmbedUrl}
                title={`${countryName} video`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <>
                <Image
                  src={videoBannerImage}
                  alt={`${countryName} video banner`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/18" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    type="button"
                    aria-label={`Play ${countryName} video`}
                    className="flex h-24 w-24 items-center justify-center rounded-full border-[6px] border-white bg-white/10 text-white shadow-[0_12px_40px_rgba(0,0,0,0.18)] backdrop-blur-[2px] transition-transform hover:scale-105"
                  >
                    <span className="ml-1 text-[34px] leading-none">▶</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        <CountryNeedToKnowSection countryName={countryName} needToKnow={country.needToKnow} />

        <ReviewsSection
          title={`What to Expect in ${countryName}`}
          pillClasses="bg-[#e8e9eb] text-[#5e6678]"
          btnClasses="bg-[#42c46e] hover:bg-[#33b55e]"
          btnText="Book This Trip"
          titleClassName="text-[40px] md:text-[56px] font-semibold leading-tight text-[#121b2f]"
        />

        <section className="mt-14 md:mt-16">
          <span className="inline-flex rounded-full bg-[#e8ebf0] px-4 py-1 text-[12px] font-medium text-[#5e6678]">5 Reasons</span>

          <h2 className="mt-3 text-[40px] font-semibold leading-tight text-[#121b2f] md:text-[56px]">
            {countryName} Travel Stories
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {travelStoryCards.map((card, index) => (
              <Link
                key={`${card.title}-${index}`}
                href={travelStoryBlogs[index]?._id ? `/blogs/${travelStoryBlogs[index].slug}` : "/trips"}
                className="relative h-[450px] overflow-hidden rounded-[24px] block group/card shadow-sm sm:h-[500px]"
              >
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover transition-transform duration-[2s] group-hover/card:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none z-10" />

                <div className="absolute top-6 right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-transform group-hover/card:scale-110">
                  <svg className="h-5 w-5 text-black transition-transform duration-300 group-hover/card:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19L19 5M19 5v10M19 5H9" />
                  </svg>
                </div>

                <div className="absolute bottom-6 left-6 right-6 z-20">
                  <h3 className="mb-1 text-[24px] font-bold leading-tight text-white">
                    {card.title}
                  </h3>
                  <p className="text-[15px] font-medium text-white/80">
                    {card.subtitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <CountryFaqSection
          title={country.faqSection?.title}
          subtitle={country.faqSection?.subtitle}
          items={country.faqSection?.items}
        />

        <section className="mt-14 md:mt-16">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex rounded-full bg-[#0f1e38] px-4 py-1 text-[12px] font-medium text-white">Destinations</span>
              <h2 className="mt-4 text-[40px] font-semibold leading-tight text-[#121b2f] md:text-[56px]">Destinations you might also like</h2>
            </div>

            <div className="hidden h-14 w-14 items-center justify-center rounded-[18px] bg-[#0a84e3] text-[28px] font-semibold text-white shadow-[0_6px_18px_rgba(0,0,0,0.18)] md:flex">
              {countryName.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {siblingDestinations.length > 0 ? (
              siblingDestinations.map((item) => {
                const cardImage =
                  item.image && item.image.trim() !== "" && item.image !== "default.jpg"
                    ? item.image
                    : "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1800&auto=format&fit=crop";

                return (
                  <article key={item._id || item.slug || item.name} className="overflow-hidden rounded-[14px] border border-[#cfd4dd] bg-white">
                    <div className="relative h-[300px] overflow-hidden">
                      <Image src={cardImage} alt={item.name} fill className="object-cover" />
                    </div>

                    <div className="px-5 py-4">
                      <h3 className="text-[36px] font-semibold leading-tight text-[#121b2f] md:text-[38px]">{item.name}</h3>
                      <p className="mt-2 text-[16px] leading-[1.45] text-[#5f6778] md:text-[18px]">
                        40+ successful planed trips40+ successful planed trips40+ successful planed trips
                      </p>
                      <Link
                        href={item.slug ? `/destinations/${continent}/${item.slug}` : `/destinations/${continent}/${encodeURIComponent(item.name.toLowerCase())}`}
                        className="mt-3 inline-block text-[18px] font-medium text-[#121b2f] hover:text-black/70"
                      >
                        Learn More about {item.name}
                      </Link>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="col-span-full rounded-[14px] border border-[#d9dee8] bg-white px-5 py-8 text-[16px] text-[#5e6678]">
                No similar destinations found in this continent.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}