import requests
import os
import json
import time
from dotenv import load_dotenv
from pathlib import Path

print("Updating n8n Workflows with Code Nodes via MCP Server...")

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

# Load the Code node scripts
code_files = {
    "onboarding": "code_nodes/onboarding_code.js",
    "survey": "code_nodes/survey_code.js",
    "ally_drip": "code_nodes/ally_drip_code.js",
    "bqm_drip": "code_nodes/bqm_drip_code.js",
    "organiser_drip": "code_nodes/organiser_drip_code.js",
    "organisation_drip": "code_nodes/organisation_drip_code.js"
}

code_scripts = {}
for key, file_path in code_files.items():
    try:
        with open(file_path, "r") as f:
            code_scripts[key] = f.read()
            print(f"Loaded code script: {key}")
    except Exception as e:
        print(f"Error loading {file_path}: {str(e)}")
        code_scripts[key] = ""

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

# Function to add a Code node to a workflow
def add_code_node_to_workflow(workflow_id, workflow_name, code_script, google_sheets_node_name, old_function_node_name, next_node_name=None):
    print(f"\nUpdating {workflow_name} (ID: {workflow_id})...")
    
    # Get the current workflow
    workflow = get_workflow(workflow_id)
    if not workflow:
        return False
    
    # Find the Google Sheets node and the old Function node
    google_sheets_node = None
    old_function_node = None
    next_node = None
    
    for node in workflow.get("nodes", []):
        if node.get("name") == google_sheets_node_name:
            google_sheets_node = node
        elif node.get("name") == old_function_node_name:
            old_function_node = node
        elif next_node_name and node.get("name") == next_node_name:
            next_node = node
    
    if not google_sheets_node:
        print(f"Error: Could not find Google Sheets node '{google_sheets_node_name}' in workflow {workflow_id}")
        return False
    
    if not old_function_node:
        print(f"Error: Could not find Function node '{old_function_node_name}' in workflow {workflow_id}")
        return False
    
    # Create a new Code node
    new_code_node = {
        "parameters": {
            "jsCode": code_script
        },
        "name": f"{old_function_node_name} (Code)",
        "type": "n8n-nodes-base.code",
        "typeVersion": 1,
        "position": [
            old_function_node.get("position", [0, 0])[0],
            old_function_node.get("position", [0, 0])[1] + 100
        ],
        "id": f"code-node-{int(time.time())}"
    }
    
    # Add the new Code node to the workflow
    workflow["nodes"].append(new_code_node)
    
    # Update connections
    # 1. Find connections from Google Sheets to old Function node
    gs_to_function_connection = None
    for source_node, connections in workflow.get("connections", {}).items():
        if source_node == google_sheets_node.get("name"):
            for i, connection_group in enumerate(connections.get("main", [])):
                for j, connection in enumerate(connection_group):
                    if connection.get("node") == old_function_node.get("name"):
                        gs_to_function_connection = {
                            "source_node": source_node,
                            "source_index": i,
                            "target_index": j
                        }
                        break
                if gs_to_function_connection:
                    break
    
    # 2. Find connections from old Function node to next nodes
    function_connections = []
    if old_function_node.get("name") in workflow.get("connections", {}):
        for i, connection_group in enumerate(workflow.get("connections", {}).get(old_function_node.get("name"), {}).get("main", [])):
            for connection in connection_group:
                function_connections.append({
                    "target_node": connection.get("node"),
                    "source_index": i,
                    "target_index": connection.get("index", 0)
                })
    
    # 3. Create connection from Google Sheets to new Code node
    if gs_to_function_connection:
        source_node = gs_to_function_connection["source_node"]
        source_index = gs_to_function_connection["source_index"]
        
        if source_node not in workflow.get("connections", {}):
            workflow["connections"][source_node] = {"main": []}
        
        while len(workflow["connections"][source_node]["main"]) <= source_index:
            workflow["connections"][source_node]["main"].append([])
        
        workflow["connections"][source_node]["main"][source_index].append({
            "node": new_code_node["name"],
            "type": "main",
            "index": 0
        })
    
    # 4. Create connections from new Code node to next nodes
    if function_connections:
        workflow["connections"][new_code_node["name"]] = {"main": []}
        
        for connection in function_connections:
            source_index = connection["source_index"]
            
            while len(workflow["connections"][new_code_node["name"]]["main"]) <= source_index:
                workflow["connections"][new_code_node["name"]]["main"].append([])
            
            workflow["connections"][new_code_node["name"]]["main"][source_index].append({
                "node": connection["target_node"],
                "type": "main",
                "index": connection["target_index"]
            })
    
    # Update the workflow
    return update_workflow(workflow_id, workflow)

# Workflow configurations
workflows = [
    {
        "id": "9U7WKBX89mZCeyy3",
        "name": "BLKOUT NXT Onboarding",
        "code_script": code_scripts["onboarding"],
        "google_sheets_node": "Get New Members",
        "function_node": "Filter & Segment Members",
        "next_node": "Route by Segment"
    },
    {
        "id": "pk1rXgst1KaWsSYa",
        "name": "BLKOUT NXT Survey Follow-up (Updated)",
        "code_script": code_scripts["survey"],
        "google_sheets_node": "Get Members for Survey",
        "function_node": "Filter for Survey Eligibility",
        "next_node": "Is Reminder?"
    },
    {
        "id": "W11CYyvc0tvEnp6b",
        "name": "BLKOUT NXT Ally Drip Campaign",
        "code_script": code_scripts["ally_drip"],
        "google_sheets_node": "Get Allies",
        "function_node": "Filter for Drip Eligibility",
        "next_node": "Route by Drip Stage"
    },
    {
        "id": "h0DO1MrAx0HJQuhe",
        "name": "BLKOUT NXT Black Queer Men Drip Campaign",
        "code_script": code_scripts["bqm_drip"],
        "google_sheets_node": "Get BQM Members",
        "function_node": "Filter for Drip Eligibility",
        "next_node": "Route by Drip Stage"
    },
    {
        "id": "GnKiyiQqaqdB6mP2",
        "name": "BLKOUT NXT QTIPOC Organiser Drip Campaign",
        "code_script": code_scripts["organiser_drip"],
        "google_sheets_node": "Get Organisers",
        "function_node": "Filter for Drip Eligibility",
        "next_node": "Route by Drip Stage"
    },
    {
        "id": "AcsMaOlCZEOdyBAh",
        "name": "BLKOUT NXT Organisation Drip Campaign",
        "code_script": code_scripts["organisation_drip"],
        "google_sheets_node": "Get Organisations",
        "function_node": "Filter for Drip Eligibility",
        "next_node": "Route by Drip Stage"
    }
]

# Update each workflow
results = []
for workflow in workflows:
    print(f"\n=== Updating {workflow['name']} ===")
    success = add_code_node_to_workflow(
        workflow["id"],
        workflow["name"],
        workflow["code_script"],
        workflow["google_sheets_node"],
        workflow["function_node"],
        workflow["next_node"]
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
