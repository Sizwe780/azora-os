#!/usr/bin/env python3
"""
Generate personalized outreach emails for top fintech companies based on our template.
Follows Azora Constitutional principles:
- Value Creation (Art.1): Facilitates high-value B2B partnerships
- Truth (Art.3): Uses real data, no mocks
- Growth (Art.4): Directly contributes to platform expansion
"""

import csv
import os
import sys
import time
from datetime import datetime
from pathlib import Path

# Path definitions
BASE_DIR = Path(__file__).resolve().parent.parent
TEMPLATE_PATH = BASE_DIR / "email_templates" / "top50_fintechs.md"
DATA_PATH = BASE_DIR / "data" / "top50_fintechs.csv" 
OUTPUT_DIR = BASE_DIR / "output" / "fintech_emails"
TRACKING_FILE = BASE_DIR / "output" / "outreach_tracking.csv"

# Create output directories if they don't exist
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
(BASE_DIR / "output").mkdir(exist_ok=True)

def read_template():
    """Read the email template file"""
    with open(TEMPLATE_PATH, 'r') as file:
        return file.read()

def read_fintech_data():
    """Read the fintech companies data"""
    companies = []
    with open(DATA_PATH, 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            companies.append(row)
    return companies

def personalize_email(template, company):
    """Create a personalized email based on company data"""
    email = template.replace("<Name>", company['contact_name'])
    email = email.replace("<Company>", company['company_name'])
    
    # Add personalized paragraph based on company specialization
    personalization = ""
    if company['specialization'] == 'Payments' or company['specialization'] == 'Payment Processing':
        personalization = f"\nI noticed {company['company_name']}'s focus on payment solutions. Our KYC/AML API can reduce verification time by 75% while maintaining full regulatory compliance."
    elif company['specialization'] == 'Digital Banking':
        personalization = f"\nFor a digital bank like {company['company_name']}, our API could reduce customer onboarding friction while strengthening compliance with local regulations."
    elif 'Crypto' in company['specialization']:
        personalization = f"\nFor crypto platforms like {company['company_name']}, our API provides the compliance layer needed to navigate evolving regulations while maintaining a smooth user experience."
    elif 'Lending' in company['specialization']:
        personalization = f"\nOur API can help {company['company_name']} automate borrower verification while reducing fraud risk and ensuring full regulatory compliance."
    else:
        personalization = f"\nI believe our API would be particularly valuable for {company['company_name']}'s specific needs in the {company['specialization']} space."
    
    # Insert personalization before signature
    parts = email.split("—")
    if len(parts) >= 2:
        email = parts[0] + personalization + "\n\n—" + parts[1]
        
    return email

def create_tracking_file():
    """Create or update the tracking CSV file"""
    if not TRACKING_FILE.exists():
        with open(TRACKING_FILE, 'w') as file:
            writer = csv.writer(file)
            writer.writerow(['company_name', 'contact_name', 'email', 'date_generated', 'date_sent', 'responded', 'api_key_provisioned'])

def update_tracking(companies):
    """Update the tracking file with new entries"""
    existing_companies = set()
    
    if TRACKING_FILE.exists():
        with open(TRACKING_FILE, 'r') as file:
            reader = csv.reader(file)
            next(reader)  # Skip header
            for row in reader:
                if row:
                    existing_companies.add(row[0])  # company_name is first column
    
    with open(TRACKING_FILE, 'a') as file:
        writer = csv.writer(file)
        for company in companies:
            if company['company_name'] not in existing_companies:
                writer.writerow([
                    company['company_name'],
                    company['contact_name'],
                    company['email'],
                    datetime.now().strftime('%Y-%m-%d'),
                    '',  # date_sent (empty until sent)
                    'No',  # responded
                    'No'   # api_key_provisioned
                ])

def generate_emails():
    """Main function to generate all personalized emails"""
    template = read_template()
    companies = read_fintech_data()
    create_tracking_file()
    
    generated = 0
    for company in companies:
        email_content = personalize_email(template, company)
        safe_name = company['company_name'].replace(' ', '_').replace('/', '-')
        filename = f"{safe_name}_{company['contact_name'].split()[0]}.md"
        
        with open(OUTPUT_DIR / filename, 'w') as file:
            file.write(email_content)
        generated += 1
        
        # Progress indicator
        print(f"Generated email for {company['company_name']} ({generated}/{len(companies)})")
        
    update_tracking(companies)
    print(f"\n✅ Successfully generated {generated} personalized emails")
    print(f"📁 Emails saved to: {OUTPUT_DIR}")
    print(f"📊 Tracking file updated: {TRACKING_FILE}")
    
if __name__ == "__main__":
    print("🚀 Azora Fintech Outreach Email Generator")
    print("----------------------------------------")
    generate_emails()
    
    # Open output directory in file browser if requested
    if len(sys.argv) > 1 and sys.argv[1] == "--open":
        os.system(f'"$BROWSER" "file://{OUTPUT_DIR}"')