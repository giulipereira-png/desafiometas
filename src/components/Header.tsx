import React from 'react';
import { Instagram, FileText, Sparkles, Target, RotateCcw, HardDrive, Sliders, Share2 } from 'lucide-react';
import { User } from 'firebase/auth';
import { CalculatedStats } from '../utils/statsCalculator';
import { GoalConfig } from '../types/workout';

interface HeaderProps {
  stats: CalculatedStats;
  goal: GoalConfig;
  currentUser?: User | null;
  onOpenStoryModal: () => void;
  onOpenPdfModal: () => void;
  onOpenSyncModal: () => void;
  onOpenGoalSettings: () => void;
  onOpenShareModal: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  goal,
  currentUser,
  onOpenStoryModal,
  onOpenPdfModal,
  onOpenSyncModal,
  onOpenGoalSettings,
  onOpenShareModal,
  onResetData,
}) => {
  const initials = goal.userName
    ? goal.userName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'GS';

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Profile & Identity */}
          <div className="flex items-center gap-3.5">
            <div className="relative group cursor-pointer" onClick={onOpenGoalSettings} title="Editar perfil e metas">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-rose-500 p-[2px] shadow-lg shadow-cyan-500/10">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center overflow-hidden">
                  <span className="text-lg font-bold bg-gradient-to-r from-cyan-300 to-rose-300 bg-clip-text text-transparent">
                    {initials}
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-cyan-500 text-slate-950 rounded-full p-0.5 shadow-sm">
                <Sparkles className="w-3 h-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-1.5">
                  {goal.userName}
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                    {goal.userHandle}
                  </span>
                </h1>
                {currentUser && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Nuvem Conectada
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="inline-flex items-center gap-1 text-slate-300">
                  <Target className="w-3.5 h-3.5 text-rose-400" />
                  Meta Individual:
                </span>
                <span className="text-slate-300 font-medium">{goal.targetEndDate || '31 Dez 2026'}</span>
                <span className="text-slate-600">•</span>
                <span className="text-cyan-400 font-semibold">{stats.daysRemainingToGoal} dias restantes</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Instagram Stories CTA */}
            <button
              onClick={onOpenStoryModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/20 hover:opacity-95 active:scale-95 transition-all cursor-pointer"
              title="Criar Story do seu treino diário para o Instagram"
            >
              <Instagram className="w-4 h-4" />
              <span>Postar no Stories</span>
            </button>

            {/* Export PDF */}
            <button
              onClick={onOpenPdfModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 active:scale-95 transition-all cursor-pointer"
              title="Exportar Relatório em PDF para análise"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>PDF</span>
            </button>

            {/* Personalizar Metas */}
            <button
              onClick={onOpenGoalSettings}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 active:scale-95 transition-all cursor-pointer"
              title="Personalizar nome, metas e esportes ativos"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Metas</span>
            </button>

            {/* Compartilhar App */}
            <button
              onClick={onOpenShareModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 active:scale-95 transition-all cursor-pointer"
              title="Compartilhar app para amigos criarem suas metas"
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Compartilhar</span>
            </button>

            {/* Backup & Sync */}
            <button
              onClick={onOpenSyncModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 active:scale-95 transition-all cursor-pointer"
              title="Sincronizar e fazer backup dos treinos na nuvem"
            >
              <HardDrive className="w-4 h-4 text-indigo-400" />
              <span className="hidden md:inline">Nuvem</span>
            </button>

            {/* Reset data helper */}
            <button
              onClick={onResetData}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-all cursor-pointer"
              title="Restaurar dados de exemplo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

