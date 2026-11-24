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
    <div className="mx-auto flex min-h-[calc(100dvh-70px)] w-full max-w-lg flex-col justify-between px-4 pb-32 pt-5">
      <div className="space-y-4">
        <div className="animate-pop-in rounded-3xl border-2 border-[#F97316] bg-[#0B1B28] p-5 text-center shadow-[0_0_28px_rgba(249,115,22,0.18)]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F97316]/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F97316]">
            <Flame className="h-3.5 w-3.5" />
            Última Cartada
          </span>

          <h2 className="font-display mt-3 text-2xl font-extrabold text-[#F3FAFA] sm:text-3xl">
            Apanharam {caughtImpostor.name}!
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-[#F3FAFA]/85">
            Mas o jogo ainda não acabou! <strong className="text-[#F97316]">{caughtImpostor.name}</strong>,
            se adivinhares a palavra secreta do baralho{' '}
            <strong className="text-[#19D8F2]">{match.categoryName}</strong>, roubas a vitória!
          </p>
        </div>

        <div className="space-y-2.5">
          <p className="px-1 text-xs font-bold uppercase tracking-widest text-[#19D8F2]">
            Escolhe 1 das 4 palavras
          </p>

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
                className={`flex min-h-[60px] w-full items-center justify-between rounded-2xl border-2 bg-[#0B1B28] px-4 py-3.5 text-left transition active:scale-[0.98] ${
                  isSelected
                    ? 'border-[#F97316] bg-[#F97316]/12 shadow-[0_0_18px_rgba(249,115,22,0.18)]'
                    : 'border-[#F3FAFA]/12 hover:border-[#19D8F2]/40'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-display text-sm font-extrabold ${
                      isSelected
                        ? 'bg-[#F97316] text-[#07131D]'
                        : 'bg-[#07131D] text-[#19D8F2]'
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

      {/* Bottom Thumb CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#F3FAFA]/10 bg-[#07131D]/95 px-4 pt-3 pb-safe backdrop-blur-md">
        <div className="mx-auto max-w-lg">
          <button
            type="button"
            disabled={!selectedWord}
            onClick={() => {
              if (!selectedWord) return;
              onGuess(selectedWord);
            }}
            className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-[#F97316] px-6 font-display text-base font-extrabold text-[#07131D] shadow-[0_8px_28px_rgba(249,115,22,0.28)] transition active:scale-[0.98] disabled:bg-[#0B1B28] disabled:text-[#F3FAFA]/35 disabled:shadow-none"
          >
            <Sparkles className="h-5 w-5" />
            {selectedWord ? `Arriscar "${selectedWord}"` : 'Seleciona uma palavra acima'}
          </button>
        </div>
      </div>
    </div>
  );
}
