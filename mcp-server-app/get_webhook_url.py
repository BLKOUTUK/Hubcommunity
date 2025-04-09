import requests
import os
import json
from dotenv import load_dotenv
from pathlib import Path

print("Getting webhook URL...")

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent / "mcp-server" / "config" / ".env"
print(f"Looking for .env file at: {env_path}")
print(f"File exists: {env_path.exists()}")
load_dotenv(dotenv_path=env_path)

# n8n API configuration
N8N_HOST_URL = os.getenv("N8N_HOST_URL")
N8N_API_KEY = os.getenv("N8N_API_KEY")

# Workflow IDs
TEST_WORKFLOW_ID = "rpKjzbKdHPJgItMU"  # Test Webhook
CAMPAIGN_WORKFLOW_ID = "YvtsmCK7vbgSzahe"  # Campaign Onboard 1

print(f"N8N_HOST_URL: {N8N_HOST_URL}")
print(f"N8N_API_KEY: {N8N_API_KEY[:10]}..." if N8N_API_KEY else "N8N_API_KEY: None")
print(f"TEST_WORKFLOW_ID: {TEST_WORKFLOW_ID}")
print(f"CAMPAIGN_WORKFLOW_ID: {CAMPAIGN_WORKFLOW_ID}")

# URL for workflow
test_url = f"{N8N_HOST_URL}/workflows/{TEST_WORKFLOW_ID}"
campaign_url = f"{N8N_HOST_URL}/workflows/{CAMPAIGN_WORKFLOW_ID}"

# Headers
headers = {
    "X-N8N-API-KEY": N8N_API_KEY,
    "Content-Type": "application/json"
}

try:
    print("\nGetting test workflow...")
    test_response = requests.get(test_url, headers=headers)
    
    if test_response.status_code == 200:
        test_data = test_response.json()
        print(f"Test workflow name: {test_data.get('name')}")
        
        # Find the webhook node
        webhook_node = None
        for node in test_data.get('nodes', []):
            if node.get('type') == 'n8n-nodes-base.webhook':
                webhook_node = node
                break
        
        if webhook_node:
            print("\nWebhook node found:")
            print(f"Name: {webhook_node.get('name')}")
            print(f"Path: {webhook_node.get('parameters', {}).get('path')}")
            print(f"Method: {webhook_node.get('parameters', {}).get('httpMethod')}")
            
            # Construct the webhook URL
            webhook_path = webhook_node.get('parameters', {}).get('path')
            test_webhook_url = f"http://localhost:5678/webhook/{webhook_path}"
            print(f"\nProduction webhook URL: {test_webhook_url}")
        else:
            print("No webhook node found in test workflow.")
    else:
        print(f"Error getting test workflow: {test_response.status_code}")
        print(f"Response: {test_response.text}")
    
    print("\nGetting campaign workflow...")
    campaign_response = requests.get(campaign_url, headers=headers)
    
    if campaign_response.status_code == 200:
        campaign_data = campaign_response.json()
        print(f"Campaign workflow name: {campaign_data.get('name')}")
        
        # Find the webhook node
        webhook_node = None
        for node in campaign_data.get('nodes', []):
            if node.get('type') == 'n8n-nodes-base.webhook':
                webhook_node = node
                break
        
        if webhook_node:
            print("\nWebhook node found:")
            print(f"Name: {webhook_node.get('name')}")
            print(f"Path: {webhook_node.get('parameters', {}).get('path')}")
            print(f"Method: {webhook_node.get('parameters', {}).get('httpMethod')}")
            
            # Construct the webhook URL
            webhook_path = webhook_node.get('parameters', {}).get('path')
            campaign_webhook_url = f"http://localhost:5678/webhook/{webhook_path}"
            print(f"\nProduction webhook URL: {campaign_webhook_url}")
        else:
            print("No webhook node found in campaign workflow.")
    else:
        print(f"Error getting campaign workflow: {campaign_response.status_code}")
        print(f"Response: {campaign_response.text}")
except Exception as e:
    print(f"Error: {str(e)}")

print("\nDone.")
