import { useCallback, useRef, useState } from 'react';
import { getDeckWords, WORD_DECKS } from '../../data/decks';
import { KiyumiMode, KiyumiRoundRecord, KiyumiRoundWord } from '../../types';
import { shuffleArray } from '../../lib/shuffle';
import { requestMotionPermissionIfNeeded } from '../../hooks/useDeviceTilt';
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
  const [mode, setMode] = useState<KiyumiMode>('testa');
  const [deckId, setDeckId] = useState<string>(WORD_DECKS[0].id);
  const [history, setHistory] = useState<KiyumiRoundRecord[]>([]);

  // Non-repeating shuffled word pool per deck
  const poolRef = useRef<{ deckId: string; queue: string[] }>({ deckId: '', queue: [] });

  const getNextWord = useCallback(() => {
    const deck = getDeckWords(deckId);
    if (poolRef.current.deckId !== deckId || poolRef.current.queue.length === 0) {
      poolRef.current = {
        deckId,
        queue: shuffleArray(deck.words),
      };
    }
    const next = poolRef.current.queue.pop() ?? deck.words[0];
    return next;
  }, [deckId]);

  const deckInfo = getDeckWords(deckId);
  const bestScore = history.reduce((max, r) => Math.max(max, r.score), 0);
  const lastRecord = history[history.length - 1] ?? null;

  const handleStartRound = async () => {
    sound.unlock();
    sound.tap();
    if (mode === 'testa') {
      await requestMotionPermissionIfNeeded();
    }
    setPhase('countdown');
  };

  const handleFinishRound = useCallback(
    (items: KiyumiRoundWord[]) => {
      const score = items.filter((i) => i.status === 'correct').length;
      const passed = items.filter((i) => i.status === 'passed').length;
      const record: KiyumiRoundRecord = {
        roundNumber: history.length + 1,
        deckName: deckInfo.name,
        mode,
        score,
        passed,
        items,
      };
      setHistory((prev) => [...prev, record]);
      setPhase('summary');
    },
    [history.length, deckInfo.name, mode],
  );

  const handleAbortRound = () => {
    onRequestConfirm({
      title: 'Terminar esta ronda?',
      message: 'A ronda de 30 segundos em curso será cancelada e voltarás à configuração do Kiyumi.',
      confirmLabel: 'Terminar Ronda',
      onConfirm: () => setPhase('setup'),
    });
  };

  if (phase === 'countdown') {
    return (
      <CountdownOverlay
        title={`Kiyumi · ${mode === 'testa' ? 'Modo Testa' : 'Modo Palco'}`}
        instruction={
          mode === 'testa'
            ? 'Coloca o celular na testa virado para o grupo!'
            : 'Prepara-te! Lê a palavra em segredo e representa.'
        }
        onComplete={() => setPhase('playing')}
        onCancel={() => setPhase('setup')}
      />
    );
  }

  if (phase === 'playing') {
    return (
      <KiyumiPlay
        mode={mode}
        deckName={deckInfo.name}
        getNextWord={getNextWord}
        onFinish={handleFinishRound}
        onAbort={handleAbortRound}
      />
    );
  }

  if (phase === 'summary' && lastRecord) {
    return (
      <KiyumiSummary
        record={lastRecord}
        bestScore={bestScore}
        onNewRound={handleStartRound}
        onChangeSetup={() => setPhase('setup')}
      />
    );
  }

  return (
    <KiyumiSetup
      mode={mode}
      deckId={deckId}
      roundCount={history.length}
      bestScore={bestScore}
      onSelectMode={setMode}
      onSelectDeck={setDeckId}
      onStart={handleStartRound}
    />
  );
}
