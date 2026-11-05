import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  BarChart3,
  Waves,
  Dumbbell,
  Sparkles,
  Instagram,
  FileText,
  HardDrive,
  Flag,
  Flame,
  CheckCircle2,
  Clock,
  Share2,
  Sliders
} from 'lucide-react';
import { Header } from './components/Header';
import { GoalOverview } from './components/GoalOverview';
import { QuickCheckinBar } from './components/QuickCheckinBar';
import { CalendarView } from './components/CalendarView';
import { WeeklyStatsView } from './components/WeeklyStatsView';
import { InstagramStoryModal } from './components/InstagramStoryModal';
import { ExportPdfModal } from './components/ExportPdfModal';
import { SyncBackupModal } from './components/SyncBackupModal';
import { DayEditModal } from './components/DayEditModal';
import { GoalSettingsModal } from './components/GoalSettingsModal';
import { ShareAppModal } from './components/ShareAppModal';

import { DayLog, GoalConfig } from './types/workout';
import { loadLogs, saveLogs, loadGoal, saveGoal, resetToDefaults } from './utils/storage';
import { calculateStats, TODAY_STR, formatReadableDateBR } from './utils/statsCalculator';

import { onAuthStateChanged, User } from 'firebase/auth';
import {
  auth,
  testConnection,
  subscribeToUserWorkouts,
  subscribeToUserGoal,
  syncWorkoutToCloud,
  deleteWorkoutFromCloud,
  syncGoalToCloud,
} from './firebase';

export default function App() {
  const [logs, setLogs] = useState<Record<string, DayLog>>(() => loadLogs());
  const [goal, setGoal] = useState<GoalConfig>(() => loadGoal());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(TODAY_STR);
  const [activeTab, setActiveTab] = useState<'calendar' | 'stats'>('calendar');

  // Firebase Auth & Cloud Sync State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);

  // Modals state
  const [isStoryModalOpen, setIsStoryModalOpen] = useState<boolean>(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [isDayEditModalOpen, setIsDayEditModalOpen] = useState<boolean>(false);
  const [isGoalSettingsModalOpen, setIsGoalSettingsModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [modalDateStr, setModalDateStr] = useState<string>(TODAY_STR);

  // Test Firebase connection on mount
  useEffect(() => {
    testConnection();
  }, []);

  // Listen for Firebase Auth changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  // Subscribe to Cloud Workouts and Goals when logged in
  useEffect(() => {
    if (!currentUser) return;

    // Subscribe to cloud workouts
    const unsubWorkouts = subscribeToUserWorkouts(currentUser.uid, (cloudLogs) => {
      if (Object.keys(cloudLogs).length > 0) {
        setLogs((prev) => {
          const merged = { ...prev, ...cloudLogs };
          saveLogs(merged);
          return merged;
        });
      }
    });

    // Subscribe to cloud goal
    const unsubGoal = subscribeToUserGoal(currentUser.uid, (cloudGoal) => {
      if (cloudGoal && Object.keys(cloudGoal).length > 0) {
        setGoal((prev) => {
          const merged = { ...prev, ...cloudGoal, userName: cloudGoal.userName || prev.userName || 'Giu Sousa' };
          saveGoal(merged);
          return merged;
        });
      }
    });

    return () => {
      unsubWorkouts();
      unsubGoal();
    };
  }, [currentUser]);

  // Sync all local logs to cloud on initial login or demand
  const handleSyncAllToCloud = async () => {
    if (!currentUser) return;
    try {
      setIsSyncingCloud(true);
      await syncGoalToCloud(currentUser.uid, goal);
      const entries = Object.values(logs);
      for (const entry of entries) {
        await syncWorkoutToCloud(currentUser.uid, entry);
      }
    } catch (err) {
      console.error('Error syncing all workouts to cloud:', err);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Sync to localStorage
  useEffect(() => {
    saveLogs(logs);
  }, [logs]);

  useEffect(() => {
    saveGoal(goal);
  }, [goal]);

  const stats = calculateStats(logs, goal, TODAY_STR);

  // Quick 1-tap toggle handlers (preserving all sports)
  const handleToggleSwim = (date: string, distanceMeters: number = 1500) => {
    setLogs((prev) => {
      const existing = prev[date];
      const willComplete = !existing?.swimCompleted;

      const updated: DayLog = {
        date,
        swimCompleted: willComplete,
        swim: willComplete
          ? {
              distanceMeters: existing?.swim?.distanceMeters || distanceMeters,
              durationMinutes: existing?.swim?.durationMinutes || 45,
              poolType: existing?.swim?.poolType || '25m',
              style: existing?.swim?.style || 'Livre / Crawl',
            }
          : undefined,
        gymCompleted: Boolean(existing?.gymCompleted),
        gym: existing?.gym,
        bikeCompleted: Boolean(existing?.bikeCompleted),
        bike: existing?.bike,
        runCompleted: Boolean(existing?.runCompleted),
        run: existing?.run,
        feeling: existing?.feeling || '🔥 Excelente',
        updatedAt: new Date().toISOString(),
      };

      if (currentUser) {
        syncWorkoutToCloud(currentUser.uid, updated).catch(console.error);
      }

      return { ...prev, [date]: updated };
    });
  };

  const handleToggleGym = (date: string, focus: string = 'Inferior / Pernas') => {
    setLogs((prev) => {
      const existing = prev[date];
      const willComplete = !existing?.gymCompleted;

      const updated: DayLog = {
        date,
        swimCompleted: Boolean(existing?.swimCompleted),
        swim: existing?.swim,
        gymCompleted: willComplete,
        gym: willComplete
          ? {
              focus: (existing?.gym?.focus || focus) as any,
              durationMinutes: existing?.gym?.durationMinutes || 55,
              intensity: existing?.gym?.intensity || 'Intenso',
            }
          : undefined,
        bikeCompleted: Boolean(existing?.bikeCompleted),
        bike: existing?.bike,
        runCompleted: Boolean(existing?.runCompleted),
        run: existing?.run,
        feeling: existing?.feeling || '💪 Firme',
        updatedAt: new Date().toISOString(),
      };

      if (currentUser) {
        syncWorkoutToCloud(currentUser.uid, updated).catch(console.error);
      }

      return { ...prev, [date]: updated };
    });
  };

  const handleToggleBike = (date: string, distanceKm: number = 20) => {
    setLogs((prev) => {
      const existing = prev[date];
      const willComplete = !existing?.bikeCompleted;

      const updated: DayLog = {
        date,
        swimCompleted: Boolean(existing?.swimCompleted),
        swim: existing?.swim,
        gymCompleted: Boolean(existing?.gymCompleted),
        gym: existing?.gym,
        bikeCompleted: willComplete,
        bike: willComplete
          ? {
              distanceKm: existing?.bike?.distanceKm || distanceKm,
              durationMinutes: existing?.bike?.durationMinutes || 50,
              bikeType: existing?.bike?.bikeType || 'Estrada / Speed',
            }
          : undefined,
        runCompleted: Boolean(existing?.runCompleted),
        run: existing?.run,
        feeling: existing?.feeling || '🔥 Excelente',
        updatedAt: new Date().toISOString(),
      };

      if (currentUser) {
        syncWorkoutToCloud(currentUser.uid, updated).catch(console.error);
      }

      return { ...prev, [date]: updated };
    });
  };

  const handleToggleRun = (date: string, distanceKm: number = 5) => {
    setLogs((prev) => {
      const existing = prev[date];
      const willComplete = !existing?.runCompleted;

      const updated: DayLog = {
        date,
        swimCompleted: Boolean(existing?.swimCompleted),
        swim: existing?.swim,
        gymCompleted: Boolean(existing?.gymCompleted),
        gym: existing?.gym,
        bikeCompleted: Boolean(existing?.bikeCompleted),
        bike: existing?.bike,
        runCompleted: willComplete,
        run: willComplete
          ? {
              distanceKm: existing?.run?.distanceKm || distanceKm,
              durationMinutes: existing?.run?.durationMinutes || 30,
              terrain: existing?.run?.terrain || 'Rua / Asfalto',
              paceAvg: existing?.run?.paceAvg || '5:30/km',
            }
          : undefined,
        feeling: existing?.feeling || '💪 Firme',
        updatedAt: new Date().toISOString(),
      };

      if (currentUser) {
        syncWorkoutToCloud(currentUser.uid, updated).catch(console.error);
      }

      return { ...prev, [date]: updated };
    });
  };

  const handleSaveGoal = (newGoal: GoalConfig) => {
    setGoal(newGoal);
    saveGoal(newGoal);
    if (currentUser) {
      syncGoalToCloud(currentUser.uid, newGoal).catch(console.error);
    }
  };

  const handleSaveDayLog = (newLog: DayLog) => {
    setLogs((prev) => ({
      ...prev,
      [newLog.date]: newLog,
    }));
    if (currentUser) {
      syncWorkoutToCloud(currentUser.uid, newLog).catch(console.error);
    }
  };

  const handleDeleteDayLog = (date: string) => {
    setLogs((prev) => {
      const copy = { ...prev };
      delete copy[date];
      return copy;
    });
    if (currentUser) {
      deleteWorkoutFromCloud(currentUser.uid, date).catch(console.error);
    }
  };

  const handleOpenDayDetails = (date: string) => {
    setModalDateStr(date);
    setSelectedDateStr(date);
    setIsDayEditModalOpen(true);
  };

  const handleOpenStoryForDate = (date: string) => {
    setModalDateStr(date);
    setSelectedDateStr(date);
    setIsStoryModalOpen(true);
  };

  const handleResetData = () => {
    if (window.confirm('Deseja restaurar os dados de treino de exemplo da @prof_giu?')) {
      const restored = resetToDefaults();
      setLogs(restored.logs);
      setGoal(restored.goal);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Header Navigation */}
      <Header
        stats={stats}
        goal={goal}
        currentUser={currentUser}
        onOpenStoryModal={() => {
          setModalDateStr(selectedDateStr);
          setIsStoryModalOpen(true);
        }}
        onOpenPdfModal={() => setIsPdfModalOpen(true)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenGoalSettings={() => setIsGoalSettingsModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 sm:space-y-8">
        
        {/* Banner: Countdown & Streak Motivation */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-rose-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Flag className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-amber-400">
                  Meta Individual até {goal.targetEndDate || '31/12/2026'}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                  Desafio Pessoal • 01/11 a 31/12/2026
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                {[
                  goal.swimEnabled && `${goal.swimTargetKm}km Natação`,
                  goal.gymEnabled && `Academia ${goal.gymWeeklyTargetDays}x/sem`,
                  goal.bikeEnabled && `${goal.bikeTargetKm}km Bike`,
                  goal.runEnabled && `${goal.runTargetKm}km Corrida`,
                ].filter(Boolean).join(' • ') || 'Constância e Metas Pessoais'}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <div>
                <span className="text-slate-400 block text-[10px]">Sequência Ativa</span>
                <span className="font-bold text-amber-300 text-xs sm:text-sm">
                  {stats.currentActiveDayStreak} {stats.currentActiveDayStreak === 1 ? 'dia' : 'dias'}
                </span>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-slate-400 block text-[10px]">Tempo Total</span>
                <span className="font-bold text-cyan-300 text-xs sm:text-sm">
                  ~{(stats.totalActiveMinutes / 60).toFixed(0)}h de treino
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-semibold border border-cyan-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Compartilhar App</span>
            </button>
          </div>
        </div>

        {/* Primary Goals Dashboard */}
        <GoalOverview
          stats={stats}
          goal={goal}
          onOpenGoalSettings={() => setIsGoalSettingsModalOpen(true)}
        />

        {/* Quick Check-in Bar for Today / Selected Date */}
        <QuickCheckinBar
          currentDateStr={selectedDateStr}
          dayLog={logs[selectedDateStr]}
          goal={goal}
          onToggleSwim={handleToggleSwim}
          onToggleGym={handleToggleGym}
          onToggleBike={handleToggleBike}
          onToggleRun={handleToggleRun}
          onOpenDayDetails={handleOpenDayDetails}
          onOpenStoryModal={() => {
            setModalDateStr(selectedDateStr);
            setIsStoryModalOpen(true);
          }}
          streakCount={stats.currentActiveDayStreak}
        />

        {/* Tab Navigation for Calendar vs Detailed Weekly Stats */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'calendar'
                  ? 'border-cyan-400 text-white bg-slate-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <CalendarIcon className="w-4 h-4 text-cyan-400" />
              <span>Calendário & Marcação de Dias</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'stats'
                  ? 'border-rose-400 text-white bg-slate-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-rose-400" />
              <span>Estatísticas Semanais de Desempenho</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span>Cálculo automático ativo</span>
          </div>
        </div>

        {/* Tab Content 1: Calendar View */}
        {activeTab === 'calendar' && (
          <CalendarView
            logs={logs}
            selectedDateStr={selectedDateStr}
            onSelectDay={(dateStr) => {
              setSelectedDateStr(dateStr);
              handleOpenDayDetails(dateStr);
            }}
            onQuickToggleSwim={(dateStr) => handleToggleSwim(dateStr)}
            onQuickToggleGym={(dateStr) => handleToggleGym(dateStr)}
            onOpenStoryForDate={handleOpenStoryForDate}
          />
        )}

        {/* Tab Content 2: Weekly Performance Statistics View */}
        {activeTab === 'stats' && (
          <WeeklyStatsView logs={logs} />
        )}

        {/* Engagement & Story Highlight Banner at Bottom */}
        <div className="rounded-2xl bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-cyan-950/40 border border-pink-500/20 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-300">
              <Instagram className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Compartilhe o seu check no Stories todos os dias!
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Gere um card 9:16 com @prof_giu, km nadados, treino de academia e motive seus seguidores a treinarem junto.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setModalDateStr(selectedDateStr);
                setIsStoryModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md shadow-pink-500/20 hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              <Instagram className="w-4 h-4" />
              <span>Gerar Story de Hoje</span>
            </button>

            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Exportar PDF</span>
            </button>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400 font-medium">
            <span>{goal.userName}</span>
            <span className="text-cyan-400">{goal.userHandle}</span>
            <span>• Meta 45km Natação + Academia 4x/sem até 31/12/2026</span>
          </div>
          <div>
            Desenvolvido com design minimalista & alta performance esportiva
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Instagram Story Studio Modal */}
      <InstagramStoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        stats={stats}
        goal={goal}
        currentDateStr={modalDateStr}
        dayLog={logs[modalDateStr]}
        logs={logs}
      />

      {/* 2. PDF Export Modal */}
      <ExportPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        stats={stats}
        goal={goal}
        logs={logs}
      />

      {/* 3. Sync & Backup Modal */}
      <SyncBackupModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        currentUser={currentUser}
        onSyncAllToCloud={handleSyncAllToCloud}
        isSyncingCloud={isSyncingCloud}
        onDataImported={() => {
          setLogs(loadLogs());
          setGoal(loadGoal());
        }}
      />

      {/* 4. Day Details / Edit Workout Modal */}
      <DayEditModal
        isOpen={isDayEditModalOpen}
        onClose={() => setIsDayEditModalOpen(false)}
        dateStr={modalDateStr}
        existingLog={logs[modalDateStr]}
        onSaveDayLog={handleSaveDayLog}
        onDeleteDayLog={handleDeleteDayLog}
        onOpenStoryForDate={handleOpenStoryForDate}
      />

      {/* 5. Personalize Goals & Sports Modal */}
      <GoalSettingsModal
        isOpen={isGoalSettingsModalOpen}
        onClose={() => setIsGoalSettingsModalOpen(false)}
        goal={goal}
        onSaveGoal={handleSaveGoal}
      />

      {/* 6. Share App Modal */}
      <ShareAppModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        userHandle={goal.userHandle}
      />

    </div>
  );
}
