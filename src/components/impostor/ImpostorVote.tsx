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
    <div className="mx-auto flex min-h-[calc(100dvh-70px)] w-full max-w-lg flex-col justify-between px-4 pb-32 pt-5">
      <div className="space-y-4">
        <div className="rounded-3xl border border-[#F97316]/35 bg-[#0B1B28] p-5 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F97316]/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#F97316]">
            <Gavel className="h-3.5 w-3.5" />
            Votação na Roda
          </span>
          <h2 className="font-display mt-3 text-2xl font-extrabold text-[#F3FAFA]">
            Quem é o Impostor?
          </h2>
          <p className="mt-1 text-xs text-[#F3FAFA]/75">
            Decidam em grupo e toquem no suspeito mais votado.
          </p>
        </div>

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
                className={`flex min-h-[60px] items-center justify-between rounded-2xl border-2 bg-[#0B1B28] px-4 py-3.5 text-left transition active:scale-[0.98] ${
                  isSelected
                    ? 'border-[#F97316] bg-[#F97316]/12 shadow-[0_0_20px_rgba(249,115,22,0.18)]'
                    : 'border-[#F3FAFA]/10 hover:border-[#19D8F2]/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      isSelected
                        ? 'bg-[#F97316] text-[#07131D]'
                        : 'bg-[#07131D] text-[#19D8F2]'
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

      {/* Fixed Bottom Thumb CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#F3FAFA]/10 bg-[#07131D]/95 px-4 pt-3 pb-safe backdrop-blur-md">
        <div className="mx-auto max-w-lg">
          <button
            type="button"
            disabled={!selectedPlayer}
            onClick={() => {
              if (!selectedPlayer) return;
              sound.reveal();
              onAccuse(selectedPlayer.id);
            }}
            className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-[#F97316] px-6 font-display text-base font-extrabold text-[#07131D] shadow-[0_8px_28px_rgba(249,115,22,0.28)] transition active:scale-[0.98] disabled:bg-[#0B1B28] disabled:text-[#F3FAFA]/35 disabled:shadow-none"
          >
            {selectedPlayer
              ? `Confirmar Acusação: ${selectedPlayer.name}`
              : 'Seleciona um suspeito acima'}
          </button>
        </div>
      </div>
    </div>
  );
}
