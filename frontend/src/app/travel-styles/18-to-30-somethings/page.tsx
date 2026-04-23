import TravelStyleSharedPage from "@/components/travel-styles/TravelStyleSharedPage";

export default function EighteenToThirtySomethingsPage() {
  return (
    <TravelStyleSharedPage
      config={{
        styleName: "18 to 30 Somethings",
        spotlightImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop",
        spotlightImageAlt: "18 to 30 somethings travel spotlight",
        spotlightIntro:
          "Energetic, social, and built for travelers who want new experiences without losing comfort.",
        spotlightPanelTitle: "18 to 30 Somethings Adventures",
        spotlightPanelDescription:
          "Trips designed for fast-moving itineraries, shared moments, and a mix of culture, fun, and connection.",
        spotlightFeatures: [
          { icon: "group", title: "Small group experts" },
          { icon: "user", title: "All Age Tours" },
          { icon: "star", title: "Classic Nothing but Adventures" },
          { icon: "map", title: "Share the Joy of Travel" },
        ],
        spotlightMinHeightClassName: "min-h-[420px] lg:min-h-[560px]",
      }}
    />
  );
}