from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
import os
import json
import logging
import requests
import datetime
from functools import wraps
from member_manager import MemberManager
from rewards_manager import RewardsManager
from event_manager import EventManager
from notification_manager import NotificationManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('dashboard')

app = Flask(__name__, template_folder='templates', static_folder='static')
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'blkouthub-dashboard-secret-key')

# Initialize managers
member_manager = MemberManager()
rewards_manager = RewardsManager()
event_manager = EventManager()
notification_manager = NotificationManager()

# Load admin users from JSON file
def load_admin_users():
    admin_file = os.path.join('data', 'admin_users.json')
    if os.path.exists(admin_file):
        with open(admin_file, 'r') as f:
            admin_data = json.load(f)
            return {user['username']: user for user in admin_data.get('users', [])}
    else:
        # Default admin users if file doesn't exist
        return {
            'admin': {
                'username': 'admin',
                'password_hash': '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',  # sha256('admin')
                'salt': '',
                'name': 'Admin User',
                'role': 'admin'
            },
            'manager': {
                'username': 'manager',
                'password_hash': '94e3cb3edce0cd5a0d63dd7ca517c9bef0d93fe8383d68b0820e239461171f1d',  # sha256('community')
                'salt': '',
                'name': 'Community Manager',
                'role': 'manager'
            }
        }

ADMIN_USERS = load_admin_users()

# Login required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            flash('Please log in to access this page', 'warning')
            return redirect(url_for('login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function

# Routes
@app.route('/')
def index():
    if 'user' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        if username in ADMIN_USERS:
            user = ADMIN_USERS[username]
            # Hash the password with the user's salt
            import hashlib
            password_hash = hashlib.sha256((password + user.get('salt', '')).encode()).hexdigest()

            if password_hash == user['password_hash']:
                session['user'] = {
                    'username': username,
                    'name': user['name'],
                    'role': user['role']
                }
                flash(f'Welcome, {user["name"]}!', 'success')
                return redirect(url_for('dashboard'))

        flash('Invalid username or password', 'danger')

    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user', None)
    flash('You have been logged out', 'info')
    return redirect(url_for('login'))

@app.route('/dashboard')
@login_required
def dashboard():
    # Get system statistics
    try:
        # Get member count
        members = member_manager.get_all_members()
        member_count = len(members)

        # Get rewards statistics
        all_rewards = rewards_manager.get_all_user_rewards()
        total_points = sum(reward.get('current_points', 0) for reward in all_rewards)
        avg_points = total_points / member_count if member_count > 0 else 0

        # Get achievement statistics
        achievements = rewards_manager.get_achievements()
        achievement_count = len(achievements)

        # Get event statistics
        events = event_manager.get_events()
        event_count = len(events)
        upcoming_events = len([e for e in events if e.get('event_date', '') > datetime.datetime.now().isoformat()])

        # Get notification statistics
        notifications = notification_manager.get_notifications()
        notification_count = notifications.get('total', 0)
        unread_notifications = len([n for n in notifications.get('notifications', []) if not n.get('read', False)])

        # Get webhook statistics
        webhooks = notification_manager.get_webhooks()
        webhook_count = len(webhooks.get('webhooks', []))

        # Get top members by points
        top_members = sorted(all_rewards, key=lambda x: x.get('current_points', 0), reverse=True)[:5]

        # Add member details to top members
        for member in top_members:
            member_details = member_manager.get_member(member_id=member.get('member_id'))
            if member_details:
                member['name'] = member_details.get('name', 'Unknown')
                member['email'] = member_details.get('email', '')
                member['member_type'] = member_details.get('member_type', '')

        # Get recent notifications
        recent_notifications = notifications.get('notifications', [])[:5]

        # Get upcoming events
        upcoming_events_list = sorted([e for e in events if e.get('event_date', '') > datetime.datetime.now().isoformat()],
                                     key=lambda x: x.get('event_date', ''))[:5]

        return render_template('dashboard.html',
                              member_count=member_count,
                              total_points=total_points,
                              avg_points=avg_points,
                              achievement_count=achievement_count,
                              event_count=event_count,
                              upcoming_events=upcoming_events,
                              notification_count=notification_count,
                              unread_notifications=unread_notifications,
                              webhook_count=webhook_count,
                              top_members=top_members,
                              recent_notifications=recent_notifications,
                              upcoming_events_list=upcoming_events_list)
    except Exception as e:
        logger.error(f"Error loading dashboard: {str(e)}")
        flash(f"Error loading dashboard: {str(e)}", 'danger')
        return render_template('dashboard.html', error=str(e))

@app.route('/members')
@login_required
def members():
    try:
        members = member_manager.get_all_members()

        # Add rewards data to each member
        for member in members:
            rewards = rewards_manager.get_user_rewards(member.get('id'))
            if rewards:
                member['level'] = rewards.get('level', 1)
                member['points'] = rewards.get('current_points', 0)
                member['achievements'] = len(rewards.get('achievements', []))
            else:
                member['level'] = 1
                member['points'] = 0
                member['achievements'] = 0

        return render_template('members.html', members=members)
    except Exception as e:
        logger.error(f"Error loading members: {str(e)}")
        flash(f"Error loading members: {str(e)}", 'danger')
        return render_template('members.html', error=str(e))

@app.route('/members/<member_id>')
@login_required
def member_detail(member_id):
    try:
        member = member_manager.get_member(member_id=member_id)
        if not member:
            flash('Member not found', 'warning')
            return redirect(url_for('members'))

        # Get rewards data
        rewards = rewards_manager.get_user_rewards(member_id)

        # Get access level
        access_level_result = rewards_manager.get_user_access_level(member_id)
        access_level = access_level_result.get('access_level') if access_level_result.get('success') else None

        # Get challenges
        challenges_result = rewards_manager.get_user_challenges(member_id)
        challenges = challenges_result.get('challenges') if challenges_result.get('success') else []

        # Get events attended
        events_attended = event_manager.get_member_events(member_id)

        # Get notifications
        notifications_result = notification_manager.get_notifications(member_id=member_id)
        notifications = notifications_result.get('notifications') if notifications_result.get('success') else []

        return render_template('member_detail.html',
                              member=member,
                              rewards=rewards,
                              access_level=access_level,
                              challenges=challenges,
                              events_attended=events_attended,
                              notifications=notifications)
    except Exception as e:
        logger.error(f"Error loading member details: {str(e)}")
        flash(f"Error loading member details: {str(e)}", 'danger')
        return redirect(url_for('members'))

@app.route('/events')
@login_required
def events():
    try:
        events = event_manager.get_events()

        # Sort events by date (newest first)
        events.sort(key=lambda x: x.get('event_date', ''), reverse=True)

        return render_template('events.html', events=events)
    except Exception as e:
        logger.error(f"Error loading events: {str(e)}")
        flash(f"Error loading events: {str(e)}", 'danger')
        return render_template('events.html', error=str(e))

@app.route('/events/<event_id>')
@login_required
def event_detail(event_id):
    try:
        event = event_manager.get_event(event_id)
        if not event:
            flash('Event not found', 'warning')
            return redirect(url_for('events'))

        # Get attendees
        attendees = event_manager.get_event_attendees(event_id)

        return render_template('event_detail.html', event=event, attendees=attendees)
    except Exception as e:
        logger.error(f"Error loading event details: {str(e)}")
        flash(f"Error loading event details: {str(e)}", 'danger')
        return redirect(url_for('events'))

@app.route('/rewards')
@login_required
def rewards():
    try:
        # Get reward actions
        reward_actions = rewards_manager.get_reward_actions()

        # Get achievements
        achievements = rewards_manager.get_achievements()

        # Get access levels
        access_levels = rewards_manager.get_access_levels()

        # Get challenges
        challenges = rewards_manager.get_community_challenges()

        # Get exclusive content
        exclusive_content = rewards_manager.get_exclusive_content()

        return render_template('rewards.html',
                              reward_actions=reward_actions,
                              achievements=achievements,
                              access_levels=access_levels,
                              challenges=challenges,
                              exclusive_content=exclusive_content)
    except Exception as e:
        logger.error(f"Error loading rewards: {str(e)}")
        flash(f"Error loading rewards: {str(e)}", 'danger')
        return render_template('rewards.html', error=str(e))

@app.route('/notifications')
@login_required
def notifications():
    try:
        # Get all notifications
        notifications_result = notification_manager.get_notifications()
        notifications = notifications_result.get('notifications') if notifications_result.get('success') else []

        # Get webhooks
        webhooks_result = notification_manager.get_webhooks()
        webhooks = webhooks_result.get('webhooks') if webhooks_result.get('success') else []

        return render_template('notifications.html', notifications=notifications, webhooks=webhooks)
    except Exception as e:
        logger.error(f"Error loading notifications: {str(e)}")
        flash(f"Error loading notifications: {str(e)}", 'danger')
        return render_template('notifications.html', error=str(e))

@app.route('/api/members/<member_id>/award-points', methods=['POST'])
@login_required
def api_award_points(member_id):
    try:
        data = request.json
        if not data:
            return jsonify({"success": False, "message": "No data received"}), 400

        action_id = data.get('action_id')
        description = data.get('description')
        points = data.get('points')

        if not action_id:
            return jsonify({"success": False, "message": "action_id is required"}), 400

        result = rewards_manager.award_points(
            member_id=member_id,
            action_id=action_id,
            description=description,
            override_points=points
        )

        return jsonify(result), 200 if result.get('success') else 400
    except Exception as e:
        logger.error(f"Error awarding points: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/members/<member_id>/check-achievements', methods=['POST'])
@login_required
def api_check_achievements(member_id):
    try:
        result = rewards_manager.check_achievements(member_id)
        return jsonify(result), 200 if result.get('success') else 400
    except Exception as e:
        logger.error(f"Error checking achievements: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/members/<member_id>/complete-challenge/<challenge_id>', methods=['POST'])
@login_required
def api_complete_challenge(member_id, challenge_id):
    try:
        result = rewards_manager.complete_challenge(member_id, challenge_id)
        return jsonify(result), 200 if result.get('success') else 400
    except Exception as e:
        logger.error(f"Error completing challenge: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/events/<event_id>/record-attendance', methods=['POST'])
@login_required
def api_record_attendance(event_id):
    try:
        data = request.json
        if not data:
            return jsonify({"success": False, "message": "No data received"}), 400

        member_id = data.get('member_id')
        check_in_method = data.get('check_in_method', 'manual')
        notes = data.get('notes')

        if not member_id:
            return jsonify({"success": False, "message": "member_id is required"}), 400

        result = event_manager.record_attendance(
            event_id=event_id,
            member_id=member_id,
            check_in_method=check_in_method,
            notes=notes
        )

        return jsonify(result), 200 if result.get('success') else 400
    except Exception as e:
        logger.error(f"Error recording attendance: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/notifications/<notification_id>/read', methods=['POST'])
@login_required
def api_mark_notification_read(notification_id):
    try:
        result = notification_manager.mark_notification_read(notification_id, read=True)
        return jsonify(result), 200 if result.get('success') else 400
    except Exception as e:
        logger.error(f"Error marking notification as read: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/notifications/cleanup', methods=['POST'])
@login_required
def api_cleanup_notifications():
    try:
        days = int(request.json.get('days', 30))
        result = notification_manager.delete_old_notifications(days=days)
        return jsonify(result), 200 if result.get('success') else 400
    except Exception as e:
        logger.error(f"Error cleaning up notifications: {str(e)}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

if __name__ == '__main__':
    # Create templates directory if it doesn't exist
    os.makedirs('templates', exist_ok=True)

    # Create static directory if it doesn't exist
    os.makedirs('static', exist_ok=True)

    app.run(host='0.0.0.0', port=5003, debug=True)
