import requests
import os
import json
from dotenv import load_dotenv
from pathlib import Path

print("Getting execution details...")

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent / "mcp-server" / "config" / ".env"
print(f"Looking for .env file at: {env_path}")
print(f"File exists: {env_path.exists()}")
load_dotenv(dotenv_path=env_path)

# n8n API configuration
N8N_HOST_URL = os.getenv("N8N_HOST_URL")
N8N_API_KEY = os.getenv("N8N_API_KEY")

# Workflow ID
WORKFLOW_ID = "R7MXcPxwDyKuPgOo"  # Campaign Onboard 1 (Fixed)

print(f"N8N_HOST_URL: {N8N_HOST_URL}")
print(f"N8N_API_KEY: {N8N_API_KEY[:10]}..." if N8N_API_KEY else "N8N_API_KEY: None")
print(f"WORKFLOW_ID: {WORKFLOW_ID}")

# URL for executions
url = f"{N8N_HOST_URL}/executions"
params = {
    # Get all executions
    "limit": 10
}

print(f"Testing URL: {url}")

# Headers
headers = {
    "X-N8N-API-KEY": N8N_API_KEY,
    "Content-Type": "application/json"
}

try:
    print("Sending request...")
    response = requests.get(url, headers=headers, params=params)
    print(f"Status code: {response.status_code}")

    if response.status_code == 200:
        data = response.json()
        print(f"Success! Retrieved {len(data.get('data', []))} executions.")

        if data.get('data'):
            execution = data['data'][0]
            print(f"Execution ID: {execution.get('id')}")
            print(f"Status: {'Finished' if execution.get('finished') else 'Running'}")
            print(f"Started: {execution.get('startedAt')}")
            print(f"Stopped: {execution.get('stoppedAt')}")

            # Get execution details
            execution_id = execution.get('id')
            detail_url = f"{N8N_HOST_URL}/executions/{execution_id}?includeData=true"

            print(f"\nGetting execution details from: {detail_url}")
            detail_response = requests.get(detail_url, headers=headers)

            if detail_response.status_code == 200:
                detail_data = detail_response.json()

                # Save the execution details to a file
                with open("execution_details.json", "w") as f:
                    json.dump(detail_data, f, indent=2)
                print("Execution details saved to execution_details.json")

                # Print node execution status
                if 'data' in detail_data and detail_data['data'] and 'executionData' in detail_data['data']:
                    execution_data = detail_data['data']['executionData']
                    if 'nodeExecutionStack' in execution_data:
                        print("\nNode Execution Status:")
                        for node in execution_data.get('nodeExecutionStack', []):
                            node_name = node.get('node', {}).get('name', 'Unknown')
                            node_status = node.get('status', 'Unknown')
                            print(f"- {node_name}: {node_status}")

                    # Check for errors
                    if 'error' in execution_data:
                        print("\nError in execution:")
                        print(execution_data['error'])
            else:
                print(f"Error getting execution details: {detail_response.status_code}")
                print(f"Response: {detail_response.text}")
        else:
            print("No executions found.")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Error: {str(e)}")

print("Done.")
