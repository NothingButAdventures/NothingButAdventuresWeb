"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { uploadToFirebase, uploadTravelerDocument } from "@/lib/firebase";
import {
    ArrowLeft,
    FileText,
    Upload,
    CheckCircle2,
    XCircle,
    Loader2,
    Eye,
    Shield,
    AlertCircle,
} from "lucide-react";

interface Traveler {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    nationality?: string;
}

interface DocFile {
    url: string;
    fileName: string;
    uploadedAt?: string;
    verified: boolean;
}

interface TravelerDocEntry {
    travelerIndex: number;
    passport: DocFile | null;
    visa: DocFile | null;
    medicalCertificate: DocFile | null;
    insurance: DocFile | null;
    submittedAt?: string;
}

interface BookingData {
    _id: string;
    bookingReference: string;
    status: string;
    startDate: string;
    numberOfTravelers: number;
    travelers: Traveler[];
    tour: {
        _id: string;
        name: string;
        slug: string;
        tourCode: string;
        images?: Array<{ url: string; caption?: string; isPrimary?: boolean }>;
    };
    travelerDocuments?: TravelerDocEntry[];
    documentsSubmitted?: boolean;
    documentsVerified?: boolean;
    price: {
        currency: string;
        totalPrice: number;
    };
}

type DocType = "passport" | "visa" | "medicalCertificate" | "insurance";

const DOC_TYPES: { key: DocType; label: string; icon: string }[] = [
    { key: "passport", label: "Passport", icon: "🛂" },
    { key: "visa", label: "Visa", icon: "📋" },
    { key: "medicalCertificate", label: "Medical Certificate / Vaccination", icon: "💉" },
    { key: "insurance", label: "Insurance Details", icon: "🛡️" },
];

export default function BookingDocumentsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const bookingId = searchParams.get("bookingId");

    const [booking, setBooking] = useState<BookingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTravelerIndex, setActiveTravelerIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Local state for document uploads (per traveler, per doc type)
    const [localDocs, setLocalDocs] = useState<Record<number, Record<DocType, { file?: File; url: string; fileName: string; progress: number; uploading: boolean; verified: boolean }>>>({});

    const initLocalDocs = useCallback((bookingData: BookingData) => {
        const docs: typeof localDocs = {};
        for (let i = 0; i < bookingData.numberOfTravelers; i++) {
            const existingDoc = bookingData.travelerDocuments?.find(d => d.travelerIndex === i);
            docs[i] = {} as any;
            for (const dt of DOC_TYPES) {
                const existing = existingDoc?.[dt.key];
                docs[i][dt.key] = {
                    url: existing?.url || "",
                    fileName: existing?.fileName || "",
                    progress: existing?.url ? 100 : 0,
                    uploading: false,
                    verified: existing?.verified || false,
                };
            }
        }
        setLocalDocs(docs);
    }, []);

    useEffect(() => {
        if (!bookingId) {
            setError("No booking ID provided");
            setLoading(false);
            return;
        }
        fetchBooking();
    }, [bookingId]);

    const fetchBooking = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please log in to view this page");
                return;
            }

            const res = await fetch(`${api.baseURL}${api.endpoints.bookings.getById(bookingId!)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to load booking");
                return;
            }

            setBooking(data.data.booking);
            initLocalDocs(data.data.booking);
        } catch (err) {
            setError("Failed to load booking data");
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (travelerIdx: number, docType: DocType, file: File) => {
        // Prevent modifying if verified by admin
        if (localDocs[travelerIdx]?.[docType]?.verified) {
            alert("This document has already been verified by the administrator and cannot be modified.");
            return;
        }

        // Validate PDF only
        if (file.type !== "application/pdf") {
            alert("Only PDF files are accepted. Please select a PDF file.");
            return;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            alert("File size must be less than 10MB.");
            return;
        }

        // Update local state to show uploading
        setLocalDocs(prev => ({
            ...prev,
            [travelerIdx]: {
                ...prev[travelerIdx],
                [docType]: {
                    ...prev[travelerIdx][docType],
                    file,
                    uploading: true,
                    progress: 0,
                },
            },
        }));

        try {
            const uploadFn = uploadTravelerDocument || ((f: File, p?: (pct: number) => void) => uploadToFirebase(f, "traveler-documents", p));
            const url = await uploadFn(file, (pct) => {
                setLocalDocs(prev => ({
                    ...prev,
                    [travelerIdx]: {
                        ...prev[travelerIdx],
                        [docType]: {
                            ...prev[travelerIdx][docType],
                            progress: pct,
                        },
                    },
                }));
            });

            setLocalDocs(prev => ({
                ...prev,
                [travelerIdx]: {
                    ...prev[travelerIdx],
                    [docType]: {
                        ...prev[travelerIdx][docType],
                        url,
                        fileName: file.name,
                        uploading: false,
                        progress: 100,
                    },
                },
            }));
        } catch (err) {
            console.error("Upload failed:", err);
            alert("Failed to upload document. Please try again.");
            setLocalDocs(prev => ({
                ...prev,
                [travelerIdx]: {
                    ...prev[travelerIdx],
                    [docType]: {
                        ...prev[travelerIdx][docType],
                        uploading: false,
                        progress: 0,
                    },
                },
            }));
        }
    };

    const allDocsUploaded = () => {
        if (!booking) return false;
        for (let i = 0; i < booking.numberOfTravelers; i++) {
            for (const dt of DOC_TYPES) {
                if (!localDocs[i]?.[dt.key]?.url) return false;
            }
        }
        return true;
    };

    const handleSubmitAll = async () => {
        if (!booking || !allDocsUploaded()) return;

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Please log in again");
                return;
            }

            const travelerDocuments = [];
            for (let i = 0; i < booking.numberOfTravelers; i++) {
                const docs: any = {};
                for (const dt of DOC_TYPES) {
                    docs[dt.key] = {
                        url: localDocs[i][dt.key].url,
                        fileName: localDocs[i][dt.key].fileName,
                    };
                }
                travelerDocuments.push(docs);
            }

            const res = await fetch(`${api.baseURL}${api.endpoints.bookings.submitDocuments(booking._id)}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ travelerDocuments }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Failed to submit documents");
            }

            setBooking(data.data.booking);
            initLocalDocs(data.data.booking);
            setSubmitSuccess(true);
        } catch (err: any) {
            alert(err.message || "Failed to submit documents");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-[#6A38C2] border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-500 font-medium animate-pulse text-sm">Loading booking details...</p>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-[#3F3F42] mb-2">Unable to Load Booking</h2>
                    <p className="text-gray-500 mb-6">{error || "Booking not found"}</p>
                    <Link href="/profile?tab=bookings" className="inline-block bg-[#6A38C2] hover:bg-purple-800 text-white font-medium py-2.5 px-6 rounded-lg transition">
                        Back to My Bookings
                    </Link>
                </div>
            </div>
        );
    }

    const isAlreadySubmitted = booking.documentsSubmitted;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Success Banner */}
                {submitSuccess && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-green-800 text-sm">Documents submitted successfully!</p>
                            <p className="text-green-600 text-xs mt-0.5">Your documents are now under review. You will be notified once they are verified.</p>
                        </div>
                    </div>
                )}

                {/* Booking Info Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-[22px] font-medium text-[#2C3238] mb-1">{booking.tour.name}</h1>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                <span className="font-mono font-bold text-gray-400">#{booking.bookingReference}</span>
                                <span>•</span>
                                <span>{formatDate(booking.startDate)}</span>
                                <span>•</span>
                                <span>{booking.numberOfTravelers} traveler{booking.numberOfTravelers > 1 ? "s" : ""}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {booking.documentsVerified ? (
                                <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-green-100 text-green-700 border border-green-200 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    All Documents Verified
                                </span>
                            ) : isAlreadySubmitted ? (
                                <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    Verification Pending
                                </span>
                            ) : (
                                <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-gray-100 text-gray-600 border border-gray-200 flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5" />
                                    Documents Required
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Traveller Tabs + Content */}
                <div className="border border-gray-200 rounded-xl bg-white mb-6">
                    {/* Traveller Tab Cards */}
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-[18px] font-medium text-[#2C3238] mb-4">Traveller in this booking</h3>
                        <div className="flex flex-wrap items-center gap-4 mb-3">
                            {booking.travelers.map((t, i) => {
                                const travelerDocs = localDocs[i];
                                const allDocsForTraveler = travelerDocs && DOC_TYPES.every(dt => travelerDocs[dt.key]?.url);
                                const allVerifiedForTraveler = travelerDocs && DOC_TYPES.every(dt => travelerDocs[dt.key]?.verified);

                                return (
                                    <div
                                        key={i}
                                        onClick={() => setActiveTravelerIndex(i)}
                                        className={`relative flex items-center gap-3 border rounded-xl px-4 py-3 min-w-[220px] cursor-pointer transition ${activeTravelerIndex === i ? 'border-[#6A38C2] bg-[#F4F0FF]' : 'border-gray-200 hover:border-purple-300'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full ${i === 0 ? 'bg-[#3F3F42]' : 'bg-teal-700'} text-white flex items-center justify-center font-bold text-base`}>
                                            {t.firstName?.charAt(0).toUpperCase() || "T"}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[13px] text-gray-500 font-medium">
                                                Traveller {i + 1}{i === 0 ? " ( Primary )" : ""}
                                            </span>
                                            <span className="text-[15px] font-semibold text-black">
                                                {t.firstName} {t.lastName}
                                            </span>
                                        </div>
                                        {allVerifiedForTraveler ? (
                                            <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-green-500" />
                                        ) : !allDocsForTraveler ? (
                                            <span className="absolute top-2 right-2 text-orange-400 font-bold leading-none">*</span>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-[13px] text-gray-500">
                            <span className="text-orange-400 font-bold">*</span> Please upload all documents for each traveller to proceed.
                        </p>
                    </div>

                    {/* Active Traveller Content */}
                    <div className="p-6">
                        {(() => {
                            const traveler = booking.travelers[activeTravelerIndex];
                            if (!traveler) return null;

                            return (
                                <div>
                                    {/* Disabled Personal Info */}
                                    <div className="mb-8">
                                        <h3 className="text-[22px] font-medium text-[#3F3F42] mb-6">
                                            {activeTravelerIndex === 0 ? "Primary Traveller" : `Traveller ${activeTravelerIndex + 1}`}
                                            <span className="text-gray-400 text-[16px] font-normal ml-2">(Personal Information)</span>
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <label className="block text-[15px] text-gray-600 mb-1">First name</label>
                                                <input type="text" value={traveler.firstName || ""} disabled className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-500 text-[15px] cursor-not-allowed" />
                                            </div>
                                            <div>
                                                <label className="block text-[15px] text-gray-600 mb-1">Last name</label>
                                                <input type="text" value={traveler.lastName || ""} disabled className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-500 text-[15px] cursor-not-allowed" />
                                            </div>
                                            <div>
                                                <label className="block text-[15px] text-gray-600 mb-1">Email</label>
                                                <input type="text" value={traveler.email || "—"} disabled className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-500 text-[15px] cursor-not-allowed" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-[15px] text-gray-600 mb-1">Phone</label>
                                                <input type="text" value={traveler.phone || "—"} disabled className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-500 text-[15px] cursor-not-allowed" />
                                            </div>
                                            <div>
                                                <label className="block text-[15px] text-gray-600 mb-1">Date of Birth</label>
                                                <input type="text" value={traveler.dateOfBirth ? formatDate(traveler.dateOfBirth) : "—"} disabled className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-500 text-[15px] cursor-not-allowed" />
                                            </div>
                                            <div>
                                                <label className="block text-[15px] text-gray-600 mb-1">Nationality</label>
                                                <input type="text" value={traveler.nationality || "—"} disabled className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-500 text-[15px] cursor-not-allowed" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Document Upload Section */}
                                    <div>
                                        <h3 className="text-[22px] font-medium text-[#3F3F42] mb-2">
                                            Required Documents
                                            <span className="text-gray-400 text-[16px] font-normal ml-2">(PDF format only)</span>
                                        </h3>
                                        <p className="text-[13px] text-gray-500 mb-6">Upload all 4 documents for this traveller. Maximum file size: 10MB per file.</p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {DOC_TYPES.map((dt) => {
                                                const docState = localDocs[activeTravelerIndex]?.[dt.key];
                                                if (!docState) return null;

                                                const hasFile = !!docState.url;
                                                const isUploading = docState.uploading;

                                                return (
                                                    <div
                                                        key={dt.key}
                                                        className={`border rounded-xl p-5 transition ${hasFile ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-white'}`}
                                                    >
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-lg">{dt.icon}</span>
                                                                <h4 className="font-medium text-[#3F3F42] text-[15px]">{dt.label}</h4>
                                                            </div>
                                                            {/* Verification Badge */}
                                                            {hasFile && (
                                                                <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full flex items-center gap-1 ${docState.verified
                                                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                                                    : 'bg-orange-100 text-orange-700 border border-orange-200'
                                                                    }`}>
                                                                    {docState.verified ? (
                                                                        <><CheckCircle2 className="w-3 h-3" /> Verified</>
                                                                    ) : (
                                                                        <><XCircle className="w-3 h-3" /> Not Verified</>
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {isUploading ? (
                                                            <div className="space-y-2">
                                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                                    <div
                                                                        className="bg-[#6A38C2] h-2 rounded-full transition-all duration-300"
                                                                        style={{ width: `${docState.progress}%` }}
                                                                    />
                                                                </div>
                                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                    <Loader2 className="w-3 h-3 animate-spin" /> Uploading... {docState.progress}%
                                                                </p>
                                                            </div>
                                                        ) : hasFile ? (
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <FileText className="w-4 h-4 text-[#6A38C2]" />
                                                                    <span className="truncate flex-1">{docState.fileName}</span>
                                                                    <a
                                                                        href={docState.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-[#6A38C2] hover:text-purple-800 flex items-center gap-1 text-xs font-medium"
                                                                    >
                                                                        <Eye className="w-3 h-3" /> View
                                                                    </a>
                                                                </div>
                                                                {!isAlreadySubmitted && !docState.verified && (
                                                                    <label className="text-xs text-[#6A38C2] font-medium cursor-pointer hover:text-purple-800 inline-flex items-center gap-1">
                                                                        <Upload className="w-3 h-3" /> Replace file
                                                                        <input
                                                                            type="file"
                                                                            accept=".pdf,application/pdf"
                                                                            className="hidden"
                                                                            onChange={(e) => {
                                                                                const f = e.target.files?.[0];
                                                                                if (f) handleFileSelect(activeTravelerIndex, dt.key, f);
                                                                            }}
                                                                        />
                                                                    </label>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg py-6 cursor-pointer hover:border-[#6A38C2] hover:bg-purple-50/30 transition group">
                                                                <Upload className="w-6 h-6 text-gray-400 group-hover:text-[#6A38C2] mb-2 transition" />
                                                                <span className="text-sm text-gray-500 group-hover:text-[#6A38C2] font-medium transition">
                                                                    Click to upload PDF
                                                                </span>
                                                                <span className="text-xs text-gray-400 mt-1">Max 10MB</span>
                                                                <input
                                                                    type="file"
                                                                    accept=".pdf,application/pdf"
                                                                    className="hidden"
                                                                    onChange={(e) => {
                                                                        const f = e.target.files?.[0];
                                                                        if (f) handleFileSelect(activeTravelerIndex, dt.key, f);
                                                                    }}
                                                                />
                                                            </label>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Navigation Buttons */}
                                    <div className="flex justify-end mt-8 gap-4">
                                        {activeTravelerIndex > 0 && (
                                            <button
                                                onClick={() => setActiveTravelerIndex(activeTravelerIndex - 1)}
                                                className="border border-gray-300 hover:bg-gray-50 text-[#3F3F42] font-medium py-2.5 px-8 rounded-lg transition"
                                            >
                                                Back
                                            </button>
                                        )}
                                        {activeTravelerIndex < booking.numberOfTravelers - 1 && (
                                            <button
                                                onClick={() => setActiveTravelerIndex(activeTravelerIndex + 1)}
                                                className="bg-[#6A38C2] hover:bg-purple-800 text-white font-medium py-2.5 px-8 rounded-lg transition"
                                            >
                                                Next Traveller
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* Submit Section */}
                {!isAlreadySubmitted && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="font-medium text-[#3F3F42] text-[16px]">Ready to submit?</h3>
                                <p className="text-[13px] text-gray-500 mt-1">
                                    {allDocsUploaded()
                                        ? "All documents have been uploaded. Click submit to send them for verification."
                                        : "Please upload all required documents for every traveller before submitting."}
                                </p>
                            </div>
                            <button
                                onClick={handleSubmitAll}
                                disabled={!allDocsUploaded() || isSubmitting}
                                className={`flex items-center gap-2 font-medium py-3 px-8 rounded-lg transition text-sm whitespace-nowrap ${allDocsUploaded() && !isSubmitting
                                    ? 'bg-[#6A38C2] hover:bg-purple-800 text-white'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                                ) : (
                                    <><CheckCircle2 className="w-4 h-4" /> Submit All Documents</>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Already submitted message */}
                {isAlreadySubmitted && !submitSuccess && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-[#3F3F42] text-sm">Documents have been submitted</p>
                                <p className="text-gray-500 text-xs mt-0.5">
                                    {booking.documentsVerified
                                        ? "All documents have been verified by the admin team."
                                        : "Documents are currently under review by our team."}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
