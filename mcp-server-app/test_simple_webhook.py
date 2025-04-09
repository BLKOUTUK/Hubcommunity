import requests
import json

print("Testing simple webhook...")

# URL for the webhook
# Note: n8n uses different URL formats for test and production webhooks
# Test URL format: http://localhost:5678/webhook-test/...
# Production URL format: http://localhost:5678/webhook/...

# Try with IP address instead of localhost
url = "http://127.0.0.1:5678/webhook/test-webhook"

# Test payload
payload = {
    "test": "Hello, webhook!"
}

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
