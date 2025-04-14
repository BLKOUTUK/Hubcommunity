import json
import logging
from member_manager import MemberManager
from rewards_manager import RewardsManager
from heartbeat_integration import HeartbeatIntegration

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('heartbeat_demo')

def demo_heartbeat_integration():
    """Demonstrate the BLKOUTHUB Heartbeat.chat integration."""
    print("=" * 50)
    print("BLKOUTHUB Heartbeat.chat Integration Demo")
    print("=" * 50)

    # Initialize managers
    member_manager = MemberManager()
    rewards_manager = RewardsManager()
    heartbeat = HeartbeatIntegration()

    # Create a demo member
    print("\n1. Creating a demo member...")
    result = member_manager.add_member("Heartbeat Demo User 3", "heartbeat3@example.com", "Ally")

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

    # Get the member's access level
    print("\n3. Getting access level...")
    access_result = rewards_manager.get_user_access_level(member_id)

    if access_result["success"]:
        access_level = access_result["access_level"]
        print(f"  Access Level: {access_level.get('name')}")
        print(f"  Description: {access_level.get('description')}")
        print(f"  Features:")
        for feature in access_level.get("features", []):
            print(f"    - {feature}")

    # Award some points to level up
    print("\n4. Awarding points to level up...")
    for i in range(5):
        rewards_manager.award_points(member_id, "complete_survey", f"Completed survey {i+1}")

    for i in range(3):
        rewards_manager.award_points(member_id, "attend_event", f"Attended event {i+1}")

    for i in range(2):
        rewards_manager.award_points(member_id, "refer_friend", f"Referred friend {i+1}")

    # Check the updated rewards profile
    print("\n5. Checking updated rewards profile...")
    rewards = rewards_manager.get_user_rewards(member_id)

    if rewards:
        print(f"  Level: {rewards.get('level', 1)}")
        print(f"  Points: {rewards.get('current_points', 0)}")
        print(f"  Achievements: {len(rewards.get('achievements', []))}")

        if rewards.get("achievements"):
            print(f"  Earned achievements:")
            for achievement in rewards.get("achievements", []):
                print(f"    - {achievement.get('name')}: {achievement.get('description')}")

    # Get the updated access level
    print("\n6. Getting updated access level...")
    access_result = rewards_manager.get_user_access_level(member_id)

    if access_result["success"]:
        access_level = access_result["access_level"]
        print(f"  Access Level: {access_level.get('name')}")
        print(f"  Description: {access_level.get('description')}")
        print(f"  Features:")
        for feature in access_level.get("features", []):
            print(f"    - {feature}")

    # Check challenge progress
    print("\n7. Checking challenge progress...")
    challenges_result = rewards_manager.get_user_challenges(member_id)

    if challenges_result["success"]:
        for challenge_progress in challenges_result["challenges"]:
            challenge = challenge_progress["challenge"]
            completed = challenge_progress["completed"]
            progress = challenge_progress["progress"]

            print(f"  Challenge: {challenge.get('name')}")
            print(f"    Description: {challenge.get('description')}")
            print(f"    Progress: {progress:.0%}")
            print(f"    Completed: {completed}")

    # Complete a challenge
    print("\n8. Completing a challenge...")
    challenge_id = "survey_challenge"  # Survey Champion challenge

    print(f"  Attempting to complete '{challenge_id}' challenge...")
    result = rewards_manager.complete_challenge(member_id, challenge_id)

    if result["success"]:
        print(f"    Success! {result['message']}")
        print(f"    Points Awarded: {result['points_awarded']}")
        print(f"    Current Points: {result['current_points']}")
    else:
        print(f"    Failed: {result['message']}")

    # Update the user's profile in Heartbeat
    print("\n9. Updating user profile in Heartbeat...")
    rewards = rewards_manager.get_user_rewards(member_id)

    if rewards:
        # Get the access level
        access_result = rewards_manager.get_user_access_level(member_id)
        if access_result["success"]:
            access_level = access_result["access_level"]
            rewards["access_level"] = access_level

        # Get challenge progress
        challenges_result = rewards_manager.get_user_challenges(member_id)
        if challenges_result["success"]:
            rewards["challenges"] = challenges_result["challenges"]

        # Update the profile
        result = heartbeat.update_user_rewards(member_id, rewards)
        print(f"  Update result: {result['success']}")

    print("\n" + "=" * 50)
    print("Demo completed successfully!")
    print("=" * 50)

if __name__ == "__main__":
    demo_heartbeat_integration()
