# n8n Workflows for BLKOUTNXT

This directory contains n8n workflow definitions for automating various processes in the BLKOUTNXT platform.

## Available Workflows

### 1. Heartbeat Rewards Integration (`heartbeat-rewards.json`)

This workflow handles webhook events from Heartbeat.chat and awards points to users based on their activities in the BLKOUTHUB community.

#### Setup Instructions

1. Import the workflow into your n8n instance:
   - Go to Workflows > Import from File
   - Select the `heartbeat-rewards.json` file
   - Click Import

2. Configure the required environment variables in n8n:
   - `VITE_API_URL`: The URL of your API (e.g., `http://localhost:3000/api`)
   - `API_TOKEN`: Authentication token for your API
   - `VITE_HEARTBEAT_API_URL`: The Heartbeat API URL (e.g., `https://api.heartbeat.chat/v1`)

3. Set up the Heartbeat API credentials:
   - Go to Settings > Credentials
   - Create a new "HTTP Header Auth" credential
   - Name it "Heartbeat API"
   - Set the header name to "Authorization"
   - Set the header value to "Bearer YOUR_HEARTBEAT_API_KEY"

4. Activate the workflow:
   - Click the "Activate" toggle in the top-right corner of the workflow editor

5. Get the webhook URL:
   - Click on the Webhook node
   - Copy the "Webhook URL" (e.g., `https://your-n8n-instance.com/webhook/heartbeat-webhook`)

6. Register the webhook URL with Heartbeat:
   - Go to the Heartbeat dashboard
   - Navigate to Settings > Integrations > Webhooks
   - Add a new webhook with the URL you copied
   - Select the events you want to receive (USER_JOIN, EVENT_RSVP, THREAD_CREATE, etc.)

#### How It Works

1. The workflow receives webhook events from Heartbeat via the Webhook node
2. It validates the event and extracts the relevant information
3. Based on the event type, it awards points to the user
4. It calls your API to record the points and update the user's rewards
5. It also fetches the user's current rewards from Heartbeat for synchronization

#### Point Values

The workflow awards points for the following activities:

| Event Type | Description | Points |
|------------|-------------|--------|
| USER_JOIN | New user joins the community | 50 |
| EVENT_RSVP | User RSVPs to an event | 10 |
| THREAD_CREATE | User creates a new discussion thread | 15 |
| MENTION | User mentions someone | 5 |
| COURSE_COMPLETED | User completes a course | 30 |
| GROUP_JOIN | User joins a group | 10 |

You can adjust these point values in the "Process Event" Function node.

### 2. Eventbrite Scraper (`eventbrite-scraper.json`)

This workflow scrapes event data from Eventbrite and imports it into the platform.

### 3. Form Handling (`form-handling.json`)

This workflow processes form submissions from the platform.

## Troubleshooting

If you encounter issues with the workflows:

1. Check the execution logs in n8n
2. Verify that all environment variables and credentials are correctly set
3. Ensure that the Heartbeat webhook is properly registered
4. Check that your API endpoints are accessible from the n8n instance

## Additional Resources

- [n8n Documentation](https://docs.n8n.io/)
- [Heartbeat API Documentation](https://heartbeat.readme.io/)