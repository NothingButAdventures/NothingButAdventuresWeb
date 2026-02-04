"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Tour {
  _id: string;
  name: string;
  slug: string;
  summary: string;
  price: {
    amount: number;
    currency: string;
  };
  duration: {
    days: number;
    nights: number;
  };
  difficulty: string;
  country: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  isFeatured: boolean;
}

export default function ToursManagementPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${api.baseURL}/tours`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTours(data.data.tours);
      }
    } catch (error) {
      console.error("Error fetching tours:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tourId: string, tourName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${tourName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      setDeleteLoading(tourId);
      const token = localStorage.getItem("token");

      const response = await fetch(`${api.baseURL}/tours/${tourId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setTours(tours.filter((tour) => tour._id !== tourId));
        alert("Tour deleted successfully!");
      } else {
        const data = await response.json();
        alert(`Failed to delete tour: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting tour:", error);
      alert("Failed to delete tour. Please try again.");
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredTours = tours.filter(
    (tour) =>
      tour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.country?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Page Header Skeleton */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-8 py-6">
            <div className="h-7 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
        </div>
        {/* Content Skeleton */}
        <div className="p-8">
          <div className="bg-white rounded-xl border border-gray-200 animate-pulse">
            <div className="p-4 border-b border-gray-100">
              <div className="h-10 bg-gray-200 rounded-lg w-64"></div>
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 border-b border-gray-100 flex items-center gap-4">
                <div className="h-5 bg-gray-200 rounded w-48"></div>
                <div className="h-5 bg-gray-200 rounded w-24"></div>
                <div className="h-5 bg-gray-200 rounded w-20"></div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
                <div className="flex-1"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tours Management</h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage all tours in the system ({tours.length} total)
            </p>
          </div>
          <Link
            href="/admin/tours-management/create"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Tour
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Search and Filter */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search tours by name or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Tours List */}
        {filteredTours.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? "No tours found" : "No tours yet"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? "Try adjusting your search query"
                : "Get started by creating your first tour"}
            </p>
            {!searchQuery && (
              <Link
                href="/admin/tours-management/create"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition"
              >
                Create Tour
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tour Name
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredTours.map((tour) => (
                  <tr key={tour._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                          </svg>
                        </div>
                        <div>
                          <Link
                            href={`/tours/${tour.slug}`}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {tour.name}
                          </Link>
                          <p className="text-xs text-gray-500 truncate max-w-xs">
                            {tour.summary}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {tour.country?.name || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {tour.duration.days}D / {tour.duration.nights}N
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        ${tour.price.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${tour.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-600"
                            }`}
                        >
                          {tour.isActive ? "Active" : "Inactive"}
                        </span>
                        {tour.isFeatured && (
                          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-purple-50 text-purple-700">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/tours-management/${tour._id}/edit`}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(tour._id, tour.name)}
                          disabled={deleteLoading === tour._id}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deleteLoading === tour._id ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
