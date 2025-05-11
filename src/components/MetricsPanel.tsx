import React from 'react';
import { BarChart, TrendingUp, Award, Target } from 'lucide-react';
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
    if (growth > 0) return 'text-emerald-500 dark:text-emerald-400';
    if (growth === 0) return 'text-amber-500 dark:text-amber-400';
    return 'text-rose-500 dark:text-rose-400';
  };

  const getCompletionColor = (actual: number, planned: number) => {
    const ratio = actual / planned;
    if (ratio >= 1) return 'text-emerald-500 dark:text-emerald-400';
    if (ratio >= 0.8) return 'text-amber-500 dark:text-amber-400';
    return 'text-rose-500 dark:text-rose-400';
  };

  const formatWeight = (weight: number) => {
    return `${(weight / 1000).toFixed(2)}т`;
  };

  const totalTop3Weight = top3Marks.reduce((sum, mark) => sum + mark.weight, 0);
  const totalBottom3Weight = bottom3Marks.reduce((sum, mark) => sum + mark.weight, 0);

  const MetricCard = ({ 
    icon: Icon, 
    title, 
    value, 
    valueColor, 
    children
  }: { 
    icon: any;
    title: string;
    value: string;
    valueColor: string;
    children?: React.ReactNode;
  }) => (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg transition-all duration-200 hover:shadow-lg">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 mt-1">
          <Icon className="h-7 w-7 text-blue-500 dark:text-blue-400" />
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
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6 metrics-panel">
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6 flex items-center">
        <BarChart className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
        Отклонения: {statusLabel}
      </h2>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Award}
          title="Лидирующие марки по объему"
          value={formatWeight(totalTop3Weight)}
          valueColor="text-blue-500 dark:text-blue-400"
        >
          <div className="space-y-2 mt-3">
            {top3Marks.map((mark, index) => (
              <div key={mark.name} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {index + 1}. {mark.name}
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {formatWeight(mark.weight)}
                </span>
              </div>
            ))}
          </div>
        </MetricCard>

        <MetricCard
          icon={TrendingUp}
          title="Минимальные марки по объему"
          value={formatWeight(totalBottom3Weight)}
          valueColor="text-blue-500 dark:text-blue-400"
        >
          <div className="space-y-2 mt-3">
            {bottom3Marks.map((mark, index) => (
              <div key={mark.name} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {index + 1}. {mark.name}
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {formatWeight(mark.weight)}
                </span>
              </div>
            ))}
          </div>
        </MetricCard>

        <MetricCard
          icon={TrendingUp}
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
          title="Прогресс выполнения месячного плана"
          value={`${formatWeight(planCompletion.actual)} из ${formatWeight(planCompletion.planned)}`}
          valueColor={getCompletionColor(planCompletion.actual, planCompletion.planned)}
        >
          <div className="mt-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {planCompletion.actual >= planCompletion.planned 
                ? <>Перевыполнение: <span className="font-bold text-emerald-500 dark:text-emerald-400">+{formatWeight(planCompletion.difference)}</span></>
                : <>До плана: <span className="font-bold text-rose-500 dark:text-rose-400">{formatWeight(Math.abs(planCompletion.difference))}</span></>}
            </p>
          </div>
        </MetricCard>
      </div>
    </div>
  );
};

export default MetricsPanel;