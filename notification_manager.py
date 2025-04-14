import json
import os
import datetime
import logging
import requests
from member_manager import MemberManager
from heartbeat_integration import HeartbeatIntegration

logger = logging.getLogger('blkout_nxt')

class NotificationManager:
    """A class to manage notifications in the BLKOUTHUB system."""

    def __init__(self, file_path="data/notifications.json"):
        """Initialize the NotificationManager with the path to the JSON file."""
        self.file_path = file_path
        self.member_manager = MemberManager()
        self.heartbeat = HeartbeatIntegration()
        self.ensure_file_exists()
        self._load_webhook_config()

    def ensure_file_exists(self):
        """Ensure the JSON file exists, creating it if necessary."""
        # Always create the directory (no harm if it already exists)
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
        logger.info(f"Ensuring directory exists: {os.path.dirname(self.file_path)}")

        if not os.path.exists(self.file_path):
            logger.info(f"Creating new notifications file: {self.file_path}")
            # Create an empty JSON file with initial structure
            with open(self.file_path, 'w') as f:
                json.dump({
                    "notifications": [],
                    "webhooks": self._get_default_webhooks()
                }, f, indent=2)
        else:
            logger.info(f"Notifications file already exists: {self.file_path}")

    def _get_default_webhooks(self):
        """Get the default webhook configurations."""
        return [
            {
                "id": "heartbeat",
                "name": "Heartbeat.chat",
                "url": "https://api.heartbeat.chat/v0/webhooks/rewards",
                "enabled": True,
                "events": ["achievement", "level_up", "challenge_completion", "access_level_change"],
                "headers": {
                    "Content-Type": "application/json",
                    "X-API-Key": "{{HEARTBEAT_API_KEY}}"
                }
            }
        ]

    def _load_webhook_config(self):
        """Load the webhook configurations from the JSON file."""
        try:
            data = self.load_data()
            self.webhooks = data.get("webhooks", self._get_default_webhooks())
        except Exception as e:
            logger.error(f"Error loading webhook config: {str(e)}")
            self.webhooks = self._get_default_webhooks()

    def load_data(self):
        """Load the notifications data from the JSON file."""
        try:
            with open(self.file_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading notifications data: {str(e)}")
            # Return empty data structure if file can't be read
            return {
                "notifications": [],
                "webhooks": self._get_default_webhooks()
            }

    def save_data(self, data):
        """Save the notifications data to the JSON file."""
        try:
            # First write to a temporary file
            temp_file = f"{self.file_path}.tmp"
            with open(temp_file, 'w') as f:
                json.dump(data, f, indent=2)

            # Then rename to the actual file (atomic operation)
            os.replace(temp_file, self.file_path)
            return True
        except Exception as e:
            logger.error(f"Error saving notifications data: {str(e)}")
            return False

    def create_notification(self, member_id, notification_type, title, message, data=None):
        """Create a new notification."""
        try:
            # Get the member details
            member = self.member_manager.get_member(member_id=member_id)
            if not member:
                logger.warning(f"Member not found for ID: {member_id}")
                return {"success": False, "message": "Member not found"}

            # Create a new notification
            notification = {
                "id": f"{notification_type}_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}_{member_id}",
                "member_id": member_id,
                "member_name": member.get("name", "Unknown"),
                "member_email": member.get("email", ""),
                "type": notification_type,
                "title": title,
                "message": message,
                "data": data or {},
                "created_at": datetime.datetime.now().isoformat(),
                "read": False
            }

            # Add the notification to the data
            data = self.load_data()
            if not "notifications" in data:
                data["notifications"] = []

            data["notifications"].append(notification)

            # Save the data
            if not self.save_data(data):
                return {"success": False, "message": "Failed to save notification"}

            # Send the notification to Heartbeat.chat
            self._send_to_heartbeat(notification)

            # Send the notification to webhooks
            self._send_to_webhooks(notification)

            return {
                "success": True,
                "message": "Notification created successfully",
                "notification_id": notification["id"]
            }
        except Exception as e:
            logger.error(f"Error creating notification: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def _send_to_heartbeat(self, notification):
        """Send a notification to Heartbeat.chat."""
        try:
            notification_type = notification.get("type")
            member_id = notification.get("member_id")
            member_name = notification.get("member_name")
            data = notification.get("data", {})

            if notification_type == "achievement":
                achievement = data.get("achievement", {})
                self.heartbeat.send_achievement_notification(member_id, achievement)
                self.heartbeat.post_achievement_announcement(
                    "achievements-channel",
                    member_id,
                    member_name,
                    achievement
                )
            elif notification_type == "challenge_completion":
                challenge = data.get("challenge", {})
                points = data.get("points", 0)
                self.heartbeat.post_challenge_completion(
                    "challenges-channel",
                    member_id,
                    member_name,
                    challenge,
                    points
                )
            elif notification_type == "level_up":
                old_level = data.get("old_level", 0)
                new_level = data.get("new_level", 0)
                # This would use a method in HeartbeatIntegration to post level up announcements
                logger.info(f"Level up notification for user {member_id} ({member_name}): {old_level} -> {new_level}")
            elif notification_type == "access_level_change":
                access_level = data.get("access_level", {})
                self.heartbeat.update_user_access_level(member_id, access_level)

            return {"success": True, "message": "Notification sent to Heartbeat.chat"}
        except Exception as e:
            logger.warning(f"Error sending notification to Heartbeat.chat: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def _send_to_webhooks(self, notification):
        """Send a notification to configured webhooks."""
        try:
            notification_type = notification.get("type")
            
            # Find webhooks that are enabled and subscribed to this event type
            for webhook in self.webhooks:
                if webhook.get("enabled", False) and notification_type in webhook.get("events", []):
                    webhook_url = webhook.get("url")
                    headers = webhook.get("headers", {})
                    
                    # Replace any template variables in headers
                    for key, value in headers.items():
                        if isinstance(value, str) and "{{" in value and "}}" in value:
                            var_name = value.strip("{}").strip()
                            if var_name == "HEARTBEAT_API_KEY":
                                # In a real implementation, this would come from environment variables
                                headers[key] = "dummy_api_key"
                    
                    # Prepare the payload
                    payload = {
                        "notification_id": notification.get("id"),
                        "type": notification_type,
                        "member_id": notification.get("member_id"),
                        "member_name": notification.get("member_name"),
                        "title": notification.get("title"),
                        "message": notification.get("message"),
                        "data": notification.get("data", {}),
                        "timestamp": notification.get("created_at")
                    }
                    
                    # Send the webhook request
                    try:
                        response = requests.post(webhook_url, json=payload, headers=headers, timeout=5)
                        logger.info(f"Webhook sent to {webhook.get('name')}: {response.status_code}")
                    except requests.RequestException as e:
                        logger.warning(f"Error sending webhook to {webhook.get('name')}: {str(e)}")
            
            return {"success": True, "message": "Notifications sent to webhooks"}
        except Exception as e:
            logger.warning(f"Error sending notifications to webhooks: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def get_notifications(self, member_id=None, notification_type=None, limit=50, offset=0, unread_only=False):
        """Get notifications, optionally filtered by member ID, type, and read status."""
        try:
            data = self.load_data()
            notifications = data.get("notifications", [])
            
            # Apply filters
            if member_id:
                notifications = [n for n in notifications if n.get("member_id") == member_id]
            
            if notification_type:
                notifications = [n for n in notifications if n.get("type") == notification_type]
            
            if unread_only:
                notifications = [n for n in notifications if not n.get("read", False)]
            
            # Sort by created_at (newest first)
            notifications.sort(key=lambda x: x.get("created_at", ""), reverse=True)
            
            # Apply pagination
            total = len(notifications)
            notifications = notifications[offset:offset+limit]
            
            return {
                "success": True,
                "notifications": notifications,
                "total": total,
                "limit": limit,
                "offset": offset
            }
        except Exception as e:
            logger.error(f"Error getting notifications: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def mark_notification_read(self, notification_id, read=True):
        """Mark a notification as read or unread."""
        try:
            data = self.load_data()
            
            # Find the notification
            for i, notification in enumerate(data.get("notifications", [])):
                if notification.get("id") == notification_id:
                    # Update the read status
                    data["notifications"][i]["read"] = read
                    
                    # Save the data
                    if self.save_data(data):
                        return {"success": True, "message": f"Notification marked as {'read' if read else 'unread'}"}
                    else:
                        return {"success": False, "message": "Failed to save data"}
            
            return {"success": False, "message": "Notification not found"}
        except Exception as e:
            logger.error(f"Error marking notification as read: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def mark_all_read(self, member_id):
        """Mark all notifications for a member as read."""
        try:
            data = self.load_data()
            
            # Find all notifications for this member
            updated = False
            for i, notification in enumerate(data.get("notifications", [])):
                if notification.get("member_id") == member_id and not notification.get("read", False):
                    # Update the read status
                    data["notifications"][i]["read"] = True
                    updated = True
            
            if updated:
                # Save the data
                if self.save_data(data):
                    return {"success": True, "message": "All notifications marked as read"}
                else:
                    return {"success": False, "message": "Failed to save data"}
            
            return {"success": True, "message": "No unread notifications found"}
        except Exception as e:
            logger.error(f"Error marking all notifications as read: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def delete_notification(self, notification_id):
        """Delete a notification."""
        try:
            data = self.load_data()
            
            # Find the notification
            for i, notification in enumerate(data.get("notifications", [])):
                if notification.get("id") == notification_id:
                    # Remove the notification
                    del data["notifications"][i]
                    
                    # Save the data
                    if self.save_data(data):
                        return {"success": True, "message": "Notification deleted successfully"}
                    else:
                        return {"success": False, "message": "Failed to save data"}
            
            return {"success": False, "message": "Notification not found"}
        except Exception as e:
            logger.error(f"Error deleting notification: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def delete_old_notifications(self, days=30):
        """Delete notifications older than the specified number of days."""
        try:
            data = self.load_data()
            
            # Calculate the cutoff date
            cutoff_date = (datetime.datetime.now() - datetime.timedelta(days=days)).isoformat()
            
            # Filter out old notifications
            original_count = len(data.get("notifications", []))
            data["notifications"] = [n for n in data.get("notifications", []) if n.get("created_at", "") >= cutoff_date]
            deleted_count = original_count - len(data.get("notifications", []))
            
            # Save the data
            if self.save_data(data):
                return {
                    "success": True,
                    "message": f"Deleted {deleted_count} old notifications",
                    "deleted_count": deleted_count
                }
            else:
                return {"success": False, "message": "Failed to save data"}
        except Exception as e:
            logger.error(f"Error deleting old notifications: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def add_webhook(self, name, url, events, headers=None, enabled=True):
        """Add a new webhook configuration."""
        try:
            # Create a new webhook
            webhook = {
                "id": f"webhook_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}",
                "name": name,
                "url": url,
                "enabled": enabled,
                "events": events,
                "headers": headers or {"Content-Type": "application/json"}
            }
            
            # Add the webhook to the data
            data = self.load_data()
            if not "webhooks" in data:
                data["webhooks"] = []
            
            data["webhooks"].append(webhook)
            
            # Save the data
            if self.save_data(data):
                # Reload webhook config
                self._load_webhook_config()
                
                return {
                    "success": True,
                    "message": "Webhook added successfully",
                    "webhook_id": webhook["id"]
                }
            else:
                return {"success": False, "message": "Failed to save data"}
        except Exception as e:
            logger.error(f"Error adding webhook: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def update_webhook(self, webhook_id, name=None, url=None, events=None, headers=None, enabled=None):
        """Update an existing webhook configuration."""
        try:
            data = self.load_data()
            
            # Find the webhook
            for i, webhook in enumerate(data.get("webhooks", [])):
                if webhook.get("id") == webhook_id:
                    # Update the webhook fields
                    if name is not None:
                        data["webhooks"][i]["name"] = name
                    if url is not None:
                        data["webhooks"][i]["url"] = url
                    if events is not None:
                        data["webhooks"][i]["events"] = events
                    if headers is not None:
                        data["webhooks"][i]["headers"] = headers
                    if enabled is not None:
                        data["webhooks"][i]["enabled"] = enabled
                    
                    # Save the data
                    if self.save_data(data):
                        # Reload webhook config
                        self._load_webhook_config()
                        
                        return {"success": True, "message": "Webhook updated successfully"}
                    else:
                        return {"success": False, "message": "Failed to save data"}
            
            return {"success": False, "message": "Webhook not found"}
        except Exception as e:
            logger.error(f"Error updating webhook: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def delete_webhook(self, webhook_id):
        """Delete a webhook configuration."""
        try:
            data = self.load_data()
            
            # Find the webhook
            for i, webhook in enumerate(data.get("webhooks", [])):
                if webhook.get("id") == webhook_id:
                    # Remove the webhook
                    del data["webhooks"][i]
                    
                    # Save the data
                    if self.save_data(data):
                        # Reload webhook config
                        self._load_webhook_config()
                        
                        return {"success": True, "message": "Webhook deleted successfully"}
                    else:
                        return {"success": False, "message": "Failed to save data"}
            
            return {"success": False, "message": "Webhook not found"}
        except Exception as e:
            logger.error(f"Error deleting webhook: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def get_webhooks(self):
        """Get all webhook configurations."""
        try:
            return {
                "success": True,
                "webhooks": self.webhooks
            }
        except Exception as e:
            logger.error(f"Error getting webhooks: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def test_webhook(self, webhook_id):
        """Send a test notification to a webhook."""
        try:
            # Find the webhook
            webhook = None
            for w in self.webhooks:
                if w.get("id") == webhook_id:
                    webhook = w
                    break
            
            if not webhook:
                return {"success": False, "message": "Webhook not found"}
            
            # Create a test notification
            test_notification = {
                "id": f"test_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}",
                "member_id": "test_member",
                "member_name": "Test Member",
                "member_email": "test@example.com",
                "type": "test",
                "title": "Test Notification",
                "message": "This is a test notification from the BLKOUTHUB notification system.",
                "data": {"test": True},
                "created_at": datetime.datetime.now().isoformat(),
                "read": False
            }
            
            # Prepare headers
            headers = webhook.get("headers", {})
            for key, value in headers.items():
                if isinstance(value, str) and "{{" in value and "}}" in value:
                    var_name = value.strip("{}").strip()
                    if var_name == "HEARTBEAT_API_KEY":
                        # In a real implementation, this would come from environment variables
                        headers[key] = "dummy_api_key"
            
            # Prepare the payload
            payload = {
                "notification_id": test_notification.get("id"),
                "type": "test",
                "member_id": test_notification.get("member_id"),
                "member_name": test_notification.get("member_name"),
                "title": test_notification.get("title"),
                "message": test_notification.get("message"),
                "data": test_notification.get("data", {}),
                "timestamp": test_notification.get("created_at")
            }
            
            # Send the webhook request
            try:
                response = requests.post(webhook.get("url"), json=payload, headers=headers, timeout=5)
                return {
                    "success": True,
                    "message": f"Test webhook sent: {response.status_code}",
                    "status_code": response.status_code,
                    "response": response.text[:1000]  # Limit response text to 1000 characters
                }
            except requests.RequestException as e:
                return {"success": False, "message": f"Error sending test webhook: {str(e)}"}
        except Exception as e:
            logger.error(f"Error testing webhook: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

# Example usage
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    notification_manager = NotificationManager()
    
    # Create a test notification
    result = notification_manager.create_notification(
        member_id="test_member",
        notification_type="achievement",
        title="Achievement Unlocked!",
        message="You've earned the 'Test Achievement' badge!",
        data={
            "achievement": {
                "id": "test_achievement",
                "name": "Test Achievement",
                "description": "This is a test achievement"
            }
        }
    )
    
    print(f"Created notification: {result}")
    
    # Get notifications
    result = notification_manager.get_notifications(member_id="test_member")
    print(f"Notifications: {result}")
    
    # Add a webhook
    result = notification_manager.add_webhook(
        name="Test Webhook",
        url="https://example.com/webhook",
        events=["achievement", "level_up", "challenge_completion"],
        headers={"Content-Type": "application/json", "X-API-Key": "test_key"}
    )
    
    print(f"Added webhook: {result}")
    
    # Get webhooks
    result = notification_manager.get_webhooks()
    print(f"Webhooks: {result}")
