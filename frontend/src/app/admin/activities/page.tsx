"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Activity {
  _id: string;
  title: string;
  slug: string;
  destination: {
    _id: string;
    name: string;
  };
  travelStyles: {
    _id: string;
    name: string;
  }[];
  physicalRating: {
    _id: string;
    name: string;
    level: number;
  };
  ageGroup: string;
  isFree: boolean;
  coverImage: string;
  isActive: boolean;
  price?: number;
  location?: string;
  duration?: string;
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${api.baseURL}${api.endpoints.activities.getAll}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.data.activities);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      setDeleteLoading(id);
      const token = localStorage.getItem("token");
      const response = await fetch(`${api.baseURL}${api.endpoints.activities.delete(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setActivities(activities.filter((a) => a._id !== id));
      } else {
        const data = await response.json();
        alert(`Failed to delete: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting activity:", error);
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredActivities = activities.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.destination?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="h-8 bg-gray-200 rounded-md w-48 mb-6 animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-md animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-zinc-800 leading-none">Activities</h1>
            <p className="text-gray-555 text-xs mt-1 leading-none">Manage excursions and local experiences</p>
          </div>
          <Link
            href="/admin/activities/create"
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-900 text-white font-medium py-1.5 px-3 rounded-md shadow-sm transition-colors text-xs flex items-center justify-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Activity
          </Link>
        </div>
      </div>

      <div className="p-8">

      {/* Search Filter */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search activities..."
          className="w-full max-w-md px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-800"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Activities Table */}
      <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Activities</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Travel Styles</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Physical Rating</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 italic-off">
            {filteredActivities.map((activity) => (
              <tr key={activity._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {activity.coverImage ? (
                      <img
                        src={activity.coverImage}
                        alt={activity.title}
                        className="w-12 h-12 rounded-md object-cover bg-gray-100 border border-gray-200 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-550 text-xs font-semibold shadow-inner">
                        N/A
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-zinc-800 text-sm">{activity.title}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-650">
                  {activity.destination?.name}
                  {activity.location ? `, ${activity.location}` : ""}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {activity.travelStyles?.slice(0, 2).map((ts) => (
                      <span key={ts._id} className="px-1.5 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-700 rounded-md text-[10px] uppercase font-bold tracking-wide">
                        {ts.name}
                      </span>
                    ))}
                    {activity.travelStyles?.length > 2 && (
                      <span className="px-1.5 py-0.5 bg-zinc-150 border border-zinc-250 text-zinc-750 rounded-md text-[10px] uppercase font-bold tracking-wide">
                        +{activity.travelStyles.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${activity.isFree ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-zinc-100 text-zinc-800 border-zinc-200'}`}>
                    {activity.isFree ? 'Free' : `$${activity.price || 0}`}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-650">
                  {activity.duration ? `${activity.duration} hrs` : "N/A"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm font-medium text-zinc-850">
                    {activity.physicalRating?.level
                      ? `${activity.physicalRating.level} - ${activity.physicalRating.name}`
                      : activity.physicalRating?.name || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1.5">
                    <Link
                      href={`/admin/activities/${activity._id}`}
                      className="p-1.5 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition-colors border border-transparent hover:border-gray-200 shadow-none hover:shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(activity._id, activity.title)}
                      disabled={deleteLoading === activity._id}
                      className="p-1.5 text-zinc-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-200 cursor-pointer shadow-none hover:shadow-sm"
                    >
                      {deleteLoading === activity._id ? (
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
        {filteredActivities.length === 0 && (
          <div className="p-12 text-center text-zinc-500 font-medium">No activities found.</div>
        )}
      </div>
      </div>
    </div>
  );
}
