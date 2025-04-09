# N8N Workflow Creation Script

This script allows you to create n8n workflows programmatically using the n8n API.

## Prerequisites

- Python 3.6 or higher
- `requests` library (`pip install requests`)
- n8n running on http://localhost:5678
- n8n API key

## Usage

### List Workflows

To list all workflows in your n8n instance:

```
python create_n8n_workflow.py list
```

### Create a Workflow

To create a workflow from a JSON file:

```
python create_n8n_workflow.py create <file_path>
```

Example:

```
python create_n8n_workflow.py create BLKOUT_NXT_Survey_Followup_API.json
```

## Workflow JSON Files

The following workflow JSON files are provided:

1. `BLKOUT_NXT_Survey_Followup_API.json` - Survey follow-up workflow
2. `BLKOUT_NXT_Onboarding_API.json` - Onboarding workflow
3. `BLKOUT_NXT_Ally_Drip_Campaign_API.json` - Ally drip campaign workflow
4. `BLKOUT_NXT_Black_Queer_Men_Drip_Campaign_API.json` - Black Queer Men drip campaign workflow

Before using these files, you need to update the Google Sheets document ID in each file:

1. Open the JSON file in a text editor
2. Find all occurrences of `"value": "YOUR_DOCUMENT_ID"`
3. Replace `YOUR_DOCUMENT_ID` with your actual Google Sheets document ID

## Creating Additional Workflows

You can create additional workflows by creating new JSON files based on the provided templates. Make sure to:

1. Update the workflow name
2. Update the Google Sheets document ID
3. Update the email templates
4. Update the schedule trigger settings

## Activating Workflows

After creating a workflow, you need to activate it in the n8n dashboard:

1. Open the n8n dashboard (http://localhost:5678)
2. Click on the workflow you want to activate
3. Toggle the "Active" switch in the top-right corner
4. Click "Save" to save the changes

## Troubleshooting

If you encounter any issues:

1. Make sure n8n is running
2. Check that your API key is correct
3. Verify that the JSON file is valid
4. Check the n8n logs for any errors
