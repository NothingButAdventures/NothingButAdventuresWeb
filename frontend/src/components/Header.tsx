"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";
import HeaderMegaMenu from "./HeaderMegaMenu";
import WhyUsMegaMenu from "./WhyUsMegaMenu";
import DealsMegaMenu from "./DealsMegaMenu";

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
  const [activeMenu, setActiveMenu] = useState<"adventures" | "interests" | "destinations" | "why-us" | "deals" | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll reveal state
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const openedAtTopRef = useRef(false);

  useEffect(() => {
    if (activeMenu) {
      if (window.scrollY < 50) {
        openedAtTopRef.current = true;
      }
    } else {
      openedAtTopRef.current = false;
    }
  }, [activeMenu]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Close dropdowns if scrolling
      if (Math.abs(currentScrollY - lastScrollY) > 20 && isUserMenuOpen) {
        setIsUserMenuOpen(false);
      }

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        if (activeMenu && openedAtTopRef.current) {
          // Do nothing, let it stay open and scroll with the page naturally.
        } else {
          setShow(false);
          setActiveMenu(null); // Also close mega menus when hiding header
        }
      } else {
        // Scrolling up
        setShow(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isUserMenuOpen, activeMenu]);

  const handleMenuEnter = (menu: "adventures" | "interests" | "destinations" | "why-us" | "deals") => {
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

  const isMenuOpenAtTop = activeMenu && openedAtTopRef.current;

  return (
    <header
      onMouseLeave={() => {
        setActiveMenu(null);
        if (openedAtTopRef.current && window.scrollY > 100) {
          setShow(false);
        }
      }}
      className={`relative z-50 font-outfit px-4 md:px-8 transition-all duration-300 transform ${isMenuOpenAtTop ? "" : "sticky top-0"
        } ${show ? "translate-y-0" : "-translate-y-full"
        } ${activeMenu ? "bg-[#f3f8ff]" : "bg-white"}`}
    >
      <div className="mx-auto">
        <div className="flex justify-between items-center md:grid md:grid-cols-[1fr_auto_1fr] py-4">
          {/* Logo */}
          <div className="flex items-center justify-start">
            <Link href="/" className="flex items-center space-x-3">
              <img
                src="/nba_logo1.svg"
                alt="Nothing But Adventures Icon"
                className="h-10 md:h-10 w-auto object-contain transition-all duration-300"
              />
              <img
                src="/nba_logo2.svg"
                alt="Nothing But Adventures"
                className="h-10 md:h-10 w-auto object-contain transition-all duration-300"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex justify-center">
            <nav className={`flex items-stretch rounded-xl overflow-hidden transition-colors duration-200 ${activeMenu ? "bg-[#f3f8ff]" : "bg-[#f5f5f5]"}`}>
              <button
                type="button"
                onMouseEnter={() => handleMenuEnter("destinations")}
                onClick={() => {
                  setActiveMenu("destinations");
                }}
                aria-expanded={activeMenu === "destinations"}
                className={`flex items-center justify-center px-6 py-2.5 text-[#3F3F42] transition-all font-normal text-[16px] cursor-pointer rounded-xl ${activeMenu === "destinations" ? "bg-white text-[#412A6B] font-medium" : "hover:text-[#3F3F42]"
                  }`}
              >
                <span>Destinations</span>
              </button>
              <button
                type="button"
                onMouseEnter={() => handleMenuEnter("adventures")}
                onClick={() => {
                  setActiveMenu("adventures");
                }}
                aria-expanded={activeMenu === "adventures"}
                className={`flex items-center justify-center px-6 py-2.5 text-[#3F3F42] transition-all font-normal text-[16px] cursor-pointer rounded-xl ${activeMenu === "adventures" ? "bg-white text-[#412A6B] font-medium" : "hover:text-[#3F3F42]"
                  }`}
              >
                <span>Adventures</span>
              </button>
              <button
                type="button"
                onMouseEnter={() => handleMenuEnter("interests")}
                onClick={() => {
                  setActiveMenu("interests");
                }}
                aria-expanded={activeMenu === "interests"}
                className={`flex items-center justify-center px-6 py-2.5 text-[#3F3F42] transition-all font-normal text-[16px] cursor-pointer rounded-xl ${activeMenu === "interests" ? "bg-white text-[#412A6B] font-medium" : "hover:text-[#3F3F42]"
                  }`}
              >
                <span>Explore by Interest</span>
              </button>
              <button
                type="button"
                onMouseEnter={() => handleMenuEnter("deals")}
                onClick={() => {
                  setActiveMenu("deals");
                }}
                aria-expanded={activeMenu === "deals"}
                className={`flex items-center justify-center px-6 py-2.5 text-[#3F3F42] transition-all font-normal text-[16px] cursor-pointer rounded-xl ${activeMenu === "deals" ? "bg-white text-[#412A6B] font-medium" : "hover:text-[#3F3F42]"
                  }`}
              >
                <span>Deals</span>
              </button>
              <button
                type="button"
                onMouseEnter={() => handleMenuEnter("why-us")}
                onClick={() => {
                  setActiveMenu("why-us");
                }}
                aria-expanded={activeMenu === "why-us"}
                className={`flex items-center justify-center px-6 py-2.5 text-[#3F3F42] transition-all font-normal text-[16px] cursor-pointer rounded-xl ${activeMenu === "why-us" ? "bg-white text-[#412A6B] font-medium" : "hover:text-[#3F3F42]"
                  }`}
              >
                <span>Why Us</span>
              </button>
            </nav>
          </div>

          {/* User Authentication & Action */}
          <div className="hidden md:flex items-center justify-end space-x-4">
            {activeMenu ? (
              <button
                type="button"
                onClick={() => {
                  setActiveMenu(null);
                  if (openedAtTopRef.current && window.scrollY > 100) {
                    setShow(false);
                  }
                }}
                className="w-10 h-10 rounded-full bg-[#412A6B] text-white flex items-center justify-center transition-all hover:bg-[#3F3F42] cursor-pointer"
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
                  <img src="/phone-nba.svg" alt="Call" className="w-6 h-6" />
                </a>

                {/* Profile Icon */}
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="User profile"
                    >
                      <img src="/user-nba.svg" alt="Profile" className="w-6 h-6" />
                    </button>

                    {/* User Dropdown */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-10 font-sans">
                        <div className="px-5 py-3 border-b border-gray-100 mb-2">
                          <p className="text-sm font-bold text-[#3F3F42]">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-800 mt-2">
                            {user.role}
                          </span>
                        </div>

                        <Link href="/dashboard" className="flex items-center px-5 py-2.5 text-sm text-[#3F3F42] hover:bg-gray-50 hover:text-[#3F3F42] transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                          <span className="font-medium">Dashboard</span>
                        </Link>
                        <Link href="/trips" className="flex items-center px-5 py-2.5 text-sm text-[#3F3F42] hover:bg-gray-50 hover:text-[#3F3F42] transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                          <span className="font-medium">Trips</span>
                        </Link>
                        <Link href="/blogs" className="flex items-center px-5 py-2.5 text-sm text-[#3F3F42] hover:bg-gray-50 hover:text-[#3F3F42] transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                          <span className="font-medium">Blog</span>
                        </Link>
                        <Link href="/wallet" className="flex items-center px-5 py-2.5 text-sm text-[#3F3F42] hover:bg-gray-50 hover:text-[#3F3F42] transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                          <span className="font-medium">Wallet (${(user.walletBalance || 0).toLocaleString()})</span>
                        </Link>

                        <div className="my-2 border-t border-gray-100"></div>

                        <Link href="/profile" className="flex items-center px-5 py-2.5 text-sm text-[#3F3F42] hover:bg-gray-50 transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                          My Profile
                        </Link>

                        <Link href="/wishlist" className="flex items-center px-5 py-2.5 text-sm text-[#3F3F42] hover:bg-gray-50 transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                          My Wishlist
                        </Link>

                        {user.role === "admin" && (
                          <>
                            <Link href="/guide" className="flex items-center px-5 py-2.5 text-sm text-purple-700 font-semibold hover:bg-purple-50 transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                              App Directory & Guide
                            </Link>

                            <Link href="/admin" className="flex items-center px-5 py-2.5 text-sm text-[#3F3F42] hover:bg-gray-50 transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                              Admin Panel
                            </Link>
                          </>
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
                    <img src="/user-nba.svg" alt="Profile" className="w-6 h-6" />
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#3F3F42] hover:text-[#3F3F42] transition-colors"
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
              <Link href="/" className="text-[#3F3F42] hover:text-blue-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link href="/trips" className="text-[#3F3F42] hover:text-blue-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>Trips</Link>
              <Link href="/blogs" className="text-[#3F3F42] hover:text-blue-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>Blog</Link>
              <Link href="/destinations" className="text-[#3F3F42] hover:text-blue-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>Destinations</Link>
              <Link href="/travel-styles" className="text-[#3F3F42] hover:text-blue-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>Adventures</Link>
              <Link href="/trips" className="text-[#3F3F42] hover:text-blue-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>Explore by Interest</Link>

              {user ? (
                <>
                  <Link href="/dashboard" className="text-[#3F3F42] hover:text-blue-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                  <Link href="/wallet" className="text-[#3F3F42] hover:text-blue-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>Wallet (${(user.walletBalance || 0).toLocaleString()})</Link>
                  <Link href="/profile" className="text-[#3F3F42] hover:text-blue-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>My Profile</Link>
                  <Link href="/wishlist" className="text-[#3F3F42] hover:text-blue-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>My Wishlist</Link>
                  {user.role === "admin" && (
                    <Link href="/guide" className="text-purple-700 font-semibold hover:text-purple-900 transition-colors" onClick={() => setIsMenuOpen(false)}>App Directory & Guide</Link>
                  )}
                  <button onClick={handleLogout} className="text-red-600 hover:text-red-700 font-medium text-left transition-colors">Sign Out</button>
                </>
              ) : (
                <div className="pt-4 border-t border-gray-200 mt-4">
                  <Link href="/auth/login" className="block text-[#3F3F42] hover:text-blue-600 font-medium mb-3 transition-colors" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                  <Link href="/auth/register" className="block bg-[#3F3F42] text-white font-medium py-3 px-6 rounded-xl text-center transition-colors" onClick={() => setIsMenuOpen(false)}>Plan My Trip</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mega Menus */}
      <div
        onMouseEnter={() => {
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
          }
        }}
      >
        <WhyUsMegaMenu isHovered={activeMenu === "why-us"} />
        <DealsMegaMenu isHovered={activeMenu === "deals"} />
        <HeaderMegaMenu activeMenu={activeMenu} closeMenu={() => setActiveMenu(null)} />
      </div>

    </header>
  );
}
