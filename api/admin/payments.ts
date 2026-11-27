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
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
      const status = typeof req.query.status === 'string' ? req.query.status : 'all';
      const method = typeof req.query.method === 'string' ? req.query.method : 'all';

      const conditions: string[] = [];
      const params: unknown[] = [];

      if (search) {
        params.push(`%${search.toLowerCase()}%`);
        conditions.push(
          `(lower(user_name) LIKE $${params.length} OR lower(user_email) LIKE $${params.length} OR lower(reference) LIKE $${params.length})`,
        );
      }
      if (status !== 'all') {
        params.push(status);
        conditions.push(`status = $${params.length}`);
      }
      if (method !== 'all') {
        params.push(method);
        conditions.push(`method = $${params.length}`);
      }

      const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const result = await pool.query(
        `SELECT id, user_id, user_name, user_email, plan_code, plan_name, amount_mzn::FLOAT AS amount_mzn, method, status, reference, paid_at
         FROM payments
         ${where}
         ORDER BY paid_at DESC
         LIMIT 200`,
        params,
      );

      return res.status(200).json({ payments: result.rows });
    }

    if (req.method === 'POST') {
      const {
        user_id = null,
        user_name,
        user_email,
        plan_code,
        plan_name,
        amount_mzn,
        method = 'M-Pesa',
        status = 'paid',
        reference,
      } = (req.body || {}) as {
        user_id?: string | null;
        user_name?: string;
        user_email?: string;
        plan_code?: string;
        plan_name?: string;
        amount_mzn?: number;
        method?: string;
        status?: string;
        reference?: string;
      };

      if (!user_name?.trim() || !user_email?.trim() || !plan_code || amount_mzn === undefined) {
        return res
          .status(400)
          .json({ error: 'Utilizador, plano e valor em MT são obrigatórios.' });
      }

      const ref =
        reference?.trim().toUpperCase() ||
        `${method.slice(0, 2).toUpperCase()}-${Date.now().toString().slice(-6)}`;

      const inserted = await pool.query(
        `INSERT INTO payments (user_id, user_name, user_email, plan_code, plan_name, amount_mzn, method, status, reference)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, user_id, user_name, user_email, plan_code, plan_name, amount_mzn::FLOAT AS amount_mzn, method, status, reference, paid_at`,
        [
          user_id,
          user_name.trim(),
          user_email.trim().toLowerCase(),
          plan_code,
          plan_name?.trim() || plan_code,
          Number(amount_mzn),
          method,
          ['paid', 'pending', 'failed', 'refunded'].includes(status) ? status : 'paid',
          ref,
        ],
      );

      // Se pagamento for aprovado, atualiza o plano do utilizador automaticamente se existir
      if (status === 'paid') {
        await pool.query(
          `UPDATE users SET plan_code = $1 WHERE lower(email) = $2`,
          [plan_code, user_email.trim().toLowerCase()],
        );
      }

      return res.status(201).json({ payment: inserted.rows[0] });
    }

    if (req.method === 'PATCH') {
      const { id, status } = (req.body || {}) as { id?: string; status?: string };
      if (!id || !status || !['paid', 'pending', 'failed', 'refunded'].includes(status)) {
        return res.status(400).json({ error: 'ID e estado válido são obrigatórios.' });
      }

      const updated = await pool.query(
        `UPDATE payments SET status = $1 WHERE id = $2
         RETURNING id, user_id, user_name, user_email, plan_code, plan_name, amount_mzn::FLOAT AS amount_mzn, method, status, reference, paid_at`,
        [status, id],
      );

      if (updated.rowCount === 0) {
        return res.status(404).json({ error: 'Pagamento não encontrado.' });
      }

      const pay = updated.rows[0];
      if (status === 'paid') {
        await pool.query(`UPDATE users SET plan_code = $1 WHERE lower(email) = $2`, [
          pay.plan_code,
          String(pay.user_email).toLowerCase(),
        ]);
      }

      return res.status(200).json({ payment: pay });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (err) {
    console.error('Admin payments error:', err);
    return res.status(500).json({ error: 'Erro ao gerir pagamentos.' });
  }
}
