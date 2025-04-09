import requests
import os
import json
from dotenv import load_dotenv
from pathlib import Path

print("Deploying Updated BLKOUT NXT Survey Workflow...")

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

# URL for workflow creation
url = f"{N8N_HOST_URL}/workflows"

# Headers
headers = {
    "X-N8N-API-KEY": N8N_API_KEY,
    "Content-Type": "application/json"
}

# Function to create and activate a workflow
def create_and_activate_workflow(file_path, workflow_name):
    print(f"\nCreating {workflow_name} workflow...")
    
    # Load the workflow
    with open(file_path, "r") as f:
        workflow_data = json.load(f)
    
    try:
        # Create the workflow
        response = requests.post(url, headers=headers, json=workflow_data)
        
        if response.status_code == 200:
            created_workflow = response.json()
            print(f"Workflow created successfully!")
            print(f"Workflow ID: {created_workflow.get('id')}")
            print(f"Workflow name: {created_workflow.get('name')}")
            
            # Activate the workflow
            workflow_id = created_workflow.get('id')
            activate_url = f"{N8N_HOST_URL}/workflows/{workflow_id}/activate"
            
            print(f"Activating workflow...")
            activate_response = requests.post(activate_url, headers=headers)
            
            if activate_response.status_code == 200:
                print("Workflow activated successfully!")
                return True, workflow_id
            else:
                print(f"Error activating workflow: {activate_response.status_code}")
                print(f"Response: {activate_response.text}")
                return False, None
        else:
            print(f"Error creating workflow: {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
    except Exception as e:
        print(f"Error: {str(e)}")
        return False, None

# Deploy the updated survey workflow
success, workflow_id = create_and_activate_workflow(
    "blkout_nxt_survey_workflow_updated.json", 
    "BLKOUT NXT Survey Follow-up (Updated)"
)

# Summary
print("\n=== Deployment Summary ===")
print(f"Updated Survey Workflow: {'SUCCESS' if success else 'FAILED'}")
if success:
    print(f"Workflow ID: {workflow_id}")
    print(f"This workflow will now send survey emails 6 hours after welcome emails")
    print(f"and send reminders 3 days after the initial survey email if not completed.")

print("\nDone.")
