import { DayLog, GoalConfig } from '../types/workout';

export const DEFAULT_GOAL: GoalConfig = {
  userName: 'Giu Sousa',
  userHandle: '@prof_giu',
  targetEndDate: '2026-12-31',
  startDate: '2026-11-01',
  swimEnabled: true,
  swimTargetKm: 45,
  gymEnabled: true,
  gymWeeklyTargetDays: 4,
  bikeEnabled: true,
  bikeTargetKm: 150,
  runEnabled: true,
  runTargetKm: 80,
};

// Clean zero slate starting exclusively in November 2026 through December 31, 2026
export const INITIAL_LOGS: Record<string, DayLog> = {};
