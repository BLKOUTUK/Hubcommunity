# NocoDB Integration Guide

This guide explains how to use NocoDB with the MCP servers for the BLKOUT NEXT campaign.

## Setup Instructions

### 1. Create Tables in NocoDB

1. **CommunityMembers Table**
   - Fields: Name, Email, Role, Organisation, Status, CreatedAt
   - This table stores information about community members

2. **UserActivities Table** (for rewards tracking)
   - Fields: UserId, Email, ActionType, Points, Description, Timestamp, Source
   - This table tracks user activities from Heartbeat.chat

3. **UserRewards Table** (for rewards totals)
   - Fields: UserId, Email, TotalPoints, Level, LastUpdated
   - This table stores the accumulated rewards for each user

### 2. Find the Correct API URLs

For each table, you need to find the correct API URL:

1. Open the NocoDB UI
2. Navigate to your table
3. Click on the "API" button in the top-right corner
4. Look for the "REST API" section
5. Copy the URL for the "List" operation

### 3. Update the .env File

Update the `.env` file in the `config` directory with your NocoDB credentials:

```
# NocoDB API Configuration
NOCODB_API_URL=https://cloud.nocodb.com/api/v1
NOCODB_API_TOKEN=your_nocodb_api_token_here
NOCODB_WORKSPACE_ID=your_workspace_id_here
NOCODB_PROJECT_ID=your_project_id_here

# Table-specific URLs (update these with the correct URLs from the NocoDB UI)
NOCODB_API_URL_COMMUNITYMEMBERS=https://cloud.nocodb.com/api/v1/db/data/v1/your_project_id/CommunityMembers
NOCODB_API_URL_USERACTIVITIES=https://cloud.nocodb.com/api/v1/db/data/v1/your_project_id/UserActivities
NOCODB_API_URL_USERREWARDS=https://cloud.nocodb.com/api/v1/db/data/v1/your_project_id/UserRewards
```

### 4. Test the Integration

Run the test script to verify that you can connect to NocoDB:

```
python test_nocodb_connection.py
```

### 5. Start the Campaign Server

```
python campaign-server/campaign_server.py
```

## Troubleshooting

### API URL Format Issues

If you're having trouble with the API URL format, try these different formats:

1. **Format 1**: `/db/data/v1/{project_id}/{table_name}`
2. **Format 2**: `/db/data/noco/{workspace_id}/{project_id}/{table_name}`
3. **Format 3**: `/db/data/v2/{project_id}/{table_name}`

The correct format depends on your NocoDB version and configuration.

### Authentication Issues

If you're having authentication issues:

1. Make sure your API token is correct
2. Check that you're using the `xc-token` header
3. Try generating a new API token

### Table Not Found Issues

If you're getting "Table not found" errors:

1. Make sure the table name is correct (case-sensitive)
2. Check that the project ID is correct
3. Verify that the table exists in the NocoDB UI

## Using NocoDB with n8n

If you're using n8n for automation:

1. Use the HTTP Request node to interact with NocoDB
2. Set the URL to the correct API endpoint
3. Add the `xc-token` header with your API token
4. Use JSON for the request body

Example n8n workflow for adding a new community member:

```json
{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "form-submission",
        "options": {}
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "url": "={{$env.NOCODB_API_URL_COMMUNITYMEMBERS}}",
        "method": "POST",
        "authentication": "genericHeader",
        "genericAuthenticationHeader": "xc-token",
        "genericAuthenticationValue": "={{$env.NOCODB_API_TOKEN}}",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "bodyParameters": {},
        "bodyContent": "={\n  \"Name\": $json.name,\n  \"Email\": $json.email,\n  \"Role\": $json.role || \"Member\",\n  \"Organisation\": $json.organisation || \"\",\n  \"Status\": \"Initial Signup\",\n  \"CreatedAt\": $now\n}",
        "options": {}
      },
      "name": "Add to NocoDB",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [450, 300]
    },
    {
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{ $json?.statusCode }}",
              "operation": "equal",
              "value2": 200
            }
          ]
        }
      },
      "name": "Success?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [650, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ {success: true, message: 'Member added successfully'} }}",
        "options": {}
      },
      "name": "Success Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [850, 200]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ {success: false, message: 'Failed to add member', error: $json} }}",
        "options": {
          "statusCode": 400
        }
      },
      "name": "Error Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [850, 400]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Add to NocoDB",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Add to NocoDB": {
      "main": [
        [
          {
            "node": "Success?",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Success?": {
      "main": [
        [
          {
            "node": "Success Response",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Error Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## Next Steps

1. **Update n8n Workflows**: Update your existing n8n workflows to use NocoDB instead of Airtable
2. **Create Views**: Create views in NocoDB to make it easier to visualize your data
3. **Set Up Automations**: Use n8n to automate data flows between NocoDB and other systems
