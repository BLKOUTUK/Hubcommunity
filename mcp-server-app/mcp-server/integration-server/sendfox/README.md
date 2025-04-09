# SendFox Integration for BLKOUT NEXT Campaign

This integration allows you to interact with the SendFox API for email marketing in the BLKOUT NEXT campaign.

## Features

- Create and manage email campaigns
- Schedule email campaigns
- Get campaign statistics
- List email lists
- Create and manage contacts

## Setup

1. Make sure you have a SendFox account and API key
2. Add your SendFox API key to the `.env` file:
   ```
   SENDFOX_API_KEY=your_api_key_here
   ```
3. Start the SendFox integration server:
   ```
   python sendfox_server.py
   ```

## API Endpoints

The SendFox API has the following endpoints:

- `GET /me` - Gets information for authenticated user
- `GET /lists` - Gets paginated contact lists
- `GET /lists/{list_id}` - Gets a list by ID
- `POST /lists` - Creates new list
- `DELETE /lists/{list_id}/contacts/{contact_id}` - Removes contact from list
- `GET /contacts` - Gets paginated contacts
- `GET /contacts/{contact_id}` - Gets a contact by ID
- `GET /contacts?email={contact_email}` - Gets contact by email
- `POST /contacts` - Creates a new contact
- `PATCH /unsubscribe` - Unsubscribes a contact
- `GET /campaigns` - Gets paginated campaigns
- `GET /{campaign_id}` - Gets campaign by ID

## Available Tools

### create_email_campaign

Creates a new email campaign in SendFox.

```python
create_email_campaign(name: str, subject: str, content: str, list_ids: list) -> str
```

### schedule_email_campaign

Schedules an existing SendFox campaign.

```python
schedule_email_campaign(campaign_id: str, schedule_time: str) -> str
```

### get_campaign_stats

Gets statistics for a SendFox campaign.

```python
get_campaign_stats(campaign_id: str) -> str
```

### list_email_lists

Gets all email lists from SendFox.

```python
list_email_lists() -> str
```

### create_contact

Creates a new contact in SendFox.

```python
create_contact(email: str, first_name: str = "", last_name: str = "", lists: list = None) -> str
```

## Troubleshooting

If you encounter issues with the SendFox integration:

1. Check that your API key is correct
2. Verify that you have the necessary permissions in SendFox
3. Check the error messages for details about what went wrong
4. Make sure you're using the correct API endpoints and parameters

## References

- [SendFox API Documentation](https://help.sendfox.com/article/278-endpoints)
- [SendFox Website](https://sendfox.com)
