import React from 'react';
import { ArrowUpRight, Globe } from 'lucide-react';

export default function AboutUsPage() {
  return (
    <div className="bg-white min-h-screen font-outfit">
      {/* Hero Image Section */}
      <div className="w-full h-[90vh] md:h-[96vh] relative">
        <img
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2074&auto=format&fit=crop"
          alt="Breathtaking mountain landscape"
          className="w-full h-full object-cover"
        />
      </div>

      {/* About Our Community Section */}
      <div className="w-full px-4 md:px-8 py-12 md:py-16">
        <div className="w-full bg-[#F6F9FD] rounded-2xl p-8 md:p-12">
          <h2 className="text-[40px] md:text-[56px] font-medium leading-[1.1] text-[#111] mb-10">
            About our<br />community
          </h2>
          <div className="text-[16px] md:text-[18px] text-[#333] leading-[1.6]">
            <p>
              Changing the world through travel: that's been our goal since 1990. Sure, call us dreamers (wouldn't be the first time), but that idea has been at the heart of everything we've ever done and has helped us grow into one of the biggest adventure travel companies on the planet. *woot woot*<br />
              But, to us, being big is meaningless if it comes at the expense of making someone else feel small. You know what... let's drop the metaphors and get straight to the point: Nothing but Adventures is a social enterprise as much as we are a small group travel company.<br />
              Changing the world through travel: that's been our goal since 1990. Sure, call us dreamers (wouldn't be the first time), but that idea has been at the heart of everything we've ever done and has helped us grow into one of the biggest adventure travel companies on the planet. *woot woot*<br />
              But, to us, being big is meaningless if it comes at the expense of making someone else feel small. You know what... let's drop the metaphors and get straight to the point: Nothing but Adventures is a social enterprise as much as we are a small group travel company.<br />
              Changing the world through travel: that's been our goal since 1990. Sure, call us dreamers (wouldn't be the first time), but that idea has been at the heart of everything we've ever done and has helped us grow into one of the biggest adventure travel companies on the planet. *woot woot*<br />
              But, to us, being big is meaningless if it comes at the expense of making someone else feel small. You know what... let's drop the metaphors and get straight to the point: Nothing but Adventures is a social enterprise as much as we are a small group travel company.
            </p>
          </div>
        </div>
      </div>

      {/* Zig-Zag Info Sections */}
      <div className="w-full bg-[#F8F9FA] py-20 md:py-32 px-4 md:px-8">
        <div className="w-full flex flex-col gap-20 md:gap-32">

          {/* About Founder Row */}
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <div className="w-full md:w-1/2">
              <div className="w-full aspect-[4/5] md:aspect-[1.1/1] relative rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1000&auto=format&fit=crop"
                  alt="Founder"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 flex flex-col">
              <h2 className="text-[36px] md:text-[48px] font-medium leading-[1.2] text-[#111] mb-6">
                About Founder
              </h2>
              <p className="text-[16px] md:text-[18px] text-[#333] leading-[1.6]">
                Changing the world through travel: that's been our goal since 1990. Sure, call us dreamers (wouldn't be the first time), but that idea has been at the heart of everything we've ever done and has helped us grow into one of the biggest adventure travel companies on the planet. *woot woot*<br />
                But, to us, being big is meaningless if it comes at the expense of making someone else feel small. You know what... let's drop the metaphors and get straight to the point: Nothing but Adventures is a social enterprise as much as we are a small group travel company.
              </p>
            </div>
          </div>

          {/* The Good Karma Row */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-10 md:gap-16">
            <div className="w-full md:w-1/2">
              <div className="w-full aspect-[4/5] md:aspect-[1.1/1] relative rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?q=80&w=1000&auto=format&fit=crop"
                  alt="Explorer in Jungle"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="text-[36px] md:text-[48px] font-medium leading-[1.2] text-[#111] mb-6">
                The Good Karma
              </h2>
              <p className="text-[16px] md:text-[18px] text-[#333] leading-[1.6] mb-8">
                Changing the world through travel: that's been our goal since 1990. Sure, call us dreamers (wouldn't be the first time), but that idea has been at the heart of everything we've ever done and has helped us grow into one of the biggest adventure travel companies on the planet. *woot woot*<br />
                But, to us, being big is meaningless if it comes at the expense of making someone else feel small. You know what... let's drop the metaphors and get straight to the point: Nothing but Adventures is a social enterprise as much as we are a small group travel company.
              </p>
              <div className="flex items-center gap-2">
                <button className="bg-[#111] hover:bg-black text-white px-6 py-2.5 rounded-full text-[14px] font-medium transition-colors">
                  Load More
                </button>
                <button className="bg-[#111] hover:bg-black text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Why Choose NBA Section */}
      <div className="w-full bg-white py-20 md:py-32 px-4 md:px-8">
        <div className="w-full flex flex-col items-start">
          <span className="bg-[#F0F2F5] text-gray-700 text-[13px] px-4 py-1.5 rounded-full mb-8 font-medium">
            Popular Activities
          </span>
          <h2 className="text-[40px] md:text-[52px] font-medium leading-[1.2] text-[#0A1128] mb-6">
            Why Choose Nothing but Adventures
          </h2>
          <p className="text-[16px] md:text-[18px] text-[#4A4A4A] leading-[1.6] mb-16 md:mb-24">
            We never take your choice to spend your hard-earned money with us for granted. Our award-winning trips embrace our broader definition of community tourism to put travellers like you on a first-name basis with the planet's people, cultures, landscapes and wildlife. Here are just a few of the things we offer:
          </p>

          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center gap-6">
              <Globe className="w-24 h-24 text-[#111]" strokeWidth={1} />
              <h3 className="text-[18px] font-medium text-[#333]">Small Groups, Big Adventures</h3>
            </div>
            <div className="flex flex-col items-center gap-6">
              <Globe className="w-24 h-24 text-[#111]" strokeWidth={1} />
              <h3 className="text-[18px] font-medium text-[#333]">Giving Back through Travel</h3>
            </div>
            <div className="flex flex-col items-center gap-6">
              <Globe className="w-24 h-24 text-[#111]" strokeWidth={1} />
              <h3 className="text-[18px] font-medium text-[#333]">Flexible Booking Options</h3>

              <div className="flex items-center gap-2 mt-8 w-full justify-end lg:pr-8">
                <button className="bg-[#0A1128] hover:bg-black text-white px-6 py-2.5 rounded-full text-[14px] font-medium transition-colors">
                  Load More
                </button>
                <button className="bg-[#0A1128] hover:bg-black text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Our Core Values Section */}
      <div className="w-full bg-white py-20 md:py-32 px-4 md:px-8">
        <div className="w-full flex flex-col items-start">
          <span className="bg-[#F0F2F5] text-gray-700 text-[13px] px-4 py-1.5 rounded-full mb-8 font-medium">
            Popular Activities
          </span>
          <h2 className="text-[40px] md:text-[52px] font-medium leading-[1.2] text-[#0A1128] mb-6">
            Our Core Values
          </h2>
          <p className="text-[16px] md:text-[18px] text-[#4A4A4A] leading-[1.6]">
            We never take your choice to spend your hard-earned money with us for granted. Our award-winning trips embrace our broader definition of community tourism to put travellers like you on a first-name basis with the planet's people, cultures, landscapes and wildlife. Here are just a few of the things we offer:
          </p>
        </div>
      </div>
    </div>
  );
}
