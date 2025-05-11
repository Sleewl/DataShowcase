import React from 'react';
import { Installation } from '../types';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

interface PolarRiskChartProps {
  installations: Installation[];
}

const PolarRiskChart: React.FC<PolarRiskChartProps> = ({ installations }) => {
  const calculateRiskScore = (installation: Installation) => {
    const collisionRate = installation.totalCollisions / installation.data.length;
    const duOver40Rate = installation.totalDuOver40 / installation.totalCollisions;
    const sectionComplexity = new Set(installation.data.map(d => d.section)).size;
    
    let score = 0;
    
    if (collisionRate > 15) score += 2;
    else if (collisionRate > 8) score += 1;
    
    if (duOver40Rate > 0.7) score += 2;
    else if (duOver40Rate > 0.4) score += 1;
    
    if (sectionComplexity > 5) score += 1;
    
    return score;
  };

  const radarData = installations.map(installation => ({
    subject: installation.name, // Используем оригинальное название установки
    score: calculateRiskScore(installation),
    collisions: installation.totalCollisions
  }));

  const riskTableData = radarData
    .map(item => ({
      name: item.subject,
      score: item.score,
      details: `${item.collisions} коллизий`
    }))
    .sort((a, b) => b.score - a.score);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100">{data.subject}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Оценка риска: {data.score}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Коллизий: {data.collisions}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Полярная карта рисков
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
            Общая оценка (балл)
          </h3>
          <div className="overflow-hidden">
            <table className="min-w-full">
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {riskTableData.map((item, index) => (
                  <tr key={index}>
                    <td className="py-2 text-sm text-gray-900 dark:text-gray-100">{item.name}</td>
                    <td className="py-2 text-sm text-gray-500 dark:text-gray-400">{item.details}</td>
                    <td className="py-2 text-sm text-gray-900 dark:text-gray-100 text-right font-medium">
                      <span className={`px-2 py-1 rounded ${
                        item.score >= 4 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        item.score >= 2 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {item.score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="h-[450px]"> {/* Увеличена высота */}
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart 
              data={radarData}
              outerRadius="75%" // Уменьшен радиус диаграммы
              margin={{ top: 30, right: 30, bottom: 30, left: 30 }} // Добавлены отступы
            >
              <PolarGrid stroke="#e5e7eb" className="dark:stroke-gray-600" />
              <PolarAngleAxis 
                dataKey="subject"
                tick={{
                  fill: '#374151',
                  className: 'dark:fill-gray-300 text-xs',
                  dy: -8, // Вертикальное смещение меток
                  fontSize: 14 // Размер шрифта
                }}
              />
              <PolarRadiusAxis 
                angle={90}
                domain={[0, 4]}
                tick={{ fill: '#374151', className: 'dark:fill-gray-300' }}
                tickCount={5}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Radar
                name="Риск"
                dataKey="score"
                stroke="#f97316"
                fill="#f97316"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PolarRiskChart;