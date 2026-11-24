import { ImpostorPlayer } from '../types';

const SOUND_KEY = 'lisis_play_sound_enabled';
const IMPOSTOR_PLAYERS_KEY = 'lisis_play_impostor_players';

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
    // Ignore storage errors (private mode, quota)
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
