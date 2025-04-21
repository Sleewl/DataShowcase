import React from 'react';
import { BarChart, TrendingUp, Award, Target, TrendingDown } from 'lucide-react';
import { StatusType } from '../types';

interface MetricsPanelProps {
  monthlyData: {
    top3Marks: Array<{
      name: string;
      weight: number;
      percentage: number;
    }>;
    bottom3Marks: Array<{
      name: string;
      weight: number;
      percentage: number;
    }>;
    totalWeight: number;
    monthlyGrowth: number;
    planCompletion: {
      planned: number;
      actual: number;
      difference: number;
    };
  };
  selectedStatus: StatusType;
  statusLabel: string;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({
  monthlyData,
  selectedStatus,
  statusLabel
}) => {
  const { top3Marks, bottom3Marks, totalWeight, monthlyGrowth, planCompletion } = monthlyData;

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-500 dark:text-green-400';
    if (growth === 0) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  };

  const getCompletionColor = (actual: number, planned: number) => {
    return 'text-purple-500 dark:text-purple-400';
  };

  const formatWeight = (weight: number) => {
    return `${(weight / 1000).toFixed(2)}т`;
  };

  const totalTop3Weight = top3Marks.reduce((sum, mark) => sum + mark.weight, 0);
  const totalBottom3Weight = bottom3Marks.reduce((sum, mark) => sum + mark.weight, 0);

  const MetricCard = ({ 
    icon: Icon, 
    iconColor, 
    title, 
    value, 
    valueColor, 
    children 
  }: { 
    icon: any, 
    iconColor: string, 
    title: string, 
    value: string, 
    valueColor: string, 
    children?: React.ReactNode 
  }) => (
    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
      <div className="flex items-start space-x-4">
        <div className={`${iconColor} flex-shrink-0 mt-1`}>
          <Icon className="h-7 w-7" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${valueColor} mb-2 whitespace-nowrap`}>{value}</p>
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6 flex items-center">
        <BarChart className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
        Отклонения: {statusLabel}
      </h2>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Award}
          iconColor="text-yellow-500 dark:text-yellow-400"
          title="Лидирующие марки по объему"
          value={formatWeight(totalTop3Weight)}
          valueColor="text-yellow-500 dark:text-yellow-400"
        >
          <div className="space-y-2 mt-3">
            {top3Marks.map((mark, index) => (
              <div key={mark.name} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {index + 1}. {mark.name}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatWeight(mark.weight)}
                </span>
              </div>
            ))}
          </div>
        </MetricCard>

        <MetricCard
          icon={TrendingDown}
          iconColor="text-orange-500 dark:text-orange-400"
          title="Минимальные марки по объему"
          value={formatWeight(totalBottom3Weight)}
          valueColor="text-orange-500 dark:text-orange-400"
        >
          <div className="space-y-2 mt-3">
            {bottom3Marks.map((mark, index) => (
              <div key={mark.name} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {index + 1}. {mark.name}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatWeight(mark.weight)}
                </span>
              </div>
            ))}
          </div>
        </MetricCard>

        <MetricCard
          icon={TrendingUp}
          iconColor={getGrowthColor(monthlyGrowth)}
          title="Изменение объема к прошлому месяцу"
          value={`${monthlyGrowth > 0 ? '+' : ''}${formatWeight(monthlyGrowth)}`}
          valueColor={getGrowthColor(monthlyGrowth)}
        >
          <div className="mt-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Текущий объем: <span className="font-bold">{formatWeight(totalWeight)}</span>
            </p>
          </div>
        </MetricCard>

        <MetricCard
          icon={Target}
          iconColor="text-purple-500 dark:text-purple-400"
          title="Прогресс выполнения месячного плана"
          value={`${formatWeight(planCompletion.actual)} из ${formatWeight(planCompletion.planned)}`}
          valueColor="text-purple-500 dark:text-purple-400"
        >
          <div className="mt-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {planCompletion.actual >= planCompletion.planned 
                ? <>Перевыполнение: <span className="font-bold">+{formatWeight(planCompletion.difference)}</span></>
                : <>До плана: <span className="font-bold">{formatWeight(Math.abs(planCompletion.difference))}</span></>}
            </p>
          </div>
        </MetricCard>
      </div>
    </div>
  );
};

export default MetricsPanel;