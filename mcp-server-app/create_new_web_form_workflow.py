import requests
import json
import time
import os

# Configuration
CONFIG_FILE = "blkout_nxt_config.json"
N8N_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MzZjNTEyZC1lYmM3LTRiYzYtYWM5MS0zMzI3ZDgzY2UwMjMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQzNzg1NTY0LCJleHAiOjE3NTE1MTUyMDB9.ZWbR5bp1jtaB7yfxn-kg4ASNHgXuRIe5QKv5O9ccUJI"
N8N_HOST_URL = "http://localhost:5678/api/v1"

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
def create_workflow(name, nodes, connections, active=False):
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
    webhook_url = config["web_form"]["webhook_url"].split("/")[-1]  # Extract the path
    success_message = config["web_form"]["success_message"]
    error_message = config["web_form"]["error_message"]

    # Create the workflow nodes
    nodes = [
        # Webhook node
        {
            "parameters": {
                "httpMethod": "POST",
                "path": webhook_url,
                "options": {
                    "responseMode": "responseNode"
                },
                "authentication": "none"
            },
            "name": "Signup Webhook",
            "type": "n8n-nodes-base.webhook",
            "typeVersion": 1,
            "position": [-600, 300]
        },
        # Code node for processing form data
        {
            "parameters": {
                "jsCode": """// Process the form data
const formData = $input.item.json;

// Extract name parts
let name = formData.name || '';
if (!name && formData.firstName) {
  name = formData.firstName;
  if (formData.lastName) {
    name += ' ' + formData.lastName;
  }
}

// Map memberType to Role
let role = 'Other'; // Default value
if (formData.memberType) {
  const memberType = formData.memberType.toLowerCase();
  if (memberType.includes('ally')) {
    role = 'Ally';
  } else if (memberType.includes('black queer man') || memberType.includes('bqm')) {
    role = 'Black Queer Men';
  } else if (memberType.includes('organiser') || memberType.includes('organizer')) {
    role = 'QTIPOC Organiser';
  } else if (memberType.includes('organisation') || memberType.includes('organization')) {
    role = 'Organisation';
  }
}

// Create data object matching the sheet's column structure
return {
  Email: formData.email || '',
  Name: name,
  Role: role,
  Organisation: formData.location || formData.organisation || formData.organization || '',
  Status: 'New',
  DateAdded: new Date().toISOString().split('T')[0],
  LastEmailSent: '',
  EmailHistory: '[]',
  OptOut: false,
  Source: 'Web Form'
};"""
            },
            "name": "Process Form Data",
            "type": "n8n-nodes-base.code",
            "typeVersion": 1,
            "position": [-400, 300]
        },
        # If node for validation
        {
            "parameters": {
                "conditions": {
                    "string": [
                        {
                            "value1": "={{ $json.Email }}",
                            "operation": "isNotEmpty"
                        }
                    ]
                }
            },
            "name": "Is Valid?",
            "type": "n8n-nodes-base.if",
            "typeVersion": 1,
            "position": [-200, 300]
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
            "name": "Add to Google Sheet",
            "type": "n8n-nodes-base.googleSheets",
            "typeVersion": 2,
            "position": [0, 200],
            "credentials": {
                "googleSheetsOAuth2Api": {
                    "id": google_sheets_credential_id,
                    "name": google_sheets_credential_name
                }
            }
        },
        # Success response node
        {
            "parameters": {
                "respondWith": "json",
                "responseBody": f"={{ {{success: true, message: \"{success_message}\"}} }}",
                "options": {}
            },
            "name": "Success Response",
            "type": "n8n-nodes-base.respondToWebhook",
            "typeVersion": 1,
            "position": [200, 200]
        },
        # Error response node
        {
            "parameters": {
                "respondWith": "json",
                "responseBody": f"={{ {{success: false, message: \"{error_message}\"}} }}",
                "options": {}
            },
            "name": "Error Response",
            "type": "n8n-nodes-base.respondToWebhook",
            "typeVersion": 1,
            "position": [0, 400]
        },
        # Email notification node for errors
        {
            "parameters": {
                "fromEmail": config["email"]["sender_email"],
                "toEmail": config["email"]["notification_email"],
                "subject": "BLKOUT NXT Web Form Error",
                "text": "There was an error processing a web form submission:\n\n{{ $json.message }}\n\nErrors: {{ $json.errors }}\n\nPlease check the n8n dashboard for more details."
            },
            "name": "Send Error Notification",
            "type": "n8n-nodes-base.emailSend",
            "typeVersion": 1,
            "position": [200, 400]
        }
    ]

    # Create the workflow connections
    connections = {
        "Signup Webhook": {
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
                        "node": "Is Valid?",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Is Valid?": {
            "main": [
                [
                    {
                        "node": "Add to Google Sheet",
                        "type": "main",
                        "index": 0
                    }
                ],
                [
                    {
                        "node": "Error Response",
                        "type": "main",
                        "index": 0
                    },
                    {
                        "node": "Send Error Notification",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Add to Google Sheet": {
            "main": [
                [
                    {
                        "node": "Success Response",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        }
    }

    # Create the workflow
    workflow_name = config["n8n"]["workflows"]["web_form_integration"]
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
            config["n8n"]["web_form_workflow_id"] = result["id"]

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
