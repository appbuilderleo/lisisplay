import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureSchema, getPool } from './_lib/db';

const VALID_GAMES = new Set(['kiyumi', 'impostor', 'zoe', 'cubo']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const { gameId, eventType = 'game_started' } = (req.body || {}) as {
      gameId?: string;
      eventType?: string;
    };
    if (!gameId || !VALID_GAMES.has(gameId)) {
      return res.status(400).json({ error: 'Jogo inválido.' });
    }

    await ensureSchema();
    const pool = getPool();
    await pool.query(
      `INSERT INTO app_analytics_events (game_id, event_type) VALUES ($1, $2)`,
      [gameId, String(eventType).slice(0, 40)],
    );

    return res.status(200).json({ ok: true });
  } catch {
    // Telemetria nunca deve bloquear a experiência offline/mobile
    return res.status(200).json({ ok: false });
  }
}
