import requests
import json
import time
import uuid

def test_signup_webhook():
    """Test the signup webhook."""
    # Generate a unique ID for this test
    unique_id = str(uuid.uuid4())
    
    # Test data
    test_data = {
        "name": f"Test User {unique_id[:8]}",
        "email": f"test.{unique_id[:8]}@example.com",
        "memberType": "Ally"  # Options: "Ally", "Black Queer Men", "QTIPOC Organiser", "Organisation"
    }
    
    print(f"Sending signup data: {json.dumps(test_data, indent=2)}")
    
    # Send the request
    try:
        response = requests.post(
            "http://localhost:5678/webhook/blkout-nxt-signup",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Response status code: {response.status_code}")
        print(f"Response body: {response.text}")
        
        if response.status_code == 200:
            print("Signup test successful!")
        else:
            print("Signup test failed!")
    except Exception as e:
        print(f"Error: {str(e)}")
        print("Signup test failed!")

if __name__ == "__main__":
    test_signup_webhook()
    print("\nTest completed. Check your email for the welcome message with the survey link.")
