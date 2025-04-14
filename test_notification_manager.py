import unittest
import os
import json
import shutil
from notification_manager import NotificationManager
from member_manager import MemberManager

class TestNotificationManager(unittest.TestCase):
    """Test cases for the NotificationManager class."""

    def setUp(self):
        """Set up test environment."""
        # Create a test directory
        self.test_dir = "test_data"
        os.makedirs(self.test_dir, exist_ok=True)

        # Create test file paths
        self.test_members_file = os.path.join(self.test_dir, "test_members.json")
        self.test_notifications_file = os.path.join(self.test_dir, "test_notifications.json")

        # Initialize managers with test files
        self.member_manager = MemberManager(file_path=self.test_members_file)
        self.notification_manager = NotificationManager(file_path=self.test_notifications_file)

        # Create a test member
        result = self.member_manager.add_member(
            name="Test User",
            email="test@example.com",
            member_type="Ally"
        )
        self.test_member_id = result["member_id"]

    def tearDown(self):
        """Clean up test environment."""
        # Remove the test directory and its contents
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)

    def test_create_notification(self):
        """Test creating a notification."""
        # Create a test notification
        result = self.notification_manager.create_notification(
            member_id=self.test_member_id,
            notification_type="achievement",
            title="Test Achievement",
            message="You've earned a test achievement!",
            data={
                "achievement": {
                    "id": "test_achievement",
                    "name": "Test Achievement",
                    "description": "This is a test achievement"
                }
            }
        )

        # Check if the operation was successful
        self.assertTrue(result["success"])
        self.assertIn("notification_id", result)

        # Get the notification ID
        notification_id = result["notification_id"]

        # Get all notifications for the member
        notifications = self.notification_manager.get_notifications(member_id=self.test_member_id)

        # Check if the notification was created correctly
        self.assertTrue(notifications["success"])
        self.assertGreaterEqual(notifications["total"], 1)
        self.assertGreaterEqual(len(notifications["notifications"]), 1)

        # Find the notification we just created
        found_notification = False
        for notification in notifications["notifications"]:
            if notification["id"] == notification_id:
                found_notification = True
                self.assertEqual(notification["member_id"], self.test_member_id)
                self.assertEqual(notification["type"], "achievement")
                self.assertEqual(notification["title"], "Test Achievement")
                self.assertEqual(notification["message"], "You've earned a test achievement!")
                self.assertFalse(notification["read"])
                break

        self.assertTrue(found_notification, "Created notification not found")

    def test_create_notification_nonexistent_member(self):
        """Test creating a notification for a nonexistent member."""
        # Try to create a notification for a nonexistent member
        result = self.notification_manager.create_notification(
            member_id="nonexistent",
            notification_type="achievement",
            title="Test Achievement",
            message="You've earned a test achievement!",
            data={}
        )

        # Check if the operation failed
        self.assertFalse(result["success"])
        self.assertIn("not found", result["message"])

    def test_get_notifications(self):
        """Test getting notifications."""
        # Create some test notifications
        self.notification_manager.create_notification(
            member_id=self.test_member_id,
            notification_type="achievement",
            title="Achievement 1",
            message="You've earned achievement 1!",
            data={}
        )
        self.notification_manager.create_notification(
            member_id=self.test_member_id,
            notification_type="level_up",
            title="Level Up",
            message="You've reached level 2!",
            data={}
        )
        self.notification_manager.create_notification(
            member_id=self.test_member_id,
            notification_type="challenge_completion",
            title="Challenge Completed",
            message="You've completed a challenge!",
            data={}
        )

        # Get all notifications
        notifications = self.notification_manager.get_notifications()

        # Check if all notifications were retrieved
        self.assertTrue(notifications["success"])
        self.assertEqual(notifications["total"], 3)
        self.assertEqual(len(notifications["notifications"]), 3)

        # Get notifications for the member
        member_notifications = self.notification_manager.get_notifications(member_id=self.test_member_id)

        # Check if member notifications were retrieved correctly
        self.assertTrue(member_notifications["success"])
        self.assertEqual(member_notifications["total"], 3)
        self.assertEqual(len(member_notifications["notifications"]), 3)

        # Get notifications by type
        achievement_notifications = self.notification_manager.get_notifications(notification_type="achievement")

        # Check if type notifications were retrieved correctly
        self.assertTrue(achievement_notifications["success"])
        self.assertEqual(achievement_notifications["total"], 1)
        self.assertEqual(len(achievement_notifications["notifications"]), 1)
        self.assertEqual(achievement_notifications["notifications"][0]["type"], "achievement")

        # Get unread notifications
        unread_notifications = self.notification_manager.get_notifications(unread_only=True)

        # Check if unread notifications were retrieved correctly
        self.assertTrue(unread_notifications["success"])
        self.assertEqual(unread_notifications["total"], 3)
        self.assertEqual(len(unread_notifications["notifications"]), 3)

        # Get notifications with pagination
        paginated_notifications = self.notification_manager.get_notifications(limit=2, offset=1)

        # Check if pagination works correctly
        self.assertTrue(paginated_notifications["success"])
        self.assertEqual(paginated_notifications["total"], 3)
        self.assertEqual(len(paginated_notifications["notifications"]), 2)
        self.assertEqual(paginated_notifications["limit"], 2)
        self.assertEqual(paginated_notifications["offset"], 1)

    def test_mark_notification_read(self):
        """Test marking a notification as read."""
        # Create a test notification
        result = self.notification_manager.create_notification(
            member_id=self.test_member_id,
            notification_type="achievement",
            title="Test Achievement",
            message="You've earned a test achievement!",
            data={}
        )

        # Get the notification ID
        notification_id = result["notification_id"]

        # Mark the notification as read
        mark_result = self.notification_manager.mark_notification_read(notification_id)

        # Check if the operation was successful
        self.assertTrue(mark_result["success"])

        # Get the notification
        notifications = self.notification_manager.get_notifications(member_id=self.test_member_id)

        # Check if the notification was marked as read
        self.assertTrue(notifications["notifications"][0]["read"])

        # Mark the notification as unread
        unmark_result = self.notification_manager.mark_notification_read(notification_id, read=False)

        # Check if the operation was successful
        self.assertTrue(unmark_result["success"])

        # Get the notification again
        notifications = self.notification_manager.get_notifications(member_id=self.test_member_id)

        # Check if the notification was marked as unread
        self.assertFalse(notifications["notifications"][0]["read"])

    def test_mark_all_read(self):
        """Test marking all notifications for a member as read."""
        # Create some test notifications
        self.notification_manager.create_notification(
            member_id=self.test_member_id,
            notification_type="achievement",
            title="Achievement 1",
            message="You've earned achievement 1!",
            data={}
        )
        self.notification_manager.create_notification(
            member_id=self.test_member_id,
            notification_type="level_up",
            title="Level Up",
            message="You've reached level 2!",
            data={}
        )

        # Mark all notifications as read
        result = self.notification_manager.mark_all_read(self.test_member_id)

        # Check if the operation was successful
        self.assertTrue(result["success"])

        # Get the notifications
        notifications = self.notification_manager.get_notifications(member_id=self.test_member_id)

        # Check if all notifications were marked as read
        for notification in notifications["notifications"]:
            self.assertTrue(notification["read"])

    def test_delete_notification(self):
        """Test deleting a notification."""
        # Create a test notification
        result = self.notification_manager.create_notification(
            member_id=self.test_member_id,
            notification_type="achievement",
            title="Test Achievement",
            message="You've earned a test achievement!",
            data={}
        )

        # Get the notification ID
        notification_id = result["notification_id"]

        # Delete the notification
        delete_result = self.notification_manager.delete_notification(notification_id)

        # Check if the operation was successful
        self.assertTrue(delete_result["success"])

        # Get the notifications
        notifications = self.notification_manager.get_notifications(member_id=self.test_member_id)

        # Check if the notification was deleted
        self.assertEqual(notifications["total"], 0)
        self.assertEqual(len(notifications["notifications"]), 0)

    def test_delete_old_notifications(self):
        """Test deleting old notifications."""
        # Create some test notifications
        self.notification_manager.create_notification(
            member_id=self.test_member_id,
            notification_type="achievement",
            title="Achievement 1",
            message="You've earned achievement 1!",
            data={}
        )
        self.notification_manager.create_notification(
            member_id=self.test_member_id,
            notification_type="level_up",
            title="Level Up",
            message="You've reached level 2!",
            data={}
        )

        # Delete old notifications (this won't delete any since they're new)
        result = self.notification_manager.delete_old_notifications(days=30)

        # Check if the operation was successful
        self.assertTrue(result["success"])
        self.assertEqual(result["deleted_count"], 0)

        # Get the notifications
        notifications = self.notification_manager.get_notifications()

        # Check if no notifications were deleted
        self.assertEqual(notifications["total"], 2)

    def test_webhooks(self):
        """Test webhook management."""
        # Add a webhook
        result = self.notification_manager.add_webhook(
            name="Test Webhook",
            url="https://example.com/webhook",
            events=["achievement", "level_up"],
            headers={"Content-Type": "application/json", "X-API-Key": "test_key"},
            enabled=True
        )

        # Check if the operation was successful
        self.assertTrue(result["success"])
        self.assertIn("webhook_id", result)

        # Get the webhook ID
        webhook_id = result["webhook_id"]

        # Get all webhooks
        webhooks = self.notification_manager.get_webhooks()

        # Check if the webhook was added correctly
        self.assertTrue(webhooks["success"])
        self.assertGreaterEqual(len(webhooks["webhooks"]), 1)

        # Find the test webhook
        test_webhook = None
        for webhook in webhooks["webhooks"]:
            if webhook["id"] == webhook_id:
                test_webhook = webhook
                break

        # Check if the webhook has the correct properties
        self.assertIsNotNone(test_webhook)
        self.assertEqual(test_webhook["name"], "Test Webhook")
        self.assertEqual(test_webhook["url"], "https://example.com/webhook")
        self.assertEqual(test_webhook["events"], ["achievement", "level_up"])
        self.assertEqual(test_webhook["headers"]["X-API-Key"], "test_key")
        self.assertTrue(test_webhook["enabled"])

        # Update the webhook
        update_result = self.notification_manager.update_webhook(
            webhook_id=webhook_id,
            name="Updated Webhook",
            url="https://example.com/updated",
            events=["achievement", "level_up", "challenge_completion"],
            enabled=False
        )

        # Check if the operation was successful
        self.assertTrue(update_result["success"])

        # Get the webhooks again
        webhooks = self.notification_manager.get_webhooks()

        # Find the updated webhook
        updated_webhook = None
        for webhook in webhooks["webhooks"]:
            if webhook["id"] == webhook_id:
                updated_webhook = webhook
                break

        # Check if the webhook was updated correctly
        self.assertIsNotNone(updated_webhook)
        self.assertEqual(updated_webhook["name"], "Updated Webhook")
        self.assertEqual(updated_webhook["url"], "https://example.com/updated")
        self.assertEqual(updated_webhook["events"], ["achievement", "level_up", "challenge_completion"])
        self.assertFalse(updated_webhook["enabled"])

        # Test the webhook (this will fail since the URL is not real, but we can check the function call)
        test_result = self.notification_manager.test_webhook(webhook_id)

        # Delete the webhook
        delete_result = self.notification_manager.delete_webhook(webhook_id)

        # Check if the operation was successful
        self.assertTrue(delete_result["success"])

        # Get the webhooks again
        webhooks = self.notification_manager.get_webhooks()

        # Check if the webhook was deleted
        webhook_exists = False
        for webhook in webhooks["webhooks"]:
            if webhook["id"] == webhook_id:
                webhook_exists = True
                break

        self.assertFalse(webhook_exists)

    def test_file_operations(self):
        """Test file operations."""
        # Create a test notification
        self.notification_manager.create_notification(
            member_id=self.test_member_id,
            notification_type="achievement",
            title="Test Achievement",
            message="You've earned a test achievement!",
            data={}
        )

        # Check if the file exists
        self.assertTrue(os.path.exists(self.test_notifications_file))

        # Read the file directly
        with open(self.test_notifications_file, 'r') as f:
            data = json.load(f)

        # Check if the data was saved correctly
        self.assertIn("notifications", data)
        self.assertEqual(len(data["notifications"]), 1)
        self.assertEqual(data["notifications"][0]["member_id"], self.test_member_id)
        self.assertEqual(data["notifications"][0]["type"], "achievement")
        self.assertEqual(data["notifications"][0]["title"], "Test Achievement")
        self.assertEqual(data["notifications"][0]["message"], "You've earned a test achievement!")

if __name__ == '__main__':
    unittest.main()
