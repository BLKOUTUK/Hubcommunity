import requests
import os
import json
from dotenv import load_dotenv
from pathlib import Path

print("Importing n8n Workflow Templates...")

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

# List of workflow files to import
workflow_files = [
    "test_google_sheets_workflow_code.json",
    "onboarding_code_workflow.json",
    "survey_code_workflow.json",
    "ally_drip_code_workflow.json",
    "bqm_drip_code_workflow.json",
    "organiser_drip_code_workflow.json",
    "organisation_drip_code_workflow.json"
]

# Function to import a workflow
def import_workflow(file_path):
    print(f"\nImporting workflow from {file_path}...")

    try:
        # Load the workflow file
        with open(file_path, "r") as f:
            workflow_data = json.load(f)

        # Import the workflow
        url = f"{N8N_HOST_URL}/workflows"
        response = requests.post(url, headers=headers, json=workflow_data)

        if response.status_code == 200:
            created_workflow = response.json()
            print(f"Workflow imported successfully!")
            print(f"Workflow ID: {created_workflow.get('id')}")
            print(f"Workflow name: {created_workflow.get('name')}")
            return True, created_workflow.get('id'), created_workflow.get('name')
        else:
            print(f"Error importing workflow: {response.status_code}")
            print(f"Response: {response.text}")
            return False, None, None
    except Exception as e:
        print(f"Error: {str(e)}")
        return False, None, None

# Import each workflow
results = []
for file_path in workflow_files:
    success, workflow_id, workflow_name = import_workflow(file_path)
    results.append({
        "file": file_path,
        "success": success,
        "id": workflow_id,
        "name": workflow_name
    })

# Print summary
print("\n=== Import Summary ===")
for result in results:
    status = "SUCCESS" if result["success"] else "FAILED"
    print(f"{result['file']}: {status}")
    if result["success"]:
        print(f"  ID: {result['id']}")
        print(f"  Name: {result['name']}")

print("\nDone.")
