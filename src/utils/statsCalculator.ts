import { DayLog, GoalConfig, WeekSummary } from '../types/workout';

// Reference date for current time in late 2026
export const TODAY_STR = '2026-11-05';

export function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0); // safe noon time to avoid timezone drift
}

export function formatISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatReadableDateBR(dateStr: string, includeDayOfWeek: boolean = true): string {
  const date = parseISODate(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(includeDayOfWeek ? { weekday: 'short' } : {}),
  };
  return date.toLocaleDateString('pt-BR', options);
}

// Get Monday of the week
export function getMondayOfWeek(dateStr: string): string {
  const date = parseISODate(dateStr);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  return formatISODate(monday);
}

// Get Sunday of the week
export function getSundayOfWeek(mondayStr: string): string {
  const monday = parseISODate(mondayStr);
  monday.setDate(monday.getDate() + 6);
  return formatISODate(monday);
}

// Get ISO week number
export function getWeekNumber(dateStr: string): number {
  const date = parseISODate(dateStr);
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export interface CalculatedStats {
  // Swim Stats
  totalSwimMeters: number;
  totalSwimKm: number;
  swimTargetKm: number;
  swimProgressPercent: number;
  swimRemainingKm: number;
  totalSwimSessions: number;
  swimAvgKmPerSession: number;
  swimRequiredWeeklyKm: number;
  swimPaceStatus: 'Adiantada! 🚀' | 'No Ritmo Certo! 🎯' | 'Acelerar um pouco! ⚡';

  // Gym Stats
  totalGymSessions: number;
  currentWeekGymCount: number;
  currentWeekGymTarget: number;
  currentWeekGymPercent: number;
  gymWeeksMetCount: number;
  totalWeeksEvaluated: number;
  gymConsistencyRate: number;
  currentGymWeekStreak: number;
  longestGymWeekStreak: number;

  // Bike Stats
  totalBikeKm: number;
  bikeTargetKm: number;
  bikeProgressPercent: number;
  bikeRemainingKm: number;
  totalBikeSessions: number;
  bikeRequiredWeeklyKm: number;

  // Run Stats
  totalRunKm: number;
  runTargetKm: number;
  runProgressPercent: number;
  runRemainingKm: number;
  totalRunSessions: number;
  runRequiredWeeklyKm: number;

  // Global / Target Countdown
  targetEndDate: string;
  daysRemainingToGoal: number;
  weeksRemainingToGoal: number;
  currentActiveDayStreak: number;
  longestActiveDayStreak: number;
  totalActiveDays: number;
  totalActiveMinutes: number;

  // Today specific
  isTodaySwimDone: boolean;
  isTodayGymDone: boolean;
  isTodayBikeDone: boolean;
  isTodayRunDone: boolean;
  todayLog?: DayLog;
}

export function calculateStats(
  logs: Record<string, DayLog>,
  goal: GoalConfig,
  currentDateStr: string = TODAY_STR
): CalculatedStats {
  const logEntries = Object.values(logs).sort((a, b) => a.date.localeCompare(b.date));

  let totalSwimMeters = 0;
  let totalSwimSessions = 0;
  let totalGymSessions = 0;
  let totalBikeKm = 0;
  let totalBikeSessions = 0;
  let totalRunKm = 0;
  let totalRunSessions = 0;
  let totalActiveMinutes = 0;

  logEntries.forEach((log) => {
    if (log.swimCompleted) {
      totalSwimSessions += 1;
      const meters = log.swim?.distanceMeters || 0;
      totalSwimMeters += meters;
      totalActiveMinutes += log.swim?.durationMinutes || 45;
    }
    if (log.gymCompleted) {
      totalGymSessions += 1;
      totalActiveMinutes += log.gym?.durationMinutes || 50;
    }
    if (log.bikeCompleted) {
      totalBikeSessions += 1;
      const km = log.bike?.distanceKm || 0;
      totalBikeKm += km;
      totalActiveMinutes += log.bike?.durationMinutes || 60;
    }
    if (log.runCompleted) {
      totalRunSessions += 1;
      const km = log.run?.distanceKm || 0;
      totalRunKm += km;
      totalActiveMinutes += log.run?.durationMinutes || 40;
    }
  });

  // Countdown calculations
  const today = parseISODate(currentDateStr);
  const targetDate = parseISODate(goal.targetEndDate || '2026-12-31');
  const diffTime = targetDate.getTime() - today.getTime();
  const daysRemainingToGoal = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const weeksRemainingToGoal = Math.max(1, Math.ceil(daysRemainingToGoal / 7));

  // Swim
  const totalSwimKm = Math.round((totalSwimMeters / 1000) * 10) / 10;
  const swimTargetKm = goal.swimTargetKm || 45;
  const swimProgressPercent = Math.min(100, Math.round((totalSwimKm / swimTargetKm) * 1000) / 10);
  const swimRemainingKm = Math.max(0, Math.round((swimTargetKm - totalSwimKm) * 10) / 10);
  const swimAvgKmPerSession = totalSwimSessions > 0 ? Math.round((totalSwimKm / totalSwimSessions) * 100) / 100 : 0;
  const swimRequiredWeeklyKm = Math.round((swimRemainingKm / weeksRemainingToGoal) * 10) / 10;

  let swimPaceStatus: 'Adiantada! 🚀' | 'No Ritmo Certo! 🎯' | 'Acelerar um pouco! ⚡' = 'No Ritmo Certo! 🎯';
  if (swimRemainingKm === 0 || totalSwimKm >= swimTargetKm * 0.75) {
    swimPaceStatus = 'Adiantada! 🚀';
  } else if (swimRequiredWeeklyKm > 3.0) {
    swimPaceStatus = 'Acelerar um pouco! ⚡';
  }

  // Bike
  totalBikeKm = Math.round(totalBikeKm * 10) / 10;
  const bikeTargetKm = goal.bikeTargetKm || 150;
  const bikeProgressPercent = Math.min(100, Math.round((totalBikeKm / bikeTargetKm) * 1000) / 10);
  const bikeRemainingKm = Math.max(0, Math.round((bikeTargetKm - totalBikeKm) * 10) / 10);
  const bikeRequiredWeeklyKm = Math.round((bikeRemainingKm / weeksRemainingToGoal) * 10) / 10;

  // Run
  totalRunKm = Math.round(totalRunKm * 10) / 10;
  const runTargetKm = goal.runTargetKm || 80;
  const runProgressPercent = Math.min(100, Math.round((totalRunKm / runTargetKm) * 1000) / 10);
  const runRemainingKm = Math.max(0, Math.round((runTargetKm - totalRunKm) * 10) / 10);
  const runRequiredWeeklyKm = Math.round((runRemainingKm / weeksRemainingToGoal) * 10) / 10;

  // Weekly Gym evaluation
  const weeklyMap = groupLogsByWeek(logs);
  const weeks = Object.values(weeklyMap).sort((a, b) => a.weekStart.localeCompare(b.weekStart));

  let gymWeeksMetCount = 0;
  let currentGymWeekStreak = 0;
  let longestGymWeekStreak = 0;
  let tempStreak = 0;

  const currentMonday = getMondayOfWeek(currentDateStr);
  const currentWeekLog = weeklyMap[currentMonday];
  const currentWeekGymCount = currentWeekLog ? currentWeekLog.gymSessions : 0;
  const gymTarget = goal.gymWeeklyTargetDays || 4;
  const currentWeekGymPercent = Math.min(100, Math.round((currentWeekGymCount / gymTarget) * 100));

  const pastOrCurrentWeeks = weeks.filter((w) => w.weekStart <= currentMonday);
  pastOrCurrentWeeks.forEach((w) => {
    if (w.gymSessions >= gymTarget) {
      gymWeeksMetCount += 1;
      tempStreak += 1;
      if (tempStreak > longestGymWeekStreak) longestGymWeekStreak = tempStreak;
    } else if (w.weekStart < currentMonday) {
      tempStreak = 0;
    }
  });

  currentGymWeekStreak = tempStreak;
  const totalWeeksEvaluated = Math.max(1, pastOrCurrentWeeks.length);
  const gymConsistencyRate = Math.round((gymWeeksMetCount / totalWeeksEvaluated) * 100);

  // Day streaks across any completed activity
  const isDayActive = (l?: DayLog) => Boolean(l && (l.swimCompleted || l.gymCompleted || l.bikeCompleted || l.runCompleted));
  const todayEntry = logs[currentDateStr];
  let currentActiveDayStreak = 0;

  if (isDayActive(todayEntry)) {
    currentActiveDayStreak += 1;
  }

  const tempDate = parseISODate(currentDateStr);
  tempDate.setDate(tempDate.getDate() - 1);

  for (let i = 0; i < 90; i++) {
    const key = formatISODate(tempDate);
    const entry = logs[key];
    if (isDayActive(entry)) {
      currentActiveDayStreak += 1;
      tempDate.setDate(tempDate.getDate() - 1);
    } else {
      break;
    }
  }

  const activeDates = new Set(
    logEntries.filter(isDayActive).map((l) => l.date)
  );

  let maxStreak = 0;
  let running = 0;
  const sortedDates = Array.from(activeDates).sort();
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      running = 1;
    } else {
      const prev = parseISODate(sortedDates[i - 1]);
      prev.setDate(prev.getDate() + 1);
      if (formatISODate(prev) === sortedDates[i]) {
        running += 1;
      } else {
        running = 1;
      }
    }
    if (running > maxStreak) maxStreak = running;
  }
  const longestActiveDayStreak = Math.max(maxStreak, currentActiveDayStreak);

  return {
    totalSwimMeters,
    totalSwimKm,
    swimTargetKm,
    swimProgressPercent,
    swimRemainingKm,
    totalSwimSessions,
    swimAvgKmPerSession,
    swimRequiredWeeklyKm,
    swimPaceStatus,

    totalGymSessions,
    currentWeekGymCount,
    currentWeekGymTarget: gymTarget,
    currentWeekGymPercent,
    gymWeeksMetCount,
    totalWeeksEvaluated,
    gymConsistencyRate,
    currentGymWeekStreak,
    longestGymWeekStreak,

    totalBikeKm,
    bikeTargetKm,
    bikeProgressPercent,
    bikeRemainingKm,
    totalBikeSessions,
    bikeRequiredWeeklyKm,

    totalRunKm,
    runTargetKm,
    runProgressPercent,
    runRemainingKm,
    totalRunSessions,
    runRequiredWeeklyKm,

    targetEndDate: goal.targetEndDate || '2026-12-31',
    daysRemainingToGoal,
    weeksRemainingToGoal,
    currentActiveDayStreak,
    longestActiveDayStreak,
    totalActiveDays: activeDates.size,
    totalActiveMinutes,

    isTodaySwimDone: Boolean(todayEntry?.swimCompleted),
    isTodayGymDone: Boolean(todayEntry?.gymCompleted),
    isTodayBikeDone: Boolean(todayEntry?.bikeCompleted),
    isTodayRunDone: Boolean(todayEntry?.runCompleted),
    todayLog: todayEntry,
  };
}

export function groupLogsByWeek(logs: Record<string, DayLog>): Record<string, WeekSummary> {
  const result: Record<string, WeekSummary> = {};

  Object.values(logs).forEach((log) => {
    const monday = getMondayOfWeek(log.date);
    const sunday = getSundayOfWeek(monday);
    const weekNum = getWeekNumber(log.date);
    const year = parseISODate(log.date).getFullYear();

    if (!result[monday]) {
      result[monday] = {
        weekNumber: weekNum,
        year,
        weekStart: monday,
        weekEnd: sunday,
        swimKm: 0,
        swimSessions: 0,
        gymSessions: 0,
        gymTargetMet: false,
        bikeKm: 0,
        bikeSessions: 0,
        runKm: 0,
        runSessions: 0,
        totalActiveMinutes: 0,
        daysCompletedCount: 0,
      };
    }

    const current = result[monday];
    let dayHadActivity = false;

    if (log.swimCompleted) {
      current.swimSessions += 1;
      current.swimKm += (log.swim?.distanceMeters || 0) / 1000;
      current.totalActiveMinutes += log.swim?.durationMinutes || 45;
      dayHadActivity = true;
    }
    if (log.gymCompleted) {
      current.gymSessions += 1;
      current.totalActiveMinutes += log.gym?.durationMinutes || 50;
      dayHadActivity = true;
    }
    if (log.bikeCompleted) {
      current.bikeSessions += 1;
      current.bikeKm += log.bike?.distanceKm || 0;
      current.totalActiveMinutes += log.bike?.durationMinutes || 60;
      dayHadActivity = true;
    }
    if (log.runCompleted) {
      current.runSessions += 1;
      current.runKm += log.run?.distanceKm || 0;
      current.totalActiveMinutes += log.run?.durationMinutes || 40;
      dayHadActivity = true;
    }

    if (dayHadActivity) {
      current.daysCompletedCount += 1;
    }
  });

  Object.values(result).forEach((week) => {
    week.swimKm = Math.round(week.swimKm * 10) / 10;
    week.bikeKm = Math.round(week.bikeKm * 10) / 10;
    week.runKm = Math.round(week.runKm * 10) / 10;
    week.gymTargetMet = week.gymSessions >= 4;
  });

  return result;
}
