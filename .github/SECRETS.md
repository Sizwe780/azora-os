# GitHub Secrets Configuration Guide

This document lists all the secrets that need to be configured in your GitHub repository for the CI/CD workflows to function properly.

## ✅ Already Configured

Your GitHub secrets are already set up. This guide shows how they integrate with AWS.

## Required Secrets

Navigate to: **Settings → Secrets and variables → Actions → New repository secret**

### AWS Deployment Secrets

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key | Create in AWS IAM Console |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key | Create in AWS IAM Console |

**AWS IAM Setup:**
1. Go to AWS IAM Console
2. Create a new user for GitHub Actions
3. Attach policies: `AmazonEKSFullAccess`, `AmazonEC2ContainerRegistryFullAccess`
4. Generate access keys
5. Copy the Access Key ID and Secret Access Key

### OAuth Provider Secrets

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Google Cloud Console → APIs & Services → Credentials |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Google Cloud Console → APIs & Services → Credentials |
| `GITHUB_ID` | GitHub OAuth app ID | GitHub Settings → Developer settings → OAuth Apps |
| `GITHUB_SECRET` | GitHub OAuth client secret | GitHub Settings → Developer settings → OAuth Apps |

**Vercel Setup:**
1. Go to https://vercel.com/account/tokens
2. Create a new token
3. Get Org ID and Project ID from your Vercel project settings

## Verification

After adding secrets, you can verify they're set correctly by:

1. Going to **Settings → Secrets and variables → Actions**
2. You should see all required secrets listed (values are hidden)
3. Run a workflow to test the secrets are working

## Security Notes

- ✅ Never commit secrets to the repository
- ✅ Rotate secrets regularly (every 90 days recommended)
- ✅ Use least-privilege IAM policies
- ✅ Enable MFA on AWS account
- ✅ Monitor CloudTrail for unauthorized access

## AWS Integration

### Automatic Sync
Secrets automatically sync from GitHub to AWS Secrets Manager via workflow:
- File: `.github/workflows/aws-secrets-sync.yml`
- Trigger: Manual or on push to main

### Manual Setup
```powershell
# From project root
.\scripts\setup-aws-secrets.ps1
```

### Backend Usage
```typescript
import { loadSecretsToEnv } from '@/infrastructure/aws/secrets-loader';

await loadSecretsToEnv();
// Secrets now in process.env
```

## Troubleshooting

If workflows fail with "secret not found":
1. Check secret name matches exactly (case-sensitive)
2. Verify secret is set at repository level, not organization
3. Re-run the workflow after adding secrets
4. Check AWS Secrets Manager console for synced secrets
