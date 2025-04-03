#!/usr/bin/env node

/**
 * Script to set up required Airtable tables for the BLKOUTNXT community dashboard
 * 
 * This script creates the following tables if they don't exist:
 * - EngagementEvents: For tracking user engagement events
 * - Feedback: For storing user feedback
 * - Surveys: For storing survey definitions
 * - SurveyResponses: For storing survey responses
 * - WebhookEvents: For logging webhook events from Heartbeat
 * 
 * Usage:
 * 1. Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID environment variables
 * 2. Run: node scripts/setup-airtable-tables.js
 */

require('dotenv').config();
const Airtable = require('airtable');

// Check for required environment variables
const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

if (!apiKey || !baseId) {
  console.error('Error: AIRTABLE_API_KEY and AIRTABLE_BASE_ID environment variables are required');
  process.exit(1);
}

// Configure Airtable
Airtable.configure({
  apiKey: apiKey,
});

const base = Airtable.base(baseId);

// Table definitions
const tables = [
  {
    name: 'Engagement Events',
    description: 'Tracks user engagement events from Heartbeat and other sources',
    fields: [
      { name: 'UserId', type: 'singleLineText', description: 'User ID' },
      { name: 'Action', type: 'singleLineText', description: 'Action performed' },
      { name: 'Timestamp', type: 'dateTime', description: 'When the action occurred' },
      { name: 'Metadata', type: 'longText', description: 'Additional data as JSON' },
      { name: 'Synced', type: 'checkbox', description: 'Whether this event has been synced with Heartbeat' }
    ]
  },
  {
    name: 'Member Feedback',
    description: 'Stores user feedback submissions',
    fields: [
      { name: 'UserId', type: 'singleLineText', description: 'User ID' },
      { name: 'UserName', type: 'singleLineText', description: 'User name' },
      { name: 'Type', type: 'singleSelect', description: 'Feedback type', options: ['general', 'feature', 'bug', 'content', 'event', 'survey'] },
      { name: 'Rating', type: 'number', description: 'Rating (1-5)' },
      { name: 'Text', type: 'longText', description: 'Feedback text' },
      { name: 'Metadata', type: 'longText', description: 'Additional data as JSON' },
      { name: 'Timestamp', type: 'dateTime', description: 'When the feedback was submitted' },
      { name: 'Synced', type: 'checkbox', description: 'Whether this feedback has been synced with Heartbeat' }
    ]
  },
  {
    name: 'Community Surveys',
    description: 'Stores survey definitions',
    fields: [
      { name: 'Title', type: 'singleLineText', description: 'Survey title' },
      { name: 'Description', type: 'longText', description: 'Survey description' },
      { name: 'Questions', type: 'longText', description: 'Survey questions as JSON' },
      { name: 'IsActive', type: 'checkbox', description: 'Whether the survey is active' },
      { name: 'StartDate', type: 'dateTime', description: 'When the survey starts' },
      { name: 'EndDate', type: 'dateTime', description: 'When the survey ends' },
      { name: 'TargetAudience', type: 'singleLineText', description: 'Target audience filter' }
    ]
  },
  {
    name: 'Survey Responses',
    description: 'Stores survey responses',
    fields: [
      { name: 'SurveyId', type: 'singleLineText', description: 'Survey ID' },
      { name: 'UserId', type: 'singleLineText', description: 'User ID' },
      { name: 'UserName', type: 'singleLineText', description: 'User name' },
      { name: 'Answers', type: 'longText', description: 'Survey answers as JSON' },
      { name: 'Timestamp', type: 'dateTime', description: 'When the response was submitted' },
      { name: 'Synced', type: 'checkbox', description: 'Whether this response has been synced with Heartbeat' }
    ]
  },
  {
    name: 'Webhook Events',
    description: 'Logs webhook events from Heartbeat',
    fields: [
      { name: 'Action', type: 'singleLineText', description: 'Webhook action type' },
      { name: 'Payload', type: 'longText', description: 'Webhook payload as JSON' },
      { name: 'Processed', type: 'checkbox', description: 'Whether this event has been processed' },
      { name: 'Timestamp', type: 'dateTime', description: 'When the event was received' }
    ]
  }
];

/**
 * Create a table if it doesn't exist
 */
async function createTableIfNotExists(tableDefinition) {
  try {
    console.log(`Checking if table ${tableDefinition.name} exists...`);
    
    // Try to get the table schema to check if it exists
    try {
      await base(tableDefinition.name).select({ maxRecords: 1 }).firstPage();
      console.log(`Table ${tableDefinition.name} already exists.`);
      return;
    } catch (error) {
      // If the table doesn't exist, we'll get an error
      if (error.statusCode !== 404) {
        throw error;
      }
      console.log(`Table ${tableDefinition.name} does not exist. Creating...`);
    }
    
    // In a real implementation, we would use the Airtable API to create the table
    // However, the Airtable JavaScript SDK doesn't support creating tables
    // So we'll just print instructions for manual creation
    
    console.log(`\nTo create the ${tableDefinition.name} table:`);
    console.log(`1. Go to https://airtable.com/${baseId}`);
    console.log(`2. Click "Add a table"`);
    console.log(`3. Enter "${tableDefinition.name}" as the table name`);
    console.log(`4. Add the following fields:`);
    
    tableDefinition.fields.forEach(field => {
      console.log(`   - ${field.name} (${field.type}): ${field.description}`);
      if (field.type === 'singleSelect' && field.options) {
        console.log(`     Options: ${field.options.join(', ')}`);
      }
    });
    
    console.log('');
  } catch (error) {
    console.error(`Error checking/creating table ${tableDefinition.name}:`, error);
  }
}

/**
 * Main function to create all tables
 */
async function main() {
  console.log('Setting up Airtable tables for BLKOUTNXT community dashboard...\n');
  
  for (const tableDefinition of tables) {
    await createTableIfNotExists(tableDefinition);
  }
  
  console.log('\nSetup complete. Please create any missing tables manually as instructed above.');
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});