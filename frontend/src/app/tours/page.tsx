"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import ToursLoading from "./loading";

interface Tour {
  _id: string;
  name: string;
  slug: string;
  price: {
    amount: number;
    currency: string;
    discountPercent: number;
  };
  duration: {
    days: number;
    nights: number;
  };
  ratingsAverage: number;
  ratingsQuantity: number;
  summary: string;
  images: Array<{
    url: string;
    caption: string;
    isPrimary: boolean;
  }>;
  country: {
    _id: string;
    name: string;
  };
  startDates: any[];
  travelStyle: string;
  physicalRating: {
    level: number;
  };
}

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const response = await fetch(
        `${api.baseURL}${api.endpoints.tours.getAll}`,
      );
      const data = await response.json();

      if (response.ok) {
        setTours(data.data.tours || data.data);
      }
    } catch (error) {
      console.error("Failed to fetch tours:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTours = tours.filter(
    (tour) =>
      tour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.country.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return <ToursLoading />;
  }

  return (
    <div className="min-h-screen">
      {/* Tours Section */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Available Tours
          </h2>
          <p className="text-gray-600">
            {filteredTours.length} tour{filteredTours.length !== 1 ? "s" : ""}{" "}
            found
          </p>
        </div>

        {/* Tours Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTours.map((tour) => {
            const primaryImage =
              tour.images?.find((img) => img.isPrimary) || tour.images?.[0];
            const discountedPrice =
              tour.price.discountPercent > 0
                ? tour.price.amount * (1 - tour.price.discountPercent / 100)
                : tour.price.amount;

            return (
              <Link href={`/tours/${tour.slug}`} key={tour._id}>
                <div className="group bg-white border rounded-xl  overflow-hidden  transition-all duration-300 transform  cursor-pointer h-full flex flex-col">
                  {/* Image Container */}
                  <div className="relative w-full h-64 overflow-hidden bg-gray-100">
                    {primaryImage?.url ? (
                      <img
                        src={primaryImage.url}
                        alt={primaryImage.caption || tour.name}
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
                        {tour.duration.days} Day Tour
                      </span>
                    </div>

                    {/* Tour Name */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                      {tour.name}
                    </h3>

                    {/* Spacing for push to bottom */}
                    <div className="flex-1"></div>

                    {/* Price Section */}
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-3xl font-bold text-gray-900">
                        ${Math.round(discountedPrice)}
                      </span>
                      <span className="text-sm text-gray-600">per person</span>
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

        {filteredTours.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.137 0-4.146.832-5.636 2.172M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No tours found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search criteria to find more tours
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
