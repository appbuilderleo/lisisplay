export interface AdminUserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive' | 'blocked';
  plan_code: string;
  city: string;
  phone: string;
  created_at: string;
  last_login_at: string | null;
}

export interface ManagedPayment {
  id: string;
  user_id: string | null;
  user_name: string;
  user_email: string;
  plan_code: string;
  plan_name: string;
  amount_mzn: number;
  method: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  reference: string;
  paid_at: string;
}

export interface PricingPlan {
  id: string;
  code: string;
  name: string;
  description: string;
  price_mzn: number;
  billing_cycle: string;
  active: boolean;
  featured: boolean;
  features: string[];
  updated_at: string;
}

export interface AdminOverviewData {
  kpis: {
    totalUsers: number;
    activeUsers: number;
    adminUsers: number;
    newUsersPeriod: number;
    paidPlanUsers: number;
    conversionRate: number;
    revenueMzn: number;
    pendingMzn: number;
    avgTicketMzn: number;
    arpuMzn: number;
    totalPayments: number;
    paidCount: number;
    pendingCount: number;
    failedCount: number;
    approvalRate: number;
    totalGamePlays: number;
  };
  charts: {
    revenueSeries: { label: string; revenue: number; count: number }[];
    userSeries: { label: string; users: number }[];
    byMethod: { method: string; count: number; revenue: number }[];
    byPlan: { code: string; name: string; count: number }[];
    byGame: { gameId: string; plays: number }[];
  };
}

const TOKEN_STORAGE_KEY = 'lisis_admin_session_token';
const PROFILE_STORAGE_KEY = 'lisis_admin_profile';

export function getStoredAdminSession(): { token: string; admin: AdminUserProfile } | null {
  try {
    const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    const rawProfile = sessionStorage.getItem(PROFILE_STORAGE_KEY);
    if (!token || !rawProfile) return null;
    return { token, admin: JSON.parse(rawProfile) as AdminUserProfile };
  } catch {
    return null;
  }
}

export function saveAdminSession(token: string, admin: AdminUserProfile): void {
  try {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    sessionStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(admin));
  } catch {
    // ignore
  }
}

export function clearAdminSession(): void {
  try {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(PROFILE_STORAGE_KEY);
  } catch {
    // ignore
  }
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errMsg = (data as { error?: string }).error || `Erro HTTP ${response.status}`;
    throw new Error(errMsg);
  }
  return data as T;
}

export async function loginAdmin(email: string, password: string) {
  return apiRequest<{ token: string; admin: AdminUserProfile }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchOverview(
  token: string,
  filters: { range: string; method: string; status: string },
) {
  const params = new URLSearchParams(filters);
  return apiRequest<AdminOverviewData>(`/api/admin/overview?${params.toString()}`, {}, token);
}

export async function fetchUsers(
  token: string,
  filters: { search?: string; role?: string; status?: string } = {},
) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.role && filters.role !== 'all') params.set('role', filters.role);
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  return apiRequest<{ users: ManagedUser[] }>(`/api/admin/users?${params.toString()}`, {}, token);
}

export async function createUser(
  token: string,
  payload: {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'user';
    status: 'active' | 'inactive' | 'blocked';
    plan_code: string;
    city: string;
    phone: string;
  },
) {
  return apiRequest<{ user: ManagedUser }>(
    '/api/admin/users',
    { method: 'POST', body: JSON.stringify(payload) },
    token,
  );
}

export async function updateUser(
  token: string,
  payload: Partial<ManagedUser> & { id: string; password?: string },
) {
  return apiRequest<{ user: ManagedUser }>(
    '/api/admin/users',
    { method: 'PATCH', body: JSON.stringify(payload) },
    token,
  );
}

export async function deleteUser(token: string, id: string) {
  return apiRequest<{ deleted: boolean }>(
    `/api/admin/users?id=${encodeURIComponent(id)}`,
    { method: 'DELETE' },
    token,
  );
}

export async function fetchPayments(
  token: string,
  filters: { search?: string; status?: string; method?: string } = {},
) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters.method && filters.method !== 'all') params.set('method', filters.method);
  return apiRequest<{ payments: ManagedPayment[] }>(
    `/api/admin/payments?${params.toString()}`,
    {},
    token,
  );
}

export async function createPayment(
  token: string,
  payload: {
    user_name: string;
    user_email: string;
    plan_code: string;
    plan_name: string;
    amount_mzn: number;
    method: string;
    status: string;
    reference?: string;
  },
) {
  return apiRequest<{ payment: ManagedPayment }>(
    '/api/admin/payments',
    { method: 'POST', body: JSON.stringify(payload) },
    token,
  );
}

export async function updatePaymentStatus(token: string, id: string, status: string) {
  return apiRequest<{ payment: ManagedPayment }>(
    '/api/admin/payments',
    { method: 'PATCH', body: JSON.stringify({ id, status }) },
    token,
  );
}

export async function fetchPricingPlans(token: string) {
  return apiRequest<{ plans: PricingPlan[] }>('/api/admin/pricing', {}, token);
}

export async function createPricingPlan(
  token: string,
  payload: Omit<PricingPlan, 'id' | 'updated_at'>,
) {
  return apiRequest<{ plan: PricingPlan }>(
    '/api/admin/pricing',
    { method: 'POST', body: JSON.stringify(payload) },
    token,
  );
}

export async function updatePricingPlan(
  token: string,
  payload: Partial<PricingPlan> & { id: string },
) {
  return apiRequest<{ plan: PricingPlan }>(
    '/api/admin/pricing',
    { method: 'PATCH', body: JSON.stringify(payload) },
    token,
  );
}

export async function deletePricingPlan(token: string, id: string) {
  return apiRequest<{ deleted: boolean }>(
    `/api/admin/pricing?id=${encodeURIComponent(id)}`,
    { method: 'DELETE' },
    token,
  );
}

export function trackGamePlay(gameId: string): void {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;
  fetch('/api/telemetry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId, eventType: 'game_started' }),
    keepalive: true,
  }).catch(() => {
    // Silencioso offline
  });
}

export function formatMZN(value: number): string {
  return `${new Intl.NumberFormat('pt-MZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)} MT`;
}
