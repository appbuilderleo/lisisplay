import { ArrowLeft, HelpCircle, Smartphone, Volume2, VolumeX, WifiOff } from 'lucide-react';
import { sound } from '../../lib/audio';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showTelemetryStrip?: boolean;
  onBack?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenRules: () => void;
}

export function Header({
  title,
  subtitle,
  showBack = false,
  showTelemetryStrip = false,
  onBack,
  soundEnabled,
  onToggleSound,
  onOpenRules,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/8 bg-[#070B14]/88 shadow-[0_2px_12px_rgba(0,0,0,0.4)] backdrop-blur-xl pt-safe">
      <div className="mx-auto flex max-w-[480px] flex-col gap-1.5 px-4 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            {showBack && onBack ? (
              <button
                type="button"
                onClick={() => {
                  sound.tap();
                  onBack();
                }}
                aria-label="Voltar"
                className="glass-card flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#F8FAFC] transition active:scale-95 hover:border-[#00F5D4]/50"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#00F5D4]/30 bg-[#F8FAFC] p-1.5 shadow-[0_0_16px_rgba(0,245,212,0.22)]">
                <img
                  src="/simbolo.png"
                  alt="Símbolo Lisis Play"
                  className="h-full w-full translate-x-[1px] object-contain"
                />
              </div>
            )}

            <div className="min-w-0">
              {showBack && title ? (
                <>
                  <h1 className="font-display truncate text-lg font-extrabold leading-tight tracking-tight text-[#F8FAFC]">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="truncate text-xs font-semibold text-[#00F5D4]">{subtitle}</p>
                  )}
                </>
              ) : (
                <>
                  <span className="font-display block whitespace-nowrap text-[11px] font-extrabold uppercase leading-none tracking-widest text-[#00F5D4]">
                    LisisPlay
                  </span>
                  <h1 className="font-display truncate text-lg font-extrabold leading-tight tracking-tight text-[#F8FAFC]">
                    Menu de Jogos
                  </h1>
                </>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sound.tap();
                onOpenRules();
              }}
              aria-label="Regras e Informações"
              className="glass-card flex h-11 w-11 items-center justify-center rounded-full text-[#B9CAC4] transition active:scale-95 hover:border-[#00F5D4]/50 hover:text-[#00F5D4]"
            >
              <HelpCircle className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={onToggleSound}
              aria-label={soundEnabled ? 'Desligar Som' : 'Ligar Som'}
              title={soundEnabled ? 'Som ligado' : 'Som desligado'}
              className={`glass-card flex h-11 w-11 items-center justify-center rounded-full transition active:scale-95 ${
                soundEnabled
                  ? 'border-[#00F5D4]/45 text-[#00F5D4]'
                  : 'text-[#94A3B8]/60'
              }`}
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Electric Social Arcade Telemetry Strip on Menu */}
        {showTelemetryStrip && (
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#00F5D4]/12 px-2.5 py-0.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00F5D4]" />
              <span className="font-display text-[10px] font-extrabold uppercase tracking-wider text-[#00F5D4]">
                Modo Roda
              </span>
            </div>
            <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#1B2029] px-2.5 py-0.5">
              <Smartphone className="h-3 w-3 text-[#94A3B8]" />
              <span className="font-display text-[10px] font-extrabold uppercase tracking-wider text-[#B9CAC4]">
                1 Celular
              </span>
            </div>
            <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#1B2029] px-2.5 py-0.5">
              <WifiOff className="h-3 w-3 text-[#00FFA3]" />
              <span className="font-display text-[10px] font-extrabold uppercase tracking-wider text-[#00FFA3]">
                Offline
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
