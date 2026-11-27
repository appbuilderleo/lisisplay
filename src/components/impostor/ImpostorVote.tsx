import { useState } from 'react';
import { Check, Gavel, UserX } from 'lucide-react';
import { ImpostorPlayer } from '../../types';
import { sound } from '../../lib/audio';

interface ImpostorVoteProps {
  players: ImpostorPlayer[];
  onAccuse: (playerId: string) => void;
}

export function ImpostorVote({ players, onAccuse }: ImpostorVoteProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedPlayer = players.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-68px)] w-full max-w-[440px] flex-col px-3.5 pb-safe pt-3">
      {/* Unified Open Voting Glass Card */}
      <div className="glass-card flex min-h-[340px] flex-1 flex-col rounded-[2rem] border-2 border-[#FF6B35]/45 px-5 py-5 shadow-2xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6B35]/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#FF6B35]">
            <Gavel className="h-3.5 w-3.5" />
            Votação na Roda
          </span>
          <h2 className="font-display mt-2.5 text-2xl font-extrabold text-[#F8FAFC]">
            Quem é o Impostor?
          </h2>
          <p className="mt-1 text-xs text-[#F8FAFC]/70">
            Toquem no jogador mais votado pelo grupo.
          </p>
        </div>

        <div className="mt-4 flex-1">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {players.map((player) => {
              const isSelected = selectedId === player.id;
              return (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => {
                    sound.tap();
                    setSelectedId(player.id);
                  }}
                  className={`flex min-h-[56px] items-center justify-between rounded-2xl border-2 px-4 py-3 text-left transition active:scale-[0.98] ${
                    isSelected
                      ? 'border-[#FF6B35] bg-[#FF6B35]/15'
                      : 'border-[#F8FAFC]/10 bg-[#070B14] hover:border-[#19D8F2]/40'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        isSelected
                          ? 'bg-[#FF6B35] text-[#070B14]'
                          : 'bg-[#0F172A] text-[#19D8F2]'
                      }`}
                    >
                      <UserX className="h-4 w-4" />
                    </span>
                    <span className="font-display truncate text-base font-extrabold text-[#F8FAFC]">
                      {player.name}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FF6B35] text-[#070B14]">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Single Primary Pill Button */}
      <div className="py-3">
        <button
          type="button"
          disabled={!selectedPlayer}
          onClick={() => {
            if (!selectedPlayer) return;
            sound.reveal();
            onAccuse(selectedPlayer.id);
          }}
          className="flex min-h-[58px] w-full items-center justify-center gap-2 rounded-full bg-[#FF6B35] px-6 font-display text-base font-extrabold text-[#070B14] shadow-[0_8px_28px_-4px_rgba(255,107,53,0.4)] transition active:scale-[0.98] disabled:bg-[#1B2029] disabled:text-[#F8FAFC]/35 disabled:shadow-none"
        >
          {selectedPlayer
            ? `Confirmar Acusação: ${selectedPlayer.name}`
            : 'Seleciona um suspeito na carta'}
        </button>
      </div>
    </div>
  );
}
