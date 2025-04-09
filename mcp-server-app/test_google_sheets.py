import requests
import json
import time
import datetime

def test_webhook_with_curl():
    """Test the webhook using curl command."""
    import subprocess
    
    # Create test data
    timestamp = int(time.time())
    test_data = {
        "name": f"Curl Test {timestamp}",
        "email": f"curl.test.{timestamp}@example.com",
        "memberType": "Ally",
        "location": "London"
    }
    
    # Create curl command
    curl_command = [
        "curl",
        "-X", "POST",
        "http://localhost:5678/webhook/blkout-nxt-signup-simple",
        "-H", "Content-Type: application/json",
        "-d", json.dumps(test_data)
    ]
    
    print(f"Executing curl command: {' '.join(curl_command)}")
    
    # Execute curl command
    try:
        result = subprocess.run(curl_command, capture_output=True, text=True)
        print(f"Curl command output: {result.stdout}")
        print(f"Curl command error: {result.stderr}")
        
        if result.returncode == 0:
            print("Curl test successful!")
        else:
            print("Curl test failed!")
    except Exception as e:
        print(f"Error executing curl command: {str(e)}")
        print("Curl test failed!")

def test_webhook_with_requests():
    """Test the webhook using requests library."""
    # Create test data
    timestamp = int(time.time())
    test_data = {
        "name": f"Requests Test {timestamp}",
        "email": f"requests.test.{timestamp}@example.com",
        "memberType": "Ally",
        "location": "London"
    }
    
    print(f"Sending data to webhook: {json.dumps(test_data, indent=2)}")
    
    # Send the request
    try:
        response = requests.post(
            "http://localhost:5678/webhook/blkout-nxt-signup-simple",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Response status code: {response.status_code}")
        print(f"Response body: {response.text}")
        
        if response.status_code == 200:
            print("Requests test successful!")
        else:
            print("Requests test failed!")
    except Exception as e:
        print(f"Error: {str(e)}")
        print("Requests test failed!")

if __name__ == "__main__":
    # Test webhook with curl
    print("\n=== Testing webhook with curl ===")
    test_webhook_with_curl()
    
    # Test webhook with requests
    print("\n=== Testing webhook with requests ===")
    test_webhook_with_requests()
    
    print("\nTests completed. Please check your Google Sheet to see if the data was added.")
