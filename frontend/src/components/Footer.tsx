"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();

    // Don't show footer on admin pages
    if (pathname?.startsWith("/admin")) {
        return null;
    }

    return (
        <footer className="w-full px-4 sm:px-6 md:px-8 lg:px-4 pt-10 pb-4 font-outfit">
            {/* Dark Curved Image Card Footer */}
            <div className="relative rounded-[14px] sm:rounded-[14px] overflow-hidden text-white p-8 sm:p-12 lg:p-16 mb-6 shadow-md bg-[#23272A]">
                {/* Background Image with Dark Overlay */}
                <img
                    src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=3540&auto=format&fit=crop"
                    alt="Footer background"
                    className="absolute inset-0 w-full h-full object-cover opacity-35"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#18181B]/95 via-[#18181B]/80 to-[#18181B]/40 pointer-events-none"></div>

                {/* Spiral Ambient Graphic Overlay on Left */}
                <div className="absolute -left-20 -bottom-20 w-[420px] h-[420px] rounded-full border-[40px] border-white/[0.04] pointer-events-none"></div>
                <div className="absolute -left-10 -bottom-10 w-[300px] h-[300px] rounded-full border-[30px] border-white/[0.04] pointer-events-none"></div>

                {/* Card Content Grid */}
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">

                    {/* Left Brand Column */}
                    <div className="col-span-1 lg:col-span-5 max-w-md">
                        <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-white leading-tight tracking-tight font-outfit">
                            Nothing but<br />
                            Adventures.
                        </h2>
                        <div className="w-24 h-[2px] bg-white/40 my-5"></div>
                        <p className="text-xs sm:text-sm text-white/80 font-normal leading-relaxed font-outfit mb-6 max-w-xs">
                            Curating authentic Indian experiences for discerning travelers since 2015.
                        </p>

                        {/* Social Media Circular Buttons */}
                        <div className="flex items-center gap-3">
                            <a href="#" className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-xs transition-colors cursor-pointer" aria-label="Facebook">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-xs transition-colors cursor-pointer" aria-label="Instagram">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-xs transition-colors cursor-pointer" aria-label="Twitter">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-xs transition-colors cursor-pointer" aria-label="YouTube">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                            </a>
                        </div>
                    </div>

                    {/* Right Columns Grid */}
                    <div className="col-span-1 lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
                        {/* Destinations */}
                        <div>
                            <h3 className="font-semibold text-sm sm:text-base text-white mb-4 font-outfit">Destinations</h3>
                            <ul className="space-y-2.5 text-xs sm:text-sm text-white/80 font-normal font-outfit">
                                <li><Link href="/trips?destination=rajasthan" className="hover:text-white transition-colors">Rajasthan</Link></li>
                                <li><Link href="/trips?destination=kerala" className="hover:text-white transition-colors">Kerala</Link></li>
                                <li><Link href="/trips?destination=himalayas" className="hover:text-white transition-colors">Himalayas</Link></li>
                                <li><Link href="/trips?destination=golden-triangle" className="hover:text-white transition-colors">Golden Triangle</Link></li>
                                <li><Link href="/trips?destination=varanasi" className="hover:text-white transition-colors">Varanasi</Link></li>
                                <li><Link href="/trips?destination=goa" className="hover:text-white transition-colors">Goa</Link></li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h3 className="font-semibold text-sm sm:text-base text-white mb-4 font-outfit">Company</h3>
                            <ul className="space-y-2.5 text-xs sm:text-sm text-white/80 font-normal font-outfit">
                                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                                <li><Link href="/why-choose-us" className="hover:text-white transition-colors">Why Choose Us</Link></li>
                                <li><Link href="/reviews" className="hover:text-white transition-colors">Reviews</Link></li>
                                <li><Link href="/blogs" className="hover:text-white transition-colors">Travel Blog</Link></li>
                                <li><Link href="/sustainability" className="hover:text-white transition-colors">Sustainability</Link></li>
                                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                            </ul>
                        </div>

                        {/* Contact Us */}
                        <div>
                            <h3 className="font-semibold text-sm sm:text-base text-white mb-4 font-outfit">Contact Us</h3>
                            <ul className="space-y-3.5 text-xs sm:text-sm text-white/80 font-normal font-outfit">
                                <li className="flex items-center gap-3">
                                    <svg className="w-4 h-4 text-white/80 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    <a href="mailto:hello@nothingbutadventures.com" className="hover:text-white transition-colors">hello@nothingbutadventures.com</a>
                                </li>
                                <li className="flex items-center gap-3">
                                    <svg className="w-4 h-4 text-white/80 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    <a href="tel:+911234567890" className="hover:text-white transition-colors">+91 123 456 7890</a>
                                </li>
                                <li className="flex items-center gap-3">
                                    <svg className="w-4 h-4 text-white/80 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <span>New Delhi, India</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub-Footer Copyright & Legal Links */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-outfit px-2">
                <p>© 2026 Nothing But Adventures. All rights reserved.</p>
                <div className="flex items-center gap-6">
                    <Link href="/privacy-policy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
                    <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
                    <Link href="/cookie-policy" className="hover:text-gray-900 transition-colors">Cookie Policy</Link>
                </div>
            </div>
        </footer>
    );
}
