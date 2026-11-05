import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Waves, Dumbbell, Bike, Footprints, Check, Calendar as CalendarIcon, Flag, Instagram } from 'lucide-react';
import { DayLog } from '../types/workout';
import { formatISODate, parseISODate, TODAY_STR } from '../utils/statsCalculator';

interface CalendarViewProps {
  logs: Record<string, DayLog>;
  onSelectDay: (dateStr: string) => void;
  onQuickToggleSwim: (dateStr: string) => void;
  onQuickToggleGym: (dateStr: string) => void;
  onOpenStoryForDate?: (dateStr: string) => void;
  selectedDateStr: string;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEK_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  logs,
  onSelectDay,
  onQuickToggleSwim,
  onQuickToggleGym,
  onOpenStoryForDate,
  selectedDateStr,
}) => {
  // Start on November 2026 strictly
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(10); // 10 = November

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const jumpToMonth = (mIndex: number, year: number = 2026) => {
    setCurrentMonth(mIndex);
    setCurrentYear(year);
  };

  // Generate grid for currentMonth & currentYear
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

  let firstDayIndex = firstDayOfMonth.getDay() - 1;
  if (firstDayIndex === -1) firstDayIndex = 6;

  const daysInMonth = lastDayOfMonth.getDate();

  const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
  const leadingDays: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const prevDate = new Date(currentYear, currentMonth - 1, d, 12);
    leadingDays.push({
      dateStr: formatISODate(prevDate),
      dayNum: d,
      isCurrentMonth: false,
    });
  }

  const currentMonthDays: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const curDate = new Date(currentYear, currentMonth, d, 12);
    currentMonthDays.push({
      dateStr: formatISODate(curDate),
      dayNum: d,
      isCurrentMonth: true,
    });
  }

  const totalSlotsSoFar = leadingDays.length + currentMonthDays.length;
  const trailingCount = (7 - (totalSlotsSoFar % 7)) % 7;
  const trailingDays: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];
  for (let d = 1; d <= trailingCount; d++) {
    const nextDate = new Date(currentYear, currentMonth + 1, d, 12);
    trailingDays.push({
      dateStr: formatISODate(nextDate),
      dayNum: d,
      isCurrentMonth: false,
    });
  }

  const allCalendarDays = [...leadingDays, ...currentMonthDays, ...trailingDays];

  const weeks: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[][] = [];
  for (let i = 0; i < allCalendarDays.length; i += 7) {
    weeks.push(allCalendarDays.slice(i, i + 7));
  }

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-6 shadow-xl backdrop-blur-md">
      
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
              {currentYear === 2026 && currentMonth === 10 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Início do Desafio
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Período ativo: 01 de Novembro a 31 de Dezembro de 2026
            </p>
          </div>
        </div>

        {/* Navigation & Quick Jump buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick jump to November & December 2026 */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => jumpToMonth(10, 2026)}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                currentMonth === 10 && currentYear === 2026
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Novembro (Início)
            </button>
            <button
              onClick={() => jumpToMonth(11, 2026)}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                currentMonth === 11 && currentYear === 2026
                  ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dezembro (Meta 31/12 🏁)
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => jumpToMonth(10, 2026)}
              className="px-2 py-1 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
            >
              Hoje
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs text-slate-400 border-b border-slate-800/60">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-500/20 border border-cyan-500/40 inline-flex items-center justify-center text-[9px] text-cyan-300">
              🏊
            </span>
            <span>Natação</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500/40 inline-flex items-center justify-center text-[9px] text-rose-300">
              🏋️
            </span>
            <span>Academia</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/40 inline-flex items-center justify-center text-[9px] text-amber-300">
              🚴
            </span>
            <span>Bike</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/40 inline-flex items-center justify-center text-[9px] text-emerald-300">
              🏃
            </span>
            <span>Corrida</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flag className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300 font-medium">31/12/2026: Meta Final</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          Clique no dia para detalhes 👉
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="mt-4 overflow-x-auto">
        <div className="min-w-[680px]">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-8 gap-2 mb-2 text-center text-xs font-semibold text-slate-400">
            {WEEK_DAYS.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
            <div className="py-1 text-cyan-400">
              Semana
            </div>
          </div>

          {/* Weeks Rows */}
          <div className="space-y-2">
            {weeks.map((week, wIdx) => {
              let weekSwimKm = 0;
              let weekGymCount = 0;
              let weekBikeKm = 0;
              let weekRunKm = 0;

              week.forEach((slot) => {
                const log = logs[slot.dateStr];
                if (log?.swimCompleted) {
                  weekSwimKm += (log.swim?.distanceMeters || 0) / 1000;
                }
                if (log?.gymCompleted) {
                  weekGymCount += 1;
                }
                if (log?.bikeCompleted) {
                  weekBikeKm += log.bike?.distanceKm || 0;
                }
                if (log?.runCompleted) {
                  weekRunKm += log.run?.distanceKm || 0;
                }
              });

              weekSwimKm = Math.round(weekSwimKm * 10) / 10;
              weekBikeKm = Math.round(weekBikeKm * 10) / 10;
              weekRunKm = Math.round(weekRunKm * 10) / 10;

              return (
                <div key={wIdx} className="grid grid-cols-8 gap-2">
                  {week.map((slot) => {
                    const isToday = slot.dateStr === TODAY_STR;
                    const isSelected = slot.dateStr === selectedDateStr;
                    const isTargetDeadline = slot.dateStr === '2026-12-31';
                    const isBeforeNov = slot.dateStr < '2026-11-01';
                    const isAfterDec = slot.dateStr > '2026-12-31';
                    const isOutOfProject = isBeforeNov || isAfterDec;

                    const log = logs[slot.dateStr];
                    const hasSwim = Boolean(log?.swimCompleted);
                    const hasGym = Boolean(log?.gymCompleted);
                    const hasBike = Boolean(log?.bikeCompleted);
                    const hasRun = Boolean(log?.runCompleted);

                    const totalChecks = [hasSwim, hasGym, hasBike, hasRun].filter(Boolean).length;

                    return (
                      <div
                        key={slot.dateStr}
                        onClick={() => onSelectDay(slot.dateStr)}
                        className={`group relative min-h-[96px] rounded-xl p-2 border transition-all cursor-pointer flex flex-col justify-between ${
                          isOutOfProject || !slot.isCurrentMonth
                            ? 'opacity-30 bg-slate-950/40 border-slate-900'
                            : isToday
                            ? 'bg-slate-900/90 border-cyan-400 ring-2 ring-cyan-400/20 shadow-lg shadow-cyan-950/50'
                            : isSelected
                            ? 'bg-slate-800/90 border-indigo-400'
                            : 'bg-slate-950/70 hover:bg-slate-900 border-slate-800/70 hover:border-slate-700'
                        }`}
                      >
                        {/* Day number & indicators */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span
                              className={`text-xs font-bold ${
                                isToday
                                  ? 'text-cyan-300 px-1.5 py-0.5 rounded-full bg-cyan-500/20'
                                  : isTargetDeadline
                                  ? 'text-amber-400 font-extrabold'
                                  : slot.isCurrentMonth
                                  ? 'text-slate-200'
                                  : 'text-slate-500'
                              }`}
                            >
                              {slot.dayNum}
                            </span>
                            {isTargetDeadline && (
                              <Flag className="w-3 h-3 text-amber-400 fill-amber-400" />
                            )}
                          </div>

                          {/* Quick check toggle mini-button on hover */}
                          {!isOutOfProject && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onQuickToggleSwim(slot.dateStr);
                                }}
                                className={`w-4 h-4 rounded text-[9px] flex items-center justify-center cursor-pointer ${
                                  hasSwim ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-cyan-500/30'
                                }`}
                                title={hasSwim ? 'Remover natação' : 'Check natação'}
                              >
                                🏊
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onQuickToggleGym(slot.dateStr);
                                }}
                                className={`w-4 h-4 rounded text-[9px] flex items-center justify-center cursor-pointer ${
                                  hasGym ? 'bg-rose-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-rose-500/30'
                                }`}
                                title={hasGym ? 'Remover academia' : 'Check academia'}
                              >
                                🏋️
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Badges / Check Content */}
                        <div className="space-y-1 my-1">
                          {hasSwim && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-[10px] font-semibold leading-tight truncate">
                              <Waves className="w-2.5 h-2.5 shrink-0 text-cyan-400" />
                              <span className="truncate">
                                {((log?.swim?.distanceMeters || 0) / 1000).toFixed(1)}k
                              </span>
                            </div>
                          )}

                          {hasGym && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-950/80 border border-rose-500/30 text-rose-300 text-[10px] font-semibold leading-tight truncate">
                              <Dumbbell className="w-2.5 h-2.5 shrink-0 text-rose-400" />
                              <span className="truncate">
                                {log?.gym?.focus ? log.gym.focus.split('/')[0].trim() : 'Academia'}
                              </span>
                            </div>
                          )}

                          {hasBike && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-950/80 border border-amber-500/30 text-amber-300 text-[10px] font-semibold leading-tight truncate">
                              <Bike className="w-2.5 h-2.5 shrink-0 text-amber-400" />
                              <span className="truncate">
                                {log?.bike?.distanceKm || 0}km
                              </span>
                            </div>
                          )}

                          {hasRun && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold leading-tight truncate">
                              <Footprints className="w-2.5 h-2.5 shrink-0 text-emerald-400" />
                              <span className="truncate">
                                {log?.run?.distanceKm || 0}km
                              </span>
                            </div>
                          )}

                          {totalChecks === 0 && isTargetDeadline && (
                            <div className="px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300 text-[9px] font-bold text-center">
                              META FINAL
                            </div>
                          )}
                        </div>

                        {/* Bottom Status Dot */}
                        <div className="flex items-center justify-between text-[9px] text-slate-500">
                          {totalChecks > 0 ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" /> {totalChecks}
                              </span>
                              {onOpenStoryForDate && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenStoryForDate(slot.dateStr);
                                  }}
                                  title="Criar Story para este dia"
                                  className="p-0.5 rounded text-pink-400 hover:text-pink-300 hover:bg-pink-500/20 cursor-pointer transition-colors"
                                >
                                  <Instagram className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <span />
                          )}

                          {isToday && (
                            <span className="text-cyan-400 font-bold">Hoje</span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* 8th Column: Weekly Summary Card */}
                  <div className="rounded-xl p-2.5 bg-slate-950/90 border border-slate-800 flex flex-col justify-between text-xs">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 mb-1">
                        Resumo Sem
                      </div>

                      <div className="space-y-1">
                        {weekSwimKm > 0 && (
                          <div className="text-[10px] text-cyan-400 flex items-center gap-1">
                            <Waves className="w-2.5 h-2.5" /> {weekSwimKm} km
                          </div>
                        )}
                        {weekGymCount > 0 && (
                          <div className="text-[10px] text-rose-400 flex items-center gap-1">
                            <Dumbbell className="w-2.5 h-2.5" /> {weekGymCount}x
                          </div>
                        )}
                        {weekBikeKm > 0 && (
                          <div className="text-[10px] text-amber-400 flex items-center gap-1">
                            <Bike className="w-2.5 h-2.5" /> {weekBikeKm} km
                          </div>
                        )}
                        {weekRunKm > 0 && (
                          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <Footprints className="w-2.5 h-2.5" /> {weekRunKm} km
                          </div>
                        )}
                        {weekSwimKm === 0 && weekGymCount === 0 && weekBikeKm === 0 && weekRunKm === 0 && (
                          <div className="text-[10px] text-slate-600">Sem treinos</div>
                        )}
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-500 text-center">
                      Semana {wIdx + 45}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
