"use client";

import { useEffect, useRef, useCallback } from "react";

interface Marker {
    lat: number;
    lng: number;
    label: string;
    tour?: {
        _id: string;
        name: string;
        slug: string;
        tourCode: string;
        images?: { url: string; isPrimary?: boolean }[];
        price?: { amount: number; currency: string };
        duration?: { days: number };
    };
}

export interface MapViewProps {
    center: [number, number];
    zoom: number;
    bounds?: [[number, number], [number, number]] | null; // [[south,west],[north,east]]
    markers: Marker[];
    activeTourSlug: string | null;
    onMarkerClick: (tour: NonNullable<Marker["tour"]>) => void;
    highlightCountries?: string[];
    activeCountryName?: string;
    hoveredCountryName?: string;
    lockedCountryName?: string;
    onCountryHover?: (countryName: string | null) => void;
    onCountryClick?: (countryName: string) => void;
}

// ─── continent lookup ──────────────────────────────────────────────────────────
const CONTINENT_MAP: Record<string, string> = {
    // North America
    "united states of america": "NORTH AMERICA",
    "usa": "NORTH AMERICA",
    "canada": "NORTH AMERICA",
    "mexico": "NORTH AMERICA",
    "guatemala": "NORTH AMERICA",
    "cuba": "NORTH AMERICA",
    "haiti": "NORTH AMERICA",
    "dominican republic": "NORTH AMERICA",
    "honduras": "NORTH AMERICA",
    "nicaragua": "NORTH AMERICA",
    "el salvador": "NORTH AMERICA",
    "costa rica": "NORTH AMERICA",
    "panama": "NORTH AMERICA",
    "jamaica": "NORTH AMERICA",
    "trinidad and tobago": "NORTH AMERICA",
    "belize": "NORTH AMERICA",
    "bahamas": "NORTH AMERICA",
    // South America
    "brazil": "SOUTH AMERICA",
    "colombia": "SOUTH AMERICA",
    "argentina": "SOUTH AMERICA",
    "peru": "SOUTH AMERICA",
    "venezuela": "SOUTH AMERICA",
    "chile": "SOUTH AMERICA",
    "ecuador": "SOUTH AMERICA",
    "bolivia": "SOUTH AMERICA",
    "paraguay": "SOUTH AMERICA",
    "uruguay": "SOUTH AMERICA",
    "guyana": "SOUTH AMERICA",
    "suriname": "SOUTH AMERICA",
    // Europe
    "united kingdom": "EUROPE",
    "uk": "EUROPE",
    "france": "EUROPE",
    "germany": "EUROPE",
    "italy": "EUROPE",
    "spain": "EUROPE",
    "portugal": "EUROPE",
    "netherlands": "EUROPE",
    "belgium": "EUROPE",
    "switzerland": "EUROPE",
    "austria": "EUROPE",
    "sweden": "EUROPE",
    "norway": "EUROPE",
    "denmark": "EUROPE",
    "finland": "EUROPE",
    "ireland": "EUROPE",
    "poland": "EUROPE",
    "czech republic": "EUROPE",
    "romania": "EUROPE",
    "greece": "EUROPE",
    "hungary": "EUROPE",
    "croatia": "EUROPE",
    "iceland": "EUROPE",
    "turkey": "EUROPE",
    "russia": "EUROPE",
    "ukraine": "EUROPE",
    "serbia": "EUROPE",
    "bulgaria": "EUROPE",
    "slovakia": "EUROPE",
    "slovenia": "EUROPE",
    "lithuania": "EUROPE",
    "latvia": "EUROPE",
    "estonia": "EUROPE",
    "luxembourg": "EUROPE",
    "malta": "EUROPE",
    "cyprus": "EUROPE",
    "albania": "EUROPE",
    "montenegro": "EUROPE",
    "macedonia": "EUROPE",
    "bosnia and herzegovina": "EUROPE",
    "moldova": "EUROPE",
    "belarus": "EUROPE",
    // Asia
    "china": "ASIA",
    "japan": "ASIA",
    "india": "ASIA",
    "south korea": "ASIA",
    "north korea": "ASIA",
    "indonesia": "ASIA",
    "thailand": "ASIA",
    "vietnam": "ASIA",
    "philippines": "ASIA",
    "malaysia": "ASIA",
    "singapore": "ASIA",
    "myanmar": "ASIA",
    "cambodia": "ASIA",
    "laos": "ASIA",
    "bangladesh": "ASIA",
    "pakistan": "ASIA",
    "afghanistan": "ASIA",
    "iran": "ASIA",
    "iraq": "ASIA",
    "saudi arabia": "ASIA",
    "united arab emirates": "ASIA",
    "nepal": "ASIA",
    "sri lanka": "ASIA",
    "mongolia": "ASIA",
    "uzbekistan": "ASIA",
    "kazakhstan": "ASIA",
    "tajikistan": "ASIA",
    "kyrgyzstan": "ASIA",
    "turkmenistan": "ASIA",
    "israel": "ASIA",
    "jordan": "ASIA",
    "lebanon": "ASIA",
    "syria": "ASIA",
    "yemen": "ASIA",
    "oman": "ASIA",
    "qatar": "ASIA",
    "bahrain": "ASIA",
    "kuwait": "ASIA",
    "georgia": "ASIA",
    "armenia": "ASIA",
    "azerbaijan": "ASIA",
    "taiwan": "ASIA",
    "brunei": "ASIA",
    "east timor": "ASIA",
    "bhutan": "ASIA",
    "maldives": "ASIA",
    // Africa
    "nigeria": "AFRICA",
    "ethiopia": "AFRICA",
    "egypt": "AFRICA",
    "south africa": "AFRICA",
    "kenya": "AFRICA",
    "tanzania": "AFRICA",
    "morocco": "AFRICA",
    "algeria": "AFRICA",
    "sudan": "AFRICA",
    "uganda": "AFRICA",
    "mozambique": "AFRICA",
    "ghana": "AFRICA",
    "madagascar": "AFRICA",
    "cameroon": "AFRICA",
    "ivory coast": "AFRICA",
    "angola": "AFRICA",
    "senegal": "AFRICA",
    "mali": "AFRICA",
    "zimbabwe": "AFRICA",
    "zambia": "AFRICA",
    "tunisia": "AFRICA",
    "libya": "AFRICA",
    "congo": "AFRICA",
    "democratic republic of the congo": "AFRICA",
    "namibia": "AFRICA",
    "botswana": "AFRICA",
    "rwanda": "AFRICA",
    "somalia": "AFRICA",
    // Oceania
    "australia": "OCEANIA",
    "new zealand": "OCEANIA",
    "papua new guinea": "OCEANIA",
    "fiji": "OCEANIA",
};

function getContinent(countryName: string): string {
    return CONTINENT_MAP[countryName.toLowerCase()] || "";
}

// Name normalization for GeoJSON matching
function normalizeForMatch(name: string): string {
    return name.toLowerCase().trim();
}

function geoJsonNameMatches(geoName: string, targetName: string): boolean {
    const geoLower = normalizeForMatch(geoName);
    const targetLower = normalizeForMatch(targetName);
    if (geoLower === targetLower) return true;
    // Common aliases
    if (geoName === "United States of America" && (targetLower === "usa" || targetLower === "united states")) return true;
    if (geoName === "United Kingdom" && (targetLower === "uk" || targetLower === "united kingdom")) return true;
    return false;
}

export default function MapView({
    center,
    zoom,
    bounds,
    markers,
    activeTourSlug,
    onMarkerClick,
    highlightCountries,
    activeCountryName,
    hoveredCountryName,
    lockedCountryName,
    onCountryHover,
    onCountryClick,
}: MapViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const tileRef = useRef<any>(null);
    const geoJsonDataRef = useRef<any>(null);
    const highlightLayerRef = useRef<any>(null);

    // ── bootstrap the map once ─────────────────────────────────────────────────
    useEffect(() => {
        if (!containerRef.current) return;
        if (mapRef.current) return;

        const L = require("leaflet");

        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
            iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        if (!document.getElementById("leaflet-css")) {
            const link = document.createElement("link");
            link.id = "leaflet-css";
            link.rel = "stylesheet";
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            document.head.appendChild(link);
        }

        const map = L.map(containerRef.current, {
            center,
            zoom,
            zoomControl: false,
            attributionControl: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            // Pure black background - no tile layer needed, but we use a minimal one for country borders
        });

        // Use CartoDB dark_nolabels for subtle gray country borders on black
        tileRef.current = L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
            { maxZoom: 19 }
        ).addTo(map);

        L.control.zoom({ position: "topright" }).addTo(map);

        mapRef.current = map;

        // Inject map styles
        if (!document.getElementById("nba-map-styles")) {
            const style = document.createElement("style");
            style.id = "nba-map-styles";
            style.textContent = `
                .nba-popup .leaflet-popup-content-wrapper {
                    padding: 0;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
                    border: none;
                }
                .nba-popup .leaflet-popup-content {
                    margin: 0;
                    min-width: 160px;
                }
                .nba-popup .leaflet-popup-tip-container { display: none; }
                @keyframes nba-ping {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.8); opacity: 0; }
                }
                /* Hide leaflet zoom buttons styling to match dark theme */
                .leaflet-control-zoom a {
                    background: rgba(0,0,0,0.7) !important;
                    color: #fff !important;
                    border-color: rgba(255,255,255,0.1) !important;
                }
                .leaflet-control-zoom a:hover {
                    background: rgba(0,0,0,0.9) !important;
                }
            `;
            document.head.appendChild(style);
        }

        return () => {
            map.remove();
            mapRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── fly to country: use fitBounds when available, else flyTo ──────────────
    useEffect(() => {
        if (!mapRef.current) return;
        if (bounds) {
            mapRef.current.flyToBounds(bounds, { padding: [30, 30], duration: 1.2, maxZoom: 10 });
        } else {
            mapRef.current.flyTo(center, zoom, { duration: 1.2 });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bounds, center, zoom]);

    // ── GeoJSON country highlight layer ──────────────────────────────────────────
    useEffect(() => {
        if (!mapRef.current) return;
        const L = require("leaflet");

        const updateHighlight = async () => {
            // Load GeoJSON data once
            if (!geoJsonDataRef.current) {
                try {
                    const res = await fetch("https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json");
                    const data = await res.json();
                    geoJsonDataRef.current = data;
                } catch (e) {
                    console.error("Failed to load geojson", e);
                    return;
                }
            }

            // Remove old layer
            if (highlightLayerRef.current) {
                mapRef.current.removeLayer(highlightLayerRef.current);
            }

            const countriesSet = new Set((highlightCountries || []).map(c => c.toLowerCase()));
            const activeLower = activeCountryName?.toLowerCase();
            const hoveredLower = hoveredCountryName?.toLowerCase();
            const lockedLower = lockedCountryName?.toLowerCase();
            const hasAnySelection = !!(activeLower || hoveredLower || lockedLower);

            highlightLayerRef.current = L.geoJSON(geoJsonDataRef.current, {
                style: (feature: any) => {
                    const name = feature.properties?.name || "";
                    const isInDB = Array.from(countriesSet).some(c => geoJsonNameMatches(name, c));

                    // Check states
                    const isLocked = lockedLower ? geoJsonNameMatches(name, lockedLower) : false;
                    const isHovered = hoveredLower ? geoJsonNameMatches(name, hoveredLower) : false;
                    const isActive = activeLower ? geoJsonNameMatches(name, activeLower) : false;

                    if (isLocked) {
                        // STATE 3: Pinned/locked
                        return {
                            color: "#ffffff",
                            weight: 2.1,
                            opacity: 1,
                            fillColor: "#ffffff",
                            fillOpacity: 1,
                        };
                    } else if (isHovered || (isActive && !lockedLower)) {
                        // STATE 2: Hovered/active — match selected style
                        return {
                            color: "#ffffff",
                            weight: 2.1,
                            opacity: 1,
                            fillColor: "#ffffff",
                            fillOpacity: 1,
                        };
                    } else if (isInDB && !hasAnySelection) {
                        // STATE 1A: Default highlighted countries — clearly visible white borders
                        return {
                            color: "#ffffff",
                            weight: 1.8,
                            opacity: 0.95,
                            fillColor: "transparent",
                            fillOpacity: 0,
                        };
                    } else {
                        // STATE 1B: Default world map — thin white country borders
                        return {
                            color: "#ffffff",
                            weight: 1,
                            opacity: 0.55,
                            fillColor: "transparent",
                            fillOpacity: 0,
                        };
                    }
                },
                onEachFeature: (feature: any, layer: any) => {
                    const name = feature.properties?.name || "";
                    const isInDB = Array.from(countriesSet).some(c => geoJsonNameMatches(name, c));

                    if (isInDB) {
                        layer.on({
                            mouseover: () => {
                                if (onCountryHover) onCountryHover(name);
                            },
                            mouseout: () => {
                                if (onCountryHover) onCountryHover(null);
                            },
                            click: () => {
                                if (onCountryClick) onCountryClick(name);
                            },
                        });
                    }
                },
            }).addTo(mapRef.current);

            // Bring markers above the polygon layer
            if (markersRef.current) {
                markersRef.current.forEach(m => m.setZIndexOffset(1000));
            }
        };

        updateHighlight();
    }, [highlightCountries, activeCountryName, hoveredCountryName, lockedCountryName, onCountryHover, onCountryClick]);

    // ── redraw markers when tour list changes ──────────────────────────────────
    useEffect(() => {
        if (!mapRef.current) return;
        const L = require("leaflet");

        // Clear old markers
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        markers.forEach((m) => {
            const isActive = activeTourSlug && m.tour?.slug === activeTourSlug;

            // Red dot marker matching the design
            const svgIcon = L.divIcon({
                className: "",
                html: `
                    <div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
                        ${isActive
                        ? `<div style="position:absolute;width:24px;height:24px;border-radius:50%;background:rgba(220,60,60,0.35);animation:nba-ping 1.2s infinite;"></div>`
                        : ""
                    }
                        <div style="
                            width:${isActive ? 14 : 10}px;
                            height:${isActive ? 14 : 10}px;
                            border-radius:50%;
                            background:#e05555;
                            border:2px solid rgba(255,255,255,0.5);
                            box-shadow:0 1px 4px rgba(0,0,0,0.4);
                            transition:all 0.3s;
                        "></div>
                    </div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
            });

            const tourImageHtml = m.tour?.images?.[0]?.url
                ? `<img src="${m.tour.images[0].url}" style="width:100%;height:50px;object-fit:cover;border-radius:4px 4px 0 0;" />`
                : "";

            const priceHtml = m.tour?.price?.amount
                ? `<span style="font-size:10px;color:#10b981;font-weight:700;">$${m.tour.price.amount.toLocaleString()}</span>`
                : "";

            const durationHtml = m.tour?.duration?.days
                ? `<span style="font-size:9px;color:#9ca3af;">${m.tour.duration.days} days</span>`
                : "";

            const popup = L.popup({
                maxWidth: 200,
                minWidth: 160,
                className: "nba-popup",
                offset: [0, -8],
            }).setContent(`
                <div style="font-family:'Outfit',sans-serif;overflow:hidden;border-radius:8px;">
                    ${tourImageHtml}
                    <div style="padding:8px 10px;">
                        <p style="margin:0 0 2px;font-weight:700;font-size:11px;color:#111;line-height:1.3;">${m.tour?.name || m.label}</p>
                        <p style="margin:0 0 4px;font-size:10px;color:#6b7280;">📍 ${m.label}</p>
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">${priceHtml}${durationHtml}</div>
                        ${m.tour ? `<a href="/trip/${m.tour.slug}/${m.tour.tourCode}" style="display:block;background:#111;color:white;text-align:center;padding:5px 8px;border-radius:5px;font-size:10px;font-weight:600;text-decoration:none;">View Trip →</a>` : ""}
                    </div>
                </div>
            `);

            const marker = L.marker([m.lat, m.lng], { icon: svgIcon })
                .addTo(mapRef.current)
                .bindPopup(popup);

            marker.on("click", () => {
                if (m.tour) onMarkerClick(m.tour);
            });

            markersRef.current.push(marker);
        });
    }, [markers, activeTourSlug, onMarkerClick]);

    return (
        <div
            ref={containerRef}
            style={{ width: "100%", height: "100%", background: "#000000" }}
        />
    );
}
