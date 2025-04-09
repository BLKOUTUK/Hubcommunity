# BLKOUT NXT Drip Campaign Guide

## Overview

The BLKOUT NXT onboarding system now includes segment-specific drip campaigns for all member types. These drip campaigns provide tailored resources and information to each segment over a 5-week period, helping to engage members and provide value based on their specific needs and interests.

## Drip Campaign Structure

Each segment has its own dedicated drip campaign:

1. **BLKOUT NXT Ally Drip Campaign**: Resources for allies supporting the community
2. **BLKOUT NXT Black Queer Men Drip Campaign**: Resources for Black Queer Men in the community
3. **BLKOUT NXT QTIPOC Organiser Drip Campaign**: Resources for QTIPOC organisers
4. **BLKOUT NXT Organisation Drip Campaign**: Resources for organisational partners

Each drip campaign consists of 5 weekly emails with segment-specific content:

- **Email 1**: Introduction and basic resources
- **Email 2**: Intermediate resources and information
- **Email 3**: Community-focused resources
- **Email 4**: Specialized resources for growth
- **Email 5**: Ongoing engagement opportunities

## Drip Campaign Content

### Ally Drip Campaign

**Email 1: Understanding Allyship**
- What is Allyship?
- Listening and Learning
- Recognizing Privilege

**Email 2: Taking Action**
- Effective Advocacy Strategies
- Speaking Up Against Discrimination
- Supporting Black Queer Businesses and Artists

**Email 3: Education and Growth**
- Recommended Reading List
- Documentaries and Films
- Podcasts by Black Queer Creators

**Email 4: Community Engagement**
- Attending Events as an Ally
- Amplifying Black Queer Voices
- Creating Inclusive Spaces

**Email 5: Ongoing Allyship**
- Sustaining Your Allyship
- Finding Community as an Ally
- Upcoming Ally Workshops

### Black Queer Men Drip Campaign

**Email 1: Connecting with Others**
- Upcoming Community Events
- Online Discussion Forums
- Local Support Groups

**Email 2: Health and Wellbeing**
- Healthcare Providers Directory
- Mental Health Resources
- Sexual Health Information

**Email 3: Arts and Culture**
- Black Queer Artists to Follow
- Books and Literature
- Films and Documentaries

**Email 4: Professional Development**
- Networking Opportunities
- Mentorship Programs
- Career Development Resources

**Email 5: Getting Involved**
- Volunteer Opportunities
- Leadership Programs
- Community Initiatives

### QTIPOC Organiser Drip Campaign

**Email 1: Getting Started**
- Community Organizing Basics
- Event Planning Checklist
- Inclusive Space Guidelines

**Email 2: Funding Your Events**
- Grant Opportunities for QTIPOC Organisers
- Crowdfunding Best Practices
- Budget Templates

**Email 3: Building Your Community**
- Community Engagement Strategies
- Digital Outreach Tools
- Creating Sustainable Community Structures

**Email 4: Self-Care for Organisers**
- Burnout Prevention for Activists
- Setting Boundaries in Community Work
- Collective Care Practices

**Email 5: Collaboration Opportunities**
- BLKOUT NXT Organiser Directory
- Upcoming Collaboration Events
- Partnership Request Form

### Organisation Drip Campaign

**Email 1: Getting Started**
- Partnership Opportunities Overview
- Upcoming Collaboration Events
- Community Support Guidelines

**Email 2: Event Collaboration**
- Co-Hosting Events Guide
- Venue Sharing Opportunities
- Cross-Promotion Strategies

**Email 3: Funding and Grants**
- Joint Funding Opportunities
- Grant Writing Collaboration
- Resource Sharing Framework

**Email 4: Community Engagement**
- Community Needs Assessment
- Collaborative Outreach Strategies
- Measuring Community Impact

**Email 5: Long-term Collaboration**
- Strategic Partnership Agreement Template
- Long-term Planning Framework
- Partnership Evaluation Tools

## How the Drip Campaigns Work

### Enrollment Process

Members are automatically enrolled in the appropriate drip campaign based on their segment after they complete the survey:

1. **Survey Completion**: Member completes the segment-specific survey
2. **Drip Enrollment**: System identifies their segment and enrolls them in the corresponding drip campaign
3. **First Email**: The first drip email is sent immediately upon enrollment
4. **Subsequent Emails**: Remaining emails are sent weekly

### Tracking and Management

The system tracks each member's progress through the drip campaign:

- **DripCampaign**: Indicates which campaign they're enrolled in (Ally, BQM, QTIPOCOrganiser, Organisation)
- **DripStage**: Tracks which email they've received (0-4)
- **NextDripDate**: When the next email will be sent

All this information is stored in the Notes field of the Google Sheet.

## Customizing the Drip Campaigns

### Email Content

To modify the content of the drip emails:

1. Open n8n dashboard
2. Edit the appropriate drip campaign workflow
3. Select the email node you want to modify (e.g., "Send Drip Email 2")
4. Update the subject and text fields
5. Save the workflow

### Resource Links

The current resource links are placeholders (https://example.com/...). You should update these with actual resources:

1. Create or identify relevant resources for each segment and topic
2. Update the links in the email content
3. Consider creating landing pages for each resource category

### HTML Templates

For a more professional look, you can implement HTML email templates similar to the ones created for the welcome and survey emails:

1. Create HTML templates for each drip email
2. Add a "Read Template" node to load the HTML template
3. Add a Function node to replace placeholders with dynamic content
4. Update the email nodes to use the HTML content

## Workflow IDs

- BLKOUT NXT Ally Drip Campaign: W11CYyvc0tvEnp6b
- BLKOUT NXT Black Queer Men Drip Campaign: h0DO1MrAx0HJQuhe
- BLKOUT NXT QTIPOC Organiser Drip Campaign: GnKiyiQqaqdB6mP2
- BLKOUT NXT Organisation Drip Campaign: AcsMaOlCZEOdyBAh

## Next Steps

1. **Update Resource Links**: Replace placeholder links with actual resources
2. **Create HTML Templates**: Develop branded HTML templates for drip emails
3. **Test the Campaigns**: Add test members to each segment and verify the drip sequence
4. **Gather Feedback**: Collect feedback from members about the resources
5. **Refine Content**: Continuously improve the content based on feedback

## Support

If you encounter any issues or need assistance with the drip campaigns, please contact the development team.
