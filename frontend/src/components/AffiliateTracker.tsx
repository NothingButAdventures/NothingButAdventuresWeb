"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";

function TrackerContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [partnerInfo, setPartnerInfo] = useState<{ code: string; name?: string } | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const refCode = searchParams?.get("ref") || searchParams?.get("aff") || searchParams?.get("affiliate");

        if (refCode) {
            const cleanCode = refCode.trim().toUpperCase();

            // Save to localStorage & cookie (30 days)
            localStorage.setItem("nba_aff_code", cleanCode);
            document.cookie = `nba_aff_code=${cleanCode}; path=/; max-age=2592000; SameSite=Lax`;

            // Always ping backend to record the click in real-time
            fetch(`${api.baseURL}${api.endpoints.affiliates.track(cleanCode)}?format=json&dest=${encodeURIComponent(pathname || "/")}`, {
                headers: { Accept: "application/json" },
                credentials: "include",
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.status === "success" && data.data) {
                        setPartnerInfo({
                            code: cleanCode,
                            name: data.data.partnerName,
                        });
                        setVisible(true);
                    } else {
                        setPartnerInfo({ code: cleanCode });
                        setVisible(true);
                    }
                })
                .catch(() => {
                    setPartnerInfo({ code: cleanCode });
                    setVisible(true);
                });

            // If user is not logged in and arrives at the homepage with a ref link, redirect to register
            const token = localStorage.getItem("token");
            if (!token && (pathname === "/" || pathname === "")) {
                router.push(`/auth/register?ref=${cleanCode}`);
            }
        } else {
            // Check if there is an existing affiliate code stored within the 30-day window
            const storedCode = localStorage.getItem("nba_aff_code");
            if (storedCode) {
                setPartnerInfo({ code: storedCode });
            }
        }
    }, [searchParams, pathname, router]);

    if (!visible || !partnerInfo) return null;

    return (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="bg-[#1A1A1A] text-white px-4 py-3 rounded-xl shadow-2xl border border-white/10 flex items-center gap-3 max-w-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <div className="flex-1 min-w-0 text-xs">
                    <p className="font-semibold text-white truncate">
                        Partner Referral Active
                    </p>
                    <p className="text-white/60 truncate">
                        Referred by <span className="text-emerald-400 font-medium">{partnerInfo.name || partnerInfo.code}</span>
                    </p>
                </div>
                <button
                    onClick={() => setVisible(false)}
                    className="text-white/40 hover:text-white transition-colors p-1"
                    title="Dismiss"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default function AffiliateTracker() {
    return (
        <Suspense fallback={null}>
            <TrackerContent />
        </Suspense>
    );
}
