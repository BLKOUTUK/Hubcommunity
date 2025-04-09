// This function will be used in the n8n workflow to generate HTML survey emails for different segments

// Load the HTML template
const surveyTemplate = $node["Read Survey Template"].json.data;

// Get member data
const firstName = $input.item.json.firstName || "Community Member";
const segment = $input.item.json.segment || "Other";

// Set segment-specific content
let surveyTitle = "";
let surveyLink = "";
let customSurveyMessage = "";

switch(segment) {
  case "Ally":
    surveyTitle = "BLKOUT NXT Ally Survey";
    surveyLink = "https://forms.gle/YLUvorjyU5FjXb7F6";
    customSurveyMessage = "As an ally to the BLKOUT NXT community, your perspective is valuable in helping us create meaningful engagement opportunities.";
    break;
    
  case "BlackQueerMan":
    surveyTitle = "BLKOUT NXT Community Survey";
    surveyLink = "https://forms.gle/9cg8G2oZi5V3HBHU6";
    customSurveyMessage = "Your input will help shape our community events and resources specifically for Black Queer Men.";
    break;
    
  case "QTIPOCOrganiser":
    surveyTitle = "BLKOUT NXT Organiser Survey";
    surveyLink = "https://forms.gle/t1GNMj7ZPV14eYhU9";
    customSurveyMessage = "As a QTIPOC Organiser, your insights will help us develop resources and support systems that empower your community work. In the coming weeks, you'll also receive a series of emails with valuable resources for QTIPOC organisers.";
    break;
    
  case "Organisation":
    surveyTitle = "BLKOUT NXT Organisation Partnership Survey";
    surveyLink = "https://forms.gle/o3J4a3yhqfuSc6L58";
    customSurveyMessage = `We're excited to learn more about ${$input.item.json.Organisation || 'your organisation'} and explore potential collaboration opportunities that align with both our missions.`;
    break;
    
  default:
    surveyTitle = "BLKOUT NXT Community Survey";
    surveyLink = "https://forms.gle/9cg8G2oZi5V3HBHU6";
    customSurveyMessage = "Your feedback will help us create a more inclusive and supportive community for everyone.";
}

// Replace placeholders in the template
let htmlEmail = surveyTemplate
  .replace(/{{firstName}}/g, firstName)
  .replace(/{{surveyTitle}}/g, surveyTitle)
  .replace(/{{surveyLink}}/g, surveyLink)
  .replace(/{{customSurveyMessage}}/g, customSurveyMessage);

// Return the HTML email and other data
return {
  json: {
    ...$input.item.json,
    htmlEmail: htmlEmail,
    emailSubject: `BLKOUT NXT - Your ${segment} Survey`,
    surveyLink: surveyLink
  }
};
