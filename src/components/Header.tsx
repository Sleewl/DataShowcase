import React from 'react';
import { FileText, BarChart2, Download, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { UserRole } from '../types';

interface HeaderProps {
  onExportPDF: () => void;
  onExportExcel: () => void;
  onLogout: () => void;
  userRole: UserRole;
}

const Header: React.FC<HeaderProps> = ({ onExportPDF, onExportExcel, onLogout, userRole }) => {
  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'executor':
        return 'Исполнитель';
      case 'executive':
        return 'Руководитель';
      case 'technical':
        return 'Технический специалист';
      default:
        return '';
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <BarChart2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">Динамика СМР по КМ</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {getRoleLabel(userRole)}
            </span>
            <ThemeToggle />
            <button
              onClick={onExportPDF}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus: outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-800"
            >
              <FileText className="h-4 w-4 mr-1" />
              Экспорт PDF
            </button>
            <button
              onClick={onExportExcel}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-offset-gray-800"
            >
              <Download className="h-4 w-4 mr-1" />
              Экспорт Excel
            </button>
            <button
              onClick={onLogout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-offset-gray-800"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Выход
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;