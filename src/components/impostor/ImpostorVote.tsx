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
    <div className="mx-auto flex h-[calc(100dvh-68px)] w-full max-w-lg flex-col px-3.5 pb-safe pt-3">
      {/* Unified Open Voting Card */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-[2rem] border-2 border-[#F97316]/45 bg-[#0B1B28] px-5 py-5 shadow-2xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F97316]/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#F97316]">
            <Gavel className="h-3.5 w-3.5" />
            Votação na Roda
          </span>
          <h2 className="font-display mt-2.5 text-2xl font-extrabold text-[#F3FAFA]">
            Quem é o Impostor?
          </h2>
          <p className="mt-1 text-xs text-[#F3FAFA]/70">
            Toquem no jogador mais votado pelo grupo.
          </p>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto pr-0.5">
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
                      ? 'border-[#F97316] bg-[#F97316]/15'
                      : 'border-[#F3FAFA]/10 bg-[#07131D] hover:border-[#19D8F2]/40'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        isSelected
                          ? 'bg-[#F97316] text-[#07131D]'
                          : 'bg-[#0B1B28] text-[#19D8F2]'
                      }`}
                    >
                      <UserX className="h-4 w-4" />
                    </span>
                    <span className="font-display truncate text-base font-extrabold text-[#F3FAFA]">
                      {player.name}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F97316] text-[#07131D]">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Single Primary Bottom Button */}
      <div className="py-3">
        <button
          type="button"
          disabled={!selectedPlayer}
          onClick={() => {
            if (!selectedPlayer) return;
            sound.reveal();
            onAccuse(selectedPlayer.id);
          }}
          className="flex min-h-[60px] w-full items-center justify-center gap-2 rounded-2xl bg-[#F97316] px-6 font-display text-base font-extrabold text-[#07131D] shadow-[0_8px_28px_rgba(249,115,22,0.28)] transition active:scale-[0.98] disabled:bg-[#0B1B28] disabled:text-[#F3FAFA]/35 disabled:shadow-none"
        >
          {selectedPlayer
            ? `Confirmar Acusação: ${selectedPlayer.name}`
            : 'Seleciona um suspeito na carta'}
        </button>
      </div>
    </div>
  );
}
