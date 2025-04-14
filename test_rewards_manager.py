import unittest
import os
import json
import shutil
from rewards_manager import RewardsManager
from member_manager import MemberManager

class TestRewardsManager(unittest.TestCase):
    """Test cases for the RewardsManager class."""

    def setUp(self):
        """Set up test environment."""
        # Create a test directory
        self.test_dir = "test_data"
        os.makedirs(self.test_dir, exist_ok=True)

        # Create test file paths
        self.test_members_file = os.path.join(self.test_dir, "test_members.json")
        self.test_rewards_file = os.path.join(self.test_dir, "test_rewards.json")

        # Initialize managers with test files
        self.member_manager = MemberManager(file_path=self.test_members_file)
        self.rewards_manager = RewardsManager(file_path=self.test_rewards_file)

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

    def test_award_points(self):
        """Test awarding points to a member."""
        # Award points to the test member
        result = self.rewards_manager.award_points(
            member_id=self.test_member_id,
            action_id="complete_survey",
            description="Completed test survey"
        )

        # Check if the operation was successful
        self.assertTrue(result["success"])

        # Get the user's rewards profile
        rewards = self.rewards_manager.get_user_rewards(self.test_member_id)

        # Check if the points were awarded correctly
        self.assertIsNotNone(rewards)
        self.assertGreater(rewards["current_points"], 0)
        self.assertGreater(rewards["lifetime_points"], 0)

        # Check if the action was recorded in the history
        self.assertGreater(len(rewards["point_history"]), 0)
        # Find the action in the history
        found_action = False
        for action in rewards["point_history"]:
            if action["action_id"] == "complete_survey" and action["description"] == "Completed test survey":
                found_action = True
                break
        self.assertTrue(found_action, "Action not found in point history")

    def test_award_points_custom_amount(self):
        """Test awarding a custom amount of points."""
        # Award custom points to the test member
        result = self.rewards_manager.award_points(
            member_id=self.test_member_id,
            action_id="custom",
            description="Custom points",
            override_points=50
        )

        # Check if the operation was successful
        self.assertTrue(result["success"])

        # Get the user's rewards profile
        rewards = self.rewards_manager.get_user_rewards(self.test_member_id)

        # Check if the points were awarded correctly
        self.assertIsNotNone(rewards)

        # Find the custom action in the history
        found_action = False
        for action in rewards["point_history"]:
            if action["action_id"] == "custom" and action["description"] == "Custom points":
                found_action = True
                self.assertEqual(action["points"], 50)
                break
        self.assertTrue(found_action, "Custom action not found in point history")

    def test_award_points_nonexistent_member(self):
        """Test awarding points to a nonexistent member."""
        # Try to award points to a nonexistent member
        result = self.rewards_manager.award_points(
            member_id="nonexistent",
            action_id="complete_survey",
            description="Completed test survey"
        )

        # Check if the operation failed
        self.assertFalse(result["success"])
        self.assertIn("not found", result["message"])

    def test_level_progression(self):
        """Test level progression based on points."""
        # Award enough points to reach level 2
        result = self.rewards_manager.award_points(
            member_id=self.test_member_id,
            action_id="custom",
            description="Level up points",
            override_points=150
        )

        # Check if the operation was successful
        self.assertTrue(result["success"])

        # Get the user's rewards profile
        rewards = self.rewards_manager.get_user_rewards(self.test_member_id)

        # Check if the level was updated correctly
        self.assertIsNotNone(rewards)
        self.assertEqual(rewards["level"], 2)

        # Award more points to reach level 3
        result = self.rewards_manager.award_points(
            member_id=self.test_member_id,
            action_id="custom",
            description="More level up points",
            override_points=350
        )

        # Get the updated rewards profile
        rewards = self.rewards_manager.get_user_rewards(self.test_member_id)

        # Check if the level was updated correctly
        self.assertEqual(rewards["level"], 3)

    def test_achievements(self):
        """Test unlocking achievements."""
        # Award points to trigger an achievement
        result = self.rewards_manager.award_points(
            member_id=self.test_member_id,
            action_id="complete_survey",
            description="Completed test survey"
        )

        # Check achievements
        result = self.rewards_manager.check_achievements(self.test_member_id)

        # Get the user's rewards profile
        rewards = self.rewards_manager.get_user_rewards(self.test_member_id)

        # Check if any achievements were unlocked
        self.assertIsNotNone(rewards)

        # Award more points to trigger level-based achievements
        result = self.rewards_manager.award_points(
            member_id=self.test_member_id,
            action_id="custom",
            description="Level up points",
            override_points=1000
        )

        # Check achievements again
        result = self.rewards_manager.check_achievements(self.test_member_id)

        # Get the updated rewards profile
        rewards = self.rewards_manager.get_user_rewards(self.test_member_id)

        # Check if level-based achievements were unlocked
        self.assertIsNotNone(rewards)
        self.assertGreater(len(rewards.get("achievements", [])), 0)

    def test_access_levels(self):
        """Test access level assignment based on level."""
        # Award enough points to reach a higher level
        result = self.rewards_manager.award_points(
            member_id=self.test_member_id,
            action_id="custom",
            description="Level up points",
            override_points=2000
        )

        # Check if the operation was successful
        self.assertTrue(result["success"])

        # Get the user's access level
        access_level = self.rewards_manager.get_user_access_level(self.test_member_id)

        # Check if the access level was assigned correctly
        self.assertTrue(access_level["success"])
        self.assertIsNotNone(access_level["access_level"])
        self.assertIn("name", access_level["access_level"])
        self.assertIn("features", access_level["access_level"])

    def test_content_access(self):
        """Test content access based on access level."""
        # Award enough points to reach a higher level
        result = self.rewards_manager.award_points(
            member_id=self.test_member_id,
            action_id="custom",
            description="Level up points",
            override_points=3000
        )

        # Check if the operation was successful
        self.assertTrue(result["success"])

        # Get available content
        content = self.rewards_manager.get_available_content(self.test_member_id)

        # Check if content access was determined correctly
        self.assertTrue(content["success"])
        self.assertIsNotNone(content["content"])
        self.assertGreater(len(content["content"]), 0)

    def test_community_challenges(self):
        """Test community challenges."""
        # Get all challenges
        challenges = self.rewards_manager.get_community_challenges()

        # Check if challenges were retrieved
        self.assertIsNotNone(challenges)
        self.assertGreater(len(challenges), 0)

        # Get user challenges
        user_challenges = self.rewards_manager.get_user_challenges(self.test_member_id)

        # Check if user challenges were retrieved
        self.assertTrue(user_challenges["success"])
        self.assertIsNotNone(user_challenges["challenges"])
        self.assertGreater(len(user_challenges["challenges"]), 0)

        # Award points to progress in challenges
        for i in range(5):
            self.rewards_manager.award_points(
                member_id=self.test_member_id,
                action_id="attend_event",
                description=f"Attended event {i+1}"
            )

        # Get updated user challenges
        user_challenges = self.rewards_manager.get_user_challenges(self.test_member_id)

        # Check if challenge progress was updated
        for challenge in user_challenges["challenges"]:
            if challenge["challenge"]["id"] == "attend_5_events":
                self.assertEqual(challenge["progress"], 1.0)
                self.assertTrue(challenge["completed"])

    def test_complete_challenge(self):
        """Test completing a challenge."""
        # Award points to progress in challenges
        for i in range(5):
            self.rewards_manager.award_points(
                member_id=self.test_member_id,
                action_id="attend_event",
                description=f"Attended event {i+1}"
            )

        # Complete the challenge
        result = self.rewards_manager.complete_challenge(
            member_id=self.test_member_id,
            challenge_id="attend_5_events"
        )

        # Check if the operation was successful
        self.assertTrue(result["success"])

        # Get the user's rewards profile
        rewards = self.rewards_manager.get_user_rewards(self.test_member_id)

        # Check if the challenge completion was recorded
        self.assertIsNotNone(rewards)
        self.assertIn("completed_challenges", rewards)
        self.assertIn("attend_5_events", [c["id"] for c in rewards["completed_challenges"]])

    def test_reward_actions(self):
        """Test reward actions."""
        # Get all reward actions
        actions = self.rewards_manager.get_reward_actions()

        # Check if actions were retrieved
        self.assertIsNotNone(actions)
        self.assertGreater(len(actions), 0)

        # Check if the actions have the correct properties
        for action in actions:
            self.assertIn("id", action)
            self.assertIn("name", action)
            self.assertIn("description", action)
            self.assertIn("points", action)

    def test_get_achievements(self):
        """Test getting all achievements."""
        # Get all achievements
        achievements = self.rewards_manager.get_achievements()

        # Check if achievements were retrieved
        self.assertIsNotNone(achievements)
        self.assertGreater(len(achievements), 0)

        # Check if the achievements have the correct properties
        for achievement in achievements:
            self.assertIn("id", achievement)
            self.assertIn("name", achievement)
            self.assertIn("description", achievement)
            self.assertIn("requirements", achievement)

    def test_get_access_levels(self):
        """Test getting all access levels."""
        # Get all access levels
        access_levels = self.rewards_manager.get_access_levels()

        # Check if access levels were retrieved
        self.assertIsNotNone(access_levels)
        self.assertGreater(len(access_levels), 0)

        # Check if the access levels have the correct properties
        for level in access_levels:
            self.assertIn("id", level)
            self.assertIn("name", level)
            self.assertIn("description", level)
            self.assertIn("min_level", level)
            self.assertIn("features", level)

    def test_get_exclusive_content(self):
        """Test getting all exclusive content."""
        # Get all exclusive content
        content = self.rewards_manager.get_exclusive_content()

        # Check if content was retrieved
        self.assertIsNotNone(content)
        self.assertGreater(len(content), 0)

        # Check if the content has the correct properties
        for item in content:
            self.assertIn("id", item)
            self.assertIn("name", item)
            self.assertIn("description", item)
            self.assertIn("required_level", item)
            self.assertIn("access_level", item)

    def test_file_operations(self):
        """Test file operations."""
        # Award points to create a rewards profile
        self.rewards_manager.award_points(
            member_id=self.test_member_id,
            action_id="complete_survey",
            description="Completed test survey"
        )

        # Check if the file exists
        self.assertTrue(os.path.exists(self.test_rewards_file))

        # Read the file directly
        with open(self.test_rewards_file, 'r') as f:
            data = json.load(f)

        # Check if the data was saved correctly
        self.assertIn("user_rewards", data)
        self.assertEqual(len(data["user_rewards"]), 1)
        self.assertEqual(data["user_rewards"][0]["member_id"], self.test_member_id)
        self.assertGreater(data["user_rewards"][0]["current_points"], 0)
        self.assertGreater(data["user_rewards"][0]["lifetime_points"], 0)

if __name__ == '__main__':
    unittest.main()
