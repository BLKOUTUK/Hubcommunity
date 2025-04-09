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

def check_executions():
    """Check the executions of the web form integration workflow."""
    try:
        # Get the executions
        response = requests.get(
            f"{HOST_URL}/executions",
            headers=headers
        )
        response.raise_for_status()
        executions = response.json()
        
        print(f"Found {len(executions['data'])} executions")
        
        # Print the executions
        for execution in executions['data']:
            print(f"\nExecution ID: {execution['id']}")
            print(f"Workflow ID: {execution['workflowId']}")
            print(f"Workflow Name: {execution['workflowName']}")
            print(f"Status: {execution['status']}")
            print(f"Started At: {execution['startedAt']}")
            print(f"Finished At: {execution.get('stoppedAt', 'N/A')}")
            
            # Check if the execution is for the web form integration workflow
            if "Web Form Integration" in execution['workflowName']:
                print("\nThis is a web form integration execution!")
                
                # Get the execution data
                execution_data_response = requests.get(
                    f"{HOST_URL}/executions/{execution['id']}",
                    headers=headers
                )
                execution_data_response.raise_for_status()
                execution_data = execution_data_response.json()
                
                # Print the execution data
                print("\nExecution Data:")
                print(json.dumps(execution_data, indent=2))
        
        return executions
    except Exception as e:
        print(f"Error: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return None

if __name__ == "__main__":
    check_executions()
