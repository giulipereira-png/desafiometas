import React from 'react';
import { Waves, Dumbbell, Bike, Footprints, Flame, CheckCircle2, AlertCircle, Sliders, ArrowUpRight } from 'lucide-react';
import { CalculatedStats } from '../utils/statsCalculator';
import { GoalConfig } from '../types/workout';

interface GoalOverviewProps {
  stats: CalculatedStats;
  goal: GoalConfig;
  onOpenGoalSettings: () => void;
}

export const GoalOverview: React.FC<GoalOverviewProps> = ({
  stats,
  goal,
  onOpenGoalSettings,
}) => {
  const isSwimActive = goal.swimEnabled ?? true;
  const isGymActive = goal.gymEnabled ?? true;
  const isBikeActive = goal.bikeEnabled ?? true;
  const isRunActive = goal.runEnabled ?? true;

  return (
    <div className="space-y-4">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* CARD 1: NATAÇÃO */}
        {isSwimActive && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/50 border border-cyan-500/20 p-5 sm:p-6 shadow-xl shadow-cyan-950/20">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
                  <Waves className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400">
                      Natação
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                      {stats.swimPaceStatus}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
                    Meta: {stats.swimTargetKm} km
                  </h3>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-display">
                  {stats.swimProgressPercent}%
                </div>
                <span className="text-[11px] text-slate-400">concluído</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-5 space-y-2 relative z-10">
              <div className="h-3 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-teal-300 rounded-full transition-all duration-700 ease-out shadow-sm shadow-cyan-500/50"
                  style={{ width: `${Math.min(100, Math.max(3, stats.swimProgressPercent))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5 font-medium">
                <span className="text-cyan-300 font-semibold">
                  {stats.totalSwimKm.toFixed(1)} km <span className="text-slate-500 font-normal">nadados</span>
                </span>
                <span>
                  Restam: <strong className="text-white">{stats.swimRemainingKm.toFixed(1)} km</strong>
                </span>
              </div>
            </div>

            {/* Sub-metrics */}
            <div className="mt-4 pt-3.5 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-950/50 rounded-xl p-2 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Restam</span>
                <span className="font-bold text-white mt-0.5 block">{stats.swimRemainingKm.toFixed(1)} km</span>
              </div>
              <div className="bg-slate-950/50 rounded-xl p-2 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Ritmo</span>
                <span className="font-bold text-cyan-400 mt-0.5 block">~{stats.swimRequiredWeeklyKm.toFixed(1)}k/sem</span>
              </div>
              <div className="bg-slate-950/50 rounded-xl p-2 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Sessões</span>
                <span className="font-bold text-teal-300 mt-0.5 block">{stats.totalSwimSessions} treinos</span>
              </div>
            </div>
          </div>
        )}

        {/* CARD 2: ACADEMIA / MUSCULAÇÃO */}
        {isGymActive && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/50 border border-rose-500/20 p-5 sm:p-6 shadow-xl shadow-rose-950/20">
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider font-semibold text-rose-400">
                      Academia
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800">
                      Meta {stats.currentWeekGymTarget}x/sem
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
                    Frequência Semanal
                  </h3>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-extrabold text-rose-300 font-display">
                  {stats.currentWeekGymCount}/{stats.currentWeekGymTarget}
                </div>
                <span className="text-[11px] text-slate-400">nesta semana</span>
              </div>
            </div>

            {/* Pips Tracker */}
            <div className="mt-5 space-y-2 relative z-10">
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-3 rounded-full border transition-all ${
                      stats.currentWeekGymCount >= step
                        ? 'bg-gradient-to-r from-rose-500 to-amber-500 border-rose-400 shadow-sm shadow-rose-500/40'
                        : 'bg-slate-800/80 border-slate-700/60'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5 font-medium">
                <span className="text-rose-300 font-semibold">
                  {stats.currentWeekGymCount >= stats.currentWeekGymTarget ? '✓ Meta da semana batida! 🎉' : `Faltam ${Math.max(0, stats.currentWeekGymTarget - stats.currentWeekGymCount)} treinos`}
                </span>
                <span>
                  Consistência: <strong className="text-white">{stats.gymConsistencyRate}%</strong>
                </span>
              </div>
            </div>

            {/* Sub-metrics */}
            <div className="mt-4 pt-3.5 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-950/50 rounded-xl p-2 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Total</span>
                <span className="font-bold text-white mt-0.5 block">{stats.totalGymSessions} treinos</span>
              </div>
              <div className="bg-slate-950/50 rounded-xl p-2 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Sequência</span>
                <span className="font-bold text-amber-400 mt-0.5 block flex items-center justify-center gap-0.5">
                  <Flame className="w-3 h-3 fill-amber-400" />
                  {stats.currentGymWeekStreak} sem
                </span>
              </div>
              <div className="bg-slate-950/50 rounded-xl p-2 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Semanas OK</span>
                <span className="font-bold text-emerald-400 mt-0.5 block">{stats.gymWeeksMetCount}/{stats.totalWeeksEvaluated}</span>
              </div>
            </div>
          </div>
        )}

        {/* CARD 3: CICLISMO / BIKE */}
        {isBikeActive && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/50 border border-amber-500/20 p-5 sm:p-6 shadow-xl shadow-amber-950/20">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                  <Bike className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider font-semibold text-amber-400">
                      Ciclismo / Bike
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800">
                      Pedal
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
                    Meta: {stats.bikeTargetKm} km
                  </h3>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-display">
                  {stats.bikeProgressPercent}%
                </div>
                <span className="text-[11px] text-slate-400">concluído</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-5 space-y-2 relative z-10">
              <div className="h-3 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full transition-all duration-700 ease-out shadow-sm shadow-amber-500/50"
                  style={{ width: `${Math.min(100, Math.max(3, stats.bikeProgressPercent))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5 font-medium">
                <span className="text-amber-300 font-semibold">
                  {stats.totalBikeKm.toFixed(1)} km <span className="text-slate-500 font-normal">pedalados</span>
                </span>
                <span>
                  Restam: <strong className="text-white">{stats.bikeRemainingKm.toFixed(1)} km</strong>
                </span>
              </div>
            </div>

            {/* Sub-metrics */}
            <div className="mt-4 pt-3.5 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-950/50 rounded-xl p-2 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Restam</span>
                <span className="font-bold text-white mt-0.5 block">{stats.bikeRemainingKm.toFixed(1)} km</span>
              </div>
              <div className="bg-slate-950/50 rounded-xl p-2 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Ritmo</span>
                <span className="font-bold text-amber-400 mt-0.5 block">~{stats.bikeRequiredWeeklyKm.toFixed(1)}k/sem</span>
              </div>
              <div className="bg-slate-950/50 rounded-xl p-2 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Pedais</span>
                <span className="font-bold text-amber-300 mt-0.5 block">{stats.totalBikeSessions} treinos</span>
              </div>
            </div>
          </div>
        )}

        {/* CARD 4: CORRIDA */}
        {isRunActive && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/50 border border-emerald-500/20 p-5 sm:p-6 shadow-xl shadow-emerald-950/20">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                  <Footprints className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
                      Corrida
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                      Running
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
                    Meta: {stats.runTargetKm} km
                  </h3>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300 font-display">
                  {stats.runProgressPercent}%
                </div>
                <span className="text-[11px] text-slate-400">concluído</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-5 space-y-2 relative z-10">
              <div className="h-3 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 rounded-full transition-all duration-700 ease-out shadow-sm shadow-emerald-500/50"
                  style={{ width: `${Math.min(100, Math.max(3, stats.runProgressPercent))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5 font-medium">
                <span className="text-emerald-300 font-semibold">
                  {stats.totalRunKm.toFixed(1)} km <span className="text-slate-500 font-normal">corridos</span>
                </span>
                <span>
                  Restam: <strong className="text-white">{stats.runRemainingKm.toFixed(1)} km</strong>
                </span>
              </div>
            </div>

            {/* Sub-metrics */}
            <div className="mt-4 pt-3.5 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-950/50 rounded-xl p-2 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Restam</span>
                <span className="font-bold text-white mt-0.5 block">{stats.runRemainingKm.toFixed(1)} km</span>
              </div>
              <div className="bg-slate-950/50 rounded-xl p-2 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Ritmo</span>
                <span className="font-bold text-emerald-400 mt-0.5 block">~{stats.runRequiredWeeklyKm.toFixed(1)}k/sem</span>
              </div>
              <div className="bg-slate-950/50 rounded-xl p-2 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Corridas</span>
                <span className="font-bold text-emerald-300 mt-0.5 block">{stats.totalRunSessions} treinos</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Button to personalize goals */}
      <div className="flex items-center justify-end">
        <button
          onClick={onOpenGoalSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-cyan-300 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/30 transition-all cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Personalizar Minhas Metas & Esportes</span>
        </button>
      </div>
    </div>
  );
};
