import logging
import json
from member_manager import MemberManager
from rewards_manager import RewardsManager
from heartbeat_integration import HeartbeatIntegration

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('test_rewards')

def test_rewards_system():
    """Test the rewards system functionality."""
    print("Testing BLKOUTHUB Rewards System")
    print("-" * 50)
    
    # Initialize managers
    member_manager = MemberManager()
    rewards_manager = RewardsManager()
    heartbeat = HeartbeatIntegration()
    
    # Create a test member
    print("\n1. Creating test member...")
    result = member_manager.add_member("Test User", "test@example.com", "Ally")
    
    if not result["success"]:
        print(f"Failed to create test member: {result['message']}")
        return
    
    member_id = result["member_id"]
    print(f"Created member with ID: {member_id}")
    
    # Get the member's rewards profile
    print("\n2. Getting rewards profile...")
    rewards = rewards_manager.get_user_rewards(member_id)
    
    if not rewards:
        print("Failed to get rewards profile")
        return
    
    print(f"Initial rewards profile: {json.dumps(rewards, indent=2)}")
    
    # Award points for different actions
    print("\n3. Awarding points for different actions...")
    
    # Award points for completing a survey
    print("\n   a. Awarding points for survey completion...")
    result = rewards_manager.award_points(member_id, "complete_survey", "Completed the ally survey")
    
    if not result["success"]:
        print(f"Failed to award points: {result['message']}")
    else:
        print(f"Awarded {result['points']} points for survey completion")
        print(f"Current points: {result['current_points']}")
        print(f"Lifetime points: {result['lifetime_points']}")
    
    # Award points for attending an event
    print("\n   b. Awarding points for event attendance...")
    result = rewards_manager.award_points(member_id, "attend_event", "Attended BLKOUTHUB community meetup")
    
    if not result["success"]:
        print(f"Failed to award points: {result['message']}")
    else:
        print(f"Awarded {result['points']} points for event attendance")
        print(f"Current points: {result['current_points']}")
        print(f"Lifetime points: {result['lifetime_points']}")
    
    # Award points for referring a friend
    print("\n   c. Awarding points for referring a friend...")
    result = rewards_manager.award_points(member_id, "refer_friend", "Referred a friend to BLKOUTHUB")
    
    if not result["success"]:
        print(f"Failed to award points: {result['message']}")
    else:
        print(f"Awarded {result['points']} points for referring a friend")
        print(f"Current points: {result['current_points']}")
        print(f"Lifetime points: {result['lifetime_points']}")
    
    # Check achievements
    print("\n4. Checking achievements...")
    result = rewards_manager.check_achievements(member_id)
    
    if not result["success"]:
        print(f"Failed to check achievements: {result['message']}")
    else:
        if "achievements" in result:
            print(f"Earned achievements: {', '.join(result['achievements'])}")
        else:
            print("No new achievements earned")
    
    # Get updated rewards profile
    print("\n5. Getting updated rewards profile...")
    rewards = rewards_manager.get_user_rewards(member_id)
    
    if not rewards:
        print("Failed to get rewards profile")
        return
    
    print(f"Updated rewards profile: {json.dumps(rewards, indent=2)}")
    
    # Get leaderboard
    print("\n6. Getting leaderboard...")
    all_rewards = rewards_manager.get_all_user_rewards()
    
    if not all_rewards:
        print("Failed to get leaderboard")
        return
    
    # Sort by points (descending)
    leaderboard = sorted(all_rewards, key=lambda x: x.get("current_points", 0), reverse=True)
    
    # Add member details
    for entry in leaderboard:
        member = member_manager.get_member(member_id=entry.get("member_id"))
        if member:
            entry["name"] = member.get("name", "Unknown")
            entry["email"] = member.get("email", "")
            entry["member_type"] = member.get("member_type", "")
    
    print(f"Leaderboard: {json.dumps(leaderboard, indent=2)}")
    
    # Test Heartbeat integration if API key is set
    print("\n7. Testing Heartbeat integration...")
    if heartbeat.api_key:
        # Find the user in Heartbeat by email
        result = heartbeat.find_user_by_email("test@example.com")
        
        if result["success"] and "data" in result and result["data"]:
            heartbeat_id = result["data"].get("id")
            print(f"Found user in Heartbeat with ID: {heartbeat_id}")
            
            # Update the user's Heartbeat profile with rewards information
            update_result = heartbeat.update_user_rewards(heartbeat_id, rewards)
            
            if update_result["success"]:
                print("Successfully updated Heartbeat profile with rewards information")
            else:
                print(f"Failed to update Heartbeat profile: {update_result['message']}")
        else:
            print("User not found in Heartbeat or API key not set")
    else:
        print("Heartbeat API key not set, skipping integration test")
    
    print("\nRewards system test completed successfully!")

if __name__ == "__main__":
    test_rewards_system()
