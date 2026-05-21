"use client";

import { useState } from "react";
import Image from "next/image";

export default function NBAClubPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API request
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      setFormData({ firstName: "", lastName: "", email: "" });
    }, 1000);
  };

  return (
    <main className="min-h-screen w-full bg-white pt-2 pb-0 font-sans">
      <div className="px-4 md:px-6">
        {/* Hero Section */}
        <div className="relative w-full aspect-[16/9] rounded-[16px] overflow-hidden bg-gray-100 shadow-sm border border-gray-100">
          <Image
            src="/nba_club_hero.png"
            alt="NBA Club members on a dock"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* NBA Club Video Section */}
        <div className="mt-12 md:mt-16">
          {/* Badge & Title */}
          <div className="mb-6">
            <span className="inline-block bg-[#eef1f6] text-[#5c6e80] text-xs font-semibold px-3 py-1 rounded-full mb-3">
              Popular Tours
            </span>
            <h1 className="text-4xl md:text-[54px] font-bold text-gray-900 tracking-tight leading-tight">
              NBA Club
            </h1>
            <p className="text-base md:text-lg text-gray-600 mt-2 font-normal">
              Changing the world through travel: that's been our goal.
            </p>
          </div>

          {/* Video Container Card */}
          <div className="bg-[#F4F7FC] rounded-[24px] p-6 md:p-8 lg:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12
            ">
              {/* Text Side */}
              <div className="lg:col-span-4 text-gray-700 text-sm md:text-[15px] leading-[1.6] text-left">
                Changing the world through travel: that's been our goal.Changing the world through travel: that's been our goal.Changing the world at's been our through travel: that's been our goal.Changing the world through travel: that's been our goal.Changing the world at's been our through travel: that's been our goal.Changing the world through travel: that's been our goal.Changing the world through travel: that's been our goal.Changing the world through travel: that's been our goal.Changing
              </div>

              {/* Video Side */}
              <div className="lg:col-span-8 relative aspect-[16/10] w-full rounded-2xl overflow-hidden group cursor-pointer shadow-sm">
                <Image
                  src="/nba_club_video_thumbnail.png"
                  alt="NBA Club video preview"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-black/15 transition-colors duration-300">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-[3px] border-white flex items-center justify-center text-white bg-black/10 group-hover:scale-110 transition-transform duration-300 backdrop-blur-[1px]">
                    <svg className="w-6 h-6 md:w-8 md:h-8 fill-current translate-x-0.5" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Three tiers of Adventures Section */}
        <div className="mt-16 md:mt-24">
          <h2 className="text-3xl md:text-[44px] font-bold text-gray-900 tracking-tight mb-8 md:mb-12">
            Three tiers of Adventures
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Card 1: Explorer */}
            <div className="bg-[#AEA9EB] rounded-[24px] p-8 md:p-10 flex flex-col h-full text-left min-h-[380px] justify-between">
              <div>
                <svg className="w-12 h-12 text-[#111111] mb-8" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="22" cy="22" r="16" />
                  <line x1="22" y1="6" x2="22" y2="38" />
                  <line x1="6" y1="22" x2="38" y2="22" />
                  <path d="M22 6 A 8 16 0 0 0 22 38" />
                  <path d="M22 6 A 8 16 0 0 1 22 38" />
                  <path d="M6 22 A 16 8 0 0 0 38 22" />
                  <path d="M6 22 A 16 8 0 0 1 38 22" />
                  <circle cx="36" cy="36" r="7" fill="#AEA9EB" stroke="currentColor" strokeWidth="2.5" />
                  <path d="M36 31.5 V36 H40.5" />
                </svg>
                <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-1">
                  Explorer
                </h3>
                <p className="text-sm md:text-base font-normal text-gray-800 mb-6">
                  4 to 9 Tours
                </p>
              </div>
              <p className="text-sm md:text-base text-gray-800/85 leading-relaxed">
                Curiosity leading the charge. Every turn is a question, every journey a first of many.
              </p>
            </div>

            {/* Card 2: Adventurer */}
            <div className="bg-[#C7C7CA] rounded-[24px] p-8 md:p-10 flex flex-col h-full text-left min-h-[380px] justify-between">
              <div>
                <svg className="w-12 h-12 text-[#111111] mb-8" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="22" cy="22" r="16" />
                  <line x1="22" y1="6" x2="22" y2="38" />
                  <line x1="6" y1="22" x2="38" y2="22" />
                  <path d="M22 6 A 8 16 0 0 0 22 38" />
                  <path d="M22 6 A 8 16 0 0 1 22 38" />
                  <path d="M6 22 A 16 8 0 0 0 38 22" />
                  <path d="M6 22 A 16 8 0 0 1 38 22" />
                  <circle cx="36" cy="36" r="7" fill="#C7C7CA" stroke="currentColor" strokeWidth="2.5" />
                  <path d="M36 31.5 V36 H40.5" />
                </svg>
                <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-1">
                  Adventurer
                </h3>
                <p className="text-sm md:text-base font-normal text-gray-800 mb-6">
                  10 to 14 Tours
                </p>
              </div>
              <p className="text-sm md:text-base text-gray-800/85 leading-relaxed">
                Comfort zones? Long gone. Leaning into the unknown—and loving every second of it.
              </p>
            </div>

            {/* Card 3: Limitless */}
            <div className="bg-[#E5E29F] rounded-[24px] p-8 md:p-10 flex flex-col h-full text-left min-h-[380px] justify-between">
              <div>
                <svg className="w-12 h-12 text-[#111111] mb-8" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="22" cy="22" r="16" />
                  <line x1="22" y1="6" x2="22" y2="38" />
                  <line x1="6" y1="22" x2="38" y2="22" />
                  <path d="M22 6 A 8 16 0 0 0 22 38" />
                  <path d="M22 6 A 8 16 0 0 1 22 38" />
                  <path d="M6 22 A 16 8 0 0 0 38 22" />
                  <path d="M6 22 A 16 8 0 0 1 38 22" />
                  <circle cx="36" cy="36" r="7" fill="#E5E29F" stroke="currentColor" strokeWidth="2.5" />
                  <path d="M36 31.5 V36 H40.5" />
                </svg>
                <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-1">
                  Limitless
                </h3>
                <p className="text-sm md:text-base font-normal text-gray-800 mb-6">
                  15+ Tours
                </p>
              </div>
              <p className="text-sm md:text-base text-gray-800/85 leading-relaxed">
                Where “too far” simply doesn’t exist. Distance is just detail—there’s always another horizon calling.
              </p>
            </div>
          </div>
        </div>

        {/* Perks Section */}
        <div className="mt-16 md:mt-24">
          {/* Badge & Title */}
          <div className="mb-8">
            <span className="inline-block bg-[#eef1f6] text-[#5c6e80] text-xs font-semibold px-3 py-1 rounded-full mb-3">
              Popular Tours
            </span>
            <h2 className="text-3xl md:text-[44px] font-bold text-gray-900 tracking-tight leading-tight">
              The perks of playing it great
            </h2>
            <p className="text-base md:text-lg text-gray-600 mt-2 font-normal">
              From little extras to big “no way” moments, here’s what comes with being a Great Adventurer.
            </p>
          </div>

          {/* Perks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Card 1 */}
            <div className="bg-[#F8FAFD] rounded-[20px] p-6 md:p-8 flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-full bg-[#eef1f6] flex items-center justify-center mb-5 shrink-0">
                <svg className="w-5 h-5 text-[#475569]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 leading-tight">
                Great Adventure Credit
              </h3>
              <p className="text-gray-600 text-sm md:text-[15px] leading-relaxed">
                Take your first tour of the year, and we'll add a little credit to your account for the next one. Use it however you like—and yes, you can stack it with other deals.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#F8FAFD] rounded-[20px] p-6 md:p-8 flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-full bg-[#eef1f6] flex items-center justify-center mb-5 shrink-0">
                <svg className="w-5 h-5 text-[#475569]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 leading-tight">
                The sweetest savings
              </h3>
              <p className="text-gray-600 text-sm md:text-[15px] leading-relaxed">
                A little thank-you for doing what you love. Enjoy exclusive deals and discounts made just for you.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#F8FAFD] rounded-[20px] p-6 md:p-8 flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-full bg-[#eef1f6] flex items-center justify-center mb-5 shrink-0">
                <svg className="w-5 h-5 text-[#475569]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 leading-tight">
                Twice the trees
              </h3>
              <p className="text-gray-600 text-sm md:text-[15px] leading-relaxed">
                Every trip you take does a bit of good, too. For each day you travel, we'll plant two trees on your behalf.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-[#F8FAFD] rounded-[20px] p-6 md:p-8 flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-full bg-[#eef1f6] flex items-center justify-center mb-5 shrink-0">
                <svg className="w-5 h-5 text-[#475569]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 leading-tight">
                Top of the list
              </h3>
              <p className="text-gray-600 text-sm md:text-[15px] leading-relaxed">
                The best invites go out early—and you're on that list. From big celebrations to travel events, you'll get first dibs on tickets.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-[#F8FAFD] rounded-[20px] p-6 md:p-8 flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-full bg-[#eef1f6] flex items-center justify-center mb-5 shrink-0">
                <svg className="w-5 h-5 text-[#475569]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 leading-tight">
                At your service
              </h3>
              <p className="text-gray-600 text-sm md:text-[15px] leading-relaxed">
                Need help? Got a question? Just reach out. You'll get priority support, wherever you are in the world.
              </p>
            </div>

            {/* Card 6 */}
            <div className="bg-[#F8FAFD] rounded-[20px] p-6 md:p-8 flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-full bg-[#eef1f6] flex items-center justify-center mb-5 shrink-0">
                <svg className="w-5 h-5 text-[#475569]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 leading-tight">
                Expect the unexpected
              </h3>
              <p className="text-gray-600 text-sm md:text-[15px] leading-relaxed">
                We like a good surprise. So every now and then, we'll send a few extra perks your way—just because.
              </p>
            </div>

            {/* Card 7 */}
            <div className="bg-[#F8FAFD] rounded-[20px] p-6 md:p-8 flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-full bg-[#eef1f6] flex items-center justify-center mb-5 shrink-0">
                <svg className="w-5 h-5 text-[#475569]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 leading-tight">
                Front-of-the-line access
              </h3>
              <p className="text-gray-600 text-sm md:text-[15px] leading-relaxed">
                No waiting around here. You'll be first to check out new tours, fresh travel styles, and what's coming next.
              </p>
            </div>

            {/* Card 8 */}
            <div className="bg-[#F8FAFD] rounded-[20px] p-6 md:p-8 flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-full bg-[#eef1f6] flex items-center justify-center mb-5 shrink-0">
                <svg className="w-5 h-5 text-[#475569]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 leading-tight">
                And the award goes to...
              </h3>
              <p className="text-gray-600 text-sm md:text-[15px] leading-relaxed">
                You've done some pretty amazing things out there. We'll make sure you've got something to show for it.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <section className="bg-[#EAEAEA] mt-24 py-24 px-4 md:px-6">
        <div className="max-w-[760px] mx-auto text-center">
          <h2 className="text-3xl md:text-[44px] font-bold text-gray-900 tracking-tight mb-4">
            Adventure, delivered to your inbox
          </h2>
          <p className="text-gray-600 text-sm md:text-[16px] leading-relaxed max-w-[620px] mx-auto mb-10">
            Sign up for our newsletter and get all your travel inspo, promotions, and Nothing but Adventures news in one convenient place.
          </p>

          <div className="bg-white rounded-[24px] p-6 md:p-10 lg:p-12 shadow-[0_10px_40px_rgba(0,0,0,0.03)] text-left">
            {subscribed ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Welcome to the Club!
                </h3>
                <p className="text-gray-600 text-sm md:text-base font-medium max-w-[400px] mx-auto">
                  Thank you for subscribing. We will send you the best adventure inspiration shortly!
                </p>
                <button
                  onClick={() => setSubscribed(false)}
                  className="mt-6 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Subscribe another email
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-[12px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all font-medium"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-[12px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all font-medium"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-[12px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all font-medium"
                  />
                </div>
                <p className="text-[11px] md:text-[12px] text-gray-500 leading-relaxed pl-1">
                  By submitting this form, you agree to our privacy policy. We'll never share your information with third parties and will only use it to create your perfect Indian adventure.
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#111111] hover:bg-black text-white py-4 rounded-full font-medium text-sm md:text-base flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-75"
                >
                  <span>{loading ? "Subscribing..." : "Subscribe"}</span>
                  {!loading && (
                    <svg className="w-4 h-4 md:w-5 md:h-5 translate-y-[1px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

