import requests
import json
import time
import argparse

def test_web_form_integration(webhook_url=None, email=None, name=None, member_type=None, location=None, organisation=None):
    """Test the web form integration with custom data."""
    # Default webhook URL
    if webhook_url is None:
        webhook_url = "http://localhost:5678/webhook/blkout-nxt-signup-modern"
    
    # Create test data
    test_data = {
        "email": email or f"test.{int(time.time())}@example.com",
        "name": name or "Test User",
        "memberType": member_type or "Ally",
        "location": location or "London",
        "organisation": organisation or "Test Organisation"
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
    parser = argparse.ArgumentParser(description='Test the web form integration.')
    parser.add_argument('--webhook-url', help='The webhook URL to send the test data to')
    parser.add_argument('--email', help='The email to use in the test data')
    parser.add_argument('--name', help='The name to use in the test data')
    parser.add_argument('--member-type', help='The member type to use in the test data')
    parser.add_argument('--location', help='The location to use in the test data')
    parser.add_argument('--organisation', help='The organisation to use in the test data')
    
    args = parser.parse_args()
    
    test_web_form_integration(
        webhook_url=args.webhook_url,
        email=args.email,
        name=args.name,
        member_type=args.member_type,
        location=args.location,
        organisation=args.organisation
    )
