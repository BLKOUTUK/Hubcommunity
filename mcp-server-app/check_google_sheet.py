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

def execute_google_sheet_read():
    """Execute a workflow to read the Google Sheet."""
    # Create a temporary workflow to read the Google Sheet
    workflow = {
        "name": "Temporary Google Sheet Read",
        "nodes": [
            {
                "parameters": {
                    "rule": {
                        "interval": [
                            {
                                "field": "seconds",
                                "secondsInterval": 1
                            }
                        ]
                    }
                },
                "name": "Schedule Trigger",
                "type": "n8n-nodes-base.scheduleTrigger",
                "typeVersion": 1,
                "position": [0, 0]
            },
            {
                "parameters": {
                    "resource": "spreadsheet",
                    "operation": "read",
                    "documentId": "1EDTTmhBGiZdhKuLwCQLDduRuIE2oQmXfeJvoiowU4bs",
                    "sheetName": "Welcome",
                    "range": "A:K",
                    "options": {
                        "valueRenderMode": "FORMATTED_VALUE"
                    }
                },
                "name": "Google Sheets",
                "type": "n8n-nodes-base.googleSheets",
                "typeVersion": 4,
                "position": [200, 0],
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
    
    try:
        # Create the workflow
        response = requests.post(
            f"{HOST_URL}/workflows",
            headers=headers,
            json=workflow
        )
        response.raise_for_status()
        workflow_id = response.json()["id"]
        
        print(f"Created temporary workflow with ID: {workflow_id}")
        
        # Execute the workflow
        execute_response = requests.post(
            f"{HOST_URL}/workflows/{workflow_id}/execute",
            headers=headers
        )
        execute_response.raise_for_status()
        execution_id = execute_response.json()["executionId"]
        
        print(f"Executed workflow with execution ID: {execution_id}")
        
        # Wait for the execution to complete
        import time
        time.sleep(5)
        
        # Get the execution data
        execution_data_response = requests.get(
            f"{HOST_URL}/executions/{execution_id}",
            headers=headers
        )
        execution_data_response.raise_for_status()
        execution_data = execution_data_response.json()
        
        # Extract the Google Sheet data
        google_sheet_data = execution_data["data"]["resultData"]["runData"]["Google Sheets"][0]["data"]["main"][0]
        
        # Print the Google Sheet data
        print("\nGoogle Sheet Data:")
        print(json.dumps(google_sheet_data, indent=2))
        
        # Check if the test data was added
        test_emails = ["ally.test@example.com", "bqm.test@example.com", "organiser.test@example.com", "org.test@example.com"]
        found_emails = []
        
        for item in google_sheet_data:
            if item.get("Email") in test_emails:
                found_emails.append(item.get("Email"))
                print(f"\nFound test data for {item.get('Email')}:")
                print(json.dumps(item, indent=2))
        
        # Print summary
        print("\nSummary:")
        print(f"Found {len(found_emails)} out of {len(test_emails)} test emails")
        
        if len(found_emails) < len(test_emails):
            missing_emails = [email for email in test_emails if email not in found_emails]
            print(f"Missing emails: {missing_emails}")
        
        # Delete the temporary workflow
        delete_response = requests.delete(
            f"{HOST_URL}/workflows/{workflow_id}",
            headers=headers
        )
        delete_response.raise_for_status()
        
        print(f"\nDeleted temporary workflow with ID: {workflow_id}")
        
        return google_sheet_data
    except Exception as e:
        print(f"Error: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return None

if __name__ == "__main__":
    execute_google_sheet_read()
