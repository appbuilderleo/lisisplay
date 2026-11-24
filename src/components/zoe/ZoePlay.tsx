import { useEffect, useState } from 'react';
import { ArrowRight, HandMetal, RefreshCw, Settings2, Sparkles, Timer } from 'lucide-react';
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

    // 'go' state clears after 1.6s so users can clearly see APONTEM!
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
      <div className="mx-auto flex min-h-[calc(100dvh-70px)] w-full max-w-lg flex-col justify-between px-4 pb-8 pt-6">
        <div className="my-auto animate-pop-in rounded-3xl border-2 border-[#00E5C4] bg-[#0B1B28] p-7 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#00E5C4]/15 text-[#00E5C4]">
            <Sparkles className="h-9 w-9" />
          </div>
          <h2 className="font-display mt-4 text-3xl font-extrabold text-[#F3FAFA]">
            Baralho Completo!
          </h2>
          <p className="mt-2 text-sm text-[#F3FAFA]/80">
            Passaram por todas as {questions.length} perguntas de{' '}
            <strong className="text-[#19D8F2]">{deckName}</strong>!
          </p>
        </div>

        <div className="space-y-2.5 pb-safe">
          <button
            type="button"
            onClick={handleRestart}
            className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-[#00E5C4] px-6 font-display text-base font-extrabold text-[#07131D] transition active:scale-[0.98]"
          >
            <RefreshCw className="h-5 w-5" />
            Baralhar e Jogar Novamente
          </button>
          <button
            type="button"
            onClick={() => {
              sound.tap();
              onChangeDeck();
            }}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-[#F3FAFA]/15 bg-[#0B1B28] px-4 text-sm font-semibold text-[#F3FAFA] transition active:scale-[0.98]"
          >
            <Settings2 className="h-4 w-4 text-[#19D8F2]" />
            Escolher Outro Baralho
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-70px)] w-full max-w-lg flex-col justify-between px-4 pb-8 pt-4">
      {/* Top Progress & Deck Switcher */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#19D8F2]/30 bg-[#0B1B28] px-3 py-1 text-xs font-bold text-[#19D8F2]">
            {deckName} · {index + 1}/{questions.length}
          </span>
          <button
            type="button"
            onClick={() => {
              sound.tap();
              onChangeDeck();
            }}
            className="min-h-[36px] rounded-full border border-[#F3FAFA]/15 bg-[#0B1B28] px-3 text-xs font-semibold text-[#F3FAFA]/80 transition active:scale-95 hover:border-[#00E5C4]/50"
          >
            Trocar Baralho
          </button>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#0B1B28]">
          <div
            className="h-full rounded-full bg-[#00E5C4] transition-all duration-300"
            style={{ width: `${((index + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="my-5 flex flex-1 flex-col items-center justify-center">
        <div
          className={`relative flex min-h-[290px] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border-2 bg-[#0B1B28] px-6 py-8 text-center shadow-2xl transition-colors ${
            countdown === 'go'
              ? 'border-[#00E5C4] shadow-[0_0_36px_rgba(0,229,196,0.28)]'
              : countdown !== null
                ? 'border-[#F97316] shadow-[0_0_28px_rgba(249,115,22,0.22)]'
                : 'border-[#19D8F2]/35'
          }`}
        >
          {/* Countdown overlay banner inside card */}
          {countdown !== null ? (
            <div className="flex flex-col items-center justify-center">
              <div
                key={String(countdown)}
                className={`animate-count-pop font-display font-extrabold leading-none ${
                  countdown === 'go'
                    ? 'text-5xl text-[#00E5C4] sm:text-6xl'
                    : 'text-[7rem] text-[#F97316]'
                }`}
              >
                {countdown === 'go' ? 'APONTEM!' : countdown}
              </div>
              <p className="mt-5 text-sm font-semibold text-[#F3FAFA]/85">
                {countdown === 'go'
                  ? 'Ninguém baixa o dedo! Quem recebeu mais votos?'
                  : 'Prepara o dedo na roda...'}
              </p>
            </div>
          ) : (
            <div key={index} className="animate-pop-in flex flex-col items-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#07131D] px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-[#19D8F2]">
                <HandMetal className="h-3.5 w-3.5" />
                Quem na Roda?
              </span>

              <h2 className="font-display mt-5 text-2xl font-extrabold leading-snug text-[#F3FAFA] sm:text-3xl">
                {currentQuestion}
              </h2>

              <div className="mt-6 rounded-2xl border border-[#19D8F2]/25 bg-[#07131D] px-4 py-2.5">
                <p className="text-xs font-semibold text-[#19D8F2]">
                  Apontem todos ao mesmo tempo ao sinal de 3!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom 35% Thumb-Zone Controls */}
      <div className="space-y-3 pb-safe">
        <button
          type="button"
          disabled={countdown !== null}
          onClick={handleStartCountdown}
          className="flex min-h-[56px] w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-[#F97316] bg-[#0B1B28] px-6 font-display text-base font-extrabold text-[#F97316] transition active:scale-[0.98] active:bg-[#F97316] active:text-[#07131D] disabled:opacity-50"
        >
          <Timer className="h-5 w-5" />
          {countdown !== null ? 'A contar...' : 'Contagem Rápida 3 · 2 · 1'}
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="flex min-h-[60px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[#00E5C4] px-6 font-display text-lg font-extrabold text-[#07131D] shadow-[0_8px_28px_rgba(0,229,196,0.28)] transition active:scale-[0.98]"
        >
          Próxima Pergunta
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
