"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import ImagePickerModal from "@/components/ImagePickerModal";

interface TravelStyle {
  _id: string;
  name: string;
  shortDescription?: string;
  icon?: string;
  color?: string;
  url?: string;
}

export default function EditTravelStylePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [color, setColor] = useState("#3B82F6");
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (id) {
      fetchTravelStyle();
    }
  }, [id]);

  const fetchTravelStyle = async () => {
    try {
      const res = await fetch(`${api.baseURL}/travel-styles/${id}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (data.status === "success") {
        const style: TravelStyle = data.data.travelStyle;
        setName(style.name || "");
        setShortDescription(style.shortDescription || "");
        setIcon(style.icon || "");
        setColor(style.color || "#3B82F6");
        setUrl(style.url || "");
      }
    } catch (error) {
      console.error("Error fetching travel style:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Travel Style Name is required");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`${api.baseURL}/travel-styles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          shortDescription: shortDescription.trim(),
          icon: icon.trim() || undefined,
          color: color.trim() || "#3B82F6",
          url: url.trim(),
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (data.status === "success") {
        alert("Travel style updated successfully");
        router.refresh();
      } else {
        alert(data.message || "Failed to update travel style");
      }
    } catch (error) {
      console.error("Error updating travel style:", error);
      alert("Failed to update travel style");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-zinc-500 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/travel-styles"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 border border-zinc-200 bg-white transition hover:bg-zinc-50 shadow-sm"
            >
              Back
            </Link>
            <h1 className="text-xl font-bold text-zinc-800">Edit Travel Style</h1>
          </div>
          <button
            form="travel-style-form"
            type="submit"
            disabled={saving}
            className="rounded-md bg-zinc-900 border border-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 shadow-sm"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="mx-auto mt-8 w-full max-w-3xl px-6">
        <form
          id="travel-style-form"
          onSubmit={handleSave}
          className="space-y-5 rounded-md border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Travel Style Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm placeholder:text-gray-400"
              placeholder="Classic"
              required
            />
          </div>

          {/* Travel Style Icon */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Travel Style Icon</label>
            <div className="flex items-center gap-4">
              {icon ? (
                <div className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center shadow-sm group">
                  <img src={icon} alt="Icon Preview" className="w-full h-full object-contain p-1.5" />
                  <button
                    type="button"
                    onClick={() => setIcon("")}
                    className="absolute inset-0 bg-zinc-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-medium text-xs border-none cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => setShowIconPicker(true)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-zinc-700 hover:bg-gray-50 rounded-md transition shadow-sm text-xs font-semibold cursor-pointer"
              >
                {icon ? "Change Icon" : "Select/Upload Icon"}
              </button>
            </div>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full mt-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs focus:outline-none focus:border-zinc-400 transition placeholder:text-gray-400 text-zinc-700"
              placeholder="Or paste icon image URL..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Short Description</label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm placeholder:text-gray-400"
              placeholder="Short text for cards"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Brand Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded-md border border-gray-300 shadow-sm"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm uppercase placeholder:text-gray-400"
                placeholder="#3B82F6"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm placeholder:text-gray-400"
              placeholder="/travel-styles/classic"
            />
            <p className="mt-1.5 text-xs text-gray-500">This URL will be used when users click this style on /travel-styles.</p>
          </div>
        </form>
      </div>

      <ImagePickerModal
        isOpen={showIconPicker}
        onClose={() => setShowIconPicker(false)}
        onSelect={(urls) => {
          if (urls.length > 0) setIcon(urls[0]);
          setShowIconPicker(false);
        }}
        multiple={false}
        folder="travel-style-images"
      />
    </div>
  );
}
