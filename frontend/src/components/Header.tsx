"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";
import HeaderMegaMenu from "./HeaderMegaMenu";

interface User {
  name: string;
  email: string;
  role: string;
  avatar?: string;
  walletBalance?: number;
}


export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<"adventures" | "destinations" | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMenuEnter = (menu: "adventures" | "destinations") => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setActiveMenu(menu);
  };

  const handleMenuLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150);
  };

  useEffect(() => {
    checkAuth();
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    setActiveMenu(null);
  }, [pathname]);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${api.baseURL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
      } else {
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsUserMenuOpen(false);
    router.push("/");
  };

  if (pathname?.startsWith("/auth") || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header 
      onMouseLeave={() => setActiveMenu(null)}
      className={`relative sticky top-0 z-50 font-outfit px-4 md:px-8 transition-colors duration-200 ${activeMenu ? "bg-[#f3f8ff]" : "bg-white"}`}
    >
      <div className="mx-auto">
        <div className="flex justify-between items-center md:grid md:grid-cols-[1fr_auto_1fr] py-4">
          {/* Logo */}
          <div className="flex items-center justify-start">
            <Link href="/" className="flex items-center space-x-3">
              <img src="/icon.png" alt="Nothing But Adventure Logo" className="w-[44px] h-[44px] object-contain" />
              <div className="flex flex-col leading-none logo-text">
                <span className="text-[18px] font-bold tracking-widest mt-0.5 flex items-center">
                  NOTHING
                  <span className="lowercase font-normal ml-1" style={{ fontFamily: '"Brush Script MT", "League Script", "Dancing Script", cursive', fontSize: '24px', letterSpacing: 'normal', transform: 'translateY(-2px)' }}>but</span>
                </span>
                <span className="text-[18px] font-bold tracking-widest mt-0.5">ADVENTURES</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex justify-center">
            <nav className={`flex items-stretch rounded-xl overflow-hidden transition-colors duration-200 ${activeMenu ? "bg-[#f3f8ff]" : "bg-[#f5f5f5]"}`}>
              <button
                type="button"
                onMouseEnter={() => handleMenuEnter("adventures")}
                onClick={() => {
                  if (activeMenu === "adventures") {
                    setActiveMenu(null);
                  } else {
                    setActiveMenu("adventures");
                  }
                }}
                aria-expanded={activeMenu === "adventures"}
                className={`flex items-center justify-center px-6 py-3.5 text-gray-800 transition-all font-medium text-[16px] cursor-pointer ${activeMenu === "adventures" ? "bg-white text-[#a64dff]  font-semibold" : "hover:text-black"
                  }`}
              >
                <span>Adventures</span>
              </button>
              <button
                type="button"
                onMouseEnter={() => handleMenuEnter("destinations")}
                onClick={() => {
                  if (activeMenu === "destinations") {
                    setActiveMenu(null);
                  } else {
                    setActiveMenu("destinations");
                  }
                }}
                aria-expanded={activeMenu === "destinations"}
                className={`flex items-center justify-center px-6 py-2.5 text-gray-800 transition-all font-medium text-[16px] cursor-pointer ${activeMenu === "destinations" ? "bg-white text-[#a64dff] font-semibold" : "hover:text-black"
                  }`}
              >
                <span>Destinations</span>
              </button>
              <div className="flex items-center justify-center cursor-pointer text-gray-800 hover:text-black transition-all px-6 py-2.5 text-[16px] font-medium">
                <span>Deals</span>
              </div>
              <div className="flex items-center justify-center cursor-pointer text-gray-800 hover:text-black transition-all px-6 py-2.5 text-[16px] font-medium">
                <span>Why Us</span>
              </div>
            </nav>
          </div>

          {/* User Authentication & Action */}
          <div className="hidden md:flex items-center justify-end space-x-4">
            {activeMenu ? (
              <button
                type="button"
                onClick={() => setActiveMenu(null)}
                className="w-10 h-10 rounded-full bg-[#a64dff] text-white flex items-center justify-center transition-all hover:bg-[#913be6] cursor-pointer"
                aria-label="Close megamenu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : isLoading ? (
              <div className="flex items-center space-x-2 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              </div>
            ) : (
              <>
                {/* Call Icon */}
                <a
                  href="tel:+1234567890"
                  className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Call us"
                >
                  <img src="/call-header.svg" alt="Call" className="w-6 h-6" />
                </a>

                {/* Profile Icon */}
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="User profile"
                    >
                      <img src="/profile-header.svg" alt="Profile" className="w-6 h-6" />
                    </button>

                    {/* User Dropdown */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-10 font-sans">
                        <div className="px-5 py-3 border-b border-gray-100 mb-2">
                          <p className="text-sm font-bold text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-800 mt-2">
                            {user.role}
                          </span>
                        </div>

                        <Link href="/dashboard" className="flex items-center px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                          <span className="font-medium">Dashboard</span>
                        </Link>
                        <Link href="/trips" className="flex items-center px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                          <span className="font-medium">Trips</span>
                        </Link>
                        <Link href="/blogs" className="flex items-center px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                          <span className="font-medium">Blog</span>
                        </Link>
                        <Link href="/wallet" className="flex items-center px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                          <span className="font-medium">Wallet (${(user.walletBalance || 0).toLocaleString()})</span>
                        </Link>

                        <div className="my-2 border-t border-gray-100"></div>

                        <Link href="/profile" className="flex items-center px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                          My Profile
                        </Link>

                        <Link href="/wishlist" className="flex items-center px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                          My Wishlist
                        </Link>

                        {user.role === "admin" && (
                          <Link href="/admin" className="flex items-center px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                            Admin Panel
                          </Link>
                        )}

                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Sign in"
                  >
                    <img src="/profile-header.svg" alt="Profile" className="w-6 h-6" />
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-black transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 font-sans">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link href="/trips" className="text-gray-700 hover:text-blue-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>Trips</Link>
              <Link href="/blogs" className="text-gray-700 hover:text-blue-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>Blog</Link>
              <Link href="/travel-styles" className="text-gray-700 hover:text-blue-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>Adventures</Link>
              <Link href="/destinations" className="text-gray-700 hover:text-blue-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>Destinations</Link>

              {user ? (
                <>
                  <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                  <Link href="/wallet" className="text-gray-700 hover:text-blue-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>Wallet (${(user.walletBalance || 0).toLocaleString()})</Link>
                  <Link href="/profile" className="text-gray-700 hover:text-blue-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>My Profile</Link>
                  <Link href="/wishlist" className="text-gray-700 hover:text-blue-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>My Wishlist</Link>
                  <button onClick={handleLogout} className="text-red-600 hover:text-red-700 font-medium text-left transition-colors">Sign Out</button>
                </>
              ) : (
                <div className="pt-4 border-t border-gray-200 mt-4">
                  <Link href="/auth/login" className="block text-gray-700 hover:text-blue-600 font-medium mb-3 transition-colors" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                  <Link href="/auth/register" className="block bg-[#111] text-white font-medium py-3 px-6 rounded-xl text-center transition-colors" onClick={() => setIsMenuOpen(false)}>Plan My Trip</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Adventures Mega Menu */}
      <div
        onMouseEnter={() => {
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
          }
        }}
      >
        <HeaderMegaMenu activeMenu={activeMenu} />
      </div>

    </header>
  );
}
