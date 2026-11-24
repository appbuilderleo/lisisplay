import { useEffect, useState } from 'react';
import { ArrowRight, HandMetal, RefreshCw, Sparkles, Timer } from 'lucide-react';
import { sound } from '../../lib/audio';
import { useWakeLock } from '../../hooks/useWakeLock';

interface ZoePlayProps {
  deckName: string;
  questions: string[];
  onReshuffle: () => void;
  onChangeDeck: () => void;
}

export function ZoePlay({
  deckName,
  questions,
  onReshuffle,
  onChangeDeck,
}: ZoePlayProps) {
  const [index, setIndex] = useState(0);
  const [countdown, setCountdown] = useState<number | 'go' | null>(null);

  useWakeLock(true);

  const isCompleted = index >= questions.length;
  const currentQuestion = !isCompleted ? questions[index] : '';

  useEffect(() => {
    if (countdown === null) return;

    if (typeof countdown === 'number') {
      sound.tick();
      const t = window.setTimeout(() => {
        if (countdown > 1) {
          setCountdown(countdown - 1);
        } else {
          sound.go();
          setCountdown('go');
        }
      }, 720);
      return () => window.clearTimeout(t);
    }

    const clearTimer = window.setTimeout(() => {
      setCountdown(null);
    }, 1600);
    return () => window.clearTimeout(clearTimer);
  }, [countdown]);

  const handleStartCountdown = () => {
    if (countdown !== null) return;
    sound.unlock();
    setCountdown(3);
  };

  const handleNext = () => {
    sound.reveal();
    setCountdown(null);
    setIndex((i) => i + 1);
  };

  const handleRestart = () => {
    sound.go();
    setCountdown(null);
    setIndex(0);
    onReshuffle();
  };

  if (isCompleted) {
    return (
      <div className="mx-auto flex h-[calc(100dvh-68px)] w-full max-w-lg flex-col px-4 pb-safe pt-3">
        <div className="animate-pop-in flex flex-1 flex-col items-center justify-center rounded-[2rem] border-2 border-[#00E5C4] bg-[#0B1B28] px-6 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#00E5C4]/15 text-[#00E5C4]">
            <Sparkles className="h-9 w-9" />
          </div>
          <h2 className="font-display mt-5 text-3xl font-extrabold text-[#F3FAFA]">
            Baralho Completo!
          </h2>
          <p className="mt-2 max-w-xs text-sm text-[#F3FAFA]/80">
            Passaram por todas as {questions.length} cartas de{' '}
            <strong className="text-[#19D8F2]">{deckName}</strong>!
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 py-3">
          <button
            type="button"
            onClick={() => {
              sound.tap();
              onChangeDeck();
            }}
            className="min-h-[56px] rounded-2xl border border-[#F3FAFA]/15 bg-[#0B1B28] px-4 text-sm font-bold text-[#F3FAFA] transition active:scale-[0.98]"
          >
            Trocar Baralho
          </button>
          <button
            type="button"
            onClick={handleRestart}
            className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-[#00E5C4] px-4 font-display text-base font-extrabold text-[#07131D] transition active:scale-[0.98]"
          >
            <RefreshCw className="h-5 w-5" />
            Jogar de Novo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-68px)] w-full max-w-lg flex-col px-3.5 pb-safe pt-3">
      {/* GIANT OPEN CARD: Occupies ~75% of screen; ALL text & deck progress live inside */}
      <div
        className={`relative flex flex-1 flex-col justify-between overflow-hidden rounded-[2rem] border-2 bg-[#0B1B28] px-6 py-6 text-center shadow-2xl transition-colors ${
          countdown === 'go'
            ? 'border-[#00E5C4] shadow-[0_0_36px_rgba(0,229,196,0.28)]'
            : countdown !== null
              ? 'border-[#F97316] shadow-[0_0_28px_rgba(249,115,22,0.22)]'
              : 'border-[#19D8F2]/40'
        }`}
      >
        {/* Integrated Progress Bar at Top of Card */}
        <div className="absolute left-0 right-0 top-0 h-1.5 bg-[#07131D]">
          <div
            className="h-full bg-[#00E5C4] transition-all duration-300"
            style={{ width: `${((index + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Inside Card Header */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#07131D] px-3 py-1 text-xs font-bold text-[#19D8F2]">
            <HandMetal className="h-3.5 w-3.5" />
            {deckName} · {index + 1}/{questions.length}
          </span>

          <button
            type="button"
            onClick={() => {
              sound.tap();
              onChangeDeck();
            }}
            className="text-xs font-semibold text-[#F3FAFA]/65 underline decoration-[#19D8F2]/50 underline-offset-4 transition hover:text-[#19D8F2]"
          >
            Baralhos
          </button>
        </div>

        {/* Inside Card Center Question / Countdown */}
        <div className="my-auto flex flex-col items-center justify-center py-6">
          {countdown !== null ? (
            <div className="flex flex-col items-center justify-center">
              <div
                key={String(countdown)}
                className={`animate-count-pop font-display font-extrabold leading-none ${
                  countdown === 'go'
                    ? 'text-5xl text-[#00E5C4] sm:text-6xl'
                    : 'text-[7.5rem] text-[#F97316]'
                }`}
              >
                {countdown === 'go' ? 'APONTEM!' : countdown}
              </div>
              <p className="mt-5 text-sm font-semibold text-[#F3FAFA]/85">
                {countdown === 'go'
                  ? 'Quem recebeu mais dedos apontados?'
                  : 'Prepara o dedo na roda...'}
              </p>
            </div>
          ) : (
            <div key={index} className="animate-pop-in flex flex-col items-center">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#00E5C4]">
                Quem na Roda?
              </span>
              <h2 className="font-display mt-4 text-3xl font-extrabold leading-snug text-[#F3FAFA] sm:text-4xl">
                {currentQuestion}
              </h2>
            </div>
          )}
        </div>

        {/* Inside Card Footer Instruction */}
        <div className="rounded-2xl bg-[#07131D]/85 px-4 py-2.5">
          <p className="text-xs font-semibold text-[#19D8F2]">
            Apontem todos ao mesmo tempo ao sinal de 3!
          </p>
        </div>
      </div>

      {/* Minimal Single Row of 2 Thumb Buttons */}
      <div className="flex items-center gap-3 py-3">
        <button
          type="button"
          disabled={countdown !== null}
          onClick={handleStartCountdown}
          className="flex min-h-[60px] w-[38%] items-center justify-center gap-1.5 rounded-2xl border-2 border-[#F97316] bg-[#0B1B28] px-3 font-display text-base font-extrabold text-[#F97316] transition active:scale-[0.98] active:bg-[#F97316] active:text-[#07131D] disabled:opacity-50"
        >
          <Timer className="h-5 w-5 shrink-0" />
          3 · 2 · 1
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="flex min-h-[60px] flex-1 items-center justify-center gap-2 rounded-2xl bg-[#00E5C4] px-5 font-display text-base font-extrabold text-[#07131D] shadow-[0_8px_28px_rgba(0,229,196,0.28)] transition active:scale-[0.98]"
        >
          Próxima
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
