"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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

interface Activity {
  name: string;
  description: string;
  placeName: string;
  duration: string;
  icon: string;
}

interface OptionalActivity {
  name: string;
  price: {
    amount: number;
    currency: string;
  };
  place: string;
  description: string;
  duration: string;
  icon: string;
}

interface Accommodation {
  name: string;
  type: string;
  rating?: number;
  description?: string;
}

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  imageUrl?: string;
  imageFile?: File | null;
  imagePreview?: string;
  activities: Activity[];
  optionalActivities: OptionalActivity[];
  accommodations: Accommodation[];
}

interface AvailableDate {
  startDate: string;
  endDate: string;
  availableSpots: number;
  priceAmount: number;
}

export default function CreateTourPage() {
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Image uploads
  const [images, setImages] = useState<ImageUpload[]>([]);

  // Itinerary
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);

  // Available Dates
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    summary: "",
    description: "",
    country: "",
    durationDays: "",
    durationNights: "",
    maxGroupSize: "",
    physicalRatingLevel: "3",
    priceAmount: "",
    priceCurrency: "USD",
    discountPercent: "0",
    travelStyle: "Classic",
    startCity: "",
    endCity: "",
    visitedCities: "",
    highlights: "",
    ageMin: "0",
    ageMax: "99",
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

      const countriesResponse = await fetch(`${api.baseURL}/countries`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (countriesResponse.ok) {
        const countriesData = await countriesResponse.json();
        setCountries(countriesData.data.countries);
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

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${filePath}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: formData,
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
        imageUrl: "",
        imageFile: null,
        imagePreview: "",
        activities: [],
        optionalActivities: [],
        accommodations: [],
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

  // Handle day image upload
  const handleDayImageSelect = (
    dayIndex: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setItinerary((prev) =>
          prev.map((item, i) =>
            i === dayIndex
              ? {
                  ...item,
                  imageFile: file,
                  imagePreview: reader.result as string,
                }
              : item,
          ),
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const removeDayImage = (dayIndex: number) => {
    setItinerary((prev) =>
      prev.map((item, i) =>
        i === dayIndex
          ? { ...item, imageFile: null, imagePreview: "", imageUrl: "" }
          : item,
      ),
    );
  };

  // Activity management functions
  const addActivity = (dayIndex: number) => {
    setItinerary((prev) => {
      const newItinerary = [...prev];
      newItinerary[dayIndex].activities = [
        ...newItinerary[dayIndex].activities,
        {
          name: "",
          description: "",
          placeName: "",
          duration: "",
          icon: "MapPin",
        },
      ];
      return newItinerary;
    });
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    setItinerary((prev) => {
      const newItinerary = [...prev];
      newItinerary[dayIndex].activities.splice(activityIndex, 1);
      return newItinerary;
    });
  };

  const updateActivity = (
    dayIndex: number,
    activityIndex: number,
    field: keyof Activity,
    value: string,
  ) => {
    setItinerary((prev) => {
      const newItinerary = [...prev];
      newItinerary[dayIndex].activities[activityIndex] = {
        ...newItinerary[dayIndex].activities[activityIndex],
        [field]: value,
      };
      return newItinerary;
    });
  };

  // Optional activity management functions
  const addOptionalActivity = (dayIndex: number) => {
    setItinerary((prev) => {
      const newItinerary = [...prev];
      newItinerary[dayIndex].optionalActivities = [
        ...newItinerary[dayIndex].optionalActivities,
        {
          name: "",
          price: { amount: 0, currency: "USD" },
          place: "",
          description: "",
          duration: "",
          icon: "MapPin",
        },
      ];
      return newItinerary;
    });
  };

  const removeOptionalActivity = (dayIndex: number, activityIndex: number) => {
    setItinerary((prev) => {
      const newItinerary = [...prev];
      newItinerary[dayIndex].optionalActivities.splice(activityIndex, 1);
      return newItinerary;
    });
  };

  const updateOptionalActivity = (
    dayIndex: number,
    activityIndex: number,
    field: string,
    value: any,
  ) => {
    setItinerary((prev) => {
      const newItinerary = [...prev];
      if (field === "price.amount") {
        newItinerary[dayIndex].optionalActivities[activityIndex].price.amount =
          value;
      } else if (field === "price.currency") {
        newItinerary[dayIndex].optionalActivities[
          activityIndex
        ].price.currency = value;
      } else {
        newItinerary[dayIndex].optionalActivities[activityIndex] = {
          ...newItinerary[dayIndex].optionalActivities[activityIndex],
          [field]: value,
        };
      }
      return newItinerary;
    });
  };

  // Accommodation management functions
  const addAccommodation = (dayIndex: number) => {
    setItinerary((prev) => {
      const newItinerary = [...prev];
      newItinerary[dayIndex].accommodations = [
        ...newItinerary[dayIndex].accommodations,
        {
          name: "",
          type: "Hotel",
          rating: 3,
          description: "",
        },
      ];
      return newItinerary;
    });
  };

  const removeAccommodation = (
    dayIndex: number,
    accommodationIndex: number,
  ) => {
    setItinerary((prev) => {
      const newItinerary = [...prev];
      newItinerary[dayIndex].accommodations.splice(accommodationIndex, 1);
      return newItinerary;
    });
  };

  const updateAccommodation = (
    dayIndex: number,
    accommodationIndex: number,
    field: keyof Accommodation,
    value: string | number,
  ) => {
    setItinerary((prev) => {
      const newItinerary = [...prev];
      newItinerary[dayIndex].accommodations[accommodationIndex] = {
        ...newItinerary[dayIndex].accommodations[accommodationIndex],
        [field]: value,
      };
      return newItinerary;
    });
  };

  // Available Dates Functions
  const addAvailableDate = () => {
    setAvailableDates((prev) => [
      ...prev,
      {
        startDate: "",
        endDate: "",
        availableSpots: parseInt(formData.maxGroupSize) || 10,
        priceAmount: parseFloat(formData.priceAmount) || 0,
      },
    ]);
  };

  const removeAvailableDate = (index: number) => {
    setAvailableDates((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAvailableDate = (
    index: number,
    field: keyof AvailableDate,
    value: string | number,
  ) => {
    setAvailableDates((prev) =>
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

    if (images.length === 0) {
      alert("Please add at least one image");
      return;
    }

    try {
      setSubmitting(true);

      // Upload all images to Supabase
      const uploadedImages = await Promise.all(
        images.map(async (img) => {
          if (img.file) {
            const url = await uploadImageToSupabase(img.file);
            return {
              url,
              caption: img.caption,
              isPrimary: img.isPrimary,
            };
          }
          return null;
        }),
      );

      const validImages = uploadedImages.filter((img) => img !== null);

      // Upload day images
      const itineraryWithImages = await Promise.all(
        itinerary.map(async (day) => {
          let imageUrl = day.imageUrl || "";
          if (day.imageFile) {
            imageUrl = await uploadImageToSupabase(day.imageFile);
          }
          return {
            day: day.day,
            title: day.title,
            description: day.description,
            imageUrl,
            activities: day.activities,
            optionalActivities: day.optionalActivities,
            accommodations: day.accommodations,
          };
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
        physicalRating: {
          level: parseInt(formData.physicalRatingLevel),
        },
        price: {
          amount: parseFloat(formData.priceAmount),
          currency: formData.priceCurrency,
          discountPercent: parseFloat(formData.discountPercent),
        },
        travelStyle: formData.travelStyle,
        serviceLevel: "Standard",
        location: {
          startCity: formData.startCity,
          endCity: formData.endCity,
          visitedCities: visitedCitiesArray,
        },
        highlights: highlightsArray,
        images: validImages,
        itinerary: itineraryWithImages,
        startDates: availableDates.map((ad) => ({
          startDate: new Date(ad.startDate),
          endDate: new Date(ad.endDate),
          availableSpots: ad.availableSpots,
          price: {
            amount: ad.priceAmount,
            currency: formData.priceCurrency,
          },
          isActive: true,
        })),
        ageRequirement: {
          min: parseInt(formData.ageMin),
          max: parseInt(formData.ageMax),
        },
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
      };

      const response = await fetch(`${api.baseURL}/tours`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tourData),
      });

      if (response.ok) {
        alert("Tour created successfully!");
        router.push("/admin/tours-management");
      } else {
        const data = await response.json();
        alert(`Failed to create tour: ${data.message}`);
      }
    } catch (error) {
      console.error("Error creating tour:", error);
      alert("Failed to create tour. Please try again.");
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
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Create New Tour
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Fill in the details below to add a new tour
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tour Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="e.g., Himalayan Adventure Trek - Everest Base Camp"
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
                    placeholder="Brief summary"
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
                    placeholder="Detailed description"
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
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                    placeholder="12"
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
                    placeholder="7"
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
                    placeholder="6"
                  />
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
                    Start City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="startCity"
                    value={formData.startCity}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                    placeholder="Kathmandu"
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
                    placeholder="Kathmandu"
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
                    placeholder="Kathmandu, Lukla, Namche Bazaar"
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
                    placeholder="Reach Everest Base Camp&#10;Sunrise from Kala Patthar"
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
                    placeholder="0"
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
                    placeholder="99"
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
                  <p className="mt-1 text-xs text-gray-500">
                    PNG, JPG up to 10MB
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
                      <div className="absolute top-1 left-1 bg-blue-600 text-white px-2 py-0.5 rounded text-xs">
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
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {img.isPrimary ? "Primary" : "Set Primary"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {images.length === 0 && (
              <div className="text-center py-6 text-gray-500 text-sm">
                No images uploaded yet
              </div>
            )}
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
                  placeholder="1299.00"
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
                  placeholder="0"
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

            <div className="space-y-6">
              {itinerary.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className="border border-gray-200 rounded-lg p-6 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Day {day.day}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeItineraryDay(dayIndex)}
                      className="text-red-500 hover:text-red-700 text-sm bg-white px-2 py-1 rounded border"
                    >
                      Remove Day
                    </button>
                  </div>

                  {/* Basic day info */}
                  <div className="space-y-3 mb-6">
                    <input
                      type="text"
                      value={day.title}
                      onChange={(e) =>
                        updateItinerary(dayIndex, "title", e.target.value)
                      }
                      placeholder="Day title (e.g., Arrival in Paris)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900 bg-white"
                    />
                    <textarea
                      value={day.description}
                      onChange={(e) =>
                        updateItinerary(dayIndex, "description", e.target.value)
                      }
                      placeholder="Day description"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900 bg-white"
                    />

                    {/* Day Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Day Photo (Optional)
                      </label>
                      {day.imagePreview ? (
                        <div className="relative inline-block">
                          <img
                            src={day.imagePreview}
                            alt="Day preview"
                            className="w-32 h-32 object-cover rounded border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => removeDayImage(dayIndex)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
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
                        </div>
                      ) : (
                        <label className="inline-block cursor-pointer">
                          <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-gray-400 transition">
                            <svg
                              className="mx-auto h-8 w-8 text-gray-400"
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
                            <p className="mt-1 text-xs text-gray-600">
                              Upload photo
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleDayImageSelect(dayIndex, e)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Activities Section */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-md font-semibold text-gray-800">
                        Activities
                      </h4>
                      <button
                        type="button"
                        onClick={() => addActivity(dayIndex)}
                        className="bg-gray-800 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition"
                      >
                        + Add
                      </button>
                    </div>

                    <div className="space-y-3">
                      {day.activities.map((activity, actIndex) => (
                        <div
                          key={actIndex}
                          className="bg-white p-4 rounded border border-gray-200"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h5 className="text-sm font-medium text-gray-700">
                              Activity #{actIndex + 1}
                            </h5>
                            <button
                              type="button"
                              onClick={() => removeActivity(dayIndex, actIndex)}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={activity.name}
                              onChange={(e) =>
                                updateActivity(
                                  dayIndex,
                                  actIndex,
                                  "name",
                                  e.target.value,
                                )
                              }
                              placeholder="Activity name"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                            />
                            <input
                              type="text"
                              value={activity.placeName}
                              onChange={(e) =>
                                updateActivity(
                                  dayIndex,
                                  actIndex,
                                  "placeName",
                                  e.target.value,
                                )
                              }
                              placeholder="Place name"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                            />
                            <input
                              type="text"
                              value={activity.duration}
                              onChange={(e) =>
                                updateActivity(
                                  dayIndex,
                                  actIndex,
                                  "duration",
                                  e.target.value,
                                )
                              }
                              placeholder="Duration (e.g., 2 hours)"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                            />
                            <select
                              value={activity.icon}
                              onChange={(e) =>
                                updateActivity(
                                  dayIndex,
                                  actIndex,
                                  "icon",
                                  e.target.value,
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                            >
                              <option value="MapPin">📍 Place</option>
                              <option value="Bus">🚌 Bus</option>
                              <option value="Car">🚗 Car</option>
                              <option value="Airplane">✈️ Airplane</option>
                              <option value="Train">🚂 Train</option>
                              <option value="Boat">🚢 Boat</option>
                              <option value="Coffee">☕ Free Time</option>
                              <option value="Camera">📷 Sightseeing</option>
                              <option value="Mountain">🏔️ Adventure</option>
                              <option value="Trees">🌳 Nature</option>
                              <option value="Utensils">🍽️ Dining</option>
                              <option value="Clock">🕐 Schedule</option>
                              <option value="Heart">❤️ Special</option>
                            </select>
                            <textarea
                              value={activity.description}
                              onChange={(e) =>
                                updateActivity(
                                  dayIndex,
                                  actIndex,
                                  "description",
                                  e.target.value,
                                )
                              }
                              placeholder="Activity description"
                              rows={2}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 md:col-span-2"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Optional Activities Section */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-md font-semibold text-gray-800">
                        Optional Activities
                      </h4>
                      <button
                        type="button"
                        onClick={() => addOptionalActivity(dayIndex)}
                        className="bg-gray-800 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition"
                      >
                        + Add
                      </button>
                    </div>

                    <div className="space-y-3">
                      {day.optionalActivities.map((optActivity, optIndex) => (
                        <div
                          key={optIndex}
                          className="bg-white p-4 rounded border border-gray-200"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h5 className="text-sm font-medium text-gray-700">
                              Optional Activity #{optIndex + 1}
                            </h5>
                            <button
                              type="button"
                              onClick={() =>
                                removeOptionalActivity(dayIndex, optIndex)
                              }
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            <input
                              type="text"
                              value={optActivity.name}
                              onChange={(e) =>
                                updateOptionalActivity(
                                  dayIndex,
                                  optIndex,
                                  "name",
                                  e.target.value,
                                )
                              }
                              placeholder="Optional activity name"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                            />
                            <input
                              type="text"
                              value={optActivity.place}
                              onChange={(e) =>
                                updateOptionalActivity(
                                  dayIndex,
                                  optIndex,
                                  "place",
                                  e.target.value,
                                )
                              }
                              placeholder="Place"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                            />
                            <input
                              type="text"
                              value={optActivity.duration}
                              onChange={(e) =>
                                updateOptionalActivity(
                                  dayIndex,
                                  optIndex,
                                  "duration",
                                  e.target.value,
                                )
                              }
                              placeholder="Duration"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                            />
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={optActivity.price.amount}
                                onChange={(e) =>
                                  updateOptionalActivity(
                                    dayIndex,
                                    optIndex,
                                    "price.amount",
                                    parseFloat(e.target.value),
                                  )
                                }
                                placeholder="Price"
                                step="0.01"
                                min="0"
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                              />
                              <select
                                value={optActivity.price.currency}
                                onChange={(e) =>
                                  updateOptionalActivity(
                                    dayIndex,
                                    optIndex,
                                    "price.currency",
                                    e.target.value,
                                  )
                                }
                                className="w-16 px-1 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                              >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                                <option value="INR">INR</option>
                              </select>
                            </div>
                            <select
                              value={optActivity.icon}
                              onChange={(e) =>
                                updateOptionalActivity(
                                  dayIndex,
                                  optIndex,
                                  "icon",
                                  e.target.value,
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                            >
                              <option value="MapPin">📍 Place</option>
                              <option value="Bus">🚌 Bus</option>
                              <option value="Car">🚗 Car</option>
                              <option value="Airplane">✈️ Airplane</option>
                              <option value="Train">🚂 Train</option>
                              <option value="Boat">🚢 Boat</option>
                              <option value="Coffee">☕ Free Time</option>
                              <option value="Camera">📷 Sightseeing</option>
                              <option value="Mountain">🏔️ Adventure</option>
                              <option value="Trees">🌳 Nature</option>
                              <option value="Utensils">🍽️ Dining</option>
                              <option value="Clock">🕐 Schedule</option>
                              <option value="Heart">❤️ Special</option>
                            </select>
                            <textarea
                              value={optActivity.description}
                              onChange={(e) =>
                                updateOptionalActivity(
                                  dayIndex,
                                  optIndex,
                                  "description",
                                  e.target.value,
                                )
                              }
                              placeholder="Optional activity description"
                              rows={2}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 lg:col-span-3"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Accommodation Section */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-md font-semibold text-gray-800">
                        Accommodation
                      </h4>
                      <button
                        type="button"
                        onClick={() => addAccommodation(dayIndex)}
                        className="bg-gray-800 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition"
                      >
                        + Add
                      </button>
                    </div>

                    <div className="space-y-3">
                      {day.accommodations.map((accommodation, accIndex) => (
                        <div
                          key={accIndex}
                          className="bg-white p-4 rounded border border-gray-200"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h5 className="text-sm font-medium text-gray-700">
                              Accommodation #{accIndex + 1}
                            </h5>
                            <button
                              type="button"
                              onClick={() =>
                                removeAccommodation(dayIndex, accIndex)
                              }
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input
                              type="text"
                              value={accommodation.name}
                              onChange={(e) =>
                                updateAccommodation(
                                  dayIndex,
                                  accIndex,
                                  "name",
                                  e.target.value,
                                )
                              }
                              placeholder="Accommodation name"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                            />
                            <select
                              value={accommodation.type}
                              onChange={(e) =>
                                updateAccommodation(
                                  dayIndex,
                                  accIndex,
                                  "type",
                                  e.target.value,
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                            >
                              <option value="Hotel">Hotel</option>
                              <option value="Lounge">Lounge</option>
                              <option value="Cottage">Cottage</option>
                              <option value="Guestroom">Guestroom</option>
                              <option value="Camp">Camp</option>
                            </select>
                            <select
                              value={accommodation.rating || 3}
                              onChange={(e) =>
                                updateAccommodation(
                                  dayIndex,
                                  accIndex,
                                  "rating",
                                  parseInt(e.target.value),
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                            >
                              <option value={1}>⭐ 1 Star</option>
                              <option value={2}>⭐⭐ 2 Stars</option>
                              <option value={3}>⭐⭐⭐ 3 Stars</option>
                              <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                              <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                            </select>
                            <textarea
                              value={accommodation.description || ""}
                              onChange={(e) =>
                                updateAccommodation(
                                  dayIndex,
                                  accIndex,
                                  "description",
                                  e.target.value,
                                )
                              }
                              placeholder="Accommodation description (optional)"
                              rows={2}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 md:col-span-3"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {itinerary.length === 0 && (
              <div className="text-center py-6 text-gray-500 text-sm">
                No itinerary days added yet
              </div>
            )}
          </div>

          {/* Available Dates Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Available Dates
              </h2>
              <button
                type="button"
                onClick={addAvailableDate}
                className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition"
              >
                + Add Date
              </button>
            </div>

            <div className="space-y-3">
              {availableDates.map((ad, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-md p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Date Range #{index + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeAvailableDate(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input
                      type="date"
                      value={ad.startDate}
                      onChange={(e) =>
                        updateAvailableDate(index, "startDate", e.target.value)
                      }
                      placeholder="Start Date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                    />
                    <input
                      type="date"
                      value={ad.endDate}
                      onChange={(e) =>
                        updateAvailableDate(index, "endDate", e.target.value)
                      }
                      placeholder="End Date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                    />
                    <input
                      type="number"
                      value={ad.availableSpots}
                      onChange={(e) =>
                        updateAvailableDate(
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
                      value={ad.priceAmount}
                      onChange={(e) =>
                        updateAvailableDate(
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

            {availableDates.length === 0 && (
              <div className="text-center py-6 text-gray-500 text-sm">
                No available dates added yet
              </div>
            )}
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
                  Creating...
                </>
              ) : (
                <>Create Tour</>
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
