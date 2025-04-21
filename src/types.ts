import { ReactNode } from 'react';

export interface CMPItem {
  id: string;
  name: string;
  position: string;
  quantity: number;
  profile: string;
  weight: number;
  
  planned_dates: {
    restrictions1: string;
    techRestrictions: string;
    resourceRestrictions: string;
    installation: string;
  };
  
  actual_dates: {
    restrictions1: string | null;
    techRestrictions: string | null;
    resourceRestrictions: string | null;
    installation: string | null;
  };
}

export interface InstallationData {
  section: string;
  discipline1: string;
  discipline2: string;
  collisionCount: number;
  duOver40: number;
  duUnder40: number;
  notes?: string;
}

export interface Installation {
  id: number;
  name: string;
  version: string;
  date: string;
  data: InstallationData[];
  totalCollisions: number;
  totalDuOver40: number;
  totalDuUnder40: number;
}

export interface CollisionDynamicsData {
  month: string;
  total: number;
  installations: {
    [key: string]: number;
  };
  diameters: {
    over40: number;
    between20and40: number;
    under20: number;
    undefined: number;
  };
}

export type StatusType = 
  | 'restrictions1' 
  | 'techRestrictions' 
  | 'resourceRestrictions' 
  | 'installation';

export interface StatusLabel {
  key: StatusType;
  label: string;
}

export interface FilterState {
  statusTypes: StatusType[];
  dateRange: [Date | null, Date | null];
  searchTerm: string;
}

export type WeightViewMode = 'byName' | 'byWeight';

export interface MonthlyWeightData {
  name: string;
  weight: number;
}

export interface YearlyWeightData {
  month: string;
  weight: number;
}

export interface StatusDateData {
  name: string;
  plannedDate: string | null;
  actualDate: string | null;
  weight: number;
}

export type UserRole = 'executor' | 'executive' | 'technical';
export type StatusRole = 'operator' | 'executive' | 'technical';
export type InstallationRole = 'executor' | 'executive' | 'technical';

export type DashboardView = 'status' | 'installations' | 'dynamics';

export interface PlanFactStatusData {
  name: string;
  profile: string;
  weight: number;
  planned_dates: {
    restrictions1: string;
    techRestrictions: string;
    resourceRestrictions: string;
    installation: string;
  };
  actual_dates: {
    restrictions1: string | null;
    techRestrictions: string | null;
    resourceRestrictions: string | null;
    installation: string | null;
  };
}

export interface InstallationDBData {
  section: string;
  discipline1: string;
  discipline2: string;
  collision_count: number;
  du_over_40: number;
  du_under_40: number;
  notes?: string;
}

export interface User {
  role: UserRole;
}