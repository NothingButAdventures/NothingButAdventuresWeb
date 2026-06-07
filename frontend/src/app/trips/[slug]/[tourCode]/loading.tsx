"use client";

import { CircleNotch } from "@phosphor-icons/react";

export default function TourDetailLoading() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <CircleNotch size={48} weight="bold" className="text-[#3F3F42] animate-spin" />
                <p className="text-[15px] font-medium text-gray-500 tracking-wide animate-pulse">Loading adventure...</p>
            </div>
        </div>
    );
}
