"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

interface BookingDetails {
    _id: string;
    bookingReference: string;
    status: string;
    startDate: string;
    numberOfTravelers: number;
    price: {
        basePrice: number;
        discountAmount: number;
        taxes: number;
        totalPrice: number;
        currency: string;
    };
    payment: {
        method: string;
        status: string;
        transactions?: Array<{
            transactionId: string;
            amount: number;
            paymentDate: string;
        }>;
    };
    installmentPlan?: {
        isActive: boolean;
        subscriptionId?: string;
        totalAmount: number;
        upfrontAmount: number;
        remainingAmount: number;
        numberOfInstallments: number;
        installmentAmount: number;
        deadline: string;
        schedule: Array<{
            installmentNumber: number;
            amount: number;
            dueDate: string;
            type: string;
            status: string;
            paidAt?: string;
            transactionId?: string;
        }>;
    };
    travelers: Array<{
        firstName: string;
        lastName: string;
        email?: string;
        phone?: string;
        address?: string;
        city?: string;
        postalCode?: string;
        country?: string;
    }>;
    extras?: {
        activities?: Array<{
            name: string;
            price: number;
            count: number;
        }>;
        accommodationUpgrade?: {
            name: string;
            price: number;
            count: number;
        };
    };
    tour: {
        _id: string;
        name: string;
        slug: string;
        tourCode: string;
        images?: Array<{ url: string; caption?: string; isPrimary?: boolean }>;
        duration?: {
            days: number;
            nights: number;
        };
        location?: {
            startCity: string;
            endCity: string;
        };
        price?: {
            amount: number;
            currency: string;
        };
    };
    createdAt: string;
}

interface BookingDetailsModalProps {
    booking: BookingDetails;
    onClose: () => void;
}

export default function BookingDetailsModal({ booking: initialBooking, onClose }: BookingDetailsModalProps) {
    const router = useRouter();
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [booking, setBooking] = useState(initialBooking);
    const [isSyncing, setIsSyncing] = useState(false);

    // Sync installment status from PayPal on mount
    useEffect(() => {
        if (booking.installmentPlan?.isActive && booking.installmentPlan?.subscriptionId) {
            syncInstallmentStatus();
        }
    }, []);

    const syncInstallmentStatus = async () => {
        setIsSyncing(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${api.baseURL}/installments/${booking._id}/sync`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok && data.data?.booking) {
                setBooking(data.data.booking);
            }
        } catch (err) {
            console.error("Failed to sync installment status:", err);
        } finally {
            setIsSyncing(false);
        }
    };

    // Lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "confirmed":
                return "bg-green-100 text-green-700";
            case "pending":
                return "bg-yellow-100 text-yellow-700";
            case "completed":
                return "bg-blue-100 text-blue-700";
            case "cancelled":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-[#3F3F42]";
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: booking.price.currency || 'USD',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const primaryImage = booking.tour.images?.find((img) => img.isPrimary) || booking.tour.images?.[0];

    const totalPaid = booking.payment.transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
    const remainingAmount = booking.price.totalPrice - totalPaid;

    const handlePayRemaining = async () => {
        setIsProcessingPayment(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Please log in again");
                return;
            }

            const newTransaction = {
                transactionId: `sim_${Date.now()}`,
                amount: remainingAmount,
                paymentDate: new Date().toISOString(),
                status: 'completed',
                currency: booking.price.currency || 'USD'
            };

            const updatedTransactions = [
                ...(booking.payment.transactions || []),
                newTransaction
            ];

            const response = await fetch(`${api.baseURL}/bookings/${booking._id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    payment: {
                        method: booking.payment.method,
                        status: 'paid', // Update status to paid
                        transactions: updatedTransactions
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Payment failed");
            }

            // Success
            onClose();
            // Refresh page to show updated data
            window.location.reload();

        } catch (error: any) {
            console.error("Payment error:", error);
            alert(error.message || "Something went wrong processing payment");
        } finally {
            setIsProcessingPayment(false);
            setShowPaymentModal(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-white/20 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 bg-white/80 rounded-full transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Left Column: Image & Key Info */}
                <div className="w-full md:w-5/12 bg-gray-50 flex flex-col border-r border-gray-100 overflow-y-auto">
                    {/* Trip Image */}
                    <div className="aspect-[4/3] w-full bg-gray-100 relative">
                        {primaryImage?.url ? (
                            <img
                                src={primaryImage.url}
                                alt={booking.tour.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Booking Meta Grid */}
                    <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-4">
                        <div className="col-span-2">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Booking Reference</h4>
                            <p className="text-sm font-bold text-[#3F3F42] font-mono">{booking.bookingReference}</p>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</h4>
                            <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(booking.status)}`}>
                                {booking.status.toUpperCase()}
                            </span>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Start Date</h4>
                            <p className="text-sm font-bold text-[#3F3F42]">{formatDate(booking.startDate)}</p>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Travelers</h4>
                            <p className="text-sm font-bold text-[#3F3F42]">{booking.numberOfTravelers}</p>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Duration</h4>
                            <p className="text-sm font-bold text-[#3F3F42]">
                                {booking.tour.duration ? `${booking.tour.duration.days}D/${booking.tour.duration.nights}N` : "N/A"}
                            </p>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Payment Method</h4>
                            <p className="text-sm font-bold text-[#3F3F42] capitalize">{booking.payment.method.replace('_', ' ')}</p>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Payment Status</h4>
                            <div className="flex flex-col items-start gap-2">
                                <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${booking.payment.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {booking.payment.status.toUpperCase()}
                                </span>
                                {booking.payment.status === 'partially_paid' && remainingAmount > 0 && (
                                    <button
                                        onClick={() => setShowPaymentModal(true)}
                                        className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded transition-colors"
                                    >
                                        Pay Remaining ({formatPrice(remainingAmount)})
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="col-span-2">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Booked On</h4>
                            <p className="text-sm font-bold text-[#3F3F42]">{formatDateTime(booking.createdAt)}</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="w-full md:w-7/12 flex flex-col max-h-[90vh]">
                    <div className="p-8 flex-1 overflow-y-auto">
                        <h2 className="text-3xl font-bold text-[#3F3F42] mb-2">{booking.tour.name}</h2>
                        <p className="text-lg text-gray-600 mb-8">
                            {booking.tour.location ? `${booking.tour.location.startCity} to ${booking.tour.location.endCity}` : "Adventure Trip"}
                        </p>

                        {/* Travelers List */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-[#3F3F42] mb-4">Travelers</h3>
                            <div className="space-y-3">
                                {booking.travelers.map((traveler, idx) => (
                                    <div key={idx} className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold text-[#3F3F42]">
                                                    {traveler.firstName} {traveler.lastName}
                                                    {idx === 0 && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Primary</span>}
                                                </p>
                                                {traveler.email && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                        {traveler.email}
                                                    </p>
                                                )}
                                                {traveler.phone && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                        </svg>
                                                        {traveler.phone}
                                                    </p>
                                                )}
                                                {traveler.address && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        {traveler.address}
                                                        {traveler.city && `, ${traveler.city}`}
                                                        {traveler.postalCode && `, ${traveler.postalCode}`}
                                                        {traveler.country && `, ${traveler.country}`}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Price Breakdown - matching checkout card style */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-[#3F3F42] mb-4">Price Breakdown</h3>
                            <div className="bg-gray-50 rounded-xl overflow-hidden">
                                {/* Trips Section */}
                                <div className="p-4 border-b border-gray-200">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Trips</p>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 pr-4">
                                            <p className="text-sm font-semibold text-[#3F3F42]">{booking.tour.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">× {booking.numberOfTravelers} traveller{booking.numberOfTravelers > 1 ? 's' : ''}</p>
                                        </div>
                                        <span className="font-semibold text-[#3F3F42] text-sm whitespace-nowrap">
                                            ${(booking.price.basePrice * booking.numberOfTravelers).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Extras Section */}
                                {((booking.extras?.activities && booking.extras.activities.length > 0) || booking.extras?.accommodationUpgrade) && (
                                    <div className="p-4 border-b border-gray-200">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Extras</p>
                                        <div className="space-y-3">
                                            {booking.extras?.activities?.map((activity, idx) => (
                                                <div key={idx} className="flex justify-between items-start">
                                                    <div className="flex items-start gap-2 flex-1 pr-4">
                                                        <span className="text-blue-500 mt-0.5">🎯</span>
                                                        <div>
                                                            <p className="text-sm font-medium text-[#3F3F42]">{activity.name}</p>
                                                            <p className="text-xs text-gray-500">× {activity.count} traveller{activity.count > 1 ? 's' : ''}</p>
                                                        </div>
                                                    </div>
                                                    <span className="font-semibold text-[#3F3F42] text-sm whitespace-nowrap">
                                                        ${(activity.price * activity.count).toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                            {booking.extras?.accommodationUpgrade && (
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-start gap-2 flex-1 pr-4">
                                                        <span className="mt-0.5">🏨</span>
                                                        <div>
                                                            <p className="text-sm font-medium text-[#3F3F42]">{booking.extras.accommodationUpgrade.name}</p>
                                                            <p className="text-xs text-gray-500">× {booking.extras.accommodationUpgrade.count} traveller{booking.extras.accommodationUpgrade.count > 1 ? 's' : ''}</p>
                                                        </div>
                                                    </div>
                                                    <span className="font-semibold text-[#3F3F42] text-sm whitespace-nowrap">
                                                        ${(booking.extras.accommodationUpgrade.price * booking.extras.accommodationUpgrade.count).toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Total */}
                                <div className="p-4 bg-gray-100 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-[#3F3F42]">Total price</p>
                                        <p className="text-xs text-gray-500">Taxes included</p>
                                    </div>
                                    <span className="font-bold text-[#3F3F42] text-xl">${booking.price.totalPrice.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Transaction */}
                        {booking.payment.transactions && booking.payment.transactions.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-[#3F3F42] mb-4">Payment Details</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Transaction ID</span>
                                            <span className="font-mono text-[#3F3F42] text-xs">{booking.payment.transactions[0].transactionId}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Payment Date</span>
                                            <span className="text-[#3F3F42]">{formatDateTime(booking.payment.transactions[0].paymentDate)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Installment Plan Section */}
                        {booking.installmentPlan && booking.installmentPlan.schedule && booking.installmentPlan.schedule.length > 0 && (
                            <div className="mt-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-[#3F3F42]">Installment Plan</h3>
                                    {booking.installmentPlan.isActive && (
                                        <button
                                            onClick={syncInstallmentStatus}
                                            disabled={isSyncing}
                                            className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium py-1 px-3 rounded-full transition disabled:opacity-50"
                                        >
                                            {isSyncing ? "Syncing..." : "🔄 Refresh Status"}
                                        </button>
                                    )}
                                </div>

                                {/* Progress bar */}
                                {(() => {
                                    const paidCount = booking.installmentPlan.schedule.filter((s: any) => s.status === 'paid').length;
                                    const totalCount = booking.installmentPlan.schedule.length;
                                    const progressPercent = Math.round((paidCount / totalCount) * 100);
                                    const totalPaid = booking.installmentPlan.schedule
                                        .filter((s: any) => s.status === 'paid')
                                        .reduce((sum: number, s: any) => sum + s.amount, 0);

                                    return (
                                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-600">
                                                    {paidCount}/{totalCount} payments completed
                                                </span>
                                                <span className="font-semibold text-[#3F3F42]">
                                                    {progressPercent}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${progressPercent}%`,
                                                        background: progressPercent === 100
                                                            ? 'linear-gradient(90deg, #059669, #10b981)'
                                                            : 'linear-gradient(90deg, #7c3aed, #4f46e5)',
                                                    }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs mt-2">
                                                <span className="text-green-600 font-medium">
                                                    Paid: ${(totalPaid || 0).toLocaleString()}
                                                </span>
                                                <span className="text-gray-500">
                                                    Remaining: ${(booking.installmentPlan.totalAmount - totalPaid).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Schedule table */}
                                <div className="bg-gray-50 rounded-xl overflow-hidden">
                                    <div className="grid grid-cols-4 gap-2 px-4 py-3 bg-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <span>Payment</span>
                                        <span>Amount</span>
                                        <span>Due Date</span>
                                        <span>Status</span>
                                    </div>
                                    {booking.installmentPlan.schedule.map((entry: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className={`grid grid-cols-4 gap-2 px-4 py-3 text-sm border-b border-gray-100 last:border-b-0 ${entry.status === 'paid' ? 'bg-green-50/50' : ''}`}
                                        >
                                            <span className="text-[#3F3F42] font-medium">
                                                {entry.type === 'upfront' ? '💰 Upfront' : `#${entry.installmentNumber}`}
                                            </span>
                                            <span className="text-[#3F3F42] font-semibold">
                                                ${entry.amount.toLocaleString()}
                                            </span>
                                            <span className="text-gray-600 text-xs">
                                                {new Date(entry.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            <span>
                                                {entry.status === 'paid' ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                        ✅ Paid
                                                    </span>
                                                ) : entry.status === 'failed' ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                                        ❌ Failed
                                                    </span>
                                                ) : entry.status === 'overdue' ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                                                        ⚠️ Overdue
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                                        ⏳ Pending
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Deadline notice */}
                                {booking.installmentPlan.isActive && (
                                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                        <p className="text-xs text-amber-800">
                                            ⚠️ All payments must be completed by <strong>{new Date(booking.installmentPlan.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong> (90 days before tour).
                                            Failure to complete will result in booking cancellation and the paid amount being credited to your wallet.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 bg-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link
                                href={`/trips/${booking.tour.slug}/${booking.tour.tourCode}`}
                                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-[#3F3F42] bg-white hover:bg-gray-50 transition-colors"
                            >
                                View Trip
                            </Link>
                        </div>
                        <button
                            onClick={onClose}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-bold rounded-lg text-white bg-[#432360] hover:bg-[#3F3F42] transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            {/* Payment Simulation Modal Overlay */}
            {
                showPaymentModal && (
                    <div className="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            {/* Background overlay */}
                            <div
                                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                                aria-hidden="true"
                                onClick={() => !isProcessingPayment && setShowPaymentModal(false)}
                            ></div>

                            {/* Modal panel */}
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl relative z-[70] sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <span className="text-green-600 text-lg">💳</span>
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-[#3F3F42]" id="modal-title">
                                                Payment Simulation
                                            </h3>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500 mb-4">
                                                    Complete your booking by paying the remaining balance.
                                                </p>

                                                <div className="bg-gray-50 p-4 rounded-md mb-4">
                                                    <div className="flex justify-between text-sm mb-2">
                                                        <span className="text-gray-600">Ref:</span>
                                                        <span className="font-mono">{booking.bookingReference}</span>
                                                    </div>
                                                    <div className="flex justify-between text-lg font-bold text-[#3F3F42] pt-2 border-t border-gray-200">
                                                        <span>Pay Remaining:</span>
                                                        <span>{formatPrice(remainingAmount)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm mt-3">
                                                        <span className="text-gray-600">Card:</span>
                                                        <span className="font-mono">**** **** **** 4242</span>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex flex-col gap-2">
                                                    <button
                                                        type="button"
                                                        disabled={isProcessingPayment}
                                                        onClick={handlePayRemaining}
                                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm disabled:opacity-50"
                                                    >
                                                        {isProcessingPayment ? "Processing..." : `Pay ${formatPrice(remainingAmount)}`}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={isProcessingPayment}
                                                        onClick={() => setShowPaymentModal(false)}
                                                        className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-[#3F3F42] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}
