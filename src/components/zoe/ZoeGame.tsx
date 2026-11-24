import { useState } from 'react';
import { getZoeQuestions, ZOE_DECKS } from '../../data/decks';
import { shuffleArray } from '../../lib/shuffle';
import { ZoeSetup } from './ZoeSetup';
import { ZoePlay } from './ZoePlay';

export function ZoeGame() {
  const [phase, setPhase] = useState<'setup' | 'playing'>('setup');
  const [deckId, setDeckId] = useState<string>(ZOE_DECKS[0].id);
  const [shuffledQuestions, setShuffledQuestions] = useState<string[]>([]);
  const [deckName, setDeckName] = useState<string>(ZOE_DECKS[0].name);

  const launchDeck = (targetDeckId: string) => {
    const info = getZoeQuestions(targetDeckId);
    setDeckName(info.name);
    setShuffledQuestions(shuffleArray(info.questions));
    setPhase('playing');
  };

  if (phase === 'playing') {
    return (
      <ZoePlay
        deckName={deckName}
        questions={shuffledQuestions}
        onReshuffle={() => {
          const info = getZoeQuestions(deckId);
          setShuffledQuestions(shuffleArray(info.questions));
        }}
        onChangeDeck={() => setPhase('setup')}
      />
    );
  }

  return (
    <ZoeSetup
      deckId={deckId}
      onSelectDeck={setDeckId}
      onStart={() => launchDeck(deckId)}
    />
  );
}
