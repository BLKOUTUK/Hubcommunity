import time

def generate_test_data():
    """Generate test data for manual testing."""
    timestamp = int(time.time())
    
    test_data = {
        "Email": f"manual.test.{timestamp}@example.com",
        "FirstName": "Manual",
        "LastName": "Test",
        "Role": "Test",
        "Organisation": "Test Org",
        "Status": "Active",
        "DateAdded": time.strftime("%Y-%m-%d"),
        "LastEmailSent": "",
        "EmailHistory": "[]",
        "OptOut": "false",
        "Source": f"Manual Test {time.strftime('%Y-%m-%d %H:%M:%S')}"
    }
    
    print("=== Manual Google Sheet Test ===")
    print("Please follow these steps to test the Google Sheets integration:")
    print("1. Go to http://localhost:5678 in your browser")
    print("2. Click on 'Workflows' in the left sidebar")
    print("3. Find the 'Scheduled Google Sheet Test' workflow")
    print("4. Click on it to open it")
    print("5. Click on the 'Set Test Data' node")
    print("6. Replace the values with the following:")
    
    for key, value in test_data.items():
        print(f"   - {key}: {value}")
    
    print("7. Click 'Save' and then 'Execute Workflow'")
    print("8. Check the execution results to see if there are any errors")
    print("9. Check the Google Sheet to see if the test data was added")
    print("10. Google Sheet URL: https://docs.google.com/spreadsheets/d/1EDTTmhBGiZdhKuLwCQLDduRuIE2oQmXfeJvoiowU4bs/edit")
    
    print("\nIf the test data is not added to the Google Sheet, there might be an issue with the Google Sheets credentials or the spreadsheet itself.")
    print("Please check the following:")
    print("1. Make sure the Google Sheets credentials are valid and have the necessary permissions")
    print("2. Make sure the spreadsheet ID is correct")
    print("3. Make sure the sheet name is correct (it should be 'Welcome')")
    print("4. Make sure the column names in the spreadsheet match the keys in the test data")

if __name__ == "__main__":
    generate_test_data()
