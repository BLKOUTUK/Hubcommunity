import requests
import json
import time

def test_fixed_webhook():
    """Test the fixed webhook directly."""
    # Webhook URL
    webhook_url = "http://localhost:5678/webhook-test/blkout-nxt-signup-fixed"
    
    # Test data
    test_data = {
        "name": "Test User " + str(int(time.time())),
        "email": "test." + str(int(time.time())) + "@example.com",
        "memberType": "Ally",
        "location": "London"
    }
    
    # Headers
    headers = {
        "Content-Type": "application/json"
    }
    
    print(f"Sending data to webhook: {json.dumps(test_data, indent=2)}")
    
    try:
        response = requests.post(webhook_url, json=test_data, headers=headers)
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("Test successful!")
        else:
            print("Test failed!")
    except Exception as e:
        print(f"Error sending request: {str(e)}")
        print("Test failed!")

if __name__ == "__main__":
    test_fixed_webhook()
