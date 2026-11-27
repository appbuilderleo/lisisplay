import type { CSSProperties } from 'react';

/**
 * Calcula um tamanho de fonte responsivo seguro para a fonte extra-larga Syne (800),
 * garantindo que palavras compridas sem espaços (ex.: "Carregamento", "Engarrafamento")
 * nunca ultrapassem os limites do cartão em ecrãs de telemóvel.
 */
export function getSyneFitStyle(text: string): CSSProperties {
  const trimmed = text.trim();
  if (!trimmed) return { fontSize: 'clamp(2rem, 9vw, 3.5rem)' };

  const tokens = trimmed.split(/[\s/]+/).filter(Boolean);
  const longestToken = tokens.reduce((max, t) => Math.max(max, t.length), 0);
  const totalLength = trimmed.length;

  // Priorizar a maior palavra indivisível (evita corte lateral na Syne 800)
  if (longestToken >= 14) {
    return { fontSize: 'clamp(1.25rem, 6.2vw, 2.6rem)' };
  }
  if (longestToken >= 12) {
    return { fontSize: 'clamp(1.4rem, 7vw, 2.85rem)' };
  }
  if (longestToken >= 10) {
    return { fontSize: 'clamp(1.65rem, 8vw, 3.2rem)' };
  }
  if (longestToken >= 8 || totalLength >= 18) {
    return { fontSize: 'clamp(1.95rem, 9vw, 3.5rem)' };
  }
  if (longestToken >= 6 || totalLength >= 12) {
    return { fontSize: 'clamp(2.25rem, 10.5vw, 3.85rem)' };
  }
  return { fontSize: 'clamp(2.75rem, 12.5vw, 4.25rem)' };
}
