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
    <div className="mx-auto flex min-h-[calc(100dvh-68px)] w-full max-w-[440px] flex-col px-3.5 pb-safe pt-3">
      {/* Unified Open Last-Chance Glass Card */}
      <div className="glass-card animate-pop-in flex min-h-[340px] flex-1 flex-col justify-between rounded-[2rem] border-2 border-[#FF6B35] px-5 py-5 shadow-[0_0_28px_rgba(255,107,53,0.2)]">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6B35]/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-[#FF6B35]">
            <Flame className="h-3.5 w-3.5" />
            Última Cartada · {match.categoryName}
          </span>

          <h2 className="font-display mt-3 text-2xl font-extrabold text-[#F8FAFC] sm:text-3xl">
            Apanharam {caughtImpostor.name}!
          </h2>

          <p className="mt-1.5 text-xs leading-relaxed text-[#F8FAFC]/80">
            <strong className="text-[#FF6B35]">{caughtImpostor.name}</strong>, acerta a palavra
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
                    ? 'border-[#FF6B35] bg-[#FF6B35]/15'
                    : 'border-[#F8FAFC]/12 bg-[#070B14] hover:border-[#19D8F2]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-display text-sm font-extrabold ${
                      isSelected
                        ? 'bg-[#FF6B35] text-[#070B14]'
                        : 'bg-[#0F172A] text-[#19D8F2]'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="font-display text-lg font-extrabold text-[#F8FAFC]">
                    {option}
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

      {/* Single Primary Pill Button */}
      <div className="py-3">
        <button
          type="button"
          disabled={!selectedWord}
          onClick={() => {
            if (!selectedWord) return;
            onGuess(selectedWord);
          }}
          className="flex min-h-[58px] w-full items-center justify-center gap-2 rounded-full bg-[#FF6B35] px-6 font-display text-base font-extrabold text-[#070B14] shadow-[0_8px_28px_-4px_rgba(255,107,53,0.4)] transition active:scale-[0.98] disabled:bg-[#1B2029] disabled:text-[#F8FAFC]/35 disabled:shadow-none"
        >
          <Sparkles className="h-5 w-5" />
          {selectedWord ? `Arriscar "${selectedWord}"` : 'Escolhe uma palavra na carta'}
        </button>
      </div>
    </div>
  );
}
