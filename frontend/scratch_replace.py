import os
import re

files_to_update = [
    "src/components/PopularDestinationsSection.tsx",
    "src/components/AdventuresMegaMenu.tsx",
    "src/app/blogs/[slug]/page.tsx"
]

for file_path in files_to_update:
    full_path = os.path.join(os.getcwd(), file_path)
    if os.path.exists(full_path):
        with open(full_path, "r") as f:
            content = f.read()

        new_content = content.replace("`/trip?", "`/trips?").replace("'/trip?", "'/trips?").replace('"/trip?', '"/trips?')

        if new_content != content:
            with open(full_path, "w") as f:
                f.write(new_content)
            print(f"Updated {file_path}")

