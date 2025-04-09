import requests
import json
import os
import time
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timedelta

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent / "config" / ".env"
load_dotenv(dotenv_path=env_path)

# NocoDB API configuration
NOCODB_API_URL = os.getenv("NOCODB_API_URL", "https://cloud.nocodb.com/api/v1")
NOCODB_API_TOKEN = os.getenv("NOCODB_API_TOKEN")
NOCODB_WORKSPACE_ID = os.getenv("NOCODB_WORKSPACE_ID")
NOCODB_PROJECT_ID = os.getenv("NOCODB_PROJECT_ID")

# Common headers for all requests
headers = {
    "xc-token": NOCODB_API_TOKEN,
    "Content-Type": "application/json"
}

def add_record(table_name, data):
    """Add a record to a table"""
    url = f"{NOCODB_API_URL}/db/data/noco/{NOCODB_WORKSPACE_ID}/{NOCODB_PROJECT_ID}/{table_name}"

    print(f"Adding record to {table_name} with URL: {url}")
    print(f"Data: {data}")

    try:
        response = requests.post(url, headers=headers, json=data)
        print(f"Response status code: {response.status_code}")
        print(f"Response text: {response.text[:100]}...")  # Print just the beginning of the response
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error adding record to {table_name}: {str(e)}")
        if hasattr(response, 'text'):
            print(f"Response: {response.text[:200]}...")  # Print just the beginning of the response
        return None

# Populate Campaign Phases table
def populate_campaign_phases():
    print("Populating Campaign Phases table...")
    phases = [
        {
            "PhaseID": 1,
            "Name": "Visibility Reset: 'We're Here'",
            "StartDate": "2025-04-01",
            "EndDate": "2025-04-14",
            "HubPercentage": 20,
            "WebsitePercentage": 10,
            "SocialPercentage": 70,
            "Description": "Launch bold campaign framing The Signal as a metaphor for erasure. High-impact storytelling post/video introducing BLKOUT NEXT. Soft outreach to key allies & stakeholders with an emphasis on relationship-building. Community pulse-check (polls/surveys) to understand member needs."
        },
        {
            "PhaseID": 2,
            "Name": "Community Visioning & Cooperative Models",
            "StartDate": "2025-04-15",
            "EndDate": "2025-05-07",
            "HubPercentage": 70,
            "WebsitePercentage": 20,
            "SocialPercentage": 10,
            "Description": "Host discussions on cooperative membership structures and community ownership. Invite experts from Co-operatives UK and other cooperative leaders. Publish key takeaways & discussion prompts. Strengthen partner and ally relationships through engagement."
        },
        {
            "PhaseID": 3,
            "Name": "Interactive Resources & Knowledge Exchange",
            "StartDate": "2025-05-08",
            "EndDate": "2025-05-29",
            "HubPercentage": 70,
            "WebsitePercentage": 20,
            "SocialPercentage": 10,
            "Description": "Publish online interactive resources and knowledge-sharing tools. Host weekly drop-in discussions to deepen member engagement. Encourage early membership sign-ups through trust-driven interactions."
        },
        {
            "PhaseID": 4,
            "Name": "BLKOUT Newsroom & Community Storytelling",
            "StartDate": "2025-05-30",
            "EndDate": "2025-06-20",
            "HubPercentage": 70,
            "WebsitePercentage": 20,
            "SocialPercentage": 10,
            "Description": "Launch BLKOUT Newsroom prototype with user-generated storytelling. Integrate OOMF Story Visualization for narrative engagement. Create a resource hub for community-led media. Encourage collaborative storytelling and relationship-driven content creation."
        },
        {
            "PhaseID": 5,
            "Name": "IRL Forum Event & Future Planning",
            "StartDate": "2025-06-21",
            "EndDate": "2025-07-12",
            "HubPercentage": 70,
            "WebsitePercentage": 20,
            "SocialPercentage": 10,
            "Description": "Host an IRL Forum event, fostering deeper personal connections. Publish a summary of discussions across all topics, synthesizing key insights and actionable next steps. Conduct quick-vote engagement on future tools for Black queer media."
        },
        {
            "PhaseID": 6,
            "Name": "Cultural Sustainability & Membership Growth",
            "StartDate": "2025-07-13",
            "EndDate": "2025-09-01",
            "HubPercentage": 70,
            "WebsitePercentage": 20,
            "SocialPercentage": 10,
            "Description": "Discuss long-term impact of knowledge-sharing and community-building. Define BLKOUTHUB's role as an archive & ecosystem. Solidify membership tiers & funding model, ensuring a relational and value-based approach."
        }
    ]

    for phase in phases:
        result = add_record("Campaign_Phases", phase)
        if result:
            print(f"Added phase: {phase['Name']}")
        time.sleep(0.5)  # Small delay to avoid rate limiting

# Populate Campaign Metrics table
def populate_campaign_metrics():
    print("Populating Campaign Metrics table...")
    metrics = [
        {
            "MetricID": 1,
            "Name": "Total Engagements",
            "CurrentValue": 325,
            "TargetValue": 500,
            "LastUpdated": "2025-04-01"
        },
        {
            "MetricID": 2,
            "Name": "Membership Conversions",
            "CurrentValue": 42,
            "TargetValue": 50,
            "LastUpdated": "2025-04-01"
        },
        {
            "MetricID": 3,
            "Name": "Social Reach",
            "CurrentValue": 68500,
            "TargetValue": 100000,
            "LastUpdated": "2025-04-01"
        },
        {
            "MetricID": 4,
            "Name": "Funding Proposals",
            "CurrentValue": 2,
            "TargetValue": 5,
            "LastUpdated": "2025-04-01"
        }
    ]

    for metric in metrics:
        result = add_record("Campaign_Metrics", metric)
        if result:
            print(f"Added metric: {metric['Name']}")
        time.sleep(0.5)  # Small delay to avoid rate limiting

# Populate Action Items table
def populate_action_items():
    print("Populating Action Items table...")
    action_items = [
        # Phase 1 action items
        {
            "ItemID": 1,
            "Description": "Create high-impact storytelling post introducing BLKOUT NEXT",
            "PhaseID": 1,
            "Priority": "High",
            "Status": "Not Started"
        },
        {
            "ItemID": 2,
            "Description": "Launch 'The Signal' campaign across social media platforms",
            "PhaseID": 1,
            "Priority": "High",
            "Status": "Not Started"
        },
        {
            "ItemID": 3,
            "Description": "Conduct community pulse-check surveys",
            "PhaseID": 1,
            "Priority": "Medium",
            "Status": "Not Started"
        },
        {
            "ItemID": 4,
            "Description": "Begin soft outreach to key allies and stakeholders",
            "PhaseID": 1,
            "Priority": "Medium",
            "Status": "Not Started"
        },

        # Phase 2 action items
        {
            "ItemID": 5,
            "Description": "Schedule discussions on cooperative membership structures",
            "PhaseID": 2,
            "Priority": "High",
            "Status": "Not Started"
        },
        {
            "ItemID": 6,
            "Description": "Invite experts from Co-operatives UK",
            "PhaseID": 2,
            "Priority": "Medium",
            "Status": "Not Started"
        },
        {
            "ItemID": 7,
            "Description": "Publish key takeaways from initial discussions",
            "PhaseID": 2,
            "Priority": "Medium",
            "Status": "Not Started"
        },
        {
            "ItemID": 8,
            "Description": "Strengthen partner relationships through engagement",
            "PhaseID": 2,
            "Priority": "Low",
            "Status": "Not Started"
        },

        # Phase 3 action items
        {
            "ItemID": 9,
            "Description": "Publish interactive resources on BLKOUTHUB",
            "PhaseID": 3,
            "Priority": "High",
            "Status": "Not Started"
        },
        {
            "ItemID": 10,
            "Description": "Schedule weekly drop-in discussions",
            "PhaseID": 3,
            "Priority": "Medium",
            "Status": "Not Started"
        },
        {
            "ItemID": 11,
            "Description": "Encourage early membership sign-ups",
            "PhaseID": 3,
            "Priority": "High",
            "Status": "Not Started"
        },
        {
            "ItemID": 12,
            "Description": "Create knowledge-sharing tools",
            "PhaseID": 3,
            "Priority": "Medium",
            "Status": "Not Started"
        }
    ]

    for item in action_items:
        result = add_record("Action_Items", item)
        if result:
            print(f"Added action item: {item['Description']}")
        time.sleep(0.5)  # Small delay to avoid rate limiting

# Populate Events Calendar table
def populate_events_calendar():
    print("Populating Events Calendar table...")

    # Calculate dates relative to today
    today = datetime.now()

    events = [
        {
            "EventID": 1,
            "Title": "Weekly Community Check-in",
            "Date": (today + timedelta(days=2)).strftime("%Y-%m-%d"),
            "Platform": "Heartbeat.chat",
            "Description": "Regular community engagement session"
        },
        {
            "EventID": 2,
            "Title": "Email Campaign: Phase Introduction",
            "Date": (today + timedelta(days=5)).strftime("%Y-%m-%d"),
            "Platform": "Sendfox",
            "Description": "Introduction to the current campaign phase"
        },
        {
            "EventID": 3,
            "Title": "Social Media Content Planning",
            "Date": (today + timedelta(days=7)).strftime("%Y-%m-%d"),
            "Platform": "Internal",
            "Description": "Plan next week's social media content"
        },
        {
            "EventID": 4,
            "Title": "Partner Organization Meeting",
            "Date": (today + timedelta(days=10)).strftime("%Y-%m-%d"),
            "Platform": "Zoom",
            "Description": "Coordination meeting with key partners"
        }
    ]

    for event in events:
        result = add_record("Events_Calendar", event)
        if result:
            print(f"Added event: {event['Title']}")
        time.sleep(0.5)  # Small delay to avoid rate limiting

# Populate all tables
def populate_database():
    print("Starting database population...")
    print(f"Using Project ID: {NOCODB_PROJECT_ID}")
    print(f"Using Workspace ID: {NOCODB_WORKSPACE_ID}")

    # Populate tables
    populate_campaign_phases()
    time.sleep(1)

    populate_campaign_metrics()
    time.sleep(1)

    populate_action_items()
    time.sleep(1)

    populate_events_calendar()

    print("\nDatabase population completed successfully!")

# Run the script
if __name__ == "__main__":
    print("Script started")
    print(f"NOCODB_API_URL: {NOCODB_API_URL}")
    print(f"NOCODB_API_TOKEN: {NOCODB_API_TOKEN[:5]}...")
    print(f"NOCODB_WORKSPACE_ID: {NOCODB_WORKSPACE_ID}")
    print(f"NOCODB_PROJECT_ID: {NOCODB_PROJECT_ID}")
    populate_database()
