import requests
import json
import time

def test_webhook_with_multiple_entries():
    """Test the webhook with multiple entries."""
    webhook_url = "http://localhost:5678/webhook/blkout-nxt-signup-simple"
    
    # Test data for different member types
    test_cases = [
        {
            "name": "Ally Test",
            "email": f"ally.test.{int(time.time())}@example.com",
            "memberType": "Ally",
            "location": "London"
        },
        {
            "name": "BQM Test",
            "email": f"bqm.test.{int(time.time())}@example.com",
            "memberType": "Black Queer Man",
            "location": "Manchester"
        },
        {
            "name": "Organiser Test",
            "email": f"organiser.test.{int(time.time())}@example.com",
            "memberType": "QTIPOC Organiser",
            "location": "Birmingham"
        },
        {
            "name": "Organisation Test",
            "email": f"org.test.{int(time.time())}@example.com",
            "memberType": "Organisation",
            "organisation": "Test Organisation"
        }
    ]
    
    # Send a POST request to the webhook for each test case
    for i, test_case in enumerate(test_cases):
        print(f"\n=== Test Case {i+1}: {test_case['memberType']} ===")
        print(f"Sending data to webhook: {json.dumps(test_case, indent=2)}")
        
        try:
            response = requests.post(
                webhook_url,
                json=test_case,
                headers={"Content-Type": "application/json"}
            )
            
            print(f"\nResponse status code: {response.status_code}")
            print(f"Response body: {response.text}")
            
            if response.status_code == 200:
                print(f"Test case {i+1} successful!")
            else:
                print(f"Test case {i+1} failed!")
        except Exception as e:
            print(f"Error: {str(e)}")
            print(f"Test case {i+1} failed!")
        
        print("=" * 50)
        
        # Wait a bit between requests
        time.sleep(1)

if __name__ == "__main__":
    test_webhook_with_multiple_entries()
