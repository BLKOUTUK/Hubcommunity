import { format } from 'date-fns';
import { LowdownEvent } from '../../integrations/lowdown/client';

interface EventListProps {
  events: LowdownEvent[];
}

export const EventList = ({ events }: EventListProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Event
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date & Time
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Location
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Type
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {event.imageUrl && (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="h-10 w-10 rounded-md mr-3 object-cover"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {event.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {event.description.substring(0, 100)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {format(new Date(event.startDate), 'PPP')}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(event.startDate), 'p')} - {format(new Date(event.endDate), 'p')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {event.locationName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {event.locationAddress}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    event.locationType === 'online'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : event.locationType === 'hybrid'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {event.locationType.charAt(0).toUpperCase() + event.locationType.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 