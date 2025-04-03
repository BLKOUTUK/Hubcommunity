# BLKOUT UK Events Calendar Integration Guide

This document provides detailed instructions for integrating the BLKOUT UK Events Calendar with various platforms.

## Ghost CMS Integration

### Embedding the Full Events Calendar

To embed the complete events calendar in a Ghost page:

1. Create a new page in Ghost
2. Add an HTML card with the following content:

```html
<div id="blkout-events-root"></div>
<script src="https://events.blkoutuk.com/events-embed.js"></script>
```

3. Publish the page

### Embedding Featured Events in Blog Posts

To embed just the featured events in a Ghost blog post:

1. Add an HTML card to your blog post
2. Add the following content:

```html
<div id="blkout-featured-events"></div>
<script src="https://events.blkoutuk.com/featured-events-embed.js"></script>
```

### Customization Options

You can customize the embedded calendar with data attributes:

```html
<div 
  id="blkout-events-root"
  data-view="list"           <!-- 'list' or 'calendar' -->
  data-limit="10"            <!-- Number of events to display -->
  data-blkout-only="true"    <!-- Show only BLKOUT events -->
  data-category="social"     <!-- Filter by category -->
  data-upcoming="true"       <!-- Show only upcoming events -->
></div>
<script src="https://events.blkoutuk.com/events-embed.js"></script>
```

### Styling

The embedded calendar inherits styles from your Ghost theme, but you can add custom CSS in Ghost's Code Injection settings or in a Custom HTML card.

## Heartbeat.chat Integration

### Embedding the Events Calendar

To embed the events calendar in a Heartbeat.chat page:

1. Add an HTML block to your Heartbeat.chat page
2. Add the following content:

```html
<div id="blkout-events-heartbeat"></div>
<script src="https://events.blkoutuk.com/heartbeat-embed.js"></script>
```

### Customization Options

You can customize the Heartbeat.chat embed with data attributes:

```html
<div 
  id="blkout-events-heartbeat"
  data-view="list"           <!-- 'list' or 'calendar' -->
  data-limit="6"             <!-- Number of events to display -->
  data-blkout-only="true"    <!-- Show only BLKOUT events -->
  data-category="social"     <!-- Filter by category -->
  data-upcoming="true"       <!-- Show only upcoming events -->
></div>
<script src="https://events.blkoutuk.com/heartbeat-embed.js"></script>
```

### Styling in Heartbeat.chat

The embedded calendar is designed to work with Heartbeat.chat's default styling. If you need to customize the appearance, you can add custom CSS in Heartbeat.chat's HTML block.

## WordPress Integration

### Embedding the Events Calendar

To embed the events calendar in a WordPress page:

1. Create a new page in WordPress
2. Switch to the HTML/Text editor
3. Add the following code:

```html
<div id="blkout-events-root"></div>
<script src="https://events.blkoutuk.com/events-embed.js"></script>
```

### Using the WordPress Shortcode

If you've installed the BLKOUT Events WordPress plugin, you can use the shortcode:

```
[blkout_events view="list" limit="10" blkout_only="true" category="social" upcoming="true"]
```

## API Integration

If you want to integrate the events calendar with a custom application, you can use the API directly.

### Fetching Events

```javascript
async function fetchEvents() {
  const response = await fetch('https://events.blkoutuk.com/api/events?upcoming=true&limit=10');
  const data = await response.json();
  return data.events;
}
```

### Displaying Events

```javascript
async function displayEvents() {
  const events = await fetchEvents();
  const container = document.getElementById('events-container');
  
  events.forEach(event => {
    const eventElement = document.createElement('div');
    eventElement.className = 'event-card';
    eventElement.innerHTML = `
      <h3>${event.title}</h3>
      <p>${new Date(event.startDate).toLocaleDateString()}</p>
      <p>${event.locationName || 'Online'}</p>
    `;
    container.appendChild(eventElement);
  });
}
```

For more details on the API, see the [API Documentation](./API.md).

## Email Newsletter Integration

### Generating Event Newsletter Content

You can use the API to generate content for email newsletters:

1. Fetch upcoming events using the API
2. Format the events into your email template
3. Send the newsletter using your preferred email service

### n8n Workflow for Newsletters

We provide an n8n workflow for automatically generating and sending event newsletters. See the [n8n Integration Guide](./n8n/README.md) for details.

## Troubleshooting

### Common Issues

1. **Script Not Loading**: Ensure the embed script URL is correct and accessible.

2. **CORS Errors**: If you see CORS errors in the console, contact us to add your domain to the allowed origins.

3. **Styling Conflicts**: If the embedded calendar looks incorrect, there might be styling conflicts with your site. Try adding custom CSS to override conflicting styles.

4. **Empty Calendar**: If no events appear, check that there are approved events in the system and that your filter parameters aren't too restrictive.

### Getting Help

If you encounter issues with integration, please contact us at support@blkoutuk.com or open an issue on our GitHub repository.