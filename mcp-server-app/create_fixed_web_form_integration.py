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

def create_fixed_web_form_integration():
    """Create a web form integration workflow that correctly appends data to the Google Sheet."""
    
    # Define the workflow
    workflow = {
        "name": "BLKOUT NXT Web Form Integration (Fixed Append)",
        "nodes": [
            {
                "parameters": {
                    "httpMethod": "POST",
                    "path": "blkout-nxt-signup-fixed-append",
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

// Map memberType to Role
let role = '';
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
  } else {
    role = 'Other';
  }
}

// Create data object that exactly matches the spreadsheet columns
const memberData = {
  "Email": formData.email || '',
  "FirstName": firstName,
  "LastName": lastName,
  "Role": role,
  "Organisation": formData.location || formData.organisation || formData.organization || '',
  "Status": 'Active',
  "DateAdded": new Date().toISOString().split('T')[0],
  "LastEmailSent": '',
  "EmailHistory": '[]',
  "OptOut": false,
  "Source": 'Web Form'
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
            {
                "parameters": {
                    "resource": "spreadsheet",
                    "operation": "append", # Using append instead of appendOrUpdate
                    "documentId": {"value": "1EDTTmhBGiZdhKuLwCQLDduRuIE2oQmXfeJvoiowU4bs"},
                    "sheetName": "Welcome",
                    "columns": {"mappingMode": "autoMapInputData"},
                    "options": {}
                },
                "name": "Add to Google Sheet",
                "type": "n8n-nodes-base.googleSheets",
                "typeVersion": 2,
                "position": [0, 200],
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
                "position": [200, 200]
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
        workflow_id = response.json()["id"]
        
        print(f"Created workflow with ID: {workflow_id}")
        
        # Activate the workflow
        activate_response = requests.post(
            f"{HOST_URL}/workflows/{workflow_id}/activate",
            headers=headers
        )
        activate_response.raise_for_status()
        
        print(f"Activated workflow with ID: {workflow_id}")
        print(f"Webhook URL: http://localhost:5678/webhook/blkout-nxt-signup-fixed-append")
        
        return workflow_id
    except Exception as e:
        print(f"Error creating workflow: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return None

if __name__ == "__main__":
    workflow_id = create_fixed_web_form_integration()
