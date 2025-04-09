// Updated Filter for Drip Eligibility function for BLKOUT NXT Drip Campaign workflows

// Get input data and handle different possible structures
let inputData = $input.all();
console.log("Input data type:", typeof inputData);
console.log("Input data is array:", Array.isArray(inputData));
console.log("Input data length:", inputData ? inputData.length : 0);

// Try to extract members data, handling different possible structures
let members = [];

// Case 1: Direct array of members
if (Array.isArray(inputData)) {
  if (inputData.length > 0 && inputData[0].json) {
    // Case 2: Array inside first item's json property (common n8n structure)
    if (Array.isArray(inputData[0].json)) {
      members = inputData[0].json;
    } 
    // Case 3: Single object in json property
    else if (typeof inputData[0].json === 'object' && inputData[0].json !== null) {
      members = [inputData[0].json];
    }
  } else {
    // Case 4: Array of objects directly
    members = inputData;
  }
}

console.log("Extracted members type:", typeof members);
console.log("Is members array:", Array.isArray(members));
console.log("Members length:", members.length);

// If we still don't have an array, create an empty one to avoid errors
if (!Array.isArray(members)) {
  console.log("WARNING: Could not extract members as array, using empty array");
  members = [];
}

// Helper function to get property safely
const getMemberProp = (member, propName, defaultValue = '') => {
  if (member[propName] !== undefined) return member[propName];
  if (member.json && member.json[propName] !== undefined) return member.json[propName];
  return defaultValue;
};

// Get current date for comparison
const today = new Date().toISOString().split('T')[0];

// Filter for members in the drip campaign who are due for next email
// This example is for the Ally drip campaign - modify for other segments as needed
const eligibleMembers = members.filter(member => {
  // Skip items that aren't objects
  if (!member || typeof member !== 'object') {
    console.log("Skipping non-object member");
    return false;
  }
  
  // Check if they're an Ally (or appropriate segment for other drip campaigns)
  const role = (getMemberProp(member, 'Role', '')).toString().toLowerCase();
  const isTargetSegment = role.includes('ally'); // Change this for other segments
  
  // Check if they've completed the survey
  const status = getMemberProp(member, 'OnboardingStatus', '');
  const hasCompletedSurvey = status.includes('Survey Completed');
  
  // Check if they're in the drip campaign
  const notes = getMemberProp(member, 'Notes', '');
  const inDripCampaign = notes.includes('DripCampaign: Ally'); // Change for other segments
  
  // Extract drip stage
  let dripStage = -1;
  if (inDripCampaign) {
    const stageMatch = notes.match(/DripStage:\\s*(\\d+)/);
    if (stageMatch && stageMatch[1]) {
      dripStage = parseInt(stageMatch[1], 10);
    }
  }
  
  // Extract next drip date
  let nextDripDate = null;
  if (inDripCampaign) {
    const dateMatch = notes.match(/NextDripDate:\\s*(\\d{4}-\\d{2}-\\d{2})/);
    if (dateMatch && dateMatch[1]) {
      nextDripDate = dateMatch[1];
    }
  }
  
  // Check if today is on or after the next drip date
  const isDue = nextDripDate && today >= nextDripDate;
  
  // If they're not in the drip campaign yet but have completed the survey, add them
  if (isTargetSegment && hasCompletedSurvey && !inDripCampaign) {
    return true;
  }
  
  // If they're in the drip campaign and due for next email, include them
  return isTargetSegment && inDripCampaign && isDue && dripStage >= 0 && dripStage < 5; // We have 5 emails in the drip campaign
});

console.log(`Found ${eligibleMembers.length} members due for drip emails`);

// Process each eligible member
return eligibleMembers.map(member => {
  // Extract current drip stage
  const notes = getMemberProp(member, 'Notes', '');
  let dripStage = 0;
  const inDripCampaign = notes.includes('DripCampaign: Ally'); // Change for other segments
  
  if (inDripCampaign) {
    const stageMatch = notes.match(/DripStage:\\s*(\\d+)/);
    if (stageMatch && stageMatch[1]) {
      dripStage = parseInt(stageMatch[1], 10);
    }
  }
  
  return {
    json: {
      ...member,
      Email: getMemberProp(member, 'Email'),
      FirstName: getMemberProp(member, 'FirstName'),
      LastName: getMemberProp(member, 'LastName'),
      Role: getMemberProp(member, 'Role'),
      Organisation: getMemberProp(member, 'Organisation'),
      JoinDate: getMemberProp(member, 'JoinDate'),
      OnboardingStatus: getMemberProp(member, 'OnboardingStatus'),
      LastEmailSent: getMemberProp(member, 'LastEmailSent'),
      EmailHistory: getMemberProp(member, 'EmailHistory'),
      Notes: getMemberProp(member, 'Notes'),
      firstName: getMemberProp(member, 'FirstName', 'Community Member'),
      dripStage: dripStage,
      nextDripStage: dripStage + 1,
      nextDripDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      dripCampaign: 'Ally' // Change for other segments
    }
  };
});
