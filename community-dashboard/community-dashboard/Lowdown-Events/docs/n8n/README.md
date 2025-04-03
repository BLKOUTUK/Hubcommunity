# n8n Integration Guide for BLKOUT UK Events Calendar

This guide explains how to set up and use n8n workflows to automate event scraping for the BLKOUT UK Events Calendar.

## Prerequisites

- n8n installed and running (either locally or on a server)
- API access to event sources (Eventbrite, Outsavvy, etc.)
- Access to the BLKOUT UK Events Calendar database

## Available Workflows

1. [Eventbrite Event Scraper](./eventbrite_workflow.md)
2. [Outsavvy Event Scraper](./outsavvy_workflow.md) (coming soon)
3. [Organization Sites Scraper](./org_sites_workflow.md) (coming soon)

## Setting Up the Eventbrite Workflow

### Step 1: Import the Workflow

1. Download the [eventbrite_workflow.json](./eventbrite_workflow.json) file
2. In n8n, go to Workflows > Import From File
3. Select the downloaded file

### Step 2: Configure Credentials

1. Open the imported workflow
2. Find the "Credentials" node
3. Update the following values:
   - `eventbrite_api_key`: Your Eventbrite API key
   - `airtable_base_id`: Your Airtable base ID (or Supabase connection details)
   - `notification_email`: Email address to receive workflow reports

### Step 3: Customize Search Parameters

1. Find the "Eventbrite API" node
2. Adjust the query parameters as needed:
   - `q`: Search terms (e.g., "black lgbtq OR black queer OR blkout")
   - `location.address`: Location filter (e.g., "United Kingdom")
   - `start_date.range_start`: Start date for events
   - `start_date.range_end`: End date for events

### Step 4: Adjust Event Filtering

1. Find the "Filter Relevant Events" node
2. Customize the filtering logic to match your requirements
3. Add or remove keywords as needed

### Step 5: Configure Database Connection

1. Find the "Create New Event" and "Update Existing Event" nodes
2. Ensure they are correctly configured to connect to your database
3. Verify the field mappings match your database schema

### Step 6: Set Up Schedule

1. Find the "Schedule Trigger" node
2. Adjust the schedule as needed (default is every 24 hours)

### Step 7: Activate the Workflow

1. Click the "Activate" toggle in the top-right corner
2. The workflow will now run according to the schedule

## Workflow Details

### Eventbrite Workflow

The Eventbrite workflow performs the following steps:

1. Triggers on a schedule (default: every 24 hours)
2. Queries the Eventbrite API for events matching specific keywords
3. Transforms the Eventbrite data into a standardized format
4. Filters events to ensure they're relevant to the Black LGBTQ+ community
5. Checks if each event already exists in the database
6. Creates new events or updates existing ones
7. Sends an email summary of the workflow execution

## Troubleshooting

### Common Issues

1. **API Rate Limits**: If you encounter rate limit errors, adjust the Schedule Trigger to run less frequently.

2. **No Events Found**: Check your search parameters in the Eventbrite API node. They might be too restrictive.

3. **Database Connection Errors**: Verify your database credentials and ensure the database is accessible from the n8n server.

4. **Email Sending Failures**: Check your SMTP configuration in n8n.

### Workflow Logs

To view logs for a workflow execution:

1. Go to Executions in the n8n interface
2. Find the execution you want to inspect
3. Click on it to view detailed logs

## Extending the Workflows

### Adding New Event Sources

To add a new event source:

1. Create a new workflow based on the Eventbrite template
2. Replace the API request node with one for your new source
3. Adjust the data transformation to match the new source's format
4. Update the filtering logic as needed
5. Test thoroughly before activating

### Customizing Event Processing

You can customize how events are processed by modifying the Function nodes in the workflow. For example:

- Add additional filtering criteria
- Enhance data enrichment
- Implement custom categorization logic
- Add notifications for specific types of events