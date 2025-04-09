import requests
import json
import time
import sys

def test_matched_workflow():
    """Test the matched web form workflow."""
    # Default webhook URL
    webhook_url = "http://localhost:5678/webhook/blkout-nxt-signup-matched"

    # Use command line argument if provided
    if len(sys.argv) > 1:
        webhook_url = sys.argv[1]

    # Test data for different member types
    test_cases = [
        {
            "name": "Ally Test",
            "email": "ally.matched@example.com",
            "memberType": "Ally",
            "location": "London"
        },
        {
            "name": "BQM Test",
            "email": "bqm.matched@example.com",
            "memberType": "Black Queer Man",
            "location": "Manchester"
        },
        {
            "name": "Organiser Test",
            "email": "organiser.matched@example.com",
            "memberType": "QTIPOC Organiser",
            "location": "Birmingham"
        },
        {
            "name": "Organisation Test",
            "email": "org.matched@example.com",
            "memberType": "Organisation",
            "organisation": "Test Organisation"
        }
    ]

    # Send a POST request to the webhook for each test case
    for i, test_case in enumerate(test_cases):
        print(f"\n=== Test Case {i+1}: {test_case['memberType']} ===")
        print(f"Sending test data to {webhook_url}:")
        print(json.dumps(test_case, indent=2))

        try:
            response = requests.post(webhook_url, json=test_case)
            print(f"\nResponse status code: {response.status_code}")
            print(f"Response body:")
            print(json.dumps(response.json() if response.text else {}, indent=2))
        except Exception as e:
            print(f"Error: {str(e)}")

        print("=" * 50)

        # Wait a bit between requests
        time.sleep(1)

if __name__ == "__main__":
    test_matched_workflow()
