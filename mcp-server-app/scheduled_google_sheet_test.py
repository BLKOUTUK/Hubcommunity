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
    """Create a workflow that directly adds data to the Google Sheet using a schedule trigger."""
    
    # Define the workflow
    workflow = {
        "name": "Scheduled Google Sheet Test",
        "nodes": [
            {
                "parameters": {
                    "rule": {
                        "interval": [
                            {
                                "field": "seconds",
                                "secondsInterval": 30
                            }
                        ]
                    }
                },
                "name": "Schedule Trigger",
                "type": "n8n-nodes-base.scheduleTrigger",
                "typeVersion": 1,
                "position": [-600, 300]
            },
            {
                "parameters": {
                    "jsCode": """// Generate test data
return {
  Email: "scheduled.test@example.com",
  FirstName: "Scheduled",
  LastName: "Test",
  Role: "Test",
  Organisation: "Test Organisation",
  Status: "Active",
  DateAdded: new Date().toISOString().split('T')[0],
  LastEmailSent: "",
  EmailHistory: "[]",
  OptOut: false,
  Source: "Scheduled Test"
};"""
                },
                "name": "Generate Test Data",
                "type": "n8n-nodes-base.code",
                "typeVersion": 1,
                "position": [-400, 300]
            },
            {
                "parameters": {
                    "resource": "spreadsheet",
                    "operation": "append",
                    "documentId": "1EDTTmhBGiZdhKuLwCQLDduRuIE2oQmXfeJvoiowU4bs",
                    "sheetName": "Welcome",
                    "columns": "A:K",
                    "options": {
                        "valueInputMode": "RAW"
                    }
                },
                "name": "Google Sheets",
                "type": "n8n-nodes-base.googleSheets",
                "typeVersion": 4,
                "position": [-200, 300],
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
        print(f"The workflow will run every 30 seconds and add test data to the Google Sheet.")
        print(f"Check the Google Sheet in about 30 seconds to see if the test data was added.")
        
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
        time.sleep(35)
        
        # Check if the workflow ran
        try:
            executions_response = requests.get(
                f"{HOST_URL}/executions?workflowId={workflow_id}",
                headers=headers
            )
            executions_response.raise_for_status()
            executions = executions_response.json()
            
            if executions["data"]:
                print(f"Workflow ran successfully! Check the Google Sheet to see if the test data was added.")
                
                # Deactivate the workflow
                deactivate_response = requests.post(
                    f"{HOST_URL}/workflows/{workflow_id}/deactivate",
                    headers=headers
                )
                deactivate_response.raise_for_status()
                
                print(f"Deactivated workflow with ID: {workflow_id}")
            else:
                print(f"Workflow did not run yet. Check the n8n dashboard to see if it ran.")
        except Exception as e:
            print(f"Error checking executions: {str(e)}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response: {e.response.text}")
