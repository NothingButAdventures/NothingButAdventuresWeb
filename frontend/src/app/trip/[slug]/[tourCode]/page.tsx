"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import Image from "next/image";
import TourDetailLoading from "./loading";
import { CalendarCheck, Clock, Heart, CaretDown, Star, ArrowUpRight } from "@phosphor-icons/react";
import ReviewsSection from "@/components/ReviewsSection";
import PopularToursSection from "@/components/PopularToursSection";

interface Tour {
  _id: string;
  name: string;
  slug: string;
  tourCode: string;
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
    discount: string;
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
  const tourCode = params.tourCode as string;

  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "itinerary" | "details"
  >("overview");
  const [tourForMeTab, setTourForMeTab] = useState<"activities" | "tour_leader" | "transport" | "accommodation" | "meals">("activities");
  const [currentDay, setCurrentDay] = useState(1);
  const [relatedTours, setRelatedTours] = useState<Tour[]>([]);
  const [discountsMap, setDiscountsMap] = useState<{ [name: string]: number }>({});
  const dayRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const [showStickyFooter, setShowStickyFooter] = useState(false);
  const bookingPanelRef = useRef<HTMLDivElement>(null);
  const recommendedToursRef = useRef<HTMLDivElement>(null);

  // Hold Space state
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [holdSelectedDate, setHoldSelectedDate] = useState<string>("");
  const [holdLoading, setHoldLoading] = useState(false);
  const [holdMessage, setHoldMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Helper function to get discount percentage by name
  const getDiscountPercentage = (discountName: string | undefined): number => {
    if (!discountName) return 0;
    return discountsMap[discountName] || 0;
  };

  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    if (tour) {
      checkWishlistStatus();
    }
  }, [tour]);

  const checkWishlistStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await fetch(`${api.baseURL}${api.endpoints.auth.me}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.data.user.wishlist && data.data.user.wishlist.includes(tour?._id)) {
          setIsInWishlist(true);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleWishlistToggle = async () => {
    if (!tour) return;
    const token = localStorage.getItem("token");
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch(`${api.baseURL}${api.endpoints.users.toggleWishlist(tour._id)}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        setIsInWishlist(!isInWishlist);
      }
    } catch (e) {
      console.error(e);
    }
  };

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

      // Fetch discounts first to build the lookup map
      try {
        const discountsResponse = await fetch(`${api.baseURL}/discounts`);
        if (discountsResponse.ok) {
          const discountsData = await discountsResponse.json();
          const discounts = discountsData.data.discounts || [];
          const map: { [name: string]: number } = {};
          discounts.forEach((d: { name: string; percentage: number }) => {
            map[d.name] = d.percentage;
          });
          setDiscountsMap(map);
        }
      } catch (error) {
        console.error("Failed to fetch discounts:", error);
      }

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

  const handleHoldSpace = async () => {
    if (!holdSelectedDate || !tour) return;

    setHoldLoading(true);
    setHoldMessage(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${api.baseURL}/hold-spaces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tour: tour._id,
          startDate: holdSelectedDate,
          numberOfSpots: 1,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setHoldMessage({
          type: "success",
          text: `Space held for 48 hours! Reference: ${data.data.holdSpace.holdReference}`,
        });
        setTimeout(() => {
          setShowHoldModal(false);
          setHoldMessage(null);
          setHoldSelectedDate("");
        }, 3000);
      } else {
        setHoldMessage({
          type: "error",
          text: data.message || "Failed to hold space. Please try again.",
        });
      }
    } catch (error) {
      setHoldMessage({
        type: "error",
        text: "Network error. Please try again.",
      });
    } finally {
      setHoldLoading(false);
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
    return getDiscountPercentage(current.discount) > getDiscountPercentage(best?.discount) ? current : best;
  }, sortedDates[0]);

  const basePrice = tour.price.amount;
  const bestDiscount = getDiscountPercentage(bestDealDate?.discount);
  const discountedPrice = bestDiscount > 0 ? basePrice * (1 - bestDiscount / 100) : basePrice;

  // Top 3 discounted dates for list
  const topDiscountedDates = sortedDates
    .filter(d => getDiscountPercentage(d.discount) > 0)
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Tour Header - Full Width */}
      <div className="bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-14">

          {/* Title Row */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">
              {tour.name} - {tour.duration.days} days
            </h1>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-full transition" title="Share">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </button>
              <button
                onClick={handleWishlistToggle}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                title="Save to Wishlist"
              >
                <Heart size={20} weight={isInWishlist ? "fill" : "regular"} className={isInWishlist ? "text-[#E63946]" : "text-black"} />
              </button>
            </div>
          </div>

          {/* Photo Gallery + Booking Panel Grid */}
          {tour.images && tour.images.length > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
                {/* Image Gallery (left) - Airbnb-style grid */}
                <div>
                  <div className="grid grid-cols-3 min-h-148 grid-rows-2 gap-2 rounded-xl overflow-hidden" style={{ height: '460px' }}>
                    {/* Large image - description image or first tour image */}
                    <div className="col-span-1 row-span-2 relative">
                      <Image
                        src={tour.descriptionImage || tour.images[0]?.url || "/placeholder-image.jpg"}
                        alt={`${tour.name} description`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {/* Top-middle image */}
                    <div className="relative">
                      <Image
                        src={tour.images[0]?.url || "/placeholder-image.jpg"}
                        alt={tour.images[0]?.caption || `${tour.name} photo 1`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {/* Top-right image */}
                    <div className="relative">
                      <Image
                        src={tour.images[1]?.url || tour.images[0]?.url || "/placeholder-image.jpg"}
                        alt={tour.images[1]?.caption || `${tour.name} photo 2`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {/* Bottom-middle image */}
                    <div className="relative">
                      <Image
                        src={tour.images[2]?.url || tour.images[0]?.url || "/placeholder-image.jpg"}
                        alt={tour.images[2]?.caption || `${tour.name} photo 3`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {/* Bottom-right image with +N overlay */}
                    <div className="relative cursor-pointer group">
                      <Image
                        src={tour.images[3]?.url || tour.images[0]?.url || "/placeholder-image.jpg"}
                        alt={tour.images[3]?.caption || `${tour.name} photo 4`}
                        fill
                        className="object-cover"
                      />
                      {tour.images.length > 4 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition">
                          <span className="text-white text-3xl font-semibold">+{tour.images.length - 4}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Booking Panel (right) */}
                <div className="flex flex-col gap-4">
                  <aside
                    ref={bookingPanelRef}
                    className="bg-white rounded-[16px] border border-gray-200 p-5 shadow-sm flex flex-col gap-5 w-full"
                  >
                    {/* Price header */}
                    <div>
                      <div className="flex items-baseline justify-between">
                        <span className="flex items-start font-bold text-black leading-none">
                          <span className="text-base font-bold mt-1">$</span>
                          <span className="text-[2rem] leading-none">{discountedPrice.toFixed(0)}</span>
                          <span className="text-base font-bold mt-1 ml-1">USD</span>
                        </span>
                        {bestDiscount > 0 && (
                          <span className="text-base font-semibold text-black">
                            was{" "}
                            <span className="line-through">${basePrice.toFixed(0)} USD</span>
                          </span>
                        )}
                      </div>
                      <div className="text-base font-medium text-black mt-2">
                        {tour.location.startCity} to {tour.location.endCity}
                      </div>
                    </div>

                    {/* Dates / Days Group */}
                    <div className="border border-gray-300 rounded-xl overflow-hidden">
                      <div className="flex border-b border-gray-300">
                        <div className="flex-1 p-3 border-r border-gray-300">
                          <div className="text-[10px] font-bold tracking-wider text-black uppercase">Starts</div>
                          <div className="text-sm text-gray-800 mt-1">
                            {bestDealDate ? new Date(bestDealDate.startDate).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" }) : "—"}
                          </div>
                        </div>
                        <div className="flex-1 p-3">
                          <div className="text-[10px] font-bold tracking-wider text-black uppercase">Ends</div>
                          <div className="text-sm text-gray-800 mt-1">
                            {bestDealDate ? new Date(bestDealDate.endDate).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" }) : "—"}
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="text-[10px] font-bold tracking-wider text-black uppercase">Days</div>
                        <div className="text-sm text-gray-800 mt-1">
                          {String(tour.duration.days).padStart(2, "0")} Days
                        </div>
                      </div>
                    </div>

                    {/* Ratings */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={18} weight={i < Math.round(tour.ratingsAverage) ? "fill" : "regular"} className="text-black" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">({tour.ratingsQuantity} reviews)</span>
                    </div>

                    {/* Primary Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/trip/${tour.slug}/${tour.tourCode}/checkout?date=${bestDealDate ? new Date(bestDealDate.startDate).toISOString().split('T')[0] : ''}`)}
                        className="flex-1 bg-[#121212] text-white py-3 px-4 rounded-full flex items-center justify-center gap-2 font-medium hover:bg-black transition text-base"
                      >
                        <CalendarCheck size={18} />
                        Book Now
                      </button>
                      <button
                        className="w-12 h-12 bg-[#121212] text-white rounded-full flex items-center justify-center hover:bg-black transition shrink-0"
                        onClick={() => router.push(`/trip/${tour.slug}/${tour.tourCode}/checkout?date=${bestDealDate ? new Date(bestDealDate.startDate).toISOString().split('T')[0] : ''}`)}
                      >
                        <ArrowUpRight size={18} />
                      </button>
                    </div>

                    {/* Secondary Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowHoldModal(true);
                          setHoldMessage(null);
                          setHoldSelectedDate("");
                        }}
                        className="flex-1 bg-[#4B4B4B] text-white py-3 px-3 rounded-full flex items-center justify-center gap-2 font-medium hover:bg-[#3D3D3D] transition text-sm"
                      >
                        <Clock size={18} />
                        Hold Space
                      </button>
                      <button
                        onClick={handleWishlistToggle}
                        className="flex-1 bg-white text-black border border-gray-300 py-3 px-3 rounded-full flex items-center justify-center gap-2 font-medium hover:bg-gray-50 transition text-sm"
                      >
                        <Heart size={18} weight={isInWishlist ? "fill" : "regular"} className={isInWishlist ? "text-[#E63946]" : "text-black"} />
                        {isInWishlist ? 'Saved' : 'Save to Wishlist'}
                      </button>
                    </div>
                  </aside>
                  {topDiscountedDates.length > 0 && (
                    <div className="flex flex-col gap-2 mt-1">
                      {topDiscountedDates.map((dateObj, idx) => {
                        const discPct = getDiscountPercentage(dateObj.discount);
                        return (
                          <div
                            key={idx}
                            className="bg-[#F3F4F6] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                            onClick={() => router.push(`/trip/${tour.slug}/${tour.tourCode}/checkout?date=${new Date(dateObj.startDate).toISOString().split('T')[0]}`)}
                          >
                            {discPct > 0 && (
                              <span className="bg-gray-900 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                                Save {discPct}%
                              </span>
                            )}
                            <span>
                              Departure {new Date(dateObj.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}


        </div>
      </div>

      {/* Tour Overview Section */}
      <div className="bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-8">
          {/* Top: Overview content (Full Width) */}
          <div className="mb-8">
            {/* Tour Overview heading + description */}
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trip Overview</h2>
            <p className="text-gray-700 max-w-7xl leading-relaxed mb-1">
              {tour.description.length > 250
                ? `${tour.description.substring(0, 250)}...`
                : tour.description}
              {tour.description.length > 250 && (
                <span>
                  {" "}
                  <button className="text-blue-600 hover:underline font-medium text-sm">Read More</button>
                </span>
              )}
            </p>

            {/* Quick Info Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 max-w-7xl gap-4 mt-8 rounded-2xl p-5">
              {/* Overall Rating */}
              <div className="flex flex-col items-start gap-2">
                <span className="text-sm font-semibold text-gray-900">Overall Rating</span>
                <div className="flex flex-col items-start">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-1">
                      <span className="text-[10px] text-gray-500 w-3">{star}</span>
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-900 rounded-full"
                          style={{ width: star <= Math.round(tour.ratingsAverage) ? '100%' : '0%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="flex flex-col items-start gap-2">
                <span className="text-sm font-semibold text-gray-900">{tour.duration.days} days</span>
                <span className="text-xs text-gray-500">Duration</span>
                <Image src="/1.svg" alt="Duration" width={28} height={28} />
              </div>

              {/* Group Size */}
              <div className="flex flex-col items-start gap-2">
                <span className="text-sm font-semibold text-gray-900">Max {tour.maxGroupSize} people</span>
                <span className="text-xs text-gray-500">Group Size</span>
                <Image src="/2.svg" alt="Group Size" width={28} height={28} />
              </div>

              {/* Physical Rating */}
              <div className="flex flex-col items-start gap-2">
                <span className="text-sm font-semibold text-gray-900">{tour.physicalRating.level}/5</span>
                <span className="text-xs text-gray-500">Physical Rating</span>
                <Image src="/3.svg" alt="Physical Rating" width={28} height={28} />
              </div>

              {/* Travel Style */}
              <div className="flex flex-col items-start gap-2">
                <span className="text-sm font-semibold text-gray-900">{tour.travelStyle}</span>
                <span className="text-xs text-gray-500">Travel Style</span>
                <Image src="/4.svg" alt="Travel Style" width={28} height={28} />
              </div>

              {/* Service Level */}
              <div className="flex flex-col items-start gap-2">
                <span className="text-sm font-semibold text-gray-900">{tour.serviceLevel}</span>
                <span className="text-xs text-gray-500">Service Level</span>
                <Image src="/5.svg" alt="Service Level" width={28} height={28} />
              </div>

              {/* Minimum Age */}
              <div className="flex flex-col items-start gap-2">
                <span className="text-sm font-semibold text-gray-900">{tour.ageRequirement.min} years</span>
                <span className="text-xs text-gray-500">Minimum Age</span>
                <Image src="/6.png" alt="Minimum Age" width={28} height={28} />
              </div>
            </div>
          </div>

          {/* Bottom layout: Highlight cards + 100+ Trees */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 h-full">
            {/* Left: Itinerary Highlight Cards */}
            <div className="flex flex-col gap-4">
              {tour.itinerary.slice(0, 2).map((day, idx) => (
                <div key={idx} className="flex-1 flex items-center gap-6 bg-[#F8F9FA] rounded-2xl p-4 transition">
                  {/* Thumbnail from tour images */}
                  <div className="relative w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] rounded-2xl overflow-hidden shrink-0">
                    <Image
                      src={tour.images[idx]?.url || tour.images[0]?.url || "/placeholder-image.jpg"}
                      alt={day.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 py-1">
                    <h3 className="text-[24px] sm:text-[28px] font-bold text-gray-900 leading-tight mb-2">{day.title}</h3>
                    <p className="text-[11px] sm:text-[12px] text-gray-600 leading-snug mb-3 max-w-lg">
                      {day.description.length > 200 ? `${day.description.substring(0, 200)}...` : day.description}
                    </p>
                    <div className="text-[11px] font-bold text-gray-900 mb-2">
                      Trees Planted this trip : {String(tour.duration.days).padStart(2, '0')}
                    </div>
                    <div>
                      <button
                        onClick={() => setActiveTab("itinerary")}
                        className="bg-[#121212] text-white text-[11px] font-medium px-5 py-1.5 rounded-full hover:bg-black transition"
                      >
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: 100+ Trees sustainability card */}
            <div className="relative rounded-2xl overflow-hidden h-full hidden lg:block">
              <Image
                src={tour.images[tour.images.length - 1]?.url || tour.images[0]?.url || "/placeholder-image.jpg"}
                alt="Sustainability"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div className="text-center mb-6">
                  <h3 className="text-[32px] sm:text-[36px] font-medium text-white mb-4">100+ Trees</h3>
                  <p className="text-white/90 text-[12px] leading-relaxed">
                    Help us spread Love around the world with trees for the Text Help us spread Love around the world with trees for the Text Help us spread Love around the world with trees for the Text Help us spread Love around.....
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/trip/${tour.slug}/${tour.tourCode}/checkout?date=${bestDealDate ? new Date(bestDealDate.startDate).toISOString().split('T')[0] : ''}`)}
                    className="flex-1 bg-white text-black py-2.5 px-4 rounded-full flex items-center justify-center gap-2 font-medium hover:bg-gray-100 transition text-[13px]"
                  >
                    <CalendarCheck size={16} />
                    Book Now
                  </button>
                  <button
                    className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-100 transition shrink-0"
                    onClick={() => router.push(`/trip/${tour.slug}/${tour.tourCode}/checkout?date=${bestDealDate ? new Date(bestDealDate.startDate).toISOString().split('T')[0] : ''}`)}
                  >
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white pt-2 pb-4">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <nav className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-2 rounded-full font-medium text-[15px] transition-all ${activeTab === "overview"
                ? "bg-[#1C1A1A] text-white border border-[#1C1A1A]"
                : "bg-white text-gray-900 border border-gray-200 hover:border-gray-300"
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("itinerary")}
              className={`px-6 py-2 rounded-full font-medium text-[15px] transition-all ${activeTab === "itinerary"
                ? "bg-[#1C1A1A] text-white border border-[#1C1A1A]"
                : "bg-white text-gray-900 border border-gray-200 hover:border-gray-300"
                }`}
            >
              Full Itinerary
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`px-6 py-2 rounded-full font-medium text-[15px] transition-all ${activeTab === "details"
                ? "bg-[#1C1A1A] text-white border border-[#1C1A1A]"
                : "bg-white text-gray-900 border border-gray-200 hover:border-gray-300"
                }`}
            >
              Trip Details
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="w-full px-4 sm:px-6 lg:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* Main Content */}
          <div>
            {(activeTab === "overview" || activeTab === "itinerary") && (
              <div className="bg-white p-2">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Itinerary Breakdown
                  </h2>
                  <button className="bg-[#1C1A1A] text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-black transition">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Itinerary
                  </button>
                </div>

                <div className={activeTab === "overview" ? "border border-gray-300 rounded-3xl p-6 shadow-sm bg-white" : "space-y-4"}>
                  {tour.itinerary.map((day, index) => {
                    const isOverview = activeTab === "overview";
                    const isLast = index === tour.itinerary.length - 1;

                    return (
                      <div
                        key={index}
                        ref={(el) => { if (el) dayRefs.current[day.day] = el; }}
                        className={
                          isOverview
                            ? (!isLast ? "border-b border-gray-200 pb-8 mb-8" : "")
                            : "border border-gray-300 rounded-3xl p-6 shadow-sm bg-white"
                        }
                      >
                        {/* Expanded State */}
                        <div className="flex items-center gap-4 mb-2">
                          <span className="border border-gray-400 text-gray-800 rounded-full px-4 py-1.5 text-xs font-semibold">Day {day.day}</span>
                          <h3 className="font-bold text-xl text-gray-900">{day.title}</h3>
                        </div>

                        <div className="mt-6">
                          {/* Descriptions & Timeline */}
                          <div>
                            <p className="text-gray-600 text-[13px] mb-8 leading-relaxed">
                              {day.description}
                            </p>

                            {(!isOverview || (day.accommodations && day.accommodations.length > 0)) && (
                              <>
                                <h4 className="font-semibold text-gray-900 mb-5 text-[15px]">Activities</h4>

                                <div className="border-l border-gray-300 ml-2 space-y-7 pt-2 pb-2 relative">
                                  {!isOverview && day.activities && day.activities.map((act, i) => (
                                    <div key={`act-${i}`} className="relative pl-6">
                                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-gray-400 rounded-full"></div>
                                      <h5 className="font-bold text-gray-900 text-[15px]">{act.name}</h5>
                                      <p className="text-gray-500 text-[11px] mt-1">{act.placeName} • {act.duration}</p>
                                      <p className="text-gray-700 text-[13px] mt-1">{act.description}</p>
                                    </div>
                                  ))}

                                  {!isOverview && day.optionalActivities && day.optionalActivities.map((act, i) => (
                                    <div key={`opt-${i}`} className="relative pl-6">
                                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-gray-400 rounded-full"></div>
                                      <div className="mb-2">
                                        <span className="bg-black text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wide">Add On</span>
                                      </div>
                                      <h5 className="font-bold text-gray-900 text-[15px]">{act.name} <span className="text-gray-600 font-normal ml-2 text-sm">+{act.price.currency}{act.price.amount.toFixed(2)}</span></h5>
                                      <p className="text-gray-500 text-[11px] mt-1">{act.place} • {act.duration}</p>
                                      <p className="text-gray-700 text-[13px] mt-1">{act.description}</p>
                                    </div>
                                  ))}

                                  {day.accommodations && day.accommodations.map((acc, i) => (
                                    <div key={`acc-${i}`} className="relative pl-6">
                                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-gray-400 rounded-full"></div>
                                      <h5 className="font-bold text-gray-900 text-[15px]">Accommodation</h5>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-gray-500 text-[11px]">{acc.name}</span>
                                        <span className="text-gray-800 text-[10px]">
                                          {/* Simple static stars for the mockup feel */}
                                          ★★★★★
                                        </span>
                                      </div>
                                      <p className="text-gray-700 text-[13px] mt-1">{acc.type}</p>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "details" && (
              <div className="bg-white  p-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Trip Details
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


            {(activeTab === "overview" || activeTab === "itinerary") && (
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
                          Trip Map
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
                    Have questions about this trip? Our travel experts are here
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

      {/* Is this tour for me? - Full Width section */}
      {activeTab === "overview" && (
        <div className="w-full px-4 sm:px-6 lg:px-10 pb-12 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
            <div>
              <h2 className="text-[28px] font-medium text-[#1A1A1A] mb-6 tracking-tight">What&apos;s Included</h2>
              <div className="border border-gray-300 rounded-[20px] bg-white overflow-hidden shadow-sm">
                {/* Tabs Header */}
                <div className="grid grid-cols-5 border-b border-gray-200">
                  {[
                    {
                      id: "activities", label: "ACTIVITIES",
                      svg: <Image src="/7.svg" alt="Activities" width={26} height={26} />
                    },
                    {
                      id: "tour_leader", label: "TRIP LEADER",
                      svg: <Image src="/8.svg" alt="Trip Leader" width={26} height={26} />
                    },
                    {
                      id: "transport", label: "TRANSPORT",
                      svg: <Image src="/9.svg" alt="Transport" width={26} height={26} />
                    },
                    {
                      id: "accommodation", label: "ACCOMMODATION",
                      svg: <Image src="/10.svg" alt="Accommodation" width={26} height={26} />
                    },
                    {
                      id: "meals", label: "MEALS",
                      svg: <Image src="/11.svg" alt="Meals" width={26} height={26} />
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      className={`flex flex-col items-center justify-center pt-8 pb-5 border-b-[3px] transition-all relative ${tourForMeTab === tab.id
                        ? "border-[#0B1D3A] z-10"
                        : "border-transparent"
                        }`}
                      onClick={() => setTourForMeTab(tab.id as any)}
                    >
                      <div className={`w-[60px] h-[60px] rounded-full flex items-center justify-center transition-colors shadow-sm ${tourForMeTab === tab.id ? "bg-black text-white" : "bg-[#AFAFAF] text-white"
                        }`}>
                        {tab.svg}
                      </div>
                      <span className={`uppercase text-[13px] font-bold mt-4 tracking-wider ${tourForMeTab === tab.id ? "text-[#0B1D3A]" : "text-[#0B1D3A]"
                        }`}>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="px-10 py-12 min-h-[300px]">
                  {tourForMeTab === "activities" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-[18px] gap-x-12">
                      {Array.from(new Map(
                        tour.itinerary.flatMap(day => [
                          ...(day.optionalActivities?.map(a => ({ name: a.name, isAddon: true })) || []),
                          ...(day.activities?.map(a => ({ name: a.name, isAddon: false })) || [])
                        ]).map(item => [item.name, item])
                      ).values()).map((act, i) => (
                        <div key={i} className="flex items-center text-[#333333] text-[15px] leading-snug">
                          {act.isAddon && (
                            <span className="bg-black text-white text-[10px] uppercase font-bold px-2 py-[2px] rounded-full mr-[12px] whitespace-nowrap">+ Add On</span>
                          )}
                          <span className={act.isAddon ? "" : "ml-0"}>{act.name}</span>
                        </div>
                      ))}
                      {tour.itinerary.flatMap(d => [...(d.activities || []), ...(d.optionalActivities || [])]).length === 0 && (
                        <p className="text-gray-500">Activities will be listed soon.</p>
                      )}
                    </div>
                  )}

                  {tourForMeTab === "tour_leader" && (
                    <div>
                      <h4 className="font-bold text-xl text-gray-900 mb-4">Staff & Experts</h4>
                      <p className="text-[#333333] leading-relaxed text-[15px]">
                        {tour.staffExperts || "Professional Group Leaders and dedicated support staff."}
                      </p>
                    </div>
                  )}

                  {tourForMeTab === "transport" && (
                    <div>
                      <h4 className="font-bold text-xl text-gray-900 mb-4">Transportation Methods</h4>
                      <p className="text-[#333333] leading-relaxed text-[15px]">
                        {tour.transportation || "Local flights, comfortable modern trains, private buses, and specialty local transport."}
                      </p>
                    </div>
                  )}

                  {tourForMeTab === "accommodation" && (
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-[18px] gap-x-12">
                        {Array.from(new Set(
                          tour.itinerary.flatMap(day => day.accommodations?.map(a => `${a.name} (${a.type})`) || [])
                        )).map((acc, i) => (
                          <div key={i} className="flex items-center text-[#333333] text-[15px]">
                            <span>{acc}</span>
                          </div>
                        ))}
                      </div>
                      {(!tour.itinerary || !tour.itinerary.some(d => d.accommodations && d.accommodations.length > 0)) && (
                        <p className="text-[#333333] leading-relaxed text-[15px]">
                          {tour.accommodation || "Standard and comfort grade local accommodations."}
                        </p>
                      )}
                    </div>
                  )}

                  {tourForMeTab === "meals" && (
                    <div>
                      <h4 className="font-bold text-xl text-gray-900 mb-4">Dining Included</h4>
                      {tour.meals ? (
                        <p className="text-[#333333] leading-relaxed text-[15px]">{tour.meals}</p>
                      ) : (
                        <p className="text-[#333333] leading-relaxed text-[15px]">
                          {tour.itinerary?.reduce((acc, day) => acc + (day.meals?.breakfast ? 1 : 0), 0) || 0} breakfasts,{" "}
                          {tour.itinerary?.reduce((acc, day) => acc + (day.meals?.lunch ? 1 : 0), 0) || 0} lunches,{" "}
                          {tour.itinerary?.reduce((acc, day) => acc + (day.meals?.dinner ? 1 : 0), 0) || 0} dinners.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Continue Your Journey Card */}
            <div className="hidden lg:flex flex-col gap-4 pt-[58px]">
              <div className="border border-gray-200 rounded-[16px] bg-white shadow-sm p-6 flex flex-col gap-4">
                <div>
                  <h3 className="text-[18px] font-bold text-[#1A1A1A] mb-2 leading-snug">Continue Your Journey</h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed">
                    Your adventure doesn&apos;t have to end here—discover another tour starting right after, from the same destination. Seamlessly extend your travel with handpicked experiences nearby.
                  </p>
                </div>
                {relatedTours.length > 0 && (() => {
                  const nextTour = relatedTours.find(t => t._id !== tour._id) || relatedTours[0];
                  return (
                    <div className="border-t border-gray-100 pt-4">
                      <div className="font-bold text-[15px] text-[#1A1A1A] mb-1">
                        Next Tour: {nextTour.location?.startCity} to {nextTour.location?.endCity}
                      </div>
                      <p className="text-[12px] text-gray-500 mb-4">
                        Duration: {nextTour.duration?.days} Days
                        {nextTour.travelStyle ? ` · ${nextTour.travelStyle}` : ""}
                        {nextTour.serviceLevel ? ` · ${nextTour.serviceLevel} stay` : ""}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/trip/${nextTour.slug}/${nextTour.tourCode}`)}
                          className="flex-1 bg-[#121212] text-white py-2.5 px-4 rounded-full flex items-center justify-center gap-2 font-medium hover:bg-black transition text-[13px]"
                        >
                          Start Exploring
                        </button>
                        <button
                          onClick={() => router.push(`/trip/${nextTour.slug}/${nextTour.tourCode}`)}
                          className="w-10 h-10 bg-[#121212] text-white rounded-full flex items-center justify-center hover:bg-black transition shrink-0"
                        >
                          <ArrowUpRight size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}









      {/* Check Availability Section - Only visible in Overview tab */}
      {activeTab === "overview" && (
        <div className="w-full px-4 sm:px-6 lg:px-10 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
            <div>
              <div className="bg-white rounded-[16px] border border-gray-300 shadow-sm overflow-hidden">
                {/* Section Header */}
                <div className="px-10 py-8">
                  <h2 className="text-[28px] text-[#1A1A1A] font-medium mb-1 tracking-tight">
                    Check Availability
                  </h2>
                  <p className="text-[#6B7280] text-[15px]">
                    Select your preferred dates and secure your spot on this trip
                  </p>

                  {/* Month Selection Slider */}
                  <div className="mt-8 relative">
                    <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar scroll-smooth">
                      {(() => {
                        const groupedByMonth: { [key: string]: typeof tour.startDates } = {};
                        tour.startDates.forEach((date) => {
                          const monthYear = new Date(date.startDate).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          });
                          if (!groupedByMonth[monthYear]) {
                            groupedByMonth[monthYear] = [];
                          }
                          groupedByMonth[monthYear].push(date);
                        });

                        const sortedMonths = Object.keys(groupedByMonth).sort(
                          (a, b) => new Date(a).getTime() - new Date(b).getTime(),
                        );

                        return sortedMonths.map((month) => {
                          const dates = groupedByMonth[month];
                          const minPrice = Math.min(...dates.map(d => {
                            const discPct = getDiscountPercentage(d.discount);
                            return tour.price.amount * (1 - discPct / 100);
                          }));
                          const isSelected = selectedMonth === month;

                          return (
                            <button
                              key={month}
                              onClick={() => setSelectedMonth(isSelected ? null : month)}
                              className={`flex flex-col items-center justify-center px-6 py-3.5 rounded-xl border transition-all min-w-[130px] shrink-0 ${isSelected
                                ? "bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-md"
                                : "bg-white border-gray-200 text-[#1A1A1A] hover:border-gray-400"
                                }`}
                            >
                              <span className={`text-[15px] font-bold ${isSelected ? "text-white" : "text-[#1A1A1A]"}`}>
                                {month}
                              </span>
                              <span className={`text-[13px] mt-0.5 ${isSelected ? "text-white/70" : "text-gray-500"}`}>
                                from ${Math.round(minPrice)}
                              </span>
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>

                {/* Availability Table */}
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    {/* Table Header */}
                    <thead>
                      <tr className="bg-[#F4F5F7] border-y border-gray-200">
                        <th className="px-10 py-[18px] text-[15px] font-bold text-[#0B1D3A]">
                          Dates
                          <div className="text-[13px] font-normal text-gray-500 mt-0.5">Start-End</div>
                        </th>
                        <th className="px-6 py-[18px] text-[15px] font-bold text-[#0B1D3A]">
                          Availability
                          <div className="text-[13px] font-normal text-gray-500 mt-0.5">Remaining Spaces</div>
                        </th>
                        <th className="px-6 py-[18px] text-[15px] font-bold text-[#0B1D3A]">
                          Price
                          <div className="text-[13px] font-normal text-gray-500 mt-0.5">Per Person</div>
                        </th>
                        <th className="px-10 py-[18px] text-[15px] font-bold text-[#0B1D3A] text-right">
                          Action
                        </th>
                      </tr>
                    </thead>

                    {/* Table Body - Grouped by Month */}
                    <tbody>
                      {tour.startDates && tour.startDates.length > 0 ? (
                        (() => {
                          const groupedByMonth: {
                            [key: string]: typeof tour.startDates;
                          } = {};

                          tour.startDates.forEach((date) => {
                            const monthYear = new Date(
                              date.startDate,
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            });
                            if (!groupedByMonth[monthYear]) {
                              groupedByMonth[monthYear] = [];
                            }
                            groupedByMonth[monthYear].push(date);
                          });

                          // Sort months chronologically
                          let sortedMonths = Object.keys(groupedByMonth).sort(
                            (a, b) => new Date(a).getTime() - new Date(b).getTime(),
                          );

                          // Filter based on selected month
                          if (selectedMonth) {
                            sortedMonths = sortedMonths.filter(m => m === selectedMonth);
                          }

                          return sortedMonths.flatMap((month, monthIndex) => {
                            const monthHeader = (
                              <tr key={`month-header-${month}`} className="bg-[#EAECEE] border-b border-gray-200">
                                <td colSpan={4} className="px-10 py-[14px] text-[13px] font-bold text-[#0B1D3A] uppercase tracking-wider">
                                  {month}
                                </td>
                              </tr>
                            );

                            const rows = groupedByMonth[month].map((date, dateIndex) => {
                              const isSoldOut = date.availableSpots === 0 || !date.isActive;
                              const originalPrice = tour.price.amount;
                              const dateDiscountPct = getDiscountPercentage(date.discount);

                              // Use the date discount
                              const bestDiscountPct = dateDiscountPct;
                              const datePrice = originalPrice * (1 - bestDiscountPct / 100);

                              return (
                                <tr key={`${month}-${dateIndex}`} className="border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                                  <td className="px-10 py-6">
                                    <div className={`text-[15px] font-medium ${isSoldOut ? "text-gray-400" : "text-[#222222]"}`}>
                                      {new Date(date.startDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                                      {" - "}
                                      {new Date(date.endDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                                    </div>
                                  </td>

                                  <td className="px-6 py-6 border-transparent">
                                    {isSoldOut ? (
                                      <span className="text-[15px] text-gray-400 font-medium">Sold Out</span>
                                    ) : (
                                      <div className="flex items-center gap-1.5 text-[15px]">
                                        <span className="font-bold text-[#222222]">{date.availableSpots}</span>
                                        <span className="text-gray-500 font-normal">Available</span>
                                      </div>
                                    )}
                                  </td>

                                  <td className="px-6 py-6">
                                    {isSoldOut ? (
                                      <span className="text-[16px] font-bold text-gray-400">${originalPrice}</span>
                                    ) : (
                                      <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[16px] font-bold text-[#1A1A1A]">${Math.round(datePrice)}</span>
                                        </div>
                                        {bestDiscountPct > 0 && (
                                          <span className="text-[13px] text-gray-500 line-through font-medium">${originalPrice}</span>
                                        )}
                                      </div>
                                    )}
                                  </td>

                                  <td className="px-10 py-6">
                                    <div className="flex items-center justify-end gap-3">
                                      {!isSoldOut && (
                                        <button
                                          onClick={() => {
                                            setHoldSelectedDate(date.startDate);
                                            setShowHoldModal(true);
                                          }}
                                          className="py-[11px] px-7 rounded-full font-bold text-[14px] bg-[#C8C8C8] hover:bg-[#B0B0B0] text-white transition-colors whitespace-nowrap"
                                        >
                                          Hold Space
                                        </button>
                                      )}
                                      <button
                                        onClick={() => {
                                          const dateStr = new Date(date.startDate).toISOString().split('T')[0];
                                          router.push(`/trip/${tour.slug}/${tour.tourCode}/checkout?date=${dateStr}`);
                                        }}
                                        disabled={isSoldOut}
                                        className={`py-[11px] px-8 rounded-full font-bold text-[14px] transition-colors whitespace-nowrap ${isSoldOut ? "bg-gray-100 text-gray-400 cursor-not-allowed hidden" : "bg-[#222222] hover:bg-black text-white shadow-sm"
                                          }`}
                                      >
                                        Book now
                                      </button>
                                      {isSoldOut && (
                                        <span className="text-sm font-medium text-gray-400">Unavailable</span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            });

                            return [monthHeader, ...rows];
                          });
                        })()
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-8 text-center text-gray-500 text-[15px]"
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
            {/* Book Privately Card */}
            <div className="hidden lg:flex flex-col sticky top-24 self-start">
              <div className="border border-gray-200 rounded-[16px] bg-white shadow-sm overflow-hidden">
                {/* Top image */}
                <div className="relative w-full h-[200px]">
                  <Image
                    src={tour.images[tour.images.length - 1]?.url || tour.images[0]?.url || "/placeholder-image.jpg"}
                    alt="Book Privately"
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Content */}
                <div className="p-5 flex flex-col gap-3">
                  <div>
                    <h3 className="text-[18px] font-bold text-[#1A1A1A] mb-1.5 leading-snug">Book Privately</h3>
                    <p className="text-[13px] text-gray-500 leading-relaxed">
                      Enjoy your journey with added privacy, comfort, and exclusive personal space.
                    </p>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => router.push(`/trip/${tour.slug}/${tour.tourCode}/checkout?date=${bestDealDate ? new Date(bestDealDate.startDate).toISOString().split('T')[0] : ''}&private=true`)}
                      className="flex-1 bg-[#121212] text-white py-2.5 px-4 rounded-full flex items-center justify-center gap-2 font-medium hover:bg-black transition text-[13px]"
                    >
                      Start Exploring
                    </button>
                    <button
                      onClick={() => router.push(`/trip/${tour.slug}/${tour.tourCode}/checkout?date=${bestDealDate ? new Date(bestDealDate.startDate).toISOString().split('T')[0] : ''}&private=true`)}
                      className="w-10 h-10 bg-[#121212] text-white rounded-full flex items-center justify-center hover:bg-black transition shrink-0"
                    >
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Reviews Section */}
      <div ref={recommendedToursRef} className="w-full px-4 sm:px-6 lg:px-10">
        <ReviewsSection />
      </div>

      {/* Popular Tours Section */}
      <div className="w-full px-4 sm:px-6 lg:px-10 pb-16">
        <PopularToursSection tours={relatedTours} />
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
                  onClick={() => router.push(`/trip/${tour.slug}/${tour.tourCode}/checkout`)}
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

      {/* Hold Space Modal */}
      {showHoldModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowHoldModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <span>🔒</span> Hold Your Space
                  </h3>
                  <p className="text-sm text-white/80 mt-1">Reserve your spot for 48 hours — no payment required</p>
                </div>
                <button
                  onClick={() => setShowHoldModal(false)}
                  className="text-white/80 hover:text-white text-2xl leading-none p-1"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Tour Info */}
              <div className="flex items-start gap-3 mb-6 pb-4 border-b border-gray-100">
                {tour?.images?.[0] && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative">
                    <Image
                      src={tour.images[0].url || "/placeholder-image.jpg"}
                      alt={tour.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{tour?.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{tour?.duration.days} days • {tour?.location.startCity} to {tour?.location.endCity}</p>
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select a departure date</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {sortedDates
                    .filter(d => d.isActive && d.availableSpots > 0 && new Date(d.startDate) > new Date())
                    .map((date, idx) => {
                      const discount = getDiscountPercentage(date.discount);
                      const dateStr = new Date(date.startDate).toISOString().split("T")[0];
                      const isSelected = holdSelectedDate === dateStr;
                      return (
                        <button
                          key={idx}
                          onClick={() => setHoldSelectedDate(dateStr)}
                          className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm ${isSelected
                            ? "border-amber-500 bg-amber-50 shadow-sm"
                            : "border-gray-200 hover:border-amber-300 hover:bg-amber-50/30"
                            }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-gray-900">
                                {new Date(date.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                {" — "}
                                {new Date(date.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {date.availableSpots} spots left
                                {discount > 0 && (
                                  <span className="ml-2 text-green-600 font-semibold">{discount}% off</span>
                                )}
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-amber-500 bg-amber-500" : "border-gray-300"
                              }`}>
                              {isSelected && <span className="text-white text-xs">✓</span>}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
                {sortedDates.filter(d => d.isActive && d.availableSpots > 0 && new Date(d.startDate) > new Date()).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No available dates for this trip</p>
                )}
              </div>

              {/* Hold Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">⏱️</span>
                  <div>
                    <p className="text-gray-700">Your space will be held for <strong>48 hours</strong> from confirmation.</p>
                    <p className="text-gray-500 text-xs mt-1">No payment required. You can convert to a booking or release anytime.</p>
                  </div>
                </div>
              </div>

              {/* Message */}
              {holdMessage && (
                <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${holdMessage.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                  {holdMessage.text}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowHoldModal(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleHoldSpace}
                  disabled={!holdSelectedDate || holdLoading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-sm hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {holdLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> Holding...
                    </span>
                  ) : (
                    "Confirm Hold"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
