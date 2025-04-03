# Lowdown-Events
Compilation engine for twice weekly updated events calendar for UK Black Queer Life
>>>>>>> c55de12ac8d16184cbb67d4b3cbed9a4f0fd2207

-------
# BLKOUT UK Events Calendar

A comprehensive events calendar system for BLKOUT UK, designed to display events of interest to the UK Black LGBT+ community and allies.

## Features

- Display BLKOUT UK's own events
- Showcase community events from external sources
- Filter events by category, date, location, and more
- Calendar and list views
- Integration with Ghost CMS and Heartbeat.chat
- Automated event scraping from platforms like Eventbrite
- Admin approval workflow for community-submitted events

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm (v7 or later)
- Supabase account (for database) or Airtable account

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/blkout-events-calendar.git
cd blkout-events-calendar

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Building for Production

```bash
# Build the application
npm run build

# Preview the built application
npm run preview
```

## Project Structure

```
├── api/                # API endpoints
├── components/         # React components
├── database/           # Database schema and client
├── docs/               # Documentation
│   └── n8n/            # n8n workflow documentation
├── public/             # Static assets
├── scripts/            # Utility scripts
├── src/                # Source code
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   └── types/          # TypeScript type definitions
├── .env.example        # Example environment variables
├── package.json        # Project dependencies
└── README.md           # Project documentation
```

## API Endpoints

The application provides the following API endpoints:

- `GET /api/events` - Fetch all events with optional filtering
- `POST /api/events` - Create a new event
- `GET /api/events/[id]` - Fetch a specific event by ID
- `PUT /api/events/[id]` - Update a specific event
- `DELETE /api/events/[id]` - Delete a specific event
- `POST /api/events/[id]/approve` - Approve a pending event
- `POST /api/events/[id]/reject` - Reject a pending event

For detailed API documentation, see [API.md](./docs/API.md).

## Integration Options

### Ghost CMS Integration

To embed the events calendar in a Ghost page:

```html
<div id="blkout-events-root"></div>
<script src="https://events.blkoutuk.com/events-embed.js"></script>
```

### Heartbeat.chat Integration

To embed the events calendar in a Heartbeat.chat page:

```html
<div id="blkout-events-heartbeat"></div>
<script src="https://events.blkoutuk.com/heartbeat-embed.js"></script>
```

For more details on integrations, see [INTEGRATIONS.md](./docs/INTEGRATIONS.md).

## Event Scraping

The system includes n8n workflows for scraping events from external sources:

1. Eventbrite Scraper
2. Outsavvy Scraper
3. Organization Sites Scraper

For detailed implementation instructions, see the [n8n Integration Guide](./docs/n8n/README.md).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
=======
# Lowdown-Events
Compilation engine for twice weekly updated events calendar for UK Black Queer Life
>>>>>>> c55de12ac8d16184cbb67d4b3cbed9a4f0fd2207
