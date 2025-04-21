import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Installation } from '../types';

interface InstallationSectionDrilldownProps {
  installation: Installation | undefined;
}

const InstallationSectionDrilldown: React.FC<InstallationSectionDrilldownProps> = ({ installation }) => {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const sectionData = useMemo(() => {
    if (!installation?.data) {
      return new Map();
    }

    const sections = new Map<string, { 
      totalCollisions: number,
      duOver40: number,
      duUnder40: number,
      disciplines: Map<string, number>
    }>();

    installation.data.forEach(item => {
      if (!sections.has(item.section)) {
        sections.set(item.section, {
          totalCollisions: 0,
          duOver40: 0,
          duUnder40: 0,
          disciplines: new Map()
        });
      }

      const sectionStats = sections.get(item.section)!;
      sectionStats.totalCollisions += item.collisionCount;
      sectionStats.duOver40 += item.duOver40;
      sectionStats.duUnder40 += item.duUnder40;

      const disciplinePair = `${item.discipline1}-${item.discipline2}`;
      sectionStats.disciplines.set(
        disciplinePair,
        (sectionStats.disciplines.get(disciplinePair) || 0) + item.collisionCount
      );
    });

    return sections;
  }, [installation]);

  if (!installation?.data) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <p className="text-gray-500 dark:text-gray-400 text-center">Нет данных для отображения</p>
      </div>
    );
  }

  const chartData = Array.from(sectionData.entries()).map(([section, stats]) => ({
    section,
    totalCollisions: stats.totalCollisions,
    duOver40: stats.duOver40,
    duUnder40: stats.duUnder40
  }));

  const selectedSectionData = selectedSection && sectionData.has(selectedSection) ? {
    section: selectedSection,
    stats: sectionData.get(selectedSection)!,
    disciplineData: Array.from(sectionData.get(selectedSection)!.disciplines.entries())
      .map(([pair, count]) => ({
        pair,
        count,
        percentage: (count / sectionData.get(selectedSection)!.totalCollisions) * 100
      }))
      .sort((a, b) => b.count - a.count)
  } : null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">Всего коллизий: {payload[0].value}</p>
          <p className="text-green-600">ДУ более 40 мм: {payload[1].value}</p>
          <p className="text-orange-600">ДУ менее 40 мм: {payload[2].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Распределение коллизий по секциям
        </h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              onClick={(data) => data && setSelectedSection(data.activeLabel)}
            >
              <XAxis
                dataKey="section"
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                className="dark:stroke-gray-400 dark:fill-gray-400"
              />
              <YAxis 
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                className="dark:stroke-gray-400 dark:fill-gray-400"
                tickLine={false}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={false}
              />
              <Legend 
                wrapperStyle={{ color: '#6b7280' }}
                className="dark:text-gray-400"
              />
              <Bar 
                dataKey="totalCollisions" 
                name="Всего коллизий" 
                fill="#3b82f6"
                style={{ cursor: 'pointer' }}
              />
              <Bar 
                dataKey="duOver40" 
                name="ДУ более 40 мм" 
                fill="#22c55e"
                style={{ cursor: 'pointer' }}
              />
              <Bar 
                dataKey="duUnder40" 
                name="ДУ менее 40 мм" 
                fill="#f97316"
                style={{ cursor: 'pointer' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {selectedSectionData && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Детализация секции {selectedSectionData.section}
            </h2>
            <button
              onClick={() => setSelectedSection(null)}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Вернуться к общему виду
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Всего коллизий</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {selectedSectionData.stats.totalCollisions}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">ДУ более 40 мм</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {selectedSectionData.stats.duOver40}
              </p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">ДУ менее 40 мм</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {selectedSectionData.stats.duUnder40}
              </p>
            </div>
          </div>

          <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">
            Распределение по дисциплинам
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Пара дисциплин
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Количество коллизий
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    % от общего
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {selectedSectionData.disciplineData.map(({ pair, count, percentage }) => (
                  <tr key={pair} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{pair}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {percentage.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstallationSectionDrilldown;