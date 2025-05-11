import React, { useState, useMemo } from 'react';
import { parseISO, format, startOfMonth, startOfYear } from 'date-fns';
import Header from './components/Header';
import { MonthlyWeightChart, YearlyWeightChart, QuarterlyVolumeChart } from './components/BarCharts';
import MetricsPanel from './components/MetricsPanel';
import DataTable from './components/DataTable';
import InstallationTable from './components/InstallationTable';
import InstallationPieChart from './components/InstallationPieChart';
import InstallationSectionDrilldown from './components/InstallationSectionDrilldown';
import RiskDashboard from './components/RiskDashboard';
import PolarRiskChart from './components/PolarRiskChart';
import { TotalCollisionsChart, InstallationsCollisionsChart, DiameterCollisionsChart } from './components/DynamicsCharts';
import DynamicsMetrics from './components/DynamicsMetrics';
import Login from './components/Login';
import { useAuth } from './hooks/useAuth';
import { usePlanFactStatus, useInstallationData } from './hooks/useData';
import { exportToPDF, exportToExcel } from './utils/exportUtils';
import { dynamicsData } from './data/dynamicsData';
import CollisionGrowthGauge from './components/CollisionGrowthGauge';
import TotalCollisionsCounter from './components/TotalCollisionsCounter';
import { 
  filterData, 
  calculateMonthlyWeightData,
  calculateYearlyWeightData,
  calculateQuarterlyVolumeData,
  calculateMonthlyMetrics
} from './utils/dataProcessing';
import { 
  StatusType, 
  StatusLabel, 
  FilterState,
  StatusRole,
  InstallationRole,
  DashboardView,
  PlanFactStatusData,
  InstallationDBData
} from './types';

function App() {
  const { user, login, logout, canSelectRole } = useAuth();
  const [statusRole, setStatusRole] = useState<StatusRole>('operator');
  const [installationRole, setInstallationRole] = useState<InstallationRole>('executor');
  const [dashboardView, setDashboardView] = useState<DashboardView>('status');
  const [selectedInstallationId, setSelectedInstallationId] = useState(1);
  const [responsibleInstallationId, setResponsibleInstallationId] = useState<number | null>(null);

  const { data: planFactData, loading: planFactLoading } = usePlanFactStatus();
  const { data: installationData, loading: installationLoading } = useInstallationData(selectedInstallationId);

  const availableStatuses: StatusLabel[] = [
    { key: 'restrictions1', label: 'Ограничения по предпроектированию' },
    { key: 'techRestrictions', label: 'Технологические ограничения' },
    { key: 'resourceRestrictions', label: 'Ресурсные ограничения' },
    { key: 'installation', label: 'Монтаж' }
  ];
  
  const [selectedStatus, setSelectedStatus] = useState<StatusType>('installation');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  
  const currentMonth = useMemo(() => startOfMonth(new Date(selectedYear, selectedMonth)), [selectedYear, selectedMonth]);
  
  const filteredData = useMemo(() => {
    if (!planFactData) return [];
    return planFactData as PlanFactStatusData[];
  }, [planFactData]);
  
  const monthlyWeightData = useMemo(() => {
    return calculateMonthlyWeightData(filteredData, currentMonth);
  }, [filteredData, currentMonth]);

  const yearlyWeightData = useMemo(() => {
    return calculateYearlyWeightData(filteredData, selectedYear);
  }, [filteredData, selectedYear]);

  const quarterlyVolumeData = useMemo(() => {
    return calculateQuarterlyVolumeData(filteredData, selectedYear);
  }, [filteredData, selectedYear]);

  const monthlyMetrics = useMemo(() => {
    return calculateMonthlyMetrics(filteredData, currentMonth);
  }, [filteredData, currentMonth]);
  
  const selectedStatusLabel = availableStatuses.find(s => s.key === selectedStatus)?.label || '';
  
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const calculateYearlyCollisions = (installations: Installation[], year: number) => {
    return installations.reduce((total, installation) => {
      return total + installation.totalCollisions;
    }, 0);
  };

  const handleExportPDF = () => {
    let exportData;
    let title;

    if (dashboardView === 'status') {
      exportData = filteredData;
      title = 'Отчет по план-факт-статус';
      exportToPDF(exportData, title, dashboardView, statusRole);
    } else if (dashboardView === 'installations') {
      exportData = installationData;
      title = 'Отчет по коллизиям установок';
      exportToPDF(exportData, title, dashboardView, installationRole);
    } else if (dashboardView === 'dynamics') {
      exportData = dynamicsData;
      title = 'Отчет по динамике коллизий';
      exportToPDF(exportData, title, dashboardView, statusRole);
    }
  };

  const handleExportExcel = () => {
    let exportData;
    let title;

    if (dashboardView === 'status') {
      // Take only first 100 items for Excel export to prevent performance issues
      exportData = filteredData.slice(0, 100);
      title = 'План-факт статус';
      exportToExcel(exportData, title, dashboardView, statusRole);
    } else if (dashboardView === 'installations') {
      exportData = installationData;
      title = 'Отчет по установкам';
      exportToExcel(exportData, title, dashboardView, installationRole);
    } else if (dashboardView === 'dynamics') {
      exportData = dynamicsData;
      title = 'Динамика коллизий';
      exportToExcel(exportData, title, dashboardView, statusRole);
    }
  };

  const handleDashboardViewChange = (view: DashboardView) => {
    setDashboardView(view);
    if (view === 'installations' && installationData && installationData.length > 0) {
      setSelectedInstallationId(installationData[0].id);
    }
  };

  if (!user) {
    return <Login onLogin={login} />;
  }

  if (planFactLoading || installationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-xl font-semibold text-gray-700 dark:text-gray-200">Загрузка данных...</div>
      </div>
    );
  }

  const renderDynamicsView = () => {
    if (statusRole === 'technical') {
      return (
        <>
          <DynamicsMetrics data={dynamicsData} />
          <TotalCollisionsChart data={dynamicsData} />
          <InstallationsCollisionsChart data={dynamicsData} />
          <DiameterCollisionsChart data={dynamicsData} />
        </>
      );
    }

    if (statusRole === 'executive') {
      return (
        <>
          <DynamicsMetrics data={dynamicsData} />
          <TotalCollisionsChart data={dynamicsData} />
          <InstallationsCollisionsChart data={dynamicsData} />
        </>
      );
    }

    if (statusRole === 'operator') {
      return (
        <>
          <DynamicsMetrics data={dynamicsData} />
          <DiameterCollisionsChart data={dynamicsData} />
        </>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <Header 
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
        onLogout={logout}
        userRole={user.role}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => handleDashboardViewChange('status')}
              className={`px-4 py-2 rounded-md ${
                dashboardView === 'status'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              План-факт-статус
            </button>
            <button
              onClick={() => handleDashboardViewChange('installations')}
              className={`px-4 py-2 rounded-md ${
                dashboardView === 'installations'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Коллизии по установкам
            </button>
            <button
              onClick={() => handleDashboardViewChange('dynamics')}
              className={`px-4 py-2 rounded-md ${
                dashboardView === 'dynamics'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Динамика коллизий
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(dashboardView === 'status' || dashboardView === 'dynamics') ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Роль пользователя ({dashboardView === 'status' ? 'План-факт-статус' : 'Динамика коллизий'})
                </label>
                <select
                  value={statusRole}
                  onChange={(e) => {
                    const newRole = e.target.value as StatusRole;
                    if (canSelectRole(newRole)) {
                      setStatusRole(newRole);
                    }
                  }}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {dashboardView === 'dynamics' ? (
                    <>
                      {canSelectRole('operator') && <option value="operator">Исполнитель</option>}
                      {canSelectRole('executive') && <option value="executive">Руководитель</option>}
                      {canSelectRole('technical') && <option value="technical">Технический специалист</option>}
                    </>
                  ) : (
                    <>
                      {canSelectRole('operator') && <option value="operator">Исполнитель</option>}
                      {canSelectRole('executive') && <option value="executive">Руководитель</option>}
                      {canSelectRole('technical') && <option value="technical">Технический специалист</option>}
                    </>
                  )}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Роль пользователя (Установки)
                </label>
                <select
                  value={installationRole}
                  onChange={(e) => {
                    const newRole = e.target.value as InstallationRole;
                    if (canSelectRole(newRole)) {
                      setInstallationRole(newRole);
                      if (newRole === 'executor') {
                        setResponsibleInstallationId(1);
                      } else {
                        setResponsibleInstallationId(null);
                      }
                    }
                  }}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {canSelectRole('executor') && <option value="executor">Исполнитель</option>}
                  {canSelectRole('executive') && <option value="executive">Руководитель</option>}
                  {canSelectRole('technical') && <option value="technical">Технический специалист</option>}
                </select>
                {installationRole === 'executor' && (
                  <select
                    value={responsibleInstallationId || 1}
                    onChange={(e) => setResponsibleInstallationId(Number(e.target.value))}
                    className="block w-full mt-2 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {[1, 2, 3, 4, 5].map(id => (
                      <option key={id} value={id}>Установка {id}</option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>
        </div>

        {dashboardView === 'status' && (
          <>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Параметры отображения</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Год
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Месяц
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {months.map((month, index) => (
                      <option key={index} value={index}>{month}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Статус
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as StatusType)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {availableStatuses.map((status) => (
                      <option key={status.key} value={status.key}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <MetricsPanel 
              monthlyData={monthlyMetrics}
              selectedStatus={selectedStatus}
              statusLabel={selectedStatusLabel}
            />

            <div className="space-y-6">
              {(statusRole === 'operator' || statusRole === 'technical') && (
                <MonthlyWeightChart 
                  data={monthlyWeightData} 
                  month={currentMonth}
                  year={selectedYear}
                  height={400}
                />
              )}

              {(statusRole === 'executive' || statusRole === 'technical') && (
                <YearlyWeightChart 
                  data={yearlyWeightData} 
                  year={selectedYear}
                  height={400}
                />
              )}

              {(statusRole === 'executive' || statusRole === 'technical') && (
                <QuarterlyVolumeChart
                  data={quarterlyVolumeData}
                  year={selectedYear}
                />
              )}
            </div>
            
            {(statusRole === 'technical') && (
              <DataTable 
                data={filteredData}
                selectedStatus={selectedStatus}
              />
            )}
          </>
        )}

        {dashboardView === 'installations' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CollisionGrowthGauge
                currentYearCollisions={calculateYearlyCollisions(installationData || [], 2025)}
                previousYearCollisions={calculateYearlyCollisions(installationData || [], 2024)}
              />
              <TotalCollisionsCounter
                currentYearCollisions={calculateYearlyCollisions(installationData || [], 2025)}
                previousYearCollisions={calculateYearlyCollisions(installationData || [], 2024)}
              />
            </div>

            {(installationRole === 'executive' || installationRole === 'technical') && (
              <>
                <PolarRiskChart installations={installationData} />
                <InstallationPieChart installations={installationData} />
              </>
            )}

            {installationRole === 'technical' && (
              <>
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6">
                  <div className="flex space-x-4">
                    {installationData && installationData.map((installation) => (
                      <button
                        key={installation.id}
                        onClick={() => setSelectedInstallationId(installation.id)}
                        className={`px-4 py-2 rounded-md ${
                          selectedInstallationId === installation.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {installation.name}
                      </button>
                    ))}
                  </div>
                </div>

                <InstallationSectionDrilldown 
                  installation={installationData?.find(i => i.id === selectedInstallationId)}
                />
                <InstallationTable 
                  installation={installationData?.find(i => i.id === selectedInstallationId)}
                />
              </>
            )}

            {installationRole === 'executor' && (
              <InstallationSectionDrilldown 
                installation={installationData?.find(i => i.id === responsibleInstallationId)}
              />
            )}
          </div>
        )}

        {dashboardView === 'dynamics' && (
          <div className="space-y-6">
            {renderDynamicsView()}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;