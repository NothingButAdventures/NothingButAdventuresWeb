"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import CreateHotelModal from "@/components/CreateHotelModal";
import Link from "next/link";

interface Hotel {
  _id: string;
  name: string;
  location: string;
  destination?: {
    _id: string;
    name: string;
  } | string;
  privateRoomPrice: number;
  sharedRoomPrice: number;
  image?: string;
  isActive: boolean;
}

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | undefined>(undefined);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${api.baseURL}/hotels`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.status === "success") {
        setHotels(data.data.hotels || []);
      }
    } catch (err) {
      console.error("Error fetching hotels:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedHotel(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setIsModalOpen(true);
  };

  const handleHotelSaved = (savedHotel: any) => {
    fetchHotels();
  };

  const handleDelete = async (hotelId: string, hotelName: string) => {
    if (!confirm(`Are you sure you want to delete "${hotelName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleteLoading(hotelId);
      const token = localStorage.getItem("token");
      const res = await fetch(`${api.baseURL}/hotels/${hotelId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.status === 204 || res.ok) {
        setHotels((prev) => prev.filter((h) => h._id !== hotelId));
        alert("Hotel deleted successfully!");
      } else {
        const data = await res.json();
        alert(`Failed to delete: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting hotel:", error);
      alert("Failed to delete hotel. Please try again.");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleToggleActive = async (hotel: Hotel) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${api.baseURL}/hotels/${hotel._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !hotel.isActive }),
      });

      if (res.ok) {
        setHotels((prev) =>
          prev.map((h) => (h._id === hotel._id ? { ...h, isActive: !hotel.isActive } : h))
        );
      }
    } catch (err) {
      console.error("Error toggling active status:", err);
    }
  };

  const filteredHotels = hotels.filter(
    (h) =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="px-8 h-16 flex items-center justify-between">
            <div className="h-5 bg-gray-200 rounded-md w-48 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded-md w-24 animate-pulse"></div>
          </div>
        </div>
        <div className="p-8">
          <div className="bg-white rounded-md border border-gray-200 animate-pulse">
            <div className="p-4 border-b border-gray-100">
              <div className="h-10 bg-gray-200 rounded-md w-64"></div>
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 border-b border-gray-100 flex items-center gap-4">
                <div className="h-5 bg-gray-200 rounded-md w-48"></div>
                <div className="h-5 bg-gray-200 rounded-md w-24"></div>
                <div className="flex-1"></div>
                <div className="h-8 bg-gray-200 rounded-md w-20"></div>
              </div>
            ))}
          </div>
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
            <h1 className="text-lg font-bold text-zinc-800 leading-none">Hotels Management</h1>
            <p className="text-gray-550 text-xs mt-1 leading-none">
              Manage pre & post-trip extra accommodations ({hotels.length} total)
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-900 text-white font-medium py-1.5 px-3 rounded-md shadow-sm transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Hotel
          </button>
        </div>
      </div>

      <div className="p-8">
        {/* Search Filter */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by hotel name or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-800"
          />
        </div>

        {/* Hotels Table */}
        <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-zinc-700 font-semibold text-xs uppercase tracking-wider">
                <th className="px-6 py-3">Hotel</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Country / Destination</th>
                <th className="px-6 py-3">Private Room Price</th>
                <th className="px-6 py-3">Shared Room Price</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredHotels.map((hotel) => (
                <tr key={hotel._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {hotel.image ? (
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="w-10 h-10 rounded-md object-cover border border-gray-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-lg">
                          🏨
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-zinc-800 block">{hotel.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-650">{hotel.location}</td>
                  <td className="px-6 py-4 text-zinc-650 font-medium">
                    {typeof hotel.destination === "object"
                      ? hotel.destination?.name
                      : "Assigned"}
                  </td>
                  <td className="px-6 py-4 text-zinc-800 font-semibold">
                    ${hotel.privateRoomPrice}/night
                  </td>
                  <td className="px-6 py-4 text-zinc-800 font-semibold">
                    ${hotel.sharedRoomPrice}/night
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggleActive(hotel)}
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer ${
                        hotel.isActive
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {hotel.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(hotel)}
                        className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-gray-100 rounded-md transition-colors border border-transparent hover:border-gray-200 cursor-pointer shadow-none hover:shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(hotel._id, hotel.name)}
                        disabled={deleteLoading === hotel._id}
                        className="p-1.5 text-zinc-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-200 cursor-pointer shadow-none hover:shadow-sm"
                      >
                        {deleteLoading === hotel._id ? (
                          <div className="w-4 h-4 border-2 border-red-650 border-t-transparent rounded-full animate-spin"></div>
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
          {filteredHotels.length === 0 && (
            <div className="p-12 text-center text-zinc-500 font-medium">No hotels found.</div>
          )}
        </div>
      </div>

      <CreateHotelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleHotelSaved}
        hotelData={selectedHotel}
      />
    </div>
  );
}
