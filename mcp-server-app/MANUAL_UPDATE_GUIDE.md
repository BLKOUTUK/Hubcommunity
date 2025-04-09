# Manual Guide for Updating n8n Workflows

Since the automated update script encountered API issues, this guide provides instructions for manually updating your workflows to use Code nodes instead of Function nodes.

## Step 1: Import the Test Workflow

1. Open your n8n dashboard
2. Click on "Workflows" in the left sidebar
3. Click "Import from File" (or "Import" depending on your n8n version)
4. Select the `test_google_sheets_workflow_code.json` file
5. Run this test workflow to verify your Google Sheets connection works with Code nodes

## Step 2: Update the BLKOUT NXT Onboarding Workflow

### Option 1: Import the New Workflow
1. Import the `onboarding_code_workflow.json` file
2. This will create a new workflow with the Code node already set up
3. You'll need to add the remaining nodes (email sending, etc.) from your original workflow

### Option 2: Manually Add the Code Node
1. Open the "BLKOUT NXT Onboarding" workflow
2. Add a new **Code** node after the Google Sheets node
3. Name it "Filter & Segment Members (Code)"
4. Copy the code from `code_nodes/onboarding_code.js` into the Code node
5. Connect the Google Sheets node output to this new Code node
6. Connect the output of the Code node to the next node in the workflow (the "Route by Segment" node)
7. Disconnect any connections from the old Function node
8. Save the workflow and test it
9. Once confirmed working, you can delete the old Function node

## Step 3: Update the BLKOUT NXT Survey Follow-up Workflow

### Option 1: Import the New Workflow
1. Import the `survey_code_workflow.json` file
2. This will create a new workflow with the Code node already set up
3. You'll need to add the remaining nodes from your original workflow

### Option 2: Manually Add the Code Node
1. Open the "BLKOUT NXT Survey Follow-up (Updated)" workflow
2. Add a new **Code** node after the Google Sheets node
3. Name it "Filter for Survey Eligibility (Code)"
4. Copy the code from `code_nodes/survey_code.js` into the Code node
5. Connect the Google Sheets node output to this new Code node
6. Connect the output of the Code node to the next node in the workflow (the "Is Reminder?" node)
7. Disconnect any connections from the old Function node
8. Save the workflow and test it
9. Once confirmed working, you can delete the old Function node

## Step 4: Update the BLKOUT NXT Ally Drip Campaign Workflow

### Option 1: Import the New Workflow
1. Import the `ally_drip_code_workflow.json` file
2. This will create a new workflow with the Code node already set up
3. You'll need to add the remaining nodes from your original workflow

### Option 2: Manually Add the Code Node
1. Open the "BLKOUT NXT Ally Drip Campaign" workflow
2. Add a new **Code** node after the Google Sheets node
3. Name it "Filter for Drip Eligibility (Code)"
4. Copy the code from `code_nodes/ally_drip_code.js` into the Code node
5. Connect the Google Sheets node output to this new Code node
6. Connect the output of the Code node to the next node in the workflow (the "Route by Drip Stage" node)
7. Disconnect any connections from the old Function node
8. Save the workflow and test it
9. Once confirmed working, you can delete the old Function node

## Step 5: Update the Other Drip Campaign Workflows

For each of the remaining drip campaign workflows, follow the same process as in Step 4, but use the appropriate code file:

- **BLKOUT NXT Black Queer Men Drip Campaign**: Use `code_nodes/bqm_drip_code.js`
- **BLKOUT NXT QTIPOC Organiser Drip Campaign**: Use `code_nodes/organiser_drip_code.js`
- **BLKOUT NXT Organisation Drip Campaign**: Use `code_nodes/organisation_drip_code.js`

## Testing the Updated Workflows

After updating each workflow:

1. Click "Test Workflow" to run the workflow
2. Check the execution results for any errors
3. Look at the logs from the Code node to see if it's processing data correctly
4. Verify that the workflow is producing the expected output

## Troubleshooting

If you encounter issues after updating to Code nodes:

### Google Sheets Connection Issues
1. Make sure your Google Sheets credentials are up to date
2. Verify that the Google Sheets API is enabled in your Google Cloud project
3. Check that your OAuth scopes include:
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/drive.file`

### Code Node Errors
1. Check the execution logs for specific error messages
2. Verify that the data structure matches what the code expects
3. Make sure all required properties are being accessed correctly

### Workflow Connection Issues
1. Ensure all nodes are properly connected in the correct order
2. Check that the output of one node matches the expected input of the next node
