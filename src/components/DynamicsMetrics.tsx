import React from 'react';
import { TrendingUp, Activity, PieChart } from 'lucide-react';
import { CollisionDynamicsData } from '../types';

interface DynamicsMetricsProps {
  data: CollisionDynamicsData[];
}

const DynamicsMetrics: React.FC<DynamicsMetricsProps> = ({ data }) => {
  const MetricCard = ({ 
    icon: Icon, 
    title, 
    children 
  }: { 
    icon: any;
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg transition-all duration-200 hover:shadow-lg">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 mt-1">
          <Icon className="h-7 w-7 text-blue-500 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">{title}</p>
          {children}
        </div>
      </div>
    </div>
  );

  // Calculate top 3 months with most collisions
  const top3Months = [...data]
    .sort((a, b) => b.total - a.total)
    .slice(0, 3)
    .map(item => ({
      month: item.month,
      total: item.total
    }));

  // Calculate distribution by diameter
  const diameterStats = data.reduce(
    (acc, item) => {
      acc.over40 += item.diameters.over40;
      acc.between20and40 += item.diameters.between20and40;
      acc.undefined += item.diameters.undefined;
      acc.total += item.total;
      return acc;
    },
    { over40: 0, between20and40: 0, undefined: 0, total: 0 }
  );

  // Find months with max and min collisions
  const sortedByTotal = [...data].sort((a, b) => b.total - a.total);
  const maxMonths = sortedByTotal.slice(0, 2);
  const minMonths = [...data].sort((a, b) => a.total - b.total).slice(0, 2);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 metrics-panel">
      <MetricCard
        icon={TrendingUp}
        title="Топ-3 периода с наибольшим количеством коллизий"
      >
        <div className="space-y-3">
          {top3Months.map((item, index) => (
            <div key={item.month} className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {index + 1}. {item.month}
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {item.total} коллизий
              </span>
            </div>
          ))}
        </div>
      </MetricCard>

      <MetricCard
        icon={PieChart}
        title="Распределение коллизий по диаметрам труб"
      >
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">ДУ &gt; 40 мм</span>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {diameterStats.over40} ({((diameterStats.over40 / diameterStats.total) * 100).toFixed(1)}%)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">ДУ ≤ 40 мм</span>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {diameterStats.between20and40} ({((diameterStats.between20and40 / diameterStats.total) * 100).toFixed(1)}%)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">Не определено</span>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {diameterStats.undefined} ({((diameterStats.undefined / diameterStats.total) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
      </MetricCard>

      <MetricCard
        icon={Activity}
        title="Общее количество коллизий по месяцам"
      >
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Пики:</p>
            <div className="space-y-1">
              {maxMonths.map((month, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{month.month}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{month.total}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Минимумы:</p>
            <div className="space-y-1">
              {minMonths.map((month, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{month.month}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{month.total}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">Среднее в месяц:</span>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {Math.round(data.reduce((acc, item) => acc + item.total, 0) / data.length)}
              </span>
            </div>
          </div>
        </div>
      </MetricCard>
    </div>
  );
};

export default DynamicsMetrics;