import { api } from "./api";

// Global cache for discounts map
let cachedDiscountsMap: Record<string, number> | null = null;
let discountsPromise: Promise<Record<string, number>> | null = null;

export async function fetchDiscountsMap(): Promise<Record<string, number>> {
  if (cachedDiscountsMap) {
    return cachedDiscountsMap;
  }

  if (discountsPromise) {
    return discountsPromise;
  }

  discountsPromise = (async () => {
    try {
      const res = await fetch(`${api.baseURL}/discounts`);
      if (!res.ok) {
        return {};
      }
      const data = await res.json();
      const discounts = data.data?.discounts || data.discounts || [];
      const map: Record<string, number> = {};

      discounts.forEach((d: any) => {
        const pct = typeof d.percentage === "number" ? d.percentage : parseFloat(d.percentage);
        if (!isNaN(pct)) {
          if (d.name) {
            map[d.name] = pct;
            map[d.name.toLowerCase().trim()] = pct;
          }
          if (d.slug) {
            map[d.slug] = pct;
          }
          if (d._id) {
            map[d._id] = pct;
          }
        }
      });

      cachedDiscountsMap = map;
      return map;
    } catch (error) {
      console.error("Failed to fetch discounts map:", error);
      return {};
    } finally {
      discountsPromise = null;
    }
  })();

  return discountsPromise;
}

export function getDiscountPercentage(
  discountVal?: any,
  discountsMap?: Record<string, number> | null
): number {
  if (!discountVal) return 0;

  if (typeof discountVal === "number") {
    return isNaN(discountVal) ? 0 : discountVal;
  }

  if (typeof discountVal === "object") {
    if (typeof discountVal.percentage === "number") return discountVal.percentage;
    if (typeof discountVal.discount === "number") return discountVal.discount;
    if (typeof discountVal.discount === "string") {
      return getDiscountPercentage(discountVal.discount, discountsMap);
    }
    return 0;
  }

  if (typeof discountVal === "string") {
    const trimmed = discountVal.trim();
    if (!trimmed) return 0;

    const lookupMap = discountsMap || cachedDiscountsMap;
    if (lookupMap) {
      if (lookupMap[trimmed] !== undefined) return lookupMap[trimmed];
      if (lookupMap[trimmed.toLowerCase()] !== undefined) return lookupMap[trimmed.toLowerCase()];
    }

    // Check if contains percentage e.g. "20%" or "15.5%" or "-20%"
    const match = trimmed.match(/(\d+(?:\.\d+)?)\s*%/);
    if (match) {
      const parsed = parseFloat(match[1]);
      return isNaN(parsed) ? 0 : parsed;
    }

    // Parse plain numeric string e.g. "20"
    const cleaned = trimmed.replace(/[^0-9.]/g, "");
    if (cleaned) {
      const num = parseFloat(cleaned);
      if (!isNaN(num) && num > 0 && num <= 100) {
        return num;
      }
    }
  }

  return 0;
}

export interface TourPricingInfo {
  basePrice: number;
  discountedPrice: number;
  effectiveDiscount: number;
  hasDiscount: boolean;
  displayDate: string;
  currency: string;
}

export function getTourPricing(
  tour: any,
  discountsMap?: Record<string, number> | null
): TourPricingInfo {
  if (!tour) {
    return {
      basePrice: 0,
      discountedPrice: 0,
      effectiveDiscount: 0,
      hasDiscount: false,
      displayDate: "",
      currency: "USD",
    };
  }

  const basePrice = tour.price?.amount || tour.pricing?.startingPrice || 0;
  const currency = tour.price?.currency || tour.pricing?.currency || "USD";
  const tourDiscount = tour.price?.discountPercent || 0;

  let maxStartDateDiscount = 0;
  let highestDiscountStartDate = "";
  let earliestStartDate = tour.nextDepartureDate || "";

  const startDates = Array.isArray(tour.startDates) ? tour.startDates : [];

  startDates.forEach((sd: any) => {
    if (sd.isActive === false) return;

    const discountVal = getDiscountPercentage(sd.discount, discountsMap);

    if (sd.startDate && !earliestStartDate) {
      earliestStartDate = sd.startDate;
    }

    if (discountVal > maxStartDateDiscount) {
      maxStartDateDiscount = discountVal;
      if (sd.startDate) {
        highestDiscountStartDate = sd.startDate;
      }
    }
  });

  const effectiveDiscount = Math.max(tourDiscount, maxStartDateDiscount);
  const hasDiscount = effectiveDiscount > 0;
  const discountedPrice = hasDiscount
    ? basePrice * (1 - effectiveDiscount / 100)
    : basePrice;

  const displayDate = hasDiscount && highestDiscountStartDate
    ? highestDiscountStartDate
    : (earliestStartDate || tour.nextDepartureDate || "");

  return {
    basePrice,
    discountedPrice,
    effectiveDiscount,
    hasDiscount,
    displayDate,
    currency,
  };
}
