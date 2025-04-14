import json
import os
import datetime
import uuid
import logging
from member_manager import MemberManager
from rewards_manager import RewardsManager

logger = logging.getLogger('blkout_nxt')

class EventManager:
    """A class to manage events and attendance in the BLKOUTHUB system."""

    def __init__(self, file_path="data/events.json"):
        """Initialize the EventManager with the path to the JSON file."""
        self.file_path = file_path
        self.member_manager = MemberManager()
        self.rewards_manager = RewardsManager()
        self.ensure_file_exists()

    def ensure_file_exists(self):
        """Ensure the JSON file exists, creating it if necessary."""
        # Always create the directory (no harm if it already exists)
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
        logger.info(f"Ensuring directory exists: {os.path.dirname(self.file_path)}")

        if not os.path.exists(self.file_path):
            logger.info(f"Creating new events file: {self.file_path}")
            # Create an empty JSON file with initial structure
            with open(self.file_path, 'w') as f:
                json.dump({
                    "events": [],
                    "attendance": []
                }, f, indent=2)
        else:
            logger.info(f"Events file already exists: {self.file_path}")

    def load_data(self):
        """Load the events data from the JSON file."""
        try:
            with open(self.file_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading events data: {str(e)}")
            # Return empty data structure if file can't be read
            return {
                "events": [],
                "attendance": []
            }

    def save_data(self, data):
        """Save the events data to the JSON file."""
        try:
            # First write to a temporary file
            temp_file = f"{self.file_path}.tmp"
            with open(temp_file, 'w') as f:
                json.dump(data, f, indent=2)

            # Then rename to the actual file (atomic operation)
            os.replace(temp_file, self.file_path)
            return True
        except Exception as e:
            logger.error(f"Error saving events data: {str(e)}")
            return False

    def create_event(self, name, description, event_date, location, event_type="in-person", max_attendees=None, registration_url=None):
        """Create a new event."""
        try:
            data = self.load_data()
            
            # Create a new event
            event = {
                "id": str(uuid.uuid4()),
                "name": name,
                "description": description,
                "event_date": event_date,
                "location": location,
                "event_type": event_type,
                "max_attendees": max_attendees,
                "registration_url": registration_url,
                "created_at": datetime.datetime.now().isoformat(),
                "updated_at": datetime.datetime.now().isoformat()
            }
            
            # Add the event to the data
            data["events"].append(event)
            
            # Save the data
            if self.save_data(data):
                return {"success": True, "message": "Event created successfully", "event_id": event["id"]}
            else:
                return {"success": False, "message": "Failed to save data"}
        except Exception as e:
            logger.error(f"Error creating event: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def get_event(self, event_id):
        """Get an event by ID."""
        try:
            data = self.load_data()
            
            # Find the event
            for event in data.get("events", []):
                if event["id"] == event_id:
                    return event
            
            return None
        except Exception as e:
            logger.error(f"Error getting event: {str(e)}")
            return None

    def get_events(self, upcoming_only=False):
        """Get all events, optionally filtered to upcoming events only."""
        try:
            data = self.load_data()
            events = data.get("events", [])
            
            if upcoming_only:
                # Filter to only include events that haven't happened yet
                now = datetime.datetime.now().isoformat()
                events = [event for event in events if event.get("event_date", "") > now]
            
            return events
        except Exception as e:
            logger.error(f"Error getting events: {str(e)}")
            return []

    def update_event(self, event_id, name=None, description=None, event_date=None, location=None, 
                    event_type=None, max_attendees=None, registration_url=None):
        """Update an existing event."""
        try:
            data = self.load_data()
            
            # Find the event
            for i, event in enumerate(data.get("events", [])):
                if event["id"] == event_id:
                    # Update the event fields
                    if name is not None:
                        data["events"][i]["name"] = name
                    if description is not None:
                        data["events"][i]["description"] = description
                    if event_date is not None:
                        data["events"][i]["event_date"] = event_date
                    if location is not None:
                        data["events"][i]["location"] = location
                    if event_type is not None:
                        data["events"][i]["event_type"] = event_type
                    if max_attendees is not None:
                        data["events"][i]["max_attendees"] = max_attendees
                    if registration_url is not None:
                        data["events"][i]["registration_url"] = registration_url
                    
                    # Update the updated_at timestamp
                    data["events"][i]["updated_at"] = datetime.datetime.now().isoformat()
                    
                    # Save the data
                    if self.save_data(data):
                        return {"success": True, "message": "Event updated successfully"}
                    else:
                        return {"success": False, "message": "Failed to save data"}
            
            return {"success": False, "message": "Event not found"}
        except Exception as e:
            logger.error(f"Error updating event: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def delete_event(self, event_id):
        """Delete an event."""
        try:
            data = self.load_data()
            
            # Find the event
            for i, event in enumerate(data.get("events", [])):
                if event["id"] == event_id:
                    # Remove the event
                    del data["events"][i]
                    
                    # Remove any attendance records for this event
                    data["attendance"] = [a for a in data.get("attendance", []) if a.get("event_id") != event_id]
                    
                    # Save the data
                    if self.save_data(data):
                        return {"success": True, "message": "Event deleted successfully"}
                    else:
                        return {"success": False, "message": "Failed to save data"}
            
            return {"success": False, "message": "Event not found"}
        except Exception as e:
            logger.error(f"Error deleting event: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def record_attendance(self, event_id, member_id, check_in_method="manual", notes=None):
        """Record a member's attendance at an event."""
        try:
            # Check if the event exists
            event = self.get_event(event_id)
            if not event:
                logger.warning(f"Event not found for ID: {event_id}")
                return {"success": False, "message": "Event not found"}
            
            # Check if the member exists
            member = self.member_manager.get_member(member_id=member_id)
            if not member:
                logger.warning(f"Member not found for ID: {member_id}")
                return {"success": False, "message": "Member not found"}
            
            data = self.load_data()
            
            # Check if the member has already been recorded as attending this event
            for attendance in data.get("attendance", []):
                if attendance.get("event_id") == event_id and attendance.get("member_id") == member_id:
                    logger.info(f"Member {member_id} already recorded as attending event {event_id}")
                    return {"success": True, "message": "Attendance already recorded", "already_recorded": True}
            
            # Record the attendance
            attendance = {
                "id": str(uuid.uuid4()),
                "event_id": event_id,
                "member_id": member_id,
                "check_in_time": datetime.datetime.now().isoformat(),
                "check_in_method": check_in_method,
                "notes": notes
            }
            
            # Add the attendance to the data
            if not "attendance" in data:
                data["attendance"] = []
            
            data["attendance"].append(attendance)
            
            # Save the data
            if self.save_data(data):
                # Award points for attending the event
                reward_result = self.rewards_manager.award_points(
                    member_id, 
                    "attend_event", 
                    f"Attended event: {event.get('name')}"
                )
                
                if reward_result["success"]:
                    logger.info(f"Awarded {reward_result['points']} points to {member_id} for attending event {event_id}")
                    
                    # Check for achievements
                    self.rewards_manager.check_achievements(member_id)
                
                return {
                    "success": True, 
                    "message": "Attendance recorded successfully", 
                    "attendance_id": attendance["id"],
                    "points_awarded": reward_result.get("points", 0) if reward_result["success"] else 0
                }
            else:
                return {"success": False, "message": "Failed to save data"}
        except Exception as e:
            logger.error(f"Error recording attendance: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def get_event_attendees(self, event_id):
        """Get all attendees for an event."""
        try:
            data = self.load_data()
            
            # Find all attendance records for this event
            attendees = []
            for attendance in data.get("attendance", []):
                if attendance.get("event_id") == event_id:
                    # Get the member details
                    member_id = attendance.get("member_id")
                    member = self.member_manager.get_member(member_id=member_id)
                    
                    if member:
                        attendee = {
                            "attendance_id": attendance.get("id"),
                            "member_id": member_id,
                            "name": member.get("name", "Unknown"),
                            "email": member.get("email", ""),
                            "member_type": member.get("member_type", ""),
                            "check_in_time": attendance.get("check_in_time"),
                            "check_in_method": attendance.get("check_in_method"),
                            "notes": attendance.get("notes")
                        }
                        attendees.append(attendee)
            
            return attendees
        except Exception as e:
            logger.error(f"Error getting event attendees: {str(e)}")
            return []

    def get_member_events(self, member_id):
        """Get all events a member has attended."""
        try:
            data = self.load_data()
            
            # Find all attendance records for this member
            member_events = []
            for attendance in data.get("attendance", []):
                if attendance.get("member_id") == member_id:
                    # Get the event details
                    event_id = attendance.get("event_id")
                    event = self.get_event(event_id)
                    
                    if event:
                        event_record = {
                            "attendance_id": attendance.get("id"),
                            "event_id": event_id,
                            "name": event.get("name", "Unknown"),
                            "description": event.get("description", ""),
                            "event_date": event.get("event_date", ""),
                            "location": event.get("location", ""),
                            "check_in_time": attendance.get("check_in_time"),
                            "check_in_method": attendance.get("check_in_method"),
                            "notes": attendance.get("notes")
                        }
                        member_events.append(event_record)
            
            return member_events
        except Exception as e:
            logger.error(f"Error getting member events: {str(e)}")
            return []

    def generate_attendance_report(self, event_id=None, start_date=None, end_date=None):
        """Generate a report of event attendance, optionally filtered by event or date range."""
        try:
            data = self.load_data()
            
            # Filter attendance records
            attendance_records = data.get("attendance", [])
            
            if event_id:
                attendance_records = [a for a in attendance_records if a.get("event_id") == event_id]
            
            if start_date:
                attendance_records = [a for a in attendance_records if a.get("check_in_time", "") >= start_date]
            
            if end_date:
                attendance_records = [a for a in attendance_records if a.get("check_in_time", "") <= end_date]
            
            # Build the report
            report = {
                "total_attendance": len(attendance_records),
                "events": {},
                "members": {},
                "attendance_by_date": {}
            }
            
            for attendance in attendance_records:
                event_id = attendance.get("event_id")
                member_id = attendance.get("member_id")
                check_in_time = attendance.get("check_in_time", "")
                
                # Get the event and member details
                event = self.get_event(event_id)
                member = self.member_manager.get_member(member_id=member_id)
                
                if event:
                    event_name = event.get("name", "Unknown")
                    if event_id not in report["events"]:
                        report["events"][event_id] = {
                            "name": event_name,
                            "attendee_count": 0,
                            "attendees": []
                        }
                    
                    report["events"][event_id]["attendee_count"] += 1
                    
                    if member:
                        report["events"][event_id]["attendees"].append({
                            "member_id": member_id,
                            "name": member.get("name", "Unknown"),
                            "email": member.get("email", ""),
                            "check_in_time": check_in_time
                        })
                
                if member:
                    if member_id not in report["members"]:
                        report["members"][member_id] = {
                            "name": member.get("name", "Unknown"),
                            "email": member.get("email", ""),
                            "event_count": 0,
                            "events": []
                        }
                    
                    report["members"][member_id]["event_count"] += 1
                    
                    if event:
                        report["members"][member_id]["events"].append({
                            "event_id": event_id,
                            "name": event.get("name", "Unknown"),
                            "check_in_time": check_in_time
                        })
                
                # Group by date (just the date part, not time)
                if check_in_time:
                    date_only = check_in_time.split("T")[0]
                    if date_only not in report["attendance_by_date"]:
                        report["attendance_by_date"][date_only] = 0
                    
                    report["attendance_by_date"][date_only] += 1
            
            return report
        except Exception as e:
            logger.error(f"Error generating attendance report: {str(e)}")
            return {"error": str(e)}

    def generate_qr_code(self, event_id):
        """Generate a QR code for event check-in."""
        try:
            # This would typically generate a QR code image or URL
            # For now, we'll just return a check-in URL
            check_in_url = f"https://blkouthub.com/event-check-in/{event_id}"
            return {"success": True, "check_in_url": check_in_url}
        except Exception as e:
            logger.error(f"Error generating QR code: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}

# Example usage
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    event_manager = EventManager()
    
    # Create a test event
    result = event_manager.create_event(
        name="BLKOUTHUB Community Meetup",
        description="Monthly community gathering for BLKOUTHUB members",
        event_date="2025-05-15T18:00:00",
        location="Community Center, 123 Main St",
        event_type="in-person",
        max_attendees=50,
        registration_url="https://blkouthub.com/events/register/community-meetup"
    )
    
    print(f"Created event: {result}")
    
    if result["success"]:
        event_id = result["event_id"]
        
        # Add a test member
        member_manager = MemberManager()
        member_result = member_manager.add_member("Test Attendee", "attendee@example.com", "Ally")
        
        if member_result["success"]:
            member_id = member_result["member_id"]
            
            # Record attendance
            attendance_result = event_manager.record_attendance(event_id, member_id)
            print(f"Recorded attendance: {attendance_result}")
            
            # Get event attendees
            attendees = event_manager.get_event_attendees(event_id)
            print(f"Event attendees: {attendees}")
            
            # Generate attendance report
            report = event_manager.generate_attendance_report(event_id=event_id)
            print(f"Attendance report: {report}")
