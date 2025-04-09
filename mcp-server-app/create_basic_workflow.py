import requests
import json
import time

def create_workflow():
    """Create a simple workflow in n8n."""
    # Configuration
    API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MzZjNTEyZC1lYmM3LTRiYzYtYWM5MS0zMzI3ZDgzY2UwMjMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQzNzg1NTY0LCJleHAiOjE3NTE1MTUyMDB9.ZWbR5bp1jtaB7yfxn-kg4ASNHgXuRIe5QKv5O9ccUJI"
    HOST_URL = "http://localhost:5678/api/v1"
    
    # Headers for API requests
    headers = {
        "X-N8N-API-KEY": API_KEY,
        "Content-Type": "application/json"
    }
    
    # Define the workflow
    workflow = {
        "name": "BLKOUT NXT Basic Sheet Test",
        "nodes": [
            {
                "parameters": {},
                "name": "Manual",
                "type": "n8n-nodes-base.manualTrigger",
                "typeVersion": 1,
                "position": [0, 0]
            },
            {
                "parameters": {
                    "jsCode": "// Create a simple test object with minimal data\nreturn {\n  json: {\n    Email: `test.${Date.now()}@example.com`,\n    Name: `Test ${Date.now()}`,\n    Role: \"Test\",\n    Status: \"New\",\n    DateAdded: new Date().toISOString().split('T')[0]\n  }\n};"
                },
                "name": "Code",
                "type": "n8n-nodes-base.code",
                "typeVersion": 1,
                "position": [220, 0]
            },
            {
                "parameters": {
                    "resource": "spreadsheet",
                    "operation": "append",
                    "documentId": {
                        "value": "150l4oGoOBZgPi-G6YCQR7Tc2iieDQhxfXLvZYo7kE1s"
                    },
                    "sheetName": "Subscribers",
                    "columns": {
                        "mappingMode": "autoMapInputData"
                    },
                    "options": {
                        "valueInputMode": "USER_ENTERED"
                    }
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
            "Manual": {
                "main": [
                    [
                        {
                            "node": "Code",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            },
            "Code": {
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
        created_workflow = response.json()
        
        print(f"Workflow created with ID: {created_workflow.get('id', 'Unknown')}")
        return created_workflow.get("id")
    except Exception as e:
        print(f"Error creating workflow: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return None

def execute_workflow(workflow_id):
    """Execute a workflow in n8n."""
    if not workflow_id:
        print("No workflow ID provided.")
        return
    
    # Configuration
    API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MzZjNTEyZC1lYmM3LTRiYzYtYWM5MS0zMzI3ZDgzY2UwMjMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQzNzg1NTY0LCJleHAiOjE3NTE1MTUyMDB9.ZWbR5bp1jtaB7yfxn-kg4ASNHgXuRIe5QKv5O9ccUJI"
    HOST_URL = "http://localhost:5678/api/v1"
    
    # Headers for API requests
    headers = {
        "X-N8N-API-KEY": API_KEY,
        "Content-Type": "application/json"
    }
    
    # Execute the workflow
    try:
        response = requests.post(
            f"{HOST_URL}/workflows/{workflow_id}/execute",
            headers=headers
        )
        response.raise_for_status()
        execution = response.json()
        
        print(f"Workflow execution started with ID: {execution.get('executionId', 'Unknown')}")
        
        # Wait for the execution to complete
        execution_id = execution.get("executionId")
        if execution_id:
            print("Waiting for execution to complete...")
            time.sleep(5)  # Wait 5 seconds
            
            # Check execution status
            try:
                status_response = requests.get(
                    f"{HOST_URL}/executions/{execution_id}",
                    headers=headers
                )
                status_response.raise_for_status()
                status = status_response.json()
                
                print(f"Execution status: {status.get('status', 'Unknown')}")
                
                if status.get("status") == "success":
                    print("Execution completed successfully!")
                else:
                    print("Execution failed!")
                    if "data" in status and "resultData" in status["data"]:
                        result_data = status["data"]["resultData"]
                        if "error" in result_data:
                            print(f"Error: {result_data['error']['message']}")
            except Exception as e:
                print(f"Error checking execution status: {str(e)}")
                if hasattr(e, 'response') and e.response is not None:
                    print(f"Response: {e.response.text}")
    except Exception as e:
        print(f"Error executing workflow: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")

if __name__ == "__main__":
    # Create the workflow
    workflow_id = create_workflow()
    
    # Execute the workflow
    if workflow_id:
        execute_workflow(workflow_id)
        
        print("\nTest completed. Please check your Google Sheet to see if the data was added.")
