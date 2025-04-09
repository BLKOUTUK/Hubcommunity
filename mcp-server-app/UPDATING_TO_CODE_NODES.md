# Updating n8n Workflows to Use Code Nodes

This guide provides step-by-step instructions for updating your n8n workflows to use the newer Code nodes instead of the deprecated Function nodes.

## Why Update to Code Nodes?

In newer versions of n8n (v0.214.0+), the Function node has been deprecated and replaced by the Code node. This change offers several benefits:

- Better performance
- More features and flexibility
- Improved error handling
- Better compatibility with newer n8n versions

## Workflow Update Instructions

For each workflow, follow these steps to replace the Function nodes with Code nodes:

### 1. BLKOUT NXT Onboarding Workflow

#### Step 1: Add a Code Node
1. Open the "BLKOUT NXT Onboarding" workflow
2. Add a new **Code** node after the Google Sheets node
3. Connect the Google Sheets node output to the Code node input
4. Copy the code from `code_nodes/onboarding_code.js` into the Code node
5. Save the node

#### Step 2: Reconnect the Workflow
1. Disconnect any connections from the old "Filter & Segment Members" Function node
2. Connect the output of the new Code node to the next node in the workflow (likely a Switch node)
3. Save the workflow
4. Test the workflow to ensure it works correctly
5. Once confirmed working, you can delete the old Function node

### 2. BLKOUT NXT Survey Follow-up Workflow

#### Step 1: Add a Code Node
1. Open the "BLKOUT NXT Survey Follow-up (Updated)" workflow
2. Add a new **Code** node after the Google Sheets node
3. Connect the Google Sheets node output to the Code node input
4. Copy the code from `code_nodes/survey_code.js` into the Code node
5. Save the node

#### Step 2: Reconnect the Workflow
1. Disconnect any connections from the old "Filter for Survey Eligibility" Function node
2. Connect the output of the new Code node to the next node in the workflow (likely an "Is Reminder?" node)
3. Save the workflow
4. Test the workflow to ensure it works correctly
5. Once confirmed working, you can delete the old Function node

### 3. BLKOUT NXT Ally Drip Campaign Workflow

#### Step 1: Add a Code Node
1. Open the "BLKOUT NXT Ally Drip Campaign" workflow
2. Add a new **Code** node after the Google Sheets node
3. Connect the Google Sheets node output to the Code node input
4. Copy the code from `code_nodes/ally_drip_code.js` into the Code node
5. Save the node

#### Step 2: Reconnect the Workflow
1. Disconnect any connections from the old "Filter for Drip Eligibility" Function node
2. Connect the output of the new Code node to the next node in the workflow (likely a "Route by Drip Stage" node)
3. Save the workflow
4. Test the workflow to ensure it works correctly
5. Once confirmed working, you can delete the old Function node

### 4. BLKOUT NXT Black Queer Men Drip Campaign Workflow

#### Step 1: Add a Code Node
1. Open the "BLKOUT NXT Black Queer Men Drip Campaign" workflow
2. Add a new **Code** node after the Google Sheets node
3. Connect the Google Sheets node output to the Code node input
4. Copy the code from `code_nodes/bqm_drip_code.js` into the Code node
5. Save the node

#### Step 2: Reconnect the Workflow
1. Disconnect any connections from the old "Filter for Drip Eligibility" Function node
2. Connect the output of the new Code node to the next node in the workflow
3. Save the workflow
4. Test the workflow to ensure it works correctly
5. Once confirmed working, you can delete the old Function node

### 5. BLKOUT NXT QTIPOC Organiser Drip Campaign Workflow

#### Step 1: Add a Code Node
1. Open the "BLKOUT NXT QTIPOC Organiser Drip Campaign" workflow
2. Add a new **Code** node after the Google Sheets node
3. Connect the Google Sheets node output to the Code node input
4. Copy the code from `code_nodes/organiser_drip_code.js` into the Code node
5. Save the node

#### Step 2: Reconnect the Workflow
1. Disconnect any connections from the old "Filter for Drip Eligibility" Function node
2. Connect the output of the new Code node to the next node in the workflow
3. Save the workflow
4. Test the workflow to ensure it works correctly
5. Once confirmed working, you can delete the old Function node

### 6. BLKOUT NXT Organisation Drip Campaign Workflow

#### Step 1: Add a Code Node
1. Open the "BLKOUT NXT Organisation Drip Campaign" workflow
2. Add a new **Code** node after the Google Sheets node
3. Connect the Google Sheets node output to the Code node input
4. Copy the code from `code_nodes/organisation_drip_code.js` into the Code node
5. Save the node

#### Step 2: Reconnect the Workflow
1. Disconnect any connections from the old "Filter for Drip Eligibility" Function node
2. Connect the output of the new Code node to the next node in the workflow
3. Save the workflow
4. Test the workflow to ensure it works correctly
5. Once confirmed working, you can delete the old Function node

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

## Additional Resources

- [n8n Code Node Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/)
- [n8n Google Sheets Node Documentation](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/)
- [JavaScript Array Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
