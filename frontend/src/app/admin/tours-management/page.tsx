"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface Tour {
  _id: string;
  name: string;
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
  const router = useRouter();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndFetchTours();
  }, []);

  const checkAuthAndFetchTours = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      // Check if user is admin
      const authResponse = await fetch(`${api.baseURL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!authResponse.ok) {
        router.push("/auth/login");
        return;
      }

      const authData = await authResponse.json();

      if (authData.data.user.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      // Fetch all tours
      const toursResponse = await fetch(`${api.baseURL}/tours`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (toursResponse.ok) {
        const toursData = await toursResponse.json();
        setTours(toursData.data.tours);
      }
    } catch (error) {
      console.error("Error:", error);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tours Management
            </h1>
            <p className="text-gray-600 mt-2">Manage all tours in the system</p>
          </div>
          <Link
            href="/admin/tours-management/create"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Tour
          </Link>
        </div>

        {/* Tours List */}
        {tours.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No tours yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first tour
            </p>
            <Link
              href="/admin/tours-management/create"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Create Tour
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tour Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tours.map((tour) => (
                  <tr key={tour._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {tour.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-md">
                        {tour.summary}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {tour.country?.name || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {tour.duration.days} days / {tour.duration.nights}{" "}
                        nights
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {tour.price.currency} {tour.price.amount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          tour.difficulty === "easy"
                            ? "bg-green-100 text-green-800"
                            : tour.difficulty === "moderate"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {tour.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            tour.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {tour.isActive ? "Active" : "Inactive"}
                        </span>
                        {tour.isFeatured && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/tours-management/${tour._id}/edit`}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(tour._id, tour.name)}
                          disabled={deleteLoading === tour._id}
                          className="text-red-600 hover:text-red-900 font-medium disabled:opacity-50"
                        >
                          {deleteLoading === tour._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Back to Admin */}
        <div className="mt-6">
          <Link
            href="/admin"
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
