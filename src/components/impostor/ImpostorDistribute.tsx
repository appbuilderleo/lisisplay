import { useState } from 'react';
import { Eye, EyeOff, ShieldAlert, ShieldCheck, Smartphone } from 'lucide-react';
import { ImpostorMatch, ImpostorPlayer } from '../../types';
import { sound } from '../../lib/audio';
import { getSyneFitStyle } from '../../lib/textFit';

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

  const progressPct = ((currentIndex + (revealed ? 1 : 0.4)) / players.length) * 100;

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-68px)] w-full max-w-[440px] flex-col px-3.5 pb-safe pt-3">
      {/* GIANT OPEN CARD: Electric Social Arcade Glassmorphism */}
      <div
        className={`glass-card relative flex min-h-[340px] w-full flex-1 flex-col justify-between overflow-x-clip rounded-[2rem] border-2 px-5 py-6 text-center shadow-2xl transition-colors ${
          !revealed
            ? 'border-[#19D8F2]/40'
            : isImpostor
              ? 'border-[#FF6B35] shadow-[0_0_32px_rgba(249,115,22,0.2)]'
              : 'border-[#00F5D4] shadow-[0_0_32px_rgba(0,229,196,0.16)]'
        }`}
      >
        {/* Integrated Progress Bar at top of card */}
        <div className="mx-1 h-1.5 overflow-hidden rounded-full bg-[#070B14]">
          <div
            className="h-full rounded-full bg-[#00F5D4] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Inside Card Header */}
        <div className="flex items-center justify-between pt-3 text-xs font-bold">
          <span className="uppercase tracking-widest text-[#19D8F2]">Papel Secreto</span>
          <span className="rounded-full bg-[#070B14] px-3 py-1 text-[#F8FAFC]/80">
            {currentIndex + 1} / {players.length}
          </span>
        </div>

        {/* Inside Card Center Content */}
        {!revealed ? (
          <div
            key={`pass-${player.id}`}
            className="animate-pop-in my-auto flex flex-col items-center py-6"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#19D8F2]/15 text-[#19D8F2]">
              <Smartphone className="h-8 w-8" />
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-widest text-[#19D8F2]">
              Passa o celular para
            </p>
            <h2
              style={getSyneFitStyle(player.name)}
              className="font-display mt-2 w-full max-w-full break-words [overflow-wrap:anywhere] hyphens-auto font-extrabold leading-[1.15] text-[#F8FAFC]"
            >
              {player.name}
            </h2>
          </div>
        ) : isImpostor ? (
          <div
            key={`role-imp-${player.id}`}
            className="animate-pop-in my-auto flex flex-col items-center py-4"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#FF6B35]/20 text-[#FF6B35]">
              <ShieldAlert className="h-9 w-9" />
            </div>
            <span className="mt-4 rounded-full bg-[#FF6B35]/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-[#FF6B35]">
              {player.name}
            </span>
            <h2 className="font-display mt-3 text-4xl font-extrabold text-[#FF6B35] sm:text-5xl">
              És o Impostor!
            </h2>

            {showCategoryToImpostor ? (
              <div className="mt-5 w-full rounded-2xl border border-[#19D8F2]/30 bg-[#070B14] px-4 py-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#19D8F2]">
                  Categoria do Baralho
                </p>
                <p className="font-display mt-1 text-xl font-extrabold text-[#F8FAFC]">
                  {match.categoryName}
                </p>
              </div>
            ) : (
              <p className="mt-4 max-w-xs text-sm text-[#F8FAFC]/80">
                Não sabes a palavra secreta. Ouve as pistas e disfarça!
              </p>
            )}
          </div>
        ) : (
          <div
            key={`role-cit-${player.id}`}
            className="animate-pop-in my-auto flex flex-col items-center py-4"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#00F5D4]/15 text-[#00F5D4]">
              <ShieldCheck className="h-9 w-9" />
            </div>
            <span className="mt-4 rounded-full bg-[#00F5D4]/15 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-[#00F5D4]">
              Inocente · {player.name}
            </span>

            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-[#F8FAFC]/60">
              Palavra Secreta
            </p>
            <h2
              style={getSyneFitStyle(match.secretWord)}
              className="font-display mt-2 w-full max-w-full break-words [overflow-wrap:anywhere] hyphens-auto font-extrabold leading-[1.15] text-[#F8FAFC]"
            >
              {match.secretWord}
            </h2>

            <span className="mt-4 rounded-full border border-[#19D8F2]/30 bg-[#070B14] px-3.5 py-1 text-xs font-bold text-[#19D8F2]">
              {match.categoryName}
            </span>
          </div>
        )}

        {/* Inside Card Footer Guidance */}
        <div className="rounded-2xl bg-[#070B14]/85 px-4 py-2.5 text-xs font-medium text-[#F8FAFC]/75">
          {!revealed
            ? 'Certifica-te de que ninguém está a espreitar.'
            : isImpostor
              ? match.impostorIds.length > 1
                ? 'Há 2 impostores na roda. Dá uma pista convincente!'
                : 'Dá uma pista subtil de 1 palavra sem te denunciares.'
              : 'Diz apenas 1 palavra-pista sem entregar o segredo.'}
        </div>
      </div>

      {/* Single Primary Pill Button */}
      <div className="py-3">
        {!revealed ? (
          <button
            type="button"
            onClick={handleReveal}
            className="flex min-h-[58px] w-full items-center justify-center gap-2.5 rounded-full bg-[#00F5D4] px-6 font-display text-base font-extrabold text-[#070B14] shadow-[0_8px_28px_-4px_rgba(0,245,212,0.42)] transition active:scale-[0.98]"
          >
            <Eye className="h-5 w-5" />
            Ver o Meu Papel
          </button>
        ) : (
          <button
            type="button"
            onClick={handleHideAndNext}
            className="glass-card flex min-h-[58px] w-full items-center justify-center gap-2.5 rounded-full border-2 border-[#00F5D4] px-6 font-display text-base font-extrabold text-[#00F5D4] transition active:scale-[0.98] active:bg-[#00F5D4] active:text-[#070B14]"
          >
            <EyeOff className="h-5 w-5" />
            {isLast ? 'Esconder e Começar Debate' : 'Esconder e Passar'}
          </button>
        )}
      </div>
    </div>
  );
}
