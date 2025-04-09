import requests
import os
import json
from dotenv import load_dotenv
from pathlib import Path

print("Creating fixed workflow...")

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent / "mcp-server" / "config" / ".env"
print(f"Looking for .env file at: {env_path}")
print(f"File exists: {env_path.exists()}")
load_dotenv(dotenv_path=env_path)

# n8n API configuration
N8N_HOST_URL = os.getenv("N8N_HOST_URL")
N8N_API_KEY = os.getenv("N8N_API_KEY")

print(f"N8N_HOST_URL: {N8N_HOST_URL}")
print(f"N8N_API_KEY: {N8N_API_KEY[:10]}..." if N8N_API_KEY else "N8N_API_KEY: None")

# Load the fixed workflow
with open("campaign_onboard_1_fixed.json", "r") as f:
    workflow_data = json.load(f)

# URL for workflow creation
url = f"{N8N_HOST_URL}/workflows"

print(f"Create URL: {url}")

# Headers
headers = {
    "X-N8N-API-KEY": N8N_API_KEY,
    "Content-Type": "application/json"
}

try:
    print("Creating workflow...")
    response = requests.post(url, headers=headers, json=workflow_data)
    
    if response.status_code == 200:
        created_workflow = response.json()
        print(f"Workflow created successfully!")
        print(f"Workflow ID: {created_workflow.get('id')}")
        print(f"Workflow name: {created_workflow.get('name')}")
        
        # Activate the workflow
        workflow_id = created_workflow.get('id')
        activate_url = f"{N8N_HOST_URL}/workflows/{workflow_id}/activate"
        
        print(f"\nActivating workflow...")
        activate_response = requests.post(activate_url, headers=headers)
        
        if activate_response.status_code == 200:
            print("Workflow activated successfully!")
        else:
            print(f"Error activating workflow: {activate_response.status_code}")
            print(f"Response: {activate_response.text}")
    else:
        print(f"Error creating workflow: {response.status_code}")
        print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {str(e)}")

print("Done.")
