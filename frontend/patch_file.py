import re

file_path = "/Users/akarshrajput/Documents/NothingButAdventuresWeb/frontend/src/app/tours/[slug]/page.tsx"

with open(file_path, "r") as f:
    content = f.read()

# Replace Imports
content = content.replace(
    'import { CalendarCheck, Clock, Heart } from "@phosphor-icons/react";',
    'import { CalendarCheck, Clock, Heart, CaretDown, Star, ArrowUpRight } from "@phosphor-icons/react";'
)

# New Aside Component
new_aside = """                  <div className="flex flex-col gap-6">
                    <aside
                      ref={bookingPanelRef}
                      className="bg-white rounded-[24px] border border-gray-300 p-6 shadow-sm flex flex-col gap-6 w-full max-w-sm mx-auto"
                    >
                      {/* Price header */}
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-bold text-black border-none">${discountedPrice.toFixed(0)} USD</span>
                          <span className="text-lg font-bold text-black">/person</span>
                        </div>
                        <div className="text-xl font-medium text-black mt-4">
                          {tour.location.startCity} to {tour.location.endCity}
                        </div>
                      </div>

                      {/* Dates / Guests Group */}
                      <div className="border border-gray-400 rounded-xl overflow-hidden">
                        <div className="flex border-b border-gray-400">
                          <div className="flex-1 p-3 border-r border-gray-400">
                            <div className="text-[10px] font-bold tracking-wider text-black">STARTS</div>
                            <div className="text-sm text-gray-800 mt-1">
                              {bestDealDate ? new Date(bestDealDate.startDate).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" }) : ""}
                            </div>
                          </div>
                          <div className="flex-1 p-3">
                            <div className="text-[10px] font-bold tracking-wider text-black">ENDS</div>
                            <div className="text-sm text-gray-800 mt-1">
                              {bestDealDate ? new Date(bestDealDate.endDate).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" }) : ""}
                            </div>
                          </div>
                        </div>
                        <div className="p-3 flex justify-between items-center bg-white cursor-pointer hover:bg-gray-50 transition">
                          <div>
                            <div className="text-[10px] font-bold tracking-wider text-black">ADVENTURERS</div>
                            <div className="text-sm text-gray-800 mt-1">1 guest</div>
                          </div>
                          <CaretDown size={16} className="text-black" />
                        </div>
                      </div>

                      {/* Ratings */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={20} className="text-black" />
                          ))}
                        </div>
                        <span className="text-[15px] text-gray-600">0 reviews</span>
                      </div>

                      {/* Cancellation Policy inside card */}
                      <div className="bg-[#F3F4F6] py-3 px-4 rounded-xl text-center text-[14px] font-medium text-gray-800">
                        Free cancellation before 29 March
                      </div>

                      {/* Primary Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/tours/${tour.slug}/checkout?date=${bestDealDate ? new Date(bestDealDate.startDate).toISOString().split('T')[0] : ''}`)}
                          className="flex-1 bg-[#121212] text-white py-3.5 px-4 rounded-full flex items-center justify-center gap-2 font-medium hover:bg-black transition text-lg"
                        >
                          <CalendarCheck size={20} />
                          Book Now
                        </button>
                        <button 
                          className="w-14 h-14 bg-[#121212] text-white rounded-full flex items-center justify-center hover:bg-black transition shrink-0"
                          onClick={() => router.push(`/tours/${tour.slug}/checkout?date=${bestDealDate ? new Date(bestDealDate.startDate).toISOString().split('T')[0] : ''}`)}
                        >
                          <ArrowUpRight size={20} />
                        </button>
                      </div>

                      {/* Secondary Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowHoldModal(true);
                            setHoldMessage(null);
                            setHoldSelectedDate("");
                          }}
                          className="flex-1 bg-[#4B4B4B] text-white py-3.5 px-3 rounded-full flex items-center justify-center gap-2 font-medium hover:bg-[#3D3D3D] transition text-[15px]"
                        >
                          <Clock size={20} />
                          Hold Space
                        </button>
                        <button
                          onClick={handleWishlistToggle}
                          className={`flex-1 bg-white text-black border border-gray-400 py-3.5 px-3 rounded-full flex items-center justify-center gap-2 font-medium hover:bg-gray-50 transition text-[15px]`}
                        >
                          <Heart size={20} weight={isInWishlist ? "fill" : "regular"} className={isInWishlist ? "text-[#E63946]" : "text-black"} />
                          {isInWishlist ? 'Saved' : 'Save to Wishlist'}
                        </button>
                      </div>

                      {/* Footer text */}
                      <div className="text-center mt-1 flex flex-col gap-2">
                        <div className="text-[14px] text-gray-600">
                          12 people Booked this hotel in last 6 hours
                        </div>
                        <div className="text-[14px] text-gray-600">
                          You won't be charged yet
                        </div>
                      </div>
                    </aside>

                    {/* Additional cancellation boxes below the card */}
                    <div className="flex flex-col gap-3 max-w-sm mx-auto w-full">
                      {[1, 2, 3].map((idx) => (
                        <div key={idx} className="bg-[#F3F4F6] py-3.5 px-4 rounded-xl text-center text-[15px] font-medium text-gray-800 cursor-pointer hover:bg-gray-200 transition">
                          Free cancellation before 29 March
                        </div>
                      ))}
                    </div>
                  </div>"""

import re
# Use regex to find and replace the whole aside tag
pattern = re.compile(r'                  <aside\s+ref=\{bookingPanelRef\}.*?</aside>', re.DOTALL)
content = pattern.sub(new_aside, content)

with open(file_path, "w") as f:
    f.write(content)

print("Patched successfully")
