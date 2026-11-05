import React, { useState } from 'react';
import { X, Share2, Copy, Check, MessageCircle, Send, Globe, Users, ShieldCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  userHandle: string;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({
  isOpen,
  onClose,
  userHandle,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-ruezoj2kwlax456y3kh6th-677425762289.us-west2.run.app';

  const shareText = `Vem construir a sua meta de treino comigo! 🎯\n\nNeste app você pode personalizar seu próprio nome e definir seus objetivos até o fim do ano: natação, bike, corrida ou academia, com calendário intuitivo e cálculo automático de progresso.\n\nAcesse aqui: ${appUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.6 },
      });
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Error copying link:', err);
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent('Vem construir a sua meta de treino!')}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Compartilhar o App
              </h3>
              <p className="text-xs text-slate-400">
                Convide amigos, alunos e seguidores a criarem suas próprias metas
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
          
          {/* Explanation Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-500/30 space-y-2">
            <div className="flex items-center gap-2 font-bold text-white text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Como funciona para quem receber o link:</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Cada pessoa que abrir este link terá <strong>seu próprio ambiente 100% individual e seguro</strong>. Elas poderão alterar o nome, escolher suas metas (natação, musculação, corrida ou bike) e salvar na própria conta Google via nuvem sem interferir nos seus dados!
            </p>
          </div>

          {/* Copy Link Input Bar */}
          <div className="space-y-2">
            <label className="text-slate-400 font-semibold block text-[11px]">
              Link público do aplicativo:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="flex-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 select-all focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Instant Share Buttons */}
          <div className="space-y-2 pt-2">
            <label className="text-slate-400 font-semibold block text-[11px]">
              Enviar diretamente:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleWhatsAppShare}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleTelegramShare}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 active:scale-95 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Telegram</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/60 flex justify-end">
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
