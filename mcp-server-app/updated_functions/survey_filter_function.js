// Updated Filter for Survey Eligibility function for BLKOUT NXT Survey Follow-up workflow

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

// Filter for members who need survey emails or reminders
const now = new Date();

// Two types of members we're looking for:
// 1. Those who received welcome email 6+ hours ago but haven't received survey email
// 2. Those who received survey email 3+ days ago but haven't completed survey

const eligibleMembers = members.filter(member => {
  // Skip items that aren't objects
  if (!member || typeof member !== 'object') {
    console.log("Skipping non-object member");
    return false;
  }
  
  const email = getMemberProp(member, 'Email', '');
  const status = getMemberProp(member, 'OnboardingStatus', '');
  const emailHistory = getMemberProp(member, 'EmailHistory', '');
  const lastEmailDate = getMemberProp(member, 'LastEmailSent', '');
  
  // Skip if no email or last email date
  if (!email || !lastEmailDate) return false;
  
  // Parse the last email date
  const lastEmailTime = new Date(lastEmailDate).getTime();
  const currentTime = now.getTime();
  
  // Calculate hours since last email
  const hoursSinceLastEmail = Math.floor((currentTime - lastEmailTime) / (1000 * 60 * 60));
  
  // Calculate days since last email
  const daysSinceLastEmail = Math.floor(hoursSinceLastEmail / 24);
  
  // Case 1: Received welcome email 6+ hours ago but not survey email
  const receivedWelcome = status === 'Welcome Sent' || emailHistory.includes('Welcome');
  const receivedSurvey = emailHistory.includes('Survey');
  const readyForSurvey = receivedWelcome && !receivedSurvey && hoursSinceLastEmail >= 6;
  
  // Case 2: Received survey email 3+ days ago but no survey completion
  const surveyNotCompleted = status === 'Survey Sent' && !status.includes('Completed');
  const needsReminder = surveyNotCompleted && daysSinceLastEmail >= 3 && !emailHistory.includes('Reminder');
  
  return readyForSurvey || needsReminder;
});

console.log(`Found ${eligibleMembers.length} members for survey emails or reminders`);

// Determine segment and email type for each eligible member
return eligibleMembers.map(member => {
  // Extract segment from Notes field or determine from Role
  let segment = '';
  
  // First try to get segment from Notes field
  const notes = getMemberProp(member, 'Notes', '');
  if (notes.includes('Segment:')) {
    const segmentMatch = notes.match(/Segment:\\s*(\\w+)/);
    if (segmentMatch && segmentMatch[1]) {
      segment = segmentMatch[1];
    }
  }
  
  // If segment not found in Notes, determine from Role
  if (!segment) {
    const role = (getMemberProp(member, 'Role', '')).toString().trim().toLowerCase();
    
    if (role.includes('ally')) {
      segment = 'Ally';
    } else if (role.includes('black queer man')) {
      segment = 'BlackQueerMan';
    } else if (role.includes('qtipoc organiser')) {
      segment = 'QTIPOCOrganiser';
    } else if (role.includes('organisation')) {
      segment = 'Organisation';
    } else {
      segment = 'Other';
    }
  }
  
  // Determine if this is a reminder
  const emailHistory = getMemberProp(member, 'EmailHistory', '');
  const isReminder = emailHistory.includes('Survey');
  
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
      segment: segment,
      campaign: 'BLKOUT NXT',
      isReminder: isReminder
    }
  };
});
