"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  ArrowUpRight,
  Clock,
  MapPin,
  Star,
} from "lucide-react";

type MenuType = "adventures" | "destinations";

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
  shortDescription?: string;
  image?: string;
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
  tourCode: string;
  images?: { url: string; isPrimary?: boolean }[];
  country?: string | { _id: string; name: string; slug?: string };
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
};

const fallbackAdventureImage =
  "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2000&auto=format&fit=crop";
const fallbackDestinationImage =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2000&auto=format&fit=crop";

function stripHtml(value?: string) {
  if (!value) return "";
  // Decode HTML entities first, then strip tags
  let text = value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  text = text.replace(/<[^>]*>?/gm, "").trim();
  // Collapse multiple spaces / newlines
  text = text.replace(/\s+/g, " ");
  return text;
}

function formatStyleHeading(style?: TravelStyle) {
  if (!style) return "Adventures";

  if (style.sections?.intro?.title?.trim()) {
    return style.sections.intro.title.trim();
  }

  if (style.name.trim().toLowerCase() === "classic") {
    return "Classical Adventures";
  }

  return `${style.name.trim()} Adventures`;
}

function formatTourDate(dateValue?: string) {
  if (!dateValue) return "Dates on request";

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return "Dates on request";

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

function getTourLocation(tour: Tour) {
  const start = tour.location?.startCity?.trim();
  const end = tour.location?.endCity?.trim();
  if (start && end && start !== end) return `${start} to ${end}`;
  return start || end || "Various";
}

function getTourHref(tour: Tour) {
  if (tour.slug && tour.tourCode) return `/trips/${tour.slug}/${tour.tourCode}`;
  if (tour.slug) return `/trips/${tour.slug}`;
  return "/trips";
}

const CONTINENT_MAP: Record<string, string> = {
  "united states of america": "north-america",
  "usa": "north-america", "canada": "north-america", "mexico": "north-america",
  "brazil": "south-america", "colombia": "south-america", "argentina": "south-america", "peru": "south-america", "chile": "south-america",
  "united kingdom": "europe", "uk": "europe", "france": "europe", "germany": "europe", "italy": "europe", "spain": "europe", "switzerland": "europe", "greece": "europe",
  "china": "asia", "japan": "asia", "india": "asia", "indonesia": "asia", "thailand": "asia", "vietnam": "asia", "philippines": "asia", "malaysia": "asia", "singapore": "asia", "nepal": "asia", "sri lanka": "asia", "united arab emirates": "asia",
  "egypt": "africa", "south africa": "africa", "kenya": "africa", "tanzania": "africa", "morocco": "africa",
  "australia": "oceania", "new zealand": "oceania", "fiji": "oceania",
};

function getContinentSlug(countryName: string): string {
  return CONTINENT_MAP[countryName.trim().toLowerCase()] || "asia";
}

export default function HeaderMegaMenu({ activeMenu }: HeaderMegaMenuProps) {
  // ── Adventures state ──
  const [travelStyles, setTravelStyles] = useState<TravelStyle[]>([]);
  const [selectedStyleIndex, setSelectedStyleIndex] = useState(0);
  const [selectedStyleTours, setSelectedStyleTours] = useState<Tour[]>([]);
  const [adventureLoading, setAdventureLoading] = useState(false);

  // ── Destinations state ──
  const [continents, setContinents] = useState<Continent[]>([]);
  const [selectedContinentIndex, setSelectedContinentIndex] = useState(0);
  const [popularCountries, setPopularCountries] = useState<Country[]>([]);
  const [destinationLoading, setDestinationLoading] = useState(false);
  const [continentTours, setContinentTours] = useState<Tour[]>([]);

  // ── Load Adventures ──
  useEffect(() => {
    if (activeMenu !== "adventures") return;

    let cancelled = false;

    const loadAdventures = async () => {
      setAdventureLoading(true);

      try {
        const travelStylesResponse = await fetch(
          `${api.baseURL}${api.endpoints.travelStyles.getAll}`
        );
        const travelStylesData = await travelStylesResponse.json();
        const travelStylesList: TravelStyle[] =
          travelStylesData?.data?.travelStyles || [];

        if (cancelled) return;

        setTravelStyles(travelStylesList);

        if (travelStylesList.length === 0) {
          setSelectedStyleIndex(0);
          setSelectedStyleTours([]);
          return;
        }

        const nextStyleIndex = Math.min(
          selectedStyleIndex,
          travelStylesList.length - 1
        );
        setSelectedStyleIndex(nextStyleIndex);

        const selectedStyle =
          travelStylesList[nextStyleIndex] || travelStylesList[0];
        const selectedStyleName = selectedStyle?.name?.trim();

        if (!selectedStyleName) {
          setSelectedStyleTours([]);
          return;
        }

        const toursResponse = await fetch(
          `${api.baseURL}${api.endpoints.tours.search}?travelStyle=${encodeURIComponent(selectedStyleName)}&limit=10&sort=-ratingsAverage,-ratingsQuantity`
        );
        const toursData = await toursResponse.json();

        if (cancelled) return;

        setSelectedStyleTours(toursData?.data?.tours || []);
      } catch (error) {
        console.error("Failed to load adventure mega menu:", error);
        if (!cancelled) {
          setTravelStyles([]);
          setSelectedStyleTours([]);
        }
      } finally {
        if (!cancelled) setAdventureLoading(false);
      }
    };

    loadAdventures();

    return () => {
      cancelled = true;
    };
  }, [activeMenu, selectedStyleIndex]);

  // ── Load Destinations ──
  useEffect(() => {
    if (activeMenu !== "destinations") return;

    let cancelled = false;

    const loadDestinations = async () => {
      setDestinationLoading(true);

      try {
        const [continentsResponse, countriesResponse] = await Promise.all([
          fetch(`${api.baseURL}${api.endpoints.continents.getAll}`),
          fetch(`${api.baseURL}${api.endpoints.countries.getPopular}`),
        ]);

        const continentsData = await continentsResponse.json();
        const countriesData = await countriesResponse.json();

        if (cancelled) return;

        const continentList: Continent[] =
          continentsData?.data?.continents || [];
        setContinents(continentList);
        setPopularCountries(countriesData?.data?.countries || []);

        if (continentList.length === 0) {
          setSelectedContinentIndex(0);
        } else {
          setSelectedContinentIndex((currentIndex) =>
            Math.min(currentIndex, continentList.length - 1)
          );
        }
      } catch (error) {
        console.error("Failed to load destination mega menu:", error);
        if (!cancelled) {
          setContinents([]);
          setPopularCountries([]);
        }
      } finally {
        if (!cancelled) setDestinationLoading(false);
      }
    };

    loadDestinations();

    return () => {
      cancelled = true;
    };
  }, [activeMenu]);

  // ── Load tours for selected continent panel ──
  useEffect(() => {
    if (activeMenu !== "destinations") return;
    if (continents.length === 0) return;

    let cancelled = false;
    const continent = continents[selectedContinentIndex];
    if (!continent) return;

    const loadContinentTours = async () => {
      try {
        const response = await fetch(
          `${api.baseURL}${api.endpoints.tours.search}?limit=2&sort=-ratingsAverage,-ratingsQuantity`
        );
        const data = await response.json();
        if (!cancelled) {
          setContinentTours(data?.data?.tours || []);
        }
      } catch {
        if (!cancelled) setContinentTours([]);
      }
    };

    loadContinentTours();

    return () => {
      cancelled = true;
    };
  }, [activeMenu, selectedContinentIndex, continents]);

  // ── Derived data for Adventures ──
  const selectedStyle = travelStyles[selectedStyleIndex] || travelStyles[0];
  const styleHeading = formatStyleHeading(selectedStyle);
  const styleHeroImage =
    selectedStyle?.image && selectedStyle.image.trim() !== ""
      ? selectedStyle.image
      : fallbackAdventureImage;
  const styleCopy =
    stripHtml(selectedStyle?.shortDescription) ||
    stripHtml(selectedStyle?.description);
  const styleSecondaryCopy =
    selectedStyle?.sections?.intro?.bullets
      ?.filter(Boolean)
      .slice(0, 2)
      .join(" ") ||
    "Discover immersive experiences, local encounters, and handpicked trips that match this travel style.";

  const selectedStyleCountries = useMemo(() => {
    const countries = new Map<string, { label: string; href: string }>();

    selectedStyleTours.forEach((tour) => {
      const country = typeof tour.country === "object" ? tour.country : null;
      const countryName = country?.name?.trim() || "";
      const countrySlug = country?.slug?.trim() || "";
      if (!countryName) return;

      if (!countries.has(countryName)) {
        countries.set(countryName, {
          label: countryName,
          href: countrySlug
            ? `/destinations/${getContinentSlug(countryName)}/${countrySlug}`
            : "/destinations",
        });
      }
    });

    return Array.from(countries.values()).slice(0, 8);
  }, [selectedStyleTours]);

  const bestsellingTours = selectedStyleTours.slice(0, 4);
  const bestsellingTourSlots = Array.from({ length: 4 }, (_, index) =>
    bestsellingTours[index] || null
  );

  // ── Derived data for Destinations ──
  const selectedContinent = continents[selectedContinentIndex] || continents[0];
  const continentHeroImage =
    selectedContinent?.image && selectedContinent.image.trim() !== ""
      ? selectedContinent.image
      : fallbackDestinationImage;
  const continentCopy =
    stripHtml(selectedContinent?.description) ||
    "Explore a region through its countries, landscapes, and the trips that define it.";
  const continentCountries = useMemo(
    () => selectedContinent?.countries || [],
    [selectedContinent]
  );
  const destinationFeaturedTours = continentTours.slice(0, 2);
  const destinationTourSlots = Array.from({ length: 2 }, (_, index) =>
    destinationFeaturedTours[index] || null
  );
  const destinationCountries = useMemo(
    () =>
      (continentCountries.length > 0 ? continentCountries : popularCountries).slice(
        0,
        12
      ),
    [continentCountries, popularCountries]
  );
  const destinationCountrySlots = Array.from({ length: 12 }, (_, index) =>
    destinationCountries[index] || null
  );

  if (!activeMenu) {
    return null;
  }

  return (
    <div className="absolute left-0 top-full z-50 w-full bg-white px-4 pb-5 pt-3 md:px-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)]  border-black/5">
      <div className="mx-auto w-full max-w-[1600px]">
        {activeMenu === "adventures" ? (
          /* ═══════════════ ADVENTURES ═══════════════ */
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: "240px 1fr 1fr 300px",
              gridTemplateRows: "1fr auto",
              height: "calc(90vh - 72px)",
            }}
          >
            {/* Col 1 – Tour Categories (spans both rows) */}
            <div
              className="overflow-y-auto rounded-2xl bg-[#F2F3F7] p-5"
              style={{ gridColumn: "1", gridRow: "1 / 3" }}
            >
              <div className="flex flex-col gap-2">
                {adventureLoading && travelStyles.length === 0 ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <div
                        key={item}
                        className="h-10 animate-pulse rounded-full bg-[#e8e8e4]"
                      />
                    ))}
                  </div>
                ) : (
                  travelStyles.map((style, index) => {
                    const isActive = index === selectedStyleIndex;
                    return (
                      <button
                        key={style._id}
                        type="button"
                        onMouseEnter={() => setSelectedStyleIndex(index)}
                        onClick={() => setSelectedStyleIndex(index)}
                        className={`rounded-full border px-4 py-2 text-[14px] font-medium transition-all duration-200 ${
                          isActive
                            ? "border-[#1a1a1a] bg-[#1a1a1a] text-white shadow-sm"
                            : "border-[#c5c5c0] bg-transparent text-[#5a5a55] hover:border-[#1a1a1a] hover:bg-white hover:text-[#1a1a1a]"
                        }`}
                      >
                        {style.name}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Col 2, Row 1 – Description */}
            <div
              className="flex flex-col overflow-y-auto rounded-2xl bg-[#F2F3F7] p-6 h-fit max-h-full"
              style={{ gridColumn: "2", gridRow: "1" }}
            >
              <div>
                <h2 className="text-[26px] font-bold leading-tight tracking-[-0.02em] text-[#111]">
                  {styleHeading}
                </h2>
                <p className="mt-4 text-[14px] leading-[1.7] text-[#6b6b66]">
                  {styleCopy ||
                    "A carefully curated mix of uncommon experiences, insider access, cultural contact, and all the must-sees and must-dos."}
                </p>
                <p className="mt-3 text-[14px] leading-[1.7] text-[#6b6b66]">
                  {styleSecondaryCopy}
                </p>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <Link
                  href={
                    selectedStyle?.url?.trim() ||
                    (selectedStyle?.slug
                      ? `/travel-styles/${selectedStyle.slug}`
                      : "/travel-styles")
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-black hover:shadow-md"
                >
                  View All tours
                </Link>
                <Link
                  href={
                    selectedStyle?.url?.trim() ||
                    (selectedStyle?.slug
                      ? `/travel-styles/${selectedStyle.slug}`
                      : "/travel-styles")
                  }
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#1a1a1a] bg-[#1a1a1a] text-white transition-all hover:bg-black"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Col 3, Row 1 – Hero Image */}
            <div
              className="relative overflow-hidden rounded-2xl bg-[#e5e5e1]"
              style={{ gridColumn: "3", gridRow: "1" }}
            >
              <img
                src={styleHeroImage}
                alt={selectedStyle?.name || "Adventure travel style"}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>

            {/* Col 4 – Popular Regions (spans both rows) */}
            <div
              className="overflow-y-auto rounded-2xl bg-[#F2F3F7] p-5"
              style={{ gridColumn: "4", gridRow: "1 / 3" }}
            >
              <h3 className="text-[18px] font-bold tracking-[-0.01em] text-[#111]">
                Popular Regions
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedStyleCountries.length > 0 ? (
                  selectedStyleCountries.map((country) => (
                    <Link
                      key={country.label}
                      href={country.href}
                      className="inline-flex items-center rounded-full border border-[#c5c5c0] bg-transparent px-3.5 py-1.5 text-[13px] font-medium text-[#5a5a55] transition-all hover:border-[#1a1a1a] hover:bg-white hover:text-[#1a1a1a]"
                    >
                      {country.label}
                    </Link>
                  ))
                ) : adventureLoading ? (
                  <div className="space-y-2 w-full">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-8 animate-pulse rounded-full bg-[#e8e8e4]"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-[#8a8a84]">
                    Countries will appear once tours are available.
                  </p>
                )}
              </div>
            </div>

            {/* Col 2-3, Row 2 – Bestselling Tours (below center columns only) */}
            <div
              className="rounded-2xl bg-white px-5 py-4"
              style={{ gridColumn: "2 / 4", gridRow: "2" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-[17px] font-bold tracking-[-0.01em] text-[#111]">
                    Bestselling tours in{" "}
                    {selectedStyle?.name || "this style"}
                  </h3>
                  <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#111] px-2 text-[12px] font-semibold text-white">
                    {bestsellingTours.length}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {adventureLoading && selectedStyleTours.length === 0
                  ? [1, 2, 3, 4].map((item) => (
                      <div
                        key={item}
                        className="h-[94px] animate-pulse rounded-xl border border-[#ecece8] bg-[#efefec]"
                      />
                    ))
                  : bestsellingTourSlots.map((tour, index) =>
                      tour ? (
                        <Link
                          key={tour._id}
                          href={getTourHref(tour)}
                          className="group flex h-[94px] flex-col justify-between rounded-xl bg-[#F2F3F7] px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="line-clamp-1 text-[16px] font-semibold tracking-[-0.01em] text-[#172035]">
                              {tour.name}
                            </h4>
                            <span className="shrink-0 rounded-full bg-[#8f8f8c] px-2.5 py-0.5 text-[11px] font-medium text-white">
                              Bestseller
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-[13px] text-[#6f6f6a]">
                            {Number(tour.duration?.days) > 0 && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {tour.duration?.days} Days
                              </span>
                            )}
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{getTourLocation(tour)}</span>
                            </span>
                            {Number(tour.ratingsAverage) > 0 && (
                              <span className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5" />
                                {tour.ratingsAverage}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-[11px] text-[#9a9a94]">
                            {formatTourDate(tour.startDates?.[0]?.startDate)}
                          </p>
                        </Link>
                      ) : (
                        <div
                          key={`tour-slot-empty-${index}`}
                          aria-hidden="true"
                          className="h-[94px]"
                        />
                      )
                    )}
              </div>
            </div>
          </div>
        ) : activeMenu === "destinations" ? (
          /* ═══════════════ DESTINATIONS ═══════════════ */
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: "240px 1fr 1fr 300px",
              gridTemplateRows: "1fr auto",
              height: "calc(90vh - 72px)",
            }}
          >
            {/* Col 1 – Continents (spans both rows) */}
            <div
              className="overflow-y-auto rounded-2xl bg-[#F2F3F7] p-5"
              style={{ gridColumn: "1", gridRow: "1 / 3" }}
            >
              <div className="flex flex-col gap-2">
                {destinationLoading && continents.length === 0 ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <div
                        key={item}
                        className="h-10 animate-pulse rounded-full bg-[#e8e8e4]"
                      />
                    ))}
                  </div>
                ) : (
                  continents.map((continent, index) => {
                    const isActive = index === selectedContinentIndex;
                    return (
                      <button
                        key={continent._id}
                        type="button"
                        onMouseEnter={() => setSelectedContinentIndex(index)}
                        onClick={() => setSelectedContinentIndex(index)}
                        className={`rounded-full border px-4 py-2 text-[14px] font-medium transition-all duration-200 ${
                          isActive
                            ? "border-[#1a1a1a] bg-[#1a1a1a] text-white shadow-sm"
                            : "border-[#c5c5c0] bg-transparent text-[#5a5a55] hover:border-[#1a1a1a] hover:bg-white hover:text-[#1a1a1a]"
                        }`}
                      >
                        {continent.name}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Col 2, Row 1 – Description */}
            <div
              className="flex flex-col overflow-y-auto rounded-2xl bg-[#F2F3F7] p-6 h-fit max-h-full"
              style={{ gridColumn: "2", gridRow: "1" }}
            >
              <div>
                <h2 className="text-[26px] font-bold leading-tight tracking-[-0.02em] text-[#111]">
                  {selectedContinent?.name || "Destinations"}
                </h2>
                <p className="mt-4 text-[14px] leading-[1.7] text-[#6b6b66]">
                  {continentCopy}
                </p>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <Link
                  href={
                    selectedContinent?.slug
                      ? `/destinations/${selectedContinent.slug}`
                      : "/destinations"
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-[#111] px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-black hover:shadow-md"
                >
                  View all {selectedContinent?.name || "Destinations"}
                </Link>
                <Link
                  href={
                    selectedContinent?.slug
                      ? `/destinations/${selectedContinent.slug}`
                      : "/destinations"
                  }
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#1a1a1a] bg-[#1a1a1a] text-white transition-all hover:bg-black"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Col 3, Row 1 – Hero image */}
            <div
              className="relative overflow-hidden rounded-2xl bg-[#e5e5e1]"
              style={{ gridColumn: "3", gridRow: "1" }}
            >
              <img
                src={continentHeroImage}
                alt={selectedContinent?.name || "Destination"}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>

            {/* Col 4 – Featured tours (spans both rows) */}
            <div
              className="overflow-y-auto rounded-2xl bg-[#F2F3F7] p-5"
              style={{ gridColumn: "4", gridRow: "1 / 3" }}
            >
              {destinationLoading && continentTours.length === 0 ? (
                <div className="space-y-4">
                  {[1, 2].map((item) => (
                    <div
                      key={item}
                      className="h-[278px] animate-pulse rounded-xl border border-[#ecece8] bg-[#efefec]"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {destinationTourSlots.map((tour, index) =>
                    tour ? (
                      <Link
                        key={tour._id}
                        href={getTourHref(tour)}
                        className="group block rounded-xl p-3"
                      >
                        <h4 className="line-clamp-1 text-[14px] font-semibold leading-tight text-[#111]">
                          {tour.name}
                        </h4>
                        <div className="relative mt-2 overflow-hidden rounded-xl bg-[#e5e5e1]">
                          <img
                            src={getTourImage(tour)}
                            alt={tour.name}
                            className="h-28 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-medium text-[#555]">
                            Save 10%
                          </span>
                          <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-medium text-[#555]">
                            {typeof tour.travelStyle === "object"
                              ? tour.travelStyle?.name
                              : "Classic"}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-3 text-[12px] text-[#8a8a84]">
                          {Number(tour.duration?.days) > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {tour.duration?.days} Days
                            </span>
                          )}
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{getTourLocation(tour)}</span>
                          </span>
                          {Number(tour.ratingsAverage) > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5" />
                              {tour.ratingsAverage}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-[11px] text-[#aaa]">
                            {formatTourDate(tour.startDates?.[0]?.startDate)}
                          </p>
                          <span className="inline-flex items-center rounded-full bg-[#111] px-3.5 py-1.5 text-[11px] font-semibold text-white">
                            View Trip
                          </span>
                        </div>
                      </Link>
                    ) : (
                      <div
                        key={`destination-tour-slot-${index}`}
                        className="h-[278px]"
                        aria-hidden="true"
                      />
                    )
                  )}
                </div>
              )}
            </div>

            {/* Col 2-3, Row 2 – Countries grid */}
            <div
              className="rounded-2xl bg-[#F2F3F7] px-6 py-4"
              style={{ gridColumn: "2 / 4", gridRow: "2" }}
            >
              <div className="grid grid-cols-3 gap-x-8 gap-y-2">
                {destinationCountrySlots.map((country, index) =>
                  country ? (
                    <Link
                      key={country._id}
                      href={
                        country.slug
                          ? `/destinations/${selectedContinent?.slug || getContinentSlug(country.name)}/${country.slug}`
                          : "/destinations"
                      }
                      className="group flex min-h-[34px] items-start gap-2 text-[14px] leading-[1.25] text-[#5a5a55] transition-colors hover:text-[#111]"
                    >
                      <span>{country.name}</span>
                      {Number(country.statistics?.popularityScore) > 80 ? (
                        <span className="mt-1 rounded-full bg-[#ef4343] px-2 py-0.5 text-[9px] font-semibold text-white">
                          Bestseller
                        </span>
                      ) : Number(country.statistics?.totalTours) > 0 ? (
                        <span className="mt-1 rounded-full bg-[#777] px-2 py-0.5 text-[9px] font-semibold text-white">
                          New
                        </span>
                      ) : null}
                    </Link>
                  ) : (
                    <div
                      key={`destination-country-slot-${index}`}
                      className="h-[34px]"
                      aria-hidden="true"
                    />
                  )
                )}
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <Link
                  href={
                    selectedContinent?.slug
                      ? `/destinations/${selectedContinent.slug}`
                      : "/destinations"
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-[#111] px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-black hover:shadow-md"
                >
                  View all {selectedContinent?.name || "Destinations"}
                </Link>
                <Link
                  href={
                    selectedContinent?.slug
                      ? `/destinations/${selectedContinent.slug}`
                      : "/destinations"
                  }
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#111] bg-[#111] text-white transition-all hover:bg-black"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}