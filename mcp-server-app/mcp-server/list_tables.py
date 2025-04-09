import requests
import os
from dotenv import load_dotenv
from pathlib import Path

print("Starting NocoDB list tables script...")

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

# Try to list tables
url = f"{NOCODB_API_URL}/db/meta/projects/{NOCODB_PROJECT_ID}/tables"
print(f"\nTrying to list tables with URL: {url}")

try:
    response = requests.get(url, headers=headers)
    print(f"Response status code: {response.status_code}")
    print(f"Response text: {response.text[:500]}...")
except Exception as e:
    print(f"Error: {str(e)}")

print("Script completed.")
