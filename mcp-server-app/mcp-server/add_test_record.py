import requests
import json
import os
from dotenv import load_dotenv

print("Adding test record to NocoDB...")

# Load environment variables
load_dotenv("config/.env")

# NocoDB configuration
NOCODB_API_URL = os.getenv("NOCODB_API_URL")
NOCODB_API_TOKEN = os.getenv("NOCODB_API_TOKEN")
NOCODB_PROJECT_ID = os.getenv("NOCODB_PROJECT_ID")
NOCODB_WORKSPACE_ID = os.getenv("NOCODB_WORKSPACE_ID")

# Get the URL directly from the environment variable
url = os.getenv("NOCODB_API_URL_COMMUNITYMEMBERS")

print(f"URL: {url}")
print(f"Token: {NOCODB_API_TOKEN[:5]}..." if NOCODB_API_TOKEN else "Token: None")

# Headers
headers = {
    "xc-token": NOCODB_API_TOKEN,
    "Content-Type": "application/json"
}

# Test data
data = {
    "Name": "Test User",
    "Email": "test@example.com",
    "Role": "Member",
    "Status": "Test"
}

try:
    print("Sending POST request...")
    response = requests.post(url, headers=headers, json=data)
    print(f"Status code: {response.status_code}")
    print(f"Response: {response.text[:200]}...")
except Exception as e:
    print(f"Error: {str(e)}")

print("Test completed.")
