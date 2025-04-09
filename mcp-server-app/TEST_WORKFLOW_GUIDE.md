# Testing Google Sheets Connection in n8n

This guide will help you test your Google Sheets connection in n8n using a simple test workflow.

## Step 1: Import the Test Workflow

1. Open your n8n dashboard
2. Click on "Workflows" in the left sidebar
3. Click the "Import from File" button (or "Import" depending on your n8n version)
4. Select the `test_google_sheets_workflow.json` file
5. Click "Import" to add the workflow to your n8n instance

## Step 2: Configure the Credentials

1. Open the imported "Test Google Sheets Connection" workflow
2. Click on the "Google Sheets" node
3. If prompted, select your existing Google Sheets credentials or create new ones
4. If creating new credentials:
   - Click "Create New"
   - Select "OAuth2" as the authentication method
   - Follow the OAuth flow to connect to your Google account
   - Make sure to grant all requested permissions

## Step 3: Run the Test Workflow

1. Click "Save" to save the workflow with your credentials
2. Click "Test Workflow" to execute it
3. Wait for the execution to complete

## Step 4: Analyze the Results

1. Click on the "Debug Data Structure" node to view its output
2. Check the "Console" tab to see the logged information about the data structure
3. Look for any error messages

### What to Look For

The logs should show:
- Input data is an array: true
- First item has json property: true
- json property is an array: true
- json length: (should be the number of rows in your sheet)
- First 3 items in json array: (should show the first 3 rows of your sheet)

## Step 5: Fix Your Main Workflow

If the test workflow runs successfully:

1. Open your "BLKOUT NXT Onboarding" workflow
2. Click on the "Filter & Segment Members" node
3. Replace the existing code with the code from `robust_filter_function.js`
4. Save the node and the workflow
5. Test the workflow again

## Troubleshooting

If the test workflow fails:

### Check Google API Scopes

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" > "OAuth consent screen"
4. Make sure you have the following scopes:
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/drive.file`

### Check API Enablement

Make sure you have enabled:
- Google Sheets API
- Google Drive API

### Re-authenticate

1. Delete your existing Google Sheets credentials in n8n
2. Create new credentials and go through the OAuth flow again
3. Test the workflow with the new credentials

### Check Sheet Permissions

Make sure your Google account has access to the spreadsheet:
1. Open the spreadsheet in your browser
2. Check that you have edit permissions
3. If using a service account, make sure the sheet is shared with the service account email
