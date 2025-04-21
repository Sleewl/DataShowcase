import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { CollisionDynamicsData } from '../types';

interface DynamicsChartsProps {
  data: CollisionDynamicsData[];
}

const COLORS = {
  over40: '#3b82f6',
  between20and40: '#22c55e',
  undefined: '#94a3b8',
  installation1: '#ef4444',
  installation2: '#f97316',
  installation3: '#84cc16',
  installation4: '#06b6d4',
  installation5: '#8b5cf6'
};

export const TotalCollisionsChart: React.FC<DynamicsChartsProps> = ({ data }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Общая динамика коллизий по месяцам
      </h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e5e7eb"
              className="dark:stroke-gray-700"
            />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              className="dark:stroke-gray-400"
            />
            <YAxis 
              stroke="#6b7280"
              className="dark:stroke-gray-400"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                color: '#111827'
              }}
              itemStyle={{ color: '#111827' }}
              cursor={{ stroke: '#6b7280', strokeWidth: 1 }}
            />
            <Legend 
              wrapperStyle={{ color: '#111827' }}
            />
            <Line
              type="monotone"
              dataKey="total"
              name="Всего коллизий"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4, fill: '#3b82f6' }}
              activeDot={{ r: 6, fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const InstallationsCollisionsChart: React.FC<DynamicsChartsProps> = ({ data }) => {
  const transformedData = data.map(item => ({
    month: item.month,
    'Установка 1': item.installations['1'],
    'Установка 2': item.installations['2'],
    'Установка 3': item.installations['3'],
    'Установка 4': item.installations['4'],
    'Установка 5': item.installations['5']
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between items-center mb-1">
            <span className="text-sm" style={{ color: entry.color }}>
              {entry.name}:
            </span>
            <span className="text-sm font-medium ml-4">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Распределение коллизий по установкам
      </h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={transformedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            barSize={16}
          >
            <CartesianGrid 
              vertical={false} 
              stroke="#e5e7eb"
              className="dark:stroke-gray-700"
            />
            <XAxis 
              dataKey="month"
              stroke="#6b7280"
              className="dark:stroke-gray-400"
              axisLine={true}
              tickLine={true}
              padding={{ left: 20, right: 20 }}
              tick={{
                fill: '#6b7280',
                fontSize: 12,
                fontWeight: 500
              }}
            />
            <YAxis 
              stroke="#6b7280"
              className="dark:stroke-gray-400"
              axisLine={true}
              tickLine={true}
              tick={{
                fill: '#6b7280',
                fontSize: 12
              }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={false}
            />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                color: '#111827'
              }}
              iconSize={10}
              iconType="circle"
            />
            <Bar
              dataKey="Установка 1"
              fill={COLORS.installation1}
              radius={[2, 2, 0, 0]}
              stackId="stack"
            />
            <Bar
              dataKey="Установка 2"
              fill={COLORS.installation2}
              radius={[2, 2, 0, 0]}
              stackId="stack"
            />
            <Bar
              dataKey="Установка 3"
              fill={COLORS.installation3}
              radius={[2, 2, 0, 0]}
              stackId="stack"
            />
            <Bar
              dataKey="Установка 4"
              fill={COLORS.installation4}
              radius={[2, 2, 0, 0]}
              stackId="stack"
            />
            <Bar
              dataKey="Установка 5"
              fill={COLORS.installation5}
              radius={[2, 2, 0, 0]}
              stackId="stack"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const DiameterCollisionsChart: React.FC<DynamicsChartsProps> = ({ data }) => {
  const transformedData = data.map(item => ({
    month: item.month,
    '>40': item.diameters.over40,
    '≤40': item.diameters.between20and40,
    'Не опр.': item.diameters.undefined
  }));

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Коллизии по диаметру трубопровода
      </h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={transformedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            barSize={40}
          >
            <CartesianGrid 
              vertical={false} 
              stroke="#e5e7eb"
              className="dark:stroke-gray-700"
            />
            <XAxis 
              dataKey="month"
              axisLine={true}
              tickLine={true}
              stroke="#6b7280"
              className="dark:stroke-gray-400"
            />
            <YAxis 
              stroke="#6b7280"
              className="dark:stroke-gray-400"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                color: '#111827'
              }}
              itemStyle={{ color: '#111827' }}
              cursor={false}
            />
            <Legend 
              wrapperStyle={{ color: '#111827' }}
            />
            <Bar
              dataKey=">40"
              name=">40 мм"
              stackId="a"
              fill={COLORS.over40}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="≤40"
              name="≤40 мм"
              stackId="a"
              fill={COLORS.between20and40}
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="Не опр."
              name="Не определено"
              stackId="a"
              fill={COLORS.undefined}
              radius={[0, 0, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};