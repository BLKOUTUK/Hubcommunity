from mcp.server.fastmcp import FastMCP
import httpx
import json
import os
from datetime import datetime
from pathlib import Path
import sys

# Add the parent directory to the path so we can import from config
parent_dir = str(Path(__file__).resolve().parents[3])
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

# Initialize FastMCP server
mcp = FastMCP("heartbeat-integration")

# Configuration
# In production, use environment variables or a config file
HEARTBEAT_API_KEY = os.getenv("HEARTBEAT_API_KEY", "your_api_key_here")
HEARTBEAT_API_URL = "https://api.heartbeat.chat/v1"
WORKSPACE_ID = os.getenv("HEARTBEAT_WORKSPACE_ID", "your_workspace_id_here")

@mcp.tool()
async def create_channel(name: str, description: str, is_private: bool = False) -> str:
    """Create a new channel in Heartbeat.chat.
    
    Args:
        name: Channel name
        description: Channel description
        is_private: Whether the channel is private
    """
    if HEARTBEAT_API_KEY == "your_api_key_here":
        return "Error: Heartbeat API key not configured. Please set the HEARTBEAT_API_KEY environment variable."
    
    headers = {
        "Authorization": f"Bearer {HEARTBEAT_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "workspace_id": WORKSPACE_ID,
        "name": name,
        "description": description,
        "is_private": is_private
    }
    
    # For demonstration purposes, we'll simulate the API call
    # In production, uncomment the actual API call
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{HEARTBEAT_API_URL}/channels", 
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            return json.dumps(response.json())
        except Exception as e:
            return f"Error creating channel: {str(e)}"
    """
    
    # Simulated response
    return json.dumps({
        "id": "channel_" + datetime.now().strftime("%Y%m%d%H%M%S"),
        "name": name,
        "description": description,
        "is_private": is_private,
        "created_at": datetime.now().isoformat(),
        "message": "Channel created successfully (simulated)"
    })

@mcp.tool()
async def post_announcement(channel_id: str, message: str, pin: bool = False) -> str:
    """Post an announcement to a Heartbeat.chat channel.
    
    Args:
        channel_id: ID of the channel
        message: Announcement message
        pin: Whether to pin the message
    """
    if HEARTBEAT_API_KEY == "your_api_key_here":
        return "Error: Heartbeat API key not configured. Please set the HEARTBEAT_API_KEY environment variable."
    
    headers = {
        "Authorization": f"Bearer {HEARTBEAT_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "channel_id": channel_id,
        "message": message,
        "pin": pin
    }
    
    # For demonstration purposes, we'll simulate the API call
    # In production, uncomment the actual API call
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{HEARTBEAT_API_URL}/messages", 
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            
            if pin:
                message_id = response.json().get("id")
                await client.post(
                    f"{HEARTBEAT_API_URL}/messages/{message_id}/pin",
                    headers=headers
                )
                
            return json.dumps(response.json())
        except Exception as e:
            return f"Error posting announcement: {str(e)}"
    """
    
    # Simulated response
    message_id = "msg_" + datetime.now().strftime("%Y%m%d%H%M%S")
    return json.dumps({
        "id": message_id,
        "channel_id": channel_id,
        "content": message,
        "pinned": pin,
        "created_at": datetime.now().isoformat(),
        "message": "Announcement posted successfully (simulated)"
    })

@mcp.tool()
async def get_engagement_stats(channel_id: str = None, timeframe: str = "7d") -> str:
    """Get engagement statistics from Heartbeat.chat.
    
    Args:
        channel_id: Optional specific channel (all channels if None)
        timeframe: Time period for stats (1d, 7d, 30d, etc.)
    """
    if HEARTBEAT_API_KEY == "your_api_key_here":
        return "Error: Heartbeat API key not configured. Please set the HEARTBEAT_API_KEY environment variable."
    
    headers = {
        "Authorization": f"Bearer {HEARTBEAT_API_KEY}"
    }
    
    params = {
        "workspace_id": WORKSPACE_ID,
        "timeframe": timeframe
    }
    
    if channel_id:
        params["channel_id"] = channel_id
    
    # For demonstration purposes, we'll simulate the API call
    # In production, uncomment the actual API call
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{HEARTBEAT_API_URL}/analytics/engagement", 
                headers=headers,
                params=params
            )
            response.raise_for_status()
            return json.dumps(response.json())
        except Exception as e:
            return f"Error getting engagement stats: {str(e)}"
    """
    
    # Simulated response
    if channel_id:
        return json.dumps({
            "channel_id": channel_id,
            "timeframe": timeframe,
            "total_messages": 325,
            "active_users": 42,
            "reactions": 156,
            "replies": 78,
            "peak_hours": ["14:00", "19:00"],
            "message": "Channel engagement statistics retrieved successfully (simulated)"
        })
    else:
        return json.dumps({
            "workspace_id": WORKSPACE_ID,
            "timeframe": timeframe,
            "total_messages": 1250,
            "active_users": 150,
            "reactions": 625,
            "replies": 312,
            "top_channels": [
                {"id": "channel_1", "name": "general", "messages": 325},
                {"id": "channel_2", "name": "events", "messages": 275},
                {"id": "channel_3", "name": "resources", "messages": 225}
            ],
            "peak_hours": ["14:00", "19:00"],
            "message": "Workspace engagement statistics retrieved successfully (simulated)"
        })

@mcp.tool()
async def list_channels() -> str:
    """List all channels in the Heartbeat.chat workspace.
    
    Returns:
        List of channels with IDs and member counts
    """
    if HEARTBEAT_API_KEY == "your_api_key_here":
        return "Error: Heartbeat API key not configured. Please set the HEARTBEAT_API_KEY environment variable."
    
    headers = {
        "Authorization": f"Bearer {HEARTBEAT_API_KEY}"
    }
    
    params = {
        "workspace_id": WORKSPACE_ID
    }
    
    # For demonstration purposes, we'll simulate the API call
    # In production, uncomment the actual API call
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{HEARTBEAT_API_URL}/channels", 
                headers=headers,
                params=params
            )
            response.raise_for_status()
            return json.dumps(response.json())
        except Exception as e:
            return f"Error listing channels: {str(e)}"
    """
    
    # Simulated response
    return json.dumps({
        "channels": [
            {
                "id": "channel_1",
                "name": "general",
                "description": "General discussion for all members",
                "member_count": 150,
                "is_private": False,
                "created_at": "2025-01-15T12:00:00Z"
            },
            {
                "id": "channel_2",
                "name": "events",
                "description": "Upcoming events and activities",
                "member_count": 125,
                "is_private": False,
                "created_at": "2025-01-15T12:00:00Z"
            },
            {
                "id": "channel_3",
                "name": "resources",
                "description": "Shared resources and knowledge base",
                "member_count": 100,
                "is_private": False,
                "created_at": "2025-01-15T12:00:00Z"
            }
        ],
        "message": "Channels retrieved successfully (simulated)"
    })

if __name__ == "__main__":
    # Initialize and run the server
    mcp.run(transport='stdio')
