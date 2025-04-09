# BLKOUT NXT Onboarding System

This is a simple onboarding system for BLKOUT NXT that handles:
- Initial signup via a web form
- Sending welcome emails with links to appropriate surveys
- Processing survey responses
- Sending reminder emails
- Storing member data in a local JSON file

## Setup

1. Install the required packages:
```
pip install -r requirements.txt
```

2. Configure your email settings:
- Create a `.env` file with the following variables:
```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=nxt@blkoutuk.com
SMTP_PASSWORD=your_password_here
```

3. Start the Flask server:
```
python app.py
```

## Usage

### Initial Signup

1. Create a simple HTML form on your website that submits to the signup webhook:
```html
<form action="http://localhost:5000/webhook/blkout-nxt-signup" method="post">
  <input type="text" name="name" placeholder="Your Name" required>
  <input type="email" name="email" placeholder="Your Email" required>
  <select name="memberType">
    <option value="Ally">Ally</option>
    <option value="Black Queer Men">Black Queer Men</option>
    <option value="QTIPOC Organiser">QTIPOC Organiser</option>
    <option value="Organisation">Organisation</option>
  </select>
  <button type="submit">Sign Up</button>
</form>
```

2. Or test the signup webhook using the provided Python script:
```
python test_signup_webhook.py
```

### Survey Responses

1. Create Google Forms for each member type:
   - Ally Survey
   - Black Queer Men Survey
   - QTIPOC Organiser Survey
   - Organisation Survey

2. Add a hidden field to each form to store the email address (pre-filled from the URL)

3. Set up a Google Apps Script to send the form responses to the survey webhook:
```javascript
function onFormSubmit(e) {
  var formResponse = e.response;
  var itemResponses = formResponse.getItemResponses();
  var formData = {};
  
  // Get the form type
  var formTitle = e.source.getTitle();
  var surveyType = "";
  
  if (formTitle.includes("Ally")) {
    surveyType = "ally_survey";
  } else if (formTitle.includes("Black Queer Men")) {
    surveyType = "bqm_survey";
  } else if (formTitle.includes("QTIPOC Organiser")) {
    surveyType = "qtipoc_organiser_survey";
  } else if (formTitle.includes("Organisation")) {
    surveyType = "organisation_survey";
  }
  
  // Get the email address
  var email = "";
  for (var i = 0; i < itemResponses.length; i++) {
    var itemResponse = itemResponses[i];
    var question = itemResponse.getItem().getTitle();
    var answer = itemResponse.getResponse();
    
    if (question === "Email Address") {
      email = answer;
    }
    
    formData[question] = answer;
  }
  
  // Send the data to the webhook
  var payload = {
    "email": email,
    "survey_type": surveyType,
    "survey_data": formData
  };
  
  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload)
  };
  
  UrlFetchApp.fetch("http://localhost:5000/webhook/blkout-nxt-survey", options);
}
```

### Sending Reminders

1. Set up a cron job to send reminders daily:
```
0 9 * * * curl -X POST http://localhost:5000/api/send-reminders
```

2. Or manually trigger reminders by visiting:
```
http://localhost:5000/api/send-reminders
```

## Data Storage

Member data is stored in a JSON file at `data/members.json`. This is a simple solution that doesn't require a database.

## API Endpoints

- `POST /webhook/blkout-nxt-signup`: Handle initial signup
- `POST /webhook/blkout-nxt-survey`: Process survey responses
- `GET /api/members`: Get all members
- `GET /api/members/<member_id>`: Get a specific member
- `POST /api/send-reminders`: Send reminder emails

## Next Steps

1. Implement a proper database (e.g., SQLite, PostgreSQL)
2. Add authentication to the API endpoints
3. Create a web interface for managing members
4. Implement more sophisticated email templates
5. Add analytics and reporting
