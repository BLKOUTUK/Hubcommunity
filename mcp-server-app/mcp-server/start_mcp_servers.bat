@echo off
echo Starting MCP Servers...

echo Starting Weather Server...
start "Weather Server" cmd /k "python c:\Users\robbe\hub_community\hub_community\mcp-server-app\mcp-server\weather_server.py"

echo Starting File System Server...
start "File System Server" cmd /k "python c:\Users\robbe\hub_community\hub_community\mcp-server-app\mcp-server\file_server.py"

echo Starting Campaign Server...
start "Campaign Server" cmd /k "python c:\Users\robbe\hub_community\hub_community\mcp-server-app\mcp-server\campaign-server\campaign_server.py"

echo Starting Sendfox Integration Server...
start "Sendfox Integration" cmd /k "python c:\Users\robbe\hub_community\hub_community\mcp-server-app\mcp-server\integration-server\sendfox\sendfox_server.py"

echo Starting Heartbeat Integration Server...
start "Heartbeat Integration" cmd /k "python c:\Users\robbe\hub_community\hub_community\mcp-server-app\mcp-server\integration-server\heartbeat\heartbeat_server.py"

echo Starting Social Media Integration Server...
start "Social Media Integration" cmd /k "python c:\Users\robbe\hub_community\hub_community\mcp-server-app\mcp-server\integration-server\social-media\social_server.py"

echo All MCP Servers started successfully!
echo You can now use them with Claude Desktop.
echo Remember to copy the claude_desktop_config.json file to %APPDATA%\Claude\claude_desktop_config.json
