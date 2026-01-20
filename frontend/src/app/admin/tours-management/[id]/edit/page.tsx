"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_BUCKET,
} from "@/lib/supabase";

interface Country {
  _id: string;
  name: string;
}

interface ImageUpload {
  file: File | null;
  preview: string;
  caption: string;
  isPrimary: boolean;
  uploading: boolean;
  url: string;
}

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string;
}

interface StartDate {
  date: string;
  availableSpots: number;
  priceAmount: number;
}

export default function EditTourPage() {
  const router = useRouter();
  const params = useParams();
  const tourId = params?.id;

  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [images, setImages] = useState<ImageUpload[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [startDates, setStartDates] = useState<StartDate[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    summary: "",
    description: "",
    country: "",
    durationDays: "",
    durationNights: "",
    maxGroupSize: "",
    difficulty: "moderate",
    physicalRatingLevel: "3",
    physicalRatingDescription: "",
    priceAmount: "",
    priceCurrency: "USD",
    discountPercent: "0",
    travelStyle: "Classic",
    serviceLevel: "Standard",
    tripType: "Small Group",
    startCity: "",
    endCity: "",
    visitedCities: "",
    highlights: "",
    inclusionsAccommodation: "",
    inclusionsMeals: "",
    inclusionsTransport: "",
    inclusionsActivities: "",
    inclusionsGuides: "",
    inclusionsOther: "",
    exclusions: "",
    ageMin: "0",
    ageMax: "99",
    ageDescription: "",
    isFeatured: false,
    isActive: true,
  });

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const authResponse = await fetch(`${api.baseURL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!authResponse.ok) {
        router.push("/auth/login");
        return;
      }

      const authData = await authResponse.json();

      if (authData.data.user.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      // Fetch countries
      const countriesResponse = await fetch(`${api.baseURL}/countries`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (countriesResponse.ok) {
        const countriesData = await countriesResponse.json();
        setCountries(countriesData.data.countries);
      }

      // Fetch tour data
      const tourResponse = await fetch(`${api.baseURL}/tours/${tourId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (tourResponse.ok) {
        const tourData = await tourResponse.json();
        const tour = tourData.data.tour;

        setFormData({
          name: tour.name || "",
          summary: tour.summary || "",
          description: tour.description || "",
          country: tour.country?._id || tour.country || "",
          durationDays: tour.duration?.days?.toString() || "",
          durationNights: tour.duration?.nights?.toString() || "",
          maxGroupSize: tour.maxGroupSize?.toString() || "",
          difficulty: tour.difficulty || "moderate",
          physicalRatingLevel: tour.physicalRating?.level?.toString() || "3",
          physicalRatingDescription: tour.physicalRating?.description || "",
          priceAmount: tour.price?.amount?.toString() || "",
          priceCurrency: tour.price?.currency || "USD",
          discountPercent: tour.price?.discountPercent?.toString() || "0",
          travelStyle: tour.travelStyle || "Classic",
          serviceLevel: tour.serviceLevel || "Standard",
          tripType: tour.tripType || "Small Group",
          startCity: tour.location?.startCity || "",
          endCity: tour.location?.endCity || "",
          visitedCities: tour.location?.visitedCities?.join(", ") || "",
          highlights: tour.highlights?.join("\n") || "",
          inclusionsAccommodation: tour.inclusions?.accommodation || "",
          inclusionsMeals: tour.inclusions?.meals?.join("\n") || "",
          inclusionsTransport: tour.inclusions?.transport?.join("\n") || "",
          inclusionsActivities: tour.inclusions?.activities?.join("\n") || "",
          inclusionsGuides: tour.inclusions?.guides || "",
          inclusionsOther: tour.inclusions?.other?.join("\n") || "",
          exclusions: tour.exclusions?.join("\n") || "",
          ageMin: tour.ageRequirement?.min?.toString() || "0",
          ageMax: tour.ageRequirement?.max?.toString() || "99",
          ageDescription: tour.ageRequirement?.description || "",
          isFeatured: tour.isFeatured || false,
          isActive: tour.isActive !== false,
        });

        // Load existing images
        if (tour.images && tour.images.length > 0) {
          setImages(
            tour.images.map((img: any) => ({
              file: null,
              preview: img.url,
              caption: img.caption || "",
              isPrimary: img.isPrimary || false,
              uploading: false,
              url: img.url,
            })),
          );
        }

        // Load itinerary
        if (tour.itinerary && tour.itinerary.length > 0) {
          setItinerary(
            tour.itinerary.map((day: any) => ({
              day: day.day,
              title: day.title || "",
              description: day.description || "",
              activities: day.activities?.join(", ") || "",
            })),
          );
        }

        // Load start dates
        if (tour.startDates && tour.startDates.length > 0) {
          setStartDates(
            tour.startDates.map((sd: any) => ({
              date: sd.date
                ? new Date(sd.date).toISOString().split("T")[0]
                : "",
              availableSpots: sd.availableSpots || 0,
              priceAmount: sd.price?.amount || 0,
            })),
          );
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Image Upload Functions
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [
          ...prev,
          {
            file,
            preview: reader.result as string,
            caption: "",
            isPrimary: prev.length === 0,
            uploading: false,
            url: "",
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `tours/${fileName}`;

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    const response = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${filePath}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: formDataUpload,
      },
    );

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${filePath}`;
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const updateImageCaption = (index: number, caption: string) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, caption } : img)),
    );
  };

  const setImageAsPrimary = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, isPrimary: i === index })),
    );
  };

  // Itinerary Functions
  const addItineraryDay = () => {
    setItinerary((prev) => [
      ...prev,
      {
        day: prev.length + 1,
        title: "",
        description: "",
        activities: "",
      },
    ]);
  };

  const removeItineraryDay = (index: number) => {
    setItinerary((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, day: i + 1 })),
    );
  };

  const updateItinerary = (
    index: number,
    field: keyof ItineraryDay,
    value: string | number,
  ) => {
    setItinerary((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  // Start Dates Functions
  const addStartDate = () => {
    setStartDates((prev) => [
      ...prev,
      {
        date: "",
        availableSpots: parseInt(formData.maxGroupSize) || 10,
        priceAmount: parseFloat(formData.priceAmount) || 0,
      },
    ]);
  };

  const removeStartDate = (index: number) => {
    setStartDates((prev) => prev.filter((_, i) => i !== index));
  };

  const updateStartDate = (
    index: number,
    field: keyof StartDate,
    value: string | number,
  ) => {
    setStartDates((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.summary ||
      !formData.description ||
      !formData.country
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);

      // Upload new images to Supabase
      const uploadedImages = await Promise.all(
        images.map(async (img) => {
          if (img.file) {
            const url = await uploadImageToSupabase(img.file);
            return {
              url,
              caption: img.caption,
              isPrimary: img.isPrimary,
            };
          } else {
            return {
              url: img.url,
              caption: img.caption,
              isPrimary: img.isPrimary,
            };
          }
        }),
      );

      const token = localStorage.getItem("token");

      const visitedCitiesArray = formData.visitedCities
        .split(",")
        .map((city) => city.trim())
        .filter((city) => city !== "");

      const highlightsArray = formData.highlights
        .split("\n")
        .map((h) => h.trim())
        .filter((h) => h !== "");

      const inclusionsMealsArray = formData.inclusionsMeals
        .split("\n")
        .map((m) => m.trim())
        .filter((m) => m !== "");

      const inclusionsTransportArray = formData.inclusionsTransport
        .split("\n")
        .map((t) => t.trim())
        .filter((t) => t !== "");

      const inclusionsActivitiesArray = formData.inclusionsActivities
        .split("\n")
        .map((a) => a.trim())
        .filter((a) => a !== "");

      const inclusionsOtherArray = formData.inclusionsOther
        .split("\n")
        .map((o) => o.trim())
        .filter((o) => o !== "");

      const exclusionsArray = formData.exclusions
        .split("\n")
        .map((e) => e.trim())
        .filter((e) => e !== "");

      const tourData = {
        name: formData.name,
        summary: formData.summary,
        description: formData.description,
        country: formData.country,
        duration: {
          days: parseInt(formData.durationDays),
          nights: parseInt(formData.durationNights),
        },
        maxGroupSize: parseInt(formData.maxGroupSize),
        difficulty: formData.difficulty,
        physicalRating: {
          level: parseInt(formData.physicalRatingLevel),
          description: formData.physicalRatingDescription,
        },
        price: {
          amount: parseFloat(formData.priceAmount),
          currency: formData.priceCurrency,
          discountPercent: parseFloat(formData.discountPercent),
        },
        travelStyle: formData.travelStyle,
        serviceLevel: formData.serviceLevel,
        tripType: formData.tripType,
        location: {
          startCity: formData.startCity,
          endCity: formData.endCity,
          visitedCities: visitedCitiesArray,
        },
        highlights: highlightsArray,
        images: uploadedImages,
        itinerary: itinerary.map((day) => ({
          day: day.day,
          title: day.title,
          description: day.description,
          activities: day.activities
            .split(",")
            .map((a) => a.trim())
            .filter((a) => a !== ""),
        })),
        startDates: startDates.map((sd) => ({
          date: new Date(sd.date),
          availableSpots: sd.availableSpots,
          price: {
            amount: sd.priceAmount,
            currency: formData.priceCurrency,
          },
          isActive: true,
        })),
        inclusions: {
          accommodation: formData.inclusionsAccommodation,
          meals: inclusionsMealsArray,
          transport: inclusionsTransportArray,
          activities: inclusionsActivitiesArray,
          guides: formData.inclusionsGuides,
          other: inclusionsOtherArray,
        },
        exclusions: exclusionsArray,
        ageRequirement: {
          min: parseInt(formData.ageMin),
          max: parseInt(formData.ageMax),
          description: formData.ageDescription,
        },
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
      };

      const response = await fetch(`${api.baseURL}/tours/${tourId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tourData),
      });

      if (response.ok) {
        alert("Tour updated successfully!");
        router.push("/admin/tours-management");
      } else {
        const data = await response.json();
        alert(`Failed to update tour: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating tour:", error);
      alert("Failed to update tour. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-3 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Tour</h1>
          <p className="text-sm text-gray-600 mt-1">Update tour information</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tour Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Summary <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleChange}
                    required
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                  >
                    <option value="">Select country</option>
                    {countries.map((country) => (
                      <option key={country._id} value={country._id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Group Size <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="maxGroupSize"
                    value={formData.maxGroupSize}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (Days) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="durationDays"
                    value={formData.durationDays}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (Nights) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="durationNights"
                    value={formData.durationNights}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                  >
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="difficult">Difficult</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Physical Rating (1-5){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="physicalRatingLevel"
                    value={formData.physicalRatingLevel}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                  >
                    <option value="1">1 - Very Easy</option>
                    <option value="2">2 - Easy</option>
                    <option value="3">3 - Moderate</option>
                    <option value="4">4 - Challenging</option>
                    <option value="5">5 - Very Challenging</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Physical Rating Description
                  </label>
                  <input
                    type="text"
                    name="physicalRatingDescription"
                    value={formData.physicalRatingDescription}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Travel Style <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="travelStyle"
                    value={formData.travelStyle}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                  >
                    <option value="Classic">Classic</option>
                    <option value="Solo-ish Adventures">
                      Solo-ish Adventures
                    </option>
                    <option value="NexTrip Journeys">NexTrip Journeys</option>
                    <option value="Family">Family</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Budget">Budget</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="serviceLevel"
                    value={formData.serviceLevel}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Comfort">Comfort</option>
                    <option value="Premium">Premium</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trip Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="tripType"
                    value={formData.tripType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                  >
                    <option value="Small Group">Small Group</option>
                    <option value="Private">Private</option>
                    <option value="Independent">Independent</option>
                    <option value="Family">Family</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="startCity"
                    value={formData.startCity}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="endCity"
                    value={formData.endCity}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visited Cities (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="visitedCities"
                    value={formData.visitedCities}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tour Highlights (one per line)
                  </label>
                  <textarea
                    name="highlights"
                    value={formData.highlights}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Age
                  </label>
                  <input
                    type="number"
                    name="ageMin"
                    value={formData.ageMin}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Age
                  </label>
                  <input
                    type="number"
                    name="ageMax"
                    value={formData.ageMax}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age Requirement Description
                  </label>
                  <input
                    type="text"
                    name="ageDescription"
                    value={formData.ageDescription}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                  />
                </div>

                <div className="md:col-span-2 flex gap-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                    />
                    <label className="ml-2 text-sm text-gray-700">Active</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                      className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Featured
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tour Images
            </h2>

            <div className="mb-4">
              <label className="block w-full">
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-gray-400 transition">
                  <svg
                    className="mx-auto h-10 w-10 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload images
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {images.map((img, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-md overflow-hidden bg-white"
                >
                  <div className="relative">
                    <img
                      src={img.preview}
                      alt="Preview"
                      className="w-full h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    {img.isPrimary && (
                      <div className="absolute top-1 left-1 bg-gray-900 text-white px-2 py-0.5 rounded text-xs">
                        Primary
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <input
                      type="text"
                      value={img.caption}
                      onChange={(e) =>
                        updateImageCaption(index, e.target.value)
                      }
                      placeholder="Caption"
                      className="w-full px-2 py-1 border border-gray-200 rounded text-sm mb-1 text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => setImageAsPrimary(index)}
                      className={`w-full py-1 rounded text-xs transition ${
                        img.isPrimary
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {img.isPrimary ? "Primary" : "Set Primary"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Pricing
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="priceAmount"
                  value={formData.priceAmount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency <span className="text-red-500">*</span>
                </label>
                <select
                  name="priceCurrency"
                  value={formData.priceCurrency}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount %
                </label>
                <input
                  type="number"
                  name="discountPercent"
                  value={formData.discountPercent}
                  onChange={handleChange}
                  min="0"
                  max="90"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Itinerary Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Day-by-Day Itinerary
              </h2>
              <button
                type="button"
                onClick={addItineraryDay}
                className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition"
              >
                + Add Day
              </button>
            </div>

            <div className="space-y-3">
              {itinerary.map((day, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-md p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Day {day.day}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeItineraryDay(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={day.title}
                      onChange={(e) =>
                        updateItinerary(index, "title", e.target.value)
                      }
                      placeholder="Day title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                    />
                    <textarea
                      value={day.description}
                      onChange={(e) =>
                        updateItinerary(index, "description", e.target.value)
                      }
                      placeholder="Description"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                    />
                    <input
                      type="text"
                      value={day.activities}
                      onChange={(e) =>
                        updateItinerary(index, "activities", e.target.value)
                      }
                      placeholder="Activities (comma-separated)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Start Dates Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Start Dates
              </h2>
              <button
                type="button"
                onClick={addStartDate}
                className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition"
              >
                + Add Date
              </button>
            </div>

            <div className="space-y-3">
              {startDates.map((sd, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-md p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Departure #{index + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeStartDate(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="date"
                      value={sd.date}
                      onChange={(e) =>
                        updateStartDate(index, "date", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                    />
                    <input
                      type="number"
                      value={sd.availableSpots}
                      onChange={(e) =>
                        updateStartDate(
                          index,
                          "availableSpots",
                          parseInt(e.target.value),
                        )
                      }
                      placeholder="Available spots"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                    />
                    <input
                      type="number"
                      value={sd.priceAmount}
                      onChange={(e) =>
                        updateStartDate(
                          index,
                          "priceAmount",
                          parseFloat(e.target.value),
                        )
                      }
                      placeholder="Price"
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inclusions Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Inclusions & Exclusions
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accommodation
                </label>
                <input
                  type="text"
                  name="inclusionsAccommodation"
                  value={formData.inclusionsAccommodation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meals (one per line)
                </label>
                <textarea
                  name="inclusionsMeals"
                  value={formData.inclusionsMeals}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transport (one per line)
                </label>
                <textarea
                  name="inclusionsTransport"
                  value={formData.inclusionsTransport}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activities (one per line)
                </label>
                <textarea
                  name="inclusionsActivities"
                  value={formData.inclusionsActivities}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guides
                </label>
                <input
                  type="text"
                  name="inclusionsGuides"
                  value={formData.inclusionsGuides}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Other Inclusions (one per line)
                </label>
                <textarea
                  name="inclusionsOther"
                  value={formData.inclusionsOther}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-red-600 mb-1">
                  Exclusions (one per line)
                </label>
                <textarea
                  name="exclusions"
                  value={formData.exclusions}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-red-200 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 sticky bottom-0 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>Update Tour</>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/tours-management")}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
