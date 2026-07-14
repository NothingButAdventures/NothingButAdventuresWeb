"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { uploadCountryImage } from "@/lib/firebase";
import { api } from "@/lib/api";
import CreateActivityModal from "@/components/CreateActivityModal";
import ImagePickerModal from "@/components/ImagePickerModal";

// --- Types ---
interface Country {
    _id: string;
    id: string;
    name: string;
    code: string;
    description?: string;
    videoUrl?: string;
    currency: {
        code: string;
        name: string;
        symbol: string;
    };
    travelRequirements?: {
        visaRequired: boolean;
        visaOnArrival: boolean;
        eVisa: boolean;
    };
    faqSection?: {
        title?: string;
        subtitle?: string;
        items?: Array<{
            question: string;
            answer?: string;
        }>;
    };
    bestTime?: {
        title?: string;
        subtitle?: string;
    };
    bestTimeInsights?: {
        mostPopularTime?: string;
        budgetFriendly?: string;
        favouriteSeason?: string;
        culturallySignificantTimes?: string;
    };
    needToKnow?: {
        title?: string;
        subtitle?: string;
        timeZone?: string;
        climate?: string;
        currency?: string;
        transportation?: string;
        localCuisine?: string;
        languagesSpoken?: string;
    };
    localActivities?: Array<string | ActivityOption>;
    travelStoryBlogs?: Array<string | BlogOption>;
    image: string;
}

interface ActivityOption {
    _id: string;
    title: string;
    slug?: string;
    description?: string;
    coverImage?: string;
}

interface BlogOption {
    _id: string;
    title: string;
    slug: string;
    excerpt?: string;
    featuredImage?: {
        url: string;
    };
}

// --- Icons ---
const Icons = {
    Back: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
    ),
    Save: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
    ),
    Image: ({ className }: { className?: string }) => (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    Trash: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    ),
};

export default function EditCountryPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [country, setCountry] = useState<Country | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [currency, setCurrency] = useState({ code: "", name: "", symbol: "" });
    const [visaRequired, setVisaRequired] = useState(true);
    const [image, setImage] = useState("");
    const [uploadingImage, setUploadingImage] = useState(false);
    const [description, setDescription] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [faqTitle, setFaqTitle] = useState("FAQ");
    const [faqSubtitle, setFaqSubtitle] = useState("Everything you need to know before your desert journey - from booking to what to pack.");
    const [faqItems, setFaqItems] = useState<Array<{ question: string; answer: string }>>([]);
    const [bestTimeTitle, setBestTimeTitle] = useState("");
    const [bestTimeSubtitle, setBestTimeSubtitle] = useState("");
    const [mostPopularTimeDescription, setMostPopularTimeDescription] = useState("");
    const [budgetFriendlyDescription, setBudgetFriendlyDescription] = useState("");
    const [favouriteSeasonDescription, setFavouriteSeasonDescription] = useState("");
    const [culturallySignificantTimesDescription, setCulturallySignificantTimesDescription] = useState("");
    const [needToKnowTitle, setNeedToKnowTitle] = useState("");
    const [needToKnowSubtitle, setNeedToKnowSubtitle] = useState("");
    const [needToKnowTimeZone, setNeedToKnowTimeZone] = useState("");
    const [needToKnowClimate, setNeedToKnowClimate] = useState("");
    const [needToKnowCurrency, setNeedToKnowCurrency] = useState("");
    const [needToKnowTransportation, setNeedToKnowTransportation] = useState("");
    const [needToKnowLocalCuisine, setNeedToKnowLocalCuisine] = useState("");
    const [needToKnowLanguagesSpoken, setNeedToKnowLanguagesSpoken] = useState("");
    const [allActivities, setAllActivities] = useState<ActivityOption[]>([]);
    const [activitySearch, setActivitySearch] = useState("");
    const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>([]);
    const [activitiesLoading, setActivitiesLoading] = useState(true);
    const [allBlogs, setAllBlogs] = useState<BlogOption[]>([]);
    const [blogSearch, setBlogSearch] = useState("");
    const [travelStoryBlogSearch, setTravelStoryBlogSearch] = useState("");
    const [selectedTravelStoryBlogIds, setSelectedTravelStoryBlogIds] = useState<string[]>([]);
    const [blogsLoading, setBlogsLoading] = useState(true);
    const [showCreateActivityModal, setShowCreateActivityModal] = useState(false);
    const [showImagePicker, setShowImagePicker] = useState(false);

    const handleActivityCreated = (newActivity: any) => {
        setAllActivities((prev) => [newActivity, ...prev]);
        setSelectedActivityIds((prev) => [...prev, String(newActivity._id)]);
    };

    useEffect(() => {
        if (id) {
            fetchCountry();
            fetchActivities();
            fetchBlogs();
        }
    }, [id]);

    const fetchCountry = async () => {
        try {
            const res = await fetch(`${api.baseURL}/countries/${id}`, {
                credentials: "include",
            });
            const data = await res.json();
            if (data.status === "success") {
                const c = data.data.country;
                setCountry(c);
                setName(c.name);
                setCode(c.code);
                setCurrency(c.currency || { code: "", name: "", symbol: "" });
                setVisaRequired(c.travelRequirements?.visaRequired ?? true);
                setImage(c.image || "");
                setDescription(c.description || "");
                setVideoUrl(c.videoUrl || "");
                setFaqTitle(c.faqSection?.title || "FAQ");
                setFaqSubtitle(c.faqSection?.subtitle || "Everything you need to know before your desert journey - from booking to what to pack.");
                if (Array.isArray(c.faqSection?.items) && c.faqSection?.items.length > 0) {
                    setFaqItems(
                        c.faqSection.items.map((item: { question?: string; answer?: string }) => ({
                            question: item.question || "",
                            answer: item.answer || "",
                        }))
                    );
                } else {
                    setFaqItems([]);
                }
                setBestTimeTitle(c.bestTime?.title || "");
                setBestTimeSubtitle(c.bestTime?.subtitle || "");
                setMostPopularTimeDescription(c.bestTimeInsights?.mostPopularTime || "");
                setBudgetFriendlyDescription(c.bestTimeInsights?.budgetFriendly || "");
                setFavouriteSeasonDescription(c.bestTimeInsights?.favouriteSeason || "");
                setCulturallySignificantTimesDescription(c.bestTimeInsights?.culturallySignificantTimes || "");
                setNeedToKnowTitle(c.needToKnow?.title || "");
                setNeedToKnowSubtitle(c.needToKnow?.subtitle || "");
                setNeedToKnowTimeZone(c.needToKnow?.timeZone || "");
                setNeedToKnowClimate(c.needToKnow?.climate || "");
                setNeedToKnowCurrency(c.needToKnow?.currency || "");
                setNeedToKnowTransportation(c.needToKnow?.transportation || "");
                setNeedToKnowLocalCuisine(c.needToKnow?.localCuisine || "");
                setNeedToKnowLanguagesSpoken(c.needToKnow?.languagesSpoken || "");
                setSelectedActivityIds(
                    (c.localActivities || []).map((activity: string | ActivityOption) =>
                        typeof activity === "string" ? String(activity) : String(activity._id)
                    )
                );
                setSelectedTravelStoryBlogIds(
                    (c.travelStoryBlogs || []).map((blog: string | BlogOption) =>
                        typeof blog === "string" ? String(blog) : String(blog._id)
                    )
                );
            }
        } catch (err) {
            console.error("Error fetching country:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchActivities = async () => {
        if (!id) return;
        try {
            setActivitiesLoading(true);
            const res = await fetch(`${api.baseURL}/activities?destination=${id}&limit=500`, {
                credentials: "include",
            });
            const data = await res.json();
            if (data.status === "success") {
                setAllActivities(data.data.activities || []);
            }
        } catch (err) {
            console.error("Error fetching activities:", err);
        } finally {
            setActivitiesLoading(false);
        }
    };

    const fetchBlogs = async () => {
        try {
            setBlogsLoading(true);
            const res = await fetch(`${api.baseURL}/blogs?limit=200`, {
                credentials: "include",
            });
            const data = await res.json();
            if (data.status === "success") {
                setAllBlogs(data.data.blogs || []);
            }
        } catch (err) {
            console.error("Error fetching blogs:", err);
        } finally {
            setBlogsLoading(false);
        }
    };

    const toggleActivitySelection = (activityId: string) => {
        const normalizedId = String(activityId);
        setSelectedActivityIds((prev) =>
            prev.includes(normalizedId)
                ? prev.filter((id) => id !== normalizedId)
                : [...prev, normalizedId]
        );
    };

    const toggleTravelStoryBlogSelection = (blogId: string) => {
        const normalizedId = String(blogId);
        setSelectedTravelStoryBlogIds((prev) =>
            prev.includes(normalizedId)
                ? prev.filter((id) => id !== normalizedId)
                : [...prev, normalizedId]
        );
    };

    const updateFaqItem = (index: number, field: "question" | "answer", value: string) => {
        setFaqItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
    };

    const addFaqItem = () => {
        setFaqItems((prev) => [...prev, { question: "", answer: "" }]);
    };

    const removeFaqItem = (index: number) => {
        setFaqItems((prev) => prev.filter((_, i) => i !== index));
    };

    const uploadImageToSupabase = async (file: File): Promise<string | null> => {
        try {
            return await uploadCountryImage(file);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload image.");
            return null;
        }
    };

    const handleSave = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!name) return alert("Name is required");

        setSaving(true);
        try {
            const payload = {
                name,
                code,
                currency,
                travelRequirements: { visaRequired },
                description,
                videoUrl,
                faqSection: {
                    title: faqTitle,
                    subtitle: faqSubtitle,
                    items: faqItems.filter((item) => item.question.trim() !== ""),
                },
                bestTime: {
                    title: bestTimeTitle.trim(),
                    subtitle: bestTimeSubtitle.trim(),
                },
                bestTimeInsights: {
                    mostPopularTime: mostPopularTimeDescription.trim(),
                    budgetFriendly: budgetFriendlyDescription.trim(),
                    favouriteSeason: favouriteSeasonDescription.trim(),
                    culturallySignificantTimes: culturallySignificantTimesDescription.trim(),
                },
                needToKnow: {
                    title: needToKnowTitle.trim(),
                    subtitle: needToKnowSubtitle.trim(),
                    timeZone: needToKnowTimeZone.trim(),
                    climate: needToKnowClimate.trim(),
                    currency: needToKnowCurrency.trim(),
                    transportation: needToKnowTransportation.trim(),
                    localCuisine: needToKnowLocalCuisine.trim(),
                    languagesSpoken: needToKnowLanguagesSpoken.trim(),
                },
                image,
                localActivities: selectedActivityIds,
                travelStoryBlogs: selectedTravelStoryBlogIds,
            };

            const res = await fetch(`${api.baseURL}/countries/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include",
            });
            const data = await res.json();
            if (data.status === "success") {
                alert("Destination saved successfully!");
                router.refresh();
            } else {
                alert("Error saving: " + data.message);
            }
        } catch (err) {
            console.error("Save error:", err);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 flex justify-center text-zinc-500 animate-pulse font-medium">Loading destination...</div>;
    if (!country) return <div className="p-10 text-center">Destination not found</div>;

    const filteredActivities = allActivities.filter((activity) => {
        const q = activitySearch.trim().toLowerCase();
        if (!q) return true;
        return (
            activity.title.toLowerCase().includes(q) ||
            (activity.slug || "").toLowerCase().includes(q)
        );
    });

    const selectedActivities = allActivities.filter((activity) =>
        selectedActivityIds.includes(String(activity._id))
    );

    const filteredTravelStoryBlogs = allBlogs.filter((blog) => {
        const q = travelStoryBlogSearch.trim().toLowerCase();
        if (!q) return true;
        return (
            blog.title.toLowerCase().includes(q) ||
            blog.slug.toLowerCase().includes(q)
        );
    });

    const selectedTravelStoryBlogs = allBlogs.filter((blog) =>
        selectedTravelStoryBlogIds.includes(String(blog._id))
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/admin/location" className="p-2 border border-gray-200 hover:bg-zinc-100 rounded-md transition text-zinc-650 bg-white shadow-sm flex items-center justify-center">
                                <Icons.Back className="w-4 h-4" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-zinc-800">Edit Destination</h1>
                                <p className="text-xs text-gray-500">Update details for {country.name}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 disabled:opacity-50 transition shadow-sm font-medium text-sm border border-zinc-900 cursor-pointer"
                        >
                            {saving ? (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Icons.Save className="w-4 h-4" />
                            )}
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Basic Info Card */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 md:p-8">
                    <h2 className="text-lg font-semibold text-zinc-800 mb-6 border-b border-gray-100 pb-3">General Information</h2>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Destination Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-850"
                        />
                    </div>
                </div>

                {/* Description Card */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                        <h2 className="text-lg font-semibold text-zinc-800">Description</h2>
                    </div>

                    <div className="p-6">
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe this destination... (Culture, History, Top Destinations)"
                            rows={5}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-800 resize-y"
                        />
                    </div>
                </div>

                {/* Cover Image Card */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 md:p-8">
                    <h2 className="text-lg font-semibold text-zinc-800 mb-4 border-b border-gray-100 pb-3">Cover Image</h2>
                    <div
                        onClick={() => setShowImagePicker(true)}
                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-md bg-gray-50/30 hover:bg-gray-50/70 transition-colors cursor-pointer min-h-[200px] shadow-inner"
                    >
                        {image ? (
                            <div className="relative w-full max-w-lg aspect-video rounded-md overflow-hidden shadow-md group border border-gray-205">
                                <img src={image} alt="Cover" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-zinc-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-semibold transition-opacity">
                                    Change Image
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="w-12 h-12 bg-white border border-gray-350 rounded-full flex items-center justify-center mx-auto mb-3 text-zinc-500 shadow-sm">
                                    <Icons.Image className="w-6 h-6" />
                                </div>
                                <p className="text-gray-500 text-xs font-semibold mb-2">Click to select from Media Library or Upload a cover image</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Popular Activities */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 md:p-8">
                    <h2 className="text-lg font-semibold text-zinc-800 mb-2">Get to Know Activities</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Select one or more activities for the "Popular Activities" section on {name || country.name} page.
                    </p>

                    <div className="flex gap-3 mb-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={activitySearch}
                                onChange={(e) => setActivitySearch(e.target.value)}
                                placeholder="Search activities by title or slug"
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-850"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowCreateActivityModal(true)}
                            className="px-4 py-2 border border-gray-300 bg-white text-zinc-700 hover:bg-gray-50 rounded-md transition text-xs font-semibold shadow-sm flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                        >
                            + Create New Activity
                        </button>
                    </div>

                    <div className="mt-4 border border-gray-200 rounded-md max-h-80 overflow-y-auto bg-gray-50/50 shadow-inner">
                        {activitiesLoading ? (
                            <div className="p-4 text-xs font-medium text-zinc-500 animate-pulse">Loading activities...</div>
                        ) : filteredActivities.length === 0 ? (
                            <div className="p-4 text-xs font-medium text-zinc-500">No activities found.</div>
                        ) : (
                            filteredActivities.map((activity) => (
                                <label
                                    key={activity._id}
                                    className="flex items-start gap-3 p-3 border-b border-gray-200 last:border-b-0 cursor-pointer hover:bg-white transition duration-150"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedActivityIds.includes(String(activity._id))}
                                        onChange={() => toggleActivitySelection(activity._id)}
                                        className="mt-1 w-4 h-4 rounded border-gray-300 text-zinc-900 focus:ring-zinc-500 focus:ring-2"
                                    />
                                    {activity.coverImage ? (
                                        <img
                                            src={activity.coverImage}
                                            alt={activity.title}
                                            className="w-16 h-12 object-cover rounded-md border border-gray-200"
                                        />
                                    ) : (
                                        <div className="w-16 h-12 rounded-md border border-gray-200 bg-gray-200" />
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-zinc-800 truncate">{activity.title}</p>
                                        <p className="text-[10px] text-gray-500 truncate">/{activity.slug || "activity"}</p>
                                    </div>
                                </label>
                            ))
                        )}
                    </div>

                    <div className="mt-6">
                        <h3 className="text-sm font-semibold text-zinc-800 mb-2">Selected Activities ({selectedActivities.length})</h3>
                        <div className="border border-gray-200 rounded-md max-h-64 overflow-y-auto bg-white shadow-sm">
                            {selectedActivities.length === 0 ? (
                                <div className="p-4 text-xs font-medium text-zinc-500">No activity selected yet.</div>
                            ) : (
                                selectedActivities.map((activity) => (
                                    <div key={activity._id} className="flex items-center justify-between gap-3 p-3 border-b border-gray-200 last:border-b-0">
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-zinc-850 truncate">{activity.title}</p>
                                            <p className="text-[10px] text-gray-500 truncate">/{activity.slug || "activity"}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => toggleActivitySelection(activity._id)}
                                            className="text-xs px-2.5 py-1.5 rounded-md border border-gray-300 text-zinc-700 bg-white hover:bg-gray-50 shadow-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Best Season / Time */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 md:p-8">
                    <h2 className="text-lg font-semibold text-zinc-800 mb-2">Best Time</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Fill the section title/description and these 4 descriptions. Labels are fixed on frontend.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 border-b border-gray-200 pb-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Section Heading (fallback: Best Time to Travel)</label>
                            <input
                                type="text"
                                value={bestTimeTitle}
                                onChange={(e) => setBestTimeTitle(e.target.value)}
                                placeholder="Best Time to Travel"
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-850"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Section Subheading (fallback: Best seasons to visit [Country])</label>
                            <input
                                type="text"
                                value={bestTimeSubtitle}
                                onChange={(e) => setBestTimeSubtitle(e.target.value)}
                                placeholder="e.g. Best seasons to visit India"
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-850"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Most Popular Time</label>
                            <input
                                type="text"
                                value={mostPopularTimeDescription}
                                onChange={(e) => setMostPopularTimeDescription(e.target.value)}
                                placeholder="Peak season for the best weather and experiences"
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-850"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Budget Friendly</label>
                            <input
                                type="text"
                                value={budgetFriendlyDescription}
                                onChange={(e) => setBudgetFriendlyDescription(e.target.value)}
                                placeholder="Travel in shoulder months for better value"
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-850"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Favourite Season</label>
                            <input
                                type="text"
                                value={favouriteSeasonDescription}
                                onChange={(e) => setFavouriteSeasonDescription(e.target.value)}
                                placeholder="A local favorite for festivals and landscapes"
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-850"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Culturally Significant Times</label>
                            <input
                                type="text"
                                value={culturallySignificantTimesDescription}
                                onChange={(e) => setCulturallySignificantTimesDescription(e.target.value)}
                                placeholder="Ideal period to witness local traditions"
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-850"
                            />
                        </div>
                    </div>
                </div>

                {/* Video Info */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 md:p-8">
                    <h2 className="text-lg font-semibold text-zinc-800 mb-2">Destination Video</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Add a video link (YouTube/Vimeo/embed URL). This video will appear in the same video section on the destination page.
                    </p>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Video URL</label>
                    <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-800"
                    />
                </div>

                {/* Need to Know Details */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 md:p-8">
                    <h2 className="text-lg font-semibold text-zinc-800 mb-4 border-b border-gray-100 pb-3">Need to know</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Fill the section title/description and these 6 details for the destination page section shown below the video preview.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 border-b border-gray-200 pb-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Section Heading (fallback: [Country] at a Glance)</label>
                            <input
                                type="text"
                                value={needToKnowTitle}
                                onChange={(e) => setNeedToKnowTitle(e.target.value)}
                                placeholder="India at a Glance"
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-805"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Section Subheading (fallback: Need to Know)</label>
                            <input
                                type="text"
                                value={needToKnowSubtitle}
                                onChange={(e) => setNeedToKnowSubtitle(e.target.value)}
                                placeholder="Need to Know"
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-805"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Time Zone</label>
                            <input
                                type="text"
                                value={needToKnowTimeZone}
                                onChange={(e) => setNeedToKnowTimeZone(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-850"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Climate</label>
                            <input
                                type="text"
                                value={needToKnowClimate}
                                onChange={(e) => setNeedToKnowClimate(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-850"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Currency</label>
                            <input
                                type="text"
                                value={needToKnowCurrency}
                                onChange={(e) => setNeedToKnowCurrency(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-850"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Transportation</label>
                            <input
                                type="text"
                                value={needToKnowTransportation}
                                onChange={(e) => setNeedToKnowTransportation(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-850"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Local Cuisine</label>
                            <input
                                type="text"
                                value={needToKnowLocalCuisine}
                                onChange={(e) => setNeedToKnowLocalCuisine(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-850"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Languages Spoken</label>
                            <input
                                type="text"
                                value={needToKnowLanguagesSpoken}
                                onChange={(e) => setNeedToKnowLanguagesSpoken(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-850"
                            />
                        </div>
                    </div>
                </div>

                {/* Travel Story Blogs */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 md:p-8">
                    <h2 className="text-lg font-semibold text-zinc-800 mb-2">{name || country.name} Travel Stories Blogs</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Select one or more existing blogs for the "{name || country.name} Travel Stories" section.
                    </p>

                    <input
                        type="text"
                        value={travelStoryBlogSearch}
                        onChange={(e) => setTravelStoryBlogSearch(e.target.value)}
                        placeholder="Search blogs by title or slug"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-850 mb-4"
                    />

                    <div className="border border-gray-200 rounded-md max-h-80 overflow-y-auto bg-gray-50/50 shadow-inner">
                        {blogsLoading ? (
                            <div className="p-4 text-xs font-semibold text-zinc-500 animate-pulse">Loading blogs...</div>
                        ) : filteredTravelStoryBlogs.length === 0 ? (
                            <div className="p-4 text-xs font-semibold text-zinc-500">No blogs found.</div>
                        ) : (
                            filteredTravelStoryBlogs.map((blog) => (
                                <label
                                    key={blog._id}
                                    className="flex items-start gap-3 p-3 border-b border-gray-200 last:border-b-0 cursor-pointer hover:bg-white transition duration-150"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedTravelStoryBlogIds.includes(String(blog._id))}
                                        onChange={() => toggleTravelStoryBlogSelection(blog._id)}
                                        className="mt-1 w-4 h-4 rounded border-gray-300 text-zinc-900 focus:ring-zinc-500 focus:ring-2"
                                    />
                                    {blog.featuredImage?.url ? (
                                        <img
                                            src={blog.featuredImage.url}
                                            alt={blog.title}
                                            className="w-16 h-12 object-cover rounded-md border border-gray-200"
                                        />
                                    ) : (
                                        <div className="w-16 h-12 rounded-md border border-gray-200 bg-gray-200" />
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-zinc-800 truncate">{blog.title}</p>
                                        <p className="text-[10px] text-gray-500 truncate">/{blog.slug}</p>
                                    </div>
                                </label>
                            ))
                        )}
                    </div>

                    <div className="mt-6">
                        <h3 className="text-sm font-semibold text-zinc-800 mb-2">Selected Blogs ({selectedTravelStoryBlogs.length})</h3>
                        <div className="border border-gray-200 rounded-md max-h-64 overflow-y-auto bg-white shadow-sm">
                            {selectedTravelStoryBlogs.length === 0 ? (
                                <div className="p-4 text-xs font-medium text-zinc-500">No blog selected yet.</div>
                            ) : (
                                selectedTravelStoryBlogs.map((blog) => (
                                    <div key={blog._id} className="flex items-center justify-between gap-3 p-3 border-b border-gray-200 last:border-b-0">
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-zinc-800 truncate">{blog.title}</p>
                                            <p className="text-[10px] text-gray-500 truncate">/{blog.slug}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => toggleTravelStoryBlogSelection(blog._id)}
                                            className="text-xs px-2.5 py-1.5 rounded-md border border-gray-300 text-zinc-700 bg-white hover:bg-gray-50 shadow-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 md:p-8">
                    <h2 className="text-lg font-semibold text-zinc-800 mb-4 border-b border-gray-100 pb-3">FAQ Section</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Manage FAQ heading and questions for the destination page.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">FAQ Title</label>
                            <input
                                type="text"
                                value={faqTitle}
                                onChange={(e) => setFaqTitle(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-800"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">FAQ Subtitle</label>
                            <textarea
                                value={faqSubtitle}
                                onChange={(e) => setFaqSubtitle(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-800 resize-y"
                            />
                        </div>

                        <div className="space-y-4">
                            {faqItems.length === 0 ? (
                                <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-xs font-semibold text-zinc-500 shadow-inner">
                                    No FAQs added yet. Click "Add FAQ Item" to create your first FAQ.
                                </div>
                            ) : (
                                faqItems.map((item, index) => (
                                    <div key={index} className="rounded-md border border-gray-200 p-4 bg-gray-50/50 shadow-sm relative">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-xs font-bold text-zinc-800">FAQ #{index + 1}</p>
                                            <button
                                                type="button"
                                                onClick={() => removeFaqItem(index)}
                                                className="text-xs px-2.5 py-1 rounded-md border border-gray-300 text-zinc-750 bg-white hover:bg-gray-50 shadow-sm cursor-pointer"
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Question</label>
                                                <input
                                                    type="text"
                                                    value={item.question}
                                                    onChange={(e) => updateFaqItem(index, "question", e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-800"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Answer (optional)</label>
                                                <textarea
                                                    value={item.answer}
                                                    onChange={(e) => updateFaqItem(index, "answer", e.target.value)}
                                                    rows={3}
                                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm text-zinc-800 resize-y"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}

                            <button
                                type="button"
                                onClick={addFaqItem}
                                className="text-xs px-3.5 py-2 border border-gray-350 text-zinc-750 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition-colors font-semibold shadow-sm bg-white cursor-pointer"
                            >
                                Add FAQ Item
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {showCreateActivityModal && (
                <CreateActivityModal
                    isOpen={showCreateActivityModal}
                    onClose={() => setShowCreateActivityModal(false)}
                    destinationId={id}
                    locationTags={name || (country && country.name) ? [name || country.name] : []}
                    onCreated={handleActivityCreated}
                />
            )}
            <ImagePickerModal
                isOpen={showImagePicker}
                onClose={() => setShowImagePicker(false)}
                onSelect={(urls) => {
                    if (urls.length > 0) setImage(urls[0]);
                }}
                multiple={false}
            />
        </div>
    );
}
