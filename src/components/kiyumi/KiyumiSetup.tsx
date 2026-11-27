import { Check, Layers, MessageCircle, Play, Shuffle, Sparkles, User } from 'lucide-react';
import { MIXED_WORD_DECK_ID, WORD_DECKS } from '../../data/decks';
import { KiyumiMode } from '../../types';
import { sound } from '../../lib/audio';
import { GameIntroBanner } from '../ui/GameIntroBanner';

interface KiyumiSetupProps {
  mode: KiyumiMode;
  deckId: string;
  roundCount: number;
  totalPoints: number;
  bestScore: number;
  onSelectMode: (mode: KiyumiMode) => void;
  onSelectDeck: (deckId: string) => void;
  onStart: () => void;
}

export function KiyumiSetup({
  mode,
  deckId,
  roundCount,
  totalPoints,
  bestScore,
  onSelectMode,
  onSelectDeck,
  onStart,
}: KiyumiSetupProps) {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-70px)] w-full max-w-[440px] flex-col justify-between px-4 pb-32 pt-4">
      <div className="space-y-4">
        {/* Instrução do Modo Roda na tela inicial do Kiyumi */}
        <GameIntroBanner
          badge="Modo Roda · Como Jogar Kiyumi"
          summary="1 celular na mão em rondas de 30s: acertou soma +1 e reinicia o tempo!"
          steps={[
            'Modo Mímica / Palco: 1 jogador vê a palavra em segredo e representa em pé com gestos.',
            'Modo Descreve: explica por voz sem dizer nenhuma palavra escrita no ecrã.',
            'Acertou (+1) reinicia os 30s; Passou mantém a contagem. 0 acertos = -1 ponto.',
          ]}
        />

        {/* Session stats pill if played before */}
        {roundCount > 0 && (
          <div className="glass-card flex flex-wrap items-center justify-between gap-2 rounded-2xl border-[#00F5D4]/25 px-4 py-2.5 text-xs">
            <span className="font-semibold text-[#F8FAFC]/80">
              Rondas: <strong className="text-[#19D8F2]">{roundCount}</strong>
            </span>
            <span className="font-semibold text-[#F8FAFC]/80">
              Total:{' '}
              <strong className={totalPoints < 0 ? 'text-[#FF6B35]' : 'text-[#00F5D4]'}>
                {totalPoints > 0 ? `+${totalPoints}` : totalPoints} pts
              </strong>
            </span>
            <span className="font-semibold text-[#F8FAFC]/80">
              Recorde: <strong className="text-[#00F5D4]">{bestScore}</strong>
            </span>
          </div>
        )}

        {/* Mode Selector: Modo Mímica / Palco & Modo Descreve (both Vertical) */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#19D8F2]">
              1. Escolhe o Modo
            </span>
            <span className="rounded-full bg-[#FF6B35]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#FF6B35]">
              30s · Reinicia ao acertar
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                sound.tap();
                onSelectMode('mimica');
              }}
              className={`flex flex-col items-start rounded-3xl border-2 bg-[#0F172A] p-4 text-left transition active:scale-[0.98] ${
                mode === 'mimica'
                  ? 'border-[#00F5D4] shadow-[0_0_20px_rgba(0,229,196,0.16)]'
                  : 'border-[#F8FAFC]/10 hover:border-[#19D8F2]/40'
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                    mode === 'mimica'
                      ? 'bg-[#00F5D4] text-[#070B14]'
                      : 'bg-[#070B14] text-[#19D8F2]'
                  }`}
                >
                  <User className="h-5 w-5" />
                </span>
                {mode === 'mimica' && <Check className="h-5 w-5 text-[#00F5D4]" />}
              </div>
              <h3 className="font-display mt-3 text-base font-extrabold text-[#F8FAFC]">
                Mímica / Palco
              </h3>
              <p className="mt-1 text-xs leading-snug text-[#F8FAFC]/70">
                1 jogador vê a palavra em segredo e atua com gestos para o grupo adivinhar.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.tap();
                onSelectMode('descreve');
              }}
              className={`flex flex-col items-start rounded-3xl border-2 bg-[#0F172A] p-4 text-left transition active:scale-[0.98] ${
                mode === 'descreve'
                  ? 'border-[#00F5D4] shadow-[0_0_20px_rgba(0,229,196,0.16)]'
                  : 'border-[#F8FAFC]/10 hover:border-[#19D8F2]/40'
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                    mode === 'descreve'
                      ? 'bg-[#00F5D4] text-[#070B14]'
                      : 'bg-[#070B14] text-[#FF6B35]'
                  }`}
                >
                  <MessageCircle className="h-5 w-5" />
                </span>
                {mode === 'descreve' && <Check className="h-5 w-5 text-[#00F5D4]" />}
              </div>
              <h3 className="font-display mt-3 text-base font-extrabold text-[#F8FAFC]">
                Modo Descreve
              </h3>
              <p className="mt-1 text-xs leading-snug text-[#F8FAFC]/70">
                Explica a palavra por voz sem dizer nenhuma palavra escrita no ecrã.
              </p>
            </button>
          </div>

          <p className="rounded-2xl border border-[#F8FAFC]/10 bg-[#0F172A]/70 px-3.5 py-2 text-[11px] font-medium text-[#F8FAFC]/75">
            <strong className="text-[#00F5D4]">Acertou:</strong> +1 ponto e reinicia os 30s ·{' '}
            <strong className="text-[#FF6B35]">Passou:</strong> tempo continua (0 acertos = -1 pt).
          </p>
        </section>

        {/* Cultural Deck Selector */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2 px-1">
            <Layers className="h-4 w-4 text-[#00F5D4]" />
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
                  className={`w-full rounded-2xl border-2 bg-[#0F172A] p-3.5 text-left transition active:scale-[0.99] ${
                    selected
                      ? 'border-[#00F5D4] shadow-[0_0_18px_rgba(0,229,196,0.14)]'
                      : 'border-[#F8FAFC]/10 hover:border-[#19D8F2]/35'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display text-base font-extrabold text-[#F8FAFC]">
                          {deck.name}
                        </h4>
                        <span className="rounded-full bg-[#070B14] px-2 py-0.5 text-[10px] font-bold text-[#19D8F2]">
                          {deck.words.length} palavras
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-[#F8FAFC]/65">
                        Ex.: {deck.words.slice(0, 3).join(' · ')}
                      </p>
                    </div>
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                        selected
                          ? 'bg-[#00F5D4] text-[#070B14]'
                          : 'border border-[#F8FAFC]/20 bg-[#070B14]'
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
              className={`w-full rounded-2xl border-2 bg-[#0F172A] p-3.5 text-left transition active:scale-[0.99] ${
                deckId === MIXED_WORD_DECK_ID
                  ? 'border-[#00F5D4] shadow-[0_0_18px_rgba(0,229,196,0.14)]'
                  : 'border-[#F8FAFC]/10 hover:border-[#19D8F2]/35'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FF6B35]/15 text-[#FF6B35]">
                    <Shuffle className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-base font-extrabold text-[#F8FAFC]">
                        Mistura Total
                      </h4>
                      <span className="rounded-full bg-[#070B14] px-2 py-0.5 text-[10px] font-bold text-[#FF6B35]">
                        {WORD_DECKS.reduce((acc, d) => acc + d.words.length, 0)} palavras
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-[#F8FAFC]/65">
                      Todos os baralhos misturados para energia máxima
                    </p>
                  </div>
                </div>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    deckId === MIXED_WORD_DECK_ID
                      ? 'bg-[#00F5D4] text-[#070B14]'
                      : 'border border-[#F8FAFC]/20 bg-[#070B14]'
                  }`}
                >
                  {deckId === MIXED_WORD_DECK_ID && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </span>
              </div>
            </button>
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
            <Sparkles className="h-5 w-5" />
            Começar Ronda (30s)
            <Play className="h-4 w-4 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}
