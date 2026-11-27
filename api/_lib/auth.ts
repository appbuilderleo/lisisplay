import crypto from 'node:crypto';
import type { IncomingMessage } from 'node:http';

const TOKEN_SECRET =
  process.env.ADMIN_TOKEN_SECRET || 'lisis-play-admin-hmac-secret-2026-mz-default';

const TOKEN_TTL_MS = 1000 * 60 * 60 * 12; // 12 horas

export interface AdminTokenPayload {
  sub: string;
  email: string;
  name: string;
  role: 'admin';
  exp: number;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, originalHex] = parts;
  const derivedHex = crypto.scryptSync(password, salt, 64).toString('hex');
  const a = Buffer.from(originalHex, 'hex');
  const b = Buffer.from(derivedHex, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

export function signAdminToken(user: { id: string; email: string; name: string }): string {
  const payload: AdminTokenPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: 'admin',
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const sig = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifyAdminToken(token: string | undefined): AdminTokenPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;

  const expectedSig = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(encoded)
    .digest('base64url');

  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encoded)) as AdminTokenPayload;
    if (payload.role !== 'admin' || typeof payload.exp !== 'number') return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function extractBearerToken(req: IncomingMessage): string | undefined {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return undefined;
  return header.slice(7).trim();
}

export function requireAdmin(req: IncomingMessage): AdminTokenPayload | null {
  const token = extractBearerToken(req);
  return verifyAdminToken(token);
}
