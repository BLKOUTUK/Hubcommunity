// This function will be used in the n8n workflow to generate HTML emails for different segments

// Load the HTML template
const welcomeTemplate = $node["Read Welcome Template"].json.data;

// Get member data
const firstName = $input.item.json.firstName || "Community Member";
const segment = $input.item.json.segment || "Other";

// Set segment-specific content
let segmentName = "";
let customWelcomeMessage = "";
let resourcesList = "";
let segmentColor = "#000000"; // Default black

switch(segment) {
  case "Ally":
    segmentName = "Ally";
    segmentColor = "#4A90E2"; // Blue
    customWelcomeMessage = "Thank you for joining BLKOUT NXT as an Ally! We're excited to have your support in our community.";
    resourcesList = `
      <li>Educational resources about supporting Black Queer communities</li>
      <li>Opportunities to participate in allyship workshops</li>
      <li>Ways to support our initiatives and events</li>
    `;
    break;
    
  case "BlackQueerMan":
    segmentName = "Black Queer Man";
    segmentColor = "#9B59B6"; // Purple
    customWelcomeMessage = "Welcome to BLKOUT NXT! We're thrilled to have you join our community of Black Queer Men.";
    resourcesList = `
      <li>Community events and meetups specifically for Black Queer Men</li>
      <li>Support networks and resources</li>
      <li>Opportunities to connect with others in the community</li>
    `;
    break;
    
  case "QTIPOCOrganiser":
    segmentName = "QTIPOC Organiser";
    segmentColor = "#E74C3C"; // Red
    customWelcomeMessage = "Welcome to BLKOUT NXT! We're excited to have you join our network of QTIPOC Organisers.";
    resourcesList = `
      <li>Organiser resources and toolkits</li>
      <li>Networking opportunities with other QTIPOC organisers</li>
      <li>Collaborative event planning possibilities</li>
      <li>Support for your community initiatives</li>
    `;
    break;
    
  case "Organisation":
    segmentName = "Organisation";
    segmentColor = "#2ECC71"; // Green
    customWelcomeMessage = `Thank you for registering ${$input.item.json.Organisation || 'your organisation'} with BLKOUT NXT! We're excited to explore partnership opportunities together.`;
    resourcesList = `
      <li>Collaboration opportunities on events and initiatives</li>
      <li>Resources for supporting Black Queer communities</li>
      <li>Network connections with other aligned organisations</li>
    `;
    break;
    
  default:
    segmentName = "Community Member";
    customWelcomeMessage = "Welcome to BLKOUT NXT! We're thrilled to have you join our community.";
    resourcesList = `
      <li>Community events and workshops</li>
      <li>Networking opportunities</li>
      <li>Resources and support</li>
    `;
}

// Replace placeholders in the template
let htmlEmail = welcomeTemplate
  .replace(/{{firstName}}/g, firstName)
  .replace(/{{segmentName}}/g, segmentName)
  .replace(/{{customWelcomeMessage}}/g, customWelcomeMessage)
  .replace(/{{resourcesList}}/g, resourcesList);
  
// Update the segment color in CSS
htmlEmail = htmlEmail.replace(/#000000;\/\* segment-color \*\//g, segmentColor + ';/* segment-color */');

// Return the HTML email and other data
return {
  json: {
    ...$input.item.json,
    htmlEmail: htmlEmail,
    emailSubject: `Welcome to BLKOUT NXT - ${segmentName} Community`
  }
};
