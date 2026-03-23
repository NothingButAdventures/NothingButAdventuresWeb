"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import ToursLoading from "./loading";
import TourCard from "@/components/TourCard";

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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTours.map((tour) => (
            <TourCard key={tour._id} tour={tour} />
          ))}
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
