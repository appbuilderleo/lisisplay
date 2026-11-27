import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  EyeOff,
  MessageCircle,
  Pause,
  Play,
  SkipForward,
  User,
} from 'lucide-react';
import { KiyumiMode, KiyumiRoundWord } from '../../types';
import { sound } from '../../lib/audio';
import { getSyneFitStyle } from '../../lib/textFit';
import { useWakeLock } from '../../hooks/useWakeLock';

const ROUND_SECONDS = 30;

interface KiyumiPlayProps {
  mode: KiyumiMode;
  deckName: string;
  initialWord: string;
  remainingAfterInitial: number;
  getNextWord: () => { word: string | null; remaining: number };
  onFinish: (items: KiyumiRoundWord[], deckExhausted: boolean) => void;
  onAbort: () => void;
}

export function KiyumiPlay({
  mode,
  deckName,
  initialWord,
  remainingAfterInitial,
  getNextWord,
  onFinish,
  onAbort,
}: KiyumiPlayProps) {
  const [timeLeft, setTimeLeft] = useState<number>(ROUND_SECONDS);
  const [timerEpoch, setTimerEpoch] = useState<number>(0);
  const [paused, setPaused] = useState(false);
  const [hideWord, setHideWord] = useState(false);
  const [currentWord, setCurrentWord] = useState<string>(initialWord);
  const [remainingInDeck, setRemainingInDeck] = useState<number>(remainingAfterInitial);
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

  // 30 segundos exatos: acertar reinicia para 30s; passar mantém a contagem a correr
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
              onFinish(resultsRef.current, false);
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
  }, [paused, onFinish, timerEpoch]);

  const recordAction = useCallback(
    (status: 'correct' | 'passed') => {
      if (paused || finishedRef.current) return;
      const now = Date.now();
      if (now - lastActionRef.current < 260) return;
      lastActionRef.current = now;

      const nextResults: KiyumiRoundWord[] = [
        ...resultsRef.current,
        { word: currentWordRef.current, status },
      ];
      resultsRef.current = nextResults;
      setResults(nextResults);
      setFeedback({ type: status, key: now });

      const drawn = getNextWord();
      if (!drawn.word) {
        // Sem mais palavras no baralho: não repete, termina imediatamente o jogo e mostra a pontuação!
        finishedRef.current = true;
        setRemainingInDeck(0);
        sound.victory();
        window.setTimeout(() => {
          onFinish(nextResults, true);
        }, 320);
        return;
      }

      if (status === 'correct') {
        sound.correct();
        setTimeLeft(ROUND_SECONDS);
        setTimerEpoch((e) => e + 1);
      } else {
        sound.pass();
      }

      setRemainingInDeck(drawn.remaining);
      setCurrentWord(drawn.word);
      setHideWord(false);
    },
    [paused, getNextWord, onFinish],
  );

  const progress = Math.max(0, timeLeft / ROUND_SECONDS);
  const wordFitStyle = getSyneFitStyle(currentWord);

  return (
    <div className="fixed inset-0 z-30 overflow-y-auto bg-[#070B14]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-2xl flex-col px-3.5 pt-safe pb-safe">
        {/* Full-screen feedback flash overlay */}
        {feedback && (
          <div
            key={feedback.key}
            className={`animate-feedback-flash pointer-events-none fixed inset-0 z-40 flex items-center justify-center ${
              feedback.type === 'correct' ? 'bg-[#00F5D4]/25' : 'bg-[#FF6B35]/25'
            }`}
          >
            <span
              className={`font-display rounded-full px-6 py-2 text-2xl font-extrabold uppercase tracking-wider ${
                feedback.type === 'correct'
                  ? 'bg-[#00F5D4] text-[#070B14]'
                  : 'bg-[#FF6B35] text-[#070B14]'
              }`}
            >
              {feedback.type === 'correct' ? 'ACERTOU! +1 · 30s' : 'PASSOU'}
            </span>
          </div>
        )}

        {/* Minimal Top Strip: Score + 30s Timer + Single Pause Button */}
        <div className="flex w-full items-center justify-between gap-2 py-2">
          <div className="glass-card flex items-center gap-1.5 rounded-full border-[#00F5D4]/35 px-3.5 py-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#00F5D4]" />
            <span className="font-display text-base font-extrabold tabular-nums text-[#00F5D4]">
              {score}
            </span>
          </div>

          <div
            className={`glass-card flex items-center gap-2 rounded-full border-2 px-4 py-1 ${
              isUrgent
                ? 'animate-urgent-pulse border-[#FF6B35] text-[#FF6B35]'
                : 'border-[#00F5D4]/50 text-[#00F5D4]'
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
            className="glass-card flex h-11 w-11 items-center justify-center rounded-full text-[#F8FAFC] transition active:scale-95"
          >
            {paused ? <Play className="h-4 w-4 text-[#00F5D4]" /> : <Pause className="h-4 w-4" />}
          </button>
        </div>

        {/* GIANT OPEN CARD: Occupies most of the screen; ALL text stays INSIDE the card */}
        <div className="flex flex-1 flex-col py-1.5">
          <div
            onClick={() => {
              if (!paused) {
                sound.tap();
                setHideWord((h) => !h);
              }
            }}
            className={`glass-card relative flex min-h-[300px] w-full flex-1 cursor-pointer flex-col justify-between overflow-x-clip rounded-[2rem] border-2 px-5 py-6 text-center shadow-2xl transition-colors ${
              isUrgent
                ? 'border-[#FF6B35] shadow-[0_0_28px_rgba(255,107,53,0.22)]'
                : 'border-[#00F5D4]/45 shadow-[0_8px_32px_-4px_rgba(0,245,212,0.18)]'
            }`}
          >
            {/* Thin Timer Progress Bar integrated inside top of card */}
            <div className="mx-1 h-1.5 overflow-hidden rounded-full bg-[#070B14]">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-linear ${
                  isUrgent ? 'bg-[#FF6B35]' : 'bg-[#00F5D4]'
                }`}
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            {/* Inside Card Header */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#070B14]/85 px-3.5 py-1 font-display text-xs font-bold text-[#00F5D4]">
                {mode === 'mimica' ? (
                  <User className="h-3.5 w-3.5 text-[#00FFA3]" />
                ) : (
                  <MessageCircle className="h-3.5 w-3.5 text-[#FF6B35]" />
                )}
                {deckName} · {mode === 'mimica' ? 'Mímica / Palco' : 'Modo Descreve'}
              </span>
              <span className="rounded-full bg-[#070B14]/75 px-2.5 py-1 font-display text-[11px] font-bold text-[#94A3B8]">
                {remainingInDeck === 0
                  ? 'Última palavra!'
                  : `+${remainingInDeck} no baralho`}
              </span>
            </div>

            {/* Inside Card Main Word */}
            <div className="my-auto flex w-full min-w-0 flex-col items-center justify-center px-1 py-4">
              {paused ? (
                <div className="space-y-4">
                  <p className="font-display text-3xl font-extrabold text-[#00F5D4]">EM PAUSA</p>
                  <div className="flex flex-col gap-2.5 sm:flex-row">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.tap();
                        setPaused(false);
                      }}
                      className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#00F5D4] px-6 font-display text-base font-extrabold text-[#070B14]"
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
                      className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#FF6B35]/55 bg-[#070B14] px-6 font-display text-sm font-bold text-[#FF6B35]"
                    >
                      Sair da Ronda
                    </button>
                  </div>
                </div>
              ) : hideWord ? (
                <div className="space-y-2">
                  <EyeOff className="mx-auto h-10 w-10 text-[#00F5D4]/70" />
                  <p className="font-display text-2xl font-extrabold text-[#F8FAFC]/65">
                    Palavra escondida
                  </p>
                  <p className="text-xs text-[#00F5D4]">Toca na carta para revelar</p>
                </div>
              ) : (
                <h2
                  key={currentWord}
                  style={wordFitStyle}
                  className="animate-pop-in font-display w-full max-w-full break-words [overflow-wrap:anywhere] hyphens-auto font-extrabold leading-[1.15] tracking-tight text-[#F8FAFC]"
                >
                  {currentWord}
                </h2>
              )}
            </div>

            {/* Inside Card Footer Rule Hint */}
            <div className="rounded-2xl bg-[#070B14]/80 px-4 py-2.5 text-xs font-medium text-[#B9CAC4]">
              {paused ? (
                'Cronómetro parado'
              ) : mode === 'mimica' ? (
                <>
                  Representa em pé com gestos ·{' '}
                  <span className="text-[#00F5D4]">Toca na carta para esconder</span>
                </>
              ) : (
                <>
                  Explica por voz —{' '}
                  <strong className="text-[#FF6B35]">
                    proibido dizer palavras escritas no ecrã!
                  </strong>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Only 2 Clean Pill Thumb-Zone Buttons */}
        <div className="grid w-full grid-cols-2 gap-3 pb-2 pt-2">
          <button
            type="button"
            disabled={paused}
            onClick={() => recordAction('passed')}
            className="glass-card flex min-h-[64px] items-center justify-center gap-2 rounded-full border-2 border-[#FF6B35] px-4 font-display text-base font-extrabold uppercase tracking-wide text-[#FF6B35] transition active:scale-[0.97] active:bg-[#FF6B35] active:text-[#070B14] disabled:opacity-40 sm:min-h-[70px]"
          >
            <SkipForward className="h-5 w-5" />
            Passar
          </button>

          <button
            type="button"
            disabled={paused}
            onClick={() => recordAction('correct')}
            className="flex min-h-[64px] items-center justify-center gap-2 rounded-full bg-[#00F5D4] px-4 font-display text-base font-extrabold uppercase tracking-wide text-[#070B14] shadow-[0_8px_28px_-4px_rgba(0,245,212,0.42)] transition active:scale-[0.97] disabled:opacity-40 sm:min-h-[70px]"
          >
            <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
            Acertou +1
          </button>
        </div>
      </div>
    </div>
  );
}
