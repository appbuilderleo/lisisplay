import { useEffect, useState } from 'react';
import { sound } from '../../lib/audio';

interface CountdownOverlayProps {
  title: string;
  instruction: string;
  finalLabel?: string;
  onComplete: () => void;
  onCancel?: () => void;
}

export function CountdownOverlay({
  title,
  instruction,
  finalLabel = 'VAI!',
  onComplete,
  onCancel,
}: CountdownOverlayProps) {
  const [step, setStep] = useState<number>(3); // 3 -> 2 -> 1 -> 0 (VAI!)

  useEffect(() => {
    if (step > 0) {
      sound.tick();
      const timer = window.setTimeout(() => {
        setStep((s) => s - 1);
      }, 850);
      return () => window.clearTimeout(timer);
    } else {
      sound.go();
      const doneTimer = window.setTimeout(() => {
        onComplete();
      }, 520);
      return () => window.clearTimeout(doneTimer);
    }
  }, [step, onComplete]);

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-between bg-[#070B14] px-6 py-10 text-center">
      <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#00F5D4]/12 blur-[100px]" />
      <div className="relative z-10 pt-safe">
        <span className="glass-card inline-block rounded-full border-[#00F5D4]/30 px-4 py-1.5 font-display text-xs font-extrabold uppercase tracking-widest text-[#00F5D4]">
          {title}
        </span>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center">
        <div
          key={step}
          className={`animate-count-pop font-display text-[7.5rem] font-extrabold leading-none sm:text-[9rem] ${
            step === 0
              ? 'text-[#00F5D4] drop-shadow-[0_0_28px_rgba(0,245,212,0.45)]'
              : step === 1
                ? 'text-[#FF6B35] drop-shadow-[0_0_24px_rgba(255,107,53,0.4)]'
                : 'text-[#F8FAFC]'
          }`}
        >
          {step > 0 ? step : finalLabel}
        </div>
        <p className="mt-6 max-w-xs text-base font-medium leading-relaxed text-[#B9CAC4]">
          {instruction}
        </p>
      </div>

      <div className="relative z-10 w-full max-w-xs pb-safe">
        {onCancel && (
          <button
            type="button"
            onClick={() => {
              sound.tap();
              onCancel();
            }}
            className="glass-card min-h-[48px] w-full rounded-full px-6 font-display text-sm font-bold text-[#DFE2F0] transition active:scale-95"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
