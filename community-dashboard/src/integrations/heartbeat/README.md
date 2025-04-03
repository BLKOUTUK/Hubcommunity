# BLKOUTHUB Integration for Community Dashboard

This integration connects the Community Dashboard with BLKOUTHUB.com through the Heartbeat.chat API, enabling synchronization of member rewards, points, and activities between platforms.

## Features

- Display BLKOUTHUB member rewards and achievements in the Engagement Tracking dashboard
- Sync member engagement metrics between the Community Dashboard and BLKOUTHUB
- Award points for activities across both platforms
- Receive real-time updates via webhooks from BLKOUTHUB

## Setup

1. Add the required environment variables to your `.env` file:

```
# Heartbeat Configuration
VITE_HEARTBEAT_API_KEY=your-heartbeat-api-key
VITE_HEARTBEAT_API_URL=https://api.heartbeat.chat/v1
VITE_HEARTBEAT_WEBHOOK_SECRET=your-webhook-secret
```

2. Obtain API credentials from Heartbeat.chat:
   - Register your application at https://heartbeat.readme.io
   - Create an API key with the necessary permissions
   - Set up webhook endpoints and obtain a webhook secret

## Usage

### Checking if BLKOUTHUB integration is enabled

```typescript
import { isBlkoutHubEnabled } from '../integrations/heartbeat';

if (isBlkoutHubEnabled()) {
  // Show BLKOUTHUB integration features
}
```

### Getting a user's rewards from BLKOUTHUB

```typescript
import { getBlkoutHubRewards } from '../integrations/heartbeat';

async function fetchUserRewards(userId: string) {
  try {
    const rewards = await getBlkoutHubRewards(userId);
    // Use rewards data
  } catch (error) {
    console.error('Failed to fetch BLKOUTHUB rewards:', error);
  }
}
```

### Syncing rewards between platforms

```typescript
import { syncRewardsWithBlkoutHub } from '../integrations/heartbeat';

async function syncUserRewards(userId: string, points: number, level: string) {
  try {
    await syncRewardsWithBlkoutHub(userId, points, level);
    // Rewards synced successfully
  } catch (error) {
    console.error('Failed to sync rewards with BLKOUTHUB:', error);
  }
}
```

### Awarding points for activities

```typescript
import { awardPointsAndSync } from '../integrations/heartbeat';

async function awardPointsForActivity(userId: string, activity: string) {
  try {
    await awardPointsAndSync(
      userId,
      15, // Points to award
      `Completed ${activity}`,
      { activityType: activity, timestamp: new Date().toISOString() }
    );
    // Points awarded successfully
  } catch (error) {
    console.error('Failed to award points:', error);
  }
}
```

## Development Mode

In development mode, if no Heartbeat API key is provided, the integration will use a mock client that returns test data. This allows for development and testing without requiring a connection to the actual Heartbeat API.

To trigger the mock client, either:
1. Don't set the `VITE_HEARTBEAT_API_KEY` environment variable
2. Set it to the placeholder value: `VITE_HEARTBEAT_API_KEY=your-heartbeat-api-key`

## Webhook Handling

The integration includes webhook handlers for the following BLKOUTHUB events:
- USER_JOIN - When a user joins the BLKOUTHUB community
- EVENT_RSVP - When a user RSVPs to an event
- THREAD_CREATE - When a user creates a discussion thread
- COURSE_COMPLETED - When a user completes a course
- GROUP_JOIN - When a user joins a group

To register your webhook endpoints with Heartbeat.chat:

```typescript
import { registerWebhooks } from '../integrations/heartbeat/webhooks';

// Register webhooks with your callback URL
registerWebhooks('https://your-domain.com/api/webhooks/heartbeat');
```

## API Documentation

For more information on the Heartbeat API, visit:
- https://heartbeat.readme.io