import React, { useState, useEffect } from 'react';
import { X, Check, Waves, Dumbbell, Bike, Footprints, Calendar, Clock, Trash2, Instagram, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DayLog } from '../types/workout';
import { formatReadableDateBR, TODAY_STR } from '../utils/statsCalculator';

interface DayEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  existingLog?: DayLog;
  onSaveDayLog: (log: DayLog) => void;
  onDeleteDayLog: (dateStr: string) => void;
  onOpenStoryForDate: (dateStr: string) => void;
}

const SWIM_DISTANCE_PRESETS = [1000, 1500, 1800, 2000, 2500, 3000];
const GYM_FOCUS_OPTIONS = [
  'Superior',
  'Inferior / Pernas',
  'Full Body',
  'Costas & Bíceps',
  'Peito & Tríceps',
  'Glúteo & Core',
  'Cardio & Funcional',
] as const;

const BIKE_PRESETS = [10, 15, 20, 25, 30, 40, 50];
const RUN_PRESETS = [3, 5, 8, 10, 12, 15, 21];

export const DayEditModal: React.FC<DayEditModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  existingLog,
  onSaveDayLog,
  onDeleteDayLog,
  onOpenStoryForDate,
}) => {
  // Natação
  const [swimCompleted, setSwimCompleted] = useState<boolean>(false);
  const [swimDistance, setSwimDistance] = useState<number>(1500);
  const [swimDuration, setSwimDuration] = useState<number>(45);
  const [swimPoolType, setSwimPoolType] = useState<'25m' | '50m' | 'mar_aberto'>('25m');
  const [swimStyle, setSwimStyle] = useState<string>('Livre / Crawl');
  const [swimNotes, setSwimNotes] = useState<string>('');

  // Academia
  const [gymCompleted, setGymCompleted] = useState<boolean>(false);
  const [gymFocus, setGymFocus] = useState<string>('Inferior / Pernas');
  const [gymDuration, setGymDuration] = useState<number>(55);
  const [gymIntensity, setGymIntensity] = useState<'Leve' | 'Moderado' | 'Intenso' | 'Muito Intenso'>('Intenso');
  const [gymNotes, setGymNotes] = useState<string>('');

  // Ciclismo / Bike
  const [bikeCompleted, setBikeCompleted] = useState<boolean>(false);
  const [bikeDistance, setBikeDistance] = useState<number>(20);
  const [bikeDuration, setBikeDuration] = useState<number>(50);
  const [bikeType, setBikeType] = useState<'Estrada / Speed' | 'MTB / Trilha' | 'Spinning / Rolo' | 'Urbana / Passeio'>('Estrada / Speed');
  const [bikeNotes, setBikeNotes] = useState<string>('');

  // Corrida
  const [runCompleted, setRunCompleted] = useState<boolean>(false);
  const [runDistance, setRunDistance] = useState<number>(5);
  const [runDuration, setRunDuration] = useState<number>(30);
  const [runTerrain, setRunTerrain] = useState<'Rua / Asfalto' | 'Esteira' | 'Pista' | 'Trail / Montanha'>('Rua / Asfalto');
  const [runPace, setRunPace] = useState<string>('5:30/km');
  const [runNotes, setRunNotes] = useState<string>('');

  const [feeling, setFeeling] = useState<string>('🔥 Excelente');

  useEffect(() => {
    if (existingLog) {
      setSwimCompleted(Boolean(existingLog.swimCompleted));
      setSwimDistance(existingLog.swim?.distanceMeters || 1500);
      setSwimDuration(existingLog.swim?.durationMinutes || 45);
      setSwimPoolType(existingLog.swim?.poolType || '25m');
      setSwimStyle(existingLog.swim?.style || 'Livre / Crawl');
      setSwimNotes(existingLog.swim?.notes || '');

      setGymCompleted(Boolean(existingLog.gymCompleted));
      setGymFocus(existingLog.gym?.focus || 'Inferior / Pernas');
      setGymDuration(existingLog.gym?.durationMinutes || 55);
      setGymIntensity(existingLog.gym?.intensity || 'Intenso');
      setGymNotes(existingLog.gym?.notes || '');

      setBikeCompleted(Boolean(existingLog.bikeCompleted));
      setBikeDistance(existingLog.bike?.distanceKm || 20);
      setBikeDuration(existingLog.bike?.durationMinutes || 50);
      setBikeType(existingLog.bike?.bikeType || 'Estrada / Speed');
      setBikeNotes(existingLog.bike?.notes || '');

      setRunCompleted(Boolean(existingLog.runCompleted));
      setRunDistance(existingLog.run?.distanceKm || 5);
      setRunDuration(existingLog.run?.durationMinutes || 30);
      setRunTerrain(existingLog.run?.terrain || 'Rua / Asfalto');
      setRunPace(existingLog.run?.paceAvg || '5:30/km');
      setRunNotes(existingLog.run?.notes || '');

      setFeeling(existingLog.feeling || '🔥 Excelente');
    } else {
      setSwimCompleted(false);
      setSwimDistance(1500);
      setSwimDuration(45);
      setSwimPoolType('25m');
      setSwimStyle('Livre / Crawl');
      setSwimNotes('');

      setGymCompleted(false);
      setGymFocus('Inferior / Pernas');
      setGymDuration(55);
      setGymIntensity('Intenso');
      setGymNotes('');

      setBikeCompleted(false);
      setBikeDistance(20);
      setBikeDuration(50);
      setBikeType('Estrada / Speed');
      setBikeNotes('');

      setRunCompleted(false);
      setRunDistance(5);
      setRunDuration(30);
      setRunTerrain('Rua / Asfalto');
      setRunPace('5:30/km');
      setRunNotes('');

      setFeeling('🔥 Excelente');
    }
  }, [existingLog, dateStr, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const updated: DayLog = {
      date: dateStr,
      swimCompleted,
      swim: swimCompleted
        ? {
            distanceMeters: swimDistance,
            durationMinutes: swimDuration,
            poolType: swimPoolType,
            style: swimStyle as any,
            notes: swimNotes,
          }
        : undefined,
      gymCompleted,
      gym: gymCompleted
        ? {
            focus: gymFocus as any,
            durationMinutes: gymDuration,
            intensity: gymIntensity,
            notes: gymNotes,
          }
        : undefined,
      bikeCompleted,
      bike: bikeCompleted
        ? {
            distanceKm: bikeDistance,
            durationMinutes: bikeDuration,
            bikeType,
            notes: bikeNotes,
          }
        : undefined,
      runCompleted,
      run: runCompleted
        ? {
            distanceKm: runDistance,
            durationMinutes: runDuration,
            terrain: runTerrain,
            paceAvg: runPace,
            notes: runNotes,
          }
        : undefined,
      feeling: feeling as any,
      updatedAt: new Date().toISOString(),
    };

    onSaveDayLog(updated);

    if (swimCompleted || gymCompleted || bikeCompleted || runCompleted) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    }

    onClose();
  };

  const handleOpenStory = () => {
    const updated: DayLog = {
      date: dateStr,
      swimCompleted,
      swim: swimCompleted
        ? {
            distanceMeters: swimDistance,
            durationMinutes: swimDuration,
            poolType: swimPoolType,
            style: swimStyle as any,
            notes: swimNotes,
          }
        : undefined,
      gymCompleted,
      gym: gymCompleted
        ? {
            focus: gymFocus as any,
            durationMinutes: gymDuration,
            intensity: gymIntensity,
            notes: gymNotes,
          }
        : undefined,
      bikeCompleted,
      bike: bikeCompleted
        ? {
            distanceKm: bikeDistance,
            durationMinutes: bikeDuration,
            bikeType,
            notes: bikeNotes,
          }
        : undefined,
      runCompleted,
      run: runCompleted
        ? {
            distanceKm: runDistance,
            durationMinutes: runDuration,
            terrain: runTerrain,
            paceAvg: runPace,
            notes: runNotes,
          }
        : undefined,
      feeling: feeling as any,
      updatedAt: new Date().toISOString(),
    };

    onSaveDayLog(updated);
    onClose();
    onOpenStoryForDate(dateStr);
  };

  const handleDelete = () => {
    onDeleteDayLog(dateStr);
    onClose();
  };

  const isToday = dateStr === TODAY_STR;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white capitalize">
                  {formatReadableDateBR(dateStr)}
                </h3>
                {isToday && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Hoje
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Marque e detalhe seus treinos de natação, academia, bike e corrida
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenStory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-300 border border-pink-500/30 hover:bg-pink-500/30 transition-all cursor-pointer"
              title="Salvar e criar Story para este dia"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Criar Story</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto space-y-6">
          
          {/* SECTION 1: NATAÇÃO */}
          <div className={`p-4 rounded-xl border transition-all ${
            swimCompleted ? 'bg-cyan-950/40 border-cyan-500/40' : 'bg-slate-900/50 border-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Waves className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Natação</h4>
                  <span className="text-[11px] text-cyan-400">Contabiliza para a meta de 45 km</span>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={swimCompleted}
                  onChange={(e) => setSwimCompleted(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                />
                <span>Treino Feito ✅</span>
              </label>
            </div>

            {swimCompleted && (
              <div className="mt-4 space-y-3.5">
                {/* Distance */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Distância Nadada: <strong className="text-cyan-300">{(swimDistance / 1000).toFixed(1)} km</strong> ({swimDistance} metros)
                  </label>
                  
                  {/* Presets */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {SWIM_DISTANCE_PRESETS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSwimDistance(m)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          swimDistance === m
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {(m / 1000).toFixed(1)}k ({m}m)
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    step="50"
                    min="50"
                    max="20000"
                    value={swimDistance}
                    onChange={(e) => setSwimDistance(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-400 focus:outline-none"
                    placeholder="Distância em metros (ex: 1500)"
                  />
                </div>

                {/* Duration & Pool */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Duração (min)</label>
                    <input
                      type="number"
                      value={swimDuration}
                      onChange={(e) => setSwimDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Piscina</label>
                    <select
                      value={swimPoolType}
                      onChange={(e) => setSwimPoolType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="25m">Piscina Curta (25m)</option>
                      <option value="50m">Piscina Olímpica (50m)</option>
                      <option value="mar_aberto">Águas Abertas / Mar</option>
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Observações da Natação</label>
                  <input
                    type="text"
                    value={swimNotes}
                    onChange={(e) => setSwimNotes(e.target.value)}
                    placeholder="Ex: Séries de crawl ritmadas, bom ritmo de pernas..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: ACADEMIA / MUSCULAÇÃO */}
          <div className={`p-4 rounded-xl border transition-all ${
            gymCompleted ? 'bg-rose-950/40 border-rose-500/40' : 'bg-slate-900/50 border-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Academia (Musculação)</h4>
                  <span className="text-[11px] text-rose-400">Contabiliza para a meta de 4x/semana</span>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gymCompleted}
                  onChange={(e) => setGymCompleted(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-0 cursor-pointer"
                />
                <span>Treino Feito ✅</span>
              </label>
            </div>

            {gymCompleted && (
              <div className="mt-4 space-y-3.5">
                {/* Focus / Muscle Group */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Foco do Treino:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {GYM_FOCUS_OPTIONS.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setGymFocus(f)}
                        className={`p-2 rounded-lg text-xs font-medium text-left truncate transition-colors cursor-pointer ${
                          gymFocus === f
                            ? 'bg-rose-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Intensity & Duration */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Duração (min)</label>
                    <input
                      type="number"
                      value={gymDuration}
                      onChange={(e) => setGymDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-rose-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Intensidade</label>
                    <select
                      value={gymIntensity}
                      onChange={(e) => setGymIntensity(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-rose-400 focus:outline-none"
                    >
                      <option value="Leve">Leve</option>
                      <option value="Moderado">Moderado</option>
                      <option value="Intenso">Intenso</option>
                      <option value="Muito Intenso">Muito Intenso 🔥</option>
                    </select>
                  </div>
                </div>

                {/* Gym Notes */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Exercícios / Cargas / Notas</label>
                  <input
                    type="text"
                    value={gymNotes}
                    onChange={(e) => setGymNotes(e.target.value)}
                    placeholder="Ex: Treino A - Foco em posterior e agachamento livre..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-rose-400 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: CICLISMO / BIKE */}
          <div className={`p-4 rounded-xl border transition-all ${
            bikeCompleted ? 'bg-amber-950/40 border-amber-500/40' : 'bg-slate-900/50 border-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Bike className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Ciclismo / Bike</h4>
                  <span className="text-[11px] text-amber-400">Contabiliza quilômetros de pedal</span>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bikeCompleted}
                  onChange={(e) => setBikeCompleted(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span>Pedal Feito ✅</span>
              </label>
            </div>

            {bikeCompleted && (
              <div className="mt-4 space-y-3.5">
                {/* Distance */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Distância Pedalada: <strong className="text-amber-300">{bikeDistance} km</strong>
                  </label>
                  
                  {/* Presets */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {BIKE_PRESETS.map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setBikeDistance(k)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          bikeDistance === k
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {k} km
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="500"
                    value={bikeDistance}
                    onChange={(e) => setBikeDistance(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                    placeholder="Distância em km (ex: 25)"
                  />
                </div>

                {/* Duration & Bike Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Duração (min)</label>
                    <input
                      type="number"
                      value={bikeDuration}
                      onChange={(e) => setBikeDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Tipo de Bike</label>
                    <select
                      value={bikeType}
                      onChange={(e) => setBikeType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                    >
                      <option value="Estrada / Speed">Estrada / Speed</option>
                      <option value="MTB / Trilha">MTB / Trilha</option>
                      <option value="Spinning / Rolo">Spinning / Rolo</option>
                      <option value="Urbana / Passeio">Urbana / Passeio</option>
                    </select>
                  </div>
                </div>

                {/* Bike Notes */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Observações do Pedal</label>
                  <input
                    type="text"
                    value={bikeNotes}
                    onChange={(e) => setBikeNotes(e.target.value)}
                    placeholder="Ex: Treino intervalado de subida, cadência média 85..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: CORRIDA */}
          <div className={`p-4 rounded-xl border transition-all ${
            runCompleted ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-slate-900/50 border-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Footprints className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Corrida / Running</h4>
                  <span className="text-[11px] text-emerald-400">Contabiliza quilômetros de corrida</span>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={runCompleted}
                  onChange={(e) => setRunCompleted(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                />
                <span>Corrida Feita ✅</span>
              </label>
            </div>

            {runCompleted && (
              <div className="mt-4 space-y-3.5">
                {/* Distance */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Distância Corrida: <strong className="text-emerald-300">{runDistance} km</strong>
                  </label>
                  
                  {/* Presets */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {RUN_PRESETS.map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setRunDistance(k)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          runDistance === k
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {k} km
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="100"
                    value={runDistance}
                    onChange={(e) => setRunDistance(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-400 focus:outline-none"
                    placeholder="Distância em km (ex: 5)"
                  />
                </div>

                {/* Duration, Pace & Terrain */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Duração (min)</label>
                    <input
                      type="number"
                      value={runDuration}
                      onChange={(e) => setRunDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Pace Médio</label>
                    <input
                      type="text"
                      value={runPace}
                      onChange={(e) => setRunPace(e.target.value)}
                      placeholder="Ex: 5:20/km"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Terreno</label>
                    <select
                      value={runTerrain}
                      onChange={(e) => setRunTerrain(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-400 focus:outline-none"
                    >
                      <option value="Rua / Asfalto">Rua / Asfalto</option>
                      <option value="Esteira">Esteira</option>
                      <option value="Pista">Pista</option>
                      <option value="Trail / Montanha">Trail / Montanha</option>
                    </select>
                  </div>
                </div>

                {/* Run Notes */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Observações da Corrida</label>
                  <input
                    type="text"
                    value={runNotes}
                    onChange={(e) => setRunNotes(e.target.value)}
                    placeholder="Ex: Fartlek progressivo, ótima sensação de respiração..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 5: Percepção / Como se sentiu */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Sensação do Dia:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {['🔥 Excelente', '💪 Firme', '😴 Cansada mas feito', '⚡ Recuperação'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFeeling(item)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    feeling === item
                      ? 'bg-slate-800 border-cyan-400 text-white font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-t border-slate-800 bg-slate-900/60">
          <div>
            {existingLog && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Limpar Dia</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleOpenStory}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-750 text-pink-300 border border-pink-500/30 active:scale-95 transition-all cursor-pointer"
              title="Salvar alterações e abrir Instagram Story Studio"
            >
              <Instagram className="w-4 h-4 text-pink-400" />
              <span>Salvar & Story</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Salvar Check</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
