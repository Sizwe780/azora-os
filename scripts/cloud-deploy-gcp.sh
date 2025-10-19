#!/bin/bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/main-app
gcloud run deploy azora-main-app --image gcr.io/YOUR_PROJECT_ID/main-app --platform managed --region us-central1 --allow-unauthenticated
# Repeat for each service; consider using Cloud Build triggers for automation
