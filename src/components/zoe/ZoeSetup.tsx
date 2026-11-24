import { Briefcase, Check, HandMetal, PartyPopper, Play, Shuffle, Zap } from 'lucide-react';
import { ALL_ZOE_DECK_ID, ZOE_DECKS } from '../../data/decks';
import { sound } from '../../lib/audio';

interface ZoeSetupProps {
  deckId: string;
  onSelectDeck: (deckId: string) => void;
  onStart: () => void;
}

const DECK_ICONS: Record<string, typeof PartyPopper> = {
  'amigos-festas': PartyPopper,
  'trabalho-escola': Briefcase,
  'situacoes-improvaveis': Zap,
};

export function ZoeSetup({ deckId, onSelectDeck, onStart }: ZoeSetupProps) {
  const totalQuestions = ZOE_DECKS.reduce((sum, d) => sum + d.questions.length, 0);

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-70px)] w-full max-w-lg flex-col justify-between px-4 pb-32 pt-4">
      <div className="space-y-4">
        <div className="rounded-3xl border border-[#19D8F2]/30 bg-[#0B1B28] p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#19D8F2]/15 text-[#19D8F2]">
              <HandMetal className="h-6 w-6" />
            </span>
            <div>
              <h2 className="font-display text-xl font-extrabold text-[#F3FAFA]">
                Quem na Roda?
              </h2>
              <p className="text-xs text-[#19D8F2]">
                Lê a pergunta, conta 3-2-1 e apontem todos ao mesmo tempo!
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <p className="px-1 text-xs font-bold uppercase tracking-widest text-[#19D8F2]">
            Escolhe o Baralho Temático
          </p>

          {ZOE_DECKS.map((deck) => {
            const selected = deckId === deck.id;
            const Icon = DECK_ICONS[deck.id] ?? PartyPopper;
            return (
              <button
                key={deck.id}
                type="button"
                onClick={() => {
                  sound.tap();
                  onSelectDeck(deck.id);
                }}
                className={`w-full rounded-3xl border-2 bg-[#0B1B28] p-4 text-left transition active:scale-[0.99] ${
                  selected
                    ? 'border-[#00E5C4] shadow-[0_0_20px_rgba(0,229,196,0.15)]'
                    : 'border-[#F3FAFA]/10 hover:border-[#19D8F2]/35'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                        selected
                          ? 'bg-[#00E5C4] text-[#07131D]'
                          : 'bg-[#07131D] text-[#19D8F2]'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-base font-extrabold text-[#F3FAFA]">
                          {deck.name}
                        </h3>
                        <span className="rounded-full bg-[#07131D] px-2 py-0.5 text-[10px] font-bold text-[#19D8F2]">
                          {deck.questions.length} cartas
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#F3FAFA]/70">{deck.subtitle}</p>
                      <p className="mt-1.5 line-clamp-1 text-[11px] italic text-[#F3FAFA]/55">
                        &ldquo;{deck.questions[0]}&rdquo;
                      </p>
                    </div>
                  </div>
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      selected
                        ? 'bg-[#00E5C4] text-[#07131D]'
                        : 'border border-[#F3FAFA]/20 bg-[#07131D]'
                    }`}
                  >
                    {selected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </span>
                </div>
              </button>
            );
          })}

          {/* All Mixed Deck */}
          <button
            type="button"
            onClick={() => {
              sound.tap();
              onSelectDeck(ALL_ZOE_DECK_ID);
            }}
            className={`w-full rounded-3xl border-2 bg-[#0B1B28] p-4 text-left transition active:scale-[0.99] ${
              deckId === ALL_ZOE_DECK_ID
                ? 'border-[#00E5C4] shadow-[0_0_20px_rgba(0,229,196,0.15)]'
                : 'border-[#F3FAFA]/10 hover:border-[#19D8F2]/35'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                    deckId === ALL_ZOE_DECK_ID
                      ? 'bg-[#00E5C4] text-[#07131D]'
                      : 'bg-[#07131D] text-[#F97316]'
                  }`}
                >
                  <Shuffle className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-extrabold text-[#F3FAFA]">
                      Todos os Temas
                    </h3>
                    <span className="rounded-full bg-[#07131D] px-2 py-0.5 text-[10px] font-bold text-[#F97316]">
                      {totalQuestions} cartas
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-[#F3FAFA]/70">
                    Mistura completa para sessões longas sem pausa
                  </p>
                </div>
              </div>
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  deckId === ALL_ZOE_DECK_ID
                    ? 'bg-[#00E5C4] text-[#07131D]'
                    : 'border border-[#F3FAFA]/20 bg-[#07131D]'
                }`}
              >
                {deckId === ALL_ZOE_DECK_ID && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Thumb CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#F3FAFA]/10 bg-[#07131D]/95 px-4 pt-3 pb-safe backdrop-blur-md">
        <div className="mx-auto max-w-lg">
          <button
            type="button"
            onClick={() => {
              sound.unlock();
              sound.go();
              onStart();
            }}
            className="flex min-h-[56px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[#00E5C4] px-6 font-display text-lg font-extrabold text-[#07131D] shadow-[0_8px_28px_rgba(0,229,196,0.28)] transition active:scale-[0.98]"
          >
            <Play className="h-5 w-5 fill-current" />
            Começar Zoe
          </button>
        </div>
      </div>
    </div>
  );
}
