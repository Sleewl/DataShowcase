import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { MonthlyWeightData, YearlyWeightData, StatusDateData, StatusType, WeightViewMode } from '../types';

interface MonthlyWeightChartProps {
  data: MonthlyWeightData[];
  month: Date;
  year: number;
  height?: number;
}

interface YearlyWeightChartProps {
  data: YearlyWeightData[];
  year: number;
  height?: number;
}

export const MonthlyWeightChart: React.FC<MonthlyWeightChartProps> = ({ 
  data, 
  month, 
  year,
  height = 400
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-gray-600">Масса: {Math.round(payload[0].value)} кг</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4" style={{ height }}>
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Динамика физ. объёма одинаковых отправочных марок за {format(month, 'LLLL', { locale: ru })} {year}
      </h2>
      <div style={{ height: height - 80 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 20, right: 30, left: 60, bottom: 60 }}
          >
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
              stroke="#6b7280"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              className="dark:stroke-gray-400 dark:fill-gray-400"
            />
            <YAxis 
              label={{ 
                value: 'Масса (кг)', 
                angle: -90, 
                position: 'insideLeft',
                offset: -40,
                fill: '#6b7280',
                className: 'dark:fill-gray-400'
              }}
              stroke="#6b7280"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              className="dark:stroke-gray-400 dark:fill-gray-400"
              tickLine={false}
            />
            <CartesianGrid 
              horizontal={true}
              vertical={false}
              stroke="#e5e7eb"
              className="dark:stroke-gray-700"
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={false}
            />
            <Bar 
              dataKey="weight" 
              fill="#8884d8" 
              name="Масса" 
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const YearlyWeightChart: React.FC<YearlyWeightChartProps> = ({ 
  data, 
  year,
  height = 400
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-gray-600">Масса: {Math.round(payload[0].value)} кг</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4" style={{ height }}>
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Динамика физ. объёма всех отправочных марок за {year} год
      </h2>
      <div style={{ height: height - 80 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 20, right: 30, left: 60, bottom: 60 }}
          >
            <XAxis 
              dataKey="month" 
              tickFormatter={(value) => value.substring(0, 3)}
              height={60}
              stroke="#6b7280"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              className="dark:stroke-gray-400 dark:fill-gray-400"
            />
            <YAxis 
              label={{ 
                value: 'Масса (кг)', 
                angle: -90, 
                position: 'insideLeft',
                offset: -40,
                fill: '#6b7280',
                className: 'dark:fill-gray-400'
              }}
              stroke="#6b7280"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              className="dark:stroke-gray-400 dark:fill-gray-400"
              tickLine={false}
            />
            <CartesianGrid 
              horizontal={true}
              vertical={false}
              stroke="#e5e7eb"
              className="dark:stroke-gray-700"
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={false}
            />
            <Bar 
              dataKey="weight" 
              fill="#82ca9d" 
              name="Масса" 
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const QuarterlyVolumeChart: React.FC<{ data: any[], year: number }> = ({ data, year }) => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const monthlyData = months.map((month, index) => {
    const progress = (index + 1) / 12;
    const sCurveMultiplier = 1 / (1 + Math.exp(-10 * (progress - 0.5)));
    
    const totalPlanned = data.reduce((sum, item) => sum + item.planned, 0);
    const totalActual = data.reduce((sum, item) => sum + item.actual, 0);
    
    return {
      month,
      planned: totalPlanned * sCurveMultiplier,
      actual: totalActual * (sCurveMultiplier * (0.9 + Math.random() * 0.2))
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const planned = payload[0].value;
    const actual = payload[1]?.value || 0;
    const difference = ((actual - planned) / planned * 100).toFixed(1);
    const sign = difference > 0 ? '+' : '';

    return (
      <div className="bg-white border border-gray-200 p-3 rounded shadow-lg">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-sm">План: {Math.round(planned)} кг</p>
        <p className="text-sm">Факт: {Math.round(actual)} кг</p>
        <p className="text-sm font-medium mt-1">
          Отклонение: {sign}{difference}%
        </p>
      </div>
    );
  };

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 h-[400px]">
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Плановый и фактический объем за {year} год
      </h2>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={monthlyData}
            margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e5e7eb"
              className="dark:stroke-gray-700"
            />
            <XAxis 
              dataKey="month"
              interval={0}
              stroke="#6b7280"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              className="dark:stroke-gray-400 dark:fill-gray-400"
            />
            <YAxis
              label={{
                value: 'Масса (кг)',
                angle: -90,
                position: 'insideLeft',
                offset: -40,
                fill: '#6b7280',
                className: 'dark:fill-gray-400'
              }}
              stroke="#6b7280"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              className="dark:stroke-gray-400 dark:fill-gray-400"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ color: '#6b7280' }}
              className="dark:text-gray-400"
            />
            <Line 
              type="monotone" 
              dataKey="planned" 
              name="План" 
              stroke="#dc2626" 
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line 
              type="monotone" 
              dataKey="actual" 
              name="Факт" 
              stroke="#1d4ed8" 
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <ReferenceLine 
              x={today} 
              stroke="#dc2626"
              label={{ 
                value: "Сегодня",
                fill: '#6b7280',
                className: 'dark:fill-gray-400'
              }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};