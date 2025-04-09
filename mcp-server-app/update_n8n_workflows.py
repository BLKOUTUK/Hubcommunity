import requests
import os
import json
from dotenv import load_dotenv
from pathlib import Path

print("Updating n8n Workflows with Robust Function Code...")

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

# Load the updated function code
with open("updated_functions/onboarding_filter_function.js", "r") as f:
    onboarding_filter_code = f.read()

with open("updated_functions/survey_filter_function.js", "r") as f:
    survey_filter_code = f.read()

with open("updated_functions/drip_filter_function.js", "r") as f:
    drip_filter_code = f.read()

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

# Function to update a specific function node in a workflow
def update_function_node(workflow_id, node_name, new_code, segment=None):
    print(f"\nUpdating {node_name} in workflow {workflow_id}...")
    
    # Get the current workflow
    workflow = get_workflow(workflow_id)
    if not workflow:
        return False
    
    # Find the function node
    found = False
    for node in workflow.get("nodes", []):
        if node.get("name") == node_name and node.get("type") == "n8n-nodes-base.function":
            print(f"Found {node_name} node, updating code...")
            
            # Prepare the code - modify for drip campaigns if needed
            code = new_code
            if segment and "drip" in node_name.lower():
                # Replace segment-specific parts for drip campaigns
                if segment == "BQM":
                    code = code.replace("role.includes('ally')", "role.includes('black queer man')")
                    code = code.replace("DripCampaign: Ally", "DripCampaign: BQM")
                    code = code.replace("dripCampaign: 'Ally'", "dripCampaign: 'BQM'")
                elif segment == "QTIPOCOrganiser":
                    code = code.replace("role.includes('ally')", "role.includes('qtipoc organiser')")
                    code = code.replace("DripCampaign: Ally", "DripCampaign: QTIPOCOrganiser")
                    code = code.replace("dripCampaign: 'Ally'", "dripCampaign: 'QTIPOCOrganiser'")
                elif segment == "Organisation":
                    code = code.replace("role.includes('ally')", "role.includes('organisation')")
                    code = code.replace("DripCampaign: Ally", "DripCampaign: Organisation")
                    code = code.replace("dripCampaign: 'Ally'", "dripCampaign: 'Organisation'")
            
            # Update the node's function code
            node["parameters"]["functionCode"] = code
            found = True
            break
    
    if not found:
        print(f"Error: Could not find {node_name} node in workflow {workflow_id}")
        return False
    
    # Update the workflow
    return update_workflow(workflow_id, workflow)

# Workflow IDs and node names
workflows = [
    {
        "id": "9U7WKBX89mZCeyy3",
        "name": "BLKOUT NXT Onboarding",
        "node_name": "Filter & Segment Members",
        "code": onboarding_filter_code,
        "segment": None
    },
    {
        "id": "pk1rXgst1KaWsSYa",
        "name": "BLKOUT NXT Survey Follow-up (Updated)",
        "node_name": "Filter for Survey Eligibility",
        "code": survey_filter_code,
        "segment": None
    },
    {
        "id": "W11CYyvc0tvEnp6b",
        "name": "BLKOUT NXT Ally Drip Campaign",
        "node_name": "Filter for Drip Eligibility",
        "code": drip_filter_code,
        "segment": "Ally"
    },
    {
        "id": "h0DO1MrAx0HJQuhe",
        "name": "BLKOUT NXT Black Queer Men Drip Campaign",
        "node_name": "Filter for Drip Eligibility",
        "code": drip_filter_code,
        "segment": "BQM"
    },
    {
        "id": "GnKiyiQqaqdB6mP2",
        "name": "BLKOUT NXT QTIPOC Organiser Drip Campaign",
        "node_name": "Filter for Drip Eligibility",
        "code": drip_filter_code,
        "segment": "QTIPOCOrganiser"
    },
    {
        "id": "AcsMaOlCZEOdyBAh",
        "name": "BLKOUT NXT Organisation Drip Campaign",
        "node_name": "Filter for Drip Eligibility",
        "code": drip_filter_code,
        "segment": "Organisation"
    }
]

# Update each workflow
results = []
for workflow in workflows:
    print(f"\n=== Updating {workflow['name']} ===")
    success = update_function_node(
        workflow["id"], 
        workflow["node_name"], 
        workflow["code"],
        workflow["segment"]
    )
    results.append({
        "workflow": workflow["name"],
        "success": success
    })

# Print summary
print("\n=== Update Summary ===")
for result in results:
    status = "SUCCESS" if result["success"] else "FAILED"
    print(f"{result['workflow']}: {status}")

print("\nDone.")
