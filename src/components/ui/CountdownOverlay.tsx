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
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-between bg-[#07131D] px-6 py-10 text-center">
      <div className="pt-safe">
        <span className="inline-block rounded-full border border-[#19D8F2]/35 bg-[#0B1B28] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#19D8F2]">
          {title}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center">
        <div
          key={step}
          className={`animate-count-pop font-display text-[7.5rem] font-extrabold leading-none sm:text-[9rem] ${
            step === 0
              ? 'text-[#00E5C4]'
              : step === 1
                ? 'text-[#F97316]'
                : 'text-[#F3FAFA]'
          }`}
        >
          {step > 0 ? step : finalLabel}
        </div>
        <p className="mt-6 max-w-xs text-base font-medium leading-relaxed text-[#F3FAFA]/85">
          {instruction}
        </p>
      </div>

      <div className="w-full max-w-xs pb-safe">
        {onCancel && (
          <button
            type="button"
            onClick={() => {
              sound.tap();
              onCancel();
            }}
            className="min-h-[48px] w-full rounded-2xl border border-[#F3FAFA]/15 bg-[#0B1B28] px-6 text-sm font-semibold text-[#F3FAFA]/80 transition active:scale-95"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
