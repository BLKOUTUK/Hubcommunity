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

def get_workflow_executions(workflow_id):
    """Get the executions of a workflow."""
    try:
        response = requests.get(
            f"{HOST_URL}/executions?workflowId={workflow_id}",
            headers=headers
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error getting workflow executions: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return None

def check_web_form_workflow():
    """Check the executions of the web form workflow."""
    # Web form workflow ID
    workflow_id = "vDLEbrSQF7LFwbOP"
    
    # Get the executions
    executions = get_workflow_executions(workflow_id)
    
    if executions and executions.get("data"):
        print(f"Found {len(executions['data'])} executions for the web form workflow.")
        
        # Get the latest execution
        latest_execution = executions["data"][0]
        print(f"Latest execution status: {latest_execution.get('status', 'Unknown')}")
        
        # Check if the execution was successful
        if latest_execution.get("status") == "success":
            print("The latest execution was successful!")
        else:
            print("The latest execution failed!")
            print(f"Error: {latest_execution.get('stoppedAt', 'Unknown error')}")
            
            # Get the execution details
            try:
                execution_response = requests.get(
                    f"{HOST_URL}/executions/{latest_execution['id']}",
                    headers=headers
                )
                execution_response.raise_for_status()
                execution = execution_response.json()
                
                # Check if there's an error in the execution
                if "data" in execution and "resultData" in execution["data"]:
                    result_data = execution["data"]["resultData"]
                    if "error" in result_data:
                        print(f"Error details: {result_data['error']['message']}")
                        print(f"Error stack: {result_data['error']['stack']}")
            except Exception as e:
                print(f"Error getting execution details: {str(e)}")
    else:
        print("No executions found for the web form workflow.")

def create_direct_test_workflow():
    """Create a direct test workflow that adds data to the Google Sheet."""
    
    # Define the workflow
    workflow = {
        "name": "Direct Sheet Test",
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
                                "value": f"direct.test.{int(time.time())}@example.com"
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
                                "value": time.strftime("%Y-%m-%d")
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
                                "value": f"Direct Test {time.strftime('%Y-%m-%d %H:%M:%S')}"
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
            if "data" in execution and "resultData" in execution["data"] and "error" in execution["data"]["resultData"]:
                print(f"Error: {execution['data']['resultData']['error']['message']}")
                print(f"Error stack: {execution['data']['resultData']['error']['stack']}")
        
        return workflow_id
    except Exception as e:
        print(f"Error creating or executing workflow: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return None

def main():
    """Main function."""
    print("=== Checking Web Form Workflow Executions ===")
    check_web_form_workflow()
    
    print("\n=== Creating and Executing Direct Test Workflow ===")
    create_direct_test_workflow()

if __name__ == "__main__":
    main()
