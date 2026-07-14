"use client";

import { useState } from "react";
import CreateHotelModal from "./CreateHotelModal";
import { X } from "@phosphor-icons/react";

interface Hotel {
  _id: string;
  name: string;
  location: string;
  privateRoomPrice: number;
  sharedRoomPrice: number;
  image?: string;
  isActive: boolean;
}

interface SearchHotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotels: Hotel[];
  onSelect: (hotelId: string) => void;
  countryId: string;
  onRefresh: () => void;
  title: string;
}

export default function SearchHotelModal({
  isOpen,
  onClose,
  hotels,
  onSelect,
  countryId,
  onRefresh,
  title,
}: SearchHotelModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (!isOpen) return null;

  const filteredHotels = hotels.filter(
    (h) =>
      h.isActive &&
      (h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleHotelCreated = (newHotel: any) => {
    onRefresh();
    if (newHotel && newHotel._id) {
      onSelect(newHotel._id);
    }
    setShowCreateModal(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-md w-full max-w-lg overflow-hidden shadow-xl flex flex-col max-h-[85vh] border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <div>
              <h3 className="text-base font-bold text-zinc-800">{title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">Select or search from registered accommodations</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-zinc-800 transition p-1 hover:bg-gray-100 rounded-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Box */}
          <div className="p-4 border-b border-gray-150 bg-white">
            <input
              type="text"
              placeholder="Search by hotel name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition text-zinc-800"
              autoFocus
            />
          </div>

          {/* Hotels List */}
          <div className="flex-1 overflow-y-auto p-4 bg-white space-y-2">
            {filteredHotels.length > 0 ? (
              filteredHotels.map((hotel) => (
                <div
                  key={hotel._id}
                  onClick={() => {
                    onSelect(hotel._id);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-55/30 transition cursor-pointer hover:border-zinc-300 group"
                >
                  <div className="flex items-center gap-3">
                    {hotel.image ? (
                      <img
                        src={hotel.image}
                        alt={hotel.name}
                        className="w-10 h-10 rounded-md object-cover border border-gray-100"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-lg border border-gray-200">
                        🏨
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-zinc-800 text-sm group-hover:text-zinc-950 transition-colors">
                        {hotel.name}
                      </div>
                      <div className="text-xs text-gray-500">{hotel.location}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-zinc-700">
                      ${hotel.privateRoomPrice} / night
                    </div>
                    <div className="text-[10px] text-gray-400">Private room</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-sm text-gray-400 font-medium">
                No active hotels found for this region.
              </div>
            )}
          </div>

          {/* Footer with Create Action */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <button
              onClick={() => {
                onSelect("");
                onClose();
              }}
              className="text-xs font-semibold text-red-650 hover:text-red-700 transition cursor-pointer"
            >
              Clear Selection
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-1.5 px-3 rounded-md transition-colors text-xs cursor-pointer"
            >
              + Create New Hotel
            </button>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateHotelModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleHotelCreated}
          destinationId={countryId}
        />
      )}
    </>
  );
}
