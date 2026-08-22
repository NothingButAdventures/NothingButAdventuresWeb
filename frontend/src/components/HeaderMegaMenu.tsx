"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import {
  ArrowUpRight,
  Clock,
  Compass,
  Globe,
  Heart,
  MapPin,
  Mountain,
  Music,
  Sparkles,
  Star,
  Users,
  Utensils,
  Zap,
} from "lucide-react";

type MenuType =
  | "adventures"
  | "destinations"
  | "interests"
  | "why-us"
  | "deals";

interface Interest {
  _id: string;
  name: string;
  slug?: string;
  url?: string;
  image?: string;
  description?: string;
  shortDescription?: string;
  color?: string;
  isActive?: boolean;
}

interface TravelStyle {
  _id: string;
  name: string;
  slug?: string;
  url?: string;
  image?: string;
  description?: string;
  shortDescription?: string;
  color?: string;
  sections?: {
    intro?: {
      title?: string;
      bullets?: string[];
    };
  };
}

interface Country {
  _id: string;
  name: string;
  slug: string;
  createdAt?: string;
  shortDescription?: string;
  image?: string;
  continent?: string | { _id: string; name?: string; slug?: string };
  statistics?: {
    totalTours?: number;
    averageRating?: number;
    totalReviews?: number;
    popularityScore?: number;
  };
}

interface Continent {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  countries?: Country[];
}

interface Tour {
  _id: string;
  name: string;
  slug: string;
  tourCode?: string;
  images?: { url: string; isPrimary?: boolean }[];
  country?: string | { _id: string; name: string; slug?: string };
  continent?: string | { _id: string; name: string; slug?: string };
  travelStyle?: string | { _id: string; name: string; slug?: string };
  location?: {
    startCity?: string;
    endCity?: string;
  };
  duration?: {
    days?: number;
  };
  ratingsAverage?: number;
  ratingsQuantity?: number;
  startDates?: { startDate?: string }[];
}

type HeaderMegaMenuProps = {
  activeMenu: MenuType | null;
  closeMenu?: () => void;
};

const fallbackAdventureImage =
  "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2000&auto=format&fit=crop";
const fallbackDestinationImage =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2000&auto=format&fit=crop";

function formatTourDate(dateValue?: string) {
  if (!dateValue) return "Departs on May 20, 2026";
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return "Departs on May 20, 2026";
  return `Departs on ${new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate)}`;
}

function getTourImage(tour: Tour) {
  const primary = tour.images?.find((i) => i.isPrimary);
  return primary?.url || tour.images?.[0]?.url || fallbackAdventureImage;
}

function getTourLocation(tour: any): string {
  if (typeof tour?.location === "string" && tour.location.trim() !== "") {
    return tour.location;
  }
  const start = tour?.location?.startCity?.trim();
  const end = tour?.location?.endCity?.trim();
  if (start && end && start !== end) return `${start} to ${end}`;
  return start || end || "Delhi to Ladakh";
}

function getTourHref(tour: Tour) {
  if (tour.slug && tour.tourCode) return `/trips/${tour.slug}/${tour.tourCode}`;
  if (tour.slug) return `/trips/${tour.slug}`;
  return "/trips";
}

function getCategoryIcon(name: string) {
  const lower = (name || "").toLowerCase();
  if (lower.includes("original") || lower.includes("classic")) return Compass;
  if (lower.includes("music")) return Music;
  if (lower.includes("family")) return Heart;
  if (
    lower.includes("18") ||
    lower.includes("30") ||
    lower.includes("somethings")
  )
    return Users;
  if (
    lower.includes("active") ||
    lower.includes("trek") ||
    lower.includes("hiking")
  )
    return Zap;
  if (lower.includes("solo") || lower.includes("soloish")) return Sparkles;
  if (lower.includes("food") || lower.includes("culinary")) return Utensils;
  if (lower.includes("asia")) return Globe;
  if (lower.includes("europe")) return Mountain;
  return Compass;
}

export default function HeaderMegaMenu({
  activeMenu,
  closeMenu,
}: HeaderMegaMenuProps) {
  // ── DB Data States ──
  const [travelStyles, setTravelStyles] = useState<TravelStyle[]>([]);
  const [selectedStyleIndex, setSelectedStyleIndex] = useState(0);

  const [continents, setContinents] = useState<Continent[]>([]);
  const [selectedContinentIndex, setSelectedContinentIndex] = useState(0);

  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedInterestIndex, setSelectedInterestIndex] = useState(0);

  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [allTours, setAllTours] = useState<Tour[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // ── Fetch dynamic data from API endpoints ──
  useEffect(() => {
    let cancelled = false;

    const loadAllDBData = async () => {
      try {
        const [tsRes, contRes, intRes, cRes, toursRes] = await Promise.all([
          fetch(`${api.baseURL}/travel-styles`),
          fetch(`${api.baseURL}/continents`),
          fetch(`${api.baseURL}/interests`),
          fetch(`${api.baseURL}/countries?limit=50`),
          fetch(`${api.baseURL}/tours?limit=30`),
        ]);

        if (cancelled) return;

        if (tsRes.ok) {
          const d = await tsRes.json();
          const list: TravelStyle[] = d.data?.travelStyles || d.data || [];
          setTravelStyles(list);
        }

        if (contRes.ok) {
          const d = await contRes.json();
          const list: Continent[] = d.data?.continents || d.data || [];
          setContinents(list);
        }

        if (intRes.ok) {
          const d = await intRes.json();
          const list: Interest[] = d.data?.interests || d.data || [];
          setInterests(list);
        }

        if (cRes.ok) {
          const d = await cRes.json();
          const list: Country[] = d.data?.countries || d.data || [];
          setAllCountries(list);
        }

        if (toursRes.ok) {
          const d = await toursRes.json();
          const list: Tour[] = d.data?.tours || d.data || [];
          setAllTours(list);
        }
      } catch (err) {
        console.error("HeaderMegaMenu: Failed to load DB data", err);
      }
    };

    loadAllDBData();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Current active menu details ──
  const isDestination = activeMenu === "destinations";
  const isAdventure = activeMenu === "adventures";

  // Category items list from DB
  const currentCategories = useMemo(() => {
    const rawList = isDestination
      ? continents
      : isAdventure
        ? travelStyles
        : interests;

    // If DB travel styles is empty or short, provide standard defaults
    if (isAdventure && rawList.length === 0) {
      return [
        { _id: "1", name: "NBA Originals", slug: "nba-originals" },
        { _id: "2", name: "Musical Adventures", slug: "musical-adventures" },
        { _id: "3", name: "Family Adventures", slug: "family-adventures" },
        { _id: "4", name: "18 to 30 Somethings", slug: "18-to-30-somethings" },
        { _id: "5", name: "Active Adventures", slug: "active-adventure" },
        { _id: "6", name: "Soloish Adventures", slug: "soloish-adventures" },
        { _id: "7", name: "Food Adventures", slug: "food-adventures" },
      ] as TravelStyle[];
    }

    return [...rawList];
  }, [isDestination, isAdventure, continents, travelStyles, interests]);

  const selectedIndex = isDestination
    ? selectedContinentIndex
    : isAdventure
      ? selectedStyleIndex
      : selectedInterestIndex;

  const setSelectedIndex = isDestination
    ? setSelectedContinentIndex
    : isAdventure
      ? setSelectedStyleIndex
      : setSelectedInterestIndex;

  const activeCategory =
    currentCategories[selectedIndex] || currentCategories[0];

  // Dynamic Popular Regions (Countries)
  const activeCategoryCountries = useMemo(() => {
    if (!activeCategory) return [];

    if (isDestination) {
      const destinationContinent = activeCategory as Continent;
      if (
        Array.isArray(destinationContinent.countries) &&
        destinationContinent.countries.length > 0
      ) {
        return [...destinationContinent.countries].sort((a, b) =>
          (a.name || "").localeCompare(b.name || ""),
        );
      }

      const catId = activeCategory._id;
      const catSlug = (activeCategory.slug || "").toLowerCase();
      const catName = (activeCategory.name || "").toLowerCase();

      const filtered = allCountries.filter((c) => {
        const countryCont = c.continent;
        if (!countryCont) return false;
        if (typeof countryCont === "string") {
          return (
            countryCont === catId ||
            countryCont.toLowerCase() === catSlug ||
            countryCont.toLowerCase() === catName
          );
        }
        if (typeof countryCont === "object") {
          return (
            countryCont._id === catId ||
            (countryCont.slug && countryCont.slug.toLowerCase() === catSlug) ||
            (countryCont.name && countryCont.name.toLowerCase() === catName)
          );
        }
        return false;
      });

      return [...filtered].sort((a, b) =>
        (a.name || "").localeCompare(b.name || ""),
      );
    }

    if (isAdventure) {
      const styleId = activeCategory._id;
      const styleSlug = (activeCategory.slug || "").toLowerCase();
      const styleName = (activeCategory.name || "").toLowerCase();

      const matchingTours = allTours.filter((tour) => {
        const tourStyle = tour.travelStyle;
        if (!tourStyle) return false;
        if (typeof tourStyle === "string") {
          return (
            tourStyle === styleId ||
            tourStyle.toLowerCase() === styleSlug ||
            tourStyle.toLowerCase() === styleName
          );
        }
        if (typeof tourStyle === "object") {
          return (
            tourStyle._id === styleId ||
            (tourStyle.slug && tourStyle.slug.toLowerCase() === styleSlug) ||
            (tourStyle.name && tourStyle.name.toLowerCase() === styleName)
          );
        }
        return false;
      });

      const countryMap = new Map<string, Country>();
      matchingTours.forEach((tour) => {
        const c = tour.country;
        if (!c) return;
        if (typeof c === "object" && c.name) {
          const key = c._id || c.slug || c.name;
          if (!countryMap.has(key)) {
            countryMap.set(key, c as Country);
          }
        }
      });

      if (countryMap.size > 0) {
        return Array.from(countryMap.values()).sort((a, b) =>
          (a.name || "").localeCompare(b.name || ""),
        );
      }

      // Fallback to sample popular countries if none linked yet
      return allCountries.slice(0, 10);
    }

    return allCountries.slice(0, 10);
  }, [isDestination, isAdventure, activeCategory, allCountries, allTours]);

  // Top 4 Tours for Best Selling section
  const tourItemsToDisplay = useMemo(() => {
    if (!activeCategory) return allTours.slice(0, 4);

    const catId = activeCategory._id;
    const catSlug = (activeCategory.slug || "").toLowerCase();
    const catName = (activeCategory.name || "").toLowerCase();

    let filteredTours: Tour[] = [];

    if (isDestination) {
      const continentCountryIds = new Set(
        activeCategoryCountries.map((c) => c._id),
      );
      const continentCountrySlugs = new Set(
        activeCategoryCountries.map((c) => (c.slug || "").toLowerCase()),
      );
      const continentCountryNames = new Set(
        activeCategoryCountries.map((c) => (c.name || "").toLowerCase()),
      );

      filteredTours = allTours.filter((tour) => {
        if (tour.continent) {
          if (typeof tour.continent === "string") {
            if (
              tour.continent === catId ||
              tour.continent.toLowerCase() === catSlug ||
              tour.continent.toLowerCase() === catName
            )
              return true;
          }
          if (typeof tour.continent === "object") {
            if (
              tour.continent._id === catId ||
              (tour.continent.slug &&
                tour.continent.slug.toLowerCase() === catSlug) ||
              (tour.continent.name &&
                tour.continent.name.toLowerCase() === catName)
            )
              return true;
          }
        }

        if (tour.country) {
          const tourCountry = tour.country;
          if (typeof tourCountry === "string") {
            if (
              continentCountryIds.has(tourCountry) ||
              continentCountrySlugs.has(tourCountry.toLowerCase()) ||
              continentCountryNames.has(tourCountry.toLowerCase())
            )
              return true;
          }
          if (typeof tourCountry === "object") {
            if (
              (tourCountry._id && continentCountryIds.has(tourCountry._id)) ||
              (tourCountry.slug &&
                continentCountrySlugs.has(tourCountry.slug.toLowerCase())) ||
              (tourCountry.name &&
                continentCountryNames.has(tourCountry.name.toLowerCase()))
            )
              return true;
          }
        }

        return false;
      });
    } else if (isAdventure) {
      filteredTours = allTours.filter((tour) => {
        const tourStyle = tour.travelStyle;
        if (!tourStyle) return false;
        if (typeof tourStyle === "string") {
          return (
            tourStyle === catId ||
            tourStyle.toLowerCase() === catSlug ||
            tourStyle.toLowerCase() === catName
          );
        }
        if (typeof tourStyle === "object") {
          return (
            tourStyle._id === catId ||
            (tourStyle.slug && tourStyle.slug.toLowerCase() === catSlug) ||
            (tourStyle.name && tourStyle.name.toLowerCase() === catName)
          );
        }
        return false;
      });
    }

    const sourceList = filteredTours.length > 0 ? filteredTours : allTours;

    return [...sourceList]
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
      .slice(0, 4);
  }, [
    isDestination,
    isAdventure,
    activeCategory,
    activeCategoryCountries,
    allTours,
  ]);

  if (!activeMenu || activeMenu === "why-us" || activeMenu === "deals") {
    return null;
  }

  const leftHeading = isDestination ? "Destinations" : "Adventures";

  return (
    <div
      className="absolute left-0 top-full z-[60] w-full px-2 pt-0.5 pb-8 pointer-events-auto -mt-1 cursor-pointer"
      onClick={closeMenu}
      onMouseLeave={closeMenu}
    >
      <div
        className="max-w-[1240px] mx-auto relative cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pointer Triangle */}
        <div
          className={`absolute -top-2 ${isDestination ? "left-[36%]" : "left-[45%]"} -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l border-t border-gray-200 z-50 shadow-xs`}
        />

        {/* Main Mega Menu Card (Figma Match #5341:7191) */}
        <div
          className="relative rounded-[12px] bg-white p-6 shadow-[0px_1px_75px_0px_rgba(0,0,0,0.1)] border border-gray-100/80 font-outfit w-full"
          onMouseLeave={closeMenu}
        >
          <div className="flex flex-col lg:flex-row gap-6 items-stretch min-h-[500px]">
            {/* ═══════════════ LEFT COLUMN: 2-Column Square Categories (Width ~225px) ═══════════════ */}
            <div className="w-full lg:w-[225px] shrink-0 flex flex-col justify-between border-r border-[rgba(26,26,26,0.15)] pr-5">
              <div>
                {/* Section Title */}
                <h2 className="font-gochi text-[32px] font-normal text-[#254B02] leading-tight mb-4">
                  {leftHeading}
                </h2>

                {/* 2-Column Grid of 95x95px Cards (#5341:7233 - #5341:7463) */}
                <div className="grid grid-cols-2 gap-2.5 max-h-[400px] overflow-y-auto pr-1">
                  {currentCategories.map((cat, idx) => {
                    const isActive = idx === selectedIndex;
                    const IconComponent = getCategoryIcon(cat.name);

                    return (
                      <button
                        key={cat._id || idx}
                        type="button"
                        onMouseEnter={() => setSelectedIndex(idx)}
                        onClick={() => setSelectedIndex(idx)}
                        className={`w-[95px] h-[95px] rounded-[12px] p-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                          isActive
                            ? "bg-[#57063C] text-[#F5F2EB] shadow-xs"
                            : "bg-[rgba(181,185,177,0.2)] text-[#1A1A1A] hover:bg-[#57063C] hover:text-white"
                        }`}
                      >
                        <IconComponent
                          className={`w-[36px] h-[36px] mb-1.5 shrink-0 transition-colors ${isActive ? "text-[#F5F2EB]" : "text-[#1A1A1A]"}`}
                        />
                        <span className="text-[12px] font-normal leading-[13px] line-clamp-2 px-0.5">
                          {cat.name}
                        </span>
                      </button>
                    );
                  })}

                  {/* Plus Box if categories < 8 */}
                  {currentCategories.length < 8 && (
                    <Link
                      href={isDestination ? "/destinations" : "/trips"}
                      onClick={closeMenu}
                      className="w-[95px] h-[95px] rounded-[12px] bg-[rgba(181,185,177,0.4)] hover:bg-[#57063C] hover:text-white text-[#1A1A1A] flex items-center justify-center text-[48px] font-normal transition-all"
                    >
                      +
                    </Link>
                  )}
                </div>
              </div>

              {/* View All Link at Bottom (#5341:7468) */}
              <Link
                href={isDestination ? "/destinations" : "/trips"}
                onClick={closeMenu}
                className="text-[12px] text-[#1A1A1A] hover:underline font-normal text-center mt-3 pt-2 block"
              >
                {isDestination
                  ? "View all Destinations"
                  : "View all Destinations"}
              </Link>
            </div>

            {/* ═══════════════ MIDDLE COLUMN: Hero Image & Popular Regions (Width ~584px) ═══════════════ */}
            <div className="flex-1 flex flex-col justify-between gap-3.5 max-w-[584px]">
              {/* Top: Hero Image Card (584x356px #5341:7273) */}
              <div className="relative h-[356px] w-full overflow-hidden rounded-[10px] bg-[#E2E2DC] group shadow-xs">
                <img
                  src={
                    activeCategory?.image && activeCategory.image.trim() !== ""
                      ? activeCategory.image
                      : isDestination
                        ? fallbackDestinationImage
                        : fallbackAdventureImage
                  }
                  alt={activeCategory?.name || "Travel"}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[rgba(26,26,26,0.25)] pointer-events-none z-0" />

                {/* Top-Left Badge: Popular */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="rounded-[42px] bg-white px-3.5 py-0.5 text-[12px] font-normal text-[#1A1A1A] shadow-xs">
                    Popular
                  </span>
                </div>

                {/* Top-Right Badges: Popular & Nature */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <span className="rounded-[42px] border border-white bg-black/20 backdrop-blur-xs px-3.5 py-0.5 text-[12px] font-light text-white shadow-xs">
                    Popular
                  </span>
                  <span className="rounded-[42px] border border-white bg-black/20 backdrop-blur-xs px-3.5 py-0.5 text-[12px] font-light text-white shadow-xs">
                    Nature
                  </span>
                </div>

                {/* Bottom Overlay */}
                <div className="absolute inset-x-0 bottom-0 z-10 p-5 flex items-end justify-between gap-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
                  <p className="text-[14px] font-light leading-snug text-white max-w-[347px] font-outfit">
                    An unbeatable mix of uncommon experiences, insider access,
                    cultural contact, and all the must-sees and -dos.
                  </p>
                  <Link
                    href={
                      isDestination
                        ? `/destinations/${activeCategory?.slug || ""}`
                        : "/trips"
                    }
                    onClick={closeMenu}
                    className="shrink-0 flex items-center gap-1.5 group/btn"
                  >
                    <span className="rounded-[37px] bg-white px-3.5 py-1.5 text-[14px] font-normal text-[#1A1A1A] transition-all hover:bg-gray-100 shadow-md">
                      Explore all {activeCategory?.name || "Asia"}
                    </span>
                    <span className="flex h-[29px] w-[29px] items-center justify-center rounded-full bg-white text-[#1A1A1A] transition-all group-hover/btn:scale-110 shadow-md">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </div>
              </div>

              {/* Bottom: Popular Regions Box (584x111px #5341:7245) */}
              <div className="rounded-[8px] bg-[rgba(239,234,222,0.6)] p-3.5 h-[111px] flex flex-col justify-start">
                <h3 className="text-[20px] font-normal text-[#1A1A1A] mb-2.5 tracking-tight font-outfit leading-none">
                  Popular Regions
                </h3>
                <div className="flex flex-wrap gap-2 items-center overflow-y-auto max-h-[64px] pr-1">
                  {activeCategoryCountries.length > 0 ? (
                    activeCategoryCountries.map((country, cIdx) => {
                      const countryName = country.name || "Country";
                      const countrySlug =
                        country.slug || countryName.toLowerCase();
                      const continentSlug = isDestination
                        ? activeCategory?.slug || "asia"
                        : typeof country.continent === "object"
                          ? country.continent.slug || "asia"
                          : "asia";
                      const isSelected =
                        selectedRegion === countryName || cIdx === 0;

                      return (
                        <Link
                          key={country._id || countrySlug}
                          href={`/destinations/${continentSlug}/${countrySlug}`}
                          onClick={() => {
                            setSelectedRegion(countryName);
                            closeMenu?.();
                          }}
                          className={`cursor-pointer rounded-[29px] h-[24px] px-3 text-[14px] font-light font-outfit leading-none flex items-center justify-center transition-all duration-200 ${
                            isSelected
                              ? "bg-[#6C114E] text-white border border-[#6C114E]"
                              : "bg-transparent text-[#1A1A1A] border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white"
                          }`}
                        >
                          {countryName}
                        </Link>
                      );
                    })
                  ) : (
                    <span className="text-[13px] text-gray-500 font-light font-outfit">
                      No regions listed for this category.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ═══════════════ RIGHT COLUMN: Best Selling Tours (Width ~315px #5341:7294) ═══════════════ */}
            <div className="w-full lg:w-[315px] shrink-0 flex flex-col justify-between pl-2">
              <div>
                {/* Header */}
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-[20px] font-normal text-[#1A1A1A] tracking-tight font-outfit">
                    Best selling tours
                  </h3>
                  <span className="flex h-[29px] w-[29px] items-center justify-center rounded-full bg-[#1A1A1A] text-[16px] font-normal text-white shrink-0 font-outfit">
                    +8
                  </span>
                </div>

                {/* Vertical List of 4 Tours (315x72px cards #5341:7295) */}
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[380px] pr-1">
                  {tourItemsToDisplay.map((tour, idx) => {
                    const tourName = tour.name || `Tour ${idx + 1}`;
                    const tourImg = getTourImage(tour as Tour);
                    const departure = formatTourDate(
                      tour.startDates?.[0]?.startDate,
                    );
                    const days = tour.duration?.days || 9;
                    const location = getTourLocation(tour);
                    const rating = tour.ratingsAverage || 4.8;
                    const href = getTourHref(tour as Tour);

                    return (
                      <Link
                        key={tour._id || idx}
                        href={href}
                        onClick={closeMenu}
                        className="group flex items-center gap-2.5 rounded-[8px] bg-[rgba(181,185,177,0.2)] p-2 transition-all duration-200 hover:bg-[rgba(181,185,177,0.35)] cursor-pointer h-[72px] shrink-0"
                      >
                        {/* Thumbnail Image (56x56px, rounded-4px) */}
                        <div className="h-[56px] w-[56px] shrink-0 overflow-hidden rounded-[4px] bg-white shadow-xs">
                          <img
                            src={tourImg}
                            alt={tourName}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>

                        {/* Tour Info */}
                        <div className="flex flex-1 flex-col justify-between overflow-hidden py-0.5">
                          <h4 className="truncate text-[14px] font-normal text-[#1A1A1A] leading-tight font-outfit">
                            {tourName}
                          </h4>
                          <p className="text-[10px] text-[rgba(26,26,26,0.6)] font-light font-outfit">
                            {departure}
                          </p>

                          {/* Meta Row (#5341:7300) */}
                          <div className="flex items-center gap-2 text-[10px] text-[rgba(26,26,26,0.6)] font-outfit">
                            <span className="flex items-center gap-1 shrink-0">
                              <Clock className="h-3 w-3 text-[rgba(26,26,26,0.6)]" />
                              {days} Days
                            </span>
                            <span className="flex items-center gap-1 truncate max-w-[90px]">
                              <MapPin className="h-3 w-3 shrink-0 text-[rgba(26,26,26,0.6)]" />
                              <span className="truncate">{location}</span>
                            </span>
                            <span className="flex items-center gap-0.5 shrink-0 ml-auto">
                              <Star className="h-3 w-3 text-[rgba(26,26,26,0.6)] fill-transparent" />
                              {rating}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Bottom See More Button (#5341:7270) */}
              <Link
                href="/trips"
                onClick={closeMenu}
                className="w-full h-[37px] bg-[#1A1A1A] hover:bg-black text-white text-[18px] font-normal rounded-[36px] flex items-center justify-center mt-2 font-outfit shadow-xs transition-colors"
              >
                See More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
