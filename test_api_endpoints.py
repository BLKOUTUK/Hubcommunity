import unittest
import json
import os
import shutil
import tempfile
import sys

# Add the parent directory to the path so we can import the modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from rewards_api import app
from member_manager import MemberManager
from rewards_manager import RewardsManager
from event_manager import EventManager
from notification_manager import NotificationManager

class TestAPIEndpoints(unittest.TestCase):
    """Test cases for the API endpoints."""

    def setUp(self):
        """Set up test environment."""
        # Create a test directory
        self.test_dir = tempfile.mkdtemp()

        # Create test file paths
        self.test_members_file = os.path.join(self.test_dir, "test_members.json")
        self.test_rewards_file = os.path.join(self.test_dir, "test_rewards.json")
        self.test_events_file = os.path.join(self.test_dir, "test_events.json")
        self.test_notifications_file = os.path.join(self.test_dir, "test_notifications.json")

        # Initialize managers with test files
        self.member_manager = MemberManager(file_path=self.test_members_file)
        self.rewards_manager = RewardsManager(file_path=self.test_rewards_file)
        self.event_manager = EventManager(file_path=self.test_events_file)
        self.notification_manager = NotificationManager(file_path=self.test_notifications_file)

        # Create a test client
        self.client = app.test_client()

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
        shutil.rmtree(self.test_dir)

    def test_home_endpoint(self):
        """Test the home endpoint."""
        # Send a GET request to the home endpoint
        response = self.client.get('/')

        # Check if the response is successful
        self.assertEqual(response.status_code, 200)

        # Check if the response contains the expected content
        self.assertIn(b'BLKOUTHUB Rewards API', response.data)

    def test_get_user_rewards_endpoint(self):
        """Test the get_user_rewards endpoint."""
        # Award some points to the test member
        self.rewards_manager.award_points(
            member_id=self.test_member_id,
            action_id="complete_survey",
            description="Completed test survey"
        )

        # Send a GET request to the get_user_rewards endpoint
        response = self.client.get(f'/api/rewards/user/{self.test_member_id}')

        # Check if the response is successful
        self.assertEqual(response.status_code, 200)

        # Parse the response data
        data = json.loads(response.data)

        # Check if the response contains the expected data
        self.assertTrue(data["success"])
        self.assertEqual(data["rewards"]["member_id"], self.test_member_id)
        self.assertGreater(data["rewards"]["current_points"], 0)
        self.assertGreater(data["rewards"]["lifetime_points"], 0)

    def test_award_points_endpoint(self):
        """Test the award_points endpoint."""
        # Prepare the request data
        request_data = {
            "action_id": "complete_survey",
            "description": "Completed test survey"
        }

        # Send a POST request to the award_points endpoint
        response = self.client.post(
            f'/api/rewards/user/{self.test_member_id}/award-points',
            json=request_data
        )

        # Check if the response is successful
        self.assertEqual(response.status_code, 200)

        # Parse the response data
        data = json.loads(response.data)

        # Check if the response contains the expected data
        self.assertTrue(data["success"])
        self.assertIn("points_awarded", data)
        self.assertGreater(data["points_awarded"], 0)

        # Get the user's rewards profile
        rewards = self.rewards_manager.get_user_rewards(self.test_member_id)

        # Check if the points were awarded correctly
        self.assertIsNotNone(rewards)
        self.assertGreater(rewards["current_points"], 0)
        self.assertGreater(rewards["lifetime_points"], 0)

    def test_check_achievements_endpoint(self):
        """Test the check_achievements endpoint."""
        # Award points to trigger an achievement
        self.rewards_manager.award_points(
            member_id=self.test_member_id,
            action_id="complete_survey",
            description="Completed test survey"
        )

        # Send a POST request to the check_achievements endpoint
        response = self.client.post(f'/api/rewards/user/{self.test_member_id}/check-achievements')

        # Check if the response is successful
        self.assertEqual(response.status_code, 200)

        # Parse the response data
        data = json.loads(response.data)

        # Check if the response contains the expected data
        self.assertTrue(data["success"])

    def test_get_user_access_level_endpoint(self):
        """Test the get_user_access_level endpoint."""
        # Award points to reach a higher level
        self.rewards_manager.award_points(
            member_id=self.test_member_id,
            action_id="custom",
            description="Level up points",
            override_points=1000
        )

        # Send a GET request to the get_user_access_level endpoint
        response = self.client.get(f'/api/access-levels/user/{self.test_member_id}')

        # Check if the response is successful
        self.assertEqual(response.status_code, 200)

        # Parse the response data
        data = json.loads(response.data)

        # Check if the response contains the expected data
        self.assertTrue(data["success"])
        self.assertIn("access_level", data)
        self.assertIn("name", data["access_level"])
        self.assertIn("features", data["access_level"])

    def test_get_available_content_endpoint(self):
        """Test the get_available_content endpoint."""
        # Award points to reach a higher level
        self.rewards_manager.award_points(
            member_id=self.test_member_id,
            action_id="custom",
            description="Level up points",
            override_points=1000
        )

        # Send a GET request to the get_available_content endpoint
        response = self.client.get(f'/api/members/{self.test_member_id}/available-content')

        # Check if the response is successful
        self.assertEqual(response.status_code, 200)

        # Parse the response data
        data = json.loads(response.data)

        # Check if the response contains the expected data
        self.assertTrue(data["success"])
        self.assertIn("content", data)

    def test_create_event_endpoint(self):
        """Test the create_event endpoint."""
        # Prepare the request data
        request_data = {
            "name": "Test Event",
            "description": "This is a test event",
            "event_date": "2025-01-01T18:00:00",
            "location": "Test Location",
            "event_type": "Workshop",
            "max_attendees": 50,
            "registration_url": "https://example.com/register"
        }

        # Send a POST request to the create_event endpoint
        response = self.client.post('/api/events', json=request_data)

        # Check if the response is successful
        self.assertEqual(response.status_code, 201)

        # Parse the response data
        data = json.loads(response.data)

        # Check if the response contains the expected data
        self.assertTrue(data["success"])
        self.assertIn("event_id", data)

        # Get the event ID
        event_id = data["event_id"]

        # Get the event
        event = self.event_manager.get_event(event_id)

        # Check if the event was created correctly
        self.assertIsNotNone(event)
        self.assertEqual(event["name"], "Test Event")
        self.assertEqual(event["description"], "This is a test event")
        self.assertEqual(event["event_date"], "2025-01-01T18:00:00")
        self.assertEqual(event["location"], "Test Location")
        self.assertEqual(event["event_type"], "Workshop")
        self.assertEqual(event["max_attendees"], 50)
        self.assertEqual(event["registration_url"], "https://example.com/register")

    def test_record_attendance_endpoint(self):
        """Test the record_attendance endpoint."""
        # Create a test event
        result = self.event_manager.create_event(
            name="Attendance Test",
            description="Event for attendance",
            event_date="2025-01-01T18:00:00",
            location="Test Location",
            event_type="Workshop"
        )

        # Get the event ID
        event_id = result["event_id"]

        # Prepare the request data
        request_data = {
            "member_id": self.test_member_id,
            "check_in_method": "manual",
            "notes": "Test attendance"
        }

        # Send a POST request to the record_attendance endpoint
        response = self.client.post(f'/api/events/{event_id}/attendance', json=request_data)

        # Check if the response is successful
        self.assertEqual(response.status_code, 200)

        # Parse the response data
        data = json.loads(response.data)

        # Check if the response contains the expected data
        self.assertTrue(data["success"])

        # Get the event attendees
        attendees = self.event_manager.get_event_attendees(event_id)

        # Check if the attendance was recorded correctly
        self.assertEqual(len(attendees), 1)
        self.assertEqual(attendees[0]["member_id"], self.test_member_id)
        self.assertEqual(attendees[0]["check_in_method"], "manual")
        self.assertEqual(attendees[0]["notes"], "Test attendance")

    def test_get_notifications_endpoint(self):
        """Test the get_notifications endpoint."""
        # Create a test notification
        self.notification_manager.create_notification(
            member_id=self.test_member_id,
            notification_type="achievement",
            title="Test Achievement",
            message="You've earned a test achievement!",
            data={}
        )

        # Send a GET request to the get_notifications endpoint
        response = self.client.get('/api/notifications')

        # Check if the response is successful
        self.assertEqual(response.status_code, 200)

        # Parse the response data
        data = json.loads(response.data)

        # Check if the response contains the expected data
        self.assertTrue(data["success"])
        self.assertIn("notifications", data)
        self.assertEqual(data["total"], 1)
        self.assertEqual(len(data["notifications"]), 1)
        self.assertEqual(data["notifications"][0]["member_id"], self.test_member_id)
        self.assertEqual(data["notifications"][0]["type"], "achievement")
        self.assertEqual(data["notifications"][0]["title"], "Test Achievement")
        self.assertEqual(data["notifications"][0]["message"], "You've earned a test achievement!")

    def test_create_notification_endpoint(self):
        """Test the create_notification endpoint."""
        # Prepare the request data
        request_data = {
            "member_id": self.test_member_id,
            "type": "achievement",
            "title": "API Achievement",
            "message": "You've earned an achievement through the API!",
            "data": {
                "achievement": {
                    "id": "api_achievement",
                    "name": "API Achievement",
                    "description": "This is an achievement created through the API"
                }
            }
        }

        # Send a POST request to the create_notification endpoint
        response = self.client.post('/api/notifications', json=request_data)

        # Check if the response is successful
        self.assertEqual(response.status_code, 201)

        # Parse the response data
        data = json.loads(response.data)

        # Check if the response contains the expected data
        self.assertTrue(data["success"])
        self.assertIn("notification_id", data)

        # Get the notification ID
        notification_id = data["notification_id"]

        # Get all notifications for the member
        notifications = self.notification_manager.get_notifications(member_id=self.test_member_id)

        # Check if the notification was created correctly
        self.assertTrue(notifications["success"])
        self.assertEqual(notifications["total"], 1)
        self.assertEqual(len(notifications["notifications"]), 1)
        self.assertEqual(notifications["notifications"][0]["id"], notification_id)
        self.assertEqual(notifications["notifications"][0]["member_id"], self.test_member_id)
        self.assertEqual(notifications["notifications"][0]["type"], "achievement")
        self.assertEqual(notifications["notifications"][0]["title"], "API Achievement")
        self.assertEqual(notifications["notifications"][0]["message"], "You've earned an achievement through the API!")

    def test_mark_notification_read_endpoint(self):
        """Test the mark_notification_read endpoint."""
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

        # Send a POST request to the mark_notification_read endpoint
        response = self.client.post(f'/api/notifications/{notification_id}/read')

        # Check if the response is successful
        self.assertEqual(response.status_code, 200)

        # Parse the response data
        data = json.loads(response.data)

        # Check if the response contains the expected data
        self.assertTrue(data["success"])

        # Get the notification
        notifications = self.notification_manager.get_notifications(member_id=self.test_member_id)

        # Check if the notification was marked as read
        self.assertTrue(notifications["notifications"][0]["read"])

    def test_add_webhook_endpoint(self):
        """Test the add_webhook endpoint."""
        # Prepare the request data
        request_data = {
            "name": "Test Webhook",
            "url": "https://example.com/webhook",
            "events": ["achievement", "level_up"],
            "headers": {"Content-Type": "application/json", "X-API-Key": "test_key"},
            "enabled": True
        }

        # Send a POST request to the add_webhook endpoint
        response = self.client.post('/api/webhooks', json=request_data)

        # Check if the response is successful
        self.assertEqual(response.status_code, 201)

        # Parse the response data
        data = json.loads(response.data)

        # Check if the response contains the expected data
        self.assertTrue(data["success"])
        self.assertIn("webhook_id", data)

        # Get the webhook ID
        webhook_id = data["webhook_id"]

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

if __name__ == '__main__':
    unittest.main()
