import requests
import os
from dotenv import load_dotenv

print("Starting NocoDB test...")

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

print(f"NOCODB_API_URL: {NOCODB_API_URL}")
print(f"NOCODB_API_TOKEN: {NOCODB_API_TOKEN[:5]}..." if NOCODB_API_TOKEN else "NOCODB_API_TOKEN: None")
print(f"NOCODB_PROJECT_ID: {NOCODB_PROJECT_ID}")

# URL for CommunityMembers table - using v2 API format
url = f"{NOCODB_API_URL}/tables/mfogmk8y51w1s12/records"

print(f"Testing URL: {url}")

# Headers - NocoDB API uses 'xc-token' for authentication
headers = {
    "xc-token": NOCODB_API_TOKEN,
    "Content-Type": "application/json"
}

try:
    print("Sending request...")
    response = requests.get(url, headers=headers)
    print(f"Status code: {response.status_code}")
    print(f"Response: {response.text[:200]}...")
except Exception as e:
    print(f"Error: {str(e)}")

print("Test completed.")
