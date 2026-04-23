"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import TourCard from "@/components/TourCard";

type TourListItem = {
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
    isPrimary?: boolean;
  }>;
  country: {
    name: string;
  };
  travelStyle?: string;
  rating?: number;
  tags?: string[];
  serviceLevel?: string;
  physicalRating?: {
    level: number;
  };
  startDates?: Array<{
    startDate?: string;
  }>;
};

const DURATIONS = ["1-3 Days", "4-7 Days", "8-14 Days", "15+ Days"];
const PRICES = ["Under $1000", "$1000 - $2000", "$2000 - $3000", "$3000 - $5000", "$5000+"];
const DISCOUNTS = ["Any Discount", "20% off or more", "30% off or more", "40% off or more", "50% off or more"];
const PHYSICAL_RATINGS = ["1 - Easy", "2 - Light", "3 - Average", "4 - Demanding", "5 - Challenging"];
const SERVICE_LEVELS = ["Standard", "Comfort", "Premium", "Luxury"];

function isDurationMatch(days: number, durationLabels: string[]) {
  return durationLabels.some((label) => {
    if (label === "1-3 Days") return days >= 1 && days <= 3;
    if (label === "4-7 Days") return days >= 4 && days <= 7;
    if (label === "8-14 Days") return days >= 8 && days <= 14;
    if (label === "15+ Days") return days >= 15;
    return false;
  });
}

function isPriceMatch(price: number, ranges: string[]) {
  return ranges.some((range) => {
    if (range === "Under $1000") return price < 1000;
    if (range === "$1000 - $2000") return price >= 1000 && price <= 2000;
    if (range === "$2000 - $3000") return price >= 2000 && price <= 3000;
    if (range === "$3000 - $5000") return price >= 3000 && price <= 5000;
    if (range === "$5000+") return price >= 5000;
    return false;
  });
}

function getMonthYear(dateValue?: string) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("default", { month: "long", year: "numeric" });
}

function FilterDropdown({
  label,
  data,
  selected,
  active,
  onToggle,
  onOptionChange,
  onClear,
}: {
  label: string;
  data: string[];
  selected: string[];
  active: boolean;
  onToggle: () => void;
  onOptionChange: (option: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-medium transition ${
          active || selected.length > 0
            ? "border-[#121b2f] bg-[#121b2f] text-white"
            : "border-[#bfc4ce] bg-white text-[#2f3a52] hover:border-[#121b2f]"
        }`}
      >
        <span>{label}</span>
        {selected.length > 0 && <span>({selected.length})</span>}
        <svg className={`h-4 w-4 transition-transform ${active ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {active && (
        <div className="absolute left-0 top-full z-20 mt-2 w-72 rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
          <div className="max-h-72 overflow-y-auto">
            {data.map((option) => (
              <label key={option} className="flex cursor-pointer items-center px-4 py-2 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => onOptionChange(option)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="ml-3 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2">
            <button type="button" onClick={onClear} className="text-xs font-medium text-gray-500 hover:text-gray-900">
              Clear
            </button>
            <button type="button" onClick={onToggle} className="text-xs font-medium text-[#121b2f] hover:text-black">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CountryTravelStoriesToursSection({
  countryName,
  tours,
}: {
  countryName: string;
  tours: TourListItem[];
}) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  const [selectedPhysical, setSelectedPhysical] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<string[]>([]);

  const availableStyles = useMemo(
    () => Array.from(new Set(tours.map((tour) => (tour.travelStyle || "").trim()).filter(Boolean))).sort(),
    [tours]
  );

  const availableDates = useMemo(() => {
    const unique = new Set<string>();
    tours.forEach((tour) => {
      (tour.startDates || []).forEach((startDate) => {
        const value = getMonthYear(startDate?.startDate);
        if (value) unique.add(value);
      });
    });
    return Array.from(unique).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }, [tours]);

  const availableCollections = useMemo(() => {
    const unique = new Set<string>();
    tours.forEach((tour) => {
      (tour.tags || []).forEach((tag) => {
        if (tag) unique.add(tag);
      });
    });
    return Array.from(unique).sort();
  }, [tours]);

  const filteredTours = useMemo(() => {
    return tours.filter((tour) => {
      if (selectedStyles.length > 0 && !selectedStyles.includes(tour.travelStyle || "")) return false;

      if (selectedDurations.length > 0 && !isDurationMatch(Number(tour.duration?.days || 0), selectedDurations)) {
        return false;
      }

      if (selectedDates.length > 0) {
        const tourDates = (tour.startDates || []).map((d) => getMonthYear(d?.startDate)).filter(Boolean);
        if (!selectedDates.some((date) => tourDates.includes(date))) return false;
      }

      if (selectedPrices.length > 0) {
        const amount = Number(tour.price?.amount || 0);
        const discount = Number(tour.price?.discountPercent || 0);
        const discountedPrice = discount > 0 ? amount * (1 - discount / 100) : amount;
        if (!isPriceMatch(discountedPrice, selectedPrices)) return false;
      }

      if (selectedCollections.length > 0) {
        const tags = tour.tags || [];
        if (!selectedCollections.some((tag) => tags.includes(tag))) return false;
      }

      if (selectedDiscounts.length > 0) {
        const discount = Number(tour.price?.discountPercent || 0);
        const hasMatch = selectedDiscounts.some((range) => {
          if (range === "Any Discount") return discount > 0;
          if (range.includes("20%")) return discount >= 20;
          if (range.includes("30%")) return discount >= 30;
          if (range.includes("40%")) return discount >= 40;
          if (range.includes("50%")) return discount >= 50;
          return false;
        });
        if (!hasMatch) return false;
      }

      if (selectedPhysical.length > 0) {
        const level = Number(tour.physicalRating?.level || 0);
        const hasMatch = selectedPhysical.some((label) => level === Number(label.split(" - ")[0]));
        if (!hasMatch) return false;
      }

      if (selectedService.length > 0) {
        if (!selectedService.includes(tour.serviceLevel || "")) return false;
      }

      return true;
    });
  }, [
    tours,
    selectedStyles,
    selectedDurations,
    selectedDates,
    selectedPrices,
    selectedCollections,
    selectedDiscounts,
    selectedPhysical,
    selectedService,
  ]);

  const displayedTours = filteredTours.slice(0, 8);

  const toggleInList = (
    value: string,
    list: string[],
    setList: Dispatch<SetStateAction<string[]>>
  ) => {
    setList((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  return (
    <section className="mt-14 md:mt-16">
      <span className="inline-flex rounded-full bg-[#e8ebf0] px-4 py-1 text-[12px] font-medium text-[#5e6678]">
        {countryName} Tour
      </span>

      <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-[40px] font-semibold leading-tight text-[#121b2f] md:text-[56px]">{countryName} Travel Stories</h2>
        <p className="text-[13px] text-[#6f7787]">Showing {displayedTours.length} results out of {tours.length}</p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <FilterDropdown
          label="Travel Styles"
          data={availableStyles}
          selected={selectedStyles}
          active={activeFilter === "Travel Styles"}
          onToggle={() => setActiveFilter((prev) => (prev === "Travel Styles" ? null : "Travel Styles"))}
          onOptionChange={(option) => toggleInList(option, selectedStyles, setSelectedStyles)}
          onClear={() => setSelectedStyles([])}
        />

        <FilterDropdown
          label="Date"
          data={availableDates}
          selected={selectedDates}
          active={activeFilter === "Date"}
          onToggle={() => setActiveFilter((prev) => (prev === "Date" ? null : "Date"))}
          onOptionChange={(option) => toggleInList(option, selectedDates, setSelectedDates)}
          onClear={() => setSelectedDates([])}
        />

        <FilterDropdown
          label="Duration"
          data={DURATIONS}
          selected={selectedDurations}
          active={activeFilter === "Duration"}
          onToggle={() => setActiveFilter((prev) => (prev === "Duration" ? null : "Duration"))}
          onOptionChange={(option) => toggleInList(option, selectedDurations, setSelectedDurations)}
          onClear={() => setSelectedDurations([])}
        />

        <FilterDropdown
          label="Price"
          data={PRICES}
          selected={selectedPrices}
          active={activeFilter === "Price"}
          onToggle={() => setActiveFilter((prev) => (prev === "Price" ? null : "Price"))}
          onOptionChange={(option) => toggleInList(option, selectedPrices, setSelectedPrices)}
          onClear={() => setSelectedPrices([])}
        />

        <button
          type="button"
          onClick={() => setShowMoreFilters((prev) => !prev)}
          className="text-[13px] font-medium text-[#6f7787] underline-offset-2 hover:underline"
        >
          {showMoreFilters ? "Hide extra filters" : "Show more filters"}
        </button>
      </div>

      {showMoreFilters && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <FilterDropdown
            label="Collections"
            data={availableCollections}
            selected={selectedCollections}
            active={activeFilter === "Collections"}
            onToggle={() => setActiveFilter((prev) => (prev === "Collections" ? null : "Collections"))}
            onOptionChange={(option) => toggleInList(option, selectedCollections, setSelectedCollections)}
            onClear={() => setSelectedCollections([])}
          />

          <FilterDropdown
            label="Discount"
            data={DISCOUNTS}
            selected={selectedDiscounts}
            active={activeFilter === "Discount"}
            onToggle={() => setActiveFilter((prev) => (prev === "Discount" ? null : "Discount"))}
            onOptionChange={(option) => toggleInList(option, selectedDiscounts, setSelectedDiscounts)}
            onClear={() => setSelectedDiscounts([])}
          />

          <FilterDropdown
            label="Physical Rating"
            data={PHYSICAL_RATINGS}
            selected={selectedPhysical}
            active={activeFilter === "Physical Rating"}
            onToggle={() => setActiveFilter((prev) => (prev === "Physical Rating" ? null : "Physical Rating"))}
            onOptionChange={(option) => toggleInList(option, selectedPhysical, setSelectedPhysical)}
            onClear={() => setSelectedPhysical([])}
          />

          <FilterDropdown
            label="Service Level"
            data={SERVICE_LEVELS}
            selected={selectedService}
            active={activeFilter === "Service Level"}
            onToggle={() => setActiveFilter((prev) => (prev === "Service Level" ? null : "Service Level"))}
            onOptionChange={(option) => toggleInList(option, selectedService, setSelectedService)}
            onClear={() => setSelectedService([])}
          />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {displayedTours.map((tour) => (
          <div key={tour._id} className="h-full">
            <TourCard tour={tour} />
          </div>
        ))}
      </div>
    </section>
  );
}
