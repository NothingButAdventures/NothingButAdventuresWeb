"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import TourCard from "@/components/TourCard";

interface Country {
  _id: string;
  name: string;
  slug: string;
}

interface FAQItem {
  question: string;
  answer: string;
  _id?: string;
}

interface PlantingLocation {
  _id: string;
  locationName: string;
  slug: string;
  description?: string;
  plantSpecies?: string[];
  faqs?: FAQItem[];
  gallery?: string[];
  country: Country;
}

interface Tour {
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
    caption?: string;
    isPrimary?: boolean;
  }>;
  descriptionImage?: string;
  country: {
    name: string;
  };
  summary?: string;
  rating?: number;
}

export default function PlantingLocationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const [location, setLocation] = useState<PlantingLocation | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [toursLoading, setToursLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    fetchLocationDetails();
  }, [slug]);

  const fetchLocationDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${api.baseURL}/planting-locations/${slug}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("Planting location not found");
        } else {
          setError("Failed to load planting location details");
        }
        return;
      }

      const data = await res.json();
      if (data.status === "success") {
        const pl = data.data.plantingLocation;
        setLocation(pl);

        // Update document title
        if (typeof window !== "undefined") {
          document.title = `${pl.locationName} - Reforestation Site | Nothing But Adventures`;
        }

        // Fetch associated tours
        fetchRelatedTours(pl._id, pl.country?._id);
      } else {
        setError("Failed to load planting location details");
      }
    } catch (err) {
      console.error("Error fetching planting location:", err);
      setError("An unexpected error occurred while loading details");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedTours = async (locationId: string, countryId: string) => {
    try {
      setToursLoading(true);
      // Try fetching tours specifically with this planting location first
      let url = `${api.baseURL}/tours?plantingLocation=${locationId}`;
      let res = await fetch(url);
      let data = await res.json();

      if (data.status === "success" && data.data.tours.length > 0) {
        setTours(data.data.tours);
      } else if (countryId) {
        // Fallback: fetch tours for the same country
        url = `${api.baseURL}/tours?country=${countryId}`;
        res = await fetch(url);
        data = await res.json();
        if (data.status === "success") {
          setTours(data.data.tours);
        }
      }
    } catch (err) {
      console.error("Error fetching related tours:", err);
    } finally {
      setToursLoading(false);
    }
  };

  const nextImage = () => {
    if (!location?.gallery || location.gallery.length === 0) return;
    setActiveImageIndex((prev) => (prev + 1) % location.gallery!.length);
  };

  const prevImage = () => {
    if (!location?.gallery || location.gallery.length === 0) return;
    setActiveImageIndex((prev) => (prev - 1 + location.gallery!.length) % location.gallery!.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Loading reforestation details...</p>
        </div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-rose-50 border border-rose-100 rounded-2xl p-8 shadow-sm">
          <span className="text-4xl">🌲</span>
          <h1 className="text-xl font-bold text-gray-800 mt-4 mb-2">
            {error || "Planting Location Not Found"}
          </h1>
          <p className="text-gray-600 text-sm mb-6">
            We couldn't retrieve the details for this reforestation site. It might have been updated or moved.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/tree-planting"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition-colors text-sm"
            >
              Back to Tree Planting
            </Link>
            <button
              onClick={fetchLocationDetails}
              className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasGallery = location.gallery && location.gallery.length > 0;
  const countryName = location.country?.name || "Global";

  return (
    <main className="min-h-screen bg-[#FAFBF9] text-[#3F3F42] pb-24 font-sans">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <nav className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
            <Link href="/" className="hover:text-emerald-700 font-medium transition-colors">
              Home
            </Link>
            <svg className="w-4 h-4 mx-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            <Link href="/tree-planting" className="hover:text-emerald-700 font-medium transition-colors">
              Tree Planting
            </Link>
            <svg className="w-4 h-4 mx-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            <span className="text-gray-800 font-semibold truncate max-w-[200px]">
              {location.locationName}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8">

        {/* Title and Top Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>

            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
              {location.locationName}
            </h1>
            <p className="text-gray-500 text-base md:text-lg mt-1 font-medium flex items-center gap-1.5">
              <span>📍</span> Region: {countryName}
            </p>
          </div>

          <Link
            href="#related-tours"
            className="self-start md:self-auto px-6 py-3 bg-emerald-800 hover:bg-emerald-950 text-white rounded-xl font-bold transition-all shadow-md shadow-emerald-800/10 text-sm flex items-center gap-2 hover:scale-[1.02]"
          >
            <span>🌍</span> Explore Trips Supporting This Site
          </Link>
        </div>

        {/* Hero Gallery Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Interactive Carousel */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="relative aspect-[16/10] md:aspect-[16/9] bg-[#1E2922] rounded-3xl overflow-hidden shadow-lg border border-gray-150/50 group/carousel">
              {hasGallery ? (
                <>
                  {/* Slider Images */}
                  <div className="w-full h-full relative">
                    <img
                      src={location.gallery![activeImageIndex]}
                      alt={`${location.locationName} Gallery ${activeImageIndex + 1}`}
                      className="w-full h-full object-cover transition-opacity duration-500"
                    />

                    {/* Shadow overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none"></div>
                  </div>

                  {/* Navigation Arrows */}
                  {location.gallery!.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/95 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 duration-200"
                        aria-label="Previous image"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/95 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 duration-200"
                        aria-label="Next image"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    </>
                  )}

                  {/* Counter Badge */}
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
                    {activeImageIndex + 1} / {location.gallery!.length}
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1E3A2B] to-[#122219] flex flex-col items-center justify-center p-8 text-center text-emerald-200/80">
                  <span className="text-6xl mb-4">🌳</span>
                  <p className="font-semibold text-lg text-white">Reforestation Zone</p>
                  <p className="text-xs text-emerald-300/60 max-w-sm mt-1">
                    Image showcase is being prepared by our forestry and conservation team.
                  </p>
                </div>
              )}
            </div>

            {/* Thumbnail Navigation Strip */}
            {hasGallery && location.gallery!.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {location.gallery!.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-24 aspect-[16/10] rounded-xl overflow-hidden border-2 shrink-0 transition-all ${idx === activeImageIndex
                      ? "border-emerald-600 scale-[1.03] shadow-md"
                      : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                  >
                    <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Key Details & Summary Cards */}
          <div className="lg:col-span-4 space-y-6">

            {/* Thriving Species List */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🍃</span> Plant & Tree Species
              </h2>
              {location.plantSpecies && location.plantSpecies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {location.plantSpecies.map((species, i) => (
                    <span
                      key={i}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm font-semibold flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      {species}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm italic">Species details will be updated soon.</p>
              )}
            </div>

          </div>
        </div>

        {/* About Reforestation Project Section */}
        <section className="mt-12 bg-white rounded-3xl border border-gray-200/80 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            About
          </h2>
          <div className="prose max-w-none text-gray-600 leading-relaxed text-[15px] md:text-base space-y-4">
            {location.description ? (
              location.description.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))
            ) : (
              <p>
                This designated reforestation site in {countryName} forms a vital part of our global commitment to offsetting travel impacts. In partnership with local ecologists and community organizations, we cultivate local trees to rebuild damaged canopies, guard natural water tables, and construct safe corridors for regional wildlife.
              </p>
            )}
          </div>
        </section>

        {/* FAQs Accordion */}
        {location.faqs && location.faqs.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              Planting Site FAQs
            </h2>
            <div className="space-y-4">
              {location.faqs.map((faq, idx) => (
                <details
                  key={faq._id || idx}
                  className="group bg-white rounded-2xl border border-gray-250/70 overflow-hidden shadow-sm transition-all duration-300 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex items-center justify-between cursor-pointer p-5 text-gray-800 font-bold select-none text-sm md:text-base">
                    <span>{faq.question}</span>
                    <span className="text-emerald-700 group-open:rotate-180 transition-transform duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-gray-600 text-[14px] md:text-base leading-relaxed border-t border-gray-50 pt-3">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Related Tours CTA Section */}
        <section id="related-tours" className="mt-16 pt-12 border-t border-gray-200">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="inline-block bg-[#eef1f6] text-[#3F3F42] text-xs font-semibold px-3 py-1 rounded-full mb-3">
                Adventures
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Explore Trips Supporting This Site
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Book these journeys to explore {countryName} and directly fund this reforestation site.
              </p>
            </div>
          </div>

          {toursLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : tours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tours.map((tour) => (
                <TourCard key={tour._id} tour={tour} />
              ))}
            </div>
          ) : (
            <div className="text-center bg-gray-50 rounded-3xl p-12 border border-gray-200/60 max-w-xl mx-auto">
              <span className="text-4xl">🎒</span>
              <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">No specific tours loaded</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                We're currently designing new itineraries for {countryName}. Explore all our active global adventures in the meantime!
              </p>
              <Link
                href="/trips"
                className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-950 text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
              >
                Browse All Adventures
              </Link>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
