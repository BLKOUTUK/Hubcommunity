import os
import pickle
import json
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

# The ID of the spreadsheet
SPREADSHEET_ID = '1EDTTmhBGiZdhKuLwCQLDduRuIE2oQmXfeJvoiowU4bs'

# The range of the spreadsheet
RANGE_NAME = 'Welcome!A:K'

def check_google_sheet_direct():
    """Check the Google Sheet directly through the Google Sheets API."""
    creds = None
    # The file token.pickle stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    service = build('sheets', 'v4', credentials=creds)

    # Call the Sheets API
    sheet = service.spreadsheets()
    result = sheet.values().get(spreadsheetId=SPREADSHEET_ID,
                                range=RANGE_NAME).execute()
    values = result.get('values', [])

    if not values:
        print('No data found.')
        return

    # Print the header
    header = values[0]
    print(f"Header: {header}")

    # Print the data
    print(f"Found {len(values) - 1} rows of data")

    # Check if the test data was added
    test_emails = ["ally.test@example.com", "bqm.test@example.com", "organiser.test@example.com", "org.test@example.com"]
    found_emails = []

    # Find the email column index
    email_index = header.index('Email') if 'Email' in header else None

    if email_index is not None:
        for row in values[1:]:  # Skip the header
            if len(row) > email_index and row[email_index] in test_emails:
                found_emails.append(row[email_index])
                print(f"\nFound test data for {row[email_index]}:")
                row_data = {}
                for i, col in enumerate(row):
                    if i < len(header):
                        row_data[header[i]] = col
                print(json.dumps(row_data, indent=2))

    # Print summary
    print("\nSummary:")
    print(f"Found {len(found_emails)} out of {len(test_emails)} test emails")

    if len(found_emails) < len(test_emails):
        missing_emails = [email for email in test_emails if email not in found_emails]
        print(f"Missing emails: {missing_emails}")

if __name__ == '__main__':
    check_google_sheet_direct()
