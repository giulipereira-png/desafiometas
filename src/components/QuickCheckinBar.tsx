import React from 'react';
import { Waves, Dumbbell, Bike, Footprints, Check, Calendar, Flame, Instagram } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DayLog, GoalConfig } from '../types/workout';
import { formatReadableDateBR, TODAY_STR } from '../utils/statsCalculator';

interface QuickCheckinBarProps {
  currentDateStr: string;
  dayLog?: DayLog;
  goal: GoalConfig;
  onToggleSwim: (date: string, distanceMeters?: number) => void;
  onToggleGym: (date: string, focus?: string) => void;
  onToggleBike: (date: string, distanceKm?: number) => void;
  onToggleRun: (date: string, distanceKm?: number) => void;
  onOpenDayDetails: (date: string) => void;
  onOpenStoryModal: () => void;
  streakCount: number;
}

export const QuickCheckinBar: React.FC<QuickCheckinBarProps> = ({
  currentDateStr,
  dayLog,
  goal,
  onToggleSwim,
  onToggleGym,
  onToggleBike,
  onToggleRun,
  onOpenDayDetails,
  onOpenStoryModal,
  streakCount,
}) => {
  const isSwimDone = Boolean(dayLog?.swimCompleted);
  const isGymDone = Boolean(dayLog?.gymCompleted);
  const isBikeDone = Boolean(dayLog?.bikeCompleted);
  const isRunDone = Boolean(dayLog?.runCompleted);

  const isToday = currentDateStr === TODAY_STR;

  const triggerCelebration = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#f43f5e', '#f59e0b', '#10b981', '#8b5cf6'],
    });
  };

  const handleSwimClick = () => {
    if (!isSwimDone) triggerCelebration();
    onToggleSwim(currentDateStr, isSwimDone ? undefined : (dayLog?.swim?.distanceMeters || 1500));
  };

  const handleGymClick = () => {
    if (!isGymDone) triggerCelebration();
    onToggleGym(currentDateStr, isGymDone ? undefined : (dayLog?.gym?.focus || 'Inferior / Pernas'));
  };

  const handleBikeClick = () => {
    if (!isBikeDone) triggerCelebration();
    onToggleBike(currentDateStr, isBikeDone ? undefined : (dayLog?.bike?.distanceKm || 20));
  };

  const handleRunClick = () => {
    if (!isRunDone) triggerCelebration();
    onToggleRun(currentDateStr, isRunDone ? undefined : (dayLog?.run?.distanceKm || 5));
  };

  const completedActivitiesCount = [isSwimDone, isGymDone, isBikeDone, isRunDone].filter(Boolean).length;

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-lg backdrop-blur-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: Date & Status indicator */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300">
            <Calendar className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-white capitalize">
                {formatReadableDateBR(currentDateStr)}
              </span>
              {isToday && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  HOJE
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>
                {completedActivitiesCount > 0
                  ? `🔥 ${completedActivitiesCount} ${completedActivitiesCount === 1 ? 'treino concluído' : 'treinos concluídos'}!`
                  : 'Nenhum treino marcado ainda hoje'}
              </span>
              {streakCount > 0 && (
                <span className="inline-flex items-center gap-1 text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 text-[11px]">
                  <Flame className="w-3 h-3 fill-amber-400" />
                  {streakCount} {streakCount === 1 ? 'dia de sequência' : 'dias de sequência'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center / Right: Check Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Natação */}
          {(goal.swimEnabled ?? true) && (
            <button
              onClick={handleSwimClick}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                isSwimDone
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700 hover:border-cyan-500/40 hover:text-white'
              }`}
            >
              <div className={`w-4 h-4 rounded flex items-center justify-center ${isSwimDone ? 'bg-cyan-500 text-slate-950 font-bold' : 'border border-slate-500'}`}>
                {isSwimDone ? <Check className="w-3 h-3 stroke-[3]" /> : <Waves className="w-2.5 h-2.5 text-cyan-400" />}
              </div>
              <span>{isSwimDone ? `Natação ${(dayLog?.swim?.distanceMeters || 1500) / 1000}k ✓` : 'Check Natação'}</span>
            </button>
          )}

          {/* Academia */}
          {(goal.gymEnabled ?? true) && (
            <button
              onClick={handleGymClick}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                isGymDone
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700 hover:border-rose-500/40 hover:text-white'
              }`}
            >
              <div className={`w-4 h-4 rounded flex items-center justify-center ${isGymDone ? 'bg-rose-500 text-slate-950 font-bold' : 'border border-slate-500'}`}>
                {isGymDone ? <Check className="w-3 h-3 stroke-[3]" /> : <Dumbbell className="w-2.5 h-2.5 text-rose-400" />}
              </div>
              <span>{isGymDone ? 'Academia ✓' : 'Check Academia'}</span>
            </button>
          )}

          {/* Bike */}
          {(goal.bikeEnabled ?? true) && (
            <button
              onClick={handleBikeClick}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                isBikeDone
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700 hover:border-amber-500/40 hover:text-white'
              }`}
            >
              <div className={`w-4 h-4 rounded flex items-center justify-center ${isBikeDone ? 'bg-amber-500 text-slate-950 font-bold' : 'border border-slate-500'}`}>
                {isBikeDone ? <Check className="w-3 h-3 stroke-[3]" /> : <Bike className="w-2.5 h-2.5 text-amber-400" />}
              </div>
              <span>{isBikeDone ? `Bike ${dayLog?.bike?.distanceKm || 20}km ✓` : 'Check Bike'}</span>
            </button>
          )}

          {/* Corrida */}
          {(goal.runEnabled ?? true) && (
            <button
              onClick={handleRunClick}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                isRunDone
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700 hover:border-emerald-500/40 hover:text-white'
              }`}
            >
              <div className={`w-4 h-4 rounded flex items-center justify-center ${isRunDone ? 'bg-emerald-500 text-slate-950 font-bold' : 'border border-slate-500'}`}>
                {isRunDone ? <Check className="w-3 h-3 stroke-[3]" /> : <Footprints className="w-2.5 h-2.5 text-emerald-400" />}
              </div>
              <span>{isRunDone ? `Corrida ${dayLog?.run?.distanceKm || 5}km ✓` : 'Check Corrida'}</span>
            </button>
          )}

          {/* Edit Details */}
          <button
            onClick={() => onOpenDayDetails(currentDateStr)}
            className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all cursor-pointer"
          >
            Editar detalhes
          </button>

          {/* Story */}
          <button
            onClick={onOpenStoryModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-300 border border-pink-500/30 hover:border-pink-500/60 transition-all cursor-pointer"
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>Story</span>
          </button>

        </div>

      </div>
    </div>
  );
};
