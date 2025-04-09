# BLKOUT NXT Workflow Setup Guide

This guide will help you import and set up the fixed n8n workflows that use Code nodes instead of Function nodes.

## Fixed Workflows

The following workflows have been fixed to use Code nodes instead of Function nodes:

1. **BLKOUT_NXT_Test_Google_Sheets_Connection.json** - A simple workflow to test your Google Sheets connection
2. **BLKOUT_NXT_Survey_Followup_Fixed_v2.json** - The survey follow-up workflow
3. **BLKOUT_NXT_Onboarding_Fixed.json** - The onboarding workflow for new members
4. **BLKOUT_NXT_Ally_Drip_Campaign_Fixed.json** - Drip campaign for Ally members
5. **BLKOUT_NXT_Black_Queer_Men_Drip_Campaign_Fixed.json** - Drip campaign for Black Queer Men members
6. **BLKOUT_NXT_QTIPOC_Organiser_Drip_Campaign_Fixed.json** - Drip campaign for QTIPOC Organiser members
7. **BLKOUT_NXT_Organisation_Drip_Campaign_Fixed.json** - Drip campaign for Organisation members

## Step 1: Import the Workflows

1. Open your n8n dashboard
2. Click on "Workflows" in the left sidebar
3. Click the "Import from File" button
4. Select each JSON file one by one
5. Click "Import" for each file

## Step 2: Test the Google Sheets Connection

1. Open the "Test Google Sheets Connection (Code Node)" workflow
2. Update the Google Sheets credentials:
   - Click on the Google Sheets node
   - Select your Google Sheets credentials from the dropdown
   - If needed, create new credentials by clicking "Create New"
   - Update the Document ID to point to your specific spreadsheet
3. Click "Save" to save the workflow
4. Click "Execute Workflow" to test the connection
5. Check the execution results to make sure data is being retrieved correctly

## Step 3: Set Up the Survey Follow-up Workflow

1. Open the "BLKOUT NXT Survey Follow-up (Fixed)" workflow
2. Configure the Google Sheets nodes:
   - Update the credentials
   - Verify the Document ID and Sheet Name
3. Customize the email templates:
   - Update the survey links
   - Adjust the email content as needed
4. Click "Save" to save the workflow
5. Test the workflow by clicking "Execute Workflow"

## Step 4: Set Up the Onboarding Workflow

1. Open the "BLKOUT NXT Onboarding (Fixed)" workflow
2. Configure the Google Sheets nodes:
   - Update the credentials
   - Verify the Document ID and Sheet Name
3. Customize the email templates for each segment:
   - Ally
   - Black Queer Men
   - QTIPOC Organiser
   - Organisation
   - General
4. Update the survey links in each email
5. Click "Save" to save the workflow
6. Test the workflow by clicking "Execute Workflow"

## Step 5: Set Up the Drip Campaign Workflows

For each drip campaign workflow:

1. Open the workflow
2. Configure the Google Sheets nodes:
   - Update the credentials
   - Verify the Document ID and Sheet Name
3. Customize the email templates for each drip stage
4. Update the links in each email
5. Click "Save" to save the workflow
6. Test the workflow by clicking "Execute Workflow"

## Step 6: Activate the Workflows

After testing each workflow:

1. Click the "Active" toggle to activate the workflow
2. Set the appropriate trigger schedule:
   - Click the "Schedule" tab
   - Select "Basic" or "Cron" schedule
   - For example, set the Survey Follow-up to run daily at 9 AM
3. Click "Save" to save the schedule

## Step 7: Test the Complete System

1. Import test data into your Google Sheet
2. Run the "BLKOUT NXT Onboarding (Fixed)" workflow to send welcome emails
3. Update the LastEmailSent date to 7+ hours ago for test members
4. Run the "BLKOUT NXT Survey Follow-up (Fixed)" workflow to send survey emails
5. Update the OnboardingStatus to "Welcomed" and SurveyStatus to "Completed" for test members
6. Run each drip campaign workflow to verify they enroll members correctly

## Troubleshooting

If you encounter any issues:

1. **Check the execution logs**: Look for error messages in the Code node logs
2. **Verify data structure**: Make sure the Google Sheets data matches what the code expects
3. **Check connections**: Ensure all nodes are properly connected in the correct order
4. **Test one workflow at a time**: Update and test each workflow individually before moving to the next

## Notes on Code Nodes vs. Function Nodes

The Code node is the newer replacement for the Function node in n8n. It offers:

- Better performance
- More features and flexibility
- Improved error handling
- Better compatibility with newer n8n versions

These fixed workflows use Code nodes instead of Function nodes to ensure compatibility with newer versions of n8n.

## Customizing the Workflows

You may need to customize these workflows to match your specific needs:

1. **Column names**: Update the code if your Google Sheets uses different column names
2. **Email content**: Customize the email templates to match your branding and messaging
3. **Filtering logic**: Adjust the criteria for filtering members in the Code nodes
4. **Additional nodes**: Add more nodes if needed for your specific use case

## Getting Help

If you need further assistance:

1. Check the n8n documentation: https://docs.n8n.io/
2. Join the n8n community forum: https://community.n8n.io/
3. Contact BLKOUT NXT support at blkoutuk@gmail.com
