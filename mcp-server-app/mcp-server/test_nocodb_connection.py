import requests
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent / "config" / ".env"
load_dotenv(dotenv_path=env_path)

# NocoDB API configuration
NOCODB_API_URL = os.getenv("NOCODB_API_URL", "https://app.nocodb.com/api/v2")
NOCODB_API_TOKEN = os.getenv("NOCODB_API_TOKEN")
NOCODB_PROJECT_ID = os.getenv("NOCODB_PROJECT_ID")

# Table-specific URLs
NOCODB_API_URL_COMMUNITYMEMBERS = os.getenv("NOCODB_API_URL_COMMUNITYMEMBERS")
NOCODB_API_URL_USERACTIVITIES = os.getenv("NOCODB_API_URL_USERACTIVITIES")
NOCODB_API_URL_USERREWARDS = os.getenv("NOCODB_API_URL_USERREWARDS")

# Headers for API requests - NocoDB API uses 'xc-token' for authentication
headers = {
    "xc-token": NOCODB_API_TOKEN,
    "Content-Type": "application/json"
}

def test_connection(table_name, url):
    """Test connection to a NocoDB table"""
    print(f"\nTesting connection to {table_name} table...")
    print(f"URL: {url}")

    try:
        response = requests.get(url, headers=headers)
        print(f"Status code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"Success! Retrieved {len(data)} records.")
                if len(data) > 0:
                    print(f"First record: {data[0]}")
            elif isinstance(data, dict) and "list" in data:
                print(f"Success! Retrieved {len(data['list'])} records.")
                if len(data['list']) > 0:
                    print(f"First record: {data['list'][0]}")
            else:
                print(f"Success! Response: {data}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {str(e)}")

# Test CommunityMembers table
if NOCODB_API_URL_COMMUNITYMEMBERS:
    test_connection("CommunityMembers", NOCODB_API_URL_COMMUNITYMEMBERS)
else:
    print("\nNo URL found for CommunityMembers table.")

# Test UserActivities table
if NOCODB_API_URL_USERACTIVITIES:
    test_connection("UserActivities", NOCODB_API_URL_USERACTIVITIES)
else:
    print("\nNo URL found for UserActivities table.")

# Test UserRewards table
if NOCODB_API_URL_USERREWARDS:
    test_connection("UserRewards", NOCODB_API_URL_USERREWARDS)
else:
    print("\nNo URL found for UserRewards table.")

# Test Campaign_Phases table using constructed URL for v2 API
campaign_phases_url = f"{NOCODB_API_URL}/tables/Campaign_Phases/records"
test_connection("Campaign_Phases", campaign_phases_url)

print("\nConnection tests completed.")
