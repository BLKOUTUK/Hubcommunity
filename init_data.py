import os
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('init_data')

def init_data_directory():
    """Initialize the data directory with empty JSON files."""
    # Create the data directory if it doesn't exist
    data_dir = "data"
    os.makedirs(data_dir, exist_ok=True)
    logger.info(f"Created data directory: {data_dir}")
    
    # Create empty JSON files
    files = [
        "members.json",
        "rewards.json",
        "events.json",
        "notifications.json"
    ]
    
    for file in files:
        file_path = os.path.join(data_dir, file)
        if not os.path.exists(file_path):
            # Create an empty JSON file with initial structure
            if file == "members.json":
                data = {"members": []}
            elif file == "rewards.json":
                data = {
                    "user_rewards": [],
                    "reward_actions": [
                        {
                            "id": "complete_survey",
                            "name": "Complete Survey",
                            "description": "Complete a feedback survey",
                            "points": 50,
                            "category": "Engagement",
                            "one_time": False
                        },
                        {
                            "id": "attend_event",
                            "name": "Attend Event",
                            "description": "Attend a community event",
                            "points": 100,
                            "category": "Participation",
                            "one_time": False
                        },
                        {
                            "id": "refer_friend",
                            "name": "Refer Friend",
                            "description": "Refer a friend to the community",
                            "points": 200,
                            "category": "Growth",
                            "one_time": False
                        },
                        {
                            "id": "complete_profile",
                            "name": "Complete Profile",
                            "description": "Complete your member profile",
                            "points": 50,
                            "category": "Onboarding",
                            "one_time": True
                        },
                        {
                            "id": "custom",
                            "name": "Custom Action",
                            "description": "Custom action with custom points",
                            "points": 0,
                            "category": "Other",
                            "one_time": False
                        }
                    ],
                    "achievements": [
                        {
                            "id": "welcome",
                            "name": "Welcome",
                            "description": "Join the community",
                            "bonus_points": 50,
                            "requirements": [
                                {
                                    "type": "action",
                                    "action_id": "complete_profile",
                                    "count": 1
                                }
                            ]
                        },
                        {
                            "id": "event_attendee",
                            "name": "Event Attendee",
                            "description": "Attend your first event",
                            "bonus_points": 50,
                            "requirements": [
                                {
                                    "type": "action",
                                    "action_id": "attend_event",
                                    "count": 1
                                }
                            ]
                        },
                        {
                            "id": "event_regular",
                            "name": "Event Regular",
                            "description": "Attend 5 events",
                            "bonus_points": 100,
                            "requirements": [
                                {
                                    "type": "action",
                                    "action_id": "attend_event",
                                    "count": 5
                                }
                            ]
                        },
                        {
                            "id": "feedback_provider",
                            "name": "Feedback Provider",
                            "description": "Complete 3 surveys",
                            "bonus_points": 100,
                            "requirements": [
                                {
                                    "type": "action",
                                    "action_id": "complete_survey",
                                    "count": 3
                                }
                            ]
                        },
                        {
                            "id": "community_builder",
                            "name": "Community Builder",
                            "description": "Refer 3 friends",
                            "bonus_points": 200,
                            "requirements": [
                                {
                                    "type": "action",
                                    "action_id": "refer_friend",
                                    "count": 3
                                }
                            ]
                        },
                        {
                            "id": "level_2",
                            "name": "Level 2",
                            "description": "Reach level 2",
                            "bonus_points": 100,
                            "requirements": [
                                {
                                    "type": "level",
                                    "level": 2
                                }
                            ]
                        },
                        {
                            "id": "level_5",
                            "name": "Level 5",
                            "description": "Reach level 5",
                            "bonus_points": 500,
                            "requirements": [
                                {
                                    "type": "level",
                                    "level": 5
                                }
                            ]
                        },
                        {
                            "id": "level_10",
                            "name": "Level 10",
                            "description": "Reach level 10",
                            "bonus_points": 1000,
                            "requirements": [
                                {
                                    "type": "level",
                                    "level": 10
                                }
                            ]
                        }
                    ],
                    "access_levels": [
                        {
                            "id": "bronze",
                            "name": "Bronze Access",
                            "description": "Basic access for all members",
                            "min_level": 1,
                            "features": [
                                "Access to community forums",
                                "Participation in public events",
                                "Basic resources"
                            ]
                        },
                        {
                            "id": "silver",
                            "name": "Silver Access",
                            "description": "Enhanced access for active members",
                            "min_level": 3,
                            "features": [
                                "All Bronze features",
                                "Access to exclusive content",
                                "Priority registration for events",
                                "Monthly newsletter"
                            ]
                        },
                        {
                            "id": "gold",
                            "name": "Gold Access",
                            "description": "Premium access for dedicated members",
                            "min_level": 5,
                            "features": [
                                "All Silver features",
                                "Access to premium content",
                                "Exclusive events",
                                "Mentorship opportunities",
                                "Community recognition"
                            ]
                        },
                        {
                            "id": "platinum",
                            "name": "Platinum Access",
                            "description": "Elite access for top contributors",
                            "min_level": 10,
                            "features": [
                                "All Gold features",
                                "VIP events",
                                "Leadership opportunities",
                                "Special recognition",
                                "Input on community direction"
                            ]
                        }
                    ],
                    "exclusive_content": [
                        {
                            "id": "basic_resources",
                            "name": "Basic Resources",
                            "description": "Basic resources for all members",
                            "content_type": "Document",
                            "required_level": 1,
                            "access_level": "bronze",
                            "url": "https://example.com/content/basic"
                        },
                        {
                            "id": "intermediate_resources",
                            "name": "Intermediate Resources",
                            "description": "Intermediate resources for active members",
                            "content_type": "Document",
                            "required_level": 3,
                            "access_level": "silver",
                            "url": "https://example.com/content/intermediate"
                        },
                        {
                            "id": "advanced_resources",
                            "name": "Advanced Resources",
                            "description": "Advanced resources for dedicated members",
                            "content_type": "Document",
                            "required_level": 5,
                            "access_level": "gold",
                            "url": "https://example.com/content/advanced"
                        },
                        {
                            "id": "expert_resources",
                            "name": "Expert Resources",
                            "description": "Expert resources for top contributors",
                            "content_type": "Document",
                            "required_level": 10,
                            "access_level": "platinum",
                            "url": "https://example.com/content/expert"
                        }
                    ],
                    "community_challenges": [
                        {
                            "id": "attend_5_events",
                            "name": "Event Enthusiast",
                            "description": "Attend 5 community events",
                            "points": 500,
                            "requirements": [
                                {
                                    "type": "action",
                                    "action_id": "attend_event",
                                    "count": 5
                                }
                            ],
                            "status": "active"
                        },
                        {
                            "id": "refer_3_friends",
                            "name": "Community Ambassador",
                            "description": "Refer 3 friends to the community",
                            "points": 600,
                            "requirements": [
                                {
                                    "type": "action",
                                    "action_id": "refer_friend",
                                    "count": 3
                                }
                            ],
                            "status": "active"
                        },
                        {
                            "id": "complete_5_surveys",
                            "name": "Feedback Champion",
                            "description": "Complete 5 feedback surveys",
                            "points": 500,
                            "requirements": [
                                {
                                    "type": "action",
                                    "action_id": "complete_survey",
                                    "count": 5
                                }
                            ],
                            "status": "active"
                        },
                        {
                            "id": "reach_level_5",
                            "name": "Level 5 Challenge",
                            "description": "Reach level 5",
                            "points": 1000,
                            "requirements": [
                                {
                                    "type": "level",
                                    "level": 5
                                }
                            ],
                            "status": "active"
                        }
                    ]
                }
            elif file == "events.json":
                data = {"events": []}
            elif file == "notifications.json":
                data = {
                    "notifications": [],
                    "webhooks": [
                        {
                            "id": "heartbeat",
                            "name": "Heartbeat.chat",
                            "url": "https://api.heartbeat.chat/v0/webhooks/rewards",
                            "enabled": True,
                            "events": ["achievement", "level_up", "challenge_completion", "access_level_change"],
                            "headers": {
                                "Content-Type": "application/json",
                                "X-API-Key": "{{HEARTBEAT_API_KEY}}"
                            }
                        }
                    ]
                }
            
            with open(file_path, 'w') as f:
                json.dump(data, f, indent=2)
            
            logger.info(f"Created empty JSON file: {file_path}")
        else:
            logger.info(f"File already exists: {file_path}")

if __name__ == "__main__":
    init_data_directory()
