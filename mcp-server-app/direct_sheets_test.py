import requests
import json
import time
import datetime

def test_direct_append():
    """Test direct append to Google Sheet using a simple webhook."""
    # Create test data
    timestamp = int(time.time())
    test_data = {
        "name": f"Direct Test {timestamp}",
        "email": f"direct.test.{timestamp}@example.com",
        "memberType": "Ally",
        "location": "London"
    }
    
    print(f"Test data: {json.dumps(test_data, indent=2)}")
    
    # Send the request to a simple webhook
    webhook_url = "http://localhost:5678/webhook/blkout-nxt-signup-simple"
    
    try:
        response = requests.post(
            webhook_url,
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Response status code: {response.status_code}")
        print(f"Response body: {response.text}")
        
        if response.status_code == 200:
            print("Test successful!")
        else:
            print("Test failed!")
    except Exception as e:
        print(f"Error: {str(e)}")
        print("Test failed!")

if __name__ == "__main__":
    # Test direct append
    test_direct_append()
    
    print("\nTest completed. Please check your Google Sheet to see if the data was added.")
