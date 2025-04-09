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

def create_scheduled_workflow():
    """Create a scheduled workflow using the n8n API."""
    
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
                                "secondsInterval": 10
                            }
                        ]
                    }
                },
                "name": "Schedule Trigger",
                "type": "n8n-nodes-base.scheduleTrigger",
                "typeVersion": 1,
                "position": [240, 300]
            },
            {
                "parameters": {
                    "values": {
                        "string": [
                            {
                                "name": "Email",
                                "value": "scheduled.test@example.com"
                            },
                            {
                                "name": "FirstName",
                                "value": "Scheduled"
                            },
                            {
                                "name": "LastName",
                                "value": "Test"
                            },
                            {
                                "name": "Role",
                                "value": "Test"
                            },
                            {
                                "name": "Organisation",
                                "value": "Test Org"
                            },
                            {
                                "name": "Status",
                                "value": "Active"
                            },
                            {
                                "name": "DateAdded",
                                "value": "={{ $now.format(\"YYYY-MM-DD\") }}"
                            },
                            {
                                "name": "LastEmailSent",
                                "value": ""
                            },
                            {
                                "name": "EmailHistory",
                                "value": "[]"
                            },
                            {
                                "name": "OptOut",
                                "value": "false"
                            },
                            {
                                "name": "Source",
                                "value": "Scheduled Test"
                            }
                        ]
                    },
                    "options": {}
                },
                "name": "Set Test Data",
                "type": "n8n-nodes-base.set",
                "typeVersion": 2,
                "position": [460, 300]
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
                "position": [680, 300],
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
                            "node": "Set Test Data",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            },
            "Set Test Data": {
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
        print(f"Error creating or activating workflow: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return None

if __name__ == "__main__":
    workflow_id = create_scheduled_workflow()
    
    if workflow_id:
        print("\nWaiting for the workflow to run...")
        time.sleep(15)
        
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
                print(f"Google Sheet URL: https://docs.google.com/spreadsheets/d/1EDTTmhBGiZdhKuLwCQLDduRuIE2oQmXfeJvoiowU4bs/edit")
                
                # Get the latest execution
                latest_execution = executions["data"][0]
                print(f"Latest execution status: {latest_execution['status']}")
                
                if latest_execution["status"] == "error":
                    print(f"Error: {latest_execution.get('stoppedAt', 'Unknown error')}")
            else:
                print(f"Workflow did not run yet. Check the n8n dashboard to see if it ran.")
        except Exception as e:
            print(f"Error checking executions: {str(e)}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response: {e.response.text}")
        
        print("\nWaiting for another scheduled execution...")
        time.sleep(15)
        
        # Deactivate the workflow
        try:
            deactivate_response = requests.post(
                f"{HOST_URL}/workflows/{workflow_id}/deactivate",
                headers=headers
            )
            deactivate_response.raise_for_status()
            
            print(f"Deactivated workflow with ID: {workflow_id}")
        except Exception as e:
            print(f"Error deactivating workflow: {str(e)}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response: {e.response.text}")
