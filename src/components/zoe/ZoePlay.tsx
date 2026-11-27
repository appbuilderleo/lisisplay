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
      <div className="mx-auto flex min-h-[calc(100dvh-68px)] w-full max-w-lg flex-col px-4 pb-safe pt-3">
        <div className="animate-pop-in flex min-h-[300px] flex-1 flex-col items-center justify-center rounded-[2rem] border-2 border-[#00F5D4] bg-[#0F172A] px-6 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#00F5D4]/15 text-[#00F5D4]">
            <Sparkles className="h-9 w-9" />
          </div>
          <h2 className="font-display mt-5 text-3xl font-extrabold text-[#F8FAFC]">
            Baralho Completo!
          </h2>
          <p className="mt-2 max-w-xs text-sm text-[#F8FAFC]/80">
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
            className="min-h-[56px] rounded-2xl border border-[#F8FAFC]/15 bg-[#0F172A] px-4 text-sm font-bold text-[#F8FAFC] transition active:scale-[0.98]"
          >
            Trocar Baralho
          </button>
          <button
            type="button"
            onClick={handleRestart}
            className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-[#00F5D4] px-4 font-display text-base font-extrabold text-[#070B14] transition active:scale-[0.98]"
          >
            <RefreshCw className="h-5 w-5" />
            Jogar de Novo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-68px)] w-full max-w-lg flex-col px-3.5 pb-safe pt-3">
      {/* GIANT OPEN CARD: Occupies ~75% of screen; ALL text & deck progress live inside */}
      <div
        className={`relative flex min-h-[320px] w-full flex-1 flex-col justify-between overflow-x-clip rounded-[2rem] border-2 bg-[#0F172A] px-5 py-6 text-center shadow-2xl transition-colors ${
          countdown === 'go'
            ? 'border-[#00F5D4] shadow-[0_0_36px_rgba(0,229,196,0.28)]'
            : countdown !== null
              ? 'border-[#FF6B35] shadow-[0_0_28px_rgba(249,115,22,0.22)]'
              : 'border-[#19D8F2]/40'
        }`}
      >
        {/* Integrated Progress Bar at Top of Card */}
        <div className="mx-1 h-1.5 overflow-hidden rounded-full bg-[#070B14]">
          <div
            className="h-full rounded-full bg-[#00F5D4] transition-all duration-300"
            style={{ width: `${((index + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Inside Card Header */}
        <div className="flex items-center justify-between gap-2 pt-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#070B14] px-3 py-1 text-xs font-bold text-[#19D8F2]">
            <HandMetal className="h-3.5 w-3.5" />
            {deckName} · {index + 1}/{questions.length}
          </span>

          <button
            type="button"
            onClick={() => {
              sound.tap();
              onChangeDeck();
            }}
            className="text-xs font-semibold text-[#F8FAFC]/65 underline decoration-[#19D8F2]/50 underline-offset-4 transition hover:text-[#19D8F2]"
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
                    ? 'text-5xl text-[#00F5D4] sm:text-6xl'
                    : 'text-[7.5rem] text-[#FF6B35]'
                }`}
              >
                {countdown === 'go' ? 'APONTEM!' : countdown}
              </div>
              <p className="mt-5 text-sm font-semibold text-[#F8FAFC]/85">
                {countdown === 'go'
                  ? 'Quem recebeu mais dedos apontados?'
                  : 'Prepara o dedo na roda...'}
              </p>
            </div>
          ) : (
            <div key={index} className="animate-pop-in flex flex-col items-center">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#00F5D4]">
                Quem na Roda?
              </span>
              <h2
                style={{ fontSize: 'clamp(1.35rem, 6vw, 2.1rem)' }}
                className="font-display mt-4 w-full max-w-full break-words [overflow-wrap:anywhere] font-extrabold leading-snug text-[#F8FAFC]"
              >
                {currentQuestion}
              </h2>
            </div>
          )}
        </div>

        {/* Inside Card Footer Instruction */}
        <div className="rounded-2xl bg-[#070B14]/85 px-4 py-2.5">
          <p className="text-xs font-semibold text-[#19D8F2]">
            Apontem todos ao mesmo tempo ao sinal de 3!
          </p>
        </div>
      </div>

      {/* Minimal Single Row of 2 Pill Thumb Buttons */}
      <div className="flex items-center gap-3 py-3">
        <button
          type="button"
          disabled={countdown !== null}
          onClick={handleStartCountdown}
          className="glass-card flex min-h-[58px] w-[38%] items-center justify-center gap-1.5 rounded-full border-2 border-[#FF6B35] px-3 font-display text-base font-extrabold text-[#FF6B35] transition active:scale-[0.98] active:bg-[#FF6B35] active:text-[#070B14] disabled:opacity-50"
        >
          <Timer className="h-5 w-5 shrink-0" />
          3 · 2 · 1
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="flex min-h-[58px] flex-1 items-center justify-center gap-2 rounded-full bg-[#00F5D4] px-5 font-display text-base font-extrabold text-[#070B14] shadow-[0_8px_28px_-4px_rgba(0,245,212,0.4)] transition active:scale-[0.98]"
        >
          Próxima
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
