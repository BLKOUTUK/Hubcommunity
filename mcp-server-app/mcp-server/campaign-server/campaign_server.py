from mcp.server.fastmcp import FastMCP
import os
import json
import requests
from datetime import datetime, timedelta
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).resolve().parents[1] / "config" / ".env"
load_dotenv(dotenv_path=env_path)

# Initialize FastMCP server
mcp = FastMCP("blkout-campaign")

# NocoDB API configuration
NOCODB_API_URL = os.getenv("NOCODB_API_URL", "https://cloud.nocodb.com/api/v1")
NOCODB_API_TOKEN = os.getenv("NOCODB_API_TOKEN", "your_nocodb_api_token_here")
NOCODB_WORKSPACE_ID = os.getenv("NOCODB_WORKSPACE_ID", "your_workspace_id_here")
NOCODB_PROJECT_ID = os.getenv("NOCODB_PROJECT_ID", "your_project_id_here")
# Get table-specific URLs from environment variables
NOCODB_API_URL_COMMUNITYMEMBERS = os.getenv("NOCODB_API_URL_COMMUNITYMEMBERS")
NOCODB_API_URL_USERACTIVITIES = os.getenv("NOCODB_API_URL_USERACTIVITIES")
NOCODB_API_URL_USERREWARDS = os.getenv("NOCODB_API_URL_USERREWARDS")

# Table names in NocoDB
NOCODB_PHASES_TABLE = "Campaign_Phases"
NOCODB_METRICS_TABLE = "Campaign_Metrics"
NOCODB_ACTIONS_TABLE = "Action_Items"
NOCODB_CALENDAR_TABLE = "Events_Calendar"

# Fallback campaign phases configuration (used if Airtable is not configured)
FALLBACK_PHASES = [
    {
        "id": 1,
        "name": "Visibility Reset: 'We're Here'",
        "start_date": "2025-04-01",
        "end_date": "2025-04-14",
        "platforms": {"BLKOUTHUB": 0.2, "BLKOUTUK.com": 0.1, "Social": 0.7}
    },
    {
        "id": 2,
        "name": "Community Visioning & Cooperative Models",
        "start_date": "2025-04-15",
        "end_date": "2025-05-07",
        "platforms": {"BLKOUTHUB": 0.7, "BLKOUTUK.com": 0.2, "Social": 0.1}
    },
    {
        "id": 3,
        "name": "Interactive Resources & Knowledge Exchange",
        "start_date": "2025-05-08",
        "end_date": "2025-05-29",
        "platforms": {"BLKOUTHUB": 0.7, "BLKOUTUK.com": 0.2, "Social": 0.1}
    },
    {
        "id": 4,
        "name": "BLKOUT Newsroom & Community Storytelling",
        "start_date": "2025-05-30",
        "end_date": "2025-06-20",
        "platforms": {"BLKOUTHUB": 0.7, "BLKOUTUK.com": 0.2, "Social": 0.1}
    },
    {
        "id": 5,
        "name": "IRL Forum Event & Future Planning",
        "start_date": "2025-06-21",
        "end_date": "2025-07-12",
        "platforms": {"BLKOUTHUB": 0.7, "BLKOUTUK.com": 0.2, "Social": 0.1}
    },
    {
        "id": 6,
        "name": "Cultural Sustainability & Membership Growth",
        "start_date": "2025-07-13",
        "end_date": "2025-09-01",
        "platforms": {"BLKOUTHUB": 0.7, "BLKOUTUK.com": 0.2, "Social": 0.1}
    }
]

def get_nocodb_records(table_name):
    """Get records from a NocoDB table"""
    if NOCODB_API_TOKEN == "your_nocodb_api_token_here" or NOCODB_PROJECT_ID == "your_project_id_here":
        print(f"Warning: NocoDB API token or Project ID not configured. Using fallback data.")
        return []

    # NocoDB API uses 'xc-token' for authentication
    headers = {
        "xc-token": NOCODB_API_TOKEN,
        "Content-Type": "application/json"
    }

    # Use table-specific URL if available, otherwise construct it
    if table_name == "CommunityMembers" and NOCODB_API_URL_COMMUNITYMEMBERS:
        url = NOCODB_API_URL_COMMUNITYMEMBERS
    elif table_name == "UserActivities" and NOCODB_API_URL_USERACTIVITIES:
        url = NOCODB_API_URL_USERACTIVITIES
    elif table_name == "UserRewards" and NOCODB_API_URL_USERREWARDS:
        url = NOCODB_API_URL_USERREWARDS
    else:
        # Use v2 API format
        url = f"{NOCODB_API_URL}/tables/{table_name}/records"

        # Format 3: v2/project_id/table_name
        # url = f"{NOCODB_API_URL}/db/data/v2/{NOCODB_PROJECT_ID}/{table_name}"

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()

        # NocoDB v2 API returns data in a different format
        # Convert to Airtable-like format for compatibility
        data = response.json()

        # v2 API returns a structure with 'list' property
        if isinstance(data, list):
            records = data
        elif isinstance(data, dict) and "list" in data:
            records = data.get("list", [])
        else:
            # For v2 API, the records might be in the 'list' property
            records = data.get("list", [])

        # Convert to Airtable-like format
        return [{
            "id": record.get("Id") or record.get("id"),
            "fields": record
        } for record in records]
    except Exception as e:
        print(f"Error fetching NocoDB data: {str(e)}")
        if 'response' in locals() and hasattr(response, 'text'):
            print(f"Response: {response.text[:200]}...")
        return []

@mcp.tool()
async def get_current_phase() -> str:
    """Get information about the current campaign phase.

    Returns:
        Details about the current phase of the BLKOUT NEXT campaign
    """
    # Get phases from NocoDB
    phases = get_nocodb_records(NOCODB_PHASES_TABLE)

    # If no phases found in NocoDB, use fallback data
    if not phases:
        phases = [{
            "fields": {
                "PhaseID": phase["id"],
                "Name": phase["name"],
                "StartDate": phase["start_date"],
                "EndDate": phase["end_date"],
                "HubPercentage": phase["platforms"]["BLKOUTHUB"] * 100,
                "WebsitePercentage": phase["platforms"]["BLKOUTUK.com"] * 100,
                "SocialPercentage": phase["platforms"]["Social"] * 100
            }
        } for phase in FALLBACK_PHASES]

    today = datetime.now()

    # Check for current phase
    for phase in phases:
        fields = phase.get("fields", {})

        # Handle different field naming conventions
        phase_id = fields.get("PhaseID", fields.get("Phase ID", 0))
        name = fields.get("Name", "Unknown Phase")
        start_date = fields.get("StartDate", fields.get("Start Date", "2099-01-01"))
        end_date = fields.get("EndDate", fields.get("End Date", "2099-01-01"))

        # Convert percentages to decimal
        hub_percentage = fields.get("HubPercentage", fields.get("Hub Percentage", 0)) / 100
        website_percentage = fields.get("WebsitePercentage", fields.get("Website Percentage", 0)) / 100
        social_percentage = fields.get("SocialPercentage", fields.get("Social Percentage", 0)) / 100

        try:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            end = datetime.strptime(end_date, "%Y-%m-%d")

            if start <= today <= end:
                days_remaining = (end - today).days
                return json.dumps({
                    "phase_id": phase_id,
                    "name": name,
                    "days_remaining": days_remaining,
                    "platforms": {
                        "BLKOUTHUB": hub_percentage,
                        "BLKOUTUK.com": website_percentage,
                        "Social": social_percentage
                    }
                })
        except ValueError as e:
            print(f"Error parsing dates: {e}")
            continue

    # If no current phase, find the next upcoming phase
    upcoming_phases = []
    for phase in phases:
        fields = phase.get("fields", {})

        # Handle different field naming conventions
        phase_id = fields.get("PhaseID", fields.get("Phase ID", 0))
        name = fields.get("Name", "Unknown Phase")
        start_date = fields.get("StartDate", fields.get("Start Date", "2099-01-01"))

        # Convert percentages to decimal
        hub_percentage = fields.get("HubPercentage", fields.get("Hub Percentage", 0)) / 100
        website_percentage = fields.get("WebsitePercentage", fields.get("Website Percentage", 0)) / 100
        social_percentage = fields.get("SocialPercentage", fields.get("Social Percentage", 0)) / 100

        try:
            start = datetime.strptime(start_date, "%Y-%m-%d")

            if today < start:
                upcoming_phases.append({
                    "phase_id": phase_id,
                    "name": name,
                    "start": start,
                    "days_until": (start - today).days,
                    "platforms": {
                        "BLKOUTHUB": hub_percentage,
                        "BLKOUTUK.com": website_percentage,
                        "Social": social_percentage
                    }
                })
        except ValueError as e:
            print(f"Error parsing dates: {e}")
            continue

    if upcoming_phases:
        # Sort by start date and get the closest upcoming phase
        upcoming_phases.sort(key=lambda x: x["start"])
        next_phase = upcoming_phases[0]

        return json.dumps({
            "phase_id": next_phase["phase_id"],
            "name": next_phase["name"],
            "status": "upcoming",
            "days_until_start": next_phase["days_until"],
            "platforms": next_phase["platforms"]
        })

    return "Campaign has concluded"

@mcp.tool()
async def campaign_metrics() -> str:
    """Get current campaign metrics.

    Returns:
        Summary of engagement metrics across all platforms
    """
    # Get metrics from NocoDB
    metrics = get_nocodb_records(NOCODB_METRICS_TABLE)

    # If no metrics found in NocoDB, use fallback data
    if not metrics:
        return json.dumps({
            "total_engagements": 325,
            "membership_conversions": 42,
            "social_reach": 68500,
            "funding_proposals": 2,
            "target_progress": {
                "engagements": "65%",  # 325/500
                "membership": "84%",   # 42/50 (assuming 5% of 1000)
                "social_reach": "68.5%", # 68500/100000
                "funding_proposals": "40%" # 2/5
            }
        })

    # Process metrics from Airtable
    result = {}
    target_progress = {}

    for metric in metrics:
        fields = metric.get("fields", {})

        # Handle different field naming conventions
        metric_name = fields.get("Name", "Unknown Metric")
        current_value = fields.get("CurrentValue", fields.get("Current Value", 0))
        target_value = fields.get("TargetValue", fields.get("Target Value", 100))

        # Convert to snake_case for JSON keys
        key = metric_name.lower().replace(" ", "_")
        result[key] = current_value

        # Calculate progress percentage
        if target_value > 0:
            progress = (current_value / target_value) * 100
            target_progress[key] = f"{progress:.1f}%"
        else:
            target_progress[key] = "0%"

    # Add target progress to result
    result["target_progress"] = target_progress

    return json.dumps(result)

@mcp.tool()
async def campaign_action_items() -> str:
    """Get prioritized action items for the current campaign phase.

    Returns:
        List of recommended actions based on current phase and metrics
    """
    # Get current phase information
    phase_info = json.loads(await get_current_phase())
    phase_id = phase_info.get("phase_id", 0)

    # Get action items from NocoDB
    all_actions = get_nocodb_records(NOCODB_ACTIONS_TABLE)

    # If no action items found in NocoDB, use fallback data
    if not all_actions:
        # Define fallback action items for each phase
        fallback_items = {
            1: [
                "Create high-impact storytelling post introducing BLKOUT NEXT",
                "Launch 'The Signal' campaign across social media platforms",
                "Conduct community pulse-check surveys",
                "Begin soft outreach to key allies and stakeholders"
            ],
            2: [
                "Schedule discussions on cooperative membership structures",
                "Invite experts from Co-operatives UK",
                "Publish key takeaways from initial discussions",
                "Strengthen partner relationships through engagement"
            ],
            3: [
                "Publish interactive resources on BLKOUTHUB",
                "Schedule weekly drop-in discussions",
                "Encourage early membership sign-ups",
                "Create knowledge-sharing tools"
            ],
            4: [
                "Launch BLKOUT Newsroom prototype",
                "Integrate OOMF Story Visualization",
                "Create resource hub for community-led media",
                "Encourage collaborative storytelling"
            ],
            5: [
                "Finalize IRL Forum event details",
                "Publish summary of discussions across all topics",
                "Conduct quick-vote engagement on future tools",
                "Ensure integration with governance efforts"
            ],
            6: [
                "Discuss long-term impact of knowledge-sharing",
                "Define BLKOUTHUB's role as archive & ecosystem",
                "Solidify membership tiers & funding model",
                "Reinforce alignment with governance strategies"
            ]
        }

        return json.dumps(fallback_items.get(phase_id, ["Campaign phase not recognized"]))

    # Filter action items for the current phase
    phase_actions = []
    for action in all_actions:
        fields = action.get("fields", {})

        # Handle different field naming conventions
        action_phase_id = fields.get("PhaseID", fields.get("Phase ID", 0))
        description = fields.get("Description", "Unknown action item")
        priority = fields.get("Priority", "Medium")
        status = fields.get("Status", "Not Started")

        # Check if this action belongs to the current phase
        if action_phase_id == phase_id:
            phase_actions.append({
                "description": description,
                "priority": priority,
                "status": status
            })

    # If no actions found for this phase, return a message
    if not phase_actions:
        return json.dumps([f"No action items found for Phase {phase_id}"])

    # Sort by priority (High, Medium, Low)
    priority_order = {"High": 0, "Medium": 1, "Low": 2}
    phase_actions.sort(key=lambda x: priority_order.get(x["priority"], 99))

    # Return descriptions only for simplicity
    return json.dumps([action["description"] for action in phase_actions])

@mcp.tool()
async def campaign_calendar(days: int = 14) -> str:
    """Get upcoming campaign events and deadlines.

    Args:
        days: Number of days to look ahead (default: 14)

    Returns:
        List of upcoming events and deadlines
    """
    # Get events from NocoDB
    all_events = get_nocodb_records(NOCODB_CALENDAR_TABLE)
    today = datetime.now()

    # If no events found in NocoDB, use fallback data
    if not all_events:
        # Sample events
        fallback_events = [
            {
                "title": "Weekly Community Check-in",
                "date": (today + timedelta(days=2)).strftime("%Y-%m-%d"),
                "platform": "Heartbeat.chat",
                "description": "Regular community engagement session"
            },
            {
                "title": "Email Campaign: Phase Introduction",
                "date": (today + timedelta(days=5)).strftime("%Y-%m-%d"),
                "platform": "Sendfox",
                "description": "Introduction to the current campaign phase"
            },
            {
                "title": "Social Media Content Planning",
                "date": (today + timedelta(days=7)).strftime("%Y-%m-%d"),
                "platform": "Internal",
                "description": "Plan next week's social media content"
            },
            {
                "title": "Partner Organization Meeting",
                "date": (today + timedelta(days=10)).strftime("%Y-%m-%d"),
                "platform": "Zoom",
                "description": "Coordination meeting with key partners"
            }
        ]

        # Filter events within the specified timeframe
        filtered_events = [
            event for event in fallback_events
            if (datetime.strptime(event["date"], "%Y-%m-%d") - today).days <= days
        ]

        return json.dumps(filtered_events)

    # Process events from Airtable
    events = []
    for event in all_events:
        fields = event.get("fields", {})

        # Handle different field naming conventions
        title = fields.get("Title", "Unknown Event")
        event_date = fields.get("Date", fields.get("EventDate", None))
        platform = fields.get("Platform", "")
        description = fields.get("Description", "")

        # Skip events without dates
        if not event_date:
            continue

        try:
            # Parse the date (Airtable might return dates in different formats)
            if "T" in event_date:  # ISO format with time
                event_datetime = datetime.fromisoformat(event_date.replace("Z", "+00:00"))
                event_date_str = event_datetime.strftime("%Y-%m-%d")
            else:  # Just date
                event_date_str = event_date
                event_datetime = datetime.strptime(event_date, "%Y-%m-%d")

            # Check if the event is within the specified timeframe
            days_until = (event_datetime.date() - today.date()).days
            if 0 <= days_until <= days:  # Include today's events and future events within range
                events.append({
                    "title": title,
                    "date": event_date_str,
                    "platform": platform,
                    "description": description
                })
        except (ValueError, TypeError) as e:
            print(f"Error parsing event date: {e}")
            continue

    # Sort events by date
    events.sort(key=lambda x: x["date"])

    return json.dumps(events)

if __name__ == "__main__":
    # Initialize and run the server
    mcp.run(transport='stdio')
