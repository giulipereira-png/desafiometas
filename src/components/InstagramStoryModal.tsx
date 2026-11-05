import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  Instagram,
  Sparkles,
  Waves,
  Dumbbell,
  Bike,
  Footprints,
  Flame,
  Target,
  Calendar as CalendarIcon,
  AlertCircle,
  ExternalLink,
  Image as ImageIcon,
  RotateCcw,
  Edit3
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DayLog, GoalConfig } from '../types/workout';
import { CalculatedStats, formatReadableDateBR, TODAY_STR } from '../utils/statsCalculator';
import {
  generateStoryCanvas,
  downloadStoryCanvas,
  copyStoryImageToClipboard,
  StoryTheme,
} from '../utils/storyImageGenerator';

interface InstagramStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: CalculatedStats;
  goal: GoalConfig;
  currentDateStr: string;
  dayLog?: DayLog;
  logs?: Record<string, DayLog>;
}

export const InstagramStoryModal: React.FC<InstagramStoryModalProps> = ({
  isOpen,
  onClose,
  stats,
  goal,
  currentDateStr,
  dayLog,
  logs,
}) => {
  const storyCardRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<StoryTheme>('obsidian');
  const [headline, setHeadline] = useState<string>('CHECK DO DIA PAGO! 🔥');
  const [showStreakBadge, setShowStreakBadge] = useState<boolean>(true);
  const [showCalendarGrid, setShowCalendarGrid] = useState<boolean>(true);
  const [customNote, setCustomNote] = useState<string>('Mais um dia de disciplina concluído!');
  
  // Customizable streak text
  const [customStreakTitle, setCustomStreakTitle] = useState<string>(
    `🔥 SEQUÊNCIA: ${stats.currentActiveDayStreak} ${stats.currentActiveDayStreak === 1 ? 'DIA' : 'DIAS'} CONSECUTIVOS!`
  );
  const [customStreakSubtitle, setCustomStreakSubtitle] = useState<string>(
    `Meta Individual • Foco total até ${goal.targetEndDate || '31/12/2026'}`
  );

  // Editable Instagram caption
  const [captionText, setCaptionText] = useState<string>('');

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);
  const [copiedImage, setCopiedImage] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Month & Day calculations for Calendar Check Grid
  const dateParts = currentDateStr.split('-');
  const year = parseInt(dateParts[0], 10) || 2026;
  const month = parseInt(dateParts[1], 10) || 11;
  const selectedDay = parseInt(dateParts[2], 10) || 1;

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayDate = new Date(year, month - 1, 1);
  const firstDayOfWeek = firstDayDate.getDay();
  // Monday-start indexing: 0 = SEG, 1 = TER, ..., 6 = DOM
  const startCol = (firstDayOfWeek + 6) % 7;

  const monthNamesBR = [
    'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
    'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
  ];
  const monthName = monthNamesBR[month - 1] || 'MÊS';

  // Count days with completed workouts in current month
  let monthlyPaidDaysCount = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const l = logs?.[ds];
    if (l && (l.swimCompleted || l.gymCompleted || l.bikeCompleted || l.runCompleted)) {
      monthlyPaidDaysCount++;
    }
  }

  // Format default ready caption for Instagram
  const generateDefaultCaption = () => {
    const isSwimDone = Boolean(dayLog?.swimCompleted);
    const isGymDone = Boolean(dayLog?.gymCompleted);
    const isBikeDone = Boolean(dayLog?.bikeCompleted);
    const isRunDone = Boolean(dayLog?.runCompleted);

    const swimDist = dayLog?.swim?.distanceMeters || (isSwimDone ? 1500 : 0);
    const gymFoc = dayLog?.gym?.focus || 'Treino Feito';
    const bikeDist = dayLog?.bike?.distanceKm || 20;
    const runDist = dayLog?.run?.distanceKm || 5;

    const parts: string[] = [`${headline}\n`];

    if (goal.swimEnabled ?? true) {
      parts.push(`🏊‍♀️ Natação: ${isSwimDone ? `+${(swimDist / 1000).toFixed(1)}km hoje! (Total: ${stats.totalSwimKm.toFixed(1)}km / ${goal.swimTargetKm}km)` : 'Descanso ativo na água'}`);
    }
    if (goal.gymEnabled ?? true) {
      parts.push(`🏋️‍♀️ Academia: ${isGymDone ? `${gymFoc} concluído! (${stats.currentWeekGymCount}/${goal.gymWeeklyTargetDays} na semana)` : 'Sem musculação hoje'}`);
    }
    if (goal.bikeEnabled ?? true) {
      parts.push(`🚴 Ciclismo: ${isBikeDone ? `+${bikeDist}km pedalados! (Total: ${stats.totalBikeKm.toFixed(1)}km / ${goal.bikeTargetKm}km)` : 'Sem pedal hoje'}`);
    }
    if (goal.runEnabled ?? true) {
      parts.push(`🏃 Corrida: ${isRunDone ? `+${runDist}km corridos! (Total: ${stats.totalRunKm.toFixed(1)}km / ${goal.runTargetKm}km)` : 'Sem corrida hoje'}`);
    }

    if (customNote && customNote.trim().length > 0) {
      parts.push(`\n💬 "${customNote}"`);
    }

    parts.push(`\n📅 Constância em ${monthName}: ${monthlyPaidDaysCount} ${monthlyPaidDaysCount === 1 ? 'dia pago' : 'dias pagos'}! ✅`);
    parts.push(`🎯 Meta Individual: Faltam ${stats.daysRemainingToGoal} dias até ${goal.targetEndDate || '31/12/2026'}!`);
    parts.push(`🔥 Sequência ativa: ${stats.currentActiveDayStreak} dias consecutivos.\n`);
    parts.push(`#${goal.userHandle.replace('@', '')} #Meta2026 #TreinoIndividual #Disciplina #Constancia`);

    return parts.join('\n');
  };

  // Sync caption when modal opens or primary props change
  useEffect(() => {
    if (isOpen) {
      setCaptionText(generateDefaultCaption());
    }
  }, [isOpen, currentDateStr, headline, customNote]);

  if (!isOpen) return null;

  const isSwimDone = Boolean(dayLog?.swimCompleted);
  const isGymDone = Boolean(dayLog?.gymCompleted);
  const isBikeDone = Boolean(dayLog?.bikeCompleted);
  const isRunDone = Boolean(dayLog?.runCompleted);

  const swimDistance = dayLog?.swim?.distanceMeters || (isSwimDone ? 1500 : 0);
  const gymFocus = dayLog?.gym?.focus || 'Treino Concluído';
  const bikeDistance = dayLog?.bike?.distanceKm || 20;
  const runDistance = dayLog?.run?.distanceKm || 5;

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(captionText);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2500);
    } catch (err) {
      console.error('Failed to copy caption:', err);
    }
  };

  const handleDownloadStoryImage = async () => {
    try {
      setIsGenerating(true);
      setErrorMessage(null);
      setDownloadSuccess(false);

      const canvas = generateStoryCanvas({
        theme,
        headline,
        customNote,
        showStreakBadge,
        showCalendarCheckGrid: showCalendarGrid,
        dateStr: currentDateStr,
        dayLog,
        goal,
        stats,
        logs,
        customStreakTitle,
        customStreakSubtitle,
      });

      const filename = `story-${goal.userHandle.replace('@', '')}-${currentDateStr}.png`;
      const url = await downloadStoryCanvas(canvas, filename);
      setGeneratedImageUrl(url);
      setDownloadSuccess(true);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err: any) {
      console.error('Error generating story image:', err);
      setErrorMessage('Erro ao gerar imagem: ' + (err?.message || 'Tente novamente.'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyImage = async () => {
    try {
      setIsGenerating(true);
      setErrorMessage(null);

      const canvas = generateStoryCanvas({
        theme,
        headline,
        customNote,
        showStreakBadge,
        showCalendarCheckGrid: showCalendarGrid,
        dateStr: currentDateStr,
        dayLog,
        goal,
        stats,
        logs,
        customStreakTitle,
        customStreakSubtitle,
      });

      const success = await copyStoryImageToClipboard(canvas);
      if (success) {
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 3000);
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } else {
        // Fallback to download
        await handleDownloadStoryImage();
      }
    } catch (err: any) {
      console.error('Error copying image:', err);
      await handleDownloadStoryImage();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDirectShare = async () => {
    try {
      setIsGenerating(true);
      setErrorMessage(null);

      const canvas = generateStoryCanvas({
        theme,
        headline,
        customNote,
        showStreakBadge,
        showCalendarCheckGrid: showCalendarGrid,
        dateStr: currentDateStr,
        dayLog,
        goal,
        stats,
        logs,
        customStreakTitle,
        customStreakSubtitle,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          await handleDownloadStoryImage();
          return;
        }

        const filename = `story-${goal.userHandle.replace('@', '')}-${currentDateStr}.png`;
        const file = new File([blob], filename, {
          type: 'image/png',
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `Check do dia ${goal.userHandle}`,
              text: captionText,
            });
          } catch (e) {
            // User canceled share
          }
        } else {
          await downloadStoryCanvas(canvas, filename);
          await handleCopyCaption();
          setDownloadSuccess(true);
          setTimeout(() => setDownloadSuccess(false), 5000);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Share failed or was canceled:', err);
      await handleDownloadStoryImage();
    } finally {
      setIsGenerating(false);
    }
  };

  // Theme styling configurations for preview
  const getThemeStyles = () => {
    switch (theme) {
      case 'aqua':
        return {
          cardBg: 'bg-gradient-to-b from-cyan-950 via-slate-950 to-slate-900 border-cyan-500/40',
          accentGradient: 'from-cyan-400 to-teal-300',
          checkSwimBg: 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200',
          checkGymBg: 'bg-slate-900/90 border-slate-700 text-slate-200',
          checkBikeBg: 'bg-amber-950/50 border-amber-500/40 text-amber-200',
          checkRunBg: 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200',
          glow: 'from-cyan-500/20 via-teal-500/10 to-transparent',
        };
      case 'sunset':
        return {
          cardBg: 'bg-gradient-to-b from-rose-950 via-slate-950 to-slate-900 border-rose-500/40',
          accentGradient: 'from-rose-400 via-pink-400 to-amber-300',
          checkSwimBg: 'bg-slate-900/90 border-slate-700 text-slate-200',
          checkGymBg: 'bg-rose-500/20 border-rose-400/50 text-rose-200',
          checkBikeBg: 'bg-amber-500/20 border-amber-400/50 text-amber-200',
          checkRunBg: 'bg-emerald-900/40 border-emerald-500/30 text-emerald-200',
          glow: 'from-rose-500/20 via-amber-500/10 to-transparent',
        };
      case 'titanium':
        return {
          cardBg: 'bg-gradient-to-b from-slate-900 via-slate-950 to-black border-slate-700',
          accentGradient: 'from-slate-200 to-slate-400',
          checkSwimBg: 'bg-slate-900 border-slate-700 text-slate-200',
          checkGymBg: 'bg-slate-900 border-slate-700 text-slate-200',
          checkBikeBg: 'bg-slate-900 border-slate-700 text-slate-200',
          checkRunBg: 'bg-slate-900 border-slate-700 text-slate-200',
          glow: 'from-slate-500/10 via-slate-700/10 to-transparent',
        };
      case 'obsidian':
      default:
        return {
          cardBg: 'bg-gradient-to-b from-slate-900/95 via-slate-950 to-black border-cyan-500/30',
          accentGradient: 'from-cyan-300 via-indigo-300 to-rose-300',
          checkSwimBg: 'bg-cyan-950/60 border-cyan-500/30 text-cyan-200',
          checkGymBg: 'bg-rose-950/60 border-rose-500/30 text-rose-200',
          checkBikeBg: 'bg-amber-950/60 border-amber-500/30 text-amber-200',
          checkRunBg: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-200',
          glow: 'from-cyan-500/15 via-rose-500/10 to-transparent',
        };
    }
  };

  const themeStyles = getThemeStyles();

  // Suggestion phrases
  const headlineSuggestions = [
    'CHECK DO DIA PAGO! 🔥',
    'CONSTÂNCIA É O SEGREDO 💪',
    'META FIM DE ANO 2026 🎯',
    'RUMO AOS 45KM DE NATAÇÃO 🏊‍♀️',
    'DISCIPLINA INEGOCIÁVEL ⚡',
    'MAIS UM PRA CONTA ✅',
  ];

  const noteSuggestions = [
    'Mais um dia de disciplina concluído!',
    '1% melhor a cada treino 🚀',
    'Feito é melhor que perfeito ✨',
    'Constância vence o talento 🔥',
    'Foco total na minha meta individual 🎯',
    'Sem desculpas, pagando o preço todo dia 💪',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
              <Instagram className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Instagram Story Studio
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  Formato 9:16 (1080x1920)
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Story com calendário de checks, frases totalmente editáveis e exportação instantânea
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

        {/* Modal Body: Two Columns (Preview 9:16 on Left, Customizer on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 max-h-[82vh] overflow-y-auto">
          
          {/* LEFT: 9:16 Story Live Preview Canvas (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="text-xs text-slate-400 mb-2 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              Preview do Story (9:16)
            </div>

            {/* THE LIVE STORY CARD ELEMENT */}
            <div
              ref={storyCardRef}
              className={`w-[290px] sm:w-[320px] aspect-[9/16] rounded-[28px] border-2 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden shadow-2xl transition-all ${themeStyles.cardBg}`}
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              }}
            >
              {/* Top ambient glow */}
              <div
                className={`absolute top-0 left-0 right-0 h-40 bg-gradient-to-b ${themeStyles.glow} pointer-events-none`}
              />

              {/* CARD TOP: Profile Header & Date */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-400 via-rose-500 to-amber-400 p-[2px] shadow-md">
                    <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center font-bold text-xs text-white">
                      {goal.userName ? goal.userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'GS'}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-white tracking-tight">
                        {goal.userHandle}
                      </span>
                      <span className="w-3 h-3 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-[8px] font-bold">
                        ✓
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-300 font-medium">
                      {goal.userName}
                    </span>
                  </div>
                </div>

                <div className="px-2 py-1 rounded-full bg-black/40 border border-white/10 text-[9px] font-semibold text-slate-200 backdrop-blur-sm">
                  {formatReadableDateBR(currentDateStr, false).toUpperCase()}
                </div>
              </div>

              {/* CARD MIDDLE: Scrollable clean content area */}
              <div className="relative z-10 my-auto py-1.5 space-y-2 overflow-y-auto max-h-[430px] pr-0.5 no-scrollbar">
                
                {/* Headline Badge */}
                <div className="text-center">
                  <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/10 border border-white/20 text-white backdrop-blur-md shadow-sm">
                    {headline}
                  </span>
                </div>

                {/* Swim Check Box */}
                {(goal.swimEnabled ?? true) && (
                  <div className={`p-2 rounded-2xl border backdrop-blur-md transition-all ${themeStyles.checkSwimBg}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                          <Waves className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[8.5px] uppercase font-bold tracking-wider text-cyan-400 block">
                            Natação • Meta {goal.swimTargetKm}km
                          </span>
                          <span className="text-[10.5px] font-bold text-white">
                            {isSwimDone ? `+${(swimDistance / 1000).toFixed(1)} km Hoje!` : 'Pendente hoje'}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[8.5px] font-bold bg-cyan-500 text-slate-950 flex items-center gap-1 shadow-sm">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                        {stats.totalSwimKm.toFixed(1)} / {goal.swimTargetKm}k
                      </span>
                    </div>

                    <div className="mt-1 h-1 w-full bg-black/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full"
                        style={{ width: `${stats.swimProgressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Gym Check Box */}
                {(goal.gymEnabled ?? true) && (
                  <div className={`p-2 rounded-2xl border backdrop-blur-md transition-all ${themeStyles.checkGymBg}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center">
                          <Dumbbell className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[8.5px] uppercase font-bold tracking-wider text-rose-400 block">
                            Academia • Meta {goal.gymWeeklyTargetDays}x/sem
                          </span>
                          <span className="text-[10.5px] font-bold text-white">
                            {isGymDone ? gymFocus : 'Pendente hoje'}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[8.5px] font-bold bg-rose-500 text-slate-950 flex items-center gap-1 shadow-sm">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                        {stats.currentWeekGymCount}/{goal.gymWeeklyTargetDays} Sem
                      </span>
                    </div>

                    <div className="mt-1 grid grid-cols-4 gap-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`h-1 rounded-full ${
                            stats.currentWeekGymCount >= step ? 'bg-rose-400' : 'bg-black/40'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Bike Check Box */}
                {(goal.bikeEnabled ?? true) && (
                  <div className={`p-2 rounded-2xl border backdrop-blur-md transition-all ${themeStyles.checkBikeBg}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
                          <Bike className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[8.5px] uppercase font-bold tracking-wider text-amber-400 block">
                            Ciclismo • Meta {goal.bikeTargetKm}km
                          </span>
                          <span className="text-[10.5px] font-bold text-white">
                            {isBikeDone ? `+${bikeDistance} km Hoje!` : 'Pendente hoje'}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[8.5px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-sm">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                        {stats.totalBikeKm.toFixed(1)} / {goal.bikeTargetKm}k
                      </span>
                    </div>

                    <div className="mt-1 h-1 w-full bg-black/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${stats.bikeProgressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Corrida Check Box */}
                {(goal.runEnabled ?? true) && (
                  <div className={`p-2 rounded-2xl border backdrop-blur-md transition-all ${themeStyles.checkRunBg}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                          <Footprints className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[8.5px] uppercase font-bold tracking-wider text-emerald-400 block">
                            Corrida • Meta {goal.runTargetKm}km
                          </span>
                          <span className="text-[10.5px] font-bold text-white">
                            {isRunDone ? `+${runDistance} km Hoje!` : 'Pendente hoje'}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[8.5px] font-bold bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-sm">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                        {stats.totalRunKm.toFixed(1)} / {goal.runTargetKm}k
                      </span>
                    </div>

                    <div className="mt-1 h-1 w-full bg-black/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full"
                        style={{ width: `${stats.runProgressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* MONTHLY CALENDAR WITH CHECKS (Requested by user) */}
                {showCalendarGrid && (
                  <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md shadow-md">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9.5px] font-bold text-white tracking-wider flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3 text-cyan-400" />
                        CONSTÂNCIA • {monthName} {year}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full text-[8.5px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {monthlyPaidDaysCount} {monthlyPaidDaysCount === 1 ? 'dia pago' : 'dias pagos'} ✅
                      </span>
                    </div>

                    {/* Weekdays Row */}
                    <div className="grid grid-cols-7 gap-1 text-center text-[7.5px] font-bold text-slate-400 mb-1">
                      {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'].map((d) => (
                        <span key={d}>{d}</span>
                      ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {/* Leading empty slots */}
                      {Array.from({ length: startCol }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-6" />
                      ))}

                      {/* Day slots */}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const d = i + 1;
                        const ds = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                        const log = logs?.[ds];
                        const isPaid = Boolean(
                          log && (log.swimCompleted || log.gymCompleted || log.bikeCompleted || log.runCompleted)
                        );
                        const isCurrent = d === selectedDay;

                        return (
                          <div
                            key={ds}
                            className={`h-6 rounded-md flex flex-col items-center justify-center transition-all ${
                              isPaid
                                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-sm font-extrabold'
                                : isCurrent
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 font-bold'
                                : 'bg-black/30 text-slate-400 border border-white/5'
                            } ${isCurrent && isPaid ? 'ring-1.5 ring-white' : ''}`}
                            title={`${ds}: ${isPaid ? 'Treino pago!' : 'Sem treino'}`}
                          >
                            <span className="leading-none text-[8px]">{d}</span>
                            {isPaid ? (
                              <span className="leading-none text-[8.5px] text-white font-extrabold">✓</span>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Custom Note / Motivation */}
                {customNote && (
                  <div className="p-2 rounded-xl bg-black/30 border border-white/10 text-center">
                    <p className="text-[9.5px] font-medium text-slate-200 italic leading-snug">
                      "{customNote}"
                    </p>
                  </div>
                )}

                {/* Individual Streak Sticker */}
                {showStreakBadge && (
                  <div className="p-2 rounded-xl bg-gradient-to-r from-cyan-500/15 via-slate-800 to-rose-500/15 border border-white/15 text-center backdrop-blur-sm">
                    <span className="text-[9.5px] font-bold text-white uppercase tracking-wider flex items-center justify-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      {customStreakTitle}
                    </span>
                    <span className="text-[8.5px] text-slate-300 block mt-0.5">
                      {customStreakSubtitle}
                    </span>
                  </div>
                )}
              </div>

              {/* CARD BOTTOM: Countdown & Individual Goal */}
              <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[9.5px]">
                <div className="flex items-center gap-1 text-slate-300 font-semibold">
                  <Target className="w-3 h-3 text-rose-400" />
                  <span>31 DEZ 2026</span>
                  <span className="text-cyan-400 font-bold">• {stats.daysRemainingToGoal} dias</span>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white font-bold text-[8.5px]">
                  {goal.userHandle}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Story Controls & Customizer (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            
            <div className="space-y-4">
              {/* 1. Theme Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  1. Paleta Visual do Story
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => setTheme('obsidian')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                      theme === 'obsidian'
                        ? 'bg-slate-800 border-cyan-400 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block mr-1.5 align-middle" />
                    Obsidian
                  </button>

                  <button
                    onClick={() => setTheme('aqua')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                      theme === 'aqua'
                        ? 'bg-slate-800 border-cyan-400 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-teal-400 inline-block mr-1.5 align-middle" />
                    Aqua Sport
                  </button>

                  <button
                    onClick={() => setTheme('sunset')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                      theme === 'sunset'
                        ? 'bg-slate-800 border-rose-400 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-rose-400 inline-block mr-1.5 align-middle" />
                    Sunset Fire
                  </button>

                  <button
                    onClick={() => setTheme('titanium')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                      theme === 'titanium'
                        ? 'bg-slate-800 border-slate-400 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-slate-300 inline-block mr-1.5 align-middle" />
                    Titanium
                  </button>
                </div>
              </div>

              {/* 2. Headline Editor (Fully customizable with text input & suggestions) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                    2. Frase de Destaque (Título Livre)
                  </label>
                  <span className="text-[10px] text-slate-500">
                    Edite ou clique em uma sugestão
                  </span>
                </div>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Ex: CHECK DO DIA PAGO! 🔥"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-colors mb-2"
                />

                {/* Suggestion Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {headlineSuggestions.map((phrase) => (
                    <button
                      key={phrase}
                      onClick={() => setHeadline(phrase)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                        headline === phrase
                          ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300'
                          : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                      }`}
                    >
                      {phrase}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Custom Motivational Note */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    3. Nota / Frase do Dia (Personalizável)
                  </label>
                  <span className="text-[10px] text-slate-500">
                    Escreva livremente
                  </span>
                </div>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Escreva sua reflexão, citação ou nota do treino..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 mb-2"
                />

                {/* Suggestion Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {noteSuggestions.map((note) => (
                    <button
                      key={note}
                      onClick={() => setCustomNote(note)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                        customNote === note
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                          : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                      }`}
                    >
                      {note}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Display Toggles & Streak Text */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  4. Elementos Visuais do Story
                </span>

                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Calendar Toggle */}
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showCalendarGrid}
                      onChange={(e) => setShowCalendarGrid(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                    />
                    <span>
                      Exibir <strong>Calendário de Constância</strong> com Checks (✅)
                    </span>
                  </label>

                  {/* Streak Toggle */}
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showStreakBadge}
                      onChange={(e) => setShowStreakBadge(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                    />
                    <span>Exibir selo de dias consecutivos</span>
                  </label>
                </div>

                {showStreakBadge && (
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Título do Selo:</span>
                      <input
                        type="text"
                        value={customStreakTitle}
                        onChange={(e) => setCustomStreakTitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Subtítulo do Selo:</span>
                      <input
                        type="text"
                        value={customStreakSubtitle}
                        onChange={(e) => setCustomStreakSubtitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Editable Instagram Caption */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Copy className="w-3.5 h-3.5 text-pink-400" />
                    5. Legenda para Colar no Instagram (Totalmente Editável)
                  </label>
                  <button
                    onClick={() => setCaptionText(generateDefaultCaption())}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    title="Restaurar legenda gerada automaticamente"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Restaurar Padrão
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={captionText}
                  onChange={(e) => setCaptionText(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs leading-relaxed placeholder:text-slate-600 focus:outline-none focus:border-pink-400 resize-none font-mono"
                />
              </div>
            </div>

            {/* ACTION BUTTONS & FEEDBACK */}
            <div className="pt-3 border-t border-slate-800 space-y-2.5">
              
              {/* Success Notification */}
              {downloadSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between gap-2 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Sucesso!</strong> Imagem gerada em 1080x1920 (9:16) com calendário de checks.</span>
                  </div>
                  {generatedImageUrl && (
                    <a
                      href={generatedImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[11px] flex items-center gap-1 hover:bg-emerald-400 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Abrir</span>
                    </a>
                  )}
                </div>
              )}

              {/* Error Notification */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Primary Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* 1. Download Story Image (1080x1920 PNG) */}
                <button
                  onClick={handleDownloadStoryImage}
                  disabled={isGenerating}
                  className="flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 text-white shadow-lg shadow-pink-500/20 hover:opacity-95 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  title="Baixar imagem PNG de alta resolução"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>{isGenerating ? 'Gerando Story...' : 'Baixar Imagem'}</span>
                </button>

                {/* 2. Copy Image directly to Clipboard */}
                <button
                  onClick={handleCopyImage}
                  disabled={isGenerating}
                  className="flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl font-bold text-xs bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  title="Copiar imagem PNG para colar direto no Instagram"
                >
                  {copiedImage ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Imagem Copiada!</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4 shrink-0" />
                      <span>Copiar Imagem</span>
                    </>
                  )}
                </button>

                {/* 3. Direct Share to Instagram / WebShare */}
                <button
                  onClick={handleDirectShare}
                  disabled={isGenerating}
                  className="flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  title="Compartilhar no celular ou salvar"
                >
                  <Share2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Compartilhar</span>
                </button>
              </div>

              {/* 4. Copy Caption for Posts/Stories */}
              <button
                onClick={handleCopyCaption}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
              >
                {copiedCaption ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Legenda Personalizada Copiada com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>Copiar Legenda Acima para a Área de Transferência</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
