import {
  Check,
  Eye,
  EyeOff,
  Layers,
  Play,
  Plus,
  Shuffle,
  Trash2,
  UserSearch,
  Users,
} from 'lucide-react';
import { WORD_DECKS } from '../../data/decks';
import { ImpostorConfig } from '../../types';
import { sound } from '../../lib/audio';

export const RANDOM_IMPOSTOR_DECK_ID = 'aleatorio';

interface ImpostorSetupProps {
  config: ImpostorConfig;
  onChange: (next: ImpostorConfig) => void;
  onStart: () => void;
}

export function ImpostorSetup({ config, onChange, onStart }: ImpostorSetupProps) {
  const canHaveTwoImpostors = config.players.length >= 6;
  const effectiveImpostorCount: 1 | 2 = canHaveTwoImpostors ? config.impostorCount : 1;

  const handleRename = (id: string, name: string) => {
    onChange({
      ...config,
      players: config.players.map((p) => (p.id === id ? { ...p, name } : p)),
    });
  };

  const handleRemove = (id: string) => {
    if (config.players.length <= 3) return;
    sound.tap();
    const nextPlayers = config.players.filter((p) => p.id !== id);
    onChange({
      ...config,
      players: nextPlayers,
      impostorCount: nextPlayers.length < 6 ? 1 : config.impostorCount,
    });
  };

  const handleAdd = () => {
    if (config.players.length >= 10) return;
    sound.tap();
    const nextNum = config.players.length + 1;
    onChange({
      ...config,
      players: [
        ...config.players,
        { id: `p-${Date.now()}-${nextNum}`, name: `Jogador ${nextNum}` },
      ],
    });
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-70px)] w-full max-w-lg flex-col justify-between px-4 pb-32 pt-4">
      <div className="space-y-5">
        {/* Players Section */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#00F5D4]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#19D8F2]">
                1. Jogadores ({config.players.length}/10)
              </span>
            </div>
            <span className="text-[11px] font-medium text-[#F8FAFC]/60">Mínimo 3</span>
          </div>

          <div className="space-y-2 rounded-3xl border border-[#F8FAFC]/10 bg-[#0F172A] p-3.5">
            {config.players.map((player, idx) => (
              <div key={player.id} className="flex items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#070B14] font-display text-xs font-extrabold text-[#19D8F2]">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={player.name}
                  maxLength={22}
                  placeholder={`Jogador ${idx + 1}`}
                  onChange={(e) => handleRename(player.id, e.target.value)}
                  className="min-h-[48px] w-full rounded-xl border border-[#F8FAFC]/12 bg-[#070B14] px-3.5 text-sm font-semibold text-[#F8FAFC] placeholder:text-[#F8FAFC]/35 focus:border-[#00F5D4] focus:outline-none"
                />
                {config.players.length > 3 && (
                  <button
                    type="button"
                    onClick={() => handleRemove(player.id)}
                    aria-label={`Remover ${player.name}`}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#F8FAFC]/10 bg-[#070B14] text-[#F8FAFC]/55 transition active:scale-95 hover:border-[#FF6B35]/60 hover:text-[#FF6B35]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}

            {config.players.length < 10 && (
              <button
                type="button"
                onClick={handleAdd}
                className="mt-1 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#00F5D4]/45 bg-[#070B14]/60 text-sm font-bold text-[#00F5D4] transition active:scale-[0.98] hover:bg-[#00F5D4]/10"
              >
                <Plus className="h-4 w-4" />
                Adicionar Jogador
              </button>
            )}
          </div>
        </section>

        {/* Impostor Count & Category Toggle */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2 px-1">
            <UserSearch className="h-4 w-4 text-[#FF6B35]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#19D8F2]">
              2. Definições do Impostor
            </span>
          </div>

          <div className="space-y-3 rounded-3xl border border-[#F8FAFC]/10 bg-[#0F172A] p-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-[#F8FAFC]/85">Número de Impostores</span>
                {!canHaveTwoImpostors && (
                  <span className="text-[11px] font-medium text-[#19D8F2]">
                    2 impostores com 6+ jogadores
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {([1, 2] as const).map((count) => {
                  const disabled = count === 2 && !canHaveTwoImpostors;
                  const selected = effectiveImpostorCount === count;
                  return (
                    <button
                      key={count}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        sound.tap();
                        onChange({ ...config, impostorCount: count });
                      }}
                      className={`min-h-[48px] rounded-2xl border-2 font-display text-sm font-extrabold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35 ${
                        selected
                          ? 'border-[#FF6B35] bg-[#FF6B35]/15 text-[#FF6B35]'
                          : 'border-[#F8FAFC]/10 bg-[#070B14] text-[#F8FAFC]/75'
                      }`}
                    >
                      {count} {count === 1 ? 'Impostor' : 'Impostores'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Toggle: Show category to Impostor */}
            <button
              type="button"
              role="switch"
              aria-checked={config.showCategoryToImpostor}
              onClick={() => {
                sound.tap();
                onChange({
                  ...config,
                  showCategoryToImpostor: !config.showCategoryToImpostor,
                });
              }}
              className="flex min-h-[56px] w-full items-center justify-between gap-3 rounded-2xl border border-[#F8FAFC]/10 bg-[#070B14] px-4 py-3 text-left transition active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                {config.showCategoryToImpostor ? (
                  <Eye className="h-5 w-5 shrink-0 text-[#00F5D4]" />
                ) : (
                  <EyeOff className="h-5 w-5 shrink-0 text-[#F8FAFC]/45" />
                )}
                <div>
                  <p className="text-sm font-bold text-[#F8FAFC]">
                    Mostrar categoria ao Impostor
                  </p>
                  <p className="text-xs text-[#F8FAFC]/60">
                    Ajuda o Impostor a improvisar uma pista credível
                  </p>
                </div>
              </div>
              <span
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                  config.showCategoryToImpostor ? 'bg-[#00F5D4]' : 'bg-[#0F172A] border border-[#F8FAFC]/25'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full transition-transform ${
                    config.showCategoryToImpostor
                      ? 'translate-x-6 bg-[#070B14]'
                      : 'translate-x-1 bg-[#F8FAFC]/60'
                  }`}
                />
              </span>
            </button>
          </div>
        </section>

        {/* Deck Selector */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2 px-1">
            <Layers className="h-4 w-4 text-[#00F5D4]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#19D8F2]">
              3. Baralho de Palavras
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => {
                sound.tap();
                onChange({ ...config, deckId: RANDOM_IMPOSTOR_DECK_ID });
              }}
              className={`flex min-h-[56px] items-center justify-between rounded-2xl border-2 bg-[#0F172A] px-4 py-3 text-left transition active:scale-[0.99] ${
                config.deckId === RANDOM_IMPOSTOR_DECK_ID
                  ? 'border-[#00F5D4] shadow-[0_0_16px_rgba(0,229,196,0.14)]'
                  : 'border-[#F8FAFC]/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <Shuffle className="h-5 w-5 text-[#FF6B35]" />
                <div>
                  <p className="font-display text-sm font-extrabold text-[#F8FAFC]">
                    Baralho Surpresa
                  </p>
                  <p className="text-xs text-[#F8FAFC]/65">
                    Sorteia automaticamente um dos 4 baralhos
                  </p>
                </div>
              </div>
              {config.deckId === RANDOM_IMPOSTOR_DECK_ID && (
                <Check className="h-5 w-5 text-[#00F5D4]" />
              )}
            </button>

            {WORD_DECKS.map((deck) => {
              const selected = config.deckId === deck.id;
              return (
                <button
                  key={deck.id}
                  type="button"
                  onClick={() => {
                    sound.tap();
                    onChange({ ...config, deckId: deck.id });
                  }}
                  className={`flex min-h-[56px] items-center justify-between rounded-2xl border-2 bg-[#0F172A] px-4 py-3 text-left transition active:scale-[0.99] ${
                    selected
                      ? 'border-[#00F5D4] shadow-[0_0_16px_rgba(0,229,196,0.14)]'
                      : 'border-[#F8FAFC]/10'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-display text-sm font-extrabold text-[#F8FAFC]">
                      {deck.name}
                    </p>
                    <p className="truncate text-xs text-[#F8FAFC]/60">
                      {deck.words.slice(0, 3).join(' · ')}
                    </p>
                  </div>
                  {selected && <Check className="h-5 w-5 shrink-0 text-[#00F5D4]" />}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Fixed Bottom Pill CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/8 bg-[#070B14]/92 px-4 pt-3 pb-safe backdrop-blur-xl">
        <div className="mx-auto max-w-lg">
          <button
            type="button"
            onClick={onStart}
            className="flex min-h-[56px] w-full items-center justify-center gap-2.5 rounded-full bg-[#00F5D4] px-6 font-display text-base font-extrabold text-[#070B14] shadow-[0_8px_28px_-4px_rgba(0,245,212,0.42)] transition active:scale-[0.98]"
          >
            <Play className="h-5 w-5 fill-current" />
            Iniciar Distribuição Secreta
          </button>
        </div>
      </div>
    </div>
  );
}
