import { useEffect, useState } from 'react';
import { getCalendarEmbedUrl } from '../../integrations/google/calendar';
import { logError } from '../../services/errorLogging';

export const CalendarEmbed = () => {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const url = getCalendarEmbedUrl();
      setEmbedUrl(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get calendar embed URL';
      setError(errorMessage);
      logError('Error getting calendar embed URL', { error: err });
    }
  }, []);

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!embedUrl) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px]">
      <iframe
        src={embedUrl}
        style={{ border: 0 }}
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        title="BLKOUT Community Calendar"
      />
    </div>
  );
}; 