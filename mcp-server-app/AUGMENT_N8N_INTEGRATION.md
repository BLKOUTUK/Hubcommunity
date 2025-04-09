# Setting Up n8n MCP Server for Augment

This guide provides instructions for setting up the n8n MCP server to work with Augment.

## Prerequisites

1. Python 3.8+ installed
2. Required Python packages: `mcp>=1.2.0`, `httpx>=0.28.0`, `python-dotenv>=1.0.0`
3. n8n instance running (typically at http://localhost:5678)
4. n8n API key configured

## Setup Instructions

### 1. Install Required Packages

Make sure you have the required packages installed:

```bash
pip install "mcp[cli]" httpx python-dotenv
```

### 2. Configure Environment Variables

Create a `.env` file in the `mcp-server/config` directory with your n8n credentials:

```
N8N_HOST_URL=http://localhost:5678/api/v1
N8N_API_KEY=your_n8n_api_key_here
```

### 3. Configure Augment to Use the MCP Server

To configure Augment to use the n8n MCP server, you need to:

1. Open Augment settings
2. Navigate to the MCP configuration section
3. Add the configuration from the `augment_mcp_config.json` file
4. Restart Augment

Alternatively, you can manually configure the MCP server in Augment with the following details:

- **Server Name**: n8n-integration
- **Command**: python
- **Arguments**: Path to the n8n_server.py script (e.g., `C:/Users/robbe/hub_community/hub_community/mcp-server-app/mcp-server/integration-server/n8n/n8n_server.py`)

## Available n8n MCP Tools

The n8n MCP server provides the following tools:

1. `list_workflows` - Lists all workflows in n8n
2. `get_workflow` - Gets details of a specific workflow
3. `create_workflow` - Creates a new workflow
4. `update_workflow` - Updates an existing workflow
5. `activate_workflow` - Activates a workflow
6. `deactivate_workflow` - Deactivates a workflow
7. `execute_workflow` - Executes a workflow
8. `delete_workflow` - Deletes a workflow

## Example Usage in Augment

Here are some examples of how to use the n8n MCP tools in Augment:

### Listing Workflows

```
Use the n8n-integration tool to list all workflows.
```

### Creating a Workflow

```
Use the n8n-integration tool to create a new workflow named "Data Processing" with the following nodes and connections.
```

### Executing a Workflow

```
Use the n8n-integration tool to execute workflow with ID "123" and pass the following data: {"name": "John", "email": "john@example.com"}
```

## Troubleshooting

If you encounter issues with the n8n MCP server:

1. Check that n8n is running and accessible at the configured URL
2. Verify that your n8n API key is correct and has the necessary permissions
3. Check the MCP server logs for error messages
4. Try running the n8n_server.py script directly to see if it starts correctly

## Additional Resources

- [n8n Documentation](https://docs.n8n.io/)
- [MCP Protocol Documentation](https://modelcontextprotocol.io/docs/)
- [Augment Documentation](https://docs.augmentcode.com/)
