import { CMPItem, StatusType, DataPoint, MonthlyWeightData, YearlyWeightData, StatusDateData, PlanFactStatusData, InstallationDBData } from '../types';
import { format, parseISO, isValid, addDays, isBefore, isAfter, isSameMonth, isSameYear, startOfMonth, endOfMonth, subMonths } from 'date-fns';

// Get all unique dates from the dataset
export const getUniqueDates = (data: PlanFactStatusData[]): string[] => {
  const datesSet = new Set<string>();
  
  data.forEach(item => {
    // Add planned dates
    if (item.planned_dates) {
      Object.values(item.planned_dates).forEach(date => {
        if (date && isValid(parseISO(date))) {
          datesSet.add(date);
        }
      });
    }
    
    // Add actual dates
    if (item.actual_dates) {
      Object.values(item.actual_dates).forEach(date => {
        if (date && isValid(parseISO(date))) {
          datesSet.add(date);
        }
      });
    }
  });
  
  // Sort dates
  return Array.from(datesSet).sort();
};

// Calculate cumulative status counts for each date
export const calculateCumulativeData = (
  data: PlanFactStatusData[],
  statusType: StatusType,
  startDate: Date,
  endDate: Date
): DataPoint[] => {
  const result: DataPoint[] = [];
  let currentDate = startDate;
  
  let cumulativePlanned = 0;
  let cumulativeActual = 0;
  
  while (isBefore(currentDate, endDate) || currentDate.getTime() === endDate.getTime()) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    
    // Count planned items completed by this date
    const plannedCount = data.filter(item => {
      const plannedDate = item.planned_dates?.[statusType];
      return plannedDate && isBefore(parseISO(plannedDate), addDays(currentDate, 1));
    }).length;
    
    // Count actual items completed by this date
    const actualCount = data.filter(item => {
      const actualDate = item.actual_dates?.[statusType];
      return actualDate && isBefore(parseISO(actualDate), addDays(currentDate, 1));
    }).length;
    
    cumulativePlanned = plannedCount;
    cumulativeActual = actualCount;
    
    result.push({
      date: dateStr,
      planned: plannedCount,
      actual: actualCount,
      cumulativePlanned,
      cumulativeActual
    });
    
    currentDate = addDays(currentDate, 1);
  }
  
  return result;
};

// Calculate cumulative volume (weight) for each date
export const calculateCumulativeVolume = (
  data: PlanFactStatusData[],
  statusType: StatusType,
  startDate: Date,
  endDate: Date
): DataPoint[] => {
  const result: DataPoint[] = [];
  let currentDate = startDate;
  
  let cumulativePlannedVolume = 0;
  let cumulativeActualVolume = 0;
  
  while (isBefore(currentDate, endDate) || currentDate.getTime() === endDate.getTime()) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    
    // Sum weights of planned items completed by this date
    const plannedVolume = data.reduce((sum, item) => {
      const plannedDate = item.planned_dates?.[statusType];
      if (plannedDate && isBefore(parseISO(plannedDate), addDays(currentDate, 1))) {
        return sum + item.weight;
      }
      return sum;
    }, 0);
    
    // Sum weights of actual items completed by this date
    const actualVolume = data.reduce((sum, item) => {
      const actualDate = item.actual_dates?.[statusType];
      if (actualDate && isBefore(parseISO(actualDate), addDays(currentDate, 1))) {
        return sum + item.weight;
      }
      return sum;
    }, 0);
    
    cumulativePlannedVolume = plannedVolume;
    cumulativeActualVolume = actualVolume;
    
    result.push({
      date: dateStr,
      planned: plannedVolume,
      actual: actualVolume,
      cumulativePlanned: cumulativePlannedVolume,
      cumulativeActual: cumulativeActualVolume
    });
    
    currentDate = addDays(currentDate, 1);
  }
  
  return result;
};

// Calculate completion percentage
export const calculateCompletionPercentage = (data: PlanFactStatusData[], statusType: StatusType): number => {
  const totalItems = data.length;
  if (totalItems === 0) return 0;
  
  const completedItems = data.filter(item => item.actual_dates?.[statusType] !== null).length;
  return (completedItems / totalItems) * 100;
};

// Calculate average delay in days
export const calculateAverageDelay = (data: PlanFactStatusData[], statusType: StatusType): number => {
  const itemsWithBothDates = data.filter(
    item => item.planned_dates?.[statusType] && item.actual_dates?.[statusType]
  );
  
  if (itemsWithBothDates.length === 0) return 0;
  
  const totalDelayDays = itemsWithBothDates.reduce((sum, item) => {
    const plannedDate = parseISO(item.planned_dates![statusType]);
    const actualDate = parseISO(item.actual_dates![statusType]!);
    
    // Calculate difference in days
    const diffTime = actualDate.getTime() - plannedDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return sum + diffDays;
  }, 0);
  
  return totalDelayDays / itemsWithBothDates.length;
};

// Filter data based on criteria
export const filterData = (
  data: PlanFactStatusData[],
  searchTerm: string,
  dateRange: [Date | null, Date | null]
): PlanFactStatusData[] => {
  return data.filter(item => {
    // Filter by search term (name or position)
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.profile.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by date range if provided
    let withinDateRange = true;
    if (dateRange[0] && dateRange[1]) {
      const hasDateInRange = (item.planned_dates ? Object.values(item.planned_dates) : []).some(date => {
        if (!date) return false;
        const parsedDate = parseISO(date);
        return (
          isValid(parsedDate) && 
          (isAfter(parsedDate, dateRange[0]!) || parsedDate.getTime() === dateRange[0]!.getTime()) && 
          (isBefore(parsedDate, dateRange[1]!) || parsedDate.getTime() === dateRange[1]!.getTime())
        );
      }) || (item.actual_dates ? Object.values(item.actual_dates) : []).some(date => {
        if (!date) return false;
        const parsedDate = parseISO(date);
        return (
          isValid(parsedDate) && 
          (isAfter(parsedDate, dateRange[0]!) || parsedDate.getTime() === dateRange[0]!.getTime()) && 
          (isBefore(parsedDate, dateRange[1]!) || parsedDate.getTime() === dateRange[1]!.getTime())
        );
      });
      
      withinDateRange = hasDateInRange;
    }
    
    return matchesSearch && withinDateRange;
  });
};

// Format date for display
export const formatDateForDisplay = (dateStr: string | null): string => {
  if (!dateStr) return 'Н/Д';
  try {
    const date = parseISO(dateStr);
    return format(date, 'dd.MM.yyyy');
  } catch (e) {
    return 'Неверная дата';
  }
};

// Calculate monthly weight data
export const calculateMonthlyWeightData = (data: PlanFactStatusData[], selectedMonth: Date): MonthlyWeightData[] => {
  const monthData = new Map<string, number>();

  data.forEach(item => {
    if (item.planned_dates?.installation) {
      try {
        const itemDate = parseISO(item.planned_dates.installation);
        if (isValid(itemDate) && isSameMonth(itemDate, selectedMonth)) {
          const currentWeight = monthData.get(item.name) || 0;
          monthData.set(item.name, currentWeight + item.weight);
        }
      } catch (error) {
        console.warn(`Invalid date format for item ${item.name}:`, error);
      }
    }
  });

  return Array.from(monthData.entries())
    .map(([name, weight]) => ({
      name,
      weight
    }))
    .sort((a, b) => b.weight - a.weight);
};

// Calculate yearly weight data
export const calculateYearlyWeightData = (data: PlanFactStatusData[], selectedYear: number): YearlyWeightData[] => {
  const monthlyData = new Array(12).fill(0).map((_, index) => ({
    month: format(new Date(selectedYear, index), 'MMMM'),
    weight: 0
  }));

  data.forEach(item => {
    if (item.planned_dates?.installation) {
      try {
        const itemDate = parseISO(item.planned_dates.installation);
        if (isValid(itemDate) && isSameYear(itemDate, new Date(selectedYear, 0))) {
          const monthIndex = itemDate.getMonth();
          monthlyData[monthIndex].weight += item.weight;
        }
      } catch (error) {
        console.warn(`Invalid date format for item ${item.name}:`, error);
      }
    }
  });

  return monthlyData;
};

// Calculate status date data
export const calculateStatusDateData = (data: PlanFactStatusData[], status: StatusType): StatusDateData[] => {
  return data.map(item => ({
    name: item.name,
    weight: item.weight,
    plannedDate: item.planned_dates?.[status] || null,
    actualDate: item.actual_dates?.[status] || null
  })).sort((a, b) => {
    const dateA = a.plannedDate ? parseISO(a.plannedDate) : new Date(0);
    const dateB = b.plannedDate ? parseISO(b.plannedDate) : new Date(0);
    return dateA.getTime() - dateB.getTime();
  });
};

// Calculate quarterly volume data
export const calculateQuarterlyVolumeData = (data: PlanFactStatusData[], year: number) => {
  const profileData = new Map<string, { planned: number, actual: number }>();
  
  data.forEach(item => {
    if (item.planned_dates?.installation) {
      try {
        const itemDate = parseISO(item.planned_dates.installation);
        if (isValid(itemDate) && itemDate.getFullYear() === year) {
          if (!profileData.has(item.profile)) {
            profileData.set(item.profile, { planned: 0, actual: 0 });
          }
          
          const profileStats = profileData.get(item.profile)!;
          profileStats.planned += item.weight;
          
          if (item.actual_dates?.installation) {
            profileStats.actual += item.weight;
          }
        }
      } catch (error) {
        console.warn(`Invalid date format for item ${item.name}:`, error);
      }
    }
  });
  
  return Array.from(profileData.entries())
    .map(([profile, stats]) => ({
      profile,
      planned: stats.planned,
      actual: stats.actual
    }))
    .sort((a, b) => b.planned - a.planned);
};

// Calculate monthly metrics
export const calculateMonthlyMetrics = (
  data: PlanFactStatusData[],
  selectedMonth: Date
): {
  top3Marks: Array<{ name: string; weight: number; percentage: number }>;
  bottom3Marks: Array<{ name: string; weight: number; percentage: number }>;
  totalWeight: number;
  monthlyGrowth: number;
  planCompletion: {
    planned: number;
    actual: number;
    difference: number;
  };
} => {
  // Get current month's data
  const currentMonthData = data.filter(item => {
    if (!item.planned_dates?.installation) return false;
    try {
      const itemDate = parseISO(item.planned_dates.installation);
      return isValid(itemDate) && isSameMonth(itemDate, selectedMonth);
    } catch (error) {
      console.warn(`Invalid date format for item ${item.name}:`, error);
      return false;
    }
  });

  // Get previous month's data
  const previousMonthData = data.filter(item => {
    if (!item.planned_dates?.installation) return false;
    try {
      const itemDate = parseISO(item.planned_dates.installation);
      return isValid(itemDate) && isSameMonth(itemDate, subMonths(selectedMonth, 1));
    } catch (error) {
      console.warn(`Invalid date format for item ${item.name}:`, error);
      return false;
    }
  });

  // Calculate total weights
  const currentMonthWeight = currentMonthData.reduce((sum, item) => sum + item.weight, 0);
  const previousMonthWeight = previousMonthData.reduce((sum, item) => sum + item.weight, 0);

  // Calculate absolute monthly growth in weight
  const monthlyGrowth = currentMonthWeight - previousMonthWeight;

  // Calculate top-3 and bottom-3 marks
  const markWeights = new Map<string, number>();
  currentMonthData.forEach(item => {
    const current = markWeights.get(item.name) || 0;
    markWeights.set(item.name, current + item.weight);
  });

  const sortedMarks = Array.from(markWeights.entries())
    .sort(([, a], [, b]) => b - a);

  const top3Marks = sortedMarks
    .slice(0, 3)
    .map(([name, weight]) => ({
      name,
      weight,
      percentage: (weight / currentMonthWeight) * 100
    }));

  const bottom3Marks = sortedMarks
    .slice(-3)
    .reverse()
    .map(([name, weight]) => ({
      name,
      weight,
      percentage: (weight / currentMonthWeight) * 100
    }));

  // Calculate plan completion in absolute values
  const plannedWeight = currentMonthData.reduce((sum, item) => sum + item.weight, 0);
  const actualWeight = currentMonthData.reduce((sum, item) => {
    if (item.actual_dates?.installation) {
      return sum + item.weight;
    }
    return sum;
  }, 0);

  return {
    top3Marks,
    bottom3Marks,
    totalWeight: currentMonthWeight,
    monthlyGrowth,
    planCompletion: {
      planned: plannedWeight,
      actual: actualWeight,
      difference: actualWeight - plannedWeight
    }
  };
};