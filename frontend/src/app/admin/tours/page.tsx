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
  createdAt: string;
}

interface Country {
  _id: string;
  name: string;
}

export default function AdminToursPage() {
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

  const handleAddDate = () => {
    setFormData((prev) => ({
      ...prev,
      startDates: [...prev.startDates, ""],
    }));
  };

  const handleDateChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      startDates: prev.startDates.map((date, i) =>
        i === index ? value : date,
      ),
    }));
  };

  const handleRemoveDate = (index: number) => {
    if (formData.startDates.length > 1) {
      setFormData((prev) => ({
        ...prev,
        startDates: prev.startDates.filter((_, i) => i !== index),
      }));
    }
  };

  const filteredTours = tours.filter((tour) =>
    tour.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="h-8 bg-gray-200 rounded-md w-48 mb-6 animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-150 rounded-md animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-zinc-800 leading-none">Tours Management</h1>
            <p className="text-gray-550 text-xs mt-1 leading-none">Configure multi-day travel itineraries</p>
          </div>
          <button
            onClick={() => {
              setEditingTour(null);
              resetForm();
              setShowModal(true);
            }}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-900 text-white font-medium py-1.5 px-3 rounded-md shadow-sm transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Tour
          </button>
        </div>
      </div>

      <div className="p-8">

      {/* Notifications */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs font-semibold">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-md text-xs font-semibold">
          {success}
        </div>
      )}

      {/* Search Filter */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search tours..."
          className="w-full max-w-md px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-805"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table List */}
      <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cover Image</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tour Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Country</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Difficulty</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 italic-off">
            {filteredTours.map((tour) => (
              <tr key={tour._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  {tour.imageCover ? (
                    <img
                      src={tour.imageCover}
                      alt={tour.name}
                      className="w-16 h-12 rounded-md object-cover bg-gray-100 border border-gray-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-12 rounded-md bg-zinc-100 border border-zinc-205 flex items-center justify-center text-zinc-550 text-xs font-semibold shadow-inner">
                      N/A
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-zinc-800">{tour.name}</td>
                <td className="px-6 py-4 text-sm text-zinc-650">{tour.country?.name || "Global"}</td>
                <td className="px-6 py-4 text-sm text-zinc-600">{tour.duration} days</td>
                <td className="px-6 py-4 text-sm font-semibold text-zinc-800">${tour.price}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border capitalize
                    ${tour.difficulty === "easy" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : ""}
                    ${tour.difficulty === "medium" ? "bg-amber-50 text-amber-700 border-amber-100" : ""}
                    ${tour.difficulty === "difficult" ? "bg-red-50 text-red-700 border-red-100" : ""}
                  `}>
                    {tour.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => handleEdit(tour)}
                      className="p-1.5 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition-colors border border-transparent hover:border-gray-200 shadow-none hover:shadow-sm cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(tour._id)}
                      className="p-1.5 text-zinc-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-200 cursor-pointer shadow-none hover:shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTours.length === 0 && (
          <div className="p-12 text-center text-zinc-500 font-medium">No tours found.</div>
        )}
      </div>

      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-md border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-lg font-bold text-zinc-800">
                {editingTour ? "Edit Tour" : "Create New Tour"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer border-none bg-transparent"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">
                  Tour Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-850"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, price: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-850"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">
                    Duration (Days)
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
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-850"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        difficulty: e.target.value as any,
                      }))
                    }
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-800"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="difficult">Difficult</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">
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
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-850"
                  >
                    <option value="">Select Country</option>
                    {countries.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">
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
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-850"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">
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
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-850"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">
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
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-850 resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">
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
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-800"
                />
              </div>

              {/* Start Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">
                    Start Location Description
                  </label>
                  <input
                    type="text"
                    value={formData.startLocationDescription}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        startLocationDescription: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-850"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">
                    Start Location Address
                  </label>
                  <input
                    type="text"
                    value={formData.startLocationAddress}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        startLocationAddress: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-850"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.startLocationLng}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        startLocationLng: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-850"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.startLocationLat}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        startLocationLat: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-850"
                  />
                </div>
              </div>

              {/* Start Dates */}
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">
                  Start Dates
                </label>
                {formData.startDates.map((date, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 mb-2"
                  >
                    <input
                      type="date"
                      value={date}
                      onChange={(e) =>
                        handleDateChange(index, e.target.value)
                      }
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-800"
                    />
                    {formData.startDates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDate(index)}
                        className="text-red-650 hover:text-red-800 text-xs font-bold transition-colors cursor-pointer border-none bg-transparent"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddDate}
                  className="text-zinc-900 hover:text-zinc-950 text-xs font-bold transition decoration-zinc-950 underline bg-transparent border-none cursor-pointer"
                >
                  + Add Date
                </button>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-zinc-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-zinc-900 border border-zinc-900 text-white rounded-md hover:bg-zinc-800 transition-colors font-medium text-sm shadow-sm cursor-pointer"
                >
                  {editingTour ? "Update Tour" : "Create Tour"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
