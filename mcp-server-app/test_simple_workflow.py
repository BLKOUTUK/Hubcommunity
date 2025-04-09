import requests
import json
import time

def test_workflow_execution():
    """Test executing a workflow via the n8n API."""
    # Configuration
    API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MzZjNTEyZC1lYmM3LTRiYzYtYWM5MS0zMzI3ZDgzY2UwMjMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQzNzg1NTY0LCJleHAiOjE3NTE1MTUyMDB9.ZWbR5bp1jtaB7yfxn-kg4ASNHgXuRIe5QKv5O9ccUJI"
    HOST_URL = "http://localhost:5678/api/v1"
    
    # First, get all workflows to find the one we want
    headers = {
        "X-N8N-API-KEY": API_KEY,
        "Content-Type": "application/json"
    }
    
    print("Getting all workflows...")
    try:
        response = requests.get(
            f"{HOST_URL}/workflows",
            headers=headers
        )
        response.raise_for_status()
        workflows = response.json()
        
        # Find the workflow with the name "BLKOUT NXT Simple Sheet Test"
        target_workflow = None
        if workflows and workflows.get("data"):
            for workflow in workflows["data"]:
                if workflow["name"] == "BLKOUT NXT Simple Sheet Test":
                    target_workflow = workflow
                    break
        
        if not target_workflow:
            print("Workflow 'BLKOUT NXT Simple Sheet Test' not found.")
            return
        
        workflow_id = target_workflow["id"]
        print(f"Found workflow with ID: {workflow_id}")
        
        # Execute the workflow
        print(f"Executing workflow...")
        execution_response = requests.post(
            f"{HOST_URL}/workflows/{workflow_id}/execute",
            headers=headers
        )
        execution_response.raise_for_status()
        execution = execution_response.json()
        
        print(f"Workflow execution started with ID: {execution.get('executionId', 'Unknown')}")
        
        # Wait for the execution to complete
        execution_id = execution.get("executionId")
        if execution_id:
            print("Waiting for execution to complete...")
            time.sleep(5)  # Wait 5 seconds
            
            # Check execution status
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
        print(f"Error: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")

if __name__ == "__main__":
    test_workflow_execution()
    print("\nTest completed. Please check your Google Sheet to see if the data was added.")
