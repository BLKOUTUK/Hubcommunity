# Google Sheets Direct API Setup Guide

This guide will help you set up direct access to Google Sheets using the Google Sheets API.

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click on "New Project"
4. Enter a name for your project (e.g., "BLKOUT NXT Direct API")
5. Click "Create"

## Step 2: Enable the Google Sheets API

1. In the Google Cloud Console, select your new project
2. Go to "APIs & Services" > "Library"
3. Search for "Google Sheets API"
4. Click on "Google Sheets API"
5. Click "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: "BLKOUT NXT Direct API"
   - User support email: Your email
   - Developer contact information: Your email
   - Click "Save and Continue"
   - Add the "https://www.googleapis.com/auth/spreadsheets" scope
   - Click "Save and Continue"
   - Add yourself as a test user
   - Click "Save and Continue"
   - Click "Back to Dashboard"
4. Now create the OAuth client ID:
   - Application type: Desktop application
   - Name: "BLKOUT NXT Direct API"
   - Click "Create"
5. Click "Download JSON"
6. Rename the downloaded file to `credentials.json`
7. Move the `credentials.json` file to the same directory as the `direct_google_sheets.py` script

## Step 4: Run the Script

1. Run the `direct_google_sheets.py` script
2. A browser window will open asking you to authorize the application
3. Sign in with your Google account
4. Click "Continue" to grant the requested permissions
5. The script will create a `token.json` file that will be used for future authentication
6. The script will append a test row to your Google Sheet

## Troubleshooting

If you encounter any issues:

1. Make sure the Google Sheets API is enabled for your project
2. Verify that the OAuth consent screen is properly configured
3. Check that the `credentials.json` file is in the same directory as the script
4. Ensure that the SPREADSHEET_ID in the script matches your Google Sheet ID
5. If you get a "Token has been expired or revoked" error, delete the `token.json` file and run the script again

## Using Workload Identity Federation (Alternative)

If you prefer to use Workload Identity Federation instead of OAuth 2.0:

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Enter a name for the service account
4. Click "Create and Continue"
5. Grant the service account the "Editor" role
6. Click "Continue"
7. Click "Done"
8. Click on the service account you just created
9. Go to the "Keys" tab
10. Click "Add Key" > "Create new key"
11. Select "JSON" and click "Create"
12. The key file will be downloaded automatically
13. Rename the downloaded file to `service_account.json`
14. Move the `service_account.json` file to the same directory as the script
15. Update the script to use the service account credentials instead of OAuth 2.0
