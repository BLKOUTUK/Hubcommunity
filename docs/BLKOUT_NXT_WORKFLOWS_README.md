# BLKOUT NXT Workflows

This document provides instructions for setting up and using the BLKOUT NXT workflows in n8n.

## Available Workflows

We've created four workflows for your BLKOUT NXT project:

### Using Google Sheets v1 Node (Compatible with older n8n versions)

1. **BLKOUT NXT Simple Onboarding** - Sends welcome emails to new members based on their segment
2. **BLKOUT NXT Simple Survey Follow-up** - Sends survey emails to members and reminders to those who haven't completed the survey

### Using Google Sheets v2 Node (Recommended for newer n8n versions)

1. **BLKOUT NXT Modern Onboarding** - Same functionality as Simple Onboarding but uses the newer Google Sheets node
2. **BLKOUT NXT Modern Survey Follow-up** - Same functionality as Simple Survey Follow-up but uses the newer Google Sheets node

We recommend using the "Modern" workflows if your n8n version supports the Google Sheets v2 node, as they offer better performance and more features.

## Setting Up the Workflows

### Step 1: Update Google Sheets Document ID

Before activating the workflows, you need to update the Google Sheets document ID in each workflow:

1. Open the n8n dashboard (http://localhost:5678)
2. Click on "Workflows" in the left sidebar
3. Open the "BLKOUT NXT Simple Onboarding" workflow
4. For each Google Sheets node:
   - Click on the node
   - Update the "Document ID" field with your Google Sheets document ID
   - Click "Save"
5. Repeat for the "BLKOUT NXT Simple Survey Follow-up" workflow

### Step 2: Update Survey Links

Update the survey links in the email templates:

1. Open each email node
2. Update the survey links in the email text
3. Click "Save"

### Step 3: Activate the Workflows

1. Open each workflow
2. Toggle the "Active" switch in the top-right corner
3. Click "Save" to save the workflow

## Google Sheets Structure

The workflows expect your Google Sheets to have the following structure:

### Community Members Sheet

| Column | Field Name | Description |
|--------|------------|-------------|
| A | Name | Member's name |
| B | Email | Member's email address |
| C | Status | Member's status (Active, Inactive) |
| D | JoinDate | Date the member joined |
| E | LastActive | Date the member was last active |
| F | MemberType | Type of member (Ally, Black Queer Men, QTIPOC Organiser, Organisation) |
| G | Location | Member's location |
| H | SurveyStatus | Status of survey (Sent, Completed) |
| I | ReminderSent | Whether a reminder has been sent (true/false) |
| J | OnboardingStatus | Status of onboarding (Welcomed) |

## Workflow Logic

### Onboarding Workflow

1. Runs daily at 10:00 AM
2. Gets all members from the Google Sheet
3. Filters for active members who haven't been onboarded
4. Segments members based on their MemberType
5. Sends appropriate welcome email based on segment
6. Updates the OnboardingStatus to "Welcomed"

### Survey Follow-up Workflow

1. Runs daily at 9:00 AM
2. Gets all members from the Google Sheet
3. Filters for active members who haven't been sent a survey
4. Checks if it's a first email or a reminder
5. Sends survey email or reminder email
6. Updates the SurveyStatus to "Sent" and ReminderSent if applicable

## Creating Additional Workflows

We've provided two scripts for creating workflows:

### For Google Sheets v1 Node (older n8n versions)

Use the `n8n_workflow_creator.py` script:

```
python n8n_workflow_creator.py create <workflow_json_file>
```

### For Google Sheets v2 Node (newer n8n versions)

Use the `n8n_workflow_creator_v2.py` script:

```
python n8n_workflow_creator_v2.py create <workflow_json_file>
```

This script properly formats the parameters for the Google Sheets v2 node.

## Troubleshooting

If you encounter any issues:

1. Check the n8n logs for error messages
2. Verify that your Google Sheets document ID is correct
3. Make sure your Google Sheets has the expected structure
4. Test the workflow manually by clicking "Execute Workflow"

For more detailed troubleshooting, you can check the execution details in the n8n dashboard.
