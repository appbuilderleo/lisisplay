import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureSchema, getPool } from '../_lib/db';
import { requireAdmin } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = requireAdmin(req);
  if (!admin) {
    return res.status(401).json({ error: 'Sessão expirada ou não autorizada.' });
  }

  try {
    await ensureSchema();
    const pool = getPool();

    if (req.method === 'GET') {
      const result = await pool.query(
        `SELECT id, code, name, description, price_mzn::FLOAT AS price_mzn, billing_cycle, active, featured, features, updated_at
         FROM pricing_plans
         ORDER BY price_mzn ASC`,
      );
      return res.status(200).json({ plans: result.rows });
    }

    if (req.method === 'POST') {
      const {
        code,
        name,
        description = '',
        price_mzn = 0,
        billing_cycle = 'mensal',
        active = true,
        featured = false,
        features = [],
      } = (req.body || {}) as {
        code?: string;
        name?: string;
        description?: string;
        price_mzn?: number;
        billing_cycle?: string;
        active?: boolean;
        featured?: boolean;
        features?: string[];
      };

      if (!name?.trim()) {
        return res.status(400).json({ error: 'Nome do plano é obrigatório.' });
      }

      const safeCode =
        (code || name)
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_|_$/g, '') || `plano_${Date.now()}`;

      const inserted = await pool.query(
        `INSERT INTO pricing_plans (code, name, description, price_mzn, billing_cycle, active, featured, features)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::JSONB)
         RETURNING id, code, name, description, price_mzn::FLOAT AS price_mzn, billing_cycle, active, featured, features, updated_at`,
        [
          safeCode,
          name.trim(),
          description.trim(),
          Math.max(0, Number(price_mzn)),
          billing_cycle,
          Boolean(active),
          Boolean(featured),
          JSON.stringify(Array.isArray(features) ? features : []),
        ],
      );

      return res.status(201).json({ plan: inserted.rows[0] });
    }

    if (req.method === 'PATCH') {
      const { id, name, description, price_mzn, billing_cycle, active, featured, features } =
        (req.body || {}) as {
          id?: string;
          name?: string;
          description?: string;
          price_mzn?: number;
          billing_cycle?: string;
          active?: boolean;
          featured?: boolean;
          features?: string[];
        };

      if (!id) {
        return res.status(400).json({ error: 'ID do plano é obrigatório.' });
      }

      const updates: string[] = ['updated_at = now()'];
      const params: unknown[] = [];

      if (name !== undefined && name.trim()) {
        params.push(name.trim());
        updates.push(`name = $${params.length}`);
      }
      if (description !== undefined) {
        params.push(description.trim());
        updates.push(`description = $${params.length}`);
      }
      if (price_mzn !== undefined && !Number.isNaN(Number(price_mzn))) {
        params.push(Math.max(0, Number(price_mzn)));
        updates.push(`price_mzn = $${params.length}`);
      }
      if (billing_cycle !== undefined) {
        params.push(billing_cycle);
        updates.push(`billing_cycle = $${params.length}`);
      }
      if (active !== undefined) {
        params.push(Boolean(active));
        updates.push(`active = $${params.length}`);
      }
      if (featured !== undefined) {
        params.push(Boolean(featured));
        updates.push(`featured = $${params.length}`);
      }
      if (Array.isArray(features)) {
        params.push(JSON.stringify(features));
        updates.push(`features = $${params.length}::JSONB`);
      }

      params.push(id);
      const updated = await pool.query(
        `UPDATE pricing_plans SET ${updates.join(', ')}
         WHERE id = $${params.length}
         RETURNING id, code, name, description, price_mzn::FLOAT AS price_mzn, billing_cycle, active, featured, features, updated_at`,
        params,
      );

      if (updated.rowCount === 0) {
        return res.status(404).json({ error: 'Plano não encontrado.' });
      }

      return res.status(200).json({ plan: updated.rows[0] });
    }

    if (req.method === 'DELETE') {
      const id = typeof req.query.id === 'string' ? req.query.id : (req.body?.id as string | undefined);
      if (!id) {
        return res.status(400).json({ error: 'ID do plano é obrigatório.' });
      }
      await pool.query(`DELETE FROM pricing_plans WHERE id = $1`, [id]);
      return res.status(200).json({ deleted: true });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (err: unknown) {
    const pgErr = err as { code?: string };
    if (pgErr?.code === '23505') {
      return res.status(409).json({ error: 'Já existe um plano com este código.' });
    }
    console.error('Admin pricing error:', err);
    return res.status(500).json({ error: 'Erro ao gerir precificação.' });
  }
}
