import React, { useState } from 'react';
import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { PlanFactStatusData, StatusType } from '../types';
import { formatDateForDisplay } from '../utils/dataProcessing';

interface DataTableProps {
  data: PlanFactStatusData[];
  selectedStatus: StatusType;
}

type SortField = 'name' | 'profile' | 'weight' | 'plannedDate' | 'actualDate' | 'delay';
type SortDirection = 'asc' | 'desc';

const DataTable: React.FC<DataTableProps> = ({ data, selectedStatus }) => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const sortedData = [...data].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'name':
        return multiplier * ((a.name || '').localeCompare(b.name || ''));
      case 'profile':
        return multiplier * ((a.profile || '').localeCompare(b.profile || ''));
      case 'weight':
        return multiplier * ((a.weight || 0) - (b.weight || 0));
      case 'plannedDate': {
        const dateA = a.planned_dates?.[selectedStatus] ?? '';
        const dateB = b.planned_dates?.[selectedStatus] ?? '';
        return multiplier * dateA.localeCompare(dateB);
      }
      case 'actualDate': {
        const dateA = a.actual_dates?.[selectedStatus] ?? '';
        const dateB = b.actual_dates?.[selectedStatus] ?? '';
        return multiplier * dateA.localeCompare(dateB);
      }
      case 'delay': {
        const getDelay = (item: PlanFactStatusData) => {
          const planned = item.planned_dates?.[selectedStatus];
          const actual = item.actual_dates?.[selectedStatus];
          if (!planned || !actual) return 0;
          
          const plannedDate = new Date(planned);
          const actualDate = new Date(actual);
          return Math.floor((actualDate.getTime() - plannedDate.getTime()) / (1000 * 60 * 60 * 24));
        };
        
        return multiplier * (getDelay(a) - getDelay(b));
      }
      default:
        return 0;
    }
  });
  
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  const calculateDelay = (item: PlanFactStatusData) => {
    const planned = item.planned_dates?.[selectedStatus];
    const actual = item.actual_dates?.[selectedStatus];
    
    if (!planned || !actual) return null;
    
    const plannedDate = new Date(planned);
    const actualDate = new Date(actual);
    const diffDays = Math.floor((actualDate.getTime() - plannedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  const getStatusLabel = (status: StatusType): string => {
    switch (status) {
      case 'restrictions1': return 'Огр. предпроектирования';
      case 'techRestrictions': return 'Тех. ограничения';
      case 'resourceRestrictions': return 'Ресурсные огр.';
      case 'installation': return 'Монтаж';
      default: return '';
    }
  };
  
  const renderSortIcon = (field: SortField) => {
    if (field !== sortField) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />;
    }
    
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 ml-1" />
      : <ChevronDown className="h-4 w-4 ml-1" />;
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 overflow-hidden">
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Данные по статусу: {getStatusLabel(selectedStatus)}
      </h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Отправочная {renderSortIcon('name')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('profile')}
              >
                <div className="flex items-center">
                  Профиль {renderSortIcon('profile')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('weight')}
              >
                <div className="flex items-center">
                  Вес (кг) {renderSortIcon('weight')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('plannedDate')}
              >
                <div className="flex items-center">
                  План {renderSortIcon('plannedDate')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('actualDate')}
              >
                <div className="flex items-center">
                  Факт {renderSortIcon('actualDate')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('delay')}
              >
                <div className="flex items-center">
                  Отклонение (дни) {renderSortIcon('delay')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.map((item, index) => {
              const delay = calculateDelay(item);
              const delayClass = delay === null 
                ? '' 
                : delay > 0 
                  ? 'text-red-600 dark:text-red-400' 
                  : delay < 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : '';
              
              return (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{item.profile}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{Math.round(item.weight)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {formatDateForDisplay(item.planned_dates?.[selectedStatus])}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {formatDateForDisplay(item.actual_dates?.[selectedStatus])}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${delayClass}`}>
                    {delay !== null ? delay : 'Н/Д'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6 mt-4">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                page === 1 
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Предыдущая
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                page === totalPages 
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Следующая
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Показано <span className="font-medium">{(page - 1) * itemsPerPage + 1}</span> - <span className="font-medium">
                  {Math.min(page * itemsPerPage, sortedData.length)}
                </span> из <span className="font-medium">{sortedData.length}</span> результатов
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                    page === 1 
                      ? 'text-gray-300 dark:text-gray-600' 
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="sr-only">Предыдущая</span>
                  <ChevronDown className="h-5 w-5 transform rotate-90" />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pageNum
                          ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-200'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                    page === totalPages 
                      ? 'text-gray-300 dark:text-gray-600' 
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="sr-only">Следующая</span>
                  <ChevronUp className="h-5 w-5 transform rotate-90" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;