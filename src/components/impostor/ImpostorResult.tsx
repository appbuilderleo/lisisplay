import { useEffect } from 'react';
import { RefreshCw, Settings2, ShieldAlert, Trophy } from 'lucide-react';
import { ImpostorMatch, ImpostorPlayer } from '../../types';
import { sound } from '../../lib/audio';

export type ImpostorOutcome = 'wrong-accusation' | 'impostor-guessed' | 'citizens-win';

interface ImpostorResultProps {
  outcome: ImpostorOutcome;
  players: ImpostorPlayer[];
  match: ImpostorMatch;
  accusedPlayer: ImpostorPlayer;
  guessedWord?: string;
  onPlayAgain: () => void;
  onEditSetup: () => void;
}

export function ImpostorResult({
  outcome,
  players,
  match,
  accusedPlayer,
  guessedWord,
  onPlayAgain,
  onEditSetup,
}: ImpostorResultProps) {
  const impostors = players.filter((p) => match.impostorIds.includes(p.id));
  const citizensWon = outcome === 'citizens-win';

  useEffect(() => {
    if (citizensWon) {
      sound.victory();
    } else {
      sound.impostor();
    }
  }, [citizensWon]);

  const headline =
    outcome === 'citizens-win'
      ? 'Vitória da Roda!'
      : outcome === 'impostor-guessed'
        ? 'Virada Épica do Impostor!'
        : 'O Impostor Venceu!';

  const subtext =
    outcome === 'citizens-win'
      ? `${accusedPlayer.name} era o Impostor e apostou em "${guessedWord}", mas errou a palavra secreta!`
      : outcome === 'impostor-guessed'
        ? `Apanharam ${accusedPlayer.name}, mas na Última Cartada acertou a palavra "${match.secretWord}" e roubou a vitória!`
        : `${accusedPlayer.name} era INOCENTE! O grupo deixou o verdadeiro Impostor escapar.`;

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-70px)] w-full max-w-lg flex-col justify-between px-4 pb-44 pt-5">
      <div className="space-y-4">
        {/* Outcome Banner */}
        <section
          className={`animate-pop-in rounded-3xl border-2 bg-[#0B1B28] p-6 text-center shadow-2xl ${
            citizensWon
              ? 'border-[#00E5C4] shadow-[0_0_32px_rgba(0,229,196,0.18)]'
              : 'border-[#F97316] shadow-[0_0_32px_rgba(249,115,22,0.2)]'
          }`}
        >
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-3xl ${
              citizensWon
                ? 'bg-[#00E5C4]/15 text-[#00E5C4]'
                : 'bg-[#F97316]/15 text-[#F97316]'
            }`}
          >
            {citizensWon ? <Trophy className="h-9 w-9" /> : <ShieldAlert className="h-9 w-9" />}
          </div>

          <h2
            className={`font-display mt-4 text-3xl font-extrabold sm:text-4xl ${
              citizensWon ? 'text-[#00E5C4]' : 'text-[#F97316]'
            }`}
          >
            {headline}
          </h2>

          <p className="mt-2.5 text-sm leading-relaxed text-[#F3FAFA]/85">{subtext}</p>
        </section>

        {/* Match Summary Details */}
        <section className="space-y-3 rounded-3xl border border-[#F3FAFA]/10 bg-[#0B1B28] p-5">
          <div className="rounded-2xl bg-[#07131D] p-4 text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#19D8F2]">
              Palavra Secreta · {match.categoryName}
            </p>
            <p className="font-display mt-1 text-3xl font-extrabold text-[#00E5C4]">
              {match.secretWord}
            </p>
          </div>

          <div className="rounded-2xl bg-[#07131D] p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#F3FAFA]/60">
              {impostors.length > 1 ? 'Os Impostores eram' : 'O Impostor era'}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {impostors.map((imp) => (
                <span
                  key={imp.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#F97316]/50 bg-[#F97316]/15 px-3.5 py-1.5 font-display text-sm font-extrabold text-[#F97316]"
                >
                  <ShieldAlert className="h-4 w-4" />
                  {imp.name}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Fixed Bottom Thumb Actions */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#F3FAFA]/10 bg-[#07131D]/95 px-4 pt-3 pb-safe backdrop-blur-md">
        <div className="mx-auto max-w-lg space-y-2.5">
          <button
            type="button"
            onClick={() => {
              sound.tap();
              onPlayAgain();
            }}
            className="flex min-h-[56px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[#00E5C4] px-6 font-display text-base font-extrabold text-[#07131D] shadow-[0_8px_28px_rgba(0,229,196,0.28)] transition active:scale-[0.98]"
          >
            <RefreshCw className="h-5 w-5" />
            Nova Ronda (Mesmos Jogadores)
          </button>

          <button
            type="button"
            onClick={() => {
              sound.tap();
              onEditSetup();
            }}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-[#F3FAFA]/15 bg-[#0B1B28] px-4 text-sm font-semibold text-[#F3FAFA] transition active:scale-[0.98]"
          >
            <Settings2 className="h-4 w-4 text-[#19D8F2]" />
            Editar Jogadores ou Baralho
          </button>
        </div>
      </div>
    </div>
  );
}
