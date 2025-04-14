import requests
import json
import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger('blkout_nxt')

class HeartbeatIntegration:
    """A class to handle integration with the Heartbeat.chat API."""

    def __init__(self):
        """Initialize the HeartbeatIntegration with API credentials."""
        self.api_url = os.environ.get('HEARTBEAT_API_URL', 'https://api.heartbeat.chat/v0')
        self.api_key = os.environ.get('HEARTBEAT_API_KEY', '')

        if not self.api_key:
            logger.warning("Heartbeat API key not set. Integration will not function.")

    def _make_request(self, method, endpoint, data=None):
        """Make a request to the Heartbeat API."""
        if not self.api_key:
            logger.error("Cannot make Heartbeat API request: API key not set")
            return {"success": False, "message": "API key not set"}

        url = f"{self.api_url}{endpoint}"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, headers=headers, json=data)
            elif method == 'PUT':
                response = requests.put(url, headers=headers, json=data)
            else:
                logger.error(f"Unsupported HTTP method: {method}")
                return {"success": False, "message": f"Unsupported HTTP method: {method}"}

            response.raise_for_status()
            return {"success": True, "data": response.json()}
        except requests.exceptions.RequestException as e:
            logger.error(f"Heartbeat API request failed: {str(e)}")
            return {"success": False, "message": f"API request failed: {str(e)}"}

    def get_user(self, user_id):
        """Get a user from Heartbeat by ID."""
        return self._make_request('GET', f"/users/{user_id}")

    def find_user_by_email(self, email):
        """Find a user in Heartbeat by email."""
        result = self._make_request('GET', f"/find/users?email={email}")

        # If the user is not found, return a more helpful message
        if not result["success"] and "404" in str(result.get("message", "")):
            logger.info(f"User with email {email} not found in Heartbeat. This is normal for test users.")
            return {"success": False, "message": f"User with email {email} not found in Heartbeat"}

        return result

    def update_user_profile(self, user_id, profile_data):
        """Update a user's profile in Heartbeat."""
        return self._make_request('POST', "/users", {
            "id": user_id,
            **profile_data
        })

    def update_user_rewards(self, user_id, rewards_data):
        """Update a user's rewards information in Heartbeat.

        This method updates the user's profile with rewards information.
        Since Heartbeat doesn't have native rewards fields, we'll use the
        profile fields to store this information.
        """
        # Get current user profile
        user_result = self.get_user(user_id)
        if not user_result["success"]:
            return user_result

        user = user_result["data"]

        # Prepare profile update with rewards information
        profile_update = {
            "id": user_id,
            "bio": self._format_rewards_bio(user.get("bio", ""), rewards_data)
        }

        # Update the user's profile
        return self.update_user_profile(user_id, profile_update)

    def _format_rewards_bio(self, current_bio, rewards_data):
        """Format rewards information for inclusion in the user's bio."""
        # Extract rewards data
        level = rewards_data.get("level", 1)
        current_points = rewards_data.get("current_points", 0)
        lifetime_points = rewards_data.get("lifetime_points", 0)
        achievements = rewards_data.get("achievements", [])
        access_level = rewards_data.get("access_level", {})
        challenges = rewards_data.get("challenges", [])

        # Create rewards section
        rewards_section = f"""
🏆 **BLKOUTHUB Rewards**
Level: {level}
Points: {current_points} (Lifetime: {lifetime_points})
"""

        # Add access level information if available
        if access_level:
            rewards_section += f"""

🔑 **Access Level**: {access_level.get('name', 'Bronze Access')}
{access_level.get('description', '')}

Features:
"""
            for feature in access_level.get('features', []):
                rewards_section += f"- {feature}\n"

        # Add achievements
        rewards_section += "\n🎖️ **Achievements**:\n"
        if achievements:
            for achievement in achievements:
                rewards_section += f"- {achievement.get('name')}: {achievement.get('description')}\n"
        else:
            rewards_section += "No achievements yet. Keep participating to earn badges!\n"

        # Add challenges if available
        if challenges:
            rewards_section += "\n🎯 **Challenges**:\n"
            for challenge in challenges:
                progress = challenge.get('progress', 0)
                progress_percent = int(progress * 100)
                status = "✅ Completed" if challenge.get('completed', False) else f"⏳ In Progress ({progress_percent}%)"
                rewards_section += f"- {challenge.get('challenge', {}).get('name')}: {status}\n"

        # Check if the bio already has a rewards section
        if "🏆 **BLKOUTHUB Rewards**" in current_bio:
            # Replace the existing rewards section
            bio_parts = current_bio.split("🏆 **BLKOUTHUB Rewards**")
            user_bio = bio_parts[0].strip()

            # Find the end of the rewards section
            if len(bio_parts) > 1:
                remaining_parts = bio_parts[1].split("\n\n", 1)
                if len(remaining_parts) > 1:
                    user_bio += "\n\n" + remaining_parts[1]
        else:
            # Use the current bio as is
            user_bio = current_bio

        # Combine user bio with rewards section
        if user_bio:
            return f"{user_bio}\n\n{rewards_section}"
        else:
            return rewards_section

    def send_achievement_notification(self, user_id, achievement):
        """Send a notification to a user about a new achievement."""
        # This would use the Heartbeat notifications API if available
        # For now, we'll just log it
        logger.info(f"Achievement notification for user {user_id}: {achievement.get('name')}")

        # In a real implementation, we would use the Heartbeat API to send a notification
        # Example API call (commented out as the endpoint may not exist):
        # return self._make_request('POST', f"/users/{user_id}/notifications", {
        #     "title": "New Achievement Unlocked!",
        #     "body": f"You've earned the {achievement.get('name')} achievement: {achievement.get('description')}",
        #     "type": "achievement",
        #     "data": achievement
        # })

        return {"success": True, "message": "Notification logged (API not implemented)"}

    def post_achievement_announcement(self, channel_id, user_id, user_name, achievement):
        """Post an announcement about a user's achievement to a channel."""
        # This would use the Heartbeat channels API to post a message
        # For now, we'll just log it
        logger.info(f"Achievement announcement for channel {channel_id}: User {user_id} ({user_name}) earned {achievement.get('name')}")

        # In a real implementation, we would use the Heartbeat API to post a message
        # Example API call (commented out as the endpoint may not exist):
        # message = f"🎖️ **Achievement Unlocked!** 🎖️\n\n{user_name} has earned the **{achievement.get('name')}** achievement!\n\n*{achievement.get('description')}*"
        # return self._make_request('POST', f"/channels/{channel_id}/messages", {
        #     "content": message,
        #     "type": "achievement_announcement"
        # })

        return {"success": True, "message": "Announcement logged (API not implemented)"}

    def create_leaderboard_thread(self, channel_id, leaderboard_data):
        """Create a thread in a channel with leaderboard information."""
        # This would use the Heartbeat threads API to create a leaderboard post
        # For now, we'll just log it
        logger.info(f"Leaderboard thread for channel {channel_id} with {len(leaderboard_data)} entries")

        # In a real implementation, we would use the Heartbeat API to create a thread
        # Example API call (commented out as the endpoint may not exist):
        #
        # # Format the leaderboard content
        # content = "🏆 **BLKOUTHUB Leaderboard** 🏆\n\nTop contributors this week:\n\n"
        #
        # for i, entry in enumerate(leaderboard_data[:10]):
        #     content += f"{i+1}. **{entry.get('name')}** - Level {entry.get('level')} - {entry.get('points')} points\n"
        #
        # return self._make_request('POST', f"/channels/{channel_id}/threads", {
        #     "title": "Weekly Leaderboard",
        #     "content": content,
        #     "type": "leaderboard"
        # })

        return {"success": True, "message": "Leaderboard thread logged (API not implemented)"}

    def post_challenge_completion(self, channel_id, user_id, user_name, challenge, points_awarded):
        """Post an announcement about a user completing a challenge."""
        # This would use the Heartbeat channels API to post a message
        # For now, we'll just log it
        logger.info(f"Challenge completion for channel {channel_id}: User {user_id} ({user_name}) completed {challenge.get('name')} and earned {points_awarded} points")

        # In a real implementation, we would use the Heartbeat API to post a message
        # Example API call (commented out as the endpoint may not exist):
        # message = f"🎯 **Challenge Completed!** 🎯\n\n{user_name} has completed the **{challenge.get('name')}** challenge and earned **{points_awarded} points**!\n\n*{challenge.get('description')}*"
        # return self._make_request('POST', f"/channels/{channel_id}/messages", {
        #     "content": message,
        #     "type": "challenge_completion"
        # })

        return {"success": True, "message": "Challenge completion logged (API not implemented)"}

    def update_user_access_level(self, user_id, access_level):
        """Update a user's access level in Heartbeat."""
        # This would use the Heartbeat API to update user roles or groups
        # For now, we'll just log it
        logger.info(f"Access level update for user {user_id}: {access_level.get('name')}")

        # In a real implementation, we would use the Heartbeat API to update user roles
        # Example API call (commented out as the endpoint may not exist):
        # return self._make_request('POST', f"/users/{user_id}/roles", {
        #     "roles": [access_level.get('id')]
        # })

        return {"success": True, "message": "Access level update logged (API not implemented)"}

    def create_challenge_dashboard(self, channel_id, challenges_data):
        """Create a challenge dashboard in a channel."""
        # This would use the Heartbeat API to create a dashboard
        # For now, we'll just log it
        logger.info(f"Challenge dashboard for channel {channel_id} with {len(challenges_data)} challenges")

        # In a real implementation, we would use the Heartbeat API to create a dashboard
        # Example API call (commented out as the endpoint may not exist):
        #
        # # Format the challenge dashboard content
        # content = "🎯 **BLKOUTHUB Challenges** 🎯\n\nComplete these challenges to earn points and rewards!\n\n"
        #
        # for challenge in challenges_data:
        #     content += f"**{challenge.get('name')}** - {challenge.get('points')} points\n"
        #     content += f"*{challenge.get('description')}*\n\n"
        #
        # return self._make_request('POST', f"/channels/{channel_id}/dashboards", {
        #     "title": "Community Challenges",
        #     "content": content,
        #     "type": "challenges"
        # })

        return {"success": True, "message": "Challenge dashboard logged (API not implemented)"}

# Example usage
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)

    heartbeat = HeartbeatIntegration()

    # Example: Find a user by email
    result = heartbeat.find_user_by_email("test@example.com")
    print(f"Find user result: {result}")

    # Example: Update rewards for a user with access level and challenges
    rewards_data = {
        "level": 3,
        "current_points": 275,
        "lifetime_points": 350,
        "achievements": [
            {
                "name": "Welcome to BLKOUTHUB",
                "description": "Join the BLKOUTHUB community"
            },
            {
                "name": "Survey Taker",
                "description": "Complete your first survey"
            }
        ],
        "access_level": {
            "id": "silver",
            "name": "Silver Access",
            "description": "Enhanced access for active members",
            "features": [
                "All Bronze features",
                "Special interest groups",
                "Intermediate resources",
                "Early event registration"
            ]
        },
        "challenges": [
            {
                "challenge": {
                    "name": "Survey Champion",
                    "description": "Complete 3 community surveys"
                },
                "progress": 0.67,
                "completed": False
            },
            {
                "challenge": {
                    "name": "Event Explorer",
                    "description": "Attend 2 community events"
                },
                "progress": 1.0,
                "completed": True
            }
        ]
    }

    # Note: This would need a valid user ID
    result = heartbeat.update_user_rewards("example_user_id", rewards_data)
    print(f"Update rewards result: {result}")

    # Example: Post an achievement announcement
    result = heartbeat.post_achievement_announcement("announcements-channel", "example_user_id", "Example User", {
        "name": "Survey Taker",
        "description": "Complete your first survey"
    })
    print(f"Achievement announcement result: {result}")

    # Example: Create a leaderboard thread
    leaderboard_data = [
        {"name": "User 1", "level": 5, "points": 1000},
        {"name": "User 2", "level": 4, "points": 800},
        {"name": "User 3", "level": 3, "points": 600}
    ]
    result = heartbeat.create_leaderboard_thread("leaderboard-channel", leaderboard_data)
    print(f"Leaderboard thread result: {result}")
