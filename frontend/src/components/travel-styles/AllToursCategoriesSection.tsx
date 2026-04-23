import TourCard from "@/components/TourCard";
import { api } from "@/lib/api";

const filters = ["All", "Asia", "Australia", "Europe", "Africa"];

const fallbackTours = [
  {
    _id: "mock-ts-1",
    name: "Spiritual India Experience",
    slug: "spiritual-india-experience",
    tourCode: "SIE2399",
    price: { amount: 2399, discountPercent: 0 },
    duration: { days: 12 },
    images: [
      {
        url: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1400&auto=format&fit=crop",
        isPrimary: true,
      },
    ],
    country: { name: "Varanasi" },
    travelStyle: "Classic",
    rating: 4.8,
  },
  {
    _id: "mock-ts-2",
    name: "Kerala Backwaters & Culture",
    slug: "kerala-backwaters-culture",
    tourCode: "KBC1599",
    price: { amount: 1599, discountPercent: 0 },
    duration: { days: 9 },
    images: [
      {
        url: "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?q=80&w=1400&auto=format&fit=crop",
        isPrimary: true,
      },
    ],
    country: { name: "Cochin" },
    travelStyle: "Adventure",
    rating: 4.8,
  },
  {
    _id: "mock-ts-3",
    name: "Himalyan Adventure Trek",
    slug: "himalyan-adventure-trek",
    tourCode: "HAT1599",
    price: { amount: 1599, discountPercent: 0 },
    duration: { days: 9 },
    images: [
      {
        url: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1400&auto=format&fit=crop",
        isPrimary: true,
      },
    ],
    country: { name: "Leh" },
    travelStyle: "Adventure",
    rating: 4.8,
  },
  {
    _id: "mock-ts-4",
    name: "Himalyan Adventure Trek",
    slug: "himalyan-adventure-trek-journey",
    tourCode: "HAJ1599",
    price: { amount: 1599, discountPercent: 0 },
    duration: { days: 9 },
    images: [
      {
        url: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=1400&auto=format&fit=crop",
        isPrimary: true,
      },
    ],
    country: { name: "Delhi" },
    travelStyle: "Journey",
    rating: 4.8,
  },
];

function normalizeTourForCard(tour: any, index: number) {
  const primaryImage = tour?.images?.find?.((img: any) => img?.isPrimary)?.url || tour?.images?.[0]?.url;
  const styleValue =
    typeof tour?.travelStyle === "string"
      ? tour.travelStyle
      : tour?.travelStyle?.name || tour?.travelStyle?.title || "Adventure";

  return {
    _id: String(tour?._id || `real-tour-${index}`),
    name: tour?.name || "Untitled Tour",
    slug: tour?.slug || `tour-${index}`,
    tourCode: tour?.tourCode || `TOUR${index + 1}`,
    price: {
      amount: Number(tour?.price?.amount ?? tour?.price ?? 0),
      discountPercent: Number(tour?.price?.discountPercent ?? 0),
    },
    duration: {
      days: Number(tour?.duration?.days ?? tour?.duration ?? 0),
    },
    images: primaryImage ? [{ url: primaryImage, isPrimary: true }] : [],
    descriptionImage: tour?.descriptionImage,
    country: {
      name:
        typeof tour?.country === "string"
          ? tour.country
          : tour?.country?.name || "Multiple",
    },
    travelStyle: styleValue,
    rating: Number(tour?.rating ?? 4.8),
  };
}

async function getRealTours() {
  try {
    const res = await fetch(`${api.baseURL}${api.endpoints.tours.getAll}?limit=4`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return fallbackTours;
    }

    const data = await res.json();
    const rawTours = data?.data?.tours || data?.data || [];

    if (!Array.isArray(rawTours) || rawTours.length === 0) {
      return fallbackTours;
    }

    return rawTours.slice(0, 4).map(normalizeTourForCard);
  } catch (error) {
    console.error("Failed to fetch tours for travel styles section:", error);
    return fallbackTours;
  }
}

function ArrowLeft() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default async function AllToursCategoriesSection() {
  const tours = await getRealTours();

  return (
    <section className="mt-14 border-t border-[#eceff3] pt-10 md:mt-16 md:pt-12">
      <span className="inline-flex rounded-full bg-[#e8ebf0] px-4 py-1 text-[12px] font-medium text-[#5e6678]">5 Reasons</span>

      <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <h2 className="text-[40px] font-semibold leading-tight text-[#121b2f] md:text-[56px]">
          All Tours in this Categories
        </h2>

        <a href="/trips" className="text-[16px] font-semibold text-[#121b2f] underline underline-offset-4">
          View All Trips
        </a>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {filters.map((filter, index) => (
          <button
            key={filter}
            type="button"
            className={`rounded-full border px-4 py-1.5 text-[13px] font-medium transition ${
              index === 1
                ? "border-[#111b31] bg-[#111b31] text-white"
                : "border-[#cfd4dd] bg-white text-[#3f4759] hover:border-[#111b31]"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        <button
          type="button"
          aria-label="Previous trips"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#c7ccd5] text-white"
        >
          <ArrowLeft />
        </button>
        <button
          type="button"
          aria-label="Next trips"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#464d5b] text-white"
        >
          <ArrowRight />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {tours.map((tour) => (
          <div key={tour._id} className="h-full">
            <TourCard tour={tour} />
          </div>
        ))}
      </div>
    </section>
  );
}