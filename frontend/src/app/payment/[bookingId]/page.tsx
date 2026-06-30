"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Link from "next/link";
import { CheckCircle, ShieldCheck, ArrowLeft, Coins, HourglassHigh, XCircle, Warning } from "@phosphor-icons/react";

interface Booking {
    _id: string;
    bookingReference: string;
    tour: {
        _id: string;
        name: string;
        slug: string;
        price?: {
            bookingPercentage?: number;
        };
    };
    startDate: string;
    numberOfTravelers: number;
    price: {
        totalPrice: number;
        currency: string;
    };
    payment: {
        method: string;
        status: string;
    };
    installmentPlan?: {
        isActive: boolean;
        planId: string;
        totalAmount: number;
        upfrontAmount: number;
        remainingAmount: number;
        numberOfInstallments: number;
        installmentAmount: number;
        deadline: string;
        schedule: Array<{
            installmentNumber: number;
            amount: number;
            dueDate: string;
            type: string;
            status: string;
        }>;
    };
}

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb";

export default function PaymentPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const bookingId = params.bookingId as string;

    const payNowAmountParam = searchParams.get("payNowAmount");
    const paymentOptionParam = searchParams.get("paymentOption");

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // Installment-specific state
    const [installmentPlanId, setInstallmentPlanId] = useState<string | null>(null);
    const [creatingPlan, setCreatingPlan] = useState(false);
    const [planReady, setPlanReady] = useState(false);

    const isInstallment = paymentOptionParam === "installments";

    useEffect(() => {
        if (bookingId) {
            fetchBookingDetails();
        }
    }, [bookingId]);

    // After booking loads, set up installment plan if needed
    useEffect(() => {
        if (!booking || !isInstallment || installmentPlanId || creatingPlan) return;

        // Check if the booking already has a plan from a previous creation
        if (booking.installmentPlan?.planId) {
            console.log("Using existing plan from booking:", booking.installmentPlan.planId);
            setInstallmentPlanId(booking.installmentPlan.planId);
            setPlanReady(true);
        } else {
            createInstallmentPlan();
        }
    }, [booking, isInstallment]);

    const fetchBookingDetails = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/auth/login");
                return;
            }

            const res = await fetch(`${api.baseURL}/bookings/${bookingId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to fetch booking");
            }

            setBooking(data.data.booking);

            if (data.data.booking.payment.status === 'paid' || data.data.booking.payment.status === 'partially_paid') {
                setPaymentSuccess(true);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createInstallmentPlan = useCallback(async () => {
        setCreatingPlan(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${api.baseURL}${api.endpoints.installments.createPlan}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ bookingId }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to create installment plan");
            }

            console.log("Plan created successfully:", data.data.planId);
            setInstallmentPlanId(data.data.planId);
            setBooking((prev: any) => prev ? { ...prev, installmentPlan: { ...data.data.installmentPlan, planId: data.data.planId } } : prev);
            setPlanReady(true);
        } catch (err: any) {
            console.error("Installment plan creation error:", err);
            setError(err.message || "Failed to create installment plan.");
        } finally {
            setCreatingPlan(false);
        }
    }, [bookingId]);

    const formatPrice = (amount: number, currency: string = "USD") => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const handlePayPalApprove = async (orderId: string) => {
        setIsProcessing(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${api.baseURL}/bookings/${bookingId}/capture-paypal`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ orderId, paymentOption: paymentOptionParam })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to update booking payment");
            setPaymentSuccess(true);
            setTimeout(() => router.push("/dashboard"), 3000);
        } catch (err: any) {
            console.error("Payment Update Error", err);
            setError("Payment was captured by PayPal, but we had an issue updating your booking. Please contact support.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubscriptionApprove = async (subscriptionId: string) => {
        setIsProcessing(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${api.baseURL}${api.endpoints.installments.activate}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ bookingId, subscriptionId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to activate installment plan");
            setPaymentSuccess(true);
            setTimeout(() => router.push("/profile"), 3000);
        } catch (err: any) {
            console.error("Subscription Activation Error:", err);
            setError("Subscription was approved by PayPal, but we had an issue updating your booking. Please contact support.");
        } finally {
            setIsProcessing(false);
        }
    };

    // ─── Loading state ─────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading secure payment...</p>
                </div>
            </div>
        );
    }

    // ─── Fatal error (no booking) ──────────────────────────────────────────────
    if (error && !booking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-xl shadow-sm max-w-md">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <span className="text-red-600 text-xl">!</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link href="/dashboard" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // ─── Success ───────────────────────────────────────────────────────────────
    if (paymentSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-10 bg-white rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                        <CheckCircle weight="fill" className="text-green-500 w-12 h-12" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {isInstallment ? "Installment Plan Activated!" : "Payment Successful!"}
                    </h1>
                    <p className="text-gray-600 mb-6">
                        {isInstallment
                            ? "Your pay-in-parts plan is active. PayPal will handle monthly auto-payments. Redirecting to your profile..."
                            : "Your booking is now confirmed. We are redirecting you to your dashboard..."}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6 overflow-hidden">
                        <div className="bg-green-500 h-1.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                    </div>
                    <Link href={isInstallment ? "/profile" : "/dashboard"} className="text-purple-600 font-medium hover:text-purple-700 transition">
                        Click here if you are not redirected
                    </Link>
                </div>
            </div>
        );
    }

    if (!booking) return null;

    const payNowAmount = Number(payNowAmountParam) || booking.price.totalPrice;
    const isDeposit = paymentOptionParam === 'deposit';

    // ─── Determine which payment UI to render ──────────────────────────────────
    const renderPaymentSection = () => {
        if (isProcessing) {
            return (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                    <p className="text-gray-900 font-medium text-lg">
                        {isInstallment ? "Activating Installment Plan..." : "Processing Payment..."}
                    </p>
                    <p className="text-gray-500 mt-2 text-center max-w-sm">
                        Please do not close or refresh this window while we securely process your transaction.
                    </p>
                </div>
            );
        }

        // ─── Installment flow ──────────────────────────────────────────────────
        if (isInstallment) {
            // Still creating
            if (creatingPlan) {
                return (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                        <p className="text-gray-900 font-medium text-lg">Setting up your plan...</p>
                        <p className="text-gray-500 mt-2">Creating PayPal installment plan</p>
                    </div>
                );
            }

            // Plan ready — show PayPal Subscription button
            if (planReady && installmentPlanId) {
                return (
                    <div className="mt-4">
                        <PayPalScriptProvider
                            options={{
                                clientId: PAYPAL_CLIENT_ID,
                                intent: "subscription",
                                vault: true,
                            }}
                        >
                            <PayPalButtons
                                style={{
                                    layout: "vertical",
                                    shape: "rect",
                                    color: "gold",
                                    label: "subscribe",
                                }}
                                createSubscription={(_data, actions) => {
                                    return actions.subscription.create({
                                        plan_id: installmentPlanId,
                                    });
                                }}
                                onApprove={async (data) => {
                                    if (!data.subscriptionID) return;
                                    await handleSubscriptionApprove(data.subscriptionID);
                                }}
                                onError={(err) => {
                                    console.error("PayPal Subscription Error:", err);
                                    setError("Payment processing failed or was cancelled.");
                                }}
                            />
                        </PayPalScriptProvider>

                        {/* Schedule table */}
                        {booking?.installmentPlan?.schedule && booking.installmentPlan.schedule.length > 0 && (
                            <div className="mt-6 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                                <div className="grid grid-cols-4 gap-2 px-4 py-3 bg-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <span>Payment</span>
                                    <span>Amount</span>
                                    <span>Due Date</span>
                                    <span>Status</span>
                                </div>
                                {booking.installmentPlan.schedule.map((entry: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className={`grid grid-cols-4 gap-2 px-4 py-3 text-sm border-b border-gray-100 last:border-b-0 ${entry.status === 'paid' ? 'bg-green-50/50' : ''}`}
                                    >
                                        <span className="text-[#3F3F42] font-medium truncate flex items-center gap-1.5">
                                            {entry.type === 'upfront' ? (
                                                <><Coins size={16} weight="fill" className="text-yellow-500" /> Upfront</>
                                            ) : (
                                                `#${entry.installmentNumber}`
                                            )}
                                        </span>
                                        <span className="text-[#3F3F42] font-semibold">
                                            {formatPrice(entry.amount)}
                                        </span>
                                        <span className="text-gray-600 text-xs truncate">
                                            {new Date(entry.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        <span>
                                            {entry.status === 'paid' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                    <CheckCircle size={12} weight="bold" /> Paid
                                                </span>
                                            ) : entry.status === 'failed' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                                    <XCircle size={12} weight="bold" /> Failed
                                                </span>
                                            ) : entry.status === 'overdue' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                                                    <Warning size={12} weight="bold" /> Overdue
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                                    <HourglassHigh size={12} weight="bold" /> Pending
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-6 bg-purple-50 rounded-lg p-4 border border-purple-100">
                            <h4 className="font-semibold text-purple-900 text-sm mb-2">How Pay-in-Parts works:</h4>
                            <ul className="text-xs text-purple-700 space-y-1.5">
                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5">1️⃣</span>
                                    <span>{formatPrice(payNowAmount)} ({booking.tour?.price?.bookingPercentage || 20}%) charged immediately as setup fee</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5">2️⃣</span>
                                    <span>PayPal auto-charges {formatPrice(booking.installmentPlan?.installmentAmount || 0)} monthly</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5">3️⃣</span>
                                    <span>All {booking.installmentPlan?.numberOfInstallments} installments complete automatically</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5">⚠️</span>
                                    <span>Must be fully paid 90 days before tour, otherwise refund goes to wallet</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                );
            }

            // Plan creation failed — show retry
            return (
                <div className="mt-4">
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-4">
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Could not set up installment plan
                        </h3>
                        <p className="text-gray-600 text-sm max-w-sm mb-6">
                            {error || "There was an issue creating your PayPal installment plan. Please try again."}
                        </p>
                        <button
                            onClick={() => {
                                setError(null);
                                createInstallmentPlan();
                            }}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition"
                        >
                            Retry Setup
                        </button>
                        <button
                            onClick={() => router.back()}
                            className="mt-3 text-sm text-gray-500 hover:text-gray-700 transition"
                        >
                            ← Go back to checkout
                        </button>
                    </div>
                </div>
            );
        }

        // ─── Normal one-time payment (full or deposit) ─────────────────────────
        return (
            <div className="mt-4">
                <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}>
                    <PayPalButtons
                        style={{
                            layout: "vertical",
                            shape: "rect",
                            color: "gold",
                        }}
                        createOrder={(_data, actions) => {
                            return actions.order.create({
                                intent: "CAPTURE",
                                purchase_units: [
                                    {
                                        description: `${booking.tour.name} Booking`,
                                        amount: {
                                            currency_code: "USD",
                                            value: payNowAmount.toString(),
                                        },
                                    },
                                ],
                            });
                        }}
                        onApprove={async (data) => {
                            if (!data.orderID) return;
                            await handlePayPalApprove(data.orderID);
                        }}
                        onError={(err) => {
                            console.error("PayPal Error:", err);
                            setError("Payment processing failed or was cancelled.");
                        }}
                    />
                </PayPalScriptProvider>

                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-6 opacity-60">
                    <div className="flex items-center text-xs font-medium text-gray-500">
                        <ShieldCheck className="w-4 h-4 mr-1" />
                        Secure
                    </div>
                    <div className="flex items-center text-xs font-medium text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z" />
                        </svg>
                        Verified
                    </div>
                </div>
            </div>
        );
    };

    // ─── Main render ───────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 font-sans relative z-10">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 mr-4 flex items-center transition">
                                <ArrowLeft className="w-5 h-5 mr-1" />
                                <span className="text-sm font-medium">Back</span>
                            </button>
                            <h1 className="text-xl font-bold text-gray-900">Secure Checkout</h1>
                        </div>
                        <div className="flex items-center text-green-600">
                            <ShieldCheck className="w-5 h-5 mr-1.5" />
                            <span className="text-sm font-medium">256-bit Encryption</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left Column: Order Summary */}
                    <div className="w-full lg:w-5/12 order-2 lg:order-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                            <div className="p-6 bg-gray-50 border-b border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-1">Order Summary</h2>
                                <p className="text-sm text-gray-500">Ref: {booking.bookingReference}</p>
                            </div>

                            <div className="p-6">
                                <div className="mb-6 pb-6 border-b border-gray-100">
                                    <h3 className="font-semibold text-gray-900 mb-2">{booking.tour.name}</h3>
                                    <div className="text-sm text-gray-600 space-y-2">
                                        <div className="flex justify-between">
                                            <span>Date:</span>
                                            <span className="font-medium text-gray-900">{formatDate(booking.startDate)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Travelers:</span>
                                            <span className="font-medium text-gray-900">{booking.numberOfTravelers} Person(s)</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Total Booking Value</span>
                                        <span>{formatPrice(booking.price.totalPrice)}</span>
                                    </div>

                                    {isDeposit && (
                                        <div className="flex justify-between text-gray-600">
                                            <span>Due Later</span>
                                            <span>{formatPrice(booking.price.totalPrice - payNowAmount)}</span>
                                        </div>
                                    )}

                                    {isInstallment && booking.installmentPlan && (
                                        <>
                                            <div className="flex justify-between text-gray-600">
                                                <span>Upfront ({booking.tour?.price?.bookingPercentage || 20}%)</span>
                                                <span>{formatPrice(booking.installmentPlan.upfrontAmount)}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-600">
                                                <span>Monthly × {booking.installmentPlan.numberOfInstallments}</span>
                                                <span>{formatPrice(booking.installmentPlan.installmentAmount)}/mo</span>
                                            </div>
                                            <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 mt-2">
                                                <p className="text-xs text-purple-700 font-medium">
                                                    🔄 PayPal will auto-charge {formatPrice(booking.installmentPlan.installmentAmount)} monthly until fully paid.
                                                </p>
                                            </div>
                                        </>
                                    )}

                                    <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100">
                                        <span className="text-base font-bold text-gray-900">Amount Due Today</span>
                                        <span className="text-2xl font-bold text-purple-600">{formatPrice(payNowAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Payment */}
                    <div className="w-full lg:w-7/12 order-1 lg:order-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {isInstallment ? "Setup Installment Plan" : "Complete your payment"}
                            </h2>
                            {isInstallment && (
                                <p className="text-gray-600 text-sm mb-6">
                                    Authorize PayPal to auto-charge monthly installments. Your first payment of{" "}
                                    <strong>{formatPrice(payNowAmount)}</strong> will be charged immediately.
                                </p>
                            )}

                            {error && !isInstallment && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-start">
                                    <span className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0">⚠️</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            {renderPaymentSection()}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
