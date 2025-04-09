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

def activate_workflow(workflow_id):
    """Activate a workflow."""
    try:
        response = requests.post(
            f"{HOST_URL}/workflows/{workflow_id}/activate",
            headers=headers
        )
        response.raise_for_status()
        print(f"Activated workflow with ID: {workflow_id}")
        return True
    except Exception as e:
        print(f"Error activating workflow: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return False

def execute_workflow(workflow_id):
    """Execute a workflow."""
    try:
        # Create test data
        test_data = {
            "Email": f"direct.execute.{int(time.time())}@example.com",
            "FirstName": "Direct",
            "LastName": "Execute",
            "Role": "Test",
            "Organisation": "Test Org",
            "Status": "Active",
            "DateAdded": time.strftime("%Y-%m-%d"),
            "LastEmailSent": "",
            "EmailHistory": "[]",
            "OptOut": False,
            "Source": f"Direct Execute {time.strftime('%Y-%m-%d %H:%M:%S')}"
        }
        
        # Execute the workflow
        response = requests.post(
            f"{HOST_URL}/workflows/{workflow_id}/execute",
            headers=headers,
            json={"data": test_data}
        )
        response.raise_for_status()
        execution_id = response.json()["executionId"]
        
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
        else:
            print(f"Execution failed with status: {execution['status']}")
            if "error" in execution:
                print(f"Error: {execution['error']['message']}")
        
        return execution
    except Exception as e:
        print(f"Error executing workflow: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return None

def main():
    """Main function."""
    # Workflow ID for "Direct Sheet Append Test V2"
    workflow_id = "uNrvJxy0ee4IJPpN"
    
    # Activate the workflow
    if activate_workflow(workflow_id):
        # Execute the workflow
        execute_workflow(workflow_id)
        
        print("\nCheck the Google Sheet to see if the test data was added.")
        print("Google Sheet URL: https://docs.google.com/spreadsheets/d/1EDTTmhBGiZdhKuLwCQLDduRuIE2oQmXfeJvoiowU4bs/edit")

if __name__ == "__main__":
    main()
