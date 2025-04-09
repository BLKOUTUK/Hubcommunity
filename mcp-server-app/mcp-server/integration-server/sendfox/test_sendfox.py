import httpx
import json
import os
import asyncio
from pathlib import Path
import sys

# Add the parent directory to the path so we can import from config
parent_dir = str(Path(__file__).resolve().parents[3])
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

# Load environment variables from .env file
from dotenv import load_dotenv
env_path = Path(__file__).resolve().parents[2] / "config" / ".env"
load_dotenv(dotenv_path=env_path)

# Configuration
SENDFOX_API_KEY = os.getenv("SENDFOX_API_KEY", "your_api_key_here")
SENDFOX_API_URL = "https://api.sendfox.com/v1"

async def test_list_email_lists():
    """Test the list_email_lists function"""
    print("Testing list_email_lists...")
    
    if SENDFOX_API_KEY == "your_api_key_here":
        print("Error: Sendfox API key not configured. Please set the SENDFOX_API_KEY environment variable.")
        return
    
    headers = {
        "Authorization": f"Bearer {SENDFOX_API_KEY}"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SENDFOX_API_URL}/lists", 
                headers=headers
            )
            response.raise_for_status()
            result = response.json()
            print(f"Success! Found {len(result.get('data', []))} lists.")
            print(json.dumps(result, indent=2))
            return result
        except Exception as e:
            print(f"Error listing email lists: {str(e)}")
            return None

async def test_create_contact():
    """Test creating a contact in Sendfox"""
    print("\nTesting create_contact...")
    
    if SENDFOX_API_KEY == "your_api_key_here":
        print("Error: Sendfox API key not configured. Please set the SENDFOX_API_KEY environment variable.")
        return
    
    headers = {
        "Authorization": f"Bearer {SENDFOX_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Test data
    contact_data = {
        "email": "test@example.com",
        "first_name": "Test",
        "last_name": "User"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SENDFOX_API_URL}/contacts", 
                headers=headers,
                json=contact_data
            )
            
            # Note: 422 might mean the contact already exists, which is fine for testing
            if response.status_code == 422:
                print("Contact already exists (422 error). This is expected for testing.")
                return True
            
            response.raise_for_status()
            result = response.json()
            print("Success! Contact created.")
            print(json.dumps(result, indent=2))
            return result
        except Exception as e:
            print(f"Error creating contact: {str(e)}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response: {e.response.text}")
            return None

async def main():
    """Run all tests"""
    print("Testing SendFox API integration...")
    print(f"API Key: {SENDFOX_API_KEY[:5]}..." if SENDFOX_API_KEY != "your_api_key_here" else "API Key not set")
    
    # Test listing email lists
    lists = await test_list_email_lists()
    
    # Test creating a contact
    await test_create_contact()
    
    print("\nTests completed.")

if __name__ == "__main__":
    asyncio.run(main())
