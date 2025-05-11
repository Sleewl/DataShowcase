const API_BASE_URL = import.meta.env.PROD 
  ? '/api'
  : 'http://localhost:5000/api';

import { mockData } from '../data/mockData';
import { installationsData } from '../data/installationsData';
import { PlanFactStatusData } from '../types';

export async function fetchPlanFactStatus() {
  // Transform mock data to match the expected PlanFactStatusData structure
  return mockData.map(item => ({
    name: item.name,
    profile: item.profile,
    weight: item.weight,
    planned_dates: {
      restrictions1: item.plannedDates.restrictions1,
      techRestrictions: item.plannedDates.techRestrictions,
      resourceRestrictions: item.plannedDates.resourceRestrictions,
      installation: item.plannedDates.installation,
    },
    actual_dates: {
      restrictions1: item.actualDates.restrictions1,
      techRestrictions: item.actualDates.techRestrictions,
      resourceRestrictions: item.actualDates.resourceRestrictions,
      installation: item.actualDates.installation,
    }
  } as PlanFactStatusData));
}

export async function fetchInstallationData(installationNumber: number) {
  // Return all installations when requesting any installation
  // This ensures we have data for the pie chart and other components
  return installationsData;
}