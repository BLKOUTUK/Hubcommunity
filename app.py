from flask import Flask, request, jsonify
import json
import os
import datetime
import logging
from logging.handlers import RotatingFileHandler
import time
import hmac
import hashlib
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Ensure data directory exists
os.makedirs('data', exist_ok=True)

# Set up logging
log_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
log_file = 'blkout_nxt.log'
log_handler = RotatingFileHandler(log_file, maxBytes=1024*1024*5, backupCount=5)
log_handler.setFormatter(log_formatter)
log_handler.setLevel(logging.INFO)

app_logger = logging.getLogger('blkout_nxt')
app_logger.setLevel(logging.INFO)
app_logger.addHandler(log_handler)

# Add console logging for Render
console_handler = logging.StreamHandler()
console_handler.setFormatter(log_formatter)
console_handler.setLevel(logging.INFO)
app_logger.addHandler(console_handler)

app_logger.info("Starting BLKOUT NXT Backend")

# Import our custom modules
from member_manager import MemberManager
from email_sender import EmailSender
from survey_handler import SurveyHandler
from rewards_manager import RewardsManager
from heartbeat_integration import HeartbeatIntegration

app = Flask(__name__)

# Initialize the managers
member_manager = MemberManager()
survey_handler = SurveyHandler()
email_sender = EmailSender()
rewards_manager = RewardsManager()
heartbeat = HeartbeatIntegration()

# Get Tally signing secret from environment variables
TALLY_SIGNING_SECRET = os.environ.get('TALLY_SIGNING_SECRET', '')

def verify_tally_signature(request):
    """Verify that the request is coming from Tally."""
    # For development/testing, you can set this environment variable to bypass verification
    if os.environ.get('BYPASS_TALLY_VERIFICATION', 'false').lower() == 'true':
        app_logger.warning("Bypassing Tally signature verification (development mode)")
        return True

    if not TALLY_SIGNING_SECRET:
        app_logger.warning("Tally signing secret not set, skipping signature verification")
        return True

    # Get the signature from the request headers
    signature_header = request.headers.get('X-Tally-Signature')
    if not signature_header:
        app_logger.warning("No X-Tally-Signature header found")
        return False

    # Get the timestamp from the request headers
    timestamp = request.headers.get('X-Tally-Timestamp')
    if not timestamp:
        app_logger.warning("No X-Tally-Timestamp header found")
        return False

    # Get the request body
    payload_body = request.get_data().decode('utf-8')

    # Create the signature
    # The signature is created by concatenating the timestamp and the request body,
    # then creating an HMAC using the signing secret
    message = f"{timestamp}.{payload_body}"
    expected_signature = hmac.new(
        key=TALLY_SIGNING_SECRET.encode('utf-8'),
        msg=message.encode('utf-8'),
        digestmod=hashlib.sha256
    ).hexdigest()

    # Compare the signatures
    if not hmac.compare_digest(expected_signature, signature_header):
        app_logger.warning("Signature verification failed")
        return False

    app_logger.info("Signature verification successful")
    return True

@app.route('/webhook/blkout-nxt-signup', methods=['POST'])
def signup_webhook():
    """Handle the signup webhook."""
    try:
        # Verify the Tally signature
        if not verify_tally_signature(request):
            return jsonify({"success": False, "message": "Invalid signature"}), 401

        # Get the form data
        data = request.json
        app_logger.info(f"Received webhook data: {json.dumps(data)}")

        # Validate the data
        if not data:
            return jsonify({"success": False, "message": "No data received"}), 400

        # Extract fields with fallbacks for different form providers
        # For Tally forms, the data is typically in a 'data' object with field IDs
        if data.get('data') and isinstance(data.get('data'), dict):
            # This is likely a Tally form submission
            form_data = data.get('data', {})
            # Map Tally field IDs to our expected fields
            # These IDs need to be updated based on your actual Tally form
            name = form_data.get('name', form_data.get('Name', ''))
            email = form_data.get('email', form_data.get('Email', ''))
            member_type = form_data.get('memberType', form_data.get('type', 'Other'))
            app_logger.info(f"Processed Tally form data: name={name}, email={email}, member_type={member_type}")
        else:
            # Standard form data
            name = data.get('name', data.get('Name', data.get('full_name', '')))
            email = data.get('email', data.get('Email', ''))
            member_type = data.get('memberType', data.get('Member Type', data.get('member_type', 'Other')))

        # Additional validation
        if not email:
            return jsonify({"success": False, "message": "Email is required"}), 400

        # Process the data
        result = member_manager.add_member(name=name, email=email, member_type=member_type)

        # Send welcome email
        if result["success"]:
            try:
                email_result = email_sender.send_welcome_email(result["member_id"])
                if not email_result["success"]:
                    app_logger.warning(f"Email sending failed: {email_result['message']}")
            except Exception as e:
                app_logger.error(f"Error sending email: {str(e)}")

        return jsonify({"success": True, "message": "Signup processed successfully"}), 200

    except Exception as e:
        app_logger.error(f"Error processing webhook: {str(e)}")
        return jsonify({"success": False, "message": "An error occurred processing your request"}), 500

@app.route('/webhook/blkout-nxt-survey', methods=['POST'])
def survey_webhook():
    """Handle the survey webhook."""
    try:
        # Verify the Tally signature
        if not verify_tally_signature(request):
            return jsonify({"success": False, "message": "Invalid signature"}), 401

        # Get the survey data
        data = request.json
        app_logger.info(f"Received survey data: {json.dumps(data)}")

        # Extract data based on format
        email = None
        survey_type = 'unknown'
        survey_data = {}

        # For Tally forms, the data is typically in a 'data' object with field IDs
        if data.get('data') and isinstance(data.get('data'), dict):
            # This is likely a Tally form submission
            form_data = data.get('data', {})
            # Map Tally field IDs to our expected fields
            email = form_data.get('email', form_data.get('Email', ''))
            # Determine survey type based on form ID or other indicators
            form_id = data.get('formId', '')
            if 'ally' in form_id.lower():
                survey_type = 'ally_survey'
            elif 'bqm' in form_id.lower():
                survey_type = 'bqm_survey'
            elif 'qtipoc' in form_id.lower() or 'organiser' in form_id.lower():
                survey_type = 'qtipoc_organiser_survey'
            elif 'organisation' in form_id.lower() or 'organization' in form_id.lower():
                survey_type = 'organisation_survey'
            # Use all form data as survey data
            survey_data = form_data
            app_logger.info(f"Processed Tally survey data: email={email}, survey_type={survey_type}")
        else:
            # Standard data format
            email = data.get('email')
            survey_type = data.get('survey_type', 'unknown')
            survey_data = data.get('survey_data', {})

        # Validate the data
        if not email:
            return jsonify({"success": False, "message": "Email is required"}), 400

        # Process the survey response
        result = survey_handler.process_survey_response(
            email=email,
            survey_type=survey_type,
            survey_data=survey_data
        )

        if not result["success"]:
            return jsonify(result), 400

        # Send confirmation email
        try:
            email_result = email_sender.send_confirmation_email(result["member_id"])
            if not email_result["success"]:
                app_logger.warning(f"Confirmation email failed: {email_result['message']}")
        except Exception as e:
            app_logger.error(f"Error sending confirmation email: {str(e)}")

        return jsonify({"success": True, "message": "Survey processed successfully"}), 200

    except Exception as e:
        app_logger.error(f"Error processing survey: {str(e)}")
        return jsonify({"success": False, "message": "An error occurred processing your request"}), 500

@app.route('/api/members', methods=['GET'])
def get_members():
    """Get all members."""
    try:
        members = member_manager.get_all_members()
        return jsonify({"success": True, "members": members}), 200
    except Exception as e:
        app_logger.error(f"Error getting members: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/members/<member_id>', methods=['GET'])
def get_member(member_id):
    """Get a member by ID."""
    try:
        member = member_manager.get_member(member_id=member_id)

        if not member:
            return jsonify({"success": False, "message": "Member not found"}), 404

        return jsonify({"success": True, "member": member}), 200
    except Exception as e:
        app_logger.error(f"Error getting member: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/send-reminders', methods=['POST'])
def send_reminders():
    """Send reminder emails to members who haven't completed the survey."""
    try:
        # Get members who need a reminder
        members = member_manager.get_members_needing_reminder()

        if not members:
            return jsonify({"success": True, "message": "No reminders needed"}), 200

        # Send reminder emails
        sent_count = 0
        for member in members:
            result = email_sender.send_reminder_email(member["id"])
            if result["success"]:
                sent_count += 1

        return jsonify({"success": True, "message": f"Sent {sent_count} reminder emails"}), 200
    except Exception as e:
        app_logger.error(f"Error sending reminders: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/rewards/user/<member_id>', methods=['GET'])
def get_user_rewards(member_id):
    """Get a user's rewards profile."""
    try:
        # Get the user's rewards profile
        rewards = rewards_manager.get_user_rewards(member_id)

        if not rewards:
            return jsonify({"success": False, "message": "Rewards profile not found"}), 404

        return jsonify({"success": True, "rewards": rewards}), 200
    except Exception as e:
        app_logger.error(f"Error getting user rewards: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/rewards/actions', methods=['GET'])
def get_reward_actions():
    """Get all reward actions."""
    try:
        # Get all reward actions
        actions = rewards_manager.get_reward_actions()

        return jsonify({"success": True, "actions": actions}), 200
    except Exception as e:
        app_logger.error(f"Error getting reward actions: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/rewards/achievements', methods=['GET'])
def get_achievements():
    """Get all achievements."""
    try:
        # Get all achievements
        achievements = rewards_manager.get_achievements()

        return jsonify({"success": True, "achievements": achievements}), 200
    except Exception as e:
        app_logger.error(f"Error getting achievements: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/rewards/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get the rewards leaderboard."""
    try:
        # Get all user rewards
        all_rewards = rewards_manager.get_all_user_rewards()

        # Sort by points (descending)
        leaderboard = sorted(all_rewards, key=lambda x: x.get("current_points", 0), reverse=True)

        # Add member details
        for entry in leaderboard:
            member = member_manager.get_member(member_id=entry.get("member_id"))
            if member:
                entry["name"] = member.get("name", "Unknown")
                entry["email"] = member.get("email", "")
                entry["member_type"] = member.get("member_type", "")

        return jsonify({"success": True, "leaderboard": leaderboard}), 200
    except Exception as e:
        app_logger.error(f"Error getting leaderboard: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/rewards/award', methods=['POST'])
def award_points():
    """Award points to a user."""
    try:
        # Get the request data
        data = request.json

        # Validate the data
        if not data:
            return jsonify({"success": False, "message": "No data received"}), 400

        member_id = data.get("member_id")
        action_id = data.get("action_id")
        description = data.get("description")

        if not member_id or not action_id:
            return jsonify({"success": False, "message": "member_id and action_id are required"}), 400

        # Award the points
        result = rewards_manager.award_points(member_id, action_id, description)

        if not result["success"]:
            return jsonify(result), 400

        # Update Heartbeat profile if possible
        try:
            # Get the member
            member = member_manager.get_member(member_id=member_id)

            if member:
                # Find the user in Heartbeat by email
                heartbeat_user = heartbeat.find_user_by_email(member["email"])

                if heartbeat_user["success"] and "data" in heartbeat_user and heartbeat_user["data"]:
                    # Get the user's rewards profile
                    rewards = rewards_manager.get_user_rewards(member_id)

                    if rewards:
                        # Update the user's Heartbeat profile with rewards information
                        heartbeat_id = heartbeat_user["data"].get("id")
                        heartbeat.update_user_rewards(heartbeat_id, rewards)
        except Exception as e:
            app_logger.error(f"Error updating Heartbeat profile: {str(e)}")

        return jsonify(result), 200
    except Exception as e:
        app_logger.error(f"Error awarding points: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/', methods=['GET', 'POST'])
def home():
    """Home page and fallback webhook handler."""
    # If this is a POST request, it might be a webhook from Tally
    if request.method == 'POST':
        app_logger.info(f"Received POST request to root route, might be a webhook")
        app_logger.info(f"Headers: {request.headers}")
        app_logger.info(f"Data: {request.get_data().decode('utf-8')}")

        # Process it like a signup webhook
        return signup_webhook()

    # For GET requests, show the home page
    """Home page."""
    return """
    <html>
    <head>
        <title>BLKOUT NXT API</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            h1 {
                color: #333;
            }
            h2 {
                color: #666;
                margin-top: 30px;
            }
            code {
                background-color: #f5f5f5;
                padding: 2px 5px;
                border-radius: 3px;
            }
            pre {
                background-color: #f5f5f5;
                padding: 10px;
                border-radius: 5px;
                overflow-x: auto;
            }
        </style>
    </head>
    <body>
        <h1>BLKOUT NXT API</h1>
        <p>Welcome to the BLKOUT NXT API. This API provides endpoints for managing BLKOUT NXT members and surveys.</p>

        <h2>Webhooks</h2>
        <ul>
            <li><code>POST /webhook/blkout-nxt-signup</code> - Handle initial signup</li>
            <li><code>POST /webhook/blkout-nxt-survey</code> - Process survey responses</li>
        </ul>

        <h2>API Endpoints</h2>
        <ul>
            <li><code>GET /api/members</code> - Get all members</li>
            <li><code>GET /api/members/{member_id}</code> - Get a specific member</li>
            <li><code>POST /api/send-reminders</code> - Send reminder emails</li>
        </ul>

        <h2>Rewards API Endpoints</h2>
        <ul>
            <li><code>GET /api/rewards/user/{member_id}</code> - Get a user's rewards profile</li>
            <li><code>GET /api/rewards/actions</code> - Get all reward actions</li>
            <li><code>GET /api/rewards/achievements</code> - Get all achievements</li>
            <li><code>GET /api/rewards/leaderboard</code> - Get the rewards leaderboard</li>
            <li><code>POST /api/rewards/award</code> - Award points to a user</li>
        </ul>

        <h2>Example Award Points Request</h2>
        <pre>
POST /api/rewards/award
Content-Type: application/json

{
    "member_id": "123456",
    "action_id": "complete_survey",
    "description": "Completed the ally survey"
}
        </pre>

        <h2>Example Signup Webhook Request</h2>
        <pre>
POST /webhook/blkout-nxt-signup
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "memberType": "Ally"
}
        </pre>

        <h2>Tally Form Integration</h2>
        <p>This API supports integration with Tally forms. To integrate with Tally:</p>
        <ol>
            <li>Go to your Tally form settings</li>
            <li>Navigate to the "Integrations" tab</li>
            <li>Select "Webhooks"</li>
            <li>Add a new webhook with the URL: <code>http://your-server-address/webhook/blkout-nxt-signup</code></li>
            <li>For survey forms, use: <code>http://your-server-address/webhook/blkout-nxt-survey</code></li>
        </ol>

        <p>The system will automatically detect Tally form submissions and process them accordingly.</p>
    </body>
    </html>
    """

if __name__ == '__main__':
    # Use debug mode only in development
    debug_mode = os.environ.get('FLASK_ENV', 'development') == 'development'
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=debug_mode, host='0.0.0.0', port=port)
