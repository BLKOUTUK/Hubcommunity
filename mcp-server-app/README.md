# BLKOUT NXT Backend

A backend system for managing BLKOUT NXT members, surveys, and email communications.

## Features

- Member management with JSON file storage
- Email sending with templates for welcome, reminder, and confirmation emails
- Survey handling with customized links based on member type
- RESTful API endpoints for managing members and sending reminders
- Webhook endpoints for integrating with form providers
- Built-in support for Tally form integration

## Setup

1. Clone the repository
2. Install the required packages:
   ```
   pip install -r requirements.txt
   ```
3. Create a `.env` file with your SMTP settings:
   ```
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your_email@example.com
   SMTP_PASSWORD=your_password
   ```
4. Create a `blkout_nxt_config.json` file with your configuration:
   ```json
   {
     "google_sheets": {
       "document_id": "BLKOUT NXT Subscriber Management",
       "sheet_name": "Welcome"
     },
     "email": {
       "from_email": "nxt@blkoutuk.com",
       "admin_email": "blkoutuk@gmail.com"
     },
     "survey_links": {
       "ally_survey": "https://forms.gle/DerFGtG8vrZVPZaB7",
       "bqm_survey": "https://forms.gle/DerFGtG8vrZVPZaB7",
       "qtipoc_organiser_survey": "https://forms.gle/bvZm2UkcsL4LGSq17",
       "organisation_survey": "https://forms.gle/w3mZSj8KPiVnW3Zx7"
     }
   }
   ```
5. Run the application:
   ```
   python app.py
   ```

## API Endpoints

- `GET /` - Home page with API documentation
- `POST /webhook/blkout-nxt-signup` - Handle initial signup
- `POST /webhook/blkout-nxt-survey` - Process survey responses
- `GET /api/members` - Get all members
- `GET /api/members/{member_id}` - Get a specific member
- `POST /api/send-reminders` - Send reminder emails

## Example Signup Webhook Request

```
POST /webhook/blkout-nxt-signup
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "memberType": "Ally"
}
```

## Example Survey Webhook Request

```
POST /webhook/blkout-nxt-survey
Content-Type: application/json

{
    "email": "john.doe@example.com",
    "survey_type": "ally_survey",
    "survey_data": {
        "question1": "Answer 1",
        "question2": "Answer 2"
    }
}
```

## Tally Form Integration

This system supports integration with Tally forms. To integrate with Tally:

1. Go to your Tally form settings
2. Navigate to the "Integrations" tab
3. Select "Webhooks"
4. Add a new webhook with the URL: `http://your-server-address/webhook/blkout-nxt-signup`
5. For survey forms, use: `http://your-server-address/webhook/blkout-nxt-survey`
6. Copy the signing secret provided by Tally
7. Add the signing secret to your `.env` file as `TALLY_SIGNING_SECRET=your_signing_secret`

The system will automatically detect Tally form submissions, verify the signature, and process them accordingly.

### Webhook Security

The system verifies that webhook requests are coming from Tally by checking the signature in the `X-Tally-Signature` header. This ensures that only legitimate requests from Tally are processed.

For this to work, you need to:

1. Set the `TALLY_SIGNING_SECRET` environment variable to the signing secret provided by Tally
2. Ensure that Tally is configured to send the `X-Tally-Signature` and `X-Tally-Timestamp` headers with each request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
