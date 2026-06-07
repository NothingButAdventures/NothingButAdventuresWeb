import Image from "next/image";
import ReviewsSection from "@/components/ReviewsSection";
import AllToursCategoriesSection from "@/components/travel-styles/AllToursCategoriesSection";
import TravelStyleSpotlightSection from "@/components/travel-styles/TravelStyleSpotlightSection";
import WhyLocalLivingSection from "@/components/travel-styles/WhyLocalLivingSection";
import LocalVsClassicalComparisonSection from "@/components/travel-styles/LocalVsClassicalComparisonSection";
import TravelStyleGallerySection from "@/components/travel-styles/TravelStyleGallerySection";
import TravelStyleFaqSection from "@/components/travel-styles/TravelStyleFaqSection";

export type TravelStylePageConfig = {
  styleName: string;
  spotlightImage: string;
  spotlightImageAlt: string;
  spotlightIntro: string;
  spotlightPanelTitle: string;
  spotlightPanelDescription: string;
  spotlightFeatures: Array<{
    icon: "group" | "user" | "map" | "star";
    title: string;
  }>;
  spotlightMinHeightClassName?: string;
};

const defaultStyleConfig: TravelStylePageConfig = {
  styleName: "Classic",
  spotlightImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1600&auto=format&fit=crop",
  spotlightImageAlt: "Classic travel spotlight",
  spotlightIntro:
    "An immersive block that highlights the character of the chosen travel style.",
  spotlightPanelTitle: "Classic Adventures",
  spotlightPanelDescription:
    "A sharper look at the pace, comfort, and character of this travel style, with thoughtful touches that keep the experience balanced and memorable.",
  spotlightFeatures: [
    { icon: "group", title: "Small group experts" },
    { icon: "user", title: "All age tours" },
    { icon: "star", title: "Classic Nothing but Adventures" },
    { icon: "map", title: "Share the joy of travel" },
  ],
};

type TravelStyleSharedPageProps = {
  config?: TravelStylePageConfig;
};

export default function TravelStyleSharedPage({ config = defaultStyleConfig }: TravelStyleSharedPageProps) {
  return (
    <main className="w-full bg-white pb-12 pt-4 md:px-0 md:pt-6">
      <div className="w-full rounded-[10px] bg-white px-4 pb-6 pt-4 md:px-8 md:pb-8 md:pt-5">
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)] lg:items-start xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)]">
          <div className="rounded-2xl bg-[#ededed] p-7 md:p-10">
            <h1 className="text-balance text-[42px] font-semibold leading-[0.95] tracking-[-0.02em] text-[#3F3F42] md:text-[58px]">
              Travel Styles
            </h1>
            <p className="mt-8 max-w-[38ch] text-[18px] leading-[1.5] text-[#3F3F42]">
              Immersive travel is about experiencing a destination through the eyes of a local. It is eating at family restaurants, learning traditions and crafts, and sleeping in authentic accommodations that tell stories.
            </p>
            <ul className="mt-3 list-disc pl-6 text-[16px] leading-[1.5] text-[#3F3F42]">
              <li>18-to-30-somethings</li>
              <li>Go-Active</li>
              <li>Local Living</li>
              <li>Musical Adventures</li>
            </ul>
            <a
              href="/trips"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#3F3F42] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3F3F42]"
            >
              View all Tours
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/40 text-[11px] leading-none">↗</span>
            </a>
          </div>

          <div className="relative h-[380px] overflow-hidden rounded-2xl md:h-[560px] lg:aspect-square lg:h-auto lg:min-h-[680px] xl:min-h-[760px]">
            <Image
              src="https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2000&auto=format&fit=crop"
              alt="Travel styles"
              fill
              priority
              className="object-cover"
            />
          </div>
        </section>

        <AllToursCategoriesSection />
        <TravelStyleSpotlightSection
          styleName={config.styleName}
          imageSrc={config.spotlightImage}
          imageAlt={config.spotlightImageAlt}
          introText={config.spotlightIntro}
          panelTitle={config.spotlightPanelTitle}
          panelDescription={config.spotlightPanelDescription}
          features={config.spotlightFeatures}
          minHeightClassName={config.spotlightMinHeightClassName}
        />
        <WhyLocalLivingSection />
        <LocalVsClassicalComparisonSection />
        <TravelStyleGallerySection />
        <ReviewsSection
          title="See how your trip uplifts communities"
          pillClasses="bg-[#DEECFF] text-[#3F3F42]"
          btnClasses="bg-[#42c46e] hover:bg-[#33b55e]"
          btnText="Book This Trip"
        />
        <TravelStyleFaqSection />
      </div>
    </main>
  );
}