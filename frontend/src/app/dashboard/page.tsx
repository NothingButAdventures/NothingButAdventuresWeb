"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface User {
  name: string;
  email: string;
  role: string;
}

interface Tour {
  _id: string;
  name: string;
  slug: string;
  price: {
    amount: number;
    currency: string;
    discountPercent: number;
  };
  images: Array<{
    url: string;
    caption: string;
    isPrimary: boolean;
  }>;
  country: { name: string };
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    checkAuth();
    fetchTours();
    setGreeting(getGreeting());
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${api.baseURL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
      }
    } catch (error) {
      console.error("Auth check failed");
    }
  };

  const fetchTours = async () => {
    try {
      const response = await fetch(`${api.baseURL}/tours?limit=3`);
      if (response.ok) {
        const data = await response.json();
        setTours(data.data.tours || data.data);
      }
    } catch (error) {
      console.error("Failed to fetch tours");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4">
        {/* Greeting Section */}
        <div className="grid grid-cols-3 gap-8 py-12">
          <div className="col-span-2">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {greeting}, {user?.name || "Traveler"}
            </h1>
            <p className="text-gray-600 mb-4">
              Welcome and get Nothing but Adventures
            </p>
            <Link
              href="/tours"
              className="inline-block text-blue-600 hover:text-blue-700 font-medium underline"
            >
              View more
            </Link>
          </div>

          {/* Tour Status Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Tour Status
            </h3>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🎈</span>
              </div>
              <p className="text-gray-700 font-medium mb-2">
                Nothing to co here - yet
              </p>
              <p className="text-sm text-gray-500">
                Tour and events updates will show up here with things you need
                to know
              </p>
            </div>
          </div>
        </div>

        {/* Ready to find your next adventure Banner */}
        <div className="bg-gradient-to-r from-cyan-400 to-blue-300 rounded-lg overflow-hidden mb-16">
          <div className="grid grid-cols-2 items-center">
            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Ready to find your next adventure?
              </h2>
              <p className="text-gray-700 mb-6">
                We specialize in helping you see the world's most inaccessible
                and beautiful locations
              </p>
              <Link
                href="/tours"
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition"
              >
                Browse all tours
              </Link>
            </div>
            <div
              className="h-64 bg-cover bg-center opacity-80"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop)",
              }}
            />
          </div>
        </div>

        {/* Our top picks Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Our top picks
          </h2>
          <p className="text-gray-600 mb-8">
            We curated up a few options for your next adventure
          </p>

          <div className="grid grid-cols-3 gap-8">
            {tours.length > 0 ? (
              tours.map((tour) => {
                const primaryImage =
                  tour.images?.find((img) => img.isPrimary) || tour.images?.[0];
                return (
                  <Link href={`/tours/${tour.slug}`} key={tour._id}>
                    <div className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full flex flex-col">
                      {/* Image Container */}
                      <div className="relative w-full h-56 overflow-hidden bg-gray-100">
                        {primaryImage?.url ? (
                          <img
                            src={primaryImage.url}
                            alt={primaryImage.caption || tour.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <svg
                              className="w-12 h-12 text-gray-400"
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
                            {tour.country.name} Tour
                          </span>
                        </div>

                        {/* Tour Name */}
                        <h3 className="text-lg font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                          {tour.name}
                        </h3>

                        {/* Spacing for push to bottom */}
                        <div className="flex-1"></div>

                        {/* Price Section */}
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-3xl font-bold text-gray-900">
                            ${tour.price.amount}
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
              })
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500">
                  No tours available at the moment
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Build your wishlist Section */}
        <div className="bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg overflow-hidden py-12 px-8 mb-16">
          <div className="grid grid-cols-2 items-center gap-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Build your wishlist
              </h2>
              <p className="text-gray-700 mb-6">
                The features that we are adding might be the biggest game
                changer for your wishlist and get closer to making your travel
                dream a reality
              </p>
              <Link
                href="/tours"
                className="inline-block text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Browse all tours
              </Link>
            </div>
            <div
              className="h-64 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1524661135-423995f22d0b?w=500&h=300&fit=crop)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
