"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { uploadActivityImage } from "@/lib/firebase";

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
    travelStyle: "",
    isFree: false,
    physicalRating: "",
    ageGroup: "",
    coverImage: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

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
        travelStyle: act.travelStyle?._id || act.travelStyle,
        isFree: act.isFree,
        physicalRating: act.physicalRating?._id || act.physicalRating,
        ageGroup: act.ageGroup,
        coverImage: act.coverImage,
      });
      setImagePreview(act.coverImage);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      let coverImageUrl = formData.coverImage;

      if (imageFile) {
        coverImageUrl = await uploadActivityImage(imageFile);
      }

      const response = await fetch(`${api.baseURL}${api.endpoints.activities.update.replace(":id", id as string)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, coverImage: coverImageUrl }),
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Travel Style</label>
              <select
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                value={formData.travelStyle}
                onChange={(e) => setFormData({ ...formData, travelStyle: e.target.value })}
              >
                <option value="">Select style</option>
                {travelStyles.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Physical Rating</label>
              <select
                required
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Age Group</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                value={formData.ageGroup}
                onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isFree"
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={formData.isFree}
              onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
            />
            <label htmlFor="isFree" className="text-sm font-semibold text-gray-700">This is a free activity</label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image</label>
            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-400 transition-colors cursor-pointer relative overflow-hidden group">
              {imagePreview ? (
                <div className="absolute inset-0">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Change Image</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-center">
                  <p className="text-sm text-gray-600">Click to upload</p>
                </div>
              )}
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} accept="image/*" />
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
    </div>
  );
}
