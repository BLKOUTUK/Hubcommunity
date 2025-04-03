# Automated Event Scraping Scheduling

This document outlines various ways to set up automated scheduling for the event scraping functionality.

## Using Cron Jobs (Linux/macOS Server)

Add the following to your crontab to run the event scraper at scheduled intervals:

```bash
# Run every day at 3:00 AM (adjust timing as needed)
0 3 * * * cd /path/to/community-dashboard && node scripts/automate-event-scraping.js >> logs/event-scraper.log 2>&1

# Run twice daily (9 AM and 9 PM)
0 9,21 * * * cd /path/to/community-dashboard && node scripts/automate-event-scraping.js >> logs/event-scraper.log 2>&1

# Run every Monday, Wednesday, and Friday at 2:30 PM
30 14 * * 1,3,5 cd /path/to/community-dashboard && node scripts/automate-event-scraping.js >> logs/event-scraper.log 2>&1
```

To edit your crontab:

```bash
crontab -e
```

## Using Windows Task Scheduler

1. Open Task Scheduler
2. Create a Basic Task:
   - Name: "BLKOUT Event Scraper"
   - Trigger: Daily (or your preferred schedule)
   - Action: Start a program
   - Program/script: `node`
   - Add arguments: `scripts/automate-event-scraping.js`
   - Start in: `C:\path\to\community-dashboard`

## Using Docker with Cron

Create a Dockerfile for the scraper:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Install cron
RUN apk --no-cache add dcron

# Add crontab
RUN echo "0 */12 * * * cd /app && node scripts/automate-event-scraping.js >> /var/log/cron.log 2>&1" > /var/spool/cron/crontabs/root

# Run cron
CMD ["crond", "-f"]
```

## Using GitHub Actions

Create a GitHub workflow file in `.github/workflows/event-scraper.yml`:

```yaml
name: Scheduled Event Scraping

on:
  schedule:
    # Run at 02:00 UTC every day
    - cron: '0 2 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  scrape:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run event scraper
        run: node scripts/automate-event-scraping.js
        env:
          AIRTABLE_API_KEY: ${{ secrets.AIRTABLE_API_KEY }}
          AIRTABLE_BASE_ID: ${{ secrets.AIRTABLE_BASE_ID }}
          OUTSAVVY_API_KEY: ${{ secrets.OUTSAVVY_API_KEY }}
          N8N_WEBHOOK_URL: ${{ secrets.N8N_WEBHOOK_URL }}
          NOTIFICATION_EMAIL: ${{ secrets.NOTIFICATION_EMAIL }}
```

## Using Serverless Functions with AWS Lambda

Create a Lambda function that runs on a schedule:

1. Package the script and dependencies
2. Create a Lambda function using Node.js
3. Set up an EventBridge (CloudWatch Events) rule to trigger it:

```json
{
  "description": "Trigger event scraper daily",
  "schedule": "cron(0 3 * * ? *)"
}
```

## Setting Up Monitoring

It's recommended to set up monitoring to ensure your scheduled scraper is running correctly:

1. Configure logging to capture any errors or issues
2. Set up alerts if the scraper fails
3. Create a dashboard to monitor the number of events imported over time

## Environment Variables

Ensure these environment variables are set in your environment:

```
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id
OUTSAVVY_API_KEY=your_outsavvy_api_key
N8N_WEBHOOK_URL=your_n8n_webhook_url
NOTIFICATION_EMAIL=admin@example.com