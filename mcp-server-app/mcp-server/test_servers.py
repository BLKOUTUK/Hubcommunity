import asyncio
import json
import subprocess
import sys
import time
from pathlib import Path

async def test_weather_server():
    print("Testing Weather Server...")
    
    # Start the weather server
    process = subprocess.Popen(
        [sys.executable, str(Path(__file__).parent / "weather_server.py")],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Give it a moment to start
    await asyncio.sleep(2)
    
    # Test with a simple input
    test_input = {
        "id": "test-1",
        "method": "tool",
        "params": {
            "name": "get_alerts",
            "parameters": {
                "state": "CA"
            }
        }
    }
    
    # Write to stdin
    process.stdin.write(json.dumps(test_input) + "\n")
    process.stdin.flush()
    
    # Wait for response
    await asyncio.sleep(5)
    
    # Check if process is still running
    if process.poll() is None:
        print("Weather Server is running correctly!")
    else:
        print("Weather Server exited unexpectedly!")
        stdout, stderr = process.communicate()
        print(f"STDOUT: {stdout}")
        print(f"STDERR: {stderr}")
    
    # Terminate the process
    process.terminate()
    process.wait()

async def test_file_server():
    print("Testing File Server...")
    
    # Start the file server
    process = subprocess.Popen(
        [sys.executable, str(Path(__file__).parent / "file_server.py")],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Give it a moment to start
    await asyncio.sleep(2)
    
    # Test with a simple input
    test_input = {
        "id": "test-1",
        "method": "tool",
        "params": {
            "name": "list_directory",
            "parameters": {
                "path": "."
            }
        }
    }
    
    # Write to stdin
    process.stdin.write(json.dumps(test_input) + "\n")
    process.stdin.flush()
    
    # Wait for response
    await asyncio.sleep(5)
    
    # Check if process is still running
    if process.poll() is None:
        print("File Server is running correctly!")
    else:
        print("File Server exited unexpectedly!")
        stdout, stderr = process.communicate()
        print(f"STDOUT: {stdout}")
        print(f"STDERR: {stderr}")
    
    # Terminate the process
    process.terminate()
    process.wait()

async def main():
    print("Starting MCP Server Tests...")
    
    await test_weather_server()
    await test_file_server()
    
    print("All tests completed!")

if __name__ == "__main__":
    asyncio.run(main())
