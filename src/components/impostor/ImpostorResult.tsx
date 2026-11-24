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
        ? `Apanharam ${accusedPlayer.name}, mas acertou "${match.secretWord}" na Última Cartada!`
        : `${accusedPlayer.name} era INOCENTE! O verdadeiro Impostor escapou.`;

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-68px)] w-full max-w-lg flex-col px-3.5 pb-safe pt-3">
      {/* Single Unified Giant Result Card */}
      <div
        className={`animate-pop-in flex min-h-[340px] flex-1 flex-col justify-between rounded-[2rem] border-2 bg-[#0B1B28] px-6 py-6 text-center shadow-2xl ${
          citizensWon
            ? 'border-[#00E5C4] shadow-[0_0_32px_rgba(0,229,196,0.18)]'
            : 'border-[#F97316] shadow-[0_0_32px_rgba(249,115,22,0.2)]'
        }`}
      >
        <div className="flex flex-col items-center">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-3xl ${
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

          <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#F3FAFA]/85">{subtext}</p>
        </div>

        {/* Secret Word & Impostor Reveal Inside the Card */}
        <div className="my-auto space-y-3 py-4">
          <div className="rounded-2xl bg-[#07131D] p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#19D8F2]">
              Palavra Secreta · {match.categoryName}
            </p>
            <p className="font-display mt-1 text-3xl font-extrabold text-[#00E5C4]">
              {match.secretWord}
            </p>
          </div>

          <div className="rounded-2xl bg-[#07131D] p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#F3FAFA]/60">
              {impostors.length > 1 ? 'Os Impostores eram' : 'O Impostor era'}
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {impostors.map((imp) => (
                <span
                  key={imp.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#F97316]/50 bg-[#F97316]/15 px-3.5 py-1 font-display text-sm font-extrabold text-[#F97316]"
                >
                  <ShieldAlert className="h-4 w-4" />
                  {imp.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Compact Single Bottom Row */}
      <div className="flex items-center gap-3 py-3">
        <button
          type="button"
          onClick={() => {
            sound.tap();
            onEditSetup();
          }}
          aria-label="Editar jogadores"
          className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-2xl border border-[#F3FAFA]/15 bg-[#0B1B28] text-[#19D8F2] transition active:scale-[0.98]"
        >
          <Settings2 className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => {
            sound.tap();
            onPlayAgain();
          }}
          className="flex min-h-[60px] flex-1 items-center justify-center gap-2 rounded-2xl bg-[#00E5C4] px-6 font-display text-base font-extrabold text-[#07131D] shadow-[0_8px_28px_rgba(0,229,196,0.28)] transition active:scale-[0.98]"
        >
          <RefreshCw className="h-5 w-5" />
          Nova Ronda
        </button>
      </div>
    </div>
  );
}
