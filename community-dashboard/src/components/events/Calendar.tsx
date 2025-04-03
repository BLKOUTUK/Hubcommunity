import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { LowdownEvent } from '../../integrations/lowdown/client';

interface CalendarProps {
  events: LowdownEvent[];
}

export const Calendar = ({ events }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.startDate), date));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}

          {days.map((day, dayIdx) => {
            const dayEvents = getEventsForDay(day);
            return (
              <div
                key={day.toString()}
                className={`min-h-[100px] p-2 border border-gray-200 dark:border-gray-700 ${
                  isSameMonth(day, currentDate)
                    ? 'bg-white dark:bg-gray-800'
                    : 'bg-gray-50 dark:bg-gray-900'
                }`}
              >
                <div className="text-sm text-gray-900 dark:text-white">
                  {format(day, 'd')}
                </div>
                <div className="mt-1">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      className="text-xs p-1 mb-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 truncate"
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}; 