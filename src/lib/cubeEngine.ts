import { CubeSize, CubeSolveRecord } from '../types';

export type CubeAxis = 'x' | 'y' | 'z';

export interface CubeMove {
  axis: CubeAxis;
  /** Layer index in integer half-steps: for 3x3 => -1 | 0 | 1; for 2x2 => -0.5 | 0.5 */
  layer: number;
  /** +1 = +90deg around axis, -1 = -90deg around axis */
  dir: 1 | -1;
}

const ROOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclui I e O para evitar confusão visual
const SEED_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRoomCode(length = 4): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += ROOM_ALPHABET[Math.floor(Math.random() * ROOM_ALPHABET.length)];
  }
  return out;
}

export function generateScrambleSeed(length = 6): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += SEED_ALPHABET[Math.floor(Math.random() * SEED_ALPHABET.length)];
  }
  return out;
}

/** Hash determinístico FNV-1a + PRNG Mulberry32 para garantir scramble 100% idêntico entre dispositivos */
function hashString(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function createPrng(seed: string): () => number {
  let a = hashString(seed) || 0x9e3779b9;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Gera sequência determinística de movimentos de embaralhamento a partir de uma seed.
 * Nunca repete o mesmo eixo consecutivamente.
 */
export function generateScrambleMoves(size: CubeSize, seed: string): CubeMove[] {
  const rng = createPrng(`${size}x${size}:${seed.toUpperCase()}`);
  const axes: CubeAxis[] = ['x', 'y', 'z'];
  const layers = size === 2 ? [-0.5, 0.5] : [-1, 1]; // Outer layers (padrão WCA)
  const moveCount = size === 2 ? 11 : 20;

  const moves: CubeMove[] = [];
  let prevAxis: CubeAxis | null = null;

  for (let i = 0; i < moveCount; i++) {
    const allowedAxes: CubeAxis[] = prevAxis ? axes.filter((a) => a !== prevAxis) : axes;
    const axis: CubeAxis = allowedAxes[Math.floor(rng() * allowedAxes.length)];
    const layer = layers[Math.floor(rng() * layers.length)];
    const dir: 1 | -1 = rng() < 0.5 ? 1 : -1;

    moves.push({ axis, layer, dir });
    prevAxis = axis;
  }

  return moves;
}

export function invertMove(move: CubeMove): CubeMove {
  return {
    axis: move.axis,
    layer: move.layer,
    dir: (move.dir * -1) as 1 | -1,
  };
}

/** Formata milissegundos no formato 00:00.0 */
export function formatCubeTime(ms: number): string {
  const clamped = Math.max(0, ms);
  const totalTenths = Math.floor(clamped / 100);
  const tenths = totalTenths % 10;
  const totalSeconds = Math.floor(totalTenths / 10);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;
}

/** Calcula Melhor Tempo (PB) e Média dos últimos 5 (Ao5 - estilo WCA descartando melhor e pior) */
export function computeCubeStats(
  history: CubeSolveRecord[],
  size: CubeSize,
): { pbMs: number | null; ao5Ms: number | null; count: number } {
  const filtered = history.filter((r) => r.size === size);
  if (filtered.length === 0) {
    return { pbMs: null, ao5Ms: null, count: 0 };
  }

  const pbMs = filtered.reduce((min, r) => Math.min(min, r.timeMs), Infinity);

  let ao5Ms: number | null = null;
  if (filtered.length >= 5) {
    const last5 = filtered.slice(0, 5).map((r) => r.timeMs).sort((a, b) => a - b);
    // Descarta o melhor (last5[0]) e o pior (last5[4])
    const middle3 = last5.slice(1, 4);
    ao5Ms = Math.round(middle3.reduce((s, v) => s + v, 0) / 3);
  }

  return { pbMs, ao5Ms, count: filtered.length };
}
