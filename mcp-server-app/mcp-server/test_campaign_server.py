import json
import subprocess
import sys
import time
from pathlib import Path

def test_campaign_server():
    """Test the Campaign Server by sending requests and printing responses"""
    print("Testing Campaign Server...")
    
    # Start the campaign server
    server_path = Path(__file__).parent / "campaign-server" / "campaign_server.py"
    
    if not server_path.exists():
        print(f"Error: Campaign server script not found at {server_path}")
        return
    
    process = subprocess.Popen(
        [sys.executable, str(server_path)],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Give it a moment to start
    time.sleep(2)
    
    # Test get_current_phase
    print("\nTesting get_current_phase...")
    request = {
        "id": "test-1",
        "method": "tool",
        "params": {
            "name": "get_current_phase",
            "parameters": {}
        }
    }
    
    # Write to stdin
    process.stdin.write(json.dumps(request) + "\n")
    process.stdin.flush()
    
    # Read response
    response = process.stdout.readline()
    try:
        result = json.loads(response)
        print("Response:")
        print(json.dumps(result, indent=2))
    except json.JSONDecodeError:
        print(f"Error decoding response: {response}")
    
    # Test campaign_metrics
    print("\nTesting campaign_metrics...")
    request = {
        "id": "test-2",
        "method": "tool",
        "params": {
            "name": "campaign_metrics",
            "parameters": {}
        }
    }
    
    # Write to stdin
    process.stdin.write(json.dumps(request) + "\n")
    process.stdin.flush()
    
    # Read response
    response = process.stdout.readline()
    try:
        result = json.loads(response)
        print("Response:")
        print(json.dumps(result, indent=2))
    except json.JSONDecodeError:
        print(f"Error decoding response: {response}")
    
    # Test campaign_action_items
    print("\nTesting campaign_action_items...")
    request = {
        "id": "test-3",
        "method": "tool",
        "params": {
            "name": "campaign_action_items",
            "parameters": {}
        }
    }
    
    # Write to stdin
    process.stdin.write(json.dumps(request) + "\n")
    process.stdin.flush()
    
    # Read response
    response = process.stdout.readline()
    try:
        result = json.loads(response)
        print("Response:")
        print(json.dumps(result, indent=2))
    except json.JSONDecodeError:
        print(f"Error decoding response: {response}")
    
    # Test campaign_calendar
    print("\nTesting campaign_calendar...")
    request = {
        "id": "test-4",
        "method": "tool",
        "params": {
            "name": "campaign_calendar",
            "parameters": {
                "days": 14
            }
        }
    }
    
    # Write to stdin
    process.stdin.write(json.dumps(request) + "\n")
    process.stdin.flush()
    
    # Read response
    response = process.stdout.readline()
    try:
        result = json.loads(response)
        print("Response:")
        print(json.dumps(result, indent=2))
    except json.JSONDecodeError:
        print(f"Error decoding response: {response}")
    
    # Terminate the process
    process.terminate()
    process.wait()
    print("\nCampaign Server test completed!")

if __name__ == "__main__":
    test_campaign_server()
