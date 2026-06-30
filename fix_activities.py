import re

with open("frontend/src/app/trips/[slug]/[tourCode]/checkout/page.tsx", "r") as f:
    content = f.read()

# Locate the entire Activities Section
# Starts at: {/* Activities Section */}
# Ends at: {/* Accommodation Customization */}

act_start_idx = content.find("{/* Activities Section */}")
acc_start_idx = content.find("{/* Accommodation Customization */}")

if act_start_idx == -1 or acc_start_idx == -1:
    print("Could not find section markers")
    exit(1)

part1 = content[:act_start_idx]
part3 = content[acc_start_idx:]

new_activities = """{/* Activities Section */}
                                            <div className="mb-8">
                                                <h3 className="text-[42px] font-medium text-[#2C3238] mb-2 leading-tight">
                                                    Add Activities and Experiences
                                                </h3>
                                                <p className="text-[17px] text-gray-500 mb-6 max-w-2xl">
                                                    Add Optional Activities to make your trip even more memorable<br />
                                                    Choose which activity to add for traveller.
                                                </p>

                                                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                                                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                                                        <span className="text-[20px] font-medium text-gray-500">Add ons and Extras</span>
                                                        <button
                                                            onClick={() => setExpandedDays(tour.itinerary.filter(d => d.optionalActivities?.length > 0).map(d => d.day))}
                                                            className="bg-[#2C3238] text-white px-5 py-2 rounded-full text-[14px] font-bold hover:bg-black transition"
                                                        >
                                                            View All Activities
                                                        </button>
                                                    </div>

                                                    <div>
                                                        {tour.itinerary
                                                            .filter((day) => day.optionalActivities && day.optionalActivities.length > 0)
                                                            .map((day) => (
                                                                <div key={day.day} className="border-b border-gray-200 last:border-b-0">
                                                                    <div className="p-6">
                                                                        <div className="flex items-center justify-between mb-6">
                                                                            <span className="bg-[#2C3238] text-white text-[13px] font-bold px-4 py-1.5 rounded-full tracking-wide">Day {day.day}</span>
                                                                            <span className="bg-[#F4F0FF] text-[#6A38C2] text-[13px] font-bold px-4 py-1.5 rounded-full">{day.optionalActivities.length} Activities</span>
                                                                        </div>
                                                                        
                                                                        <div className="flex flex-col gap-6">
                                                                            {day.optionalActivities.map((activity, actIdx) => {
                                                                                const dropdownId = `${day.day}-${actIdx}`;
                                                                                const isDropdownOpen = openActivityDropdown === dropdownId;
                                                                                const selectedParticipants = selectedActivities.find(a => a.dayNumber === day.day && a.activityIndex === actIdx)?.participants || [];
                                                                                
                                                                                return (
                                                                                    <div key={actIdx} className="flex flex-col gap-6">
                                                                                        {actIdx > 0 && <div className="h-px bg-gray-200 -mx-6" />}
                                                                                        <div className="flex">
                                                                                            <div className="flex gap-6 pr-6 flex-1">
                                                                                                <div className="w-[300px] h-[200px] rounded-xl bg-gray-200 flex-shrink-0 overflow-hidden relative">
                                                                                                    {primaryImage?.url ? (
                                                                                                        <Image src={primaryImage.url} alt={activity.name || activity.title || "Activity"} fill className="object-cover" />
                                                                                                    ) : (
                                                                                                        <div className="w-full h-full flex items-center justify-center text-3xl">🎯</div>
                                                                                                    )}
                                                                                                </div>
                                                                                                <div className="flex-1 flex flex-col justify-between py-1">
                                                                                                    <div>
                                                                                                        <h4 className="font-medium text-[24px] text-[#2C3238] mb-2">{activity.name || activity.title}</h4>
                                                                                                        <p className="text-[16px] text-gray-500 leading-relaxed max-w-md">
                                                                                                            {activity.description}
                                                                                                        </p>
                                                                                                    </div>
                                                                                                    <div className="mt-4">
                                                                                                        <div className="font-bold text-[20px] text-[#2C3238]">
                                                                                                            {typeof activity.price === "number"
                                                                                                                ? (activity.price > 0 ? `$${activity.price.toLocaleString()}` : "Free")
                                                                                                                : (activity.price?.amount > 0
                                                                                                                    ? `${activity.price.currency || "$"}${Number(activity.price.amount).toLocaleString()}`
                                                                                                                    : "Free")}
                                                                                                        </div>
                                                                                                        <div className="text-[14px] text-gray-500">Per Person</div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="w-[300px] flex-shrink-0 pl-6 border-l border-gray-200 py-1 flex flex-col">
                                                                                                <div className="relative">
                                                                                                    <button
                                                                                                        onClick={() => setOpenActivityDropdown(isDropdownOpen ? null : dropdownId)}
                                                                                                        className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-4 py-2.5 text-[15px] text-gray-700 bg-white hover:bg-gray-50"
                                                                                                    >
                                                                                                        <span>Who is This tour for?</span>
                                                                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
                                                                                                    </button>

                                                                                                    {isDropdownOpen && (
                                                                                                        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] z-20 overflow-hidden">
                                                                                                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white cursor-pointer hover:bg-gray-50" onClick={() => setOpenActivityDropdown(null)}>
                                                                                                                <span className="text-[15px] font-medium text-[#2C3238]">Who is This tour for?</span>
                                                                                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="rotate-180 text-gray-500"><path d="m6 9 6 6 6-6" /></svg>
                                                                                                            </div>
                                                                                                            <div className="max-h-48 overflow-y-auto">
                                                                                                                {[primaryTraveller, ...otherTravellers].slice(0, adultCount).map((traveller, idx) => {
                                                                                                                    const isSelected = selectedParticipants.includes(idx);
                                                                                                                    const name = traveller.firstName || `Traveller ${String.fromCharCode(65 + idx)}`;
                                                                                                                    return (
                                                                                                                        <label key={idx} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer">
                                                                                                                            <span className="text-[15px] text-[#2C3238]">{name}</span>
                                                                                                                            <input
                                                                                                                                type="checkbox"
                                                                                                                                checked={isSelected}
                                                                                                                                onChange={(e) => toggleActivityParticipant(day.day, actIdx, idx, e.target.checked, activity)}
                                                                                                                                className="w-5 h-5 rounded border-gray-300 text-[#6A38C2] focus:ring-[#6A38C2] cursor-pointer"
                                                                                                                            />
                                                                                                                        </label>
                                                                                                                    );
                                                                                                                })}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                                
                                                                                                {/* Display selected names below */}
                                                                                                {selectedParticipants.length > 0 && (
                                                                                                    <div className="mt-4 flex flex-col gap-2">
                                                                                                        {[primaryTraveller, ...otherTravellers].slice(0, adultCount).map((traveller, idx) => {
                                                                                                            if (!selectedParticipants.includes(idx)) return null;
                                                                                                            const name = traveller.firstName || `Traveller ${String.fromCharCode(65 + idx)}`;
                                                                                                            return (
                                                                                                                <div key={idx} className="flex items-center gap-2 text-[14px] text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                                                                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6A38C2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                                                                                    <span>{name}</span>
                                                                                                                </div>
                                                                                                            );
                                                                                                        })}
                                                                                                    </div>
                                                                                                )}

                                                                                                <div className="flex items-center justify-between mt-auto pt-4">
                                                                                                    <button
                                                                                                        onClick={() => {
                                                                                                            const currentItem = selectedActivities.find(a => a.dayNumber === day.day && a.activityIndex === actIdx);
                                                                                                            if (currentItem) {
                                                                                                                [...Array(adultCount)].forEach((_, i) => toggleActivityParticipant(day.day, actIdx, i, false, activity));
                                                                                                            }
                                                                                                        }}
                                                                                                        className="px-5 py-1.5 border border-gray-400 rounded-full text-[13px] font-bold text-[#2C3238] hover:bg-gray-50 transition"
                                                                                                    >
                                                                                                        Clear
                                                                                                    </button>
                                                                                                    <button
                                                                                                        onClick={() => {
                                                                                                            [...Array(adultCount)].forEach((_, i) => {
                                                                                                                const isSelected = selectedActivities.find(a => a.dayNumber === day.day && a.activityIndex === actIdx)?.participants?.includes(i);
                                                                                                                if (!isSelected) {
                                                                                                                    toggleActivityParticipant(day.day, actIdx, i, true, activity);
                                                                                                                }
                                                                                                            });
                                                                                                        }}
                                                                                                        className="px-5 py-1.5 bg-[#2C3238] text-white rounded-full text-[13px] font-bold hover:bg-black transition"
                                                                                                    >
                                                                                                        Select all
                                                                                                    </button>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between px-6 py-5 bg-white">
                                                        <span className="text-[20px] font-medium text-[#2C3238]">Total Cart Value</span>
                                                        <button
                                                            onClick={() => {/* no-op for UI */}}
                                                            className="bg-[#6A38C2] text-white px-10 py-2.5 rounded-full text-[16px] font-bold hover:bg-[#582da3] transition"
                                                        >
                                                            Add
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            """

new_content = part1 + new_activities + part3

with open("frontend/src/app/trips/[slug]/[tourCode]/checkout/page.tsx", "w") as f:
    f.write(new_content)

print("Done")
