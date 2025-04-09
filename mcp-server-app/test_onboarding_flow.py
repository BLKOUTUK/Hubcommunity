import requests
import json
import os
import time
from datetime import datetime, timedelta
from dotenv import load_dotenv
from pathlib import Path

print("Testing BLKOUT NXT Onboarding Flow...")

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent / "mcp-server" / "config" / ".env"
print(f"Looking for .env file at: {env_path}")
print(f"File exists: {env_path.exists()}")
load_dotenv(dotenv_path=env_path)

# n8n API configuration
N8N_HOST_URL = os.getenv("N8N_HOST_URL")
N8N_API_KEY = os.getenv("N8N_API_KEY")

print(f"N8N_HOST_URL: {N8N_HOST_URL}")
print(f"N8N_API_KEY: {N8N_API_KEY[:10]}..." if N8N_API_KEY else "N8N_API_KEY: None")

# Google Sheets configuration
SHEET_ID = "1EDTTmhBGiZdhKuLwCQLDduRuIE2oQmXfeJvoiowU4bs"

# Test data for different segments
test_data = [
    {
        "email": f"test_ally_{int(time.time())}@example.com",
        "firstName": "Test",
        "lastName": "Ally",
        "memberType": "Ally",
        "organisation": "Test Org"
    },
    {
        "email": f"test_bqm_{int(time.time())}@example.com",
        "firstName": "Test",
        "lastName": "BQM",
        "memberType": "Black Queer Man",
        "organisation": "Test Org"
    },
    {
        "email": f"test_organiser_{int(time.time())}@example.com",
        "firstName": "Test",
        "lastName": "Organiser",
        "memberType": "QTIPOC Organiser",
        "organisation": "Test Org"
    },
    {
        "email": f"test_org_{int(time.time())}@example.com",
        "firstName": "Test",
        "lastName": "Organisation",
        "memberType": "Organisation",
        "organisation": "Test Organisation"
    }
]

# Function to add test member via web form webhook
def add_test_member(member_data):
    print(f"\nAdding test member: {member_data['email']} ({member_data['memberType']})")

    # Web form webhook URL
    url = f"{N8N_HOST_URL.replace('/api/v1', '')}/webhook/blkout-nxt-signup"

    # Headers
    headers = {
        "Content-Type": "application/json"
    }

    try:
        # Send the request
        response = requests.post(url, headers=headers, json=member_data)

        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text}")

        return response.status_code in [200, 201]
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

# Function to manually update member status to simulate time passing
def update_member_status(email, status, last_email_date=None):
    print(f"\nUpdating member status: {email} to {status}")

    # n8n workflow execution URL
    url = f"{N8N_HOST_URL}/workflows/execute"

    # Headers
    headers = {
        "X-N8N-API-KEY": N8N_API_KEY,
        "Content-Type": "application/json"
    }

    # If no date provided, use current date
    if not last_email_date:
        last_email_date = datetime.now().strftime("%Y-%m-%d")

    # Data for the workflow
    data = {
        "workflowData": {
            "name": "Update Member Status",
            "nodes": [
                {
                    "parameters": {
                        "resource": "spreadsheet",
                        "operation": "readRows",
                        "documentId": SHEET_ID,
                        "sheetName": "Community Members",
                        "range": "A:J",
                        "options": {
                            "valueRenderMode": "FORMATTED_VALUE",
                            "valueInputOption": "USER_ENTERED"
                        }
                    },
                    "name": "Get Members",
                    "type": "n8n-nodes-base.googleSheets",
                    "typeVersion": 4,
                    "position": [0, 0],
                    "credentials": {
                        "googleSheetsOAuth2Api": {
                            "id": "1",
                            "name": "Google Sheets account"
                        }
                    }
                },
                {
                    "parameters": {
                        "functionCode": f"// Find member by email\nconst members = $input.all()[0].json;\nconst email = '{email}';\n\nconst member = members.find(m => m.Email === email);\n\nif (!member) {{\n  console.log(`Member not found: ${{email}}`);\n  return [];\n}}\n\nreturn [{{ json: {{ ...member, Email: email, OnboardingStatus: '{status}', LastEmailSent: '{last_email_date}' }} }}];"
                    },
                    "name": "Find Member",
                    "type": "n8n-nodes-base.function",
                    "typeVersion": 1,
                    "position": [200, 0]
                },
                {
                    "parameters": {
                        "resource": "spreadsheet",
                        "operation": "updateRow",
                        "documentId": SHEET_ID,
                        "sheetName": "Community Members",
                        "range": "A:J",
                        "keyRow": "Email",
                        "keyValue": "={{ $json.Email }}",
                        "options": {
                            "valueInputOption": "USER_ENTERED"
                        },
                        "dataMode": "define",
                        "fieldsUi": {
                            "values": [
                                {
                                    "column": "OnboardingStatus",
                                    "value": "={{ $json.OnboardingStatus }}"
                                },
                                {
                                    "column": "LastEmailSent",
                                    "value": "={{ $json.LastEmailSent }}"
                                }
                            ]
                        }
                    },
                    "name": "Update Member",
                    "type": "n8n-nodes-base.googleSheets",
                    "typeVersion": 4,
                    "position": [400, 0],
                    "credentials": {
                        "googleSheetsOAuth2Api": {
                            "id": "1",
                            "name": "Google Sheets account"
                        }
                    }
                }
            ],
            "connections": {
                "Get Members": {
                    "main": [
                        [
                            {
                                "node": "Find Member",
                                "type": "main",
                                "index": 0
                            }
                        ]
                    ]
                },
                "Find Member": {
                    "main": [
                        [
                            {
                                "node": "Update Member",
                                "type": "main",
                                "index": 0
                            }
                        ]
                    ]
                }
            }
        }
    }

    try:
        # Send the request
        response = requests.post(url, headers=headers, json=data)

        print(f"Status code: {response.status_code}")
        if response.status_code == 200:
            print("Status updated successfully")
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

# Function to test workflow
def test_workflow(workflow_id):
    print(f"\nTesting workflow: {workflow_id}")

    # n8n workflow test URL
    url = f"{N8N_HOST_URL}/workflows/{workflow_id}/execute"

    # Headers
    headers = {
        "X-N8N-API-KEY": N8N_API_KEY,
        "Content-Type": "application/json"
    }

    try:
        # Send the request
        response = requests.post(url, headers=headers)

        print(f"Status code: {response.status_code}")
        if response.status_code == 200:
            print("Workflow tested successfully")
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

# Main test flow
def run_test():
    print("\n=== Starting Onboarding Flow Test ===")

    # Step 1: Add test members via web form
    for member in test_data:
        success = add_test_member(member)
        if not success:
            print(f"Failed to add test member: {member['email']}")

    print("\n=== Step 1: Added test members via web form ===")

    # Step 2: Test welcome email workflow
    welcome_workflow_id = "9U7WKBX89mZCeyy3"  # BLKOUT NXT Onboarding
    test_workflow(welcome_workflow_id)

    print("\n=== Step 2: Tested welcome email workflow ===")
    print("Waiting for welcome emails to be sent...")
    time.sleep(5)  # Give some time for the workflow to run

    # Step 3: Simulate time passing (6+ hours since welcome email)
    print("\n=== Step 3: Simulating time passing (6+ hours since welcome email) ===")

    # Calculate a date 7 hours ago
    seven_hours_ago = (datetime.now() - timedelta(hours=7)).strftime("%Y-%m-%d")

    for member in test_data:
        update_member_status(member['email'], "Welcome Sent", seven_hours_ago)

    # Step 4: Test survey email workflow
    survey_workflow_id = "pk1rXgst1KaWsSYa"  # BLKOUT NXT Survey Follow-up (Updated)
    test_workflow(survey_workflow_id)

    print("\n=== Step 4: Tested survey email workflow ===")
    print("Waiting for survey emails to be sent...")
    time.sleep(5)  # Give some time for the workflow to run

    # Step 5: Simulate time passing (3+ days since survey email)
    print("\n=== Step 5: Simulating time passing (3+ days since survey email) ===")

    # Calculate a date 4 days ago
    four_days_ago = (datetime.now() - timedelta(days=4)).strftime("%Y-%m-%d")

    for member in test_data:
        update_member_status(member['email'], "Survey Sent", four_days_ago)

    # Step 6: Test survey reminder workflow
    test_workflow(survey_workflow_id)

    print("\n=== Step 6: Tested survey reminder workflow ===")
    print("Waiting for survey reminders to be sent...")
    time.sleep(5)  # Give some time for the workflow to run

    # Step 7: Simulate survey completion
    print("\n=== Step 7: Simulating survey completion ===")

    for member in test_data:
        update_member_status(member['email'], "Survey Completed")

    # Step 8: Test drip campaign workflows
    print("\n=== Step 8: Testing drip campaign workflows ===")

    drip_workflow_ids = {
        "Ally": "W11CYyvc0tvEnp6b",  # BLKOUT NXT Ally Drip Campaign
        "Black Queer Man": "h0DO1MrAx0HJQuhe",  # BLKOUT NXT Black Queer Men Drip Campaign
        "QTIPOC Organiser": "GnKiyiQqaqdB6mP2",  # BLKOUT NXT QTIPOC Organiser Drip Campaign
        "Organisation": "AcsMaOlCZEOdyBAh"  # BLKOUT NXT Organisation Drip Campaign
    }

    for workflow_type, workflow_id in drip_workflow_ids.items():
        print(f"\nTesting {workflow_type} drip campaign workflow")
        test_workflow(workflow_id)
        time.sleep(2)  # Give some time between workflow tests

    print("\n=== Test Complete ===")
    print("The onboarding flow has been tested from signup through welcome emails,")
    print("survey emails, survey reminders, and enrollment in drip campaigns.")
    print("Check the Google Sheet and n8n execution logs for details.")

# Run the test
run_test()
