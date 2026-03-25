"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import dynamic from "next/dynamic";
import type { MapViewProps } from "./MapView";

// ─── types ────────────────────────────────────────────────────────────────────
interface Country {
  _id: string;
  name: string;
  slug: string;
  code?: string;
  shortDescription?: string;
  description?: string;
  image?: string;
  attractions?: {
    name: string;
    description: string;
    location: { city: string; coordinates: { latitude: number; longitude: number } };
  }[];
}

interface Tour {
  _id: string;
  name: string;
  slug: string;
  tourCode: string;
  images: { url: string; isPrimary?: boolean }[];
  country: string | { _id: string; name: string };
  location: {
    startCity: string;
    endCity: string;
    visitedCities: string[];
    coordinates?: { latitude: number; longitude: number; name: string }[];
  };
  price?: { amount: number; currency: string };
  duration?: { days: number };
  ratingsAverage?: number;
}

interface TravelStyle {
  _id: string;
  name: string;
}

// ─── continent lookup ───────────────────────────────────────────────────────
const CONTINENT_MAP: Record<string, string> = {
  "united states of america": "NORTH AMERICA",
  "usa": "NORTH AMERICA",
  "canada": "NORTH AMERICA",
  "mexico": "NORTH AMERICA",
  "guatemala": "NORTH AMERICA",
  "cuba": "NORTH AMERICA",
  "haiti": "NORTH AMERICA",
  "dominican republic": "NORTH AMERICA",
  "honduras": "NORTH AMERICA",
  "nicaragua": "NORTH AMERICA",
  "el salvador": "NORTH AMERICA",
  "costa rica": "NORTH AMERICA",
  "panama": "NORTH AMERICA",
  "jamaica": "NORTH AMERICA",
  "belize": "NORTH AMERICA",
  "brazil": "SOUTH AMERICA",
  "colombia": "SOUTH AMERICA",
  "argentina": "SOUTH AMERICA",
  "peru": "SOUTH AMERICA",
  "venezuela": "SOUTH AMERICA",
  "chile": "SOUTH AMERICA",
  "ecuador": "SOUTH AMERICA",
  "bolivia": "SOUTH AMERICA",
  "paraguay": "SOUTH AMERICA",
  "uruguay": "SOUTH AMERICA",
  "united kingdom": "EUROPE",
  "uk": "EUROPE",
  "france": "EUROPE",
  "germany": "EUROPE",
  "italy": "EUROPE",
  "spain": "EUROPE",
  "portugal": "EUROPE",
  "netherlands": "EUROPE",
  "belgium": "EUROPE",
  "switzerland": "EUROPE",
  "austria": "EUROPE",
  "sweden": "EUROPE",
  "norway": "EUROPE",
  "denmark": "EUROPE",
  "finland": "EUROPE",
  "ireland": "EUROPE",
  "poland": "EUROPE",
  "czech republic": "EUROPE",
  "romania": "EUROPE",
  "greece": "EUROPE",
  "hungary": "EUROPE",
  "croatia": "EUROPE",
  "iceland": "EUROPE",
  "turkey": "EUROPE",
  "russia": "EUROPE",
  "china": "ASIA",
  "japan": "ASIA",
  "india": "ASIA",
  "south korea": "ASIA",
  "indonesia": "ASIA",
  "thailand": "ASIA",
  "vietnam": "ASIA",
  "philippines": "ASIA",
  "malaysia": "ASIA",
  "singapore": "ASIA",
  "myanmar": "ASIA",
  "cambodia": "ASIA",
  "laos": "ASIA",
  "bangladesh": "ASIA",
  "pakistan": "ASIA",
  "iran": "ASIA",
  "iraq": "ASIA",
  "saudi arabia": "ASIA",
  "united arab emirates": "ASIA",
  "nepal": "ASIA",
  "sri lanka": "ASIA",
  "mongolia": "ASIA",
  "israel": "ASIA",
  "jordan": "ASIA",
  "taiwan": "ASIA",
  "nigeria": "AFRICA",
  "ethiopia": "AFRICA",
  "egypt": "AFRICA",
  "south africa": "AFRICA",
  "kenya": "AFRICA",
  "tanzania": "AFRICA",
  "morocco": "AFRICA",
  "algeria": "AFRICA",
  "ghana": "AFRICA",
  "madagascar": "AFRICA",
  "tunisia": "AFRICA",
  "namibia": "AFRICA",
  "botswana": "AFRICA",
  "rwanda": "AFRICA",
  "australia": "OCEANIA",
  "new zealand": "OCEANIA",
  "fiji": "OCEANIA",
};

function getContinent(countryName: string): string {
  return CONTINENT_MAP[countryName.toLowerCase()] || "";
}

// ─── geocode cache ─────────────────────────────────────────────────────────────
interface GeoResult {
  center: [number, number];
  bbox: [[number, number], [number, number]]; // [[south, west], [north, east]]
}
const geocodeCache: Record<string, GeoResult> = {};

async function geocodePlace(query: string): Promise<GeoResult | null> {
  if (geocodeCache[query]) return geocodeCache[query];
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    const data = await res.json();
    if (data && data.length > 0) {
      const r = data[0];
      const center: [number, number] = [parseFloat(r.lat), parseFloat(r.lon)];
      const bb = r.boundingbox as string[];
      const bbox: [[number, number], [number, number]] = [
        [parseFloat(bb[0]), parseFloat(bb[2])],
        [parseFloat(bb[1]), parseFloat(bb[3])],
      ];
      const result: GeoResult = { center, bbox };
      geocodeCache[query] = result;
      return result;
    }
  } catch {
    /* silent */
  }
  return null;
}

// ─── Leaflet map (loaded on client only) ──────────────────────────────────────
const MapView = dynamic<MapViewProps>(() => import("./MapView"), { ssr: false });

// ─── GeoJSON name normalization helpers ─────────────────────────────────────
function geoJsonToDbName(geoName: string, countries: Country[]): Country | null {
  const lower = geoName.toLowerCase();
  for (const c of countries) {
    const cl = c.name.toLowerCase();
    if (cl === lower) return c;
    if (geoName === "United States of America" && (cl === "usa" || cl === "united states")) return c;
    if (geoName === "United Kingdom" && (cl === "uk" || cl === "united kingdom")) return c;
  }
  return null;
}

// ─── main component ────────────────────────────────────────────────────────────
export default function AdventuresMegaMenu({ isHovered }: { isHovered: boolean }) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<TravelStyle[]>([]);
  const [activeCountry, setActiveCountry] = useState<Country | null>(null);
  const [lockedCountry, setLockedCountry] = useState<Country | null>(null);
  const [hoveredCountryName, setHoveredCountryName] = useState<string | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapMarkers, setMapMarkers] = useState<
    { lat: number; lng: number; label: string; tour?: Tour }[]
  >([]);
  const [countryCenter, setCountryCenter] = useState<[number, number] | null>(null);
  const [activeTourSlug, setActiveTourSlug] = useState<string | null>(null);
  const [countryBounds, setCountryBounds] = useState<[[number, number], [number, number]] | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ── fetch countries + travel styles once ──────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, tsRes] = await Promise.all([
          fetch(`${api.baseURL}/countries?limit=20`),
          fetch(`${api.baseURL}/travel-styles`),
        ]);
        if (cRes.ok) {
          const d = await cRes.json();
          const list: Country[] = d.data?.countries || d.data || [];
          setCountries(list);
        }
        if (tsRes.ok) {
          const d = await tsRes.json();
          setCategories(d.data?.travelStyles || d.data || []);
        }
      } catch {/* silent */ }
    };
    load();
  }, []);

  // ── fetch tours + geocode when country changes ─────────────────────────────
  useEffect(() => {
    if (!activeCountry) {
      setMapMarkers([]);
      setCountryCenter(null);
      setCountryBounds(null);
      setTours([]);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setMapMarkers([]);
      setCountryCenter(null);
      setCountryBounds(null);
      setTours([]);
      try {
        const geo = await geocodePlace(activeCountry.name);
        if (!cancelled && geo) {
          setCountryCenter(geo.center);
          setCountryBounds(geo.bbox);
        }

        const res = await fetch(`${api.baseURL}/tours/country/${activeCountry._id}`);
        if (!cancelled && res.ok) {
          const d = await res.json();
          const tourList: Tour[] = (d.data?.tours || d.data || []).slice(0, 20);
          if (!cancelled) setTours(tourList);

          const markers: { lat: number; lng: number; label: string; tour: Tour }[] = [];
          const seen = new Set<string>();
          for (const tour of tourList) {
            const city = tour.location?.startCity;
            if (!city || seen.has(city)) continue;
            seen.add(city);

            if (tour.location.coordinates && tour.location.coordinates.length > 0) {
              const c = tour.location.coordinates[0];
              if (c.latitude && c.longitude) {
                markers.push({ lat: c.latitude, lng: c.longitude, label: city, tour });
                continue;
              }
            }

            const geo = await geocodePlace(`${city}, ${activeCountry.name}`);
            if (geo && !cancelled) {
              markers.push({ lat: geo.center[0], lng: geo.center[1], label: city, tour });
            }
          }
          if (!cancelled) setMapMarkers(markers);
        }
      } catch {/* silent */ }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [activeCountry]);

  const displayTours = tours.slice(0, 3);
  const countryDesc =
    activeCountry?.shortDescription ||
    activeCountry?.description?.slice(0, 200) ||
    "Discover incredible destinations in this country. We offer a curated selection of hand-picked tours.";

  // ── reset state on close ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isHovered) {
      setLockedCountry(null);
      setActiveCountry(null);
      setActiveTourSlug(null);
      setHoveredCountryName(null);
    }
  }, [isHovered, countries]);

  // ── Map overlay label — show country name when selected ─────────────────
  const mapOverlayLabel = activeCountry
    ? activeCountry.name.toUpperCase()
    : hoveredCountryName
      ? hoveredCountryName.toUpperCase()
      : "";

  // ── Map event handlers ────────────────────────────────────────────────────
  const handleMapCountryHover = useCallback((name: string | null) => {
    setHoveredCountryName(name);
  }, []);

  const handleMapCountryClick = useCallback((geoName: string) => {
    const matched = geoJsonToDbName(geoName, countries);
    if (!matched) return;

    if (lockedCountry?._id === matched._id) {
      // Unpin
      setLockedCountry(null);
    } else {
      setLockedCountry(matched);
      setActiveCountry(matched);
    }
  }, [countries, lockedCountry]);

  if (!isHovered) return null;

  return (
    <div className="absolute top-full left-0 w-full bg-white shadow-2xl py-6 px-10 z-50" style={{ height: '80vh' }}>
      <div className="mx-auto flex gap-5 w-full max-w-[1400px] h-full">

        {/* ── Left Panel: Filters ─────────────────────────────────────────────── */}
        <div className="w-[260px] flex-shrink-0 bg-[#f5f5f5] rounded-2xl p-5 flex flex-col justify-between h-full">
          <div className="overflow-y-auto flex-1 pr-1" style={{ scrollbarWidth: "thin" }}>
            <h3 className="text-lg font-bold font-outfit mb-5 text-gray-900">Filter</h3>

            <div className="mb-5">
              <h4 className="text-[11px] font-bold text-gray-500 mb-3 tracking-widest uppercase">Country</h4>
              <div className="flex flex-wrap gap-2">
                {countries.map((c) => {
                  const isActive = activeCountry?._id === c._id;
                  const isLocked = lockedCountry?._id === c._id;
                  return (
                    <button
                      key={c._id}
                      onMouseEnter={() => {
                        if (hoverTimeoutRef.current) {
                          clearTimeout(hoverTimeoutRef.current);
                        }
                        hoverTimeoutRef.current = setTimeout(() => {
                          if (!lockedCountry) setActiveCountry(c);
                        }, 300);
                      }}
                      onMouseLeave={() => {
                        if (hoverTimeoutRef.current) {
                          clearTimeout(hoverTimeoutRef.current);
                        }
                      }}
                      onClick={() => {
                        if (hoverTimeoutRef.current) {
                          clearTimeout(hoverTimeoutRef.current);
                        }

                        if (isLocked) {
                          setLockedCountry(null);
                        } else {
                          setLockedCountry(c);
                          setActiveCountry(c);
                        }
                      }}
                      className={`relative px-3 py-1 rounded-full text-xs font-medium border font-outfit transition-all ${isActive
                        ? (isLocked
                          ? "bg-black text-white border-black shadow-md"
                          : "bg-gray-200 text-gray-800 border-gray-400")
                        : "bg-transparent text-gray-600 border-gray-300 hover:bg-gray-200 hover:text-gray-800 hover:border-gray-400"
                        }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="mb-5 border-gray-200" />

            <div>
              <h4 className="text-[11px] font-bold text-gray-500 mb-3 tracking-widest uppercase">Trip Categories</h4>
              <div className="flex flex-col gap-2">
                {categories.slice(0, 6).map((cat, i) => (
                  <button
                    key={cat._id}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border font-outfit transition-all text-left ${i === 0
                      ? "bg-black text-white border-black"
                      : "bg-transparent text-gray-600 border-gray-300 hover:border-gray-500"
                      }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Link
            href={activeCountry ? `/trip?country=${activeCountry._id}` : "/trip"}
            className="mt-4 block w-full bg-black text-white rounded-xl py-3 text-sm font-semibold text-center hover:bg-gray-800 transition-colors"
          >
            See All Trips
          </Link>
        </div>

        {/* ── Middle Panel: Map + Tour Cards ─────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-4 min-w-0 h-full">
          {/* Map header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-outfit text-gray-900">
              {activeCountry ? `Explore ${activeCountry.name}` : "World Map"}
            </h3>
            {loading && (
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Loading map…</span>
              </div>
            )}
          </div>

          {/* Real Leaflet Map */}
          <div className="relative w-full rounded-2xl overflow-hidden shadow-inner border border-gray-200" style={{ flex: 1 }}>
            <MapView
              center={countryCenter || [20, 0]}
              zoom={countryCenter ? 5 : 1}
              bounds={countryBounds}
              markers={mapMarkers}
              activeTourSlug={activeTourSlug}
              onMarkerClick={(tour) => setActiveTourSlug(tour.slug)}
              highlightCountries={countries.map(c => c.name)}
              activeCountryName={activeCountry?.name}
              hoveredCountryName={hoveredCountryName || undefined}
              lockedCountryName={lockedCountry?.name}
              onCountryHover={handleMapCountryHover}
              onCountryClick={handleMapCountryClick}
            />
            {/* Continent label overlay — bottom-left, bold white text */}
            {mapOverlayLabel && (
              <div className="absolute bottom-6 left-6 z-[1000] pointer-events-none">
                <span
                  className="font-outfit font-extrabold uppercase tracking-wider"
                  style={{
                    fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                    color: "#ffffff",
                    textShadow: "0 2px 12px rgba(0,0,0,0.7)",
                    letterSpacing: "0.06em",
                    lineHeight: 1,
                  }}
                >
                  {mapOverlayLabel}
                </span>
              </div>
            )}
          </div>

          {/* Tour cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-outfit text-gray-900">
                  {activeCountry ? `Trips in ${activeCountry.name}` : "Popular Trips"}
                </h3>
                <span className="bg-gray-800 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {tours.length}
                </span>
              </div>
            </div>

            {displayTours.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {displayTours.map((t) => {
                  const primaryImg = t.images?.find((i) => i.isPrimary)?.url || t.images?.[0]?.url;
                  const countryName = typeof t.country === "object" ? t.country.name : activeCountry?.name || "";
                  return (
                    <Link
                      href={`/trip/${t.slug}/${t.tourCode}`}
                      key={t._id}
                      className="block relative h-32 rounded-xl overflow-hidden group border border-white/10"
                    >
                      {primaryImg ? (
                        <img
                          src={primaryImg}
                          alt={t.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h4 className="text-white font-semibold text-xs line-clamp-1 font-outfit">{t.name}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1 text-gray-300 text-[10px] uppercase tracking-wide font-semibold">
                            <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{t.location?.startCity || countryName}</span>
                          </div>
                          {t.price?.amount && (
                            <span className="text-emerald-400 text-[10px] font-bold">
                              ${t.price.amount.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : !loading ? (
              <div className="h-32 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 text-sm">
                No trips available for {activeCountry?.name || "this selection"}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i: number) => (
                  <div key={i} className="h-32 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Panel: About + Gallery ────────────────────────────────────── */}
        <div className="w-[260px] flex-shrink-0 bg-[#f5f5f5] rounded-2xl p-5 flex flex-col h-full">
          <h3 className="text-lg font-bold font-outfit mb-2 text-gray-900">
            {activeCountry ? `About ${activeCountry.name}` : "About"}
          </h3>
          <div 
            className="text-xs text-gray-600 font-sans leading-relaxed mb-4 line-clamp-5"
            dangerouslySetInnerHTML={{ __html: countryDesc }}
          />

          {/* Gallery from tour images */}
          <div className="grid grid-cols-2 gap-2 mt-auto flex-1 overflow-hidden">
            {tours
              .flatMap((t) => t.images || [])
              .filter((img) => img?.url)
              .slice(0, 6)
              .map((img, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-200">
                  <img
                    src={img.url}
                    alt="Gallery"
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            {Array.from({ length: Math.max(0, 6 - tours.flatMap((t) => t.images || []).filter((img) => img?.url).length) }).map((_, i) => (
              <div key={`blank-${i}`} className="aspect-square rounded-xl bg-gray-200" />
            ))}
          </div>

          {activeCountry && (
            <Link
              href={`/trip?country=${activeCountry._id}`}
              className="mt-4 block w-full border border-black text-black rounded-xl py-2.5 text-xs font-semibold text-center hover:bg-black hover:text-white transition-colors"
            >
              View {activeCountry.name} Trips →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
