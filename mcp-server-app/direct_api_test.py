import requests
import json
import time
import datetime

def test_direct_append():
    """Test direct append to Google Sheet using n8n API."""
    # Configuration
    API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MzZjNTEyZC1lYmM3LTRiYzYtYWM5MS0zMzI3ZDgzY2UwMjMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQzNzg1NTY0LCJleHAiOjE3NTE1MTUyMDB9.ZWbR5bp1jtaB7yfxn-kg4ASNHgXuRIe5QKv5O9ccUJI"
    HOST_URL = "http://localhost:5678/api/v1"
    WORKFLOW_ID = "uNrvJxy0ee4IJPpN"  # Direct Sheet Append Test V2
    
    # Headers for API requests
    headers = {
        "X-N8N-API-KEY": API_KEY,
        "Content-Type": "application/json"
    }
    
    # Execute the workflow
    print("Executing Direct Sheet Append Test V2 workflow...")
    try:
        response = requests.post(
            f"{HOST_URL}/workflows/{WORKFLOW_ID}/execute",
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
        
    except Exception as e:
        print(f"Error executing workflow: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")

def test_manual_append():
    """Test manual append to Google Sheet using direct API."""
    print("\nTesting manual append to Google Sheet...")
    
    # Create test data
    timestamp = int(time.time())
    test_data = {
        "Email": f"manual.test.{timestamp}@example.com",
        "Name": f"Manual Test {timestamp}",
        "Role": "Ally",
        "Organisation": "Test Organisation",
        "Status": "New",
        "DateAdded": datetime.datetime.now().strftime("%Y-%m-%d"),
        "LastEmailSent": "",
        "EmailHistory": "[]",
        "OptOut": "FALSE",
        "Source": "Manual Python Test"
    }
    
    print(f"Test data: {json.dumps(test_data, indent=2)}")
    
    # Try to append to the sheet using the webhook
    webhook_url = "http://localhost:5678/webhook/blkout-nxt-signup-simple"
    
    try:
        response = requests.post(
            webhook_url,
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Response status code: {response.status_code}")
        print(f"Response body: {response.text}")
        
        if response.status_code == 200:
            print("Manual append test successful!")
        else:
            print("Manual append test failed!")
    except Exception as e:
        print(f"Error: {str(e)}")
        print("Manual append test failed!")

def check_workflow_executions():
    """Check the executions of the workflow."""
    # Configuration
    API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MzZjNTEyZC1lYmM3LTRiYzYtYWM5MS0zMzI3ZDgzY2UwMjMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQzNzg1NTY0LCJleHAiOjE3NTE1MTUyMDB9.ZWbR5bp1jtaB7yfxn-kg4ASNHgXuRIe5QKv5O9ccUJI"
    HOST_URL = "http://localhost:5678/api/v1"
    WORKFLOW_ID = "R9qeqgeNuOaVGgXg"  # BLKOUT NXT Web Form Integration (Simple)
    
    # Headers for API requests
    headers = {
        "X-N8N-API-KEY": API_KEY,
        "Content-Type": "application/json"
    }
    
    print("\nChecking workflow executions...")
    try:
        response = requests.get(
            f"{HOST_URL}/executions?workflowId={WORKFLOW_ID}",
            headers=headers
        )
        response.raise_for_status()
        executions = response.json()
        
        if executions and executions.get("data"):
            print(f"Found {len(executions['data'])} executions for workflow {WORKFLOW_ID}.")
            
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
            print(f"No executions found for workflow {WORKFLOW_ID}.")
    except Exception as e:
        print(f"Error checking workflow executions: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")

if __name__ == "__main__":
    # Check workflow executions
    check_workflow_executions()
    
    # Test direct append
    test_direct_append()
    
    # Test manual append
    test_manual_append()
    
    print("\nTests completed. Please check your Google Sheet to see if the data was added.")
