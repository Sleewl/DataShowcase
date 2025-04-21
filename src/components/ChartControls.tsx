import React from 'react';
import { Calendar, BarChart2 } from 'lucide-react';

interface ChartControlsProps {
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
  selectedYear: number;
  onYearChange: (year: number) => void;
  weightViewMode: 'byName' | 'byWeight';
  onWeightViewModeChange: (mode: 'byName' | 'byWeight') => void;
}

const ChartControls: React.FC<ChartControlsProps> = ({
  selectedMonth,
  onMonthChange,
  selectedYear,
  onYearChange,
  weightViewMode,
  onWeightViewModeChange,
}) => {
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Выбор месяца
        </label>
        <input
          type="month"
          value={selectedMonth.toISOString().slice(0, 7)}
          onChange={(e) => onMonthChange(new Date(e.target.value))}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Тип данных
        </label>
        <div className="flex space-x-2">
          <button
            onClick={() => onWeightViewModeChange('byName')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              weightViewMode === 'byName'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Отправочная марка
          </button>
          <button
            onClick={() => onWeightViewModeChange('byWeight')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              weightViewMode === 'byWeight'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Масса
          </button>
        </div>
      </div>
    </>
  );
};

export default ChartControls;