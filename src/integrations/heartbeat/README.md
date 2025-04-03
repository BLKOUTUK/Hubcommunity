# BLKOUTHUB Integration via Heartbeat.chat

This integration allows the BLKOUTNXT platform to connect with BLKOUTHUB.com through the Heartbeat.chat API. It enables syncing of member rewards, points, and activities between platforms.

## Features

- Sync member rewards and points between BLKOUTNXT and BLKOUTHUB
- Display BLKOUTHUB badges and achievements in the member rewards dashboard
- Track activities across both platforms in a unified view
- Award points for activities on either platform

## Setup

1. Add the required environment variables to your `.env` file:

```
VITE_HEARTBEAT_API_KEY=your_heartbeat_api_key
VITE_HEARTBEAT_API_URL=https://api.heartbeat.chat/v1
VITE_HEARTBEAT_COMMUNITY_ID=your_heartbeat_community_id
```

2. Obtain API credentials from Heartbeat.chat:
   - Register your application at https://heartbeat.readme.io
   - Create an API key with the necessary permissions
   - Note your community ID from the BLKOUTHUB dashboard

## Usage

### Checking if BLKOUTHUB integration is enabled

```typescript
import { isBlkoutHubEnabled } from '@/integrations/heartbeat';

if (isBlkoutHubEnabled()) {
  // Show BLKOUTHUB integration features
}
```

### Getting a user's rewards from BLKOUTHUB

```typescript
import { getBlkoutHubRewards } from '@/integrations/heartbeat';

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
import { syncRewardsWithBlkoutHub } from '@/integrations/heartbeat';

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
import { awardPointsAndSync } from '@/integrations/heartbeat';

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

## API Documentation

For more information on the Heartbeat API, visit:
- https://heartbeat.readme.io

## Troubleshooting

If you encounter issues with the integration:

1. Check that your API key and community ID are correct
2. Ensure the user IDs match between platforms
3. Check the browser console for error messages
4. Verify network requests in the browser's developer tools

For more assistance, contact the BLKOUTHUB support team.