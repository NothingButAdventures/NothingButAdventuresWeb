"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

// ─── Application Modal ─────────────────────────────────────────────────────────
function ApplicationModal({ isOpen, onClose, applicationType }: { isOpen: boolean; onClose: () => void; applicationType: "affiliate" | "rep" }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        type: applicationType,
        companyName: "",
        website: "",
        socialMedia: { instagram: "", youtube: "", tiktok: "", facebook: "", twitter: "", blog: "" },
        audienceSize: "",
        niche: "",
        whyJoin: "",
        country: "",
    });

    useEffect(() => {
        setFormData(prev => ({ ...prev, type: applicationType }));
    }, [applicationType]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please log in to apply for the affiliate program.");
                setLoading(false);
                return;
            }
            const res = await fetch(`${api.baseURL}${api.endpoints.affiliates.apply}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.status === "success") {
                setSuccess(true);
            } else {
                setError(data.message || "Something went wrong. Please try again.");
            }
        } catch {
            setError("Network error. Please try again.");
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {success ? (
                    <div className="p-8 text-center">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3 font-outfit">Application Submitted!</h3>
                        <p className="text-[#3F3F42]/70 mb-6 font-outfit">We&apos;ll review your application and get back to you within 2-3 business days. Check your email for confirmation.</p>
                        <button onClick={onClose} className="px-8 py-3 bg-[#1A1A1A] text-white rounded-xl font-semibold hover:bg-[#333] transition-colors font-outfit cursor-pointer">Got It!</button>
                    </div>
                ) : (
                    <>
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-[#1A1A1A] font-outfit">Apply as {applicationType === "affiliate" ? "Affiliate Partner" : "NBA Rep"}</h3>
                                <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                                {[1, 2, 3].map((s) => (
                                    <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-[#1A1A1A]" : "bg-gray-200"}`} />
                                ))}
                            </div>
                            <p className="text-sm text-[#3F3F42]/60 mt-2 font-outfit">Step {step} of 3</p>
                        </div>
                        <div className="p-6">
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-outfit">{error}</div>
                            )}

                            {step === 1 && (
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-[#1A1A1A] font-outfit">About You</h4>
                                    {applicationType === "affiliate" && (
                                        <div>
                                            <label className="block text-sm font-medium text-[#3F3F42] mb-1 font-outfit">Company / Organization Name</label>
                                            <input type="text" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent outline-none font-outfit text-sm" placeholder="Your company name" />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-[#3F3F42] mb-1 font-outfit">Website</label>
                                        <input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent outline-none font-outfit text-sm" placeholder="https://yourwebsite.com" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#3F3F42] mb-1 font-outfit">Country</label>
                                        <input type="text" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent outline-none font-outfit text-sm" placeholder="Your country" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#3F3F42] mb-1 font-outfit">Niche / Industry</label>
                                        <input type="text" value={formData.niche} onChange={(e) => setFormData({ ...formData, niche: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent outline-none font-outfit text-sm" placeholder="e.g. Travel, Lifestyle, Adventure" />
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-[#1A1A1A] font-outfit">Social Media Presence</h4>
                                    {["instagram", "youtube", "tiktok", "facebook", "twitter", "blog"].map((platform) => (
                                        <div key={platform}>
                                            <label className="block text-sm font-medium text-[#3F3F42] mb-1 font-outfit capitalize">{platform === "blog" ? "Blog / Website" : platform}</label>
                                            <input type="text" value={(formData.socialMedia as Record<string, string>)[platform]} onChange={(e) => setFormData({ ...formData, socialMedia: { ...formData.socialMedia, [platform]: e.target.value } })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent outline-none font-outfit text-sm" placeholder={`Your ${platform} URL or handle`} />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="block text-sm font-medium text-[#3F3F42] mb-1 font-outfit">Audience Size</label>
                                        <select value={formData.audienceSize} onChange={(e) => setFormData({ ...formData, audienceSize: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent outline-none font-outfit text-sm bg-white cursor-pointer">
                                            <option value="">Select audience size</option>
                                            <option value="under_1k">Under 1,000</option>
                                            <option value="1k_5k">1,000 – 5,000</option>
                                            <option value="5k_10k">5,000 – 10,000</option>
                                            <option value="10k_50k">10,000 – 50,000</option>
                                            <option value="50k_100k">50,000 – 100,000</option>
                                            <option value="100k_500k">100,000 – 500,000</option>
                                            <option value="500k_plus">500,000+</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-[#1A1A1A] font-outfit">Why Join Us?</h4>
                                    <div>
                                        <label className="block text-sm font-medium text-[#3F3F42] mb-1 font-outfit">Tell us why you want to join</label>
                                        <textarea rows={5} value={formData.whyJoin} onChange={(e) => setFormData({ ...formData, whyJoin: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent outline-none font-outfit text-sm resize-none" placeholder="Tell us about your passion for travel, how you plan to promote NBA trips, and what makes you a great fit for our affiliate program..." />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                                {step > 1 ? (
                                    <button onClick={() => setStep(step - 1)} className="px-5 py-2.5 text-[#3F3F42] border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-outfit text-sm cursor-pointer">Back</button>
                                ) : <div />}
                                {step < 3 ? (
                                    <button onClick={() => setStep(step + 1)} className="px-6 py-2.5 bg-[#1A1A1A] text-white rounded-xl font-semibold hover:bg-[#333] transition-colors font-outfit text-sm cursor-pointer">Continue</button>
                                ) : (
                                    <button onClick={handleSubmit} disabled={loading} className="px-6 py-2.5 bg-[#1A1A1A] text-white rounded-xl font-semibold hover:bg-[#333] transition-colors font-outfit text-sm disabled:opacity-50 cursor-pointer">
                                        {loading ? "Submitting..." : "Submit Application"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── FAQ Accordion ──────────────────────────────────────────────────────────────
function FaqItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-100 last:border-0">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between py-5 text-left cursor-pointer group">
                <span className="font-semibold text-[#1A1A1A] font-outfit pr-4 group-hover:text-[#3F3F42]/80 transition-colors">{question}</span>
                <svg className={`w-5 h-5 text-[#3F3F42]/50 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 pb-5" : "max-h-0"}`}>
                <p className="text-[#3F3F42]/70 text-sm leading-relaxed font-outfit">{answer}</p>
            </div>
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function AffiliatePage() {
    const [modalOpen, setModalOpen] = useState(false);
    const [applicationType, setApplicationType] = useState<"affiliate" | "rep">("affiliate");

    const openModal = (type: "affiliate" | "rep") => {
        setApplicationType(type);
        setModalOpen(true);
    };

    return (
        <main className="font-outfit">
            {/* ─── Hero Section ──────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-[#1A1A1A] min-h-[85vh] flex items-center">
                {/* Animated gradient orbs */}
                <div className="absolute top-20 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-20 -right-32 w-96 h-96 bg-blue-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px]" />

                <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 mb-8">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-white/80 text-sm font-medium">Now Accepting Applications</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-6">
                        Earn by Sharing<br />
                        <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Your Love of Adventure</span>
                    </h1>

                    <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Join the Nothing But Adventures Affiliate Program and earn <strong className="text-white/90">5% – 10% commission</strong> on every successful booking. Turn your passion for travel into income.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onClick={() => openModal("affiliate")} className="group px-8 py-4 bg-white text-[#1A1A1A] rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 flex items-center gap-3 cursor-pointer shadow-lg shadow-white/10">
                            Apply Now
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </button>
                        <a href="#how-it-works" className="px-8 py-4 text-white/80 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all duration-300 cursor-pointer">
                            Learn More
                        </a>
                    </div>

                    {/* Stats bar */}
                    <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
                        {[
                            { value: "5-10%", label: "Commission" },
                            { value: "30", label: "Day Cookie" },
                            { value: "$0", label: "Join Fee" },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                                <p className="text-white/50 text-sm mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── How It Works ──────────────────────────────────────────── */}
            <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-sm font-semibold text-emerald-600 tracking-widest uppercase mb-3">Simple Process</p>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1A1A]">How It Works</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connector line */}
                        <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-px bg-gradient-to-r from-emerald-200 via-emerald-300 to-emerald-200" />

                        {[
                            {
                                step: "01",
                                title: "Sign Up",
                                description: "Fill out our simple application form. We'll review it and get back to you within 2-3 business days.",
                                icon: (
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                                ),
                            },
                            {
                                step: "02",
                                title: "Share & Promote",
                                description: "Get your unique referral link and share it with your audience on social media, blog, or website.",
                                icon: (
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
                                ),
                            },
                            {
                                step: "03",
                                title: "Earn Commission",
                                description: "Earn 5-10% commission on every successful booking made through your link. Track everything in real-time.",
                                icon: (
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                ),
                            },
                        ].map((item) => (
                            <div key={item.step} className="relative group">
                                <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500 hover:-translate-y-1">
                                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                                        {item.icon}
                                    </div>
                                    <span className="text-xs font-bold text-emerald-500 tracking-widest uppercase">Step {item.step}</span>
                                    <h3 className="text-xl font-bold text-[#1A1A1A] mt-2 mb-3">{item.title}</h3>
                                    <p className="text-[#3F3F42]/60 text-sm leading-relaxed">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Benefits Section ──────────────────────────────────────── */}
            <section className="py-20 sm:py-28 px-4 sm:px-6 bg-[#FAFAFA]">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-sm font-semibold text-emerald-600 tracking-widest uppercase mb-3">Why Join</p>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1A1A]">Benefits of Being an Affiliate</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: "💰", title: "5-10% Commission", desc: "Earn generous commissions on every successful booking made through your unique referral link." },
                            { icon: "🍪", title: "30-Day Cookie Window", desc: "Your audience has 30 days to book after clicking your link. You still earn even if they don't book immediately." },
                            { icon: "📊", title: "Real-Time Tracking", desc: "Monitor clicks, conversions, and commissions in your personal affiliate dashboard with live analytics." },
                            { icon: "🎯", title: "Dedicated Support", desc: "Get personalized support from our affiliate management team to maximize your earnings." },
                            { icon: "🆓", title: "Free to Join", desc: "No fees, no hidden costs. Join the program completely free and start earning right away." },
                            { icon: "📈", title: "Tier Upgrades", desc: "As you bring more bookings, unlock higher commission rates — from Bronze (5%) to Platinum (10%)." },
                            { icon: "✈️", title: "Travel Opportunities", desc: "Top-performing affiliates get invited on exclusive content trips and enjoy discounted personal travel." },
                            { icon: "🎨", title: "Marketing Assets", desc: "Access a suite of branded banners, images, and content to make promoting effortless." },
                            { icon: "🌍", title: "Premium Product", desc: "Promote 200+ curated adventure trips across India — authentic experiences your audience will love." },
                        ].map((benefit) => (
                            <div key={benefit.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 group hover:-translate-y-0.5">
                                <div className="text-3xl mb-4">{benefit.icon}</div>
                                <h3 className="font-bold text-[#1A1A1A] text-lg mb-2">{benefit.title}</h3>
                                <p className="text-[#3F3F42]/60 text-sm leading-relaxed">{benefit.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Who Are You? ──────────────────────────────────────────── */}
            <section className="py-20 sm:py-28 px-4 sm:px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-sm font-semibold text-emerald-600 tracking-widest uppercase mb-3">Choose Your Path</p>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1A1A]">Who Are You?</h2>
                        <p className="text-[#3F3F42]/60 max-w-xl mx-auto mt-4">Based on your situation, you&apos;ll be categorized as either an NBA Affiliate or NBA Rep.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Affiliate Card */}
                        <div className="group relative bg-gradient-to-br from-[#1A1A1A] to-[#2d2d2d] rounded-2xl p-8 text-white overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
                                </div>
                                <h3 className="text-2xl font-bold mb-2">I&apos;m Part of an Organization</h3>
                                <p className="text-white/60 text-sm leading-relaxed mb-6">
                                    Companies, travel agencies, media companies, and businesses with a relevant audience. Scale your promotions with team-level access.
                                </p>
                                <ul className="space-y-2 mb-8">
                                    {["Company-level access", "Bulk marketing tools", "Custom commission rates", "Dedicated account manager"].map((item) => (
                                        <li key={item} className="flex items-center gap-2 text-sm text-white/80">
                                            <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={() => openModal("affiliate")} className="w-full py-3.5 bg-white text-[#1A1A1A] rounded-xl font-bold hover:bg-gray-100 transition-colors cursor-pointer">
                                    Apply as Affiliate
                                </button>
                                <p className="text-center text-white/40 text-xs mt-3">
                                    Questions? <a href="mailto:affiliate@nothingbutadventures.com" className="underline hover:text-white/60">affiliate@nothingbutadventures.com</a>
                                </p>
                            </div>
                        </div>

                        {/* Rep Card */}
                        <div className="group relative bg-white border-2 border-gray-100 rounded-2xl p-8 overflow-hidden hover:shadow-2xl hover:border-emerald-200 transition-all duration-500 hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-50 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                                    <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                                </div>
                                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">It&apos;s Just Me</h3>
                                <p className="text-[#3F3F42]/60 text-sm leading-relaxed mb-6">
                                    Travel bloggers, social media creators, past travelers, and adventure enthusiasts who want to share their love of travel.
                                </p>
                                <ul className="space-y-2 mb-8">
                                    {["Personal referral link", "Unique promo code", "Social media support", "Content trip invites"].map((item) => (
                                        <li key={item} className="flex items-center gap-2 text-sm text-[#3F3F42]/70">
                                            <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={() => openModal("rep")} className="w-full py-3.5 bg-[#1A1A1A] text-white rounded-xl font-bold hover:bg-[#333] transition-colors cursor-pointer">
                                    Apply as Rep
                                </button>
                                <p className="text-center text-[#3F3F42]/40 text-xs mt-3">
                                    Questions? <a href="mailto:rep@nothingbutadventures.com" className="underline hover:text-[#3F3F42]/60">rep@nothingbutadventures.com</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Earning Examples ───────────────────────────────────────── */}
            <section className="py-20 sm:py-28 px-4 sm:px-6 bg-[#1A1A1A] text-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-sm font-semibold text-emerald-400 tracking-widest uppercase mb-3">Potential Earnings</p>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">How Much Can You Earn?</h2>
                        <p className="text-white/50 max-w-xl mx-auto mt-4">Here are some real-world examples of how our affiliates monetize their audience.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                title: "Starter",
                                travelers: "5 travelers",
                                commission: "$750",
                                detail: "Based on 5% commission rate",
                                color: "from-emerald-500/20 to-emerald-500/5",
                                borderColor: "border-emerald-500/20",
                            },
                            {
                                title: "Growing",
                                travelers: "15 travelers",
                                commission: "$3,375",
                                detail: "Based on 7.5% commission rate",
                                color: "from-blue-500/20 to-blue-500/5",
                                borderColor: "border-blue-500/20",
                                featured: true,
                            },
                            {
                                title: "Pro",
                                travelers: "50+ travelers",
                                commission: "$15,000+",
                                detail: "Based on 10% commission rate",
                                color: "from-amber-500/20 to-amber-500/5",
                                borderColor: "border-amber-500/20",
                            },
                        ].map((tier) => (
                            <div key={tier.title} className={`relative bg-gradient-to-b ${tier.color} rounded-2xl p-8 border ${tier.borderColor} ${tier.featured ? "scale-105 shadow-2xl" : ""}`}>
                                {tier.featured && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 rounded-full text-xs font-bold">Most Popular</div>
                                )}
                                <h3 className="text-lg font-bold text-white/80 mb-1">{tier.title}</h3>
                                <p className="text-white/50 text-sm mb-6">{tier.travelers} per year</p>
                                <p className="text-4xl sm:text-5xl font-bold text-white mb-2">{tier.commission}</p>
                                <p className="text-white/40 text-xs">{tier.detail}</p>
                            </div>
                        ))}
                    </div>

                    <p className="text-center text-white/30 text-sm mt-8">*Based on an average trip value of $3,000 per traveler. Actual earnings may vary.</p>
                </div>
            </section>

            {/* ─── Commission Tiers ──────────────────────────────────────── */}
            <section className="py-20 sm:py-28 px-4 sm:px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-sm font-semibold text-emerald-600 tracking-widest uppercase mb-3">Grow With Us</p>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1A1A]">Commission Tiers</h2>
                        <p className="text-[#3F3F42]/60 max-w-xl mx-auto mt-4">The more you refer, the higher your commission rate. Level up automatically!</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { tier: "Bronze", rate: "5%", bookings: "0-9 bookings", color: "bg-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
                            { tier: "Silver", rate: "6%", bookings: "10-24 bookings", color: "bg-gray-400", bgColor: "bg-gray-50", borderColor: "border-gray-200" },
                            { tier: "Gold", rate: "7.5%", bookings: "25-49 bookings", color: "bg-yellow-500", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" },
                            { tier: "Platinum", rate: "10%", bookings: "50+ bookings", color: "bg-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
                        ].map((t) => (
                            <div key={t.tier} className={`flex items-center justify-between ${t.bgColor} rounded-2xl px-6 py-5 border ${t.borderColor}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 ${t.color} rounded-xl flex items-center justify-center`}>
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#1A1A1A]">{t.tier}</p>
                                        <p className="text-sm text-[#3F3F42]/50">{t.bookings}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-[#1A1A1A]">{t.rate}</p>
                                    <p className="text-xs text-[#3F3F42]/50">commission</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── FAQ Section ───────────────────────────────────────────── */}
            <section className="py-20 sm:py-28 px-4 sm:px-6 bg-[#FAFAFA]">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-sm font-semibold text-emerald-600 tracking-widest uppercase mb-3">Got Questions?</p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A]">Frequently Asked Questions</h2>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 px-6">
                        <FaqItem question="What is the NBA Affiliate Program?" answer="The Affiliate program allows those who love travel to earn commission on the successful bookings of travelers they've referred to Nothing But Adventures. When a referred customer visits our site and books a trip, we pay you a commission on the sale. Beyond this, affiliates will also enjoy unique collaboration opportunities, content trips, and many more perks and rewards." />
                        <FaqItem question="What's the difference between Affiliates and Reps?" answer="Affiliates are mostly organizations or businesses that promote at scale through paid advertising, email marketing, websites, etc. NBA Reps are mostly individuals who promote through their social media channels like Instagram, TikTok, YouTube, and personal blogs. Both earn commission through unique tracking links." />
                        <FaqItem question="How are my sales tracked?" answer="Your affiliate links contain a tracking code that monitors all sales generated from your unique link. We use a 30-day cookie window — if someone clicks your link but doesn't book right away, you still earn commission if they return and book within 30 days." />
                        <FaqItem question="Are there any fees to join?" answer="Nope! It's completely free to participate in the NBA Affiliate Program. There are no hidden fees or minimum requirements." />
                        <FaqItem question="What is your cookie policy?" answer="30 days. If a visitor comes to our website from your link but doesn't book a trip, you can still earn commission on sales from that traveler if they return and make a purchase within 30 days — even if they navigate directly to the website." />
                        <FaqItem question="When is commission paid out?" answer="Payouts are processed on a monthly basis. Commissions are locked after the booking is confirmed and paid out 20 days after the end of the month in which the sale is confirmed." />
                        <FaqItem question="Do I earn commission if someone books a different trip?" answer="Absolutely! You'll get full credit for any trip that's purchased by a traveler who clicks on your link, regardless of which specific trip they end up booking." />
                        <FaqItem question="Is there a minimum payment threshold?" answer="Nope! Commissions will be paid no matter what the amount is. No minimum thresholds." />
                        <FaqItem question="What if I have more questions?" answer="We're committed to helping our Affiliates and are here to answer any questions you have. Just email affiliate@nothingbutadventures.com for more support." />
                    </div>
                </div>
            </section>

            {/* ─── CTA Section ───────────────────────────────────────────── */}
            <section className="py-20 sm:py-28 px-4 sm:px-6 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-gradient-to-br from-[#1A1A1A] to-[#333] rounded-3xl p-10 sm:p-16 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
                        <div className="relative z-10">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Ready to Start Earning?</h2>
                            <p className="text-white/60 max-w-lg mx-auto mb-8">Join our community of travel affiliates and turn your passion for adventure into a revenue stream. Apply today — it&apos;s free!</p>
                            <button onClick={() => openModal("affiliate")} className="group px-10 py-4 bg-white text-[#1A1A1A] rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 cursor-pointer shadow-lg shadow-white/10 inline-flex items-center gap-3">
                                Apply Now
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Application Modal ────────────────────────────────────── */}
            <ApplicationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} applicationType={applicationType} />
        </main>
    );
}
