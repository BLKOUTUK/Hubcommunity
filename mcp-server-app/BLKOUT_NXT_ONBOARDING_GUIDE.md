# BLKOUT NXT Onboarding System Guide

## System Overview

The BLKOUT NXT onboarding system is a comprehensive solution that manages the entire member journey from signup to engagement. The system includes:

1. **Web Form Integration**: Captures signups from your website
2. **Segmented Welcome Emails**: Sends personalized HTML emails based on member type
3. **Segment-Specific Surveys**: Follows up with targeted surveys
4. **Survey Data Integration**: Incorporates survey responses into your database
5. **Organiser Drip Campaign**: Delivers specialized resources to QTIPOC Organisers

All data is stored in Google Sheets, making it easy to manage and update.

## System Components

### 1. BLKOUT NXT Onboarding
- **Purpose**: Sends initial welcome emails to new members
- **Trigger**: Runs every hour
- **Segmentation**: Routes members to appropriate welcome emails based on their Role
- **Features**: HTML emails with segment-specific content

### 2. BLKOUT NXT Survey Follow-up
- **Purpose**: Sends segment-specific survey links
- **Trigger**: Runs daily
- **Timing**: Sends surveys 3 days after welcome email
- **Features**: HTML emails with segment-specific survey links

### 3. BLKOUT NXT Organiser Drip Campaign
- **Purpose**: Sends a series of 5 resource emails to QTIPOC Organisers
- **Trigger**: Runs daily
- **Timing**: Sends emails weekly after the survey
- **Features**: HTML emails with specialized resources

### 4. BLKOUT NXT Web Form Integration
- **Purpose**: Captures signups from your website
- **Trigger**: Webhook endpoint for your web form
- **Features**: Validates data and adds new members to your database

### 5. BLKOUT NXT Survey Integration
- **Purpose**: Incorporates survey responses into your database
- **Trigger**: Runs every 6 hours
- **Features**: Matches survey responses with members and updates records

## Google Sheet Structure

The system uses your Google Sheet with these key columns:

- **Email**: Primary identifier for members
- **FirstName**: Used for personalization
- **LastName**: Additional name information
- **Role**: Used for segmentation (Ally, Black Queer Man, QTIPOC Organiser, Organisation)
- **Organisation**: Organization name for organizational members
- **JoinDate**: Date the member joined
- **OnboardingStatus**: Tracks progress (New → Welcome Sent → Survey Sent → Survey Completed)
- **LastEmailSent**: Date of most recent email
- **EmailHistory**: Record of all emails sent
- **Notes**: Contains segment and drip campaign information
- **SurveyData**: JSON string containing survey responses
- **SurveyTimestamp**: When the survey was completed

## How the System Works

### Complete Member Journey

1. **Signup**:
   - Member completes the web form
   - Data is validated and added to Google Sheet
   - Status set to "New"

2. **Welcome Email**:
   - Sent automatically within an hour
   - HTML email with segment-specific content
   - Status updated to "Welcome Sent"

3. **Survey Email**:
   - Sent automatically 3 days after welcome email
   - HTML email with link to segment-specific Google Form
   - Status updated to "Survey Sent"

4. **Survey Completion**:
   - Member completes the survey
   - Survey data is integrated into the database
   - Status updated to "Survey Completed"

5. **Organiser Drip Campaign** (QTIPOC Organisers only):
   - Automatically enrolled after survey email
   - Receives 5 weekly HTML emails with resources
   - Progress tracked in Notes field

## How to Use the System

### Adding New Members

1. **Web Form**:
   - Members sign up through your website
   - Form submits to the webhook endpoint
   - Data is automatically added to your Google Sheet

2. **Manual Addition**:
   - Add directly to Google Sheet
   - Required fields: Email, FirstName, Role
   - Leave OnboardingStatus blank or set to "New"

### Monitoring Progress

You can track onboarding progress in the Google Sheet:

- **OnboardingStatus**: Shows current stage
- **LastEmailSent**: Shows when last email was sent
- **EmailHistory**: Shows all emails sent to member
- **Notes**: Contains segment and drip campaign details
- **SurveyData**: Contains survey responses

### Customizing Email Templates

The system uses HTML email templates located in the `email_templates` folder:

1. **welcome_template.html**: Template for welcome emails
2. **survey_template.html**: Template for survey emails
3. **drip_template.html**: Template for organiser drip campaign emails

To modify these templates:

1. Edit the HTML files in the `email_templates` folder
2. Update the JavaScript functions in the corresponding workflow

### Customizing Workflow Logic

To modify the workflow logic:

1. Open n8n dashboard
2. Edit the appropriate workflow
3. Modify the Function nodes or other components
4. Save the workflow

## Web Form Integration

The system provides a webhook endpoint for your web form:

- **Endpoint**: `/blkout-nxt-signup`
- **Method**: POST
- **Content-Type**: application/json

Example form data:

```json
{
  "email": "member@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "memberType": "Black Queer Man",
  "organisation": "Example Org"
}
```

The system will:
1. Validate the data
2. Add the member to your Google Sheet
3. Return a success or error response

## Survey Integration

The system automatically integrates survey responses from your Google Forms:

1. Surveys are linked in the follow-up emails:
   - Ally: https://forms.gle/YLUvorjyU5FjXb7F6
   - Black Queer Man: https://forms.gle/9cg8G2oZi5V3HBHU6
   - QTIPOC Organiser: https://forms.gle/t1GNMj7ZPV14eYhU9
   - Organisation: https://forms.gle/o3J4a3yhqfuSc6L58

2. The system checks for new responses every 6 hours

3. Survey data is added to your Google Sheet:
   - Matched by email address
   - Stored as JSON in the SurveyData column
   - OnboardingStatus updated to "Survey Completed"

## Maintenance and Troubleshooting

### Regular Maintenance

1. **Check Logs**: Review n8n logs periodically for any errors
2. **Update Survey Links**: If you create new surveys, update the workflow
3. **Refresh Email Content**: Update email templates periodically
4. **Monitor Google Sheet**: Check for any data issues or anomalies

### Troubleshooting

If a member doesn't receive an email:

1. Check their OnboardingStatus in the sheet
2. Verify their Email is correct
3. Check n8n logs for any errors
4. If needed, manually reset their status to trigger the next email

If survey data isn't being integrated:

1. Check that the survey response includes the correct email address
2. Verify the survey Sheet ID in the workflow
3. Check n8n logs for any errors

## Next Steps and Future Enhancements

Here are some potential enhancements for the future:

1. **Advanced Analytics**: Track email open rates and engagement
2. **Additional Segments**: Add more specific segments as needed
3. **Automated Reminders**: Send reminders to members who haven't completed surveys
4. **Integration with Other Systems**: Connect with other platforms like CRM systems
5. **Member Portal**: Create a member portal for self-service profile management

## Technical Details

### Workflow IDs

- BLKOUT NXT Onboarding: 9U7WKBX89mZCeyy3
- BLKOUT NXT Survey Follow-up: x3wXKwOzZcYObvmr
- BLKOUT NXT Organiser Drip Campaign: GnKiyiQqaqdB6mP2
- BLKOUT NXT Web Form Integration: h2rrPfFub0F39gc8
- BLKOUT NXT Survey Integration: OIb8zA9R7rw6C1Ig

### File Locations

- HTML Templates: `email_templates/`
- JavaScript Functions: `.js` files in the root directory
- Workflow Definitions: `.json` files in the root directory

### Dependencies

- Google Sheets API
- Gmail API
- Google Forms
- n8n

## Support

If you encounter any issues or need assistance with the system, please contact the development team.
