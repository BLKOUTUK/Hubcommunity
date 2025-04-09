# BLKOUT NXT Configuration System

This document explains how to use the BLKOUT NXT configuration system to easily update common values across all your workflows.

## Overview

The configuration system consists of:

1. A central configuration file (`blkout_nxt_config.json`) that stores all your common values
2. A workflow updater script (`update_workflow_configs.py`) that automatically updates all your workflows with these values

This approach saves you from having to manually update each workflow individually, making the process much more efficient and less error-prone.

## Configuration File

The `blkout_nxt_config.json` file stores all your common values in a structured format:

```json
{
  "google_sheets": {
    "document_id": "YOUR_GOOGLE_SHEET_DOCUMENT_ID"
  },
  "email": {
    "from_email": "blkouthub@gmail.com",
    "admin_email": "blkoutuk@gmail.com"
  },
  "survey_links": {
    "ally_survey": "https://forms.gle/YOUR_ALLY_SURVEY_LINK",
    "bqm_survey": "https://forms.gle/YOUR_BQM_SURVEY_LINK",
    "qtipoc_organiser_survey": "https://forms.gle/YOUR_QTIPOC_ORGANISER_SURVEY_LINK",
    "organisation_survey": "https://forms.gle/YOUR_ORGANISATION_SURVEY_LINK",
    "general_survey": "https://forms.gle/YOUR_GENERAL_SURVEY_LINK",
    "feedback_survey": "https://forms.gle/YOUR_FEEDBACK_SURVEY_LINK"
  }
}
```

### How to Update the Configuration File

1. Open the `blkout_nxt_config.json` file in a text editor
2. Update the values with your actual information:
   - Replace `YOUR_GOOGLE_SHEET_DOCUMENT_ID` with your actual Google Sheet document ID
   - Update the email addresses if needed
   - Replace the survey links with your actual Google Forms links
3. Save the file

## Workflow Updater Script

The `update_workflow_configs.py` script automatically updates all your workflows with the values from the configuration file.

### How to Use the Script

1. Make sure you have Python installed
2. Update the `blkout_nxt_config.json` file with your actual values
3. Run the script:

```
python update_workflow_configs.py blkout_nxt_config.json
```

This will update all workflows in your n8n instance.

If you want to update only specific workflows (e.g., only BLKOUT NXT workflows), you can add a name filter:

```
python update_workflow_configs.py blkout_nxt_config.json "BLKOUT NXT"
```

### What the Script Updates

The script updates the following in your workflows:

1. **Google Sheets Document ID**: Updates the document ID in all Google Sheets nodes (both v1 and v2)
2. **Email Addresses**: Updates the from email and admin email addresses in all Email nodes
3. **Survey Links**: Updates all survey links in the email templates based on the node name

## Workflow

Here's the typical workflow for making changes:

1. **Initial Setup**:
   - Update the `blkout_nxt_config.json` file with all your actual values
   - Run the script to update all workflows

2. **When You Need to Change a Value**:
   - Update the value in the `blkout_nxt_config.json` file
   - Run the script again to propagate the change to all workflows

3. **When You Add New Workflows**:
   - Create the workflow as usual
   - Run the script to automatically update the new workflow with your configuration values

This approach ensures that all your workflows always have consistent and up-to-date values.

## Troubleshooting

If you encounter any issues:

1. **Script Errors**: Make sure the `blkout_nxt_config.json` file is valid JSON
2. **API Errors**: Check that your n8n instance is running and the API key is correct
3. **No Updates**: Make sure your workflows use the expected placeholder values that the script is looking for

For more detailed troubleshooting, check the error messages output by the script.
