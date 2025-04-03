import { useState } from 'react';

interface Filters {
  startDate: string;
  endDate: string;
  category: string;
  locationType: 'online' | 'in-person' | 'hybrid' | undefined;
}

interface EventFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

export const EventFilters = ({ filters, onFilterChange }: EventFiltersProps) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (field: keyof Filters, value: string | undefined) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Filters</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={localFilters.startDate.split('T')[0]}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={localFilters.endDate.split('T')[0]}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          <input
            type="text"
            id="category"
            value={localFilters.category}
            onChange={(e) => handleChange('category', e.target.value)}
            placeholder="Filter by category"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="locationType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Event Type
          </label>
          <select
            id="locationType"
            value={localFilters.locationType || ''}
            onChange={(e) => handleChange('locationType', e.target.value || undefined)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          >
            <option value="">All Types</option>
            <option value="online">Online</option>
            <option value="in-person">In Person</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
      </div>
    </div>
  );
}; 