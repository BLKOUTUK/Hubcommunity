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

def create_direct_test_workflow():
    """Create a workflow that directly adds data to the Google Sheet."""

    # Define the workflow
    workflow = {
        "name": "Direct Google Sheet Test",
        "nodes": [
            {
                "parameters": {
                    "httpMethod": "POST",
                    "path": "direct-google-sheet-test",
                    "options": {
                        "responseMode": "responseNode"
                    },
                    "authentication": "none"
                },
                "name": "Webhook",
                "type": "n8n-nodes-base.webhook",
                "typeVersion": 1,
                "position": [-600, 300]
            },
            {
                "parameters": {
                    "resource": "spreadsheet",
                    "operation": "append",
                    "documentId": "1EDTTmhBGiZdhKuLwCQLDduRuIE2oQmXfeJvoiowU4bs",
                    "sheetName": "Welcome",
                    "columns": "A:K",
                    "options": {
                        "valueInputMode": "RAW"
                    }
                },
                "name": "Google Sheets",
                "type": "n8n-nodes-base.googleSheets",
                "typeVersion": 4,
                "position": [-400, 300],
                "credentials": {
                    "googleSheetsOAuth2Api": {
                        "id": "NzGLdLkWxHz8wqeq",
                        "name": "Google Sheets account"
                    }
                }
            },
            {
                "parameters": {
                    "respondWith": "json",
                    "responseBody": "={{ {success: true, message: \"Data added to Google Sheet\"} }}",
                    "options": {}
                },
                "name": "Success Response",
                "type": "n8n-nodes-base.respondToWebhook",
                "typeVersion": 1,
                "position": [-200, 300]
            }
        ],
        "connections": {
            "Webhook": {
                "main": [
                    [
                        {
                            "node": "Google Sheets",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            },
            "Google Sheets": {
                "main": [
                    [
                        {
                            "node": "Success Response",
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

        # Return the webhook URL
        webhook_url = f"http://localhost:5678/webhook-test/direct-google-sheet-test"
        print(f"Webhook URL: {webhook_url}")

        return webhook_url
    except Exception as e:
        print(f"Error creating workflow: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return None

def test_direct_google_sheet(webhook_url):
    """Test the direct Google Sheet workflow."""

    # Test data
    test_data = {
        "Email": "direct.test@example.com",
        "FirstName": "Direct",
        "LastName": "Test",
        "Role": "Test",
        "Organisation": "Test Organisation",
        "Status": "Active",
        "DateAdded": time.strftime("%Y-%m-%d"),
        "LastEmailSent": "",
        "EmailHistory": "[]",
        "OptOut": False,
        "Source": "Direct Test"
    }

    # Headers
    headers = {
        "Content-Type": "application/json"
    }

    print(f"Sending data to webhook: {json.dumps(test_data, indent=2)}")

    try:
        response = requests.post(webhook_url, json=test_data, headers=headers)
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text}")

        if response.status_code == 200:
            print("Test successful!")
        else:
            print("Test failed!")
    except Exception as e:
        print(f"Error sending request: {str(e)}")
        print("Test failed!")

if __name__ == "__main__":
    webhook_url = create_direct_test_workflow()

    if webhook_url:
        print("\nTesting the workflow...")
        test_direct_google_sheet(webhook_url)
