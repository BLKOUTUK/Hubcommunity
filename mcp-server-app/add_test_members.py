import os
import time
import json
import requests
from datetime import datetime
from dotenv import load_dotenv
from pathlib import Path

print("Adding Test Members to BLKOUT NXT System...")

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent / "mcp-server" / "config" / ".env"
print(f"Looking for .env file at: {env_path}")
print(f"File exists: {env_path.exists()}")
load_dotenv(dotenv_path=env_path)

# Google Sheets API configuration
GOOGLE_SHEETS_API_URL = "https://sheets.googleapis.com/v4/spreadsheets"
SHEET_ID = "1EDTTmhBGiZdhKuLwCQLDduRuIE2oQmXfeJvoiowU4bs"
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# n8n API configuration
N8N_HOST_URL = os.getenv("N8N_HOST_URL")
N8N_API_KEY = os.getenv("N8N_API_KEY")

# Test data for different segments
timestamp = int(time.time())
test_data = [
    {
        "Email": f"test_ally_{timestamp}@example.com",
        "FirstName": "Test",
        "LastName": "Ally",
        "Role": "Ally",
        "Organisation": "Test Org",
        "JoinDate": datetime.now().strftime("%Y-%m-%d"),
        "OnboardingStatus": "New",
        "LastEmailSent": "",
        "EmailHistory": "",
        "Notes": "Test member for onboarding flow"
    },
    {
        "Email": f"test_bqm_{timestamp}@example.com",
        "FirstName": "Test",
        "LastName": "BQM",
        "Role": "Black Queer Man",
        "Organisation": "Test Org",
        "JoinDate": datetime.now().strftime("%Y-%m-%d"),
        "OnboardingStatus": "New",
        "LastEmailSent": "",
        "EmailHistory": "",
        "Notes": "Test member for onboarding flow"
    },
    {
        "Email": f"test_organiser_{timestamp}@example.com",
        "FirstName": "Test",
        "LastName": "Organiser",
        "Role": "QTIPOC Organiser",
        "Organisation": "Test Org",
        "JoinDate": datetime.now().strftime("%Y-%m-%d"),
        "OnboardingStatus": "New",
        "LastEmailSent": "",
        "EmailHistory": "",
        "Notes": "Test member for onboarding flow"
    },
    {
        "Email": f"test_org_{timestamp}@example.com",
        "FirstName": "Test",
        "LastName": "Organisation",
        "Role": "Organisation",
        "Organisation": "Test Organisation",
        "JoinDate": datetime.now().strftime("%Y-%m-%d"),
        "OnboardingStatus": "New",
        "LastEmailSent": "",
        "EmailHistory": "",
        "Notes": "Test member for onboarding flow"
    }
]

# Function to add test members directly to Google Sheet
def add_test_members_to_sheet():
    print("\nAdding test members directly to Google Sheet...")

    # Use the Google Sheets API directly
    try:
        # First, get the current values to determine the next row
        url = f"{N8N_HOST_URL}/workflows/execute"

        # Headers
        headers = {
            "X-N8N-API-KEY": N8N_API_KEY,
            "Content-Type": "application/json"
        }

        # Data for the workflow
        data = {
            "workflowData": {
                "name": "Add Test Members",
                "nodes": [
                    {
                        "parameters": {
                            "resource": "spreadsheet",
                            "operation": "append",
                            "documentId": SHEET_ID,
                            "sheetName": "Community Members",
                            "columns": "A:J",
                            "options": {
                                "valueInputOption": "USER_ENTERED"
                            }
                        },
                        "name": "Add Members",
                        "type": "n8n-nodes-base.googleSheets",
                        "typeVersion": 4,
                        "position": [0, 0],
                        "credentials": {
                            "googleSheetsOAuth2Api": {
                                "id": "1",
                                "name": "Google Sheets account"
                            }
                        }
                    }
                ],
                "connections": {},
                "staticData": {
                    "node:Add Members": {
                        "parametersValues": {
                            "values": test_data
                        }
                    }
                }
            }
        }

        # Send the request
        response = requests.post(url, headers=headers, json=data)

        if response.status_code == 200:
            print("Test members added successfully!")
            for member in test_data:
                print(f"- {member['Email']} ({member['Role']})")
            return True
        else:
            print(f"Error adding test members: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

# Function to test workflow
def test_workflow(workflow_id, workflow_name):
    print(f"\nTesting {workflow_name} workflow (ID: {workflow_id})...")

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

        if response.status_code == 200:
            print(f"{workflow_name} workflow tested successfully!")
            return True
        else:
            print(f"Error testing {workflow_name} workflow: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

# Main function
def main():
    print("\n=== Starting Test Member Addition ===")

    # Step 1: Add test members to Google Sheet
    success = add_test_members_to_sheet()

    if not success:
        print("Failed to add test members. Exiting.")
        return

    print("\n=== Test Members Added Successfully ===")
    print("You can now manually test the workflows in n8n to verify the onboarding flow:")
    print("1. BLKOUT NXT Onboarding - Sends welcome emails")
    print("2. BLKOUT NXT Survey Follow-up (Updated) - Sends survey emails 6 hours after welcome")
    print("3. BLKOUT NXT Survey Follow-up (Updated) - Sends survey reminders 3 days after survey")
    print("4. BLKOUT NXT [Segment] Drip Campaign - Enrolls members in drip campaigns after survey completion")

    print("\nTo simulate time passing, manually update the LastEmailSent dates in the Google Sheet.")
    print("For example, to test survey emails, set OnboardingStatus to 'Welcome Sent' and LastEmailSent to 7+ hours ago.")

    print("\n=== Test Setup Complete ===")

# Run the main function
if __name__ == "__main__":
    main()
