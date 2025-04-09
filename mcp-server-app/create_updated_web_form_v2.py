import requests
import json
import sys

# Configuration
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MzZjNTEyZC1lYmM3LTRiYzYtYWM5MS0zMzI3ZDgzY2UwMjMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQzNzg1NTY0LCJleHAiOjE3NTE1MTUyMDB9.ZWbR5bp1jtaB7yfxn-kg4ASNHgXuRIe5QKv5O9ccUJI"
HOST_URL = "http://localhost:5678/api/v1"

# Headers for API requests
headers = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json"
}

def create_updated_web_form_workflow():
    """Create an updated web form integration workflow that matches the Google Sheet structure."""
    
    # Define the workflow
    workflow = {
        "name": "BLKOUT NXT Modern Web Form Integration (Updated v2)",
        "nodes": [
            {
                "parameters": {
                    "httpMethod": "POST",
                    "path": "blkout-nxt-signup-v2",
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
            {
                "parameters": {
                    "jsCode": """// Process the form data
const formData = $input.item.json;

// Log the incoming data
console.log('Received form submission:', JSON.stringify(formData));

// Map form fields to our database structure
let role = '';
if (formData.memberType) {
  // Convert memberType to our Role values
  const memberType = formData.memberType.toLowerCase();
  if (memberType.includes('ally')) {
    role = 'Ally';
  } else if (memberType.includes('black queer man') || memberType.includes('bqm')) {
    role = 'Black Queer Men';
  } else if (memberType.includes('organiser') || memberType.includes('organizer')) {
    role = 'QTIPOC Organiser';
  } else if (memberType.includes('organisation') || memberType.includes('organization')) {
    role = 'Organisation';
  } else {
    role = 'Other';
  }
}

// Extract name parts
let firstName = formData.firstName || '';
let lastName = formData.lastName || '';

// If we only have a full name, try to split it
if (!firstName && formData.name) {
  const nameParts = formData.name.split(' ');
  if (nameParts.length > 0) {
    firstName = nameParts[0];
    if (nameParts.length > 1) {
      lastName = nameParts.slice(1).join(' ');
    }
  }
}

// Format the data for our database based on actual Google Sheet structure
const memberData = {
  Email: formData.email || '',
  FirstName: firstName,
  LastName: lastName,
  Role: role,
  Organisation: formData.location || formData.organisation || formData.organization || '',
  Status: 'Active',
  DateAdded: new Date().toISOString().split('T')[0],
  LastEmailSent: '',
  EmailHistory: JSON.stringify([]),
  OptOut: false,
  Source: 'Web Form'
};

// Validate the data
let isValid = true;
let validationErrors = [];

if (!memberData.Email) {
  isValid = false;
  validationErrors.push('Email is required');
}

if (!memberData.FirstName) {
  isValid = false;
  validationErrors.push('First name is required');
}

if (!isValid) {
  return {
    success: false,
    errors: validationErrors,
    message: 'Validation failed'
  };
}

// Return the processed data
return memberData;"""
                },
                "name": "Process Form Data",
                "type": "n8n-nodes-base.code",
                "typeVersion": 1,
                "position": [-400, 300]
            },
            {
                "parameters": {
                    "resource": "spreadsheet",
                    "operation": "appendOrUpdate",
                    "documentId": "1EDTTmhBGiZdhKuLwCQLDduRuIE2oQmXfeJvoiowU4bs",
                    "sheetName": "Welcome",
                    "columns": "A:K",
                    "keyColumn": "Email",
                    "options": {
                        "valueInputMode": "RAW"
                    }
                },
                "name": "Add to Google Sheet",
                "type": "n8n-nodes-base.googleSheets",
                "typeVersion": 4,
                "position": [-200, 300],
                "credentials": {
                    "googleSheetsOAuth2Api": {
                        "id": "NzGLdLkWxHz8wqeq",
                        "name": "Google Sheets account"
                    }
                }
            },
            {
                "parameters": {
                    "respondWith": "json",
                    "responseBody": "={{ {success: true, message: \"Thank you for signing up for BLKOUT NXT! You'll receive a welcome email shortly.\"} }}",
                    "options": {}
                },
                "name": "Success Response",
                "type": "n8n-nodes-base.respondToWebhook",
                "typeVersion": 1,
                "position": [0, 200]
            },
            {
                "parameters": {
                    "respondWith": "json",
                    "responseBody": "={{ {success: false, message: \"There was an error processing your signup. Please try again or contact support.\"} }}",
                    "options": {}
                },
                "name": "Error Response",
                "type": "n8n-nodes-base.respondToWebhook",
                "typeVersion": 1,
                "position": [0, 400]
            },
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
                "position": [-200, 500]
            },
            {
                "parameters": {
                    "fromEmail": "nxt@blkoutuk.com",
                    "toEmail": "blkoutuk@gmail.com",
                    "subject": "BLKOUT NXT Web Form Error",
                    "text": "There was an error processing a web form submission:\n\n{{ $json.message }}\n\nErrors: {{ $json.errors }}\n\nPlease check the n8n dashboard for more details."
                },
                "name": "Send Error Notification",
                "type": "n8n-nodes-base.emailSend",
                "typeVersion": 1,
                "position": [200, 400]
            }
        ],
        "connections": {
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
            }
        },
        "settings": {
            "executionOrder": "v1"
        }
    }
    
    # Create the workflow
    try:
        response = requests.post(
            f"{HOST_URL}/workflows",
            headers=headers,
            json=workflow
        )
        response.raise_for_status()
        print(f"Successfully created workflow: {workflow['name']}")
        print(f"Webhook URL: {HOST_URL.replace('/api/v1', '')}/webhook/{workflow['nodes'][0]['parameters']['path']}")
        
        # Activate the workflow
        workflow_id = response.json()["id"]
        activate_response = requests.post(
            f"{HOST_URL}/workflows/{workflow_id}/activate",
            headers=headers
        )
        activate_response.raise_for_status()
        print(f"Successfully activated workflow: {workflow['name']}")
        
        return response.json()
    except Exception as e:
        print(f"Error creating workflow: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return None

if __name__ == "__main__":
    create_updated_web_form_workflow()
