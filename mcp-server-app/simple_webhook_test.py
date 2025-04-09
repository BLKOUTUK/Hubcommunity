import requests
import json
import time

def test_webhook():
    """Test the webhook directly using requests."""
    webhook_url = "http://localhost:5678/webhook/blkout-nxt-signup-simple"
    
    # Test data
    timestamp = int(time.time())
    test_data = {
        "name": f"Simple Test {timestamp}",
        "email": f"simple.test.{timestamp}@example.com",
        "memberType": "Ally",
        "location": "London"
    }
    
    print(f"Sending data to webhook: {json.dumps(test_data, indent=2)}")
    
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
    test_webhook()
