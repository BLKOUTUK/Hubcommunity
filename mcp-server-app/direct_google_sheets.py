import os
import time
import datetime
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import json

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

# The ID of your spreadsheet
SPREADSHEET_ID = '150l4oGoOBZgPi-G6YCQR7Tc2iieDQhxfXLvZYo7kE1s'
SHEET_NAME = 'Subscribers'
RANGE_NAME = f'{SHEET_NAME}!A:J'

def get_credentials():
    """Get valid user credentials from storage or create new ones."""
    creds = None
    # The file token.json stores the user's access and refresh tokens
    if os.path.exists('token.json'):
        try:
            creds = Credentials.from_authorized_user_info(json.load(open('token.json')), SCOPES)
        except Exception as e:
            print(f"Error loading credentials: {str(e)}")
    
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
            except Exception as e:
                print(f"Error refreshing credentials: {str(e)}")
                creds = None
        
        if not creds:
            try:
                flow = InstalledAppFlow.from_client_secrets_file(
                    'credentials.json', SCOPES)
                creds = flow.run_local_server(port=0)
                # Save the credentials for the next run
                with open('token.json', 'w') as token:
                    token.write(creds.to_json())
            except Exception as e:
                print(f"Error creating new credentials: {str(e)}")
                print("Please create a credentials.json file from the Google Cloud Console")
                print("1. Go to https://console.cloud.google.com/")
                print("2. Create a new project or select an existing one")
                print("3. Enable the Google Sheets API")
                print("4. Create OAuth 2.0 credentials")
                print("5. Download the credentials as credentials.json")
                print("6. Place the credentials.json file in the same directory as this script")
                return None
    
    return creds

def append_to_sheet():
    """Append data to the Google Sheet."""
    creds = get_credentials()
    if not creds:
        return
    
    try:
        service = build('sheets', 'v4', credentials=creds)
        
        # Create test data
        timestamp = int(time.time())
        values = [
            [
                f'direct.api.test.{timestamp}@example.com',  # Email
                f'Direct API Test {timestamp}',  # Name
                'Ally',  # Role
                'Test Organisation',  # Organisation
                'New',  # Status
                datetime.datetime.now().strftime('%Y-%m-%d'),  # DateAdded
                '',  # LastEmailSent
                '[]',  # EmailHistory
                'FALSE',  # OptOut
                'Direct API Test'  # Source
            ]
        ]
        
        body = {
            'values': values
        }
        
        # Append the data
        result = service.spreadsheets().values().append(
            spreadsheetId=SPREADSHEET_ID, 
            range=RANGE_NAME,
            valueInputOption='USER_ENTERED', 
            insertDataOption='INSERT_ROWS', 
            body=body
        ).execute()
        
        print(f"Data added to Google Sheet: {result.get('updates').get('updatedCells')} cells updated.")
        return True
    except Exception as e:
        print(f"Error appending to sheet: {str(e)}")
        return False

if __name__ == '__main__':
    print("Attempting to append data directly to Google Sheet...")
    success = append_to_sheet()
    
    if success:
        print("Direct API test successful!")
    else:
        print("Direct API test failed!")
    
    print("\nTest completed. Please check your Google Sheet to see if the data was added.")
