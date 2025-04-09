// This function will be used in the n8n workflow to generate HTML drip campaign emails

// Load the HTML template
const dripTemplate = $node["Read Drip Template"].json.data;

// Get member data
const firstName = $input.item.json.firstName || "Community Member";
const dripStage = $input.item.json.dripStage || 0;

// Set drip-specific content
let dripIntroMessage = "";
let dripClosingMessage = "";
let resource1Title = "";
let resource1Description = "";
let resource1Link = "";
let resource2Title = "";
let resource2Description = "";
let resource2Link = "";
let resource3Title = "";
let resource3Description = "";
let resource3Link = "";
let emailSubject = "";

switch(dripStage) {
  case 0:
    emailSubject = "BLKOUT NXT - Organiser Resources: Getting Started";
    dripIntroMessage = "Thank you for being part of the BLKOUT NXT community as a QTIPOC Organiser! As promised, we're sharing a series of resources to support your work. This first email focuses on getting started with community organizing.";
    dripClosingMessage = "We'll send you more specialized resources over the coming weeks. If you have specific questions or needs, feel free to reply to this email.";
    
    resource1Title = "Community Organizing Basics";
    resource1Description = "A comprehensive guide to the fundamentals of community organizing, including key principles and strategies.";
    resource1Link = "https://example.com/organizing-basics";
    
    resource2Title = "Event Planning Checklist";
    resource2Description = "A step-by-step checklist to help you plan and execute successful community events.";
    resource2Link = "https://example.com/event-checklist";
    
    resource3Title = "Inclusive Space Guidelines";
    resource3Description = "Best practices for creating and maintaining inclusive spaces for QTIPOC communities.";
    resource3Link = "https://example.com/inclusive-spaces";
    break;
    
  case 1:
    emailSubject = "BLKOUT NXT - Organiser Resources: Funding Your Events";
    dripIntroMessage = "We hope you found our first set of resources helpful! This week, we're focusing on funding strategies for your events and initiatives.";
    dripClosingMessage = "Remember, the BLKOUT NXT community is here to support you. If you have questions about funding or want to connect with other organisers, just reply to this email.";
    
    resource1Title = "Grant Opportunities for QTIPOC Organisers";
    resource1Description = "A curated list of grants and funding opportunities specifically for QTIPOC-led initiatives.";
    resource1Link = "https://example.com/grants";
    
    resource2Title = "Crowdfunding Best Practices";
    resource2Description = "Tips and strategies for successful crowdfunding campaigns for community events.";
    resource2Link = "https://example.com/crowdfunding";
    
    resource3Title = "Budget Templates";
    resource3Description = "Downloadable budget templates to help you plan and track expenses for your events.";
    resource3Link = "https://example.com/budget-templates";
    break;
    
  case 2:
    emailSubject = "BLKOUT NXT - Organiser Resources: Building Your Community";
    dripIntroMessage = "We're back with more resources for QTIPOC Organisers! This week's focus is on building and growing your community.";
    dripClosingMessage = "We'd love to hear how your organizing work is going! Feel free to share your experiences or ask questions by replying to this email.";
    
    resource1Title = "Community Engagement Strategies";
    resource1Description = "Effective approaches to engage and grow your community, with a focus on QTIPOC spaces.";
    resource1Link = "https://example.com/engagement";
    
    resource2Title = "Digital Outreach Tools";
    resource2Description = "A guide to digital tools and platforms that can help you reach and connect with your community.";
    resource2Link = "https://example.com/digital-tools";
    
    resource3Title = "Creating Sustainable Community Structures";
    resource3Description = "Frameworks for building community structures that can thrive and grow over time.";
    resource3Link = "https://example.com/sustainability";
    break;
    
  case 3:
    emailSubject = "BLKOUT NXT - Organiser Resources: Self-Care for Organisers";
    dripIntroMessage = "This week, we're focusing on an essential but often overlooked aspect of community organizing: self-care.";
    dripClosingMessage = "Remember that taking care of yourself is not selfish—it's necessary for sustainable organizing. We value your wellbeing as much as your contributions to the community.";
    
    resource1Title = "Burnout Prevention for Activists";
    resource1Description = "Strategies to recognize and prevent burnout in community organizing work.";
    resource1Link = "https://example.com/burnout-prevention";
    
    resource2Title = "Setting Boundaries in Community Work";
    resource2Description = "Practical guidance on setting and maintaining healthy boundaries as a community organiser.";
    resource2Link = "https://example.com/boundaries";
    
    resource3Title = "Collective Care Practices";
    resource3Description = "Approaches to care that extend beyond self-care to support the wellbeing of the entire community.";
    resource3Link = "https://example.com/collective-care";
    break;
    
  case 4:
    emailSubject = "BLKOUT NXT - Organiser Resources: Collaboration Opportunities";
    dripIntroMessage = "This is the final email in our QTIPOC Organiser resource series. We're focusing on collaboration opportunities within the BLKOUT NXT network.";
    dripClosingMessage = "We hope these resources have been helpful! You're now part of our organiser network, and we'll reach out periodically with specific opportunities and updates. If you'd like to connect with other organisers or have ideas for the community, please reply to this email.";
    
    resource1Title = "BLKOUT NXT Organiser Directory";
    resource1Description = "Connect with other QTIPOC organisers in the BLKOUT NXT network for potential collaborations.";
    resource1Link = "https://example.com/organiser-directory";
    
    resource2Title = "Upcoming Collaboration Events";
    resource2Description = "A calendar of upcoming events and opportunities for QTIPOC organisers to connect and collaborate.";
    resource2Link = "https://example.com/collab-events";
    
    resource3Title = "Partnership Request Form";
    resource3Description = "Submit a request for partnership or collaboration with BLKOUT NXT for your community initiatives.";
    resource3Link = "https://example.com/partnership-form";
    break;
    
  default:
    emailSubject = "BLKOUT NXT - Organiser Resources";
    dripIntroMessage = "Thank you for being part of the BLKOUT NXT community as a QTIPOC Organiser! We're sharing some resources to support your work.";
    dripClosingMessage = "If you have specific questions or needs, feel free to reply to this email.";
    
    resource1Title = "Resource 1";
    resource1Description = "Description of resource 1";
    resource1Link = "https://example.com/resource1";
    
    resource2Title = "Resource 2";
    resource2Description = "Description of resource 2";
    resource2Link = "https://example.com/resource2";
    
    resource3Title = "Resource 3";
    resource3Description = "Description of resource 3";
    resource3Link = "https://example.com/resource3";
}

// Replace placeholders in the template
let htmlEmail = dripTemplate
  .replace(/{{firstName}}/g, firstName)
  .replace(/{{dripIntroMessage}}/g, dripIntroMessage)
  .replace(/{{dripClosingMessage}}/g, dripClosingMessage)
  .replace(/{{resource1Title}}/g, resource1Title)
  .replace(/{{resource1Description}}/g, resource1Description)
  .replace(/{{resource1Link}}/g, resource1Link)
  .replace(/{{resource2Title}}/g, resource2Title)
  .replace(/{{resource2Description}}/g, resource2Description)
  .replace(/{{resource2Link}}/g, resource2Link)
  .replace(/{{resource3Title}}/g, resource3Title)
  .replace(/{{resource3Description}}/g, resource3Description)
  .replace(/{{resource3Link}}/g, resource3Link);

// Return the HTML email and other data
return {
  json: {
    ...$input.item.json,
    htmlEmail: htmlEmail,
    emailSubject: emailSubject
  }
};
