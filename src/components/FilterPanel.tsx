import React, { useState } from 'react';
import { Filter, Search, Calendar } from 'lucide-react';
import { StatusType, StatusLabel, FilterState } from '../types';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableStatuses: StatusLabel[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({ 
  filters, 
  onFilterChange,
  availableStatuses
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleStatusChange = (status: StatusType) => {
    const newStatuses = filters.statusTypes.includes(status)
      ? filters.statusTypes.filter(s => s !== status)
      : [...filters.statusTypes, status];
    
    onFilterChange({
      ...filters,
      statusTypes: newStatuses
    });
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      searchTerm: e.target.value
    });
  };
  
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = e.target.value ? new Date(e.target.value) : null;
    onFilterChange({
      ...filters,
      dateRange: [startDate, filters.dateRange[1]]
    });
  };
  
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const endDate = e.target.value ? new Date(e.target.value) : null;
    onFilterChange({
      ...filters,
      dateRange: [filters.dateRange[0], endDate]
    });
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Фильтры</h2>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          {isExpanded ? 'Свернуть' : 'Развернуть'}
        </button>
      </div>
      
      <div className="mt-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
        <input
          type="text"
          placeholder="Поиск по отправочной, позиции или профилю..."
          value={filters.searchTerm}
          onChange={handleSearchChange}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm"
        />
      </div>
      
      {isExpanded && (
        <>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                Начальная дата
              </label>
              <input
                type="date"
                id="start-date"
                value={filters.dateRange[0] ? filters.dateRange[0].toISOString().split('T')[0] : ''}
                onChange={handleStartDateChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                Конечная дата
              </label>
              <input
                type="date"
                id="end-date"
                value={filters.dateRange[1] ? filters.dateRange[1].toISOString().split('T')[0] : ''}
                onChange={handleEndDateChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Статусы</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              {availableStatuses.map(status => (
                <div key={status.key} className="flex items-center">
                  <input
                    id={`status-${status.key}`}
                    type="checkbox"
                    checked={filters.statusTypes.includes(status.key)}
                    onChange={() => handleStatusChange(status.key)}
                    className="h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label htmlFor={`status-${status.key}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    {status.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FilterPanel;