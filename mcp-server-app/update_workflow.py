import requests
import os
import json
from dotenv import load_dotenv
from pathlib import Path

print("Updating n8n workflow...")

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent / "mcp-server" / "config" / ".env"
print(f"Looking for .env file at: {env_path}")
print(f"File exists: {env_path.exists()}")
load_dotenv(dotenv_path=env_path)

# n8n API configuration
N8N_HOST_URL = os.getenv("N8N_HOST_URL")
N8N_API_KEY = os.getenv("N8N_API_KEY")

# Workflow ID to update
WORKFLOW_ID = "YvtsmCK7vbgSzahe"  # Campaign Onboard 1

print(f"N8N_HOST_URL: {N8N_HOST_URL}")
print(f"N8N_API_KEY: {N8N_API_KEY[:10]}..." if N8N_API_KEY else "N8N_API_KEY: None")
print(f"WORKFLOW_ID: {WORKFLOW_ID}")

# Load the workflow with notifications
with open("campaign_onboard_1_with_notifications.json", "r") as f:
    workflow_data = json.load(f)

# URL for workflow update
url = f"{N8N_HOST_URL}/workflows/{WORKFLOW_ID}"

print(f"Update URL: {url}")

# Headers
headers = {
    "X-N8N-API-KEY": N8N_API_KEY,
    "Content-Type": "application/json"
}

# First, get the current workflow to preserve metadata
try:
    print("Getting current workflow...")
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        current_workflow = response.json()
        print(f"Successfully retrieved current workflow: {current_workflow.get('name')}")

        # Preserve important metadata
        # Note: The following fields are read-only and should not be included in the update request:
        # - id
        # - createdAt
        # - updatedAt
        # - active

        # Instead, we'll create a new update payload with just the fields we want to update
        update_payload = {
            "name": workflow_data["name"],
            "nodes": workflow_data["nodes"],
            "connections": workflow_data["connections"],
            "settings": workflow_data["settings"]
        }

        # Update the workflow
        print("Updating workflow...")
        update_response = requests.put(url, headers=headers, json=update_payload)

        if update_response.status_code == 200:
            print("Workflow updated successfully!")
            updated_workflow = update_response.json()
            print(f"Updated workflow name: {updated_workflow.get('name')}")
            print(f"Number of nodes: {len(updated_workflow.get('nodes', []))}")
        else:
            print(f"Error updating workflow: {update_response.status_code}")
            print(f"Response: {update_response.text}")
    else:
        print(f"Error getting workflow: {response.status_code}")
        print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {str(e)}")

print("Done.")
