# Rewards System Integration

This document outlines the integration of the BLKOUT community rewards system, which uses webhooks and n8n workflows to automate point awarding and achievement tracking.

## Architecture Overview

The rewards system consists of several interconnected components:

```
┌───────────────────┐       ┌───────────────────┐       ┌───────────────────┐
│                   │       │                   │       │                   │
│  React Dashboard  │◄─────►│  Rewards Service  │◄─────►│  Airtable Database│
│                   │       │                   │       │                   │
└─────────┬─────────┘       └─────────┬─────────┘       └───────────────────┘
          │                           │
          │                           │
          ▼                           ▼
┌───────────────────┐       ┌───────────────────┐       ┌───────────────────┐
│                   │       │                   │       │                   │
│   Webhook Client  │──────►│   n8n Workflow    │──────►│     Sendgrid      │
│                   │       │                   │       │                   │
└───────────────────┘       └───────────────────┘       └───────────────────┘
```

## Components

### 1. Rewards Service (`src/services/rewards.ts`)

Core service that handles:
- Fetching and updating reward data from Airtable
- Managing user points and achievements
- Providing methods for interacting with the rewards system

### 2. React Hook (`src/hooks/useRewards.ts`)

React hook that provides components with access to:
- User rewards data
- Available actions and achievements
- Methods for awarding points and tracking achievements

### 3. Webhook Integration (`src/integrations/webhooks/rewardsWebhooks.ts`)

Handles communication between the dashboard and n8n, allowing:
- Triggering reward actions from the UI
- Processing automated rewards from external events
- Securely validating webhook requests

### 4. n8n Workflow (`n8n/workflows/rewards-workflow.json`)

Automates the rewards process:
- Validates incoming webhooks
- Processes reward actions
- Updates user points and levels
- Checks for achievement unlocks
- Sends notifications for level-ups and achievements

## Database Schema

The rewards system uses the following Airtable tables:

### RewardActions Table
| Field            | Type             | Description                            |
|------------------|------------------|----------------------------------------|
| id               | Text             | Unique identifier                      |
| Name             | Text             | Action name                            |
| Description      | Text             | Action description                     |
| PointValue       | Number           | Points awarded                         |
| Category         | Single Select    | Action category                        |
| IsEnabled        | Boolean          | Whether action is active               |
| RequiresApproval | Boolean          | Whether action needs manual approval   |
| MaxOccurrences   | Number           | Maximum times a user can perform       |
| CooldownPeriod   | Number           | Hours between repeated actions         |

### Achievements Table
| Field           | Type             | Description                            |
|-----------------|------------------|----------------------------------------|
| id              | Text             | Unique identifier                      |
| Name            | Text             | Achievement name                       |
| Description     | Text             | Achievement description                |
| Criteria        | Text             | How to earn the achievement            |
| BadgeImageUrl   | URL              | Badge image                            |
| PointThreshold  | Number           | Points needed to unlock                |
| IsHidden        | Boolean          | Whether to show before unlocking       |
| Tier            | Single Select    | Achievement tier                       |
| Category        | Single Select    | Achievement category                   |

### UserRewards Table
| Field            | Type             | Description                            |
|------------------|------------------|----------------------------------------|
| UserId           | Text             | User identifier                        |
| UserName         | Text             | User display name                      |
| CurrentPoints    | Number           | Current point balance                  |
| LifetimePoints   | Number           | Total points earned                    |
| Level            | Number           | User level                             |
| Achievements     | JSON             | Unlocked achievements                  |
| RecentActions    | JSON             | Recent reward actions                  |

### PendingRewards Table
| Field            | Type             | Description                            |
|------------------|------------------|----------------------------------------|
| UserId           | Text             | User identifier                        |
| ActionId         | Text             | Action identifier                      |
| ActionName       | Text             | Action name                            |
| PointValue       | Number           | Points to award                        |
| Notes            | Text             | Additional context                     |
| Metadata         | JSON             | Extra information                      |
| Timestamp        | DateTime         | When action was performed              |
| Status           | Single Select    | Approval status                        |

## Setting Up the Integration

### Prerequisites

1. Airtable account with base set up according to schema
2. n8n instance (can be run locally or deployed)
3. SendGrid account for email notifications (optional)

### Setup Steps

1. **Configure Environment Variables**:
   
   Add the following to your `.env` file:
   ```
   VITE_REWARDS_WEBHOOK_SECRET=your-webhook-secret
   VITE_N8N_ENDPOINT=your-n8n-endpoint
   ```

2. **Import n8n Workflow**:

   - Go to your n8n dashboard
   - Click "Import from File"
   - Select `n8n/workflows/rewards-workflow.json`
   - Update credential placeholders with your actual credentials

3. **Set Up Airtable Base**:

   - Create tables according to the schema
   - Create initial reward actions
   - Set up achievements

## Using the Rewards System

### Manually Awarding Points

```typescript
import { useRewards } from '../hooks/useRewards';

const { awardPoints } = useRewards();

// Award points for completing a tutorial
await awardPoints('action_tutorial_complete', 'User completed introduction tutorial');
```

### Automatic Rewards via Webhooks

```typescript
import { triggerEventAttendanceReward } from '../integrations/webhooks/rewardsWebhooks';

// When a user attends an event
await triggerEventAttendanceReward(
  'user123',
  'event456',
  'Community Networking Event'
);
```

## Common Reward Actions

The system comes pre-configured with these reward actions:

| Action ID                   | Points | Description                        |
|-----------------------------|--------|------------------------------------|
| action_event_attendance     | 25     | Attending a community event        |
| action_content_creation     | 50     | Creating content for the community |
| action_feedback_submission  | 15     | Submitting feedback                |
| action_profile_completion   | 10     | Completing profile information     |
| action_referral             | 100    | Referring a new community member   |

## Achievement Examples

| Achievement         | Criteria                       | Points Required |
|---------------------|--------------------------------|----------------|
| Community Newcomer  | Join the community             | 0              |
| Event Enthusiast    | Attend 5 events                | 125            |
| Content Creator     | Create 3 pieces of content     | 150            |
| Community Champion  | Earn 1000 lifetime points      | 1000           |
| Referral Master     | Refer 5 new members            | 500            |

## Troubleshooting

### Webhook Not Working
- Verify the webhook secret key matches in both the app and n8n
- Check n8n logs for any validation errors
- Ensure the n8n endpoint is accessible from the app

### Points Not Being Awarded
- Check if the reward action exists and is enabled
- Verify the user exists in the UserRewards table
- Check for cooldown or max occurrence restrictions

### Achievements Not Unlocking
- Verify the achievement point threshold is set correctly
- Check if the user has enough lifetime points
- Ensure the achievement is properly configured in Airtable