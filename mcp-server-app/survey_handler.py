import json
import os
import datetime
import logging
from member_manager import MemberManager

logger = logging.getLogger('blkout_nxt')

class SurveyHandler:
    """A class to handle survey responses."""

    def __init__(self):
        """Initialize the SurveyHandler."""
        self.member_manager = MemberManager()
        self.config = self._load_config()

    def _load_config(self):
        """Load configuration from the config file."""
        try:
            with open('blkout_nxt_config.json', 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading config: {str(e)}")
            # Return default config
            return {
                "survey_links": {
                    "ally_survey": "https://forms.gle/DerFGtG8vrZVPZaB7",
                    "bqm_survey": "https://forms.gle/DerFGtG8vrZVPZaB7",
                    "qtipoc_organiser_survey": "https://forms.gle/bvZm2UkcsL4LGSq17",
                    "organisation_survey": "https://forms.gle/w3mZSj8KPiVnW3Zx7"
                }
            }

    def process_survey_response(self, email, survey_type, survey_data):
        """Process a survey response."""
        try:
            # Get the member by email
            member = self.member_manager.get_member(email=email)

            if not member:
                logger.warning(f"Member not found for email: {email}")
                return {"success": False, "message": "Member not found"}

            # Check if the survey type matches the member type
            if not self._validate_survey_type(member["member_type"], survey_type):
                logger.warning(f"Survey type {survey_type} does not match member type {member['member_type']}")
                return {"success": False, "message": "Survey type does not match member type"}

            # Record the survey completion
            result = self.member_manager.record_survey_completion(member["id"], survey_data)

            return {"success": result["success"], "message": result["message"], "member_id": member["id"]}
        except Exception as e:
            logger.error(f"Error processing survey response: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def _validate_survey_type(self, member_type, survey_type):
        """Validate that the survey type matches the member type."""
        # Map member types to survey types
        member_type_map = {
            "Ally": "ally_survey",
            "Black Queer Men": "bqm_survey",
            "QTIPOC Organiser": "qtipoc_organiser_survey",
            "Organisation": "organisation_survey"
        }

        # Check if the survey type matches the member type
        expected_survey_type = member_type_map.get(member_type)
        return expected_survey_type == survey_type

    def get_survey_link(self, member_id):
        """Get the appropriate survey link for a member."""
        try:
            # Get the member
            member = self.member_manager.get_member(member_id=member_id)

            if not member:
                logger.warning(f"Member not found for ID: {member_id}")
                return None

            # Map member types to survey links from config
            survey_links = self.config.get("survey_links", {})

            # Map member types to survey link keys
            member_type_map = {
                "Ally": "ally_survey",
                "Black Queer Men": "bqm_survey",
                "QTIPOC Organiser": "qtipoc_organiser_survey",
                "Organisation": "organisation_survey"
            }

            # Get the survey link key for this member type
            survey_link_key = member_type_map.get(member["member_type"])

            if not survey_link_key:
                logger.warning(f"No survey link key for member type: {member['member_type']}")
                return None

            # Get the base survey link
            survey_link = survey_links.get(survey_link_key)

            if not survey_link:
                logger.warning(f"No survey link found for key: {survey_link_key}")
                return None

            # Add the member's email as a parameter
            if "?" in survey_link:
                survey_link = f"{survey_link}&emailAddress={member['email']}"
            else:
                survey_link = f"{survey_link}?emailAddress={member['email']}"

            return survey_link
        except Exception as e:
            logger.error(f"Error getting survey link: {str(e)}")
            return None

# Example usage
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)

    handler = SurveyHandler()

    # Add a test member
    member_manager = MemberManager()
    result = member_manager.add_member("Test User", "test@example.com", "Ally")
    member_id = result["member_id"]

    # Get the survey link
    survey_link = handler.get_survey_link(member_id)
    print(f"Survey link: {survey_link}")

    # Process a survey response
    survey_data = {
        "question1": "Answer 1",
        "question2": "Answer 2",
        "question3": "Answer 3"
    }
    result = handler.process_survey_response("test@example.com", "ally_survey", survey_data)
    print(result)
