"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface Interest {
  _id: string;
  name: string;
  shortDescription?: string;
  color?: string;
  url?: string;
}

export default function EditInterestPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");

  useEffect(() => {
    if (id) {
      fetchInterest();
    }
  }, [id]);

  const fetchInterest = async () => {
    try {
      const res = await fetch(`${api.baseURL}${api.endpoints.interests.getById(id)}`);
      const data = await res.json();

      if (data.status === "success") {
        const interest: Interest = data.data.interest;
        setName(interest.name || "");
        setShortDescription(interest.shortDescription || "");
      }
    } catch (error) {
      console.error("Error fetching interest:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Interest Name is required");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`${api.baseURL}${api.endpoints.interests.update(id)}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          shortDescription: shortDescription.trim(),
        })
      });

      const data = await res.json();
      if (data.status === "success") {
        alert("Interest updated successfully");
        router.refresh();
      } else {
        alert(data.message || "Failed to update interest");
      }
    } catch (error) {
      console.error("Error updating interest:", error);
      alert("Failed to update interest");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-zinc-500 animate-pulse">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/interests"
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-gray-50 shadow-sm"
            >
              Back
            </Link>
            <h1 className="text-lg font-bold text-zinc-800">Edit Interest</h1>
          </div>
          <button
            form="interest-form"
            type="submit"
            disabled={saving}
            className="rounded-md bg-zinc-900 border border-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 shadow-sm"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="mx-auto mt-8 w-full max-w-3xl px-6">
        <form
          id="interest-form"
          onSubmit={handleSave}
          className="space-y-5 rounded-md border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Interest Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm placeholder:text-gray-400"
              placeholder="e.g. Wildlife"
              required
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
        </form>
      </div>
    </div>
  );
}
