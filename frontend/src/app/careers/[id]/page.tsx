"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { uploadResumeDocument } from "@/lib/firebase";

interface Job {
  _id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experienceLevel: string;
  salaryRange?: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  createdAt: string;
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Application Modal State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicantForm, setApplicantForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    experienceYears: "",
    currentCompany: "",
    linkedinUrl: "",
    portfolioUrl: "",
    coverLetter: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchJobDetail();
  }, [id]);

  const fetchJobDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${api.baseURL}/jobs/${id}`);
      if (res.ok) {
        const data = await res.json();
        setJob(data.data.job);
      }
    } catch (err) {
      console.error("Error fetching job details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    if (!resumeFile) {
      alert("Please select your resume file.");
      return;
    }

    try {
      setSubmitting(true);

      // Upload Resume to Firebase Storage
      const resumeDownloadUrl = await uploadResumeDocument(resumeFile, (pct) => {
        setUploadProgress(pct);
      });

      // Submit application
      const res = await fetch(`${api.baseURL}/jobs/${job._id}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...applicantForm,
          resumeUrl: resumeDownloadUrl,
        }),
      });

      if (res.ok) {
        setSubmitSuccess(true);
      } else {
        const data = await res.json();
        alert(`Failed to submit: ${data.message || "Please check your information."}`);
      }
    } catch (err) {
      console.error("Error submitting application:", err);
      alert("Error submitting application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="w-full bg-[#FAF8F5] min-h-screen py-32 px-4 text-center font-outfit text-gray-500">
        Loading job posting details...
      </main>
    );
  }

  if (!job) {
    return (
      <main className="w-full bg-[#FAF8F5] min-h-screen py-32 px-4 text-center space-y-4 font-outfit">
        <h1 className="text-2xl font-bold text-gray-900">Job Posting Not Found</h1>
        <p className="text-sm text-gray-500">
          This position may have been filled or is no longer accepting applications.
        </p>
        <Link
          href="/careers"
          className="inline-block px-5 py-2.5 bg-[#1A1A1A] text-white text-sm font-medium rounded-xl hover:bg-black transition-colors"
        >
          &larr; Back to Openings
        </Link>
      </main>
    );
  }

  return (
    <main className="w-full bg-[#FAF8F5] min-h-screen text-[#1A1A1A] py-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8 font-outfit">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <Link href="/careers" className="hover:text-gray-700 transition-colors">
            Careers
          </Link>
          <span>/</span>
          <span className="text-gray-700">{job.department}</span>
        </div>

        {/* Job Header Card */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="px-3 py-1 bg-[#254B02]/10 text-[#254B02] rounded-full">
                  {job.department}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                  {job.type}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                  📍 {job.location}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium">
                <span>Level: {job.experienceLevel}</span>
                {job.salaryRange && <span>• Salary: {job.salaryRange}</span>}
              </div>
            </div>

            <button
              onClick={() => {
                setSubmitSuccess(false);
                setShowApplyModal(true);
              }}
              className="px-6 py-3 bg-[#1A1A1A] hover:bg-black text-white font-medium text-sm rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
            >
              Apply for this Role &rarr;
            </button>
          </div>
        </div>

        {/* Job Details Content */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-8">
          {/* Description */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">
              Role Overview
            </h2>
            <p className="text-base text-gray-600 font-light leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">
                Key Responsibilities
              </h2>
              <ul className="space-y-2 text-gray-600 font-light text-sm list-disc pl-5">
                {job.responsibilities.map((resp, i) => (
                  <li key={i} className="leading-relaxed">
                    {resp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">
                Requirements & Qualifications
              </h2>
              <ul className="space-y-2 text-gray-600 font-light text-sm list-disc pl-5">
                {job.requirements.map((req, i) => (
                  <li key={i} className="leading-relaxed">
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">
                Benefits & Perks
              </h2>
              <ul className="space-y-2 text-gray-600 font-light text-sm list-disc pl-5">
                {job.benefits.map((b, i) => (
                  <li key={i} className="leading-relaxed">
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Apply Bottom CTA */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Ready to join our team?</h3>
              <p className="text-xs text-gray-500">Submit your resume and details to get started.</p>
            </div>
            <button
              onClick={() => {
                setSubmitSuccess(false);
                setShowApplyModal(true);
              }}
              className="w-full sm:w-auto px-6 py-3 bg-[#1A1A1A] hover:bg-black text-white font-medium text-sm rounded-xl transition-all cursor-pointer"
            >
              Apply for this Position &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* APPLICATION MODAL */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 my-8 shadow-2xl max-h-[90vh] overflow-y-auto font-outfit">
            {submitSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-[#254B02] rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
                  ✓
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Application Submitted!</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                  Thank you for applying for <span className="font-semibold text-gray-900">{job.title}</span>. Our hiring team will review your application and resume carefully.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-black text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Apply for Position</h3>
                    <p className="text-xs text-[#254B02] font-semibold mt-0.5">
                      {job.title} • {job.department} ({job.location})
                    </p>
                  </div>
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none cursor-pointer"
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleSubmitApplication} className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={applicantForm.fullName}
                      onChange={(e) => setApplicantForm({ ...applicantForm, fullName: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#254B02]/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={applicantForm.email}
                        onChange={(e) => setApplicantForm({ ...applicantForm, email: e.target.value })}
                        placeholder="jane@example.com"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#254B02]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={applicantForm.phone}
                        onChange={(e) => setApplicantForm({ ...applicantForm, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#254B02]/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                        Experience (Years)
                      </label>
                      <input
                        type="text"
                        value={applicantForm.experienceYears}
                        onChange={(e) => setApplicantForm({ ...applicantForm, experienceYears: e.target.value })}
                        placeholder="e.g. 4 years"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#254B02]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                        Current Company
                      </label>
                      <input
                        type="text"
                        value={applicantForm.currentCompany}
                        onChange={(e) => setApplicantForm({ ...applicantForm, currentCompany: e.target.value })}
                        placeholder="Company name"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#254B02]/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                        LinkedIn Profile URL
                      </label>
                      <input
                        type="url"
                        value={applicantForm.linkedinUrl}
                        onChange={(e) => setApplicantForm({ ...applicantForm, linkedinUrl: e.target.value })}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#254B02]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                        Portfolio / Website
                      </label>
                      <input
                        type="url"
                        value={applicantForm.portfolioUrl}
                        onChange={(e) => setApplicantForm({ ...applicantForm, portfolioUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#254B02]/20"
                      />
                    </div>
                  </div>

                  {/* RESUME UPLOAD (FIREBASE STORAGE) */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Upload Resume Document (PDF/DOC) *
                    </label>
                    <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 text-center hover:bg-gray-50 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        required
                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#1A1A1A] file:text-white hover:file:bg-black file:cursor-pointer"
                      />
                      {resumeFile && (
                        <p className="text-xs text-[#254B02] font-semibold mt-2">
                          Selected: {resumeFile.name} ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                    {submitting && uploadProgress > 0 && (
                      <div className="mt-2">
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#254B02] transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 text-right mt-0.5">Uploading resume to storage: {uploadProgress}%</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Cover Letter / Notes (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={applicantForm.coverLetter}
                      onChange={(e) => setApplicantForm({ ...applicantForm, coverLetter: e.target.value })}
                      placeholder="Tell us why you'd be a great fit for this adventure..."
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#254B02]/20"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowApplyModal(false)}
                      className="px-4 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 font-medium rounded-xl text-sm transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 text-white bg-[#1A1A1A] hover:bg-black font-medium rounded-xl text-sm transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {submitting ? "Uploading & Submitting..." : "Submit Application"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
