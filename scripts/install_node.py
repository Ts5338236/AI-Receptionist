"""Bootstrap portable Node.js LTS for local development on Windows without admin rights."""

import os
import shutil
import sys
import urllib.request
import zipfile

NODE_VERSION = "v20.18.0"
ZIP_NAME = f"node-{NODE_VERSION}-win-x64.zip"
URL = f"https://nodejs.org/dist/{NODE_VERSION}/{ZIP_NAME}"
TARGET_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "tools", "nodejs"))

def main():
    if os.path.exists(os.path.join(TARGET_DIR, "node.exe")):
        print(f"Node.js is already installed at: {TARGET_DIR}")
        return

    os.makedirs(TARGET_DIR, exist_ok=True)
    zip_path = os.path.join(TARGET_DIR, ZIP_NAME)

    print(f"Downloading Node.js {NODE_VERSION} from {URL}...")
    urllib.request.urlretrieve(URL, zip_path)
    print("Download complete. Extracting...")

    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        # Extract files stripping top level directory
        top_folder = f"node-{NODE_VERSION}-win-x64/"
        for member in zip_ref.namelist():
            if member.startswith(top_folder):
                rel_path = member[len(top_folder):]
                if not rel_path:
                    continue
                dest_path = os.path.join(TARGET_DIR, rel_path)
                if member.endswith('/'):
                    os.makedirs(dest_path, exist_ok=True)
                else:
                    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                    with zip_ref.open(member) as source, open(dest_path, "wb") as target:
                        shutil.copyfileobj(source, target)

    os.remove(zip_path)
    print(f"Node.js {NODE_VERSION} installed successfully at {TARGET_DIR}!")

if __name__ == "__main__":
    main()
