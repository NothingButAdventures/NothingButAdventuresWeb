"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import Image from "next/image";

interface Tour {
  _id: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  price: {
    amount: number;
    currency: string;
    discountPercent: number;
  };
  duration: {
    days: number;
    nights: number;
  };
  maxGroupSize: number;
  physicalRating: {
    level: number;
    description?: string;
  };
  ratingsAverage: number;
  ratingsQuantity: number;
  images: Array<{
    url: string;
    caption: string;
    isPrimary: boolean;
  }>;
  itinerary: Array<{
    day: number;
    title: string;
    description: string;
    imageUrl?: string;
    activities: Array<{
      name: string;
      description: string;
      placeName: string;
      duration: string;
      icon: string;
    }>;
    optionalActivities: Array<{
      name: string;
      price: {
        amount: number;
        currency: string;
      };
      place: string;
      description: string;
      duration: string;
      icon: string;
    }>;
    accommodations: Array<{
      name: string;
      type: string;
      rating?: number;
      description?: string;
    }>;
  }>;
  highlights: string[];
  location: {
    startCity: string;
    endCity: string;
    visitedCities: string[];
  };
  country: {
    _id: string;
    name: string;
    slug: string;
  };
  travelStyle: string;
  serviceLevel: string;
  startDates: Array<{
    startDate: string;
    endDate: string;
    availableSpots: number;
    price: {
      amount: number;
      currency: string;
    };
    isActive: boolean;
  }>;
  ageRequirement: {
    min: number;
    max: number;
    description?: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

const iconMap: { [key: string]: string } = {
  MapPin: "📍",
  Bus: "🚌",
  Car: "🚗",
  Airplane: "✈️",
  Train: "🚂",
  Boat: "🚢",
  Coffee: "☕",
  Camera: "📷",
  Mountain: "🏔️",
  Trees: "🌳",
  Utensils: "🍽️",
  Clock: "🕐",
  Heart: "❤️",
};

export default function TourDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "itinerary" | "details"
  >("overview");
  const [currentDay, setCurrentDay] = useState(1);
  const [relatedTours, setRelatedTours] = useState<Tour[]>([]);
  const dayRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (slug) {
      fetchTour();
    }
  }, [slug]);

  // Track scroll position and update current visible day
  useEffect(() => {
    const handleScroll = () => {
      if (activeTab !== "itinerary" || !tour) return;

      let closestDay = 1;
      let closestDistance = Infinity;

      Object.entries(dayRefs.current).forEach(([dayNum, el]) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.top - 150);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestDay = parseInt(dayNum);
        }
      });

      setCurrentDay(closestDay);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeTab, tour]);

  const fetchTour = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${api.baseURL}${"/tours/"}${slug}`);
      const data = await response.json();

      if (response.ok) {
        setTour(data.data.tour);

        // Fetch related tours
        try {
          const relatedResponse = await fetch(`${api.baseURL}/tours`);
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            setRelatedTours(relatedData.data.tours || []);
          }
        } catch (error) {
          console.error("Failed to fetch related tours:", error);
        }
      } else {
        console.error("Failed to fetch tour:", data.message);
      }
    } catch (error) {
      console.error("Error fetching tour:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscountedPrice = (price: Tour["price"]) => {
    if (price.discountPercent > 0) {
      return price.amount * (1 - price.discountPercent / 100);
    }
    return price.amount;
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const scrollToDay = (dayNum: number) => {
    const element = dayRefs.current[dayNum];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setCurrentDay(dayNum);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-3 text-gray-600">Loading tour details...</p>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Tour not found
          </h1>
          <p className="text-gray-600">
            The tour you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const primaryImage =
    tour.images?.find((img) => img.isPrimary) || tour.images?.[0];
  const discountedPrice = calculateDiscountedPrice(tour.price);

  return (
    <div className="min-h-screen">
      {/* Tour Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4 py-4">
          <div className="">
            <nav className="flex text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                Home
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <Link href="/tours" className="text-gray-500 hover:text-gray-700">
                Tours
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-900">{tour.name}</span>
            </nav>
          </div>

          {/* Photo Gallery (preview grid with booking panel) */}
          {tour.images && tour.images.length > 0 && (
            <div className="mt-6 mb-6 bg-white">
              <h1 className="text-4xl font-semibold text-gray-900 mb-2">
                {tour.name} - {tour.duration.days} days
              </h1>
              <div className="max-w-7xl mx-auto py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  {/* Images Grid (left) */}
                  <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {tour.images.map((image, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-[4/2] rounded-sm overflow-hidden"
                        >
                          <Image
                            src={image.url || "/placeholder-image.jpg"}
                            alt={
                              image.caption || `${tour.name} photo ${idx + 1}`
                            }
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Booking Panel (right) */}
                  <aside className="bg-gradient-to-br from-white to-gray-50 rounded-xl border shadow-lg overflow-hidden">
                    {/* Top Seller Badge */}
                    {tour.ratingsQuantity > 100 && (
                      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-3 text-white text-center">
                        <div className="text-sm font-bold tracking-widest">
                          TOP SELLER
                        </div>
                      </div>
                    )}

                    <div className="p-6">
                      {/* Title */}
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                          {tour.duration.days} days
                        </h2>
                        <p className=" text-gray-600 mt-1">
                          {tour.location.startCity} to {tour.location.endCity}
                        </p>
                      </div>

                      {/* Price Section */}
                      <div className="mb-6 pb-6 border-b">
                        <div className="text-sm text-gray-600 font-medium mb-2">
                          From
                        </div>
                        <div className="flex items-end gap-2 mb-2">
                          <span className="text-5xl font-bold text-gray-900">
                            ${discountedPrice.toFixed(0)}
                          </span>
                          <span className="text-lg text-gray-600 font-medium">
                            USD
                          </span>
                        </div>
                        {tour.price.discountPercent > 0 && (
                          <div className="text-sm text-gray-600">
                            was{" "}
                            <span className="line-through">
                              ${tour.price.amount.toFixed(0)}
                            </span>
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-2">
                          per person
                        </div>
                      </div>

                      {/* Valid Date and Trip Code */}
                      {/* <div className="mb-6 pb-6 border-b space-y-4">
                        {tour.startDates && tour.startDates.length > 0 && (
                          <div>
                            <div className="text-xs text-gray-600 font-medium">
                              Valid on
                            </div>
                            <div className="text-sm font-medium text-blue-600">
                              {new Date(
                                tour.startDates[0].startDate,
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                          </div>
                        )}
                      </div> */}

                      {/* Rating */}
                      {/* <div className="mb-6 pb-6 border-b flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-lg">
                              {i < Math.floor(tour.ratingsAverage) ? "⭐" : "☆"}
                            </span>
                          ))}
                        </div>
                        <div className="text-sm text-gray-600">
                          {tour.ratingsQuantity.toLocaleString()} reviews
                        </div>
                      </div> */}

                      {/* CTA Buttons */}
                      <div className="space-y-3">
                        <button className="w-full bg-red-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-purple-800 transition shadow-md flex items-center justify-center gap-2">
                          <span></span>
                          Book Now
                        </button>
                        <button className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition flex items-center justify-center gap-2">
                          <span></span>
                          Save to wish list
                        </button>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                {/* Professional rating card using inline Phosphor-style SVG stars */}
                <div className="flex items-center gap-4">
                  <div className="bg-white border rounded-lg px-4 py-3 flex items-center gap-4 shadow-sm">
                    <div className="flex flex-col items-center pr-3 border-r">
                      <div className="text-2xl font-bold text-gray-900">
                        {tour.ratingsAverage.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">avg</div>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            className="inline-block"
                          >
                            <path
                              d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.79 1.402 8.172L12 18.896l-7.336 3.976 1.402-8.172L.132 9.21l8.2-1.192z"
                              fill={
                                i < Math.round(tour.ratingsAverage)
                                  ? "#fbbf24"
                                  : "none"
                              }
                              stroke="#fbbf24"
                              strokeWidth="0.5"
                            />
                          </svg>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {tour.ratingsQuantity.toLocaleString()} reviews
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:flex flex-col text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        className="text-gray-500"
                      >
                        <path
                          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"
                          fill="currentColor"
                        />
                      </svg>
                      <span>{tour.country.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        className="text-gray-500"
                      >
                        <path
                          d="M12 8a1 1 0 0 1 1 1v3.586l2.707 2.707a1 1 0 0 1-1.414 1.414L11 13.414V9a1 1 0 0 1 1-1z"
                          fill="currentColor"
                        />
                        <path
                          d="M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0zm-2 0A7 7 0 1 0 5 12a7 7 0 0 0 14 0z"
                          fill="currentColor"
                        />
                      </svg>
                      <span>
                        {tour.duration.days} days, {tour.duration.nights} nights
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        className="text-gray-500"
                      >
                        <path
                          d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zM8 13c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zM16 13c-.29 0-.62.02-.97.05C15.4 13.36 16 14.12 16 15v2h6v-2.5c0-2.33-4.67-3.5-6-3.5z"
                          fill="currentColor"
                        />
                      </svg>
                      <span>Max {tour.maxGroupSize} people</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-base text-gray-700">{tour.summary}</p>
            </div>

            {/* removed small booking widget from header; booking panel moved to Photos area */}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-t pt-4">
        <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-2 px-1 cursor-pointer underline-offset-6 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-blue-500 underline text-blue-600"
                  : "border-transparent  text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("itinerary")}
              className={`py-2 px-1 cursor-pointer underline-offset-6 font-medium text-sm ${
                activeTab === "itinerary"
                  ? "border-blue-500  underline text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Full Itinerary
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`py-2 px-1 cursor-pointer underline-offset-6 font-medium text-sm ${
                activeTab === "details"
                  ? "border-blue-500 underline text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Tour Details
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === "overview" && (
              <>
                <div className="bg-white p-2">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Tour Overview
                  </h2>

                  <div className="prose max-w-none mb-8">
                    <p className="text-gray-700 leading-relaxed">
                      {tour.description}
                    </p>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Highlights
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {tour.highlights.map((highlight, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <span className="text-green-500 mt-1">✓</span>
                          <span className="text-gray-700">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Route
                    </h3>
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="font-medium">
                        {tour.location.startCity}
                      </span>
                      <span className="text-gray-400">→</span>
                      {tour.location.visitedCities.map((city, index) => (
                        <span key={index} className="flex items-center gap-2">
                          <span>{city}</span>
                          {index < tour.location.visitedCities.length - 1 && (
                            <span className="text-gray-400">→</span>
                          )}
                        </span>
                      ))}
                      <span className="text-gray-400">→</span>
                      <span className="font-medium">
                        {tour.location.endCity}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Concise Itinerary (Overview) - same structure as full itinerary but abbreviated */}
                {tour.itinerary && tour.itinerary.length > 0 && (
                  <div className="bg-white mt-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Itinerary (Preview)
                    </h3>

                    <div className="space-y-6">
                      {tour.itinerary.map((day, index) => (
                        <div
                          key={index}
                          className="border-l-4 border-blue-500 pl-6 pb-6 relative"
                        >
                          <div className="absolute -left-3 top-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-white">
                              {day.day}
                            </span>
                          </div>

                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            {day.title}
                          </h4>
                          <p className="text-gray-700 mb-3 line-clamp-2">
                            {day.description?.split(".")[0] || ""}.
                          </p>

                          {/* Activities - show names only, limited */}
                          {day.activities && day.activities.length > 0 && (
                            <div className="mb-2">
                              <div className="text-sm font-semibold text-gray-900 mb-2">
                                Activities
                              </div>
                              <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                                {day.activities.slice(0, 2).map((act, i) => (
                                  <li key={i}>{act.name}</li>
                                ))}
                                {day.activities.length > 2 && (
                                  <li className="text-gray-500">
                                    +{day.activities.length - 2} more
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}

                          {/* Optional Activities - names and price only */}
                          {day.optionalActivities &&
                            day.optionalActivities.length > 0 && (
                              <div className="mb-2">
                                <div className="text-sm font-semibold text-gray-900 mb-2">
                                  Optional Activities
                                </div>
                                <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                                  {day.optionalActivities
                                    .slice(0, 2)
                                    .map((opt, i) => (
                                      <li key={i}>
                                        {opt.name} — {opt.price?.currency}{" "}
                                        {opt.price?.amount}
                                      </li>
                                    ))}
                                  {day.optionalActivities.length > 2 && (
                                    <li className="text-gray-500">
                                      +{day.optionalActivities.length - 2} more
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}

                          {/* Accommodations - name and type only */}
                          {day.accommodations &&
                            day.accommodations.length > 0 && (
                              <div>
                                <div className="text-sm font-semibold text-gray-900 mb-2">
                                  Accommodation
                                </div>
                                <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                                  {day.accommodations
                                    .slice(0, 2)
                                    .map((acc, i) => (
                                      <li key={i}>
                                        {acc.name} ({acc.type})
                                      </li>
                                    ))}
                                  {day.accommodations.length > 2 && (
                                    <li className="text-gray-500">
                                      +{day.accommodations.length - 2} more
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-4">
                      <button
                        onClick={() => setActiveTab("itinerary")}
                        className="text-sm text-blue-600 font-medium hover:underline"
                      >
                        View full itinerary
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === "itinerary" && (
              <div className="bg-white p-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Full Itinerary
                </h2>

                <div className="space-y-8">
                  {tour.itinerary.map((day, index) => (
                    <div
                      key={index}
                      ref={(el) => {
                        if (el) dayRefs.current[day.day] = el;
                      }}
                      className="border-l-4 border-blue-500 pl-6 pb-8 relative"
                    >
                      <div className="absolute -left-3 top-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">
                          {day.day}
                        </span>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {day.title}
                      </h3>
                      <p className="text-gray-700 mb-4">{day.description}</p>

                      {day.imageUrl && (
                        <div className="mb-4">
                          <Image
                            src={day.imageUrl}
                            alt={day.title}
                            width={800}
                            height={400}
                            className="w-full h-64 object-cover rounded-lg"
                          />
                        </div>
                      )}

                      {day.activities.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Activities
                          </h4>
                          <div className="space-y-2 font-medium">
                            {day.activities.map((activity, actIndex) => (
                              <div
                                key={actIndex}
                                className="bg-gray-50 rounded-lg p-3"
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-lg">
                                    {iconMap[activity.icon]}
                                  </span>
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">
                                      {activity.name}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {activity.placeName} • {activity.duration}
                                    </div>
                                    <div className="text-sm text-gray-700 mt-1">
                                      {activity.description}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {day.optionalActivities.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Optional Activities *
                          </h4>
                          <div className="space-y-2 font-medium">
                            {day.optionalActivities.map(
                              (optActivity, optIndex) => (
                                <div
                                  key={optIndex}
                                  className="bg-gray-50 rounded-lg p-3"
                                >
                                  <div className="flex items-start gap-3">
                                    <span className="text-lg">
                                      {iconMap[optActivity.icon]}
                                    </span>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <div className="font-medium text-gray-900">
                                          {optActivity.name}
                                        </div>
                                        <div className="text-sm font-semibold ">
                                          {formatPrice(
                                            optActivity.price.amount,
                                            optActivity.price.currency,
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        {optActivity.place} •{" "}
                                        {optActivity.duration}
                                      </div>
                                      <div className="text-sm text-gray-700 mt-1">
                                        {optActivity.description}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {day.accommodations.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Accommodation
                          </h4>
                          <div className="space-y-2 font-medium">
                            {day.accommodations.map(
                              (accommodation, accIndex) => (
                                <div
                                  key={accIndex}
                                  className="bg-gray-50 border rounded-lg p-3"
                                >
                                  <div className="flex items-start gap-3">
                                    <span className="text-lg">🏨</span>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <div className="font-medium text-gray-900">
                                          {accommodation.name}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          ({accommodation.type})
                                        </div>
                                        {accommodation.rating && (
                                          <div className="text-sm">
                                            {"⭐".repeat(accommodation.rating)}
                                          </div>
                                        )}
                                      </div>
                                      {accommodation.description && (
                                        <div className="text-sm text-gray-700 mt-1">
                                          {accommodation.description}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "details" && (
              <div className="bg-white  p-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Tour Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Tour Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">
                          {tour.duration.days} days, {tour.duration.nights}{" "}
                          nights
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Group Size:</span>
                        <span className="font-medium">
                          Max {tour.maxGroupSize} people
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Physical Rating:</span>
                        <span className="font-medium">
                          {tour.physicalRating.level}/5
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Travel Style:</span>
                        <span className="font-medium">{tour.travelStyle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service Level:</span>
                        <span className="font-medium">{tour.serviceLevel}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Age Requirements
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Minimum Age:</span>
                        <span className="font-medium">
                          {tour.ageRequirement.min} years
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Maximum Age:</span>
                        <span className="font-medium">
                          {tour.ageRequirement.max} years
                        </span>
                      </div>
                      {tour.ageRequirement.description && (
                        <div>
                          <span className="text-gray-600">Notes:</span>
                          <p className="text-sm text-gray-700 mt-1">
                            {tour.ageRequirement.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {tour.physicalRating.description && (
                  <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Physical Rating Details
                    </h4>
                    <p className="text-gray-700">
                      {tour.physicalRating.description}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {activeTab === "overview" && (
              <>
                {/* Available Dates */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Available Dates
                  </h3>
                  <div className="space-y-3">
                    {tour.startDates
                      .filter(
                        (date) => date.isActive && date.availableSpots > 0,
                      )
                      .slice(0, 5)
                      .map((date, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 rounded"
                        >
                          <div>
                            <div className="font-medium text-gray-900">
                              {new Date(date.startDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                },
                              )}{" "}
                              -{" "}
                              {new Date(date.endDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {date.availableSpots} spots left
                            </div>
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {formatPrice(
                              date.price.amount,
                              date.price.currency,
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Quick Info */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Info
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🌟</span>
                      <div>
                        <div className="font-medium text-gray-900">Rating</div>
                        <div className="text-sm text-gray-600">
                          {tour.ratingsAverage}
                          {"/"}5 ({tour.ratingsQuantity} reviews)
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📍</span>
                      <div>
                        <div className="font-medium text-gray-900">Country</div>
                        <div className="text-sm text-gray-600">
                          {tour.country.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">💪</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          Physical Level
                        </div>
                        <div className="text-sm text-gray-600">
                          Level {tour.physicalRating.level}
                          {"/"}5
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Need Help?
                  </h3>
                  <p className="text-gray-700 text-sm mb-4">
                    Have questions about this tour? Our travel experts are here
                    to help!
                  </p>
                  <button className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition text-sm">
                    Contact Us
                  </button>
                </div>
              </>
            )}

            {activeTab === "itinerary" && (
              <div className="sticky top-24 space-y-4">
                {/* Itinerary Preview Image */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="relative w-full aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    {tour.itinerary[currentDay - 1]?.imageUrl ? (
                      <Image
                        src={tour.itinerary[currentDay - 1].imageUrl}
                        alt={`Day ${currentDay}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="text-5xl mb-2">📍</div>
                        <div className="text-gray-600 font-medium">
                          Day {currentDay}
                        </div>
                        <div className="text-sm text-gray-500">
                          {tour.itinerary[currentDay - 1]?.title || ""}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Day Counter */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="text-sm text-gray-600 font-medium mb-3">
                    Day Overview
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {tour.itinerary.map((day) => (
                      <button
                        key={day.day}
                        onClick={() => scrollToDay(day.day)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                          currentDay === day.day
                            ? "bg-blue-600 text-white shadow-lg scale-105"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {day.day}
                      </button>
                    ))}
                  </div>
                  {tour.itinerary[currentDay - 1] && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="font-semibold text-gray-900 text-sm">
                        {tour.itinerary[currentDay - 1].title}
                      </div>
                      <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {tour.itinerary[currentDay - 1].description}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "details" && (
              <>
                {/* Quick Info for Details Tab */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Info
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🌟</span>
                      <div>
                        <div className="font-medium text-gray-900">Rating</div>
                        <div className="text-sm text-gray-600">
                          {tour.ratingsAverage}
                          {"/"}5 ({tour.ratingsQuantity} reviews)
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📍</span>
                      <div>
                        <div className="font-medium text-gray-900">Country</div>
                        <div className="text-sm text-gray-600">
                          {tour.country.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">💪</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          Physical Level
                        </div>
                        <div className="text-sm text-gray-600">
                          Level {tour.physicalRating.level}
                          {"/"}5
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Need Help?
                  </h3>
                  <p className="text-gray-700 text-sm mb-4">
                    Have questions about this tour? Our travel experts are here
                    to help!
                  </p>
                  <button className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition text-sm">
                    Contact Us
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Check Availability Section */}
      <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Section Header */}
          <div className="px-6 py-6 border-b bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Check Availability
            </h2>
            <p className="text-gray-600">
              Select your preferred dates and secure your spot on this tour
            </p>
          </div>

          {/* Availability Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Dates
                    <div className="text-xs font-normal text-gray-500">
                      Start-End
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Availability
                    <div className="text-xs font-normal text-gray-500">
                      Remaining Spaces
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Price
                    <div className="text-xs font-normal text-gray-500">
                      Per Person
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>

              {/* Table Body - Grouped by Month */}
              <tbody>
                {tour.startDates && tour.startDates.length > 0 ? (
                  (() => {
                    // Group dates by month
                    const groupedByMonth: {
                      [key: string]: typeof tour.startDates;
                    } = {};
                    tour.startDates.forEach((date) => {
                      const monthYear = new Date(
                        date.startDate,
                      ).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      });
                      if (!groupedByMonth[monthYear]) {
                        groupedByMonth[monthYear] = [];
                      }
                      groupedByMonth[monthYear].push(date);
                    });

                    // Sort months chronologically
                    const sortedMonths = Object.keys(groupedByMonth).sort(
                      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
                    );

                    return sortedMonths
                      .map((month, monthIndex) => [
                        // Month Header Row
                        <tr key={`month-${month}`} className="bg-gray-200">
                          <td
                            colSpan={4}
                            className="px-6 py-3 text-sm font-bold text-gray-800 uppercase tracking-wide"
                          >
                            {month}
                          </td>
                        </tr>,
                        // Dates in this month
                        ...groupedByMonth[month].map((date, dateIndex) => {
                          const isSoldOut =
                            date.availableSpots === 0 || !date.isActive;
                          const originalPrice = tour.price.amount;
                          const discountedPrice =
                            tour.price.discountPercent > 0
                              ? originalPrice *
                                (1 - tour.price.discountPercent / 100)
                              : originalPrice;

                          return (
                            <tr
                              key={`${month}-${dateIndex}`}
                              className={`border-b ${
                                isSoldOut
                                  ? "bg-gray-50 opacity-50"
                                  : "bg-white hover:bg-blue-50"
                              } transition-colors`}
                            >
                              <td className="px-6 py-4">
                                <div
                                  className={`text-sm font-medium ${
                                    isSoldOut
                                      ? "text-gray-400"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {new Date(date.startDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      weekday: "short",
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )}{" "}
                                  -{" "}
                                  {new Date(date.endDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      weekday: "short",
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )}
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                {isSoldOut ? (
                                  <span className="text-sm text-gray-400 font-medium">
                                    Sold Out
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-700 font-medium">
                                    {date.availableSpots}{" "}
                                    <span className="text-gray-500">
                                      Available
                                    </span>
                                  </span>
                                )}
                              </td>

                              <td className="px-6 py-4">
                                {isSoldOut ? (
                                  <div className="text-sm text-gray-400">
                                    ${originalPrice}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-gray-900">
                                      $
                                      {Math.round(
                                        date.price.amount || discountedPrice,
                                      )}
                                    </span>
                                    {tour.price.discountPercent > 0 && (
                                      <span className="text-xs text-gray-500 line-through">
                                        ${originalPrice}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>

                              <td className="px-6 py-4 text-center">
                                {isSoldOut ? (
                                  <span className="text-xs text-gray-400 font-medium">
                                    Unavailable
                                  </span>
                                ) : (
                                  <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded transition-colors">
                                    Book now
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        }),
                      ])
                      .flat();
                  })()
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No dates available at the moment
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recommended Tours Section */}
      <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4 py-16 ">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Recommended Tours
          </h2>
          <p className="text-gray-600">
            Explore other amazing adventures you might love
          </p>
        </div>

        {relatedTours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedTours.map((recommendedTour) => {
              const primaryImage =
                recommendedTour.images?.find((img) => img.isPrimary) ||
                recommendedTour.images?.[0];
              const discountedPrice =
                recommendedTour.price.discountPercent > 0
                  ? recommendedTour.price.amount *
                    (1 - recommendedTour.price.discountPercent / 100)
                  : recommendedTour.price.amount;

              return (
                <Link
                  href={`/tours/${recommendedTour.slug}`}
                  key={recommendedTour._id}
                >
                  <div className="group bg-white rounded-xl border overflow-hidden  transition-all duration-300 transform  cursor-pointer h-full flex flex-col">
                    {/* Image Container */}
                    <div className="relative w-full h-64 overflow-hidden bg-gray-100">
                      {primaryImage?.url ? (
                        <img
                          src={primaryImage.url}
                          alt={primaryImage.caption || recommendedTour.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <svg
                            className="w-16 h-16 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      {/* Duration Badge */}
                      <div className="mb-3">
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                          {recommendedTour.duration.days} Day Tour
                        </span>
                      </div>

                      {/* Tour Name */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                        {recommendedTour.name}
                      </h3>

                      {/* Spacing for push to bottom */}
                      <div className="flex-1"></div>

                      {/* Price Section */}
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-3xl font-bold text-gray-900">
                          ${Math.round(discountedPrice)}
                        </span>
                        <span className="text-sm text-gray-600">
                          per person
                        </span>
                      </div>

                      {/* CTA Button */}
                      <button className="w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-all duration-200">
                        View itinerary
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No other tours available at the moment
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
