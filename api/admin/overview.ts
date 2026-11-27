import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureSchema, getPool } from '../_lib/db';
import { requireAdmin } from '../_lib/auth';

function rangeToDays(range: string | undefined): number | null {
  switch (range) {
    case '7d':
      return 7;
    case '30d':
      return 30;
    case '90d':
      return 90;
    default:
      return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const admin = requireAdmin(req);
  if (!admin) {
    return res.status(401).json({ error: 'Sessão expirada ou não autorizada.' });
  }

  try {
    await ensureSchema();
    const pool = getPool();

    const range = typeof req.query.range === 'string' ? req.query.range : '30d';
    const methodFilter = typeof req.query.method === 'string' ? req.query.method : 'all';
    const statusFilter = typeof req.query.status === 'string' ? req.query.status : 'all';
    const days = rangeToDays(range);

    // 1. KPIs de Utilizadores
    const userKpiQuery = await pool.query(
      `SELECT
         count(*)::INT AS total_users,
         count(*) FILTER (WHERE status = 'active')::INT AS active_users,
         count(*) FILTER (WHERE role = 'admin')::INT AS admin_users,
         count(*) FILTER (WHERE plan_code <> 'free')::INT AS paid_plan_users,
         count(*) FILTER (WHERE ($1::INT IS NULL OR created_at >= now() - ($1::INT || ' days')::INTERVAL))::INT AS new_users_period
       FROM users`,
      [days],
    );

    // 2. KPIs de Pagamentos (filtrados por período, método e estado)
    const payConditions: string[] = [];
    const payParams: unknown[] = [];
    if (days !== null) {
      payParams.push(days);
      payConditions.push(`paid_at >= now() - ($${payParams.length}::INT || ' days')::INTERVAL`);
    }
    if (methodFilter !== 'all') {
      payParams.push(methodFilter);
      payConditions.push(`method = $${payParams.length}`);
    }
    if (statusFilter !== 'all') {
      payParams.push(statusFilter);
      payConditions.push(`status = $${payParams.length}`);
    }
    const payWhere = payConditions.length > 0 ? `WHERE ${payConditions.join(' AND ')}` : '';

    const payKpiQuery = await pool.query(
      `SELECT
         count(*)::INT AS total_payments,
         count(*) FILTER (WHERE status = 'paid')::INT AS paid_count,
         count(*) FILTER (WHERE status = 'pending')::INT AS pending_count,
         count(*) FILTER (WHERE status = 'failed')::INT AS failed_count,
         COALESCE(SUM(amount_mzn) FILTER (WHERE status = 'paid'), 0)::FLOAT AS revenue_mzn,
         COALESCE(SUM(amount_mzn) FILTER (WHERE status = 'pending'), 0)::FLOAT AS pending_mzn,
         COALESCE(AVG(amount_mzn) FILTER (WHERE status = 'paid'), 0)::FLOAT AS avg_ticket_mzn
       FROM payments
       ${payWhere}`,
      payParams,
    );

    // 3. Série temporal de receita e novos utilizadores por dia
    const chartDays = days ?? 90;
    const revenueSeriesQuery = await pool.query(
      `SELECT
         to_char(date_trunc('day', paid_at), 'DD/MM') AS label,
         date_trunc('day', paid_at) AS bucket,
         COALESCE(SUM(amount_mzn) FILTER (WHERE status = 'paid'), 0)::FLOAT AS revenue,
         count(*)::INT AS count
       FROM payments
       WHERE paid_at >= now() - ($1::INT || ' days')::INTERVAL
         AND ($2::STRING = 'all' OR method = $2::STRING)
         AND ($3::STRING = 'all' OR status = $3::STRING)
       GROUP BY bucket, label
       ORDER BY bucket ASC`,
      [chartDays, methodFilter, statusFilter],
    );

    const userSeriesQuery = await pool.query(
      `SELECT
         to_char(date_trunc('day', created_at), 'DD/MM') AS label,
         date_trunc('day', created_at) AS bucket,
         count(*)::INT AS users
       FROM users
       WHERE created_at >= now() - ($1::INT || ' days')::INTERVAL
       GROUP BY bucket, label
       ORDER BY bucket ASC`,
      [chartDays],
    );

    // 4. Distribuição por método de pagamento
    const byMethodQuery = await pool.query(
      `SELECT
         method,
         count(*)::INT AS count,
         COALESCE(SUM(amount_mzn) FILTER (WHERE status = 'paid'), 0)::FLOAT AS revenue
       FROM payments
       ${payWhere}
       GROUP BY method
       ORDER BY revenue DESC`,
      payParams,
    );

    // 5. Distribuição de utilizadores por plano
    const byPlanQuery = await pool.query(
      `SELECT
         u.plan_code AS code,
         COALESCE(p.name, u.plan_code) AS name,
         count(*)::INT AS count
       FROM users u
       LEFT JOIN pricing_plans p ON p.code = u.plan_code
       GROUP BY u.plan_code, p.name
       ORDER BY count DESC`,
    );

    // 6. Popularidade de jogos (telemetria real)
    const gamesQuery = await pool.query(
      `SELECT
         game_id,
         count(*)::INT AS plays
       FROM app_analytics_events
       WHERE ($1::INT IS NULL OR created_at >= now() - ($1::INT || ' days')::INTERVAL)
       GROUP BY game_id
       ORDER BY plays DESC`,
      [days],
    );

    const uKpi = userKpiQuery.rows[0];
    const pKpi = payKpiQuery.rows[0];

    const totalUsers = Number(uKpi?.total_users ?? 0);
    const paidPlanUsers = Number(uKpi?.paid_plan_users ?? 0);
    const revenueMzn = Number(pKpi?.revenue_mzn ?? 0);
    const totalPayments = Number(pKpi?.total_payments ?? 0);
    const paidCount = Number(pKpi?.paid_count ?? 0);

    const conversionRate = totalUsers > 0 ? Number(((paidPlanUsers / totalUsers) * 100).toFixed(1)) : 0;
    const arpuMzn = totalUsers > 0 ? Number((revenueMzn / totalUsers).toFixed(2)) : 0;
    const approvalRate = totalPayments > 0 ? Number(((paidCount / totalPayments) * 100).toFixed(1)) : 100;

    return res.status(200).json({
      kpis: {
        totalUsers,
        activeUsers: Number(uKpi?.active_users ?? 0),
        adminUsers: Number(uKpi?.admin_users ?? 0),
        newUsersPeriod: Number(uKpi?.new_users_period ?? 0),
        paidPlanUsers,
        conversionRate,
        revenueMzn,
        pendingMzn: Number(pKpi?.pending_mzn ?? 0),
        avgTicketMzn: Number(Number(pKpi?.avg_ticket_mzn ?? 0).toFixed(2)),
        arpuMzn,
        totalPayments,
        paidCount,
        pendingCount: Number(pKpi?.pending_count ?? 0),
        failedCount: Number(pKpi?.failed_count ?? 0),
        approvalRate,
        totalGamePlays: gamesQuery.rows.reduce((sum, r) => sum + Number(r.plays ?? 0), 0),
      },
      charts: {
        revenueSeries: revenueSeriesQuery.rows.map((r) => ({
          label: r.label,
          revenue: Number(r.revenue ?? 0),
          count: Number(r.count ?? 0),
        })),
        userSeries: userSeriesQuery.rows.map((r) => ({
          label: r.label,
          users: Number(r.users ?? 0),
        })),
        byMethod: byMethodQuery.rows.map((r) => ({
          method: r.method,
          count: Number(r.count ?? 0),
          revenue: Number(r.revenue ?? 0),
        })),
        byPlan: byPlanQuery.rows.map((r) => ({
          code: r.code,
          name: r.name,
          count: Number(r.count ?? 0),
        })),
        byGame: gamesQuery.rows.map((r) => ({
          gameId: r.game_id,
          plays: Number(r.plays ?? 0),
        })),
      },
    });
  } catch (err) {
    console.error('Admin overview error:', err);
    return res.status(500).json({ error: 'Erro ao carregar indicadores do banco de dados.' });
  }
}
