"use client";

import Link from "next/link";
import { useEffect } from "react";

interface QuickViewTour {
    _id: string;
    name: string;
    slug: string;
    price: {
        amount: number;
        currency: string;
        discountPercent: number;
    };
    duration: {
        days: number;
        nights: number;
    };
    itineraryMapImage?: string;
    travelStyle: string;
    ageRequirement?: {
        min: number;
        max: number;
    };
    tags?: string[];
    physicalRating: {
        level: number;
    };
    serviceLevel: string;
    location?: {
        startCity: string;
        endCity: string;
    };
    itinerary?: Array<{
        day: number;
        title: string;
        description: string;
        placeName?: string;
    }>;
}

interface QuickViewModalProps {
    tour: QuickViewTour;
    onClose: () => void;
}

export default function QuickViewModal({ tour, onClose }: QuickViewModalProps) {
    // Lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    const discountedPrice =
        tour.price.discountPercent > 0
            ? tour.price.amount * (1 - tour.price.discountPercent / 100)
            : tour.price.amount;

    const physicalRatingText = (level: number) => {
        switch (level) {
            case 1: return "Easy";
            case 2: return "Light";
            case 3: return "Average";
            case 4: return "Demanding";
            case 5: return "Challenging";
            default: return "Average";
        }
    };

    // Generate a pseudo Trip Code from ID if not present
    const tripCode = tour._id.substring(tour._id.length - 4).toUpperCase();

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

                {/* Left Column: Map & Key Info */}
                <div className="w-full md:w-5/12 bg-gray-50 flex flex-col border-r border-gray-100 overflow-y-auto">
                    {/* Map Image */}
                    <div className="aspect-[4/3] w-full bg-gray-100 relative">
                        {tour.itineraryMapImage ? (
                            <img
                                src={tour.itineraryMapImage}
                                alt={`${tour.name} Map`}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <span className="text-sm">No map available</span>
                            </div>
                        )}
                    </div>

                    {/* Tour Meta Grid */}
                    <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-4">
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Travel Style</h4>
                            <p className="text-sm font-bold text-gray-900">{tour.travelStyle}</p>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Age Requirement</h4>
                            <p className="text-sm font-bold text-gray-900">
                                {tour.ageRequirement ? `${tour.ageRequirement.min} - ${tour.ageRequirement.max}` : "All ages"}
                            </p>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Collection</h4>
                            <p className="text-sm font-bold text-gray-900">
                                {/* Display first tag as collection or default */}
                                {tour.tags && tour.tags.length > 0 ? tour.tags[0] : "Standard"}
                            </p>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Physical Rating</h4>
                            <p className="text-sm font-bold text-gray-900">{physicalRatingText(tour.physicalRating.level)}</p>
                            {/* Dots visualizer could go here */}
                            <div className="flex gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map((lvl) => (
                                    <div
                                        key={lvl}
                                        className={`w-2 h-2 rounded-full ${lvl <= tour.physicalRating.level ? 'bg-gray-800' : 'bg-gray-200'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Service Level</h4>
                            <p className="text-sm font-bold text-gray-900">{tour.serviceLevel}</p>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Trip Code</h4>
                            <p className="text-sm font-bold text-gray-900">{tripCode}</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Title, Itinerary, Footer */}
                <div className="w-full md:w-7/12 flex flex-col max-h-[90vh]">
                    <div className="p-8 flex-1 overflow-y-auto">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">{tour.name}</h2>
                        <p className="text-lg text-gray-600 mb-8">
                            {tour.duration.days} days, {tour.location?.startCity || "Start"} to {tour.location?.endCity || "End"}
                        </p>

                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900">Trip Itinerary</h3>
                            <div className="space-y-4">
                                {tour.itinerary && tour.itinerary.length > 0 ? (
                                    tour.itinerary.map((item) => (
                                        <div key={item.day} className="flex gap-4">
                                            <span className="font-bold text-gray-900 w-16 flex-shrink-0">Day {item.day}:</span>
                                            <span className="text-gray-600">{item.title}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">Itinerary details pending.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 bg-white flex items-center justify-between">
                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-sm text-gray-500">From</span>
                                {tour.price.discountPercent > 0 && (
                                    <span className="text-sm text-gray-400 line-through">${tour.price.amount}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-3xl font-bold text-gray-900">${Math.round(discountedPrice)}</span>
                                <span className="text-sm text-gray-500">USD</span>
                                {tour.price.discountPercent > 0 && (
                                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded">
                                        -{tour.price.discountPercent}%
                                    </span>
                                )}
                            </div>
                        </div>

                        <Link
                            href={`/tours/${tour.slug}`}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-bold rounded-lg text-white bg-[#432360] hover:bg-[#321a48] transition-colors"
                        >
                            View tour details
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
