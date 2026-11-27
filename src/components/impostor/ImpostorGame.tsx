import { useEffect, useRef, useState } from 'react';
import { WORD_DECKS } from '../../data/decks';
import { ImpostorConfig, ImpostorMatch, ImpostorPlayer } from '../../types';
import { loadImpostorPlayers, saveImpostorPlayers } from '../../lib/storage';
import { pickRandom, shuffleArray } from '../../lib/shuffle';
import { sound } from '../../lib/audio';
import { useWakeLock } from '../../hooks/useWakeLock';
import { ImpostorSetup, RANDOM_IMPOSTOR_DECK_ID } from './ImpostorSetup';
import { ImpostorDistribute } from './ImpostorDistribute';
import { ImpostorDebate } from './ImpostorDebate';
import { ImpostorVote } from './ImpostorVote';
import { ImpostorLastChance } from './ImpostorLastChance';
import { ImpostorOutcome, ImpostorResult } from './ImpostorResult';

type ImpostorPhase = 'setup' | 'distribute' | 'debate' | 'vote' | 'last-chance' | 'result';

interface ImpostorGameProps {
  onActiveChange?: (active: boolean) => void;
}

export function ImpostorGame({ onActiveChange }: ImpostorGameProps) {
  const [phase, setPhase] = useState<ImpostorPhase>('setup');
  const [config, setConfig] = useState<ImpostorConfig>(() => ({
    players: loadImpostorPlayers(),
    deckId: RANDOM_IMPOSTOR_DECK_ID,
    impostorCount: 1,
    showCategoryToImpostor: true,
  }));

  const [sanitizedPlayers, setSanitizedPlayers] = useState<ImpostorPlayer[]>(config.players);
  const [match, setMatch] = useState<ImpostorMatch | null>(null);
  const [accusedId, setAccusedId] = useState<string | null>(null);
  const [guessedWord, setGuessedWord] = useState<string | undefined>(undefined);
  const [outcome, setOutcome] = useState<ImpostorOutcome>('citizens-win');
  const usedSecretWordsRef = useRef<Record<string, Set<string>>>({});

  const isInMatch = phase !== 'setup' && phase !== 'result';
  useWakeLock(phase !== 'setup');

  useEffect(() => {
    onActiveChange?.(isInMatch);
    return () => onActiveChange?.(false);
  }, [isInMatch, onActiveChange]);

  useEffect(() => {
    saveImpostorPlayers(config.players);
  }, [config.players]);

  const startNewMatch = () => {
    sound.unlock();
    sound.go();

    const cleanedPlayers: ImpostorPlayer[] = config.players.map((p, idx) => ({
      ...p,
      name: p.name.trim() || `Jogador ${idx + 1}`,
    }));
    setSanitizedPlayers(cleanedPlayers);
    if (cleanedPlayers.some((p, i) => p.name !== config.players[i].name)) {
      setConfig((prev) => ({ ...prev, players: cleanedPlayers }));
    }

    const chosenDeck =
      config.deckId === RANDOM_IMPOSTOR_DECK_ID
        ? pickRandom(WORD_DECKS)
        : WORD_DECKS.find((d) => d.id === config.deckId) ?? WORD_DECKS[0];

    // Evitar repetir palavras secretas já jogadas na sessão
    if (!usedSecretWordsRef.current[chosenDeck.id]) {
      usedSecretWordsRef.current[chosenDeck.id] = new Set<string>();
    }
    const usedSet = usedSecretWordsRef.current[chosenDeck.id];
    let availableSecrets = chosenDeck.words.filter((w) => !usedSet.has(w));
    if (availableSecrets.length === 0) {
      usedSet.clear();
      availableSecrets = [...chosenDeck.words];
    }

    const secretWord = pickRandom(availableSecrets);
    usedSet.add(secretWord);
    const distractors = shuffleArray(chosenDeck.words.filter((w) => w !== secretWord)).slice(0, 3);
    const lastChanceOptions = shuffleArray([secretWord, ...distractors]);

    const impostorTotal = cleanedPlayers.length >= 6 ? config.impostorCount : 1;
    const shuffledPlayers = shuffleArray(cleanedPlayers);
    const impostorIds = shuffledPlayers.slice(0, impostorTotal).map((p) => p.id);
    const firstSpeakerId = pickRandom(cleanedPlayers).id;

    setMatch({
      secretWord,
      categoryName: chosenDeck.name,
      deckId: chosenDeck.id,
      impostorIds,
      firstSpeakerId,
      lastChanceOptions,
    });
    setAccusedId(null);
    setGuessedWord(undefined);
    setPhase('distribute');
  };

  const handleAccuse = (playerId: string) => {
    if (!match) return;
    setAccusedId(playerId);

    if (match.impostorIds.includes(playerId)) {
      setPhase('last-chance');
    } else {
      setOutcome('wrong-accusation');
      setPhase('result');
    }
  };

  const handleLastChanceGuess = (word: string) => {
    if (!match) return;
    setGuessedWord(word);
    if (word === match.secretWord) {
      setOutcome('impostor-guessed');
    } else {
      setOutcome('citizens-win');
    }
    setPhase('result');
  };

  const accusedPlayer =
    sanitizedPlayers.find((p) => p.id === accusedId) ?? sanitizedPlayers[0];

  if (phase === 'distribute' && match) {
    return (
      <ImpostorDistribute
        players={sanitizedPlayers}
        match={match}
        showCategoryToImpostor={config.showCategoryToImpostor}
        onComplete={() => setPhase('debate')}
      />
    );
  }

  if (phase === 'debate' && match) {
    return (
      <ImpostorDebate
        players={sanitizedPlayers}
        match={match}
        onGoToVote={() => setPhase('vote')}
      />
    );
  }

  if (phase === 'vote' && match) {
    return <ImpostorVote players={sanitizedPlayers} onAccuse={handleAccuse} />;
  }

  if (phase === 'last-chance' && match && accusedPlayer) {
    return (
      <ImpostorLastChance
        caughtImpostor={accusedPlayer}
        match={match}
        onGuess={handleLastChanceGuess}
      />
    );
  }

  if (phase === 'result' && match && accusedPlayer) {
    return (
      <ImpostorResult
        outcome={outcome}
        players={sanitizedPlayers}
        match={match}
        accusedPlayer={accusedPlayer}
        guessedWord={guessedWord}
        onPlayAgain={startNewMatch}
        onEditSetup={() => setPhase('setup')}
      />
    );
  }

  return (
    <ImpostorSetup
      config={config}
      onChange={setConfig}
      onStart={startNewMatch}
    />
  );
}
