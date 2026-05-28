"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";

export default function StartPlanningSection() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const res = await fetch(`${api.baseURL}${api.endpoints.queries.create}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    dreamTripDetails: "Newsletter Subscription - Subscribed to save 10% off on next adventure",
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setFormData({
                    fullName: "",
                    email: "",
                });
            } else {
                setError(data.message || "Something went wrong. Please try again.");
            }
        } catch (err) {
            setError("Failed to submit. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-[#F1F3FF] py-24 relative">
            <div className="max-w-[800px] mx-auto px-4 sm:px-6 relative z-10 text-center mb-10">
                <h2 className="text-[36px] md:text-[48px] font-semibold text-[#2d2f34] leading-tight mb-4 tracking-tight">
                    Subscribe to save 10% off on your next Adventure
                </h2>
                <p className="text-[17px] text-[#555555] font-medium leading-relaxed">
                    Share your travel dreams with us, and we'll craft a{" "}
                    <span className="font-semibold text-black">personalised</span>
                    <br />
                    <span className="font-semibold text-black">itinerary</span> just for you
                </p>
            </div>

            <div className="max-w-[1050px] mx-auto px-4 sm:px-6 relative z-10">
                <div className="bg-white rounded-[24px] p-8 md:p-12 shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
                    {success ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Subscribed!</h3>
                            <p className="text-gray-600 font-medium mb-6">
                                Thank you for subscribing. You've been successfully added to our mailing list.
                            </p>
                            <button
                                onClick={() => setSuccess(false)}
                                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
                            >
                                Subscribe another email
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 mb-6">
                                {/* Full Name */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] font-semibold text-[#2d2f34] pl-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        required
                                        placeholder="John Doe"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-transparent border border-gray-200 rounded-[12px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all font-medium"
                                    />
                                </div>

                                {/* Email Address */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] font-semibold text-[#2d2f34] pl-1">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-transparent border border-gray-200 rounded-[12px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <p className="text-[12px] text-[#777] font-medium leading-[1.6] mb-8">
                                By submitting this form, you agree to our privacy policy. We'll never share your information with third parties and will only use it to create your perfect Indian adventure.
                            </p>

                            {error && <p className="text-red-500 font-medium text-sm mb-4">{error}</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#373A40] text-white py-4 rounded-full font-semibold text-[16px] flex items-center justify-center gap-2 hover:bg-[#2d2f34] transition-colors disabled:opacity-70"
                            >
                                {loading ? "Subscribing..." : "Subscribe"}
                                <svg
                                    className="w-5 h-5 ml-1"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
