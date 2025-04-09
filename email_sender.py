import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import datetime
import time
import logging
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger('blkout_nxt')

class EmailSender:
    """A class to send emails to members."""

    def __init__(self):
        """Initialize the EmailSender with SMTP settings from environment variables."""
        self.smtp_server = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.environ.get("SMTP_PORT", 587))
        self.smtp_username = os.environ.get("SMTP_USERNAME", "nxt@blkoutuk.com")
        self.smtp_password = os.environ.get("SMTP_PASSWORD", "")

        # Load config file
        self.config = self._load_config()

        # Import here to avoid circular imports
        from member_manager import MemberManager
        from survey_handler import SurveyHandler

        self.member_manager = MemberManager()
        self.survey_handler = SurveyHandler()

    def _load_config(self):
        """Load configuration from the config file."""
        try:
            with open('blkout_nxt_config.json', 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading config: {str(e)}")
            # Return default config
            return {
                "email": {
                    "from_email": "nxt@blkoutuk.com",
                    "admin_email": "blkoutuk@gmail.com"
                }
            }

    def send_welcome_email(self, member_id):
        """Send a welcome email to a member."""
        max_retries = 3
        retry_count = 0

        while retry_count < max_retries:
            try:
                # Get the member
                member = self.member_manager.get_member(member_id=member_id)

                if not member:
                    return {"success": False, "message": "Member not found"}

                # Get the survey link
                survey_link = self.survey_handler.get_survey_link(member_id)

                if not survey_link:
                    return {"success": False, "message": "Could not generate survey link"}

                # Create the email content
                subject = "Welcome to BLKOUT NXT!"
                body = f"""
                <html>
                <body>
                    <h2>Welcome to BLKOUT NXT, {member['name']}!</h2>
                    <p>Thank you for signing up for BLKOUT NXT. We're excited to have you join our community.</p>
                    <p>To help us better understand your interests and how we can support you, please complete our short survey:</p>
                    <p><a href="{survey_link}">Complete the {member['member_type']} Survey</a></p>
                    <p>This will only take a few minutes and will help us tailor our communications to your interests.</p>
                    <p>Best regards,<br>The BLKOUT NXT Team</p>
                </body>
                </html>
                """

                # Send the email
                result = self._send_email(member["email"], subject, body, is_html=True)

                if result["success"]:
                    # Record that the email was sent
                    self.member_manager.record_email_sent(member_id, "welcome", subject)

                    # Update the member's status
                    self.member_manager.update_member(member_id, {"status": "welcomed"})

                    return {"success": True, "message": "Welcome email sent successfully"}
                else:
                    retry_count += 1
                    logger.warning(f"Email sending failed (attempt {retry_count}): {result['message']}")
                    time.sleep(2)  # Wait before retrying

            except Exception as e:
                retry_count += 1
                logger.error(f"Error sending welcome email (attempt {retry_count}): {str(e)}")
                time.sleep(2)  # Wait before retrying

        # If we get here, all retries failed
        return {"success": False, "message": f"Failed to send welcome email after {max_retries} attempts"}

    def send_reminder_email(self, member_id):
        """Send a reminder email to a member."""
        try:
            # Get the member
            member = self.member_manager.get_member(member_id=member_id)

            if not member:
                return {"success": False, "message": "Member not found"}

            # Get the survey link
            survey_link = self.survey_handler.get_survey_link(member_id)

            if not survey_link:
                return {"success": False, "message": "Could not generate survey link"}

            # Create the email content
            subject = "Reminder: Complete Your BLKOUT NXT Survey"
            body = f"""
            <html>
            <body>
                <h2>Reminder: Complete Your BLKOUT NXT Survey</h2>
                <p>Hello {member['name']},</p>
                <p>We noticed that you haven't completed your BLKOUT NXT survey yet. Your feedback is important to us and helps us tailor our communications to your interests.</p>
                <p>Please take a few minutes to complete the survey:</p>
                <p><a href="{survey_link}">Complete the {member['member_type']} Survey</a></p>
                <p>Thank you for your time.</p>
                <p>Best regards,<br>The BLKOUT NXT Team</p>
            </body>
            </html>
            """

            # Send the email
            result = self._send_email(member["email"], subject, body, is_html=True)

            if result["success"]:
                # Record that the email was sent
                self.member_manager.record_email_sent(member_id, "reminder", subject)
                return {"success": True, "message": "Reminder email sent successfully"}
            else:
                return result
        except Exception as e:
            logger.error(f"Error sending reminder email: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def send_confirmation_email(self, member_id):
        """Send a confirmation email to a member after they complete the survey."""
        try:
            # Get the member
            member = self.member_manager.get_member(member_id=member_id)

            if not member:
                return {"success": False, "message": "Member not found"}

            # Create the email content
            subject = "Thank You for Completing the BLKOUT NXT Survey"
            body = f"""
            <html>
            <body>
                <h2>Thank You for Completing the BLKOUT NXT Survey</h2>
                <p>Hello {member['name']},</p>
                <p>Thank you for completing the BLKOUT NXT survey. Your feedback is valuable to us and will help us tailor our communications to your interests.</p>
                <p>You'll start receiving relevant updates and information based on your preferences soon.</p>
                <p>Best regards,<br>The BLKOUT NXT Team</p>
            </body>
            </html>
            """

            # Send the email
            result = self._send_email(member["email"], subject, body, is_html=True)

            if result["success"]:
                # Record that the email was sent
                self.member_manager.record_email_sent(member_id, "confirmation", subject)
                return {"success": True, "message": "Confirmation email sent successfully"}
            else:
                return result
        except Exception as e:
            logger.error(f"Error sending confirmation email: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def _send_email(self, to_email, subject, body, is_html=False):
        """Send an email."""
        try:
            # Create the email message
            msg = MIMEMultipart()
            msg["From"] = self.smtp_username
            msg["To"] = to_email
            msg["Subject"] = subject

            # Attach the body
            if is_html:
                msg.attach(MIMEText(body, "html"))
            else:
                msg.attach(MIMEText(body, "plain"))

            # Connect to the SMTP server
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.smtp_username, self.smtp_password)

            # Send the email
            server.send_message(msg)
            server.quit()

            logger.info(f"Email sent successfully to {to_email}")
            return {"success": True, "message": "Email sent successfully"}
        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            return {"success": False, "message": f"Error sending email: {str(e)}"}

# Example usage
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)

    # This is just for testing - in a real application, you would set these in environment variables
    email_sender = EmailSender()

    # Add a test member
    from member_manager import MemberManager
    member_manager = MemberManager()
    result = member_manager.add_member("Test User", "test@example.com", "Ally")
    member_id = result["member_id"]

    # Send a welcome email
    result = email_sender.send_welcome_email(member_id)
    print(result)
