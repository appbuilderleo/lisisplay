import { CubeSolveRecord, GameId, ImpostorPlayer } from '../types';

const SOUND_KEY = 'lisis_play_sound_enabled';
const IMPOSTOR_PLAYERS_KEY = 'lisis_play_impostor_players';
const FAVORITES_KEY = 'lisis_play_favorite_games';
const CUBE_HISTORY_KEY = 'lisis_play_cube_history';
const CUBE_PLAYER_NAME_KEY = 'lisis_play_cube_player_name';

export const DEFAULT_IMPOSTOR_PLAYERS: ImpostorPlayer[] = [
  { id: 'p1', name: 'Amina' },
  { id: 'p2', name: 'Beto' },
  { id: 'p3', name: 'Célia' },
  { id: 'p4', name: 'Dércio' },
  { id: 'p5', name: 'Érica' },
];

export function loadSoundPreference(): boolean {
  try {
    const raw = localStorage.getItem(SOUND_KEY);
    if (raw === null) return true;
    return raw === 'true';
  } catch {
    return true;
  }
}

export function saveSoundPreference(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_KEY, String(enabled));
  } catch {
    // Ignore storage errors
  }
}

export function loadImpostorPlayers(): ImpostorPlayer[] {
  try {
    const raw = localStorage.getItem(IMPOSTOR_PLAYERS_KEY);
    if (!raw) return DEFAULT_IMPOSTOR_PLAYERS;
    const parsed = JSON.parse(raw);
    if (
      Array.isArray(parsed) &&
      parsed.length >= 3 &&
      parsed.length <= 10 &&
      parsed.every((p) => typeof p?.id === 'string' && typeof p?.name === 'string')
    ) {
      return parsed;
    }
    return DEFAULT_IMPOSTOR_PLAYERS;
  } catch {
    return DEFAULT_IMPOSTOR_PLAYERS;
  }
}

export function saveImpostorPlayers(players: ImpostorPlayer[]): void {
  try {
    localStorage.setItem(IMPOSTOR_PLAYERS_KEY, JSON.stringify(players));
  } catch {
    // Ignore storage errors
  }
}

export function loadFavoriteGames(): GameId[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (id): id is GameId =>
          id === 'kiyumi' || id === 'impostor' || id === 'zoe' || id === 'cubo',
      );
    }
    return [];
  } catch {
    return [];
  }
}

export function saveFavoriteGames(ids: GameId[]): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  } catch {
    // Ignore storage errors
  }
}

export function loadCubeHistory(): CubeSolveRecord[] {
  try {
    const raw = localStorage.getItem(CUBE_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (r): r is CubeSolveRecord =>
        typeof r?.id === 'string' &&
        (r?.size === 2 || r?.size === 3) &&
        typeof r?.timeMs === 'number' &&
        typeof r?.moves === 'number',
    );
  } catch {
    return [];
  }
}

export function saveCubeHistory(records: CubeSolveRecord[]): void {
  try {
    localStorage.setItem(CUBE_HISTORY_KEY, JSON.stringify(records.slice(0, 60)));
  } catch {
    // Ignore storage errors
  }
}

export function loadCubePlayerName(): string {
  try {
    return localStorage.getItem(CUBE_PLAYER_NAME_KEY) || '';
  } catch {
    return '';
  }
}

export function saveCubePlayerName(name: string): void {
  try {
    localStorage.setItem(CUBE_PLAYER_NAME_KEY, name);
  } catch {
    // Ignore storage errors
  }
}
