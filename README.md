# BLKOUT NXT Onboarding System

A backend system for managing BLKOUT NXT community onboarding, including form integration, email campaigns, member management, and rewards/gamification.

## Overview

The BLKOUT NXT Onboarding System provides:

- Webhook integration with Tally forms
- Email drip campaigns for different user categories
- Survey follow-up management
- Member data storage and management
- Local JSON storage for member data
- Rewards and gamification system
- Heartbeat.chat integration for community engagement

## Project Structure

- `app.py` - Main Flask application with webhook endpoints
- `member_manager.py` - Handles member data storage and retrieval
- `email_sender.py` - Manages email sending functionality
- `survey_handler.py` - Processes survey responses
- `rewards_manager.py` - Manages the rewards and gamification system
- `event_manager.py` - Manages events and attendance tracking
- `heartbeat_integration.py` - Integrates with Heartbeat.chat for community features
- `notification_manager.py` - Manages notifications and webhooks
- `rewards_api.py` - Standalone API for the rewards system, event management, and notifications
- `blkout_nxt_config.json` - Configuration for surveys, email campaigns, etc.
- `email_templates/` - HTML templates for emails
- `data/` - Directory for storing member data (created at runtime)

## Deployment

This application is deployed on Render. The webhook endpoint for form submissions is:

```
https://blkout-nxt-backend.onrender.com/webhook/blkout-nxt-signup
```

### Deployment Process

1. Push changes to the GitHub repository
2. Render will automatically deploy the changes
3. Monitor the deployment logs for any issues

For detailed deployment instructions, see the [Deployment Guide](deployment_guide.md).

### System Architecture

For a detailed overview of the system architecture, see the [System Architecture](system_architecture.md) document.

## Configuration

Update the `blkout_nxt_config.json` file to modify:

- Data storage settings
- Email addresses for notifications
- Survey links
- Drip campaign resource links

## Environment Variables

The following environment variables need to be set:

- `FLASK_ENV` - Environment (development/production)
- `SMTP_SERVER` - SMTP server for sending emails
- `SMTP_PORT` - SMTP port
- `SMTP_USERNAME` - SMTP username
- `SMTP_PASSWORD` - SMTP password
- `TALLY_SIGNING_SECRET` - Secret for verifying Tally webhooks
- `HEARTBEAT_API_URL` - URL for the Heartbeat.chat API
- `HEARTBEAT_API_KEY` - API key for Heartbeat.chat integration

## Repository Organization

The main application files are in the root directory. Legacy code and development files have been moved to the `archive` directory for reference.

## Rewards System

The BLKOUTHUB rewards system provides gamification features for community engagement:

- Point-based rewards for various actions (signup, survey completion, event attendance, etc.)
- Achievement badges for reaching milestones
- Level progression based on points earned
- Leaderboard for community engagement
- Integration with Heartbeat.chat for displaying rewards in user profiles
- Event attendance tracking and rewards
- Access levels based on user level (Bronze, Silver, Gold, Platinum)
- Exclusive content access control
- Community challenges with progress tracking

### Rewards and Events API

The system can be run as a standalone API using `rewards_api.py`. The API provides the following endpoints:

#### Rewards Endpoints

- `GET /api/rewards/user/{member_id}` - Get a user's rewards profile
- `GET /api/rewards/actions` - Get all reward actions
- `GET /api/rewards/achievements` - Get all achievements
- `GET /api/rewards/leaderboard` - Get the rewards leaderboard
- `POST /api/rewards/award` - Award points to a user

#### Event Management Endpoints

- `GET /api/events` - Get all events
- `GET /api/events?upcoming=true` - Get upcoming events
- `GET /api/events/{event_id}` - Get a specific event
- `POST /api/events` - Create a new event
- `PUT /api/events/{event_id}` - Update an event
- `DELETE /api/events/{event_id}` - Delete an event

#### Community Engagement Endpoints

- `GET /api/access-levels` - Get all access levels
- `GET /api/members/{member_id}/access-level` - Get a user's access level
- `GET /api/exclusive-content` - Get all exclusive content
- `GET /api/members/{member_id}/content-access/{content_id}` - Check if a user has access to specific content
- `GET /api/members/{member_id}/available-content` - Get all content available to a user
- `GET /api/challenges` - Get all community challenges
- `GET /api/members/{member_id}/challenges` - Get all challenges and the user's progress
- `GET /api/members/{member_id}/challenges/{challenge_id}/progress` - Check a user's progress on a challenge
- `POST /api/members/{member_id}/challenges/{challenge_id}/complete` - Complete a challenge

#### Event Attendance Endpoints

- `GET /api/events/{event_id}/attendees` - Get all attendees for an event
- `GET /api/members/{member_id}/events` - Get all events a member has attended
- `POST /api/events/{event_id}/attendance` - Record a member's attendance
- `GET /api/events/report` - Generate an attendance report
- `GET /api/events/{event_id}/qr-code` - Generate a QR code for event check-in

### Running the Rewards API

```
python rewards_api.py
```

The API will be available at http://localhost:5002

### Community Manager Dashboard

The system includes a web-based dashboard for community managers to manage members, events, rewards, and notifications.

```
python dashboard.py
```

The dashboard will be available at http://localhost:5003

For detailed instructions on using the dashboard, see the [Community Manager Guide](community_manager_guide.md).

### Event Attendance Tracking

The event attendance tracking system provides the following features:

- Create and manage events
- Track member attendance at events
- Award points for event attendance
- Generate QR codes for easy event check-in
- Generate attendance reports
- View event history for members

### Community Engagement Features

The community engagement system provides the following features:

- Access levels based on user level (Bronze, Silver, Gold, Platinum)
- Exclusive content access control based on user level and access level
- Community challenges with progress tracking
- Challenge completion rewards
- Special features for high-level members

### Heartbeat.chat UI Integration

The system integrates with Heartbeat.chat to provide a rich user experience:

- User profiles display rewards information (level, points, achievements)
- Access levels are reflected in user roles and permissions
- Achievement announcements are posted to community channels
- Challenge completion is celebrated in the community
- Leaderboards showcase top contributors
- Challenge dashboards help users track their progress

### Notification System

The notification system provides a comprehensive way to notify users of important events:

- Centralized notification management for all system events
- Support for different notification types (achievements, level ups, challenges, access levels)
- Notification history with read/unread status
- Webhook integration for external systems
- Integration with Heartbeat.chat for UI notifications

### Running the Demos

```
python event_demo.py
```

This will create demo events and members, record attendance, and demonstrate the integration with the rewards system.

```
python community_engagement_demo.py
```

This will create demo members with different levels, check access levels and content access, and demonstrate the community challenges system.

```
python heartbeat_demo.py
```

This will demonstrate the integration with Heartbeat.chat, including user profile updates, achievement announcements, and challenge completion notifications.

```
python notification_demo.py
```

This will demonstrate the notification system, including creating different types of notifications, managing notification status, and webhook integration.
