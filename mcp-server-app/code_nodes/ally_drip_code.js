// Code node for BLKOUT NXT Ally Drip Campaign workflow
// Replaces the "Filter for Drip Eligibility" Function node

// Get input data
const items = $input.all();
console.log(`Received ${items.length} items from Google Sheets`);

// Extract members from the items
let members = [];
if (items.length > 0 && items[0].json) {
  if (Array.isArray(items[0].json)) {
    members = items[0].json;
  } else {
    members = [items[0].json];
  }
}

console.log(`Extracted ${members.length} members`);

// Helper function to get property safely
const getMemberProp = (member, propName, defaultValue = '') => {
  if (member[propName] !== undefined) return member[propName];
  if (member.json && member.json[propName] !== undefined) return member.json[propName];
  return defaultValue;
};

// Get current date for comparison
const today = new Date().toISOString().split('T')[0];

// Filter for Ally members in the drip campaign who are due for next email
const eligibleMembers = members.filter(member => {
  // Skip items that aren't objects
  if (!member || typeof member !== 'object') {
    return false;
  }
  
  // Check if they're an Ally
  const role = (getMemberProp(member, 'Role', '')).toString().toLowerCase();
  const isAlly = role.includes('ally');
  
  // Check if they've completed the survey
  const status = getMemberProp(member, 'OnboardingStatus', '');
  const hasCompletedSurvey = status.includes('Survey Completed');
  
  // Check if they're in the Ally drip campaign
  const notes = getMemberProp(member, 'Notes', '');
  const inDripCampaign = notes.includes('DripCampaign: Ally');
  
  // Extract drip stage
  let dripStage = -1;
  if (inDripCampaign) {
    const stageMatch = notes.match(/DripStage:\s*(\d+)/);
    if (stageMatch && stageMatch[1]) {
      dripStage = parseInt(stageMatch[1], 10);
    }
  }
  
  // Extract next drip date
  let nextDripDate = null;
  if (inDripCampaign) {
    const dateMatch = notes.match(/NextDripDate:\s*(\d{4}-\d{2}-\d{2})/);
    if (dateMatch && dateMatch[1]) {
      nextDripDate = dateMatch[1];
    }
  }
  
  // Check if today is on or after the next drip date
  const isDue = nextDripDate && today >= nextDripDate;
  
  // If they're not in the drip campaign yet but have completed the survey, add them
  if (isAlly && hasCompletedSurvey && !inDripCampaign) {
    return true;
  }
  
  // If they're in the drip campaign and due for next email, include them
  return isAlly && inDripCampaign && isDue && dripStage >= 0 && dripStage < 5; // We have 5 emails in the drip campaign
});

console.log(`Found ${eligibleMembers.length} Ally members due for drip emails`);

// Process each eligible member
return eligibleMembers.map(member => {
  // Extract current drip stage
  const notes = getMemberProp(member, 'Notes', '');
  let dripStage = 0;
  const inDripCampaign = notes.includes('DripCampaign: Ally');
  
  if (inDripCampaign) {
    const stageMatch = notes.match(/DripStage:\s*(\d+)/);
    if (stageMatch && stageMatch[1]) {
      dripStage = parseInt(stageMatch[1], 10);
    }
  }
  
  return {
    json: {
      ...member,
      firstName: getMemberProp(member, 'FirstName', 'Community Member'),
      dripStage: dripStage,
      nextDripStage: dripStage + 1,
      nextDripDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      dripCampaign: 'Ally'
    }
  };
});
