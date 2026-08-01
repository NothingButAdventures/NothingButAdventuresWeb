"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

interface RouteItem {
  id: string;
  path: string;
  name: string;
  category: "public" | "customer" | "partner" | "admin" | "content";
  role: "Guest" | "Customer" | "Partner" | "Admin";
  roleColor: string;
  summary: string;
  features: string[];
  components?: string[];
  relatedRoutes?: string[];
}

const ROUTE_DIRECTORY: RouteItem[] = [
  // PUBLIC & DISCOVERY
  {
    id: "home",
    path: "/",
    name: "Home Showcase Page",
    category: "public",
    role: "Guest",
    roleColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    summary: "Main landing portal featuring top adventure trips, hero search drawer, popular destinations, local guide spotlights, and brand promises.",
    features: [
      "Dynamic Hero Search Drawer with instant destination filtering",
      "Featured Tour Carousels & Trending Destinations Grid",
      "Interactive 'Why Adventure With Us' & Local Guide Spotlights",
      "Adventures, Destinations, and Deals Mega Menus"
    ],
    components: ["Header", "AdventuresMegaMenu", "PopularToursSection", "PopularDestinationsSection", "MeetLocalGuidesSection"],
    relatedRoutes: ["/search", "/destinations", "/trips"]
  },
  {
    id: "search",
    path: "/search",
    name: "Global Search & Filter Engine",
    category: "public",
    role: "Guest",
    roleColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    summary: "Comprehensive multi-parameter tour search page with real-time filtering, sorting, price range sliders, and physical rating controls.",
    features: [
      "Multi-field filtering: Destination, Duration, Budget, Physical Rating, Travel Style",
      "Instant live results count update without full page reload",
      "Sort by Popularity, Price (Low to High / High to Low), and Next Departure Date",
      "Quick view card previews with instant wishlist toggle"
    ],
    components: ["TourCard", "QuickViewModal"],
    relatedRoutes: ["/trips", "/destinations", "/travel-styles"]
  },
  {
    id: "destinations-index",
    path: "/destinations",
    name: "Destinations Explorer",
    category: "public",
    role: "Guest",
    roleColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    summary: "Top-level geographical directory of all supported continents, regions, and adventure hot-spots across the world.",
    features: [
      "Continent-by-continent visual grid navigation",
      "Country count badge counters & highlights",
      "Quick travel tip summaries for each region"
    ],
    components: ["PopularDestinationsSection"],
    relatedRoutes: ["/destinations/[continent]", "/destinations/[continent]/[country]"]
  },
  {
    id: "destinations-continent",
    path: "/destinations/[continent]",
    name: "Continent Hub Page",
    category: "public",
    role: "Guest",
    roleColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    summary: "Dedicated regional landing page displaying countries within a continent, climate insights, and top regional itineraries.",
    features: [
      "Country card selector with tour inventory counts",
      "Regional travel guides & best time to visit guide",
      "Featured regional adventure tours"
    ],
    relatedRoutes: ["/destinations", "/destinations/[continent]/[country]"]
  },
  {
    id: "destinations-country",
    path: "/destinations/[continent]/[country]",
    name: "Country Guide & Tour Catalog",
    category: "public",
    role: "Guest",
    roleColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    summary: "Deep-dive country showcase detailing local culture, visa requirements, popular circuits, and available package tours.",
    features: [
      "Country travel overview & visa/climate specs",
      "Curated tour listings tailored to the selected country",
      "Map overview of top highlights"
    ],
    relatedRoutes: ["/destinations/[continent]", "/trips/[slug]"]
  },
  {
    id: "trips-index",
    path: "/trips",
    name: "Master Trips Directory",
    category: "public",
    role: "Guest",
    roleColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    summary: "Full list of all active adventure tours with quick category tabs, physical demand indicators, and departure schedules.",
    features: [
      "Grid & List view toggle",
      "Category tabs (Classic, Active, 18-30s, Cultural)",
      "Next available departure date pill on each tour card"
    ],
    components: ["TourCard"],
    relatedRoutes: ["/trips/[slug]", "/search"]
  },
  {
    id: "trips-detail",
    path: "/trips/[slug]",
    name: "Tour Details & Itinerary Page",
    category: "public",
    role: "Guest",
    roleColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    summary: "The core product page showcasing comprehensive trip itineraries, day-by-day maps, inclusions/exclusions, hotel options, and departure booking widget.",
    features: [
      "Day-by-day detailed interactive itinerary with activity breakdowns",
      "Interactive MapView displaying route geometry, waypoints, and stay spots",
      "Physical Demand Rating breakdown & age range specifications",
      "Live departure dates dropdown with available seats & pricing tiers",
      "Customer reviews section with star distributions",
      "Before You Book guidelines and cancellation policy links"
    ],
    components: ["MapView", "BeforeYouBookSection", "ReviewsSection", "QuickViewModal"],
    relatedRoutes: ["/trips/[slug]/[tourCode]", "/payment/[bookingId]"]
  },
  {
    id: "trips-specific",
    path: "/trips/[slug]/[tourCode]",
    name: "Specific Tour Code & Schedule Variant",
    category: "public",
    role: "Guest",
    roleColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    summary: "Direct route for a specific departure schedule of a tour code, featuring locked departure dates and real-time room availability.",
    features: [
      "Pre-selected departure date and tour code pricing",
      "Instant 'Hold Space' or direct checkout trigger",
      "Real-time seat count status"
    ],
    components: ["HoldSpaceDetailsModal"],
    relatedRoutes: ["/trips/[slug]", "/payment/[bookingId]"]
  },
  {
    id: "travel-styles",
    path: "/travel-styles",
    name: "Travel Styles Directory",
    category: "public",
    role: "Guest",
    roleColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    summary: "Explore tours categorized by travel style (18-to-30s, Active Adventure, Classic, Musical Adventures).",
    features: [
      "Visual style category cards with icon badge themes",
      "Style philosophy and target traveler demographics",
      "Top rated trips for each travel style"
    ],
    relatedRoutes: ["/travel-styles/18-to-30-somethings", "/travel-styles/active-adventure", "/travel-styles/classic"]
  },

  // CUSTOMER ACCOUNT & PAYMENTS
  {
    id: "auth-login",
    path: "/auth/login",
    name: "User Login Page",
    category: "customer",
    role: "Guest",
    roleColor: "bg-blue-50 text-blue-700 border-blue-200",
    summary: "Secure sign-in interface supporting email/password authentication, Google OAuth login, and password reset requests.",
    features: [
      "JWT Session token handling and secure local storage",
      "Google & Social OAuth quick sign-in",
      "Redirect parameter preservation for checkout flows"
    ],
    components: ["AuthModal"],
    relatedRoutes: ["/auth/register", "/profile", "/dashboard"]
  },
  {
    id: "auth-register",
    path: "/auth/register",
    name: "User Registration Page",
    category: "customer",
    role: "Guest",
    roleColor: "bg-blue-50 text-blue-700 border-blue-200",
    summary: "New account creation page with email validation, password strength checker, and automatic welcome email dispatch.",
    features: [
      "Real-time field validation & password criteria status",
      "Automatic verification email trigger",
      "Role selection (Customer / Tour Partner request)"
    ],
    relatedRoutes: ["/auth/login", "/auth/verify-email-sent"]
  },
  {
    id: "dashboard",
    path: "/dashboard",
    name: "Customer Dashboard",
    category: "customer",
    role: "Customer",
    roleColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    summary: "Personalized user command center summarizing upcoming trips, wallet balance, active booking statuses, and quick action shortcuts.",
    features: [
      "Upcoming adventure countdown timer & quick trip itinerary download",
      "Wallet balance overview & recent transactions log",
      "Saved wishlist quick grid",
      "Profile completeness meter"
    ],
    relatedRoutes: ["/bookings", "/wallet", "/profile", "/wishlist"]
  },
  {
    id: "payment",
    path: "/payment/[bookingId]",
    name: "Multi-Step Checkout & Payment Engine",
    category: "customer",
    role: "Customer",
    roleColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    summary: "Full-featured multi-step checkout workflow for completing tour bookings, entering traveler details, selecting optional activities, and processing payments.",
    features: [
      "Step 1: Traveler Details (Primary contact, emergency contact, dietary/medical requirements)",
      "Step 2: Add-on Activities & Hotel Upgrades (Optional activity add-ons with price recalculation)",
      "Step 3: Eco Contribution (Tree planting carbon offset add-on)",
      "Step 4: Payment & Discount (Promo code application, wallet balance deduction, deposit vs full payment options)",
      "Hold Space Modal preview for temporary seat reservations"
    ],
    components: ["HoldSpaceDetailsModal", "BookingDetailsModal"],
    relatedRoutes: ["/bookings", "/wallet"]
  },
  {
    id: "profile",
    path: "/profile",
    name: "User Profile Management",
    category: "customer",
    role: "Customer",
    roleColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    summary: "Comprehensive profile settings page where users update personal info, avatar, passport details, emergency contacts, and security credentials.",
    features: [
      "Avatar image upload & profile picture crop",
      "Passport details & travel document storage",
      "Emergency contact records",
      "Password change & two-factor security options"
    ],
    relatedRoutes: ["/dashboard", "/bookings"]
  },
  {
    id: "wallet",
    path: "/wallet",
    name: "Adventure Bucks Wallet",
    category: "customer",
    role: "Customer",
    roleColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    summary: "Digital wallet dashboard managing user store credit ('Adventure Bucks'), referral bonuses, and promotional rewards.",
    features: [
      "Live balance display with currency converter",
      "Detailed audit ledger of credits earned and spent",
      "Referral code generator to earn travel credit",
      "Redemption history & expiry tracker"
    ],
    relatedRoutes: ["/dashboard", "/payment/[bookingId]"]
  },
  {
    id: "wishlist",
    path: "/wishlist",
    name: "Saved Wishlist & Favorites",
    category: "customer",
    role: "Customer",
    roleColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    summary: "Personal catalog of bookmarked tours with instant price tracking and quick checkout triggers.",
    features: [
      "Saved trip cards grid with quick removal",
      "Price update notification badges",
      "1-click transfer to checkout"
    ],
    components: ["TourCard"],
    relatedRoutes: ["/trips/[slug]", "/payment/[bookingId]"]
  },
  {
    id: "bookings",
    path: "/bookings",
    name: "My Bookings History",
    category: "customer",
    role: "Customer",
    roleColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    summary: "Master record of all past, active, and upcoming bookings made by the user with invoice generation and cancellation controls.",
    features: [
      "Filter by status: All, Confirmed, Pending, Completed, Cancelled",
      "View booking modal with full invoice, payment receipt, and PDF download trigger",
      "Cancellation request form with refund calculation preview",
      "Direct link to lead guide contact details"
    ],
    components: ["BookingDetailsModal"],
    relatedRoutes: ["/payment/[bookingId]", "/profile"]
  },

  // COMMUNITY & SUSTAINABILITY
  {
    id: "blogs-index",
    path: "/blogs",
    name: "Adventure Travel Blog Hub",
    category: "content",
    role: "Guest",
    roleColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    summary: "Community blog platform featuring travel stories, destination guides, gear advice, and traveler experience posts.",
    features: [
      "Featured hero article spotlight",
      "Category tags: Destination Guides, Travel Tips, Culture, Photo Journals",
      "Search blog posts by keyword or author",
      "Reading time indicators & social share buttons"
    ],
    relatedRoutes: ["/blogs/[slug]", "/blogs/write", "/blogs/my-blogs"]
  },
  {
    id: "blogs-write",
    path: "/blogs/write",
    name: "Story Creator / Article Editor",
    category: "content",
    role: "Customer",
    roleColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    summary: "Rich text editor allowing registered users and guides to publish authentic travel stories and destination tips.",
    features: [
      "Rich markdown text editor with image embedding",
      "Cover photo upload with crop preview",
      "Tag assignment & draft auto-save",
      "Submit for community publication workflow"
    ],
    relatedRoutes: ["/blogs", "/blogs/my-blogs"]
  },
  {
    id: "nba-club",
    path: "/nba-club",
    name: "NBA Loyalty Club & Perks",
    category: "content",
    role: "Customer",
    roleColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    summary: "Exclusive member club program offering tier rewards, early access to new departure schedules, and bonus Adventure Bucks.",
    features: [
      "Tier status tracker (Explorer, Adventurer, Legend)",
      "Exclusive member discounts catalog",
      "Bonus points multiplier per booking dollar"
    ],
    relatedRoutes: ["/wallet", "/dashboard"]
  },
  {
    id: "tree-planting",
    path: "/tree-planting",
    name: "Reforestation & Sustainability Engine",
    category: "content",
    role: "Guest",
    roleColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    summary: "Showcases the platform's eco-initiative where trees are planted for every traveler booking.",
    features: [
      "Global live trees planted counter",
      "Interactive map of planting sites in India & worldwide",
      "Carbon offset metrics & individual contribution ledger"
    ],
    relatedRoutes: ["/tree-planting/[slug]", "/why-nba"]
  },

  // PARTNER PORTAL
  {
    id: "partner-tours",
    path: "/partner/tours",
    name: "Tour Operator Management Hub",
    category: "partner",
    role: "Partner",
    roleColor: "bg-amber-50 text-amber-800 border-amber-200",
    summary: "Dedicated portal for authorized tour operators and local agency partners to submit custom tour itineraries for platform publication.",
    features: [
      "Partner tour listings catalog with approval status badges (Draft, Pending Review, Approved, Rejected)",
      "Submit new tour proposal wizard",
      "Departure dates & pricing management for partner-assigned tours",
      "Operator performance analytics and booking counts"
    ],
    relatedRoutes: ["/admin/tours-management", "/trips"]
  },

  // ADMIN CONTROL CENTER
  {
    id: "admin-dashboard",
    path: "/admin",
    name: "Admin Control Center Overview",
    category: "admin",
    role: "Admin",
    roleColor: "bg-purple-50 text-[#412A6B] border-purple-200",
    summary: "Executive command dashboard delivering system-wide analytics, total booking revenue, user counts, pending approval tasks, and quick action shortcuts.",
    features: [
      "Real-time revenue metrics & monthly growth charts",
      "Quick action buttons: Create Tour, Review Bookings, Approve Refunds",
      "System health & pending enquiry task counters",
      "Recent booking stream audit list"
    ],
    relatedRoutes: ["/admin/tours", "/admin/bookings", "/admin/users", "/admin/cancellations"]
  },
  {
    id: "admin-tours-index",
    path: "/admin/tours",
    name: "Admin Tour Master Inventory",
    category: "admin",
    role: "Admin",
    roleColor: "bg-purple-50 text-[#412A6B] border-purple-200",
    summary: "Complete listing of all tours in the database with status controls, quick edit shortcuts, and duplicate/archive tools.",
    features: [
      "Instant status toggle (Draft / Published / Archived)",
      "Filter by Destination, Physical Rating, Travel Style, or Status",
      "Direct link to 4-Step Builder edit mode",
      "Delete and duplicate tour action triggers"
    ],
    relatedRoutes: ["/admin/tours-management/create", "/admin/tours-management/[id]/edit"]
  },
  {
    id: "admin-tours-create",
    path: "/admin/tours-management/create",
    name: "4-Step Tour Builder (Create)",
    category: "admin",
    role: "Admin",
    roleColor: "bg-purple-50 text-[#412A6B] border-purple-200",
    summary: "Comprehensive multi-step tour creation wizard covering basic metadata, day-by-day itineraries, pricing schedules, and photo galleries.",
    features: [
      "Step 1: Basic Information (Title, Slug, Code, Continents, Countries, Travel Styles, Physical Ratings, Age limits)",
      "Step 2: Day-by-Day Itinerary Builder (Assign activities from activity master, hotel selection, meal inclusions, daily transport)",
      "Step 3: Departure Schedules & Pricing (Base price, deposit amount, currency, max group size, departure dates picker)",
      "Step 4: Media Gallery & Highlights (Hero image URL, gallery grid, before-you-book policies, custom tags)"
    ],
    components: ["CreateActivityModal", "CreateHotelModal", "BeforeYouBookEditor"],
    relatedRoutes: ["/admin/tours", "/admin/tours-management/[id]/edit"]
  },
  {
    id: "admin-tours-edit",
    path: "/admin/tours-management/[id]/edit",
    name: "4-Step Tour Builder (Edit Mode)",
    category: "admin",
    role: "Admin",
    roleColor: "bg-purple-50 text-[#412A6B] border-purple-200",
    summary: "Full edit suite for modifying existing tour itineraries, updating departure dates, adjusting pricing tiers, and updating media galleries.",
    features: [
      "Pre-populated fields from tour ID",
      "Live preview update",
      "Version change logging"
    ],
    components: ["CreateActivityModal", "CreateHotelModal"],
    relatedRoutes: ["/admin/tours", "/trips/[slug]"]
  },
  {
    id: "admin-bookings",
    path: "/admin/bookings",
    name: "Master Bookings Desk",
    category: "admin",
    role: "Admin",
    roleColor: "bg-purple-50 text-[#412A6B] border-purple-200",
    summary: "Administrative desk for reviewing all customer bookings, manual status modifications, customer contact details, and invoice re-issuance.",
    features: [
      "Global search by Booking Reference ID, Customer Email, or Tour Code",
      "Status modifier dropdown (Confirmed, Pending Payment, Completed, Cancelled)",
      "Modal view for full booking breakdown and customer notes",
      "Export bookings to CSV/Excel"
    ],
    components: ["BookingDetailsModal"],
    relatedRoutes: ["/admin/cancellations", "/admin/users"]
  },
  {
    id: "admin-cancellations",
    path: "/admin/cancellations",
    name: "Cancellation & Refund Engine",
    category: "admin",
    role: "Admin",
    roleColor: "bg-purple-50 text-[#412A6B] border-purple-200",
    summary: "Manage customer cancellation requests, calculate automated policy refund amounts, and issue refund transactions.",
    features: [
      "Pending cancellation request queue with timestamps",
      "Automated refund percentage calculator based on days before departure",
      "Approve refund to original payment method or credit as Adventure Bucks",
      "Rejection reason notification log"
    ],
    relatedRoutes: ["/admin/bookings", "/admin/settings"]
  },
  {
    id: "admin-users",
    path: "/admin/users",
    name: "User & Role Directory (RBAC)",
    category: "admin",
    role: "Admin",
    roleColor: "bg-purple-50 text-[#412A6B] border-purple-200",
    summary: "Global user directory for managing user accounts, updating access roles (Customer, Partner, Admin), and monitoring activity.",
    features: [
      "Role elevation & permission assignment",
      "User status toggle (Active, Suspended, Banned)",
      "Wallet balance manual credit/debit adjustments",
      "User booking history quick modal"
    ],
    relatedRoutes: ["/admin", "/admin/bookings"]
  },
  {
    id: "admin-activities",
    path: "/admin/activities",
    name: "Itinerary Activities Master",
    category: "admin",
    role: "Admin",
    roleColor: "bg-purple-50 text-[#412A6B] border-purple-200",
    summary: "Master database of optional and included activities that can be embedded into tour itineraries during tour building.",
    features: [
      "Activity creation modal (Name, Category, Duration, Additional Price, Description)",
      "Location tagging & activity difficulty index",
      "Quick activity assignment to tour days"
    ],
    components: ["CreateActivityModal"],
    relatedRoutes: ["/admin/tours-management/create", "/admin/hotels"]
  },
  {
    id: "admin-hotels",
    path: "/admin/hotels",
    name: "Accommodations Master",
    category: "admin",
    role: "Admin",
    roleColor: "bg-purple-50 text-[#412A6B] border-purple-200",
    summary: "Master directory of hotels, eco-lodges, campsites, and resorts used across tour itineraries.",
    features: [
      "Hotel master creator modal (Name, Star Rating, Location, Amenities, Room Types)",
      "Photo gallery & contact info storage",
      "Association with tour itineraries"
    ],
    components: ["CreateHotelModal"],
    relatedRoutes: ["/admin/tours-management/create", "/admin/activities"]
  },
  {
    id: "admin-location",
    path: "/admin/location",
    name: "Geographical Taxonomy Master",
    category: "admin",
    role: "Admin",
    roleColor: "bg-purple-50 text-[#412A6B] border-purple-200",
    summary: "Manage the continent, country, state, and city hierarchy for tour categorization and search filters.",
    features: [
      "Add / edit continents and countries",
      "Country flag & banner image manager",
      "City & region mapping"
    ],
    relatedRoutes: ["/admin/tours-management/create", "/destinations"]
  },
  {
    id: "admin-planting-locations",
    path: "/admin/planting-locations",
    name: "Tree Planting Sites Master",
    category: "admin",
    role: "Admin",
    roleColor: "bg-purple-50 text-[#412A6B] border-purple-200",
    summary: "Manage environmental reforestation partner sites, tree counts, and GPS coordinates displayed on the public tree planting page.",
    features: [
      "Create planting site with GPS coordinates and NGO partner metadata",
      "Update planted tree totals and growth updates",
      "Assign tree planting project to specific tours"
    ],
    relatedRoutes: ["/tree-planting", "/admin/settings"]
  },
  {
    id: "admin-discounts",
    path: "/admin/discounts",
    name: "Discount Campaigns Manager",
    category: "admin",
    role: "Admin",
    roleColor: "bg-purple-50 text-[#412A6B] border-purple-200",
    summary: "Create seasonal sale campaigns, early-bird discounts, and flash deals applied across selected tours.",
    features: [
      "Percentage & fixed-amount discount rules",
      "Start & End date campaign schedule",
      "Tour selection multi-picker for campaign inclusion"
    ],
    relatedRoutes: ["/admin/promo-codes", "/admin/tours"]
  },
  {
    id: "admin-promo-codes",
    path: "/admin/promo-codes",
    name: "Promo Codes & Coupons Desk",
    category: "admin",
    role: "Admin",
    roleColor: "bg-purple-50 text-[#412A6B] border-purple-200",
    summary: "Generate coupon codes for marketing campaigns, specify usage caps, minimum basket spend, and expiration rules.",
    features: [
      "Custom coupon code string generator",
      "Usage count cap & per-user limit controls",
      "Minimum order value requirements",
      "Real-time code redemption statistics"
    ],
    relatedRoutes: ["/admin/discounts", "/payment/[bookingId]"]
  },
  {
    id: "admin-queries",
    path: "/admin/queries",
    name: "Customer Support Queries Inbox",
    category: "admin",
    role: "Admin",
    roleColor: "bg-purple-50 text-[#412A6B] border-purple-200",
    summary: "Central inbox receiving customer contact forms, custom itinerary requests, and pre-booking questions.",
    features: [
      "Query message log with status tags (New, In Progress, Resolved)",
      "Quick email reply trigger",
      "Assign query to support team member"
    ],
    relatedRoutes: ["/admin", "/admin/bookings"]
  },
  {
    id: "admin-reviews",
    path: "/admin/reviews",
    name: "Customer Reviews Moderation",
    category: "admin",
    role: "Admin",
    roleColor: "bg-purple-50 text-[#412A6B] border-purple-200",
    summary: "Moderation queue for user-submitted tour reviews, star ratings, and photo uploads before public display.",
    features: [
      "Approve / Reject review submission queue",
      "Flag inappropriate content or fake reviews",
      "Spotlight featured review toggle for home page display"
    ],
    relatedRoutes: ["/admin/tours", "/trips/[slug]"]
  },
  {
    id: "admin-settings",
    path: "/admin/settings",
    name: "Platform Settings & Config",
    category: "admin",
    role: "Admin",
    roleColor: "bg-purple-50 text-[#412A6B] border-purple-200",
    summary: "System-wide configuration settings including payment gateway keys, currency rates, email notifications, and default deposit percentages.",
    features: [
      "Payment Gateway (Stripe / Razorpay) production & sandbox keys configuration",
      "Default deposit percentage setup (e.g. 20% down payment requirement)",
      "Platform commission rates for partner operator sales",
      "Email template parameters and contact support links"
    ],
    relatedRoutes: ["/admin", "/payment/[bookingId]"]
  }
];

export default function ApplicationGuidePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "customer" | "partner" | "admin" | "workflows">("all");
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const filteredRoutes = useMemo(() => {
    return ROUTE_DIRECTORY.filter((item) => {
      // Tab filter
      if (activeTab === "customer" && item.category !== "customer" && item.category !== "public") return false;
      if (activeTab === "partner" && item.category !== "partner") return false;
      if (activeTab === "admin" && item.category !== "admin") return false;

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.path.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.role.toLowerCase().includes(q) ||
        item.features.some((f) => f.toLowerCase().includes(q))
      );
    });
  }, [activeTab, searchQuery]);

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-[#F8F9FD] text-[#3F3F42] font-sans pb-24 selection:bg-[#412A6B] selection:text-white">

      {/* LIGHT HEADER NAVIGATION */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-30 shadow-xs py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* SEARCH & TAB NAV */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            {/* TABS */}
            <div className="flex flex-wrap items-center bg-[#F3F4F6] p-1.5 rounded-xl border border-gray-200">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${activeTab === "all" ? "bg-white text-[#412A6B] shadow-xs font-bold" : "text-gray-600 hover:text-[#3F3F42]"
                  }`}
              >
                All Directory Routes ({ROUTE_DIRECTORY.length})
              </button>
              <button
                onClick={() => setActiveTab("customer")}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${activeTab === "customer" ? "bg-white text-[#412A6B] shadow-xs font-bold" : "text-gray-600 hover:text-[#3F3F42]"
                  }`}
              >
                Customer & Public
              </button>
              <button
                onClick={() => setActiveTab("partner")}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${activeTab === "partner" ? "bg-white text-[#412A6B] shadow-xs font-bold" : "text-gray-600 hover:text-[#3F3F42]"
                  }`}
              >
                Partner Portal
              </button>
              <button
                onClick={() => setActiveTab("admin")}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${activeTab === "admin" ? "bg-white text-[#412A6B] shadow-xs font-bold" : "text-gray-600 hover:text-[#3F3F42]"
                  }`}
              >
                Admin Control Suite
              </button>
              <button
                onClick={() => setActiveTab("workflows")}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${activeTab === "workflows" ? "bg-white text-[#412A6B] shadow-xs font-bold" : "text-gray-600 hover:text-[#3F3F42]"
                  }`}
              >
                System Workflows
              </button>
            </div>

            {/* SEARCH INPUT */}
            {activeTab !== "workflows" && (
              <div className="relative w-full md:w-80">
                <svg className="w-5 h-5 absolute left-3.5 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search routes or features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-[#3F3F42] text-sm focus:outline-none focus:ring-2 focus:ring-[#412A6B]/20 focus:border-[#412A6B] placeholder-gray-400 shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xs bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* WORKFLOWS TAB VIEW */}
        {activeTab === "workflows" ? (
          <div className="space-y-10">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-[#3F3F42] mb-2 flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl bg-purple-50 text-[#412A6B] border border-purple-100 text-sm font-extrabold">01</span>
                Customer Booking & Multi-Step Payment Journey
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                End-to-end user path from tour discovery to confirmation receipt and digital voucher generation.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-[#F8F9FD] p-4 rounded-xl border border-gray-200">
                  <div className="text-xs font-bold text-[#412A6B] mb-1">Step 1: Discovery</div>
                  <div className="text-sm font-bold text-[#3F3F42] mb-2">Search & Filter</div>
                  <div className="text-xs text-gray-600">User selects destination, budget, or physical demand level on <code className="text-[#412A6B] font-semibold">/search</code> or <code className="text-[#412A6B] font-semibold">/trips</code>.</div>
                </div>

                <div className="bg-[#F8F9FD] p-4 rounded-xl border border-gray-200">
                  <div className="text-xs font-bold text-[#412A6B] mb-1">Step 2: Selection</div>
                  <div className="text-sm font-bold text-[#3F3F42] mb-2">Trip Page & Dates</div>
                  <div className="text-xs text-gray-600">Views itinerary on <code className="text-[#412A6B] font-semibold">/trips/[slug]</code>, selects departure date schedule & group size.</div>
                </div>

                <div className="bg-[#F8F9FD] p-4 rounded-xl border border-gray-200">
                  <div className="text-xs font-bold text-[#412A6B] mb-1">Step 3: Customization</div>
                  <div className="text-sm font-bold text-[#3F3F42] mb-2">Add-ons & Options</div>
                  <div className="text-xs text-gray-600">On <code className="text-[#412A6B] font-semibold">/payment/[bookingId]</code>, adds optional activities, room upgrade, and tree planting.</div>
                </div>

                <div className="bg-[#F8F9FD] p-4 rounded-xl border border-gray-200">
                  <div className="text-xs font-bold text-[#412A6B] mb-1">Step 4: Payment</div>
                  <div className="text-sm font-bold text-[#3F3F42] mb-2">Deposit / Promo</div>
                  <div className="text-xs text-gray-600">Applies promo code or Adventure Bucks wallet balance, selects deposit vs full payment via Gateway.</div>
                </div>

                <div className="bg-[#F8F9FD] p-4 rounded-xl border border-gray-200">
                  <div className="text-xs font-bold text-emerald-700 mb-1">Step 5: Fulfillment</div>
                  <div className="text-sm font-bold text-[#3F3F42] mb-2">Confirmation</div>
                  <div className="text-xs text-gray-600">Booking records in <code className="text-[#412A6B] font-semibold">/bookings</code>, voucher PDF generated via <code className="text-[#412A6B] font-semibold">BookingDetailsModal</code>.</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-[#3F3F42] mb-2 flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl bg-purple-50 text-[#412A6B] border border-purple-100 text-sm font-extrabold">02</span>
                Admin 4-Step Tour Builder Architecture
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                How administrators configure complete tour packages from scratch at <code className="text-[#412A6B] font-semibold">/admin/tours-management/create</code>.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#F8F9FD] p-4 rounded-xl border border-gray-200">
                  <div className="text-xs font-bold text-[#412A6B] mb-1">Step 1: Meta & Taxonomies</div>
                  <div className="text-sm font-bold text-[#3F3F42] mb-1">General Details</div>
                  <p className="text-xs text-gray-600">Title, unique slug, tour code, physical rating, age brackets, destination & travel style mappings.</p>
                </div>
                <div className="bg-[#F8F9FD] p-4 rounded-xl border border-gray-200">
                  <div className="text-xs font-bold text-[#412A6B] mb-1">Step 2: Itinerary Engine</div>
                  <div className="text-sm font-bold text-[#3F3F42] mb-1">Daily Schedule</div>
                  <p className="text-xs text-gray-600">Day-by-day mapping. Attach activities via <code className="text-[#412A6B] font-semibold">CreateActivityModal</code> & stay details via <code className="text-[#412A6B] font-semibold">CreateHotelModal</code>.</p>
                </div>
                <div className="bg-[#F8F9FD] p-4 rounded-xl border border-gray-200">
                  <div className="text-xs font-bold text-[#412A6B] mb-1">Step 3: Schedules & Pricing</div>
                  <div className="text-sm font-bold text-[#3F3F42] mb-1">Departures</div>
                  <p className="text-xs text-gray-600">Base price per person, mandatory deposit percentage, max capacity, multiple departure calendar dates.</p>
                </div>
                <div className="bg-[#F8F9FD] p-4 rounded-xl border border-gray-200">
                  <div className="text-xs font-bold text-[#412A6B] mb-1">Step 4: Media & Release</div>
                  <div className="text-sm font-bold text-[#3F3F42] mb-1">Gallery & Publish</div>
                  <p className="text-xs text-gray-600">Hero images gallery, before-you-book guidelines via <code className="text-[#412A6B] font-semibold">BeforeYouBookEditor</code>, publish to live storefront.</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-[#3F3F42] mb-2 flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-sm font-extrabold">03</span>
                Cancellation & Refund Approval Lifecycle
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Automated policy checks and administrative refund processing flow.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#F8F9FD] p-4 rounded-xl border border-gray-200">
                  <div className="text-xs font-bold text-amber-800 mb-1">1. User Initiates</div>
                  <div className="text-sm font-bold text-[#3F3F42] mb-1">Cancellation Request</div>
                  <p className="text-xs text-gray-600">Customer clicks &apos;Cancel Booking&apos; on <code className="text-[#412A6B] font-semibold">/bookings</code>. System calculates policy refund preview based on days until departure.</p>
                </div>
                <div className="bg-[#F8F9FD] p-4 rounded-xl border border-gray-200">
                  <div className="text-xs font-bold text-amber-800 mb-1">2. Admin Review</div>
                  <div className="text-sm font-bold text-[#3F3F42] mb-1">Approval Desk</div>
                  <p className="text-xs text-gray-600">Request appears in <code className="text-[#412A6B] font-semibold">/admin/cancellations</code>. Admin verifies reason and approves or adjusts refund amount.</p>
                </div>
                <div className="bg-[#F8F9FD] p-4 rounded-xl border border-gray-200">
                  <div className="text-xs font-bold text-emerald-700 mb-1">3. Credit Settlement</div>
                  <div className="text-sm font-bold text-[#3F3F42] mb-1">Payout / Credit</div>
                  <p className="text-xs text-gray-600">Refund credited back to original payment gateway or added directly to customer&apos;s <code className="text-[#412A6B] font-semibold">/wallet</code> balance.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ROUTE DIRECTORY GRID VIEW */
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-[#3F3F42] flex items-center gap-2">
                <span>Showing {filteredRoutes.length} Application Routes & Modules</span>
              </h2>
              {searchQuery && (
                <span className="text-xs text-gray-500">
                  Filtering by: &quot;<span className="text-[#412A6B] font-semibold">{searchQuery}</span>&quot;
                </span>
              )}
            </div>

            {filteredRoutes.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-xs">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-bold text-[#3F3F42] mb-1">No matching routes found</h3>
                <p className="text-sm text-gray-500 mb-4">Try adjusting your search term or tab selection.</p>
                <button
                  onClick={() => { setSearchQuery(""); setActiveTab("all"); }}
                  className="px-4 py-2 rounded-xl bg-[#412A6B] text-white text-xs font-semibold hover:bg-[#342156] transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRoutes.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-200/90 hover:border-[#412A6B]/40 rounded-2xl p-6 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between group"
                  >
                    <div>
                      {/* CARD TOP BAR */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${item.roleColor}`}>
                          {item.role}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyPath(item.path)}
                            className="text-xs text-gray-600 hover:text-[#3F3F42] bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-md border border-gray-200 transition-colors font-medium"
                            title="Copy path to clipboard"
                          >
                            {copiedPath === item.path ? "Copied!" : "Copy Route"}
                          </button>

                          {/* Direct Navigation Button if static route */}
                          {!item.path.includes("[") && (
                            <Link
                              href={item.path}
                              className="text-xs text-white bg-[#412A6B] hover:bg-[#322052] px-2.5 py-1 rounded-md transition-colors font-medium flex items-center gap-1 shadow-xs"
                              title="Open route in new page"
                            >
                              <span>Visit</span>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* TITLE & PATH */}
                      <h3 className="text-lg font-bold text-[#3F3F42] group-hover:text-[#412A6B] transition-colors mb-1">
                        {item.name}
                      </h3>
                      <div className="font-mono text-xs text-[#412A6B] bg-[#F3F4F6] px-2.5 py-1 rounded-md border border-gray-200 inline-block mb-3 select-all font-medium">
                        {item.path}
                      </div>

                      {/* SUMMARY */}
                      <p className="text-gray-600 text-xs leading-relaxed mb-4">
                        {item.summary}
                      </p>

                      {/* FEATURES LIST */}
                      <div className="space-y-1.5 mb-4">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Key Capabilities:</div>
                        <ul className="space-y-1">
                          {item.features.map((feat, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                              <span className="text-[#412A6B] font-bold mt-0.5">•</span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* FOOTER COMPONENTS TAGS */}
                    {item.components && item.components.length > 0 && (
                      <div className="pt-3 border-t border-gray-100 mt-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Key Components Used:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {item.components.map((comp, idx) => (
                            <span key={idx} className="text-[10px] font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200 font-medium">
                              {comp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER MANUAL INFO */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-gray-200 text-center text-xs text-gray-500">
        <p>
          Nothing But Adventures Application Directory & System Manual • Platform Version 2.0
        </p>
      </footer>
    </div>
  );
}
