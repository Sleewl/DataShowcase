import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { DataPoint, ChartViewMode, DataViewMode } from '../types';

interface SCurveChartProps {
  data: DataPoint[];
  viewMode: ChartViewMode;
  dataMode: DataViewMode;
  title: string;
}

const SCurveChart: React.FC<SCurveChartProps> = ({ 
  data, 
  viewMode, 
  dataMode,
  title
}) => {
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'dd.MM.yyyy');
    } catch (e) {
      return dateStr;
    }
  };
  
  // Format the value based on the view mode
  const formatValue = (value: number) => {
    if (viewMode === 'volume') {
      return `${value.toFixed(2)} кг`;
    }
    return value;
  };
  
  const showPlanned = dataMode === 'planned' || dataMode === 'comparison';
  const showActual = dataMode === 'actual' || dataMode === 'comparison';
  
  const today = format(new Date(), 'yyyy-MM-dd');
  
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-lg font-medium text-gray-900 mb-4">{title}</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              minTickGap={50}
            />
            <YAxis 
              tickFormatter={formatValue}
              // Добавляем отступ для лучшего отображения чисел
              domain={['auto', 'auto']}
              padding={{ top: 20 }}
            />
            <Tooltip 
              labelFormatter={formatDate}
              formatter={(value: number) => [formatValue(value), '']}
            />
            <Legend />
            
            {showPlanned && (
              <Line
                type="monotone"
                dataKey="cumulativePlanned"
                name="План"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            )}
            
            {showActual && (
              <Line
                type="monotone"
                dataKey="cumulativeActual"
                name="Факт"
                stroke="#82ca9d"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            )}
            
            <ReferenceLine x={today} stroke="red" label="Сегодня" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SCurveChart;
