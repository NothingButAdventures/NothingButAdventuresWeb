"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");
    const state = searchParams.get("state");

    if (errorParam) {
      setError("Google login was cancelled.");
      setTimeout(() => router.push("/auth/login"), 2000);
      return;
    }

    if (!code) {
      setError("No authorization code received.");
      setTimeout(() => router.push("/auth/login"), 2000);
      return;
    }

    // Send the code to backend
    const exchangeCode = async () => {
      try {
        const response = await fetch(
          `${api.baseURL}${api.endpoints.auth.google}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              code,
              redirectUri: `${window.location.origin}/auth/callback`,
            }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Google login failed");
        }

        localStorage.setItem("token", data.token);
        
        const redirectUrl = state ? decodeURIComponent(state) : "/dashboard";
        router.push(redirectUrl);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
        setTimeout(() => router.push("/auth/login"), 3000);
      }
    };

    exchangeCode();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {error ? (
          <div>
            <div className="text-red-600 text-lg font-medium mb-2">{error}</div>
            <p className="text-gray-500 text-sm">Redirecting to login...</p>
          </div>
        ) : (
          <div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm">Signing you in with Google...</p>
          </div>
        )}
      </div>
    </div>
  );
}
