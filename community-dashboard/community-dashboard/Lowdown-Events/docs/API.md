# BLKOUT UK Events Calendar API Documentation

This document provides detailed information about the API endpoints available in the BLKOUT UK Events Calendar system.

## Base URL

All API endpoints are relative to the base URL of your deployment:

```
https://events.blkoutuk.com/api
```

For local development, the base URL is:

```
http://localhost:3000/api
```

## Authentication

Some endpoints require authentication. To authenticate, include an Authorization header with a Bearer token:

```
Authorization: Bearer your-token-here
```

## Endpoints

### Events

#### GET /events

Fetch all events with optional filtering.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by event category ID |
| startDate | string | Filter events starting on or after this date (ISO format) |
| endDate | string | Filter events ending on or before this date (ISO format) |
| location | string | Filter by location (partial match) |
| locationType | string | Filter by location type ('online', 'in-person', 'hybrid') |
| isBlkoutEvent | boolean | Filter by whether it's a BLKOUT event (true/false) |
| approvalStatus | string | Filter by approval status ('pending', 'approved', 'rejected') |
| source | string | Filter by event source ID |
| limit | number | Number of events per page (default: 10) |
| page | number | Page number for pagination (default: 1) |
| upcoming | boolean | Set to 'true' to get only upcoming events (starting from today) |
| featured | boolean | Set to 'true' to get featured BLKOUT events |

**Example Request:**

```
GET /api/events?category=123&limit=5&upcoming=true
```

**Example Response:**

```json
{
  "events": [
    {
      "id": "abc123",
      "title": "BLKOUT Social Mixer",
      "description": "Join us for a social evening...",
      "startDate": "2023-06-15",
      "endDate": "2023-06-15",
      "startTime": "18:00:00",
      "endTime": "21:00:00",
      "locationName": "Community Center",
      "locationAddress": "123 Main St, London",
      "locationCity": "London",
      "locationPostalCode": "W1 1AA",
      "isOnline": false,
      "onlineUrl": null,
      "ticketUrl": "https://example.com/tickets",
      "imageUrl": "https://example.com/image.jpg",
      "organizerName": "BLKOUT UK",
      "isBlkoutEvent": true,
      "isFeatured": true,
      "approvalStatus": "approved",
      "category": {
        "id": "123",
        "name": "Social"
      },
      "tags": ["social", "networking"],
      "createdAt": "2023-05-01T12:00:00Z",
      "updatedAt": "2023-05-01T12:00:00Z"
    }
  ]
}
```

#### POST /events

Create a new event.

**Authentication Required:** Yes

**Request Body:**

```json
{
  "title": "BLKOUT Social Mixer",
  "description": "Join us for a social evening...",
  "startDate": "2023-06-15",
  "endDate": "2023-06-15",
  "startTime": "18:00:00",
  "endTime": "21:00:00",
  "locationName": "Community Center",
  "locationAddress": "123 Main St, London",
  "locationCity": "London",
  "locationPostalCode": "W1 1AA",
  "isOnline": false,
  "onlineUrl": null,
  "ticketUrl": "https://example.com/tickets",
  "imageUrl": "https://example.com/image.jpg",
  "organizerName": "BLKOUT UK",
  "isBlkoutEvent": true,
  "categoryId": "123",
  "tags": ["social", "networking"]
}
```

**Example Response:**

```json
{
  "event": {
    "id": "abc123",
    "title": "BLKOUT Social Mixer",
    "description": "Join us for a social evening...",
    "startDate": "2023-06-15",
    "endDate": "2023-06-15",
    "startTime": "18:00:00",
    "endTime": "21:00:00",
    "locationName": "Community Center",
    "locationAddress": "123 Main St, London",
    "locationCity": "London",
    "locationPostalCode": "W1 1AA",
    "isOnline": false,
    "onlineUrl": null,
    "ticketUrl": "https://example.com/tickets",
    "imageUrl": "https://example.com/image.jpg",
    "organizerName": "BLKOUT UK",
    "isBlkoutEvent": true,
    "isFeatured": false,
    "approvalStatus": "pending",
    "category": {
      "id": "123",
      "name": "Social"
    },
    "tags": ["social", "networking"],
    "createdAt": "2023-05-01T12:00:00Z",
    "updatedAt": "2023-05-01T12:00:00Z"
  }
}
```

#### GET /events/[id]

Fetch a specific event by ID.

**Example Request:**

```
GET /api/events/abc123
```

**Example Response:**

```json
{
  "event": {
    "id": "abc123",
    "title": "BLKOUT Social Mixer",
    "description": "Join us for a social evening...",
    "startDate": "2023-06-15",
    "endDate": "2023-06-15",
    "startTime": "18:00:00",
    "endTime": "21:00:00",
    "locationName": "Community Center",
    "locationAddress": "123 Main St, London",
    "locationCity": "London",
    "locationPostalCode": "W1 1AA",
    "isOnline": false,
    "onlineUrl": null,
    "ticketUrl": "https://example.com/tickets",
    "imageUrl": "https://example.com/image.jpg",
    "organizerName": "BLKOUT UK",
    "isBlkoutEvent": true,
    "isFeatured": true,
    "approvalStatus": "approved",
    "category": {
      "id": "123",
      "name": "Social"
    },
    "tags": ["social", "networking"],
    "createdAt": "2023-05-01T12:00:00Z",
    "updatedAt": "2023-05-01T12:00:00Z"
  }
}
```

#### PUT /events/[id]

Update a specific event.

**Authentication Required:** Yes

**Request Body:**

Same as POST /events, but only include the fields you want to update.

**Example Response:**

```json
{
  "event": {
    "id": "abc123",
    "title": "BLKOUT Social Mixer - Updated",
    "description": "Join us for a social evening...",
    "startDate": "2023-06-15",
    "endDate": "2023-06-15",
    "startTime": "18:00:00",
    "endTime": "21:00:00",
    "locationName": "Community Center",
    "locationAddress": "123 Main St, London",
    "locationCity": "London",
    "locationPostalCode": "W1 1AA",
    "isOnline": false,
    "onlineUrl": null,
    "ticketUrl": "https://example.com/tickets",
    "imageUrl": "https://example.com/image.jpg",
    "organizerName": "BLKOUT UK",
    "isBlkoutEvent": true,
    "isFeatured": true,
    "approvalStatus": "approved",
    "category": {
      "id": "123",
      "name": "Social"
    },
    "tags": ["social", "networking"],
    "createdAt": "2023-05-01T12:00:00Z",
    "updatedAt": "2023-05-02T09:30:00Z"
  }
}
```

#### DELETE /events/[id]

Delete a specific event.

**Authentication Required:** Yes

**Example Response:**

```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

#### POST /events/[id]/approve

Approve a pending event.

**Authentication Required:** Yes

**Example Response:**

```json
{
  "event": {
    "id": "abc123",
    "title": "BLKOUT Social Mixer",
    "approvalStatus": "approved",
    "updatedAt": "2023-05-02T09:30:00Z",
    // ... other event fields
  }
}
```

#### POST /events/[id]/reject

Reject a pending event.

**Authentication Required:** Yes

**Example Response:**

```json
{
  "event": {
    "id": "abc123",
    "title": "BLKOUT Social Mixer",
    "approvalStatus": "rejected",
    "updatedAt": "2023-05-02T09:30:00Z",
    // ... other event fields
  }
}
```

## Error Responses

All endpoints return appropriate HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 405: Method Not Allowed
- 500: Internal Server Error

Error responses include a JSON object with an error message:

```json
{
  "error": "Error message here"
}
```

## Rate Limiting

API requests are limited to 100 requests per minute per IP address. If you exceed this limit, you will receive a 429 Too Many Requests response.