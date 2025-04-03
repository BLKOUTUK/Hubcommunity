# Events Database Integration

The events system in the community dashboard implements a multi-layered approach to event data management:

## Database Integration

1. **Airtable as Primary Database**:
   - All events, regardless of their source, are stored in Airtable
   - The `Events` table in Airtable serves as the central repository for event data
   - Each event contains metadata about its source (Eventbrite, manual, Notion, Google)

2. **Data Flow**:
   - External services (like Eventbrite) → Events fetched via API → Stored in Airtable
   - Manual events → Created through UI → Stored in Airtable
   - Event queries (listing, filtering) → Retrieved from Airtable

## Integration Architecture

```
                 ┌─────────────┐
                 │             │
                 │  Eventbrite │
                 │    API      │
                 │             │
                 └──────┬──────┘
                        │
                        ▼
┌───────────────┐    ┌──────────────┐    ┌──────────────┐
│ Manual Events │───▶│              │    │              │
└───────────────┘    │              │    │              │
                     │  Airtable    │◄───┤    Events    │
┌───────────────┐    │  Database    │    │   Service    │
│ Notion Events │───▶│              │    │              │
└───────────────┘    │              │    │              │
                     └──────────────┘    └──────┬───────┘
┌───────────────┐            ▲                  │
│ Google Cal    │            │                  │
│ Events        │────────────┘                  │
└───────────────┘                               │
                                                ▼
                                         ┌─────────────┐
                                         │ React Hooks │
                                         └──────┬──────┘
                                                │
                                                ▼
                                            ┌───────┐
                                            │  UI   │
                                            └───────┘
```

## Database Schema (Airtable)

The Events table in Airtable has the following structure:

| Field Name      | Type    | Description                               |
|-----------------|---------|-------------------------------------------|
| Title           | Text    | Event title                               |
| Description     | Long Text | Event description                       |
| Start_Date      | DateTime | Event start date and time                |
| End_Date        | DateTime | Event end date and time                  |
| Location_Name   | Text    | Name of event location                    |
| Location_Address| Text    | Address of event location                 |
| Location_Type   | Single Select | Type of location (in-person, online, hybrid) |
| Is_Online       | Boolean | Whether the event has online component    |
| Organizer_Name  | Text    | Name of event organizer                   |
| Attendees       | Number  | Number of attendees                       |
| Capacity        | Number  | Maximum capacity                          |
| Category        | Single Select | Event category                      |
| Approval_Status | Single Select | Approval status (pending, approved, rejected) |
| Image_URL       | URL     | URL to event image                        |
| Website_URL     | URL     | URL to event website                      |
| Ticket_URL      | URL     | URL to event ticketing page               |
| Price_Info      | Text    | Information about pricing                 |
| Source          | Single Select | Source of event (eventbrite, manual, etc.) |
| External_ID     | Text    | ID from external source                   |
| Created_At      | DateTime | When the record was created              |
| Updated_At      | DateTime | When the record was last updated         |
| Is_Featured     | Boolean | Whether the event is featured             |

## Integration Benefits

1. **Centralized Storage**: All events, regardless of source, are stored in one place
2. **Unified API**: The events service provides a unified API for interacting with events
3. **Data Persistence**: Events from external sources are persisted locally
4. **Approval Workflow**: Support for approval of externally sourced events
5. **Source Tracking**: Each event maintains its source information
6. **Extensibility**: Easy to add new event sources in the future