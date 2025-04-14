import json
import os
import datetime
import uuid
import time
import logging
from member_manager import MemberManager
from notification_manager import NotificationManager

logger = logging.getLogger('blkout_nxt')

class RewardsManager:
    """A class to manage user rewards and community engagement in the BLKOUTHUB rewards system."""

    def __init__(self, file_path="data/rewards.json"):
        """Initialize the RewardsManager with the path to the JSON file."""
        self.file_path = file_path
        self.member_manager = MemberManager()
        self.notification_manager = NotificationManager()
        self.ensure_file_exists()
        self._load_reward_actions()
        self._load_achievements()
        self._load_access_levels()
        self._load_exclusive_content()
        self._load_community_challenges()

    def ensure_file_exists(self):
        """Ensure the JSON file exists, creating it if necessary."""
        # Always create the directory (no harm if it already exists)
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
        logger.info(f"Ensuring directory exists: {os.path.dirname(self.file_path)}")

        if not os.path.exists(self.file_path):
            logger.info(f"Creating new rewards file: {self.file_path}")
            # Create an empty JSON file with initial structure
            with open(self.file_path, 'w') as f:
                json.dump({
                    "user_rewards": [],
                    "reward_actions": self._get_default_reward_actions(),
                    "achievements": self._get_default_achievements(),
                    "access_levels": self._get_default_access_levels(),
                    "exclusive_content": self._get_default_exclusive_content(),
                    "community_challenges": self._get_default_community_challenges()
                }, f, indent=2)
        else:
            logger.info(f"Rewards file already exists: {self.file_path}")

    def _get_default_reward_actions(self):
        """Get the default reward actions."""
        return [
            {
                "id": "signup",
                "name": "Sign Up",
                "description": "Sign up for BLKOUTHUB",
                "points": 10,
                "category": "onboarding",
                "one_time": True
            },
            {
                "id": "complete_profile",
                "name": "Complete Profile",
                "description": "Complete your BLKOUTHUB profile",
                "points": 20,
                "category": "onboarding",
                "one_time": True
            },
            {
                "id": "complete_survey",
                "name": "Complete Survey",
                "description": "Complete a BLKOUTHUB survey",
                "points": 30,
                "category": "engagement",
                "one_time": False
            },
            {
                "id": "attend_event",
                "name": "Attend Event",
                "description": "Attend a BLKOUTHUB event",
                "points": 50,
                "category": "engagement",
                "one_time": False
            },
            {
                "id": "refer_friend",
                "name": "Refer a Friend",
                "description": "Refer a friend to BLKOUTHUB",
                "points": 25,
                "category": "referral",
                "one_time": False
            },
            {
                "id": "challenge_completion",
                "name": "Complete Challenge",
                "description": "Complete a community challenge",
                "points": 0,  # Points are specified in the challenge itself
                "category": "challenge",
                "one_time": False
            }
        ]

    def _get_default_achievements(self):
        """Get the default achievements."""
        return [
            {
                "id": "welcome",
                "name": "Welcome to BLKOUTHUB",
                "description": "Join the BLKOUTHUB community",
                "badge_image": "welcome_badge.png",
                "category": "onboarding",
                "criteria": {
                    "type": "action",
                    "action_id": "signup",
                    "count": 1
                },
                "points_reward": 5
            },
            {
                "id": "survey_taker",
                "name": "Survey Taker",
                "description": "Complete your first survey",
                "badge_image": "survey_badge.png",
                "category": "engagement",
                "criteria": {
                    "type": "action",
                    "action_id": "complete_survey",
                    "count": 1
                },
                "points_reward": 10
            },
            {
                "id": "survey_master",
                "name": "Survey Master",
                "description": "Complete 5 surveys",
                "badge_image": "survey_master_badge.png",
                "category": "engagement",
                "criteria": {
                    "type": "action",
                    "action_id": "complete_survey",
                    "count": 5
                },
                "points_reward": 50
            },
            {
                "id": "event_attendee",
                "name": "Event Attendee",
                "description": "Attend your first BLKOUTHUB event",
                "badge_image": "event_badge.png",
                "category": "engagement",
                "criteria": {
                    "type": "action",
                    "action_id": "attend_event",
                    "count": 1
                },
                "points_reward": 15
            },
            {
                "id": "event_enthusiast",
                "name": "Event Enthusiast",
                "description": "Attend 3 BLKOUTHUB events",
                "badge_image": "event_enthusiast_badge.png",
                "category": "engagement",
                "criteria": {
                    "type": "action",
                    "action_id": "attend_event",
                    "count": 3
                },
                "points_reward": 30
            },
            {
                "id": "community_builder",
                "name": "Community Builder",
                "description": "Refer 3 friends to BLKOUTHUB",
                "badge_image": "community_builder_badge.png",
                "category": "referral",
                "criteria": {
                    "type": "action",
                    "action_id": "refer_friend",
                    "count": 3
                },
                "points_reward": 40
            },
            {
                "id": "level_5",
                "name": "Level 5 Achieved",
                "description": "Reach level 5 in BLKOUTHUB",
                "badge_image": "level_5_badge.png",
                "category": "level",
                "criteria": {
                    "type": "level",
                    "level": 5
                },
                "points_reward": 100
            }
        ]

    def _load_reward_actions(self):
        """Load the reward actions from the JSON file."""
        try:
            data = self.load_data()
            # Always use the default reward actions to ensure we have the latest version
            default_actions = self._get_default_reward_actions()

            # Update the data with the default actions
            data["reward_actions"] = default_actions
            self.save_data(data)

            self.reward_actions = default_actions
        except Exception as e:
            logger.error(f"Error loading reward actions: {str(e)}")
            self.reward_actions = self._get_default_reward_actions()

    def _load_achievements(self):
        """Load the achievements from the JSON file."""
        try:
            data = self.load_data()
            self.achievements = data.get("achievements", self._get_default_achievements())
        except Exception as e:
            logger.error(f"Error loading achievements: {str(e)}")
            self.achievements = self._get_default_achievements()

    def _load_access_levels(self):
        """Load the access levels from the JSON file."""
        try:
            data = self.load_data()
            self.access_levels = data.get("access_levels", self._get_default_access_levels())
        except Exception as e:
            logger.error(f"Error loading access levels: {str(e)}")
            self.access_levels = self._get_default_access_levels()

    def _load_exclusive_content(self):
        """Load the exclusive content from the JSON file."""
        try:
            data = self.load_data()
            self.exclusive_content = data.get("exclusive_content", self._get_default_exclusive_content())
        except Exception as e:
            logger.error(f"Error loading exclusive content: {str(e)}")
            self.exclusive_content = self._get_default_exclusive_content()

    def _load_community_challenges(self):
        """Load the community challenges from the JSON file."""
        try:
            data = self.load_data()
            self.community_challenges = data.get("community_challenges", self._get_default_community_challenges())
        except Exception as e:
            logger.error(f"Error loading community challenges: {str(e)}")
            self.community_challenges = self._get_default_community_challenges()

    def load_data(self):
        """Load the rewards data from the JSON file."""
        try:
            with open(self.file_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading rewards data: {str(e)}")
            # Return empty data structure if file can't be read
            return {
                "user_rewards": [],
                "reward_actions": self._get_default_reward_actions(),
                "achievements": self._get_default_achievements(),
                "access_levels": self._get_default_access_levels(),
                "exclusive_content": self._get_default_exclusive_content(),
                "community_challenges": self._get_default_community_challenges()
            }

    def save_data(self, data):
        """Save the rewards data to the JSON file."""
        try:
            # First write to a temporary file
            temp_file = f"{self.file_path}.tmp"
            with open(temp_file, 'w') as f:
                json.dump(data, f, indent=2)

            # Then rename to the actual file (atomic operation)
            os.replace(temp_file, self.file_path)
            return True
        except Exception as e:
            logger.error(f"Error saving rewards data: {str(e)}")
            return False

    def get_user_rewards(self, member_id):
        """Get a user's rewards profile."""
        try:
            data = self.load_data()

            # Find the user's rewards profile
            for user_reward in data.get("user_rewards", []):
                if user_reward["member_id"] == member_id:
                    return user_reward

            # If not found, create a new rewards profile
            return self.create_user_rewards(member_id)
        except Exception as e:
            logger.error(f"Error getting user rewards: {str(e)}")
            return None

    def create_user_rewards(self, member_id):
        """Create a new rewards profile for a user."""
        try:
            # Check if the member exists
            member = self.member_manager.get_member(member_id=member_id)
            if not member:
                logger.warning(f"Member not found for ID: {member_id}")
                return None

            data = self.load_data()

            # Check if the user already has a rewards profile
            for user_reward in data.get("user_rewards", []):
                if user_reward["member_id"] == member_id:
                    return user_reward

            # Get the default access level (Bronze)
            default_access = next((level for level in self.access_levels if level.get("min_level", 1) == 1), None)
            default_access_id = default_access.get("id") if default_access else "bronze"

            # Create a new rewards profile
            user_reward = {
                "member_id": member_id,
                "current_points": 0,
                "lifetime_points": 0,
                "level": 1,
                "achievements": [],
                "point_history": [],
                "access_level_id": default_access_id,
                "created_at": datetime.datetime.now().isoformat(),
                "updated_at": datetime.datetime.now().isoformat()
            }

            # Add the rewards profile to the data
            if not "user_rewards" in data:
                data["user_rewards"] = []

            data["user_rewards"].append(user_reward)

            # Save the data
            if self.save_data(data):
                # Update the user's profile in Heartbeat
                if default_access:
                    self.send_heartbeat_notifications(member_id, "access_level", default_access)

                # Award the signup achievement if it's a new user
                self.award_points(member_id, "signup", "Signed up for BLKOUTHUB")
                self.check_achievements(member_id)
                return user_reward
            else:
                return None
        except Exception as e:
            logger.error(f"Error creating user rewards: {str(e)}")
            return None

    def award_points(self, member_id, action_id, description=None, override_points=None):
        """Award points to a user for a specific action."""
        try:
            # Get the reward action
            reward_action = None
            for action in self.reward_actions:
                if action["id"] == action_id:
                    reward_action = action
                    break

            if not reward_action:
                logger.warning(f"Reward action not found: {action_id}")
                return {"success": False, "message": "Reward action not found"}

            # Get the user's rewards profile
            user_reward = self.get_user_rewards(member_id)
            if not user_reward:
                logger.warning(f"User rewards not found for member ID: {member_id}")
                return {"success": False, "message": "User rewards not found"}

            # Check if this is a one-time action that has already been awarded
            if reward_action.get("one_time", False):
                for history in user_reward.get("point_history", []):
                    if history.get("action_id") == action_id:
                        logger.info(f"One-time action already awarded: {action_id}")
                        return {"success": True, "message": "Action already awarded", "points": 0}

            # Award the points (use override_points if provided)
            points = override_points if override_points is not None else reward_action.get("points", 0)

            # Load the data
            data = self.load_data()

            # Find the user's rewards profile
            for i, reward in enumerate(data.get("user_rewards", [])):
                if reward["member_id"] == member_id:
                    # Update the points
                    data["user_rewards"][i]["current_points"] += points
                    data["user_rewards"][i]["lifetime_points"] += points

                    # Add to point history
                    point_history = {
                        "action_id": action_id,
                        "points": points,
                        "description": description or reward_action.get("description", ""),
                        "timestamp": datetime.datetime.now().isoformat()
                    }

                    if not "point_history" in data["user_rewards"][i]:
                        data["user_rewards"][i]["point_history"] = []

                    data["user_rewards"][i]["point_history"].append(point_history)

                    # Update the updated_at timestamp
                    data["user_rewards"][i]["updated_at"] = datetime.datetime.now().isoformat()

                    # Save the data
                    if self.save_data(data):
                        # Check if the user has leveled up
                        self.check_level_up(member_id)

                        # Check if the user has earned any achievements
                        self.check_achievements(member_id)

                        return {
                            "success": True,
                            "message": "Points awarded successfully",
                            "points": points,
                            "current_points": data["user_rewards"][i]["current_points"],
                            "lifetime_points": data["user_rewards"][i]["lifetime_points"]
                        }
                    else:
                        return {"success": False, "message": "Failed to save data"}

            return {"success": False, "message": "User rewards not found"}
        except Exception as e:
            logger.error(f"Error awarding points: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def check_level_up(self, member_id):
        """Check if a user has leveled up based on their points."""
        try:
            # Get the user's rewards profile
            user_reward = self.get_user_rewards(member_id)
            if not user_reward:
                logger.warning(f"User rewards not found for member ID: {member_id}")
                return {"success": False, "message": "User rewards not found"}

            # Define level thresholds
            level_thresholds = [
                0,      # Level 1: 0-99 points
                100,    # Level 2: 100-249 points
                250,    # Level 3: 250-499 points
                500,    # Level 4: 500-999 points
                1000,   # Level 5: 1000-1999 points
                2000,   # Level 6: 2000-3999 points
                4000,   # Level 7: 4000-7999 points
                8000,   # Level 8: 8000-14999 points
                15000,  # Level 9: 15000-24999 points
                25000   # Level 10: 25000+ points
            ]

            # Calculate the new level
            current_points = user_reward.get("current_points", 0)
            new_level = 1

            for i, threshold in enumerate(level_thresholds):
                if current_points >= threshold:
                    new_level = i + 1

            # Check if the level has changed
            current_level = user_reward.get("level", 1)
            if new_level > current_level:
                # Update the level
                data = self.load_data()

                # Find the user's rewards profile
                for i, reward in enumerate(data.get("user_rewards", [])):
                    if reward["member_id"] == member_id:
                        # Update the level
                        data["user_rewards"][i]["level"] = new_level

                        # Update the updated_at timestamp
                        data["user_rewards"][i]["updated_at"] = datetime.datetime.now().isoformat()

                        # Save the data
                        if self.save_data(data):
                            # Send a level up notification
                            member = self.member_manager.get_member(member_id=member_id)
                            if member:
                                self.notification_manager.create_notification(
                                    member_id=member_id,
                                    notification_type="level_up",
                                    title=f"Level Up! You're now level {new_level}",
                                    message=f"Congratulations! You've reached level {new_level} in the BLKOUTHUB community.",
                                    data={
                                        "old_level": current_level,
                                        "new_level": new_level,
                                        "points": user_reward.get("current_points", 0),
                                        "lifetime_points": user_reward.get("lifetime_points", 0)
                                    }
                                )

                            # Check for level-based achievements
                            self.check_achievements(member_id)

                            return {
                                "success": True,
                                "message": "Level updated successfully",
                                "old_level": current_level,
                                "new_level": new_level
                            }
                        else:
                            return {"success": False, "message": "Failed to save data"}

            return {"success": True, "message": "No level change", "level": current_level}
        except Exception as e:
            logger.error(f"Error checking level up: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def check_achievements(self, member_id):
        """Check if a user has earned any achievements."""
        try:
            # Get the user's rewards profile
            user_reward = self.get_user_rewards(member_id)
            if not user_reward:
                logger.warning(f"User rewards not found for member ID: {member_id}")
                return {"success": False, "message": "User rewards not found"}

            # Get the user's current achievements
            current_achievements = user_reward.get("achievements", [])
            current_achievement_ids = [a.get("id") for a in current_achievements]

            # Check each achievement
            new_achievements = []

            for achievement in self.achievements:
                # Skip if the user already has this achievement
                if achievement.get("id") in current_achievement_ids:
                    continue

                # Check if the user meets the criteria
                criteria = achievement.get("criteria", {})
                criteria_type = criteria.get("type")

                if criteria_type == "action":
                    # Action-based achievement
                    action_id = criteria.get("action_id")
                    count = criteria.get("count", 1)

                    # Count how many times the user has performed this action
                    action_count = 0
                    for history in user_reward.get("point_history", []):
                        if history.get("action_id") == action_id:
                            action_count += 1

                    if action_count >= count:
                        new_achievements.append(achievement)

                elif criteria_type == "level":
                    # Level-based achievement
                    level = criteria.get("level", 1)

                    if user_reward.get("level", 1) >= level:
                        new_achievements.append(achievement)

                elif criteria_type == "points":
                    # Points-based achievement
                    points = criteria.get("points", 0)

                    if user_reward.get("lifetime_points", 0) >= points:
                        new_achievements.append(achievement)

            # Award new achievements
            if new_achievements:
                data = self.load_data()

                # Find the user's rewards profile
                for i, reward in enumerate(data.get("user_rewards", [])):
                    if reward["member_id"] == member_id:
                        # Add new achievements
                        for achievement in new_achievements:
                            achievement_record = {
                                "id": achievement.get("id"),
                                "name": achievement.get("name"),
                                "description": achievement.get("description"),
                                "badge_image": achievement.get("badge_image"),
                                "awarded_at": datetime.datetime.now().isoformat()
                            }

                            if not "achievements" in data["user_rewards"][i]:
                                data["user_rewards"][i]["achievements"] = []

                            data["user_rewards"][i]["achievements"].append(achievement_record)

                            # Award points for the achievement
                            points_reward = achievement.get("points_reward", 0)
                            if points_reward > 0:
                                data["user_rewards"][i]["current_points"] += points_reward
                                data["user_rewards"][i]["lifetime_points"] += points_reward

                                # Add to point history
                                point_history = {
                                    "action_id": "achievement",
                                    "points": points_reward,
                                    "description": f"Earned achievement: {achievement.get('name')}",
                                    "timestamp": datetime.datetime.now().isoformat()
                                }

                                if not "point_history" in data["user_rewards"][i]:
                                    data["user_rewards"][i]["point_history"] = []

                                data["user_rewards"][i]["point_history"].append(point_history)

                        # Update the updated_at timestamp
                        data["user_rewards"][i]["updated_at"] = datetime.datetime.now().isoformat()

                        # Save the data
                        if self.save_data(data):
                            # Send notifications for each new achievement
                            for achievement in new_achievements:
                                self.send_heartbeat_notifications(member_id, "achievement", achievement)

                                # Send a notification through the notification system
                                self.notification_manager.create_notification(
                                    member_id=member_id,
                                    notification_type="achievement",
                                    title=f"Achievement Unlocked: {achievement.get('name')}",
                                    message=f"You've earned the {achievement.get('name')} achievement: {achievement.get('description')}",
                                    data={
                                        "achievement": achievement,
                                        "bonus_points": achievement.get("bonus_points", 0)
                                    }
                                )

                            return {
                                "success": True,
                                "message": "Achievements awarded successfully",
                                "achievements": [a.get("name") for a in new_achievements]
                            }
                        else:
                            return {"success": False, "message": "Failed to save data"}

            return {"success": True, "message": "No new achievements"}
        except Exception as e:
            logger.error(f"Error checking achievements: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def get_reward_actions(self):
        """Get all reward actions."""
        return self.reward_actions

    def send_heartbeat_notifications(self, member_id, notification_type, data):
        """Send notifications to Heartbeat.chat."""
        try:
            # Get the member details
            member = self.member_manager.get_member(member_id=member_id)
            if not member:
                logger.warning(f"Member not found for ID: {member_id}")
                return {"success": False, "message": "Member not found"}

            # Import Heartbeat integration
            try:
                from heartbeat_integration import HeartbeatIntegration
                heartbeat = HeartbeatIntegration()

                if notification_type == "achievement":
                    # Send achievement notifications
                    achievement = data

                    # Send a notification to the user
                    heartbeat.send_achievement_notification(member_id, achievement)

                    # Post an announcement to the community channel
                    heartbeat.post_achievement_announcement(
                        "achievements-channel",  # This would be a configuration setting in a real implementation
                        member_id,
                        member.get("name", "Unknown User"),
                        achievement
                    )

                    return {"success": True, "message": "Achievement notifications sent"}

                elif notification_type == "challenge":
                    # Send challenge completion notifications
                    challenge = data.get("challenge")
                    points = data.get("points", 0)

                    # Post a challenge completion announcement
                    heartbeat.post_challenge_completion(
                        "challenges-channel",  # This would be a configuration setting in a real implementation
                        member_id,
                        member.get("name", "Unknown User"),
                        challenge,
                        points
                    )

                    return {"success": True, "message": "Challenge notifications sent"}

                elif notification_type == "access_level":
                    # Update access level in Heartbeat
                    access_level = data

                    # Update the user's access level
                    heartbeat.update_user_access_level(member_id, access_level)

                    # Update the user's profile with the new access level
                    rewards_data = self.get_user_rewards(member_id)
                    if rewards_data:
                        rewards_data["access_level"] = access_level
                        heartbeat.update_user_rewards(member_id, rewards_data)

                    return {"success": True, "message": "Access level notifications sent"}

                else:
                    return {"success": False, "message": f"Unknown notification type: {notification_type}"}

            except ImportError as e:
                logger.warning(f"Heartbeat integration not available: {str(e)}")
                return {"success": False, "message": "Heartbeat integration not available"}

            except Exception as e:
                logger.warning(f"Error sending Heartbeat notifications: {str(e)}")
                return {"success": False, "message": f"Error sending notifications: {str(e)}"}

        except Exception as e:
            logger.error(f"Error in send_heartbeat_notifications: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def get_achievements(self):
        """Get all achievements."""
        return self.achievements

    def get_all_user_rewards(self):
        """Get all user rewards."""
        try:
            data = self.load_data()
            return data.get("user_rewards", [])
        except Exception as e:
            logger.error(f"Error getting all user rewards: {str(e)}")
            return []

    def _get_default_access_levels(self):
        """Get the default access levels."""
        return [
            {
                "id": "bronze",
                "name": "Bronze Access",
                "description": "Basic access for all members",
                "min_level": 1,
                "features": [
                    "General community access",
                    "Public events access",
                    "Basic resources"
                ]
            },
            {
                "id": "silver",
                "name": "Silver Access",
                "description": "Enhanced access for active members",
                "min_level": 3,
                "features": [
                    "All Bronze features",
                    "Special interest groups",
                    "Intermediate resources",
                    "Early event registration"
                ]
            },
            {
                "id": "gold",
                "name": "Gold Access",
                "description": "Premium access for dedicated members",
                "min_level": 5,
                "features": [
                    "All Silver features",
                    "Exclusive workshops",
                    "Advanced resources",
                    "Mentorship opportunities",
                    "Leadership channels"
                ]
            },
            {
                "id": "platinum",
                "name": "Platinum Access",
                "description": "Elite access for top contributors",
                "min_level": 8,
                "features": [
                    "All Gold features",
                    "VIP events",
                    "Expert resources",
                    "Leadership opportunities",
                    "Advisory board eligibility"
                ]
            }
        ]

    def _get_default_exclusive_content(self):
        """Get the default exclusive content."""
        return [
            {
                "id": "beginner_resources",
                "name": "Beginner Resources",
                "description": "Resources for those new to the community",
                "required_level": 1,
                "content_type": "resource_library",
                "access_level": "bronze"
            },
            {
                "id": "community_workshops",
                "name": "Community Workshops",
                "description": "Regular workshops for community members",
                "required_level": 2,
                "content_type": "event_series",
                "access_level": "bronze"
            },
            {
                "id": "special_interest_groups",
                "name": "Special Interest Groups",
                "description": "Groups focused on specific topics",
                "required_level": 3,
                "content_type": "group",
                "access_level": "silver"
            },
            {
                "id": "advanced_resources",
                "name": "Advanced Resources",
                "description": "In-depth resources for experienced members",
                "required_level": 5,
                "content_type": "resource_library",
                "access_level": "gold"
            },
            {
                "id": "leadership_channel",
                "name": "Leadership Channel",
                "description": "Channel for community leaders",
                "required_level": 5,
                "content_type": "channel",
                "access_level": "gold"
            },
            {
                "id": "vip_events",
                "name": "VIP Events",
                "description": "Exclusive events for top contributors",
                "required_level": 8,
                "content_type": "event_series",
                "access_level": "platinum"
            },
            {
                "id": "advisory_board",
                "name": "Advisory Board",
                "description": "Help shape the future of the community",
                "required_level": 8,
                "content_type": "group",
                "access_level": "platinum"
            }
        ]

    def _get_default_community_challenges(self):
        """Get the default community challenges."""
        return [
            {
                "id": "welcome_challenge",
                "name": "Welcome Challenge",
                "description": "Complete your profile and introduce yourself",
                "points": 20,
                "requirements": [
                    {
                        "type": "action",
                        "action_id": "complete_profile",
                        "count": 1
                    }
                ],
                "status": "active",
                "start_date": "2025-01-01T00:00:00",
                "end_date": None
            },
            {
                "id": "survey_challenge",
                "name": "Survey Champion",
                "description": "Complete 3 community surveys",
                "points": 50,
                "requirements": [
                    {
                        "type": "action",
                        "action_id": "complete_survey",
                        "count": 3
                    }
                ],
                "status": "active",
                "start_date": "2025-01-01T00:00:00",
                "end_date": None
            },
            {
                "id": "event_challenge",
                "name": "Event Explorer",
                "description": "Attend 2 community events",
                "points": 75,
                "requirements": [
                    {
                        "type": "action",
                        "action_id": "attend_event",
                        "count": 2
                    }
                ],
                "status": "active",
                "start_date": "2025-01-01T00:00:00",
                "end_date": None
            },
            {
                "id": "referral_challenge",
                "name": "Community Builder",
                "description": "Refer 3 friends to the community",
                "points": 100,
                "requirements": [
                    {
                        "type": "action",
                        "action_id": "refer_friend",
                        "count": 3
                    }
                ],
                "status": "active",
                "start_date": "2025-01-01T00:00:00",
                "end_date": None
            },
            {
                "id": "level_challenge",
                "name": "Level Up",
                "description": "Reach level 5 in the community",
                "points": 150,
                "requirements": [
                    {
                        "type": "level",
                        "level": 5
                    }
                ],
                "status": "active",
                "start_date": "2025-01-01T00:00:00",
                "end_date": None
            }
        ]

    def get_access_levels(self):
        """Get all access levels."""
        return self.access_levels

    def get_exclusive_content(self):
        """Get all exclusive content."""
        return self.exclusive_content

    def get_community_challenges(self):
        """Get all community challenges."""
        return self.community_challenges

    def get_user_access_level(self, member_id):
        """Get a user's access level based on their rewards profile."""
        try:
            # Get the user's rewards profile
            user_reward = self.get_user_rewards(member_id)
            if not user_reward:
                logger.warning(f"User rewards not found for member ID: {member_id}")
                return {"success": False, "message": "User rewards not found"}

            # Get the user's level
            user_level = user_reward.get("level", 1)

            # Determine the highest access level the user qualifies for
            highest_access = None
            for access_level in sorted(self.access_levels, key=lambda x: x.get("min_level", 1), reverse=True):
                if user_level >= access_level.get("min_level", 1):
                    highest_access = access_level
                    break

            if not highest_access:
                # Default to the lowest access level
                highest_access = next((level for level in self.access_levels if level.get("min_level", 1) == 1), None)

            # Check if the user's access level has changed
            current_access_id = user_reward.get("access_level_id")
            new_access_id = highest_access.get("id")

            if current_access_id != new_access_id:
                # Update the user's access level in the rewards data
                data = self.load_data()
                for i, reward in enumerate(data.get("user_rewards", [])):
                    if reward.get("member_id") == member_id:
                        data["user_rewards"][i]["access_level_id"] = new_access_id
                        self.save_data(data)

                        # Update the user's access level in Heartbeat
                        self.send_heartbeat_notifications(member_id, "access_level", highest_access)

                        # Send a notification through the notification system
                        self.notification_manager.create_notification(
                            member_id=member_id,
                            notification_type="access_level_change",
                            title=f"Access Level Upgraded: {highest_access.get('name')}",
                            message=f"You've been upgraded to {highest_access.get('name')}! You now have access to new features and content.",
                            data={
                                "access_level": highest_access,
                                "old_access_id": current_access_id,
                                "new_access_id": new_access_id
                            }
                        )

            return {
                "success": True,
                "access_level": highest_access,
                "user_level": user_level
            }
        except Exception as e:
            logger.error(f"Error getting user access level: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def check_content_access(self, member_id, content_id):
        """Check if a user has access to specific content."""
        try:
            # Get the user's access level
            access_result = self.get_user_access_level(member_id)
            if not access_result["success"]:
                return access_result

            user_access = access_result["access_level"]
            user_level = access_result["user_level"]

            # Find the content
            content = next((c for c in self.exclusive_content if c.get("id") == content_id), None)
            if not content:
                return {"success": False, "message": "Content not found"}

            # Check if the user meets the level requirement
            if user_level < content.get("required_level", 1):
                return {
                    "success": False,
                    "message": f"User level {user_level} is below the required level {content.get('required_level', 1)}",
                    "has_access": False
                }

            # Check if the user has the required access level
            content_access_level = content.get("access_level")
            user_access_id = user_access.get("id")

            # Map access levels to numeric values for comparison
            access_hierarchy = {"bronze": 1, "silver": 2, "gold": 3, "platinum": 4}

            if access_hierarchy.get(user_access_id, 0) < access_hierarchy.get(content_access_level, 0):
                return {
                    "success": False,
                    "message": f"User access level {user_access_id} is below the required level {content_access_level}",
                    "has_access": False
                }

            return {
                "success": True,
                "message": "User has access to this content",
                "has_access": True,
                "content": content
            }
        except Exception as e:
            logger.error(f"Error checking content access: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def get_available_content(self, member_id):
        """Get all content available to a user based on their access level."""
        try:
            # Get the user's access level
            access_result = self.get_user_access_level(member_id)
            if not access_result["success"]:
                return access_result

            user_access = access_result["access_level"]
            user_level = access_result["user_level"]

            # Map access levels to numeric values for comparison
            access_hierarchy = {"bronze": 1, "silver": 2, "gold": 3, "platinum": 4}
            user_access_value = access_hierarchy.get(user_access.get("id"), 0)

            # Filter content based on user's level and access
            available_content = []
            for content in self.exclusive_content:
                content_level = content.get("required_level", 1)
                content_access = content.get("access_level")
                content_access_value = access_hierarchy.get(content_access, 0)

                if user_level >= content_level and user_access_value >= content_access_value:
                    available_content.append(content)

            return {
                "success": True,
                "available_content": available_content,
                "user_access": user_access,
                "user_level": user_level
            }
        except Exception as e:
            logger.error(f"Error getting available content: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def check_challenge_progress(self, member_id, challenge_id):
        """Check a user's progress on a specific challenge."""
        try:
            # Get the user's rewards profile
            user_reward = self.get_user_rewards(member_id)
            if not user_reward:
                logger.warning(f"User rewards not found for member ID: {member_id}")
                return {"success": False, "message": "User rewards not found"}

            # Find the challenge
            challenge = next((c for c in self.community_challenges if c.get("id") == challenge_id), None)
            if not challenge:
                return {"success": False, "message": "Challenge not found"}

            # Check if the challenge is active
            if challenge.get("status") != "active":
                return {
                    "success": False,
                    "message": f"Challenge is not active (status: {challenge.get('status')})",
                    "completed": False,
                    "progress": 0
                }

            # Check if the challenge has date restrictions
            now = datetime.datetime.now().isoformat()
            start_date = challenge.get("start_date")
            end_date = challenge.get("end_date")

            if start_date and start_date > now:
                return {
                    "success": False,
                    "message": "Challenge has not started yet",
                    "completed": False,
                    "progress": 0
                }

            if end_date and end_date < now:
                return {
                    "success": False,
                    "message": "Challenge has ended",
                    "completed": False,
                    "progress": 0
                }

            # Check the user's progress on the challenge requirements
            requirements = challenge.get("requirements", [])
            progress = 0
            completed = True
            requirement_status = []

            for req in requirements:
                req_type = req.get("type")

                if req_type == "action":
                    action_id = req.get("action_id")
                    required_count = req.get("count", 1)

                    # Count how many times the user has performed this action
                    action_count = 0
                    for history in user_reward.get("point_history", []):
                        if history.get("action_id") == action_id:
                            action_count += 1

                    req_progress = min(action_count / required_count, 1.0) if required_count > 0 else 0
                    req_completed = action_count >= required_count

                    requirement_status.append({
                        "type": "action",
                        "action_id": action_id,
                        "required": required_count,
                        "current": action_count,
                        "progress": req_progress,
                        "completed": req_completed
                    })

                    progress += req_progress / len(requirements)
                    completed = completed and req_completed

                elif req_type == "level":
                    required_level = req.get("level", 1)
                    user_level = user_reward.get("level", 1)

                    req_progress = min(user_level / required_level, 1.0) if required_level > 0 else 0
                    req_completed = user_level >= required_level

                    requirement_status.append({
                        "type": "level",
                        "required": required_level,
                        "current": user_level,
                        "progress": req_progress,
                        "completed": req_completed
                    })

                    progress += req_progress / len(requirements)
                    completed = completed and req_completed

            return {
                "success": True,
                "challenge": challenge,
                "completed": completed,
                "progress": progress,
                "requirements": requirement_status
            }
        except Exception as e:
            logger.error(f"Error checking challenge progress: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def get_user_challenges(self, member_id):
        """Get all challenges and the user's progress on each."""
        try:
            # Get the user's rewards profile
            user_reward = self.get_user_rewards(member_id)
            if not user_reward:
                logger.warning(f"User rewards not found for member ID: {member_id}")
                return {"success": False, "message": "User rewards not found"}

            # Check progress on each active challenge
            challenge_progress = []
            for challenge in self.community_challenges:
                if challenge.get("status") == "active":
                    progress = self.check_challenge_progress(member_id, challenge.get("id"))
                    if progress["success"]:
                        challenge_progress.append({
                            "challenge": challenge,
                            "completed": progress["completed"],
                            "progress": progress["progress"],
                            "requirements": progress["requirements"]
                        })

            return {
                "success": True,
                "challenges": challenge_progress
            }
        except Exception as e:
            logger.error(f"Error getting user challenges: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def complete_challenge(self, member_id, challenge_id):
        """Complete a challenge and award points if all requirements are met."""
        try:
            # Check the user's progress on the challenge
            progress = self.check_challenge_progress(member_id, challenge_id)

            if not progress["success"]:
                return progress

            # If the challenge is not completed, return an error
            if not progress["completed"]:
                return {
                    "success": False,
                    "message": "Challenge requirements not met",
                    "progress": progress["progress"],
                    "requirements": progress["requirements"]
                }

            # Award points for completing the challenge
            challenge = progress["challenge"]
            points = challenge.get("points", 0)

            # Award the points
            result = self.award_points(
                member_id,
                "challenge_completion",
                f"Completed challenge: {challenge.get('name')}",
                points
            )

            if not result["success"]:
                return result

            # Send challenge completion notification
            self.send_heartbeat_notifications(member_id, "challenge", {
                "challenge": challenge,
                "points": points
            })

            # Send a notification through the notification system
            self.notification_manager.create_notification(
                member_id=member_id,
                notification_type="challenge_completion",
                title=f"Challenge Completed: {challenge.get('name')}",
                message=f"You've completed the {challenge.get('name')} challenge and earned {points} points!",
                data={
                    "challenge": challenge,
                    "points": points
                }
            )

            return {
                "success": True,
                "message": f"Challenge completed! Awarded {points} points.",
                "points_awarded": points,
                "current_points": result["current_points"],
                "challenge": challenge
            }
        except Exception as e:
            logger.error(f"Error completing challenge: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

# Example usage
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)

    rewards_manager = RewardsManager()

    # Add a test member
    member_manager = MemberManager()
    result = member_manager.add_member("Test User", "test@example.com", "Ally")
    member_id = result["member_id"]

    # Create a rewards profile
    user_reward = rewards_manager.create_user_rewards(member_id)
    print(f"Created rewards profile: {user_reward}")

    # Award points
    result = rewards_manager.award_points(member_id, "complete_survey", "Completed the ally survey")
    print(f"Awarded points: {result}")

    # Check achievements
    result = rewards_manager.check_achievements(member_id)
    print(f"Checked achievements: {result}")

    # Get user rewards
    user_reward = rewards_manager.get_user_rewards(member_id)
    print(f"User rewards: {user_reward}")
