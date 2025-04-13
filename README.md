# BLKOUT NXT Onboarding System

A backend system for managing BLKOUT NXT community onboarding, including form integration, email campaigns, and member management.

## Overview

The BLKOUT NXT Onboarding System provides:

- Webhook integration with Tally forms
- Email drip campaigns for different user categories
- Survey follow-up management
- Member data storage and management
- Local JSON storage for member data

## Project Structure

- `app.py` - Main Flask application with webhook endpoints
- `member_manager.py` - Handles member data storage and retrieval
- `email_sender.py` - Manages email sending functionality
- `survey_handler.py` - Processes survey responses
- `blkout_nxt_config.json` - Configuration for surveys, email campaigns, etc.
- `email_templates/` - HTML templates for emails
- `data/` - Directory for storing member data (created at runtime)

## Deployment

This application is deployed on Render. The webhook endpoint for form submissions is:

```
https://blkout-nxt-backend.onrender.com/webhook/blkout-nxt-signup
```

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

## Repository Organization

The main application files are in the root directory. Legacy code and development files have been moved to the `archive` directory for reference.
