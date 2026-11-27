export type GameId = 'kiyumi' | 'impostor' | 'zoe';

export type AppView = 'splash' | 'hub' | GameId;

export type RulesTab = 'geral' | GameId;

export interface WordDeck {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  words: string[];
}

export interface ZoeDeck {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  questions: string[];
}

export type KiyumiMode = 'mimica' | 'descreve';

export interface KiyumiRoundWord {
  word: string;
  status: 'correct' | 'passed';
}

export interface KiyumiRoundRecord {
  roundNumber: number;
  deckName: string;
  mode: KiyumiMode;
  score: number;
  roundPoints: number;
  passed: number;
  items: KiyumiRoundWord[];
  deckExhausted?: boolean;
}

export interface ImpostorPlayer {
  id: string;
  name: string;
}

export interface ImpostorConfig {
  players: ImpostorPlayer[];
  deckId: string;
  impostorCount: 1 | 2;
  showCategoryToImpostor: boolean;
}

export interface ImpostorMatch {
  secretWord: string;
  categoryName: string;
  deckId: string;
  impostorIds: string[];
  firstSpeakerId: string;
  lastChanceOptions: string[];
}

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  onConfirm: () => void;
}
