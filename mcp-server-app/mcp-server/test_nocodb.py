import requests
import os
from dotenv import load_dotenv
from pathlib import Path

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

# Print environment variables
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

# Test API connection by listing tables
# The correct URL format is likely different
# Let's try a few different formats

# Format 1: Standard format
url1 = f"{NOCODB_API_URL}/db/data/noco/{NOCODB_WORKSPACE_ID}/{NOCODB_PROJECT_ID}/Campaign_Phases"

# Format 2: Without project ID in the path
url2 = f"{NOCODB_API_URL}/db/data/v1/projects/{NOCODB_PROJECT_ID}/tables/Campaign_Phases"

# Format 3: Using base ID directly
url3 = f"{NOCODB_API_URL}/db/data/v1/bases/{NOCODB_PROJECT_ID}/tables/Campaign_Phases"

# Let's try Format 1 first
url = url1
print(f"\nTesting API connection with URL: {url}")

try:
    response = requests.get(url, headers=headers)
    print(f"Response status code: {response.status_code}")
    print(f"Response headers: {response.headers}")
    print(f"Response text: {response.text[:500]}...")  # Print just the beginning of the response
    response.raise_for_status()
    print("Connection successful!")
except Exception as e:
    print(f"Error connecting to NocoDB API: {str(e)}")
    if hasattr(response, 'text'):
        print(f"Response: {response.text[:500]}...")  # Print just the beginning of the response
