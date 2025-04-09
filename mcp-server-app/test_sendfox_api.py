import requests
import os
from dotenv import load_dotenv
from pathlib import Path
import json

print("Testing SendFox API...")

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent / "mcp-server" / "config" / ".env"
print(f"Looking for .env file at: {env_path}")
print(f"File exists: {env_path.exists()}")
load_dotenv(dotenv_path=env_path)

# SendFox API configuration
SENDFOX_API_KEY = os.getenv("SENDFOX_API_KEY")
SENDFOX_ACCESS_TOKEN = os.getenv("SENDFOX_ACCESS_TOKEN")

print(f"SENDFOX_API_KEY: {SENDFOX_API_KEY[:10]}..." if SENDFOX_API_KEY else "SENDFOX_API_KEY: None")
print(f"SENDFOX_ACCESS_TOKEN: {SENDFOX_ACCESS_TOKEN[:10]}..." if SENDFOX_ACCESS_TOKEN else "SENDFOX_ACCESS_TOKEN: None")

# Use the access token instead of the API key
AUTH_TOKEN = SENDFOX_ACCESS_TOKEN or SENDFOX_API_KEY

# URL for SendFox API
url = "https://api.sendfox.com/contacts"

# Test contact data
contact_data = {
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User"
}

# Headers
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {AUTH_TOKEN}",
    "Accept": "application/json"
}

try:
    print(f"Sending request to {url}...")
    print(f"Contact data: {json.dumps(contact_data)}")
    print(f"Headers: {json.dumps(headers)}")

    # Send the request
    response = requests.post(url, json=contact_data, headers=headers)

    # Print the response
    print(f"Status code: {response.status_code}")
    print(f"Response: {response.text}")

    # Check if the request was successful
    if response.status_code == 200:
        print("Success! Contact was added to SendFox.")
    elif response.status_code == 409:
        print("Contact already exists in SendFox.")
    else:
        print(f"Error: {response.status_code} - {response.text}")

except Exception as e:
    print(f"Error: {str(e)}")

print("Done.")
