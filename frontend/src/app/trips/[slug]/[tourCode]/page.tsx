"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import Image from "next/image";
import TourDetailLoading from "./loading";
import { CalendarCheck, Clock, Heart, CaretDown, Star, ArrowUpRight, Plus } from "@phosphor-icons/react";
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
  ownRoomAvailable: boolean;
  wifiAvailable?: boolean;
  price: {
    amount: number;
    currency: string;
    ownRoomPrice?: number;
    bookingType?: "Percentage" | "Amount";
    bookingPercentage?: number;
    bookingAmount?: number;
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
    importantNote?: string;
    activities: Array<{
      name?: string;
      title?: string;
      description: string;
      placeName?: string;
      location?: string;
      duration: string;
      icon: string;
      price?: number;
      isFree?: boolean;
    }>;
    optionalActivities: Array<{
      name: string;
      title?: string;
      price: number | {
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
    continent?: {
      _id: string;
      name: string;
      slug: string;
    };
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

function InclusionsList({ items, limit = 6 }: { items: string[], limit?: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayItems = isExpanded ? items : items.slice(0, limit);

  return (
    <div>
      <ul className="space-y-2 list-disc list-inside text-gray-700 text-[15px]">
        {displayItems.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      {items.length > limit && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 text-[#3b82f6] font-semibold text-[14px] flex items-center gap-1 hover:underline"
        >
          {isExpanded ? (
            <>
              Show less <CaretDown className="rotate-180" />
            </>
          ) : (
            <>
              Expand all remaining {items.length - limit} activities <CaretDown />
            </>
          )}
        </button>
      )}
    </div>
  );
}

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
  const [physicalRatings, setPhysicalRatings] = useState<any[]>([]);
  const dayRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const [showStickyFooter, setShowStickyFooter] = useState(false);
  const bookingPanelRef = useRef<HTMLDivElement>(null);
  const recommendedToursRef = useRef<HTMLDivElement>(null);

  // Hold Space state
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [showHoldAuthModal, setShowHoldAuthModal] = useState(false);
  const [holdAuthData, setHoldAuthData] = useState({ fullName: "", email: "", password: "" });
  const [isLoginView, setIsLoginView] = useState(false);
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
  const [expandedOptionalDays, setExpandedOptionalDays] = useState<number[]>([]);
  const [expandedPremiumDays, setExpandedPremiumDays] = useState<number[]>([]);

  const [showFullItineraryModal, setShowFullItineraryModal] = useState(false);
  const [expandedItineraryDays, setExpandedItineraryDays] = useState<number[]>([]);

  const toggleItineraryDay = (dayNum: number) => {
    setCurrentDay(dayNum);
    setExpandedItineraryDays(prev =>
      prev.includes(dayNum) ? prev.filter(d => d !== dayNum) : [...prev, dayNum]
    );
  };

  const scrollToModalDay = (dayNum: number) => {
    setCurrentDay(dayNum);
    setExpandedItineraryDays(prev => prev.includes(dayNum) ? prev : [...prev, dayNum]);
    setTimeout(() => {
      const element = document.getElementById(`itinerary-day-${dayNum}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 50);
  };

  const handleModalScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!tour) return;
    const viewportCenter = window.innerHeight / 2;
    let closestDay = currentDay;
    let closestDistance = Infinity;

    tour.itinerary.forEach((day) => {
      const el = document.getElementById(`itinerary-day-${day.day}`);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      
      // If the center of the viewport is within the element's bounds
      if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
        closestDay = day.day;
        closestDistance = 0;
      } else {
        // Otherwise, calculate the distance from the viewport center to the closest edge of the element
        const distanceToTop = Math.abs(rect.top - viewportCenter);
        const distanceToBottom = Math.abs(rect.bottom - viewportCenter);
        const minDistance = Math.min(distanceToTop, distanceToBottom);
        if (minDistance < closestDistance) {
          closestDistance = minDistance;
          closestDay = day.day;
        }
      }
    });

    if (closestDay !== currentDay) {
      setCurrentDay(closestDay);
    }
  };

  const toggleOptionalDay = (dayNum: number) => {
    setExpandedOptionalDays(prev =>
      prev.includes(dayNum) ? prev.filter(d => d !== dayNum) : [...prev, dayNum]
    );
  };

  const togglePremiumDay = (dayNum: number) => {
    setExpandedPremiumDays(prev =>
      prev.includes(dayNum) ? prev.filter(d => d !== dayNum) : [...prev, dayNum]
    );
  };

  useEffect(() => {
    if (tour) {
      checkWishlistStatus();
      try {
        const recentlyViewedStr = localStorage.getItem("nba-recently-viewed");
        let recentlyViewed: any[] = recentlyViewedStr ? JSON.parse(recentlyViewedStr) : [];
        recentlyViewed = recentlyViewed.filter((t: any) => t._id !== tour._id);
        const tourDataToSave = {
          _id: tour._id,
          name: tour.name,
          slug: tour.slug,
          tourCode: tour.tourCode,
          price: tour.price,
          duration: tour.duration,
          images: tour.images,
          descriptionImage: tour.descriptionImage,
          country: tour.country,
          summary: tour.summary,
          startDates: tour.startDates,
          travelStyle: tour.travelStyle,
          rating: tour.ratingsAverage || 4.8
        };
        recentlyViewed.unshift(tourDataToSave);
        recentlyViewed = recentlyViewed.slice(0, 4);
        localStorage.setItem("nba-recently-viewed", JSON.stringify(recentlyViewed));
      } catch (err) {
        console.error("Failed to save recently viewed tour:", err);
      }
    }
  }, [tour]);

  useEffect(() => {
    if (tour && tour.itinerary) {
      setExpandedItineraryDays(tour.itinerary.map(d => d.day));
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

      // Fetch physical ratings
      try {
        const prResponse = await fetch(`${api.baseURL}/physical-ratings`);
        if (prResponse.ok) {
          const prData = await prResponse.json();
          setPhysicalRatings(prData.data.physicalRatings || []);
        }
      } catch (error) {
        console.error("Failed to fetch physical ratings:", error);
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

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHoldLoading(true);

    try {
      const endpoint = isLoginView ? api.endpoints.auth.login : api.endpoints.auth.register;
      const payload = isLoginView
        ? { email: holdAuthData.email, password: holdAuthData.password }
        : {
          name: holdAuthData.fullName,
          email: holdAuthData.email,
          password: holdAuthData.password,
          passwordConfirm: holdAuthData.password,
          role: "user"
        };

      const response = await fetch(`${api.baseURL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        setShowHoldAuthModal(false);
        // Automatically proceed to hold space
        setTimeout(() => {
          handleHoldSpace();
        }, 500);
      } else {
        alert(data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Auth error:", error);
      alert("Network error. Please try again.");
    } finally {
      setHoldLoading(false);
    }
  };

  const handleHoldSpace = async () => {
    if (!holdSelectedDate || !tour) return;

    setHoldLoading(true);
    setHoldMessage(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setShowHoldModal(false);
        setShowHoldAuthModal(true);
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

  let computedBookingAmount = 200; // Default fallback
  if (tour.price.bookingType === "Percentage" && tour.price.bookingPercentage) {
    computedBookingAmount = (basePrice * tour.price.bookingPercentage) / 100;
  } else if (tour.price.bookingType === "Amount" && tour.price.bookingAmount) {
    computedBookingAmount = tour.price.bookingAmount;
  }

  // Top 2 discounted dates for list
  const topDiscountedDates = sortedDates
    .filter(d => getDiscountPercentage(d.discount) > 0)
    .slice(0, 2);

  // Get unique optional activities for "Available Extras"
  const allOptionalActivities = tour.itinerary.flatMap(day => day.optionalActivities || []);
  const uniqueOptionalActivities = Array.from(new Map(allOptionalActivities.map(act => [act.name, act])).values());

  return (
    <div className="min-h-screen">
      {/* Tour Header - Full Width */}
      <div className="bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-10 pt-10 pb-0">
          {/* Breadcrumbs */}
          <nav className="mb-6 flex items-center space-x-2 text-sm text-[#4B5563]">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <span className="text-[#9CA3AF]">/</span>
            <Link href="/destinations" className="hover:text-black transition-colors">
              Destinations
            </Link>
            {tour.country?.continent && (
              <>
                <span className="text-[#9CA3AF]">/</span>
                <Link href={`/destinations/${tour.country.continent.slug}`} className="hover:text-black transition-colors capitalize">
                  {tour.country.continent.slug}
                </Link>
              </>
            )}
            <span className="text-[#9CA3AF]">/</span>
            <Link href={`/destinations/${tour.country?.continent?.slug || "asia"}/${tour.country.slug}`} className="hover:text-black transition-colors">
              {tour.country.name}
            </Link>
            <span className="text-[#9CA3AF]">/</span>
            <span className="text-[#1F2937] font-medium">{tour.name}</span>
          </nav>

          {/* Title Row */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-[34px] md:text-[44px] lg:text-[48px] font-semibold text-[#1F2937] leading-[1.2] tracking-tight">
                {tour.name}
              </h1>
              <div className="text-[18px] md:text-[22px] text-[#4B5563] mt-2">
                {tour.duration.days} Days, {tour.location.startCity} to {tour.location.endCity}
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition" title="Share">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                <Heart size={24} weight={isInWishlist ? "fill" : "regular"} className={isInWishlist ? "text-[#E63946]" : "text-black"} />
              </button>
            </div>
          </div>

          {/* Photo Gallery + Booking Panel Grid */}
          {tour.images && tour.images.length > 0 && (
            <div className="mb-0">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
                {/* Image Gallery (left) - Airbnb-style grid */}
                <div>
                  <div className="grid grid-cols-3 min-h-148 grid-rows-2 gap-[14px]" style={{ height: '640px' }}>
                    {/* Large image - description image or first tour image */}
                    <div className="col-span-1 row-span-2 relative rounded-[16px] overflow-hidden">
                      <Image
                        src={tour.descriptionImage || tour.images[0]?.url || "/placeholder-image.jpg"}
                        alt={`${tour.name} description`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {/* Top-middle image */}
                    <div className="relative rounded-[16px] overflow-hidden">
                      <Image
                        src={tour.images[0]?.url || "/placeholder-image.jpg"}
                        alt={tour.images[0]?.caption || `${tour.name} photo 1`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {/* Top-right image */}
                    <div className="relative rounded-[16px] overflow-hidden">
                      <Image
                        src={tour.images[1]?.url || tour.images[0]?.url || "/placeholder-image.jpg"}
                        alt={tour.images[1]?.caption || `${tour.name} photo 2`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {/* Bottom-middle image */}
                    <div className="relative rounded-[16px] overflow-hidden">
                      <Image
                        src={tour.images[2]?.url || tour.images[0]?.url || "/placeholder-image.jpg"}
                        alt={tour.images[2]?.caption || `${tour.name} photo 3`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {/* Bottom-right image with +N overlay */}
                    <div className="relative rounded-[16px] overflow-hidden cursor-pointer group">
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
                <div className="flex flex-col gap-4 relative z-10">
                  <aside
                    ref={bookingPanelRef}
                    className="bg-white rounded-[16px] border border-gray-200 px-6 py-6 flex flex-col gap-4 w-full shadow-[0px_2px_15px_-3px_rgba(0,0,0,0.07),0px_10px_20px_-2px_rgba(0,0,0,0.04)]"
                  >
                    {/* Top Meta Row */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#FF1E1E] text-white text-[10px] font-bold px-3 py-1 rounded-full">
                          Bestseller
                        </span>
                        {bestDiscount > 0 && (
                          <span className="bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full">
                            Sale {bestDiscount.toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <p className="text-[14px] text-[#4B5563] font-semibold">
                        Trip Code: <span className="font-semibold">{tour.tourCode || "T-001"}</span>
                      </p>
                    </div>

                    {/* Trip Summary */}
                    <div className="pt-1 pb-2">
                      <h3 className="text-[40px] leading-[1.05] font-medium text-black tracking-[-0.02em]">
                        {tour.duration.days} Days
                      </h3>
                      <p className="text-[22px] leading-[1.2] font-medium text-black mt-1">
                        {tour.location.startCity} to {tour.location.endCity}
                      </p>
                    </div>

                    {/* Pricing Section (Moved to top for alignment) */}
                    <div className="relative pb-2">
                      <p className="text-[14px] text-gray-800 font-medium mb-1">From</p>
                      <div className="flex items-baseline justify-between mb-1">
                        <div className="flex items-start">
                          <span className="text-[20px] font-bold text-black mr-1">$</span>
                          <span className="text-[44px] font-bold text-black leading-none">{discountedPrice.toFixed(0)}</span>
                          <span className="text-[14px] font-bold text-black ml-1">USD</span>
                        </div>
                        {bestDiscount > 0 && (
                          <div className="flex items-center gap-1.5 opacity-90">
                            <span className="text-[14px] text-gray-500">Was</span>
                            <span className="text-[16px] text-gray-500 line-through">${basePrice.toFixed(0)}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-[13px] text-[#111827] mt-1.5 opacity-90">
                        Valid on <span className="font-semibold">{bestDealDate ? new Date(bestDealDate.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</span>
                      </p>
                    </div>

                    {/* Booking Amount */}
                    <div className="mt-1 flex items-center justify-between rounded-[12px] bg-[#f2f2f2] px-4 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl bg-black text-white">
                          <Star size={20} weight="fill" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[17px] font-medium text-black leading-tight">
                            Booking Amount
                          </span>
                          <span className="mt-1 text-[14px] text-gray-500 leading-tight font-normal">
                            Book your spot Now
                          </span>
                        </div>
                      </div>
                      <div className="text-[18px] font-semibold text-black tracking-tight">
                        ${computedBookingAmount.toFixed(2)}
                      </div>
                    </div>

                    {/* Reviews Stars */}
                    <div className="mt-4 mb-2 flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={22}
                            weight={star <= Math.round(tour.ratingsAverage || 5) ? "fill" : "regular"}
                            className="text-black"
                          />
                        ))}
                      </div>
                      <span className="text-[18px] font-medium text-[#64748B]">
                        ({tour.ratingsQuantity || 0} reviews)
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 pt-2">
                      <div className="flex gap-2.5 group">
                        <button
                          onClick={() => router.push(`/trips/${tour.slug}/${tour.tourCode}/checkout?date=${bestDealDate ? new Date(bestDealDate.startDate).toISOString().split('T')[0] : ''}`)}
                          className="flex-1 bg-[#111827] text-white py-[14px] px-6 rounded-full flex items-center justify-center gap-2 font-medium hover:bg-black transition text-[15px]"
                        >
                          <CalendarCheck size={18} />
                          Book Now
                        </button>
                        <button
                          className="w-[50px] h-[50px] bg-[#111827] text-white rounded-full flex items-center justify-center hover:bg-black transition shrink-0"
                          onClick={() => router.push(`/trips/${tour.slug}/${tour.tourCode}/checkout?date=${bestDealDate ? new Date(bestDealDate.startDate).toISOString().split('T')[0] : ''}`)}
                        >
                          <ArrowUpRight size={20} className="transition-transform duration-300 group-hover:rotate-45" />
                        </button>
                      </div>
                      <div className="flex gap-2.5">
                        <button
                          onClick={() => {
                            setShowHoldModal(true);
                            setHoldMessage(null);
                            setHoldSelectedDate("");
                          }}
                          className="flex-1 bg-[#4B5563] text-white py-[12px] px-4 rounded-full flex items-center justify-center gap-2 font-medium hover:bg-[#374151] transition text-[14px]"
                        >
                          <Clock size={18} />
                          Hold Space
                        </button>
                        <button
                          onClick={handleWishlistToggle}
                          className="flex-1 bg-white text-black border border-gray-300 py-[12px] px-4 rounded-full flex items-center justify-center gap-2 font-medium hover:bg-gray-50 transition text-[14px]"
                        >
                          <Heart
                            size={18}
                            weight={isInWishlist ? "fill" : "regular"}
                            className={isInWishlist ? "text-[#E63946]" : "text-black"}
                          />
                          Save to Wishlist
                        </button>
                      </div>
                    </div>
                  </aside>
                  {topDiscountedDates.length > 0 && (
                    <div className="flex flex-col gap-2.5 mt-2">
                      {topDiscountedDates.map((dateObj, idx) => {
                        const discPct = getDiscountPercentage(dateObj.discount);
                        return (
                          <div
                            key={idx}
                            className="bg-[#E5E7EB] py-3 px-5 rounded-lg flex items-center gap-3 text-[13px] font-medium text-gray-800 cursor-pointer hover:bg-gray-300 transition"
                            onClick={() => router.push(`/trips/${tour.slug}/${tour.tourCode}/checkout?date=${new Date(dateObj.startDate).toISOString().split('T')[0]}`)}
                          >
                            {discPct > 0 && (
                              <span className="bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                                Save {discPct}%
                              </span>
                            )}
                            <span className="opacity-90">
                              Departure {new Date(dateObj.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
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
        <div className="w-full px-4 sm:px-6 lg:px-10 pt-4 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
            {/* Top: Overview content */}
            <div className="mb-8">
              {/* Tour Overview heading + description */}
              <h2 className="text-[32px] md:text-[40px] font-medium text-gray-900 mb-6">Tour Overview</h2>
              <p className="text-gray-700 max-w-7xl leading-relaxed mb-1 text-lg">
                {tour.description}
              </p>

              {/* Quick Info Stats Bar */}
              <div className="flex flex-wrap items-center max-w-7xl mt-12 py-8">
                {/* Overall Rating */}
                <div className="flex-1 min-w-[140px] flex flex-col items-start pr-8 border-r border-gray-200">
                  <span className="text-base font-bold text-black mb-3">Overall Rating</span>
                  <div className="flex flex-col items-start gap-1">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 w-3 leading-none">{star}</span>
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gray-400 rounded-full"
                            style={{ width: star <= Math.round(tour.ratingsAverage) ? '100%' : '0%' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div className="flex-1 min-w-[120px] flex flex-col items-center px-4 border-r border-gray-200 text-center">
                  <div className="mb-5">
                    <Image src="/1.svg" alt="Duration" width={36} height={36} />
                  </div>
                  <span className="text-base font-bold text-black mb-1">{tour.duration.days} days</span>
                  <span className="text-xs text-gray-400 tracking-wide">Duration</span>
                </div>

                {/* Group Size */}
                <div className="flex-1 min-w-[120px] flex flex-col items-center px-4 border-r border-gray-200 text-center">
                  <div className="mb-5">
                    <Image src="/2.svg" alt="Group Size" width={36} height={36} />
                  </div>
                  <span className="text-base font-bold text-black mb-1">Max {tour.maxGroupSize} people</span>
                  <span className="text-xs text-gray-400 tracking-wide">Group Size</span>
                </div>

                {/* Physical Rating */}
                <div className="flex-1 min-w-[120px] flex flex-col items-center px-4 border-r border-gray-200 text-center">
                  <div className="mb-5">
                    <Image src="/3.svg" alt="Physical Rating" width={36} height={36} />
                  </div>
                  <span className="text-base font-bold text-black mb-1">
                    {tour.physicalRating.level}/5
                    {(() => {
                      const rating = physicalRatings.find(r => r.level === tour.physicalRating.level);
                      return rating ? ` · ${rating.name}` : "";
                    })()}
                  </span>
                  <span className="text-xs text-gray-400 tracking-wide">Physical Rating</span>
                </div>

                {/* Travel Style */}
                <div className="flex-1 min-w-[120px] flex flex-col items-center px-4 border-r border-gray-200 text-center">
                  <div className="mb-5">
                    <Image src="/4.svg" alt="Travel Style" width={36} height={36} />
                  </div>
                  <span className="text-base font-bold text-black mb-1">{tour.travelStyle}</span>
                  <span className="text-xs text-gray-400 tracking-wide">Travel Style</span>
                </div>

                {/* Service Level */}
                <div className="flex-1 min-w-[120px] flex flex-col items-center px-4 border-r border-gray-200 text-center">
                  <div className="mb-5">
                    <Image src="/5.svg" alt="Service Level" width={36} height={36} />
                  </div>
                  <span className="text-base font-bold text-black mb-1">{tour.serviceLevel}</span>
                  <span className="text-xs text-gray-400 tracking-wide">Service Level</span>
                </div>

                {/* Age Requirements */}
                <div className="flex-1 min-w-[120px] flex flex-col items-center px-4 text-center">
                  <div className="mb-5">
                    <Image src="/6.png" alt="Age Requirements" width={36} height={36} />
                  </div>
                  <span className="text-base font-bold text-black mb-1">{tour.ageRequirement.min} years</span>
                  <span className="text-xs text-gray-400 tracking-wide">Age Requirements</span>
                </div>
              </div>

              {/* Tour Highlights */}
              {tour.highlights && tour.highlights.length > 0 && (
                <div className="mt-12 p-8 bg-gray-50/50 border border-gray-100 rounded-[24px]">
                  <h3 className="text-[22px] font-bold text-gray-900 mb-6 flex items-center gap-2.5">
                    <svg className="w-6 h-6 text-[#1A1A1A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Tour Highlights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {tour.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0 mt-2.5"></span>
                        <p className="text-[15px] font-medium text-gray-700 leading-relaxed">
                          {highlight}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Empty Right Column spacer */}
            <div className="hidden lg:block w-[400px]"></div>
          </div>

          {/* Bottom layout: Highlight cards + 100+ Trees */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 h-[400px]">
            {/* Left: Itinerary Highlight Cards */}
            <div className="flex flex-col gap-6 h-full">
              {[0, 1].map((idx) => (
                <div key={idx} className="flex-1 flex items-center gap-6 bg-[#F6F6F6] rounded-[24px] p-6 lg:px-8 py-5 transition">
                  {/* Thumbnail */}
                  <div className="relative w-[130px] h-[130px] sm:w-[145px] sm:h-[145px] rounded-[16px] overflow-hidden shrink-0">
                    <Image
                      src={tour.images[idx]?.url || tour.images[0]?.url || "/placeholder-image.jpg"}
                      alt="Highlight"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 py-1">
                    <h3 className="text-[28px] sm:text-[32px] font-semibold text-[#111827] leading-tight mb-1">Heading</h3>
                    <p className="text-[13px] text-[#4B5563] leading-snug mb-1 max-w-lg">
                      Help us spread love around the world for days. together with Planterra. we'll plant one tree in our name for every travel day.
                    </p>
                    <div className="text-[13px] font-medium text-[#111827] mb-2">
                      Trees Planted this trip : 08
                    </div>
                    <div>
                      <button
                        onClick={() => setActiveTab("itinerary")}
                        className="bg-[#111827] text-white text-[13px] font-medium px-5 py-2 rounded-full hover:bg-black transition"
                      >
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: 100+ Trees sustainability card */}
            <div className="relative rounded-[24px] overflow-hidden w-full h-[400px] hidden lg:block">
              <Image
                src={tour.images[tour.images.length - 1]?.url || tour.images[0]?.url || "/placeholder-image.jpg"}
                alt="Sustainability"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6">
                <div className="mt-auto flex flex-col items-center">
                  <h3 className="text-[36px] sm:text-[42px] font-semibold text-white mb-4">100+ Trees</h3>
                  <p className="text-white/95 text-[14px] leading-relaxed mb-8 max-w-[320px]">
                    Help us spread Love around the world with trees for the Text Help us spread Love around the world with trees for the TextHelp us spread Love around the world with trees for the TextHelp us spread Love around....
                  </p>
                </div>
                <div className="flex gap-2.5 w-full mt-2 group">
                  <button
                    onClick={() => router.push(`/trips/${tour.slug}/${tour.tourCode}/checkout?date=${bestDealDate ? new Date(bestDealDate.startDate).toISOString().split('T')[0] : ''}`)}
                    className="flex-1 bg-white text-black py-3.5 px-6 rounded-full flex items-center justify-center gap-2 font-semibold hover:bg-gray-100 transition text-[15px]"
                  >
                    <CalendarCheck size={18} weight="bold" />
                    Book Now
                  </button>
                  <button
                    className="w-[52px] h-[52px] bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-100 transition shrink-0"
                    onClick={() => router.push(`/trips/${tour.slug}/${tour.tourCode}/checkout?date=${bestDealDate ? new Date(bestDealDate.startDate).toISOString().split('T')[0] : ''}`)}
                  >
                    <ArrowUpRight size={20} weight="bold" className="transition-transform duration-300 group-hover:rotate-45" />
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
              onClick={() => setShowFullItineraryModal(true)}
              className="px-6 py-2 rounded-full font-medium text-[15px] transition-all bg-white text-gray-900 border border-gray-200 hover:border-gray-300"
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
            {(activeTab === "overview") && (
              <div className="bg-white">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-[32px] md:text-[40px] font-medium text-gray-900">
                    Itinerary
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
                          <h3 className="font-bold text-xl text-gray-900">
                            {day.title ? (
                              day.title.split(",").filter(t => t.trim()).length > 1
                                ? `${day.title.split(",").filter(t => t.trim())[0]} to ${day.title.split(",").filter(t => t.trim())[1]}`
                                : day.title.split(",").filter(t => t.trim())[0]
                            ) : "Itinerary"}
                          </h3>
                        </div>

                        {!isOverview && day.importantNote && day.importantNote.trim() && (
                          <div className="mt-3 mb-4 p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-2.5">
                            <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="8" x2="12" y2="12" />
                              <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <div>
                              <span className="text-[12px] font-bold text-amber-800 uppercase tracking-wider block mb-0.5">Important note</span>
                              <p className="text-[13.5px] font-medium text-amber-900 leading-relaxed">
                                {day.importantNote}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="mt-6">
                          {/* Descriptions & Timeline */}
                          <div>
                            <p className="text-gray-600 text-[13px] mb-8 leading-relaxed">
                              {day.description}
                            </p>

                            {/* Premium Inclusions for Overview */}
                            {isOverview && (() => {
                              const premiumActivities = (day.activities || []).filter((act: any) => {
                                const hasPrice = (typeof act.price === 'number' && act.price > 0) || (act.price && typeof act.price === 'object' && act.price.amount > 0);
                                return hasPrice && !act.isFree;
                              });
                              if (premiumActivities.length === 0) return null;
                              return (
                                <div className="mt-2 mb-4">
                                  <div
                                    className="flex justify-between items-center mb-5 cursor-pointer w-full group"
                                    onClick={() => togglePremiumDay(day.day)}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-[12px] font-bold shrink-0">
                                        {premiumActivities.length}
                                      </div>
                                      <h4 className="font-semibold text-gray-900 text-[15px] flex items-center gap-2">
                                        Premium Inclusions in Day {day.day}
                                        <svg
                                          className={`w-4 h-4 transform transition-transform ${expandedPremiumDays.includes(day.day) ? 'rotate-180' : ''}`}
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </h4>
                                    </div>
                                    <span className="text-[13px] font-bold text-gray-500 group-hover:text-black transition-colors shrink-0">
                                      {expandedPremiumDays.includes(day.day) ? 'Hide' : 'Show'}
                                    </span>
                                  </div>
                                  {expandedPremiumDays.includes(day.day) && (
                                    <div className="ml-2 space-y-7 relative transition-all duration-300">
                                      {premiumActivities.map((act: any, i: number) => (
                                        <div key={`premium-${i}`} className="relative pl-6">
                                          <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-gray-400 rounded-full z-[1]"></div>
                                          {premiumActivities.length > 1 && i < premiumActivities.length - 1 && (
                                            <div className="absolute left-[-1px] top-[10px] w-px bg-gray-300" style={{ bottom: '-38px' }}></div>
                                          )}
                                          <div className="flex justify-between items-center">
                                            <h5 className="font-bold text-gray-900 text-[15px]">
                                              {act.name || act.title}
                                            </h5>
                                            <span className="text-gray-900 font-bold text-[12px] shrink-0 ml-4">
                                              {act.placeName || act.location ? `${act.placeName || act.location}` : ''}
                                              {act.duration ? `${(act.placeName || act.location) ? ', ' : ''}${act.duration} hrs` : ''}
                                            </span>
                                          </div>
                                          <p className="text-gray-700 text-[13px] mt-2 leading-relaxed">{act.description}</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                            {!isOverview && (
                              <>
                                {(() => {
                                  const timelineActivities = (!isOverview || (day.activities && day.activities.length > 0)) && day.activities ? day.activities : [];
                                  const allItems = [
                                    ...timelineActivities.map((act: any, i: number) => ({ type: 'activity' as const, data: act, key: `act-${i}` })),
                                  ];
                                  const totalItems = allItems.length;
                                  return (
                                    <div className="ml-2 space-y-7 relative">
                                      {allItems.map((item, idx) => {
                                        const isLastItem = idx === totalItems - 1;
                                        const showConnector = totalItems > 1 && !isLastItem;
                                        const act = item.data;
                                        return (
                                          <div key={item.key} className="relative pl-6">
                                            <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-gray-400 rounded-full z-[1]"></div>
                                            {showConnector && (
                                              <div className="absolute left-[-1px] top-[10px] w-px bg-gray-300" style={{ bottom: '-38px' }}></div>
                                            )}
                                            <div className="flex justify-between items-center">
                                              <h5 className="font-bold text-gray-900 text-[15px]">
                                                {act.name || act.title}
                                              </h5>
                                              <span className="text-gray-900 font-bold text-[12px] shrink-0 ml-4">
                                                {act.placeName || act.location}{act.duration ? `, ${act.duration} hrs` : ''}
                                              </span>
                                            </div>
                                            <p className="text-gray-700 text-[13px] mt-2 leading-relaxed">{act.description}</p>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  );
                                })()}

                                {/* Optional Activities for this day - OUTSIDE activities/accommodations timeline, EXACT SAME UI as activities */}
                                {day.optionalActivities && day.optionalActivities.length > 0 && (
                                  <div className="mt-8">
                                    <div
                                      className="flex justify-between items-center mb-5 cursor-pointer w-full group"
                                      onClick={() => toggleOptionalDay(day.day)}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-[12px] font-bold shrink-0">
                                          {day.optionalActivities.length}
                                        </div>
                                        <h4 className="font-semibold text-gray-900 text-[15px] flex items-center gap-2">
                                          Optional activities in Day {day.day}
                                          <svg
                                            className={`w-4 h-4 transform transition-transform ${expandedOptionalDays.includes(day.day) ? 'rotate-180' : ''}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                          </svg>
                                        </h4>
                                      </div>
                                      <span className="text-[13px] font-bold text-gray-500 group-hover:text-black transition-colors shrink-0">
                                        {expandedOptionalDays.includes(day.day) ? 'Hide' : 'Show'}
                                      </span>
                                    </div>
                                    {expandedOptionalDays.includes(day.day) && (
                                      <div className="ml-2 space-y-7 relative transition-all duration-300">
                                        {day.optionalActivities.map((act: any, i) => (
                                          <div key={`opt-${i}`} className="relative pl-6">
                                            <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-gray-400 rounded-full z-[1]"></div>
                                            {day.optionalActivities.length > 1 && i < day.optionalActivities.length - 1 && (
                                              <div className="absolute left-[-1px] top-[10px] w-px bg-gray-300" style={{ bottom: '-38px' }}></div>
                                            )}
                                            <div className="flex justify-between items-center">
                                              <h5 className="font-bold text-gray-900 text-[15px]">
                                                {act.name || act.title}
                                                {(() => {
                                                  let priceStr = "";
                                                  if (typeof act.price === "number") {
                                                    priceStr = act.price > 0 ? `$${Number(act.price).toLocaleString()}` : "Free";
                                                  } else if (act.price && typeof act.price.amount === "number") {
                                                    priceStr = Number(act.price.amount) > 0
                                                      ? `${act.price.currency || "$"}${Number(act.price.amount).toLocaleString()}`
                                                      : "Free";
                                                  }
                                                  return priceStr ? `, ${priceStr}` : "";
                                                })()}
                                              </h5>
                                              <span className="text-gray-900 font-bold text-[12px] shrink-0 ml-4">
                                                {act.placeName || act.location || act.place ? `${act.placeName || act.location || act.place}` : ''}
                                                {act.duration ? `${(act.placeName || act.location || act.place) ? ', ' : ''}${act.duration} hrs` : ''}
                                              </span>
                                            </div>
                                            <p className="text-gray-700 text-[13px] mt-2 leading-relaxed">{act.description}</p>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Accommodations Section */}
                                {!isOverview && day.accommodations && day.accommodations.length > 0 && (
                                  <div className="mt-6">
                                    <h4 className="font-semibold text-gray-900 text-[15px] mb-2">Accommodation</h4>
                                    <div className="space-y-2 ml-2">
                                      {day.accommodations.map((acc: any, idx: number) => (
                                        <div key={idx} className="relative pl-6">
                                          <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-gray-400 rounded-full z-[1]"></div>
                                          <div className="flex justify-between items-center">
                                            <h5 className="font-bold text-gray-900 text-[15px]">
                                              {acc.name || acc.type}
                                            </h5>
                                            {acc.name && acc.type && (
                                              <span className="text-gray-900 font-bold text-[12px] shrink-0 ml-4">
                                                {acc.type}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Meals Section */}
                                {day.meals && (
                                  (() => {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    const m = day.meals as any;
                                    const hasMeals = typeof m === 'string'
                                      ? (m.trim().length > 0)
                                      : (m.breakfast || m.lunch || m.dinner);

                                    if (!hasMeals) return null;

                                    return (
                                      <div className="mt-4">
                                        <h4 className="font-semibold text-gray-900 text-[15px] mb-2">Meals Included</h4>
                                        <div className="flex gap-2">
                                          {typeof m === 'string' ? (
                                            m.split(',').map((meal: string, idx: number) => (
                                              meal.trim() && (
                                                <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                                                  {meal.trim()}
                                                </span>
                                              )
                                            ))
                                          ) : (
                                            <>
                                              {m.breakfast && (
                                                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">Breakfast</span>
                                              )}
                                              {m.lunch && (
                                                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">Lunch</span>
                                              )}
                                              {m.dinner && (
                                                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">Dinner</span>
                                              )}
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })()
                                )}
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
                <h2 className="text-[32px] md:text-[40px] font-medium text-gray-900 mb-8">
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
                        {tour.itinerary[currentDay - 1].title ? (
                          tour.itinerary[currentDay - 1].title.split(",").filter(t => t.trim()).length > 1
                            ? `${tour.itinerary[currentDay - 1].title.split(",").filter(t => t.trim())[0]} to ${tour.itinerary[currentDay - 1].title.split(",").filter(t => t.trim())[1]}`
                            : tour.itinerary[currentDay - 1].title.split(",").filter(t => t.trim())[0]
                        ) : "Itinerary"}
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
              <h2 className="text-[32px] md:text-[40px] font-medium text-gray-900 mb-8 tracking-tight">Inclusions and activities</h2>
              <div className="bg-white rounded-[24px] p-8 md:p-12 shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                  {/* Left Column: Categories */}
                  <div className="space-y-10">
                    {/* Destinations */}
                    <div className="flex gap-4">
                      <div className="mt-1 shrink-0">
                        <svg className="w-6 h-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-[17px] font-bold text-gray-900 mb-2">Destinations</h3>
                        <Link
                          href={`/destinations/${tour.country.slug}`}
                          className="text-[#3b82f6] hover:underline text-[15px] font-medium"
                        >
                          {tour.country.name}
                        </Link>
                      </div>
                    </div>

                    {/* Meals */}
                    <div className="flex gap-4">
                      <div className="mt-1 shrink-0">
                        <svg className="w-6 h-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 8V6a2 2 0 00-2-2H4a2 2 0 00-2 2v7a2 2 0 002 2h8" />
                          <path d="M18 8h3a1 1 0 011 1v5a2 2 0 01-2 2h-7a2 2 0 01-2-2v-3" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-[17px] font-bold text-gray-900 mb-2">Meals</h3>
                        <p className="text-gray-700 text-[15px] leading-relaxed">
                          {tour.meals || (
                            `${tour.itinerary?.reduce((acc, day) => {
                              const m = day.meals as any;
                              if (!m || typeof m === 'string') return acc;
                              return acc + (m.breakfast ? 1 : 0);
                            }, 0) || 0} breakfasts, ` +
                            `${tour.itinerary?.reduce((acc, day) => {
                              const m = day.meals as any;
                              if (!m || typeof m === 'string') return acc;
                              return acc + (m.lunch ? 1 : 0);
                            }, 0) || 0} lunches, ` +
                            `${tour.itinerary?.reduce((acc, day) => {
                              const m = day.meals as any;
                              if (!m || typeof m === 'string') return acc;
                              return acc + (m.dinner ? 1 : 0);
                            }, 0) || 0} dinners`
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Transport */}
                    <div className="flex gap-4">
                      <div className="mt-1 shrink-0">
                        <svg className="w-6 h-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="7" y="13" width="10" height="8" rx="2" />
                          <path d="M7 17H2m15 0h5M9 6h6l2 7H7l2-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-[17px] font-bold text-gray-900 mb-2">Transport</h3>
                        <p className="text-gray-700 text-[15px] leading-relaxed">
                          {tour.transportation || "Private Vehicle, Train, Boat, Plane"}
                        </p>
                      </div>
                    </div>

                    {/* Accommodation */}
                    <div className="flex gap-4">
                      <div className="mt-1 shrink-0">
                        <svg className="w-6 h-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-[17px] font-bold text-gray-900 mb-2">Accommodation</h3>
                        <p className="text-gray-700 text-[15px] leading-relaxed">
                          {tour.accommodation || (
                            Array.from(new Set(
                              tour.itinerary.flatMap(day => day.accommodations?.map(a => a.type) || [])
                            )).join(", ") || "Hotel, Guesthouse"
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Wifi Availability */}
                    <div className="flex gap-4 mt-6">
                      <div className="mt-1 shrink-0">
                        <svg className="w-6 h-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12.55a11 11 0 0114.08 0" />
                          <path d="M1.42 9a16 16 0 0121.16 0" />
                          <path d="M8.53 16.11a6 6 0 016.94 0" />
                          <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-[17px] font-bold text-gray-900 mb-2">Wifi Availability</h3>
                        <p className="text-gray-700 text-[15px] leading-relaxed flex items-center gap-2">
                          {tour.wifiAvailable ? (
                            <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1.5 border border-emerald-100">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                              Yes, Free WiFi Included
                            </span>
                          ) : (
                            <span className="text-sm font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded flex items-center gap-1.5 border border-gray-100">
                              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                              No WiFi Available
                            </span>
                          )}
                        </p>
                      </div>
                    </div>


                  </div>

                  {/* Right Column: Included activities (All free and paid) */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <svg className="w-6 h-6 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <h3 className="text-[20px] font-bold text-gray-900">Included activities</h3>
                    </div>

                    {(() => {
                      const allActs = Array.from(new Set([
                        ...tour.itinerary.flatMap(day => day.activities?.map(a => a.name || a.title) || []),
                        ...tour.itinerary.flatMap(day => day.optionalActivities?.map(a => a.name) || [])
                      ])).filter(Boolean);

                      return (
                        <div className="mb-10">
                          {allActs.length > 0 ? (
                            <InclusionsList items={allActs as string[]} limit={6} />
                          ) : (
                            <p className="text-gray-500 text-[14px]">No Included activities listed for this trip.</p>
                          )}
                        </div>
                      );
                    })()}

                    {/* Premium Inclusions */}
                    {(() => {
                      const premiumInclusions = Array.from(new Set(
                        tour.itinerary.flatMap(day =>
                          (day.activities || [])
                            .filter(a => a && !a.isFree && typeof a.price === "number" && a.price > 0)
                            .map(a => a.title || a.name) || []
                        )
                      )).filter(Boolean);

                      return (
                        <div className="mb-10">
                          <div className="flex items-center gap-3 mb-6">
                            <img src="/premium_inclusion.svg" className="w-6 h-6 object-contain" alt="Premium Inclusions" />
                            <h3 className="text-[20px] font-bold text-gray-900">Premium Inclusions</h3>
                          </div>
                          {premiumInclusions.length > 0 ? (
                            <InclusionsList items={premiumInclusions as string[]} limit={3} />
                          ) : (
                            <p className="text-gray-500 text-[14px]">No premium inclusions listed for this trip.</p>
                          )}
                        </div>
                      );
                    })()}

                    {/* Optional activities */}
                    {(() => {
                      const optionalActivities = Array.from(new Set(
                        tour.itinerary.flatMap(day => day.optionalActivities?.map(a => {
                          const name = a.name || a.title;
                          if (!name) return null;

                          let priceStr = "";
                          if (typeof a.price === "number") {
                            priceStr = a.price > 0 ? ` - From $${Number(a.price).toLocaleString()} USD` : " - Free";
                          } else if (a.price && typeof a.price.amount === "number") {
                            priceStr = Number(a.price.amount) > 0
                              ? ` - From $${Number(a.price.amount).toLocaleString()} USD`
                              : " - Free";
                          }

                          return `${name}${priceStr}`;
                        }) || [])
                      )).filter(Boolean);

                      return (
                        <div>
                          <div className="flex items-center gap-3 mb-6">
                            <svg className="w-6 h-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            <h3 className="text-[20px] font-bold text-gray-900">Optional activities</h3>
                          </div>
                          {optionalActivities.length > 0 ? (
                            <InclusionsList items={optionalActivities as string[]} limit={4} />
                          ) : (
                            <p className="text-gray-500 text-[14px]">No optional activities listed for this trip.</p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Available Extras Section */}
              <div className="mt-14">
                <div className="flex flex-wrap items-baseline gap-3 mb-8">
                  <h2 className="text-[32px] md:text-[40px] font-medium text-gray-900 tracking-tight">Add-ons</h2>
                  <p className="text-gray-500 text-[18px] md:text-[22px] font-medium">(add this to your tour when you book)</p>
                </div>

                <div className="space-y-4">
                  {tour?.price?.ownRoomPrice ? (
                    <div className="border border-gray-200 rounded-[12px] p-6 bg-white">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center shrink-0">
                          <Plus size={16} weight="bold" className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline mb-1">
                            <h3 className="text-[18px] font-bold text-gray-900 mr-2">My Own Room</h3>
                            <span className="text-gray-500 text-[16px] mr-1">- From</span>
                            <span className="text-[18px] font-bold text-gray-900">${tour.price.ownRoomPrice.toFixed(0)}</span>
                          </div>
                          <p className="text-gray-600 text-[14px] leading-relaxed">
                            If you&apos;re travelling solo and would prefer to have your own private room throughout your trip,<br />select this option during the online booking process.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-4">No single supplement available</div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Continue Your Journey Card */}
            <div className="hidden lg:flex flex-col gap-4 mt-[80px]">
              <div className="border border-gray-300 rounded-[20px] bg-white shadow-sm p-8 flex flex-col gap-6">
                <div>
                  <h3 className="text-[26px] font-medium text-gray-900 mb-3 leading-snug">Continue Your Journey</h3>
                  <p className="text-[14px] text-gray-700 leading-relaxed max-w-[95%]">
                    Your adventure doesn&apos;t have to end here—discover another tour starting right after, from the same destination. Seamlessly extend your travel with handpicked experiences nearby.
                  </p>
                </div>
                {relatedTours.length > 0 && (() => {
                  const nextTour = relatedTours.find(t => t._id !== tour._id) || relatedTours[0];
                  return (
                    <div className="border-t border-gray-200 pt-6 mt-1">
                      <div className="font-medium text-[20px] text-gray-900 mb-2 leading-tight pr-4">
                        Next Tour: {nextTour.location?.startCity} to {nextTour.location?.endCity} Escape
                      </div>
                      <p className="text-[13px] text-gray-600 mb-6">
                        Duration: {nextTour.duration?.days} Days
                        {nextTour.travelStyle ? ` · ${nextTour.travelStyle}` : ""}
                        {nextTour.serviceLevel ? ` · ${nextTour.serviceLevel} stay` : ""}
                      </p>
                      <div className="flex gap-2 group">
                        <button
                          onClick={() => router.push(`/trips/${nextTour.slug}/${nextTour.tourCode}`)}
                          className="px-6 bg-[#121212] text-white py-3 rounded-full flex items-center justify-center gap-2 font-medium hover:bg-black transition text-[15px]"
                        >
                          Start Exploring
                        </button>
                        <button
                          onClick={() => router.push(`/trips/${nextTour.slug}/${nextTour.tourCode}`)}
                          className="w-[48px] h-[48px] bg-[#121212] text-white rounded-full flex items-center justify-center hover:bg-black transition shrink-0"
                        >
                          <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:rotate-45" />
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
                  <h2 className="text-[32px] md:text-[40px] text-gray-900 font-medium mb-3 tracking-tight">
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
                                : "bg-white border-gray-200 text-[#1A1A1A] hover:bg-[#F3F4F6] hover:border-gray-300"
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

                                  <td className="px-6 py-6 min-w-[200px]">
                                    {isSoldOut ? (
                                      <span className="text-[20px] font-bold text-gray-300">${originalPrice}</span>
                                    ) : (
                                      <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                          <span className="text-[24px] font-bold text-[#0B1D3A] leading-tight tracking-tight">${Math.round(datePrice)}</span>
                                          {bestDiscountPct > 0 && (
                                            <span className="text-[14px] text-gray-400 line-through mt-0.5">${originalPrice}</span>
                                          )}
                                        </div>
                                        {bestDiscountPct > 0 && (
                                          <div className="bg-black text-white px-3.5 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap self-start mt-1 shadow-sm">
                                            Save {bestDiscountPct}%
                                          </div>
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
                                          router.push(`/trips/${tour.slug}/${tour.tourCode}/checkout?date=${dateStr}`);
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
                  <div className="flex gap-2 mt-1 group">
                    <button
                      onClick={() => router.push(`/trips/${tour.slug}/${tour.tourCode}/checkout?date=${bestDealDate ? new Date(bestDealDate.startDate).toISOString().split('T')[0] : ''}&private=true`)}
                      className="flex-1 bg-[#121212] text-white py-2.5 px-4 rounded-full flex items-center justify-center gap-2 font-medium hover:bg-black transition text-[13px]"
                    >
                      Start Exploring
                    </button>
                    <button
                      onClick={() => router.push(`/trips/${tour.slug}/${tour.tourCode}/checkout?date=${bestDealDate ? new Date(bestDealDate.startDate).toISOString().split('T')[0] : ''}&private=true`)}
                      className="w-10 h-10 bg-[#121212] text-white rounded-full flex items-center justify-center hover:bg-black transition shrink-0"
                    >
                      <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:rotate-45" />
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
                  onClick={() => router.push(`/trips/${tour.slug}/${tour.tourCode}/checkout`)}
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

      {/* Hold Auth Modal */}
      {showHoldAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowHoldAuthModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <span>{isLoginView ? "Sign In" : "Create Account"}</span>
                  </h3>
                  <p className="text-sm text-white/80 mt-1">
                    {isLoginView ? "Sign in to hold your space" : "Create an account to start managing travels"}
                  </p>
                </div>
                <button
                  onClick={() => setShowHoldAuthModal(false)}
                  className="text-white/80 hover:text-white text-2xl leading-none p-1"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Body */}
            <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
              {!isLoginView && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                    value={holdAuthData.fullName}
                    onChange={(e) => setHoldAuthData({ ...holdAuthData, fullName: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                  value={holdAuthData.email}
                  onChange={(e) => setHoldAuthData({ ...holdAuthData, email: e.target.value })}
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                  value={holdAuthData.password}
                  onChange={(e) => setHoldAuthData({ ...holdAuthData, password: e.target.value })}
                  placeholder={isLoginView ? "Enter your password" : "Create a password"}
                />
              </div>

              <button
                type="submit"
                disabled={holdLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 shadow-md"
              >
                {holdLoading ? "Processing..." : (isLoginView ? "Sign In" : "Create Account")}
              </button>

              <div className="text-center text-sm text-gray-600 mt-4">
                {isLoginView ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setIsLoginView(!isLoginView)}
                  className="text-purple-600 font-semibold hover:underline"
                >
                  {isLoginView ? "Register here" : "Sign in here"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Full Itinerary Modal */}
      {showFullItineraryModal && (
        <div 
          onScroll={handleModalScroll} 
          className="fixed inset-0 z-[100] bg-[#F3F8FF] overflow-y-auto pb-20"
        >
          {/* Sticky Header */}
          <div className="sticky top-0 z-[101] bg-[#F3F8FF] pt-8 pb-6 px-6 lg:px-10 flex items-center justify-between border-b border-gray-200/50">
            <div className="flex flex-col">
              <span className="text-[15px] md:text-[17px] text-[#4B5563] font-medium leading-snug">
                {tour.name}
              </span>
              <span className="text-[13px] md:text-[14px] text-gray-500 font-normal mt-0.5">
                {tour.duration.days} Days, {tour.location.startCity} to {tour.location.endCity}
              </span>
              <h2 className="text-[32px] md:text-[40px] font-semibold text-black tracking-tight mt-2">
                Itinerary Breakdown
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <button className="bg-[#1C1A1A] text-white pl-4 pr-1.5 py-1.5 rounded-full text-[13px] font-semibold flex items-center gap-2 hover:bg-black transition hidden sm:flex">
                <svg className="w-4 h-4 text-white ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="ml-1 mr-1">Download Itinerary</span>
                <span className="bg-[#A855F7] w-7 h-7 rounded-full flex items-center justify-center">
                  <ArrowUpRight size={14} className="text-white" weight="bold" />
                </span>
              </button>
              <button
                onClick={() => setShowFullItineraryModal(false)}
                className="w-12 h-12 bg-[#A855F7] text-white rounded-full flex items-center justify-center hover:bg-[#9333EA] transition shadow-lg shrink-0"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="w-full px-6 lg:px-10 mt-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_30%] gap-8 items-start">
              {/* Left Side: Accordion */}
              <div className="space-y-4">
                {tour.itinerary.map((day, index) => {
                  const isExpanded = expandedItineraryDays.includes(day.day);
                  return (
                    <div
                      id={`itinerary-day-${day.day}`}
                      key={day.day}
                      className="bg-white border-2 rounded-[24px] overflow-hidden transition-colors"
                      style={{ borderColor: isExpanded ? '#c7c7c7ff' : '#E5E7EB' }}
                    >
                      <div className="p-6">
                        <div
                          className="flex items-center justify-between cursor-pointer group"
                          onClick={() => toggleItineraryDay(day.day)}
                        >
                          <div className="flex items-center gap-4">
                            <span className="border text-black rounded-full px-4 py-1.5 text-[15px] font-medium" style={{ borderColor: '#c7c7c7ff' }}>Day {day.day}</span>
                            <h3 className="font-medium text-[20px] text-black transition-colors">
                              {day.title || "Itinerary"}
                            </h3>
                          </div>
                          <CaretDown className={`text-black transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>

                        {isExpanded && (
                          <div className="mt-5 pl-1 pr-4">
                            {day.importantNote && day.importantNote.trim() && (
                              <div className="mb-6 p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-3 shadow-sm">
                                <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <circle cx="12" cy="12" r="10" />
                                  <line x1="12" y1="8" x2="12" y2="12" />
                                  <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <div>
                                  <span className="text-[12px] font-bold text-amber-800 uppercase tracking-wider block mb-0.5">Important note</span>
                                  <p className="text-[14px] font-medium text-amber-900 leading-relaxed">
                                    {day.importantNote}
                                  </p>
                                </div>
                              </div>
                            )}

                            <p className="text-black text-[16px] mb-8 leading-relaxed">
                              {day.description}
                            </p>

                            {/* Activities */}
                            {day.activities && day.activities.length > 0 && (
                              <div className="space-y-6 relative ml-1">
                                {day.activities.map((act, i) => (
                                  <div key={i} className="relative pl-6">
                                    {i !== day.activities.length - 1 && (
                                      <div className="absolute left-[3px] top-[14px] bottom-[-24px] w-0 border-l-[1.5px] border-dotted border-gray-300"></div>
                                    )}
                                    <div className="absolute left-[0px] top-[7px] w-[7px] h-[7px] bg-[#A855F7] rounded-full z-10"></div>
                                    <div className="flex justify-between items-center">
                                      <h5 className="font-medium text-black text-[17px]">
                                        {act.name || act.title}
                                      </h5>
                                      <span className="text-black text-[14px] shrink-0 ml-4 font-medium">
                                        {act.placeName || act.location}{act.duration ? `  ${act.duration}hrs` : ''}
                                      </span>
                                    </div>
                                    <p className="text-black text-[15px] mt-1.5 leading-relaxed max-w-3xl">{act.description}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Optional Activities */}
                            {day.optionalActivities && day.optionalActivities.length > 0 && (
                              <div className="mt-8 border-t border-gray-100 pt-6">
                                <div className="flex items-center justify-between mb-6 cursor-pointer group" onClick={() => toggleOptionalDay(day.day)}>
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-[14px] font-bold shrink-0">
                                      +{day.optionalActivities.length}
                                    </div>
                                    <h4 className="font-medium text-black text-[17px]">Optional Activities - Day {day.day}</h4>
                                  </div>
                                  <div className="text-black text-[15px] flex items-center gap-1 transition-colors">
                                    {expandedOptionalDays.includes(day.day) ? 'Hide' : 'Show'} <CaretDown className={`transition-transform ${expandedOptionalDays.includes(day.day) ? 'rotate-180' : ''}`} />
                                  </div>
                                </div>

                                {expandedOptionalDays.includes(day.day) && (
                                  <div className="space-y-6 relative ml-1">
                                    {day.optionalActivities.map((act, i) => (
                                      <div key={`opt-${i}`} className="relative pl-6">
                                        <div className="absolute left-[0px] top-[4px] w-[14px] h-[14px] bg-[#A855F7] rounded-full flex items-center justify-center">
                                          <Plus className="w-2.5 h-2.5 text-white font-bold" />
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <h5 className="font-medium text-black text-[17px] flex items-center gap-2">
                                            {act.name || act.title}
                                            {(() => {
                                              let priceStr = "";
                                              if (typeof act.price === "number") {
                                                priceStr = act.price > 0 ? `+$${Number(act.price).toLocaleString()}` : "";
                                              } else if (act.price && typeof act.price.amount === "number") {
                                                priceStr = Number(act.price.amount) > 0
                                                  ? `+${act.price.currency || "$"}${Number(act.price.amount).toLocaleString()}`
                                                  : "";
                                              }
                                              return priceStr ? <span className="text-black font-medium text-[17px]">from {priceStr}</span> : null;
                                            })()}
                                          </h5>
                                          <span className="text-black text-[14px] shrink-0 ml-4 font-medium">
                                            {(act as any).placeName || (act as any).location || (act as any).place || ""}{act.duration ? `  ${act.duration}hrs` : ''}
                                          </span>
                                        </div>
                                        <p className="text-black text-[15px] mt-1.5 leading-relaxed max-w-3xl">{act.description}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Accommodation */}
                            {day.accommodations && day.accommodations.length > 0 && (
                              <div className="mt-8 border-t border-gray-100 pt-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-white shrink-0">
                                  </div>
                                  <div className="flex-1 flex justify-between items-center">
                                    <div>
                                      <h4 className="font-medium text-black text-[17px]">Accommodation</h4>
                                      <p className="text-black text-[15px] mt-1">{day.accommodations[0].name || day.accommodations[0].type} (Or Similar)</p>
                                    </div>
                                    <span className="text-black text-[14px] font-medium">Hotel</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Meals */}
                            {day.meals && (
                              <div className="mt-6 text-[15px] text-black font-medium">
                                Meal Included:
                                {(() => {
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  const m = day.meals as any;
                                  const mealArray = [];
                                  if (typeof m === 'string') {
                                    mealArray.push(...m.split(',').map(s => s.trim()).filter(s => s));
                                  } else {
                                    if (m.breakfast) mealArray.push("Breakfast");
                                    if (m.lunch) mealArray.push("Lunch");
                                    if (m.dinner) mealArray.push("Dinner");
                                  }
                                  return mealArray.length > 0 ? <span className="text-black ml-1 font-normal">{mealArray.join(" | ")}</span> : <span className="text-black ml-1 font-normal">None</span>;
                                })()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Side: Map and Places Visited */}
              <div className="space-y-6 lg:sticky lg:top-[120px]">
                <div className="bg-black rounded-[20px] overflow-hidden aspect-[16/9] relative shadow-sm">
                  <Image src={tour.itineraryMapImage || tour.images?.[0]?.url || "/placeholder-image.jpg"} fill className="object-cover opacity-70" alt="Map" />
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-5 left-5 text-white font-bold tracking-widest text-[14px]">
                    {tour.country?.continent?.name?.toUpperCase() || tour.country?.name?.toUpperCase() || "DESTINATION"}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-[20px] p-6 shadow-sm">
                  <div className="flex gap-2.5 flex-wrap">
                    {tour.itinerary.map(d => (
                      <button
                        key={d.day}
                        onClick={() => scrollToModalDay(d.day)}
                        className={`w-[48px] h-[48px] rounded-[12px] border flex items-center justify-center text-[17px] transition-colors cursor-pointer ${currentDay === d.day
                          ? 'bg-[#A855F7] text-white border-[#A855F7] font-semibold'
                          : 'border-gray-200 text-black bg-white hover:border-black'
                          }`}
                      >
                        {d.day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="px-1 mt-6">
                  <h4 className="font-semibold text-black text-[18px]">Places Visited</h4>
                  <p className="text-[#4B5563] text-[16px] mt-2 font-medium">
                    {tour.location.visitedCities && tour.location.visitedCities.length > 0
                      ? tour.location.visitedCities.join(" | ")
                      : (tour.country?.name || "")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
