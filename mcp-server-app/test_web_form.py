import requests
import json
import sys

def test_web_form(webhook_url, test_data=None):
    """Test the BLKOUT NXT web form integration."""
    if test_data is None:
        test_data = {
            "name": "Test User",
            "email": "test@example.com",
            "memberType": "Ally",
            "location": "London"
        }

    print(f"Sending test data to {webhook_url}:")
    print(json.dumps(test_data, indent=2))

    try:
        response = requests.post(webhook_url, json=test_data)
        print(f"\nResponse status code: {response.status_code}")

        try:
            print("Response body:")
            print(json.dumps(response.json(), indent=2))
        except:
            print("Response body (not JSON):")
            print(response.text)

        return response
    except Exception as e:
        print(f"Error: {str(e)}")
        return None

if __name__ == "__main__":
    # Default webhook URL
    webhook_url = "http://localhost:5678/webhook-test/blkout-nxt-signup-fixed"

    # Use command line argument if provided
    if len(sys.argv) > 1:
        webhook_url = sys.argv[1]

    # Test data for different member types
    test_cases = [
        {
            "name": "Ally Test",
            "email": "ally.test@example.com",
            "memberType": "Ally",
            "location": "London"
        },
        {
            "name": "BQM Test",
            "email": "bqm.test@example.com",
            "memberType": "Black Queer Man",
            "location": "Manchester"
        },
        {
            "name": "Organiser Test",
            "email": "organiser.test@example.com",
            "memberType": "QTIPOC Organiser",
            "location": "Birmingham"
        },
        {
            "name": "Organisation Test",
            "email": "org.test@example.com",
            "memberType": "Organisation",
            "organisation": "Test Organisation"
        }
    ]

    # Run tests
    for i, test_data in enumerate(test_cases):
        print(f"\n=== Test Case {i+1}: {test_data['memberType']} ===")
        test_web_form(webhook_url, test_data)
        print("=" * 50)
