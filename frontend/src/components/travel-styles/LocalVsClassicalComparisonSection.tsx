const rows = [
  "Travelers live within local communities, experiencing traditions, food, and daily life firsthand.",
  "Focus on real, unscripted moments like local markets, home-cooked meals, and hidden gems.",
  "Direct engagement with locals, guides, and artisans to understand stories and lifestyles.",
  "Includes hands-on experiences like farming, cooking, crafting, or local rituals.",
  "Often set in rural or natural environments promoting slow, mindful travel.",
];

export default function LocalVsClassicalComparisonSection() {
  return (
    <section className="mt-12 overflow-x-auto pb-4 md:mt-14">
      <div className="relative min-w-[780px]">
        <div className="absolute left-[34.5%] top-0 z-10 h-full w-[34%] rounded-[12px] bg-white shadow-[0_10px_30px_rgba(20,25,38,0.12)]" />

        <div className="relative z-20">
          <div className="grid grid-cols-[34%_34%_32%] border-b border-[#dfe3ea]">
            <div />
            <div className="px-6 py-6 text-center text-[40px] font-semibold text-[#162138] md:text-[42px]">Local Living Adventures</div>
            <div className="px-6 py-6 text-center text-[40px] font-semibold text-[#2d374a] md:text-[42px]">Classical Adventures</div>
          </div>

          {rows.map((row, index) => (
            <div key={index} className="grid grid-cols-[34%_34%_32%] border-b border-[#dfe3ea]">
              <div className="px-4 py-7 text-[22px] leading-[1.32] text-[#4d5568] md:px-6 md:text-[23px]">{row}</div>
              <div className="flex items-center justify-center px-6 py-7" />
              <div className="flex items-center justify-center px-6 py-7 text-[36px] font-semibold text-[#e63a34]">x</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}