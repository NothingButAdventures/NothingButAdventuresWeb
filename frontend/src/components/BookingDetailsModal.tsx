"use client";

import Link from "next/link";
import { useEffect } from "react";

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
    travelers: Array<{
        firstName: string;
        lastName: string;
        email?: string;
        phone?: string;
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

export default function BookingDetailsModal({ booking, onClose }: BookingDetailsModalProps) {
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
                return "bg-gray-100 text-gray-700";
        }
    };

    const primaryImage = booking.tour.images?.find((img) => img.isPrimary) || booking.tour.images?.[0];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
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
                    {/* Tour Image */}
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
                            <p className="text-sm font-bold text-gray-900 font-mono">{booking.bookingReference}</p>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</h4>
                            <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(booking.status)}`}>
                                {booking.status.toUpperCase()}
                            </span>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Start Date</h4>
                            <p className="text-sm font-bold text-gray-900">{formatDate(booking.startDate)}</p>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Travelers</h4>
                            <p className="text-sm font-bold text-gray-900">{booking.numberOfTravelers}</p>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Duration</h4>
                            <p className="text-sm font-bold text-gray-900">
                                {booking.tour.duration ? `${booking.tour.duration.days}D/${booking.tour.duration.nights}N` : "N/A"}
                            </p>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Payment Method</h4>
                            <p className="text-sm font-bold text-gray-900 capitalize">{booking.payment.method.replace('_', ' ')}</p>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Payment Status</h4>
                            <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${booking.payment.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {booking.payment.status.toUpperCase()}
                            </span>
                        </div>

                        <div className="col-span-2">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Booked On</h4>
                            <p className="text-sm font-bold text-gray-900">{formatDateTime(booking.createdAt)}</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="w-full md:w-7/12 flex flex-col max-h-[90vh]">
                    <div className="p-8 flex-1 overflow-y-auto">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">{booking.tour.name}</h2>
                        <p className="text-lg text-gray-600 mb-8">
                            {booking.tour.location ? `${booking.tour.location.startCity} to ${booking.tour.location.endCity}` : "Adventure Tour"}
                        </p>

                        {/* Travelers List */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Travelers</h3>
                            <div className="space-y-3">
                                {booking.travelers.map((traveler, idx) => (
                                    <div key={idx} className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold text-gray-900">
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
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Price Breakdown - matching checkout card style */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Price Breakdown</h3>
                            <div className="bg-gray-50 rounded-xl overflow-hidden">
                                {/* Tours Section */}
                                <div className="p-4 border-b border-gray-200">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Tours</p>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 pr-4">
                                            <p className="text-sm font-semibold text-gray-900">{booking.tour.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">× {booking.numberOfTravelers} traveller{booking.numberOfTravelers > 1 ? 's' : ''}</p>
                                        </div>
                                        <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">
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
                                                            <p className="text-sm font-medium text-gray-900">{activity.name}</p>
                                                            <p className="text-xs text-gray-500">× {activity.count} traveller{activity.count > 1 ? 's' : ''}</p>
                                                        </div>
                                                    </div>
                                                    <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                                                        ${(activity.price * activity.count).toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                            {booking.extras?.accommodationUpgrade && (
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-start gap-2 flex-1 pr-4">
                                                        <span className="mt-0.5">🏨</span>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{booking.extras.accommodationUpgrade.name}</p>
                                                            <p className="text-xs text-gray-500">× {booking.extras.accommodationUpgrade.count} traveller{booking.extras.accommodationUpgrade.count > 1 ? 's' : ''}</p>
                                                        </div>
                                                    </div>
                                                    <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">
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
                                        <p className="font-bold text-gray-900">Total price</p>
                                        <p className="text-xs text-gray-500">Taxes included</p>
                                    </div>
                                    <span className="font-bold text-gray-900 text-xl">${booking.price.totalPrice.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Transaction */}
                        {booking.payment.transactions && booking.payment.transactions.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Details</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Transaction ID</span>
                                            <span className="font-mono text-gray-900 text-xs">{booking.payment.transactions[0].transactionId}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Payment Date</span>
                                            <span className="text-gray-900">{formatDateTime(booking.payment.transactions[0].paymentDate)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 bg-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link
                                href={`/tours/${booking.tour.slug}`}
                                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                View Tour
                            </Link>
                        </div>
                        <button
                            onClick={onClose}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-bold rounded-lg text-white bg-[#432360] hover:bg-[#321a48] transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
