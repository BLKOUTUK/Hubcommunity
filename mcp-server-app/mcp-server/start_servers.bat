@echo off
echo Starting MCP Servers...

echo Starting Weather Server...
start cmd /k ".venv\Scripts\activate && python c:\Users\robbe\hub_community\Hubcommunity\mcp-server-app\mcp-server\weather_server.py"

echo Starting File System Server...
start cmd /k ".venv\Scripts\activate && python c:\Users\robbe\hub_community\Hubcommunity\mcp-server-app\mcp-server\file_server.py"

echo MCP Servers started. You can now use them with Claude Desktop or other MCP clients.
echo Remember to copy the claude_desktop_config.json file to the appropriate location.
