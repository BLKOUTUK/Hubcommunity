import requests
import os
from dotenv import load_dotenv

print("Testing URL from .env file...")

# Load environment variables
load_dotenv("config/.env")

# Get the URL directly from the environment variable
url = os.getenv("NOCODB_API_URL_COMMUNITYMEMBERS")
token = os.getenv("NOCODB_API_TOKEN")

print(f"URL: {url}")
print(f"Token: {token[:5]}..." if token else "Token: None")

# Headers
headers = {
    "xc-token": token,
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
