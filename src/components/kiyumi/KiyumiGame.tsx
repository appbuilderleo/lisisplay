import { useCallback, useRef, useState } from 'react';
import { getDeckWords, WORD_DECKS } from '../../data/decks';
import { KiyumiMode, KiyumiRoundRecord, KiyumiRoundWord } from '../../types';
import { shuffleArray } from '../../lib/shuffle';
import { sound } from '../../lib/audio';
import { CountdownOverlay } from '../ui/CountdownOverlay';
import { KiyumiSetup } from './KiyumiSetup';
import { KiyumiPlay } from './KiyumiPlay';
import { KiyumiSummary } from './KiyumiSummary';

type KiyumiPhase = 'setup' | 'countdown' | 'playing' | 'summary';

interface KiyumiGameProps {
  onRequestConfirm: (opts: {
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  }) => void;
}

export function KiyumiGame({ onRequestConfirm }: KiyumiGameProps) {
  const [phase, setPhase] = useState<KiyumiPhase>('setup');
  const [mode, setMode] = useState<KiyumiMode>('mimica');
  const [deckId, setDeckId] = useState<string>(WORD_DECKS[0].id);
  const [history, setHistory] = useState<KiyumiRoundRecord[]>([]);
  const [activeInitial, setActiveInitial] = useState<{ word: string; remaining: number } | null>(
    null,
  );
  const [remainingWords, setRemainingWords] = useState<number>(() =>
    getDeckWords(WORD_DECKS[0].id).words.length,
  );

  // Pool de palavras sem repetição: quando chega a 0, o jogo termina e mostra a pontuação
  const poolRef = useRef<{ deckId: string; queue: string[]; initialized: boolean }>({
    deckId: WORD_DECKS[0].id,
    queue: [],
    initialized: false,
  });

  const resetPoolForDeck = useCallback((targetDeckId: string, clearHistory = false) => {
    const deck = getDeckWords(targetDeckId);
    const shuffled = shuffleArray(deck.words);
    poolRef.current = {
      deckId: targetDeckId,
      queue: shuffled,
      initialized: true,
    };
    setRemainingWords(shuffled.length);
    if (clearHistory) {
      setHistory([]);
    }
  }, []);

  const handleSelectDeck = (nextDeckId: string) => {
    setDeckId(nextDeckId);
    resetPoolForDeck(nextDeckId, true);
  };

  const drawNextWord = useCallback((): { word: string | null; remaining: number } => {
    if (!poolRef.current.initialized || poolRef.current.deckId !== deckId) {
      const deck = getDeckWords(deckId);
      poolRef.current = {
        deckId,
        queue: shuffleArray(deck.words),
        initialized: true,
      };
    }

    if (poolRef.current.queue.length === 0) {
      setRemainingWords(0);
      return { word: null, remaining: 0 };
    }

    const next = poolRef.current.queue.pop() ?? null;
    const rem = poolRef.current.queue.length;
    setRemainingWords(rem);
    return { word: next, remaining: rem };
  }, [deckId]);

  const deckInfo = getDeckWords(deckId);
  const bestScore = history.reduce((max, r) => Math.max(max, r.score), 0);
  const totalPoints = history.reduce((sum, r) => sum + r.roundPoints, 0);
  const totalHits = history.reduce((sum, r) => sum + r.score, 0);
  const lastRecord = history[history.length - 1] ?? null;

  const handleStartRound = () => {
    sound.unlock();
    sound.tap();
    // Se vier do setup com o baralho ainda não iniciado ou já esgotado, inicia novo jogo limpo
    if (
      !poolRef.current.initialized ||
      poolRef.current.deckId !== deckId ||
      poolRef.current.queue.length === 0
    ) {
      resetPoolForDeck(deckId, true);
    }
    setPhase('countdown');
  };

  const handleRestartDeck = () => {
    sound.unlock();
    sound.tap();
    resetPoolForDeck(deckId, true);
    setPhase('countdown');
  };

  const handleCountdownComplete = useCallback(() => {
    const first = drawNextWord();
    if (!first.word) {
      setPhase('summary');
      return;
    }
    setActiveInitial({ word: first.word, remaining: first.remaining });
    setPhase('playing');
  }, [drawNextWord]);

  const handleFinishRound = useCallback(
    (items: KiyumiRoundWord[], deckExhausted: boolean) => {
      const score = items.filter((i) => i.status === 'correct').length;
      const passed = items.filter((i) => i.status === 'passed').length;
      // Regra Kiyumi: cada acerto soma +1; se terminar os 30s com 0 acertos (sem esgotar o baralho), perde -1
      const roundPoints = score > 0 ? score : deckExhausted ? 0 : -1;
      const noWordsLeft = deckExhausted || poolRef.current.queue.length === 0;

      const record: KiyumiRoundRecord = {
        roundNumber: history.length + 1,
        deckName: deckInfo.name,
        mode,
        score,
        roundPoints,
        passed,
        items,
        deckExhausted: noWordsLeft,
      };
      setHistory((prev) => [...prev, record]);
      setRemainingWords(poolRef.current.queue.length);
      setPhase('summary');
    },
    [history.length, deckInfo.name, mode],
  );

  const handleAbortRound = () => {
    onRequestConfirm({
      title: 'Terminar esta ronda?',
      message:
        'A ronda de 30 segundos em curso será cancelada e voltarás à configuração do Kiyumi.',
      confirmLabel: 'Terminar Ronda',
      onConfirm: () => setPhase('setup'),
    });
  };

  if (phase === 'countdown') {
    return (
      <CountdownOverlay
        title={`Kiyumi · ${mode === 'mimica' ? 'Mímica / Palco' : 'Modo Descreve'}`}
        instruction={
          mode === 'mimica'
            ? 'Só tu olhas para a palavra! Prepara-te para representar em pé com gestos.'
            : 'Prepara-te! Explica a palavra por voz sem dizer nada escrito no ecrã.'
        }
        onComplete={handleCountdownComplete}
        onCancel={() => setPhase('setup')}
      />
    );
  }

  if (phase === 'playing' && activeInitial) {
    return (
      <KiyumiPlay
        mode={mode}
        deckName={deckInfo.name}
        initialWord={activeInitial.word}
        remainingAfterInitial={activeInitial.remaining}
        getNextWord={drawNextWord}
        onFinish={handleFinishRound}
        onAbort={handleAbortRound}
      />
    );
  }

  if (phase === 'summary' && lastRecord) {
    return (
      <KiyumiSummary
        record={lastRecord}
        totalPoints={totalPoints}
        totalHits={totalHits}
        bestScore={bestScore}
        remainingWords={remainingWords}
        onNewRound={() => {
          sound.unlock();
          sound.tap();
          setPhase('countdown');
        }}
        onRestartDeck={handleRestartDeck}
        onChangeSetup={() => setPhase('setup')}
      />
    );
  }

  return (
    <KiyumiSetup
      mode={mode}
      deckId={deckId}
      roundCount={history.length}
      totalPoints={totalPoints}
      bestScore={bestScore}
      onSelectMode={setMode}
      onSelectDeck={handleSelectDeck}
      onStart={handleStartRound}
    />
  );
}
