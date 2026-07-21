"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { 
  Search, 
  Eye, 
  X, 
  CheckCircle, 
  XCircle, 
  Hourglass, 
  Receipt,
  Ticket,
  FileText
} from "lucide-react";
import toast from "react-hot-toast";

interface Booking {
  _id: string;
  bookingReference: string;
  tour: {
    _id: string;
    name: string;
    slug: string;
    tourCode: string;
    price?: {
      bookingPercentage?: number;
      bookingAmount?: number;
      bookingType?: string;
      amount?: number;
    };
  };
  user: {
    _id: string;
    name: string;
    email: string;
  };
  startDate: string;
  numberOfTravelers: number;
  price: {
    totalPrice: number;
    currency: string;
  };
  payment: {
    method: string;
    status: string;
    lifetimeDepositApplied: number;
    lifetimeDepositCodes: string[];
    transactions: Array<{
      amount: number;
      status: string;
      gateway?: string;
    }>;
  };
  status: string;
  createdAt: string;
  cancellation?: {
    isCancelled: boolean;
    cancelledAt?: string;
    cancelledBy?: string;
    reason?: string;
    refundAmount?: number;
    refundStatus?: "pending" | "processed" | "declined";
    issuedLifetimeDeposits?: Array<{
      code: string;
      amount: number;
      travelerName: string;
    }>;
  };
}

export default function CancellationsPage() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Edit fields
  const [editRefundAmount, setEditRefundAmount] = useState<number>(0);
  const [editRefundStatus, setEditRefundStatus] = useState<"pending" | "processed" | "declined">("pending");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCancelledBookings();
  }, []);

  const fetchCancelledBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${api.baseURL}/bookings?status=cancelled`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch cancelled bookings");
      setBookings(data.data.bookings || []);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong fetching cancellations");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditRefundAmount(booking.cancellation?.refundAmount || 0);
    setEditRefundStatus(booking.cancellation?.refundStatus || "pending");
  };

  const handleUpdateCancellation = async () => {
    if (!selectedBooking) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${api.baseURL}/bookings/${selectedBooking._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cancellation: {
            ...selectedBooking.cancellation,
            refundAmount: editRefundAmount,
            refundStatus: editRefundStatus
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update cancellation");

      toast.success("Cancellation details updated successfully");
      
      // Update local state
      setBookings(prev => prev.map(b => b._id === selectedBooking._id ? { ...b, cancellation: data.data.booking.cancellation } : b));
      setSelectedBooking(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to save updates");
    } finally {
      setSaving(false);
    }
  };

  const calculateFinancials = (booking: Booking) => {
    const cashPaid = booking.payment.transactions.reduce(
      (sum, tx) => (tx.status === "completed" && tx.gateway !== "lifetime_deposit" ? sum + tx.amount : sum),
      0
    );
    const totalPaid = cashPaid + (booking.payment.lifetimeDepositApplied || 0);

    const tour = booking.tour;
    let depositPerPerson = 200;
    if (tour && tour.price) {
      if (tour.price.bookingType === "Amount" && tour.price.bookingAmount) {
        depositPerPerson = tour.price.bookingAmount;
      } else if (tour.price.amount && tour.price.bookingPercentage) {
        depositPerPerson = Math.round(tour.price.amount * (tour.price.bookingPercentage / 100));
      }
    }
    const totalRequiredDeposit = depositPerPerson * booking.numberOfTravelers;
    const heldDeposit = tour.price?.bookingType === "Amount" && tour.price?.bookingAmount === 0 ? 0 : Math.min(totalPaid, totalRequiredDeposit);

    return {
      cashPaid,
      totalPaid,
      heldDeposit
    };
  };

  // Filter logic
  const filteredBookings = bookings.filter(b => {
    const { totalPaid } = calculateFinancials(b);
    const matchesSearch = 
      b.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.tour.name.toLowerCase().includes(searchTerm.toLowerCase());

    const status = b.cancellation?.refundStatus || "pending";
    const matchesStatus = statusFilter === "all" || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Cancellation Management</h1>
            <p className="text-xs text-gray-500 mt-0.5">Review booking cancellations, adjust refunds, and track Lifetime Deposits</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-8 max-w-7xl w-full mx-auto">
        {/* Controls Card */}
        <div className="bg-white rounded-md border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Search reference, customer, or tour..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition text-zinc-800"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex border border-gray-200 rounded-md overflow-hidden bg-gray-50">
              {["all", "pending", "processed", "declined"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                    statusFilter === filter
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-gray-100"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Listings Table */}
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-16 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Booking Ref</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Tour Details</th>
                    <th className="px-6 py-3 text-right">Total Paid</th>
                    <th className="px-6 py-3 text-right">Deposit Held (LTD)</th>
                    <th className="px-6 py-3 text-right">Refund Amount</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white text-sm text-zinc-800">
                  {filteredBookings.map((b) => {
                    const { cashPaid, totalPaid, heldDeposit } = calculateFinancials(b);
                    const status = b.cancellation?.refundStatus || "pending";
                    return (
                      <tr key={b._id} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4 font-mono font-bold text-zinc-700">{b.bookingReference}</td>
                        <td className="px-6 py-4">
                          <div className="font-semibold">{b.user.name}</div>
                          <div className="text-xs text-gray-500">{b.user.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-zinc-900">{b.tour.name}</div>
                          <div className="text-xs text-gray-500">
                            Starts: {new Date(b.startDate).toLocaleDateString()} • {b.numberOfTravelers} traveler(s)
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold">${totalPaid.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right font-medium text-purple-600">${heldDeposit.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right font-bold text-green-600">${(b.cancellation?.refundAmount || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                          {status === "processed" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              <CheckCircle size={12} /> Processed
                            </span>
                          )}
                          {status === "declined" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
                              <XCircle size={12} /> Declined
                            </span>
                          )}
                          {status === "pending" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                              <Hourglass size={12} /> Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleOpenDetails(b)}
                            className="p-1.5 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900 rounded-md border border-gray-200 transition cursor-pointer"
                            title="View / Process Cancellation"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500 font-medium">
              No cancelled bookings found matching the search criteria.
            </div>
          )}
        </div>
      </div>

      {/* Details & Update Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-md w-full max-w-xl overflow-hidden shadow-xl flex flex-col max-h-[90vh] border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-base font-bold text-zinc-800">Process Refund: {selectedBooking.bookingReference}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Manage transaction settlement and status</p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-zinc-800 transition p-1 hover:bg-gray-100 rounded-md cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Financial Stats Grid */}
              {(() => {
                const { totalPaid, heldDeposit } = calculateFinancials(selectedBooking);
                return (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-center">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                        <Receipt size={14} /> Paid Total
                      </div>
                      <div className="text-lg font-bold text-zinc-800">${totalPaid.toLocaleString()}</div>
                    </div>
                    <div className="bg-purple-50 border border-purple-100 rounded-md p-3 text-center">
                      <div className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                        <Ticket size={14} /> Deposit Held
                      </div>
                      <div className="text-lg font-bold text-purple-700">${heldDeposit.toLocaleString()}</div>
                    </div>
                    <div className="bg-green-50 border border-green-150 rounded-md p-3 text-center">
                      <div className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                        <FileText size={14} /> Cash Refund
                      </div>
                      <div className="text-lg font-bold text-green-700">${editRefundAmount.toLocaleString()}</div>
                    </div>
                  </div>
                );
              })()}

              {/* Policy/Reason */}
              <div className="space-y-3">
                <div className="bg-zinc-50 border border-gray-200 rounded-md p-4 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Cancellation Date:</span>
                    <span className="text-zinc-800 font-semibold">
                      {selectedBooking.cancellation?.cancelledAt ? new Date(selectedBooking.cancellation.cancelledAt).toLocaleString() : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Cancellation Reason:</span>
                    <span className="text-zinc-800 font-semibold">{selectedBooking.cancellation?.reason || "No reason provided"}</span>
                  </div>
                </div>
              </div>

              {/* Issued Lifetime Deposits */}
              {selectedBooking.cancellation?.issuedLifetimeDeposits && selectedBooking.cancellation.issuedLifetimeDeposits.length > 0 && (
                <div className="border border-purple-150 rounded-md p-4 bg-purple-50/20 space-y-2">
                  <h4 className="text-xs font-bold text-purple-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    🎟️ Issued Lifetime Deposit Vouchers
                  </h4>
                  <div className="space-y-1.5">
                    {selectedBooking.cancellation.issuedLifetimeDeposits.map((dep, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs bg-white p-2 rounded border border-purple-100">
                        <div>
                          <span className="font-mono font-bold text-purple-700">{dep.code}</span>
                          <span className="text-gray-500 ml-2">({dep.travelerName})</span>
                        </div>
                        <div className="font-extrabold text-purple-800">${dep.amount.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Controls */}
              <div className="space-y-4 border-t border-gray-200 pt-4">
                {/* Refund Status */}
                <div>
                  <label className="block text-xs font-bold text-[#3F3F42] uppercase tracking-wider mb-2">
                    Settlement Status
                  </label>
                  <select
                    value={editRefundStatus}
                    onChange={(e) => setEditRefundStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-[#3F3F42] bg-white cursor-pointer"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="processed">Refund Processed</option>
                    <option value="declined">Refund Declined</option>
                  </select>
                </div>

                {/* Refund Amount */}
                <div>
                  <label className="block text-xs font-bold text-[#3F3F42] uppercase tracking-wider mb-2">
                    Adjust Refund Amount ($)
                  </label>
                  <input
                    type="number"
                    value={editRefundAmount}
                    onChange={(e) => setEditRefundAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition text-zinc-800 font-bold"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    * Make adjustments if custom calculations or partial refunds are agreed upon with the customer.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedBooking(null)}
                className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded-md shadow-sm text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCancellation}
                disabled={saving}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-2 px-4 rounded-md shadow-sm text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                {saving ? "Saving..." : "Save Settlement Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
