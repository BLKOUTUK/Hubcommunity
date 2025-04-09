# Guide to Update n8n Workflows

This guide provides step-by-step instructions for updating your n8n workflows to handle the data structure correctly after importing the amended CSV.

## 1. Update the BLKOUT NXT Onboarding Workflow

### Step 1: Open the Workflow
1. Open your n8n dashboard
2. Navigate to "Workflows" in the left sidebar
3. Find and open the "BLKOUT NXT Onboarding" workflow

### Step 2: Update the Filter & Segment Members Node
1. Click on the "Filter & Segment Members" node
2. Replace the existing code with the code from `updated_functions/onboarding_filter_function.js`
3. Click "Save" to save the node changes
4. Click "Save" again to save the workflow

## 2. Update the BLKOUT NXT Survey Follow-up Workflow

### Step 1: Open the Workflow
1. Open your n8n dashboard
2. Navigate to "Workflows" in the left sidebar
3. Find and open the "BLKOUT NXT Survey Follow-up (Updated)" workflow

### Step 2: Update the Filter for Survey Eligibility Node
1. Click on the "Filter for Survey Eligibility" node
2. Replace the existing code with the code from `updated_functions/survey_filter_function.js`
3. Click "Save" to save the node changes
4. Click "Save" again to save the workflow

## 3. Update the Drip Campaign Workflows

For each of the following workflows:
- BLKOUT NXT Ally Drip Campaign
- BLKOUT NXT Black Queer Men Drip Campaign
- BLKOUT NXT QTIPOC Organiser Drip Campaign
- BLKOUT NXT Organisation Drip Campaign

### Step 1: Open the Workflow
1. Open your n8n dashboard
2. Navigate to "Workflows" in the left sidebar
3. Find and open the drip campaign workflow

### Step 2: Update the Filter for Drip Eligibility Node
1. Click on the "Filter for Drip Eligibility" node
2. Replace the existing code with the code from `updated_functions/drip_filter_function.js`
3. **Important**: Modify the segment-specific parts of the code:
   - For Ally workflow: Keep "ally" and "Ally" as is
   - For BQM workflow: Change "ally" to "black queer man" and "Ally" to "BQM"
   - For Organiser workflow: Change "ally" to "qtipoc organiser" and "Ally" to "QTIPOCOrganiser"
   - For Organisation workflow: Change "ally" to "organisation" and "Ally" to "Organisation"
4. Click "Save" to save the node changes
5. Click "Save" again to save the workflow

## 4. Test the Updated Workflows

### Step 1: Import the Amended CSV
1. Open your Google Sheet
2. Import the amended CSV file as instructed

### Step 2: Test Each Workflow
1. Open each workflow in n8n
2. Click "Test Workflow" to run the workflow
3. Check the execution results for any errors
4. Verify that the workflow is processing the data correctly

### Step 3: Check the Google Sheet
1. After testing the workflows, check your Google Sheet
2. Verify that the test members have been updated correctly
3. Check that the OnboardingStatus, LastEmailSent, and EmailHistory fields are updated as expected

## Troubleshooting

If you encounter any issues:

1. Check the execution logs in n8n for error messages
2. Look at the console output from the function nodes for debugging information
3. Verify that the Google Sheet structure matches what the workflows expect
4. Make sure your Google Sheets credentials in n8n have the correct permissions

## Segment-Specific Code Changes for Drip Campaigns

### For BLKOUT NXT Ally Drip Campaign
```javascript
const isTargetSegment = role.includes('ally');
const inDripCampaign = notes.includes('DripCampaign: Ally');
dripCampaign: 'Ally'
```

### For BLKOUT NXT Black Queer Men Drip Campaign
```javascript
const isTargetSegment = role.includes('black queer man');
const inDripCampaign = notes.includes('DripCampaign: BQM');
dripCampaign: 'BQM'
```

### For BLKOUT NXT QTIPOC Organiser Drip Campaign
```javascript
const isTargetSegment = role.includes('qtipoc organiser');
const inDripCampaign = notes.includes('DripCampaign: QTIPOCOrganiser');
dripCampaign: 'QTIPOCOrganiser'
```

### For BLKOUT NXT Organisation Drip Campaign
```javascript
const isTargetSegment = role.includes('organisation');
const inDripCampaign = notes.includes('DripCampaign: Organisation');
dripCampaign: 'Organisation'
```
