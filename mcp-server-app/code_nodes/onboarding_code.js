// Code node for BLKOUT NXT Onboarding workflow
// Replaces the "Filter & Segment Members" Function node

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

// Filter for new members
const newMembers = members.filter(member => {
  if (!member || typeof member !== 'object') return false;
  const status = member.OnboardingStatus || '';
  return status === '' || status === 'New';
});

console.log(`Found ${newMembers.length} new members to onboard`);

// Process and return the new members
return newMembers.map(member => {
  // Determine segment based on Role
  let segment = 'Other';
  const role = (member.Role || '').toString().trim().toLowerCase();
  
  if (role.includes('ally')) {
    segment = 'Ally';
  } else if (role.includes('black queer man')) {
    segment = 'BlackQueerMan';
  } else if (role.includes('qtipoc organiser')) {
    segment = 'QTIPOCOrganiser';
  } else if (role.includes('organisation')) {
    segment = 'Organisation';
  }
  
  return {
    json: {
      ...member,
      firstName: member.FirstName || 'Community Member',
      joinDate: member.JoinDate || new Date().toISOString().split('T')[0],
      segment: segment,
      campaign: 'BLKOUT NXT'
    }
  };
});
