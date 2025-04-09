# Direct Import Guide for Test Members

This guide provides step-by-step instructions for directly importing test members into your Google Sheet to ensure perfect column alignment.

## Method 1: Direct CSV Import

### 1. Download the CSV File
- Locate the `test_members_updated.csv` file in your project directory
- Download it to your local machine if needed

### 2. Import into Google Sheets
1. Open your Google Sheet: [Community Members](https://docs.google.com/spreadsheets/d/1EDTTmhBGiZdhKuLwCQLDduRuIE2oQmXfeJvoiowU4bs/edit)
2. Click **File > Import**
3. Select the **Upload** tab
4. Click **Select a file from your device** and choose the `test_members_updated.csv` file
5. In the Import settings:
   - Import location: **Append to current sheet**
   - Separator type: **Detect automatically**
   - Convert text to numbers, dates, and formulas: **Yes**
6. Click **Import data**

### 3. Verify the Import
- Check that the test members have been added to the bottom of your sheet
- Verify that all columns are correctly aligned with the existing data

## Method 2: Manual Addition

If the import method doesn't work, you can manually add test members:

### 1. Open Your Google Sheet
- Go to [Community Members](https://docs.google.com/spreadsheets/d/1EDTTmhBGiZdhKuLwCQLDduRuIE2oQmXfeJvoiowU4bs/edit)
- Scroll to the first empty row at the bottom

### 2. Add Test Members
Add the following test members, making sure to put each value in the correct column:

**Test Member 1:**
- Email: test_ally_2@example.com
- FirstName: Test
- LastName: Ally
- Role: Ally
- Organisation: Test Org
- JoinDate: 2023-07-25
- OnboardingStatus: New
- LastEmailSent: (leave empty)
- EmailHistory: (leave empty)
- Notes: Test member for onboarding flow

**Test Member 2:**
- Email: test_bqm_2@example.com
- FirstName: Test
- LastName: BQM
- Role: Black Queer Man
- Organisation: Test Org
- JoinDate: 2023-07-25
- OnboardingStatus: New
- LastEmailSent: (leave empty)
- EmailHistory: (leave empty)
- Notes: Test member for onboarding flow

**Test Member 3:**
- Email: test_organiser_2@example.com
- FirstName: Test
- LastName: Organiser
- Role: QTIPOC Organiser
- Organisation: Test Org
- JoinDate: 2023-07-25
- OnboardingStatus: New
- LastEmailSent: (leave empty)
- EmailHistory: (leave empty)
- Notes: Test member for onboarding flow

**Test Member 4:**
- Email: test_org_2@example.com
- FirstName: Test
- LastName: Organisation
- Role: Organisation
- Organisation: Test Organisation
- JoinDate: 2023-07-25
- OnboardingStatus: New
- LastEmailSent: (leave empty)
- EmailHistory: (leave empty)
- Notes: Test member for onboarding flow

## Method 3: Copy-Paste from Spreadsheet

### 1. Create a Local Spreadsheet
- Open a spreadsheet application (Excel, Google Sheets, etc.)
- Copy and paste the following data:

```
Email,FirstName,LastName,Role,Organisation,JoinDate,OnboardingStatus,LastEmailSent,EmailHistory,Notes
test_ally_2@example.com,Test,Ally,Ally,Test Org,2023-07-25,New,,,Test member for onboarding flow
test_bqm_2@example.com,Test,BQM,Black Queer Man,Test Org,2023-07-25,New,,,Test member for onboarding flow
test_organiser_2@example.com,Test,Organiser,QTIPOC Organiser,Test Org,2023-07-25,New,,,Test member for onboarding flow
test_org_2@example.com,Test,Organisation,Organisation,Test Organisation,2023-07-25,New,,,Test member for onboarding flow
```

### 2. Copy to Google Sheet
- Select all cells including headers
- Copy the selection
- Go to your Google Sheet and click on the first empty cell in column A
- Paste the data

## After Adding Test Members

Once you've successfully added the test members:

1. Open n8n dashboard
2. Navigate to the "BLKOUT NXT Onboarding" workflow
3. Update the "Filter & Segment Members" function with the code from `robust_filter_function.js`
4. Save the workflow
5. Click "Test Workflow" to verify it works correctly

If you encounter any issues, check the execution results and logs for error messages.
