import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
CONFIG_FILE = "blkout_nxt_config.json"
N8N_API_KEY = os.getenv("N8N_API_KEY", "")
N8N_HOST_URL = os.getenv("N8N_HOST_URL", "http://localhost:5678/api/v1")

# Load configuration
def load_config():
    """Load configuration from the config file."""
    try:
        with open(CONFIG_FILE, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading configuration: {str(e)}")
        return None

# Create a new workflow
def create_workflow(name, nodes, connections):
    """Create a new workflow in n8n."""
    headers = {
        "X-N8N-API-KEY": N8N_API_KEY,
        "Content-Type": "application/json"
    }
    
    payload = {
        "name": name,
        "nodes": nodes,
        "connections": connections,
        "settings": {
            "executionOrder": "v1"
        }
    }
    
    try:
        response = requests.post(
            f"{N8N_HOST_URL}/workflows",
            headers=headers,
            json=payload
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error creating workflow: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return None

# Activate a workflow
def activate_workflow(workflow_id):
    """Activate a workflow in n8n."""
    headers = {
        "X-N8N-API-KEY": N8N_API_KEY
    }
    
    try:
        response = requests.post(
            f"{N8N_HOST_URL}/workflows/{workflow_id}/activate",
            headers=headers
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error activating workflow: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return None

# Create the web form integration workflow
def create_web_form_workflow():
    """Create the web form integration workflow."""
    # Check if API key is available
    if not N8N_API_KEY:
        print("Error: N8N_API_KEY environment variable is not set.")
        return
    
    config = load_config()
    if not config:
        print("Failed to load configuration.")
        return
    
    # Get configuration values
    google_sheets = config["google_sheets"]
    sheet_id = google_sheets["subscriber_sheet_id"]
    sheet_name = google_sheets["subscriber_sheet_name"]
    google_sheets_credential_id = config["n8n"]["google_sheets_credential_id"]
    google_sheets_credential_name = config["n8n"]["google_sheets_credential_name"]
    
    # Create the workflow nodes
    nodes = [
        # Webhook node
        {
            "parameters": {
                "httpMethod": "POST",
                "path": "blkout-nxt-signup-env",
                "options": {
                    "responseMode": "lastNode"
                },
                "authentication": "none"
            },
            "name": "Webhook",
            "type": "n8n-nodes-base.webhook",
            "typeVersion": 1,
            "position": [0, 0],
            "webhookId": "blkout-nxt-signup-env"
        },
        # Code node for processing form data
        {
            "parameters": {
                "jsCode": "// Process the form data\nconst formData = $input.item.json;\n\n// Extract name parts\nlet name = formData.name || '';\nif (!name && formData.firstName) {\n  name = formData.firstName;\n  if (formData.lastName) {\n    name += ' ' + formData.lastName;\n  }\n}\n\n// Map memberType to Role\nlet role = 'Other'; // Default value\nif (formData.memberType) {\n  const memberType = formData.memberType.toLowerCase();\n  if (memberType.includes('ally')) {\n    role = 'Ally';\n  } else if (memberType.includes('black queer man') || memberType.includes('bqm')) {\n    role = 'Black Queer Men';\n  } else if (memberType.includes('organiser') || memberType.includes('organizer')) {\n    role = 'QTIPOC Organiser';\n  } else if (memberType.includes('organisation') || memberType.includes('organization')) {\n    role = 'Organisation';\n  }\n}\n\n// Create data object matching the sheet's column structure\nreturn {\n  Email: formData.email || '',\n  Name: name,\n  Role: role,\n  Organisation: formData.location || formData.organisation || formData.organization || '',\n  Status: 'New',\n  DateAdded: new Date().toISOString().split('T')[0],\n  LastEmailSent: '',\n  EmailHistory: '[]',\n  OptOut: false,\n  Source: 'Web Form'\n};"
            },
            "name": "Process Form Data",
            "type": "n8n-nodes-base.code",
            "typeVersion": 1,
            "position": [220, 0]
        },
        # Google Sheets node for adding data
        {
            "parameters": {
                "resource": "spreadsheet",
                "operation": "append",
                "documentId": {
                    "value": sheet_id
                },
                "sheetName": sheet_name,
                "columns": {
                    "mappingMode": "autoMapInputData"
                },
                "options": {}
            },
            "name": "Google Sheets",
            "type": "n8n-nodes-base.googleSheets",
            "typeVersion": 2,
            "position": [440, 0],
            "credentials": {
                "googleSheetsOAuth2Api": {
                    "id": google_sheets_credential_id,
                    "name": google_sheets_credential_name
                }
            }
        },
        # Respond to Webhook node
        {
            "parameters": {
                "respondWith": "json",
                "responseBody": "={{ {success: true, message: \"Thank you for signing up for BLKOUT NXT! You'll receive a welcome email shortly.\"} }}",
                "options": {}
            },
            "name": "Respond to Webhook",
            "type": "n8n-nodes-base.respondToWebhook",
            "typeVersion": 1,
            "position": [660, 0]
        }
    ]
    
    # Create the workflow connections
    connections = {
        "Webhook": {
            "main": [
                [
                    {
                        "node": "Process Form Data",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Process Form Data": {
            "main": [
                [
                    {
                        "node": "Google Sheets",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Google Sheets": {
            "main": [
                [
                    {
                        "node": "Respond to Webhook",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        }
    }
    
    # Create the workflow
    workflow_name = "BLKOUT NXT Web Form Integration (Env)"
    print(f"Creating workflow: {workflow_name}")
    result = create_workflow(workflow_name, nodes, connections)
    
    if result:
        print(f"Workflow created successfully with ID: {result['id']}")
        
        # Activate the workflow
        print("Activating workflow...")
        activate_result = activate_workflow(result["id"])
        
        if activate_result:
            print("Workflow activated successfully!")
            
            # Update the configuration with the new workflow ID
            config["n8n"]["env_web_form_workflow_id"] = result["id"]
            
            # Save the updated configuration
            try:
                with open(CONFIG_FILE, "w") as f:
                    json.dump(config, f, indent=2)
                print("Configuration updated with new workflow ID.")
            except Exception as e:
                print(f"Error updating configuration: {str(e)}")
        else:
            print("Failed to activate workflow.")
    else:
        print("Failed to create workflow.")

if __name__ == "__main__":
    create_web_form_workflow()
