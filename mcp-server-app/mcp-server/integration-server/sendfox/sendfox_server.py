from mcp.server.fastmcp import FastMCP
import httpx
import json
import os
# We need datetime for the simulated responses, but it's commented out now
# Keeping the import in case we need to switch back to simulated mode
from datetime import datetime
from pathlib import Path
import sys

# Add the parent directory to the path so we can import from config
parent_dir = str(Path(__file__).resolve().parents[3])
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

# Initialize FastMCP server
mcp = FastMCP("sendfox-integration")

# Configuration
# In production, use environment variables or a config file
SENDFOX_API_KEY = os.getenv("SENDFOX_API_KEY", "your_api_key_here")
SENDFOX_API_URL = "https://api.sendfox.com"

@mcp.tool()
async def create_email_campaign(name: str, subject: str, content: str, list_ids: list) -> str:
    """Create a new email campaign in Sendfox.

    Args:
        name: Campaign name
        subject: Email subject line
        content: HTML content of the email
        list_ids: List IDs to send to
    """
    if SENDFOX_API_KEY == "your_api_key_here":
        return "Error: Sendfox API key not configured. Please set the SENDFOX_API_KEY environment variable."

    headers = {
        "Authorization": f"Bearer {SENDFOX_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "name": name,
        "subject": subject,
        "content": content,
        "list_ids": list_ids
    }

    # For demonstration purposes, we'll use the actual API call
    # If you want to use simulated responses, uncomment the code below

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SENDFOX_API_URL}/campaigns",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            return json.dumps(response.json())
        except Exception as e:
            error_message = f"Error creating campaign: {str(e)}"
            if hasattr(e, 'response') and e.response is not None:
                error_message += f"\nResponse: {e.response.text}"
            return error_message

    """
    # Simulated response
    return json.dumps({
        "id": "campaign_" + datetime.now().strftime("%Y%m%d%H%M%S"),
        "name": name,
        "subject": subject,
        "status": "draft",
        "created_at": datetime.now().isoformat(),
        "message": "Campaign created successfully (simulated)"
    })
    """

@mcp.tool()
async def schedule_email_campaign(campaign_id: str, schedule_time: str) -> str:
    """Schedule an existing Sendfox campaign.

    Args:
        campaign_id: ID of the campaign to schedule
        schedule_time: ISO format datetime for sending (YYYY-MM-DDTHH:MM:SS)
    """
    if SENDFOX_API_KEY == "your_api_key_here":
        return "Error: Sendfox API key not configured. Please set the SENDFOX_API_KEY environment variable."

    headers = {
        "Authorization": f"Bearer {SENDFOX_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "schedule_time": schedule_time
    }

    # For demonstration purposes, we'll use the actual API call
    # If you want to use simulated responses, uncomment the code below

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SENDFOX_API_URL}/campaigns/{campaign_id}/schedule",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            return json.dumps(response.json())
        except Exception as e:
            error_message = f"Error scheduling campaign: {str(e)}"
            if hasattr(e, 'response') and e.response is not None:
                error_message += f"\nResponse: {e.response.text}"
            return error_message

    """
    # Simulated response
    return json.dumps({
        "id": campaign_id,
        "status": "scheduled",
        "schedule_time": schedule_time,
        "message": "Campaign scheduled successfully (simulated)"
    })
    """

@mcp.tool()
async def get_campaign_stats(campaign_id: str) -> str:
    """Get statistics for a Sendfox campaign.

    Args:
        campaign_id: ID of the campaign
    """
    if SENDFOX_API_KEY == "your_api_key_here":
        return "Error: Sendfox API key not configured. Please set the SENDFOX_API_KEY environment variable."

    headers = {
        "Authorization": f"Bearer {SENDFOX_API_KEY}"
    }

    # For demonstration purposes, we'll use the actual API call
    # If you want to use simulated responses, uncomment the code below

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SENDFOX_API_URL}/campaigns/{campaign_id}/stats",
                headers=headers
            )
            response.raise_for_status()
            return json.dumps(response.json())
        except Exception as e:
            error_message = f"Error getting campaign stats: {str(e)}"
            if hasattr(e, 'response') and e.response is not None:
                error_message += f"\nResponse: {e.response.text}"
            return error_message

    """
    # Simulated response
    return json.dumps({
        "id": campaign_id,
        "sent": 1250,
        "opened": 625,
        "clicked": 312,
        "unsubscribed": 5,
        "open_rate": "50.0%",
        "click_rate": "25.0%",
        "message": "Campaign statistics retrieved successfully (simulated)"
    })
    """

@mcp.tool()
async def list_email_lists() -> str:
    """Get all email lists from Sendfox.

    Returns:
        List of email lists with IDs and subscriber counts
    """
    if SENDFOX_API_KEY == "your_api_key_here":
        return "Error: Sendfox API key not configured. Please set the SENDFOX_API_KEY environment variable."

    headers = {
        "Authorization": f"Bearer {SENDFOX_API_KEY}"
    }

    # For demonstration purposes, we'll use the actual API call
    # If you want to use simulated responses, uncomment the code below

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SENDFOX_API_URL}/lists",
                headers=headers
            )
            response.raise_for_status()
            return json.dumps(response.json())
        except Exception as e:
            error_message = f"Error listing email lists: {str(e)}"
            if hasattr(e, 'response') and e.response is not None:
                error_message += f"\nResponse: {e.response.text}"
            return error_message

    """
    # Simulated response
    return json.dumps({
        "lists": [
            {
                "id": "list_1",
                "name": "BLKOUT Members",
                "subscriber_count": 250,
                "created_at": "2025-01-15T12:00:00Z"
            },
            {
                "id": "list_2",
                "name": "BLKOUT Newsletter",
                "subscriber_count": 1500,
                "created_at": "2025-01-15T12:00:00Z"
            },
            {
                "id": "list_3",
                "name": "BLKOUT Partners",
                "subscriber_count": 75,
                "created_at": "2025-01-15T12:00:00Z"
            }
        ],
        "message": "Lists retrieved successfully (simulated)"
    })
    """

@mcp.tool()
async def create_contact(email: str, first_name: str = "", last_name: str = "", lists: list = None) -> str:
    """Create a new contact in Sendfox.

    Args:
        email: Contact email address
        first_name: Contact first name (optional)
        last_name: Contact last name (optional)
        lists: List IDs to add contact to (optional)
    """
    if SENDFOX_API_KEY == "your_api_key_here":
        return "Error: Sendfox API key not configured. Please set the SENDFOX_API_KEY environment variable."

    headers = {
        "Authorization": f"Bearer {SENDFOX_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "email": email,
        "first_name": first_name,
        "last_name": last_name
    }

    if lists:
        payload["lists"] = lists

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SENDFOX_API_URL}/contacts",
                headers=headers,
                json=payload
            )

            # Note: 422 might mean the contact already exists, which is fine
            if response.status_code == 422:
                return "Contact already exists (422 error). This is expected if the contact was already added."

            response.raise_for_status()
            return json.dumps(response.json())
        except Exception as e:
            error_message = f"Error creating contact: {str(e)}"
            if hasattr(e, 'response') and e.response is not None:
                error_message += f"\nResponse: {e.response.text}"
            return error_message

if __name__ == "__main__":
    # Initialize and run the server
    mcp.run(transport='stdio')
