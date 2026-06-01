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
  const [styleToursById, setStyleToursById] = useState<Record<string, Tour[]>>({});
  const [adventureLoading, setAdventureLoading] = useState(false);

  // ── Destinations state ──
  const [continents, setContinents] = useState<Continent[]>([]);
  const [selectedContinentIndex, setSelectedContinentIndex] = useState(0);
  const [popularCountries, setPopularCountries] = useState<Country[]>([]);
  const [destinationLoading, setDestinationLoading] = useState(false);
  const [continentTours, setContinentTours] = useState<Tour[]>([]);
  const [continentToursById, setContinentToursById] = useState<Record<string, Tour[]>>({});

  // ── Load Adventures ──
  useEffect(() => {
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
          setStyleToursById({});
          setSelectedStyleTours([]);
          return;
        }

        const toursByIdEntries = await Promise.all(
          travelStylesList.map(async (style) => {
            const styleName = style.name?.trim();
            if (!styleName) {
              return [style._id, []] as const;
            }

            const toursResponse = await fetch(
              `${api.baseURL}${api.endpoints.tours.search}?travelStyle=${encodeURIComponent(styleName)}&limit=10&sort=-ratingsAverage,-ratingsQuantity`
            );
            const toursData = await toursResponse.json();

            return [style._id, toursData?.data?.tours || []] as const;
          })
        );

        const toursById = Object.fromEntries(toursByIdEntries);

        if (cancelled) return;

        setStyleToursById(toursById);
        setSelectedStyleTours(toursById[travelStylesList[0]._id] || []);
      } catch (error) {
        console.error("Failed to load adventure mega menu:", error);
        if (!cancelled) {
          setTravelStyles([]);
          setStyleToursById({});
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
  }, []);

  useEffect(() => {
    const selectedStyle = travelStyles[selectedStyleIndex];

    if (!selectedStyle) {
      setSelectedStyleTours([]);
      return;
    }

    setSelectedStyleTours(styleToursById[selectedStyle._id] || []);
  }, [selectedStyleIndex, styleToursById, travelStyles]);

  // ── Load Destinations ──
  useEffect(() => {
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

          // Preload data for all continents
          const results = await Promise.all(
            continentList.map(async (continent) => {
              try {
                // 1. Fetch countries for this continent
                const countriesRes = await fetch(`${api.baseURL}/countries/continent/${continent.slug || continent.name.toLowerCase().replace(/ /g, '-')}`);
                const countriesData = await countriesRes.json();
                const continentCountries: Country[] = countriesData?.data?.countries || countriesData?.data || [];
                
                // 2. Fetch tours for the first few countries
                let tours: Tour[] = [];
                const countryIds = continentCountries.slice(0, 3).map(c => c._id);
                
                if (countryIds.length > 0) {
                  // Try to get tours for the first country
                  const res = await fetch(`${api.baseURL}/tours/country/${countryIds[0]}`);
                  const d = await res.json();
                  tours = d?.data?.tours || [];

                  // If first country has no tours, try second
                  if (tours.length === 0 && countryIds[1]) {
                    const res2 = await fetch(`${api.baseURL}/tours/country/${countryIds[1]}`);
                    const d2 = await res2.json();
                    tours = d2?.data?.tours || [];
                  }
                }

                // Fallback: if still no tours, fetch global featured
                if (tours.length === 0) {
                  const response = await fetch(
                    `${api.baseURL}${api.endpoints.tours.search}?limit=2&sort=-ratingsAverage,-ratingsQuantity`
                  );
                  const data = await response.json();
                  tours = data?.data?.tours || [];
                }

                // Preload tour images
                tours.forEach(t => {
                  const imgUrl = getTourImage(t);
                  if (imgUrl) {
                    const img = new Image();
                    img.src = imgUrl;
                  }
                });

                // Return both the updated continent and its tours
                return { 
                  continent: { ...continent, countries: continentCountries }, 
                  tours,
                  id: continent._id 
                };
              } catch (err) {
                console.error(`Error preloading for ${continent.name}:`, err);
                return { continent, tours: [], id: continent._id };
              }
            })
          );

          if (!cancelled) {
            const newContinents = results.map(r => r.continent);
            const newToursById = Object.fromEntries(results.map(r => [r.id, r.tours]));
            
            setContinents(newContinents);
            setContinentToursById(newToursById);
            
            if (newContinents.length > 0) {
              setContinentTours(newToursById[newContinents[0]._id] || []);
            }
          }

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
  }, []);

  // ── Update tours when selected continent changes ──
  useEffect(() => {
    const selectedContinent = continents[selectedContinentIndex];
    if (!selectedContinent) {
      setContinentTours([]);
      return;
    }
    setContinentTours(continentToursById[selectedContinent._id] || []);
  }, [selectedContinentIndex, continentToursById, continents]);

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
    <div className="absolute left-0 top-full z-50 w-full bg-[#f3f8ff] px-4 pb-5 pt-3 md:px-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)]  border-black/5">
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
              className="overflow-y-auto rounded-2xl bg-white p-5"
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
                  <>
                    {travelStyles.map((style, index) => {
                      const isActive = index === selectedStyleIndex;
                      return (
                        <Link
                          key={style._id}
                          href={style.url?.trim() || (style.slug ? `/travel-styles/${style.slug}` : "/travel-styles")}
                          onMouseEnter={() => setSelectedStyleIndex(index)}
                          className={`cursor-pointer rounded-full border px-4 py-2 text-[14px] font-medium transition-all duration-200 text-center block ${isActive
                            ? "border-[#3F3F42] bg-[#3F3F42] text-white shadow-sm"
                            : "border-[#c5c5c0] bg-transparent text-[#3F3F42] hover:border-[#3F3F42] hover:bg-[#3F3F42] hover:text-white"
                            }`}
                        >
                          {style.name}
                        </Link>
                      );
                    })}
                    <Link
                      href="/travel-styles"
                      className="cursor-pointer rounded-full border px-4 py-2 text-[14px] font-medium transition-all duration-200 text-center block border-[#c5c5c0] bg-transparent text-[#3F3F42] hover:border-[#3F3F42] hover:bg-[#3F3F42] hover:text-white"
                    >
                      All travel styles
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Col 2, Row 1 – Description */}
            <div
              className="flex flex-col overflow-y-auto rounded-2xl bg-white p-6 h-fit max-h-full"
              style={{ gridColumn: "2", gridRow: "1" }}
            >
              <div>
                <h2 className="text-[26px] font-bold leading-tight tracking-[-0.02em] text-[#3F3F42]">
                  {styleHeading}
                </h2>
                <p className="mt-4 text-[14px] leading-[1.7] text-[#3F3F42]">
                  {styleCopy ||
                    "A carefully curated mix of uncommon experiences, insider access, cultural contact, and all the must-sees and must-dos."}
                </p>
                <p className="mt-3 text-[14px] leading-[1.7] text-[#3F3F42]">
                  {styleSecondaryCopy}
                </p>
              </div>
            </div>

            {/* Col 3, Row 1 – Hero Image */}
            <div
              className="relative overflow-hidden rounded-2xl bg-[#e5e5e1]"
              style={{ gridColumn: "3", gridRow: "1" }}
            >
              {travelStyles.length > 0 ? (
                travelStyles.map((style, idx) => (
                  <img
                    key={style._id}
                    src={style.image && style.image.trim() !== "" ? style.image : fallbackAdventureImage}
                    alt={style.name}
                    className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ${
                      idx === selectedStyleIndex ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0"
                    } hover:scale-110`}
                  />
                ))
              ) : (
                <img
                  src={fallbackAdventureImage}
                  alt="Adventure travel style"
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            {/* Col 4 – Popular Regions (spans both rows) */}
            <div
              className="overflow-y-auto rounded-2xl bg-white p-5"
              style={{ gridColumn: "4", gridRow: "1 / 3" }}
            >
              <h3 className="text-[18px] font-bold tracking-[-0.01em] text-[#3F3F42]">
                Popular Regions
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedStyleCountries.length > 0 ? (
                  selectedStyleCountries.map((country) => (
                    <Link
                      key={country.label}
                      href={country.href}
                      className="inline-flex items-center rounded-full border border-[#c5c5c0] bg-transparent px-3.5 py-1.5 text-[13px] font-medium text-[#3F3F42] transition-all hover:border-[#3F3F42] hover:bg-white hover:text-[#3F3F42]"
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
                  <p className="text-[13px] text-[#3F3F42]">
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
                  <h3 className="text-[17px] font-bold tracking-[-0.01em] text-[#3F3F42]">
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
                        className="group flex h-[94px] flex-col justify-between rounded-xl bg-white px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="line-clamp-1 text-[16px] font-semibold tracking-[-0.01em] text-[#3F3F42]">
                            {tour.name}
                          </h4>
                          <span className="shrink-0 rounded-full bg-[#8f8f8c] px-2.5 py-0.5 text-[11px] font-medium text-white">
                            Bestseller
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-[13px] text-[#3F3F42]">
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
                        <p className="mt-1 text-[11px] text-[#3F3F42]">
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
              className="overflow-y-auto rounded-2xl bg-white p-5"
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
                  <>
                    {continents.map((continent, index) => {
                      const isActive = index === selectedContinentIndex;
                      return (
                        <Link
                          key={continent._id}
                          href={continent.slug ? `/destinations/${continent.slug}` : "/destinations"}
                          onMouseEnter={() => setSelectedContinentIndex(index)}
                          className={`cursor-pointer rounded-full border px-4 py-2 text-[14px] font-medium transition-all duration-200 text-center block ${isActive
                            ? "border-[#3F3F42] bg-[#3F3F42] text-white shadow-sm"
                            : "border-[#c5c5c0] bg-transparent text-[#3F3F42] hover:border-[#3F3F42] hover:bg-[#3F3F42] hover:text-white"
                            }`}
                        >
                          {continent.name}
                        </Link>
                      );
                    })}
                    <Link
                      href="/destinations"
                      className="cursor-pointer rounded-full border px-4 py-2 text-[14px] font-medium transition-all duration-200 text-center block border-[#c5c5c0] bg-transparent text-[#3F3F42] hover:border-[#3F3F42] hover:bg-[#3F3F42] hover:text-white"
                    >
                      All destinations
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Col 2, Row 1 – Description */}
            <div
              className="flex flex-col overflow-y-auto rounded-2xl bg-white p-6 h-fit max-h-full"
              style={{ gridColumn: "2", gridRow: "1" }}
            >
              <div>
                <h2 className="text-[26px] font-bold leading-tight tracking-[-0.02em] text-[#3F3F42]">
                  {selectedContinent?.name || "Destinations"}
                </h2>
                <p className="mt-4 text-[14px] leading-[1.7] text-[#3F3F42]">
                  {continentCopy}
                </p>
              </div>
            </div>

            {/* Col 3, Row 1 – Hero image */}
            <div
              className="relative overflow-hidden rounded-2xl bg-[#e5e5e1]"
              style={{ gridColumn: "3", gridRow: "1" }}
            >
              {continents.length > 0 ? (
                continents.map((continent, idx) => (
                  <img
                    key={continent._id}
                    src={continent.image && continent.image.trim() !== "" ? continent.image : fallbackDestinationImage}
                    alt={continent.name}
                    className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ${
                      idx === selectedContinentIndex ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0"
                    } hover:scale-110`}
                  />
                ))
              ) : (
                <img
                  src={fallbackDestinationImage}
                  alt="Destination"
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            {/* Col 4 – Featured tours (spans both rows) */}
            <div
              className="overflow-y-auto rounded-2xl bg-white p-5"
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
                        <h4 className="line-clamp-1 text-[14px] font-semibold leading-tight text-[#3F3F42]">
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
                        <div className="mt-2 flex items-center gap-3 text-[12px] text-[#3F3F42]">
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
              className="rounded-2xl bg-white px-6 py-4"
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
                      className="group flex min-h-[34px] items-start gap-2 text-[14px] leading-[1.25] text-[#3F3F42] transition-colors hover:text-[#3F3F42]"
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