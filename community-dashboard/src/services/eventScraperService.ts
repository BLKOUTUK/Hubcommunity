export interface Event {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface IntegrationResult {
  success: boolean;
  calendarEventId?: string;
  googleEventId?: string;
  error?: string;
}

export const scrapeEvents = async (sourceUrl: string): Promise<Event[]> => {
  try {
    // In a real implementation, this would make an HTTP request to the source URL
    // and parse the response to extract event data
    return [];
  } catch (error) {
    throw new Error('Failed to scrape events');
  }
};

export const parseEventData = (rawData: any): Event => {
  return {
    title: rawData.title || '',
    description: rawData.description || '',
    startTime: rawData.startTime || rawData.start || '',
    endTime: rawData.endTime || rawData.end || '',
    location: rawData.location || ''
  };
};

export const validateEvent = (event: Event): ValidationResult => {
  const errors: string[] = [];

  if (!event.title) {
    errors.push('Title is required');
  }

  if (!event.startTime) {
    errors.push('Start time is required');
  } else if (isNaN(Date.parse(event.startTime))) {
    errors.push('Invalid start time format');
  }

  if (!event.endTime) {
    errors.push('End time is required');
  } else if (isNaN(Date.parse(event.endTime))) {
    errors.push('Invalid end time format');
  }

  if (event.startTime && event.endTime) {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    if (end <= start) {
      errors.push('End time must be after start time');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const integrateWithCalendar = async (event: Event): Promise<IntegrationResult> => {
  try {
    // In a real implementation, this would integrate with a calendar service
    // (e.g., Google Calendar API)
    return {
      success: true,
      calendarEventId: 'mock-id',
      googleEventId: 'mock-google-id'
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to integrate with calendar'
    };
  }
}; 