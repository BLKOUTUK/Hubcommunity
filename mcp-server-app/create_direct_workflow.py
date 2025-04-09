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

def create_direct_workflow():
    """Create a direct workflow using the n8n API."""
    
    # Define the workflow
    workflow = {
        "name": "Direct Google Sheet Test",
        "nodes": [
            {
                "parameters": {},
                "name": "Start",
                "type": "n8n-nodes-base.manualTrigger",
                "typeVersion": 1,
                "position": [240, 300]
            },
            {
                "parameters": {
                    "values": {
                        "string": [
                            {
                                "name": "Email",
                                "value": "direct.test@example.com"
                            },
                            {
                                "name": "FirstName",
                                "value": "Direct"
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
                                "value": "Direct Test"
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
            "Start": {
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
        
        # Execute the workflow
        execute_response = requests.post(
            f"{HOST_URL}/workflows/{workflow_id}/execute",
            headers=headers
        )
        execute_response.raise_for_status()
        execution_id = execute_response.json()["executionId"]
        
        print(f"Executed workflow with ID: {workflow_id}")
        print(f"Execution ID: {execution_id}")
        
        # Wait for the execution to complete
        time.sleep(5)
        
        # Check the execution status
        execution_response = requests.get(
            f"{HOST_URL}/executions/{execution_id}",
            headers=headers
        )
        execution_response.raise_for_status()
        execution = execution_response.json()
        
        if execution["status"] == "success":
            print("Execution completed successfully!")
            print("Check the Google Sheet to see if the test data was added.")
            print("Google Sheet URL: https://docs.google.com/spreadsheets/d/1EDTTmhBGiZdhKuLwCQLDduRuIE2oQmXfeJvoiowU4bs/edit")
        else:
            print(f"Execution failed with status: {execution['status']}")
            if "error" in execution:
                print(f"Error: {execution['error']['message']}")
        
        return workflow_id
    except Exception as e:
        print(f"Error creating or executing workflow: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return None

if __name__ == "__main__":
    workflow_id = create_direct_workflow()
