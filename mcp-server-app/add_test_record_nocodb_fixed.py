import requests
import os
from dotenv import load_dotenv
from pathlib import Path
import json

print("Adding test record to NocoDB with correct column names...")

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent / "mcp-server" / "config" / ".env"
print(f"Looking for .env file at: {env_path}")
print(f"File exists: {env_path.exists()}")
load_dotenv(dotenv_path=env_path)

# NocoDB API configuration
NOCODB_API_URL_COMMUNITYMEMBERS = os.getenv("NOCODB_API_URL_COMMUNITYMEMBERS")
NOCODB_API_TOKEN = os.getenv("NOCODB_API_TOKEN")

print(f"NOCODB_API_URL_COMMUNITYMEMBERS: {NOCODB_API_URL_COMMUNITYMEMBERS}")
print(f"NOCODB_API_TOKEN: {NOCODB_API_TOKEN[:10]}..." if NOCODB_API_TOKEN else "NOCODB_API_TOKEN: None")

# Test data with correct column names and valid role
test_data = {
    "Email": "test@example.com",
    "Title": "Test User",
    "Role": "Ally",  # Valid options: "Ally, Black Queer Man, QTIPOC Organiser, Organisation, Other"
    "Organisation": "Test Org",
    "Status": "Active"
}

# Headers
headers = {
    "xc-token": NOCODB_API_TOKEN,
    "Content-Type": "application/json",
    "Accept": "application/json"
}

try:
    print(f"\nSending POST request to {NOCODB_API_URL_COMMUNITYMEMBERS}...")
    print(f"Data: {json.dumps(test_data)}")
    print(f"Headers: {json.dumps(headers)}")

    response = requests.post(NOCODB_API_URL_COMMUNITYMEMBERS, json=test_data, headers=headers)

    print(f"Status code: {response.status_code}")
    print(f"Response: {response.text}")

    if response.status_code in [200, 201]:
        print("\nSuccess! Test record added to NocoDB.")
    else:
        print("\nFailed to add test record to NocoDB.")
except Exception as e:
    print(f"Error: {str(e)}")

print("\nDone.")
