import requests
import os
from dotenv import load_dotenv

print("Starting NocoDB URL format test...")

# Load environment variables from .env file
from pathlib import Path
env_path = Path(__file__).resolve().parent / "config" / ".env"
print(f"Looking for .env file at: {env_path}")
print(f"File exists: {env_path.exists()}")
load_dotenv(dotenv_path=env_path)

# NocoDB configuration
NOCODB_API_URL = os.getenv("NOCODB_API_URL")
NOCODB_API_TOKEN = os.getenv("NOCODB_API_TOKEN")
NOCODB_PROJECT_ID = os.getenv("NOCODB_PROJECT_ID")
NOCODB_WORKSPACE_ID = os.getenv("NOCODB_WORKSPACE_ID")

# Table ID for CommunityMembers
TABLE_ID = "mfogmk8y51w1s12"

print(f"NOCODB_API_URL: {NOCODB_API_URL}")
print(f"NOCODB_API_TOKEN: {NOCODB_API_TOKEN[:5]}..." if NOCODB_API_TOKEN else "NOCODB_API_TOKEN: None")
print(f"NOCODB_PROJECT_ID: {NOCODB_PROJECT_ID}")
print(f"NOCODB_WORKSPACE_ID: {NOCODB_WORKSPACE_ID}")

# Try different URL formats
urls = [
    # v1 API formats (older versions)
    # Format 1: v1/project_id/table_id
    f"{NOCODB_API_URL.replace('v2', 'v1')}/db/data/v1/{NOCODB_PROJECT_ID}/{TABLE_ID}",

    # Format 2: noco/workspace_id/project_id/table_id
    f"{NOCODB_API_URL.replace('v2', 'v1')}/db/data/noco/{NOCODB_WORKSPACE_ID}/{NOCODB_PROJECT_ID}/{TABLE_ID}",

    # v2 API formats (newer versions)
    # Format 3: v2/tables/table_id/records
    f"{NOCODB_API_URL}/tables/{TABLE_ID}/records",

    # Format 4: v2/tables/table_name/records
    f"{NOCODB_API_URL}/tables/CommunityMembers/records"
]

# Headers - NocoDB API uses 'xc-token' for authentication
headers = {
    "xc-token": NOCODB_API_TOKEN,
    "Content-Type": "application/json"
}

# Test each URL format
for i, url in enumerate(urls, 1):
    print(f"\nTesting Format {i}: {url}")

    try:
        print("Sending request...")
        response = requests.get(url, headers=headers)
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text[:200]}...")
    except Exception as e:
        print(f"Error: {str(e)}")

print("\nTest completed.")
