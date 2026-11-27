import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureSchema, getPool } from '../_lib/db';
import { hashPassword, requireAdmin } from '../_lib/auth';

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
      const role = typeof req.query.role === 'string' ? req.query.role : 'all';
      const status = typeof req.query.status === 'string' ? req.query.status : 'all';

      const conditions: string[] = [];
      const params: unknown[] = [];

      if (search) {
        params.push(`%${search.toLowerCase()}%`);
        conditions.push(
          `(lower(name) LIKE $${params.length} OR lower(email) LIKE $${params.length} OR lower(city) LIKE $${params.length})`,
        );
      }
      if (role !== 'all') {
        params.push(role);
        conditions.push(`role = $${params.length}`);
      }
      if (status !== 'all') {
        params.push(status);
        conditions.push(`status = $${params.length}`);
      }

      const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const result = await pool.query(
        `SELECT id, name, email, role, status, plan_code, city, phone, created_at, last_login_at
         FROM users
         ${where}
         ORDER BY created_at DESC
         LIMIT 200`,
        params,
      );

      return res.status(200).json({ users: result.rows });
    }

    if (req.method === 'POST') {
      const {
        name,
        email,
        password,
        role = 'user',
        status = 'active',
        plan_code = 'free',
        city = 'Maputo',
        phone = '',
      } = (req.body || {}) as {
        name?: string;
        email?: string;
        password?: string;
        role?: string;
        status?: string;
        plan_code?: string;
        city?: string;
        phone?: string;
      };

      if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
        return res
          .status(400)
          .json({ error: 'Nome, email válido e senha (mínimo 6 caracteres) são obrigatórios.' });
      }

      const safeRole = role === 'admin' ? 'admin' : 'user';
      const safeStatus = ['active', 'inactive', 'blocked'].includes(status) ? status : 'active';

      const inserted = await pool.query(
        `INSERT INTO users (name, email, password_hash, role, status, plan_code, city, phone)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, name, email, role, status, plan_code, city, phone, created_at, last_login_at`,
        [
          name.trim(),
          email.trim().toLowerCase(),
          hashPassword(password),
          safeRole,
          safeStatus,
          plan_code,
          city.trim() || 'Maputo',
          phone.trim(),
        ],
      );

      return res.status(201).json({ user: inserted.rows[0] });
    }

    if (req.method === 'PATCH') {
      const { id, name, role, status, plan_code, city, phone, password } = (req.body || {}) as {
        id?: string;
        name?: string;
        role?: string;
        status?: string;
        plan_code?: string;
        city?: string;
        phone?: string;
        password?: string;
      };

      if (!id) {
        return res.status(400).json({ error: 'ID do utilizador é obrigatório.' });
      }

      // Impedir o próprio admin de remover o seu acesso admin ou bloquear-se
      if (id === admin.sub && (role === 'user' || status === 'blocked' || status === 'inactive')) {
        return res.status(400).json({ error: 'Não podes desativar a tua própria conta de admin.' });
      }

      const updates: string[] = [];
      const params: unknown[] = [];

      if (name !== undefined && name.trim()) {
        params.push(name.trim());
        updates.push(`name = $${params.length}`);
      }
      if (role !== undefined && ['admin', 'user'].includes(role)) {
        params.push(role);
        updates.push(`role = $${params.length}`);
      }
      if (status !== undefined && ['active', 'inactive', 'blocked'].includes(status)) {
        params.push(status);
        updates.push(`status = $${params.length}`);
      }
      if (plan_code !== undefined) {
        params.push(plan_code);
        updates.push(`plan_code = $${params.length}`);
      }
      if (city !== undefined) {
        params.push(city.trim());
        updates.push(`city = $${params.length}`);
      }
      if (phone !== undefined) {
        params.push(phone.trim());
        updates.push(`phone = $${params.length}`);
      }
      if (password && password.length >= 6) {
        params.push(hashPassword(password));
        updates.push(`password_hash = $${params.length}`);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'Nenhuma alteração enviada.' });
      }

      params.push(id);
      const updated = await pool.query(
        `UPDATE users SET ${updates.join(', ')}
         WHERE id = $${params.length}
         RETURNING id, name, email, role, status, plan_code, city, phone, created_at, last_login_at`,
        params,
      );

      if (updated.rowCount === 0) {
        return res.status(404).json({ error: 'Utilizador não encontrado.' });
      }

      return res.status(200).json({ user: updated.rows[0] });
    }

    if (req.method === 'DELETE') {
      const id = typeof req.query.id === 'string' ? req.query.id : (req.body?.id as string | undefined);
      if (!id) {
        return res.status(400).json({ error: 'ID do utilizador é obrigatório.' });
      }
      if (id === admin.sub) {
        return res.status(400).json({ error: 'Não podes eliminar a tua própria conta de admin.' });
      }
      await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
      return res.status(200).json({ deleted: true });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (err: unknown) {
    const pgErr = err as { code?: string };
    if (pgErr?.code === '23505') {
      return res.status(409).json({ error: 'Já existe uma conta registada com este email.' });
    }
    console.error('Admin users error:', err);
    return res.status(500).json({ error: 'Erro ao gerir utilizadores.' });
  }
}
