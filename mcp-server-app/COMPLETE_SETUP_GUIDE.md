# BLKOUT NXT Workflow Setup Guide

All workflow templates have been successfully imported into your n8n instance. This guide will help you complete the setup of each workflow.

## Imported Workflows

The following workflows have been imported:

1. **Test Google Sheets Connection (Code Node)** - ID: 5qmspHXB6lRWTQ3B
2. **BLKOUT NXT Onboarding (Code Node)** - ID: 4052PlMLO2rhFJg5
3. **BLKOUT NXT Survey Follow-up (Code Node)** - ID: oss8rpBDPY940tUs
4. **BLKOUT NXT Ally Drip Campaign (Code Node)** - ID: drsm0UToa7j4xpWJ
5. **BLKOUT NXT Black Queer Men Drip Campaign (Code Node)** - ID: cCRSjbiJQcURLnW8
6. **BLKOUT NXT QTIPOC Organiser Drip Campaign (Code Node)** - ID: 1910q6w2kM4ThGzA
7. **BLKOUT NXT Organisation Drip Campaign (Code Node)** - ID: 3OhAqoNzkmHmna5O

## Step 1: Test the Google Sheets Connection

1. Open the "Test Google Sheets Connection (Code Node)" workflow
2. Update the Google Sheets credentials if needed
3. Click "Test Workflow" to verify the connection works
4. Check the execution results and logs to ensure data is being retrieved correctly

## Step 2: Complete the Onboarding Workflow

1. Open the "BLKOUT NXT Onboarding (Code Node)" workflow
2. The workflow includes:
   - Google Sheets node to read data
   - Code node to filter and segment members
   - Switch node to route by segment
3. Add the remaining nodes from your original workflow:
   - Email sending nodes for each segment
   - Google Sheets node to update member status
4. Connect all nodes properly
5. Test the workflow

## Step 3: Complete the Survey Follow-up Workflow

1. Open the "BLKOUT NXT Survey Follow-up (Code Node)" workflow
2. The workflow includes:
   - Google Sheets node to read data
   - Code node to filter for survey eligibility
   - If node to check if it's a reminder
3. Add the remaining nodes from your original workflow:
   - Switch nodes to route by segment
   - Email sending nodes for initial surveys and reminders
   - Google Sheets nodes to update member status
4. Connect all nodes properly
5. Test the workflow

## Step 4: Complete the Drip Campaign Workflows

For each drip campaign workflow:

1. Open the workflow
2. The workflow includes:
   - Google Sheets node to read data
   - Code node to filter for drip eligibility
   - Switch node to route by drip stage
3. Add the remaining nodes from your original workflow:
   - Email sending nodes for each drip stage
   - Google Sheets node to update member status
4. Connect all nodes properly
5. Test the workflow

## Step 5: Activate the Workflows

After completing and testing each workflow:

1. Click the "Active" toggle to activate the workflow
2. Set the appropriate trigger schedule if needed
3. Verify the workflow is running as expected

## Step 6: Test the Complete System

1. Import the test CSV file into your Google Sheet
2. Run the "BLKOUT NXT Onboarding (Code Node)" workflow to send welcome emails
3. Update the LastEmailSent date to 7+ hours ago for test members
4. Run the "BLKOUT NXT Survey Follow-up (Code Node)" workflow to send survey emails
5. Update the OnboardingStatus to "Survey Completed" for test members
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

The imported workflows use Code nodes instead of Function nodes to ensure compatibility with newer versions of n8n.
