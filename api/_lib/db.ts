import { Pool } from 'pg';
import { hashPassword } from './auth';

declare global {
  var __lisisPool: Pool | undefined;
  var __lisisSchemaReady: Promise<void> | undefined;
}

function buildConnectionUrl(rawUrl: string): string {
  try {
    const u = new URL(rawUrl);
    // Remove sslmode from query string so pg uses explicit TLS config cleanly on serverless & Windows
    u.searchParams.delete('sslmode');
    return u.toString();
  } catch {
    return rawUrl;
  }
}

export function getPool(): Pool {
  if (!globalThis.__lisisPool) {
    const rawUrl = process.env.DATABASE_URL;
    if (!rawUrl) {
      throw new Error('DATABASE_URL não configurada no ambiente do servidor.');
    }
    globalThis.__lisisPool = new Pool({
      connectionString: buildConnectionUrl(rawUrl),
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 15000,
      connectionTimeoutMillis: 10000,
    });
  }
  return globalThis.__lisisPool;
}

async function bootstrapSchemaAndSeeds(): Promise<void> {
  const pool = getPool();

  // 1. Tabela de Utilizadores (Admin + Utilizadores da plataforma)
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

  // 2. Tabela de Planos & Precificação (MT - Meticais)
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

  // 3. Tabela de Pagamentos (M-Pesa, e-Mola, Cartão, Transferência)
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

  // 4. Tabela de Eventos de Jogos (Telemetria para Análise de Indicadores)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_analytics_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      game_id STRING NOT NULL,
      event_type STRING NOT NULL DEFAULT 'game_started',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  // Seed Administrador Inicial (apenas se ainda não existir nenhum admin)
  const adminCheck = await pool.query(
    `SELECT id FROM users WHERE role = 'admin' LIMIT 1`,
  );
  if (adminCheck.rowCount === 0) {
    const defaultEmail = process.env.ADMIN_EMAIL || 'admin@lisisplay.co.mz';
    const defaultPassword = process.env.ADMIN_PASSWORD || 'LisisAdmin@2026';
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role, status, plan_code, city, phone)
       VALUES ($1, $2, $3, 'admin', 'active', 'premium_mensal', 'Maputo', '+258 84 000 0000')
       ON CONFLICT (email) DO UPDATE SET role = 'admin', password_hash = EXCLUDED.password_hash`,
      ['Administrador LisisPlay', defaultEmail.toLowerCase(), hashPassword(defaultPassword)],
    );
  }

  // Seed Planos de Precificação oficiais da LisisPlay (se vazio)
  const planCount = await pool.query(`SELECT count(*)::INT AS c FROM pricing_plans`);
  if (Number(planCount.rows[0]?.c ?? 0) === 0) {
    const defaultPlans = [
      {
        code: 'free',
        name: 'Gratuito (Modo Roda)',
        description: 'Acesso imediato aos 4 jogos com 3 baralhos culturais moçambicanos.',
        price_mzn: 0,
        billing_cycle: 'gratuito',
        active: true,
        featured: false,
        features: ['Kiyumi, O Impostor, Zoe e Cubo Mágico', '100% Offline (PWA)', 'Sem anúncios nas rondas'],
      },
      {
        code: 'pack_cultural',
        name: 'Pacote Cultural Extra',
        description: 'Desbloqueio permanente de 1 baralho temático premium (Escolas, +18 ou Maputo Pro).',
        price_mzn: 25,
        billing_cycle: 'unico',
        active: true,
        featured: false,
        features: ['+60 cartas exclusivas', 'Pagamento via M-Pesa ou e-Mola', 'Acesso vitalício offline'],
      },
      {
        code: 'weekend_pass',
        name: 'Passe Fim de Semana',
        description: 'Todos os baralhos e modos premium desbloqueados durante 72 horas de festa.',
        price_mzn: 50,
        billing_cycle: 'fim_de_semana',
        active: true,
        featured: true,
        features: ['Todos os baralhos desbloqueados', 'Duelos ilimitados no Cubo 3D', 'Ativação instantânea M-Pesa/e-Mola'],
      },
      {
        code: 'premium_mensal',
        name: 'LisisPlay Pro Mensal',
        description: 'Acesso completo a todos os jogos, baralhos novos mensais e salas QR ilimitadas.',
        price_mzn: 150,
        billing_cycle: 'mensal',
        active: true,
        featured: false,
        features: ['Todos os pacotes atuais e futuros', 'Estatísticas avançadas na nuvem', 'Suporte prioritário'],
      },
      {
        code: 'escola_b2b',
        name: 'Licença Escolas & Eventos',
        description: 'Pacote educativo e corporativo para professores, turmas e eventos de team building.',
        price_mzn: 1500,
        billing_cycle: 'anual',
        active: true,
        featured: false,
        features: ['Edição Escolas & Ciência', 'Até 20 dispositivos simultâneos', 'Fatura empresarial em MT'],
      },
    ];

    for (const plan of defaultPlans) {
      await pool.query(
        `INSERT INTO pricing_plans (code, name, description, price_mzn, billing_cycle, active, featured, features)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::JSONB)
         ON CONFLICT (code) DO NOTHING`,
        [
          plan.code,
          plan.name,
          plan.description,
          plan.price_mzn,
          plan.billing_cycle,
          plan.active,
          plan.featured,
          JSON.stringify(plan.features),
        ],
      );
    }
  }
}

export async function ensureSchema(): Promise<void> {
  if (!globalThis.__lisisSchemaReady) {
    globalThis.__lisisSchemaReady = bootstrapSchemaAndSeeds().catch((err) => {
      globalThis.__lisisSchemaReady = undefined;
      throw err;
    });
  }
  await globalThis.__lisisSchemaReady;
}
