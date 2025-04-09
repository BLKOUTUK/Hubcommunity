import os
from typing import List, Dict, Any
from mcp.server.fastmcp import FastMCP

# Initialize FastMCP server
mcp = FastMCP("file-system")

@mcp.tool()
def list_directory(path: str = ".") -> str:
    """List files and directories at the specified path.
    
    Args:
        path: The directory path to list (default: current directory)
    """
    try:
        items = os.listdir(path)
        result = []
        
        for item in items:
            full_path = os.path.join(path, item)
            item_type = "Directory" if os.path.isdir(full_path) else "File"
            size = os.path.getsize(full_path) if os.path.isfile(full_path) else "-"
            
            result.append(f"{item} ({item_type}, Size: {size} bytes)")
        
        return "\n".join(result) if result else "Directory is empty"
    except Exception as e:
        return f"Error listing directory: {str(e)}"

@mcp.tool()
def read_file(file_path: str) -> str:
    """Read the contents of a text file.
    
    Args:
        file_path: Path to the file to read
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return content
    except Exception as e:
        return f"Error reading file: {str(e)}"

@mcp.tool()
def file_info(file_path: str) -> str:
    """Get information about a file.
    
    Args:
        file_path: Path to the file
    """
    try:
        if not os.path.exists(file_path):
            return f"File not found: {file_path}"
            
        stats = os.stat(file_path)
        
        info = {
            "Path": os.path.abspath(file_path),
            "Size": f"{stats.st_size} bytes",
            "Created": stats.st_ctime,
            "Modified": stats.st_mtime,
            "Is Directory": os.path.isdir(file_path),
            "Is File": os.path.isfile(file_path)
        }
        
        return "\n".join([f"{k}: {v}" for k, v in info.items()])
    except Exception as e:
        return f"Error getting file info: {str(e)}"

if __name__ == "__main__":
    # Initialize and run the server
    mcp.run(transport='stdio')
