#!/usr/bin/env python3
"""
ESV Bible Data Updater Utility
Usage:
  python3 update_esv.py /path/to/your/full_esv.json

This script updates src/data/embeddedEsvData.json with your full ESV dataset
and rebuilds the macOS application.
"""

import sys
import os
import json
import subprocess

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 update_esv.py <path_to_full_esv.json>")
        sys.exit(1)

    input_path = os.path.expanduser(sys.argv[1])
    if not os.path.exists(input_path):
        print(f"Error: File not found at '{input_path}'")
        sys.exit(1)

    project_dir = os.path.dirname(os.path.abspath(__file__))

    print(f"Reading ESV data from '{input_path}'...")
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    out_path = os.path.join(project_dir, 'src', 'data', 'embeddedEsvData.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(data, f)

    total_verses = 0
    if isinstance(data, dict):
        for book in data:
            if isinstance(data[book], dict):
                for ch in data[book]:
                    if isinstance(data[book][ch], dict):
                        total_verses += len(data[book][ch])

    print(f"✅ Successfully updated embedded ESV dataset with {total_verses:,} verses!")
    print("Repackaging macOS application...")
    
    # Run npm run package inside project_dir
    subprocess.run(["npm", "run", "package"], cwd=project_dir, check=True)
    subprocess.run(["./install.sh"], cwd=project_dir, check=True)

    print("🎉 Application successfully updated and installed to /Applications!")

if __name__ == '__main__':
    main()
