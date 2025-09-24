# Google Cloud Storage Setup for Spartans Dashboard

## Overview

The Spartans Dashboard fetches daily agent performance data from Google Cloud Storage (GCS) and aggregates it for display.

## GCS File Structure

### Expected Path Structure
```
gs://[your-bucket]/spartans/daily/
├── spartans-data-2024-09-24.json
├── spartans-data-2024-09-23.json
├── spartans-data-2024-09-22.json
└── ... (one file per day)
```

### File Naming Convention
- **Format**: `spartans-data-YYYY-MM-DD.json`
- **Example**: `spartans-data-2024-09-24.json`
- **Timezone**: Use UTC dates

## Daily File Format

Each daily file should contain agent performance data for that specific day:

```json
{
  "date": "2024-09-24",
  "generated": "2024-09-25T02:00:00Z",
  "records": [
    {
      "date": "2024-09-24",
      "agent_id": "agent_001",
      "display_name": "Alpha Agent",
      "xHandle": "@alphaagent",
      "posts": 1250,
      "impressions": 125000
    },
    {
      "date": "2024-09-24",
      "agent_id": "agent_002",
      "display_name": "Beta Agent",
      "xHandle": "@betaagent",
      "posts": 1100,
      "impressions": 110000
    }
    // ... more agents
  ]
}
```

### Alternative Format (Also Supported)

The aggregation script also accepts this simpler format:

```json
{
  "date": "2024-09-24",
  "agents": {
    "agent_001": {
      "display_name": "Alpha Agent",
      "xHandle": "@alphaagent",
      "posts": 1250,
      "impressions": 125000
    },
    "agent_002": {
      "display_name": "Beta Agent",
      "xHandle": "@betaagent",
      "posts": 1100,
      "impressions": 110000
    }
  }
}
```

## GitHub Secrets Required

Set these in your repository settings (Settings → Secrets → Actions):

1. **`GCP_SA_KEY`**
   - Service Account JSON key with read access to the GCS bucket
   - Required permissions: `storage.objects.get` on the bucket

2. **`GCP_PROJECT_ID`**
   - Your Google Cloud Project ID
   - Example: `spartans-analytics-prod`

3. **`GCS_BUCKET_NAME`**
   - Your GCS bucket name (without `gs://` prefix)
   - Example: `spartans-data-bucket`

## Workflow Schedule

The GitHub Action runs:
- **Daily at 2 AM UTC** - Fetches yesterday's data
- **Manual trigger** - Can be run anytime from Actions tab

## Data Flow

1. **Data Generation** (External Process)
   - Your system generates daily JSON files
   - Uploads to GCS path: `gs://[bucket]/spartans/daily/spartans-data-YYYY-MM-DD.json`

2. **Daily Fetch** (GitHub Action)
   - Downloads yesterday's file from GCS
   - Aggregates all daily files (last 30 days)
   - Generates combined `data/data.json`
   - Commits to repository

3. **Dashboard Display**
   - GitHub Pages serves the dashboard
   - JavaScript loads `data/data.json`
   - Displays charts and metrics

## Testing the Setup

1. **Manual Test**:
   ```bash
   # Upload a test file to GCS
   gsutil cp test-data.json gs://[bucket]/spartans/daily/spartans-data-2024-09-24.json
   ```

2. **Trigger GitHub Action**:
   - Go to Actions tab
   - Select "📈 Fetch Daily Agent Data"
   - Click "Run workflow"

3. **Verify**:
   - Check if `data/data.json` is updated
   - Visit dashboard to see the data

## Data Retention

- **Daily files**: Kept for 30 days (older files are auto-deleted)
- **Aggregated data**: All historical data is preserved in `data.json`

## Troubleshooting

### No data appearing?
- Check GCS file naming matches pattern
- Verify GitHub Secrets are set correctly
- Check Actions tab for workflow errors

### Permission denied?
- Ensure Service Account has `storage.objects.get` permission
- Verify bucket name in secrets

### Data format issues?
- Validate JSON structure matches expected format
- Check date format is `YYYY-MM-DD`

## Support

For issues with data generation or GCS setup, contact your data engineering team.
For dashboard issues, create an issue in this repository.