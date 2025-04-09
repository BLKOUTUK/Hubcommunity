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

def execute_workflow(workflow_id, data):
    """Execute a workflow directly through the n8n API."""
    try:
        response = requests.post(
            f"{HOST_URL}/workflows/{workflow_id}/execute",
            headers=headers,
            json={"data": data}
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error executing workflow: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return None

def test_workflow_execution():
    """Test the execution of the web form integration workflow."""
    # Workflow ID of the web form integration workflow
    workflow_id = "2URDTonAN3P9mAa1"  # Updated workflow ID

    # Test data for different member types
    test_cases = [
        {
            "name": "Ally Test",
            "email": "ally.test@example.com",
            "memberType": "Ally",
            "location": "London"
        },
        {
            "name": "BQM Test",
            "email": "bqm.test@example.com",
            "memberType": "Black Queer Man",
            "location": "Manchester"
        },
        {
            "name": "Organiser Test",
            "email": "organiser.test@example.com",
            "memberType": "QTIPOC Organiser",
            "location": "Birmingham"
        },
        {
            "name": "Organisation Test",
            "email": "org.test@example.com",
            "memberType": "Organisation",
            "organisation": "Test Organisation"
        }
    ]

    # Execute the workflow for each test case
    for i, test_case in enumerate(test_cases):
        print(f"\n=== Test Case {i+1}: {test_case['memberType']} ===")
        print(f"Executing workflow with data: {json.dumps(test_case, indent=2)}")

        result = execute_workflow(workflow_id, test_case)

        if result:
            print(f"Execution successful!")
            print(f"Result: {json.dumps(result, indent=2)}")
        else:
            print(f"Execution failed!")

        print("=" * 50)

if __name__ == "__main__":
    test_workflow_execution()
