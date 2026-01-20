"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-8">
      {/* Mountain silhouette decoration */}
      {/* <div className="relative mb-12">
        <svg
          viewBox="0 0 1440 180"
          className="w-full h-auto"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,80 L80,40 L160,60 L240,20 L320,50 L400,30 L480,45 L560,25 L640,35 L720,45 L800,30 L880,50 L960,35 L1040,55 L1120,35 L1200,65 L1280,40 L1360,70 L1440,30 L1440,180 L0,180 Z"
            fill="black"
            opacity="1"
          />

          <g>
            <circle cx="100" cy="35" r="3" fill="white" />
            <circle cx="110" cy="40" r="2.5" fill="white" />
            <line
              x1="100"
              y1="38"
              x2="100"
              y2="50"
              stroke="white"
              strokeWidth="2"
            />
            <line
              x1="110"
              y1="42"
              x2="110"
              y2="52"
              stroke="white"
              strokeWidth="2"
            />

            <circle cx="1350" cy="60" r="3" fill="white" />
            <circle cx="1340" cy="55" r="2.5" fill="white" />
            <circle cx="1360" cy="50" r="2" fill="white" />
            <line
              x1="1350"
              y1="63"
              x2="1350"
              y2="75"
              stroke="white"
              strokeWidth="2"
            />
          </g>
        </svg>
      </div> */}

      {/* Footer Content */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* About Column */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-white">About</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-white transition"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-gray-400 hover:text-white transition"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/giving-back"
                  className="text-gray-400 hover:text-white transition"
                >
                  Giving Back
                </Link>
              </li>
              <li>
                <Link
                  href="/work-with-us"
                  className="text-gray-400 hover:text-white transition"
                >
                  Work With Us
                </Link>
              </li>
              <li>
                <Link
                  href="/agent-signup"
                  className="text-gray-400 hover:text-white transition"
                >
                  Agent Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-white">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-white transition"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/faqs"
                  className="text-gray-400 hover:text-white transition"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/travel-updates"
                  className="text-gray-400 hover:text-white transition"
                >
                  Travel Updates
                </Link>
              </li>
            </ul>
          </div>

          {/* Assurance Column */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-white">Assurance</h3>
            {/* <ul className="space-y-3">
              <li>
                <Link
                  href="/abta-member"
                  className="text-gray-400 hover:text-white transition"
                >
                  ABTA Member
                </Link>
              </li>
              <li>
                <Link
                  href="/atol-member"
                  className="text-gray-400 hover:text-white transition"
                >
                  ATOL Member
                </Link>
              </li>
              <li>
                <Link
                  href="/best-price"
                  className="text-gray-400 hover:text-white transition"
                >
                  Best Price Promise
                </Link>
              </li>
              <li>
                <Link
                  href="/trust"
                  className="text-gray-400 hover:text-white transition"
                >
                  Trust
                </Link>
              </li>
            </ul> */}
          </div>

          {/* Legal & Privacy Column */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-white">
              Legal & Privacy
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/cookie-policy"
                  className="text-gray-400 hover:text-white transition"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/data-deletion"
                  className="text-gray-400 hover:text-white transition"
                >
                  Data Deletion
                </Link>
              </li>
              <li>
                <Link
                  href="/financial-protection"
                  className="text-gray-400 hover:text-white transition"
                >
                  Financial Protection
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-gray-400 hover:text-white transition"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-and-conditions"
                  className="text-gray-400 hover:text-white transition"
                >
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-use"
                  className="text-gray-400 hover:text-white transition"
                >
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>

          {/* Opening Hours Column */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-white">
              Opening Hours
            </h3>
            {/* <ul className="space-y-3">
              <li>
                <div className="text-gray-400">Monday - Friday</div>
                <div className="text-white font-medium">9am - 6pm</div>
              </li>
              <li>
                <div className="text-gray-400">Saturday</div>
                <div className="text-white font-medium">10am - 4pm</div>
              </li>
              <li>
                <div className="text-gray-400">Sunday</div>
                <div className="text-white font-medium">Closed</div>
              </li>
              <li className="pt-2">
                <div className="text-white font-semibold">0208 004 8886</div>
              </li>
            </ul> */}
          </div>
        </div>

        {/* Payment Methods and Language Selector */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-8">
          {/* Payment Methods */}
          <div className="flex gap-3 flex-wrap justify-center md:justify-start">
            {/* Mastercard */}
            <div className="bg-white p-2 rounded">
              <svg
                className="w-10 h-6"
                viewBox="0 0 48 32"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="48" height="32" fill="white" />
                <circle cx="16" cy="16" r="9" fill="#EB001B" />
                <circle cx="32" cy="16" r="9" fill="#F79E1B" />
              </svg>
            </div>
            {/* Visa */}
            <div className="bg-white p-2 rounded">
              <svg
                className="w-10 h-6"
                viewBox="0 0 48 32"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="48" height="32" fill="#1434CB" />
                <text
                  x="24"
                  y="20"
                  fontSize="14"
                  fontWeight="bold"
                  fill="white"
                  textAnchor="middle"
                >
                  VISA
                </text>
              </svg>
            </div>
            {/* American Express */}
            <div className="bg-white p-2 rounded">
              <svg
                className="w-10 h-6"
                viewBox="0 0 48 32"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="48" height="32" fill="#006FCF" />
                <text
                  x="24"
                  y="20"
                  fontSize="12"
                  fontWeight="bold"
                  fill="white"
                  textAnchor="middle"
                >
                  AMEX
                </text>
              </svg>
            </div>
          </div>

          {/* Language Selector */}
          {/* <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full text-white transition">
            <svg
              className="w-5 h-5"
              viewBox="0 0 36 36"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="36" height="36" fill="#012169" />
              <path d="M0 0h36v36H0z" fill="#012169" />
              <path d="M0 0L36 36M36 0L0 36" stroke="white" strokeWidth="6" />
              <path d="M18 0v36M0 18h36" stroke="#C8102E" strokeWidth="4" />
            </svg>
            <span>£</span>
          </button> */}
        </div>

        {/* Bottom Copyright and Social Links */}
        <div className=" pt-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-gray-400 text-sm text-center md:text-left">
            © 2026 Nothing But Adventures. All rights reserved. Registered in
            England and Wales, No: 10367760 VAT No: 290274304
          </p>

          {/* Social Links */}
          <div className="flex gap-6">
            <Link
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full flex items-center justify-center text-white hover:scale-110 transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.266.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163C8.756 0 8.331.012 7.052.07 2.696.27.273 2.69.073 7.052.012 8.331 0 8.756 0 12s.012 3.669.07 4.948c.2 4.358 2.619 6.78 6.98 6.98 1.281.058 1.7.07 4.948.07 3.248 0 3.669-.012 4.948-.07 4.354-.2 6.782-2.618 6.979-6.98.058-1.28.07-1.7.07-4.948 0-3.248-.012-3.669-.07-4.948-.196-4.354-2.617-6.78-6.979-6.98C15.668.012 15.259 0 12 0z" />
                <path d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.322a1.44 1.44 0 110-2.88 1.44 1.44 0 010 2.88z" />
              </svg>
            </Link>
            <Link
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </Link>
            <Link
              href="mailto:contact@nothingbutadventures.com"
              className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </Link>
            <Link
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
