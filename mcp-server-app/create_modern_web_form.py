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

def create_modern_web_form_workflow():
    """Create a modern web form integration workflow."""

    # Define the workflow
    workflow = {
        "name": "BLKOUT NXT Modern Web Form Integration",
        "nodes": [
            {
                "parameters": {
                    "httpMethod": "POST",
                    "path": "blkout-nxt-signup-modern",
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
let memberType = '';
if (formData.memberType) {
  // Convert memberType to our standard values
  const memberTypeInput = formData.memberType.toLowerCase();
  if (memberTypeInput.includes('ally')) {
    memberType = 'Ally';
  } else if (memberTypeInput.includes('black queer man') || memberTypeInput.includes('bqm')) {
    memberType = 'Black Queer Men';
  } else if (memberTypeInput.includes('organiser') || memberTypeInput.includes('organizer')) {
    memberType = 'QTIPOC Organiser';
  } else if (memberTypeInput.includes('organisation') || memberTypeInput.includes('organization')) {
    memberType = 'Organisation';
  } else {
    memberType = 'Other';
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

// Create full name
const fullName = `${firstName} ${lastName}`.trim();

// Format the data for our database
const memberData = {
  Name: fullName,
  Email: formData.email || '',
  Status: 'Active',
  JoinDate: new Date().toISOString().split('T')[0],
  LastActive: new Date().toISOString().split('T')[0],
  MemberType: memberType,
  Location: formData.location || formData.organisation || formData.organization || '',
  SurveyStatus: '',
  ReminderSent: '',
  OnboardingStatus: 'New',
  DripStage: '',
  LastEmailSent: '',
  Notes: `Source: Web Form; Submission Date: ${new Date().toISOString()}`
};

// Validate the data
let isValid = true;
let validationErrors = [];

if (!memberData.Email) {
  isValid = false;
  validationErrors.push('Email is required');
}

if (!memberData.Name) {
  isValid = false;
  validationErrors.push('Name is required');
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
                    "columns": "A:L",
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
        # "active": True,  # This is read-only
        "settings": {
            "executionOrder": "v1"
        },
        "staticData": None
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
        return response.json()
    except Exception as e:
        print(f"Error creating workflow: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return None

if __name__ == "__main__":
    create_modern_web_form_workflow()
