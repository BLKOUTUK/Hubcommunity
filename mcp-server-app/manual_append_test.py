import requests
import json
import time

def test_append():
    """Test appending data to the Google Sheet."""
    # Test data
    test_data = {
        "Email": f"manual.append.{int(time.time())}@example.com",
        "FirstName": "Manual",
        "LastName": "Append",
        "Role": "Test",
        "Organisation": "Test Org",
        "Status": "Active",
        "DateAdded": time.strftime("%Y-%m-%d"),
        "LastEmailSent": "",
        "EmailHistory": "[]",
        "OptOut": False,
        "Source": f"Manual Append {time.strftime('%Y-%m-%d %H:%M:%S')}"
    }
    
    print("Test data:")
    print(json.dumps(test_data, indent=2))
    
    print("\nPlease follow these steps:")
    print("1. Go to http://localhost:5678 in your browser")
    print("2. Click on 'Workflows' in the left sidebar")
    print("3. Find the 'Direct Sheet Append Test V2' workflow")
    print("4. Click on it to open it")
    print("5. Click on the 'Create Test Data' node")
    print("6. Replace the code with the following:")
    print("```javascript")
    print("// Use the test data")
    print("return {")
    for key, value in test_data.items():
        if isinstance(value, str):
            print(f"  {key}: \"{value}\",")
        elif isinstance(value, bool):
            print(f"  {key}: {str(value).lower()},")
        else:
            print(f"  {key}: {value},")
    print("};")
    print("```")
    print("7. Click 'Save' and then 'Execute Workflow'")
    print("8. Check the Google Sheet to see if the test data was added")
    print("9. Google Sheet URL: https://docs.google.com/spreadsheets/d/1EDTTmhBGiZdhKuLwCQLDduRuIE2oQmXfeJvoiowU4bs/edit")

if __name__ == "__main__":
    test_append()
