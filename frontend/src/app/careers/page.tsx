"use client";

import { useState, useEffect } from "react";
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

export default function CareersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  
  // Application Modal State
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
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
    fetchActiveJobs();
  }, []);

  const fetchActiveJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${api.baseURL}/jobs`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.data.jobs || []);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const departments = ["All", ...Array.from(new Set(jobs.map((j) => j.department)))];
  const types = ["All", ...Array.from(new Set(jobs.map((j) => j.type)))];

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === "All" || j.department === selectedDept;
    const matchesType = selectedType === "All" || j.type === selectedType;
    return matchesSearch && matchesDept && matchesType;
  });

  const handleOpenApplyModal = (job: Job) => {
    setApplyingJob(job);
    setSubmitSuccess(false);
    setApplicantForm({
      fullName: "",
      email: "",
      phone: "",
      experienceYears: "",
      currentCompany: "",
      linkedinUrl: "",
      portfolioUrl: "",
      coverLetter: "",
    });
    setResumeFile(null);
    setUploadProgress(0);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob) return;
    if (!resumeFile) {
      alert("Please select your resume file to submit application.");
      return;
    }

    try {
      setSubmitting(true);

      // Step 1: Upload Resume file to Firebase Storage
      const resumeDownloadUrl = await uploadResumeDocument(resumeFile, (pct) => {
        setUploadProgress(pct);
      });

      // Step 2: Submit application to API
      const res = await fetch(`${api.baseURL}/jobs/${applyingJob._id}/apply`, {
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

  return (
    <main className="w-full bg-[#FAF8F5] min-h-screen text-[#1A1A1A]">
      {/* Hero Section */}
      <section className="relative w-full bg-[#1F2937] text-white pt-28 pb-20 px-4 sm:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 pointer-events-none z-0" />
        <div
          className="absolute inset-0 z-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: 'url("/hero-1.svg")' }}
        />
        
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-outfit uppercase tracking-widest backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-[#254B02]" />
            We&apos;re Hiring
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-outfit font-bold tracking-tight leading-tight">
            Build the Future of <span className="font-gochi text-[#254B02]">Adventure Travel</span>
          </h1>
        </div>
      </section>

      {/* Main Job Openings Container */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 pb-24">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-outfit text-gray-900">
                Open Positions
              </h2>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <input
                type="text"
                placeholder="Search job title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-60 px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#254B02]/20 font-outfit"
              />

              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#254B02]/20 font-outfit text-gray-700"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    Department: {d}
                  </option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#254B02]/20 font-outfit text-gray-700"
              >
                {types.map((t) => (
                  <option key={t} value={t}>
                    Type: {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Job List */}
          {loading ? (
            <div className="py-16 text-center text-gray-400 font-outfit">Loading open positions...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="py-16 text-center space-y-3 font-outfit">
              <p className="text-lg text-gray-600 font-medium">No open positions matching your filters.</p>
              <p className="text-sm text-gray-400">
                Check back soon or send your resume directly to team@nothingbutadventures.com!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div
                  key={job._id}
                  className="group bg-[#FAF8F5]/60 hover:bg-white p-6 rounded-2xl border border-gray-100 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md"
                >
                  <div className="space-y-2.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold font-outfit">
                      <span className="px-3 py-0.5 rounded-full bg-[#254B02]/10 text-[#254B02]">
                        {job.department}
                      </span>
                      <span className="px-3 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {job.type}
                      </span>
                      <span className="px-3 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        📍 {job.location}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold font-outfit text-gray-900 group-hover:text-[#254B02] transition-colors">
                      {job.title}
                    </h3>

                    <p className="text-sm text-gray-600 font-outfit font-light line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    {job.salaryRange && (
                      <div className="text-xs text-gray-500 font-outfit font-medium">
                        💰 {job.salaryRange}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      href={`/careers/${job._id}`}
                      className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium font-outfit rounded-xl transition-all"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleOpenApplyModal(job)}
                      className="px-5 py-2.5 bg-[#1A1A1A] hover:bg-black text-white text-sm font-medium font-outfit rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                      Apply Now &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* APPLICATION MODAL */}
      {applyingJob && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 my-8 shadow-2xl max-h-[90vh] overflow-y-auto font-outfit">
            {submitSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-[#254B02] rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
                  ✓
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Application Submitted!</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                  Thank you for applying for the <span className="font-semibold text-gray-900">{applyingJob.title}</span> position. Our hiring team will review your application and resume carefully.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setApplyingJob(null)}
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
                      {applyingJob.title} • {applyingJob.department} ({applyingJob.location})
                    </p>
                  </div>
                  <button
                    onClick={() => setApplyingJob(null)}
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
                      onClick={() => setApplyingJob(null)}
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
