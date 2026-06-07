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
      <div className="p-8">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#3F3F42]">Activities</h1>
          <p className="text-gray-500 text-sm">Manage excursions and local experiences</p>
        </div>
        <Link
          href="/admin/activities/create"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Activity
        </Link>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search activities..."
          className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest">Activities</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest">Location</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest">Travel Styles</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest">Price</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest">Duration</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest">Physical Rating</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 italic-off">
            {filteredActivities.map((activity) => (
              <tr key={activity._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {activity.coverImage ? (
                      <img
                        src={activity.coverImage}
                        alt={activity.title}
                        className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-medium">
                        N/A
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-[#3F3F42]">{activity.title}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {activity.destination?.name}
                  {activity.location ? `, ${activity.location}` : ""}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {activity.travelStyles?.slice(0, 2).map((ts) => (
                      <span key={ts._id} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] uppercase font-medium tracking-wide">
                        {ts.name}
                      </span>
                    ))}
                    {activity.travelStyles?.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] uppercase font-medium tracking-wide">
                        +{activity.travelStyles.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${activity.isFree ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                    {activity.isFree ? 'Free' : `$${activity.price || 0}`}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {activity.duration ? `${activity.duration} hrs` : "N/A"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm font-medium text-[#3F3F42]">
                    {activity.physicalRating?.level
                      ? `${activity.physicalRating.level} - ${activity.physicalRating.name}`
                      : activity.physicalRating?.name || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/activities/${activity._id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(activity._id, activity.title)}
                      disabled={deleteLoading === activity._id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      {deleteLoading === activity._id ? (
                        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="p-12 text-center text-gray-500">No activities found.</div>
        )}
      </div>
    </div>
  );
}
