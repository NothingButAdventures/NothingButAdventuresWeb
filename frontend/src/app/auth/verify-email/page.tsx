"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  
  // Prevent duplicate verification requests in React StrictMode
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token was provided.");
      return;
    }

    if (verifiedRef.current) return;
    verifiedRef.current = true;

    const verifyEmail = async () => {
      try {
        const response = await fetch(`${api.baseURL}/auth/verify-email/${token}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Email verification failed.");
        }

        setStatus("success");
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "The verification link is invalid or has expired.");
      }
    };

    verifyEmail();
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;

    setIsResending(true);
    setResendStatus(null);

    try {
      const response = await fetch(`${api.baseURL}/auth/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resendEmail }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to resend verification email.");
      }

      setResendStatus({
        type: "success",
        message: "A new verification link has been sent to your email address.",
      });
      setResendEmail("");
    } catch (err: any) {
      setResendStatus({
        type: "error",
        message: err.message || "Failed to resend verification email.",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center space-y-6">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 text-blue-600 mb-4">
          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#3F3F42]">Verifying Email</h2>
        <p className="text-gray-500 text-sm">Please wait while we verify your email address...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center space-y-6">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-50 text-green-600 mb-4">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold text-[#3F3F42] tracking-tight">Email Verified!</h2>
        <p className="text-gray-600 text-sm">
          Your account is now verified and active. Welcome to Nothing But Adventures!
        </p>
        <div className="pt-2">
          <Link
            href="/auth/login"
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-sm"
          >
            Sign In to Your Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 text-red-600 mb-4">
          <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#3F3F42]">Verification Failed</h2>
        <p className="text-red-600 text-sm mt-2">{errorMessage}</p>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-[#3F3F42] mb-3 text-center">Request a new verification link</h3>
        <form onSubmit={handleResend} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Enter your registered email"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-400 text-[#3F3F42] rounded-xl focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <button
            type="submit"
            disabled={isResending || !resendEmail}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
          >
            {isResending ? "Sending..." : "Send Verification Email"}
          </button>
        </form>
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

      <div className="text-center pt-2">
        <Link
          href="/auth/login"
          className="text-sm font-semibold text-[#3F3F42] hover:text-blue-600 transition-colors"
        >
          &larr; Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading verification details...</p>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
