import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Installation } from '../types';

interface InstallationPieChartProps {
  installations: Installation[];
}

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#7e22ce', '#ef4444'];

const InstallationPieChart: React.FC<InstallationPieChartProps> = ({ installations }) => {
  const data = installations.map((installation) => ({
    name: installation.name,
    value: installation.totalCollisions,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100">{data.name}</p>
          <p className="text-gray-600 dark:text-gray-400">
            Всего коллизий: {data.value}
          </p>
        </div>
      );
    }
    return null;
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = outerRadius * 1.4;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    const startX = cx + outerRadius * Math.cos(-midAngle * RADIAN);
    const startY = cy + outerRadius * Math.sin(-midAngle * RADIAN);
    
    const controlX1 = cx + (outerRadius + radius * 0.4) * Math.cos(-midAngle * RADIAN);
    const controlY1 = cy + (outerRadius + radius * 0.4) * Math.sin(-midAngle * RADIAN);
    const controlX2 = x - radius * 0.3 * Math.cos(-midAngle * RADIAN);
    const controlY2 = y - radius * 0.3 * Math.sin(-midAngle * RADIAN);
    
    return (
      <g>
        <path
          d={`
            M ${startX},${startY}
            C ${controlX1},${controlY1}
            ${controlX2},${controlY2}
            ${x},${y}
          `}
          fill="none"
          stroke="#666"
          className="dark:stroke-gray-400"
          strokeWidth={1}
        />
        <text
          x={x}
          y={y}
          fill="#666"
          className="dark:fill-gray-300"
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
          fontSize={14}
          fontWeight="bold"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      </g>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Распределение коллизий по установкам
      </h2>
      <div className="h-[400px] flex justify-center items-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              label={renderCustomizedLabel}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout="horizontal"
              align="center"
              verticalAlign="bottom"
              formatter={(value: string) => (
                <span className="text-sm text-gray-900 dark:text-gray-100">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InstallationPieChart;