import { useState } from 'react';
import { Check, Flame, Sparkles } from 'lucide-react';
import { ImpostorMatch, ImpostorPlayer } from '../../types';
import { sound } from '../../lib/audio';

interface ImpostorLastChanceProps {
  caughtImpostor: ImpostorPlayer;
  match: ImpostorMatch;
  onGuess: (guessedWord: string) => void;
}

export function ImpostorLastChance({
  caughtImpostor,
  match,
  onGuess,
}: ImpostorLastChanceProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-68px)] w-full max-w-lg flex-col px-3.5 pb-safe pt-3">
      {/* Unified Open Last-Chance Card */}
      <div className="animate-pop-in flex min-h-[340px] flex-1 flex-col justify-between rounded-[2rem] border-2 border-[#F97316] bg-[#0B1B28] px-5 py-5 shadow-[0_0_28px_rgba(249,115,22,0.18)]">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F97316]/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F97316]">
            <Flame className="h-3.5 w-3.5" />
            Última Cartada · {match.categoryName}
          </span>

          <h2 className="font-display mt-3 text-2xl font-extrabold text-[#F3FAFA] sm:text-3xl">
            Apanharam {caughtImpostor.name}!
          </h2>

          <p className="mt-1.5 text-xs leading-relaxed text-[#F3FAFA]/80">
            <strong className="text-[#F97316]">{caughtImpostor.name}</strong>, acerta a palavra
            secreta para roubar a vitória:
          </p>
        </div>

        <div className="my-auto space-y-2.5 py-3">
          {match.lastChanceOptions.map((option, idx) => {
            const isSelected = selectedWord === option;
            const letter = String.fromCharCode(65 + idx);
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  sound.tap();
                  setSelectedWord(option);
                }}
                className={`flex min-h-[58px] w-full items-center justify-between rounded-2xl border-2 px-4 py-3 text-left transition active:scale-[0.98] ${
                  isSelected
                    ? 'border-[#F97316] bg-[#F97316]/15'
                    : 'border-[#F3FAFA]/12 bg-[#07131D] hover:border-[#19D8F2]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-display text-sm font-extrabold ${
                      isSelected
                        ? 'bg-[#F97316] text-[#07131D]'
                        : 'bg-[#0B1B28] text-[#19D8F2]'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="font-display text-lg font-extrabold text-[#F3FAFA]">
                    {option}
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

      {/* Single Primary Bottom Button */}
      <div className="py-3">
        <button
          type="button"
          disabled={!selectedWord}
          onClick={() => {
            if (!selectedWord) return;
            onGuess(selectedWord);
          }}
          className="flex min-h-[60px] w-full items-center justify-center gap-2 rounded-2xl bg-[#F97316] px-6 font-display text-base font-extrabold text-[#07131D] shadow-[0_8px_28px_rgba(249,115,22,0.28)] transition active:scale-[0.98] disabled:bg-[#0B1B28] disabled:text-[#F3FAFA]/35 disabled:shadow-none"
        >
          <Sparkles className="h-5 w-5" />
          {selectedWord ? `Arriscar "${selectedWord}"` : 'Escolhe uma palavra na carta'}
        </button>
      </div>
    </div>
  );
}
