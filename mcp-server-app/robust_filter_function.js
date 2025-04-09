// Robust function to handle different data structures
// This can be copied into your n8n Function node

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

// Now filter the members safely
const newMembers = members.filter(member => {
  // Skip items that aren't objects or don't have expected properties
  if (!member || typeof member !== 'object') {
    console.log("Skipping non-object member:", member);
    return false;
  }
  
  // Get status, handling both direct properties and nested json properties
  let status = '';
  if (member.OnboardingStatus) {
    status = member.OnboardingStatus;
  } else if (member.json && member.json.OnboardingStatus) {
    status = member.json.OnboardingStatus;
  }
  
  return status === '' || status === 'New';
});

console.log(`Found ${newMembers.length} new members to onboard for BLKOUT NXT`);

// Map the filtered members to the expected output format
return newMembers.map(member => {
  // Handle both direct properties and nested json properties
  const getMemberProp = (propName, defaultValue = '') => {
    if (member[propName] !== undefined) return member[propName];
    if (member.json && member.json[propName] !== undefined) return member.json[propName];
    return defaultValue;
  };
  
  // Get role and determine segment
  const role = (getMemberProp('Role', '')).toString().trim().toLowerCase();
  let segment = 'Other';
  
  if (role.includes('ally')) {
    segment = 'Ally';
  } else if (role.includes('black queer man')) {
    segment = 'BlackQueerMan';
  } else if (role.includes('qtipoc organiser')) {
    segment = 'QTIPOCOrganiser';
  } else if (role.includes('organisation')) {
    segment = 'Organisation';
  }
  
  // Return the properly formatted output
  return {
    json: {
      ...member,
      Email: getMemberProp('Email'),
      FirstName: getMemberProp('FirstName'),
      LastName: getMemberProp('LastName'),
      Role: getMemberProp('Role'),
      Organisation: getMemberProp('Organisation'),
      JoinDate: getMemberProp('JoinDate', new Date().toISOString().split('T')[0]),
      OnboardingStatus: getMemberProp('OnboardingStatus'),
      LastEmailSent: getMemberProp('LastEmailSent'),
      EmailHistory: getMemberProp('EmailHistory'),
      Notes: getMemberProp('Notes'),
      firstName: getMemberProp('FirstName', 'Community Member'),
      segment: segment,
      campaign: 'BLKOUT NXT'
    }
  };
});
