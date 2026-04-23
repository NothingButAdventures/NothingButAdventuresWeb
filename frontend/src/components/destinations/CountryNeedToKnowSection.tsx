type NeedToKnowData = {
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
    <section className="mt-14 md:mt-16">
      <div className="rounded-[14px] bg-[#F2F0E9] px-6 py-6 md:px-10 md:py-8">
        <span className="inline-flex rounded-full bg-[#e8ebf0] px-4 py-1 text-[12px] font-medium text-[#5e6678]">
          Best Time
        </span>

        <p className="mt-3 text-[20px] font-medium text-[#121b2f] md:text-[36px]">Need to know</p>

        <h3 className="mt-2 text-[42px] font-semibold leading-[0.98] tracking-[-0.02em] text-[#11192d] md:text-[56px]">
          {countryName} at a glance
        </h3>

        <div className="mt-8 grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div key={item.title} className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#11192d]">
                <svg className="h-6 w-6 text-[#11192d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 6v6l4 2" />
                  <circle cx="12" cy="12" r="9" strokeWidth={2.2} />
                </svg>
              </div>
              <p className="text-[32px] font-semibold leading-[1.1] text-[#11192d]">{item.title}</p>
              {item.description && <p className="text-[13px] leading-[1.5] text-[#8d93a0]">{item.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
