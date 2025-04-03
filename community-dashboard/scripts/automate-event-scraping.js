/**
 * Automated Event Scraping
 * 
 * This script sets up scheduled tasks to automatically scrape events from
 * Eventbrite, Outsavvy, and other platforms. It can be run as a cron job
 * or deployed as a serverless function.
 */

const { execSync } = require('child_process');
const path = require('path');
const fetch = require('node-fetch');
const Airtable = require('airtable');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Configure Airtable
const airtableApiKey = process.env.AIRTABLE_API_KEY;
const airtableBaseId = process.env.AIRTABLE_BASE_ID;

if (!airtableApiKey || !airtableBaseId) {
  console.error('Missing Airtable configuration. Check your .env file.');
  process.exit(1);
}

// Configure Outsavvy
const outsavvyApiKey = process.env.OUTSAVVY_API_KEY;
const outsavvyApiEndpoint = process.env.OUTSAVVY_API_ENDPOINT || 'https://api.outsavvy.com/v1';

// Configure n8n webhook (for Eventbrite workflow)
const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

// Configure notification email
const notificationEmail = process.env.NOTIFICATION_EMAIL || 'admin@example.com';

/**
 * Trigger n8n workflow for Eventbrite scraping
 */
async function triggerEventbriteScraping() {
  try {
    console.log('📅 Starting Eventbrite event scraping...');
    
    if (!n8nWebhookUrl) {
      console.warn('⚠️ Missing n8n webhook URL. Skipping Eventbrite scraping.');
      return;
    }
    
    // Trigger the n8n workflow via webhook
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'automated-script',
        timestamp: new Date().toISOString()
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to trigger n8n workflow: ${response.statusText}`);
    }
    
    console.log('✅ Eventbrite scraping triggered successfully');
  } catch (error) {
    console.error('❌ Error triggering Eventbrite scraping:', error.message);
    await sendNotification('Eventbrite Scraping Failed', error.message);
  }
}

/**
 * Fetch events from Outsavvy API
 */
async function fetchOutsavvyEvents() {
  try {
    console.log('📅 Starting Outsavvy event scraping...');
    
    if (!outsavvyApiKey) {
      console.warn('⚠️ Missing Outsavvy API key. Skipping Outsavvy scraping.');
      return [];
    }
    
    // Default query parameters for Black LGBT events
    const params = {
      tags: 'black,lgbt,queer,bipoc,qtipoc',
      limit: '50',
      upcoming: 'true'
    };
    
    // Build query string
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    
    // Fetch data from Outsavvy API
    const response = await fetch(`${outsavvyApiEndpoint}/events?${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${outsavvyApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Outsavvy API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Found ${data.events?.length || 0} events from Outsavvy`);
    
    return data.events || [];
  } catch (error) {
    console.error('❌ Error fetching Outsavvy events:', error.message);
    await sendNotification('Outsavvy Scraping Failed', error.message);
    return [];
  }
}

/**
 * Import Outsavvy events to Airtable
 */
async function importOutsavvyEvents() {
  try {
    // Fetch events from Outsavvy API
    const events = await fetchOutsavvyEvents();
    if (!events.length) return;
    
    // Configure Airtable
    Airtable.configure({
      apiKey: airtableApiKey,
    });
    
    const base = Airtable.base(airtableBaseId);
    
    // Get existing events to avoid duplicates
    const existingRecords = await base('Events')
      .select({
        filterByFormula: "{Source}='outsavvy'",
        fields: ['External_ID']
      })
      .all();
    
    const existingIds = existingRecords.map(record => record.get('External_ID'));
    
    // Filter out events that already exist
    const newEvents = events.filter(event => !existingIds.includes(`outsavvy-${event.id}`));
    
    console.log(`📥 Importing ${newEvents.length} new events to Airtable...`);
    
    // Create records in Airtable
    let successCount = 0;
    
    for (const event of newEvents) {
      // Determine if this might be a BLKOUT event (for manual review)
      const possibleBlkoutEvent = 
        (event.organizer && 
         event.organizer.name && 
         event.organizer.name.toLowerCase().includes('blkout')) || 
        (event.title && 
         event.title.toLowerCase().includes('blkout'));
      
      // Determine location type
      let locationType = 'in-person';
      if (event.is_online) {
        locationType = event.has_venue ? 'hybrid' : 'online';
      }
      
      // Create the Airtable record
      await base('Events').create({
        Title: event.title || '',
        Description: event.description || '',
        Start_Date: event.start_time || '',
        End_Date: event.end_time || '',
        Location_Name: event.venue?.name || 'Online',
        Location_Address: event.venue 
          ? `${event.venue.address || ''}, ${event.venue.city || ''}, ${event.venue.postcode || ''}` 
          : '',
        Location_Type: locationType,
        Is_Online: event.is_online || false,
        Organizer_Name: event.organizer?.name || '',
        Category: event.category || 'uncategorized',
        Approval_Status: 'pending',
        Image_URL: event.image_url || '',
        Website_URL: event.url || '',
        Ticket_URL: event.ticket_url || event.url || '',
        Price_Info: event.ticketing?.lowestPrice 
          ? `${event.ticketing.currency} ${event.ticketing.lowestPrice}` 
          : 'Free',
        Source: 'outsavvy',
        External_ID: `outsavvy-${event.id}`,
        Created_At: new Date().toISOString(),
        Updated_At: new Date().toISOString(),
        Is_BLKOUT_Event: possibleBlkoutEvent
      });
      
      successCount++;
    }
    
    console.log(`✅ Successfully imported ${successCount} Outsavvy events`);
    
    // Send notification with summary
    if (successCount > 0) {
      await sendNotification(
        'Outsavvy Event Import Complete', 
        `Successfully imported ${successCount} new events from Outsavvy.`
      );
    }
  } catch (error) {
    console.error('❌ Error importing Outsavvy events:', error.message);
    await sendNotification('Outsavvy Import Failed', error.message);
  }
}

/**
 * Send email notification
 */
async function sendNotification(subject, message) {
  try {
    // In a real implementation, you would use a service like SendGrid, Mailgun, etc.
    console.log(`📧 Would send notification: ${subject} - ${message}`);
    
    // For this example, we'll just log it
    // In production, uncomment code like this:
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    await sgMail.send({
      to: notificationEmail,
      from: 'notifications@yourdomain.com',
      subject: `Event Scraper: ${subject}`,
      text: message,
      html: `<p>${message}</p>`,
    });
    */
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

/**
 * Run all scraping tasks
 */
async function runAllScrapingTasks() {
  const startTime = new Date();
  console.log(`🚀 Starting automated event scraping at ${startTime.toISOString()}`);
  
  try {
    // Run Eventbrite scraping
    await triggerEventbriteScraping();
    
    // Run Outsavvy scraping and import
    await importOutsavvyEvents();
    
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    console.log(`✅ All scraping tasks completed in ${duration.toFixed(2)} seconds`);
  } catch (error) {
    console.error('❌ Error in scraping process:', error);
    await sendNotification('Event Scraping Failed', error.message);
  }
}

// Run the script if called directly
if (require.main === module) {
  runAllScrapingTasks()
    .catch(error => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}

module.exports = {
  runAllScrapingTasks,
  triggerEventbriteScraping,
  importOutsavvyEvents
};