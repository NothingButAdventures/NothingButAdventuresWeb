type NeedToKnowData = {
  title?: string;
  subtitle?: string;
  timeZone?: string;
  climate?: string;
  currency?: string;
  transportation?: string;
  localCuisine?: string;
  languagesSpoken?: string;
};

export default function CountryNeedToKnowSection({
  countryName,
  needToKnow,
}: {
  countryName: string;
  needToKnow?: NeedToKnowData;
}) {
  const items = [
    { title: "Time Zone", description: needToKnow?.timeZone?.trim() || "" },
    { title: "Climate", description: needToKnow?.climate?.trim() || "" },
    { title: "Currency", description: needToKnow?.currency?.trim() || "" },
    { title: "Transportation", description: needToKnow?.transportation?.trim() || "" },
    { title: "Local Cuisine", description: needToKnow?.localCuisine?.trim() || "" },
    { title: "Languages Spoken", description: needToKnow?.languagesSpoken?.trim() || "" },
  ];

  return (
    <section className="relative left-1/2 right-1/2 mt-14 w-screen -translate-x-1/2 bg-[#F7FAFE] py-14 md:mt-16 md:py-16">
      <div className="mx-auto w-full px-4 md:px-8 lg:px-12 xl:px-16">
        <span className="inline-flex rounded-full bg-[#e6e8ec] px-3 py-1 text-[12px] font-medium leading-none text-[#8a91a0]">
          Best time
        </span>

        <h3 className="mt-4 text-[42px] font-semibold leading-tight text-[#121b2f] md:text-[56px]">
          {needToKnow?.title?.trim() || `${countryName} at a Glance`}
        </h3>

        <p className="mt-2 text-[34px] font-medium leading-tight text-[#495468] md:text-[36px]">
          {needToKnow?.subtitle?.trim() || "Need to Know"}
        </p>

        <div className="mt-12 grid grid-cols-1 gap-x-16 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <div key={item.title}>
              <div className="h-14 w-14 text-[#121212]">
                {index === 0 && (
                  <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="6.6" strokeWidth={1.4} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M4.4 11h13.2M11 4.4v13.2M7.3 6.2c1.2 1.1 2 2.9 2 4.8s-.8 3.7-2 4.8m7.4-9.6c-1.2 1.1-2 2.9-2 4.8s.8 3.7 2 4.8" />
                    <circle cx="17.9" cy="17.9" r="4" strokeWidth={1.4} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M17.9 15.9v2.1h1.5" />
                  </svg>
                )}
                {index === 1 && (
                  <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="11" cy="12" r="4.5" strokeWidth={1.4} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M11 3.2v2M11 18.8v2M2.2 12h2M17.8 12h2M4.7 5.7l1.4 1.4M16 17l1.4 1.4M4.7 18.3l1.4-1.4" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M15.2 18.1H9.7a3.1 3.1 0 1 1 .7-6.1A4.5 4.5 0 0 1 19 13.8a2.6 2.6 0 0 1-3.8 4.3" />
                  </svg>
                )}
                {index === 2 && (
                  <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3.3" y="6" width="16.4" height="9.2" rx="1" strokeWidth={1.4} />
                    <rect x="6.3" y="8.4" width="10.4" height="4.4" rx=".7" strokeWidth={1.4} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M9.2 10.6h4.6M14.8 6V4.7M6.2 6V4.7" />
                  </svg>
                )}
                {index === 3 && (
                  <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="4" y="9" width="16" height="8" rx="2" strokeWidth={1.4} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M7.5 9 9 6.5h6L16.5 9" />
                    <circle cx="8" cy="18.8" r="1.4" strokeWidth={1.4} />
                    <circle cx="16" cy="18.8" r="1.4" strokeWidth={1.4} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M6.8 12.7h10.4" />
                  </svg>
                )}
                {index === 4 && (
                  <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M6 14.7h12l-1.2 4.2H7.2L6 14.7Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M8.8 12.7c.4-.5.7-1 .7-1.7 0-1-.7-1.7-1.2-2.3m4.2 4c.4-.5.7-1 .7-1.7 0-1-.7-1.7-1.2-2.3m4.2 4c.4-.5.7-1 .7-1.7 0-1-.7-1.7-1.2-2.3" />
                  </svg>
                )}
                {index === 5 && (
                  <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3.8" y="4.5" width="7.8" height="4.8" rx="1" strokeWidth={1.4} />
                    <rect x="12.4" y="6.8" width="7.8" height="4.8" rx="1" strokeWidth={1.4} />
                    <circle cx="7.7" cy="16" r="2.2" strokeWidth={1.4} />
                    <circle cx="16.3" cy="16" r="2.2" strokeWidth={1.4} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M5.2 20h5M13.8 20h5" />
                  </svg>
                )}
              </div>

              <p className="mt-5 text-[24px] font-semibold leading-tight text-[#121b2f] md:text-[36px]">{item.title}</p>
              {item.description && <p className="mt-3 max-w-[32ch] text-[14px] leading-[1.35] text-[#4f5a6d] md:text-[16px]">{item.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
