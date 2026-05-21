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

  // Image selection is now handled via ImagePickerModal

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

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/activities" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Activity</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              required
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Destination</label>
              <select
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              >
                <option value="">Select country</option>
                {countries.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Travel Styles</label>
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
                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors border ${
                  formData.travelStyles.length === travelStyles.length && travelStyles.length > 0
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
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
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                    formData.travelStyles.includes(s._id)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
            {formData.travelStyles.length === 0 && (
              <p className="text-red-500 text-xs mt-1">Please select at least one travel style</p>
            )}
          </div>

          {formData.destination && (
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
              <input
                type="text"
                readOnly
                placeholder="Select a location"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
                value={formData.location}
                onClick={() => setShowLocationPopup(true)}
              />
              
              {showLocationPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                  <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">Select Location</h3>
                      <button 
                        type="button"
                        onClick={() => setShowLocationPopup(false)}
                        className="p-1 hover:bg-gray-100 rounded-full"
                      >
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-4">
                      <input
                        type="text"
                        placeholder="Search locations..."
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 mb-4"
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
                              className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-xl transition-colors flex items-center gap-3 group"
                              onClick={() => {
                                setFormData({ ...formData, location: d.name });
                                setShowLocationPopup(false);
                                setLocationSearch("");
                              }}
                            >
                              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-blue-100">
                                <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <span className="font-medium text-gray-700">{d.name}</span>
                            </button>
                          ))}
                        {destinations.filter(d => d.name.toLowerCase().includes(locationSearch.toLowerCase())).length === 0 && (
                          <div className="text-center py-8 text-gray-500 text-sm flex flex-col items-center gap-3">
                            <p>No locations found</p>
                            {locationSearch.trim() !== "" && (
                              <button
                                type="button"
                                onClick={handleAddLocation}
                                disabled={addingLocation}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
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

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Physical Rating (Optional)</label>
            <select
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              value={formData.physicalRating}
              onChange={(e) => setFormData({ ...formData, physicalRating: e.target.value })}
            >
              <option value="">Select rating</option>
              {physicalRatings.map((r) => (
                <option key={r._id} value={r._id}>Level {r.level} - {r.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isFree"
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={formData.isFree}
              onChange={(e) => setFormData({ ...formData, isFree: e.target.checked, price: e.target.checked ? "0" : formData.price })}
            />
            <label htmlFor="isFree" className="text-sm font-semibold text-gray-700">This is a free activity</label>
          </div>

          {!formData.isFree && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required={!formData.isFree}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g. 49.99"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (in hrs)</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="e.g. 2.5"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image</label>
            <div 
              onClick={() => setShowImagePicker(true)}
              className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-400 transition-colors cursor-pointer relative overflow-hidden group min-h-[140px] items-center"
            >
              {formData.coverImage ? (
                <div className="absolute inset-0">
                  <img src={formData.coverImage} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Select/Upload Image</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-center">
                  <p className="text-sm text-gray-600">Click to select from Media Library or Upload</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-500/30 transition transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
            >
              {submitting ? "Updating Activity..." : "Update Activity"}
            </button>
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
