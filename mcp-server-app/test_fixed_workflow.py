import requests
import json

print("Testing fixed workflow webhook...")

# URL for the webhook
url = "http://localhost:5678/webhook/nocodb-sendfox-webhook"

# Test payload (empty, as the workflow will fetch data from NocoDB)
payload = {}

# Headers
headers = {
    "Content-Type": "application/json"
}

try:
    print(f"Sending request to {url}...")
    print(f"Payload: {json.dumps(payload)}")
    
    # Send the request
    response = requests.post(url, json=payload, headers=headers)
    
    # Print the response
    print(f"Status code: {response.status_code}")
    print(f"Response: {response.text}")
    
except Exception as e:
    print(f"Error: {str(e)}")

print("Done.")
