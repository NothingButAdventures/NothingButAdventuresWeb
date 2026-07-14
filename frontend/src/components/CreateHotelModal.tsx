import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { api } from "@/lib/api";
import ImagePickerModal from "./ImagePickerModal";
import { X } from "@phosphor-icons/react";

interface CreateHotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (hotel: any) => void;
  /** The country ID (destination) already selected on the tour */
  destinationId?: string;
  /** Optional hotel data to populate for editing */
  hotelData?: any;
}

export default function CreateHotelModal({
  isOpen,
  onClose,
  onCreated,
  destinationId,
  hotelData,
}: CreateHotelModalProps) {
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCountryId, setSelectedCountryId] = useState(destinationId || "");
  const [countries, setCountries] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    privateRoomPrice: "",
    sharedRoomPrice: "",
    image: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (hotelData) {
        setFormData({
          name: hotelData.name || "",
          location: hotelData.location || "",
          privateRoomPrice: hotelData.privateRoomPrice?.toString() || "",
          sharedRoomPrice: hotelData.sharedRoomPrice?.toString() || "",
          image: hotelData.image || "",
        });
        setSelectedCountryId(hotelData.destination?._id || hotelData.destination || "");
      } else {
        setFormData({
          name: "",
          location: "",
          privateRoomPrice: "",
          sharedRoomPrice: "",
          image: "",
        });
        setSelectedCountryId(destinationId || "");
      }
    }
  }, [isOpen, hotelData, destinationId]);

  useEffect(() => {
    // If not provided, fetch all countries to let user select one
    if (isOpen) {
      const token = localStorage.getItem("token");
      fetch(`${api.baseURL}/countries`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success" && data.data.countries) {
            setCountries(data.data.countries);
          }
        })
        .catch((err) => console.error("Error fetching countries:", err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && selectedCountryId) {
      setLoadingDestinations(true);
      const token = localStorage.getItem("token");
      fetch(`${api.baseURL}/countries/${selectedCountryId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success" && data.data.country) {
            setSelectedCountry(data.data.country);
          }
        })
        .catch((err) => console.error("Error fetching country details:", err))
        .finally(() => setLoadingDestinations(false));
    } else {
      setSelectedCountry(null);
    }
  }, [isOpen, selectedCountryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCountryId) {
      alert("Please select a country destination");
      return;
    }
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const parsedPrivatePrice = Number(formData.privateRoomPrice);
      const parsedSharedPrice = Number(formData.sharedRoomPrice);

      if (Number.isNaN(parsedPrivatePrice) || parsedPrivatePrice < 0) {
        alert("Please enter a valid private room price");
        setSubmitting(false);
        return;
      }
      if (Number.isNaN(parsedSharedPrice) || parsedSharedPrice < 0) {
        alert("Please enter a valid shared room price");
        setSubmitting(false);
        return;
      }

      const payload: any = {
        ...formData,
        destination: selectedCountryId,
        privateRoomPrice: parsedPrivatePrice,
        sharedRoomPrice: parsedSharedPrice,
      };

      const url = hotelData
        ? `${api.baseURL}${api.endpoints.hotels.update(hotelData._id)}`
        : `${api.baseURL}${api.endpoints.hotels.create}`;

      const method = hotelData ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        onCreated(data.data.hotel || data.data);
        onClose();
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error submitting hotel:", error);
      alert("Failed to submit hotel");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          margin: "16px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
            backgroundColor: "white",
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111827", margin: 0 }}>
            {hotelData ? "Edit Hotel" : "Create New Hotel"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "4px" }}
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Form Content - scrollable */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px",
              minHeight: 0,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Name */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                  Hotel Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Hotel Grandeur"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: "#111827",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Country Selection (Only if destinationId is not predefined) */}
              {!destinationId && (
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                    Destination Country <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    required
                    value={selectedCountryId}
                    onChange={(e) => {
                      setSelectedCountryId(e.target.value);
                      setFormData((prev) => ({ ...prev, location: "" }));
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      color: "#111827",
                      outline: "none",
                      boxSizing: "border-box",
                      backgroundColor: "white",
                    }}
                  >
                    <option value="">Select country</option>
                    {countries.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Location Selector (Fetched from Country Destinations in DB) */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                  Location (City/Destination) <span style={{ color: "#ef4444" }}>*</span>
                </label>
                {loadingDestinations ? (
                  <div style={{ fontSize: "13px", color: "#6b7280", padding: "6px 0" }}>Loading destinations...</div>
                ) : selectedCountry ? (
                  selectedCountry.destinations && selectedCountry.destinations.length > 0 ? (
                    <select
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "14px",
                        color: "#111827",
                        outline: "none",
                        boxSizing: "border-box",
                        backgroundColor: "white",
                      }}
                    >
                      <option value="">Select location</option>
                      {selectedCountry.destinations.map((d: any) => (
                        <option key={d._id || d.name} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ fontSize: "13px", color: "#ef4444", padding: "6px 0" }}>
                      No locations found for {selectedCountry.name}. Please add one in Location settings first.
                    </div>
                  )
                ) : (
                  <div style={{ fontSize: "13px", color: "#6b7280", padding: "6px 0" }}>
                    Please select a country first.
                  </div>
                )}
              </div>

              {/* Pricing section */}
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                    Private Room Price (USD) <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.privateRoomPrice}
                    onChange={(e) => setFormData({ ...formData, privateRoomPrice: e.target.value })}
                    placeholder="e.g. 130"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      color: "#111827",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                    Shared Room Price (USD) <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.sharedRoomPrice}
                    onChange={(e) => setFormData({ ...formData, sharedRoomPrice: e.target.value })}
                    placeholder="e.g. 65"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      color: "#111827",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                  Hotel Image
                </label>
                <div
                  onClick={() => setShowImagePicker(true)}
                  style={{
                    border: "2px dashed #d1d5db",
                    borderRadius: "8px",
                    padding: "16px",
                    textAlign: "center",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    height: "100px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {formData.image ? (
                    <>
                      <img
                        src={formData.image}
                        alt="Preview"
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          backgroundColor: "rgba(0,0,0,0.4)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: 0,
                          transition: "opacity 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                      >
                        Change Image
                      </div>
                    </>
                  ) : (
                    <div style={{ color: "#9ca3af" }}>
                      <span style={{ fontSize: "14px", display: "block" }}>Click to select/upload image</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              padding: "16px 20px",
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              backgroundColor: "#f9fafb",
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#374151",
                backgroundColor: "white",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: 500,
                color: "white",
                backgroundColor: submitting ? "#d1d5db" : "#111827",
                border: "none",
                borderRadius: "6px",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Saving..." : hotelData ? "Save Changes" : "Create Hotel"}
            </button>
          </div>
        </form>
      </div>
      <ImagePickerModal
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={(urls) => {
          if (urls.length > 0) {
            setFormData((prev) => ({ ...prev, image: urls[0] }));
          }
        }}
        multiple={false}
      />
    </div>,
    document.body
  );
}
