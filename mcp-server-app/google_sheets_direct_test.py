import requests
import json
import time
import datetime

def test_webhook_with_value_mode():
    """Test the webhook with different value input modes."""
    # Webhook URL
    webhook_url = "http://localhost:5678/webhook/blkout-nxt-signup-simple"
    
    # Test data
    timestamp = int(time.time())
    test_data = {
        "name": f"Value Mode Test {timestamp}",
        "email": f"value.mode.test.{timestamp}@example.com",
        "memberType": "Ally",
        "location": "London",
        "valueInputMode": "USER_ENTERED"  # Try to pass this to the workflow
    }
    
    print(f"Sending data to webhook with USER_ENTERED value mode: {json.dumps(test_data, indent=2)}")
    
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

def test_with_minimal_data():
    """Test with minimal data to reduce potential issues."""
    # Webhook URL
    webhook_url = "http://localhost:5678/webhook/blkout-nxt-signup-simple"
    
    # Minimal test data
    timestamp = int(time.time())
    test_data = {
        "email": f"minimal.test.{timestamp}@example.com",
        "name": f"Minimal Test {timestamp}"
    }
    
    print(f"\nSending minimal data to webhook: {json.dumps(test_data, indent=2)}")
    
    try:
        response = requests.post(
            webhook_url,
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Response status code: {response.status_code}")
        print(f"Response body: {response.text}")
        
        if response.status_code == 200:
            print("Minimal data test successful!")
        else:
            print("Minimal data test failed!")
    except Exception as e:
        print(f"Error: {str(e)}")
        print("Minimal data test failed!")

if __name__ == "__main__":
    # Test with value input mode
    test_webhook_with_value_mode()
    
    # Wait a bit
    time.sleep(2)
    
    # Test with minimal data
    test_with_minimal_data()
    
    print("\nTests completed. Please check your Google Sheet to see if the data was added.")
