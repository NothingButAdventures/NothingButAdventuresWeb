import Image from "next/image";

export default function TreePlantingPage() {
  return (
    <main className="min-h-screen w-full bg-white pt-2 pb-24 font-sans">
      {/* Title Section with Standard Layout Padding */}
      <div className="px-4 md:px-6 mb-8 md:mb-12">
        <h1 className="text-4xl md:text-[54px] font-bold text-[#3F3F42] tracking-tight text-center mt-8 md:mt-12 leading-tight">
          “Go Grow Love”
        </h1>
      </div>

      {/* Featured Cover Image with 0 Padding (Edge-to-edge) */}
      <div className="relative w-full aspect-[16/10] md:aspect-[16/9] lg:aspect-[21/9] bg-gray-100 overflow-hidden">
        <Image
          src="/nba_club_hero.png"
          alt="Friends sitting on a dock"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Forest Green Info Section with 0 Padding (Edge-to-edge) */}
      <section className="bg-[#3F3F42] text-white w-full py-16 md:py-24 px-6 md:px-16 lg:px-24">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Left Column: Large Globe-Clock SVG */}
          <div className="lg:col-span-4 flex justify-center lg:justify-start">
            <svg className="w-48 h-48 md:w-56 md:h-56 text-white opacity-95" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="22" cy="22" r="16" />
              <line x1="22" y1="6" x2="22" y2="38" />
              <line x1="6" y1="22" x2="38" y2="22" />
              <path d="M22 6 A 8 16 0 0 0 22 38" />
              <path d="M22 6 A 8 16 0 0 1 22 38" />
              <path d="M6 22 A 16 8 0 0 0 38 22" />
              <path d="M6 22 A 16 8 0 0 1 38 22" />
              {/* Overlay Clock circle */}
              <circle cx="36" cy="36" r="8" fill="#1A3326" stroke="currentColor" strokeWidth="2.5" />
              {/* Clock hands */}
              <path d="M36 32 V36 H40" strokeWidth="2.5" />
            </svg>
          </div>

          {/* Right Column: Text & Stats */}
          <div className="lg:col-span-8 flex flex-col justify-between h-full">
            <p className="text-[15px] md:text-[17px] text-white/90 leading-relaxed font-normal text-left mb-8">
              Changing the world through travel: that’s been our goal.Changing the world through travel: that’s been our goal.Changing the world at’s been our through travel: that’s been our goal.Changing the world through travel: that’s been our goal.Changing the world at’s been our through travel: that’s been our goal.Changing the world through travel: that’s been our goal.Changing the world through travel: that’s been our goal.Changing the world through travel: that’s been our goal.Changing
            </p>

            {/* Divider line */}
            <div className="w-full h-[1px] bg-white/20 mb-8" />

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 text-left">
              {/* Stat 1 */}
              <div className="flex flex-col pr-4 border-r border-white/20">
                <span className="text-3xl md:text-5xl font-semibold mb-2">40</span>
                <span className="text-[11px] md:text-sm text-white/70 font-medium leading-tight">Places you can't mis out</span>
              </div>
              {/* Stat 2 */}
              <div className="flex flex-col px-2 md:px-4 border-r border-white/20">
                <span className="text-3xl md:text-5xl font-semibold mb-2">5+</span>
                <span className="text-[11px] md:text-sm text-white/70 font-medium leading-tight">Categories</span>
              </div>
              {/* Stat 3 */}
              <div className="flex flex-col pl-4">
                <span className="text-3xl md:text-5xl font-semibold mb-2">100%</span>
                <span className="text-[11px] md:text-sm text-white/70 font-medium leading-tight">Guaranteed Departure</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story / Cliff Jumping Section */}
      <section className="py-20 md:py-28 bg-white px-4 md:px-6">
        <div className="w-full mx-auto text-left">
          {/* Badge & Title */}
          <div className="mb-10 md:mb-14">
            <span className="inline-block bg-[#eef1f6] text-[#3F3F42] text-xs font-semibold px-3 py-1 rounded-full mb-3">
              Popular Tours
            </span>
            <h2 className="text-4xl md:text-[54px] lg:text-[62px] font-semibold text-[#3F3F42] tracking-tight leading-[1.08] mb-6 max-w-4xl">
              Every adventure deserves a little magic—and a tree.
            </h2>
            <p className="text-base md:text-lg lg:text-[19px] text-gray-600 font-normal leading-relaxed max-w-3xl">
              When you travel with Nothing but Adventures, you’re not just exploring new places—you’re helping something beautiful grow. Here’s the story of how it happens:
            </p>
          </div>

          {/* Two-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left Column: Stacked Cards */}
            <div className="lg:col-span-6 flex flex-col gap-6 justify-center">
              {/* Card 1 */}
              <div className="bg-[#F8FAFD] rounded-[20px] p-6 md:p-8 flex items-center gap-6 md:gap-8 transition-shadow duration-300">
                <Image
                  src="/tp1.svg"
                  alt="You set off on an adventure icon"
                  width={96}
                  height={96}
                  className="w-20 h-20 md:w-24 md:h-24 shrink-0 object-contain"
                />
                <div className="flex flex-col">
                  <h3 className="text-xl md:text-2xl font-bold text-[#3F3F42] mb-2 leading-tight">
                    You set off on an adventure
                  </h3>
                  <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                    The moment your trip is booked and paid, we start preparing your tree bundle — one tree for every day of your journey.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-[#F8FAFD] rounded-[20px] p-6 md:p-8 flex items-center gap-6 md:gap-8 transition-shadow duration-300">
                <Image
                  src="/tp2.svg"
                  alt="We grow your trees icon"
                  width={96}
                  height={96}
                  className="w-20 h-20 md:w-24 md:h-24 shrink-0 object-contain"
                />
                <div className="flex flex-col">
                  <h3 className="text-xl md:text-2xl font-bold text-[#3F3F42] mb-2 leading-tight">
                    We grow your trees
                  </h3>
                  <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                    With the help of our local partners, your trees are planted and cared for. They grow strong, while locals nurture them like old friends.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-[#F8FAFD] rounded-[20px] p-6 md:p-8 flex items-center gap-6 md:gap-8 transition-shadow duration-300">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#eef1f6] flex items-center justify-center shrink-0 text-[#3F3F42]">
                  <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-xl md:text-2xl font-bold text-[#3F3F42] mb-2 leading-tight">
                    Watch them grow
                  </h3>
                  <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                    See your forest grow! Log in to your account, track your trees, and add a few more if you want. Every branch tells the story of your adventure.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Image */}
            <div className="lg:col-span-6 relative min-h-[450px] lg:min-h-[600px] rounded-[24px] overflow-hidden">
              <Image
                src="/tree_planting_story.png"
                alt="People jumping off a cliff into a scenic alpine lake"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why do we love trees Section */}
      <section className="py-20 md:py-28 bg-[#FAF9F6]/30 px-4 md:px-6">
        <div className="max-w-full mx-auto text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left Column: Text Content */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <h2 className="text-3xl md:text-[44px] font-bold text-[#3F3F42] tracking-tight leading-tight mb-8 max-w-xl">
                Why do we love trees?<br />Let’s count the ways.
              </h2>
              <div className="space-y-6 text-gray-600 text-sm md:text-[15px] leading-relaxed max-w-xl font-normal">
                <p>
                  Sure, trees are beautiful—they make every forest walk feel magical. But they’re not just eye candy. Trees are superheroes for our planet. They soak up harmful gases like carbon dioxide and gift us fresh, clean oxygen. They’re cozy homes and grocery stores for wildlife, from three-toed sloths to playful macaques. And when nature throws a tantrum—droughts, floods, wild weather—trees help the land bounce back.
                </p>
                <p>
                  So yes, trees are majestic. But they’re also lifesavers, protectors, and silent partners in every adventure we take.
                </p>
              </div>
            </div>

            {/* Right Column: Image */}
            <div className="lg:col-span-6 relative min-h-[450px] lg:min-h-[600px] rounded-[24px] overflow-hidden">
              <Image
                src="/why_we_love_trees.png"
                alt="Local hosts preparing fresh food and herbs"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Global Tree-nitiative Section */}
      <section className="py-20 md:py-28 bg-white px-4 md:px-6 border-t border-gray-100">
        <div className="max-w-full mx-auto text-left">
          {/* Header Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-12">
            {/* Title & Description */}
            <div className="lg:col-span-7 text-left">
              <span className="inline-block bg-[#eef1f6] text-[#3F3F42] text-xs font-semibold px-3 py-1 rounded-full mb-3">
                Popular Tours
              </span>
              <h2 className="text-3xl md:text-[44px] font-bold text-[#3F3F42] tracking-tight leading-tight mb-4">
                Our global tree-nitiative
              </h2>
              <p className="text-sm md:text-[15px] text-gray-600 font-normal leading-relaxed max-w-2xl">
                From little extras to big “no way” moments, here’s what From little extras to big “no way” moments, here’s what From little extras to big “no way” moments, here’s what From little extras to big “no way” moments, here’s what
              </p>
            </div>

            {/* Stat Cards */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {/* Stat Card 1 */}
              <div className="bg-[#F8FAFD] rounded-[20px] p-6  flex flex-col items-start text-left">
                <div className="w-10 h-10 rounded-full bg-[#eef1f6] flex items-center justify-center shrink-0 text-[#3F3F42] mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3 className="text-[17px] font-bold text-[#3F3F42] mb-1 leading-tight">
                  110 Trees Planted
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  You’ve done some pretty amazing things out there.
                </p>
              </div>

              {/* Stat Card 2 */}
              <div className="bg-[#F8FAFD] rounded-[20px] p-6  flex flex-col items-start text-left">
                <div className="w-10 h-10 rounded-full bg-[#eef1f6] flex items-center justify-center shrink-0 text-[#3F3F42] mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3 className="text-[17px] font-bold text-[#3F3F42] mb-1 leading-tight">
                  12 Being Planted today
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  You’ve done some pretty amazing things out there.
                </p>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left Column: Stacked Cards */}
            <div className="lg:col-span-5 flex flex-col gap-5 justify-between">
              {/* Card 1 */}
              <div className="bg-[#F8FAFD] rounded-[20px] p-5 flex items-start gap-5 transition-shadow duration-300">
                <div className="w-12 h-12 rounded-full bg-[#eef1f6] flex items-center justify-center shrink-0 text-[#3F3F42]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div className="flex flex-col text-left">
                  <h3 className="text-base md:text-[17px] font-bold text-[#3F3F42] mb-1 leading-tight">
                    And the award goes to...
                  </h3>
                  <p className="text-gray-500 text-xs md:text-[13px] leading-relaxed">
                    You’ve done some pretty amazing things out there.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-[#F8FAFD] rounded-[20px] p-5 flex items-start gap-5  transition-shadow duration-300">
                <div className="w-12 h-12 rounded-full bg-[#eef1f6] flex items-center justify-center shrink-0 text-[#3F3F42]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div className="flex flex-col text-left">
                  <h3 className="text-base md:text-[17px] font-bold text-[#3F3F42] mb-1 leading-tight">
                    And the award goes to...
                  </h3>
                  <p className="text-gray-500 text-xs md:text-[13px] leading-relaxed">
                    You’ve done some pretty amazing things out there.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-[#F8FAFD] rounded-[20px] p-5 flex items-start gap-5  transition-shadow duration-300">
                <div className="w-12 h-12 rounded-full bg-[#eef1f6] flex items-center justify-center shrink-0 text-[#3F3F42]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div className="flex flex-col text-left">
                  <h3 className="text-base md:text-[17px] font-bold text-[#3F3F42] mb-1 leading-tight">
                    And the award goes to...
                  </h3>
                  <p className="text-gray-500 text-xs md:text-[13px] leading-relaxed">
                    You’ve done some pretty amazing things out there.
                  </p>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-[#F8FAFD] rounded-[20px] p-5 flex items-start gap-5 transition-shadow duration-300">
                <div className="w-12 h-12 rounded-full bg-[#eef1f6] flex items-center justify-center shrink-0 text-[#3F3F42]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div className="flex flex-col text-left">
                  <h3 className="text-base md:text-[17px] font-bold text-[#3F3F42] mb-1 leading-tight">
                    And the award goes to...
                  </h3>
                  <p className="text-gray-500 text-xs md:text-[13px] leading-relaxed">
                    You’ve done some pretty amazing things out there.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Image */}
            <div className="lg:col-span-7 relative min-h-[450px] lg:min-h-[550px] rounded-[24px] overflow-hidden">
              <Image
                src="/mountain_hikers.png"
                alt="People sitting on a green hill overlooking alpine mountains"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-28 bg-[#F4F7FC]/10 px-4 md:px-6 border-t border-gray-100">
        <div className="max-w-full mx-auto text-left">
          {/* Badge & Title */}
          <div className="mb-10 md:mb-14">
            <span className="inline-block bg-[#eef1f6] text-[#3F3F42] text-xs font-semibold px-3 py-1 rounded-full mb-3">
              FAQ's
            </span>
            <h2 className="text-3xl md:text-[44px] font-bold text-[#3F3F42] tracking-tight leading-tight max-w-3xl">
              Because planning should feel exciting, not exhausting.
            </h2>
          </div>

          {/* Accordion List */}
          <div className="space-y-4 max-w-full">
            {/* FAQ 1 */}
            <details className="group bg-[#F8FAFD] rounded-[20px] overflow-hidden transition-all duration-300 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer p-6 text-[#3F3F42] font-semibold select-none">
                <span className="text-sm md:text-base pr-4">What should I bring for the tour?</span>
                <span className="text-[#3F3F42] group-open:rotate-180 transition-transform duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
              </summary>
              <div className="px-6 pb-6 text-sm md:text-[15px] text-gray-600 leading-relaxed pt-2">
                We recommend comfortable walking shoes, a reusable water bottle, weather-appropriate clothing (layers are best), sunscreen, a hat, and a camera. Specific gear requirements will be emailed to you before departure.
              </div>
            </details>

            {/* FAQ 2 */}
            <details className="group bg-[#F8FAFD] rounded-[20px] overflow-hidden transition-all duration-300 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer p-6 text-[#3F3F42] font-semibold select-none">
                <span className="text-sm md:text-base pr-4">Is pickup and drop-off included?</span>
                <span className="text-[#3F3F42] group-open:rotate-180 transition-transform duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
              </summary>
              <div className="px-6 pb-6 text-sm md:text-[15px] text-gray-600 leading-relaxed pt-2">
                Yes, complimentary pickup and drop-off are included from designated central locations or partner hotels. You will receive exact timing details and pickup coordinates 48 hours prior to the tour start.
              </div>
            </details>

            {/* FAQ 3 */}
            <details className="group bg-[#F8FAFD] rounded-[20px] overflow-hidden transition-all duration-300 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer p-6 text-[#3F3F42] font-semibold select-none">
                <span className="text-sm md:text-base pr-4">Are the tours suitable for children?</span>
                <span className="text-[#3F3F42] group-open:rotate-180 transition-transform duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
              </summary>
              <div className="px-6 pb-6 text-sm md:text-[15px] text-gray-600 leading-relaxed pt-2">
                Many of our adventures are family-friendly, but some require a minimum age due to physical demands or safety guidelines. Check the specific tour details page or contact our support team to find the perfect adventure for your family.
              </div>
            </details>

            {/* FAQ 4 */}
            <details className="group bg-[#F8FAFD] rounded-[20px] overflow-hidden transition-all duration-300 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer p-6 text-[#3F3F42] font-semibold select-none">
                <span className="text-sm md:text-base pr-4">What happens in case of bad weather?</span>
                <span className="text-[#3F3F42] group-open:rotate-180 transition-transform duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
              </summary>
              <div className="px-6 pb-6 text-sm md:text-[15px] text-gray-600 leading-relaxed pt-2">
                Your safety is our top priority. In case of severe weather, tours may be rescheduled or alternative itineraries provided. If a tour is canceled entirely by us due to weather, you will receive a full refund or credit.
              </div>
            </details>
          </div>
        </div>
      </section>
    </main>
  );
}
