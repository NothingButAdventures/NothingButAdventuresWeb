import re
import os

files = [
    "frontend/src/components/HeaderMegaMenu.tsx",
    "frontend/src/components/WhyUsMegaMenu.tsx"
]

def update_file(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
        
    with open(filepath, "r") as f:
        content = f.read()

    # Replace specific text colors with #3F3F42
    # Let's match text-[#111], text-[#6b6b66], text-[#5a5a55], text-[#172035], text-[#6f6f6a], text-[#9a9a94], text-[#8a8a84], text-[#1a1a1a]
    color_patterns = [
        r"text-\[#111\]",
        r"text-\[#6b6b66\]",
        r"text-\[#5a5a55\]",
        r"text-\[#172035\]",
        r"text-\[#6f6f6a\]",
        r"text-\[#9a9a94\]",
        r"text-\[#8a8a84\]",
        r"text-\[#1a1a1a\]"
    ]
    
    for pattern in color_patterns:
        content = re.sub(pattern, "text-[#3F3F42]", content)

    # Replace sidebar tabs active and hover state
    content = content.replace(
        "border-[#1a1a1a] bg-[#1a1a1a] text-white shadow-sm",
        "border-[#3F3F42] bg-[#3F3F42] text-white shadow-sm"
    )
    content = content.replace(
        "border-[#c5c5c0] bg-transparent text-[#3F3F42] hover:border-[#a3a3a3] hover:bg-[#d1d5db] hover:text-[#3F3F42]",
        "border-[#c5c5c0] bg-transparent text-[#3F3F42] hover:border-[#3F3F42] hover:bg-[#3F3F42] hover:text-white"
    )

    # For WhyUsMegaMenu, the sidebar items might have slight differences. Let's do general replace for the hover
    content = content.replace(
        "hover:border-[#1a1a1a]", "hover:border-[#3F3F42]"
    )
    content = content.replace(
        "hover:text-[#1a1a1a]", "hover:text-[#3F3F42]"
    )
    
    with open(filepath, "w") as f:
        f.write(content)

for f in files:
    update_file(f)

print("Done")
