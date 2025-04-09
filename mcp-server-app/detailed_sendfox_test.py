import requests
import os
import json
from dotenv import load_dotenv
from pathlib import Path
import time

print("Running detailed SendFox API test...")

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent / "mcp-server" / "config" / ".env"
print(f"Looking for .env file at: {env_path}")
print(f"File exists: {env_path.exists()}")
load_dotenv(dotenv_path=env_path)

# SendFox API configuration
SENDFOX_API_KEY = os.getenv("SENDFOX_API_KEY")
SENDFOX_ACCESS_TOKEN = os.getenv("SENDFOX_ACCESS_TOKEN")

print(f"SENDFOX_API_KEY: {SENDFOX_API_KEY[:10]}..." if SENDFOX_API_KEY else "SENDFOX_API_KEY: None")
print(f"SENDFOX_ACCESS_TOKEN: {SENDFOX_ACCESS_TOKEN[:10]}..." if SENDFOX_ACCESS_TOKEN else "SENDFOX_ACCESS_TOKEN: None")

# Use the access token instead of the API key
AUTH_TOKEN = SENDFOX_ACCESS_TOKEN or SENDFOX_API_KEY

# Base URL for SendFox API
base_url = "https://api.sendfox.com"

# Test 1: Get user info
def test_user_info():
    print("\n=== Test 1: Get User Info ===")
    url = f"{base_url}/me"

    headers = {
        "Authorization": f"Bearer {AUTH_TOKEN}",
        "Accept": "application/json"
    }

    try:
        print(f"Sending GET request to {url}...")
        response = requests.get(url, headers=headers)

        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text[:500]}..." if len(response.text) > 500 else f"Response: {response.text}")

        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

# Test 2: Get lists
def test_get_lists():
    print("\n=== Test 2: Get Lists ===")
    url = f"{base_url}/lists"

    headers = {
        "Authorization": f"Bearer {AUTH_TOKEN}",
        "Accept": "application/json"
    }

    try:
        print(f"Sending GET request to {url}...")
        response = requests.get(url, headers=headers)

        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text[:500]}..." if len(response.text) > 500 else f"Response: {response.text}")

        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                print(f"Found {len(data)} lists")
                for i, list_item in enumerate(data):
                    print(f"List {i+1}: ID={list_item.get('id')}, Name={list_item.get('name')}")

        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

# Test 3: Add contact
def test_add_contact():
    print("\n=== Test 3: Add Contact ===")
    url = f"{base_url}/contacts"

    # Generate a unique email to avoid conflicts
    timestamp = int(time.time())
    email = f"test{timestamp}@example.com"

    data = {
        "email": email,
        "first_name": "Test",
        "last_name": "User"
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {AUTH_TOKEN}",
        "Accept": "application/json"
    }

    try:
        print(f"Sending POST request to {url}...")
        print(f"Data: {json.dumps(data)}")
        print(f"Headers: {json.dumps(headers)}")

        response = requests.post(url, json=data, headers=headers)

        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text[:500]}..." if len(response.text) > 500 else f"Response: {response.text}")

        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

# Test 4: Add contact to list
def test_add_contact_to_list(list_id=None):
    if not list_id:
        print("\n=== Test 4: Add Contact to List (SKIPPED - No list ID provided) ===")
        return False

    print(f"\n=== Test 4: Add Contact to List (ID: {list_id}) ===")
    url = f"{base_url}/contacts"

    # Generate a unique email to avoid conflicts
    timestamp = int(time.time())
    email = f"test{timestamp}@example.com"

    data = {
        "email": email,
        "first_name": "Test",
        "last_name": "User",
        "lists": [list_id]
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {AUTH_TOKEN}",
        "Accept": "application/json"
    }

    try:
        print(f"Sending POST request to {url}...")
        print(f"Data: {json.dumps(data)}")

        response = requests.post(url, json=data, headers=headers)

        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text[:500]}..." if len(response.text) > 500 else f"Response: {response.text}")

        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

# Run the tests
print("\nStarting tests...")
test1_result = test_user_info()
test2_result = test_get_lists()
test3_result = test_add_contact()

# Get list ID from test 2 if available
list_id = None
try:
    url = f"{base_url}/lists"
    headers = {
        "Authorization": f"Bearer {AUTH_TOKEN}",
        "Accept": "application/json"
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        # Check if data is a dictionary with a 'data' key (pagination format)
        if isinstance(data, dict) and 'data' in data and isinstance(data['data'], list) and len(data['data']) > 0:
            list_id = data['data'][0].get('id')
            print(f"Found list ID from paginated response: {list_id}")
        # Check if data is a list (direct format)
        elif isinstance(data, list) and len(data) > 0:
            list_id = data[0].get('id')
            print(f"Found list ID from direct response: {list_id}")
except Exception as e:
    print(f"Error getting list ID: {str(e)}")

test4_result = test_add_contact_to_list(list_id)

# Print summary
print("\n=== Test Results Summary ===")
print(f"Test 1 (Get User Info): {'PASSED' if test1_result else 'FAILED'}")
print(f"Test 2 (Get Lists): {'PASSED' if test2_result else 'FAILED'}")
print(f"Test 3 (Add Contact): {'PASSED' if test3_result else 'FAILED'}")
print(f"Test 4 (Add Contact to List): {'PASSED' if test4_result else 'FAILED'}")

print("\nDone.")
