import { DayLog, GoalConfig } from '../types/workout';
import { CalculatedStats, formatReadableDateBR } from './statsCalculator';

export type StoryTheme = 'obsidian' | 'aqua' | 'sunset' | 'titanium';

export interface StoryRenderOptions {
  theme: StoryTheme;
  headline: string;
  customNote: string;
  showStreakBadge: boolean;
  showCalendarCheckGrid?: boolean;
  dateStr: string;
  dayLog?: DayLog;
  goal: GoalConfig;
  stats: CalculatedStats;
  logs?: Record<string, DayLog>;
  customStreakTitle?: string;
  customStreakSubtitle?: string;
}

// Helper to draw rounded rectangle in Canvas 2D
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Generates a crisp, native 1080x1920 (9:16) HTML5 Canvas for Instagram Stories.
 * Features:
 * - Native Canvas 2D (zero html2canvas bugs or oklch crashes)
 * - Monthly Calendar Check Grid with checkmarks on days attended
 * - Fully customizable headlines, notes, and streak text
 * - Dynamic compact cards for active sports (Swim, Gym, Bike, Run)
 */
export function generateStoryCanvas(options: StoryRenderOptions): HTMLCanvasElement {
  const {
    theme,
    headline,
    customNote,
    showStreakBadge,
    showCalendarCheckGrid = true,
    dateStr,
    dayLog,
    goal,
    stats,
    logs,
    customStreakTitle,
    customStreakSubtitle,
  } = options;

  const width = 1080;
  const height = 1920;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not supported');
  }

  // Activity Statuses
  const isSwimDone = Boolean(dayLog?.swimCompleted);
  const isGymDone = Boolean(dayLog?.gymCompleted);
  const isBikeDone = Boolean(dayLog?.bikeCompleted);
  const isRunDone = Boolean(dayLog?.runCompleted);

  const swimDistance = dayLog?.swim?.distanceMeters || (isSwimDone ? 1500 : 0);
  const gymFocus = dayLog?.gym?.focus || 'Treino Concluído';
  const bikeDistance = dayLog?.bike?.distanceKm || 20;
  const runDistance = dayLog?.run?.distanceKm || 5;

  // 1. THEME BACKGROUND GRADIENT
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  let primaryGlow = 'rgba(6, 182, 212, 0.25)';

  switch (theme) {
    case 'aqua':
      bgGrad.addColorStop(0, '#042f2e');
      bgGrad.addColorStop(0.5, '#02181f');
      bgGrad.addColorStop(1, '#020617');
      primaryGlow = 'rgba(20, 184, 166, 0.3)';
      break;
    case 'sunset':
      bgGrad.addColorStop(0, '#4c0519');
      bgGrad.addColorStop(0.5, '#1e0a1a');
      bgGrad.addColorStop(1, '#020617');
      primaryGlow = 'rgba(244, 63, 94, 0.3)';
      break;
    case 'titanium':
      bgGrad.addColorStop(0, '#1e293b');
      bgGrad.addColorStop(0.5, '#0f172a');
      bgGrad.addColorStop(1, '#020617');
      primaryGlow = 'rgba(148, 163, 184, 0.2)';
      break;
    case 'obsidian':
    default:
      bgGrad.addColorStop(0, '#0a0f1d');
      bgGrad.addColorStop(0.4, '#030712');
      bgGrad.addColorStop(1, '#000000');
      primaryGlow = 'rgba(6, 182, 212, 0.25)';
      break;
  }

  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. AMBIENT GLOW CIRCLE AT TOP
  const glow = ctx.createRadialGradient(width / 2, 240, 20, width / 2, 240, 650);
  glow.addColorStop(0, primaryGlow);
  glow.addColorStop(0.7, 'rgba(0, 0, 0, 0.05)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, 1000);

  // 3. ELEGANT FRAME BORDER
  const frameMargin = 36;
  const frameRadius = 56;
  drawRoundedRect(
    ctx,
    frameMargin,
    frameMargin,
    width - frameMargin * 2,
    height - frameMargin * 2,
    frameRadius
  );
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.stroke();

  // 4. HEADER: AVATAR + USER INFO + DATE
  const headerY = 95;

  // Avatar Ring
  const avatarCenterX = 130;
  const avatarCenterY = headerY + 45;
  const avatarRadius = 42;

  const ringGrad = ctx.createLinearGradient(avatarCenterX - 42, avatarCenterY - 42, avatarCenterX + 42, avatarCenterY + 42);
  ringGrad.addColorStop(0, '#06b6d4');
  ringGrad.addColorStop(0.5, '#ec4899');
  ringGrad.addColorStop(1, '#f59e0b');

  ctx.beginPath();
  ctx.arc(avatarCenterX, avatarCenterY, avatarRadius + 4, 0, Math.PI * 2);
  ctx.fillStyle = ringGrad;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#0f172a';
  ctx.fill();

  // Initials
  const initials = goal.userName
    ? goal.userName.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'GS';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, avatarCenterX, avatarCenterY);

  // User Handle & Name
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Handle
  ctx.font = 'bold 32px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(goal.userHandle, avatarCenterX + 60, headerY + 16);

  const handleWidth = ctx.measureText(goal.userHandle).width;

  // Verified Badge (Cyan Circle with check)
  const badgeX = avatarCenterX + 60 + handleWidth + 16;
  const badgeY = headerY + 32;
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, 11, 0, Math.PI * 2);
  ctx.fillStyle = '#06b6d4';
  ctx.fill();
  ctx.fillStyle = '#020617';
  ctx.font = 'bold 15px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✓', badgeX, badgeY + 1);

  // User Name
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = '500 22px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(goal.userName, avatarCenterX + 60, headerY + 56);

  // Date Badge (Top-Right)
  const dateFormatted = formatReadableDateBR(dateStr, false).toUpperCase();
  ctx.font = 'bold 20px "Plus Jakarta Sans", system-ui, sans-serif';
  const dateWidth = ctx.measureText(dateFormatted).width;
  const dateBoxW = dateWidth + 34;
  const dateBoxH = 44;
  const dateBoxX = width - frameMargin - dateBoxW - 32;
  const dateBoxY = headerY + 22;

  drawRoundedRect(ctx, dateBoxX, dateBoxY, dateBoxW, dateBoxH, 22);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.stroke();

  ctx.fillStyle = '#e2e8f0';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(dateFormatted, dateBoxX + dateBoxW / 2, dateBoxY + dateBoxH / 2);

  // 5. HEADLINE BADGE (Pill centered)
  const headlineY = headerY + 115;
  ctx.font = '800 24px "Plus Jakarta Sans", system-ui, sans-serif';
  const headlineMeasure = ctx.measureText(headline).width;
  const headlineBoxW = Math.max(340, headlineMeasure + 54);
  const headlineBoxH = 50;
  const headlineBoxX = (width - headlineBoxW) / 2;

  drawRoundedRect(ctx, headlineBoxX, headlineY, headlineBoxW, headlineBoxH, 25);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(headline, width / 2, headlineY + headlineBoxH / 2);

  // 6. ACTIVITY CARDS (Compact, refined 110px cards)
  let currentY = headlineY + 70;
  const cardW = width - 160;
  const cardX = 80;
  const cardH = 108;
  const cardRadius = 22;

  // SPORT 1: NATAÇÃO
  if (goal.swimEnabled ?? true) {
    drawRoundedRect(ctx, cardX, currentY, cardW, cardH, cardRadius);
    ctx.fillStyle = isSwimDone ? 'rgba(8, 51, 68, 0.7)' : 'rgba(15, 23, 42, 0.6)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = isSwimDone ? 'rgba(6, 182, 212, 0.45)' : 'rgba(255, 255, 255, 0.08)';
    ctx.stroke();

    // Icon Circle
    const iconX = cardX + 48;
    const iconY = currentY + cardH / 2;
    ctx.beginPath();
    ctx.arc(iconX, iconY, 26, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
    ctx.fill();
    ctx.font = '26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏊‍♀️', iconX, iconY);

    // Text Labels
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = 'bold 17px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#22d3ee';
    ctx.fillText(`NATAÇÃO • META ${goal.swimTargetKm}KM`, cardX + 92, currentY + 18);

    ctx.font = 'bold 24px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(
      isSwimDone ? `+${(swimDistance / 1000).toFixed(1)} km Hoje!` : 'Pendente hoje',
      cardX + 92,
      currentY + 42
    );

    // Right Pill Badge
    const pillW = 165;
    const pillH = 36;
    const pillX = cardX + cardW - pillW - 20;
    const pillY = currentY + 22;
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 18);
    ctx.fillStyle = isSwimDone ? '#06b6d4' : 'rgba(255, 255, 255, 0.12)';
    ctx.fill();

    ctx.fillStyle = isSwimDone ? '#020617' : '#e2e8f0';
    ctx.font = 'bold 18px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`✓ ${stats.totalSwimKm.toFixed(1)} / ${goal.swimTargetKm}k`, pillX + pillW / 2, pillY + pillH / 2);

    // Progress Bar Track
    const barX = cardX + 92;
    const barY = currentY + 80;
    const barW = cardW - 120;
    const barH = 8;
    drawRoundedRect(ctx, barX, barY, barW, barH, 4);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fill();

    const fillW = Math.max(8, (barW * Math.min(100, stats.swimProgressPercent)) / 100);
    drawRoundedRect(ctx, barX, barY, fillW, barH, 4);
    ctx.fillStyle = '#22d3ee';
    ctx.fill();

    currentY += cardH + 14;
  }

  // SPORT 2: ACADEMIA
  if (goal.gymEnabled ?? true) {
    drawRoundedRect(ctx, cardX, currentY, cardW, cardH, cardRadius);
    ctx.fillStyle = isGymDone ? 'rgba(76, 5, 25, 0.7)' : 'rgba(15, 23, 42, 0.6)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = isGymDone ? 'rgba(244, 63, 94, 0.45)' : 'rgba(255, 255, 255, 0.08)';
    ctx.stroke();

    // Icon Circle
    const iconX = cardX + 48;
    const iconY = currentY + cardH / 2;
    ctx.beginPath();
    ctx.arc(iconX, iconY, 26, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
    ctx.fill();
    ctx.font = '26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏋️‍♀️', iconX, iconY);

    // Text Labels
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = 'bold 17px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#fb7185';
    ctx.fillText(`ACADEMIA • META ${goal.gymWeeklyTargetDays}X/SEMANA`, cardX + 92, currentY + 18);

    ctx.font = 'bold 24px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(
      isGymDone ? `${gymFocus} Concluído!` : 'Pendente hoje',
      cardX + 92,
      currentY + 42
    );

    // Right Pill Badge
    const pillW = 165;
    const pillH = 36;
    const pillX = cardX + cardW - pillW - 20;
    const pillY = currentY + 22;
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 18);
    ctx.fillStyle = isGymDone ? '#f43f5e' : 'rgba(255, 255, 255, 0.12)';
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`✓ ${stats.currentWeekGymCount}/${goal.gymWeeklyTargetDays} Sem`, pillX + pillW / 2, pillY + pillH / 2);

    // 4 Pips Track
    const pipsTotal = goal.gymWeeklyTargetDays || 4;
    const pipGap = 8;
    const totalPipsW = cardW - 120;
    const singlePipW = (totalPipsW - (pipsTotal - 1) * pipGap) / pipsTotal;
    const pipH = 8;

    for (let p = 1; p <= pipsTotal; p++) {
      const px = cardX + 92 + (p - 1) * (singlePipW + pipGap);
      const py = currentY + 80;
      drawRoundedRect(ctx, px, py, singlePipW, pipH, 4);
      ctx.fillStyle = stats.currentWeekGymCount >= p ? '#fb7185' : 'rgba(0, 0, 0, 0.5)';
      ctx.fill();
    }

    currentY += cardH + 14;
  }

  // SPORT 3: BIKE / CICLISMO
  if (goal.bikeEnabled ?? true) {
    drawRoundedRect(ctx, cardX, currentY, cardW, cardH, cardRadius);
    ctx.fillStyle = isBikeDone ? 'rgba(69, 26, 3, 0.7)' : 'rgba(15, 23, 42, 0.6)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = isBikeDone ? 'rgba(245, 158, 11, 0.45)' : 'rgba(255, 255, 255, 0.08)';
    ctx.stroke();

    const iconX = cardX + 48;
    const iconY = currentY + cardH / 2;
    ctx.beginPath();
    ctx.arc(iconX, iconY, 26, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
    ctx.fill();
    ctx.font = '26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🚴', iconX, iconY);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = 'bold 17px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`CICLISMO • META ${goal.bikeTargetKm}KM`, cardX + 92, currentY + 18);

    ctx.font = 'bold 24px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(
      isBikeDone ? `+${bikeDistance} km Pedalados!` : 'Pendente hoje',
      cardX + 92,
      currentY + 42
    );

    const pillW = 165;
    const pillH = 36;
    const pillX = cardX + cardW - pillW - 20;
    const pillY = currentY + 22;
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 18);
    ctx.fillStyle = isBikeDone ? '#f59e0b' : 'rgba(255, 255, 255, 0.12)';
    ctx.fill();

    ctx.fillStyle = isBikeDone ? '#020617' : '#e2e8f0';
    ctx.font = 'bold 18px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`✓ ${stats.totalBikeKm.toFixed(1)} / ${goal.bikeTargetKm}k`, pillX + pillW / 2, pillY + pillH / 2);

    const barX = cardX + 92;
    const barY = currentY + 80;
    const barW = cardW - 120;
    const barH = 8;
    drawRoundedRect(ctx, barX, barY, barW, barH, 4);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fill();

    const fillW = Math.max(8, (barW * Math.min(100, stats.bikeProgressPercent)) / 100);
    drawRoundedRect(ctx, barX, barY, fillW, barH, 4);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();

    currentY += cardH + 14;
  }

  // SPORT 4: CORRIDA
  if (goal.runEnabled ?? true) {
    drawRoundedRect(ctx, cardX, currentY, cardW, cardH, cardRadius);
    ctx.fillStyle = isRunDone ? 'rgba(6, 78, 59, 0.7)' : 'rgba(15, 23, 42, 0.6)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = isRunDone ? 'rgba(16, 185, 129, 0.45)' : 'rgba(255, 255, 255, 0.08)';
    ctx.stroke();

    const iconX = cardX + 48;
    const iconY = currentY + cardH / 2;
    ctx.beginPath();
    ctx.arc(iconX, iconY, 26, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.fill();
    ctx.font = '26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏃', iconX, iconY);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = 'bold 17px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#34d399';
    ctx.fillText(`CORRIDA • META ${goal.runTargetKm}KM`, cardX + 92, currentY + 18);

    ctx.font = 'bold 24px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(
      isRunDone ? `+${runDistance} km Corridos!` : 'Pendente hoje',
      cardX + 92,
      currentY + 42
    );

    const pillW = 165;
    const pillH = 36;
    const pillX = cardX + cardW - pillW - 20;
    const pillY = currentY + 22;
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 18);
    ctx.fillStyle = isRunDone ? '#10b981' : 'rgba(255, 255, 255, 0.12)';
    ctx.fill();

    ctx.fillStyle = isRunDone ? '#020617' : '#e2e8f0';
    ctx.font = 'bold 18px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`✓ ${stats.totalRunKm.toFixed(1)} / ${goal.runTargetKm}k`, pillX + pillW / 2, pillY + pillH / 2);

    const barX = cardX + 92;
    const barY = currentY + 80;
    const barW = cardW - 120;
    const barH = 8;
    drawRoundedRect(ctx, barX, barY, barW, barH, 4);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fill();

    const fillW = Math.max(8, (barW * Math.min(100, stats.runProgressPercent)) / 100);
    drawRoundedRect(ctx, barX, barY, fillW, barH, 4);
    ctx.fillStyle = '#34d399';
    ctx.fill();

    currentY += cardH + 14;
  }

  // 7. MONTHLY CALENDAR CHECK GRID (NEW FEATURE)
  if (showCalendarCheckGrid) {
    const parts = dateStr.split('-');
    const year = parseInt(parts[0], 10) || 2026;
    const month = parseInt(parts[1], 10) || 11;
    const selectedDay = parseInt(parts[2], 10) || 1;

    // Number of days in this month
    const daysInMonth = new Date(year, month, 0).getDate();

    // First day of month (0 = Sun, 1 = Mon, ..., 6 = Sat)
    const firstDayDate = new Date(year, month - 1, 1);
    const firstDayOfWeek = firstDayDate.getDay();
    // Monday-first indexing: 0 = SEG, 1 = TER, ..., 6 = DOM
    const startCol = (firstDayOfWeek + 6) % 7;

    // Calculate total paid days in this month
    let monthlyPaidDaysCount = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const log = logs?.[ds];
      if (log && (log.swimCompleted || log.gymCompleted || log.bikeCompleted || log.runCompleted)) {
        monthlyPaidDaysCount++;
      }
    }

    const totalSlots = startCol + daysInMonth;
    const numRows = Math.ceil(totalSlots / 7);

    const headerHeight = 62;
    const weekdaysHeight = 34;
    const rowHeight = 56;
    const calCardH = headerHeight + weekdaysHeight + numRows * rowHeight + 16;
    const calCardX = cardX;
    const calCardY = currentY;
    const calCardW = cardW;

    // Outer Calendar Box
    drawRoundedRect(ctx, calCardX, calCardY, calCardW, calCardH, cardRadius);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.stroke();

    // Calendar Header: Month name & Paid Days Badge
    const monthNamesBR = [
      'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
      'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
    ];
    const monthName = monthNamesBR[month - 1] || 'MÊS';

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 22px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`📅 CONSTÂNCIA • ${monthName} ${year}`, calCardX + 28, calCardY + 32);

    // Paid Days Badge
    const badgeText = `${monthlyPaidDaysCount} ${monthlyPaidDaysCount === 1 ? 'DIA PAGO' : 'DIAS PAGOS'} ✅`;
    ctx.font = 'bold 18px "Plus Jakarta Sans", system-ui, sans-serif';
    const badgeW = ctx.measureText(badgeText).width + 32;
    const badgeH = 36;
    const badgeX = calCardX + calCardW - badgeW - 24;
    const badgeY = calCardY + 14;

    drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 18);
    ctx.fillStyle = monthlyPaidDaysCount > 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.08)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = monthlyPaidDaysCount > 0 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();

    ctx.fillStyle = monthlyPaidDaysCount > 0 ? '#34d399' : '#94a3b8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, badgeX + badgeW / 2, badgeY + badgeH / 2);

    // Weekdays row
    const weekdays = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
    const gridStartX = calCardX + 20;
    const gridW = calCardW - 40;
    const colW = gridW / 7;
    const weekdaysY = calCardY + headerHeight + 14;

    ctx.font = 'bold 16px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let c = 0; c < 7; c++) {
      const cx = gridStartX + c * colW + colW / 2;
      ctx.fillText(weekdays[c], cx, weekdaysY);
    }

    // Days grid
    const daysStartY = calCardY + headerHeight + weekdaysHeight + 4;
    const cellW = colW - 8;
    const cellH = rowHeight - 8;

    for (let d = 1; d <= daysInMonth; d++) {
      const slotIndex = startCol + (d - 1);
      const row = Math.floor(slotIndex / 7);
      const col = slotIndex % 7;

      const cellX = gridStartX + col * colW + 4;
      const cellY = daysStartY + row * rowHeight + 4;

      const dayStrFormatted = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const log = logs?.[dayStrFormatted];
      const isPaid = Boolean(
        log && (log.swimCompleted || log.gymCompleted || log.bikeCompleted || log.runCompleted)
      );
      const isCurrent = d === selectedDay;

      // Draw cell box
      drawRoundedRect(ctx, cellX, cellY, cellW, cellH, 12);

      if (isPaid) {
        // Paid day: vibrant gradient
        const paidGrad = ctx.createLinearGradient(cellX, cellY, cellX + cellW, cellY + cellH);
        paidGrad.addColorStop(0, '#059669');
        paidGrad.addColorStop(1, '#0d9488');
        ctx.fillStyle = paidGrad;
        ctx.fill();

        ctx.lineWidth = isCurrent ? 3 : 1.5;
        ctx.strokeStyle = isCurrent ? '#ffffff' : 'rgba(110, 231, 183, 0.6)';
        ctx.stroke();

        // Top: day number
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 15px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(String(d), cellX + cellW / 2, cellY + cellH * 0.32);

        // Bottom: checkmark
        ctx.font = 'bold 17px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('✓', cellX + cellW / 2, cellY + cellH * 0.72);
      } else {
        // Unpaid day
        ctx.fillStyle = isCurrent ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.04)';
        ctx.fill();

        ctx.lineWidth = isCurrent ? 2.5 : 1;
        ctx.strokeStyle = isCurrent ? '#06b6d4' : 'rgba(255, 255, 255, 0.08)';
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = isCurrent ? 'bold 17px "Plus Jakarta Sans", sans-serif' : '500 16px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = isCurrent ? '#38bdf8' : '#64748b';
        ctx.fillText(String(d), cellX + cellW / 2, cellY + cellH / 2);
      }
    }

    currentY += calCardH + 16;
  }

  // 8. MOTIVATIONAL NOTE / QUOTE BOX (Fully customizable)
  if (customNote && customNote.trim().length > 0) {
    const noteH = 80;
    drawRoundedRect(ctx, cardX, currentY, cardW, noteH, 18);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();

    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'italic 500 22px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`"${customNote.trim()}"`, width / 2, currentY + noteH / 2);

    currentY += noteH + 16;
  }

  // 9. STREAK BADGE BANNER (Customizable text)
  if (showStreakBadge) {
    const streakH = 100;
    drawRoundedRect(ctx, cardX, currentY, cardW, streakH, 22);

    const streakGrad = ctx.createLinearGradient(cardX, currentY, cardX + cardW, currentY + streakH);
    streakGrad.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
    streakGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.7)');
    streakGrad.addColorStop(1, 'rgba(244, 63, 94, 0.15)');
    ctx.fillStyle = streakGrad;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.stroke();

    const titleToDraw = customStreakTitle?.trim() || `🔥 SEQUÊNCIA: ${stats.currentActiveDayStreak} ${stats.currentActiveDayStreak === 1 ? 'DIA' : 'DIAS'} CONSECUTIVOS!`;
    const subtitleToDraw = customStreakSubtitle?.trim() || `Meta Individual • Foco total até ${goal.targetEndDate || '31/12/2026'}`;

    ctx.font = '800 26px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(titleToDraw, width / 2, currentY + 36);

    ctx.font = '500 20px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(subtitleToDraw, width / 2, currentY + 70);
  }

  // 10. FOOTER (Bottom Countdown & Handle)
  const footerY = height - frameMargin - 100;

  // Thin separator line
  ctx.beginPath();
  ctx.moveTo(cardX, footerY);
  ctx.lineTo(cardX + cardW, footerY);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.stroke();

  // Footer left: Target & countdown
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 22px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = '#f43f5e';
  ctx.fillText('🎯', cardX, footerY + 45);

  ctx.fillStyle = '#e2e8f0';
  ctx.fillText('META FINAL: 31 DEZ 2026', cardX + 38, footerY + 45);

  ctx.fillStyle = '#22d3ee';
  ctx.fillText(`• ${stats.daysRemainingToGoal} dias restantes`, cardX + 355, footerY + 45);

  // Footer right: User handle pill
  const handlePillW = 185;
  const handlePillH = 44;
  const handlePillX = cardX + cardW - handlePillW;
  const handlePillY = footerY + 23;

  drawRoundedRect(ctx, handlePillX, handlePillY, handlePillW, handlePillH, 22);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 21px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(goal.userHandle, handlePillX + handlePillW / 2, handlePillY + handlePillH / 2);

  return canvas;
}

/**
 * Converts a generated canvas to a downloadable PNG file and triggers instant download.
 * Uses standard object URLs with automatic DOM appending to prevent iframe download blocking.
 */
export async function downloadStoryCanvas(canvas: HTMLCanvasElement, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        try {
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = filename;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          resolve(dataUrl);
        } catch (e) {
          reject(e);
        }
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 300);

      resolve(url);
    }, 'image/png');
  });
}

/**
 * Copies the image directly to the user's system clipboard as image/png.
 */
export async function copyStoryImageToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve(false);
        return;
      }
      try {
        if (typeof ClipboardItem !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (err) {
        console.warn('Clipboard write error:', err);
        resolve(false);
      }
    }, 'image/png');
  });
}
