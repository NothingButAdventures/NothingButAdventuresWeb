import TravelStyleSharedPage from "@/components/travel-styles/TravelStyleSharedPage";

export default function ClassicTravelStylePage() {
  return (
    <TravelStyleSharedPage
      config={{
        styleName: "Classic",
        spotlightImage: "https://images.unsplash.com/photo-1465311443269-8a8c7f4d4a9d?q=80&w=1600&auto=format&fit=crop",
        spotlightImageAlt: "Classic travel spotlight",
        spotlightIntro:
          "Classic travel blends comfort, culture, and iconic landscapes into one polished journey.",
        spotlightPanelTitle: "Classic Adventures",
        spotlightPanelDescription:
          "A timeless style for travelers who want richer experiences, smoother pacing, and meaningful places.",
        spotlightFeatures: [
          { icon: "group", title: "Small group experts" },
          { icon: "user", title: "All age tours" },
          { icon: "star", title: "Classic Nothing but Adventures" },
          { icon: "map", title: "Share the joy of travel" },
        ],
      }}
    />
  );
}