import React, { useRef, useState } from 'react';
import { X, Download, Printer, FileText, CheckCircle2, Waves, Dumbbell, Calendar, User, ShieldCheck } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { DayLog, GoalConfig } from '../types/workout';
import { CalculatedStats, formatReadableDateBR, groupLogsByWeek, TODAY_STR } from '../utils/statsCalculator';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: CalculatedStats;
  goal: GoalConfig;
  logs: Record<string, DayLog>;
}

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({
  isOpen,
  onClose,
  stats,
  goal,
  logs,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [reportNote, setReportNote] = useState<string>(
    'Relatório de acompanhamento físico para análise de periodização, progressão de volume de natação e frequência de musculação até a meta de 31/12/2026.'
  );

  if (!isOpen) return null;

  const weeklyData = groupLogsByWeek(logs);
  const weeksList = Object.values(weeklyData).sort((a, b) => a.weekStart.localeCompare(b.weekStart));

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    try {
      setIsExporting(true);
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`relatorio-treino-prof-giu-${TODAY_STR}.pdf`);
    } catch (err) {
      console.error('Error exporting PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Controls Header (hidden during print) */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Exportar Relatório PDF
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Para Análise Externa
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Gere um documento formal com métricas semanais e progresso das metas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBrowserPrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{isExporting ? 'Gerando...' : 'Baixar PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Note Editor before export (hidden during print) */}
        <div className="p-4 bg-slate-900/40 border-b border-slate-800/80 no-print">
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Observações do Relatório (opcional para análise de treinador / nutricionista):
          </label>
          <input
            type="text"
            value={reportNote}
            onChange={(e) => setReportNote(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            placeholder="Adicione uma nota descritiva para o PDF..."
          />
        </div>

        {/* REPORT CONTENT PREVIEW CONTAINER (Clean white sheet for pristine PDF output) */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto bg-slate-900/30">
          <div
            ref={reportRef}
            className="w-full max-w-[800px] mx-auto bg-white text-slate-900 p-8 sm:p-10 rounded-xl shadow-lg border border-slate-200"
            style={{ minHeight: '1000px', color: '#0f172a' }}
          >
            {/* Header Document */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
              <div>
                <span className="text-[11px] font-extrabold tracking-widest uppercase text-cyan-700 block">
                  RELATÓRIO DE DESEMPENHO ATLÉTICO & METAS
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight font-display mt-0.5">
                  {goal.userName}
                </h1>
                <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                  <span className="font-semibold text-slate-900">{goal.userHandle}</span>
                  <span>•</span>
                  <span>Meta de Fim de Ano: 31 de Dezembro de 2026</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold text-slate-500 uppercase">Emissão</div>
                <div className="text-sm font-bold text-slate-900">
                  {formatReadableDateBR(TODAY_STR)}
                </div>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                  Documento Oficial
                </span>
              </div>
            </div>

            {/* Note Block */}
            {reportNote && (
              <div className="my-5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 italic">
                <strong>Nota do Atleta:</strong> {reportNote}
              </div>
            )}

            {/* Executive KPI Summary */}
            <div className="my-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                1. Sumário Executivo de Metas
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                
                {/* Swim Goal */}
                {(goal.swimEnabled ?? true) && (
                  <div className="p-3.5 rounded-lg border border-cyan-200 bg-cyan-50/50">
                    <span className="text-[10px] font-bold text-cyan-800 uppercase block">
                      Meta Natação
                    </span>
                    <div className="text-xl font-extrabold text-cyan-950 mt-1">
                      {stats.totalSwimKm.toFixed(1)} / {goal.swimTargetKm} km
                    </div>
                    <span className="text-[11px] text-cyan-700 block mt-0.5">
                      {stats.swimProgressPercent}% concluído • restam {stats.swimRemainingKm.toFixed(1)} km
                    </span>
                  </div>
                )}

                {/* Gym Goal */}
                {(goal.gymEnabled ?? true) && (
                  <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/50">
                    <span className="text-[10px] font-bold text-rose-800 uppercase block">
                      Meta Academia ({goal.gymWeeklyTargetDays}x)
                    </span>
                    <div className="text-xl font-extrabold text-rose-950 mt-1">
                      {stats.gymConsistencyRate}%
                    </div>
                    <span className="text-[11px] text-rose-700 block mt-0.5">
                      {stats.gymWeeksMetCount} de {stats.totalWeeksEvaluated} semanas cumpridas
                    </span>
                  </div>
                )}

                {/* Bike Goal */}
                {(goal.bikeEnabled ?? true) && (
                  <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/50">
                    <span className="text-[10px] font-bold text-amber-800 uppercase block">
                      Meta Ciclismo
                    </span>
                    <div className="text-xl font-extrabold text-amber-950 mt-1">
                      {stats.totalBikeKm.toFixed(1)} / {goal.bikeTargetKm} km
                    </div>
                    <span className="text-[11px] text-amber-700 block mt-0.5">
                      {stats.bikeProgressPercent}% concluído • restam {stats.bikeRemainingKm.toFixed(1)} km
                    </span>
                  </div>
                )}

                {/* Run Goal */}
                {(goal.runEnabled ?? true) && (
                  <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/50">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                      Meta Corrida
                    </span>
                    <div className="text-xl font-extrabold text-emerald-950 mt-1">
                      {stats.totalRunKm.toFixed(1)} / {goal.runTargetKm} km
                    </div>
                    <span className="text-[11px] text-emerald-700 block mt-0.5">
                      {stats.runProgressPercent}% concluído • restam {stats.runRemainingKm.toFixed(1)} km
                    </span>
                  </div>
                )}

                {/* Total Workouts */}
                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                  <span className="text-[10px] font-bold text-slate-600 uppercase block">
                    Total de Sessões
                  </span>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">
                    {stats.totalSwimSessions + stats.totalGymSessions + stats.totalBikeSessions + stats.totalRunSessions}
                  </div>
                  <span className="text-[11px] text-slate-600 block mt-0.5">
                    {stats.totalSwimSessions} natação • {stats.totalGymSessions} academia • {stats.totalBikeSessions} bike • {stats.totalRunSessions} corrida
                  </span>
                </div>

                {/* Active Minutes */}
                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                  <span className="text-[10px] font-bold text-slate-600 uppercase block">
                    Volume de Tempo
                  </span>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">
                    {stats.totalActiveMinutes} min
                  </div>
                  <span className="text-[11px] text-slate-600 block mt-0.5">
                    ~{(stats.totalActiveMinutes / 60).toFixed(1)} horas sob esforço
                  </span>
                </div>

              </div>
            </div>

            {/* Performance Pace & Countdown */}
            <div className="my-6 p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">
                    Status do Ritmo: {stats.swimPaceStatus}
                  </span>
                  <span className="text-slate-600">
                    Projeção calculada para atingir metas até {goal.targetEndDate || '31/12/2026'} ({stats.daysRemainingToGoal} dias restantes).
                  </span>
                </div>
                <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    Sequência Ativa
                  </span>
                  <span className="text-base font-extrabold text-cyan-800">
                    {stats.currentActiveDayStreak} dias consecutivos
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed Weekly Table */}
            <div className="my-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                2. Histórico Semanal de Desempenho
              </h2>
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Semana</th>
                    <th className="py-2.5 px-3">Período</th>
                    {(goal.swimEnabled ?? true) && <th className="py-2.5 px-3">Natação (km)</th>}
                    {(goal.gymEnabled ?? true) && <th className="py-2.5 px-3">Academia (dias)</th>}
                    {(goal.bikeEnabled ?? true) && <th className="py-2.5 px-3">Bike (km)</th>}
                    {(goal.runEnabled ?? true) && <th className="py-2.5 px-3">Corrida (km)</th>}
                    <th className="py-2.5 px-3">Meta Academia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {weeksList.map((w) => (
                    <tr key={w.weekStart} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        Semana {w.weekNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {formatReadableDateBR(w.weekStart, false)} a {formatReadableDateBR(w.weekEnd, false)}
                      </td>
                      {(goal.swimEnabled ?? true) && (
                        <td className="py-2.5 px-3 font-semibold text-cyan-900">
                          {w.swimKm.toFixed(1)} km ({w.swimSessions}x)
                        </td>
                      )}
                      {(goal.gymEnabled ?? true) && (
                        <td className="py-2.5 px-3 font-semibold text-rose-900">
                          {w.gymSessions} {w.gymSessions === 1 ? 'treino' : 'treinos'}
                        </td>
                      )}
                      {(goal.bikeEnabled ?? true) && (
                        <td className="py-2.5 px-3 font-semibold text-amber-900">
                          {(w.bikeKm || 0).toFixed(1)} km ({w.bikeSessions || 0}x)
                        </td>
                      )}
                      {(goal.runEnabled ?? true) && (
                        <td className="py-2.5 px-3 font-semibold text-emerald-900">
                          {(w.runKm || 0).toFixed(1)} km ({w.runSessions || 0}x)
                        </td>
                      )}
                      <td className="py-2.5 px-3">
                        {w.gymTargetMet ? (
                          <span className="font-bold text-emerald-700">
                            ✓ Cumprida ({w.gymSessions}/{goal.gymWeeklyTargetDays})
                          </span>
                        ) : (
                          <span className="text-slate-500">
                            Pendente ({w.gymSessions}/{goal.gymWeeklyTargetDays})
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signature / Validation Footer */}
            <div className="mt-12 pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Dados validados e calculados automaticamente pelo applet</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-800">@prof_giu</span> • Metas 2026
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
