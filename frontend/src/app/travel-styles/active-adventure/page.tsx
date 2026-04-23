import TravelStyleSharedPage from "@/components/travel-styles/TravelStyleSharedPage";

export default function ActiveAdventureTravelStylePage() {
  return (
    <TravelStyleSharedPage
      config={{
        styleName: "Active Adventure",
        spotlightImage: "https://images.unsplash.com/photo-1501554728187-ce583db33af7?q=80&w=1600&auto=format&fit=crop",
        spotlightImageAlt: "Active adventure travel spotlight",
        spotlightIntro:
          "Outdoor-first travel with enough structure to keep the energy high and the logistics easy.",
        spotlightPanelTitle: "Active Adventure Adventures",
        spotlightPanelDescription:
          "Perfect for travelers who want movement, landscapes, and memorable shared challenges on every day out.",
        spotlightFeatures: [
          { icon: "group", title: "Adventure teams" },
          { icon: "user", title: "Fitness-friendly pace" },
          { icon: "star", title: "High-energy itineraries" },
          { icon: "map", title: "Nature and movement" },
        ],
      }}
    />
  );
}