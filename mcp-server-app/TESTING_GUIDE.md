# BLKOUT NXT Onboarding System Testing Guide

This guide provides step-by-step instructions for testing the BLKOUT NXT onboarding system with the updated timing (6 hours between welcome and survey, 3-day reminder).

## Test Setup

### 1. Import Test Members

1. Open your Google Sheet: [Community Members](https://docs.google.com/spreadsheets/d/1EDTTmhBGiZdhKuLwCQLDduRuIE2oQmXfeJvoiowU4bs/edit)
2. Import the `test_members.csv` file:
   - Click File > Import
   - Upload the `test_members.csv` file
   - Select "Append to current sheet" option
   - Click Import data

### 2. Verify Test Members

Confirm that the following test members have been added to your sheet:
- test_ally_1@example.com (Ally)
- test_bqm_1@example.com (Black Queer Man)
- test_organiser_1@example.com (QTIPOC Organiser)
- test_org_1@example.com (Organisation)

All should have "New" status in the OnboardingStatus column.

## Testing the Onboarding Flow

### Step 1: Test Welcome Emails

1. Open n8n dashboard
2. Navigate to the "BLKOUT NXT Onboarding" workflow
3. Click "Test Workflow" button
4. Check the execution results to verify welcome emails were sent
5. Check your Google Sheet to confirm OnboardingStatus changed to "Welcome Sent"

### Step 2: Test Survey Emails (6-hour timing)

1. For each test member, update the LastEmailSent date to 7+ hours ago:
   - Set LastEmailSent to a date/time at least 7 hours in the past
   - Keep OnboardingStatus as "Welcome Sent"

2. Open n8n dashboard
3. Navigate to the "BLKOUT NXT Survey Follow-up (Updated)" workflow
4. Click "Test Workflow" button
5. Check the execution results to verify survey emails were sent
6. Check your Google Sheet to confirm OnboardingStatus changed to "Survey Sent"

### Step 3: Test Survey Reminders (3-day timing)

1. For each test member, update the LastEmailSent date to 4+ days ago:
   - Set LastEmailSent to a date at least 4 days in the past
   - Keep OnboardingStatus as "Survey Sent"

2. Open n8n dashboard
3. Navigate to the "BLKOUT NXT Survey Follow-up (Updated)" workflow
4. Click "Test Workflow" button
5. Check the execution results to verify survey reminder emails were sent
6. Check your Google Sheet to confirm EmailHistory now includes "Survey Reminder"

### Step 4: Test Drip Campaign Enrollment

1. For each test member, update the OnboardingStatus to "Survey Completed"

2. Open n8n dashboard
3. Navigate to each drip campaign workflow:
   - "BLKOUT NXT Ally Drip Campaign"
   - "BLKOUT NXT Black Queer Men Drip Campaign"
   - "BLKOUT NXT QTIPOC Organiser Drip Campaign"
   - "BLKOUT NXT Organisation Drip Campaign"

4. Click "Test Workflow" for each workflow
5. Check the execution results to verify drip emails were sent
6. Check your Google Sheet to confirm Notes field now includes drip campaign information

## Verifying Results

After completing all test steps, verify the following for each test member:

1. **Welcome Email**:
   - OnboardingStatus should be "Survey Sent" or "Survey Completed"
   - EmailHistory should include "Welcome"

2. **Survey Email**:
   - EmailHistory should include "Survey"
   - Sent 6 hours after welcome email

3. **Survey Reminder**:
   - EmailHistory should include "Survey Reminder"
   - Sent 3 days after survey email

4. **Drip Campaign**:
   - Notes should include "DripCampaign: [Segment]"
   - Notes should include "DripStage: 1"
   - Notes should include "NextDripDate: [future date]"

## Troubleshooting

If any step fails:

1. Check the n8n test results for error messages
2. Verify the workflow is active
3. Check that the test members have the correct data in the Google Sheet
4. Ensure the timing conditions are met (6+ hours for survey, 3+ days for reminder)

## Workflow IDs

- BLKOUT NXT Onboarding: 9U7WKBX89mZCeyy3
- BLKOUT NXT Survey Follow-up (Updated): pk1rXgst1KaWsSYa
- BLKOUT NXT Ally Drip Campaign: W11CYyvc0tvEnp6b
- BLKOUT NXT Black Queer Men Drip Campaign: h0DO1MrAx0HJQuhe
- BLKOUT NXT QTIPOC Organiser Drip Campaign: GnKiyiQqaqdB6mP2
- BLKOUT NXT Organisation Drip Campaign: AcsMaOlCZEOdyBAh
