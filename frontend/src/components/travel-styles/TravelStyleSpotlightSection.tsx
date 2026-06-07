import Image from "next/image";

type Feature = {
  icon: "group" | "user" | "map" | "star";
  title: string;
};

type TravelStyleSpotlightSectionProps = {
  styleName: string;
  imageSrc: string;
  imageAlt: string;
  badgeText?: string;
  introText: string;
  panelTitle: string;
  panelDescription: string;
  features: Feature[];
  minHeightClassName?: string;
};

function FeatureIcon({ icon }: { icon: Feature["icon"] }) {
  const className = "h-5 w-5 text-[#3F3F42]";

  if (icon === "user") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21a8 8 0 10-16 0" />
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth={2} />
      </svg>
    );
  }

  if (icon === "map") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v15M15 6v15" />
      </svg>
    );
  }

  if (icon === "star") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="m12 3 2.94 5.95 6.56.95-4.75 4.63 1.12 6.53L12 18.95 6.13 21.06l1.12-6.53L2.5 9.9l6.56-.95L12 3Z"
        />
      </svg>
    );
  }

  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth={2} />
    </svg>
  );
}

export default function TravelStyleSpotlightSection({
  styleName,
  imageSrc,
  imageAlt,
  badgeText = "Specials",
  introText,
  panelTitle,
  panelDescription,
  features,
  minHeightClassName = "min-h-[340px] lg:min-h-[420px]",
}: TravelStyleSpotlightSectionProps) {
  return (
    <section className="mt-14 md:mt-16">
      <span className="inline-flex rounded-full bg-[#3F3F42] px-4 py-1 text-[12px] font-medium text-white">
        {badgeText}
      </span>

      <h2 className="mt-4 text-balance text-[42px] font-semibold leading-[0.95] tracking-[-0.03em] text-[#3F3F42] md:text-[58px]">
        More about {styleName}
      </h2>

      <div className="mt-6 overflow-hidden rounded-[18px] bg-[#eef1f5] shadow-[0_14px_50px_rgba(18,27,47,0.08)]">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
          <div className={`relative ${minHeightClassName}`}>
            <Image src={imageSrc} alt={imageAlt} fill className="object-cover" priority={false} />
          </div>

          <div className={`flex flex-col justify-center bg-[#3F3F42] px-7 py-10 text-white md:px-10 ${minHeightClassName}`}>
            <div className="mx-auto flex max-w-[260px] flex-col items-center text-center">
              <div className="flex items-center gap-3 text-left">
                <img src="/icon.png" alt="Nothing But Adventures" className="h-14 w-14 rounded-xl object-contain" />
                <div className="leading-none text-white">
                  <div className="text-[18px] font-bold tracking-[0.26em]">NOTHING</div>
                  <div
                    className="mt-0.5 text-[20px] font-normal"
                    style={{ fontFamily: '"Brush Script MT", "League Script", "Dancing Script", cursive' }}
                  >
                    but
                  </div>
                  <div className="text-[18px] font-bold tracking-[0.26em]">ADVENTURES</div>
                </div>
              </div>

              <h3 className="mt-10 text-[34px] font-semibold leading-tight text-white md:text-[40px]">{panelTitle}</h3>
              <p className="mt-3 text-[15px] leading-[1.6] text-white/80">{panelDescription}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-0 border-t border-white/70 bg-[#f6f8fc] md:grid-cols-2">
          <div className="grid gap-0 border-b border-[#e2e7ef] md:border-b-0 md:border-r md:border-[#e2e7ef]">
            {features.slice(0, 2).map((feature) => (
              <div key={feature.title} className="flex items-center gap-4 px-6 py-5 md:px-8">
                <FeatureIcon icon={feature.icon} />
                <span className="text-[18px] font-medium text-[#3F3F42] md:text-[20px]">{feature.title}</span>
              </div>
            ))}
          </div>

          <div className="grid gap-0">
            {features.slice(2, 4).map((feature) => (
              <div key={feature.title} className="flex items-center gap-4 px-6 py-5 md:px-8">
                <FeatureIcon icon={feature.icon} />
                <span className="text-[18px] font-medium text-[#3F3F42] md:text-[20px]">{feature.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="sr-only">{styleName} travel spotlight</p>
      <p className="sr-only">{introText}</p>
    </section>
  );
}