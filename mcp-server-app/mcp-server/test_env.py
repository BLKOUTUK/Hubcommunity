import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent / "config" / ".env"
print(f"Looking for .env file at: {env_path}")
print(f"File exists: {env_path.exists()}")

load_dotenv(dotenv_path=env_path)

# Print environment variables
print("Environment variables:")
print(f"NOCODB_API_URL: {os.getenv('NOCODB_API_URL')}")
print(f"NOCODB_API_TOKEN: {os.getenv('NOCODB_API_TOKEN')[:5]}..." if os.getenv('NOCODB_API_TOKEN') else "NOCODB_API_TOKEN: None")
print(f"NOCODB_WORKSPACE_ID: {os.getenv('NOCODB_WORKSPACE_ID')}")
print(f"NOCODB_PROJECT_ID: {os.getenv('NOCODB_PROJECT_ID')}")
