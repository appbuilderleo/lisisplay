import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureSchema, getPool } from '../_lib/db';
import { signAdminToken, verifyPassword } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    await ensureSchema();
    const { email, password } = (req.body || {}) as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ error: 'Indica o email e a senha do administrador.' });
    }

    const pool = getPool();
    const normalizedEmail = email.trim().toLowerCase();
    const result = await pool.query(
      `SELECT id, name, email, password_hash, role, status
       FROM users
       WHERE lower(email) = $1
       LIMIT 1`,
      [normalizedEmail],
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const user = result.rows[0] as {
      id: string;
      name: string;
      email: string;
      password_hash: string;
      role: string;
      status: string;
    };

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso restrito apenas a administradores.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Esta conta de administrador está inativa.' });
    }

    const valid = verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    await pool.query(`UPDATE users SET last_login_at = now() WHERE id = $1`, [user.id]);

    const token = signAdminToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return res.status(200).json({
      token,
      admin: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ error: 'Erro ao autenticar no banco de dados.' });
  }
}
