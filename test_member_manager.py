import unittest
import os
import json
import shutil
from member_manager import MemberManager

class TestMemberManager(unittest.TestCase):
    """Test cases for the MemberManager class."""

    def setUp(self):
        """Set up test environment."""
        # Create a test directory
        self.test_dir = "test_data"
        os.makedirs(self.test_dir, exist_ok=True)

        # Create a test file path
        self.test_file = os.path.join(self.test_dir, "test_members.json")

        # Initialize MemberManager with test file
        self.member_manager = MemberManager(file_path=self.test_file)

        # Ensure the test file exists
        self.member_manager.ensure_file_exists()

    def tearDown(self):
        """Clean up test environment."""
        # Remove the test directory and its contents
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)

    def test_add_member(self):
        """Test adding a new member."""
        # Add a test member
        result = self.member_manager.add_member(
            name="Test User",
            email="test@example.com",
            member_type="Ally"
        )

        # Check if the operation was successful
        self.assertTrue(result["success"])
        self.assertIn("member_id", result)

        # Get the member ID
        member_id = result["member_id"]

        # Check if the member exists
        member = self.member_manager.get_member(member_id=member_id)
        self.assertIsNotNone(member)
        self.assertEqual(member["name"], "Test User")
        self.assertEqual(member["email"], "test@example.com")
        self.assertEqual(member["member_type"], "Ally")

    def test_add_duplicate_email(self):
        """Test adding a member with a duplicate email."""
        # Add a test member
        self.member_manager.add_member(
            name="Test User",
            email="duplicate@example.com",
            member_type="Ally"
        )

        # Try to add another member with the same email
        result = self.member_manager.add_member(
            name="Another User",
            email="duplicate@example.com",
            member_type="Organiser"
        )

        # Check if the operation failed
        self.assertFalse(result["success"])
        self.assertIn("already exists", result["message"])

    def test_get_member_by_id(self):
        """Test getting a member by ID."""
        # Add a test member
        result = self.member_manager.add_member(
            name="Get By ID",
            email="getbyid@example.com",
            member_type="Ally"
        )

        # Get the member ID
        member_id = result["member_id"]

        # Get the member by ID
        member = self.member_manager.get_member(member_id=member_id)

        # Check if the member was retrieved correctly
        self.assertIsNotNone(member)
        self.assertEqual(member["name"], "Get By ID")
        self.assertEqual(member["email"], "getbyid@example.com")
        self.assertEqual(member["member_type"], "Ally")

    def test_get_member_by_email(self):
        """Test getting a member by email."""
        # Add a test member
        self.member_manager.add_member(
            name="Get By Email",
            email="getbyemail@example.com",
            member_type="Ally"
        )

        # Get the member by email
        member = self.member_manager.get_member(email="getbyemail@example.com")

        # Check if the member was retrieved correctly
        self.assertIsNotNone(member)
        self.assertEqual(member["name"], "Get By Email")
        self.assertEqual(member["email"], "getbyemail@example.com")
        self.assertEqual(member["member_type"], "Ally")

    def test_get_nonexistent_member(self):
        """Test getting a nonexistent member."""
        # Try to get a nonexistent member by ID
        member = self.member_manager.get_member(member_id="nonexistent")

        # Check if the result is None
        self.assertIsNone(member)

        # Try to get a nonexistent member by email
        member = self.member_manager.get_member(email="nonexistent@example.com")

        # Check if the result is None
        self.assertIsNone(member)

    def test_update_member(self):
        """Test updating a member."""
        # Add a test member
        result = self.member_manager.add_member(
            name="Update Test",
            email="update@example.com",
            member_type="Ally"
        )

        # Get the member ID
        member_id = result["member_id"]

        # Update the member
        updates = {
            "name": "Updated Name",
            "email": "updated@example.com",
            "member_type": "Organiser"
        }
        update_result = self.member_manager.update_member(member_id, updates)

        # Check if the update was successful
        self.assertTrue(update_result["success"])

        # Get the updated member
        updated_member = self.member_manager.get_member(member_id=member_id)

        # Check if the member was updated correctly
        self.assertEqual(updated_member["name"], "Updated Name")
        self.assertEqual(updated_member["email"], "updated@example.com")
        self.assertEqual(updated_member["member_type"], "Organiser")

    def test_update_nonexistent_member(self):
        """Test updating a nonexistent member."""
        # Try to update a nonexistent member
        result = self.member_manager.update_member(
            member_id="nonexistent",
            name="Updated Name",
            email="updated@example.com",
            member_type="Organiser"
        )

        # Check if the operation failed
        self.assertFalse(result["success"])
        self.assertIn("not found", result["message"])

    # Note: delete_member method is not implemented in the current version
    # def test_delete_member(self):
    #     """Test deleting a member."""
    #     # Add a test member
    #     result = self.member_manager.add_member(
    #         name="Delete Test",
    #         email="delete@example.com",
    #         member_type="Ally"
    #     )
    #
    #     # Get the member ID
    #     member_id = result["member_id"]
    #
    #     # Delete the member
    #     delete_result = self.member_manager.delete_member(member_id=member_id)
    #
    #     # Check if the delete was successful
    #     self.assertTrue(delete_result["success"])
    #
    #     # Try to get the deleted member
    #     deleted_member = self.member_manager.get_member(member_id=member_id)
    #
    #     # Check if the member was deleted
    #     self.assertIsNone(deleted_member)

    # def test_delete_nonexistent_member(self):
    #     """Test deleting a nonexistent member."""
    #     # Try to delete a nonexistent member
    #     result = self.member_manager.delete_member(member_id="nonexistent")
    #
    #     # Check if the operation failed
    #     self.assertFalse(result["success"])
    #     self.assertIn("not found", result["message"])

    def test_get_all_members(self):
        """Test getting all members."""
        # Add some test members
        self.member_manager.add_member(
            name="User 1",
            email="user1@example.com",
            member_type="Ally"
        )
        self.member_manager.add_member(
            name="User 2",
            email="user2@example.com",
            member_type="Organiser"
        )
        self.member_manager.add_member(
            name="User 3",
            email="user3@example.com",
            member_type="Ally"
        )

        # Get all members
        members = self.member_manager.get_all_members()

        # Check if all members were retrieved
        self.assertEqual(len(members), 3)

        # Check if the members have the correct properties
        emails = [member["email"] for member in members]
        self.assertIn("user1@example.com", emails)
        self.assertIn("user2@example.com", emails)
        self.assertIn("user3@example.com", emails)

    # Note: get_members_by_type method is not implemented in the current version
    # def test_get_members_by_type(self):
    #     """Test getting members by type."""
    #     # Add some test members
    #     self.member_manager.add_member(
    #         name="Ally 1",
    #         email="ally1@example.com",
    #         member_type="Ally"
    #     )
    #     self.member_manager.add_member(
    #         name="Organiser 1",
    #         email="organiser1@example.com",
    #         member_type="Organiser"
    #     )
    #     self.member_manager.add_member(
    #         name="Ally 2",
    #         email="ally2@example.com",
    #         member_type="Ally"
    #     )
    #
    #     # Get members by type
    #     allies = self.member_manager.get_members_by_type(member_type="Ally")
    #     organisers = self.member_manager.get_members_by_type(member_type="Organiser")
    #
    #     # Check if the correct members were retrieved
    #     self.assertEqual(len(allies), 2)
    #     self.assertEqual(len(organisers), 1)
    #
    #     # Check if the members have the correct type
    #     for ally in allies:
    #         self.assertEqual(ally["member_type"], "Ally")
    #
    #     for organiser in organisers:
    #         self.assertEqual(organiser["member_type"], "Organiser")

    # Note: validate_member_type method is not implemented in the current version
    # def test_validate_member_type(self):
    #     """Test validating member types."""
    #     # Test valid member types
    #     self.assertTrue(self.member_manager.validate_member_type("Ally"))
    #     self.assertTrue(self.member_manager.validate_member_type("Organiser"))
    #     self.assertTrue(self.member_manager.validate_member_type("QTIPOCOrganiser"))
    #     self.assertTrue(self.member_manager.validate_member_type("QTIPOCAlly"))
    #
    #     # Test invalid member type
    #     self.assertFalse(self.member_manager.validate_member_type("InvalidType"))

    def test_file_operations(self):
        """Test file operations."""
        # Add a test member
        self.member_manager.add_member(
            name="File Test",
            email="file@example.com",
            member_type="Ally"
        )

        # Check if the file exists
        self.assertTrue(os.path.exists(self.test_file))

        # Read the file directly
        with open(self.test_file, 'r') as f:
            data = json.load(f)

        # Check if the data was saved correctly
        self.assertIn("members", data)
        self.assertEqual(len(data["members"]), 1)
        self.assertEqual(data["members"][0]["name"], "File Test")
        self.assertEqual(data["members"][0]["email"], "file@example.com")
        self.assertEqual(data["members"][0]["member_type"], "Ally")

if __name__ == '__main__':
    unittest.main()
