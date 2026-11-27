import crypto from 'node:crypto';
import { Pool } from 'pg';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
}

async function main() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    throw new Error('DATABASE_URL não definida. Executa com: node --env-file=.env.local scripts/init-db.mjs');
  }

  const u = new URL(rawUrl);
  u.searchParams.delete('sslmode');

  const pool = new Pool({
    connectionString: u.toString(),
    ssl: { rejectUnauthorized: false },
  });

  try {
    const ver = await pool.query('SELECT version(), current_database()');
    console.log('Ligado ao CockroachDB:', ver.rows[0].current_database);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name STRING NOT NULL,
        email STRING UNIQUE NOT NULL,
        password_hash STRING NOT NULL,
        role STRING NOT NULL DEFAULT 'user',
        status STRING NOT NULL DEFAULT 'active',
        plan_code STRING NOT NULL DEFAULT 'free',
        city STRING NOT NULL DEFAULT 'Maputo',
        phone STRING NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        last_login_at TIMESTAMPTZ
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS pricing_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code STRING UNIQUE NOT NULL,
        name STRING NOT NULL,
        description STRING NOT NULL,
        price_mzn DECIMAL(10, 2) NOT NULL DEFAULT 0,
        billing_cycle STRING NOT NULL DEFAULT 'mensal',
        active BOOL NOT NULL DEFAULT true,
        featured BOOL NOT NULL DEFAULT false,
        features JSONB NOT NULL DEFAULT '[]'::JSONB,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        user_name STRING NOT NULL,
        user_email STRING NOT NULL,
        plan_code STRING NOT NULL,
        plan_name STRING NOT NULL,
        amount_mzn DECIMAL(10, 2) NOT NULL,
        method STRING NOT NULL DEFAULT 'M-Pesa',
        status STRING NOT NULL DEFAULT 'paid',
        reference STRING UNIQUE NOT NULL,
        paid_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_analytics_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        game_id STRING NOT NULL,
        event_type STRING NOT NULL DEFAULT 'game_started',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    // Seed Admin account if missing
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@lisisplay.co.mz').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'LisisAdmin@2026';

    const existingAdmin = await pool.query(`SELECT id, email FROM users WHERE role = 'admin' LIMIT 1`);
    if (existingAdmin.rowCount === 0) {
      await pool.query(
        `INSERT INTO users (name, email, password_hash, role, status, plan_code, city, phone)
         VALUES ($1, $2, $3, 'admin', 'active', 'premium_mensal', 'Maputo', '+258 84 000 0000')
         ON CONFLICT (email) DO UPDATE SET role = 'admin', password_hash = EXCLUDED.password_hash`,
        ['Administrador LisisPlay', adminEmail, hashPassword(adminPassword)],
      );
      console.log('Conta Admin criada:', adminEmail);
    } else {
      console.log('Conta Admin já existente:', existingAdmin.rows[0].email);
    }

    // Seed default plans if empty
    const planCount = await pool.query(`SELECT count(*)::INT AS c FROM pricing_plans`);
    if (Number(planCount.rows[0]?.c ?? 0) === 0) {
      const plans = [
        ['free', 'Gratuito (Modo Roda)', 'Acesso imediato aos 4 jogos com 3 baralhos culturais moçambicanos.', 0, 'gratuito', true, false, ['Kiyumi, O Impostor, Zoe e Cubo Mágico', '100% Offline (PWA)', 'Sem anúncios nas rondas']],
        ['pack_cultural', 'Pacote Cultural Extra', 'Desbloqueio permanente de 1 baralho temático premium.', 25, 'unico', true, false, ['+60 cartas exclusivas', 'Pagamento via M-Pesa ou e-Mola', 'Acesso vitalício offline']],
        ['weekend_pass', 'Passe Fim de Semana', 'Todos os baralhos e modos premium desbloqueados por 72h.', 50, 'fim_de_semana', true, true, ['Todos os baralhos desbloqueados', 'Duelos ilimitados no Cubo 3D', 'Ativação instantânea M-Pesa/e-Mola']],
        ['premium_mensal', 'LisisPlay Pro Mensal', 'Acesso completo a todos os jogos, baralhos novos mensais e salas QR.', 150, 'mensal', true, false, ['Todos os pacotes atuais e futuros', 'Estatísticas avançadas na nuvem', 'Suporte prioritário']],
        ['escola_b2b', 'Licença Escolas & Eventos', 'Pacote educativo e corporativo para professores e team building.', 1500, 'anual', true, false, ['Edição Escolas & Ciência', 'Até 20 dispositivos simultâneos', 'Fatura empresarial em MT']],
      ];
      for (const [code, name, description, price, cycle, active, featured, features] of plans) {
        await pool.query(
          `INSERT INTO pricing_plans (code, name, description, price_mzn, billing_cycle, active, featured, features)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8::JSONB) ON CONFLICT (code) DO NOTHING`,
          [code, name, description, price, cycle, active, featured, JSON.stringify(features)],
        );
      }
      console.log('Planos de precificação inicializados.');
    }

    const tables = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`,
    );
    console.log('Tabelas prontas:', tables.rows.map((r) => r.table_name).join(', '));
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Erro CockroachDB:', err);
  process.exit(1);
});
