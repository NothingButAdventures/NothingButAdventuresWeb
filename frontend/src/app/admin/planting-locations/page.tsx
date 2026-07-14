"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface Continent {
  id: string;
  _id: string;
  name: string;
  image?: string;
  countries: Country[];
}

interface Country {
  id: string;
  _id: string;
  name: string;
  code: string;
  image?: string;
  destinations?: Destination[];
}

interface Destination {
  id: string;
  _id: string;
  name: string;
  description?: string;
}

interface PlantingLocation {
  _id: string;
  id: string;
  country: {
    _id: string;
    name: string;
  } | string;
  locationName: string;
  destinationId?: string;
  plantSpecies: string[];
}

const Icons = {
  ChevronDown: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6" /></svg>
  ),
  Plus: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
  ),
  Trash2: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
  ),
  Edit2: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
  ),
  Globe: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z" /></svg>
  ),
};

export default function PlantingLocationsPage() {
  const router = useRouter();
  const [continents, setContinents] = useState<Continent[]>([]);
  const [plantingLocations, setPlantingLocations] = useState<PlantingLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedContinent, setExpandedContinent] = useState<string | null>(null);
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const resContinents = await fetch(`${api.baseURL}/continents`);
      const dataContinents = await resContinents.json();

      const resPlantings = await fetch(`${api.baseURL}/planting-locations`);
      const dataPlantings = await resPlantings.json();

      if (dataContinents.status === "success") {
        setContinents(dataContinents.data.continents);
      }
      if (dataPlantings.status === "success") {
        setPlantingLocations(dataPlantings.data.plantingLocations);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCountryKey = (country: Country) => country.id || country._id;

  const handleDeletePlantingLocation = async (id: string, name: string) => {
    const confirmed = window.confirm(`Delete planting location "${name}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${api.baseURL}/planting-locations/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        setPlantingLocations((prev) => prev.filter((item) => item._id !== id));
        alert("Planting location deleted successfully.");
      } else {
        const errorData = await res.json();
        alert("Error deleting planting location: " + (errorData.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error deleting planting location:", err);
      alert("Failed to delete planting location.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="px-8 py-6">
            <div className="h-7 bg-gray-200 rounded-md w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded-md w-64 animate-pulse"></div>
          </div>
        </div>
        <div className="p-8">
          <div className="bg-white rounded-md border border-gray-200 p-12 text-center text-zinc-500 animate-pulse font-medium shadow-sm">
            Loading planting locations...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-zinc-800 leading-none">Planting Locations</h1>
            <p className="text-gray-550 text-xs mt-1 leading-none">
              Manage locations and tree species where users' adventure trees are planted
            </p>
          </div>
          <Link
            href="/admin/planting-locations/new"
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-900 text-white font-medium py-1.5 px-3 rounded-md shadow-sm transition-colors text-xs flex items-center justify-center gap-1.5"
          >
            <Icons.Plus className="w-3.5 h-3.5" />
            Add Planting Location
          </Link>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-8">
        <div className="space-y-4">
          {continents.length === 0 ? (
            <div className="bg-white rounded-md border border-gray-200 p-16 text-center shadow-sm">
              <div className="w-16 h-16 bg-zinc-100 border border-zinc-200 text-zinc-700 rounded-md flex items-center justify-center mx-auto mb-4">
                <Icons.Globe className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-800 mb-2">No continents found</h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm">
                Add destinations first in Destination Management before managing planting locations.
              </p>
            </div>
          ) : (
            continents.map((continent) => (
              <div
                key={continent.id || continent._id}
                className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Continent Row */}
                <div
                  className="px-6 py-5 flex items-center justify-between cursor-pointer select-none bg-white hover:bg-gray-50/50 transition-colors"
                  onClick={() => setExpandedContinent(expandedContinent === (continent.id || continent._id) ? null : (continent.id || continent._id))}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-100 border border-zinc-200 rounded-md flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" strokeWidth="2" />
                        <path strokeWidth="2" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-800 flex items-center gap-2">
                        {continent.name}
                        <span className="text-xs font-normal text-gray-500">
                          ({continent.countries?.length || 0} countries)
                        </span>
                      </h3>
                    </div>
                  </div>
                  <div className={`text-zinc-500 transition-transform duration-200 ${expandedContinent === (continent.id || continent._id) ? "rotate-180" : ""}`}>
                    <Icons.ChevronDown className="w-5 h-5" />
                  </div>
                </div>

                {/* Countries List */}
                {expandedContinent === (continent.id || continent._id) && (
                  <div className="border-t border-gray-200 bg-gray-50/30 p-6 space-y-3">
                    {continent.countries && continent.countries.length > 0 ? (
                      continent.countries.map((country) => {
                        const countryKey = getCountryKey(country);
                        const countryPlantings = plantingLocations.filter((pl) => {
                          const plCountryId = typeof pl.country === "object" ? pl.country._id : pl.country;
                          return plCountryId === countryKey;
                        });

                        return (
                          <div
                            key={countryKey}
                            className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm transition-all duration-200"
                          >
                            <button
                              type="button"
                              onClick={() => setExpandedCountry(expandedCountry === countryKey ? null : countryKey)}
                              className="w-full px-4 py-4 flex items-center justify-between gap-4 text-left hover:bg-gray-50/50 transition-colors cursor-pointer border-none"
                            >
                              <div className="flex items-center gap-4 min-w-0">
                                <div className="w-10 h-10 rounded-md bg-zinc-100 flex-shrink-0 flex items-center justify-center border border-zinc-200 text-xs font-bold text-zinc-700">
                                  {country.code || country.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h5 className="font-semibold text-zinc-850 truncate text-sm">{country.name}</h5>
                                    <span className="text-[10px] text-zinc-750 bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded-md font-semibold">
                                      {countryPlantings.length} Planting Location{countryPlantings.length !== 1 ? "s" : ""}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className={`text-zinc-500 transition-transform duration-200 ${expandedCountry === countryKey ? "rotate-180" : ""}`}>
                                  <Icons.ChevronDown className="w-5 h-5" />
                                </div>
                              </div>
                            </button>

                            {/* Planting Locations list for Country */}
                            {expandedCountry === countryKey && (
                              <div className="border-t border-gray-200 bg-gray-55/10 px-4 py-4">
                                <div className="flex items-center justify-between gap-3 mb-4">
                                  <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                    Planting Locations in {country.name}
                                  </h5>
                                  <Link
                                    href={`/admin/planting-locations/new?countryId=${countryKey}`}
                                    className="text-xs flex items-center gap-1.5 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 px-3 py-1.5 rounded-md transition-colors font-medium border border-gray-300 bg-white shadow-sm"
                                  >
                                    <Icons.Plus className="w-3.5 h-3.5" />
                                    Add Location
                                  </Link>
                                </div>

                                <div className="space-y-3">
                                  {countryPlantings.length > 0 ? (
                                    countryPlantings.map((planting) => (
                                      <div
                                        key={planting._id}
                                        className="flex items-start justify-between gap-4 rounded-md border border-gray-200 bg-white p-4 shadow-sm"
                                      >
                                        <div className="min-w-0">
                                          <p className="font-semibold text-zinc-800 text-sm">{planting.locationName}</p>
                                          <div className="flex flex-wrap gap-1.5 mt-2">
                                            {planting.plantSpecies.map((species, i) => (
                                              <span
                                                key={i}
                                                className="px-2 py-0.5 text-xs bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100 font-medium"
                                              >
                                                {species}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                          <Link
                                            href={`/admin/planting-locations/new?id=${planting._id}`}
                                            className="px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition-colors flex items-center gap-1 border border-gray-300 bg-white shadow-sm"
                                          >
                                            <Icons.Edit2 className="w-3.5 h-3.5" />
                                            Edit
                                          </Link>
                                          <button
                                            type="button"
                                            onClick={() => handleDeletePlantingLocation(planting._id, planting.locationName)}
                                            className="px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors flex items-center gap-1 border border-red-200 bg-white shadow-sm"
                                          >
                                            <Icons.Trash2 className="w-3.5 h-3.5" />
                                            Delete
                                          </button>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="rounded-md border-2 border-dashed border-gray-300 bg-white px-4 py-8 text-center shadow-inner">
                                      <p className="text-sm text-gray-500 mb-3 font-medium">No planting locations added yet.</p>
                                      <Link
                                        href={`/admin/planting-locations/new?countryId=${countryKey}`}
                                        className="text-zinc-800 hover:text-zinc-950 font-bold text-sm underline decoration-zinc-900"
                                      >
                                        Add the first planting location for {country.name}
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-md bg-white shadow-inner">
                        <p className="text-gray-400 text-sm font-medium">No countries found in this continent.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
