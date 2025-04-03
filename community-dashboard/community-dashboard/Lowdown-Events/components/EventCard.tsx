import React from 'react';
import { format } from 'date-fns';
import type { Event } from '../database/types';

interface EventCardProps {
  event: Event;
  onClick?: (event: Event) => void;
  className?: string;
}

export function EventCard({ event, onClick, className = '' }: EventCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(event);
    }
  };

  // Format dates
  const startDate = new Date(event.startDate);
  const formattedDate = format(startDate, 'EEE, MMM d, yyyy');
  const formattedTime = event.startTime 
    ? format(new Date(`2000-01-01T${event.startTime}`), 'h:mm a')
    : '';

  // Determine location display
  const locationDisplay = event.isOnline
    ? 'Online'
    : event.locationName || 'Location TBA';

  return (
    <div 
      className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}
      onClick={handleClick}
    >
      {event.imageUrl && (
        <div className="h-48 overflow-hidden">
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        {event.isBlkoutEvent && (
          <div className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded mb-2">
            BLKOUT UK Event
          </div>
        )}
        <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
        <div className="text-sm text-gray-600 mb-2">
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formattedDate}</span>
          </div>
          {formattedTime && (
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formattedTime}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{locationDisplay}</span>
          </div>
        </div>
        {event.category && (
          <div className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {event.category.name}
          </div>
        )}
      </div>
      <div className="px-4 pb-4">
        <button 
          className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            window.open(event.ticketUrl || '#', '_blank');
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
}