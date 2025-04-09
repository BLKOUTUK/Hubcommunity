from mcp.server.fastmcp import FastMCP
import httpx
import json
import os
from pathlib import Path
import sys

# Add the parent directory to the path so we can import from config
parent_dir = str(Path(__file__).resolve().parents[3])
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

# Initialize FastMCP server
mcp = FastMCP("n8n-integration")

# Configuration
# In production, use environment variables or a config file
N8N_API_KEY = os.getenv("N8N_API_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MzZjNTEyZC1lYmM3LTRiYzYtYWM5MS0zMzI3ZDgzY2UwMjMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQzNzg1NTY0LCJleHAiOjE3NTE1MTUyMDB9.ZWbR5bp1jtaB7yfxn-kg4ASNHgXuRIe5QKv5O9ccUJI")
N8N_HOST_URL = os.getenv("N8N_HOST_URL", "http://localhost:5678/api/v1")

@mcp.tool()
async def list_workflows() -> str:
    """List all workflows in n8n.

    Returns:
        JSON string containing all workflows
    """
    if not N8N_API_KEY:
        return "Error: n8n API key not configured. Please set the N8N_API_KEY environment variable."

    headers = {
        "X-N8N-API-KEY": N8N_API_KEY
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{N8N_HOST_URL}/workflows",
                headers=headers
            )
            response.raise_for_status()
            return json.dumps(response.json())
        except Exception as e:
            error_message = f"Error listing workflows: {str(e)}"
            if hasattr(e, 'response') and e.response is not None:
                error_message += f"\nResponse: {e.response.text}"
            return error_message

@mcp.tool()
async def get_workflow(workflow_id: str) -> str:
    """Get a specific workflow from n8n.

    Args:
        workflow_id: ID of the workflow to retrieve

    Returns:
        JSON string containing the workflow details
    """
    if not N8N_API_KEY:
        return "Error: n8n API key not configured. Please set the N8N_API_KEY environment variable."

    headers = {
        "X-N8N-API-KEY": N8N_API_KEY
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{N8N_HOST_URL}/workflows/{workflow_id}",
                headers=headers
            )
            response.raise_for_status()
            return json.dumps(response.json())
        except Exception as e:
            error_message = f"Error getting workflow: {str(e)}"
            if hasattr(e, 'response') and e.response is not None:
                error_message += f"\nResponse: {e.response.text}"
            return error_message

@mcp.tool()
async def create_workflow(name: str, nodes: list, connections: list, active: bool = False) -> str:
    """Create a new workflow in n8n.

    Args:
        name: Name of the workflow
        nodes: List of node objects
        connections: List of connection objects
        active: Whether to activate the workflow immediately

    Returns:
        JSON string containing the created workflow
    """
    if not N8N_API_KEY:
        return "Error: n8n API key not configured. Please set the N8N_API_KEY environment variable."

    headers = {
        "X-N8N-API-KEY": N8N_API_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "name": name,
        "nodes": nodes,
        "connections": connections,
        "active": active
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{N8N_HOST_URL}/workflows",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            return json.dumps(response.json())
        except Exception as e:
            error_message = f"Error creating workflow: {str(e)}"
            if hasattr(e, 'response') and e.response is not None:
                error_message += f"\nResponse: {e.response.text}"
            return error_message

@mcp.tool()
async def update_workflow(workflow_id: str, name: str = None, nodes: list = None, connections: list = None, active: bool = None) -> str:
    """Update an existing workflow in n8n.

    Args:
        workflow_id: ID of the workflow to update
        name: New name for the workflow (optional)
        nodes: Updated list of node objects (optional)
        connections: Updated list of connection objects (optional)
        active: Whether to activate the workflow (optional)

    Returns:
        JSON string containing the updated workflow
    """
    if not N8N_API_KEY:
        return "Error: n8n API key not configured. Please set the N8N_API_KEY environment variable."

    headers = {
        "X-N8N-API-KEY": N8N_API_KEY,
        "Content-Type": "application/json"
    }

    # First get the current workflow to update only what's provided
    async with httpx.AsyncClient() as client:
        try:
            get_response = await client.get(
                f"{N8N_HOST_URL}/workflows/{workflow_id}",
                headers=headers
            )
            get_response.raise_for_status()
            current_workflow = get_response.json()

            # Update only the fields that were provided
            payload = current_workflow
            if name is not None:
                payload["name"] = name
            if nodes is not None:
                payload["nodes"] = nodes
            if connections is not None:
                payload["connections"] = connections
            if active is not None:
                payload["active"] = active

            # Send the update request
            response = await client.put(
                f"{N8N_HOST_URL}/workflows/{workflow_id}",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            return json.dumps(response.json())
        except Exception as e:
            error_message = f"Error updating workflow: {str(e)}"
            if hasattr(e, 'response') and e.response is not None:
                error_message += f"\nResponse: {e.response.text}"
            return error_message

@mcp.tool()
async def activate_workflow(workflow_id: str) -> str:
    """Activate a workflow in n8n.

    Args:
        workflow_id: ID of the workflow to activate

    Returns:
        JSON string containing the result
    """
    if not N8N_API_KEY:
        return "Error: n8n API key not configured. Please set the N8N_API_KEY environment variable."

    headers = {
        "X-N8N-API-KEY": N8N_API_KEY
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{N8N_HOST_URL}/workflows/{workflow_id}/activate",
                headers=headers
            )
            response.raise_for_status()
            return json.dumps(response.json())
        except Exception as e:
            error_message = f"Error activating workflow: {str(e)}"
            if hasattr(e, 'response') and e.response is not None:
                error_message += f"\nResponse: {e.response.text}"
            return error_message

@mcp.tool()
async def deactivate_workflow(workflow_id: str) -> str:
    """Deactivate a workflow in n8n.

    Args:
        workflow_id: ID of the workflow to deactivate

    Returns:
        JSON string containing the result
    """
    if not N8N_API_KEY:
        return "Error: n8n API key not configured. Please set the N8N_API_KEY environment variable."

    headers = {
        "X-N8N-API-KEY": N8N_API_KEY
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{N8N_HOST_URL}/workflows/{workflow_id}/deactivate",
                headers=headers
            )
            response.raise_for_status()
            return json.dumps(response.json())
        except Exception as e:
            error_message = f"Error deactivating workflow: {str(e)}"
            if hasattr(e, 'response') and e.response is not None:
                error_message += f"\nResponse: {e.response.text}"
            return error_message

@mcp.tool()
async def execute_workflow(workflow_id: str, data: dict = None) -> str:
    """Execute a workflow in n8n.

    Args:
        workflow_id: ID of the workflow to execute
        data: Data to pass to the workflow (optional)

    Returns:
        JSON string containing the execution result
    """
    if not N8N_API_KEY:
        return "Error: n8n API key not configured. Please set the N8N_API_KEY environment variable."

    headers = {
        "X-N8N-API-KEY": N8N_API_KEY,
        "Content-Type": "application/json"
    }

    payload = data or {}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{N8N_HOST_URL}/workflows/{workflow_id}/execute",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            return json.dumps(response.json())
        except Exception as e:
            error_message = f"Error executing workflow: {str(e)}"
            if hasattr(e, 'response') and e.response is not None:
                error_message += f"\nResponse: {e.response.text}"
            return error_message

@mcp.tool()
async def delete_workflow(workflow_id: str) -> str:
    """Delete a workflow from n8n.

    Args:
        workflow_id: ID of the workflow to delete

    Returns:
        JSON string containing the result
    """
    if not N8N_API_KEY:
        return "Error: n8n API key not configured. Please set the N8N_API_KEY environment variable."

    headers = {
        "X-N8N-API-KEY": N8N_API_KEY
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.delete(
                f"{N8N_HOST_URL}/workflows/{workflow_id}",
                headers=headers
            )
            response.raise_for_status()
            return json.dumps(response.json())
        except Exception as e:
            error_message = f"Error deleting workflow: {str(e)}"
            if hasattr(e, 'response') and e.response is not None:
                error_message += f"\nResponse: {e.response.text}"
            return error_message

if __name__ == "__main__":
    # Initialize and run the server
    mcp.run(transport='stdio')
