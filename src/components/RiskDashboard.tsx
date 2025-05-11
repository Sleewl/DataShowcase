import React from 'react';
import { Installation } from '../types';

interface RiskDashboardProps {
  installations: Installation[];
}

const RiskDashboard: React.FC<RiskDashboardProps> = ({ installations }) => {
  // Calculate risk levels based on collision data
  const calculateRiskLevel = (installation: Installation) => {
    const collisionRate = installation.totalCollisions / installation.data.length;
    const duOver40Percentage = (installation.totalDuOver40 / installation.totalCollisions) * 100;
    
    if (collisionRate > 20 && duOver40Percentage > 70) return 'critical';
    if (collisionRate > 15 || duOver40Percentage > 50) return 'high';
    if (collisionRate > 10 || duOver40Percentage > 30) return 'medium';
    return 'low';
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskRecommendation = (installation: Installation, riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'Требуется немедленная проверка и корректировка';
      case 'high':
        return 'Рекомендуется проверка в ближайшее время';
      case 'medium':
        return 'Плановый мониторинг';
      case 'low':
        return 'Штатный режим работы';
      default:
        return 'Нет данных';
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Карта риска установок
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {installations.map((installation) => {
          const riskLevel = calculateRiskLevel(installation);
          const riskColor = getRiskColor(riskLevel);
          const recommendation = getRiskRecommendation(installation, riskLevel);
          
          return (
            <div key={installation.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-md font-medium">{installation.name}</h3>
                <div className={`w-3 h-3 rounded-full ${riskColor}`}></div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Всего коллизий:</span>
                  <span className="font-medium">{installation.totalCollisions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ду&gt;40 мм:</span>
                  <span className="font-medium">{installation.totalDuOver40}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ду&le;40 мм:</span>
                  <span className="font-medium">{installation.totalDuUnder40}</span>
                </div>
                
                <div className="mt-4 pt-2 border-t">
                  <p className="text-sm text-gray-600">Рекомендация:</p>
                  <p className="text-sm font-medium mt-1">{recommendation}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Легенда уровней риска:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm">Критический</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-sm">Высокий</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm">Средний</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm">Низкий</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskDashboard;