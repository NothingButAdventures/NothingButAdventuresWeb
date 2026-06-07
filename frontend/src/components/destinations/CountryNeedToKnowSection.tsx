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

        <h3 className="mt-4 text-[42px] font-semibold leading-tight text-[#3F3F42] md:text-[56px]">
          {needToKnow?.title?.trim() || `${countryName} at a Glance`}
        </h3>

        <p className="mt-2 text-[34px] font-medium leading-tight text-[#3F3F42] md:text-[36px]">
          {needToKnow?.subtitle?.trim() || "Need to Know"}
        </p>

        <div className="mt-12 grid grid-cols-1 gap-x-16 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <div key={item.title}>
              <div className="h-[84px] w-[84px] text-[#3F3F42]">
                <img
                  src={`/uu${index + 1}.svg`}
                  className="h-full w-full object-contain"
                  alt={item.title}
                />
              </div>

              <p className="mt-5 text-[24px] font-semibold leading-tight text-[#3F3F42] md:text-[36px]">{item.title}</p>
              {item.description && <p className="mt-3 max-w-[32ch] text-[14px] leading-[1.35] text-[#3F3F42] md:text-[16px]">{item.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
