import requests
import os
import json
from dotenv import load_dotenv
from pathlib import Path

print("Importing Test Google Sheets Workflow...")

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

# Headers for API requests
headers = {
    "X-N8N-API-KEY": N8N_API_KEY,
    "Content-Type": "application/json"
}

# Load the test workflow
test_workflow_path = "test_google_sheets_workflow_code.json"
try:
    with open(test_workflow_path, "r") as f:
        test_workflow = json.load(f)
        print(f"Loaded test workflow from {test_workflow_path}")
except Exception as e:
    print(f"Error loading test workflow: {str(e)}")
    exit(1)

# Function to import a workflow
def import_workflow(workflow_data):
    url = f"{N8N_HOST_URL}/workflows"
    
    try:
        response = requests.post(url, headers=headers, json=workflow_data)
        
        if response.status_code == 200:
            created_workflow = response.json()
            print(f"Test workflow imported successfully!")
            print(f"Workflow ID: {created_workflow.get('id')}")
            print(f"Workflow name: {created_workflow.get('name')}")
            return created_workflow.get('id')
        else:
            print(f"Error importing workflow: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"Error: {str(e)}")
        return None

# Import the test workflow
workflow_id = import_workflow(test_workflow)

if workflow_id:
    print(f"\nTest workflow imported with ID: {workflow_id}")
    print(f"You can now open this workflow in n8n and test it to verify your Google Sheets connection.")
    print(f"After confirming the connection works, run update_workflows_mcp.py to update all your workflows.")
else:
    print("\nFailed to import test workflow. Please check the error messages above.")

print("\nDone.")
