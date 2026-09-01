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
  photo?: string;
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
    <>
      {/* Page-level dark overlay — z-40 covers content below the header (z-50) */}
      {activeMenu && (
        <div
          className="fixed inset-0 bg-black/25 z-40 pointer-events-none transition-opacity duration-300"
        />
      )}
      <header
        onMouseLeave={() => {
          setActiveMenu(null);
          if (openedAtTopRef.current && window.scrollY > 100) {
            setShow(false);
          }
        }}
        className={`relative z-50 font-outfit transition-all duration-300 transform ${isMenuOpenAtTop ? "" : "sticky top-0"
          } ${show ? "translate-y-0" : "-translate-y-full"
          } ${activeMenu ? "bg-[#f3f8ff]" : "bg-white md:bg-white/90 md:backdrop-blur-md"} shadow-[0px_1px_24px_0px_rgba(0,0,0,0.04)] md:shadow-[0px_1px_75px_0px_rgba(0,0,0,0.1)]`}
      >
        {/* Header-level dark overlay — dims header bar but nav (z-[60]) and mega menu (z-[60]) sit above it */}
        {activeMenu && (
          <div className="absolute inset-0 bg-black/25 z-[55] pointer-events-none transition-opacity duration-300 rounded-none" />
        )}
        <div className="w-full max-w-[1280px] mx-auto px-[20.62px] sm:px-6 md:px-8 xl:px-[35px] h-[63px] md:h-[67px]">
          <div className="flex justify-between items-center h-full">
            {/* Desktop Logo: 139px x 31px (Icon 30px x 30.5px, Text 101px x 31px, Gap 8px) */}
            <div className="hidden md:flex items-center justify-start shrink-0">
              <Link href="/" className="flex items-center gap-[8px]">
                <img
                  src="/nba_logo1.svg"
                  alt="Nothing But Adventures Icon"
                  className="w-[30px] h-[30.5px] object-contain transition-all duration-300"
                />
                <img
                  src="/new_ssss.svg"
                  alt="Nothing But Adventures"
                  className="w-[101px] h-[31px] object-contain transition-all duration-300"
                />
              </Link>
            </div>

            {/* Mobile Logo: 105.44px x 23.52px (Icon 22.76px x 23.13px, Text 76.62px x 23.52px, Gap 6.06px) */}
            <div className="flex md:hidden items-center justify-start shrink-0">
              <Link href="/" className="flex items-center gap-[6.06px]">
                <img
                  src="/nba_logo1.svg"
                  alt="Nothing But Adventures Icon"
                  className="w-[22.76px] h-[23.13px] object-contain"
                />
                <div className="flex flex-col justify-center select-none text-left">
                  <span className="font-outfit font-normal text-[9.86px] text-[#1A1A1A] leading-[0.87em] tracking-[-0.01em]">
                    Nothing but
                  </span>
                  <span className="font-gochi font-normal text-[15.17px] text-[#1A1A1A] leading-[0.87em]">
                    Adventures.
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation: 38px pill with uniform 2.5px padding, matching x and y gaps, and fixed button width on hover */}
            <div className="hidden md:flex justify-center items-center">
              <nav className={`relative z-[60] flex items-center h-[38px] rounded-[12px] p-[2.5px] gap-0.5 xl:gap-1 transition-colors duration-200 ${activeMenu ? "bg-white shadow-xs" : "bg-[rgba(181,185,177,0.15)]"}`}>
                <button
                  type="button"
                  onMouseEnter={() => handleMenuEnter("destinations")}
                  onClick={() => {
                    setActiveMenu("destinations");
                  }}
                  aria-expanded={activeMenu === "destinations"}
                  className={`flex items-center justify-center h-[33px] px-3.5 xl:px-5 rounded-[9px] font-outfit text-[16px] leading-none cursor-pointer whitespace-nowrap transition-colors duration-150 ${activeMenu === "destinations"
                    ? "bg-[#1A1A1A] text-white font-normal shadow-xs"
                    : "text-[#1A1A1A] font-light hover:text-black"
                    }`}
                >
                  <span>Destination</span>
                </button>
                <button
                  type="button"
                  onMouseEnter={() => handleMenuEnter("adventures")}
                  onClick={() => {
                    setActiveMenu("adventures");
                  }}
                  aria-expanded={activeMenu === "adventures"}
                  className={`flex items-center justify-center h-[33px] px-3.5 xl:px-5 rounded-[9px] font-outfit text-[16px] leading-none cursor-pointer whitespace-nowrap transition-colors duration-150 ${activeMenu === "adventures"
                    ? "bg-[#1A1A1A] text-white font-normal shadow-xs"
                    : "text-[#1A1A1A] font-light hover:text-black"
                    }`}
                >
                  <span>Adventure</span>
                </button>
                <button
                  type="button"
                  onMouseEnter={() => handleMenuEnter("interests")}
                  onClick={() => {
                    setActiveMenu("interests");
                  }}
                  aria-expanded={activeMenu === "interests"}
                  className={`flex items-center justify-center h-[33px] px-3.5 xl:px-5 rounded-[9px] font-outfit text-[16px] leading-none cursor-pointer whitespace-nowrap transition-colors duration-150 ${activeMenu === "interests"
                    ? "bg-[#1A1A1A] text-white font-normal shadow-xs"
                    : "text-[#1A1A1A] font-light hover:text-black"
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
                  className={`flex items-center justify-center h-[33px] px-3.5 xl:px-5 rounded-[9px] font-outfit text-[16px] leading-none cursor-pointer whitespace-nowrap transition-colors duration-150 ${activeMenu === "deals"
                    ? "bg-[#1A1A1A] text-white font-normal shadow-xs"
                    : "text-[#1A1A1A] font-light hover:text-black"
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
                  className={`flex items-center justify-center h-[33px] px-3.5 xl:px-5 rounded-[9px] font-outfit text-[16px] leading-none cursor-pointer whitespace-nowrap transition-colors duration-150 ${activeMenu === "why-us"
                    ? "bg-[#1A1A1A] text-white font-normal shadow-xs"
                    : "text-[#1A1A1A] font-light hover:text-black"
                    }`}
                >
                  <span>Why us</span>
                </button>
              </nav>
            </div>

            {/* User Authentication & Action: 85.21px x 23.67px (Phone 23.67px, User 23.67px, Gap ~37.87px) */}
            <div className="hidden md:flex items-center justify-end shrink-0 w-[85.21px] gap-[37.87px]">
              {isLoading ? (
                <div className="flex items-center space-x-2 animate-pulse">
                  <div className="w-[23.67px] h-[23.67px] bg-gray-200 rounded-full"></div>
                </div>
              ) : (
                <>
                  {/* Call Icon */}
                  <a
                    href="tel:+1234567890"
                    className="flex items-center justify-center w-[23.67px] h-[23.67px] shrink-0 transition-opacity hover:opacity-75 cursor-pointer"
                    aria-label="Call us"
                  >
                    <img src="/phone-nba.svg" alt="Call" className="w-[23.67px] h-[23.67px]" />
                  </a>

                  {/* Profile Icon */}
                  {user ? (
                    <div className="relative flex items-center shrink-0">
                      <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center justify-center w-[23.67px] h-[23.67px] rounded-full overflow-hidden shrink-0 transition-opacity hover:opacity-75 cursor-pointer"
                        aria-label="User profile"
                      >
                        {user.avatar || user.photo ? (
                          <img
                            src={user.avatar || user.photo}
                            alt={user.name || "Profile"}
                            className="w-[23.67px] h-[23.67px] object-cover rounded-full border border-black/25"
                          />
                        ) : (
                          <img src="/user-nba.svg" alt="Profile" className="w-[23.67px] h-[23.67px]" />
                        )}
                      </button>

                      {/* User Dropdown */}
                      {isUserMenuOpen && (
                        <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 font-sans">
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
                      className="flex items-center justify-center w-[23.67px] h-[23.67px] shrink-0 transition-opacity hover:opacity-75 cursor-pointer"
                      aria-label="Sign in"
                    >
                      <img src="/user-nba.svg" alt="Profile" className="w-[23.67px] h-[23.67px]" />
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Mobile Menu Button: 35.05px x 20.62px */}
            <div className="flex md:hidden items-center justify-center w-[35.05px] h-[20.62px] shrink-0">
              <button
                type="button"
                aria-label="Menu"
                className="w-full h-full flex flex-col justify-between items-stretch py-[1.5px] cursor-pointer focus:outline-none select-none"
              >
                <span className="w-full h-[2.5px] bg-[#1A1A1A] rounded-full"></span>
                <span className="w-full h-[2.5px] bg-[#1A1A1A] rounded-full"></span>
                <span className="w-full h-[2.5px] bg-[#1A1A1A] rounded-full"></span>
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

        {/* Mega Menus — sits above the dark overlay */}
        <div
          className="relative z-[60]"
          onMouseEnter={() => {
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
            }
          }}
          onMouseLeave={handleMenuLeave}
        >
          <WhyUsMegaMenu isHovered={activeMenu === "why-us"} closeMenu={() => setActiveMenu(null)} />
          <DealsMegaMenu isHovered={activeMenu === "deals"} />
          <HeaderMegaMenu activeMenu={activeMenu} closeMenu={() => setActiveMenu(null)} />
        </div>

      </header>
    </>
  );
}
