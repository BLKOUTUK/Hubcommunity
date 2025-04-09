# MCP Servers Quick Start Guide

This guide provides simple instructions for setting up and using the MCP servers for the BLKOUT NEXT campaign.

## Setup Instructions

### 1. Install Required Packages

Make sure you have the required packages installed:

```
pip install "mcp[cli]" httpx python-dotenv
```

### 2. Configure Claude Desktop

Run the `setup_claude_config.bat` script to copy the configuration file to the Claude Desktop directory:

```
setup_claude_config.bat
```

Then restart Claude Desktop.

### 3. Start the MCP Servers

Run the `start_mcp_servers.bat` script to start all the MCP servers:

```
start_mcp_servers.bat
```

This will start all the MCP servers in separate command windows.

## Available MCP Servers

### 1. Weather Server
- `get_forecast`: Get weather forecast for a location by latitude and longitude
- `get_alerts`: Get weather alerts for a US state

### 2. File System Server
- `list_directory`: List files and directories at a specified path
- `read_file`: Read the contents of a text file
- `file_info`: Get information about a file

### 3. Campaign Server
- `get_current_phase`: Get information about the current campaign phase
- `campaign_metrics`: Get current campaign metrics
- `campaign_action_items`: Get prioritized action items for the current phase
- `campaign_calendar`: Get upcoming campaign events and deadlines

### 4. Sendfox Integration
- `create_email_campaign`: Create a new email campaign
- `schedule_email_campaign`: Schedule an existing campaign
- `get_campaign_stats`: Get statistics for a campaign
- `list_email_lists`: Get all email lists from Sendfox

### 5. Heartbeat Integration
- `create_channel`: Create a new channel
- `post_announcement`: Post an announcement to a channel
- `get_engagement_stats`: Get engagement statistics
- `list_channels`: List all channels in the workspace

### 6. Social Media Integration
- `social_content_schedule`: Schedule content for social media platforms
- `social_campaign_analytics`: Get analytics for social media campaigns
- `social_engagement_monitor`: Monitor social media for engagement opportunities
- `social_hashtag_research`: Research effective hashtags for your campaign

## Using MCP Tools in Claude Desktop

1. In Claude Desktop, look for the hammer icon in the toolbar
2. Click on the hammer icon to see the available MCP tools
3. Select a tool to use
4. Fill in any required parameters
5. Submit the tool request

Claude will then execute the tool and display the results in your conversation.

## Troubleshooting

If the MCP tools are not showing up in Claude Desktop:

1. Make sure all MCP servers are running
2. Check that the configuration file is in the correct location
3. Restart Claude Desktop
4. Check the Claude Desktop logs for errors
