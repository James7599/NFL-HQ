# Draft Order System

The NBA Draft Order page is now powered by Tankathon data, automatically updated every 30 minutes.

## How It Works

1. **Data Source**: Draft order is fetched from [Tankathon](https://www.tankathon.com/full_draft)
2. **Update Frequency**: Every 30 minutes via GitHub Actions
3. **Data Storage**: `/public/data/tankathon-draft-order.json`
4. **Display**: `/app/nba/draft-order/DraftOrderClient.tsx` reads from the JSON file

## Setup

### Automatic Updates (GitHub Actions)

The draft order updates automatically via GitHub Actions:
- **Schedule**: Every 30 minutes
- **Workflow**: `.github/workflows/update-draft-order.yml`
- **What it does**: Fetches latest data from Tankathon and commits changes
- **Manual trigger**: Can be triggered manually from GitHub Actions tab

No local setup required! The workflow runs in the cloud.

## Manual Update

To manually update the draft order at any time:

```bash
npm run update-draft-order
```

## Data Format

The `tankathon-draft-order.json` file contains:

```json
{
  "lastUpdated": "2025-12-05T05:36:21.689Z",
  "source": "Tankathon",
  "picks": [
    {
      "pick": 1,
      "team": "ATL",  // 3-letter abbreviation
      "via": "NOP",   // "Own" or 3-letter abbreviation
      "round": 1
    },
    ...
  ]
}
```

## Architecture Changes

### Previous System (Removed)
- Complex protection logic in `/lib/complexProtections.ts`
- Manual draft pick tracking in `/public/data/draft-picks/`
- `buildDraftBoard()` function to calculate pick ownership

### Current System (Simplified)
- Scrape Tankathon for draft order
- Store in single JSON file
- Simple client component reads and displays data
- No complex protection logic needed

## Benefits

1. **Always Accurate**: Tankathon handles all the complex trade logic
2. **Always Current**: Updates every 30 minutes automatically
3. **Simpler Codebase**: Removed thousands of lines of complex protection logic
4. **Less Maintenance**: No need to manually track every trade and protection

## Fallback

If Tankathon is unavailable, the system uses the last known good data from the previous fetch.

## Files

- `/scripts/update-draft-order.js` - Fetches and saves Tankathon data
- `/scripts/cron-update-draft.sh` - Cron wrapper script
- `/public/data/tankathon-draft-order.json` - Current draft order data
- `/app/nba/draft-order/DraftOrderClient.tsx` - Display component
