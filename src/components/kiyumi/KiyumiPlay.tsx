import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  EyeOff,
  Pause,
  Play,
  SkipForward,
  Smartphone,
} from 'lucide-react';
import { KiyumiMode, KiyumiRoundWord } from '../../types';
import { sound } from '../../lib/audio';
import { useDeviceTilt } from '../../hooks/useDeviceTilt';
import { useWakeLock } from '../../hooks/useWakeLock';

const ROUND_SECONDS = 30;

interface KiyumiPlayProps {
  mode: KiyumiMode;
  deckName: string;
  getNextWord: () => string;
  onFinish: (items: KiyumiRoundWord[]) => void;
  onAbort: () => void;
}

export function KiyumiPlay({
  mode,
  deckName,
  getNextWord,
  onFinish,
  onAbort,
}: KiyumiPlayProps) {
  const [timeLeft, setTimeLeft] = useState<number>(ROUND_SECONDS);
  const [paused, setPaused] = useState(false);
  const [hideWord, setHideWord] = useState(false);
  const [currentWord, setCurrentWord] = useState<string>(() => getNextWord());
  const [results, setResults] = useState<KiyumiRoundWord[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'passed'; key: number } | null>(
    null,
  );

  const resultsRef = useRef<KiyumiRoundWord[]>([]);
  const currentWordRef = useRef<string>(currentWord);
  const finishedRef = useRef(false);
  const lastActionRef = useRef(0);

  resultsRef.current = results;
  currentWordRef.current = currentWord;

  useWakeLock(!paused);

  const score = results.filter((r) => r.status === 'correct').length;
  const isUrgent = timeLeft <= 5 && timeLeft > 0;

  useEffect(() => {
    if (paused || finishedRef.current) return;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          window.clearInterval(timer);
          if (!finishedRef.current) {
            finishedRef.current = true;
            sound.roundEnd();
            window.setTimeout(() => {
              onFinish(resultsRef.current);
            }, 260);
          }
          return 0;
        }
        if (next <= 5) {
          sound.urgentTick();
        }
        return next;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [paused, onFinish]);

  const recordAction = useCallback(
    (status: 'correct' | 'passed') => {
      if (paused || finishedRef.current) return;
      const now = Date.now();
      if (now - lastActionRef.current < 260) return;
      lastActionRef.current = now;

      if (status === 'correct') {
        sound.correct();
      } else {
        sound.pass();
      }

      const nextResults: KiyumiRoundWord[] = [
        ...resultsRef.current,
        { word: currentWordRef.current, status },
      ];
      resultsRef.current = nextResults;
      setResults(nextResults);
      setFeedback({ type: status, key: now });
      setCurrentWord(getNextWord());
      setHideWord(false);
    },
    [paused, getNextWord],
  );

  const tiltState = useDeviceTilt({
    enabled: mode === 'testa' && !paused && timeLeft > 0,
    onTiltDown: () => recordAction('correct'),
    onTiltUp: () => recordAction('passed'),
  });

  const progress = Math.max(0, timeLeft / ROUND_SECONDS);

  const wordSizeClass =
    currentWord.length > 18
      ? 'text-3xl sm:text-5xl'
      : currentWord.length > 12
        ? 'text-4xl sm:text-6xl'
        : 'text-5xl sm:text-6xl';

  return (
    <div className="fixed inset-0 z-30 flex h-[100dvh] flex-col bg-[#07131D] px-3.5 pt-safe pb-safe">
      {/* Full-screen feedback flash overlay */}
      {feedback && (
        <div
          key={feedback.key}
          className={`animate-feedback-flash pointer-events-none fixed inset-0 z-40 flex items-center justify-center ${
            feedback.type === 'correct' ? 'bg-[#00E5C4]/25' : 'bg-[#F97316]/25'
          }`}
        >
          <span
            className={`font-display rounded-full px-6 py-2 text-2xl font-extrabold uppercase tracking-wider ${
              feedback.type === 'correct'
                ? 'bg-[#00E5C4] text-[#07131D]'
                : 'bg-[#F97316] text-[#07131D]'
            }`}
          >
            {feedback.type === 'correct' ? 'ACERTOU! +1' : 'PASSOU'}
          </span>
        </div>
      )}

      {/* Minimal Top Strip: Score + Timer + Single Pause Button */}
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-2 py-2">
        <div className="flex items-center gap-1.5 rounded-full border border-[#00E5C4]/35 bg-[#0B1B28] px-3.5 py-1.5">
          <CheckCircle2 className="h-4 w-4 text-[#00E5C4]" />
          <span className="font-display text-base font-extrabold tabular-nums text-[#00E5C4]">
            {score}
          </span>
        </div>

        <div
          className={`flex items-center gap-2 rounded-full border-2 bg-[#0B1B28] px-4 py-1 ${
            isUrgent
              ? 'animate-urgent-pulse border-[#F97316] text-[#F97316]'
              : 'border-[#19D8F2]/50 text-[#19D8F2]'
          }`}
        >
          <span className="font-display text-2xl font-extrabold tabular-nums leading-none">
            {timeLeft}s
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            sound.tap();
            setPaused((p) => !p);
          }}
          aria-label={paused ? 'Retomar' : 'Pausar'}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#F3FAFA]/15 bg-[#0B1B28] text-[#F3FAFA] transition active:scale-95"
        >
          {paused ? <Play className="h-4 w-4 text-[#00E5C4]" /> : <Pause className="h-4 w-4" />}
        </button>
      </div>

      {/* GIANT OPEN CARD: Occupies most of the mobile screen; ALL text stays INSIDE the card */}
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col py-1.5">
        <div
          onClick={() => {
            if (mode === 'palco' && !paused) {
              sound.tap();
              setHideWord((h) => !h);
            }
          }}
          className={`relative flex flex-1 flex-col justify-between overflow-hidden rounded-[2rem] border-2 bg-[#0B1B28] px-6 py-6 text-center shadow-2xl transition-colors ${
            isUrgent ? 'border-[#F97316]' : 'border-[#00E5C4]/45'
          } ${mode === 'palco' && !paused ? 'cursor-pointer' : ''}`}
        >
          {/* Thin Timer Progress Bar integrated at the very top of the card */}
          <div className="absolute left-0 right-0 top-0 h-1.5 bg-[#07131D]">
            <div
              className={`h-full transition-all duration-500 ease-linear ${
                isUrgent ? 'bg-[#F97316]' : 'bg-[#19D8F2]'
              }`}
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          {/* Inside Card Header */}
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#07131D] px-3.5 py-1 text-xs font-bold text-[#19D8F2]">
              {mode === 'testa' && <Smartphone className="h-3.5 w-3.5 rotate-90" />}
              {deckName} · {mode === 'testa' ? 'Modo Testa' : 'Modo Palco'}
            </span>
          </div>

          {/* Inside Card Main Content */}
          <div className="my-auto flex flex-col items-center justify-center py-4">
            {paused ? (
              <div className="space-y-4">
                <p className="font-display text-3xl font-extrabold text-[#19D8F2]">EM PAUSA</p>
                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.tap();
                      setPaused(false);
                    }}
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-[#00E5C4] px-6 font-display text-base font-extrabold text-[#07131D]"
                  >
                    <Play className="h-5 w-5 fill-current" />
                    Retomar
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.tap();
                      onAbort();
                    }}
                    className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-[#F97316]/50 bg-[#07131D] px-6 text-sm font-bold text-[#F97316]"
                  >
                    Sair da Ronda
                  </button>
                </div>
              </div>
            ) : hideWord && mode === 'palco' ? (
              <div className="space-y-2">
                <EyeOff className="mx-auto h-10 w-10 text-[#19D8F2]/70" />
                <p className="font-display text-2xl font-extrabold text-[#F3FAFA]/65">
                  Palavra escondida
                </p>
                <p className="text-xs text-[#19D8F2]">Toca na carta para revelar</p>
              </div>
            ) : (
              <h2
                key={currentWord}
                className={`animate-pop-in font-display break-words font-extrabold leading-tight tracking-tight text-[#F3FAFA] ${wordSizeClass}`}
              >
                {currentWord}
              </h2>
            )}
          </div>

          {/* Inside Card Footer Hint */}
          <div className="text-xs font-medium text-[#F3FAFA]/60">
            {paused
              ? 'Cronómetro parado'
              : mode === 'testa'
                ? tiltState === 'active'
                  ? 'Inclina para baixo (+1) ou para cima (Passar)'
                  : 'Segura na testa · Usa os dois botões abaixo'
                : 'Toca na carta para esconder ou mostrar a palavra'}
          </div>
        </div>
      </div>

      {/* Only 2 Clean Thumb-Zone Buttons */}
      <div className="mx-auto grid w-full max-w-2xl grid-cols-2 gap-3 pb-2 pt-2">
        <button
          type="button"
          disabled={paused}
          onClick={() => recordAction('passed')}
          className="flex min-h-[68px] items-center justify-center gap-2 rounded-2xl border-2 border-[#F97316] bg-[#0B1B28] px-4 font-display text-base font-extrabold uppercase tracking-wide text-[#F97316] transition active:scale-[0.97] active:bg-[#F97316] active:text-[#07131D] disabled:opacity-40 sm:min-h-[76px]"
        >
          <SkipForward className="h-5 w-5" />
          Passar
        </button>

        <button
          type="button"
          disabled={paused}
          onClick={() => recordAction('correct')}
          className="flex min-h-[68px] items-center justify-center gap-2 rounded-2xl border-2 border-[#00E5C4] bg-[#00E5C4] px-4 font-display text-base font-extrabold uppercase tracking-wide text-[#07131D] shadow-[0_8px_28px_rgba(0,229,196,0.28)] transition active:scale-[0.97] disabled:opacity-40 sm:min-h-[76px]"
        >
          <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
          Acertou +1
        </button>
      </div>
    </div>
  );
}
