import json
import os
import datetime
import uuid
import time
import shutil
import logging

logger = logging.getLogger('blkout_nxt')

class MemberManager:
    """A class to manage member data in a JSON file."""

    def __init__(self, file_path="data/members.json"):
        """Initialize the MemberManager with the path to the JSON file."""
        self.file_path = file_path
        self.ensure_file_exists()

    def ensure_file_exists(self):
        """Ensure the JSON file exists, creating it if necessary."""
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
        if not os.path.exists(self.file_path):
            with open(self.file_path, 'w') as f:
                json.dump({"members": []}, f)

    def load_data(self):
        """Load the member data from the JSON file."""
        try:
            with open(self.file_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading data: {str(e)}")
            # Return empty data structure if file can't be read
            return {"members": []}

    def save_data(self, data):
        """Save the member data to the JSON file."""
        try:
            # First write to a temporary file
            temp_file = f"{self.file_path}.tmp"
            with open(temp_file, 'w') as f:
                json.dump(data, f, indent=2)

            # Then rename to the actual file (atomic operation)
            os.replace(temp_file, self.file_path)
            return True
        except Exception as e:
            logger.error(f"Error saving data: {str(e)}")
            return False

    def add_member(self, name, email, member_type):
        """Add a new member to the JSON file."""
        max_retries = 3
        retry_count = 0

        while retry_count < max_retries:
            try:
                # Load the current data
                data = self.load_data()

                # Check if the member already exists
                for member in data["members"]:
                    if member["email"].lower() == email.lower():
                        return {"success": False, "message": "Member already exists", "member_id": member["id"]}

                # Generate a unique ID for the member
                member_id = str(uuid.uuid4())

                # Create the member object
                member = {
                    "id": member_id,
                    "name": name,
                    "email": email,
                    "member_type": member_type,
                    "status": "new",
                    "date_added": datetime.datetime.now().isoformat(),
                    "last_email_sent": None,
                    "email_history": [],
                    "survey_completed": False,
                    "survey_data": None
                }

                # Add the member to the data
                data["members"].append(member)

                # Save the data
                if self.save_data(data):
                    # Create a backup
                    self.backup_data()
                    return {"success": True, "message": "Member added successfully", "member_id": member_id}
                else:
                    retry_count += 1
                    time.sleep(1)  # Wait before retrying
            except Exception as e:
                logger.error(f"Error adding member (attempt {retry_count+1}): {str(e)}")
                retry_count += 1
                time.sleep(1)  # Wait before retrying

        return {"success": False, "message": f"Failed to add member after {max_retries} attempts"}

    def get_member(self, member_id=None, email=None):
        """Get a member by ID or email."""
        try:
            data = self.load_data()

            for member in data["members"]:
                if (member_id and member["id"] == member_id) or (email and member["email"].lower() == email.lower()):
                    return member

            return None
        except Exception as e:
            logger.error(f"Error getting member: {str(e)}")
            return None

    def update_member(self, member_id, updates):
        """Update a member's data."""
        try:
            data = self.load_data()

            for member in data["members"]:
                if member["id"] == member_id:
                    # Update the member data
                    for key, value in updates.items():
                        member[key] = value

                    # Save the data
                    if self.save_data(data):
                        return {"success": True, "message": "Member updated successfully"}
                    else:
                        return {"success": False, "message": "Failed to save data"}

            return {"success": False, "message": "Member not found"}
        except Exception as e:
            logger.error(f"Error updating member: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def record_email_sent(self, member_id, email_type, email_subject):
        """Record that an email was sent to a member."""
        try:
            data = self.load_data()

            for member in data["members"]:
                if member["id"] == member_id:
                    # Record the email
                    email_record = {
                        "type": email_type,
                        "subject": email_subject,
                        "sent_at": datetime.datetime.now().isoformat()
                    }

                    if "email_history" not in member:
                        member["email_history"] = []

                    member["email_history"].append(email_record)
                    member["last_email_sent"] = datetime.datetime.now().isoformat()

                    # Save the data
                    if self.save_data(data):
                        return {"success": True, "message": "Email recorded successfully"}
                    else:
                        return {"success": False, "message": "Failed to save data"}

            return {"success": False, "message": "Member not found"}
        except Exception as e:
            logger.error(f"Error recording email: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def get_members_needing_reminder(self, days_since_signup=3):
        """Get members who need a reminder email."""
        try:
            data = self.load_data()
            now = datetime.datetime.now()
            members_needing_reminder = []

            for member in data["members"]:
                # Skip members who have completed the survey
                if member.get("survey_completed", False):
                    continue

                # Calculate days since signup
                date_added = datetime.datetime.fromisoformat(member["date_added"])
                days_elapsed = (now - date_added).days

                # Check if enough days have passed
                if days_elapsed >= days_since_signup:
                    # Check if a reminder has already been sent
                    reminder_sent = False
                    for email in member.get("email_history", []):
                        if email.get("type") == "reminder":
                            reminder_sent = True
                            break

                    if not reminder_sent:
                        members_needing_reminder.append(member)

            return members_needing_reminder
        except Exception as e:
            logger.error(f"Error getting members needing reminder: {str(e)}")
            return []

    def record_survey_completion(self, member_id, survey_data):
        """Record that a member has completed the survey."""
        try:
            data = self.load_data()

            for member in data["members"]:
                if member["id"] == member_id:
                    # Record the survey completion
                    member["survey_completed"] = True
                    member["survey_data"] = survey_data
                    member["status"] = "active"

                    # Save the data
                    if self.save_data(data):
                        return {"success": True, "message": "Survey completion recorded successfully", "member_id": member_id}
                    else:
                        return {"success": False, "message": "Failed to save data"}

            return {"success": False, "message": "Member not found"}
        except Exception as e:
            logger.error(f"Error recording survey completion: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def get_all_members(self):
        """Get all members."""
        try:
            data = self.load_data()
            return data["members"]
        except Exception as e:
            logger.error(f"Error getting all members: {str(e)}")
            return []

    def backup_data(self):
        """Create a backup of the data file."""
        try:
            # Create backups directory if it doesn't exist
            backup_dir = os.path.join(os.path.dirname(self.file_path), "backups")
            os.makedirs(backup_dir, exist_ok=True)

            # Create a timestamped backup file
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = os.path.join(backup_dir, f"members_{timestamp}.json")

            # Copy the current data file to the backup
            shutil.copy2(self.file_path, backup_file)

            # Keep only the last 10 backups
            backups = sorted([os.path.join(backup_dir, f) for f in os.listdir(backup_dir) if f.startswith("members_")])
            if len(backups) > 10:
                for old_backup in backups[:-10]:
                    os.remove(old_backup)

            return True
        except Exception as e:
            logger.error(f"Warning: Failed to create backup: {str(e)}")
            return False

# Example usage
if __name__ == "__main__":
    manager = MemberManager()

    # Add a test member
    result = manager.add_member("Test User", "test@example.com", "Ally")
    print(result)

    # Get the member
    member = manager.get_member(email="test@example.com")
    print(member)

    # Update the member
    result = manager.update_member(member["id"], {"status": "active"})
    print(result)

    # Record an email sent
    result = manager.record_email_sent(member["id"], "welcome", "Welcome to BLKOUT NXT")
    print(result)

    # Get all members
    members = manager.get_all_members()
    print(f"Total members: {len(members)}")
