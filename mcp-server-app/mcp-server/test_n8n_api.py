import requests
import os
from dotenv import load_dotenv
from pathlib import Path

print("Starting n8n API test...")

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent / "config" / ".env"
print(f"Looking for .env file at: {env_path}")
print(f"File exists: {env_path.exists()}")
load_dotenv(dotenv_path=env_path)

# n8n API configuration
N8N_HOST_URL = os.getenv("N8N_HOST_URL")
N8N_API_KEY = os.getenv("N8N_API_KEY")

print(f"N8N_HOST_URL: {N8N_HOST_URL}")
print(f"N8N_API_KEY: {N8N_API_KEY[:10]}..." if N8N_API_KEY else "N8N_API_KEY: None")

# URL for workflows
url = f"{N8N_HOST_URL}/workflows"

print(f"Testing URL: {url}")

# Headers
headers = {
    "X-N8N-API-KEY": N8N_API_KEY,
    "Content-Type": "application/json"
}

try:
    print("Sending request...")
    response = requests.get(url, headers=headers)
    print(f"Status code: {response.status_code}")

    if response.status_code == 200:
        data = response.json()
        print(f"Success! Retrieved {len(data['data'])} workflows.")
        for workflow in data['data']:
            print(f"Workflow: {workflow.get('name')} (ID: {workflow.get('id')})")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Error: {str(e)}")

print("Test completed.")
