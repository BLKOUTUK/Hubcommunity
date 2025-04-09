# NocoDB Integration Guide for BLKOUT NEXT Campaign

This guide explains how to use NocoDB with the MCP servers for the BLKOUT NEXT campaign.

## What is NocoDB?

NocoDB is an open-source Airtable alternative that provides a visual interface for managing your campaign data. It's free to use and offers a similar experience to Airtable without the pricing constraints.

## Setting Up NocoDB

### 1. Create a NocoDB Account

1. Go to [NocoDB Cloud](https://cloud.nocodb.com/)
2. Sign up for a free account
3. Create a new workspace and project

### 2. Set Up Tables in NocoDB

Create the following tables in your NocoDB project:

#### Campaign_Phases Table
| Field Name | Field Type | Description |
|------------|------------|-------------|
| PhaseID | Number | Unique identifier for the phase (1-6) |
| Name | Single line text | Name of the campaign phase |
| StartDate | Date | Start date of the phase (YYYY-MM-DD) |
| EndDate | Date | End date of the phase (YYYY-MM-DD) |
| HubPercentage | Number | Percentage focus on BLKOUTHUB (0-100) |
| WebsitePercentage | Number | Percentage focus on BLKOUTUK.com (0-100) |
| SocialPercentage | Number | Percentage focus on Social Media (0-100) |
| Description | Long text | Detailed description of the phase |

#### Campaign_Metrics Table
| Field Name | Field Type | Description |
|------------|------------|-------------|
| MetricID | Number | Unique identifier for the metric |
| Name | Single line text | Name of the metric |
| CurrentValue | Number | Current value of the metric |
| TargetValue | Number | Target value to achieve |
| LastUpdated | Date | Date the metric was last updated |

#### Action_Items Table
| Field Name | Field Type | Description |
|------------|------------|-------------|
| ItemID | Number | Unique identifier for the action item |
| Description | Single line text | Description of the action item |
| PhaseID | Number | Phase this action belongs to (link to Campaign Phases) |
| Priority | Single select | Priority level (High, Medium, Low) |
| Status | Single select | Current status (Not Started, In Progress, Completed) |

#### Events_Calendar Table
| Field Name | Field Type | Description |
|------------|------------|-------------|
| EventID | Number | Unique identifier for the event |
| Title | Single line text | Title of the event |
| Date | Date | Date of the event |
| Platform | Single line text | Platform where the event will take place |
| Description | Long text | Detailed description of the event |

### 3. Get Your NocoDB API Token and IDs

1. Go to your NocoDB workspace
2. Click on your profile icon in the top-right corner
3. Select "Settings"
4. Go to the "API Tokens" tab
5. Create a new token with appropriate permissions
6. Copy the token

Also note your Workspace ID and Project ID from the URL:
- Example: `https://app.nocodb.com/dashboard/#/nc/workspace_abc123/project_xyz789/...`
- Workspace ID: `workspace_abc123`
- Project ID: `project_xyz789`

### 4. Update Your .env File

Update the `.env` file in the `config` directory with your NocoDB credentials:

```
NOCODB_API_URL=https://app.nocodb.com/api/v2
NOCODB_API_TOKEN=your_nocodb_api_token_here
NOCODB_WORKSPACE_ID=your_workspace_id_here
NOCODB_PROJECT_ID=your_project_id_here
```

## Using NocoDB with MCP Servers

### 1. Start the Campaign Server

```
python campaign-server/campaign_server.py
```

### 2. Test the Server with Claude Desktop

1. Make sure Claude Desktop is configured to use the MCP servers
2. Use the campaign management tools in Claude Desktop:
   - `get_current_phase`: Get information about the current campaign phase
   - `campaign_metrics`: Get current campaign metrics
   - `campaign_action_items`: Get prioritized action items for the current phase
   - `campaign_calendar`: Get upcoming campaign events and deadlines

### 3. Managing Campaign Data in NocoDB

You can now manage your campaign data visually in NocoDB:

1. Update campaign phases, metrics, action items, and events in NocoDB
2. The changes will be reflected in the MCP servers automatically
3. Claude Desktop will use the updated data when you use the campaign management tools

## Benefits of Using NocoDB

1. **Visual Interface**: Manage your campaign data in a spreadsheet-like interface
2. **No Record Limits**: Unlike Airtable's free tier, NocoDB doesn't limit the number of records
3. **Cost-Effective**: Free to use, with affordable paid plans if needed
4. **Data Ownership**: Complete control over your data

## Troubleshooting

If you encounter issues with the NocoDB integration:

1. **Check Your API Token**: Make sure your API token is correct and has the appropriate permissions
2. **Verify Table Names**: Ensure the table names match exactly (Campaign_Phases, Campaign_Metrics, Action_Items, Events_Calendar)
3. **Check Field Names**: Field names should match exactly as specified in this guide
4. **Restart the MCP Servers**: Sometimes restarting the servers can resolve connection issues

For more help, refer to the [NocoDB Documentation](https://docs.nocodb.com/).
