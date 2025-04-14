# BLKOUTHUB Rewards System Deployment Guide

## Introduction

This guide provides instructions for deploying the BLKOUTHUB rewards and gamification system to a production environment. The system is designed to be deployed on Render, a cloud platform that makes it easy to deploy web applications.

## Prerequisites

Before deploying the system, you will need:

1. A GitHub account
2. A Render account
3. A Heartbeat.chat account with API access
4. Basic knowledge of Git and command-line tools

## Repository Setup

### 1. Fork the Repository

1. Go to the [BLKOUTHUB repository](https://github.com/BLKOUTUK/Hubcommunity)
2. Click the "Fork" button in the top-right corner
3. Select your GitHub account as the destination for the fork

### 2. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/Hubcommunity.git
cd Hubcommunity
```

### 3. Create a Production Branch

```bash
git checkout -b production
```

## Configuration

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# API Keys
HEARTBEAT_API_KEY=your_heartbeat_api_key
N8N_API_KEY=your_n8n_api_key

# Flask Configuration
FLASK_SECRET_KEY=your_secret_key

# Email Configuration (if using email notifications)
SMTP_SERVER=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=your_smtp_username
SMTP_PASSWORD=your_smtp_password
SMTP_FROM_EMAIL=noreply@example.com

# Google Sheets Configuration (if using Google Sheets)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=your_google_redirect_uri
```

Replace the placeholder values with your actual API keys and configuration.

### 2. Configuration Files

Update the `blkout_nxt_config.json` file with your production settings:

```json
{
  "app_name": "BLKOUTHUB",
  "api_url": "https://your-production-url.onrender.com",
  "webhook_url": "https://your-production-url.onrender.com/webhook",
  "heartbeat_url": "https://api.heartbeat.chat/v0",
  "data_directory": "data",
  "log_level": "INFO",
  "member_types": [
    "Ally",
    "Organiser",
    "QTIPOCOrganiser",
    "QTIPOCAlly"
  ],
  "event_types": [
    "Workshop",
    "Seminar",
    "Conference",
    "Meetup",
    "Social"
  ]
}
```

## Preparing for Deployment

### 1. Update the `render.yaml` File

The `render.yaml` file defines the services to be deployed on Render. Update it with your production settings:

```yaml
services:
  - type: web
    name: blkouthub-rewards
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn rewards_api:app
    envVars:
      - key: HEARTBEAT_API_KEY
        sync: false
      - key: N8N_API_KEY
        sync: false
      - key: FLASK_SECRET_KEY
        sync: false
      - key: SMTP_SERVER
        sync: false
      - key: SMTP_PORT
        sync: false
      - key: SMTP_USERNAME
        sync: false
      - key: SMTP_PASSWORD
        sync: false
      - key: SMTP_FROM_EMAIL
        sync: false
      - key: GOOGLE_CLIENT_ID
        sync: false
      - key: GOOGLE_CLIENT_SECRET
        sync: false
      - key: GOOGLE_REDIRECT_URI
        sync: false
```

### 2. Update the `requirements.txt` File

Ensure that the `requirements.txt` file includes all the required dependencies:

```
Flask==2.0.1
gunicorn==20.1.0
requests==2.26.0
python-dotenv==0.19.0
```

### 3. Commit the Changes

```bash
git add .
git commit -m "Prepare for production deployment"
git push origin production
```

## Deploying to Render

### 1. Connect Render to GitHub

1. Log in to your Render account
2. Go to the Dashboard
3. Click "New" and select "Web Service"
4. Connect your GitHub account if you haven't already
5. Select your forked repository

### 2. Configure the Web Service

1. Select the "production" branch
2. Enter a name for your service (e.g., "blkouthub-rewards")
3. Select "Python" as the runtime
4. Set the build command to `pip install -r requirements.txt`
5. Set the start command to `gunicorn rewards_api:app`
6. Click "Advanced" and add all the environment variables from your `.env` file
7. Click "Create Web Service"

### 3. Wait for Deployment

Render will automatically build and deploy your application. This may take a few minutes.

### 4. Verify the Deployment

1. Once the deployment is complete, click on the URL provided by Render
2. You should see the BLKOUTHUB Rewards API home page
3. Test the API endpoints to ensure everything is working correctly

## Setting Up the Dashboard

### 1. Deploy the Dashboard

1. Go to your Render Dashboard
2. Click "New" and select "Web Service"
3. Select your forked repository
4. Select the "production" branch
5. Enter a name for your service (e.g., "blkouthub-dashboard")
6. Select "Python" as the runtime
7. Set the build command to `pip install -r requirements.txt`
8. Set the start command to `gunicorn dashboard:app`
9. Click "Advanced" and add all the environment variables from your `.env` file
10. Click "Create Web Service"

### 2. Update the Dashboard Configuration

Update the dashboard configuration to use the production API URL:

```python
# In dashboard.py
API_URL = "https://your-production-url.onrender.com"
```

### 3. Commit and Push the Changes

```bash
git add dashboard.py
git commit -m "Update dashboard configuration for production"
git push origin production
```

### 4. Verify the Dashboard

1. Once the deployment is complete, click on the URL provided by Render
2. Log in to the dashboard with your community manager credentials
3. Verify that all features are working correctly

## Setting Up Persistent Storage

By default, Render's file system is ephemeral, which means that any files created during the application's runtime will be lost when the service restarts. To ensure that your data is persistent, you should use a database or a persistent storage solution.

### Option 1: Using a Database

1. Create a PostgreSQL database on Render
2. Update your application to use the database instead of JSON files
3. Add the database connection details to your environment variables

### Option 2: Using Render Disks

1. Go to your Render Dashboard
2. Click on your web service
3. Go to the "Disks" tab
4. Click "Add Disk"
5. Enter a name for your disk (e.g., "blkouthub-data")
6. Set the mount path to `/data`
7. Set the size to an appropriate value (e.g., 10 GB)
8. Click "Save"

Update your application to use the mounted disk for data storage:

```python
# In your application code
DATA_DIR = "/data"
```

## Setting Up Webhooks

### 1. Configure Heartbeat.chat Webhooks

1. Log in to your Heartbeat.chat account
2. Go to the API settings
3. Add a new webhook with the URL `https://your-production-url.onrender.com/webhook`
4. Select the events you want to receive (e.g., user.created, message.created)
5. Save the webhook configuration

### 2. Configure n8n Webhooks

If you're using n8n for workflow automation:

1. Log in to your n8n instance
2. Create a new workflow
3. Add an "HTTP Request" node
4. Set the URL to `https://your-production-url.onrender.com/api/webhooks`
5. Set the method to `POST`
6. Add the required headers and body
7. Save and activate the workflow

## Monitoring and Maintenance

### 1. Set Up Logging

Configure logging to help diagnose issues:

```python
# In your application code
import logging
import os

LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
logging.basicConfig(level=getattr(logging, LOG_LEVEL))
```

### 2. Set Up Monitoring

1. Go to your Render Dashboard
2. Click on your web service
3. Go to the "Metrics" tab
4. Monitor CPU usage, memory usage, and response times

### 3. Set Up Alerts

1. Go to your Render Dashboard
2. Click on your web service
3. Go to the "Alerts" tab
4. Set up alerts for high CPU usage, high memory usage, or service downtime

### 4. Regular Backups

Set up a regular backup schedule for your data:

1. Create a script to export your data to a backup format
2. Schedule the script to run regularly using a cron job or a scheduled task
3. Store the backups in a secure location

## Security Considerations

### 1. API Keys

Ensure that all API keys are stored securely as environment variables and not hardcoded in your application.

### 2. Authentication

Implement proper authentication for your API endpoints and dashboard:

1. Use HTTPS for all communications
2. Implement token-based authentication for API endpoints
3. Use secure cookies for dashboard authentication
4. Implement rate limiting to prevent abuse

### 3. Input Validation

Validate all user input to prevent security vulnerabilities:

1. Validate request parameters and body
2. Sanitize user input to prevent XSS attacks
3. Use parameterized queries to prevent SQL injection

## Troubleshooting

### Common Issues

#### Application Not Starting

If your application fails to start:

1. Check the logs in the Render Dashboard
2. Verify that all required environment variables are set
3. Check that the start command is correct
4. Verify that all dependencies are installed

#### Data Not Persisting

If your data is not persisting:

1. Check that you're using a persistent storage solution
2. Verify that the data directory is correctly configured
3. Check file permissions

#### Webhook Issues

If webhooks are not working:

1. Check that the webhook URL is correct
2. Verify that the webhook is properly configured in the external service
3. Check the logs for any errors related to webhook processing

## Conclusion

By following this guide, you should have successfully deployed the BLKOUTHUB rewards and gamification system to a production environment. Remember to monitor the system regularly, keep it updated with the latest security patches, and back up your data to prevent data loss.

If you encounter any issues or have questions, please refer to the documentation or contact the system administrator for assistance.
