import { useState } from 'react';
import {
  ChevronRight,
  Flame,
  HandMetal,
  Play,
  Sparkles,
  UserSearch,
} from 'lucide-react';
import { GameId } from '../../types';
import { sound } from '../../lib/audio';

interface HubScreenProps {
  onSelectGame: (game: GameId) => void;
}

interface GameCardInfo {
  id: GameId;
  number: string;
  name: string;
  tagline: string;
  description: string;
  badges: string[];
  accent: 'turquoise' | 'orange' | 'cyan';
  icon: typeof Flame;
}

const GAMES: GameCardInfo[] = [
  {
    id: 'kiyumi',
    number: '01',
    name: 'Kiyumi',
    tagline: 'Mímica rápida (30s) · Modo Testa & Palco',
    description:
      'Inclina o celular na testa ou representa em pé para a tua equipa adivinhar palavras nossas em 30 segundos.',
    badges: ['30 Segundos', 'Testa & Palco', '2+ Jogadores'],
    accent: 'turquoise',
    icon: Flame,
  },
  {
    id: 'impostor',
    number: '02',
    name: 'O Impostor',
    tagline: 'Dedução social na roda · Modo Clássico',
    description:
      'Todos conhecem a palavra secreta, menos o Impostor. Dêem pistas de 1 palavra, debatam e descubram quem mente.',
    badges: ['3–10 Jogadores', 'Blefe & Pistas', 'Última Cartada'],
    accent: 'orange',
    icon: UserSearch,
  },
  {
    id: 'zoe',
    number: '03',
    name: 'Zoe',
    tagline: 'Votação e quebra-gelo · "Quem na Roda?"',
    description:
      'Frases diretas e hilariantes sobre o grupo. Contem 3-2-1 e apontem todos ao mesmo tempo!',
    badges: ['Quebra-Gelo', '3 Baralhos', 'Risos Imediatos'],
    accent: 'cyan',
    icon: HandMetal,
  },
];

export function HubScreen({ onSelectGame }: HubScreenProps) {
  const [selectedGame, setSelectedGame] = useState<GameId>('kiyumi');

  const current = GAMES.find((g) => g.id === selectedGame) ?? GAMES[0];

  const handleCardClick = (gameId: GameId) => {
    sound.unlock();
    if (selectedGame === gameId) {
      sound.go();
      onSelectGame(gameId);
    } else {
      sound.tap();
      setSelectedGame(gameId);
    }
  };

  const handleLaunch = () => {
    sound.unlock();
    sound.go();
    onSelectGame(selectedGame);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-70px)] w-full max-w-lg flex-col justify-between px-4 pb-28 pt-5">
      <div className="space-y-4">
        {/* Clean Menu Header */}
        <div className="px-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#19D8F2]">
            <Sparkles className="h-3.5 w-3.5 text-[#00E5C4]" />
            Menu de Jogos
          </div>
          <h2 className="font-display mt-1 text-2xl font-extrabold tracking-tight text-[#F3FAFA]">
            O que vamos jogar agora?
          </h2>
          <p className="mt-0.5 text-xs text-[#F3FAFA]/65">
            Toca num jogo para selecionar ou entra diretamente.
          </p>
        </div>

        {/* 3 Game Selection Cards */}
        <div className="space-y-3" role="radiogroup" aria-label="Selecionar jogo da Lisis Play">
          {GAMES.map((game) => {
            const isSelected = selectedGame === game.id;
            const Icon = game.icon;
            const iconBg =
              game.accent === 'orange'
                ? 'bg-[#F97316]/15 text-[#F97316]'
                : game.accent === 'cyan'
                  ? 'bg-[#19D8F2]/15 text-[#19D8F2]'
                  : 'bg-[#00E5C4]/15 text-[#00E5C4]';

            return (
              <button
                key={game.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleCardClick(game.id)}
                className={`group relative w-full rounded-3xl border-2 bg-[#0B1B28] p-5 text-left transition-all active:scale-[0.99] ${
                  isSelected
                    ? 'border-[#00E5C4] shadow-[0_0_26px_rgba(0,229,196,0.16)]'
                    : 'border-[#F3FAFA]/10 hover:border-[#19D8F2]/40'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-[#19D8F2]">{game.number}</span>
                        <h3 className="font-display text-xl font-extrabold text-[#F3FAFA]">
                          {game.name}
                        </h3>
                      </div>
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${
                          isSelected
                            ? 'bg-[#00E5C4] text-[#07131D]'
                            : 'bg-[#07131D] text-[#F3FAFA]/40'
                        }`}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>

                    <p className="mt-0.5 text-xs font-semibold text-[#19D8F2]">{game.tagline}</p>

                    <p className="mt-2 text-xs leading-relaxed text-[#F3FAFA]/80">
                      {game.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {game.badges.map((badge) => (
                        <span
                          key={badge}
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            isSelected
                              ? 'border border-[#00E5C4]/25 bg-[#07131D] text-[#00E5C4]'
                              : 'bg-[#07131D] text-[#F3FAFA]/65'
                          }`}
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fixed Thumb-Zone Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#F3FAFA]/10 bg-[#07131D]/95 px-4 pt-3 pb-safe backdrop-blur-md">
        <div className="mx-auto max-w-lg">
          <button
            type="button"
            onClick={handleLaunch}
            className="flex min-h-[56px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[#00E5C4] px-6 font-display text-lg font-extrabold text-[#07131D] shadow-[0_8px_30px_rgba(0,229,196,0.28)] transition active:scale-[0.98]"
          >
            <Play className="h-5 w-5 fill-current" />
            Jogar {current.name}
          </button>
        </div>
      </div>
    </div>
  );
}
