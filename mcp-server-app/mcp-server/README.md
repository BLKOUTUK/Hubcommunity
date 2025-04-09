# MCP Server Environment

This directory contains Model Context Protocol (MCP) servers that can be used with Claude Desktop or other MCP clients.

## Included Servers

### Utility Servers

1. **Weather Server** (`weather_server.py`): Provides weather forecasts and alerts using the National Weather Service API.
   - Tool: `get_forecast` - Get weather forecast for a location by latitude and longitude
   - Tool: `get_alerts` - Get weather alerts for a US state

2. **File System Server** (`file_server.py`): Provides access to the local file system.
   - Tool: `list_directory` - List files and directories at a specified path
   - Tool: `read_file` - Read the contents of a text file
   - Tool: `file_info` - Get information about a file

### BLKOUT NEXT Campaign Servers (April-September 2025)

1. **Campaign Server** (`campaign-server/campaign_server.py`): Manages the BLKOUT NEXT campaign timeline and metrics.
   - Tool: `get_current_phase` - Get information about the current campaign phase
   - Tool: `campaign_metrics` - Get current campaign metrics
   - Tool: `campaign_action_items` - Get prioritized action items for the current phase
   - Tool: `campaign_calendar` - Get upcoming campaign events and deadlines

2. **Sendfox Integration** (`integration-server/sendfox/sendfox_server.py`): Integrates with Sendfox for email campaigns.
   - Tool: `create_email_campaign` - Create a new email campaign
   - Tool: `schedule_email_campaign` - Schedule an existing campaign
   - Tool: `get_campaign_stats` - Get statistics for a campaign

3. **Heartbeat Integration** (`integration-server/heartbeat/heartbeat_server.py`): Integrates with Heartbeat.chat for community engagement.
   - Tool: `create_channel` - Create a new channel
   - Tool: `post_announcement` - Post an announcement to a channel
   - Tool: `get_engagement_stats` - Get engagement statistics

4. **Social Media Integration** (`integration-server/social-media/social_server.py`): Manages social media campaigns.
   - Tool: `social_content_schedule` - Schedule content for social media platforms
   - Tool: `social_campaign_analytics` - Get analytics for social media campaigns
   - Tool: `social_engagement_monitor` - Monitor social media for engagement opportunities

## Setup Instructions

### Prerequisites

- Python 3.10 or higher
- Claude Desktop (for using with Claude)

### Installation

1. Create and activate a virtual environment:
   ```
   python -m venv .venv
   .venv\Scripts\activate  # On Windows
   source .venv/bin/activate  # On macOS/Linux
   ```

2. Install required packages:
   ```
   pip install "mcp[cli]" httpx
   ```

### Running the Servers

You can run the servers directly:

```
python weather_server.py
python file_server.py
```

### Integrating with Claude Desktop

1. Copy the `claude_desktop_config.json` file to:
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. Restart Claude Desktop

3. You should now see the MCP tools available in Claude Desktop (look for the hammer icon)

## Troubleshooting

If the servers aren't showing up in Claude Desktop:

1. Check the Claude Desktop logs:
   - Windows: `%USERPROFILE%\AppData\Local\Logs\Claude\mcp*.log`
   - macOS: `~/Library/Logs/Claude/mcp*.log`

2. Make sure the paths in `claude_desktop_config.json` are absolute and correct

3. Verify that the servers run without errors when executed directly

## Development

To add new tools to an existing server, simply add new functions with the `@mcp.tool()` decorator.

To create a new server, use the FastMCP class and follow the pattern in the existing server files.