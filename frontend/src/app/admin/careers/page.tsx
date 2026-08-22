"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface JobItem {
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
  status: "active" | "draft" | "closed";
  isFeatured?: boolean;
  applicationsCount?: number;
  createdAt: string;
}

interface ApplicationItem {
  _id: string;
  job: {
    _id: string;
    title: string;
    department: string;
    location?: string;
    type?: string;
  };
  fullName: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  resumeUrl: string;
  coverLetter?: string;
  experienceYears?: string;
  currentCompany?: string;
  status: "pending" | "reviewed" | "shortlisted" | "rejected" | "hired";
  notes?: string;
  createdAt: string;
}

export default function AdminCareersPage() {
  const [activeTab, setActiveTab] = useState<"jobs" | "applications">("jobs");
  
  // Jobs State
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [searchJobQuery, setSearchJobQuery] = useState("");
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<JobItem | null>(null);
  
  // Applications State
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [selectedJobFilter, setSelectedJobFilter] = useState("");
  const [searchAppQuery, setSearchAppQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  
  // Job Form Data State
  const [formData, setFormData] = useState({
    title: "",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    experienceLevel: "Mid Level",
    salaryRange: "",
    description: "",
    responsibilities: "",
    requirements: "",
    benefits: "",
    status: "active" as "active" | "draft" | "closed",
  });
  const [savingJob, setSavingJob] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${api.baseURL}/jobs/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data.data.jobs || []);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoadingApps(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${api.baseURL}/jobs/admin/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data.data.applications || []);
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleOpenJobModal = (job?: JobItem) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        title: job.title || "",
        department: job.department || "Engineering",
        location: job.location || "Remote",
        type: job.type || "Full-time",
        experienceLevel: job.experienceLevel || "Mid Level",
        salaryRange: job.salaryRange || "",
        description: job.description || "",
        responsibilities: (job.responsibilities || []).join("\n"),
        requirements: (job.requirements || []).join("\n"),
        benefits: (job.benefits || []).join("\n"),
        status: job.status || "active",
      });
    } else {
      setEditingJob(null);
      setFormData({
        title: "",
        department: "Engineering",
        location: "Remote",
        type: "Full-time",
        experienceLevel: "Mid Level",
        salaryRange: "",
        description: "",
        responsibilities: "",
        requirements: "",
        benefits: "",
        status: "active",
      });
    }
    setShowJobModal(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingJob(true);
      const token = localStorage.getItem("token");

      const payload = {
        title: formData.title,
        department: formData.department,
        location: formData.location,
        type: formData.type,
        experienceLevel: formData.experienceLevel,
        salaryRange: formData.salaryRange,
        description: formData.description,
        responsibilities: formData.responsibilities
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        requirements: formData.requirements
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        benefits: formData.benefits
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        status: formData.status,
      };

      const url = editingJob
        ? `${api.baseURL}/jobs/${editingJob._id}`
        : `${api.baseURL}/jobs`;
      const method = editingJob ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowJobModal(false);
        fetchJobs();
      } else {
        const data = await res.json();
        alert(`Error: ${data.message || "Failed to save job posting"}`);
      }
    } catch (err) {
      console.error("Error saving job:", err);
      alert("An unexpected error occurred.");
    } finally {
      setSavingJob(false);
    }
  };

  const handleToggleStatus = async (jobId: string, newStatus: "active" | "draft" | "closed") => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${api.baseURL}/jobs/${jobId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setJobs(jobs.map((j) => (j._id === jobId ? { ...j, status: newStatus } : j)));
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job? All applications for it will also be deleted.")) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${api.baseURL}/jobs/${jobId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setJobs(jobs.filter((j) => j._id !== jobId));
      }
    } catch (err) {
      console.error("Error deleting job:", err);
    }
  };

  const handleUpdateAppStatus = async (
    appId: string,
    newStatus: "pending" | "reviewed" | "shortlisted" | "rejected" | "hired"
  ) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${api.baseURL}/jobs/admin/applications/${appId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setApplications(
          applications.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
        );
        if (selectedApp && selectedApp._id === appId) {
          setSelectedApp({ ...selectedApp, status: newStatus });
        }
      }
    } catch (err) {
      console.error("Error updating application status:", err);
    }
  };

  const handleDeleteApp = async (appId: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${api.baseURL}/jobs/admin/applications/${appId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setApplications(applications.filter((a) => a._id !== appId));
        if (selectedApp && selectedApp._id === appId) {
          setSelectedApp(null);
        }
      }
    } catch (err) {
      console.error("Error deleting application:", err);
    }
  };

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchJobQuery.toLowerCase()) ||
      j.department.toLowerCase().includes(searchJobQuery.toLowerCase()) ||
      j.location.toLowerCase().includes(searchJobQuery.toLowerCase())
  );

  const filteredApps = applications.filter((a) => {
    const matchesSearch =
      a.fullName.toLowerCase().includes(searchAppQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchAppQuery.toLowerCase()) ||
      (a.job && a.job.title.toLowerCase().includes(searchAppQuery.toLowerCase()));

    const matchesJob = selectedJobFilter ? a.job && a.job._id === selectedJobFilter : true;
    return matchesSearch && matchesJob;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-outfit">Careers & Job Management</h1>
          <p className="text-sm text-gray-500 font-outfit mt-1">
            Post job openings, manage current listings, and review candidate applications.
          </p>
        </div>

        {activeTab === "jobs" && (
          <button
            onClick={() => handleOpenJobModal()}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-[#1A1A1A] hover:bg-black text-white text-sm font-medium rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Post New Job
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setActiveTab("jobs")}
          className={`pb-3 text-sm font-medium font-outfit border-b-2 transition-all cursor-pointer ${
            activeTab === "jobs"
              ? "border-[#70114E] text-[#70114E]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Job Openings ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab("applications")}
          className={`pb-3 text-sm font-medium font-outfit border-b-2 transition-all cursor-pointer ${
            activeTab === "applications"
              ? "border-[#70114E] text-[#70114E]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Applications Received ({applications.length})
        </button>
      </div>

      {/* TAB 1: JOBS MANAGEMENT */}
      {activeTab === "jobs" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          {/* Search bar */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <input
              type="text"
              placeholder="Search by job title, department, location..."
              value={searchJobQuery}
              onChange={(e) => setSearchJobQuery(e.target.value)}
              className="w-full max-w-md px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#70114E]/20"
            />
          </div>

          {loadingJobs ? (
            <div className="p-12 text-center text-gray-400">Loading job postings...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-outfit">
              No job postings found. Click &quot;Post New Job&quot; to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Job Title</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Type & Location</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Applicants</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredJobs.map((job) => (
                    <tr key={job._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{job.title}</div>
                        <div className="text-xs text-gray-400">{job.experienceLevel}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg font-medium">
                          {job.department}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-800">{job.type}</div>
                        <div className="text-xs text-gray-400">{job.location}</div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={job.status}
                          onChange={(e) =>
                            handleToggleStatus(job._id, e.target.value as "active" | "draft" | "closed")
                          }
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border border-gray-200 cursor-pointer focus:outline-none ${
                            job.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : job.status === "draft"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="draft">Draft</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {job.applicationsCount ?? 0} candidate(s)
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenJobModal(job)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job._id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: APPLICATIONS MANAGEMENT */}
      {activeTab === "applications" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <input
              type="text"
              placeholder="Search applicant name, email, job..."
              value={searchAppQuery}
              onChange={(e) => setSearchAppQuery(e.target.value)}
              className="w-full sm:max-w-xs px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#70114E]/20"
            />

            <select
              value={selectedJobFilter}
              onChange={(e) => setSelectedJobFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#70114E]/20"
            >
              <option value="">All Job Postings</option>
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>

          {loadingApps ? (
            <div className="p-12 text-center text-gray-400">Loading applications...</div>
          ) : filteredApps.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-outfit">
              No candidate applications found yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Job Applied</th>
                    <th className="px-6 py-4">Resume Document</th>
                    <th className="px-6 py-4">Applied Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredApps.map((appItem) => (
                    <tr key={appItem._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{appItem.fullName}</div>
                        <div className="text-xs text-gray-500">{appItem.email}</div>
                        {appItem.phone && <div className="text-xs text-gray-400">{appItem.phone}</div>}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {appItem.job?.title || "Deleted Job"}
                      </td>
                      <td className="px-6 py-4">
                        {appItem.resumeUrl ? (
                          <a
                            href={appItem.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs font-semibold text-[#70114E] hover:underline"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            View Resume (PDF/Doc)
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">No document</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(appItem.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={appItem.status}
                          onChange={(e) =>
                            handleUpdateAppStatus(
                              appItem._id,
                              e.target.value as "pending" | "reviewed" | "shortlisted" | "rejected" | "hired"
                            )
                          }
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border border-gray-200 cursor-pointer focus:outline-none ${
                            appItem.status === "pending"
                              ? "bg-sky-50 text-sky-700 border-sky-200"
                              : appItem.status === "reviewed"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : appItem.status === "shortlisted"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : appItem.status === "hired"
                              ? "bg-green-100 text-green-800 border-green-300"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="rejected">Rejected</option>
                          <option value="hired">Hired</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedApp(appItem)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleDeleteApp(appItem._id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT JOB MODAL */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 my-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900 font-outfit">
                {editingJob ? "Edit Job Posting" : "Post New Job Opening"}
              </h2>
              <button
                onClick={() => setShowJobModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-4 text-sm font-outfit">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Senior Adventure Travel Specialist"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#70114E]/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Department *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Operations, Marketing, Tech"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#70114E]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Remote, New Delhi, London"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#70114E]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Employment Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#70114E]/20"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Experience Level
                  </label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#70114E]/20"
                  >
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                    <option value="Lead / Manager">Lead / Manager</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "active" | "draft" | "closed",
                      })
                    }
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#70114E]/20"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Salary Range (Optional)
                </label>
                <input
                  type="text"
                  value={formData.salaryRange}
                  onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                  placeholder="e.g. $60,000 - $80,000 / year"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#70114E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Job Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the role overview and company mission..."
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#70114E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Key Responsibilities (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  placeholder="Design itinerary experiences&#10;Coordinate with local adventure leads..."
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#70114E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Requirements & Qualifications (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="3+ years travel industry experience&#10;Excellent communication skills..."
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#70114E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Benefits & Perks (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  placeholder="Annual travel credit&#10;Health insurance & flexible working..."
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#70114E]/20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 font-medium rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingJob}
                  className="px-5 py-2 text-white bg-[#1A1A1A] hover:bg-black font-medium rounded-xl text-sm transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {savingJob ? "Saving..." : editingJob ? "Update Posting" : "Publish Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPLICATION DETAILS MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 my-8 shadow-xl max-h-[90vh] overflow-y-auto font-outfit">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedApp.fullName}</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Applied for <span className="font-semibold text-gray-800">{selectedApp.job?.title}</span> on{" "}
                  {new Date(selectedApp.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-700">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <div>
                  <span className="text-xs text-gray-400 block uppercase">Email</span>
                  <a href={`mailto:${selectedApp.email}`} className="font-medium text-[#70114E] hover:underline">
                    {selectedApp.email}
                  </a>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block uppercase">Phone</span>
                  <span className="font-medium">{selectedApp.phone || "Not provided"}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block uppercase">Experience</span>
                  <span className="font-medium">{selectedApp.experienceYears || "N/A"}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block uppercase">Current Company</span>
                  <span className="font-medium">{selectedApp.currentCompany || "N/A"}</span>
                </div>
              </div>

              {/* Links & Resume */}
              <div className="flex flex-wrap gap-4 text-xs font-semibold pt-1">
                {selectedApp.resumeUrl && (
                  <a
                    href={selectedApp.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-[#70114E] text-white rounded-lg hover:bg-[#580d3d] transition-colors inline-flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Resume Document
                  </a>
                )}
                {selectedApp.linkedinUrl && (
                  <a
                    href={selectedApp.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors inline-flex items-center"
                  >
                    LinkedIn Profile &rarr;
                  </a>
                )}
                {selectedApp.portfolioUrl && (
                  <a
                    href={selectedApp.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center"
                  >
                    Portfolio / Website &rarr;
                  </a>
                )}
              </div>

              {/* Cover Letter */}
              {selectedApp.coverLetter && (
                <div className="space-y-1 pt-2">
                  <h4 className="text-xs font-bold text-gray-700 uppercase">Cover Letter / Note</h4>
                  <p className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs leading-relaxed text-gray-700 whitespace-pre-wrap">
                    {selectedApp.coverLetter}
                  </p>
                </div>
              )}

              {/* Application Status Update */}
              <div className="pt-3 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Update Candidate Status
                </label>
                <select
                  value={selectedApp.status}
                  onChange={(e) =>
                    handleUpdateAppStatus(
                      selectedApp._id,
                      e.target.value as "pending" | "reviewed" | "shortlisted" | "rejected" | "hired"
                    )
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#70114E]/20"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                  <option value="hired">Hired</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-xl text-sm transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
