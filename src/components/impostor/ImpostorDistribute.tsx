import { useState } from 'react';
import { Eye, EyeOff, ShieldAlert, ShieldCheck, Smartphone } from 'lucide-react';
import { ImpostorMatch, ImpostorPlayer } from '../../types';
import { sound } from '../../lib/audio';

interface ImpostorDistributeProps {
  players: ImpostorPlayer[];
  match: ImpostorMatch;
  showCategoryToImpostor: boolean;
  onComplete: () => void;
}

export function ImpostorDistribute({
  players,
  match,
  showCategoryToImpostor,
  onComplete,
}: ImpostorDistributeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const player = players[currentIndex];
  const isImpostor = match.impostorIds.includes(player.id);
  const isLast = currentIndex === players.length - 1;

  const handleReveal = () => {
    if (isImpostor) {
      sound.impostor();
    } else {
      sound.reveal();
    }
    setRevealed(true);
  };

  const handleHideAndNext = () => {
    sound.tap();
    setRevealed(false);
    if (isLast) {
      onComplete();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-70px)] w-full max-w-lg flex-col justify-between px-4 pb-8 pt-5">
      {/* Progress Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="uppercase tracking-widest text-[#19D8F2]">
            Distribuição Secreta
          </span>
          <span className="text-[#F3FAFA]/75">
            Jogador {currentIndex + 1} de {players.length}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#0B1B28]">
          <div
            className="h-full rounded-full bg-[#00E5C4] transition-all duration-300"
            style={{ width: `${((currentIndex + (revealed ? 1 : 0.4)) / players.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Center Stage Card */}
      <div className="my-6 flex flex-1 flex-col items-center justify-center">
        {!revealed ? (
          <div
            key={`pass-${player.id}`}
            className="animate-pop-in flex w-full flex-col items-center rounded-3xl border-2 border-[#19D8F2]/35 bg-[#0B1B28] px-6 py-10 text-center shadow-2xl"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#19D8F2]/15 text-[#19D8F2]">
              <Smartphone className="h-8 w-8" />
            </div>
            <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-[#19D8F2]">
              Passa o celular para
            </p>
            <h2 className="font-display mt-2 break-words text-4xl font-extrabold text-[#F3FAFA] sm:text-5xl">
              {player.name}
            </h2>
            <p className="mt-5 max-w-xs text-xs leading-relaxed text-[#F3FAFA]/65">
              Certifica-te de que ninguém está a espreitar antes de tocar abaixo.
            </p>
          </div>
        ) : isImpostor ? (
          <div
            key={`role-imp-${player.id}`}
            className="animate-pop-in flex w-full flex-col items-center rounded-3xl border-2 border-[#F97316] bg-[#0B1B28] px-6 py-9 text-center shadow-[0_0_32px_rgba(249,115,22,0.2)]"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#F97316]/20 text-[#F97316]">
              <ShieldAlert className="h-9 w-9" />
            </div>
            <span className="mt-4 rounded-full bg-[#F97316]/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F97316]">
              Papel Secreto · {player.name}
            </span>
            <h2 className="font-display mt-3 text-4xl font-extrabold text-[#F97316]">
              És o Impostor!
            </h2>

            {showCategoryToImpostor ? (
              <div className="mt-5 w-full rounded-2xl border border-[#19D8F2]/30 bg-[#07131D] px-4 py-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#19D8F2]">
                  Categoria do Baralho
                </p>
                <p className="font-display mt-1 text-xl font-extrabold text-[#F3FAFA]">
                  {match.categoryName}
                </p>
              </div>
            ) : (
              <p className="mt-4 max-w-xs text-sm text-[#F3FAFA]/80">
                Não sabes a palavra secreta. Ouve bem as pistas dos outros e disfarça!
              </p>
            )}

            <p className="mt-4 max-w-xs text-xs leading-relaxed text-[#F3FAFA]/70">
              {match.impostorIds.length > 1
                ? 'Atenção: há 2 impostores nesta roda! Tenta não te denunciar.'
                : 'Dá uma pista convincente de 1 palavra e tenta descobrir o segredo.'}
            </p>
          </div>
        ) : (
          <div
            key={`role-cit-${player.id}`}
            className="animate-pop-in flex w-full flex-col items-center rounded-3xl border-2 border-[#00E5C4] bg-[#0B1B28] px-6 py-9 text-center shadow-[0_0_32px_rgba(0,229,196,0.16)]"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#00E5C4]/15 text-[#00E5C4]">
              <ShieldCheck className="h-9 w-9" />
            </div>
            <span className="mt-4 rounded-full bg-[#00E5C4]/15 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-[#00E5C4]">
              Inocente · {player.name}
            </span>

            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-[#F3FAFA]/60">
              A Palavra Secreta é
            </p>
            <h2 className="font-display mt-2 break-words text-4xl font-extrabold leading-tight text-[#F3FAFA]">
              {match.secretWord}
            </h2>

            <span className="mt-4 rounded-full border border-[#19D8F2]/30 bg-[#07131D] px-3.5 py-1 text-xs font-bold text-[#19D8F2]">
              Baralho: {match.categoryName}
            </span>

            <p className="mt-4 max-w-xs text-xs leading-relaxed text-[#F3FAFA]/70">
              Diz apenas 1 palavra-pista subtil. Não entregues a resposta ao Impostor!
            </p>
          </div>
        )}
      </div>

      {/* Thumb-Zone Primary Action */}
      <div className="pb-safe">
        {!revealed ? (
          <button
            type="button"
            onClick={handleReveal}
            className="flex min-h-[60px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[#00E5C4] px-6 font-display text-lg font-extrabold text-[#07131D] shadow-[0_8px_28px_rgba(0,229,196,0.28)] transition active:scale-[0.98]"
          >
            <Eye className="h-5 w-5" />
            Tocar para ver o meu papel
          </button>
        ) : (
          <button
            type="button"
            onClick={handleHideAndNext}
            className="flex min-h-[60px] w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-[#00E5C4] bg-[#0B1B28] px-6 font-display text-lg font-extrabold text-[#00E5C4] transition active:scale-[0.98] active:bg-[#00E5C4] active:text-[#07131D]"
          >
            <EyeOff className="h-5 w-5" />
            {isLast ? 'Esconder e Começar Debate' : 'Esconder e Passar'}
          </button>
        )}
      </div>
    </div>
  );
}
