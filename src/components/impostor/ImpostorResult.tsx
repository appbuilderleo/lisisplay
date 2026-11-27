import { useEffect } from 'react';
import { RefreshCw, Settings2, ShieldAlert, Trophy } from 'lucide-react';
import { ImpostorMatch, ImpostorPlayer } from '../../types';
import { sound } from '../../lib/audio';
import { getSyneFitStyle } from '../../lib/textFit';

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
    <div className="mx-auto flex min-h-[calc(100dvh-68px)] w-full max-w-[440px] flex-col px-3.5 pb-safe pt-3">
      {/* Single Unified Giant Glass Result Card */}
      <div
        className={`glass-card animate-pop-in flex min-h-[340px] flex-1 flex-col justify-between rounded-[2rem] border-2 px-6 py-6 text-center shadow-2xl ${
          citizensWon
            ? 'border-[#00F5D4] shadow-[0_0_32px_rgba(0,229,196,0.18)]'
            : 'border-[#FF6B35] shadow-[0_0_32px_rgba(249,115,22,0.2)]'
        }`}
      >
        <div className="flex flex-col items-center">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-3xl ${
              citizensWon
                ? 'bg-[#00F5D4]/15 text-[#00F5D4]'
                : 'bg-[#FF6B35]/15 text-[#FF6B35]'
            }`}
          >
            {citizensWon ? <Trophy className="h-9 w-9" /> : <ShieldAlert className="h-9 w-9" />}
          </div>

          <h2
            className={`font-display mt-4 text-3xl font-extrabold sm:text-4xl ${
              citizensWon ? 'text-[#00F5D4]' : 'text-[#FF6B35]'
            }`}
          >
            {headline}
          </h2>

          <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#F8FAFC]/85">{subtext}</p>
        </div>

        {/* Secret Word & Impostor Reveal Inside the Card */}
        <div className="my-auto space-y-3 py-4">
          <div className="rounded-2xl bg-[#070B14] p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#19D8F2]">
              Palavra Secreta · {match.categoryName}
            </p>
            <p
              style={getSyneFitStyle(match.secretWord)}
              className="font-display mt-1 w-full max-w-full break-words [overflow-wrap:anywhere] hyphens-auto font-extrabold leading-[1.15] text-[#00F5D4]"
            >
              {match.secretWord}
            </p>
          </div>

          <div className="rounded-2xl bg-[#070B14] p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#F8FAFC]/60">
              {impostors.length > 1 ? 'Os Impostores eram' : 'O Impostor era'}
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {impostors.map((imp) => (
                <span
                  key={imp.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#FF6B35]/50 bg-[#FF6B35]/15 px-3.5 py-1 font-display text-sm font-extrabold text-[#FF6B35]"
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
          className="glass-card flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full text-[#00F5D4] transition active:scale-[0.98]"
        >
          <Settings2 className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => {
            sound.tap();
            onPlayAgain();
          }}
          className="flex min-h-[58px] flex-1 items-center justify-center gap-2 rounded-full bg-[#00F5D4] px-6 font-display text-base font-extrabold text-[#070B14] shadow-[0_8px_28px_-4px_rgba(0,245,212,0.42)] transition active:scale-[0.98]"
        >
          <RefreshCw className="h-5 w-5" />
          Nova Ronda
        </button>
      </div>
    </div>
  );
}
