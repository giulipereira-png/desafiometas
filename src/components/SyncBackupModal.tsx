import React, { useRef, useState } from 'react';
import { X, Download, Upload, Cloud, HardDrive, Check, AlertCircle, LogIn, LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { User } from 'firebase/auth';
import { loginWithGoogle, logoutUser } from '../firebase';
import { exportDataAsJSON, importDataFromJSON } from '../utils/storage';

interface SyncBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onDataImported: () => void;
  onSyncAllToCloud: () => Promise<void>;
  isSyncingCloud: boolean;
}

export const SyncBackupModal: React.FC<SyncBackupModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onDataImported,
  onSyncAllToCloud,
  isSyncingCloud,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      setAuthError(null);
      await loginWithGoogle();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      console.error('Login error:', err);
      setAuthError('Não foi possível conectar com o Google. Tente novamente.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleExport = () => {
    const json = exportDataAsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-treinos-prof-giu-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    confetti({
      particleCount: 60,
      spread: 50,
      origin: { y: 0.6 },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importDataFromJSON(content);
      if (res.success) {
        setImportStatus({
          type: 'success',
          message: `${res.count || 0} treinos restaurados com sucesso! Seu histórico foi sincronizado.`,
        });
        onDataImported();
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } else {
        setImportStatus({
          type: 'error',
          message: res.error || 'Erro ao importar arquivo.',
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Sincronização em Nuvem (Firebase)
              </h3>
              <p className="text-xs text-slate-400">
                Acesse seus treinos em qualquer dispositivo ou navegador
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
        <div className="p-5 sm:p-6 space-y-5 text-xs text-slate-300">
          
          {/* Section 1: Cloud Status (Firebase Firestore) */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-white">
                <Cloud className="w-4 h-4 text-cyan-400" />
                <span>Nuvem Firebase Firestore</span>
              </div>
              {currentUser ? (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Sincronizado
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Modo Local
                </span>
              )}
            </div>

            {currentUser ? (
              <div className="space-y-3 pt-1">
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div className="truncate mr-2">
                    <span className="text-[10px] text-slate-400 block">Conta conectada:</span>
                    <span className="font-semibold text-slate-200 text-xs truncate block">
                      {currentUser.displayName || currentUser.email}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {currentUser.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 transition-colors cursor-pointer shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Todos os seus treinos e metas são salvos na nuvem automaticamente.
                  </span>
                  <button
                    onClick={onSyncAllToCloud}
                    disabled={isSyncingCloud}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSyncingCloud ? 'Sincronizando...' : 'Forçar Envio'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Conecte com sua conta Google para salvar automaticamente seus treinos na nuvem. Você poderá abrir o app no celular, notebook ou qualquer outro navegador com todos os dados sincronizados em tempo real!
                </p>

                <button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-slate-950 hover:bg-slate-100 shadow-md shadow-white/10 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4 text-slate-900" />
                  <span>{isLoggingIn ? 'Conectando...' : 'Entrar com Google e Sincronizar'}</span>
                </button>
              </div>
            )}

            {authError && (
              <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{authError}</span>
              </div>
            )}
          </div>

          {/* Section 2: Manual Backup / Restore (JSON) */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="font-bold text-slate-200 block text-xs">
              Backup Manual (Arquivo JSON)
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Você também pode exportar e importar um arquivo físico com todo o histórico de treinos para guardar offline ou transferir manualmente.
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Baixar Backup</span>
              </button>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Importar Arquivo</span>
                </button>
              </div>
            </div>

            {importStatus && (
              <div
                className={`p-2.5 rounded-lg border flex items-center gap-2 text-[11px] ${
                  importStatus.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                }`}
              >
                {importStatus.type === 'success' ? (
                  <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                )}
                <span>{importStatus.message}</span>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {currentUser ? 'Sincronizado na nuvem' : 'Armazenado localmente'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
