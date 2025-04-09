import requests
import json
import os
import time
from dotenv import load_dotenv
from pathlib import Path

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

# Column type constants
class ColumnType:
    ID = 'ID'
    NUMBER = 'Number'
    DECIMAL = 'Decimal'
    CURRENCY = 'Currency'
    PERCENT = 'Percent'
    TEXT = 'SingleLineText'
    LONG_TEXT = 'LongText'
    EMAIL = 'Email'
    PHONE = 'PhoneNumber'
    URL = 'URL'
    DATE = 'Date'
    TIME = 'Time'
    DATETIME = 'DateTime'
    CHECKBOX = 'Checkbox'
    SINGLE_SELECT = 'SingleSelect'
    MULTI_SELECT = 'MultiSelect'
    ATTACHMENT = 'Attachment'
    LINK = 'Links'

def create_table(table_name, table_title=None):
    """Create a new table in the project"""
    url = f"{NOCODB_API_URL}/db/meta/projects/{NOCODB_PROJECT_ID}/tables"

    print(f"Creating table {table_name} with URL: {url}")

    payload = {
        "table_name": table_name,
        "title": table_title or table_name,
        "columns": [
            # ID column is automatically created
        ]
    }

    print(f"Payload: {payload}")
    print(f"Headers: {headers}")

    try:
        response = requests.post(url, headers=headers, json=payload)
        print(f"Response status code: {response.status_code}")
        print(f"Response text: {response.text}")
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error creating table {table_name}: {str(e)}")
        if hasattr(response, 'text'):
            print(f"Response: {response.text}")
        return None

def add_column(table_id, column_name, column_type, options=None):
    """Add a column to an existing table"""
    url = f"{NOCODB_API_URL}/db/meta/tables/{table_id}/columns"

    payload = {
        "column_name": column_name,
        "title": column_name,
        "uidt": column_type,  # UI Data Type
    }

    # Add additional options if provided
    if options:
        payload.update(options)

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error adding column {column_name} to table {table_id}: {str(e)}")
        if hasattr(response, 'text'):
            print(f"Response: {response.text}")
        return None

# Create Campaign Phases table
def create_campaign_phases_table():
    print("Creating Campaign Phases table...")
    table = create_table("Campaign_Phases", "Campaign Phases")
    if not table:
        return

    table_id = table.get('id')

    # Add columns
    add_column(table_id, "PhaseID", ColumnType.NUMBER)
    add_column(table_id, "Name", ColumnType.TEXT)
    add_column(table_id, "StartDate", ColumnType.DATE)
    add_column(table_id, "EndDate", ColumnType.DATE)
    add_column(table_id, "HubPercentage", ColumnType.NUMBER)
    add_column(table_id, "WebsitePercentage", ColumnType.NUMBER)
    add_column(table_id, "SocialPercentage", ColumnType.NUMBER)
    add_column(table_id, "Description", ColumnType.LONG_TEXT)

    print(f"Campaign Phases table created with ID: {table_id}")
    return table_id

# Create Campaign Metrics table
def create_campaign_metrics_table():
    print("Creating Campaign Metrics table...")
    table = create_table("Campaign_Metrics", "Campaign Metrics")
    if not table:
        return

    table_id = table.get('id')

    # Add columns
    add_column(table_id, "MetricID", ColumnType.NUMBER)
    add_column(table_id, "Name", ColumnType.TEXT)
    add_column(table_id, "CurrentValue", ColumnType.NUMBER)
    add_column(table_id, "TargetValue", ColumnType.NUMBER)
    add_column(table_id, "LastUpdated", ColumnType.DATE)

    print(f"Campaign Metrics table created with ID: {table_id}")
    return table_id

# Create Action Items table
def create_action_items_table():
    print("Creating Action Items table...")
    table = create_table("Action_Items", "Action Items")
    if not table:
        return

    table_id = table.get('id')

    # Add columns
    add_column(table_id, "ItemID", ColumnType.NUMBER)
    add_column(table_id, "Description", ColumnType.TEXT)
    add_column(table_id, "PhaseID", ColumnType.NUMBER)

    # Add single select for Priority
    add_column(table_id, "Priority", ColumnType.SINGLE_SELECT, {
        "dtxp": '{"options":["High","Medium","Low"]}'
    })

    # Add single select for Status
    add_column(table_id, "Status", ColumnType.SINGLE_SELECT, {
        "dtxp": '{"options":["Not Started","In Progress","Completed"]}'
    })

    print(f"Action Items table created with ID: {table_id}")
    return table_id

# Create Events Calendar table
def create_events_calendar_table():
    print("Creating Events Calendar table...")
    table = create_table("Events_Calendar", "Events Calendar")
    if not table:
        return

    table_id = table.get('id')

    # Add columns
    add_column(table_id, "EventID", ColumnType.NUMBER)
    add_column(table_id, "Title", ColumnType.TEXT)
    add_column(table_id, "Date", ColumnType.DATE)
    add_column(table_id, "Platform", ColumnType.TEXT)
    add_column(table_id, "Description", ColumnType.LONG_TEXT)

    print(f"Events Calendar table created with ID: {table_id}")
    return table_id

# Create all tables
def create_all_tables():
    print("Starting table creation...")
    print(f"Using Project ID: {NOCODB_PROJECT_ID}")
    print(f"Using Workspace ID: {NOCODB_WORKSPACE_ID}")

    # Create tables
    phases_table_id = create_campaign_phases_table()
    time.sleep(1)  # Add a small delay between table creations

    metrics_table_id = create_campaign_metrics_table()
    time.sleep(1)

    action_items_table_id = create_action_items_table()
    time.sleep(1)

    events_table_id = create_events_calendar_table()

    print("\nAll tables created successfully!")
    print(f"Campaign Phases Table ID: {phases_table_id}")
    print(f"Campaign Metrics Table ID: {metrics_table_id}")
    print(f"Action Items Table ID: {action_items_table_id}")
    print(f"Events Calendar Table ID: {events_table_id}")

# Run the script
if __name__ == "__main__":
    print("Script started")
    print(f"NOCODB_API_URL: {NOCODB_API_URL}")
    print(f"NOCODB_API_TOKEN: {NOCODB_API_TOKEN[:5]}...")
    print(f"NOCODB_WORKSPACE_ID: {NOCODB_WORKSPACE_ID}")
    print(f"NOCODB_PROJECT_ID: {NOCODB_PROJECT_ID}")
    create_all_tables()
