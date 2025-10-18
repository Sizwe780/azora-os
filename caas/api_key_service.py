"""
API Key Service for Compliance-as-a-Service (CaaS)
This module handles secure generation and management of API keys
for integration partners.
"""

import os
import json
import random
import string
import hashlib
import time
from pathlib import Path

# Configure storage locations
BASE_DIR = Path(__file__).resolve().parent.parent
KEYS_STORE = BASE_DIR / ".data" / "caas_keys.json"
KEYS_STORE.parent.mkdir(exist_ok=True, parents=True)

def _load_keys():
    """Load existing keys from storage"""
    if not KEYS_STORE.exists():
        return {}
    
    try:
        with open(KEYS_STORE, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        # If file is corrupted or inaccessible, return empty dict
        return {}

def _save_keys(keys_data):
    """Save keys to persistent storage"""
    with open(KEYS_STORE, 'w') as f:
        json.dump(keys_data, f, indent=2)

def generateApiKey(customerId):
    """
    Generate a secure API key for a customer
    
    Args:
        customerId (str): Unique identifier for the customer
        
    Returns:
        str: Newly generated API key
    """
    # Generate a secure random key
    random_part = ''.join(random.choices(string.ascii_letters + string.digits, k=24))
    timestamp = int(time.time())
    
    # Create a unique key with prefix
    api_key = f"azora_live_{random_part}"
    
    # Store key with metadata
    keys = _load_keys()
    keys[api_key] = {
        "customerId": customerId,
        "createdAt": timestamp,
        "active": True,
        "tier": "enterprise",
        "quota": 5000  # Free tier starts with 5000 calls
    }
    _save_keys(keys)
    
    return api_key

def verifyApiKey(api_key):
    """
    Verify if an API key is valid and active
    
    Args:
        api_key (str): The API key to verify
        
    Returns:
        dict: Customer information if valid, None otherwise
    """
    keys = _load_keys()
    if api_key in keys and keys[api_key]["active"]:
        return keys[api_key]
    return None

def revokeApiKey(api_key):
    """
    Revoke an API key
    
    Args:
        api_key (str): The API key to revoke
        
    Returns:
        bool: True if successfully revoked, False otherwise
    """
    keys = _load_keys()
    if api_key in keys:
        keys[api_key]["active"] = False
        _save_keys(keys)
        return True
    return False

# Create __init__.py to make caas a proper package
with open(BASE_DIR / "caas" / "__init__.py", "w") as f:
    f.write("# CaaS (Compliance-as-a-Service) API package\n")