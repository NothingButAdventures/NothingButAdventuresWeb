"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { uploadTourImage } from "@/lib/firebase";
import ImagePickerModal from "@/components/ImagePickerModal";
import CreateActivityModal from "@/components/CreateActivityModal";

interface Country {
  _id: string;
  name: string;
  id?: string;
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

interface ActivityOption {
  _id: string;
  title: string;
  description?: string;
  destination?: { _id?: string; name?: string } | string;
  travelStyle?: { _id?: string; name?: string } | string;
  location?: string;
  isFree?: boolean;
  price?: number;
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
  activities: any[];
  optionalActivities: any[];
  accommodations: Accommodation[];
  meals: string;
  importantNote?: string;
}

interface AvailableDate {
  startDate: string;
  endDate: string;
  availableSpots: number;
  discount: string;
}

interface TravelStyle {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface PhysicalRatingOption {
  _id: string;
  name: string;
  level: number;
  isActive: boolean;
}

interface TripTypeOption {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface InterestOption {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface DiscountOption {
  _id: string;
  name: string;
  percentage: number;
  color?: string;
  isActive: boolean;
}

export default function EditTourPage() {
  const router = useRouter();
  const params = useParams();
  const tourId = params?.id as string;
  const [countries, setCountries] = useState<Country[]>([]);
  const [continents, setContinents] = useState<any[]>([]);
  const [showDestinationPopup, setShowDestinationPopup] = useState(false);
  const [expandedContinent, setExpandedContinent] = useState<string | null>(null);
  const [travelStyles, setTravelStyles] = useState<TravelStyle[]>([]);
  const [activityOptions, setActivityOptions] = useState<ActivityOption[]>([]);
  const [activitySearchTerms, setActivitySearchTerms] = useState<Record<string, string>>({});
  const [physicalRatings, setPhysicalRatings] = useState<PhysicalRatingOption[]>([]);
  const [tripTypes, setTripTypes] = useState<TripTypeOption[]>([]);
  const [interestsOptions, setInterestsOptions] = useState<InterestOption[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [discounts, setDiscounts] = useState<DiscountOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Destinations for the selected country
  const [destinations, setDestinations] = useState<any[]>([]);
  const [showLocationPopup, setShowLocationPopup] = useState<{ dayIndex: number } | null>(null);
  const [showCityPopup, setShowCityPopup] = useState<'start' | 'end' | null>(null);
  const [showActivityPopup, setShowActivityPopup] = useState<{ dayIndex: number; activityIndex: number; isOptional: boolean } | null>(null);
  const [locationSearch, setLocationSearch] = useState("");
  const [addingLocation, setAddingLocation] = useState(false);
  const [activitySearch, setActivitySearchInput] = useState("");
  const [showCreateActivityModal, setShowCreateActivityModal] = useState(false);

  // Image uploads
  const [images, setImages] = useState<ImageUpload[]>([]);

  // Image Picker Modal State
  const [imagePickerModal, setImagePickerModal] = useState<{
    isOpen: boolean;
    target: "main" | "description" | "map";
    multiple: boolean;
  }>({
    isOpen: false,
    target: "main",
    multiple: false,
  });

  // Description Image
  const [descriptionImage, setDescriptionImage] = useState<{
    file: File | null;
    preview: string;
    uploading: boolean;
    url: string;
  }>({
    file: null,
    preview: "",
    uploading: false,
    url: "",
  });

  // Itinerary Map Image
  const [itineraryMapImage, setItineraryMapImage] = useState<{
    file: File | null;
    preview: string;
    uploading: boolean;
    url: string;
  }>({
    file: null,
    preview: "",
    uploading: false,
    url: "",
  });

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
    maxGroupSize: "",
    physicalRatingLevel: "",
    priceAmount: "",
    priceCurrency: "USD",
    bookingType: "Percentage",
    bookingPercentage: "20",
    bookingAmount: "",
    ownRoomPrice: "",
    travelStyle: "",
    tripType: "",
    startCity: "",
    endCity: "",
    visitedCities: "",
    highlights: "",
    whatsIncluded: "",
    transportation: "",
    staffExperts: "",
    accommodation: "",
    ageMin: "0",
    ageMax: "0",
    isFeatured: false,
    isActive: true,
    ownRoomAvailable: false,
    wifiAvailable: false,
  });

  useEffect(() => {
    checkAuthAndFetchData();
  }, [tourId]);

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

      const continentsResponse = await fetch(`${api.baseURL}/continents`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (continentsResponse.ok) {
        const continentsData = await continentsResponse.json();
        const fetchedContinents = continentsData.data.continents || [];
        setContinents(fetchedContinents);
        const flatCountries = fetchedContinents.flatMap((c: any) => c.countries || []);
        setCountries(flatCountries);
      }

      // Fetch travel styles
      const travelStylesResponse = await fetch(`${api.baseURL}/travel-styles`);
      if (travelStylesResponse.ok) {
        const travelStylesData = await travelStylesResponse.json();
        setTravelStyles(travelStylesData.data.travelStyles || []);
      }

      // Fetch physical ratings
      const physicalRatingsResponse = await fetch(`${api.baseURL}/physical-ratings`);
      if (physicalRatingsResponse.ok) {
        const physicalRatingsData = await physicalRatingsResponse.json();
        setPhysicalRatings(physicalRatingsData.data.physicalRatings || []);
      }

      // Fetch trip types
      const tripTypesResponse = await fetch(`${api.baseURL}/trip-types`);
      if (tripTypesResponse.ok) {
        const tripTypesData = await tripTypesResponse.json();
        setTripTypes(tripTypesData.data.tripTypes || []);
      }

      // Fetch interests
      const interestsResponse = await fetch(`${api.baseURL}${api.endpoints.interests.getAll}`);
      if (interestsResponse.ok) {
        const interestsData = await interestsResponse.json();
        setInterestsOptions(interestsData.data.interests || []);
      }

      // Fetch discounts
      const discountsResponse = await fetch(`${api.baseURL}/discounts`);
      if (discountsResponse.ok) {
        const discountsData = await discountsResponse.json();
        setDiscounts(discountsData.data.discounts || []);
      }

      // Fetch activities for itinerary selector
      const activitiesResponse = await fetch(`${api.baseURL}/activities?limit=500`);
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setActivityOptions(activitiesData.data.activities || []);
      }

      // Fetch tour data
      const tourResponse = await fetch(`${api.baseURL}/tours/${tourId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (tourResponse.ok) {
        const tourData = await tourResponse.json();
        const tour = tourData.data.tour;

        // Populate form data
        setFormData({
          name: tour.name || "",
          summary: tour.summary || "",
          description: tour.description || "",
          country: tour.country?._id || tour.country || "",
          durationDays: tour.duration?.days?.toString() || "",
          maxGroupSize: tour.maxGroupSize?.toString() || "",
          physicalRatingLevel: tour.physicalRating?.level?.toString() || "3",
          priceAmount: tour.price?.amount?.toString() || "",
          priceCurrency: tour.price?.currency || "USD",
          bookingType: tour.price?.bookingType || "Percentage",
          bookingPercentage: tour.price?.bookingPercentage?.toString() || "20",
          bookingAmount: tour.price?.bookingAmount?.toString() || "",
          ownRoomPrice: tour.price?.ownRoomPrice?.toString() || "",
          travelStyle: tour.travelStyle || "",
          tripType: tour.tripType || "",
          startCity: tour.location?.startCity || "",
          endCity: tour.location?.endCity || "",
          visitedCities: tour.location?.visitedCities?.join(", ") || "",
          highlights: tour.highlights?.join("\n") || "",
          whatsIncluded: tour.whatsIncluded || "",
          transportation: tour.transportation || "",
          staffExperts: tour.staffExperts || "",
          accommodation: tour.accommodation || "",
          ageMin: tour.ageRequirement?.min?.toString() || "0",
          ageMax: tour.ageRequirement?.max?.toString() || "0",
          isFeatured: tour.isFeatured || false,
          isActive: tour.isActive !== undefined ? tour.isActive : true,
          ownRoomAvailable: tour.ownRoomAvailable || false,
          wifiAvailable: tour.wifiAvailable || false,
        });

        setSelectedInterests(tour.interests || []);

        // Load existing description image
        if (tour.descriptionImage) {
          setDescriptionImage({
            file: null,
            preview: tour.descriptionImage,
            uploading: false,
            url: tour.descriptionImage,
          });
        }

        // Load existing itinerary map image
        if (tour.itineraryMapImage) {
          setItineraryMapImage({
            file: null,
            preview: tour.itineraryMapImage,
            uploading: false,
            url: tour.itineraryMapImage,
          });
        }

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
              importantNote: day.importantNote || "",
              activities: day.activities || [],
              optionalActivities: day.optionalActivities || [],
              accommodations: day.accommodations?.length > 0 ? day.accommodations : [{ name: "", type: "Hotel" }],
              meals: day.meals && typeof day.meals === 'object' ? [
                day.meals.breakfast ? "Breakfast" : "",
                day.meals.lunch ? "Lunch" : "",
                day.meals.dinner ? "Dinner" : ""
              ].filter(Boolean).join(",") : (day.meals || ""),
            })),
          );
        }

        // Load start dates
        if (tour.startDates && tour.startDates.length > 0) {
          setAvailableDates(
            tour.startDates.map((sd: any) => ({
              startDate: sd.startDate
                ? new Date(sd.startDate).toISOString().split("T")[0]
                : "",
              endDate: sd.endDate
                ? new Date(sd.endDate).toISOString().split("T")[0]
                : "",
              availableSpots: sd.availableSpots || 0,
              discount: sd.discount || "",
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

  const fetchDestinations = async (countryId: string) => {
    try {
      const response = await fetch(`${api.baseURL}/countries/${countryId}`);
      const data = await response.json();
      if (data.status === "success") {
        setDestinations(data.data.country.destinations || []);
      }
    } catch (error) {
      console.error("Error fetching destinations:", error);
    }
  };

  const handleAddLocation = async () => {
    if (!locationSearch.trim() || !formData.country) return;
    setAddingLocation(true);
    try {
      const token = localStorage.getItem("token");
      const updatedDestinations = [
        ...destinations,
        { name: locationSearch.trim(), description: "" },
      ];

      const response = await fetch(`${api.baseURL}/countries/${formData.country}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ destinations: updatedDestinations }),
      });

      const data = await response.json();
      if (data.status === "success") {
        setDestinations(data.data.country.destinations || []);

        // Handle city popup
        if (showCityPopup) {
          if (showCityPopup === 'start') {
            setFormData(prev => ({ ...prev, startCity: locationSearch.trim() }));
          } else {
            setFormData(prev => ({ ...prev, endCity: locationSearch.trim() }));
          }
          setShowCityPopup(null);
        }

        // Handle location popup (itinerary)
        if (showLocationPopup) {
          const dayIndex = showLocationPopup.dayIndex;
          const currentTags = itinerary[dayIndex].title ? itinerary[dayIndex].title.split(",").filter(t => t.trim()) : [];
          if (!currentTags.includes(locationSearch.trim()) && currentTags.length < 2) {
            const newTitle = [...currentTags, locationSearch.trim()].join(",");
            updateItinerary(dayIndex, "title", newTitle);
          }
          setShowLocationPopup(null);
        }

        setLocationSearch("");
      } else {
        alert("Failed to add location: " + data.message);
      }
    } catch (error) {
      console.error("Error adding location:", error);
      alert("Failed to add location");
    } finally {
      setAddingLocation(false);
    }
  };

  useEffect(() => {
    if (formData.country) {
      fetchDestinations(formData.country);
    } else {
      setDestinations([]);
    }
  }, [formData.country]);

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

  const handleImagePickerSelect = (urls: string[]) => {
    const target = imagePickerModal.target;

    if (target === "main") {
      urls.forEach((url) => {
        setImages((prev) => [
          ...prev,
          {
            file: null,
            preview: url,
            caption: "",
            isPrimary: prev.length === 0,
            uploading: false,
            url: url,
          },
        ]);
      });
    } else if (target === "description") {
      setDescriptionImage({
        file: null,
        preview: urls[0],
        uploading: false,
        url: urls[0],
      });
    } else if (target === "map") {
      setItineraryMapImage({
        file: null,
        preview: urls[0],
        uploading: false,
        url: urls[0],
      });
    }
  };

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    return await uploadTourImage(file);
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

  // Description Image Functions
  const handleDescriptionImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDescriptionImage({
          file,
          preview: reader.result as string,
          uploading: false,
          url: "",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeDescriptionImage = () => {
    setDescriptionImage({
      file: null,
      preview: "",
      uploading: false,
      url: "",
    });
  };

  // Itinerary Functions
  const addItineraryDay = () => {
    setItinerary((prev) => [
      ...prev,
      {
        day: prev.length + 1,
        title: "",
        description: "",
        activities: [],
        optionalActivities: [],
        accommodations: [{ name: "", type: "Hotel" }],
        meals: "",
        importantNote: "",
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

  // Itinerary Map Image Functions
  const handleItineraryMapImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setItineraryMapImage({
          file,
          preview: reader.result as string,
          uploading: false,
          url: "",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeItineraryMapImage = () => {
    setItineraryMapImage({
      file: null,
      preview: "",
      uploading: false,
      url: "",
    });
  };

  // Activity management functions
  const addActivity = (dayIndex: number) => {
    setItinerary((prev) => {
      const newItinerary = [...prev];
      newItinerary[dayIndex].activities = [
        ...newItinerary[dayIndex].activities,
        {
          title: "",
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

  const getActivitySlotKey = (dayIndex: number, activityIndex: number) =>
    `${dayIndex}-${activityIndex}`;

  const setActivitySearch = (
    dayIndex: number,
    activityIndex: number,
    value: string,
  ) => {
    const key = getActivitySlotKey(dayIndex, activityIndex);
    setActivitySearchTerms((prev) => ({ ...prev, [key]: value }));
  };

  const getFilteredActivityOptions = (searchValue: string) => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return activityOptions.filter((option) => {
      if (!normalizedSearch) return true;

      const destinationName =
        typeof option.destination === "string"
          ? ""
          : option.destination?.name || "";
      const travelStyleName =
        typeof option.travelStyle === "string"
          ? ""
          : option.travelStyle?.name || "";

      return [option.title, option.description || "", destinationName, travelStyleName]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  };

  const applyActivityOption = (
    dayIndex: number,
    activityIndex: number,
    optionId: string,
    isOptional: boolean = false
  ) => {
    const selected = activityOptions.find((option) => option._id === optionId);
    if (!selected) return;

    setItinerary((prev) => {
      const newItinerary = [...prev];
      if (isOptional) {
        newItinerary[dayIndex].optionalActivities[activityIndex] = selected;
      } else {
        newItinerary[dayIndex].activities[activityIndex] = selected;
      }
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
        discount: "",
      },
    ]);
  };

  const removeAvailableDate = (index: number) => {
    setAvailableDates((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAvailableDate = (
    index: number,
    field: keyof AvailableDate,
    value: string | number | boolean,
  ) => {
    setAvailableDates((prev) => {
      const updated = prev.map((item, i) => (i === index ? { ...item, [field]: value } : item));
      
      // Auto-calculate end date if start date is updated and duration is set
      if (field === "startDate" && value) {
        const days = parseInt(formData.durationDays, 10);
        if (!isNaN(days) && days > 0) {
          const [year, month, day] = (value as string).split('-').map(Number);
          if (year && month && day) {
            const start = new Date(year, month - 1, day);
            start.setDate(start.getDate() + (days - 1));
            
            const newYear = start.getFullYear();
            const newMonth = String(start.getMonth() + 1).padStart(2, '0');
            const newDay = String(start.getDate()).padStart(2, '0');
            
            updated[index].endDate = `${newYear}-${newMonth}-${newDay}`;
          }
        }
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.country ||
      !formData.physicalRatingLevel ||
      !formData.travelStyle ||
      !formData.tripType ||
      !formData.priceAmount
    ) {
      alert("Please fill in all required fields: Tour Name, Destination, Physical Rating, Travel Style, Trip Type, and Base Price");
      return;
    }

    try {
      setSubmitting(true);

      // Upload all images to Firebase Storage
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
          return {
            url: img.url,
            caption: img.caption,
            isPrimary: img.isPrimary,
          };
        }),
      );

      const validImages = uploadedImages.filter((img) => img !== null);

      // Upload description image to Firebase if a new file was selected
      let descriptionImageUrl = descriptionImage.url;
      if (descriptionImage.file) {
        descriptionImageUrl = await uploadImageToSupabase(descriptionImage.file);
      }

      // Upload itinerary map image to Firebase if a new file was selected
      let itineraryMapImageUrl = itineraryMapImage.url;
      if (itineraryMapImage.file) {
        itineraryMapImageUrl = await uploadImageToSupabase(itineraryMapImage.file);
      }

      // Upload day images
      const itineraryWithImages = await Promise.all(
        itinerary.map(async (day) => {
          return {
            day: day.day,
            title: day.title,
            description: day.description,
            importantNote: day.importantNote,
            activities: day.activities.map(act => act._id || (typeof act === "string" ? act : null)).filter(Boolean),
            optionalActivities: day.optionalActivities.map(act => act._id || (typeof act === "string" ? act : null)).filter(Boolean),
            accommodations: day.accommodations,
            meals: {
              breakfast: day.meals.includes("Breakfast"),
              lunch: day.meals.includes("Lunch"),
              dinner: day.meals.includes("Dinner"),
            },
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

        descriptionImage: descriptionImageUrl,
        itineraryMapImage: itineraryMapImageUrl,
        country: formData.country || undefined,
        duration: {
          days: parseInt(formData.durationDays) || undefined,
        },
        maxGroupSize: parseInt(formData.maxGroupSize) || undefined,
        physicalRating: {
          level: parseInt(formData.physicalRatingLevel) || undefined,
        },
        price: {
          amount: parseFloat(formData.priceAmount) || undefined,
          currency: formData.priceCurrency || "USD",
          bookingType: formData.bookingType,
          bookingPercentage: parseFloat(formData.bookingPercentage) || 20,
          bookingAmount: parseFloat(formData.bookingAmount) || 0,
          ownRoomPrice: parseFloat(formData.ownRoomPrice) || 0,
        },
        travelStyle: formData.travelStyle || undefined,
        tripType: formData.tripType || undefined,
        interests: selectedInterests,
        serviceLevel: "Standard",
        location: {
          startCity: formData.startCity || undefined,
          endCity: formData.endCity || undefined,
          visitedCities: visitedCitiesArray,
        },
        highlights: highlightsArray,
        whatsIncluded: formData.whatsIncluded,
        transportation: formData.transportation,
        staffExperts: formData.staffExperts,
        accommodation: formData.accommodation,
        images: validImages,
        itinerary: itineraryWithImages,
        startDates: availableDates.map((ad) => ({
          startDate: ad.startDate ? new Date(ad.startDate) : undefined,
          endDate: ad.endDate ? new Date(ad.endDate) : undefined,
          availableSpots: parseInt(formData.maxGroupSize) || undefined,
          discount: ad.discount || undefined,
          isActive: true,
        })).filter(ad => ad.startDate && ad.endDate),
        ownRoomAvailable: formData.ownRoomAvailable,
        ageRequirement: {
          min: parseInt(formData.ageMin) || 0,
          max: parseInt(formData.ageMax) || 99,
        },
        wifiAvailable: formData.wifiAvailable,
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
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Edit Tour
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Update tour details below
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
                    Itinerary Map Image
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Upload a map image for the full itinerary view
                  </p>

                  {!itineraryMapImage.preview ? (
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-gray-400 transition"
                      onClick={() => setImagePickerModal({ isOpen: true, target: "map", multiple: false })}
                    >
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
                      <p className="mt-1 text-sm text-gray-600">
                        Click to select or upload map image
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={itineraryMapImage.preview}
                        alt="Map preview"
                        className="w-full h-48 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={removeItineraryMapImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                      >
                        <svg
                          className="w-4 h-4"
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
                  )}
                </div>



                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                    placeholder="Detailed description"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description Image
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Upload an image that will be displayed in the tour detail page
                  </p>

                  {!descriptionImage.preview ? (
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-gray-400 transition"
                      onClick={() => setImagePickerModal({ isOpen: true, target: "description", multiple: false })}
                    >
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
                      <p className="mt-1 text-sm text-gray-600">
                        Click to select or upload description image
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={descriptionImage.preview}
                        alt="Description preview"
                        className="w-full h-48 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={removeDescriptionImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                      >
                        <svg
                          className="w-4 h-4"
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
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowDestinationPopup(true)}
                    className="w-full text-left px-3 py-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900 bg-white flex items-center justify-between shadow-sm hover:border-gray-400 transition"
                  >
                    <span className={formData.country ? "text-gray-900 font-medium" : "text-gray-400"}>
                      {formData.country
                        ? countries.find((c) => c._id === formData.country || c.id === formData.country)?.name || "Select destination"
                        : "Select destination"}
                    </span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <input type="hidden" name="country" value={formData.country} required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Group Size
                  </label>
                  <input
                    type="number"
                    name="maxGroupSize"
                    value={formData.maxGroupSize}
                    onChange={handleChange}
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                    placeholder="12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    name="durationDays"
                    value={formData.durationDays}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                    placeholder="7"
                  />
                </div>



                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Physical Rating{" "} <span className="text-red-500">*</span>

                  </label>
                  <select
                    required
                    name="physicalRatingLevel"
                    value={formData.physicalRatingLevel}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                  >
                    <option value="">Select physical rating...</option>
                    {physicalRatings.map((rating) => (
                      <option key={rating._id} value={rating.level}>
                        {rating.level} - {rating.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Travel Style <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    name="travelStyle"
                    value={formData.travelStyle}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                  >
                    <option value="">Select travel style...</option>
                    {travelStyles.map((style) => (
                      <option key={style._id} value={style.name}>
                        {style.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trip Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    name="tripType"
                    value={formData.tripType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                  >
                    <option value="">Select trip type...</option>
                    {tripTypes.map((type) => (
                      <option key={type._id} value={type.name}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Interests
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Select interests/categories related to this tour (click below to add multiple)
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedInterests.map((interest) => (
                      <span
                        key={interest}
                        className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-200"
                      >
                        {interest}
                        <button
                          type="button"
                          onClick={() => setSelectedInterests(selectedInterests.filter((i) => i !== interest))}
                          className="hover:bg-blue-100 rounded-full p-0.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                    {selectedInterests.length === 0 && (
                      <span className="text-sm text-gray-400 italic">No interests selected</span>
                    )}
                  </div>

                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val && !selectedInterests.includes(val)) {
                        setSelectedInterests([...selectedInterests, val]);
                      }
                      e.target.value = "";
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900 bg-white"
                  >
                    <option value="">Add interest...</option>
                    {interestsOptions
                      .filter((i) => !selectedInterests.includes(i.name))
                      .map((interest) => (
                        <option key={interest._id} value={interest.name}>
                          {interest.name}
                        </option>
                      ))}
                  </select>
                </div>

                {formData.country && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start City
                      </label>
                      <input
                        type="text"
                        name="startCity"
                        value={formData.startCity}
                        onClick={() => setShowCityPopup('start')}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900 cursor-pointer"
                        placeholder="Select Start City"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End City
                      </label>
                      <input
                        type="text"
                        name="endCity"
                        value={formData.endCity}
                        onClick={() => setShowCityPopup('end')}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900 cursor-pointer"
                        placeholder="Select End City"
                      />
                    </div>
                  </>
                )}



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



                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transportation
                  </label>
                  <textarea
                    name="transportation"
                    value={formData.transportation}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                    placeholder="Train, local bus, private vehicle, auto-rickshaw, small riverboat, plane."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Staff &amp; Experts
                  </label>
                  <textarea
                    name="staffExperts"
                    value={formData.staffExperts}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                    placeholder="CEO (Chief Experience Officer) throughout, local guides."
                  />
                </div>





                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age Requirements
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-24">
                      <input
                        type="number"
                        name="ageMin"
                        value={formData.ageMin}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                        placeholder="Min"
                      />
                    </div>
                    <span className="text-gray-400">to</span>
                    <div className="w-24">
                      <input
                        type="number"
                        name="ageMax"
                        value={formData.ageMax}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wifi Availability
                  </label>
                  <div className="flex items-center gap-6 mt-1">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="wifiAvailable"
                        checked={formData.wifiAvailable === true}
                        onChange={() => setFormData({ ...formData, wifiAvailable: true })}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 font-medium">Yes</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="wifiAvailable"
                        checked={formData.wifiAvailable === false}
                        onChange={() => setFormData({ ...formData, wifiAvailable: false })}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 font-medium">No</span>
                    </label>
                  </div>
                </div>



                <div className="md:col-span-1">
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
                      Featured Tour
                    </label>
                  </div>
                </div>

                <div className="md:col-span-1">
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="ownRoomAvailable"
                      name="ownRoomAvailable"
                      checked={formData.ownRoomAvailable}
                      onChange={(e) => setFormData(prev => ({ ...prev, ownRoomAvailable: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="ownRoomAvailable" className="text-sm font-medium text-gray-700">
                      Own Room (Solo Supplement) Available
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
              <div
                className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-gray-400 transition"
                onClick={() => setImagePickerModal({ isOpen: true, target: "main", multiple: true })}
              >
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
                  Click to select or upload images
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Select from library or upload from device
                </p>
              </div>
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
                      className={`w-full py-1 rounded text-xs transition ${img.isPrimary
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
                  required
                  type="number"
                  name="priceAmount"
                  value={formData.priceAmount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                  placeholder="1299.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  name="priceCurrency"
                  value={formData.priceCurrency}
                  onChange={handleChange}
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
                  Booking Type
                </label>
                <select
                  name="bookingType"
                  value={formData.bookingType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                >
                  <option value="Percentage">Percentage</option>
                  <option value="Amount">Amount</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.bookingType === "Percentage" ? "Booking Percentage %" : "Booking Amount"}
                </label>
                <input
                  type="number"
                  name={formData.bookingType === "Percentage" ? "bookingPercentage" : "bookingAmount"}
                  value={formData.bookingType === "Percentage" ? formData.bookingPercentage : formData.bookingAmount}
                  onChange={handleChange}
                  min="0"
                  max={formData.bookingType === "Percentage" ? "100" : undefined}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                  placeholder={formData.bookingType === "Percentage" ? "20" : "500"}
                />
              </div>

            </div>
          </div>

          {/* Add-ons Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Add-ons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add your own room price
                </label>
                <input
                  type="number"
                  name="ownRoomPrice"
                  value={formData.ownRoomPrice}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Itinerary Section */}
          {formData.country && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Itinerary
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
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(day.title ? day.title.split(",").filter(t => t.trim()) : []).map((tag, tagIndex) => (
                          <span key={tagIndex} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium border border-blue-200">
                            {tag}
                            <button
                              type="button"
                              onClick={() => {
                                const currentTags = day.title.split(",").filter(t => t.trim());
                                currentTags.splice(tagIndex, 1);
                                updateItinerary(dayIndex, "title", currentTags.join(","));
                              }}
                              className="hover:text-blue-900"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ))}
                        {(day.title ? day.title.split(",").filter(t => t.trim()).length : 0) < 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowLocationPopup({ dayIndex });
                              setLocationSearch("");
                            }}
                            className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200 hover:bg-gray-200 transition"
                          >
                            + Add Location Tag
                          </button>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Day Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={day.description}
                          onChange={(e) =>
                            updateItinerary(dayIndex, "description", e.target.value)
                          }
                          placeholder="Day description"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Important Note (Optional)
                        </label>
                        <textarea
                          value={day.importantNote || ""}
                          onChange={(e) =>
                            updateItinerary(dayIndex, "importantNote", e.target.value)
                          }
                          placeholder="Important note (Optional)"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900 bg-white"
                        />
                      </div>
                    </div>

                    {/* Activities Section */}
                    {(day.title ? day.title.split(",").filter(t => t.trim()).length : 0) > 0 && (
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-md font-semibold text-gray-800">
                            Activities
                          </h4>
                        </div>

                        <div className="space-y-3">
                          {day.activities.map((activity, actIndex) => (
                            <div
                              key={actIndex}
                              className="bg-white p-4 rounded border border-gray-200"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <h5 className="text-sm font-semibold text-gray-800">
                                  {activity.title || activity.name || `Activity #${actIndex + 1}`}
                                </h5>
                                <button
                                  type="button"
                                  onClick={() => removeActivity(dayIndex, actIndex)}
                                  className="text-red-500 hover:text-red-700 text-xs"
                                >
                                  Remove
                                </button>
                              </div>

                              <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                                <p className="text-xs text-gray-500 mb-2">
                                  Select activity name only. Other details are auto-filled from Admin Activities.
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowActivityPopup({ dayIndex, activityIndex: actIndex, isOptional: false });
                                    setActivitySearchInput("");
                                  }}
                                  className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-blue-500 transition-colors flex items-center justify-between group"
                                >
                                  <span className="text-sm text-gray-700">
                                    {activity.title || activity.name || "Select activity..."}
                                  </span>
                                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>


                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => addActivity(dayIndex)}
                          className="w-full bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition mt-4"
                        >
                          + Add Activity
                        </button>
                      </div>
                    )}

                    {/* Optional Activities Section */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-md font-semibold text-gray-800">
                          Optional Activities
                        </h4>
                      </div>

                      <div className="space-y-3">
                        {day.optionalActivities.map((optActivity, optIndex) => (
                          <div
                            key={optIndex}
                            className="bg-white p-4 rounded border border-gray-200"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h5 className="text-sm font-semibold text-gray-800">
                                {optActivity.title || optActivity.name || `Optional Activity #${optIndex + 1}`}
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
                            </div>                          <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                              <p className="text-xs text-gray-500 mb-2">
                                Select activity name only. Other details are auto-filled from Admin Activities.
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowActivityPopup({ dayIndex, activityIndex: optIndex, isOptional: true });
                                  setActivitySearchInput("");
                                }}
                                className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-blue-500 transition-colors flex items-center justify-between group"
                              >
                                <span className="text-sm text-gray-700">
                                  {optActivity.title || optActivity.name || "Select activity..."}
                                </span>
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>


                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => addOptionalActivity(dayIndex)}
                        className="w-full bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition mt-4"
                      >
                        + Add Optional Activity
                      </button>
                    </div>

                    {/* Accommodation Section */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-md font-semibold text-gray-800">
                          Accommodation
                        </h4>
                      </div>

                      <div className="space-y-3">
                        {day.accommodations.map((accommodation, accIndex) => (
                          <div
                            key={accIndex}
                            className="bg-white p-4 rounded border border-gray-200"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h5 className="text-sm font-medium text-gray-700">
                                Accommodation
                              </h5>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Meals Section */}
                    <div className="mb-4">
                      <h4 className="text-md font-semibold text-gray-800 mb-3">
                        Meals
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {["Breakfast", "Lunch", "Dinner"].map((meal) => {
                          const currentMeals = day.meals ? day.meals.split(",").map(m => m.trim()) : [];
                          const isSelected = currentMeals.includes(meal);
                          return (
                            <button
                              key={meal}
                              type="button"
                              onClick={() => {
                                let newMeals;
                                if (isSelected) {
                                  newMeals = currentMeals.filter(m => m !== meal).join(",");
                                } else {
                                  newMeals = [...currentMeals, meal].join(",");
                                }
                                updateItinerary(dayIndex, "meals", newMeals);
                              }}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${isSelected
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                }`}
                            >
                              {meal}
                            </button>
                          );
                        })}
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

              <button
                type="button"
                onClick={addItineraryDay}
                className="w-full bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition mt-4"
              >
                + Add Day
              </button>
            </div>
          )}

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
                      max={ad.endDate || undefined}
                      placeholder="Start Date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                    />
                    <input
                      type="date"
                      value={ad.endDate}
                      onChange={(e) =>
                        updateAvailableDate(index, "endDate", e.target.value)
                      }
                      min={ad.startDate || undefined}
                      placeholder="End Date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                    />

                    <select
                      value={ad.discount}
                      onChange={(e) =>
                        updateAvailableDate(index, "discount", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-green-300 rounded-md text-sm focus:ring-1 focus:ring-green-600 focus:border-green-600 text-gray-900 bg-white"
                    >
                      <option value="">No Discount</option>
                      {discounts.filter(d => d.isActive).map((d) => (
                        <option key={d._id} value={d.name}>
                          {d.name} ({d.percentage}% off)
                        </option>
                      ))}
                    </select>
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

          {showCityPopup && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Select {showCityPopup === 'start' ? 'Start' : 'End'} City</h3>
                  <button
                    type="button"
                    onClick={() => setShowCityPopup(null)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <input
                    type="text"
                    placeholder="Search locations..."
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 mb-4 text-gray-900"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    autoFocus
                  />
                  <div className="space-y-1 max-h-[300px] overflow-y-auto">
                    {destinations
                      .filter(d => d.name.toLowerCase().includes(locationSearch.toLowerCase()))
                      .slice(0, 10)
                      .map((d) => (
                        <button
                          key={d._id || d.name}
                          type="button"
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-xl transition-colors flex items-center gap-3 group"
                          onClick={() => {
                            if (showCityPopup === 'start') {
                              setFormData(prev => ({ ...prev, startCity: d.name }));
                            } else {
                              setFormData(prev => ({ ...prev, endCity: d.name }));
                            }
                            setShowCityPopup(null);
                            setLocationSearch("");
                          }}
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-blue-100">
                            <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 group-hover:text-blue-600">{d.name}</p>
                          </div>
                        </button>
                      ))}
                    {destinations.filter(d => d.name.toLowerCase().includes(locationSearch.toLowerCase())).length === 0 && (
                      <div className="text-center py-8 text-gray-500 text-sm flex flex-col items-center gap-3">
                        <p>No locations found</p>
                        {locationSearch.trim() !== "" && (
                          <button
                            type="button"
                            onClick={handleAddLocation}
                            disabled={addingLocation}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                          >
                            {addingLocation ? "Adding..." : `Add "${locationSearch.trim()}"`}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {showLocationPopup && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Select Location</h3>
                  <button
                    type="button"
                    onClick={() => setShowLocationPopup(null)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <input
                    type="text"
                    placeholder="Search locations..."
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 mb-4 text-gray-900"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    autoFocus
                  />
                  <div className="space-y-1 max-h-[300px] overflow-y-auto">
                    {destinations
                      .filter(d => d.name.toLowerCase().includes(locationSearch.toLowerCase()))
                      .slice(0, 10)
                      .map((d) => (
                        <button
                          key={d._id || d.name}
                          type="button"
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-xl transition-colors flex items-center gap-3 group"
                          onClick={() => {
                            const dayIndex = showLocationPopup.dayIndex;
                            const currentTags = itinerary[dayIndex].title ? itinerary[dayIndex].title.split(",").filter(t => t.trim()) : [];
                            if (!currentTags.includes(d.name) && currentTags.length < 2) {
                              const newTitle = [...currentTags, d.name].join(",");
                              updateItinerary(dayIndex, "title", newTitle);
                            }
                            setShowLocationPopup(null);
                            setLocationSearch("");
                          }}
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-blue-100">
                            <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-700">{d.name}</span>
                        </button>
                      ))}
                    {destinations.filter(d => d.name.toLowerCase().includes(locationSearch.toLowerCase())).length === 0 && (
                      <div className="text-center py-8 text-gray-500 text-sm flex flex-col items-center gap-3">
                        <p>No locations found</p>
                        {locationSearch.trim() !== "" && (
                          <button
                            type="button"
                            onClick={handleAddLocation}
                            disabled={addingLocation}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                          >
                            {addingLocation ? "Adding..." : `Add "${locationSearch.trim()}"`}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {showActivityPopup && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Select Activity</h3>
                  <button
                    type="button"
                    onClick={() => setShowActivityPopup(null)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <input
                    type="text"
                    placeholder="Search activities..."
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 mb-4 text-gray-900"
                    value={activitySearch}
                    onChange={(e) => setActivitySearchInput(e.target.value)}
                    autoFocus
                  />
                  <div className="space-y-1 max-h-[300px] overflow-y-auto">
                    {activityOptions
                      .filter(opt => {
                        const dayIndex = showActivityPopup.dayIndex;
                        const dayLocations = itinerary[dayIndex].title ? itinerary[dayIndex].title.split(",").filter(t => t.trim()) : [];

                        // Filter by selected country
                        const destId = typeof opt.destination === "string" ? opt.destination : opt.destination?._id;
                        if (destId !== formData.country) return false;

                        // Filter by selected location tags for the day
                        if (!opt.location || !dayLocations.includes(opt.location)) return false;

                        // Filter by search query
                        if (activitySearch && !opt.title.toLowerCase().includes(activitySearch.toLowerCase())) return false;

                        return true;
                      })
                      .slice(0, 10)
                      .map((opt) => (
                        <button
                          key={opt._id}
                          type="button"
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-xl transition-colors flex items-center gap-3 group"
                          onClick={() => {
                            applyActivityOption(
                              showActivityPopup.dayIndex,
                              showActivityPopup.activityIndex,
                              opt._id,
                              showActivityPopup.isOptional
                            );
                            setShowActivityPopup(null);
                            setActivitySearchInput("");
                          }}
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-blue-100">
                            <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 block text-sm">{opt.title}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-500 font-medium">{opt.location}</span>
                              <span className="text-xs text-gray-300">•</span>
                              {opt.isFree ? (
                                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Free</span>
                              ) : (
                                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">${opt.price}</span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    {activityOptions.filter(opt => {
                      const dayIndex = showActivityPopup.dayIndex;
                      const dayLocations = itinerary[dayIndex].title ? itinerary[dayIndex].title.split(",").filter(t => t.trim()) : [];
                      const destId = typeof opt.destination === "string" ? opt.destination : opt.destination?._id;
                      if (destId !== formData.country) return false;
                      if (!opt.location || !dayLocations.includes(opt.location)) return false;
                      if (activitySearch && !opt.title.toLowerCase().includes(activitySearch.toLowerCase())) return false;
                      return true;
                    }).length === 0 && (
                        <div className="text-center py-8 text-gray-500 text-sm">
                          No activities found matching your criteria
                        </div>
                      )}
                  </div>
                  {/* Create Activity Button */}
                  <div className="pt-3 mt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowCreateActivityModal(true)}
                      className="w-full text-center px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                    >
                      + Create New Activity
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </form>
      </div>
      <ImagePickerModal
        isOpen={imagePickerModal.isOpen}
        onClose={() => setImagePickerModal((prev) => ({ ...prev, isOpen: false }))}
        onSelect={handleImagePickerSelect}
        multiple={imagePickerModal.multiple}
        folder="tour-images"
      />
      {/* Create Activity Modal */}
      {showActivityPopup && (
        <CreateActivityModal
          isOpen={showCreateActivityModal}
          onClose={() => setShowCreateActivityModal(false)}
          destinationId={formData.country}
          locationTags={
            itinerary[showActivityPopup.dayIndex]?.title
              ? itinerary[showActivityPopup.dayIndex].title.split(",").map((t: string) => t.trim()).filter(Boolean)
              : []
          }
          onCreated={(newActivity) => {
            setActivityOptions((prev) => [newActivity, ...prev]);
            // Auto-select the newly created activity directly in the state to avoid stale closure state
            setItinerary((prevItinerary) => {
              const newItinerary = [...prevItinerary];
              if (showActivityPopup.isOptional) {
                newItinerary[showActivityPopup.dayIndex].optionalActivities[showActivityPopup.activityIndex] = newActivity;
              } else {
                newItinerary[showActivityPopup.dayIndex].activities[showActivityPopup.activityIndex] = newActivity;
              }
              return newItinerary;
            });
            setShowActivityPopup(null);
            setActivitySearchInput("");
          }}
        />
      )}

      {/* Destination Selection Popup Modal */}
      {showDestinationPopup && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-lg font-bold text-gray-900">Select Destination</h2>
              <button 
                type="button"
                onClick={() => setShowDestinationPopup(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {continents.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Loading destinations...
                </div>
              ) : (
                continents.map((continent) => {
                  const id = continent.id || continent._id;
                  const isExpanded = expandedContinent === id;
                  const countryCount = continent.countries?.length || 0;
                  
                  return (
                    <div 
                      key={id}
                      className="border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedContinent(isExpanded ? null : id)}
                        className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors text-left font-medium text-gray-900"
                      >
                        <span>{continent.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-normal">
                            {countryCount} {countryCount === 1 ? "country" : "countries"}
                          </span>
                          <svg 
                            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      
                      {isExpanded && (
                        <div className="bg-gray-50 border-t border-gray-150 p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in slide-in-from-top-1 duration-150">
                          {countryCount === 0 ? (
                            <div className="col-span-full text-center text-sm text-gray-400 py-2">
                              No countries found in this continent
                            </div>
                          ) : (
                            continent.countries.map((country: any) => {
                              const countryId = country.id || country._id;
                              const isSelected = formData.country === countryId;
                              return (
                                <button
                                  type="button"
                                  key={countryId}
                                  onClick={() => {
                                    setFormData((prev) => ({ ...prev, country: countryId }));
                                    setShowDestinationPopup(false);
                                  }}
                                  className={`px-4 py-2.5 rounded-lg border text-sm font-medium text-left transition-all ${
                                    isSelected
                                      ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm"
                                      : "bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50/30"
                                  }`}
                                >
                                  {country.name}
                                </button>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
