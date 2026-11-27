import { useEffect, useState } from 'react';
import { MessageSquare, Pause, Play, Plus, Vote } from 'lucide-react';
import { ImpostorMatch, ImpostorPlayer } from '../../types';
import { sound } from '../../lib/audio';

const INITIAL_DEBATE_SECONDS = 120; // 2:00 min

interface ImpostorDebateProps {
  players: ImpostorPlayer[];
  match: ImpostorMatch;
  onGoToVote: () => void;
}

function formatClock(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function ImpostorDebate({ players, match, onGoToVote }: ImpostorDebateProps) {
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_DEBATE_SECONDS);
  const [running, setRunning] = useState(true);

  const firstSpeaker =
    players.find((p) => p.id === match.firstSpeakerId) ?? players[0];

  const isUrgent = secondsLeft <= 15 && secondsLeft > 0;
  const isFinished = secondsLeft === 0;

  useEffect(() => {
    if (!running || secondsLeft <= 0) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (next === 0) {
          sound.roundEnd();
          return 0;
        }
        if (next <= 5) {
          sound.urgentTick();
        }
        return next;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running, secondsLeft]);

  const handleToggleTimer = () => {
    sound.tap();
    if (isFinished) {
      setSecondsLeft(60);
      setRunning(true);
    } else {
      setRunning((r) => !r);
    }
  };

  const handleAdd30 = () => {
    sound.tap();
    setSecondsLeft((s) => s + 30);
    setRunning(true);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-68px)] w-full max-w-lg flex-col px-3.5 pb-safe pt-3">
      {/* SINGLE UNIFIED GIANT CARD containing speaker, rule, and interactive clock */}
      <div
        className={`animate-pop-in flex min-h-[340px] flex-1 flex-col justify-between rounded-[2rem] border-2 bg-[#0F172A] px-6 py-6 text-center shadow-2xl transition-colors ${
          isUrgent || isFinished ? 'border-[#FF6B35]' : 'border-[#19D8F2]/40'
        }`}
      >
        {/* Inside Card Top Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#070B14] px-3 py-1 text-xs font-bold text-[#19D8F2]">
            <MessageSquare className="h-3.5 w-3.5" />
            {match.categoryName}
          </span>
          <span className="rounded-full bg-[#070B14] px-3 py-1 text-xs font-bold text-[#FF6B35]">
            {match.impostorIds.length}{' '}
            {match.impostorIds.length === 1 ? 'Impostor' : 'Impostores'}
          </span>
        </div>

        {/* Inside Card Center: First Speaker + Debate Clock */}
        <div className="my-auto flex flex-col items-center space-y-6 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#F8FAFC]/60">
              Começa a dar a primeira pista
            </p>
            <h2 className="font-display mt-1.5 text-4xl font-extrabold text-[#00F5D4] sm:text-5xl">
              {firstSpeaker.name}
            </h2>
          </div>

          {/* Interactive Clock inside the card */}
          <div className="w-full rounded-3xl border border-[#F8FAFC]/10 bg-[#070B14]/85 px-5 py-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#F8FAFC]/55">
              {isFinished ? 'Tempo esgotado!' : running ? 'Tempo de debate' : 'Debate em pausa'}
            </p>

            <button
              type="button"
              onClick={handleToggleTimer}
              aria-label={running ? 'Pausar cronómetro' : 'Retomar cronómetro'}
              className={`font-display mt-1 inline-flex items-center gap-3 text-6xl font-extrabold tabular-nums tracking-tight transition active:scale-95 sm:text-7xl ${
                isUrgent || isFinished ? 'text-[#FF6B35]' : 'text-[#19D8F2]'
              }`}
            >
              <span>{formatClock(secondsLeft)}</span>
            </button>

            <div className="mt-3 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={handleToggleTimer}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[#F8FAFC]/15 bg-[#0F172A] px-4 text-xs font-bold text-[#F8FAFC] transition active:scale-95"
              >
                {running && !isFinished ? (
                  <>
                    <Pause className="h-3.5 w-3.5 text-[#19D8F2]" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 text-[#00F5D4]" />
                    {isFinished ? '+1:00' : 'Retomar'}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleAdd30}
                className="inline-flex min-h-[40px] items-center gap-1 rounded-full border border-[#19D8F2]/35 bg-[#0F172A] px-4 text-xs font-bold text-[#19D8F2] transition active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" />
                30s
              </button>
            </div>
          </div>
        </div>

        {/* Inside Card Footer Rule */}
        <div className="rounded-2xl bg-[#070B14]/85 px-4 py-2.5 text-xs leading-relaxed text-[#F8FAFC]/75">
          Sentido horário: cada jogador diz <strong className="text-[#F8FAFC]">1 palavra-pista</strong>{' '}
          e depois debatem quem é o Impostor.
        </div>
      </div>

      {/* Single Primary Pill Button */}
      <div className="py-3">
        <button
          type="button"
          onClick={() => {
            sound.go();
            onGoToVote();
          }}
          className="flex min-h-[58px] w-full items-center justify-center gap-2.5 rounded-full bg-[#00F5D4] px-6 font-display text-base font-extrabold text-[#070B14] shadow-[0_8px_28px_-4px_rgba(0,245,212,0.42)] transition active:scale-[0.98]"
        >
          <Vote className="h-5 w-5" />
          Ir para Votação
        </button>
      </div>
    </div>
  );
}
