import TravelStyleSharedPage from "@/components/travel-styles/TravelStyleSharedPage";

export default function MusicalAdventuresTravelStylePage() {
  return (
    <TravelStyleSharedPage
      config={{
        styleName: "Musical Adventures",
        spotlightImage: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1600&auto=format&fit=crop",
        spotlightImageAlt: "Musical adventures travel spotlight",
        spotlightIntro:
          "Built around rhythm, performance, and cities that come alive after dark.",
        spotlightPanelTitle: "Musical Adventures",
        spotlightPanelDescription:
          "A travel style for people who want live music, cultural depth, and nights that feel just as memorable as the days.",
        spotlightFeatures: [
          { icon: "group", title: "Live music circles" },
          { icon: "user", title: "Cultural immersion" },
          { icon: "star", title: "Night-life energy" },
          { icon: "map", title: "City-led itineraries" },
        ],
      }}
    />
  );
}