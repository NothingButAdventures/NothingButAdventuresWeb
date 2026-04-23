import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content

    # 1. Replace '/trip/' with '/trips/'
    content = content.replace('"/trip"', '"/trips"')
    content = content.replace("'/trip'", "'/trips'")
    content = content.replace('`/trip`', '`/trips`')
    content = content.replace('href="/trip"', 'href="/trips"')
    content = content.replace('"/trip/', '"/trips/')
    content = content.replace('`/trip/', '`/trips/')
    content = content.replace("'/trip/", "'/trips/")

    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))

