"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

function VerifyEmailSentContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    setResendStatus(null);
    try {
      const response = await fetch(`${api.baseURL}/auth/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to resend verification email");
      }

      setResendStatus({
        type: "success",
        message: "A new verification link has been sent to your email address.",
      });
    } catch (err: any) {
      setResendStatus({
        type: "error",
        message: err.message || "Failed to resend verification email.",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
      <div className="text-center">
        {/* Envelope Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 text-blue-600 mb-6">
          <svg className="h-8 w-8 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
          </svg>
        </div>

        <h2 className="text-3xl font-extrabold text-[#3F3F42] tracking-tight">
          Verify Your Email
        </h2>
        <p className="mt-4 text-sm text-gray-600">
          We&apos;ve sent a verification link to your email address:
        </p>
        {email && (
          <p className="mt-2 text-base font-semibold text-[#3F3F42] bg-gray-50 py-2 px-3 rounded-lg inline-block border border-gray-100">
            {email}
          </p>
        )}
        <p className="mt-4 text-sm text-gray-500">
          Please check your inbox (and spam folder) and click the link to verify your account.
        </p>
      </div>

      {resendStatus && (
        <div className={`p-4 rounded-xl border text-sm text-center ${
          resendStatus.type === "success" 
            ? "bg-green-50 border-green-200 text-green-700" 
            : "bg-red-50 border-red-200 text-red-700"
        }`}>
          {resendStatus.message}
        </div>
      )}

      <div className="space-y-4 pt-2">
        <button
          onClick={handleResend}
          disabled={isResending || !email}
          className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          {isResending ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Resending...
            </div>
          ) : (
            "Resend Verification Link"
          )}
        </button>

        <div className="text-center pt-2">
          <Link
            href="/auth/login"
            className="text-sm font-semibold text-[#3F3F42] hover:text-blue-600 transition-colors"
          >
            &larr; Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailSentPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading verification details...</p>
        </div>
      }>
        <VerifyEmailSentContent />
      </Suspense>
    </div>
  );
}
