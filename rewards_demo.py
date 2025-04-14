import json
import logging
from member_manager import MemberManager
from rewards_manager import RewardsManager
from heartbeat_integration import HeartbeatIntegration

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('rewards_demo')

def demo_rewards_system():
    """Demonstrate the BLKOUTHUB rewards system functionality."""
    print("=" * 50)
    print("BLKOUTHUB Rewards System Demo")
    print("=" * 50)
    
    # Initialize managers
    member_manager = MemberManager()
    rewards_manager = RewardsManager()
    heartbeat = HeartbeatIntegration()
    
    # Create a demo member
    print("\n1. Creating a demo member...")
    result = member_manager.add_member("Demo User", "demo@example.com", "Ally")
    
    if not result["success"]:
        print(f"Failed to create demo member: {result['message']}")
        return
    
    member_id = result["member_id"]
    print(f"Created member with ID: {member_id}")
    
    # Get the member's rewards profile
    print("\n2. Getting rewards profile...")
    rewards = rewards_manager.get_user_rewards(member_id)
    
    if not rewards:
        print("Failed to get rewards profile")
        return
    
    print(f"Initial rewards profile:")
    print(f"  Level: {rewards.get('level', 1)}")
    print(f"  Points: {rewards.get('current_points', 0)}")
    print(f"  Achievements: {len(rewards.get('achievements', []))}")
    
    # Award points for different actions
    print("\n3. Simulating user actions and awarding points...")
    
    # Simulate completing a survey
    print("\n   a. User completes a survey...")
    result = rewards_manager.award_points(member_id, "complete_survey", "Completed the ally survey")
    
    if result["success"]:
        print(f"  Awarded {result['points']} points")
        print(f"  Current points: {result['current_points']}")
    
    # Simulate attending an event
    print("\n   b. User attends a community event...")
    result = rewards_manager.award_points(member_id, "attend_event", "Attended BLKOUTHUB community meetup")
    
    if result["success"]:
        print(f"  Awarded {result['points']} points")
        print(f"  Current points: {result['current_points']}")
    
    # Simulate referring a friend
    print("\n   c. User refers a friend...")
    result = rewards_manager.award_points(member_id, "refer_friend", "Referred a friend to BLKOUTHUB")
    
    if result["success"]:
        print(f"  Awarded {result['points']} points")
        print(f"  Current points: {result['current_points']}")
    
    # Check achievements
    print("\n4. Checking earned achievements...")
    rewards = rewards_manager.get_user_rewards(member_id)
    
    if rewards and "achievements" in rewards:
        if rewards["achievements"]:
            print(f"  User has earned {len(rewards['achievements'])} achievements:")
            for achievement in rewards["achievements"]:
                print(f"  - {achievement.get('name')}: {achievement.get('description')}")
        else:
            print("  No achievements earned yet")
    
    # Check level
    print("\n5. Checking user level...")
    print(f"  Current level: {rewards.get('level', 1)}")
    
    # Get leaderboard
    print("\n6. Generating leaderboard...")
    all_rewards = rewards_manager.get_all_user_rewards()
    
    if all_rewards:
        # Sort by points (descending)
        leaderboard = sorted(all_rewards, key=lambda x: x.get("current_points", 0), reverse=True)
        
        # Add member details
        for entry in leaderboard:
            member = member_manager.get_member(member_id=entry.get("member_id"))
            if member:
                entry["name"] = member.get("name", "Unknown")
                entry["email"] = member.get("email", "")
                entry["member_type"] = member.get("member_type", "")
        
        print("  Top members by points:")
        for i, entry in enumerate(leaderboard[:5]):
            print(f"  {i+1}. {entry.get('name')} - {entry.get('current_points')} points (Level {entry.get('level')})")
    
    print("\n" + "=" * 50)
    print("Demo completed successfully!")
    print("=" * 50)

if __name__ == "__main__":
    demo_rewards_system()
