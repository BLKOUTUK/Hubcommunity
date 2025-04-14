from flask import Flask, jsonify, request
import logging
import datetime
from rewards_manager import RewardsManager
from member_manager import MemberManager
from heartbeat_integration import HeartbeatIntegration
from event_manager import EventManager
from notification_manager import NotificationManager

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('rewards_api')

app = Flask(__name__)

# Initialize the managers
rewards_manager = RewardsManager()
member_manager = MemberManager()
heartbeat = HeartbeatIntegration()
event_manager = EventManager()
notification_manager = NotificationManager()

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
        logger.error(f"Error getting user rewards: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/rewards/actions', methods=['GET'])
def get_reward_actions():
    """Get all reward actions."""
    try:
        # Get all reward actions
        actions = rewards_manager.get_reward_actions()

        return jsonify({"success": True, "actions": actions}), 200
    except Exception as e:
        logger.error(f"Error getting reward actions: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/rewards/achievements', methods=['GET'])
def get_achievements():
    """Get all achievements."""
    try:
        # Get all achievements
        achievements = rewards_manager.get_achievements()

        return jsonify({"success": True, "achievements": achievements}), 200
    except Exception as e:
        logger.error(f"Error getting achievements: {str(e)}")
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
        logger.error(f"Error getting leaderboard: {str(e)}")
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
            logger.error(f"Error updating Heartbeat profile: {str(e)}")

        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error awarding points: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

# Event Management Endpoints

@app.route('/api/events', methods=['GET'])
def get_events():
    """Get all events, optionally filtered to upcoming events only."""
    try:
        upcoming_only = request.args.get('upcoming', 'false').lower() == 'true'
        events = event_manager.get_events(upcoming_only=upcoming_only)
        return jsonify({"success": True, "events": events}), 200
    except Exception as e:
        logger.error(f"Error getting events: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/events/<event_id>', methods=['GET'])
def get_event(event_id):
    """Get a specific event."""
    try:
        event = event_manager.get_event(event_id)
        if not event:
            return jsonify({"success": False, "message": "Event not found"}), 404
        return jsonify({"success": True, "event": event}), 200
    except Exception as e:
        logger.error(f"Error getting event: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/events', methods=['POST'])
def create_event():
    """Create a new event."""
    try:
        data = request.json
        if not data:
            return jsonify({"success": False, "message": "No data received"}), 400

        # Validate required fields
        required_fields = ['name', 'description', 'event_date', 'location']
        for field in required_fields:
            if field not in data:
                return jsonify({"success": False, "message": f"Missing required field: {field}"}), 400

        # Create the event
        result = event_manager.create_event(
            name=data.get('name'),
            description=data.get('description'),
            event_date=data.get('event_date'),
            location=data.get('location'),
            event_type=data.get('event_type', 'in-person'),
            max_attendees=data.get('max_attendees'),
            registration_url=data.get('registration_url')
        )

        if not result["success"]:
            return jsonify(result), 400

        return jsonify(result), 201
    except Exception as e:
        logger.error(f"Error creating event: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/events/<event_id>', methods=['PUT'])
def update_event(event_id):
    """Update an existing event."""
    try:
        data = request.json
        if not data:
            return jsonify({"success": False, "message": "No data received"}), 400

        # Update the event
        result = event_manager.update_event(
            event_id=event_id,
            name=data.get('name'),
            description=data.get('description'),
            event_date=data.get('event_date'),
            location=data.get('location'),
            event_type=data.get('event_type'),
            max_attendees=data.get('max_attendees'),
            registration_url=data.get('registration_url')
        )

        if not result["success"]:
            return jsonify(result), 400 if result["message"] == "Event not found" else 500

        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error updating event: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/events/<event_id>', methods=['DELETE'])
def delete_event(event_id):
    """Delete an event."""
    try:
        result = event_manager.delete_event(event_id)
        if not result["success"]:
            return jsonify(result), 400 if result["message"] == "Event not found" else 500
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error deleting event: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

# Community Engagement Endpoints

@app.route('/api/access-levels', methods=['GET'])
def get_access_levels():
    """Get all access levels."""
    try:
        access_levels = rewards_manager.get_access_levels()
        return jsonify({"success": True, "access_levels": access_levels}), 200
    except Exception as e:
        logger.error(f"Error getting access levels: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/members/<member_id>/access-level', methods=['GET'])
def get_user_access_level(member_id):
    """Get a user's access level."""
    try:
        result = rewards_manager.get_user_access_level(member_id)
        if not result["success"]:
            return jsonify(result), 400
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error getting user access level: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/exclusive-content', methods=['GET'])
def get_exclusive_content():
    """Get all exclusive content."""
    try:
        content = rewards_manager.get_exclusive_content()
        return jsonify({"success": True, "content": content}), 200
    except Exception as e:
        logger.error(f"Error getting exclusive content: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/members/<member_id>/content-access/<content_id>', methods=['GET'])
def check_content_access(member_id, content_id):
    """Check if a user has access to specific content."""
    try:
        result = rewards_manager.check_content_access(member_id, content_id)
        return jsonify(result), 200 if result["success"] else 403
    except Exception as e:
        logger.error(f"Error checking content access: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/members/<member_id>/available-content', methods=['GET'])
def get_available_content(member_id):
    """Get all content available to a user."""
    try:
        result = rewards_manager.get_available_content(member_id)
        if not result["success"]:
            return jsonify(result), 400
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error getting available content: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/challenges', methods=['GET'])
def get_community_challenges():
    """Get all community challenges."""
    try:
        challenges = rewards_manager.get_community_challenges()
        return jsonify({"success": True, "challenges": challenges}), 200
    except Exception as e:
        logger.error(f"Error getting community challenges: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/members/<member_id>/challenges', methods=['GET'])
def get_user_challenges(member_id):
    """Get all challenges and the user's progress on each."""
    try:
        result = rewards_manager.get_user_challenges(member_id)
        if not result["success"]:
            return jsonify(result), 400
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error getting user challenges: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/members/<member_id>/challenges/<challenge_id>/progress', methods=['GET'])
def check_challenge_progress(member_id, challenge_id):
    """Check a user's progress on a specific challenge."""
    try:
        result = rewards_manager.check_challenge_progress(member_id, challenge_id)
        if not result["success"]:
            return jsonify(result), 400
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error checking challenge progress: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/members/<member_id>/challenges/<challenge_id>/complete', methods=['POST'])
def complete_challenge(member_id, challenge_id):
    """Complete a challenge and award points if all requirements are met."""
    try:
        result = rewards_manager.complete_challenge(member_id, challenge_id)
        if not result["success"]:
            return jsonify(result), 400
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error completing challenge: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

# Event Attendance Endpoints

@app.route('/api/events/<event_id>/attendees', methods=['GET'])
def get_event_attendees(event_id):
    """Get all attendees for an event."""
    try:
        attendees = event_manager.get_event_attendees(event_id)
        return jsonify({"success": True, "attendees": attendees}), 200
    except Exception as e:
        logger.error(f"Error getting event attendees: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/members/<member_id>/events', methods=['GET'])
def get_member_events(member_id):
    """Get all events a member has attended."""
    try:
        events = event_manager.get_member_events(member_id)
        return jsonify({"success": True, "events": events}), 200
    except Exception as e:
        logger.error(f"Error getting member events: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/events/<event_id>/attendance', methods=['POST'])
def record_attendance(event_id):
    """Record a member's attendance at an event."""
    try:
        data = request.json
        if not data:
            return jsonify({"success": False, "message": "No data received"}), 400

        member_id = data.get('member_id')
        if not member_id:
            return jsonify({"success": False, "message": "member_id is required"}), 400

        # Record the attendance
        result = event_manager.record_attendance(
            event_id=event_id,
            member_id=member_id,
            check_in_method=data.get('check_in_method', 'manual'),
            notes=data.get('notes')
        )

        if not result["success"]:
            return jsonify(result), 400

        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error recording attendance: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/events/report', methods=['GET'])
def generate_attendance_report():
    """Generate a report of event attendance, optionally filtered by event or date range."""
    try:
        event_id = request.args.get('event_id')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        report = event_manager.generate_attendance_report(
            event_id=event_id,
            start_date=start_date,
            end_date=end_date
        )

        return jsonify({"success": True, "report": report}), 200
    except Exception as e:
        logger.error(f"Error generating attendance report: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/events/<event_id>/qr-code', methods=['GET'])
def generate_qr_code(event_id):
    """Generate a QR code for event check-in."""
    try:
        result = event_manager.generate_qr_code(event_id)
        if not result["success"]:
            return jsonify(result), 400
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error generating QR code: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

# Notification Endpoints

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    """Get notifications, optionally filtered by member ID, type, and read status."""
    try:
        member_id = request.args.get('member_id')
        notification_type = request.args.get('type')
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'

        result = notification_manager.get_notifications(
            member_id=member_id,
            notification_type=notification_type,
            limit=limit,
            offset=offset,
            unread_only=unread_only
        )

        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error getting notifications: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/notifications', methods=['POST'])
def create_notification():
    """Create a new notification."""
    try:
        data = request.json
        if not data:
            return jsonify({"success": False, "message": "No data received"}), 400

        # Validate required fields
        required_fields = ['member_id', 'type', 'title', 'message']
        for field in required_fields:
            if field not in data:
                return jsonify({"success": False, "message": f"Missing required field: {field}"}), 400

        result = notification_manager.create_notification(
            member_id=data.get('member_id'),
            notification_type=data.get('type'),
            title=data.get('title'),
            message=data.get('message'),
            data=data.get('data')
        )

        if not result["success"]:
            return jsonify(result), 400

        return jsonify(result), 201
    except Exception as e:
        logger.error(f"Error creating notification: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/notifications/<notification_id>/read', methods=['POST'])
def mark_notification_read(notification_id):
    """Mark a notification as read."""
    try:
        result = notification_manager.mark_notification_read(notification_id, read=True)
        if not result["success"]:
            return jsonify(result), 400
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error marking notification as read: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/notifications/<notification_id>/unread', methods=['POST'])
def mark_notification_unread(notification_id):
    """Mark a notification as unread."""
    try:
        result = notification_manager.mark_notification_read(notification_id, read=False)
        if not result["success"]:
            return jsonify(result), 400
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error marking notification as unread: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/members/<member_id>/notifications/read', methods=['POST'])
def mark_all_read(member_id):
    """Mark all notifications for a member as read."""
    try:
        result = notification_manager.mark_all_read(member_id)
        if not result["success"]:
            return jsonify(result), 400
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error marking all notifications as read: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/notifications/<notification_id>', methods=['DELETE'])
def delete_notification(notification_id):
    """Delete a notification."""
    try:
        result = notification_manager.delete_notification(notification_id)
        if not result["success"]:
            return jsonify(result), 400
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error deleting notification: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/notifications/cleanup', methods=['POST'])
def delete_old_notifications():
    """Delete notifications older than the specified number of days."""
    try:
        days = int(request.args.get('days', 30))
        result = notification_manager.delete_old_notifications(days=days)
        if not result["success"]:
            return jsonify(result), 400
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error deleting old notifications: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

# Webhook Endpoints

@app.route('/api/webhooks', methods=['GET'])
def get_webhooks():
    """Get all webhook configurations."""
    try:
        result = notification_manager.get_webhooks()
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error getting webhooks: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/webhooks', methods=['POST'])
def add_webhook():
    """Add a new webhook configuration."""
    try:
        data = request.json
        if not data:
            return jsonify({"success": False, "message": "No data received"}), 400

        # Validate required fields
        required_fields = ['name', 'url', 'events']
        for field in required_fields:
            if field not in data:
                return jsonify({"success": False, "message": f"Missing required field: {field}"}), 400

        result = notification_manager.add_webhook(
            name=data.get('name'),
            url=data.get('url'),
            events=data.get('events'),
            headers=data.get('headers'),
            enabled=data.get('enabled', True)
        )

        if not result["success"]:
            return jsonify(result), 400

        return jsonify(result), 201
    except Exception as e:
        logger.error(f"Error adding webhook: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/webhooks/<webhook_id>', methods=['PUT'])
def update_webhook(webhook_id):
    """Update an existing webhook configuration."""
    try:
        data = request.json
        if not data:
            return jsonify({"success": False, "message": "No data received"}), 400

        result = notification_manager.update_webhook(
            webhook_id=webhook_id,
            name=data.get('name'),
            url=data.get('url'),
            events=data.get('events'),
            headers=data.get('headers'),
            enabled=data.get('enabled')
        )

        if not result["success"]:
            return jsonify(result), 400

        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error updating webhook: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/webhooks/<webhook_id>', methods=['DELETE'])
def delete_webhook(webhook_id):
    """Delete a webhook configuration."""
    try:
        result = notification_manager.delete_webhook(webhook_id)
        if not result["success"]:
            return jsonify(result), 400
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error deleting webhook: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/webhooks/<webhook_id>/test', methods=['POST'])
def test_webhook(webhook_id):
    """Send a test notification to a webhook."""
    try:
        result = notification_manager.test_webhook(webhook_id)
        if not result["success"]:
            return jsonify(result), 400
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error testing webhook: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/', methods=['GET'])
def home():
    """Home page."""
    return """
    <html>
    <head>
        <title>BLKOUTHUB Rewards API</title>
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
        <h1>BLKOUTHUB Rewards API</h1>
        <p>Welcome to the BLKOUTHUB Rewards API. This API provides endpoints for managing BLKOUTHUB rewards.</p>

        <h2>Rewards API Endpoints</h2>
        <ul>
            <li><code>GET /api/rewards/user/{member_id}</code> - Get a user's rewards profile</li>
            <li><code>GET /api/rewards/actions</code> - Get all reward actions</li>
            <li><code>GET /api/rewards/achievements</code> - Get all achievements</li>
            <li><code>GET /api/rewards/leaderboard</code> - Get the rewards leaderboard</li>
            <li><code>POST /api/rewards/award</code> - Award points to a user</li>
        </ul>

        <h2>Event Management Endpoints</h2>
        <ul>
            <li><code>GET /api/events</code> - Get all events</li>
            <li><code>GET /api/events?upcoming=true</code> - Get upcoming events</li>
            <li><code>GET /api/events/{event_id}</code> - Get a specific event</li>
            <li><code>POST /api/events</code> - Create a new event</li>
            <li><code>PUT /api/events/{event_id}</code> - Update an event</li>
            <li><code>DELETE /api/events/{event_id}</code> - Delete an event</li>
        </ul>

        <h2>Community Engagement Endpoints</h2>
        <ul>
            <li><code>GET /api/access-levels</code> - Get all access levels</li>
            <li><code>GET /api/members/{member_id}/access-level</code> - Get a user's access level</li>
            <li><code>GET /api/exclusive-content</code> - Get all exclusive content</li>
            <li><code>GET /api/members/{member_id}/content-access/{content_id}</code> - Check if a user has access to specific content</li>
            <li><code>GET /api/members/{member_id}/available-content</code> - Get all content available to a user</li>
            <li><code>GET /api/challenges</code> - Get all community challenges</li>
            <li><code>GET /api/members/{member_id}/challenges</code> - Get all challenges and the user's progress</li>
            <li><code>GET /api/members/{member_id}/challenges/{challenge_id}/progress</code> - Check a user's progress on a challenge</li>
            <li><code>POST /api/members/{member_id}/challenges/{challenge_id}/complete</code> - Complete a challenge</li>
        </ul>

        <h2>Notification Endpoints</h2>
        <ul>
            <li><code>GET /api/notifications</code> - Get notifications</li>
            <li><code>POST /api/notifications</code> - Create a new notification</li>
            <li><code>POST /api/notifications/{notification_id}/read</code> - Mark a notification as read</li>
            <li><code>POST /api/notifications/{notification_id}/unread</code> - Mark a notification as unread</li>
            <li><code>POST /api/members/{member_id}/notifications/read</code> - Mark all notifications for a member as read</li>
            <li><code>DELETE /api/notifications/{notification_id}</code> - Delete a notification</li>
            <li><code>POST /api/notifications/cleanup</code> - Delete old notifications</li>
        </ul>

        <h2>Webhook Endpoints</h2>
        <ul>
            <li><code>GET /api/webhooks</code> - Get all webhook configurations</li>
            <li><code>POST /api/webhooks</code> - Add a new webhook</li>
            <li><code>PUT /api/webhooks/{webhook_id}</code> - Update a webhook</li>
            <li><code>DELETE /api/webhooks/{webhook_id}</code> - Delete a webhook</li>
            <li><code>POST /api/webhooks/{webhook_id}/test</code> - Test a webhook</li>
        </ul>

        <h2>Event Attendance Endpoints</h2>
        <ul>
            <li><code>GET /api/events/{event_id}/attendees</code> - Get all attendees for an event</li>
            <li><code>GET /api/members/{member_id}/events</code> - Get all events a member has attended</li>
            <li><code>POST /api/events/{event_id}/attendance</code> - Record a member's attendance</li>
            <li><code>GET /api/events/report</code> - Generate an attendance report</li>
            <li><code>GET /api/events/{event_id}/qr-code</code> - Generate a QR code for event check-in</li>
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
    </body>
    </html>
    """

if __name__ == '__main__':
    app.run(debug=True, port=5002)
