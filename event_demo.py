import json
import logging
import datetime
from member_manager import MemberManager
from rewards_manager import RewardsManager
from event_manager import EventManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('event_demo')

def demo_event_system():
    """Demonstrate the BLKOUTHUB event system functionality."""
    print("=" * 50)
    print("BLKOUTHUB Event System Demo")
    print("=" * 50)
    
    # Initialize managers
    member_manager = MemberManager()
    rewards_manager = RewardsManager()
    event_manager = EventManager()
    
    # Create demo members
    print("\n1. Creating demo members...")
    members = []
    
    for i in range(1, 6):
        result = member_manager.add_member(f"Demo Member {i}", f"member{i}@example.com", "Ally")
        if result["success"]:
            members.append({"id": result["member_id"], "name": f"Demo Member {i}"})
    
    print(f"Created {len(members)} demo members")
    
    # Create demo events
    print("\n2. Creating demo events...")
    events = []
    
    # Create a past event
    past_date = (datetime.datetime.now() - datetime.timedelta(days=30)).isoformat()
    result = event_manager.create_event(
        name="BLKOUTHUB Past Meetup",
        description="A past community gathering for BLKOUTHUB members",
        event_date=past_date,
        location="Community Center, 123 Main St",
        event_type="in-person",
        max_attendees=50
    )
    
    if result["success"]:
        events.append({"id": result["event_id"], "name": "BLKOUTHUB Past Meetup"})
    
    # Create a current event
    current_date = datetime.datetime.now().isoformat()
    result = event_manager.create_event(
        name="BLKOUTHUB Current Workshop",
        description="A current workshop for BLKOUTHUB members",
        event_date=current_date,
        location="Workshop Space, 456 Oak Ave",
        event_type="in-person",
        max_attendees=30
    )
    
    if result["success"]:
        events.append({"id": result["event_id"], "name": "BLKOUTHUB Current Workshop"})
    
    # Create a future event
    future_date = (datetime.datetime.now() + datetime.timedelta(days=30)).isoformat()
    result = event_manager.create_event(
        name="BLKOUTHUB Future Conference",
        description="An upcoming conference for BLKOUTHUB members",
        event_date=future_date,
        location="Conference Center, 789 Pine Blvd",
        event_type="in-person",
        max_attendees=100
    )
    
    if result["success"]:
        events.append({"id": result["event_id"], "name": "BLKOUTHUB Future Conference"})
    
    print(f"Created {len(events)} demo events")
    
    # Record attendance for past event
    print("\n3. Recording attendance for past event...")
    past_event_id = events[0]["id"]
    
    for member in members:
        result = event_manager.record_attendance(
            event_id=past_event_id,
            member_id=member["id"],
            check_in_method="manual",
            notes=f"Demo attendance for {member['name']}"
        )
        
        if result["success"]:
            print(f"  Recorded attendance for {member['name']}")
            print(f"  Points awarded: {result.get('points_awarded', 0)}")
    
    # Get event attendees
    print("\n4. Getting attendees for past event...")
    attendees = event_manager.get_event_attendees(past_event_id)
    
    print(f"  Event has {len(attendees)} attendees:")
    for attendee in attendees:
        print(f"  - {attendee.get('name')} ({attendee.get('email')})")
    
    # Get member events
    print("\n5. Getting events for first member...")
    member_id = members[0]["id"]
    member_events = event_manager.get_member_events(member_id)
    
    print(f"  Member has attended {len(member_events)} events:")
    for event in member_events:
        print(f"  - {event.get('name')} on {event.get('event_date')}")
    
    # Generate attendance report
    print("\n6. Generating attendance report...")
    report = event_manager.generate_attendance_report()
    
    print(f"  Total attendance: {report.get('total_attendance', 0)}")
    print(f"  Number of events with attendance: {len(report.get('events', {}))}")
    
    # Check rewards for members
    print("\n7. Checking rewards for members...")
    for member in members:
        rewards = rewards_manager.get_user_rewards(member["id"])
        
        if rewards:
            print(f"  {member['name']}:")
            print(f"    Level: {rewards.get('level', 1)}")
            print(f"    Points: {rewards.get('current_points', 0)}")
            print(f"    Achievements: {len(rewards.get('achievements', []))}")
            
            if rewards.get('achievements', []):
                print(f"    Earned achievements:")
                for achievement in rewards.get('achievements', []):
                    print(f"      - {achievement.get('name')}: {achievement.get('description')}")
    
    # Generate QR code for future event
    print("\n8. Generating QR code for future event...")
    future_event_id = events[2]["id"]
    qr_result = event_manager.generate_qr_code(future_event_id)
    
    if qr_result["success"]:
        print(f"  QR code check-in URL: {qr_result.get('check_in_url')}")
    
    print("\n" + "=" * 50)
    print("Demo completed successfully!")
    print("=" * 50)

if __name__ == "__main__":
    demo_event_system()
