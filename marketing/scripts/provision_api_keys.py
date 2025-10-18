#!/usr/bin/env python3
"""
API Key provisioner for fintech outreach campaign responses.
This script:
1. Allows marking companies as "responded"
2. Generates and provisions CaaS API keys
3. Updates tracking with provisioning details
"""

import csv
import sys
import os
import json
import random
import string
import logging
from datetime import datetime
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(os.path.join(os.path.dirname(__file__), 'provision.log'))
    ]
)
logger = logging.getLogger("api_provisioner")

# Path definitions
BASE_DIR = Path(__file__).resolve().parent.parent
TRACKING_FILE = BASE_DIR / "output" / "outreach_tracking.csv"
PROVISIONED_KEYS_FILE = BASE_DIR / "output" / "provisioned_api_keys.json"

# Create output directories if they don't exist
(BASE_DIR / "output").mkdir(parents=True, exist_ok=True)

# Import the CaaS API key generator service
try:
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
    from caas.api_key_service import generateApiKey
    logger.info("Successfully imported CaaS API key service")
except ImportError as e:
    logger.warning(f"Could not import CaaS API key service: {e}")
    logger.warning("Falling back to local key generation")
    
    # Fallback implementation if the module isn't available
    def generateApiKey(customerId):
        """Fallback implementation for API key generation"""
        logger.info(f"Generating key for {customerId} using fallback method")
        prefix = 'azora_test_'
        random_part = ''.join(random.choices(string.ascii_letters + string.digits, k=24))
        return f"{prefix}{random_part}"

def ensure_tracking_file_exists():
    """Ensure the tracking file exists with proper headers"""
    if not TRACKING_FILE.exists():
        logger.info(f"Creating tracking file at {TRACKING_FILE}")
        with open(TRACKING_FILE, 'w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow([
                'company_name', 'contact_name', 'email', 'date_generated', 
                'date_sent', 'responded', 'date_responded', 'api_key_provisioned', 'api_key_date'
            ])
        return False
    return True

def load_tracking_data():
    """Load the current tracking data"""
    ensure_tracking_file_exists()
        
    companies = []
    with open(TRACKING_FILE, 'r', newline='') as file:
        reader = csv.DictReader(file)
        for row in reader:
            companies.append(row)
    return companies

def save_tracking_data(companies):
    """Save updated tracking data"""
    if not companies:
        logger.error("Cannot save empty tracking data")
        return False
        
    fieldnames = companies[0].keys()
    with open(TRACKING_FILE, 'w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(companies)
    return True

def save_api_keys(keys):
    """Save provisioned API keys"""
    with open(PROVISIONED_KEYS_FILE, 'w') as file:
        json.dump(keys, file, indent=2)

def mark_as_responded(company_name):
    """Mark a company as having responded positively"""
    companies = load_tracking_data()
    found = False
    
    for company in companies:
        if company['company_name'].lower() == company_name.lower():
            company['responded'] = 'Yes'
            company['date_responded'] = datetime.now().strftime('%Y-%m-%d')
            found = True
            logger.info(f"✓ Marked {company['company_name']} as responded")
            break
    
    if not found:
        logger.error(f"Company '{company_name}' not found in tracking data")
        return False
        
    save_tracking_data(companies)
    return True

def provision_api_key(company_name):
    """Generate and provision an API key for a company"""
    companies = load_tracking_data()
    found = False
    api_key = None
    
    for company in companies:
        if company['company_name'].lower() == company_name.lower():
            # Check if already responded
            if company.get('responded', 'No') != 'Yes':
                company['responded'] = 'Yes'
                company['date_responded'] = datetime.now().strftime('%Y-%m-%d')
            
            # Generate API key
            customer_id = f"fintech_{company['company_name'].lower().replace(' ', '_')}"
            try:
                api_key = generateApiKey(customer_id)
                logger.info(f"Generated API key for {company_name}")
            except Exception as e:
                logger.error(f"Failed to generate API key: {e}")
                return None
            
            company['api_key_provisioned'] = 'Yes'
            company['api_key_date'] = datetime.now().strftime('%Y-%m-%d')
            found = True
            break
    
    if not found:
        logger.error(f"Company '{company_name}' not found in tracking data")
        return None
        
    save_tracking_data(companies)
    
    # Save the API key to a separate file
    api_keys = {}
    if PROVISIONED_KEYS_FILE.exists():
        try:
            with open(PROVISIONED_KEYS_FILE, 'r') as file:
                api_keys = json.load(file)
        except json.JSONDecodeError:
            logger.warning("API keys file was corrupted. Creating new file.")
            api_keys = {}
    
    api_keys[company_name] = {
        "api_key": api_key,
        "provisioned_date": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "free_credits": 5000
    }
    save_api_keys(api_keys)
    
    return api_key

def generate_onboarding_email(company_name, api_key):
    """Generate an onboarding email with the API key"""
    companies = load_tracking_data()
    company = next((c for c in companies if c['company_name'].lower() == company_name.lower()), None)
    
    if not company:
        logger.error(f"Company '{company_name}' not found")
        return None
        
    email_content = f"""
Subject: Your Azora CaaS API Key - 5,000 Free Calls Ready for Integration

Hi {company['contact_name'].split()[0]},

Great to hear from you! As promised, here's your API key for Azora's Compliance-as-a-Service:

API Key: {api_key}

This key includes 5,000 free API calls to help you evaluate our service. Here's how to get started:

1. Documentation: https://docs.azora.world/caas-api
2. Integration Guide: https://docs.azora.world/caas-quickstart
3. Postman Collection: https://docs.azora.world/caas-postman

We've also created a dedicated Slack channel for your integration team. Please use this invite link: https://azora-partners.slack.com/join/invited

If you have any questions during integration, reach out directly to our CTO at dev@azora.world.

Looking forward to our partnership,

Sizwe Ngwenya
Founder, Azora OS
"""
    return email_content

def list_companies():
    """List all companies in the tracking file"""
    companies = load_tracking_data()
    
    if not companies:
        print("\nNo companies found in tracking data. Please run the email generation script first.\n")
        return
    
    print("\n== Fintech Outreach Campaign Status ==\n")
    print(f"{'Company':<25} {'Contact':<15} {'Responded':<10} {'API Key':<10}")
    print("-" * 60)
    
    for company in companies:
        print(f"{company['company_name'][:25]:<25} {company['contact_name'].split()[0]:<15} "
              f"{company['responded']:<10} {company['api_key_provisioned']:<10}")
    
    # Summary stats
    if companies:
        responded = sum(1 for c in companies if c['responded'] == 'Yes')
        provisioned = sum(1 for c in companies if c['api_key_provisioned'] == 'Yes')
        
        print("\nSummary:")
        print(f"- Total companies: {len(companies)}")
        print(f"- Responded: {responded} ({responded/len(companies)*100:.1f}%)")
        print(f"- API keys provisioned: {provisioned} ({provisioned/len(companies)*100:.1f}%)")

def print_usage():
    print("Usage:")
    print("  ./provision_api_keys.py list                          # List all companies and status")
    print("  ./provision_api_keys.py respond \"Company Name\"        # Mark company as responded")
    print("  ./provision_api_keys.py provision \"Company Name\"      # Generate API key and mark responded")
    print("  ./provision_api_keys.py email \"Company Name\"          # Generate onboarding email with API key")
    print("  ./provision_api_keys.py check                         # Run system checks")

def system_check():
    """Run system checks to verify everything is working properly"""
    print("\n== System Check ==\n")
    
    # Check 1: Can we import the API key service?
    try:
        from caas.api_key_service import generateApiKey, verifyApiKey
        print("✅ CaaS API Key Service: Available")
    except ImportError:
        print("❌ CaaS API Key Service: Import failed (using fallback implementation)")
    
    # Check 2: Does the tracking file exist and is it readable?
    if TRACKING_FILE.exists():
        try:
            with open(TRACKING_FILE, 'r') as f:
                reader = csv.reader(f)
                headers = next(reader)
                print(f"✅ Tracking File: Available ({len(headers)} columns)")
        except Exception as e:
            print(f"❌ Tracking File: Error reading file - {e}")
    else:
        print("❌ Tracking File: Not found")
    
    # Check 3: Can we write to the output directory?
    test_file = BASE_DIR / "output" / "test_write.tmp"
    try:
        with open(test_file, 'w') as f:
            f.write("test")
        test_file.unlink()  # Delete the test file
        print("✅ Output Directory: Writable")
    except Exception as e:
        print(f"❌ Output Directory: Write test failed - {e}")
    
    # Check 4: Test API key generation
    try:
        test_key = generateApiKey("test_customer")
        print(f"✅ API Key Generation: Successful (sample: {test_key[:10]}...)")
    except Exception as e:
        print(f"❌ API Key Generation: Failed - {e}")
    
    print("\nSystem check complete. Fix any issues marked with ❌ before proceeding.")

def main():
    if len(sys.argv) < 2:
        print_usage()
        return
        
    command = sys.argv[1].lower()
    
    if command == "list":
        list_companies()
    elif command == "respond" and len(sys.argv) == 3:
        mark_as_responded(sys.argv[2])
    elif command == "provision" and len(sys.argv) == 3:
        company_name = sys.argv[2]
        api_key = provision_api_key(company_name)
        if api_key:
            print(f"✓ API key generated for {company_name}")
            print(f"API Key: {api_key}")
    elif command == "email" and len(sys.argv) == 3:
        company_name = sys.argv[2]
        
        # Check if already provisioned
        api_keys = {}
        if PROVISIONED_KEYS_FILE.exists():
            with open(PROVISIONED_KEYS_FILE, 'r') as file:
                try:
                    api_keys = json.load(file)
                except json.JSONDecodeError:
                    api_keys = {}
        
        if company_name in api_keys:
            api_key = api_keys[company_name]["api_key"]
        else:
            api_key = provision_api_key(company_name)
            
        if api_key:
            email_content = generate_onboarding_email(company_name, api_key)
            if email_content:
                print("\n" + "=" * 80)
                print(email_content)
                print("=" * 80 + "\n")
    elif command == "check":
        system_check()
    else:
        print_usage()

if __name__ == "__main__":
    print("🔑 Azora Fintech API Key Provisioning Tool")
    print("-----------------------------------------")
    main()
