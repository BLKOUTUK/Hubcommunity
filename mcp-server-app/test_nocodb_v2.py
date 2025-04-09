import requests
import os
from dotenv import load_dotenv
from pathlib import Path
import json

print("Testing NocoDB v2 API...")

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent / "mcp-server" / "config" / ".env"
print(f"Looking for .env file at: {env_path}")
print(f"File exists: {env_path.exists()}")
load_dotenv(dotenv_path=env_path)

# NocoDB API configuration
NOCODB_API_URL = os.getenv("NOCODB_API_URL")
NOCODB_API_TOKEN = os.getenv("NOCODB_API_TOKEN")
NOCODB_API_URL_COMMUNITYMEMBERS = os.getenv("NOCODB_API_URL_COMMUNITYMEMBERS")

print(f"NOCODB_API_URL: {NOCODB_API_URL}")
print(f"NOCODB_API_TOKEN: {NOCODB_API_TOKEN[:10]}..." if NOCODB_API_TOKEN else "NOCODB_API_TOKEN: None")
print(f"NOCODB_API_URL_COMMUNITYMEMBERS: {NOCODB_API_URL_COMMUNITYMEMBERS}")

# Test 1: Get base info
def test_base_info():
    print("\n=== Test 1: Get Base Info ===")
    url = f"{NOCODB_API_URL}/bases"
    
    headers = {
        "xc-token": NOCODB_API_TOKEN,
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

# Test 2: Get community members
def test_get_community_members():
    print("\n=== Test 2: Get Community Members ===")
    url = NOCODB_API_URL_COMMUNITYMEMBERS
    
    headers = {
        "xc-token": NOCODB_API_TOKEN,
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

# Test 3: Try alternative URL format
def test_alternative_url():
    print("\n=== Test 3: Try Alternative URL Format ===")
    # Try the format: /api/v2/db/data/noco/{base_id}/{table_name}
    base_id = os.getenv("NOCODB_BASE_ID")
    url = f"{NOCODB_API_URL.replace('/api/v2', '')}/api/v2/db/data/noco/{base_id}/CommunityMembers"
    
    headers = {
        "xc-token": NOCODB_API_TOKEN,
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

# Run the tests
print("\nStarting tests...")
test1_result = test_base_info()
test2_result = test_get_community_members()
test3_result = test_alternative_url()

# Print summary
print("\n=== Test Results Summary ===")
print(f"Test 1 (Get Base Info): {'PASSED' if test1_result else 'FAILED'}")
print(f"Test 2 (Get Community Members): {'PASSED' if test2_result else 'FAILED'}")
print(f"Test 3 (Alternative URL Format): {'PASSED' if test3_result else 'FAILED'}")

print("\nDone.")
