"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import Image from "next/image";
import TourDetailLoading from "./loading";

interface Tour {
  _id: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  descriptionImage?: string;
  itineraryMapImage?: string;
  whatsIncluded?: string;
  transportation?: string;
  staffExperts?: string;
  meals?: string;
  accommodation?: string;
  price: {
    amount: number;
    currency: string;
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
    meals?: {
      breakfast: boolean;
      lunch: boolean;
      dinner: boolean;
    };
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
    discount: number;
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
  const router = useRouter();
  const slug = params.slug as string;

  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "itinerary" | "details"
  >("overview");
  const [currentDay, setCurrentDay] = useState(1);
  const [relatedTours, setRelatedTours] = useState<Tour[]>([]);
  const dayRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const [showStickyFooter, setShowStickyFooter] = useState(false);
  const bookingPanelRef = useRef<HTMLDivElement>(null);
  const recommendedToursRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (slug) {
      fetchTour();
    }
  }, [slug]);

  // Track scroll position and update current visible day
  useEffect(() => {
    const handleScroll = () => {
      // Sticky Footer Logic
      if (bookingPanelRef.current && recommendedToursRef.current) {
        const bookingPanelRect = bookingPanelRef.current.getBoundingClientRect();
        const recommendedRect =
          recommendedToursRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Show when booking panel is scrolled up out of view (bottom < 0 or top < some negative value)
        // We'll use bottom < 0 to mean it has completely scrolled off the top
        const isBookingPanelHidden = bookingPanelRect.bottom < 0;

        // Hide when recommended tours section comes into view
        const isRecommendedVisible = recommendedRect.top < windowHeight;

        setShowStickyFooter(isBookingPanelHidden && !isRecommendedVisible);
      }

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
    return <TourDetailLoading />;
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

  // Pricing and Dates Logic
  const sortedDates = tour.startDates ? [...tour.startDates].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()) : [];

  // Find highest discount date
  const bestDealDate = sortedDates.reduce((best, current) => {
    return (current.discount || 0) > (best?.discount || 0) ? current : best;
  }, sortedDates[0]);

  const basePrice = tour.price.amount;
  const bestDiscount = bestDealDate?.discount || 0;
  const discountedPrice = bestDiscount > 0 ? basePrice * (1 - bestDiscount / 100) : basePrice;

  // Top 3 discounted dates for list
  const topDiscountedDates = sortedDates
    .filter(d => (d.discount || 0) > 0)
    .slice(0, 3);

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
              <div className="max-w-7xl mx-auto py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  {/* Images Grid (left) - Show description image if available, otherwise show gallery */}
                  <div className="lg:col-span-2">
                    <h1 className="text-4xl font-semibold text-gray-900 mb-4">
                      {tour.name} - {tour.duration.days} days
                    </h1>
                    {/* Rating */}
                    <div className="flex items-center gap-4 mb-6">
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
                    {tour.descriptionImage ? (
                      // Show single description image
                      <div className="relative aspect-[4/2] rounded-sm overflow-hidden">
                        <Image
                          src={tour.descriptionImage || "/placeholder-image.jpg"}
                          alt={`${tour.name} description`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      // Show image gallery if no description image
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
                    )}
                  </div>

                  {/* Booking Panel (right) */}
                  <aside
                    ref={bookingPanelRef}
                    className="bg-gradient-to-br from-white to-gray-50 rounded-xl border shadow-lg overflow-hidden"
                  >
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
                        {tour.price.amount > discountedPrice && (
                          <div className="text-sm text-gray-600">
                            was{" "}
                            <span className="line-through">
                              ${tour.price.amount.toFixed(0)}
                            </span>
                            <div className="text-sm text-red-600 font-medium mt-1">
                              Best Price for {new Date(bestDealDate.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </div>
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-2">
                          per person
                        </div>
                      </div>



                      {/* Rating */}
                      <div className="mb-6 pb-6 border-b flex items-center gap-3">
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
                      </div>

                      {/* CTA Buttons */}
                      <div className="space-y-3">
                        <button
                          onClick={() => router.push(`/tours/${tour.slug}/checkout`)}
                          className="w-full bg-red-500 text-white font-semibold py-2 px-4 text-sm rounded-lg hover:bg-red-600 transition shadow-md flex items-center justify-center gap-2"
                        >
                          <span></span>
                          Book Now
                        </button>
                        <button className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-2 px-4 text-sm rounded-lg hover:border-purple-300 hover:bg-purple-50 transition flex items-center justify-center gap-2">
                          <span></span>
                          Save to wish list
                        </button>

                        {/* Top Discounts List */}
                        {topDiscountedDates.length > 0 && (
                          <div className="mt-3 pt-3 text-center border-t space-y-1">
                            {topDiscountedDates.map((date, idx) => (
                              <button
                                key={idx}
                                onClick={() => router.push(`/tours/${tour.slug}/checkout?date=${new Date(date.startDate).toISOString().split('T')[0]}`)}
                                className="block w-full text-left text-sm text-sky-500 hover:text-sky-700 hover:bg-sky-50 py-1 px-2 rounded transition-colors cursor-pointer"
                              >
                                Save {date.discount}% - Departure {new Date(date.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          )}


        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-t pt-4">
        <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-2 px-1 cursor-pointer underline-offset-6 font-medium text-sm ${activeTab === "overview"
                ? "border-blue-500 underline text-blue-600"
                : "border-transparent  text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("itinerary")}
              className={`py-2 px-1 cursor-pointer underline-offset-6 font-medium text-sm ${activeTab === "itinerary"
                ? "border-blue-500  underline text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              Full Itinerary
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`py-2 px-1 cursor-pointer underline-offset-6 font-medium text-sm ${activeTab === "details"
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

                  {/* Is This Tour For Me Section */}
                  <div className="mb-12 border-t pt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Is this tour for me?
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-bold text-indigo-900">
                            Travel Style: {tour.travelStyle}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            Immersive experiences that capture the essence of a
                            destination including its highlights, culture, and
                            history. All at a great price.
                          </p>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-indigo-900">
                            Service Level: {tour.serviceLevel}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            Comfortable tourist-class accommodations with character;
                            mix of public and private transport.
                          </p>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-indigo-900">
                            Physical Rating: {tour.physicalRating.level}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {tour.physicalRating.description ||
                              "Light walking and hiking suitable for most fitness levels."}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-indigo-900">
                            Trip Type: Small Group
                          </h3>
                          <p className="text-gray-600 mt-1">
                            Small group experience; Max {tour.maxGroupSize}.
                            Great for meeting like-minded travellers.
                          </p>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-indigo-900">
                            Age requirement: {tour.ageRequirement.min}+
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {tour.ageRequirement.description ||
                              "All travellers under age 18 must be accompanied by an adult."}
                          </p>
                        </div>
                      </div>

                      <div className="lg:border-l lg:pl-12 border-gray-200">
                        <h3 className="text-lg font-bold text-indigo-900 mb-3">
                          Check Your Visa Requirements
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Before booking, use our handy entry requirements tool
                          so you know which documents you need to enter and
                          travel through the countries on your trip.
                        </p>
                        <a
                          href="#"
                          className="text-cyan-500 hover:text-cyan-600 font-medium hover:underline block"
                        >
                          View our Entry Requirements tool
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
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
                          {tour.duration.days} days
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


            {activeTab === "itinerary" && (
              <div className="sticky top-24 space-y-4">
                {/* Itinerary Map Image */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="relative w-full aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    {tour.itineraryMapImage ? (
                      <Image
                        src={tour.itineraryMapImage}
                        alt="Itinerary Map"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="text-5xl mb-2">🗺️</div>
                        <div className="text-gray-600 font-medium">
                          Tour Map
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
                        className={`w-10 h-10 rounded-lg font-semibold transition-all ${currentDay === day.day
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

      {/* Community Impact Section - Full Width, Only visible in Overview tab */}
      {activeTab === "overview" && (
        <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4 py-12">
          <div className="rounded-lg">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                See how your trip uplifts communities
              </h2>
              <p className="text-gray-600">
                In a number of impactful ways, your adventure directly benefits the local people and places we visit.
              </p>
            </div>

            <div className="space-y-4">
              {/* Trees for Days Card */}
              <div className="bg-white rounded-lg p-6">
                <div className="flex gap-6">
                  <div className="w-20 h-20 bg-teal-600 rounded flex-shrink-0"></div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Heading
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Help us spread love around the world with Trees for Days. Together with Planeterra, we'll plant one tree in your name for every travel day.
                    </p>
                    <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded transition-colors mb-3">
                      Learn more
                    </button>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Trees planted for this trip: <strong>8</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ripple Score Card */}
              <div className="bg-white rounded-lg p-6">
                <div className="flex gap-6">
                  <div className="w-20 h-20 bg-lime-400 rounded flex-shrink-0"></div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Heading
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Create ripples that change lives. The higher the Ripple Score percentage, the more money stays in the local communities you visit.
                    </p>
                    <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded transition-colors mb-3">
                      Learn more
                    </button>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Ripple Score for this trip: <strong>100</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Gallery Section - Full Width, Only visible in Overview tab */}
      {activeTab === "overview" && tour.images && tour.images.length > 0 && (
        <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-[400px]">
            {/* Large Image - Left Side */}
            <div className="relative h-full rounded-lg overflow-hidden group cursor-pointer">
              {tour.images[0] && (
                <Image
                  src={tour.images[0].url || "/placeholder-image.jpg"}
                  alt={tour.images[0].caption || tour.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
            </div>

            {/* Grid of Smaller Images - Right Side */}
            <div className="grid grid-cols-2 gap-2 h-full">
              {tour.images.slice(1, 5).map((image, idx) => (
                <div
                  key={idx}
                  className={`relative rounded-lg overflow-hidden group cursor-pointer ${idx === 3 ? 'after:absolute after:inset-0 after:bg-black after:bg-opacity-50' : ''
                    }`}
                >
                  <Image
                    src={image.url || "/placeholder-image.jpg"}
                    alt={image.caption || `${tour.name} photo ${idx + 2}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Show "+X MORE" overlay on last image if there are more photos */}
                  {idx === 3 && tour.images.length > 5 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 z-10">
                      <div className="text-white text-3xl font-bold">
                        +{tour.images.length - 5} MORE
                      </div>
                      <div className="text-white text-sm mt-1">
                        FROM THIS TRIP
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Itinerary Preview Section - Only visible in Overview tab */}
      {activeTab === "overview" && tour.itinerary && tour.itinerary.length > 0 && (
        <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4 py-12">
          <div className="bg-white">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
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

            <div className="mt-6">
              <button
                onClick={() => setActiveTab("itinerary")}
                className="text-sm text-blue-600 font-medium hover:underline"
              >
                View full itinerary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* What's Included & Reviews Section - Only visible in Overview tab */}
      {activeTab === "overview" && (
        <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column: What's Included, Transportation, Staff & Experts */}
            <div className="lg:col-span-2 space-y-10">
              {/* What's Included */}
              {(tour.whatsIncluded || true) && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    What&apos;s Included
                  </h3>
                  {tour.whatsIncluded ? (
                    <ul className="space-y-4 mb-8">
                      {tour.whatsIncluded.split(/\n\s*\n/).map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-3 mt-2 w-1.5 h-1.5 bg-gray-900 rounded-full flex-shrink-0"></span>
                          <span className="text-gray-700 leading-relaxed">
                            {item.trim()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic mb-8">
                      Information about what&apos;s included will be added soon.
                    </p>
                  )}

                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      Accommodations
                    </h4>
                    <p className="text-gray-700">
                      {tour.accommodation ||
                        (tour.itinerary &&
                          tour.itinerary.some(
                            (day) =>
                              day.accommodations && day.accommodations.length > 0,
                          )
                          ? Array.from(
                            new Set(
                              tour.itinerary.flatMap(
                                (day) =>
                                  day.accommodations?.map(
                                    (acc) => acc.type,
                                  ) || [],
                              ),
                            ),
                          ).join(", ")
                          : "Standard accommodation")}
                    </p>
                  </div>

                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      Meals
                    </h4>
                    <p className="text-gray-700 mb-1">
                      {tour.meals || (
                        <>
                          {tour.itinerary?.reduce(
                            (acc, day) => acc + (day.meals?.breakfast ? 1 : 0),
                            0,
                          )}{" "}
                          breakfasts,{" "}
                          {tour.itinerary?.reduce(
                            (acc, day) => acc + (day.meals?.lunch ? 1 : 0),
                            0,
                          )}{" "}
                          lunches,{" "}
                          {tour.itinerary?.reduce(
                            (acc, day) => acc + (day.meals?.dinner ? 1 : 0),
                            0,
                          )}{" "}
                          dinners
                        </>
                      )}
                    </p>

                  </div>
                </div>
              )}

              {/* Transportation */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Transportation
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {tour.transportation ||
                    "Train, local bus, private vehicle, auto-rickshaw, small riverboat, plane."}
                </p>
              </div>

              {/* Staff & Experts */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Staff & experts
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {tour.staffExperts ||
                    "CEO (Chief Experience Officer) throughout, local guides."}
                </p>
              </div>
            </div>

            {/* Right Column: Reviews (Placeholder) */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm border sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Reviews{" "}
                    <span className="text-gray-500 font-normal">
                      {tour.ratingsQuantity}
                    </span>
                  </h3>
                </div>

                <div className="flex items-center mb-6">
                  <div className="flex text-green-500 mr-3">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-6 h-6 ${i < Math.round(tour.ratingsAverage)
                          ? "fill-current"
                          : "text-gray-300 fill-current"
                          }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {tour.ratingsAverage}
                    <span className="text-sm text-gray-500 font-normal ml-1">
                      / 5
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {["Excellent", "Great", "Average", "Poor", "Bad"].map(
                    (label, i) => (
                      <div key={label} className="flex items-center text-sm">
                        <div className="w-5 h-5 border rounded mr-3 flex items-center justify-center"></div>
                        <span className="w-20 text-gray-600">{label}</span>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden mx-2">
                          <div
                            className="h-full bg-gray-600"
                            style={{
                              width:
                                i === 0
                                  ? "81%"
                                  : i === 1
                                    ? "15%"
                                    : i === 2
                                      ? "4%"
                                      : "0%",
                            }}
                          ></div>
                        </div>
                        <span className="text-gray-500 w-8 text-right">
                          {i === 0
                            ? "81%"
                            : i === 1
                              ? "15%"
                              : i === 2
                                ? "4%"
                                : "0%"}
                        </span>
                      </div>
                    ),
                  )}
                </div>

                <div className="space-y-6">
                  {/* Sample Review 1 */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">
                        Charles C.
                      </span>
                      <span className="text-gray-500 text-xs">June 22</span>
                    </div>
                    <div className="flex text-green-500 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-4 h-4 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm">
                      I had an eye opening tour through India that made me not
                      only realize how valuable the culture and people are but
                      also gave me a rudimentary understanding of the society...
                    </p>
                  </div>

                  {/* Sample Review 2 */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">
                        John M.
                      </span>
                      <span className="text-gray-500 text-xs">June 22</span>
                    </div>
                    <div className="flex text-green-500 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-4 h-4 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm">
                      I thoroughly enjoyed my trip to India with Nothing But
                      Adventures...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Available Extras Section - Only visible in Overview tab */}
      {activeTab === "overview" &&
        tour.itinerary &&
        tour.itinerary.some(
          (day) => day.optionalActivities && day.optionalActivities.length > 0,
        ) && (
          <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4 pb-12">
            <div className="bg-white">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Available extras{" "}
                <span className="text-gray-500 font-normal text-lg">
                  (Add these to your tour when you book)
                </span>
              </h3>

              <div className="mt-8 space-y-8">
                {tour.itinerary.flatMap((day) =>
                  (day.optionalActivities || []).map((activity, idx) => (
                    <div
                      key={`${day.day}-${idx}`}
                      className="flex items-start gap-4"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center text-white">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                          {activity.name}{" "}
                          <span className="text-gray-500 font-normal">
                            - From {activity.price.currency}{" "}
                            {activity.price.amount.toFixed(2)}
                          </span>
                        </h4>
                        <p className="text-gray-700 leading-relaxed max-w-4xl">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  )),
                )}
              </div>
            </div>
          </div>
        )}

      {/* Check Availability Section - Only visible in Overview tab */}
      {activeTab === "overview" && (
        <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
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
                                const discount = date.discount || 0;
                                const datePrice = originalPrice * (1 - discount / 100);

                                return (
                                  <tr
                                    key={`${month}-${dateIndex}`}
                                    className={`border-b ${isSoldOut
                                      ? "bg-gray-50 opacity-50"
                                      : "bg-white hover:bg-blue-50"
                                      } transition-colors`}
                                  >
                                    <td className="px-6 py-4">
                                      <div
                                        className={`text-sm font-medium ${isSoldOut
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
                                            {Math.round(datePrice)}
                                          </span>
                                          {discount > 0 && (
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
                                        <button
                                          onClick={() => {
                                            const dateStr = new Date(date.startDate).toISOString().split('T')[0];
                                            router.push(`/tours/${tour.slug}/checkout?date=${dateStr}`);
                                          }}
                                          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded transition-colors"
                                        >
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
          </div>
        </div>
      )}

      {/* Recommended Tours Section */}
      <div
        ref={recommendedToursRef}
        className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4 py-16 "
      >
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
              const discountedPrice = recommendedTour.price.amount;

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

      {/* Sticky Footer */}
      {showStickyFooter && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">

              {/* Route & Price Info */}
              <div className="flex items-center gap-8 flex-1">
                {/* Route */}
                <div className="hidden md:block">
                  <div className="text-sm font-bold text-gray-900">
                    {tour.location.startCity} to {tour.location.endCity}
                  </div>
                  <div className="text-xs text-gray-500">
                    {tour.duration.days} days
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-gray-500">From</span>
                      <span className="text-xl font-bold text-gray-900">
                        ${discountedPrice.toFixed(0)}
                      </span>
                      <span className="text-xs font-medium text-gray-900">USD</span>
                    </div>
                    {tour.price.amount > discountedPrice && (
                      <div className="text-xs text-gray-500">
                        was <span className="line-through">${tour.price.amount.toFixed(0)}</span> per person
                      </div>
                    )}
                  </div>

                  {/* Valid Date */}
                  {sortedDates.length > 0 && (
                    <div className="hidden lg:block pl-4 border-l border-gray-300">
                      <div className="text-xs text-gray-500">Valid on</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {new Date(sortedDates[0].startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  )}

                  {/* Rating */}
                  <div className="hidden xl:block pl-4 border-l border-gray-300">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-lg leading-none">
                          {i < Math.floor(tour.ratingsAverage) ? "★" : "☆"}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500">
                      {tour.ratingsQuantity} reviews
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => router.push(`/tours/${tour.slug}/checkout`)}
                  className="flex-1 md:flex-none bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded transition-colors whitespace-nowrap"
                >
                  Book Now
                </button>
                <button className="flex-1 md:flex-none border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded transition-colors whitespace-nowrap flex items-center justify-center gap-2">
                  <span className="text-xl">♡</span>
                  <span className="hidden sm:inline">Save to wish list</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
