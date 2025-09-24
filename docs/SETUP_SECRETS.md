# Setting Up GitHub Secrets for Spartans Dashboard

## Overview

The Spartans Dashboard uses GitHub Actions to securely manage authentication credentials. Instead of storing password hashes directly in the code, we use GitHub Secrets to generate them dynamically.

## Required GitHub Secrets

### 1. SPARTANS_PASSWORD
- **Description**: The main dashboard access password
- **Example**: A strong password like `MySecureP@ssw0rd2024!`
- **Note**: This is the actual password, NOT the hash

### 2. GCP_SA_KEY (For Data Updates)
- **Description**: Google Cloud Service Account key in JSON format
- **Usage**: For fetching data from Google Cloud Storage

### 3. GCP_PROJECT_ID (For Data Updates)
- **Description**: Your Google Cloud Project ID
- **Example**: `spartans-project-123456`

### 4. GCS_BUCKET_NAME (For Data Updates)
- **Description**: Google Cloud Storage bucket name
- **Example**: `spartans-analytics-data`

## How to Set Up Secrets

1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret:
   - **Name**: `SPARTANS_PASSWORD`
   - **Value**: Your chosen password
6. Click **Add secret**

## How It Works

### Password Hash Generation

1. When you push changes or manually trigger the workflow, GitHub Actions runs
2. The workflow takes the `SPARTANS_PASSWORD` secret
3. Generates a SHA-256 hash of the password
4. Creates/updates `auth-hash.json` with the hash
5. Commits this file back to the repository

### Security Benefits

- ✅ Actual password never stored in code
- ✅ Password can be changed without modifying code
- ✅ Only repository administrators can view/change secrets
- ✅ Hash generation is automated and consistent
- ✅ Audit trail of all password hash updates

## Changing the Password

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Click on `SPARTANS_PASSWORD`
3. Click **Update**
4. Enter new password value
5. Click **Update secret**
6. Go to **Actions** tab
7. Run the **🔐 Generate Password Hash** workflow manually
8. The new hash will be automatically committed

## Local Development

For local development, create a temporary `auth-hash.json` file:

```json
{
  "password": "YOUR_HASH_HERE",
  "generated": "2024-01-01T00:00:00Z"
}
```

Generate the hash locally:
```bash
echo -n "your-password" | shasum -a 256 | cut -d' ' -f1
```

**Important**: Never commit this local file. Add it to `.gitignore`:
```
auth-hash.json
```

## Troubleshooting

### Workflow Not Running
- Check if you have the correct permissions
- Ensure the secret name matches exactly
- Check Actions tab for any error messages

### Authentication Not Working
- Verify the password hash was generated correctly
- Check browser console for errors
- Clear browser cache/session storage
- Ensure `auth-hash.json` exists and is valid JSON

---

**Security Note**: Never share or expose your GitHub Secrets. Treat them like passwords.