import { Check, Layers, Play, Shuffle, Smartphone, Sparkles, User } from 'lucide-react';
import { MIXED_WORD_DECK_ID, WORD_DECKS } from '../../data/decks';
import { KiyumiMode } from '../../types';
import { sound } from '../../lib/audio';

interface KiyumiSetupProps {
  mode: KiyumiMode;
  deckId: string;
  roundCount: number;
  bestScore: number;
  onSelectMode: (mode: KiyumiMode) => void;
  onSelectDeck: (deckId: string) => void;
  onStart: () => void;
}

export function KiyumiSetup({
  mode,
  deckId,
  roundCount,
  bestScore,
  onSelectMode,
  onSelectDeck,
  onStart,
}: KiyumiSetupProps) {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-70px)] w-full max-w-lg flex-col justify-between px-4 pb-32 pt-4">
      <div className="space-y-5">
        {/* Session stats pill if played before */}
        {roundCount > 0 && (
          <div className="flex items-center justify-between rounded-2xl border border-[#19D8F2]/25 bg-[#0B1B28] px-4 py-2.5 text-xs">
            <span className="font-semibold text-[#F3FAFA]/80">
              Sessão atual: <strong className="text-[#19D8F2]">{roundCount} rondas</strong>
            </span>
            <span className="font-semibold text-[#F3FAFA]/80">
              Recorde: <strong className="text-[#00E5C4]">{bestScore} acertos</strong>
            </span>
          </div>
        )}

        {/* Mode Selector */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#19D8F2]">
              1. Escolhe o Modo
            </span>
            <span className="rounded-full bg-[#F97316]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#F97316]">
              60s · Reinicia ao acertar
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                sound.tap();
                onSelectMode('testa');
              }}
              className={`flex flex-col items-start rounded-3xl border-2 bg-[#0B1B28] p-4 text-left transition active:scale-[0.98] ${
                mode === 'testa'
                  ? 'border-[#00E5C4] shadow-[0_0_20px_rgba(0,229,196,0.16)]'
                  : 'border-[#F3FAFA]/10 hover:border-[#19D8F2]/40'
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                    mode === 'testa'
                      ? 'bg-[#00E5C4] text-[#07131D]'
                      : 'bg-[#07131D] text-[#19D8F2]'
                  }`}
                >
                  <Smartphone className="h-5 w-5 rotate-90" />
                </span>
                {mode === 'testa' && <Check className="h-5 w-5 text-[#00E5C4]" />}
              </div>
              <h3 className="font-display mt-3 text-base font-extrabold text-[#F3FAFA]">
                Modo Testa
              </h3>
              <p className="mt-1 text-xs leading-snug text-[#F3FAFA]/70">
                Celular na testa. Inclina ou toca para marcar acerto ou passar.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.tap();
                onSelectMode('palco');
              }}
              className={`flex flex-col items-start rounded-3xl border-2 bg-[#0B1B28] p-4 text-left transition active:scale-[0.98] ${
                mode === 'palco'
                  ? 'border-[#00E5C4] shadow-[0_0_20px_rgba(0,229,196,0.16)]'
                  : 'border-[#F3FAFA]/10 hover:border-[#19D8F2]/40'
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                    mode === 'palco'
                      ? 'bg-[#00E5C4] text-[#07131D]'
                      : 'bg-[#07131D] text-[#F97316]'
                  }`}
                >
                  <User className="h-5 w-5" />
                </span>
                {mode === 'palco' && <Check className="h-5 w-5 text-[#00E5C4]" />}
              </div>
              <h3 className="font-display mt-3 text-base font-extrabold text-[#F3FAFA]">
                Modo Palco
              </h3>
              <p className="mt-1 text-xs leading-snug text-[#F3FAFA]/70">
                Lê a palavra e representa em pé para o grupo adivinhar.
              </p>
            </button>
          </div>
        </section>

        {/* Cultural Deck Selector */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2 px-1">
            <Layers className="h-4 w-4 text-[#00E5C4]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#19D8F2]">
              2. Baralho Moçambicano
            </span>
          </div>

          <div className="space-y-2.5">
            {WORD_DECKS.map((deck) => {
              const selected = deckId === deck.id;
              return (
                <button
                  key={deck.id}
                  type="button"
                  onClick={() => {
                    sound.tap();
                    onSelectDeck(deck.id);
                  }}
                  className={`w-full rounded-2xl border-2 bg-[#0B1B28] p-3.5 text-left transition active:scale-[0.99] ${
                    selected
                      ? 'border-[#00E5C4] shadow-[0_0_18px_rgba(0,229,196,0.14)]'
                      : 'border-[#F3FAFA]/10 hover:border-[#19D8F2]/35'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display text-base font-extrabold text-[#F3FAFA]">
                          {deck.name}
                        </h4>
                        <span className="rounded-full bg-[#07131D] px-2 py-0.5 text-[10px] font-bold text-[#19D8F2]">
                          {deck.words.length} palavras
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-[#F3FAFA]/65">
                        Ex.: {deck.words.slice(0, 3).join(' · ')}
                      </p>
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

            {/* Mixed Deck Option */}
            <button
              type="button"
              onClick={() => {
                sound.tap();
                onSelectDeck(MIXED_WORD_DECK_ID);
              }}
              className={`w-full rounded-2xl border-2 bg-[#0B1B28] p-3.5 text-left transition active:scale-[0.99] ${
                deckId === MIXED_WORD_DECK_ID
                  ? 'border-[#00E5C4] shadow-[0_0_18px_rgba(0,229,196,0.14)]'
                  : 'border-[#F3FAFA]/10 hover:border-[#19D8F2]/35'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F97316]/15 text-[#F97316]">
                    <Shuffle className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-base font-extrabold text-[#F3FAFA]">
                        Mistura Total
                      </h4>
                      <span className="rounded-full bg-[#07131D] px-2 py-0.5 text-[10px] font-bold text-[#F97316]">
                        {WORD_DECKS.reduce((acc, d) => acc + d.words.length, 0)} palavras
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-[#F3FAFA]/65">
                      Todos os baralhos misturados para energia máxima
                    </p>
                  </div>
                </div>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    deckId === MIXED_WORD_DECK_ID
                      ? 'bg-[#00E5C4] text-[#07131D]'
                      : 'border border-[#F3FAFA]/20 bg-[#07131D]'
                  }`}
                >
                  {deckId === MIXED_WORD_DECK_ID && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </span>
              </div>
            </button>
          </div>
        </section>
      </div>

      {/* Fixed Bottom Thumb CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#F3FAFA]/10 bg-[#07131D]/95 px-4 pt-3 pb-safe backdrop-blur-md">
        <div className="mx-auto max-w-lg">
          <button
            type="button"
            onClick={onStart}
            className="flex min-h-[56px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[#00E5C4] px-6 font-display text-lg font-extrabold text-[#07131D] shadow-[0_8px_30px_rgba(0,229,196,0.28)] transition active:scale-[0.98]"
          >
            <Sparkles className="h-5 w-5" />
            Começar Ronda (60s)
            <Play className="h-4 w-4 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}
