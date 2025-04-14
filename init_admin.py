import os
import json
import logging
import hashlib
import secrets
import getpass

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('init_admin')

def hash_password(password, salt=None):
    """Hash a password with a salt."""
    if salt is None:
        salt = secrets.token_hex(16)
    
    # Hash the password with the salt
    hash_obj = hashlib.sha256((password + salt).encode())
    password_hash = hash_obj.hexdigest()
    
    return password_hash, salt

def init_admin_user():
    """Initialize the admin user for the dashboard."""
    # Create the data directory if it doesn't exist
    data_dir = "data"
    os.makedirs(data_dir, exist_ok=True)
    
    # Create the admin file path
    admin_file = os.path.join(data_dir, "admin_users.json")
    
    # Check if the admin file exists
    if os.path.exists(admin_file):
        # Load the existing admin users
        with open(admin_file, 'r') as f:
            admin_users = json.load(f)
        
        logger.info(f"Loaded existing admin users: {len(admin_users['users'])} users")
    else:
        # Create a new admin users file
        admin_users = {"users": []}
        logger.info("Creating new admin users file")
    
    # Check if we want to add a new admin user
    add_admin = input("Do you want to add a new admin user? (y/n): ").lower() == 'y'
    
    if add_admin:
        # Get the admin user details
        username = input("Enter admin username: ")
        password = getpass.getpass("Enter admin password: ")
        name = input("Enter admin name: ")
        role = input("Enter admin role (admin/manager): ")
        
        # Check if the username already exists
        for user in admin_users["users"]:
            if user["username"] == username:
                logger.warning(f"Username '{username}' already exists")
                update = input("Do you want to update this user? (y/n): ").lower() == 'y'
                
                if update:
                    # Hash the password
                    password_hash, salt = hash_password(password)
                    
                    # Update the user
                    user["password_hash"] = password_hash
                    user["salt"] = salt
                    user["name"] = name
                    user["role"] = role
                    
                    logger.info(f"Updated user '{username}'")
                    break
                else:
                    logger.info("User not updated")
                    return
        else:
            # Hash the password
            password_hash, salt = hash_password(password)
            
            # Add the new admin user
            admin_users["users"].append({
                "username": username,
                "password_hash": password_hash,
                "salt": salt,
                "name": name,
                "role": role
            })
            
            logger.info(f"Added new user '{username}'")
        
        # Save the admin users
        with open(admin_file, 'w') as f:
            json.dump(admin_users, f, indent=2)
        
        logger.info(f"Saved admin users to {admin_file}")
    else:
        logger.info("No admin user added")

if __name__ == "__main__":
    init_admin_user()
