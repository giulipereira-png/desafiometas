import React, { useState } from 'react';
import { BarChart3, TrendingUp, Waves, Dumbbell, Award, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { DayLog } from '../types/workout';
import { groupLogsByWeek, formatReadableDateBR, TODAY_STR, getMondayOfWeek } from '../utils/statsCalculator';

interface WeeklyStatsViewProps {
  logs: Record<string, DayLog>;
}

export const WeeklyStatsView: React.FC<WeeklyStatsViewProps> = ({ logs }) => {
  const [selectedMetric, setSelectedMetric] = useState<'both' | 'swim' | 'gym'>('both');

  const weeklyData = groupLogsByWeek(logs);
  const weeksList = Object.values(weeklyData).sort((a, b) => b.weekStart.localeCompare(a.weekStart)); // newest first

  // For charts, chronological order (oldest to newest)
  const chartWeeks = [...weeksList].reverse();

  // Metrics
  const maxSwimKm = Math.max(...chartWeeks.map((w) => w.swimKm), 4);
  const maxGymSessions = Math.max(...chartWeeks.map((w) => w.gymSessions), 6);

  const totalEvaluated = weeksList.length;
  const metCount = weeksList.filter((w) => w.gymTargetMet).length;
  const totalSwimAllWeeks = weeksList.reduce((acc, w) => acc + w.swimKm, 0);
  const avgSwimKmPerWeek = totalEvaluated > 0 ? (totalSwimAllWeeks / totalEvaluated).toFixed(1) : '0';
  const totalGymAllWeeks = weeksList.reduce((acc, w) => acc + w.gymSessions, 0);
  const avgGymPerWeek = totalEvaluated > 0 ? (totalGymAllWeeks / totalEvaluated).toFixed(1) : '0';

  const bestSwimWeek = [...weeksList].sort((a, b) => b.swimKm - a.swimKm)[0];

  const currentMonday = getMondayOfWeek(TODAY_STR);

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-6 shadow-xl backdrop-blur-md space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display">
              Estatísticas Semanais de Desempenho
            </h2>
            <p className="text-xs text-slate-400">
              Acompanhamento detalhado do ritmo de natação e frequência de musculação
            </p>
          </div>
        </div>

        {/* Filter Metric Pills */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setSelectedMetric('both')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedMetric === 'both'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setSelectedMetric('swim')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              selectedMetric === 'swim'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            Natação
          </button>
          <button
            onClick={() => setSelectedMetric('gym')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              selectedMetric === 'gym'
                ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            Academia (4x)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span>Média Natação</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white mt-1">
            {avgSwimKmPerWeek} km<span className="text-xs text-slate-500 font-normal"> /semana</span>
          </div>
          <div className="text-[11px] text-cyan-400 mt-0.5">Ritmo sustentado</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Dumbbell className="w-3.5 h-3.5 text-rose-400" />
            <span>Média Academia</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white mt-1">
            {avgGymPerWeek}x<span className="text-xs text-slate-500 font-normal"> /semana</span>
          </div>
          <div className="text-[11px] text-rose-400 mt-0.5">Meta: 4x por semana</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Taxa de Cumprimento</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-emerald-400 mt-1">
            {totalEvaluated > 0 ? Math.round((metCount / totalEvaluated) * 100) : 0}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{metCount} de {totalEvaluated} semanas</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Melhor Semana</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-amber-300 mt-1">
            {bestSwimWeek ? `${bestSwimWeek.swimKm} km` : '0 km'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {bestSwimWeek ? `Semana ${bestSwimWeek.weekNumber}` : '-'}
          </div>
        </div>
      </div>

      {/* Visual Bar Charts */}
      <div className="space-y-6">
        
        {/* Chart 1: Natação (Swim Volume) */}
        {(selectedMetric === 'both' || selectedMetric === 'swim') && (
          <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-cyan-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Waves className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">
                  Volume de Natação por Semana (km)
                </h4>
              </div>
              <span className="text-xs text-cyan-400 font-semibold">
                Rumo aos 45 km
              </span>
            </div>

            {/* Bars container */}
            <div className="h-44 flex items-end gap-2 sm:gap-3 pt-6 border-b border-slate-800">
              {chartWeeks.map((week) => {
                const heightPercent = Math.min(100, Math.round((week.swimKm / maxSwimKm) * 100));
                const isCurrent = week.weekStart === currentMonday;

                return (
                  <div key={week.weekStart} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <span className="text-[10px] font-bold text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                      {week.swimKm}k
                    </span>
                    <div
                      className={`w-full max-w-[32px] rounded-t-lg transition-all duration-500 ${
                        isCurrent
                          ? 'bg-gradient-to-t from-cyan-600 to-teal-300 ring-2 ring-cyan-400/50 shadow-md shadow-cyan-500/30'
                          : 'bg-gradient-to-t from-cyan-900 to-cyan-500 group-hover:from-cyan-700 group-hover:to-cyan-400'
                      }`}
                      style={{ height: `${Math.max(6, heightPercent)}%` }}
                    />
                    <span className="text-[10px] text-slate-500 mt-2 truncate w-full text-center">
                      Sem {week.weekNumber}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Chart 2: Academia (Gym Frequency vs 4x Goal) */}
        {(selectedMetric === 'both' || selectedMetric === 'gym') && (
          <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-rose-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-rose-400" />
                <h4 className="text-sm font-bold text-white">
                  Frequência de Academia vs Meta (Mín. 4x/semana)
                </h4>
              </div>
              <span className="text-xs text-rose-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                Meta 4x
              </span>
            </div>

            {/* Bars container with 4x benchmark guideline */}
            <div className="relative h-44 flex items-end gap-2 sm:gap-3 pt-6 border-b border-slate-800">
              {/* Benchmark dashed line at 4x (4 / maxGymSessions * 100%) */}
              <div
                className="absolute left-0 right-0 border-b border-dashed border-emerald-500/50 z-10 pointer-events-none flex items-center justify-end pr-2"
                style={{ bottom: `${(4 / maxGymSessions) * 100}%` }}
              >
                <span className="text-[10px] bg-slate-900/90 text-emerald-400 px-1 rounded border border-emerald-500/30 font-semibold">
                  Alvo: 4x
                </span>
              </div>

              {chartWeeks.map((week) => {
                const heightPercent = Math.min(100, Math.round((week.gymSessions / maxGymSessions) * 100));
                const isTargetMet = week.gymSessions >= 4;
                const isCurrent = week.weekStart === currentMonday;

                return (
                  <div key={week.weekStart} className="flex-1 flex flex-col items-center h-full justify-end group z-20">
                    <span className="text-[10px] font-bold text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                      {week.gymSessions}x
                    </span>
                    <div
                      className={`w-full max-w-[32px] rounded-t-lg transition-all duration-500 ${
                        isTargetMet
                          ? 'bg-gradient-to-t from-emerald-600 to-rose-400 shadow-sm shadow-emerald-500/20'
                          : 'bg-gradient-to-t from-slate-800 to-rose-500/60'
                      } ${isCurrent ? 'ring-2 ring-rose-400' : ''}`}
                      style={{ height: `${Math.max(6, heightPercent)}%` }}
                    />
                    <span className="text-[10px] text-slate-500 mt-2 truncate w-full text-center">
                      Sem {week.weekNumber}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Tabular Breakdown */}
      <div>
        <h4 className="text-sm font-bold text-white mb-3">
          Tabela Detalhada por Semana
        </h4>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3.5">Semana</th>
                <th className="py-3 px-3.5">Período</th>
                <th className="py-3 px-3.5">Natação (Volume)</th>
                <th className="py-3 px-3.5">Academia (Sessões)</th>
                <th className="py-3 px-3.5">Meta 4x</th>
                <th className="py-3 px-3.5">Tempo Ativo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {weeksList.map((week) => {
                const isCurrent = week.weekStart === currentMonday;
                return (
                  <tr
                    key={week.weekStart}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isCurrent ? 'bg-cyan-500/5 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-3.5 flex items-center gap-1.5 font-bold text-white">
                      Semana {week.weekNumber}
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Atual
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-slate-400">
                      {formatReadableDateBR(week.weekStart, false)} a {formatReadableDateBR(week.weekEnd, false)}
                    </td>
                    <td className="py-3 px-3.5 text-cyan-300 font-semibold">
                      {week.swimKm} km ({week.swimSessions} {week.swimSessions === 1 ? 'treino' : 'treinos'})
                    </td>
                    <td className="py-3 px-3.5 text-rose-300 font-semibold">
                      {week.gymSessions} {week.gymSessions === 1 ? 'treino' : 'treinos'}
                    </td>
                    <td className="py-3 px-3.5">
                      {week.gymTargetMet ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30 text-[11px]">
                          <CheckCircle2 className="w-3 h-3" /> Atingida ({week.gymSessions}/4)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[11px]">
                          <XCircle className="w-3 h-3 text-amber-400" /> {week.gymSessions}/4 treinos
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {week.totalActiveMinutes} min
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
