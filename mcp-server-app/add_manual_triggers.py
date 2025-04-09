import requests
import os
import json
import time
from dotenv import load_dotenv
from pathlib import Path

print("Adding Manual Triggers to n8n Workflows...")

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

# List of workflow IDs to update
workflow_ids = [
    "4052PlMLO2rhFJg5",  # BLKOUT NXT Onboarding (Code Node)
    "oss8rpBDPY940tUs",  # BLKOUT NXT Survey Follow-up (Code Node)
    "drsm0UToa7j4xpWJ",  # BLKOUT NXT Ally Drip Campaign (Code Node)
    "cCRSjbiJQcURLnW8",  # BLKOUT NXT Black Queer Men Drip Campaign (Code Node)
    "1910q6w2kM4ThGzA",  # BLKOUT NXT QTIPOC Organiser Drip Campaign (Code Node)
    "3OhAqoNzkmHmna5O"   # BLKOUT NXT Organisation Drip Campaign (Code Node)
]

# Function to get a workflow by ID
def get_workflow(workflow_id):
    url = f"{N8N_HOST_URL}/workflows/{workflow_id}"

    try:
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error getting workflow {workflow_id}: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"Error: {str(e)}")
        return None

# Function to update a workflow
def update_workflow(workflow_id, workflow_data):
    url = f"{N8N_HOST_URL}/workflows/{workflow_id}"

    try:
        response = requests.put(url, headers=headers, json=workflow_data)

        if response.status_code == 200:
            print(f"Workflow {workflow_id} updated successfully!")
            return True
        else:
            print(f"Error updating workflow {workflow_id}: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

# Function to add a Manual trigger to a workflow
def add_manual_trigger(workflow_id):
    print(f"\nAdding Manual trigger to workflow {workflow_id}...")

    # Get the current workflow
    workflow = get_workflow(workflow_id)
    if not workflow:
        return False

    # Find the first node (any node will do)
    if not workflow.get("nodes", []):
        print(f"Error: No nodes found in workflow {workflow_id}")
        return False

    # Sort nodes by position to find the leftmost one
    sorted_nodes = sorted(workflow.get("nodes", []), key=lambda node: node.get("position", [0, 0])[0])
    first_node = sorted_nodes[0]

    print(f"Found first node: {first_node.get('name')}")

    # Create a Manual trigger node
    manual_trigger = {
        "parameters": {},
        "name": "Manual Trigger",
        "type": "n8n-nodes-base.manualTrigger",
        "typeVersion": 1,
        "position": [
            first_node.get("position", [0, 0])[0] - 200,
            first_node.get("position", [0, 0])[1]
        ],
        "id": f"manual-trigger-{int(time.time())}"
    }

    # Add the Manual trigger to the workflow
    workflow["nodes"].append(manual_trigger)

    # Create connection from Manual trigger to first node
    if "connections" not in workflow:
        workflow["connections"] = {}

    workflow["connections"]["Manual Trigger"] = {
        "main": [
            [
                {
                    "node": first_node.get("name"),
                    "type": "main",
                    "index": 0
                }
            ]
        ]
    }

    # Update the workflow
    return update_workflow(workflow_id, workflow)

# Add Manual trigger to each workflow
results = []
for workflow_id in workflow_ids:
    success = add_manual_trigger(workflow_id)
    results.append({
        "workflow_id": workflow_id,
        "success": success
    })

# Print summary
print("\n=== Update Summary ===")
for result in results:
    status = "SUCCESS" if result["success"] else "FAILED"
    print(f"Workflow {result['workflow_id']}: {status}")

print("\nDone.")
