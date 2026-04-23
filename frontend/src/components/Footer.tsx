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
    <footer className="bg-[#161616] text-white w-full">
      <div className="w-full px-6 md:px-12 lg:px-20 py-16">
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-24 mb-16">

          {/* Brand Column */}
          <div className="lg:w-1/3">
            <h2 className="text-[24px] font-medium mb-6">Nothing But Adventures</h2>
            <p className="text-[#a3a3a3] text-[15px] leading-[1.6] mb-8 font-medium max-w-[320px]">
              Curating authentic Indian experiences for discerning travelers since 2015.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center text-white hover:bg-[#333] transition-colors">
                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M14.82 8.18v-1.6c0-1.14.86-1.55 1.74-1.55H18V1.56s-1.3-.23-2.52-.23c-2.58 0-4.22 1.57-4.22 4.4v2.45H8.76v3.66h2.5v9.54h3.56v-9.54h3.04l.46-3.66h-3.5z" /></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center text-white hover:bg-[#333] transition-colors">
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center text-white hover:bg-[#333] transition-colors">
                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center text-white hover:bg-[#333] transition-colors">
                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 lg:gap-8">
            {/* Destinations */}
            <div>
              <h3 className="font-semibold text-[16px] mb-6 text-white tracking-wide">Destinations</h3>
              <ul className="space-y-4 font-medium">
                <li><Link href="/trips?destination=rajasthan" className="text-[#a3a3a3] hover:text-white transition-colors">Rajasthan</Link></li>
                <li><Link href="/trips?destination=kerala" className="text-[#a3a3a3] hover:text-white transition-colors">Kerala</Link></li>
                <li><Link href="/trips?destination=himalayas" className="text-[#a3a3a3] hover:text-white transition-colors">Himalayas</Link></li>
                <li><Link href="/trips?destination=golden-triangle" className="text-[#a3a3a3] hover:text-white transition-colors">Golden Triangle</Link></li>
                <li><Link href="/trips?destination=varanasi" className="text-[#a3a3a3] hover:text-white transition-colors">Varanasi</Link></li>
                <li><Link href="/trips?destination=goa" className="text-[#a3a3a3] hover:text-white transition-colors">Goa</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-[16px] mb-6 text-white tracking-wide">Company</h3>
              <ul className="space-y-4 font-medium">
                <li><Link href="/about" className="text-[#a3a3a3] hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/why-choose-us" className="text-[#a3a3a3] hover:text-white transition-colors">Why Choose Us</Link></li>
                <li><Link href="/reviews" className="text-[#a3a3a3] hover:text-white transition-colors">Reviews</Link></li>
                <li><Link href="/blog" className="text-[#a3a3a3] hover:text-white transition-colors">Travel Blog</Link></li>
                <li><Link href="/sustainability" className="text-[#a3a3a3] hover:text-white transition-colors">Sustainability</Link></li>
                <li><Link href="/careers" className="text-[#a3a3a3] hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>

            {/* Contact Us */}
            <div>
              <h3 className="font-semibold text-[16px] mb-6 text-white tracking-wide">Contact Us</h3>
              <ul className="space-y-5 font-medium">
                <li className="flex items-start gap-4">
                  <svg className="w-5 h-5 text-[#a3a3a3] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <a href="mailto:hello@nothingbutadventures.com" className="text-[#a3a3a3] hover:text-white transition-colors">hello@nothingbutadventures.com</a>
                </li>
                <li className="flex items-start gap-4">
                  <svg className="w-5 h-5 text-[#a3a3a3] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <a href="tel:+911234567890" className="text-[#a3a3a3] hover:text-white transition-colors">+91 123 456 7890</a>
                </li>
                <li className="flex items-start gap-4">
                  <svg className="w-5 h-5 text-[#a3a3a3] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="text-[#a3a3a3]">New Delhi, India</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="pt-8 border-t border-[#333] flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[#a3a3a3] text-sm font-medium">
            © 2026 Nothing But Adventures. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm font-medium text-[#a3a3a3]">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
