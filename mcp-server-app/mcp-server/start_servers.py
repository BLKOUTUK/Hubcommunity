import subprocess
import os
import sys
import time
from pathlib import Path

# Get the current directory
CURRENT_DIR = Path(__file__).resolve().parent

# Define the servers to start
SERVERS = [
    {
        "name": "Campaign Server",
        "path": CURRENT_DIR / "campaign-server" / "campaign_server.py"
    },
    {
        "name": "Sendfox Integration",
        "path": CURRENT_DIR / "integration-server" / "sendfox" / "sendfox_server.py"
    },
    {
        "name": "Heartbeat Integration",
        "path": CURRENT_DIR / "integration-server" / "heartbeat" / "heartbeat_server.py"
    },
    {
        "name": "Social Media Integration",
        "path": CURRENT_DIR / "integration-server" / "social-media" / "social_server.py"
    },
    {
        "name": "Weather Server",
        "path": CURRENT_DIR / "weather_server.py"
    },
    {
        "name": "File System Server",
        "path": CURRENT_DIR / "file_server.py"
    }
]

def start_server(server):
    """Start an individual MCP server"""
    server_path = server["path"]

    if not server_path.exists():
        print(f"Warning: {server['name']} script not found at {server_path}")
        return None

    print(f"Starting {server['name']}...")

    # Start the server in a new process
    process = subprocess.Popen(
        [sys.executable, str(server_path)],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    # Give it a moment to start
    time.sleep(1)

    # Check if it's still running
    if process.poll() is None:
        print(f"{server['name']} started successfully (PID: {process.pid})")
        return process
    else:
        stdout, stderr = process.communicate()
        print(f"Error starting {server['name']}:")
        print(f"STDOUT: {stdout}")
        print(f"STDERR: {stderr}")
        return None

def main():
    """Start all MCP servers"""
    print("Starting BLKOUT MCP Servers...")

    processes = []
    for server in SERVERS:
        process = start_server(server)
        if process:
            processes.append((server["name"], process))

    print(f"\nStarted {len(processes)} out of {len(SERVERS)} servers")
    print("\nPress Ctrl+C to stop all servers")

    try:
        # Keep the script running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping all servers...")
        for name, process in processes:
            print(f"Stopping {name}...")
            process.terminate()
            process.wait()
        print("All servers stopped")

if __name__ == "__main__":
    main()
