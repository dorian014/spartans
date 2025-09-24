# Spartans Dashboard Setup Guide - by Qstarlabs

## GitHub Actions Setup

### Required Secrets

Configure these secrets in your GitHub repository (Settings → Secrets and variables → Actions):

1. **GCP_SA_KEY**: Google Cloud Service Account key (JSON format)
   - Create a service account in your GCP project
   - Grant it `Storage Object Viewer` role for the bucket
   - Generate and download the JSON key
   - Copy the entire JSON content as the secret value

2. **GCP_PROJECT_ID**: Your Google Cloud Project ID
   - Example: `my-project-123456`

3. **GCS_BUCKET_NAME**: Google Cloud Storage bucket name
   - Example: `my-analytics-bucket`
   - The workflow expects data at: `gs://[bucket]/x-analytics/data.json`

### GitHub Pages Setup

1. Go to Settings → Pages
2. Under "Source", select "Deploy from a branch"
3. Select "main" branch and "/" (root) folder
4. Click Save

The dashboard will be available at:
`https://[username].github.io/spartans/`

### Data Update Schedule

The GitHub Action runs hourly to fetch the latest data from GCS. You can also manually trigger it from the Actions tab.

## Local Development

1. Start a local server:
   ```bash
   python -m http.server 8000
   ```

2. Open: `http://localhost:8000/`

3. Default password (SHA-256 hashed):
   - Password: `adminspartans`

## Data Format

The `data/data.json` file should follow this structure:

```json
{
  "lastUpdated": "2024-09-24T12:00:00Z",
  "dataVersion": "1.0",
  "summary": {
    "totalAgents": 300,
    "totalDays": 30,
    "totalPosts": 12000000,
    "totalImpressions": 1200000000
  },
  "records": [
    {
      "date": "2024-09-24",
      "agent_id": "agent_001",
      "display_name": "Agent Name",
      "xHandle": "@agenthandle",
      "posts": 1250,
      "impressions": 125000
    }
  ]
}
```

## Security Notes

1. **Never commit real passwords** - The config.js contains hashed passwords
2. **Use environment-specific configs** for production
3. **Restrict GCS bucket access** to the service account only
4. **Enable GitHub Pages access restrictions** if needed (GitHub Pro/Enterprise)