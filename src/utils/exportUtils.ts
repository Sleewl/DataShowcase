import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { utils, writeFile as writeXLSX } from 'xlsx';

import {
  PlanFactStatusData,
  Installation,
  CollisionDynamicsData,
  DashboardView,
  StatusRole,
  InstallationRole
} from '../types';

const PDF_CONFIG = {
  page: {
    width: 297,
    height: 210,
    margins: { left: 15, right: 15, top: 20, bottom: 20 }
  },
  title: {
    fontSize: 22,
    verticalOffset: 10
  },
  spacing: 15
};

async function renderRussianText(text: string, fontSize: number) {
  const div = document.createElement('div');
  Object.assign(div.style, {
    position: 'absolute', left: '-9999px',
    fontFamily: 'PT Sans, Arial', fontSize: `${fontSize}px`,
    whiteSpace: 'nowrap', backgroundColor: '#ffffff',
    padding: '6px 10px', lineHeight: '1.7', boxSizing: 'content-box'
  });
  div.textContent = text;
  document.body.appendChild(div);

  const canvas = await html2canvas(div, {
    scale: 2,
    logging: false,
    backgroundColor: '#ffffff'
  });
  document.body.removeChild(div);

  return {
    data: canvas.toDataURL('image/png'),
    width: canvas.width * 0.264583,
    height: canvas.height * 0.264583
  };
}

async function captureElement(el: HTMLElement): Promise<string> {
  const canvas = await html2canvas(el, {
    scale: 2,
    logging: false,
    useCORS: true,
    backgroundColor: '#ffffff',
    onclone: cloned => {
      cloned.documentElement.style.fontFamily = 'PT Sans, Arial';
      cloned.body.style.visibility = 'visible';
    }
  });
  return canvas.toDataURL('image/png');
}

function addImageWithPageBreak(
  doc: jsPDF,
  imgData: string,
  cursorY: number,
  maxWidth: number
): number {
  const props = doc.getImageProperties(imgData);
  let w = maxWidth * 0.8;
  let h = (props.height * w) / props.width;
  const bottom = PDF_CONFIG.page.height - PDF_CONFIG.page.margins.bottom;

  if (cursorY + h > bottom) {
    const avail = bottom - cursorY;
    if (avail > 20) {
      const scale = avail / h;
      w *= scale;
      h *= scale;
    } else {
      doc.addPage();
      cursorY = PDF_CONFIG.page.margins.top;
    }
  }
  if (cursorY + h > bottom) {
    doc.addPage();
    cursorY = PDF_CONFIG.page.margins.top;
  }
  const x = (PDF_CONFIG.page.width - w) / 2;
  doc.addImage(imgData, 'PNG', x, cursorY, w, h);
  return cursorY + h + PDF_CONFIG.spacing;
}

async function svgToPngDataUrl(svg: SVGElement): Promise<string> {
  if (!svg.getAttribute('xmlns')) {
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }
  const xml = new XMLSerializer().serializeToString(svg);
  const base64 = btoa(unescape(encodeURIComponent(xml)));
  const imgSrc = `data:image/svg+xml;base64,${base64}`;

  const img = new Image();
  img.src = imgSrc;
  await new Promise(res => (img.onload = res));

  const width = svg.viewBox.baseVal.width || svg.clientWidth;
  const height = svg.viewBox.baseVal.height || svg.clientHeight;
  const canvas = document.createElement('canvas');
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL('image/png');
}

export const exportToPDF = async (
  data: PlanFactStatusData[] | Installation[] | CollisionDynamicsData[],
  title: string,
  view: DashboardView,
  role: StatusRole | InstallationRole
): Promise<void> => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });

  const titleImg = await renderRussianText(title, PDF_CONFIG.title.fontSize);
  const titleX = (PDF_CONFIG.page.width - titleImg.width) / 2;
  const titleY = PDF_CONFIG.title.verticalOffset;
  doc.addImage(titleImg.data, 'PNG', titleX, titleY, titleImg.width, titleImg.height);

  let cursorY = titleY + titleImg.height + PDF_CONFIG.spacing;
  const maxW = PDF_CONFIG.page.width - PDF_CONFIG.page.margins.left - PDF_CONFIG.page.margins.right;

  if (view === 'installations') {
    const polarEl = document.querySelector<HTMLElement>('.PolarRiskChart');
    if (polarEl) {
      const img = await captureElement(polarEl);
      cursorY = addImageWithPageBreak(doc, img, cursorY, maxW);
    }
    const metricsGrid = document.querySelector<HTMLElement>('.space-y-6 > .grid');
    if (metricsGrid) {
      const img = await captureElement(metricsGrid);
      cursorY = addImageWithPageBreak(doc, img, cursorY, maxW);
    }

    const charts = Array.from(document.querySelectorAll<HTMLElement>('.recharts-wrapper'));
    const byPass = charts.slice(1);
    for (const chart of byPass) {
      const img = await captureElement(chart);
      cursorY = addImageWithPageBreak(doc, img, cursorY, maxW);
    }
  } else {
    const metricsPanel = document.querySelector<HTMLElement>('.metrics-panel');
    if (metricsPanel) {
      const img = await captureElement(metricsPanel);
      cursorY = addImageWithPageBreak(doc, img, cursorY, maxW);
    }
    const charts = Array.from(document.querySelectorAll<HTMLElement>('.recharts-wrapper'));
    for (const chart of charts) {
      const img = await captureElement(chart);
      cursorY = addImageWithPageBreak(doc, img, cursorY, maxW);
    }
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
    const wsData = [
      [
        'Отправочная марка',
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
      ...(data as PlanFactStatusData[]).map(item => [
        item.name,
        item.profile,
        item.weight,
        item.planned_dates.restrictions1,
        item.planned_dates.techRestrictions,
        item.planned_dates.resourceRestrictions,
        item.planned_dates.installation,
        item.actual_dates.restrictions1,
        item.actual_dates.techRestrictions,
        item.actual_dates.resourceRestrictions,
        item.actual_dates.installation
      ])
    ];
    const ws = utils.aoa_to_sheet(wsData);
    utils.book_append_sheet(wb, ws, 'План-факт-статус');

  } else if (view === 'installations') {
    const installations = data as Installation[];
    const summaryData = [
      ['Установка', 'Всего коллизий', 'ДУ > 40 мм', 'ДУ ≤ 40 мм'],
      ...installations.map(i => [
        i.name,
        i.totalCollisions,
        i.totalDuOver40,
        i.totalDuUnder40
      ])
    ];
    const wsSummary = utils.aoa_to_sheet(summaryData);
    utils.book_append_sheet(wb, wsSummary, 'Сводка');

    installations.forEach(inst => {
      const instData = [
        ['Секция', 'Дисциплина 1', 'Дисциплина 2', 'Кол-во коллизий', 'ДУ > 40', 'ДУ ≤ 40'],
        ...inst.data.map(row => [
          row.section,
          row.discipline1,
          row.discipline2,
          row.collisionCount,
          row.duOver40,
          row.duUnder40
        ])
      ];
      const wsInst = utils.aoa_to_sheet(instData);
      utils.book_append_sheet(wb, wsInst, inst.name);
    });

  } else if (view === 'dynamics') {
    const dyn = data as CollisionDynamicsData[];
    const wsData = [
      ['Месяц', 'Всего', 'ДУ > 40 мм', 'ДУ ≤ 40 мм', 'Не определено'],
      ...dyn.map(item => [
        item.month,
        item.total,
        item.diameters.over40,
        item.diameters.between2and40,
        item.diameters.undefined
      ])
    ];
    const ws = utils.aoa_to_sheet(wsData);
    utils.book_append_sheet(wb, ws, 'Динамика');
  }

  // ключевой вызов: writeXLSX
  writeXLSX(wb, `${title.replace(/\s+/g, '_')}.xlsx`);
};