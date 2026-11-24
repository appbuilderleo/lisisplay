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

  const handleAdd30 = () => {
    sound.tap();
    setSecondsLeft((s) => s + 30);
    setRunning(true);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-70px)] w-full max-w-lg flex-col justify-between px-4 pb-8 pt-5">
      <div className="space-y-4">
        {/* First Speaker Highlight */}
        <section className="animate-pop-in rounded-3xl border-2 border-[#19D8F2]/45 bg-[#0B1B28] p-5 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#19D8F2]/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#19D8F2]">
            <MessageSquare className="h-3.5 w-3.5" />
            Ronda de Pistas & Debate
          </span>

          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-[#F3FAFA]/65">
            Quem dá a primeira pista
          </p>
          <h2 className="font-display mt-1 text-3xl font-extrabold text-[#00E5C4] sm:text-4xl">
            {firstSpeaker.name}
          </h2>
          <p className="mt-2.5 text-xs leading-relaxed text-[#F3FAFA]/80">
            Em sentido horário, cada jogador diz em voz alta{' '}
            <strong className="text-[#F3FAFA]">apenas 1 palavra-pista</strong> ligada ao tema.
            Depois debatam quem está a mentir!
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
            <span className="rounded-full bg-[#07131D] px-3 py-1 text-[#19D8F2]">
              Baralho: {match.categoryName}
            </span>
            <span className="rounded-full bg-[#07131D] px-3 py-1 text-[#F97316]">
              {match.impostorIds.length}{' '}
              {match.impostorIds.length === 1 ? 'Impostor na roda' : 'Impostores na roda'}
            </span>
          </div>
        </section>

        {/* Debate Timer Card */}
        <section
          className={`rounded-3xl border-2 bg-[#0B1B28] p-6 text-center transition-colors ${
            isUrgent || isFinished ? 'border-[#F97316]' : 'border-[#F3FAFA]/12'
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[#F3FAFA]/60">
            {isFinished ? 'Tempo de Debate Esgotado!' : 'Cronómetro de Debate'}
          </p>

          <div
            className={`font-display mt-2 text-6xl font-extrabold tabular-nums tracking-tight sm:text-7xl ${
              isUrgent || isFinished ? 'text-[#F97316]' : 'text-[#19D8F2]'
            }`}
          >
            {formatClock(secondsLeft)}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                sound.tap();
                if (isFinished) {
                  setSecondsLeft(60);
                  setRunning(true);
                } else {
                  setRunning((r) => !r);
                }
              }}
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-[#F3FAFA]/15 bg-[#07131D] px-4 text-sm font-bold text-[#F3FAFA] transition active:scale-[0.98]"
            >
              {running && !isFinished ? (
                <>
                  <Pause className="h-4 w-4 text-[#19D8F2]" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 text-[#00E5C4]" />
                  {isFinished ? 'Mais 1:00' : 'Retomar'}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleAdd30}
              className="flex min-h-[52px] items-center justify-center gap-1.5 rounded-2xl border border-[#19D8F2]/35 bg-[#07131D] px-4 text-sm font-bold text-[#19D8F2] transition active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              30 segundos
            </button>
          </div>
        </section>
      </div>

      {/* Thumb-Zone Bottom CTA */}
      <div className="mt-6 pb-safe">
        <button
          type="button"
          onClick={() => {
            sound.go();
            onGoToVote();
          }}
          className="flex min-h-[60px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[#00E5C4] px-6 font-display text-lg font-extrabold text-[#07131D] shadow-[0_8px_28px_rgba(0,229,196,0.28)] transition active:scale-[0.98]"
        >
          <Vote className="h-5 w-5" />
          Ir para Votação
        </button>
      </div>
    </div>
  );
}
