import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { installationsData } from '../data/installationsData';

interface TotalCollisionsCounterProps {}

const TotalCollisionsCounter: React.FC<TotalCollisionsCounterProps> = () => {
  // Получаем года из данных установок
  const years = installationsData.map(inst => parseInt(inst.date.split('-')[0]));
  const currentYear = Math.max(...years);
  const previousYear = currentYear - 1;

  // Суммируем коллизии для текущего и предыдущего годов
  const currentYearCollisions = installationsData
    .filter(inst => parseInt(inst.date.split('-')[0]) === currentYear)
    .reduce((sum, inst) => sum + inst.totalCollisions, 0);

  const previousYearCollisions = installationsData
    .filter(inst => parseInt(inst.date.split('-')[0]) === previousYear)
    .reduce((sum, inst) => sum + inst.totalCollisions, 0);

  const difference = currentYearCollisions - previousYearCollisions;
  const percentageChange = previousYearCollisions > 0 
    ? (difference / previousYearCollisions) * 100 
    : 0;
  
  const getColorClass = (value: number) => {
    if (value <= 500) return 'text-green-600 dark:text-green-400';
    if (value <= 1000) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Всего выявлено коллизий
      </h2>
      
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {currentYearCollisions.toLocaleString()} шт.
        </div>
        
        {previousYearCollisions > 0 ? (
          <div className={`flex items-center justify-center text-base ${getColorClass(Math.abs(difference))}`}>
            {difference > 0 ? (
              <TrendingUp className="h-5 w-5 mr-1" />
            ) : difference < 0 ? (
              <TrendingDown className="h-5 w-5 mr-1" />
            ) : null}
            <span className="font-medium">
              {difference > 0 ? '+' : ''}{difference.toLocaleString()} шт.
            </span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">
              по сравнению с {previousYear} г.
            </span>
          </div>
        ) : (
          <div className="text-gray-500 dark:text-gray-400 text-base">
            Нет данных за предыдущий год
          </div>
        )}
      </div>
    </div>
  );
};

export default TotalCollisionsCounter;