import { CMPItem } from '../types';
import { parseISO, addMonths } from 'date-fns';

export const generateMockData = (): CMPItem[] => {
  const items: CMPItem[] = [];
  
  const profiles = ['ДВУТАВР35Ш2', '12+180', '14+130', '16+140', '20+160'];
  
  const baseItems = [
    { name: 'М1-19', weight: 2251 },
    { name: 'М1-6', weight: 1532 },
    { name: 'М1-6-17', weight: 1450 },
    { name: '58-3', weight: 1241.4 },
    { name: '58-2', weight: 1237 },
    { name: '58-1', weight: 1216.3 },
    { name: '58-2-7', weight: 1180 },
    { name: 'М1-31', weight: 1150 },
    { name: 'М2-15', weight: 980 },
    { name: 'М2-16', weight: 920 },
    { name: 'М3-12', weight: 850 },
    { name: 'М3-14', weight: 780 },
  ];

  const years = [2023, 2024, 2025];
  
  years.forEach(year => {
    for (let month = 0; month < 12; month++) {
      const itemsPerMonth = 15 + Math.floor(Math.random() * 10); 
      
      for (let i = 0; i < itemsPerMonth; i++) {
        const baseItem = baseItems[Math.floor(Math.random() * baseItems.length)];
        const profile = profiles[Math.floor(Math.random() * profiles.length)];
        
        const baseDate = new Date(year, month, 1 + Math.floor(Math.random() * 28));
        const restrictions1Date = baseDate;
        const techRestrictionsDate = addMonths(baseDate, 1);
        const resourceRestrictionsDate = addMonths(baseDate, 2);
        const installationDate = addMonths(baseDate, 3);

        const getActualDate = (plannedDate: Date, variance: number = 14) => {
          const actualDate = new Date(plannedDate);
          actualDate.setDate(actualDate.getDate() + Math.floor(Math.random() * variance) - variance/2);
          return actualDate;
        };

        items.push({
          id: `${year}${(month + 1).toString().padStart(2, '0')}${i.toString().padStart(3, '0')}`,
          name: baseItem.name,
          position: (Math.floor(Math.random() * 999) + 1).toString(),
          profile,
          weight: baseItem.weight * (0.9 + Math.random() * 0.2), // Add some weight variance
          
          plannedDates: {
            restrictions1: restrictions1Date.toISOString().split('T')[0],
            techRestrictions: techRestrictionsDate.toISOString().split('T')[0],
            resourceRestrictions: resourceRestrictionsDate.toISOString().split('T')[0],
            installation: installationDate.toISOString().split('T')[0],
          },
          
          actualDates: {
            restrictions1: getActualDate(restrictions1Date).toISOString().split('T')[0],
            techRestrictions: getActualDate(techRestrictionsDate).toISOString().split('T')[0],
            resourceRestrictions: Math.random() > 0.3 ? getActualDate(resourceRestrictionsDate).toISOString().split('T')[0] : null,
            installation: Math.random() > 0.4 ? getActualDate(installationDate).toISOString().split('T')[0] : null,
          }
        });
      }
    }
  });
  
  return items;
};

export const mockData = generateMockData();
