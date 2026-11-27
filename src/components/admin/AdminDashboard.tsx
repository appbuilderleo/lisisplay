import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  Activity,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Edit3,
  Filter,
  Gamepad2,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Star,
  Tag,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  AdminOverviewData,
  AdminUserProfile,
  createPayment,
  createPricingPlan,
  createUser,
  deletePricingPlan,
  deleteUser,
  fetchOverview,
  fetchPayments,
  fetchPricingPlans,
  fetchUsers,
  formatMZN,
  ManagedPayment,
  ManagedUser,
  PricingPlan,
  updatePaymentStatus,
  updatePricingPlan,
  updateUser,
} from '../../lib/adminApi';
import { Modal } from '../ui/Modal';
import { BarSeriesChart, HorizontalRankChart, PaymentMethodsDonut } from './AdminCharts';

type AdminTab = 'overview' | 'users' | 'payments' | 'pricing';

interface AdminDashboardProps {
  token: string;
  admin: AdminUserProfile;
  onLogout: () => void;
  onExitToApp: () => void;
}

const GAME_LABELS: Record<string, string> = {
  kiyumi: 'Kiyumi (Mímica/Descreve)',
  impostor: 'O Impostor',
  zoe: 'Zoe (Quem na Roda?)',
  cubo: 'Cubo Mágico 3D',
};

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-[#00FFA3]/15 text-[#00FFA3]',
  inactive: 'bg-[#94A3B8]/15 text-[#94A3B8]',
  blocked: 'bg-[#FF3366]/15 text-[#FF3366]',
  paid: 'bg-[#00FFA3]/15 text-[#00FFA3]',
  pending: 'bg-[#FF6B35]/15 text-[#FF6B35]',
  failed: 'bg-[#FF3366]/15 text-[#FF3366]',
  refunded: 'bg-[#19D8F2]/15 text-[#19D8F2]',
};

const STATUS_LABEL: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  blocked: 'Bloqueado',
  paid: 'Pago',
  pending: 'Pendente',
  failed: 'Falhou',
  refunded: 'Reembolsado',
};

export function AdminDashboard({
  token,
  admin,
  onLogout,
  onExitToApp,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  // Overview Filters & Data
  const [range, setRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [overview, setOverview] = useState<AdminOverviewData | null>(null);

  // Users State
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user',
    plan_code: 'free',
    city: 'Maputo',
    phone: '',
  });

  // Payments State
  const [payments, setPayments] = useState<ManagedPayment[]>([]);
  const [paySearch, setPaySearch] = useState('');
  const [payStatusFilter, setPayStatusFilter] = useState('all');
  const [payMethodFilter, setPayMethodFilter] = useState('all');
  const [showPayModal, setShowPayModal] = useState(false);
  const [newPayForm, setNewPayForm] = useState({
    user_name: '',
    user_email: '',
    plan_code: 'weekend_pass',
    amount_mzn: 50,
    method: 'M-Pesa',
    status: 'paid',
    reference: '',
  });

  // Pricing State
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState({
    code: '',
    name: '',
    description: '',
    price_mzn: 0,
    billing_cycle: 'mensal',
    active: true,
    featured: false,
    featuresText: '',
  });

  const notify = (type: 'ok' | 'err', msg: string) => {
    setToast({ type, msg });
    window.setTimeout(() => setToast(null), 3500);
  };

  const handleAuthError = useCallback(
    (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Erro inesperado.';
      if (msg.includes('expirada') || msg.includes('autorizada')) {
        onLogout();
      } else {
        notify('err', msg);
      }
    },
    [onLogout],
  );

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, us, py, pl] = await Promise.all([
        fetchOverview(token, { range, method: methodFilter, status: statusFilter }),
        fetchUsers(token, { search: userSearch, role: userRoleFilter, status: userStatusFilter }),
        fetchPayments(token, {
          search: paySearch,
          status: payStatusFilter,
          method: payMethodFilter,
        }),
        fetchPricingPlans(token),
      ]);
      setOverview(ov);
      setUsers(us.users);
      setPayments(py.payments);
      setPlans(pl.plans);
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  }, [
    token,
    range,
    methodFilter,
    statusFilter,
    userSearch,
    userRoleFilter,
    userStatusFilter,
    paySearch,
    payStatusFilter,
    payMethodFilter,
    handleAuthError,
  ]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Handlers: Users
  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createUser(token, { ...newUserForm, status: 'active' });
      setShowUserModal(false);
      setNewUserForm({
        name: '',
        email: '',
        password: '',
        role: 'user',
        plan_code: 'free',
        city: 'Maputo',
        phone: '',
      });
      notify('ok', 'Utilizador criado no CockroachDB!');
      loadAll();
    } catch (err) {
      handleAuthError(err);
    }
  };

  const handleToggleUserStatus = async (u: ManagedUser) => {
    const nextStatus = u.status === 'active' ? 'blocked' : 'active';
    try {
      await updateUser(token, { id: u.id, status: nextStatus });
      notify('ok', `Estado de ${u.name} alterado para ${STATUS_LABEL[nextStatus]}.`);
      loadAll();
    } catch (err) {
      handleAuthError(err);
    }
  };

  const handleChangeUserPlan = async (u: ManagedUser, planCode: string) => {
    try {
      await updateUser(token, { id: u.id, plan_code: planCode });
      notify('ok', `Plano de ${u.name} atualizado.`);
      loadAll();
    } catch (err) {
      handleAuthError(err);
    }
  };

  const handleDeleteUser = async (u: ManagedUser) => {
    try {
      await deleteUser(token, u.id);
      notify('ok', `Conta ${u.email} eliminada.`);
      loadAll();
    } catch (err) {
      handleAuthError(err);
    }
  };

  // Handlers: Payments
  const handleCreatePayment = async (e: FormEvent) => {
    e.preventDefault();
    const matchedPlan = plans.find((p) => p.code === newPayForm.plan_code);
    try {
      await createPayment(token, {
        ...newPayForm,
        plan_name: matchedPlan?.name || newPayForm.plan_code,
        amount_mzn: Number(newPayForm.amount_mzn),
      });
      setShowPayModal(false);
      setNewPayForm({
        user_name: '',
        user_email: '',
        plan_code: plans[1]?.code || 'weekend_pass',
        amount_mzn: plans[1]?.price_mzn ?? 50,
        method: 'M-Pesa',
        status: 'paid',
        reference: '',
      });
      notify('ok', 'Pagamento registado com sucesso!');
      loadAll();
    } catch (err) {
      handleAuthError(err);
    }
  };

  const handleUpdatePaymentStatus = async (p: ManagedPayment, nextStatus: string) => {
    try {
      await updatePaymentStatus(token, p.id, nextStatus);
      notify('ok', `Pagamento ${p.reference} marcado como ${STATUS_LABEL[nextStatus]}.`);
      loadAll();
    } catch (err) {
      handleAuthError(err);
    }
  };

  // Handlers: Pricing
  const openEditPlan = (plan: PricingPlan | null) => {
    setEditingPlan(plan);
    if (plan) {
      setPlanForm({
        code: plan.code,
        name: plan.name,
        description: plan.description,
        price_mzn: plan.price_mzn,
        billing_cycle: plan.billing_cycle,
        active: plan.active,
        featured: plan.featured,
        featuresText: (plan.features || []).join('\n'),
      });
    } else {
      setPlanForm({
        code: '',
        name: '',
        description: '',
        price_mzn: 50,
        billing_cycle: 'mensal',
        active: true,
        featured: false,
        featuresText: '',
      });
    }
    setShowPlanModal(true);
  };

  const handleSavePlan = async (e: FormEvent) => {
    e.preventDefault();
    const features = planForm.featuresText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    try {
      if (editingPlan) {
        await updatePricingPlan(token, {
          id: editingPlan.id,
          name: planForm.name,
          description: planForm.description,
          price_mzn: Number(planForm.price_mzn),
          billing_cycle: planForm.billing_cycle,
          active: planForm.active,
          featured: planForm.featured,
          features,
        });
        notify('ok', `Plano "${planForm.name}" atualizado!`);
      } else {
        await createPricingPlan(token, {
          code: planForm.code,
          name: planForm.name,
          description: planForm.description,
          price_mzn: Number(planForm.price_mzn),
          billing_cycle: planForm.billing_cycle,
          active: planForm.active,
          featured: planForm.featured,
          features,
        });
        notify('ok', `Plano "${planForm.name}" criado!`);
      }
      setShowPlanModal(false);
      loadAll();
    } catch (err) {
      handleAuthError(err);
    }
  };

  const handleDeletePlan = async (plan: PricingPlan) => {
    try {
      await deletePricingPlan(token, plan.id);
      notify('ok', `Plano "${plan.name}" removido.`);
      loadAll();
    } catch (err) {
      handleAuthError(err);
    }
  };

  const kpis = overview?.kpis;

  return (
    <div className="min-h-[100dvh] w-full bg-[#070B14] text-[#F8FAFC] pb-16">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070B14]/92 backdrop-blur-xl pt-safe">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#00F5D4]/35 bg-[#F8FAFC] p-1.5">
              <img
                src="/simbolo.png"
                alt="LisisPlay"
                className="h-full w-full translate-x-[1px] object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display whitespace-nowrap text-lg font-extrabold text-[#F8FAFC]">
                  Lisis<span className="text-[#FF6B35]">Play</span>
                </h1>
                <span className="rounded-full bg-[#00F5D4]/15 px-2.5 py-0.5 font-display text-[10px] font-extrabold uppercase tracking-wider text-[#00F5D4]">
                  Admin
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">{admin.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadAll}
              disabled={loading}
              className="glass-card flex h-10 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold text-[#19D8F2] transition active:scale-95"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
            <button
              type="button"
              onClick={onExitToApp}
              className="glass-card flex h-10 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold text-[#F8FAFC] transition active:scale-95"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">App</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="flex h-10 items-center gap-1.5 rounded-full bg-[#FF3366]/15 px-3.5 text-xs font-bold text-[#FF3366] transition active:scale-95"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mx-auto flex max-w-6xl gap-1.5 overflow-x-auto px-4 pb-2.5 no-scrollbar">
          {(
            [
              { id: 'overview', label: 'Indicadores & Gráficos', icon: BarChart3 },
              { id: 'users', label: `Utilizadores (${users.length})`, icon: Users },
              { id: 'payments', label: `Pagamentos (${payments.length})`, icon: CreditCard },
              { id: 'pricing', label: `Precificação (${plans.length})`, icon: Tag },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex min-h-[42px] shrink-0 items-center gap-2 rounded-full px-4 font-display text-xs font-extrabold transition ${
                  active
                    ? 'bg-[#00F5D4] text-[#070B14] shadow-md shadow-[#00F5D4]/25'
                    : 'glass-card text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Toast feedback */}
      {toast && (
        <div className="fixed right-4 top-20 z-50 animate-pop-in">
          <div
            className={`rounded-2xl border px-4 py-3 text-xs font-bold shadow-2xl backdrop-blur-md ${
              toast.type === 'ok'
                ? 'border-[#00FFA3]/50 bg-[#0F172A]/95 text-[#00FFA3]'
                : 'border-[#FF3366]/50 bg-[#0F172A]/95 text-[#FFB4AB]'
            }`}
          >
            {toast.msg}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-4 pt-5">
        {/* ================= TAB 1: OVERVIEW & ANALYTICS ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Filter Bar */}
            <div className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-3xl p-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#00F5D4]" />
                <span className="font-display text-xs font-extrabold uppercase tracking-wider text-[#F8FAFC]">
                  Filtros de Análise
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-full bg-[#070B14] p-1">
                  {(
                    [
                      { id: '7d', label: '7D' },
                      { id: '30d', label: '30D' },
                      { id: '90d', label: '90D' },
                      { id: 'all', label: 'Tudo' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setRange(opt.id)}
                      className={`min-h-[34px] rounded-full px-3 font-display text-[11px] font-extrabold transition ${
                        range === opt.id ? 'bg-[#00F5D4] text-[#070B14]' : 'text-[#94A3B8]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="min-h-[38px] rounded-full border border-white/12 bg-[#070B14] px-3 text-xs font-bold text-[#F8FAFC] focus:border-[#00F5D4] focus:outline-none"
                >
                  <option value="all">Todos Métodos</option>
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="e-Mola">e-Mola</option>
                  <option value="Cartão">Cartão</option>
                  <option value="Transferência">Transferência</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="min-h-[38px] rounded-full border border-white/12 bg-[#070B14] px-3 text-xs font-bold text-[#F8FAFC] focus:border-[#00F5D4] focus:outline-none"
                >
                  <option value="all">Todos Estados</option>
                  <option value="paid">Pago</option>
                  <option value="pending">Pendente</option>
                  <option value="failed">Falhou</option>
                  <option value="refunded">Reembolsado</option>
                </select>
              </div>
            </div>

            {/* 6 Principal KPI Cards */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              <div className="glass-card rounded-3xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    Contas / Utilizadores
                  </span>
                  <Users className="h-4 w-4 text-[#00F5D4]" />
                </div>
                <p className="font-display mt-2 text-3xl font-extrabold text-[#F8FAFC]">
                  {kpis?.totalUsers ?? 0}
                </p>
                <p className="mt-1 text-xs text-[#00FFA3]">
                  +{kpis?.newUsersPeriod ?? 0} no período · {kpis?.activeUsers ?? 0} ativos
                </p>
              </div>

              <div className="glass-card rounded-3xl border-[#00F5D4]/30 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    Receita Aprovada
                  </span>
                  <DollarSign className="h-4 w-4 text-[#00FFA3]" />
                </div>
                <p className="font-display mt-2 text-3xl font-extrabold text-[#00F5D4]">
                  {formatMZN(kpis?.revenueMzn ?? 0)}
                </p>
                <p className="mt-1 text-xs text-[#B9CAC4]">
                  Ticket médio: {formatMZN(kpis?.avgTicketMzn ?? 0)}
                </p>
              </div>

              <div className="glass-card rounded-3xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    Taxa de Conversão
                  </span>
                  <TrendingUp className="h-4 w-4 text-[#FF6B35]" />
                </div>
                <p className="font-display mt-2 text-3xl font-extrabold text-[#FF6B35]">
                  {kpis?.conversionRate ?? 0}%
                </p>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  {kpis?.paidPlanUsers ?? 0} utilizadores em planos pagos
                </p>
              </div>

              <div className="glass-card rounded-3xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    Pagamentos
                  </span>
                  <CheckCircle2 className="h-4 w-4 text-[#19D8F2]" />
                </div>
                <p className="font-display mt-2 text-3xl font-extrabold text-[#19D8F2]">
                  {kpis?.paidCount ?? 0}
                  <span className="ml-1.5 text-sm font-bold text-[#94A3B8]">
                    / {kpis?.totalPayments ?? 0}
                  </span>
                </p>
                <p className="mt-1 text-xs text-[#FF6B35]">
                  {kpis?.pendingCount ?? 0} pendentes ({formatMZN(kpis?.pendingMzn ?? 0)})
                </p>
              </div>

              <div className="glass-card rounded-3xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    ARPU (Receita/Conta)
                  </span>
                  <Activity className="h-4 w-4 text-[#00F5D4]" />
                </div>
                <p className="font-display mt-2 text-3xl font-extrabold text-[#F8FAFC]">
                  {formatMZN(kpis?.arpuMzn ?? 0)}
                </p>
                <p className="mt-1 text-xs text-[#00FFA3]">
                  Aprovação: {kpis?.approvalRate ?? 100}%
                </p>
              </div>

              <div className="glass-card rounded-3xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    Partidas Registadas
                  </span>
                  <Gamepad2 className="h-4 w-4 text-[#FF6B35]" />
                </div>
                <p className="font-display mt-2 text-3xl font-extrabold text-[#F8FAFC]">
                  {kpis?.totalGamePlays ?? 0}
                </p>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  Telemetria real dos 4 jogos LisisPlay
                </p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <BarSeriesChart
                title="Evolução da Receita (MT)"
                subtitle="Pagamentos aprovados por dia no filtro selecionado"
                data={(overview?.charts.revenueSeries ?? []).map((r) => ({
                  label: r.label,
                  value: r.revenue,
                }))}
                color="#00F5D4"
                valueFormatter={(v) => `${Math.round(v)} MT`}
              />

              <BarSeriesChart
                title="Novas Contas Criadas"
                subtitle="Crescimento de utilizadores registados no CockroachDB"
                data={(overview?.charts.userSeries ?? []).map((u) => ({
                  label: u.label,
                  value: u.users,
                }))}
                color="#FF6B35"
              />

              <PaymentMethodsDonut data={overview?.charts.byMethod ?? []} />

              <div className="grid grid-cols-1 gap-4">
                <HorizontalRankChart
                  title="Utilizadores por Plano"
                  subtitle="Distribuição atual das contas por nível de subscrição"
                  items={(overview?.charts.byPlan ?? []).map((p) => ({
                    label: p.name,
                    value: p.count,
                  }))}
                  color="#19D8F2"
                  unitLabel="contas"
                />

                <HorizontalRankChart
                  title="Jogos Mais Jogados"
                  subtitle="Engajamento por título na LisisPlay"
                  items={(overview?.charts.byGame ?? []).map((g) => ({
                    label: GAME_LABELS[g.gameId] || g.gameId,
                    value: g.plays,
                  }))}
                  color="#00FFA3"
                  unitLabel="partidas"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: USERS MANAGEMENT ================= */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-3xl p-4">
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <div className="relative min-w-[200px] flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#00F5D4]" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Buscar nome, email ou cidade..."
                    className="min-h-[42px] w-full rounded-full border border-white/10 bg-[#070B14] pl-10 pr-4 text-xs font-medium text-[#F8FAFC] focus:border-[#00F5D4] focus:outline-none"
                  />
                </div>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="min-h-[42px] rounded-full border border-white/10 bg-[#070B14] px-3 text-xs font-bold text-[#F8FAFC]"
                >
                  <option value="all">Todos Perfis</option>
                  <option value="admin">Admins</option>
                  <option value="user">Utilizadores</option>
                </select>
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="min-h-[42px] rounded-full border border-white/10 bg-[#070B14] px-3 text-xs font-bold text-[#F8FAFC]"
                >
                  <option value="all">Todos Estados</option>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="blocked">Bloqueado</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setShowUserModal(true)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#00F5D4] px-5 font-display text-xs font-extrabold text-[#070B14] shadow-md shadow-[#00F5D4]/25 transition active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Nova Conta
              </button>
            </div>

            <div className="space-y-2.5">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="glass-card flex flex-col justify-between gap-3 rounded-3xl p-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-base font-extrabold text-[#F8FAFC]">
                        {u.name}
                      </span>
                      {u.role === 'admin' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#00F5D4]/15 px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#00F5D4]">
                          <Shield className="h-3 w-3" />
                          Admin
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                          STATUS_BADGE[u.status] || 'bg-[#1B2029] text-[#94A3B8]'
                        }`}
                      >
                        {STATUS_LABEL[u.status] || u.status}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-[#B9CAC4]">{u.email}</p>
                    <p className="mt-1 text-[11px] text-[#94A3B8]">
                      {u.city || 'Maputo'}
                      {u.phone ? ` · ${u.phone}` : ''} · Criada em{' '}
                      {new Date(u.created_at).toLocaleDateString('pt-MZ')}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={u.plan_code}
                      onChange={(e) => handleChangeUserPlan(u, e.target.value)}
                      className="min-h-[38px] rounded-full border border-white/10 bg-[#070B14] px-3 text-xs font-bold text-[#19D8F2]"
                    >
                      {plans.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    {u.id !== admin.id && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleToggleUserStatus(u)}
                          className="min-h-[38px] rounded-full bg-[#1B2029] px-3 text-xs font-bold text-[#F8FAFC] hover:bg-[#262A34]"
                        >
                          {u.status === 'active' ? 'Bloquear' : 'Ativar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u)}
                          aria-label={`Eliminar ${u.name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF3366]/15 text-[#FF3366]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: PAYMENTS ================= */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-3xl p-4">
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <div className="relative min-w-[200px] flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#00F5D4]" />
                  <input
                    type="text"
                    value={paySearch}
                    onChange={(e) => setPaySearch(e.target.value)}
                    placeholder="Buscar referência, nome ou email..."
                    className="min-h-[42px] w-full rounded-full border border-white/10 bg-[#070B14] pl-10 pr-4 text-xs font-medium text-[#F8FAFC] focus:border-[#00F5D4] focus:outline-none"
                  />
                </div>
                <select
                  value={payMethodFilter}
                  onChange={(e) => setPayMethodFilter(e.target.value)}
                  className="min-h-[42px] rounded-full border border-white/10 bg-[#070B14] px-3 text-xs font-bold text-[#F8FAFC]"
                >
                  <option value="all">Todos Métodos</option>
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="e-Mola">e-Mola</option>
                  <option value="Cartão">Cartão</option>
                  <option value="Transferência">Transferência</option>
                </select>
                <select
                  value={payStatusFilter}
                  onChange={(e) => setPayStatusFilter(e.target.value)}
                  className="min-h-[42px] rounded-full border border-white/10 bg-[#070B14] px-3 text-xs font-bold text-[#F8FAFC]"
                >
                  <option value="all">Todos Estados</option>
                  <option value="paid">Pago</option>
                  <option value="pending">Pendente</option>
                  <option value="failed">Falhou</option>
                  <option value="refunded">Reembolsado</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setShowPayModal(true)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#00F5D4] px-5 font-display text-xs font-extrabold text-[#070B14] shadow-md shadow-[#00F5D4]/25 transition active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Registar Pagamento
              </button>
            </div>

            {payments.length === 0 ? (
              <div className="glass-card rounded-3xl p-8 text-center text-sm text-[#94A3B8]">
                Ainda não existem pagamentos registados com este filtro. Clica em{' '}
                <strong className="text-[#00F5D4]">Registar Pagamento</strong> para lançar
                recebimentos via M-Pesa, e-Mola ou transferência.
              </div>
            ) : (
              <div className="space-y-2.5">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="glass-card flex flex-col justify-between gap-3 rounded-3xl p-4 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-lg font-extrabold text-[#00F5D4]">
                          {formatMZN(p.amount_mzn)}
                        </span>
                        <span className="rounded-full bg-[#1B2029] px-2.5 py-0.5 text-[10px] font-bold text-[#FF6B35]">
                          {p.method}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                            STATUS_BADGE[p.status] || 'bg-[#1B2029] text-[#94A3B8]'
                          }`}
                        >
                          {STATUS_LABEL[p.status] || p.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-bold text-[#F8FAFC]">
                        {p.user_name} · <span className="font-normal text-[#B9CAC4]">{p.user_email}</span>
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#94A3B8]">
                        Plano: {p.plan_name} · Ref: <span className="text-[#19D8F2]">{p.reference}</span> ·{' '}
                        {new Date(p.paid_at).toLocaleString('pt-MZ')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={p.status}
                        onChange={(e) => handleUpdatePaymentStatus(p, e.target.value)}
                        className="min-h-[38px] rounded-full border border-white/10 bg-[#070B14] px-3 text-xs font-bold text-[#F8FAFC]"
                      >
                        <option value="paid">Pago</option>
                        <option value="pending">Pendente</option>
                        <option value="failed">Falhou</option>
                        <option value="refunded">Reembolsado</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: PRICING MANAGEMENT ================= */}
        {activeTab === 'pricing' && (
          <div className="space-y-4">
            <div className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-3xl p-4">
              <div>
                <h2 className="font-display text-lg font-extrabold text-[#F8FAFC]">
                  Gestão da Precificação (MT)
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  Define preços, pacotes culturais, passes de fim de semana e licenças B2B.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openEditPlan(null)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#00F5D4] px-5 font-display text-xs font-extrabold text-[#070B14] shadow-md shadow-[#00F5D4]/25 transition active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Novo Plano
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`glass-card flex flex-col justify-between rounded-3xl p-5 ${
                    plan.featured ? 'border-[#00F5D4]/55 shadow-[0_0_24px_rgba(0,245,212,0.14)]' : ''
                  } ${!plan.active ? 'opacity-60' : ''}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="rounded-full bg-[#070B14] px-2.5 py-0.5 font-display text-[10px] font-bold uppercase text-[#19D8F2]">
                          {plan.billing_cycle}
                        </span>
                        <h3 className="font-display mt-2 text-lg font-extrabold text-[#F8FAFC]">
                          {plan.name}
                        </h3>
                      </div>
                      {plan.featured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FF6B35]/20 px-2.5 py-1 text-[10px] font-extrabold text-[#FF6B35]">
                          <Star className="h-3 w-3 fill-current" />
                          Destaque
                        </span>
                      )}
                    </div>

                    <p className="font-display mt-3 text-3xl font-extrabold text-[#00F5D4]">
                      {formatMZN(plan.price_mzn)}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#B9CAC4]">
                      {plan.description}
                    </p>

                    {Array.isArray(plan.features) && plan.features.length > 0 && (
                      <ul className="mt-3 space-y-1.5 border-t border-white/8 pt-3">
                        {plan.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-[#DFE2F0]">
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00FFA3]" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-2 border-t border-white/8 pt-3">
                    <span
                      className={`text-[11px] font-bold ${
                        plan.active ? 'text-[#00FFA3]' : 'text-[#94A3B8]'
                      }`}
                    >
                      {plan.active ? 'Ativo na loja' : 'Inativo'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditPlan(plan)}
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full bg-[#1B2029] px-3.5 text-xs font-bold text-[#F8FAFC] hover:bg-[#262A34]"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-[#00F5D4]" />
                        Editar
                      </button>
                      {plan.code !== 'free' && (
                        <button
                          type="button"
                          onClick={() => handleDeletePlan(plan)}
                          aria-label={`Remover ${plan.name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF3366]/15 text-[#FF3366]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal: Criar Utilizador */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title="Criar Nova Conta"
      >
        <form onSubmit={handleCreateUser} className="space-y-3">
          <input
            required
            placeholder="Nome completo"
            value={newUserForm.name}
            onChange={(e) => setNewUserForm((f) => ({ ...f, name: e.target.value }))}
            className="min-h-[46px] w-full rounded-2xl border border-white/10 bg-[#070B14] px-3.5 text-sm text-[#F8FAFC]"
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={newUserForm.email}
            onChange={(e) => setNewUserForm((f) => ({ ...f, email: e.target.value }))}
            className="min-h-[46px] w-full rounded-2xl border border-white/10 bg-[#070B14] px-3.5 text-sm text-[#F8FAFC]"
          />
          <input
            required
            minLength={6}
            type="password"
            placeholder="Senha (mín. 6 caracteres)"
            value={newUserForm.password}
            onChange={(e) => setNewUserForm((f) => ({ ...f, password: e.target.value }))}
            className="min-h-[46px] w-full rounded-2xl border border-white/10 bg-[#070B14] px-3.5 text-sm text-[#F8FAFC]"
          />
          <div className="grid grid-cols-2 gap-2.5">
            <select
              value={newUserForm.role}
              onChange={(e) =>
                setNewUserForm((f) => ({ ...f, role: e.target.value as 'admin' | 'user' }))
              }
              className="min-h-[46px] rounded-2xl border border-white/10 bg-[#070B14] px-3 text-xs font-bold text-[#F8FAFC]"
            >
              <option value="user">Utilizador</option>
              <option value="admin">Administrador</option>
            </select>
            <select
              value={newUserForm.plan_code}
              onChange={(e) => setNewUserForm((f) => ({ ...f, plan_code: e.target.value }))}
              className="min-h-[46px] rounded-2xl border border-white/10 bg-[#070B14] px-3 text-xs font-bold text-[#F8FAFC]"
            >
              {plans.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <input
              placeholder="Cidade (ex.: Maputo)"
              value={newUserForm.city}
              onChange={(e) => setNewUserForm((f) => ({ ...f, city: e.target.value }))}
              className="min-h-[46px] rounded-2xl border border-white/10 bg-[#070B14] px-3.5 text-sm text-[#F8FAFC]"
            />
            <input
              placeholder="Telefone (+258...)"
              value={newUserForm.phone}
              onChange={(e) => setNewUserForm((f) => ({ ...f, phone: e.target.value }))}
              className="min-h-[46px] rounded-2xl border border-white/10 bg-[#070B14] px-3.5 text-sm text-[#F8FAFC]"
            />
          </div>
          <button
            type="submit"
            className="mt-2 min-h-[52px] w-full rounded-full bg-[#00F5D4] font-display text-sm font-extrabold text-[#070B14]"
          >
            Guardar Conta no Banco
          </button>
        </form>
      </Modal>

      {/* Modal: Registar Pagamento */}
      <Modal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        title="Registar Pagamento"
      >
        <form onSubmit={handleCreatePayment} className="space-y-3">
          <input
            required
            placeholder="Nome do cliente"
            value={newPayForm.user_name}
            onChange={(e) => setNewPayForm((f) => ({ ...f, user_name: e.target.value }))}
            className="min-h-[46px] w-full rounded-2xl border border-white/10 bg-[#070B14] px-3.5 text-sm text-[#F8FAFC]"
          />
          <input
            required
            type="email"
            placeholder="Email do cliente"
            value={newPayForm.user_email}
            onChange={(e) => setNewPayForm((f) => ({ ...f, user_email: e.target.value }))}
            className="min-h-[46px] w-full rounded-2xl border border-white/10 bg-[#070B14] px-3.5 text-sm text-[#F8FAFC]"
          />
          <div className="grid grid-cols-2 gap-2.5">
            <select
              value={newPayForm.plan_code}
              onChange={(e) => {
                const chosen = plans.find((p) => p.code === e.target.value);
                setNewPayForm((f) => ({
                  ...f,
                  plan_code: e.target.value,
                  amount_mzn: chosen ? chosen.price_mzn : f.amount_mzn,
                }));
              }}
              className="min-h-[46px] rounded-2xl border border-white/10 bg-[#070B14] px-3 text-xs font-bold text-[#F8FAFC]"
            >
              {plans.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              required
              type="number"
              min={0}
              step="0.01"
              placeholder="Valor (MT)"
              value={newPayForm.amount_mzn}
              onChange={(e) => setNewPayForm((f) => ({ ...f, amount_mzn: Number(e.target.value) }))}
              className="min-h-[46px] rounded-2xl border border-white/10 bg-[#070B14] px-3.5 text-sm font-bold text-[#00F5D4]"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <select
              value={newPayForm.method}
              onChange={(e) => setNewPayForm((f) => ({ ...f, method: e.target.value }))}
              className="min-h-[46px] rounded-2xl border border-white/10 bg-[#070B14] px-3 text-xs font-bold text-[#F8FAFC]"
            >
              <option value="M-Pesa">M-Pesa</option>
              <option value="e-Mola">e-Mola</option>
              <option value="Cartão">Cartão</option>
              <option value="Transferência">Transferência</option>
            </select>
            <select
              value={newPayForm.status}
              onChange={(e) => setNewPayForm((f) => ({ ...f, status: e.target.value }))}
              className="min-h-[46px] rounded-2xl border border-white/10 bg-[#070B14] px-3 text-xs font-bold text-[#F8FAFC]"
            >
              <option value="paid">Pago</option>
              <option value="pending">Pendente</option>
              <option value="failed">Falhou</option>
            </select>
          </div>
          <input
            placeholder="Referência M-Pesa/e-Mola (opcional)"
            value={newPayForm.reference}
            onChange={(e) => setNewPayForm((f) => ({ ...f, reference: e.target.value }))}
            className="min-h-[46px] w-full rounded-2xl border border-white/10 bg-[#070B14] px-3.5 text-sm text-[#F8FAFC]"
          />
          <button
            type="submit"
            className="mt-2 min-h-[52px] w-full rounded-full bg-[#00F5D4] font-display text-sm font-extrabold text-[#070B14]"
          >
            Confirmar Pagamento
          </button>
        </form>
      </Modal>

      {/* Modal: Criar / Editar Plano de Precificação */}
      <Modal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        title={editingPlan ? `Editar Plano · ${editingPlan.name}` : 'Novo Plano de Precificação'}
      >
        <form onSubmit={handleSavePlan} className="space-y-3">
          {!editingPlan && (
            <input
              placeholder="Código único (ex.: pack_verao)"
              value={planForm.code}
              onChange={(e) => setPlanForm((f) => ({ ...f, code: e.target.value }))}
              className="min-h-[46px] w-full rounded-2xl border border-white/10 bg-[#070B14] px-3.5 text-sm text-[#F8FAFC]"
            />
          )}
          <input
            required
            placeholder="Nome do plano"
            value={planForm.name}
            onChange={(e) => setPlanForm((f) => ({ ...f, name: e.target.value }))}
            className="min-h-[46px] w-full rounded-2xl border border-white/10 bg-[#070B14] px-3.5 text-sm text-[#F8FAFC]"
          />
          <textarea
            rows={2}
            placeholder="Descrição curta"
            value={planForm.description}
            onChange={(e) => setPlanForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full rounded-2xl border border-white/10 bg-[#070B14] p-3.5 text-sm text-[#F8FAFC]"
          />
          <div className="grid grid-cols-2 gap-2.5">
            <input
              required
              type="number"
              min={0}
              step="0.01"
              placeholder="Preço (MT)"
              value={planForm.price_mzn}
              onChange={(e) => setPlanForm((f) => ({ ...f, price_mzn: Number(e.target.value) }))}
              className="min-h-[46px] rounded-2xl border border-white/10 bg-[#070B14] px-3.5 text-sm font-bold text-[#00F5D4]"
            />
            <select
              value={planForm.billing_cycle}
              onChange={(e) => setPlanForm((f) => ({ ...f, billing_cycle: e.target.value }))}
              className="min-h-[46px] rounded-2xl border border-white/10 bg-[#070B14] px-3 text-xs font-bold text-[#F8FAFC]"
            >
              <option value="gratuito">Gratuito</option>
              <option value="unico">Pagamento Único</option>
              <option value="fim_de_semana">Fim de Semana (72h)</option>
              <option value="mensal">Mensal</option>
              <option value="anual">Anual</option>
            </select>
          </div>
          <textarea
            rows={3}
            placeholder="Benefícios (1 por linha)"
            value={planForm.featuresText}
            onChange={(e) => setPlanForm((f) => ({ ...f, featuresText: e.target.value }))}
            className="w-full rounded-2xl border border-white/10 bg-[#070B14] p-3.5 text-xs text-[#F8FAFC]"
          />
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#070B14] px-4 py-3 text-xs font-bold">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={planForm.active}
                onChange={(e) => setPlanForm((f) => ({ ...f, active: e.target.checked }))}
              />
              Plano ativo
            </label>
            <label className="flex items-center gap-2 text-[#FF6B35]">
              <input
                type="checkbox"
                checked={planForm.featured}
                onChange={(e) => setPlanForm((f) => ({ ...f, featured: e.target.checked }))}
              />
              Destacar como popular
            </label>
          </div>
          <button
            type="submit"
            className="mt-2 min-h-[52px] w-full rounded-full bg-[#00F5D4] font-display text-sm font-extrabold text-[#070B14]"
          >
            Guardar Precificação
          </button>
        </form>
      </Modal>
    </div>
  );
}
