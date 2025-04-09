import requests
import json
import time

# Configuration
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MzZjNTEyZC1lYmM3LTRiYzYtYWM5MS0zMzI3ZDgzY2UwMjMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQzNzg1NTY0LCJleHAiOjE3NTE1MTUyMDB9.ZWbR5bp1jtaB7yfxn-kg4ASNHgXuRIe5QKv5O9ccUJI"
HOST_URL = "http://localhost:5678/api/v1"

# Headers for API requests
headers = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json"
}

def create_scheduled_test_workflow():
    """Create a scheduled workflow that adds test data to the Google Sheet."""
    
    # Define the workflow
    workflow = {
        "name": "Scheduled Test Data",
        "nodes": [
            {
                "parameters": {
                    "rule": {
                        "interval": [
                            {
                                "field": "seconds",
                                "secondsInterval": 10
                            }
                        ]
                    }
                },
                "name": "Schedule Trigger",
                "type": "n8n-nodes-base.scheduleTrigger",
                "typeVersion": 1,
                "position": [0, 0]
            },
            {
                "parameters": {
                    "jsCode": """// Generate test data for different member types
const memberTypes = [
  { type: "Ally", email: "ally.scheduled@example.com", location: "London" },
  { type: "Black Queer Men", email: "bqm.scheduled@example.com", location: "Manchester" },
  { type: "QTIPOC Organiser", email: "organiser.scheduled@example.com", location: "Birmingham" },
  { type: "Organisation", email: "org.scheduled@example.com", location: "Test Organisation" }
];

// Select a random member type
const randomIndex = Math.floor(Math.random() * memberTypes.length);
const memberType = memberTypes[randomIndex];

// Generate a timestamp to make each email unique
const timestamp = Date.now();

// Create the test data
return {
  Email: `${memberType.type.toLowerCase()}.${timestamp}@example.com`,
  FirstName: memberType.type,
  LastName: "Test",
  Role: memberType.type,
  Organisation: memberType.location,
  Status: "Active",
  DateAdded: new Date().toISOString().split('T')[0],
  LastEmailSent: "",
  EmailHistory: "[]",
  OptOut: false,
  Source: `Scheduled Test ${new Date().toISOString()}`
};"""
                },
                "name": "Generate Test Data",
                "type": "n8n-nodes-base.code",
                "typeVersion": 1,
                "position": [220, 0]
            },
            {
                "parameters": {
                    "resource": "spreadsheet",
                    "operation": "append",
                    "documentId": {"value": "1EDTTmhBGiZdhKuLwCQLDduRuIE2oQmXfeJvoiowU4bs"},
                    "sheetName": "Welcome",
                    "columns": {"mappingMode": "autoMapInputData"},
                    "options": {}
                },
                "name": "Google Sheets",
                "type": "n8n-nodes-base.googleSheets",
                "typeVersion": 2,
                "position": [440, 0],
                "credentials": {
                    "googleSheetsOAuth2Api": {
                        "id": "NzGLdLkWxHz8wqeq",
                        "name": "Google Sheets account"
                    }
                }
            }
        ],
        "connections": {
            "Schedule Trigger": {
                "main": [
                    [
                        {
                            "node": "Generate Test Data",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            },
            "Generate Test Data": {
                "main": [
                    [
                        {
                            "node": "Google Sheets",
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
        print(f"The workflow will run every 10 seconds and add test data to the Google Sheet.")
        print(f"Check the Google Sheet in about 10-20 seconds to see if the test data was added.")
        
        return workflow_id
    except Exception as e:
        print(f"Error creating workflow: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return None

if __name__ == "__main__":
    workflow_id = create_scheduled_test_workflow()
    
    if workflow_id:
        print("\nWaiting for the workflow to run...")
        time.sleep(30)  # Wait for 30 seconds to allow multiple executions
        
        # Deactivate the workflow
        try:
            deactivate_response = requests.post(
                f"{HOST_URL}/workflows/{workflow_id}/deactivate",
                headers=headers
            )
            deactivate_response.raise_for_status()
            
            print(f"Deactivated workflow with ID: {workflow_id}")
            print("Check the Google Sheet to see if the test data was added.")
        except Exception as e:
            print(f"Error deactivating workflow: {str(e)}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response: {e.response.text}")
