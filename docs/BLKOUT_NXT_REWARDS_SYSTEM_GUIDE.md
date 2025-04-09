# BLKOUT NXT Rewards System Setup Guide

This guide will help you set up a rewards and gamification system for BLKOUT NXT using Google Sheets and n8n workflows.

## Overview

The BLKOUT NXT Rewards System includes:

1. Points system for member activities
2. Achievements for milestone accomplishments
3. Notification system for rewards and achievements
4. Tracking and reporting of member engagement

## Step 1: Set Up Google Sheets Structure

Create the following sheets in your Google Sheets document:

### 1. Update Community Members Sheet

Add these columns to your existing Community Members sheet:
- RewardStatus (Column K)
- PointsBalance (Column L)

### 2. Create Points History Sheet

Create a new sheet named "Points History" with these columns:
- Email
- ActivityType
- PointsAwarded
- DateAwarded

### 3. Create Rewards Sheet

Create a new sheet named "Rewards" with these columns:
- ActivityType
- PointsAwarded
- Description
- Active

Add some initial rewards:
```
ActivityType,PointsAwarded,Description,Active
Survey Completion,50,Points awarded for completing a survey,Yes
Event Attendance,100,Points awarded for attending an event,Yes
Referral,75,Points awarded for referring a new member,Yes
```

### 4. Create Achievements Sheet

Create a new sheet named "Achievements" with these columns:
- AchievementID
- AchievementName
- AchievementDescription
- CriteriaType
- CriteriaValue

Add some initial achievements:
```
AchievementID,AchievementName,AchievementDescription,CriteriaType,CriteriaValue
ACH001,Point Collector,Earned 100 points in the community,Points,100
ACH002,Point Master,Earned 500 points in the community,Points,500
ACH003,Dedicated Member,Been a member for 30 days,MembershipDuration,30
ACH004,Veteran Member,Been a member for 90 days,MembershipDuration,90
ACH005,Organiser Status,Recognized as a community organiser,MemberType,Organiser
```

### 5. Create Member Achievements Sheet

Create a new sheet named "Member Achievements" with these columns:
- Email
- AchievementID
- AchievementName
- DateAwarded

### 6. Create Rewards Redemption Sheet

Create a new sheet named "Rewards Redemption" with these columns:
- Email
- RewardName
- PointsCost
- RedemptionDate
- Status

## Step 2: Import the Rewards Workflows

1. Import the following workflow files into n8n:
   - BLKOUT_NXT_Survey_Rewards_Workflow.json
   - BLKOUT_NXT_Achievement_Tracking_Workflow.json

2. Configure each workflow:
   - Update the Google Sheets credentials
   - Verify the Document ID and Sheet Names
   - Customize email templates as needed

## Step 3: Set Up Workflow Schedules

1. **Survey Rewards Workflow**:
   - This should run after the Survey Follow-up workflow
   - Set it to run daily or weekly

2. **Achievement Tracking Workflow**:
   - Set this to run weekly to check for new achievements
   - Recommended schedule: Every Sunday at midnight

## Step 4: Test the Rewards System

1. **Test Survey Rewards**:
   - Update a test member's SurveyStatus to "Completed"
   - Run the Survey Rewards workflow
   - Verify that points are awarded and recorded

2. **Test Achievement Tracking**:
   - Update a test member's PointsBalance to meet an achievement criteria
   - Run the Achievement Tracking workflow
   - Verify that the achievement is awarded and recorded

## Step 5: Integrate with Existing Workflows

Modify your existing workflows to incorporate the rewards system:

1. **Survey Follow-up Workflow**:
   - Add a node to trigger the Survey Rewards workflow when a survey is completed

2. **Event Attendance Workflow** (if you have one):
   - Create a similar rewards workflow for event attendance
   - Award points when members attend events

## Step 6: Create a Redemption Workflow

Create a workflow to handle reward redemptions:

1. Set up a form for members to request rewards
2. Create a workflow to process these requests
3. Update the member's points balance when rewards are redeemed

## Step 7: Create Reporting Workflows

Create workflows to generate reports on the rewards system:

1. **Leaderboard Workflow**:
   - Generate a weekly leaderboard of top point earners
   - Send this to administrators or publish to the community

2. **Engagement Report Workflow**:
   - Track overall engagement metrics
   - Monitor which activities are generating the most points

## Additional Ideas for Gamification

1. **Progress Bars**: Show members how close they are to the next achievement
2. **Limited-Time Challenges**: Create special events where members can earn bonus points
3. **Tiers/Levels**: Create member tiers based on points (e.g., Bronze, Silver, Gold)
4. **Community Recognition**: Highlight top contributors in newsletters or community spaces

## Maintenance and Optimization

1. **Regular Review**: Periodically review point values and achievement criteria
2. **Member Feedback**: Collect feedback on the rewards system and make adjustments
3. **New Rewards**: Regularly add new achievements and redemption options to keep the system fresh

## Getting Help

If you need further assistance:

1. Check the n8n documentation: https://docs.n8n.io/
2. Join the n8n community forum: https://community.n8n.io/
3. Contact BLKOUT NXT support at blkoutuk@gmail.com
