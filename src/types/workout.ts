export type WorkoutType = 'natacao' | 'academia' | 'bike' | 'corrida';

export interface SwimDetail {
  distanceMeters: number; // e.g. 1500
  durationMinutes?: number;
  poolType?: '25m' | '50m' | 'mar_aberto';
  style?: 'Livre / Crawl' | 'Medley' | 'Peito / Costas' | 'Técnico / Educativos' | 'Séries Mistas';
  notes?: string;
}

export interface GymDetail {
  focus: 'Superior' | 'Inferior / Pernas' | 'Full Body' | 'Costas & Bíceps' | 'Peito & Tríceps' | 'Glúteo & Core' | 'Cardio & Funcional';
  durationMinutes?: number;
  intensity?: 'Leve' | 'Moderado' | 'Intenso' | 'Muito Intenso';
  notes?: string;
}

export interface BikeDetail {
  distanceKm: number;
  durationMinutes?: number;
  elevationMeters?: number;
  bikeType?: 'Estrada / Speed' | 'MTB / Trilha' | 'Spinning / Rolo' | 'Urbana / Passeio';
  notes?: string;
}

export interface RunDetail {
  distanceKm: number;
  durationMinutes?: number;
  paceAvg?: string;
  terrain?: 'Rua / Asfalto' | 'Esteira' | 'Pista' | 'Trail / Montanha';
  notes?: string;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  userId?: string;
  swimCompleted?: boolean;
  swim?: SwimDetail;
  gymCompleted?: boolean;
  gym?: GymDetail;
  bikeCompleted?: boolean;
  bike?: BikeDetail;
  runCompleted?: boolean;
  run?: RunDetail;
  feeling?: '🔥 Excelente' | '💪 Firme' | '😴 Cansada mas feito' | '⚡ Recuperação';
  notes?: string;
  updatedAt: string;
}

export interface GoalConfig {
  userName: string;
  userHandle: string;
  targetEndDate: string; // "2026-12-31"
  startDate: string; // "2026-09-01"

  // Sport 1: Natação
  swimEnabled: boolean;
  swimTargetKm: number;

  // Sport 2: Academia
  gymEnabled: boolean;
  gymWeeklyTargetDays: number;

  // Sport 3: Bike / Ciclismo
  bikeEnabled: boolean;
  bikeTargetKm: number;

  // Sport 4: Corrida
  runEnabled: boolean;
  runTargetKm: number;
}

export interface WeekSummary {
  weekNumber: number;
  year: number;
  weekStart: string; // YYYY-MM-DD
  weekEnd: string; // YYYY-MM-DD
  swimKm: number;
  swimSessions: number;
  gymSessions: number;
  gymTargetMet: boolean;
  bikeKm: number;
  bikeSessions: number;
  runKm: number;
  runSessions: number;
  totalActiveMinutes: number;
  daysCompletedCount: number;
}
