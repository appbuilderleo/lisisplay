import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Pause,
  Play,
  RotateCw,
  SkipForward,
  Smartphone,
  X,
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

  // Precise 1-second interval timer
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

  // Circular SVG timer math
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, timeLeft / ROUND_SECONDS);
  const strokeDashoffset = circumference * (1 - progress);

  // Adaptive font sizing so long words never clip horizontally
  const wordSizeClass =
    currentWord.length > 18
      ? 'text-3xl sm:text-5xl'
      : currentWord.length > 12
        ? 'text-4xl sm:text-5xl'
        : 'text-5xl sm:text-6xl';

  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-between overflow-hidden bg-[#07131D] px-4 pt-safe pb-safe">
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

      {/* Top HUD Bar */}
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-2 pt-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-2xl border border-[#00E5C4]/35 bg-[#0B1B28] px-3.5 py-2">
            <CheckCircle2 className="h-4 w-4 text-[#00E5C4]" />
            <span className="font-display text-lg font-extrabold text-[#00E5C4]">{score}</span>
          </div>
          <div className="hidden rounded-2xl border border-[#F3FAFA]/10 bg-[#0B1B28] px-3 py-2 text-xs font-semibold text-[#19D8F2] sm:block">
            {deckName}
          </div>
        </div>

        {/* Circular 30s Timer */}
        <div
          className={`relative flex h-20 w-20 items-center justify-center rounded-full bg-[#0B1B28] ${
            isUrgent ? 'animate-urgent-pulse' : ''
          }`}
        >
          <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80" aria-hidden="true">
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="rgba(243,250,250,0.12)"
              strokeWidth="6"
            />
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke={isUrgent ? '#F97316' : '#19D8F2'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-[stroke-dashoffset] duration-500 ease-linear"
            />
          </svg>
          <span
            className={`font-display absolute text-2xl font-extrabold tabular-nums ${
              isUrgent ? 'text-[#F97316]' : 'text-[#19D8F2]'
            }`}
          >
            {timeLeft}
          </span>
        </div>

        {/* Pause / Exit controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              sound.tap();
              setPaused((p) => !p);
            }}
            aria-label={paused ? 'Retomar' : 'Pausar'}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#F3FAFA]/15 bg-[#0B1B28] text-[#F3FAFA] transition active:scale-95"
          >
            {paused ? <Play className="h-5 w-5 text-[#00E5C4]" /> : <Pause className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={() => {
              sound.tap();
              setPaused(true);
              onAbort();
            }}
            aria-label="Sair da ronda"
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#F3FAFA]/15 bg-[#0B1B28] text-[#F3FAFA]/80 transition active:scale-95 hover:border-[#F97316]/60 hover:text-[#F97316]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Progress Bar for quick distance reading */}
      <div className="mx-auto mt-2.5 h-1.5 w-full max-w-2xl overflow-hidden rounded-full bg-[#0B1B28]">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-linear ${
            isUrgent ? 'bg-[#F97316]' : 'bg-[#19D8F2]'
          }`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Center Stage: Giant Word Card */}
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center py-4">
        {/* Mode / Sensor Status Badge */}
        <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#19D8F2]/30 bg-[#0B1B28] px-3 py-1 text-xs font-semibold text-[#19D8F2]">
            {mode === 'testa' ? (
              <>
                <Smartphone className="h-3.5 w-3.5 rotate-90" />
                {tiltState === 'active'
                  ? 'Sensor ativo · Inclina p/ baixo (+1) ou cima (Passar)'
                  : 'Modo Testa · Usa os botões grandes abaixo'}
              </>
            ) : (
              <>Modo Palco · {deckName}</>
            )}
          </span>
        </div>

        {/* Main Word Surface */}
        <div
          className={`relative flex min-h-[180px] w-full flex-col items-center justify-center rounded-3xl border-2 bg-[#0B1B28] px-6 py-8 text-center shadow-2xl transition-colors sm:min-h-[210px] ${
            isUrgent ? 'border-[#F97316]/75' : 'border-[#00E5C4]/35'
          }`}
        >
          {paused ? (
            <div className="space-y-3">
              <p className="font-display text-3xl font-extrabold text-[#19D8F2]">EM PAUSA</p>
              <button
                type="button"
                onClick={() => {
                  sound.tap();
                  setPaused(false);
                }}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-[#00E5C4] px-6 font-display text-base font-extrabold text-[#07131D]"
              >
                <Play className="h-5 w-5 fill-current" />
                Retomar Ronda
              </button>
            </div>
          ) : hideWord && mode === 'palco' ? (
            <div className="space-y-2">
              <p className="font-display text-2xl font-extrabold text-[#F3FAFA]/50">
                Palavra oculta
              </p>
              <p className="text-xs text-[#19D8F2]">Toca em &quot;Mostrar&quot; para espreitar</p>
            </div>
          ) : (
            <h2
              key={currentWord}
              className={`animate-pop-in font-display break-words font-extrabold leading-tight tracking-tight text-[#F3FAFA] ${wordSizeClass}`}
            >
              {currentWord}
            </h2>
          )}

          {mode === 'palco' && !paused && (
            <button
              type="button"
              onClick={() => {
                sound.tap();
                setHideWord((h) => !h);
              }}
              className="mt-5 inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[#F3FAFA]/15 bg-[#07131D] px-3.5 py-1.5 text-xs font-semibold text-[#F3FAFA]/80 transition active:scale-95"
            >
              {hideWord ? <Eye className="h-3.5 w-3.5 text-[#00E5C4]" /> : <EyeOff className="h-3.5 w-3.5 text-[#19D8F2]" />}
              {hideWord ? 'Mostrar palavra' : 'Esconder palavra'}
            </button>
          )}
        </div>

        {mode === 'testa' && tiltState === 'active' && (
          <p className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-[#F3FAFA]/55">
            <RotateCw className="h-3.5 w-3.5 text-[#19D8F2]" />
            Inclinar para baixo = Acertou · Para cima = Passar
          </p>
        )}
      </div>

      {/* Bottom 35% Thumb-Zone Large Tactile Controls (Fallback + Primary) */}
      <div className="mx-auto grid w-full max-w-2xl grid-cols-2 gap-3 pb-2">
        <button
          type="button"
          disabled={paused}
          onClick={() => recordAction('passed')}
          className="flex min-h-[84px] flex-col items-center justify-center gap-1 rounded-3xl border-2 border-[#F97316] bg-[#0B1B28] px-4 py-4 text-[#F97316] transition active:scale-[0.97] active:bg-[#F97316] active:text-[#07131D] disabled:opacity-40 sm:min-h-[96px]"
        >
          <SkipForward className="h-7 w-7" />
          <span className="font-display text-lg font-extrabold uppercase tracking-wide">
            Passar
          </span>
        </button>

        <button
          type="button"
          disabled={paused}
          onClick={() => recordAction('correct')}
          className="flex min-h-[84px] flex-col items-center justify-center gap-1 rounded-3xl border-2 border-[#00E5C4] bg-[#00E5C4] px-4 py-4 text-[#07131D] shadow-[0_8px_28px_rgba(0,229,196,0.28)] transition active:scale-[0.97] disabled:opacity-40 sm:min-h-[96px]"
        >
          <CheckCircle2 className="h-7 w-7 stroke-[2.5]" />
          <span className="font-display text-lg font-extrabold uppercase tracking-wide">
            Acertou (+1)
          </span>
        </button>
      </div>
    </div>
  );
}
