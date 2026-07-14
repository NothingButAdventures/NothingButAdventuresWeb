"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import ImagePickerModal from "@/components/ImagePickerModal";

export default function EditActivityPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Master data
  const [countries, setCountries] = useState<any[]>([]);
  const [travelStyles, setTravelStyles] = useState<any[]>([]);
  const [physicalRatings, setPhysicalRatings] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    destination: "",
    travelStyles: [] as string[],
    isFree: false,
    physicalRating: "",
    coverImage: "",
    location: "",
    price: "",
    duration: "",
  });

  const [destinations, setDestinations] = useState<any[]>([]);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [addingLocation, setAddingLocation] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [countriesRes, stylesRes, ratingsRes, activityRes] = await Promise.all([
        fetch(`${api.baseURL}${api.endpoints.countries.getAll}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${api.baseURL}${api.endpoints.travelStyles.getAll}`),
        fetch(`${api.baseURL}${api.endpoints.physicalRatings?.getAll || '/api/v1/physical-ratings'}`),
        fetch(`${api.baseURL}${api.endpoints.activities.getById(id as string)}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const [countriesData, stylesData, ratingsData, activityData] = await Promise.all([
        countriesRes.json(),
        stylesRes.json(),
        ratingsRes.json(),
        activityRes.json(),
      ]);

      setCountries(countriesData.data.countries || []);
      setTravelStyles(stylesData.data.travelStyles || []);
      setPhysicalRatings(ratingsData.data.physicalRatings || []);
      
      const act = activityData.data.activity;
      setFormData({
        title: act.title,
        description: act.description,
        destination: act.destination?._id || act.destination,
        travelStyles: act.travelStyles?.map((s: any) => s._id || s) || (act.travelStyle ? [act.travelStyle?._id || act.travelStyle] : []),
        isFree: act.isFree,
        physicalRating: act.physicalRating?._id || act.physicalRating || "",
        coverImage: act.coverImage,
        location: act.location || "",
        price: act.price?.toString() || "0",
        duration: act.duration || "",
      });

      if (act.destination?._id || act.destination) {
        fetchDestinations(act.destination?._id || act.destination);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDestinations = async (countryId: string) => {
    try {
      const response = await fetch(`${api.baseURL}${api.endpoints.countries.getById(countryId)}`);
      const data = await response.json();
      if (data.status === "success") {
        setDestinations(data.data.country.destinations || []);
      }
    } catch (error) {
      console.error("Error fetching destinations:", error);
    }
  };

  useEffect(() => {
    if (formData.destination) {
      fetchDestinations(formData.destination);
    } else {
      setDestinations([]);
      setFormData(prev => ({ ...prev, location: "" }));
    }
  }, [formData.destination]);

  const handleAddLocation = async () => {
    if (!locationSearch.trim() || !formData.destination) return;
    setAddingLocation(true);
    try {
      const token = localStorage.getItem("token");
      const updatedDestinations = [
        ...destinations,
        { name: locationSearch.trim(), description: "" },
      ];
      
      const response = await fetch(`${api.baseURL}/countries/${formData.destination}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ destinations: updatedDestinations }),
      });

      const data = await response.json();
      if (data.status === "success") {
        setDestinations(data.data.country.destinations || []);
        setFormData({ ...formData, location: locationSearch.trim() });
        setShowLocationPopup(false);
        setLocationSearch("");
      } else {
        alert("Failed to add location: " + data.message);
      }
    } catch (error) {
      console.error("Error adding location:", error);
      alert("Failed to add location");
    } finally {
      setAddingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      if (formData.travelStyles.length === 0) {
        alert("Please select at least one travel style");
        setSubmitting(false);
        return;
      }

      const payload: any = {
        ...formData,
        price: formData.isFree ? 0 : Number(formData.price),
      };

      if (!payload.physicalRating) {
        delete payload.physicalRating;
      }

      const response = await fetch(`${api.baseURL}${api.endpoints.activities.update(id as string)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push("/admin/activities");
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating activity:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center text-zinc-500 animate-pulse font-medium">Loading form details...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/activities"
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-gray-50 shadow-sm"
            >
              Back
            </Link>
            <div>
              <h1 className="text-lg font-bold text-zinc-800">Edit Activity</h1>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-md bg-zinc-900 border border-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2 cursor-pointer"
          >
            {submitting && (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {submitting ? "Updating Activity..." : "Update Activity"}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-md border border-gray-200 shadow-sm p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">Title</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-800"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">Description</label>
            <textarea
              required
              rows={4}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-800 resize-y"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Destination (Country)</label>
              <select
                required
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-800"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              >
                <option value="">Select country</option>
                {countries.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            {formData.destination && (
              <div className="relative">
                <label className="block text-sm font-semibold text-zinc-700 mb-1">Location</label>
                <input
                  type="text"
                  readOnly
                  placeholder="Select a location"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-800 cursor-pointer"
                  value={formData.location}
                  onClick={() => setShowLocationPopup(true)}
                />
                
                {showLocationPopup && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-md border border-gray-200 w-full max-w-md shadow-lg overflow-hidden">
                      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
                        <h3 className="font-bold text-zinc-800">Select Location</h3>
                        <button 
                          type="button"
                          onClick={() => setShowLocationPopup(false)}
                          className="p-1 hover:bg-gray-100 rounded-full cursor-pointer"
                        >
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="p-4">
                        <input
                          type="text"
                          placeholder="Search locations..."
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-800 mb-4"
                          value={locationSearch}
                          onChange={(e) => setLocationSearch(e.target.value)}
                          autoFocus
                        />
                        <div className="space-y-1 max-h-[300px] overflow-y-auto">
                          {destinations
                            .filter(d => d.name.toLowerCase().includes(locationSearch.toLowerCase()))
                            .slice(0, 10)
                            .map((d) => (
                              <button
                                key={d._id || d.name}
                                type="button"
                                className="w-full text-left px-3 py-2.5 hover:bg-gray-100/70 rounded-md transition-colors flex items-center gap-3 group cursor-pointer border-none"
                                onClick={() => {
                                  setFormData({ ...formData, location: d.name });
                                  setShowLocationPopup(false);
                                  setLocationSearch("");
                                }}
                              >
                                <div className="w-8 h-8 rounded-md bg-zinc-100 flex items-center justify-center border border-zinc-200">
                                  <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                </div>
                                <span className="font-semibold text-zinc-800 text-sm">{d.name}</span>
                              </button>
                            ))}
                          {destinations.filter(d => d.name.toLowerCase().includes(locationSearch.toLowerCase())).length === 0 && (
                            <div className="text-center py-8 text-gray-500 text-xs flex flex-col items-center gap-3">
                              <p className="font-medium">No locations found</p>
                              {locationSearch.trim() !== "" && (
                                <button
                                  type="button"
                                  onClick={handleAddLocation}
                                  disabled={addingLocation}
                                  className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-900 text-white rounded-md text-xs font-semibold hover:bg-zinc-800 transition disabled:opacity-50 cursor-pointer shadow-sm"
                                >
                                  {addingLocation ? "Adding..." : `Add "${locationSearch.trim()}"`}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Travel Styles</label>
            <div className="flex flex-wrap gap-2">
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
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition border cursor-pointer shadow-sm ${
                  formData.travelStyles.length === travelStyles.length && travelStyles.length > 0
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-700 border-gray-300 hover:bg-gray-50"
                }`}
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
                      setFormData({ ...formData, travelStyles: current.filter((id) => id !== s._id) });
                    } else {
                      setFormData({ ...formData, travelStyles: [...current, s._id] });
                    }
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition border cursor-pointer shadow-sm ${
                    formData.travelStyles.includes(s._id)
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-white text-zinc-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
            {formData.travelStyles.length === 0 && (
              <p className="text-red-500 text-[10px] font-semibold mt-1.5">Please select at least one travel style</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">Physical Rating (Optional)</label>
            <select
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-800"
              value={formData.physicalRating}
              onChange={(e) => setFormData({ ...formData, physicalRating: e.target.value })}
            >
              <option value="">Select rating</option>
              {physicalRatings.map((r) => (
                <option key={r._id} value={r._id}>Level {r.level} - {r.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2.5 pt-2">
            <input
              type="checkbox"
              id="isFree"
              className="w-4 h-4 rounded border-gray-300 text-zinc-900 focus:ring-zinc-500 focus:ring-2"
              checked={formData.isFree}
              onChange={(e) => setFormData({ ...formData, isFree: e.target.checked, price: e.target.checked ? "0" : formData.price })}
            />
            <label htmlFor="isFree" className="text-sm font-semibold text-zinc-700">This is a free activity</label>
          </div>

          {!formData.isFree && (
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required={!formData.isFree}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-800"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g. 49.99"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">Duration (in hrs)</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-800"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="e.g. 2.5"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">Cover Image</label>
            <div 
              onClick={() => setShowImagePicker(true)}
              className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-50 transition-colors cursor-pointer relative overflow-hidden group min-h-[140px] items-center bg-gray-50/30 shadow-inner"
            >
              {formData.coverImage ? (
                <div className="absolute inset-0">
                  <img src={formData.coverImage} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-zinc-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">Select/Upload Image</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-center">
                  <p className="text-xs text-gray-500 font-semibold">Click to select from Media Library or Upload</p>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
      <ImagePickerModal
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={(urls) => {
          if (urls.length > 0) {
            setFormData({ ...formData, coverImage: urls[0] });
          }
        }}
        multiple={false}
      />
    </div>
  );
}
