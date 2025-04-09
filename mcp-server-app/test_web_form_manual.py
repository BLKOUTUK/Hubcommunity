import requests
import json
import time
import argparse

def test_web_form_manual():
    """Generate test data for the web form integration."""
    # Generate test data
    timestamp = int(time.time())
    test_data = {
        "name": f"Test User {timestamp}",
        "email": f"test.{timestamp}@example.com",
        "memberType": "Ally",
        "location": "London"
    }
    
    print("Test data:")
    print(json.dumps(test_data, indent=2))
    
    print("\nPlease follow these steps:")
    print("1. Go to http://localhost:5678 in your browser")
    print("2. Click on 'Workflows' in the left sidebar")
    print("3. Find the 'BLKOUT NXT Web Form Integration (Fixed)' workflow")
    print("4. Click on it to open it")
    print("5. Click the 'Test Workflow' button in the top-right corner")
    print("6. In the 'Test Webhook' dialog, paste the following JSON data:")
    print(json.dumps(test_data, indent=2))
    print("7. Click 'Test' to send the data to the workflow")
    print("8. Check the execution results to see if the data was processed correctly")
    print("9. Check the Google Sheet to see if the test data was added")
    print("10. Google Sheet URL: https://docs.google.com/spreadsheets/d/1EDTTmhBGiZdhKuLwCQLDduRuIE2oQmXfeJvoiowU4bs/edit")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Generate test data for the web form integration.')
    parser.add_argument('--email', help='The email to use in the test data')
    parser.add_argument('--name', help='The name to use in the test data')
    parser.add_argument('--member-type', help='The member type to use in the test data')
    parser.add_argument('--location', help='The location to use in the test data')
    
    args = parser.parse_args()
    
    test_web_form_manual()
