"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import ImagePickerModal from "@/components/ImagePickerModal";

interface Continent {
  _id: string;
  id: string;
  name: string;
  countries: Country[];
}

interface Country {
  _id: string;
  id: string;
  name: string;
  code: string;
  destinations?: Destination[];
}

interface Destination {
  _id: string;
  id: string;
  name: string;
  description?: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

function PlantingLocationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const countryQueryId = searchParams.get("countryId");

  const [continents, setContinents] = useState<Continent[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);

  // Form State
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedDestinationName, setSelectedDestinationName] = useState("");
  const [plantSpeciesString, setPlantSpeciesString] = useState("");
  const [description, setDescription] = useState("");
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);

  useEffect(() => {
    fetchContinentsAndFormData();
  }, []);

  const fetchContinentsAndFormData = async () => {
    try {
      setLoading(true);
      
      // Fetch continents hierarchy
      const resContinents = await fetch(`${api.baseURL}/continents`);
      const dataContinents = await resContinents.json();
      let allCountries: Country[] = [];

      if (dataContinents.status === "success") {
        setContinents(dataContinents.data.continents);
        allCountries = dataContinents.data.continents.flatMap((c: Continent) => c.countries || []);
        setCountries(allCountries);
      }

      // If editing, fetch existing planting location
      if (editId) {
        const res = await fetch(`${api.baseURL}/planting-locations/${editId}`);
        const data = await res.json();
        if (data.status === "success") {
          const pl = data.data.plantingLocation;
          const plCountryId = typeof pl.country === "object" ? pl.country._id : pl.country;
          
          setSelectedCountryId(plCountryId);
          setSelectedDestinationName(pl.locationName);
          setPlantSpeciesString(pl.plantSpecies ? pl.plantSpecies.join(", ") : "");
          setDescription(pl.description || "");
          setFaqs(pl.faqs || []);
          setGallery(pl.gallery || []);

          // Populate destinations for the editing country
          const matchedCountry = allCountries.find(
            (c) => (c._id === plCountryId || c.id === plCountryId)
          );
          if (matchedCountry) {
            setDestinations(matchedCountry.destinations || []);
          }
        }
      } else if (countryQueryId) {
        // Pre-select country from query parameter
        setSelectedCountryId(countryQueryId);
        const matchedCountry = allCountries.find(
          (c) => (c._id === countryQueryId || c.id === countryQueryId)
        );
        if (matchedCountry) {
          setDestinations(matchedCountry.destinations || []);
        }
      }
    } catch (err) {
      console.error("Error loading form data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCountryChange = (countryId: string) => {
    setSelectedCountryId(countryId);
    setSelectedDestinationName("");
    
    const matchedCountry = countries.find((c) => (c._id === countryId || c.id === countryId));
    if (matchedCountry) {
      setDestinations(matchedCountry.destinations || []);
    } else {
      setDestinations([]);
    }
  };

  // FAQ handlers
  const handleAddFaq = () => {
    setFaqs((prev) => [...prev, { question: "", answer: "" }]);
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFaqChange = (index: number, field: keyof FaqItem, value: string) => {
    setFaqs((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // Gallery handlers
  const handleImageSelect = (urls: string[]) => {
    setGallery((prev) => {
      const next = [...prev];
      urls.forEach((url) => {
        if (!next.includes(url)) next.push(url);
      });
      return next;
    });
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGallery((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCountryId) {
      alert("Please select a country");
      return;
    }
    if (!selectedDestinationName) {
      alert("Please select a location");
      return;
    }

    // Split species by comma and clean whitespaces
    const plantSpecies = plantSpeciesString
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const matchedDest = destinations.find((d) => d.name === selectedDestinationName);
    const destinationId = matchedDest ? (matchedDest._id || matchedDest.id) : undefined;

    // Filter invalid FAQs
    const cleanFaqs = faqs.filter((faq) => faq.question.trim() && faq.answer.trim());

    const payload = {
      country: selectedCountryId,
      locationName: selectedDestinationName,
      destinationId,
      plantSpecies,
      description,
      faqs: cleanFaqs,
      gallery,
    };

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const url = editId
        ? `${api.baseURL}/planting-locations/${editId}`
        : `${api.baseURL}/planting-locations`;
      const method = editId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.status === "success") {
        router.push("/admin/planting-locations");
      } else {
        alert("Error saving planting location: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error saving planting location:", err);
      alert("Failed to save planting location.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading form...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <h1 className="text-2xl font-bold text-[#3F3F42]">
            {editId ? "Edit Planting Location" : "Add Planting Location"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Specify the region, thrives tree species, FAQs, and cover galleries.
          </p>
        </div>
      </div>

      {/* Form Area */}
      <div className="p-8 max-w-3xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Country Selector */}
            <div>
              <label className="block text-sm font-medium text-[#3F3F42] mb-2">
                Country / Destination Group <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={selectedCountryId}
                onChange={(e) => handleCountryChange(e.target.value)}
                disabled={!!editId}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white text-[#3F3F42] disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">-- Select Country --</option>
                {countries.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Selector */}
            <div>
              <label className="block text-sm font-medium text-[#3F3F42] mb-2">
                Planting Location / Destination <span className="text-red-500">*</span>
              </label>
              {selectedCountryId ? (
                destinations.length > 0 ? (
                  <select
                    required
                    value={selectedDestinationName}
                    onChange={(e) => setSelectedDestinationName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white text-[#3F3F42]"
                  >
                    <option value="">-- Select Location Reference --</option>
                    {destinations.map((d) => (
                      <option key={d._id || d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                    No destinations have been added to this country yet. Please add a destination to this country in{" "}
                    <Link href="/admin/location" className="underline font-semibold hover:text-amber-950">
                      Destination Management
                    </Link>{" "}
                    first.
                  </div>
                )
              ) : (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-400 text-sm">
                  Please select a Country first.
                </div>
              )}
            </div>

            {/* Plant Species Input */}
            <div>
              <label className="block text-sm font-medium text-[#3F3F42] mb-2">
                Plant / Tree Species <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={plantSpeciesString}
                onChange={(e) => setPlantSpeciesString(e.target.value)}
                placeholder="e.g. Acacia, Mahogany, Oak"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-[#3F3F42] placeholder:text-gray-300"
              />
              <p className="text-xs text-gray-400 mt-2">
                Enter multiple species separated by commas.
              </p>
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-sm font-medium text-[#3F3F42] mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell users about the planting project in this region, soil types, reforestation status..."
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-[#3F3F42] placeholder:text-gray-300 resize-y"
              />
            </div>

            {/* Gallery Section */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-bold text-[#3F3F42]">
                  Gallery Images
                </label>
                <button
                  type="button"
                  onClick={() => setIsImagePickerOpen(true)}
                  className="px-3.5 py-1.5 bg-[#3F3F42] hover:bg-[#3F3F42]/90 text-white rounded-lg text-xs font-semibold shadow transition-all"
                >
                  Select from Media
                </button>
              </div>

              {gallery.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  {gallery.map((url, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden h-24 bg-white border border-gray-200 shadow-sm">
                      <img
                        src={url}
                        alt={`Gallery preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(index)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm"
                        title="Remove Image"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center text-gray-400 text-sm bg-gray-50/50">
                  No images selected for the gallery yet.
                </div>
              )}
            </div>

            {/* FAQs Section */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-bold text-[#3F3F42]">
                  Frequently Asked Questions (FAQs)
                </label>
                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="px-3.5 py-1.5 bg-[#3F3F42] hover:bg-[#3F3F42]/90 text-white rounded-lg text-xs font-semibold shadow transition-all"
                >
                  + Add FAQ
                </button>
              </div>

              {faqs.length > 0 ? (
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3 relative">
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(index)}
                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove FAQ"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>

                      <div className="pr-8">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                          Question #{index + 1}
                        </label>
                        <input
                          type="text"
                          required
                          value={faq.question}
                          onChange={(e) => handleFaqChange(index, "question", e.target.value)}
                          placeholder="e.g. When are the trees planted?"
                          className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-[#3F3F42]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                          Answer
                        </label>
                        <textarea
                          required
                          value={faq.answer}
                          onChange={(e) => handleFaqChange(index, "answer", e.target.value)}
                          placeholder="Provide the answer..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-[#3F3F42] resize-y"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center text-gray-400 text-sm bg-gray-50/50">
                  No FAQs added to this planting location yet.
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <Link
                href="/admin/planting-locations"
                className="px-5 py-2.5 text-[#3F3F42] hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm border border-gray-200 bg-white"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving || !selectedCountryId || !selectedDestinationName}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {editId ? "Save Changes" : "Create Planting Location"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ImagePickerModal
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        onSelect={handleImageSelect}
        multiple={true}
        folder="tour-images"
      />
    </div>
  );
}

export default function NewPlantingLocationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading form...</div>
      </div>
    }>
      <PlantingLocationForm />
    </Suspense>
  );
}
