import json
import logging
from member_manager import MemberManager
from rewards_manager import RewardsManager
from notification_manager import NotificationManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('notification_demo')

def demo_notification_system():
    """Demonstrate the BLKOUTHUB notification system."""
    print("=" * 50)
    print("BLKOUTHUB Notification System Demo")
    print("=" * 50)
    
    # Initialize managers
    member_manager = MemberManager()
    rewards_manager = RewardsManager()
    notification_manager = NotificationManager()
    
    # Create a demo member
    print("\n1. Creating a demo member...")
    result = member_manager.add_member("Notification Demo User", "notification@example.com", "Ally")
    
    if not result["success"]:
        print(f"Failed to create demo member: {result['message']}")
        return
    
    member_id = result["member_id"]
    print(f"Created member with ID: {member_id}")
    
    # Create different types of notifications
    print("\n2. Creating different types of notifications...")
    
    # Achievement notification
    achievement_result = notification_manager.create_notification(
        member_id=member_id,
        notification_type="achievement",
        title="Achievement Unlocked: Demo Achievement",
        message="You've earned the Demo Achievement badge!",
        data={
            "achievement": {
                "id": "demo_achievement",
                "name": "Demo Achievement",
                "description": "This is a demo achievement"
            },
            "bonus_points": 50
        }
    )
    
    print(f"  Achievement notification created: {achievement_result['success']}")
    
    # Level up notification
    level_up_result = notification_manager.create_notification(
        member_id=member_id,
        notification_type="level_up",
        title="Level Up! You're now level 3",
        message="Congratulations! You've reached level 3 in the BLKOUTHUB community.",
        data={
            "old_level": 2,
            "new_level": 3,
            "points": 250,
            "lifetime_points": 250
        }
    )
    
    print(f"  Level up notification created: {level_up_result['success']}")
    
    # Challenge completion notification
    challenge_result = notification_manager.create_notification(
        member_id=member_id,
        notification_type="challenge_completion",
        title="Challenge Completed: Demo Challenge",
        message="You've completed the Demo Challenge and earned 100 points!",
        data={
            "challenge": {
                "id": "demo_challenge",
                "name": "Demo Challenge",
                "description": "This is a demo challenge"
            },
            "points": 100
        }
    )
    
    print(f"  Challenge completion notification created: {challenge_result['success']}")
    
    # Access level change notification
    access_level_result = notification_manager.create_notification(
        member_id=member_id,
        notification_type="access_level_change",
        title="Access Level Upgraded: Silver Access",
        message="You've been upgraded to Silver Access! You now have access to new features and content.",
        data={
            "access_level": {
                "id": "silver",
                "name": "Silver Access",
                "description": "Enhanced access for active members"
            },
            "old_access_id": "bronze",
            "new_access_id": "silver"
        }
    )
    
    print(f"  Access level change notification created: {access_level_result['success']}")
    
    # Get notifications for the member
    print("\n3. Getting notifications for the member...")
    notifications_result = notification_manager.get_notifications(member_id=member_id)
    
    if notifications_result["success"]:
        notifications = notifications_result["notifications"]
        print(f"  Found {len(notifications)} notifications:")
        
        for notification in notifications:
            print(f"    - Type: {notification.get('type')}")
            print(f"      Title: {notification.get('title')}")
            print(f"      Message: {notification.get('message')}")
            print(f"      Created: {notification.get('created_at')}")
            print(f"      Read: {notification.get('read')}")
            print()
    
    # Mark a notification as read
    print("\n4. Marking a notification as read...")
    if notifications_result["success"] and notifications:
        notification_id = notifications[0]["id"]
        read_result = notification_manager.mark_notification_read(notification_id)
        
        print(f"  Notification marked as read: {read_result['success']}")
        
        # Get the updated notification
        notification = next((n for n in notification_manager.get_notifications(member_id=member_id)["notifications"] if n["id"] == notification_id), None)
        
        if notification:
            print(f"  Updated read status: {notification.get('read')}")
    
    # Add a webhook
    print("\n5. Adding a webhook...")
    webhook_result = notification_manager.add_webhook(
        name="Demo Webhook",
        url="https://example.com/webhook",
        events=["achievement", "level_up", "challenge_completion", "access_level_change"],
        headers={"Content-Type": "application/json", "X-API-Key": "demo_key"}
    )
    
    print(f"  Webhook added: {webhook_result['success']}")
    
    # Get webhooks
    print("\n6. Getting webhooks...")
    webhooks_result = notification_manager.get_webhooks()
    
    if webhooks_result["success"]:
        webhooks = webhooks_result["webhooks"]
        print(f"  Found {len(webhooks)} webhooks:")
        
        for webhook in webhooks:
            print(f"    - Name: {webhook.get('name')}")
            print(f"      URL: {webhook.get('url')}")
            print(f"      Events: {webhook.get('events')}")
            print(f"      Enabled: {webhook.get('enabled')}")
            print()
    
    # Test a webhook
    print("\n7. Testing a webhook...")
    if webhooks_result["success"] and webhooks:
        webhook_id = webhooks[0]["id"]
        test_result = notification_manager.test_webhook(webhook_id)
        
        print(f"  Webhook test result: {test_result['success']}")
        if not test_result["success"]:
            print(f"  Error: {test_result.get('message')}")
    
    # Delete old notifications
    print("\n8. Deleting old notifications...")
    cleanup_result = notification_manager.delete_old_notifications(days=30)
    
    print(f"  Cleanup result: {cleanup_result['success']}")
    print(f"  Deleted count: {cleanup_result.get('deleted_count', 0)}")
    
    print("\n" + "=" * 50)
    print("Demo completed successfully!")
    print("=" * 50)

if __name__ == "__main__":
    demo_notification_system()
