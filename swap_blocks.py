import re

with open("frontend/src/app/trips/[slug]/[tourCode]/checkout/page.tsx", "r") as f:
    content = f.read()

# The start of Activities Section
act_start_idx = content.find("{/* Activities Section */}")
# The start of Accommodation Customization
acc_start_idx = content.find("{/* Accommodation Customization */}")
# The end of Accommodation Customization
acc_end_idx = content.find("</>", acc_start_idx) # wait, it ends before </>
# Let's find the exact end of Accommodation Customization. It ends before:
#                                         </>
#                                     ) : (
#                                         <div className="text-[#3F3F42]">

end_idx = content.find("</>", acc_start_idx)

# We want to extract Activities block and Accommodation block
# They are currently: Activities then Accommodation
# So:
# part 1: before Activities
# part 2: Activities
# part 3: Accommodation
# part 4: after Accommodation

part1 = content[:act_start_idx]
part2 = content[act_start_idx:acc_start_idx]
part3 = content[acc_start_idx:end_idx]
part4 = content[end_idx:]

# Additionally, we need to remove "Add ons and Extras" text
# It is located in part2.
# <span className="text-[17px] font-medium text-gray-500">Add ons and Extras</span>
# let's replace it with an empty string, or remove it and adjust justify-between to justify-end
part2 = part2.replace('<span className="text-[17px] font-medium text-gray-500">Add ons and Extras</span>', '')
part2 = part2.replace('<div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">', '<div className="flex items-center justify-end px-5 py-4 border-b border-gray-200">')

# Swap part2 and part3
new_content = part1 + part3 + part2 + part4

with open("frontend/src/app/trips/[slug]/[tourCode]/checkout/page.tsx", "w") as f:
    f.write(new_content)

print("Done")
