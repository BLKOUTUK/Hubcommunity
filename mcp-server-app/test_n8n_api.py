import requests
import os
import json
from dotenv import load_dotenv
import sys

# Load environment variables from .env file
load_dotenv('mcp-server/config/.env')

# Get n8n API credentials from environment variables
N8N_API_KEY = os.getenv("N8N_API_KEY")
N8N_HOST_URL = os.getenv("N8N_HOST_URL")

print(f"Using N8N_HOST_URL: {N8N_HOST_URL}")
print(f"Using N8N_API_KEY: {N8N_API_KEY[:10]}...")

# Set up headers for API requests
headers = {
    "X-N8N-API-KEY": N8N_API_KEY
}

# Test listing workflows
try:
    response = requests.get(
        f"{N8N_HOST_URL}/workflows",
        headers=headers
    )
    response.raise_for_status()
    data = response.json()
    print(f"Response type: {type(data)}")
    print(f"Response content: {json.dumps(data, indent=2)[:500]}...")

    if isinstance(data, list):
        print(f"Successfully retrieved {len(data)} workflows:")
        for workflow in data:
            if isinstance(workflow, dict):
                print(f"- {workflow.get('name')} (ID: {workflow.get('id')})")
            else:
                print(f"- {workflow}")
    elif isinstance(data, dict):
        if 'data' in data:
            workflows = data['data']
            print(f"Successfully retrieved {len(workflows)} workflows:")
            for workflow in workflows:
                print(f"- {workflow.get('name')} (ID: {workflow.get('id')})")
        else:
            print(f"Response keys: {data.keys()}")
    else:
        print(f"Unexpected response type: {type(data)}")
except Exception as e:
    print(f"Error listing workflows: {str(e)}")
    if hasattr(e, 'response') and e.response is not None:
        print(f"Response: {e.response.text}")
