import { eventsApi } from '../../database/supabase-client';
import { convertDbEventToEvent } from '../../database/types';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Extract query parameters
      const {
        category,
        startDate,
        endDate,
        location,
        locationType,
        isBlkoutEvent,
        approvalStatus,
        source,
        limit,
        page,
        upcoming,
        featured,
      } = req.query;

      // Convert string parameters to appropriate types
      const parsedParams = {
        category,
        startDate,
        endDate,
        location,
        locationType,
        isBlkoutEvent: isBlkoutEvent === 'true',
        approvalStatus,
        source,
        limit: limit ? parseInt(limit, 10) : 10,
        page: page ? parseInt(page, 10) : 1,
        upcoming: upcoming === 'true',
        featured: featured === 'true',
      };

      // Get events from database
      const { data, error } = await eventsApi.getEvents(parsedParams);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      // Convert database events to frontend format
      const events = data.map(convertDbEventToEvent);

      return res.status(200).json({ events });
    }

    if (req.method === 'POST') {
      // Validate request body
      const { title, startDate } = req.body;

      if (!title || !startDate) {
        return res.status(400).json({ error: 'Title and start date are required' });
      }

      // Create event in database
      const { data, error } = await eventsApi.createEvent({
        title: req.body.title,
        description: req.body.description,
        start_date: req.body.startDate,
        end_date: req.body.endDate,
        start_time: req.body.startTime,
        end_time: req.body.endTime,
        location_name: req.body.locationName,
        location_address: req.body.locationAddress,
        location_city: req.body.locationCity,
        location_postal_code: req.body.locationPostalCode,
        is_online: req.body.isOnline,
        online_url: req.body.onlineUrl,
        ticket_url: req.body.ticketUrl,
        image_url: req.body.imageUrl,
        organizer_name: req.body.organizerName,
        is_blkout_event: req.body.isBlkoutEvent,
        approval_status: 'pending', // New events are pending by default
        category_id: req.body.categoryId,
        tags: req.body.tags,
      });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      // Convert database event to frontend format
      const event = convertDbEventToEvent(data);

      return res.status(201).json({ event });
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}