import json
import logging
from member_manager import MemberManager
from rewards_manager import RewardsManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('community_engagement_demo')

def demo_community_engagement():
    """Demonstrate the BLKOUTHUB community engagement features."""
    print("=" * 50)
    print("BLKOUTHUB Community Engagement Demo")
    print("=" * 50)
    
    # Initialize managers
    member_manager = MemberManager()
    rewards_manager = RewardsManager()
    
    # Create demo members with different levels
    print("\n1. Creating demo members with different levels...")
    members = []
    
    # Level 1 member (Bronze)
    result = member_manager.add_member("Bronze Member", "bronze@example.com", "Ally")
    if result["success"]:
        bronze_id = result["member_id"]
        members.append({"id": bronze_id, "name": "Bronze Member", "level": 1})
    
    # Level 3 member (Silver)
    result = member_manager.add_member("Silver Member", "silver@example.com", "Ally")
    if result["success"]:
        silver_id = result["member_id"]
        members.append({"id": silver_id, "name": "Silver Member", "level": 3})
        
        # Manually set the level to 3
        rewards = rewards_manager.get_user_rewards(silver_id)
        if rewards:
            data = rewards_manager.load_data()
            for i, reward in enumerate(data.get("user_rewards", [])):
                if reward["member_id"] == silver_id:
                    data["user_rewards"][i]["level"] = 3
                    data["user_rewards"][i]["current_points"] = 250
                    data["user_rewards"][i]["lifetime_points"] = 250
                    rewards_manager.save_data(data)
    
    # Level 5 member (Gold)
    result = member_manager.add_member("Gold Member", "gold@example.com", "Ally")
    if result["success"]:
        gold_id = result["member_id"]
        members.append({"id": gold_id, "name": "Gold Member", "level": 5})
        
        # Manually set the level to 5
        rewards = rewards_manager.get_user_rewards(gold_id)
        if rewards:
            data = rewards_manager.load_data()
            for i, reward in enumerate(data.get("user_rewards", [])):
                if reward["member_id"] == gold_id:
                    data["user_rewards"][i]["level"] = 5
                    data["user_rewards"][i]["current_points"] = 1000
                    data["user_rewards"][i]["lifetime_points"] = 1000
                    rewards_manager.save_data(data)
    
    # Level 8 member (Platinum)
    result = member_manager.add_member("Platinum Member", "platinum@example.com", "Ally")
    if result["success"]:
        platinum_id = result["member_id"]
        members.append({"id": platinum_id, "name": "Platinum Member", "level": 8})
        
        # Manually set the level to 8
        rewards = rewards_manager.get_user_rewards(platinum_id)
        if rewards:
            data = rewards_manager.load_data()
            for i, reward in enumerate(data.get("user_rewards", [])):
                if reward["member_id"] == platinum_id:
                    data["user_rewards"][i]["level"] = 8
                    data["user_rewards"][i]["current_points"] = 8000
                    data["user_rewards"][i]["lifetime_points"] = 8000
                    rewards_manager.save_data(data)
    
    print(f"Created {len(members)} demo members with different levels")
    
    # Check access levels for each member
    print("\n2. Checking access levels for each member...")
    for member in members:
        result = rewards_manager.get_user_access_level(member["id"])
        if result["success"]:
            access_level = result["access_level"]
            print(f"  {member['name']} (Level {member['level']}):")
            print(f"    Access Level: {access_level.get('name')}")
            print(f"    Description: {access_level.get('description')}")
            print(f"    Features:")
            for feature in access_level.get("features", []):
                print(f"      - {feature}")
    
    # Check content access for each member
    print("\n3. Checking content access for each member...")
    content_items = rewards_manager.get_exclusive_content()
    
    for member in members:
        print(f"\n  {member['name']} (Level {member['level']}):")
        result = rewards_manager.get_available_content(member["id"])
        
        if result["success"]:
            available_content = result["available_content"]
            print(f"    Has access to {len(available_content)} content items:")
            
            for content in available_content:
                print(f"      - {content.get('name')} ({content.get('content_type')})")
                print(f"        {content.get('description')}")
                print(f"        Required Level: {content.get('required_level')}")
                print(f"        Access Level: {content.get('access_level')}")
    
    # Create some point history for challenge progress
    print("\n4. Creating point history for challenge progress...")
    
    # Add survey completions for the gold member
    for i in range(3):
        rewards_manager.award_points(gold_id, "complete_survey", f"Completed survey {i+1}")
    
    # Add event attendance for the gold member
    for i in range(2):
        rewards_manager.award_points(gold_id, "attend_event", f"Attended event {i+1}")
    
    # Add referrals for the gold member
    for i in range(3):
        rewards_manager.award_points(gold_id, "refer_friend", f"Referred friend {i+1}")
    
    print("  Created point history for Gold Member")
    
    # Check challenge progress
    print("\n5. Checking challenge progress...")
    challenges = rewards_manager.get_community_challenges()
    
    for member in members:
        if member["level"] >= 5:  # Only check for gold and platinum members
            print(f"\n  {member['name']} (Level {member['level']}):")
            result = rewards_manager.get_user_challenges(member["id"])
            
            if result["success"]:
                for challenge_progress in result["challenges"]:
                    challenge = challenge_progress["challenge"]
                    completed = challenge_progress["completed"]
                    progress = challenge_progress["progress"]
                    
                    print(f"    Challenge: {challenge.get('name')}")
                    print(f"      Description: {challenge.get('description')}")
                    print(f"      Progress: {progress:.0%}")
                    print(f"      Completed: {completed}")
                    
                    if completed:
                        print(f"      Points Reward: {challenge.get('points')}")
    
    # Complete a challenge
    print("\n6. Completing a challenge...")
    if len(members) >= 3:  # Make sure we have a gold member
        gold_member = members[2]
        challenge_id = "survey_challenge"  # Survey Champion challenge
        
        print(f"  Attempting to complete '{challenge_id}' challenge for {gold_member['name']}...")
        result = rewards_manager.complete_challenge(gold_member["id"], challenge_id)
        
        if result["success"]:
            print(f"    Success! {result['message']}")
            print(f"    Points Awarded: {result['points_awarded']}")
            print(f"    Current Points: {result['current_points']}")
        else:
            print(f"    Failed: {result['message']}")
    
    print("\n" + "=" * 50)
    print("Demo completed successfully!")
    print("=" * 50)

if __name__ == "__main__":
    demo_community_engagement()
