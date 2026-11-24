import { ArrowLeft, BookOpen, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../../lib/audio';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenRules: () => void;
}

export function Header({
  title,
  subtitle,
  showBack = false,
  onBack,
  soundEnabled,
  onToggleSound,
  onOpenRules,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#F3FAFA]/10 bg-[#07131D]/95 backdrop-blur-md pt-safe">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-2 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          {showBack && onBack ? (
            <button
              type="button"
              onClick={() => {
                sound.tap();
                onBack();
              }}
              aria-label="Voltar"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#F3FAFA]/12 bg-[#0B1B28] text-[#F3FAFA] transition active:scale-95 hover:border-[#00E5C4]/60"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F3FAFA] p-1.5 shadow-[0_0_20px_rgba(0,229,196,0.22)]">
              <img
                src="/simbolo.png"
                alt="Símbolo Lisis Play"
                className="h-full w-full object-contain translate-x-[1px]"
              />
            </div>
          )}

          <div className="min-w-0">
            {showBack && title ? (
              <>
                <h1 className="font-display truncate text-lg font-extrabold leading-tight tracking-tight text-[#F3FAFA]">
                  {title}
                </h1>
                {subtitle && (
                  <p className="truncate text-xs font-medium text-[#19D8F2]">{subtitle}</p>
                )}
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-lg font-extrabold tracking-tight text-[#F3FAFA]">
                    Lisis <span className="text-[#00E5C4]">Play</span>
                  </span>
                  <span className="rounded-full bg-[#0B1B28] border border-[#19D8F2]/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#19D8F2]">
                    Lisis Jogos
                  </span>
                </div>
                <p className="truncate text-xs text-[#F3FAFA]/70">
                  A diversão é estar juntos.
                </p>
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
            aria-label="Abrir Regras"
            className="flex h-12 items-center gap-1.5 rounded-2xl border border-[#F3FAFA]/12 bg-[#0B1B28] px-3 text-xs font-semibold text-[#F3FAFA] transition active:scale-95 hover:border-[#19D8F2]/60"
          >
            <BookOpen className="h-4 w-4 text-[#19D8F2]" />
            <span className="hidden xs:inline sm:inline">Regras</span>
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Desligar Som' : 'Ligar Som'}
            title={soundEnabled ? 'Som ligado' : 'Som desligado'}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition active:scale-95 ${
              soundEnabled
                ? 'border-[#00E5C4]/50 bg-[#0B1B28] text-[#00E5C4]'
                : 'border-[#F3FAFA]/12 bg-[#0B1B28] text-[#F3FAFA]/45'
            }`}
          >
            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
