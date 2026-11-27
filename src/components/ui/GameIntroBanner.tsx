import { useState } from 'react';
import { ChevronDown, ChevronUp, Smartphone } from 'lucide-react';
import { sound } from '../../lib/audio';

interface GameIntroBannerProps {
  badge?: string;
  summary: string;
  steps: string[];
}

/**
 * Instrução contextual do Modo Roda / Como Jogar na tela inicial de cada jogo.
 */
export function GameIntroBanner({
  badge = 'Modo Roda · 1 Celular',
  summary,
  steps,
}: GameIntroBannerProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-card rounded-3xl border-[#00F5D4]/22 p-4 shadow-lg">
      <button
        type="button"
        onClick={() => {
          sound.tap();
          setExpanded((e) => !e);
        }}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#00F5D4]/15 text-[#00F5D4]">
            <Smartphone className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <span className="font-display block text-[10px] font-extrabold uppercase tracking-widest text-[#00F5D4]">
              {badge}
            </span>
            <p className="mt-0.5 text-xs font-medium leading-snug text-[#DFE2F0]">{summary}</p>
          </div>
        </div>

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1B2029] text-[#00F5D4]">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {expanded && (
        <ol className="animate-pop-in mt-3.5 space-y-2 border-t border-white/8 pt-3">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs leading-relaxed text-[#B9CAC4]">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00F5D4]/15 font-display text-[10px] font-extrabold text-[#00F5D4]">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
