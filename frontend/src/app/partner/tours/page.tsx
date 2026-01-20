"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Tour {
  _id: string;
  name: string;
  price: number;
  duration: number;
  difficulty: "easy" | "medium" | "difficult";
  ratingsAverage: number;
  ratingsQuantity: number;
  summary: string;
  description: string;
  imageCover: string;
  country: {
    _id: string;
    name: string;
  };
  startLocation: {
    description: string;
    coordinates: [number, number];
    address: string;
  };
  maxGroupSize: number;
  startDates: string[];
  createdBy?: string;
  createdAt: string;
}

interface Country {
  _id: string;
  name: string;
}

export default function PartnerToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: "",
    difficulty: "easy",
    summary: "",
    description: "",
    imageCover: "",
    country: "",
    maxGroupSize: "",
    startLocationDescription: "",
    startLocationAddress: "",
    startLocationLng: "",
    startLocationLat: "",
    startDates: [""],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [toursRes, countriesRes] = await Promise.all([
        fetch(`${api.baseURL}${api.endpoints.tours.getAll}`, { headers }),
        fetch(`${api.baseURL}${api.endpoints.countries.getAll}`, { headers }),
      ]);

      const toursData = await toursRes.json();
      const countriesData = await countriesRes.json();

      if (toursRes.ok) setTours(toursData.data.tours || toursData.data);
      if (countriesRes.ok)
        setCountries(countriesData.data.countries || countriesData.data);
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const tourData = {
        name: formData.name,
        price: Number(formData.price),
        duration: Number(formData.duration),
        difficulty: formData.difficulty,
        summary: formData.summary,
        description: formData.description,
        imageCover: formData.imageCover,
        country: formData.country,
        maxGroupSize: Number(formData.maxGroupSize),
        startLocation: {
          description: formData.startLocationDescription,
          coordinates: [
            Number(formData.startLocationLng),
            Number(formData.startLocationLat),
          ],
          address: formData.startLocationAddress,
        },
        startDates: formData.startDates.filter((date) => date.trim() !== ""),
      };

      const url = editingTour
        ? `${api.baseURL}${api.endpoints.tours.update}`.replace(
            ":id",
            editingTour._id,
          )
        : `${api.baseURL}${api.endpoints.tours.create}`;

      const method = editingTour ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(tourData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Operation failed");
      }

      setSuccess(
        editingTour ? "Tour updated successfully" : "Tour created successfully",
      );
      setShowModal(false);
      setEditingTour(null);
      resetForm();
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (tourId: string) => {
    if (!confirm("Are you sure you want to delete this tour?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${api.baseURL}${api.endpoints.tours.delete}`.replace(":id", tourId),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Delete failed");
      }

      setSuccess("Tour deleted successfully");
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (tour: Tour) => {
    setEditingTour(tour);
    setFormData({
      name: tour.name,
      price: tour.price.toString(),
      duration: tour.duration.toString(),
      difficulty: tour.difficulty,
      summary: tour.summary,
      description: tour.description,
      imageCover: tour.imageCover,
      country: tour.country._id,
      maxGroupSize: tour.maxGroupSize.toString(),
      startLocationDescription: tour.startLocation.description,
      startLocationAddress: tour.startLocation.address,
      startLocationLng: tour.startLocation.coordinates[0].toString(),
      startLocationLat: tour.startLocation.coordinates[1].toString(),
      startDates:
        tour.startDates.length > 0
          ? tour.startDates.map(
              (date) => new Date(date).toISOString().split("T")[0],
            )
          : [""],
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      duration: "",
      difficulty: "easy",
      summary: "",
      description: "",
      imageCover: "",
      country: "",
      maxGroupSize: "",
      startLocationDescription: "",
      startLocationAddress: "",
      startLocationLng: "",
      startLocationLat: "",
      startDates: [""],
    });
  };

  const filteredTours = tours.filter(
    (tour) =>
      tour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.country.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Partner Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your tours and listings
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  resetForm();
                  setEditingTour(null);
                  setShowModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
              >
                Add New Tour
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/auth/login";
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search your tours..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        {/* Tours Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTours.map((tour) => (
            <div
              key={tour._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {tour.imageCover && (
                <img
                  src={tour.imageCover}
                  alt={tour.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {tour.name}
                  </h3>
                  <span className="text-sm font-medium text-gray-600">
                    ${tour.price}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">
                  {tour.country.name}
                </p>
                <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                  {tour.summary}
                </p>
                <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
                  <span>{tour.duration} days</span>
                  <span className="capitalize">{tour.difficulty}</span>
                  <span>Max: {tour.maxGroupSize}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-yellow-400 mr-1">★</span>
                    <span className="text-sm">
                      {tour.ratingsAverage?.toFixed(1) || "N/A"} (
                      {tour.ratingsQuantity || 0})
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(tour)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tour._id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTours.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No tours found</p>
            <button
              onClick={() => {
                resetForm();
                setEditingTour(null);
                setShowModal(true);
              }}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
            >
              Create Your First Tour
            </button>
          </div>
        )}
      </div>

      {/* Modal (same as admin modal) */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingTour ? "Edit Tour" : "Add New Tour"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tour Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      required
                      value={formData.country}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          country: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country._id} value={country._id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (days)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          duration: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulty
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          difficulty: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="difficult">Difficult</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Group Size
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.maxGroupSize}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          maxGroupSize: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Summary
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.summary}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        summary: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageCover}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        imageCover: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingTour ? "Update Tour" : "Create Tour"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
