import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { api } from "@/lib/api";
import { uploadActivityImage } from "../lib/firebase";
import ImagePickerModal from "./ImagePickerModal";
import { X } from "@phosphor-icons/react";

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (activity: any) => void;
  /** The country ID (destination) already selected on the tour */
  destinationId: string;
  /** Location tags available for the current itinerary day */
  locationTags: string[];
}

export default function CreateActivityModal({
  isOpen,
  onClose,
  onCreated,
  destinationId,
  locationTags,
}: CreateActivityModalProps) {
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Master data
  const [travelStyles, setTravelStyles] = useState<any[]>([]);
  const [physicalRatings, setPhysicalRatings] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    travelStyles: [] as string[],
    isFree: false,
    price: "",
    physicalRating: "",
    coverImage: "",
    location: locationTags.length === 1 ? locationTags[0] : "",
    duration: "",
  });

  const [showImagePicker, setShowImagePicker] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchMasterData();
      // Reset form
      setFormData({
        title: "",
        description: "",
        travelStyles: [],
        isFree: false,
        price: "",
        physicalRating: "",
        coverImage: "",
        location: locationTags.length === 1 ? locationTags[0] : "",
        duration: "",
      });
    }
  }, [isOpen, locationTags]);

  const fetchMasterData = async () => {
    try {
      const [stylesRes, ratingsRes] = await Promise.all([
        fetch(`${api.baseURL}${api.endpoints.travelStyles.getAll}`),
        fetch(`${api.baseURL}${api.endpoints.physicalRatings?.getAll || "/api/v1/physical-ratings"}`),
      ]);
      const [stylesData, ratingsData] = await Promise.all([
        stylesRes.json(),
        ratingsRes.json(),
      ]);
      setTravelStyles(stylesData.data.travelStyles || []);
      setPhysicalRatings(ratingsData.data.physicalRatings || []);
    } catch (error) {
      console.error("Error fetching master data:", error);
    }
  };

  // Image selection is handled via ImagePickerModal

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const parsedPrice = Number(formData.price);
      if (!formData.isFree && (!formData.price || Number.isNaN(parsedPrice) || parsedPrice <= 0)) {
        alert("Please enter a valid price for paid activity");
        setSubmitting(false);
        return;
      }

      if (formData.travelStyles.length === 0) {
        alert("Please select at least one travel style");
        setSubmitting(false);
        return;
      }

      if (!formData.location) {
        alert("Please select a location");
        setSubmitting(false);
        return;
      }

      const payload: any = {
        ...formData,
        destination: destinationId,
        price: formData.isFree ? 0 : parsedPrice,
      };

      if (!payload.physicalRating) {
        delete payload.physicalRating;
      }

      const response = await fetch(`${api.baseURL}${api.endpoints.activities.create}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        onCreated(data.data.activity || data.data);
        onClose();
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error creating activity:", error);
      alert("Failed to create activity");
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
            Create New Activity
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
              {/* Title */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                  Title <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Scuba Diving in Great Barrier Reef"
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

              {/* Description */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                  Description <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the activity..."
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: "#111827",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Location (only if multiple location tags) */}
              {locationTags.length > 1 && (
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                    Location <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {locationTags.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setFormData({ ...formData, location: loc })}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "20px",
                          fontSize: "13px",
                          fontWeight: 500,
                          border: "1px solid",
                          cursor: "pointer",
                          borderColor: formData.location === loc ? "#111827" : "#d1d5db",
                          backgroundColor: formData.location === loc ? "#111827" : "white",
                          color: formData.location === loc ? "white" : "#374151",
                          transition: "all 0.15s",
                        }}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Travel Styles */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                  Travel Styles <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => {
                      const allIds = travelStyles.map(s => s._id);
                      if (formData.travelStyles.length === allIds.length) {
                        setFormData({ ...formData, travelStyles: [] });
                      } else {
                        setFormData({ ...formData, travelStyles: allIds });
                      }
                    }}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 700,
                      border: "1px solid",
                      cursor: "pointer",
                      borderColor: formData.travelStyles.length === travelStyles.length && travelStyles.length > 0 ? "#2563eb" : "#d1d5db",
                      backgroundColor: formData.travelStyles.length === travelStyles.length && travelStyles.length > 0 ? "#2563eb" : "#f3f4f6",
                      color: formData.travelStyles.length === travelStyles.length && travelStyles.length > 0 ? "white" : "#1f2937",
                      transition: "all 0.15s",
                    }}
                  >
                    {formData.travelStyles.length === travelStyles.length && travelStyles.length > 0 ? "Deselect All" : "Select All"}
                  </button>
                  {travelStyles.map((s) => (
                    <button
                      key={s._id}
                      type="button"
                      onClick={() => {
                        const current = formData.travelStyles;
                        if (current.includes(s._id)) {
                          setFormData({ ...formData, travelStyles: current.filter((id: string) => id !== s._id) });
                        } else {
                          setFormData({ ...formData, travelStyles: [...current, s._id] });
                        }
                      }}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 500,
                        border: "1px solid",
                        cursor: "pointer",
                        borderColor: formData.travelStyles.includes(s._id) ? "#2563eb" : "#d1d5db",
                        backgroundColor: formData.travelStyles.includes(s._id) ? "#2563eb" : "white",
                        color: formData.travelStyles.includes(s._id) ? "white" : "#374151",
                        transition: "all 0.15s",
                      }}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Physical Rating */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                  Physical Rating <span style={{ fontSize: "11px", fontWeight: 400, color: "#6b7280" }}>(Optional)</span>
                </label>
                <select
                  value={formData.physicalRating}
                  onChange={(e) => setFormData({ ...formData, physicalRating: e.target.value })}
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
                  <option value="">Select rating</option>
                  {physicalRatings.map((r) => (
                    <option key={r._id} value={r._id}>
                      Level {r.level} - {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Free checkbox */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  id="createActivityIsFree"
                  checked={formData.isFree}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isFree: e.target.checked,
                      price: e.target.checked ? "0" : formData.price,
                    })
                  }
                  style={{ width: "16px", height: "16px" }}
                />
                <label htmlFor="createActivityIsFree" style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>
                  This is a free activity
                </label>
              </div>

              {/* Price & Duration */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {!formData.isFree && (
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                      Price
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      required={!formData.isFree}
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g. 49.99"
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
                )}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                    Duration (hrs)
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 2.5"
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
                  Cover Image
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
                  {formData.coverImage ? (
                    <>
                      <img
                        src={formData.coverImage}
                        alt="Preview"
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          backgroundColor: "rgba(0,0,0,0.4)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: 0,
                          transition: "opacity 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                      >
                        <span style={{ color: "white", fontSize: "13px", fontWeight: 500 }}>Select/Upload Image</span>
                      </div>
                    </>
                  ) : (
                    <div>
                      <p style={{ fontSize: "13px", color: "#6b7280" }}>Click to select or upload</p>
                      <p style={{ fontSize: "11px", color: "#9ca3af" }}>PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              flexShrink: 0,
              padding: "12px 20px",
              borderTop: "1px solid #e5e7eb",
              backgroundColor: "#f9fafb",
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 16px",
                fontSize: "13px",
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
                fontSize: "13px",
                fontWeight: 500,
                color: "white",
                backgroundColor: submitting ? "#d1d5db" : "#111827",
                border: "none",
                borderRadius: "6px",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Creating..." : "Create Activity"}
            </button>
          </div>
        </form>
      </div>
      <ImagePickerModal
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={(urls) => {
          if (urls.length > 0) {
            setFormData((prev) => ({ ...prev, coverImage: urls[0] }));
          }
        }}
        multiple={false}
      />
    </div>,
    document.body
  );
}
