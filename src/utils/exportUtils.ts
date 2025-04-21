import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { utils, writeFile } from 'xlsx';
import html2canvas from 'html2canvas';
import { PlanFactStatusData, Installation, CollisionDynamicsData, DashboardView, StatusRole, InstallationRole } from '../types';
import { formatDateForDisplay } from './dataProcessing';

export const exportToPDF = async (
  data: PlanFactStatusData[] | Installation[] | CollisionDynamicsData[],
  title: string,
  view: DashboardView,
  role: StatusRole | InstallationRole
): Promise<void> => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 22);

  const charts = document.querySelectorAll('.recharts-wrapper');
  let currentY = 30;

  for (const chart of charts) {
    try {
      const canvas = await html2canvas(chart as HTMLElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: null
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 180;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add new page if chart won't fit
      if (currentY + imgHeight > 280) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.addImage(imgData, 'PNG', 15, currentY, imgWidth, imgHeight);
      currentY += imgHeight + 10;
    } catch (error) {
      console.error('Error capturing chart:', error);
    }
  }

  doc.addPage();
  currentY = 20;

  if (view === 'status') {
    exportPlanFactStatusToPDF(doc, data as PlanFactStatusData[], role as StatusRole);
  } else if (view === 'installations') {
    exportInstallationsToPDF(doc, data as Installation[], role as InstallationRole);
  } else if (view === 'dynamics') {
    exportDynamicsToPDF(doc, data as CollisionDynamicsData[], role as InstallationRole);
  }

  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
};

export const exportToExcel = (
  data: PlanFactStatusData[] | Installation[] | CollisionDynamicsData[],
  title: string,
  view: DashboardView,
  role: StatusRole | InstallationRole
): void => {
  const wb = utils.book_new();

  if (view === 'status') {
    exportPlanFactStatusToExcel(wb, data as PlanFactStatusData[], role as StatusRole);
  } else if (view === 'installations') {
    exportInstallationsToExcel(wb, data as Installation[], role as InstallationRole);
  } else if (view === 'dynamics') {
    exportDynamicsToExcel(wb, data as CollisionDynamicsData[], role as InstallationRole);
  }

  writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`);
};

const exportPlanFactStatusToPDF = (doc: jsPDF, data: PlanFactStatusData[], role: StatusRole) => {
  if (role === 'operator' || role === 'manager' || role === 'technical') {
    const tableColumn = [
      'Отправочная', 
      'Профиль', 
      'Вес (кг)', 
      'План: Огр. предпр.', 
      'План: Тех. огр.', 
      'План: Рес. огр.', 
      'План: Монтаж', 
      'Факт: Огр. предпр.', 
      'Факт: Тех. огр.', 
      'Факт: Рес. огр.', 
      'Факт: Монтаж'
    ];

    const tableRows = data.map(item => [
      item.name,
      item.profile,
      item.weight.toString(),
      formatDateForDisplay(item.planned_dates.restrictions1),
      formatDateForDisplay(item.planned_dates.techRestrictions),
      formatDateForDisplay(item.planned_dates.resourceRestrictions),
      formatDateForDisplay(item.planned_dates.installation),
      formatDateForDisplay(item.actual_dates.restrictions1),
      formatDateForDisplay(item.actual_dates.techRestrictions),
      formatDateForDisplay(item.actual_dates.resourceRestrictions),
      formatDateForDisplay(item.actual_dates.installation)
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 1 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 20 },
        2: { cellWidth: 15 }
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      }
    });
  }
};

const exportInstallationsToPDF = (doc: jsPDF, data: Installation[], role: InstallationRole) => {
  if (role === 'technical' || role === 'executive') {
    const tableColumn = [
      'Установка',
      'Всего коллизий',
      'ДУ > 40 мм',
      'ДУ ≤ 40 мм',
      'Версия',
      'Дата'
    ];

    const tableRows = data.map(item => [
      item.name,
      item.totalCollisions.toString(),
      item.totalDuOver40.toString(),
      item.totalDuUnder40.toString(),
      item.version,
      item.date
    ]);

    // @ts-ignore
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 1 },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold'
      }
    });
  }

  if (role === 'technical' || role === 'executor') {
    data.forEach((installation, index) => {
      if (index > 0) doc.addPage();

      doc.text(`${installation.name} - Детализация`, 14, doc.autoTable.previous.finalY + 10);

      const detailsColumn = [
        'Секция',
        'Дисциплина 1',
        'Дисциплина 2',
        'Кол-во коллизий',
        'ДУ > 40',
        'ДУ ≤ 40'
      ];

      const detailsRows = installation.data.map(item => [
        item.section,
        item.discipline1,
        item.discipline2,
        item.collisionCount.toString(),
        item.duOver40.toString(),
        item.duUnder40.toString()
      ]);

      // @ts-ignore
      doc.autoTable({
        head: [detailsColumn],
        body: detailsRows,
        startY: doc.autoTable.previous.finalY + 15,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 1 },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontSize: 8,
          fontStyle: 'bold'
        }
      });
    });
  }
};

const exportDynamicsToPDF = (doc: jsPDF, data: CollisionDynamicsData[], role: InstallationRole) => {
  if (role === 'technical' || role === 'executive') {
    const tableColumn = [
      'Месяц',
      'Всего',
      'Уст. 1',
      'Уст. 2',
      'Уст. 3',
      'Уст. 4',
      'Уст. 5'
    ];

    const tableRows = data.map(item => [
      item.month,
      item.total.toString(),
      item.installations['1'].toString(),
      item.installations['2'].toString(),
      item.installations['3'].toString(),
      item.installations['4'].toString(),
      item.installations['5'].toString()
    ]);

    // @ts-ignore
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 1 },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold'
      }
    });
  }

  if (role === 'technical' || role === 'executor') {
    if (doc.autoTable.previous) doc.addPage();

    const diameterColumn = [
      'Месяц',
      'Всего',
      '> 40 мм',
      '20-40 мм',
      '< 20 мм',
      'Не опр.'
    ];

    const diameterRows = data.map(item => [
      item.month,
      item.total.toString(),
      item.diameters.over40.toString(),
      item.diameters.between20and40.toString(),
      item.diameters.under20.toString(),
      item.diameters.undefined.toString()
    ]);

    // @ts-ignore
    doc.autoTable({
      head: [diameterColumn],
      body: diameterRows,
      startY: doc.autoTable.previous ? doc.autoTable.previous.finalY + 15 : 30,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 1 },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold'
      }
    });
  }
};

const exportPlanFactStatusToExcel = (wb: any, data: PlanFactStatusData[], role: StatusRole) => {
  if (role === 'operator' || role === 'manager' || role === 'technical') {
    const wsData = [
      [
        'Отправочная', 
        'Профиль', 
        'Вес (кг)', 
        'План: Огр. предпр.', 
        'План: Тех. огр.', 
        'План: Рес. огр.', 
        'План: Монтаж', 
        'Факт: Огр. предпр.', 
        'Факт: Тех. огр.', 
        'Факт: Рес. огр.', 
        'Факт: Монтаж'
      ],
      ...data.map(item => [
        item.name,
        item.profile,
        item.weight,
        formatDateForDisplay(item.planned_dates.restrictions1),
        formatDateForDisplay(item.planned_dates.techRestrictions),
        formatDateForDisplay(item.planned_dates.resourceRestrictions),
        formatDateForDisplay(item.planned_dates.installation),
        formatDateForDisplay(item.actual_dates.restrictions1),
        formatDateForDisplay(item.actual_dates.techRestrictions),
        formatDateForDisplay(item.actual_dates.resourceRestrictions),
        formatDateForDisplay(item.actual_dates.installation)
      ])
    ];

    const ws = utils.aoa_to_sheet(wsData);
    utils.book_append_sheet(wb, ws, 'План-факт-статус');
  }
};

const exportInstallationsToExcel = (wb: any, data: Installation[], role: InstallationRole) => {
  if (role === 'technical' || role === 'executive') {
    const summaryData = [
      [
        'Установка',
        'Всего коллизий',
        'ДУ > 40 мм',
        'ДУ ≤ 40 мм',
        'Версия',
        'Дата'
      ],
      ...data.map(item => [
        item.name,
        item.totalCollisions,
        item.totalDuOver40,
        item.totalDuUnder40,
        item.version,
        item.date
      ])
    ];

    const wsSummary = utils.aoa_to_sheet(summaryData);
    utils.book_append_sheet(wb, wsSummary, 'Сводка');
  }

  if (role === 'technical' || role === 'executor') {
    data.forEach(installation => {
      const detailsData = [
        [
          'Секция',
          'Дисциплина 1',
          'Дисциплина 2',
          'Кол-во коллизий',
          'ДУ > 40',
          'ДУ ≤ 40'
        ],
        ...installation.data.map(item => [
          item.section,
          item.discipline1,
          item.discipline2,
          item.collisionCount,
          item.duOver40,
          item.duUnder40
        ])
      ];

      const wsDetails = utils.aoa_to_sheet(detailsData);
      utils.book_append_sheet(wb, wsDetails, installation.name);
    });
  }
};

const exportDynamicsToExcel = (wb: any, data: CollisionDynamicsData[], role: InstallationRole) => {
  if (role === 'technical' || role === 'executive') {
    const installationsData = [
      [
        'Месяц',
        'Всего',
        'Уст. 1',
        'Уст. 2',
        'Уст. 3',
        'Уст. 4',
        'Уст. 5'
      ],
      ...data.map(item => [
        item.month,
        item.total,
        item.installations['1'],
        item.installations['2'],
        item.installations['3'],
        item.installations['4'],
        item.installations['5']
      ])
    ];

    const wsInstallations = utils.aoa_to_sheet(installationsData);
    utils.book_append_sheet(wb, wsInstallations, 'По установкам');
  }

  if (role === 'technical' || role === 'executor') {
    const diameterData = [
      [
        'Месяц',
        'Всего',
        '> 40 мм',
        '20-40 мм',
        '< 20 мм',
        'Не опр.'
      ],
      ...data.map(item => [
        item.month,
        item.total,
        item.diameters.over40,
        item.diameters.between20and40,
        item.diameters.under20,
        item.diameters.undefined
      ])
    ];

    const wsDiameter = utils.aoa_to_sheet(diameterData);
    utils.book_append_sheet(wb, wsDiameter, 'По диаметрам');
  }
};
