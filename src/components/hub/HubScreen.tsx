import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Flame,
  HandMetal,
  Heart,
  LayoutGrid,
  List,
  Search,
  Smartphone,
  Sparkles,
  Star,
  Timer,
  UserSearch,
  Users,
  WifiOff,
  X,
  Zap,
} from 'lucide-react';
import { GameId } from '../../types';
import { sound } from '../../lib/audio';

interface HubScreenProps {
  favorites: GameId[];
  onToggleFavorite: (gameId: GameId) => void;
  onSelectGame: (game: GameId) => void;
  onOpenRules: () => void;
  onOpenGroup: () => void;
}

type CategoryFilter = 'all' | 'mimica' | 'blefe' | 'votacao' | 'rapidos';
type BottomTab = 'jogos' | 'favoritos';
type ViewMode = 'grid' | 'list';

interface GameCatalogItem {
  id: GameId;
  name: string;
  subtitle: string;
  description: string;
  cover: string;
  topBadge: string;
  topBadgeTone: 'crimson' | 'orange' | 'mint';
  bottomTag: string;
  difficulty: string;
  players: string;
  duration: string;
  footerMeta: string;
  categories: CategoryFilter[];
  accentText: string;
  icon: typeof Flame;
}

const CATALOG: GameCatalogItem[] = [
  {
    id: 'kiyumi',
    name: 'Kiyumi',
    subtitle: 'Mímica Rápida & Descreve',
    description:
      'Representa com gestos ou descreve por voz sem dizer palavras do ecrã. Cada acerto vale +1 ponto em 30s!',
    cover: '/game-kiyumi.jpg',
    topBadge: 'Ritmo Acelerado',
    topBadgeTone: 'orange',
    bottomTag: 'Mímica & Voz',
    difficulty: 'Energético',
    players: '2+ jog.',
    duration: '30s / ronda',
    footerMeta: '80 palavras nossas',
    categories: ['mimica', 'rapidos'],
    accentText: 'text-[#FF6B35]',
    icon: Flame,
  },
  {
    id: 'impostor',
    name: 'O Impostor',
    subtitle: 'Blefe & Dedução Social',
    description:
      'Todos recebem a palavra secreta, exceto o Impostor. Dêem pistas de 1 palavra, debatam e descubram quem mente!',
    cover: '/game-impostor.jpg',
    topBadge: 'Mais Popular',
    topBadgeTone: 'crimson',
    bottomTag: 'Tensão Máxima',
    difficulty: 'Fácil',
    players: '3 a 10 jog.',
    duration: '~5 min',
    footerMeta: 'Última Cartada',
    categories: ['blefe'],
    accentText: 'text-[#00F5D4]',
    icon: UserSearch,
  },
  {
    id: 'zoe',
    name: 'Zoe',
    subtitle: 'Quem na Roda? · Votação',
    description:
      'Frases diretas e hilariantes sobre o grupo. Contem 3... 2... 1 e apontem todos ao mesmo tempo!',
    cover: '/game-zoe.jpg',
    topBadge: 'Votação Rápida',
    topBadgeTone: 'mint',
    bottomTag: 'Apontar Dedo',
    difficulty: 'Instantâneo',
    players: '3+ jog.',
    duration: 'Livre',
    footerMeta: '60 cartas de festa',
    categories: ['votacao', 'rapidos'],
    accentText: 'text-[#00FFA3]',
    icon: HandMetal,
  },
];

const CATEGORY_CHIPS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'mimica', label: 'Mímica' },
  { id: 'blefe', label: 'Blefe' },
  { id: 'votacao', label: 'Votação' },
  { id: 'rapidos', label: 'Rápidos' },
];

export function HubScreen({
  favorites,
  onToggleFavorite,
  onSelectGame,
  onOpenRules,
  onOpenGroup,
}: HubScreenProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<BottomTab>('jogos');

  const filteredGames = useMemo(() => {
    const term = search.trim().toLowerCase();
    return CATALOG.filter((game) => {
      if (activeTab === 'favoritos' && !favorites.includes(game.id)) {
        return false;
      }
      const matchesCat = category === 'all' || game.categories.includes(category);
      const matchesSearch =
        !term ||
        game.name.toLowerCase().includes(term) ||
        game.subtitle.toLowerCase().includes(term) ||
        game.description.toLowerCase().includes(term);
      return matchesCat && matchesSearch;
    });
  }, [search, category, activeTab, favorites]);

  const handleLaunch = (gameId: GameId) => {
    sound.unlock();
    sound.go();
    onSelectGame(gameId);
  };

  const resetFilters = () => {
    sound.tap();
    setSearch('');
    setCategory('all');
    setActiveTab('jogos');
  };

  return (
    <div className="relative mx-auto flex min-h-[calc(100dvh-96px)] w-full max-w-[480px] flex-col px-4 pb-24 pt-3">
      {/* Subtle Ambient Arcade Glows */}
      <div className="pointer-events-none fixed -right-24 top-24 h-64 w-64 rounded-full bg-[#00F5D4]/7 blur-[100px]" />
      <div className="pointer-events-none fixed -left-24 bottom-24 h-64 w-64 rounded-full bg-[#FF6B35]/7 blur-[100px]" />

      <div className="relative z-10 flex flex-col gap-3.5">
        {/* Search Bar */}
        <div className="glass-card flex h-12 w-full items-center rounded-2xl px-3.5 shadow-lg transition-all focus-within:border-[#00F5D4]/45">
          <Search className="mr-2.5 h-4 w-4 shrink-0 text-[#00F5D4]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar jogo ou estilo..."
            className="w-full bg-transparent text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none"
          />
          {search.length > 0 && (
            <button
              type="button"
              onClick={() => {
                sound.tap();
                setSearch('');
              }}
              aria-label="Limpar busca"
              className="p-1 text-[#94A3B8] hover:text-[#F8FAFC]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Chips + Grid/List Toggle */}
        <div className="flex items-center justify-between gap-2">
          <div className="no-scrollbar flex flex-1 items-center gap-1.5 overflow-x-auto py-0.5">
            {CATEGORY_CHIPS.map((chip) => {
              const active = category === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => {
                    sound.tap();
                    setCategory(chip.id);
                    if (activeTab === 'favoritos') setActiveTab('jogos');
                  }}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 font-display text-[11px] font-extrabold uppercase tracking-wider transition active:scale-95 ${
                    active
                      ? 'bg-[#00F5D4] text-[#070B14] shadow-sm shadow-[#00F5D4]/30'
                      : 'glass-card text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          <div className="glass-card flex shrink-0 items-center rounded-xl p-1">
            <button
              type="button"
              aria-label="Modo Cartões"
              onClick={() => {
                sound.tap();
                setViewMode('grid');
              }}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-[#00F5D4]/20 text-[#00F5D4]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Modo Lista Compacta"
              onClick={() => {
                sound.tap();
                setViewMode('list');
              }}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                viewMode === 'list'
                  ? 'bg-[#00F5D4]/20 text-[#00F5D4]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Live Catalog Counter */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-[#00FFA3]" />
            <span className="font-display text-[11px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
              {activeTab === 'favoritos'
                ? `${filteredGames.length} Favoritos`
                : `${filteredGames.length} Jogos Prontos para a Roda`}
            </span>
          </div>
          <span className="font-display text-[11px] font-extrabold text-[#00F5D4]">
            Baralhos de MZ
          </span>
        </div>

        {/* Game Cards List / Grid */}
        {filteredGames.length === 0 ? (
          <div className="glass-card my-4 flex flex-col items-center justify-center rounded-3xl p-7 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#1B2029] text-[#FF6B35]">
              {activeTab === 'favoritos' ? (
                <Heart className="h-7 w-7" />
              ) : (
                <Sparkles className="h-7 w-7" />
              )}
            </div>
            <h3 className="font-display text-lg font-extrabold text-[#F8FAFC]">
              {activeTab === 'favoritos'
                ? 'Ainda sem favoritos'
                : 'Nenhum jogo encontrado'}
            </h3>
            <p className="mt-1 max-w-[260px] text-xs text-[#94A3B8]">
              {activeTab === 'favoritos'
                ? 'Toca no coração de qualquer jogo para o guardar aqui.'
                : 'Tenta limpar a pesquisa ou explorar todos os modos.'}
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 rounded-full bg-[#00F5D4] px-5 py-2.5 font-display text-xs font-extrabold text-[#070B14] transition active:scale-95"
            >
              Ver todos os jogos
            </button>
          </div>
        ) : (
          <section className={viewMode === 'grid' ? 'grid grid-cols-1 gap-4' : 'space-y-3'}>
            {filteredGames.map((game) => {
              const isFav = favorites.includes(game.id);
              const topBadgeStyle =
                game.topBadgeTone === 'crimson'
                  ? 'bg-[#FF3366]/85 text-[#F8FAFC]'
                  : game.topBadgeTone === 'orange'
                    ? 'bg-[#FF6B35]/90 text-[#070B14]'
                    : 'bg-[#0F172A]/85 text-[#00FFA3] border border-[#00FFA3]/30';

              if (viewMode === 'list') {
                return (
                  <article
                    key={game.id}
                    onClick={() => handleLaunch(game.id)}
                    className="glass-card group relative flex cursor-pointer items-center gap-3.5 rounded-3xl p-3 shadow-lg transition active:scale-[0.99] hover:border-[#00F5D4]/40"
                  >
                    <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#0F172A]">
                      <img
                        src={game.cover}
                        alt={game.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#070B14]/70 via-transparent to-transparent" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="font-display truncate text-lg font-extrabold text-[#F8FAFC]">
                          {game.name}
                        </h2>
                        <button
                          type="button"
                          aria-label={`Favoritar ${game.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            sound.tap();
                            onToggleFavorite(game.id);
                          }}
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#070B14]/70 transition active:scale-90 ${
                            isFav ? 'text-[#FF3366]' : 'text-[#94A3B8]'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                      <p className={`font-display text-xs font-bold ${game.accentText}`}>
                        {game.subtitle}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2 text-[11px] font-semibold text-[#B9CAC4]">
                        <span>{game.players}</span>
                        <span className="text-[#94A3B8]/40">•</span>
                        <span>{game.duration}</span>
                      </div>
                    </div>

                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00F5D4] text-[#070B14] shadow-md shadow-[#00F5D4]/25">
                      <ArrowRight className="h-5 w-5 stroke-[2.5]" />
                    </span>
                  </article>
                );
              }

              return (
                <article
                  key={game.id}
                  onClick={() => handleLaunch(game.id)}
                  className="glass-card group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl shadow-xl shadow-[#070B14]/90 transition-all duration-300 active:scale-[0.99] hover:border-[#00F5D4]/40"
                >
                  {/* Mozambican Editorial Cover Photo */}
                  <div className="relative h-44 w-full overflow-hidden bg-[#0F172A]">
                    <img
                      src={game.cover}
                      alt={`${game.name} — Lisis Play`}
                      className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/35 to-transparent" />

                    {/* Top Overlay Badges + Favorite Heart */}
                    <div className="absolute left-3 right-3 top-3 flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-display text-[10px] font-extrabold uppercase tracking-wider shadow-sm backdrop-blur-md ${topBadgeStyle}`}
                      >
                        <Flame className="h-3.5 w-3.5" />
                        {game.topBadge}
                      </span>

                      <button
                        type="button"
                        aria-label={`Favoritar ${game.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.tap();
                          onToggleFavorite(game.id);
                        }}
                        className={`flex h-9 w-9 items-center justify-center rounded-full bg-[#070B14]/65 backdrop-blur-md transition active:scale-90 ${
                          isFav ? 'text-[#FF3366]' : 'text-[#DFE2F0] hover:text-[#00F5D4]'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Bottom-Left Float Tag */}
                    <div className="absolute bottom-2.5 left-3 inline-flex items-center gap-1 rounded-lg bg-[#070B14]/80 px-2.5 py-1 backdrop-blur-md">
                      <Zap className="h-3 w-3 text-[#00F5D4]" />
                      <span className="font-display text-[10px] font-extrabold uppercase tracking-wider text-[#F8FAFC]">
                        {game.bottomTag}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col gap-2.5 p-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <div>
                        <h2 className="font-display text-xl font-extrabold leading-tight text-[#F8FAFC]">
                          {game.name}
                        </h2>
                        <span className={`font-display text-xs font-bold ${game.accentText}`}>
                          {game.subtitle}
                        </span>
                      </div>
                      <span className="shrink-0 rounded-full bg-[#1B2029] px-2.5 py-1 font-display text-[10px] font-extrabold uppercase tracking-wider text-[#B9CAC4]">
                        {game.difficulty}
                      </span>
                    </div>

                    <p className="line-clamp-2 text-xs leading-relaxed text-[#B9CAC4]">
                      {game.description}
                    </p>

                    {/* Specs Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="inline-flex items-center gap-1 rounded-xl bg-[#1B2029] px-2.5 py-1 font-display text-[10px] font-bold text-[#F8FAFC]">
                        <Users className="h-3 w-3 text-[#00F5D4]" />
                        {game.players}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-xl bg-[#1B2029] px-2.5 py-1 font-display text-[10px] font-bold text-[#F8FAFC]">
                        <Timer className="h-3 w-3 text-[#FF6B35]" />
                        {game.duration}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-xl bg-[#1B2029] px-2.5 py-1 font-display text-[10px] font-bold text-[#00FFA3]">
                        <WifiOff className="h-3 w-3" />
                        Offline
                      </span>
                    </div>

                    {/* Action Row */}
                    <div className="mt-1 flex items-center justify-between gap-2 pt-1">
                      <span className="text-xs font-medium text-[#94A3B8]">
                        {game.footerMeta}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLaunch(game.id);
                        }}
                        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-[#00F5D4] px-5 py-2 font-display text-sm font-extrabold text-[#070B14] shadow-md shadow-[#00F5D4]/25 transition active:scale-95 hover:bg-[#00FFA3]"
                      >
                        <span>Jogar Agora</span>
                        <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* Pass-The-Phone Info Banner */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            onOpenRules();
          }}
          className="glass-card mt-1 flex w-full items-center justify-between rounded-2xl p-3.5 text-left shadow-lg transition active:scale-[0.99] hover:border-[#00F5D4]/35"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00F5D4]/15 text-[#00F5D4]">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-sm font-bold leading-tight text-[#F8FAFC]">
                Como funciona a Roda?
              </p>
              <p className="mt-0.5 text-xs text-[#94A3B8]">
                Apenas 1 celular passa de mão em mão — zero internet.
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-[#94A3B8]" />
        </button>
      </div>

      {/* Bottom Tab Bar (Menu de Jogos only — hidden during gameplay!) */}
      <nav
        aria-label="Navegação Principal"
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/8 bg-[#070B14]/92 shadow-[0_-4px_24px_rgba(0,0,0,0.55)] backdrop-blur-xl pb-safe"
      >
        <div className="mx-auto flex h-16 max-w-[480px] items-center justify-around px-2">
          <button
            type="button"
            onClick={() => {
              sound.tap();
              setActiveTab('jogos');
            }}
            className={`flex min-h-[48px] min-w-[68px] flex-col items-center justify-center gap-0.5 transition ${
              activeTab === 'jogos' ? 'text-[#00F5D4]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <LayoutGrid className="h-5 w-5" />
            <span className="font-display text-[10px] font-extrabold uppercase tracking-wider">
              Jogos
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.tap();
              onOpenRules();
            }}
            className="flex min-h-[48px] min-w-[68px] flex-col items-center justify-center gap-0.5 text-[#94A3B8] transition hover:text-[#F8FAFC]"
          >
            <BookOpen className="h-5 w-5" />
            <span className="font-display text-[10px] font-extrabold uppercase tracking-wider">
              Regras
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.tap();
              setActiveTab('favoritos');
            }}
            className={`relative flex min-h-[48px] min-w-[68px] flex-col items-center justify-center gap-0.5 transition ${
              activeTab === 'favoritos'
                ? 'text-[#00F5D4]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <Star className={`h-5 w-5 ${favorites.length > 0 && activeTab === 'favoritos' ? 'fill-current' : ''}`} />
            <span className="font-display text-[10px] font-extrabold uppercase tracking-wider">
              Favoritos{favorites.length > 0 ? ` (${favorites.length})` : ''}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.tap();
              onOpenGroup();
            }}
            className="flex min-h-[48px] min-w-[68px] flex-col items-center justify-center gap-0.5 text-[#94A3B8] transition hover:text-[#F8FAFC]"
          >
            <Users className="h-5 w-5" />
            <span className="font-display text-[10px] font-extrabold uppercase tracking-wider">
              Roda
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
