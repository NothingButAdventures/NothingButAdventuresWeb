"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";

interface User {
  name: string;
  email: string;
  role: string;
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
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

  // Don't show header on auth pages or admin pages (admin has its own layout)
  if (pathname?.startsWith("/auth") || pathname?.startsWith("/admin")) {
    return null;
  }

  const isActivePage = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="bg-white shadow-none  sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold">Logo</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const query = formData.get("search");
                if (query) {
                  router.push(`/search?s=${query}`);
                }
              }}
              className="w-full relative"
            >
              <input
                type="text"
                name="search"
                placeholder="Where to?"
                className="w-full px-4 py-2 pl-10 bg-gray-100 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all duration-200"
              />
              <svg
                className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 transform -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden text-base md:flex items-center space-x-6">
            <Link
              href="/tours"
              className={`font-medium transition-colors duration-200 ${isActivePage("/tours")
                ? "text-blue-600"
                : "text-gray-700 hover:text-blue-600"
                }`}
            >
              Tours
            </Link>
            <Link
              href="/blogs"
              className={`font-medium transition-colors duration-200 ${pathname?.startsWith("/blogs")
                ? "text-blue-600"
                : "text-gray-700 hover:text-blue-600"
                }`}
            >
              Blog
            </Link>

            {isLoading ? (
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
            ) : user ? (
              <Link
                href="/dashboard"
                className={`font-medium transition-colors duration-200 ${isActivePage("/dashboard")
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
                  }`}
              >
                Dashboard
              </Link>
            ) : null}

            {/* User Authentication */}
            {isLoading ? (
              /* Skeleton Loading State */
              <div className="flex items-center space-x-2 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="hidden lg:block w-20 h-4 bg-gray-200 rounded"></div>
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                    >
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium hidden lg:inline">{user.name}</span>
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* User Dropdown */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-10">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                            {user.role}
                          </span>
                        </div>

                        {user.role === "admin" && (
                          <Link
                            href="/admin"
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <svg
                              className="w-4 h-4 mr-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            Admin Panel
                          </Link>
                        )}

                        {(user.role === "copywriter" || user.role === "admin") && (
                          <Link
                            href="/blogs/my-blogs"
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <svg
                              className="w-4 h-4 mr-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                              />
                            </svg>
                            My Blogs
                          </Link>
                        )}

                        {user.role === "partner" && (
                          <Link
                            href="/partner/tours"
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <svg
                              className="w-4 h-4 mr-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            My Tours
                          </Link>
                        )}

                        <div className="border-t border-gray-100 mt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <svg
                              className="w-4 h-4 mr-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                      href="/auth/login"
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/tours"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Tours
              </Link>
              <Link
                href="/blogs"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>

              {isLoading ? (
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
              ) : user ? (
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              ) : null}

              {isLoading ? (
                /* Mobile Skeleton Loading State */
                <div className="pt-4 border-t border-gray-200 animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="w-24 h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="w-16 h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {user ? (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500">{user.role}</p>
                        </div>
                      </div>

                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          className="block text-gray-700 hover:text-blue-600 font-medium mb-3 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}

                      {(user.role === "copywriter" || user.role === "admin") && (
                        <Link
                          href="/blogs/my-blogs"
                          className="block text-gray-700 hover:text-blue-600 font-medium mb-3 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          My Blogs
                        </Link>
                      )}

                      {user.role === "partner" && (
                        <Link
                          href="/partner/tours"
                          className="block text-gray-700 hover:text-blue-600 font-medium mb-3 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          My Tours
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="text-red-600 hover:text-red-700 font-medium transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="pt-4 border-t border-gray-200 space-y-3">
                      <Link
                        href="/auth/login"
                        className="block text-gray-700 hover:text-blue-600 font-medium transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/auth/register"
                        className="block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2.5 px-6 rounded-xl text-center transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Get Started
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
