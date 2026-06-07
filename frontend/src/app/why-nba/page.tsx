import { ArrowUpRight, Sprout } from "lucide-react";

export default function WhyNBAPage() {
  return (
    <>
      <div className="bg-white min-h-screen pb-20 font-outfit">
        <div className="w-full px-4 md:px-8 pt-10 md:pt-16">
          {/* Top Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Left Column */}
            <div className="flex flex-col items-start">
              <span className="bg-[#EAEAEA] text-[#3F3F42] text-[14px] px-5 py-2 rounded-full mb-8 font-medium">
                Popular Tours
              </span>
              <h1 className="text-[44px] md:text-[56px] lg:text-[64px] font-medium leading-[1.15] text-[#3F3F42]">
                About our community
                <br />
                Travel the World
                <br />
                With NBA
              </h1>
            </div>

            {/* Right Column (Text Box) */}
            <div className="flex flex-col items-start lg:pt-16 w-full">
              <div className="bg-[#F6F9FD] rounded-2xl p-8 flex flex-col w-full mb-6">
                <div className="text-[17px] leading-[1.6] text-[#3F3F42]">
                  Changing the world through travel: that's been our goal since
                  1990. Sure, call us dreamers (wouldn't be the first time), but that
                  idea has been at the heart of everything we've ever done and has
                  helped us grow into one of the biggest adventure travel
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="bg-[#3F3F42] hover:bg-[#3F3F42] text-white px-7 py-3 rounded-full text-[15px] font-medium transition-colors">
                  Read More
                </button>
                <button className="bg-[#3F3F42] hover:bg-[#3F3F42] text-white w-12 h-12 rounded-full flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Hero Image Section */}
          <div className="mt-16 md:mt-24 w-full h-[400px] md:h-[600px] relative rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop"
              alt="People enjoying nature"
              className="w-full h-full object-cover"
            />
          </div>

          {/* 3-Column Features Section */}
          <div className="mt-24 md:mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 items-start">
            {/* First Column (Text) */}
            <div className="flex flex-col items-start">
              <span className="bg-[#EAEAEA] text-[#3F3F42] text-[14px] px-5 py-2 rounded-full mb-8 font-medium">
                Popular Tours
              </span>
              <h2 className="text-[40px] md:text-[48px] font-medium leading-[1.2] text-[#3F3F42] mb-6">
                H1 heading
              </h2>
              <p className="text-[18px] text-[#3F3F42] mb-8 leading-[1.5]">
                Changing the world through travel: that's been our goal.
              </p>
              <div className="bg-[#F6F9FD] rounded-2xl p-6 md:p-8 text-[#3F3F42] text-[15px] leading-[1.6]">
                Changing the world through travel: that's been our
                goal.Changing the world through travel: that's been our
                goal.Changing the world at's been our through travel: that's
                been our goal.Changing the world through travel: that's been
                our goal.Changing the world at's been our through travel: that's
                been our goal.Changing the world through travel: that's been
                our goal.Changing the world through travel: that's been our
                goal.Changing the world through travel: that
              </div>
            </div>

            {/* Second Column (Image 1) */}
            <div className="flex flex-col gap-4">
              <div className="w-full aspect-[4/5] relative rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop"
                  alt="Jumping into water"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[#3F3F42] text-[15px] pl-2 font-medium">
                Changing the world through travel
              </p>
            </div>

            {/* Third Column (Image 2) */}
            <div className="flex flex-col gap-4">
              <div className="w-full aspect-[4/5] relative rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1000&auto=format&fit=crop"
                  alt="Hiker in mountains"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[#3F3F42] text-[15px] pl-2 font-medium">
                Changing the world through travel
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* What Makes Us Different Section */}
      <div className="w-full bg-[#F6F9FD] py-20 md:py-32 px-4 md:px-8 mt-24">
        {/* Header */}
        <div className="flex flex-col items-start mb-16 md:mb-24 max-w-4xl mx-auto md:mx-0">
          <span className="bg-[#EAEAEA] text-[#3F3F42] text-[14px] px-5 py-2 rounded-full mb-8 font-medium">
            Popular Tours
          </span>
          <h2 className="text-[40px] md:text-[56px] font-medium leading-[1.2] text-[#3F3F42] mb-6">
            What Makes us Different
          </h2>
          <p className="text-[18px] text-[#3F3F42] leading-[1.6]">
            Changing the world through travel: that's been our goal since 1990.Changing the world through travel:
          </p>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-10 items-start">
          {/* Left Column */}
          <div className="flex flex-col gap-16 md:gap-24">
            {[
              {
                image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop",
                title: "Book with all the confidence in the world",
                description: "From Saving your Spot to Lifetime Deposits to no single supplements and 100% Guaranteed Departures, we make booking feel as good as going. Got questions? Our team's here 24/7 - because peace of mind should come standard.",
                aspectRatio: "aspect-[4/5]"
              },
              {
                image: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1000&auto=format&fit=crop",
                title: "Solo or sociable your choice",
                description: "Want group travel that doesn't feel like group travel? You're reading the right brochure. Our trips combine the security and camaraderie of travelling with others, with the freedom to do your own thing. You get well-planned itineraries that include the perfect amount of free time for optional activities, or doing whatever else your adventurous heart desires.",
                aspectRatio: "aspect-[4/5]"
              },
              {
                image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop",
                title: "Immersive experiences are how we roll",
                description: "Seeing the world is fun! But experiencing it? That's where the magic happens. With us, you're not just sitting down for a local meal or watching a traditional dance from the sidelines. Our trips get you in the action, like breaking bread with local families right in their home, or busting moves as if you're part of the dance troupe yourself.",
                aspectRatio: "aspect-[4/3]"
              }
            ].map((feature, idx) => (
              <div key={idx} className="flex flex-col gap-6">
                <div className={`w-full ${feature.aspectRatio} relative rounded-2xl overflow-hidden`}>
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <h3 className="text-[28px] md:text-[32px] font-medium text-[#3F3F42] leading-[1.3]">
                    {feature.title}
                  </h3>
                  <p className="text-[16px] text-[#3F3F42] leading-[1.6]">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-16 md:gap-24">
            {[
              {
                image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop",
                title: "Immersive experiences are how we roll",
                description: "Seeing the world is fun! But experiencing it? That's where the magic happens. With us, you're not just sitting down for a local meal or watching a traditional dance from the sidelines. Our trips get you in the action, like breaking bread with local families right in their home, or busting moves as if you're part of the dance troupe yourself.",
                aspectRatio: "aspect-[4/3]"
              },
              {
                image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop",
                title: "Small Groups, Big Adventures",
                description: "We keep our groups small to keep you feeling connected to the places you're exploring and the group-mates you're doing it alongside. And because our groups are made up of travellers from countries all across the planet, you'll be experiencing the world just by who you're travelling it with.",
                aspectRatio: "aspect-[4/3]"
              },
              {
                image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop",
                title: "Book with all the confidence in the world",
                description: "From Saving your Spot to Lifetime Deposits to no single supplements and 100% Guaranteed Departures, we make booking feel as good as going. Got questions? Our team's here 24/7 - because peace of mind should come standard.",
                aspectRatio: "aspect-[4/5]"
              }
            ].map((feature, idx) => (
              <div key={idx} className="flex flex-col gap-6">
                <div className={`w-full ${feature.aspectRatio} relative rounded-2xl overflow-hidden`}>
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <h3 className="text-[28px] md:text-[32px] font-medium text-[#3F3F42] leading-[1.3]">
                    {feature.title}
                  </h3>
                  <p className="text-[16px] text-[#3F3F42] leading-[1.6]">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Good Karma Section */}
      <div className="w-full bg-white py-20 md:py-32 px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col items-start mb-12 max-w-4xl mx-auto md:mx-0">
          <span className="bg-[#EAEAEA] text-[#3F3F42] text-[14px] px-5 py-2 rounded-full mb-8 font-medium">
            Popular Tours
          </span>
          <h2 className="text-[40px] md:text-[56px] font-medium leading-[1.2] text-[#3F3F42] mb-6">
            Good Karma
          </h2>
          <p className="text-[18px] text-[#3F3F42] leading-[1.6]">
            Changing the world through travel: that's been our goal since 1990.Changing the world through travel:
          </p>
        </div>

        {/* Large Media Placeholder */}
        <div className="w-full aspect-[4/3] md:aspect-[21/9] lg:aspect-[2.5/1] bg-[#D9D9D9] rounded-2xl mb-16">
        </div>

        {/* 3 Column Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-[#F8F9FA] rounded-2xl p-8 md:p-10 flex flex-col items-start gap-4">
              <Sprout className="w-16 h-16 text-[#3F3F42] mb-2" strokeWidth={1} />
              <h3 className="text-[20px] font-semibold text-[#3F3F42]">Tree Plantation</h3>
              <p className="text-[15px] text-[#3F3F42] leading-[1.6]">
                Tree plantation restores ecosystems, improves air quality, combats climate change, supports biodiversity, conserves water, enriches soil, and builds a healthier future.Tree plantation restores ecosystems, improves air quality, combats climate change, supports biodiversity, conserves water, enriches soil, and builds a healthier future.
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA / Stats Section */}
      <div
        className="relative w-full h-[1200px] md:h-[1200px] flex flex-col justify-between overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2000&auto=format&fit=crop')" }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-[#3F3F42]/40 z-0"></div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto h-full px-4 md:px-8 py-30 md:py-40 flex flex-col">
          {/* Top Heading */}
          <div className="flex flex-col gap-4 text-white">
            <h2 className="text-[48px] md:text-[64px] font-medium leading-[1.1]">
              Next<br />Adventure :<br />The World
            </h2>
            <p className="text-[20px] md:text-[24px]">
              All subcontinents, a mix of<br />Promise
            </p>
          </div>

          {/* Bottom Stats Grid & Button */}
          <div className="mt-auto w-full flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-3 text-white w-full">
              {/* Row 1 */}
              <div className="md:col-span-1 border-b border-white/40 md:border-r py-8 md:py-10 flex items-center gap-4">
                <span className="text-[56px] font-medium leading-none">300+</span>
                <span className="text-[18px] font-medium max-w-[150px] leading-snug">Number of Adventures</span>
              </div>
              <div className="md:col-span-2 border-b border-white/40 py-8 md:py-10 md:pl-12 flex flex-col justify-center">
                <span className="text-[56px] font-medium leading-none mb-1">7</span>
                <span className="text-[18px] font-medium">Subcontinents</span>
              </div>

              {/* Row 2 */}
              <div className="md:col-span-1 border-b md:border-b-0 border-white/40 md:border-r py-8 md:py-10 flex flex-col justify-center">
                <span className="text-[56px] font-medium leading-none mb-1">40</span>
                <span className="text-[18px] font-medium leading-snug">Places you can't<br />miss out</span>
              </div>
              <div className="md:col-span-1 border-b md:border-b-0 border-white/40 md:border-r py-8 md:py-10 md:px-12 flex flex-col justify-center">
                <span className="text-[56px] font-medium leading-none mb-1">5+</span>
                <span className="text-[18px] font-medium">Categories</span>
              </div>
              <div className="md:col-span-1 py-8 md:py-10 md:pl-12 flex flex-col justify-center">
                <span className="text-[56px] font-medium leading-none mb-1">100%</span>
                <span className="text-[18px] font-medium">Guaranteed Departure</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end items-center gap-3 mt-4 md:mt-8">
              <button className="bg-white hover:bg-gray-100 text-[#3F3F42] px-7 py-3 rounded-full text-[15px] font-medium transition-colors shadow-sm">
                View all Tours
              </button>
              <button className="bg-white hover:bg-gray-100 text-[#3F3F42] w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm">
                <ArrowUpRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
