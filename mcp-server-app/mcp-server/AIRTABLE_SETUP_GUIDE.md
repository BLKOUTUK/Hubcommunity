# Airtable Setup Guide for BLKOUT NEXT Campaign

This guide will help you set up your Airtable base to work with the MCP servers for the BLKOUT NEXT campaign.

## Step 1: Create a New Airtable Base

1. Log in to your Airtable account
2. Click "Add a base" and select "Start from scratch"
3. Name your base "BLKOUT NEXT Campaign"

## Step 2: Set Up the Campaign Phases Table

1. Rename "Table 1" to "Campaign Phases"
2. Set up the following fields:

| Field Name | Field Type | Description |
|------------|------------|-------------|
| PhaseID | Number | Unique identifier for the phase (1-6) |
| Name | Single line text | Name of the campaign phase |
| StartDate | Date | Start date of the phase (YYYY-MM-DD) |
| EndDate | Date | End date of the phase (YYYY-MM-DD) |
| HubPercentage | Number | Percentage focus on BLKOUTHUB (0-100) |
| WebsitePercentage | Number | Percentage focus on BLKOUTUK.com (0-100) |
| SocialPercentage | Number | Percentage focus on Social Media (0-100) |
| Description | Long text | Detailed description of the phase |

3. Add the following records:

| PhaseID | Name | StartDate | EndDate | HubPercentage | WebsitePercentage | SocialPercentage | Description |
|---------|------|-----------|---------|---------------|-------------------|------------------|-------------|
| 1 | Visibility Reset: 'We're Here' | 2025-04-01 | 2025-04-14 | 20 | 10 | 70 | Launch bold campaign framing The Signal as a metaphor for erasure. High-impact storytelling post/video introducing BLKOUT NEXT. Soft outreach to key allies & stakeholders with an emphasis on relationship-building. Community pulse-check (polls/surveys) to understand member needs. |
| 2 | Community Visioning & Cooperative Models | 2025-04-15 | 2025-05-07 | 70 | 20 | 10 | Host discussions on cooperative membership structures and community ownership. Invite experts from Co-operatives UK and other cooperative leaders. Publish key takeaways & discussion prompts. Strengthen partner and ally relationships through engagement. |
| 3 | Interactive Resources & Knowledge Exchange | 2025-05-08 | 2025-05-29 | 70 | 20 | 10 | Publish online interactive resources and knowledge-sharing tools. Host weekly drop-in discussions to deepen member engagement. Encourage early membership sign-ups through trust-driven interactions. |
| 4 | BLKOUT Newsroom & Community Storytelling | 2025-05-30 | 2025-06-20 | 70 | 20 | 10 | Launch BLKOUT Newsroom prototype with user-generated storytelling. Integrate OOMF Story Visualization for narrative engagement. Create a resource hub for community-led media. Encourage collaborative storytelling and relationship-driven content creation. |
| 5 | IRL Forum Event & Future Planning | 2025-06-21 | 2025-07-12 | 70 | 20 | 10 | Host an IRL Forum event, fostering deeper personal connections. Publish a summary of discussions across all topics, synthesizing key insights and actionable next steps. Conduct quick-vote engagement on future tools for Black queer media. |
| 6 | Cultural Sustainability & Membership Growth | 2025-07-13 | 2025-09-01 | 70 | 20 | 10 | Discuss long-term impact of knowledge-sharing and community-building. Define BLKOUTHUB's role as an archive & ecosystem. Solidify membership tiers & funding model, ensuring a relational and value-based approach. |

## Step 3: Set Up the Campaign Metrics Table

1. Create a new table named "Campaign Metrics"
2. Set up the following fields:

| Field Name | Field Type | Description |
|------------|------------|-------------|
| MetricID | Number | Unique identifier for the metric |
| Name | Single line text | Name of the metric |
| CurrentValue | Number | Current value of the metric |
| TargetValue | Number | Target value to achieve |
| LastUpdated | Date | Date the metric was last updated |

3. Add the following records:

| MetricID | Name | CurrentValue | TargetValue | LastUpdated |
|----------|------|--------------|-------------|-------------|
| 1 | Total Engagements | 325 | 500 | 2025-04-01 |
| 2 | Membership Conversions | 42 | 50 | 2025-04-01 |
| 3 | Social Reach | 68500 | 100000 | 2025-04-01 |
| 4 | Funding Proposals | 2 | 5 | 2025-04-01 |

## Step 4: Set Up the Action Items Table

1. Create a new table named "Action Items"
2. Set up the following fields:

| Field Name | Field Type | Description |
|------------|------------|-------------|
| ItemID | Number | Unique identifier for the action item |
| Description | Single line text | Description of the action item |
| PhaseID | Number | Phase this action belongs to (link to Campaign Phases) |
| Priority | Single select | Priority level (High, Medium, Low) |
| Status | Single select | Current status (Not Started, In Progress, Completed) |

3. Add the following records for Phase 1:

| ItemID | Description | PhaseID | Priority | Status |
|--------|-------------|---------|----------|--------|
| 1 | Create high-impact storytelling post introducing BLKOUT NEXT | 1 | High | Not Started |
| 2 | Launch 'The Signal' campaign across social media platforms | 1 | High | Not Started |
| 3 | Conduct community pulse-check surveys | 1 | Medium | Not Started |
| 4 | Begin soft outreach to key allies and stakeholders | 1 | Medium | Not Started |

4. Add similar records for the other phases based on the action items in the campaign_server.py file

## Step 5: Set Up the Events Calendar Table

1. Create a new table named "Events Calendar"
2. Set up the following fields:

| Field Name | Field Type | Description |
|------------|------------|-------------|
| EventID | Number | Unique identifier for the event |
| Title | Single line text | Title of the event |
| Date | Date | Date of the event |
| Platform | Single line text | Platform where the event will take place |
| Description | Long text | Detailed description of the event |

3. Add the following sample records:

| EventID | Title | Date | Platform | Description |
|---------|-------|------|----------|-------------|
| 1 | Weekly Community Check-in | 2025-04-03 | Heartbeat.chat | Regular community engagement session |
| 2 | Email Campaign: Phase Introduction | 2025-04-06 | Sendfox | Introduction to the current campaign phase |
| 3 | Social Media Content Planning | 2025-04-08 | Internal | Plan next week's social media content |
| 4 | Partner Organization Meeting | 2025-04-11 | Zoom | Coordination meeting with key partners |

## Step 6: Get Your Airtable API Key and Base ID

1. Go to your [Airtable account page](https://airtable.com/account)
2. Under "API", click "Generate API key" if you don't already have one
3. Copy your API key

To get your Base ID:
1. Go to the [Airtable API page](https://airtable.com/api)
2. Click on your "BLKOUT NEXT Campaign" base
3. Look in the Introduction section for "The ID of this base is..." and copy the Base ID

## Step 7: Update Your .env File

1. Open the `.env` file in the `config` directory
2. Update the following values:
   ```
   AIRTABLE_API_KEY=your_actual_api_key_here
   AIRTABLE_BASE_ID=your_actual_base_id_here
   ```

## Step 8: Test the Campaign Server

1. Start the Campaign Server:
   ```
   python campaign-server/campaign_server.py
   ```

2. Test the server with Claude Desktop to make sure it's pulling data from your Airtable base

## Next Steps

Once you've set up the Campaign Server with Airtable, you can:

1. Update the Sendfox Integration Server to use Airtable
2. Update the Heartbeat Integration Server to use Airtable
3. Update the Social Media Integration Server to use Airtable

This will give you a centralized place to manage all your campaign data in Airtable's visual interface.
