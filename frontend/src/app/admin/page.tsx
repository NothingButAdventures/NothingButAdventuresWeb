"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Stats {
  totalTours: number;
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalTours: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      // Fetch tours count
      const toursResponse = await fetch(`${api.baseURL}/tours`);
      if (toursResponse.ok) {
        const toursData = await toursResponse.json();
        setStats((prev) => ({
          ...prev,
          totalTours: toursData.data.tours?.length || 0,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-zinc-800 leading-none">Dashboard</h1>
            <p className="text-gray-500 text-xs mt-1 leading-none">Welcome to the admin panel</p>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Tours */}
          <div className="bg-white rounded-md p-6 border border-gray-200 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-zinc-100 border border-zinc-200 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
              </div>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">Active</span>
            </div>
            <h3 className="text-2xl font-bold text-zinc-800 mb-1">{stats.totalTours}</h3>
            <p className="text-gray-500 text-sm">Total Tours</p>
          </div>

          {/* Total Users */}
          <div className="bg-white rounded-md p-6 border border-gray-200 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-zinc-100 border border-zinc-200 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-zinc-700 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-md">Users</span>
            </div>
            <h3 className="text-2xl font-bold text-zinc-800 mb-1">{stats.totalUsers || "—"}</h3>
            <p className="text-gray-500 text-sm">Total Users</p>
          </div>

          {/* Total Bookings */}
          <div className="bg-white rounded-md p-6 border border-gray-200 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-zinc-100 border border-zinc-200 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">Pending</span>
            </div>
            <h3 className="text-2xl font-bold text-zinc-800 mb-1">{stats.totalBookings || "—"}</h3>
            <p className="text-gray-500 text-sm">Total Bookings</p>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-md p-6 border border-gray-200 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-zinc-100 border border-zinc-200 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">Revenue</span>
            </div>
            <h3 className="text-2xl font-bold text-zinc-800 mb-1">${stats.totalRevenue || "—"}</h3>
            <p className="text-gray-500 text-sm">Total Revenue</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-zinc-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/admin/tours-management/create"
              className="group bg-white border border-gray-200 rounded-md p-5 hover:border-zinc-400 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-100 border border-zinc-200 rounded-md flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6 text-zinc-700 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-800">Create New Tour</h3>
                  <p className="text-gray-500 text-sm">Add a new tour package</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/tours-management"
              className="group bg-white border border-gray-200 rounded-md p-5 hover:border-zinc-400 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-100 border border-zinc-200 rounded-md flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6 text-zinc-700 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-800">Manage Tours</h3>
                  <p className="text-gray-500 text-sm">View and edit tours</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/bookings"
              className="group bg-white border border-gray-200 rounded-md p-5 hover:border-zinc-400 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-100 border border-zinc-200 rounded-md flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6 text-zinc-700 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-800">View Bookings</h3>
                  <p className="text-gray-500 text-sm">Track reservations</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <div className="bg-white rounded-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-zinc-800">Recent Bookings</h2>
              <Link href="/admin/bookings" className="text-zinc-600 hover:text-zinc-900 text-sm font-semibold hover:underline">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-zinc-100 border border-zinc-200 rounded-md flex items-center justify-center">
                      <span className="text-zinc-700 font-medium text-sm">JD</span>
                    </div>
                    <div>
                      <p className="font-medium text-zinc-800 text-sm">Sample Booking {i}</p>
                      <p className="text-gray-500 text-xs">Everest Base Camp Trek</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">Confirmed</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Tours */}
          <div className="bg-white rounded-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-zinc-800">Popular Tours</h2>
              <Link href="/admin/tours-management" className="text-zinc-600 hover:text-zinc-900 text-sm font-semibold hover:underline">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 border border-gray-200 rounded-md"></div>
                    <div>
                      <p className="font-medium text-zinc-800 text-sm">Tour Package {i}</p>
                      <p className="text-gray-500 text-xs">12 bookings this month</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-zinc-800">$1,299</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
