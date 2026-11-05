import React, { useState, useEffect } from 'react';
import { X, Check, Sliders, Waves, Dumbbell, Bike, Footprints, Target, Calendar, User, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GoalConfig } from '../types/workout';

interface GoalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: GoalConfig;
  onSaveGoal: (newGoal: GoalConfig) => void;
}

export const GoalSettingsModal: React.FC<GoalSettingsModalProps> = ({
  isOpen,
  onClose,
  goal,
  onSaveGoal,
}) => {
  const [userName, setUserName] = useState<string>(goal.userName || 'Giu Sousa');
  const [userHandle, setUserHandle] = useState<string>(goal.userHandle || '@prof_giu');
  const [targetEndDate, setTargetEndDate] = useState<string>(goal.targetEndDate || '2026-12-31');

  // Sports Toggles & Targets
  const [swimEnabled, setSwimEnabled] = useState<boolean>(goal.swimEnabled ?? true);
  const [swimTargetKm, setSwimTargetKm] = useState<number>(goal.swimTargetKm || 45);

  const [gymEnabled, setGymEnabled] = useState<boolean>(goal.gymEnabled ?? true);
  const [gymWeeklyTargetDays, setGymWeeklyTargetDays] = useState<number>(goal.gymWeeklyTargetDays || 4);

  const [bikeEnabled, setBikeEnabled] = useState<boolean>(goal.bikeEnabled ?? true);
  const [bikeTargetKm, setBikeTargetKm] = useState<number>(goal.bikeTargetKm || 150);

  const [runEnabled, setRunEnabled] = useState<boolean>(goal.runEnabled ?? true);
  const [runTargetKm, setRunTargetKm] = useState<number>(goal.runTargetKm || 80);

  useEffect(() => {
    if (isOpen) {
      setUserName(goal.userName || 'Giu Sousa');
      setUserHandle(goal.userHandle || '@prof_giu');
      setTargetEndDate(goal.targetEndDate || '2026-12-31');

      setSwimEnabled(goal.swimEnabled ?? true);
      setSwimTargetKm(goal.swimTargetKm || 45);

      setGymEnabled(goal.gymEnabled ?? true);
      setGymWeeklyTargetDays(goal.gymWeeklyTargetDays || 4);

      setBikeEnabled(goal.bikeEnabled ?? true);
      setBikeTargetKm(goal.bikeTargetKm || 150);

      setRunEnabled(goal.runEnabled ?? true);
      setRunTargetKm(goal.runTargetKm || 80);
    }
  }, [isOpen, goal]);

  if (!isOpen) return null;

  const handleSave = () => {
    const updated: GoalConfig = {
      ...goal,
      userName: userName.trim() || 'Atleta',
      userHandle: userHandle.trim().startsWith('@') ? userHandle.trim() : `@${userHandle.trim()}`,
      targetEndDate,
      swimEnabled,
      swimTargetKm: Number(swimTargetKm) || 45,
      gymEnabled,
      gymWeeklyTargetDays: Number(gymWeeklyTargetDays) || 4,
      bikeEnabled,
      bikeTargetKm: Number(bikeTargetKm) || 150,
      runEnabled,
      runTargetKm: Number(runTargetKm) || 80,
    };

    onSaveGoal(updated);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Personalizar Perfil e Metas
              </h3>
              <p className="text-xs text-slate-400">
                Ajuste seu nome, data limite e escolha quais esportes quer acompanhar
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto space-y-5 text-xs text-slate-200">
          
          {/* Identity & Deadline Section */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3.5">
            <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] block">
              1. Identidade & Prazo da Meta
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Seu Nome / Como quer ser chamada</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ex: Giu Sousa"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Seu @ (Instagram ou apelido)</label>
                <input
                  type="text"
                  value={userHandle}
                  onChange={(e) => setUserHandle(e.target.value)}
                  placeholder="Ex: @prof_giu"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Data Limite da Meta (Fim de Ano ou Personalizada)</label>
              <input
                type="date"
                value={targetEndDate}
                onChange={(e) => setTargetEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Activities & Custom Targets */}
          <div className="space-y-3">
            <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] block">
              2. Escolha suas Atividades & Metas
            </span>

            {/* SPORT 1: Natação */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              swimEnabled ? 'bg-cyan-950/30 border-cyan-500/40' : 'bg-slate-900/40 border-slate-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Waves className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs block">Natação</span>
                    <span className="text-[11px] text-slate-400">Meta total em quilômetros</span>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={swimEnabled}
                    onChange={(e) => setSwimEnabled(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[11px] font-semibold text-slate-300">Ativar</span>
                </label>
              </div>

              {swimEnabled && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <label className="text-slate-400 text-[11px]">Meta de natação até o prazo:</label>
                  <div className="flex items-center gap-1.5 w-32">
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="1000"
                      value={swimTargetKm}
                      onChange={(e) => setSwimTargetKm(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs text-right focus:border-cyan-400 focus:outline-none"
                    />
                    <span className="text-cyan-400 font-bold text-xs">km</span>
                  </div>
                </div>
              )}
            </div>

            {/* SPORT 2: Academia / Musculação */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              gymEnabled ? 'bg-rose-950/30 border-rose-500/40' : 'bg-slate-900/40 border-slate-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs block">Academia / Musculação</span>
                    <span className="text-[11px] text-slate-400">Frequência semanal de treinos</span>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gymEnabled}
                    onChange={(e) => setGymEnabled(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[11px] font-semibold text-slate-300">Ativar</span>
                </label>
              </div>

              {gymEnabled && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <label className="text-slate-400 text-[11px]">Mínimo de treinos por semana:</label>
                  <div className="flex items-center gap-1.5 w-32">
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="7"
                      value={gymWeeklyTargetDays}
                      onChange={(e) => setGymWeeklyTargetDays(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs text-right focus:border-rose-400 focus:outline-none"
                    />
                    <span className="text-rose-400 font-bold text-xs">x/sem</span>
                  </div>
                </div>
              )}
            </div>

            {/* SPORT 3: Ciclismo / Bike */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              bikeEnabled ? 'bg-amber-950/30 border-amber-500/40' : 'bg-slate-900/40 border-slate-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Bike className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs block">Ciclismo / Bike</span>
                    <span className="text-[11px] text-slate-400">Meta total de pedal em quilômetros</span>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bikeEnabled}
                    onChange={(e) => setBikeEnabled(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[11px] font-semibold text-slate-300">Ativar</span>
                </label>
              </div>

              {bikeEnabled && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <label className="text-slate-400 text-[11px]">Meta de bike até o prazo:</label>
                  <div className="flex items-center gap-1.5 w-32">
                    <input
                      type="number"
                      step="5"
                      min="5"
                      max="5000"
                      value={bikeTargetKm}
                      onChange={(e) => setBikeTargetKm(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs text-right focus:border-amber-400 focus:outline-none"
                    />
                    <span className="text-amber-400 font-bold text-xs">km</span>
                  </div>
                </div>
              )}
            </div>

            {/* SPORT 4: Corrida */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              runEnabled ? 'bg-emerald-950/30 border-emerald-500/40' : 'bg-slate-900/40 border-slate-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Footprints className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs block">Corrida</span>
                    <span className="text-[11px] text-slate-400">Meta total de corrida em quilômetros</span>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={runEnabled}
                    onChange={(e) => setRunEnabled(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[11px] font-semibold text-slate-300">Ativar</span>
                </label>
              </div>

              {runEnabled && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <label className="text-slate-400 text-[11px]">Meta de corrida até o prazo:</label>
                  <div className="flex items-center gap-1.5 w-32">
                    <input
                      type="number"
                      step="5"
                      min="5"
                      max="2000"
                      value={runTargetKm}
                      onChange={(e) => setRunTargetKm(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs text-right focus:border-emerald-400 focus:outline-none"
                    />
                    <span className="text-emerald-400 font-bold text-xs">km</span>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Salvar Minhas Metas</span>
          </button>
        </div>

      </div>
    </div>
  );
};
