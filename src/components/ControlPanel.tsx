import React from 'react';
import { BarChart2, LineChart, ToggleLeft } from 'lucide-react';
import { ChartViewMode, DataViewMode, StatusType, StatusLabel } from '../types';

interface ControlPanelProps {
  chartViewMode: ChartViewMode;
  onChartViewModeChange: (mode: ChartViewMode) => void;
  dataViewMode: DataViewMode;
  onDataViewModeChange: (mode: DataViewMode) => void;
  selectedStatus: StatusType;
  onStatusChange: (status: StatusType) => void;
  availableStatuses: StatusLabel[];
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  chartViewMode,
  onChartViewModeChange,
  dataViewMode,
  onDataViewModeChange,
  selectedStatus,
  onStatusChange,
  availableStatuses
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Chart View Mode */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <BarChart2 className="h-4 w-4 text-gray-500 mr-1" />
            Тип графика
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onChartViewModeChange('status')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                chartViewMode === 'status'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Статусы
            </button>
            <button
              onClick={() => onChartViewModeChange('volume')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                chartViewMode === 'volume'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Физ. объемы
            </button>
            <button
              onClick={() => onChartViewModeChange('monthlyWeight')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                chartViewMode === 'monthlyWeight'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              По месяцам
            </button>
            <button
              onClick={() => onChartViewModeChange('yearlyWeight')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                chartViewMode === 'yearlyWeight'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              По годам
            </button>
            <button
              onClick={() => onChartViewModeChange('statusDates')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                chartViewMode === 'statusDates'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Даты статусов
            </button>
          </div>
        </div>
        
        {/* Data View Mode */}
        {(chartViewMode === 'status' || chartViewMode === 'volume') && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <LineChart className="h-4 w-4 text-gray-500 mr-1" />
              Отображение
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => onDataViewModeChange('planned')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  dataViewMode === 'planned'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                План
              </button>
              <button
                onClick={() => onDataViewModeChange('actual')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  dataViewMode === 'actual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Факт
              </button>
              <button
                onClick={() => onDataViewModeChange('comparison')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  dataViewMode === 'comparison'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Сравнение
              </button>
            </div>
          </div>
        )}
        
        {/* Status Selection */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <ToggleLeft className="h-4 w-4 text-gray-500 mr-1" />
            Статус
          </h3>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value as StatusType)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            {availableStatuses.map((status) => (
              <option key={status.key} value={status.key}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;