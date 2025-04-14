# BLKOUTHUB Rewards System API Documentation

## Overview

The BLKOUTHUB Rewards System API provides endpoints for managing the rewards and gamification system, including member management, rewards, events, and notifications.

## Base URL

```
http://localhost:5002
```

## Authentication

Currently, the API does not require authentication. In a production environment, authentication should be implemented.

## Response Format

All API responses are in JSON format and include a `success` field indicating whether the operation was successful. If the operation fails, a `message` field provides details about the error.

Example success response:

```json
{
  "success": true,
  "data": { ... }
}
```

Example error response:

```json
{
  "success": false,
  "message": "Error message"
}
```

## Endpoints

### Member Management

#### Get All Members

```
GET /api/members
```

Returns a list of all members.

**Response:**

```json
{
  "success": true,
  "members": [
    {
      "id": "member_id",
      "name": "Member Name",
      "email": "member@example.com",
      "member_type": "Ally",
      "created_at": "2025-01-01T00:00:00"
    },
    ...
  ]
}
```

#### Get Member

```
GET /api/members/{member_id}
```

Returns details for a specific member.

**Parameters:**

- `member_id` (path): ID of the member to retrieve

**Response:**

```json
{
  "success": true,
  "member": {
    "id": "member_id",
    "name": "Member Name",
    "email": "member@example.com",
    "member_type": "Ally",
    "created_at": "2025-01-01T00:00:00"
  }
}
```

#### Add Member

```
POST /api/members
```

Adds a new member.

**Request Body:**

```json
{
  "name": "New Member",
  "email": "newmember@example.com",
  "member_type": "Ally"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Member added successfully",
  "member_id": "new_member_id"
}
```

#### Update Member

```
PUT /api/members/{member_id}
```

Updates an existing member.

**Parameters:**

- `member_id` (path): ID of the member to update

**Request Body:**

```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "member_type": "Organiser"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Member updated successfully"
}
```

#### Delete Member

```
DELETE /api/members/{member_id}
```

Deletes a member.

**Parameters:**

- `member_id` (path): ID of the member to delete

**Response:**

```json
{
  "success": true,
  "message": "Member deleted successfully"
}
```

### Rewards Management

#### Get User Rewards

```
GET /api/rewards/user/{member_id}
```

Returns the rewards profile for a specific member.

**Parameters:**

- `member_id` (path): ID of the member

**Response:**

```json
{
  "success": true,
  "rewards": {
    "member_id": "member_id",
    "level": 2,
    "current_points": 150,
    "lifetime_points": 200,
    "achievements": [
      {
        "id": "achievement_id",
        "name": "Achievement Name",
        "description": "Achievement Description",
        "earned_at": "2025-01-01T00:00:00"
      },
      ...
    ],
    "point_history": [
      {
        "action_id": "action_id",
        "description": "Action Description",
        "points": 50,
        "timestamp": "2025-01-01T00:00:00"
      },
      ...
    ],
    "completed_challenges": [
      {
        "id": "challenge_id",
        "name": "Challenge Name",
        "description": "Challenge Description",
        "completed_at": "2025-01-01T00:00:00",
        "points_awarded": 100
      },
      ...
    ]
  }
}
```

#### Award Points

```
POST /api/rewards/user/{member_id}/award-points
```

Awards points to a member for a specific action.

**Parameters:**

- `member_id` (path): ID of the member

**Request Body:**

```json
{
  "action_id": "complete_survey",
  "description": "Completed feedback survey",
  "override_points": 50  // Optional, overrides the default points for the action
}
```

**Response:**

```json
{
  "success": true,
  "message": "Points awarded successfully",
  "points_awarded": 50,
  "current_points": 200,
  "lifetime_points": 250
}
```

#### Check Achievements

```
POST /api/rewards/user/{member_id}/check-achievements
```

Checks if a member has earned any new achievements.

**Parameters:**

- `member_id` (path): ID of the member

**Response:**

```json
{
  "success": true,
  "message": "Achievements checked successfully",
  "new_achievements": [
    {
      "id": "achievement_id",
      "name": "Achievement Name",
      "description": "Achievement Description",
      "bonus_points": 50
    },
    ...
  ]
}
```

#### Get Reward Actions

```
GET /api/reward-actions
```

Returns a list of all reward actions.

**Response:**

```json
{
  "success": true,
  "actions": [
    {
      "id": "action_id",
      "name": "Action Name",
      "description": "Action Description",
      "points": 50,
      "category": "Category",
      "one_time": false
    },
    ...
  ]
}
```

#### Get Achievements

```
GET /api/achievements
```

Returns a list of all achievements.

**Response:**

```json
{
  "success": true,
  "achievements": [
    {
      "id": "achievement_id",
      "name": "Achievement Name",
      "description": "Achievement Description",
      "bonus_points": 50,
      "requirements": [
        {
          "type": "action",
          "action_id": "action_id",
          "count": 5
        },
        ...
      ]
    },
    ...
  ]
}
```

### Access Levels and Content

#### Get Access Levels

```
GET /api/access-levels
```

Returns a list of all access levels.

**Response:**

```json
{
  "success": true,
  "access_levels": [
    {
      "id": "access_level_id",
      "name": "Access Level Name",
      "description": "Access Level Description",
      "min_level": 2,
      "features": [
        "Feature 1",
        "Feature 2",
        ...
      ]
    },
    ...
  ]
}
```

#### Get User Access Level

```
GET /api/access-levels/user/{member_id}
```

Returns the access level for a specific member.

**Parameters:**

- `member_id` (path): ID of the member

**Response:**

```json
{
  "success": true,
  "access_level": {
    "id": "access_level_id",
    "name": "Access Level Name",
    "description": "Access Level Description",
    "min_level": 2,
    "features": [
      "Feature 1",
      "Feature 2",
      ...
    ]
  }
}
```

#### Get Exclusive Content

```
GET /api/exclusive-content
```

Returns a list of all exclusive content.

**Response:**

```json
{
  "success": true,
  "content": [
    {
      "id": "content_id",
      "name": "Content Name",
      "description": "Content Description",
      "content_type": "Content Type",
      "required_level": 2,
      "access_level": "access_level_id",
      "url": "https://example.com/content"
    },
    ...
  ]
}
```

#### Check Content Access

```
GET /api/members/{member_id}/content-access/{content_id}
```

Checks if a member has access to specific content.

**Parameters:**

- `member_id` (path): ID of the member
- `content_id` (path): ID of the content

**Response:**

```json
{
  "success": true,
  "has_access": true,
  "content": {
    "id": "content_id",
    "name": "Content Name",
    "description": "Content Description",
    "content_type": "Content Type",
    "required_level": 2,
    "access_level": "access_level_id",
    "url": "https://example.com/content"
  }
}
```

#### Get Available Content

```
GET /api/members/{member_id}/available-content
```

Returns a list of all content available to a member.

**Parameters:**

- `member_id` (path): ID of the member

**Response:**

```json
{
  "success": true,
  "content": [
    {
      "id": "content_id",
      "name": "Content Name",
      "description": "Content Description",
      "content_type": "Content Type",
      "required_level": 2,
      "access_level": "access_level_id",
      "url": "https://example.com/content"
    },
    ...
  ]
}
```

### Community Challenges

#### Get Challenges

```
GET /api/challenges
```

Returns a list of all community challenges.

**Response:**

```json
{
  "success": true,
  "challenges": [
    {
      "id": "challenge_id",
      "name": "Challenge Name",
      "description": "Challenge Description",
      "points": 100,
      "requirements": [
        {
          "type": "action",
          "action_id": "action_id",
          "count": 5
        },
        ...
      ],
      "status": "active"
    },
    ...
  ]
}
```

#### Get User Challenges

```
GET /api/members/{member_id}/challenges
```

Returns a list of all challenges and the user's progress.

**Parameters:**

- `member_id` (path): ID of the member

**Response:**

```json
{
  "success": true,
  "challenges": [
    {
      "challenge": {
        "id": "challenge_id",
        "name": "Challenge Name",
        "description": "Challenge Description",
        "points": 100,
        "requirements": [
          {
            "type": "action",
            "action_id": "action_id",
            "count": 5
          },
          ...
        ],
        "status": "active"
      },
      "progress": 0.6,
      "completed": false
    },
    ...
  ]
}
```

#### Get Challenge Progress

```
GET /api/members/{member_id}/challenges/{challenge_id}/progress
```

Returns a member's progress on a specific challenge.

**Parameters:**

- `member_id` (path): ID of the member
- `challenge_id` (path): ID of the challenge

**Response:**

```json
{
  "success": true,
  "challenge": {
    "id": "challenge_id",
    "name": "Challenge Name",
    "description": "Challenge Description",
    "points": 100,
    "requirements": [
      {
        "type": "action",
        "action_id": "action_id",
        "count": 5
      },
      ...
    ],
    "status": "active"
  },
  "progress": 0.6,
  "completed": false
}
```

#### Complete Challenge

```
POST /api/members/{member_id}/challenges/{challenge_id}/complete
```

Completes a challenge for a member.

**Parameters:**

- `member_id` (path): ID of the member
- `challenge_id` (path): ID of the challenge

**Response:**

```json
{
  "success": true,
  "message": "Challenge completed successfully",
  "points_awarded": 100
}
```

### Event Management

#### Get Events

```
GET /api/events
```

Returns a list of all events.

**Response:**

```json
{
  "success": true,
  "events": [
    {
      "id": "event_id",
      "name": "Event Name",
      "description": "Event Description",
      "event_date": "2025-01-01T18:00:00",
      "location": "Event Location",
      "event_type": "Workshop",
      "max_attendees": 50,
      "registration_url": "https://example.com/register"
    },
    ...
  ]
}
```

#### Get Event

```
GET /api/events/{event_id}
```

Returns details for a specific event.

**Parameters:**

- `event_id` (path): ID of the event

**Response:**

```json
{
  "success": true,
  "event": {
    "id": "event_id",
    "name": "Event Name",
    "description": "Event Description",
    "event_date": "2025-01-01T18:00:00",
    "location": "Event Location",
    "event_type": "Workshop",
    "max_attendees": 50,
    "registration_url": "https://example.com/register"
  }
}
```

#### Create Event

```
POST /api/events
```

Creates a new event.

**Request Body:**

```json
{
  "name": "New Event",
  "description": "New Event Description",
  "event_date": "2025-01-01T18:00:00",
  "location": "Event Location",
  "event_type": "Workshop",
  "max_attendees": 50,
  "registration_url": "https://example.com/register"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Event created successfully",
  "event_id": "new_event_id"
}
```

#### Update Event

```
PUT /api/events/{event_id}
```

Updates an existing event.

**Parameters:**

- `event_id` (path): ID of the event to update

**Request Body:**

```json
{
  "name": "Updated Event",
  "description": "Updated Event Description",
  "event_date": "2025-02-01T19:00:00",
  "location": "Updated Location",
  "event_type": "Seminar",
  "max_attendees": 100,
  "registration_url": "https://example.com/updated"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Event updated successfully"
}
```

#### Delete Event

```
DELETE /api/events/{event_id}
```

Deletes an event.

**Parameters:**

- `event_id` (path): ID of the event to delete

**Response:**

```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

#### Get Event Attendees

```
GET /api/events/{event_id}/attendees
```

Returns a list of attendees for a specific event.

**Parameters:**

- `event_id` (path): ID of the event

**Response:**

```json
{
  "success": true,
  "attendees": [
    {
      "member_id": "member_id",
      "name": "Member Name",
      "email": "member@example.com",
      "member_type": "Ally",
      "check_in_time": "2025-01-01T18:30:00",
      "check_in_method": "qr_code",
      "notes": "Notes"
    },
    ...
  ]
}
```

#### Record Attendance

```
POST /api/events/{event_id}/attendance
```

Records attendance for a member at an event.

**Parameters:**

- `event_id` (path): ID of the event

**Request Body:**

```json
{
  "member_id": "member_id",
  "check_in_method": "manual",
  "notes": "Notes"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Attendance recorded successfully",
  "points_awarded": 50
}
```

#### Generate QR Code

```
GET /api/events/{event_id}/qr-code
```

Generates a QR code for event check-in.

**Parameters:**

- `event_id` (path): ID of the event

**Response:**

```json
{
  "success": true,
  "check_in_url": "https://example.com/check-in?event=event_id",
  "qr_code_data": "base64_encoded_qr_code"
}
```

#### Generate Attendance Report

```
GET /api/events/{event_id}/attendance-report
```

Generates an attendance report for an event.

**Parameters:**

- `event_id` (path): ID of the event

**Response:**

```json
{
  "success": true,
  "event": {
    "id": "event_id",
    "name": "Event Name",
    "description": "Event Description",
    "event_date": "2025-01-01T18:00:00",
    "location": "Event Location",
    "event_type": "Workshop"
  },
  "total_attendees": 10,
  "attendees": [
    {
      "member_id": "member_id",
      "name": "Member Name",
      "email": "member@example.com",
      "member_type": "Ally",
      "check_in_time": "2025-01-01T18:30:00",
      "check_in_method": "qr_code"
    },
    ...
  ]
}
```

### Notification System

#### Get Notifications

```
GET /api/notifications
```

Returns a list of all notifications, optionally filtered by member ID, type, and read status.

**Query Parameters:**

- `member_id` (optional): Filter by member ID
- `type` (optional): Filter by notification type
- `limit` (optional): Maximum number of notifications to return (default: 50)
- `offset` (optional): Offset for pagination (default: 0)
- `unread_only` (optional): Filter by unread status (default: false)

**Response:**

```json
{
  "success": true,
  "notifications": [
    {
      "id": "notification_id",
      "member_id": "member_id",
      "member_name": "Member Name",
      "member_email": "member@example.com",
      "type": "achievement",
      "title": "Achievement Unlocked",
      "message": "You've earned an achievement!",
      "data": {
        "achievement": {
          "id": "achievement_id",
          "name": "Achievement Name",
          "description": "Achievement Description"
        }
      },
      "created_at": "2025-01-01T00:00:00",
      "read": false
    },
    ...
  ],
  "total": 10,
  "limit": 50,
  "offset": 0
}
```

#### Create Notification

```
POST /api/notifications
```

Creates a new notification.

**Request Body:**

```json
{
  "member_id": "member_id",
  "type": "achievement",
  "title": "Achievement Unlocked",
  "message": "You've earned an achievement!",
  "data": {
    "achievement": {
      "id": "achievement_id",
      "name": "Achievement Name",
      "description": "Achievement Description"
    }
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Notification created successfully",
  "notification_id": "notification_id"
}
```

#### Mark Notification as Read

```
POST /api/notifications/{notification_id}/read
```

Marks a notification as read.

**Parameters:**

- `notification_id` (path): ID of the notification

**Response:**

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

#### Mark Notification as Unread

```
POST /api/notifications/{notification_id}/unread
```

Marks a notification as unread.

**Parameters:**

- `notification_id` (path): ID of the notification

**Response:**

```json
{
  "success": true,
  "message": "Notification marked as unread"
}
```

#### Mark All Notifications as Read

```
POST /api/members/{member_id}/notifications/read
```

Marks all notifications for a member as read.

**Parameters:**

- `member_id` (path): ID of the member

**Response:**

```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

#### Delete Notification

```
DELETE /api/notifications/{notification_id}
```

Deletes a notification.

**Parameters:**

- `notification_id` (path): ID of the notification

**Response:**

```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

#### Cleanup Old Notifications

```
POST /api/notifications/cleanup
```

Deletes notifications older than the specified number of days.

**Query Parameters:**

- `days` (optional): Number of days to keep (default: 30)

**Response:**

```json
{
  "success": true,
  "message": "Deleted X old notifications",
  "deleted_count": 5
}
```

### Webhook Management

#### Get Webhooks

```
GET /api/webhooks
```

Returns a list of all webhook configurations.

**Response:**

```json
{
  "success": true,
  "webhooks": [
    {
      "id": "webhook_id",
      "name": "Webhook Name",
      "url": "https://example.com/webhook",
      "events": ["achievement", "level_up"],
      "headers": {
        "Content-Type": "application/json",
        "X-API-Key": "api_key"
      },
      "enabled": true
    },
    ...
  ]
}
```

#### Add Webhook

```
POST /api/webhooks
```

Adds a new webhook configuration.

**Request Body:**

```json
{
  "name": "New Webhook",
  "url": "https://example.com/webhook",
  "events": ["achievement", "level_up", "challenge_completion"],
  "headers": {
    "Content-Type": "application/json",
    "X-API-Key": "api_key"
  },
  "enabled": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Webhook added successfully",
  "webhook_id": "webhook_id"
}
```

#### Update Webhook

```
PUT /api/webhooks/{webhook_id}
```

Updates an existing webhook configuration.

**Parameters:**

- `webhook_id` (path): ID of the webhook

**Request Body:**

```json
{
  "name": "Updated Webhook",
  "url": "https://example.com/updated",
  "events": ["achievement", "level_up", "challenge_completion", "access_level_change"],
  "headers": {
    "Content-Type": "application/json",
    "X-API-Key": "updated_key"
  },
  "enabled": false
}
```

**Response:**

```json
{
  "success": true,
  "message": "Webhook updated successfully"
}
```

#### Delete Webhook

```
DELETE /api/webhooks/{webhook_id}
```

Deletes a webhook configuration.

**Parameters:**

- `webhook_id` (path): ID of the webhook

**Response:**

```json
{
  "success": true,
  "message": "Webhook deleted successfully"
}
```

#### Test Webhook

```
POST /api/webhooks/{webhook_id}/test
```

Sends a test notification to a webhook.

**Parameters:**

- `webhook_id` (path): ID of the webhook

**Response:**

```json
{
  "success": true,
  "message": "Test webhook sent: 200",
  "status_code": 200,
  "response": "Response from webhook endpoint"
}
```

## Error Codes

- `400 Bad Request`: Invalid request parameters or body
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Webhook Payload Format

When a notification is sent to a webhook, the payload has the following format:

```json
{
  "notification_id": "notification_id",
  "type": "achievement",
  "member_id": "member_id",
  "member_name": "Member Name",
  "title": "Achievement Unlocked",
  "message": "You've earned an achievement!",
  "data": {
    "achievement": {
      "id": "achievement_id",
      "name": "Achievement Name",
      "description": "Achievement Description"
    }
  },
  "timestamp": "2025-01-01T00:00:00"
}
```

## Notification Types

- `achievement`: Achievement unlocked
- `level_up`: Level up
- `challenge_completion`: Challenge completed
- `access_level_change`: Access level changed
