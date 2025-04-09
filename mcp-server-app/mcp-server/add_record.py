import requests
import os
from dotenv import load_dotenv
from pathlib import Path

print("Starting NocoDB add record script...")

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent / "config" / ".env"
print(f"Looking for .env file at: {env_path}")
print(f"File exists: {env_path.exists()}")

load_dotenv(dotenv_path=env_path)

# NocoDB API configuration
NOCODB_API_URL = os.getenv("NOCODB_API_URL", "https://cloud.nocodb.com/api/v1")
NOCODB_API_TOKEN = os.getenv("NOCODB_API_TOKEN")
NOCODB_WORKSPACE_ID = os.getenv("NOCODB_WORKSPACE_ID")
NOCODB_PROJECT_ID = os.getenv("NOCODB_PROJECT_ID")

print("Environment variables:")
print(f"NOCODB_API_URL: {NOCODB_API_URL}")
print(f"NOCODB_API_TOKEN: {NOCODB_API_TOKEN[:5]}..." if NOCODB_API_TOKEN else "NOCODB_API_TOKEN: None")
print(f"NOCODB_WORKSPACE_ID: {NOCODB_WORKSPACE_ID}")
print(f"NOCODB_PROJECT_ID: {NOCODB_PROJECT_ID}")

# Common headers for all requests
headers = {
    "xc-token": NOCODB_API_TOKEN,
    "Content-Type": "application/json"
}

# Try to add a record to the Campaign_Phases table
# Let's try different URL formats

# Format 1
url1 = f"{NOCODB_API_URL}/db/data/noco/{NOCODB_WORKSPACE_ID}/{NOCODB_PROJECT_ID}/Campaign_Phases"

# Format 2
url2 = f"{NOCODB_API_URL}/db/data/v1/nc/{NOCODB_WORKSPACE_ID}/Campaign_Phases"

# Format 3
url3 = f"{NOCODB_API_URL}/api/v1/db/data/noco/{NOCODB_WORKSPACE_ID}/{NOCODB_PROJECT_ID}/Campaign_Phases"

# Format 4
url4 = f"{NOCODB_API_URL}/api/v1/db/data/v1/projects/{NOCODB_PROJECT_ID}/tables/Campaign_Phases/records"

# Data to add
data = {
    "PhaseID": 1,
    "Name": "Test Phase",
    "StartDate": "2025-04-01",
    "EndDate": "2025-04-14",
    "HubPercentage": 20,
    "WebsitePercentage": 10,
    "SocialPercentage": 70,
    "Description": "This is a test phase."
}

# Try each URL format
urls = [url1, url2, url3, url4]

for i, url in enumerate(urls, 1):
    print(f"\nTrying Format {i} with URL: {url}")
    
    try:
        response = requests.post(url, headers=headers, json=data)
        print(f"Response status code: {response.status_code}")
        print(f"Response text: {response.text[:500]}...")
    except Exception as e:
        print(f"Error: {str(e)}")

print("Script completed.")
