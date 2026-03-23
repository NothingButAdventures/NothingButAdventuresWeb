"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";

export default function StartPlanningSection() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        preferredDestination: "",
        travelDates: "",
        numberOfTravelers: "",
        dreamTripDetails: "",
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setFormData({
                    fullName: "",
                    email: "",
                    phoneNumber: "",
                    preferredDestination: "",
                    travelDates: "",
                    numberOfTravelers: "",
                    dreamTripDetails: "",
                });
            } else {
                setError(data.message || "Something went wrong. Please try again.");
            }
        } catch (err) {
            setError("Failed to submit your inquiry. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-[#e9eae9] py-24 relative">
            <div className="max-w-[700px] mx-auto px-4 sm:px-6 relative z-10 text-center mb-10">
                <h2 className="text-[40px] md:text-[52px] font-semibold text-black leading-tight mb-4 tracking-tight">
                    Start Planning Your Journey
                </h2>
                <p className="text-[17px] text-[#1a1a1a] font-medium">
                    Share your travel dreams with us, and we'll craft a personalized itinerary just for you
                </p>
            </div>

            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10">
                <div className="bg-white rounded-[24px] p-8 md:p-12 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
                    {success ? (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Inquiry Sent Successfully!</h3>
                            <p className="text-gray-600 font-medium">Thank you for reaching out. We will get back to you with your personalized itinerary shortly.</p>
                            <button onClick={() => setSuccess(false)} className="mt-8 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors">Start another inquiry</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 mb-6">

                                {/* Full Name */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[14px] font-semibold text-[#3b4340] pl-1">Full Name *</label>
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
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[14px] font-semibold text-[#3b4340] pl-1">Email Address *</label>
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

                                {/* Phone Number */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[14px] font-semibold text-[#3b4340] pl-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        placeholder="+1 (555) 000-0000"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-transparent border border-gray-200 rounded-[12px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all font-medium"
                                    />
                                </div>

                                {/* Preferred Destination */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[14px] font-semibold text-[#3b4340] pl-1">Preferred Destination</label>
                                    <input
                                        type="text"
                                        name="preferredDestination"
                                        value={formData.preferredDestination}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-transparent border border-gray-200 rounded-[12px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all font-medium"
                                    />
                                </div>

                                {/* Preferred Travel Dates */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[14px] font-semibold text-[#3b4340] pl-1">Preferred Travel Dates</label>
                                    <input
                                        type="text"
                                        name="travelDates"
                                        placeholder="e.g., March 2026"
                                        value={formData.travelDates}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-transparent border border-gray-200 rounded-[12px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all font-medium"
                                    />
                                </div>

                                {/* Number of Travelers */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[14px] font-semibold text-[#3b4340] pl-1">Number of Travelers</label>
                                    <input
                                        type="number"
                                        min="1"
                                        name="numberOfTravelers"
                                        value={formData.numberOfTravelers}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-transparent border border-gray-200 rounded-[12px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            {/* Tell us about your dream trip */}
                            <div className="flex flex-col gap-1.5 mb-8">
                                <label className="text-[14px] font-semibold text-[#3b4340] pl-1">Tell us about your dream trip *</label>
                                <textarea
                                    name="dreamTripDetails"
                                    required
                                    placeholder="Share your interests, budget range, or any special requests..."
                                    rows={5}
                                    value={formData.dreamTripDetails}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-transparent border border-gray-200 rounded-[12px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all font-medium resize-none shadow-sm"
                                ></textarea>
                            </div>

                            <p className="text-[12px] text-[#5b6360] font-medium leading-[1.5] mb-6">
                                By submitting this form, you agree to our privacy policy. We'll never share your information with third parties and will only use it to create your perfect Indian adventure.
                            </p>

                            {error && <p className="text-red-500 font-medium text-sm mb-4">{error}</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#111] text-white py-4 rounded-full font-medium text-[16px] flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:opacity-70"
                            >
                                {loading ? "Sending..." : "Send Inquiry"}
                                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <div className="bg-[#e9eae9] w-full text-center mt-12 pb-12">
                <p className="text-[18px] font-semibold text-black mb-4">Prefer to speak with us directly?</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-[15px] font-semibold text-[#1a1a1a]">
                    <a href="mailto:hello@nothingbutadventures.com" className="hover:text-black">hello@nothingbutadventures.com</a>
                    <span className="hidden sm:inline-block w-1.5 h-1.5 bg-black rounded-full"></span>
                    <a href="tel:+911234567890" className="hover:text-black">+91 123 456 7890</a>
                </div>
            </div>
        </section>
    );
}
