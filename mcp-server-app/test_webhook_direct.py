import requests
import json
import time

def test_webhook():
    """Test the webhook directly."""
    # Webhook URL
    webhook_url = "http://localhost:5678/webhook/blkout-nxt-test"
    
    # Test data
    timestamp = int(time.time())
    test_data = {
        "email": f"webhook.test.{timestamp}@example.com",
        "name": f"Webhook Test {timestamp}",
        "role": "Test"
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
    print("\nTest completed. Please check your Google Sheet to see if the data was added.")
