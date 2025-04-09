import requests
import os
import json
from dotenv import load_dotenv
from pathlib import Path

print("Getting workflow details...")

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent / "config" / ".env"
print(f"Looking for .env file at: {env_path}")
print(f"File exists: {env_path.exists()}")
load_dotenv(dotenv_path=env_path)

# n8n API configuration
N8N_HOST_URL = os.getenv("N8N_HOST_URL")
N8N_API_KEY = os.getenv("N8N_API_KEY")

# Workflow ID to get
WORKFLOW_ID = "YvtsmCK7vbgSzahe"  # Campaign Onboard 1

print(f"N8N_HOST_URL: {N8N_HOST_URL}")
print(f"N8N_API_KEY: {N8N_API_KEY[:10]}..." if N8N_API_KEY else "N8N_API_KEY: None")
print(f"WORKFLOW_ID: {WORKFLOW_ID}")

# URL for workflow
url = f"{N8N_HOST_URL}/workflows/{WORKFLOW_ID}"

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
        print(f"Success! Retrieved workflow: {data.get('name')}")
        
        # Save the workflow to a file
        with open("campaign_onboard_1_workflow.json", "w") as f:
            json.dump(data, f, indent=2)
        print("Workflow saved to campaign_onboard_1_workflow.json")
        
        # Print some basic info
        print(f"Workflow name: {data.get('name')}")
        print(f"Active: {data.get('active')}")
        print(f"Created: {data.get('createdAt')}")
        print(f"Updated: {data.get('updatedAt')}")
        print(f"Number of nodes: {len(data.get('nodes', []))}")
        
        # Print node names
        print("\nNodes:")
        for node in data.get('nodes', []):
            print(f"- {node.get('name')} ({node.get('type')})")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Error: {str(e)}")

print("Done.")
