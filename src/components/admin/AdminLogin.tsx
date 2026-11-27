import { useState, type FormEvent } from 'react';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { AdminUserProfile, loginAdmin } from '../../lib/adminApi';

interface AdminLoginProps {
  onSuccess: (token: string, admin: AdminUserProfile) => void;
  onExit: () => void;
}

export function AdminLogin({ onSuccess, onExit }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await loginAdmin(email.trim(), password);
      onSuccess(res.token, res.admin);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar sessão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-x-clip bg-[#070B14] px-4 py-8">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#00F5D4]/10 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#FF6B35]/10 blur-[110px]" />

      <div className="relative z-10 w-full max-w-[420px]">
        <button
          type="button"
          onClick={onExit}
          className="glass-card mb-5 inline-flex min-h-[42px] items-center gap-2 rounded-full px-4 text-xs font-bold text-[#B9CAC4] transition hover:text-[#00F5D4]"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar à LisisPlay
        </button>

        <div className="glass-card rounded-[2rem] border-[#00F5D4]/25 p-6 shadow-2xl sm:p-7">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#00F5D4]/35 bg-[#F8FAFC] p-3 shadow-[0_0_24px_rgba(0,245,212,0.22)]">
              <img
                src="/simbolo.png"
                alt="LisisPlay"
                className="h-full w-full translate-x-[1px] object-contain"
              />
            </div>

            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#00F5D4]/12 px-3 py-1 font-display text-[10px] font-extrabold uppercase tracking-widest text-[#00F5D4]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Acesso Restrito · Admin
            </span>

            <h1 className="font-display mt-3 whitespace-nowrap text-2xl font-extrabold text-[#F8FAFC]">
              Gestão <span className="text-[#FF6B35]">LisisPlay</span>
            </h1>
            <p className="mt-1 text-xs text-[#94A3B8]">
              Autentica-te com as credenciais de administrador registadas no CockroachDB.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#B9CAC4]">
                Email do Administrador
              </label>
              <div className="relative flex items-center">
                <Mail className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#00F5D4]" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lisisplay.co.mz"
                  className="min-h-[50px] w-full rounded-2xl border border-white/12 bg-[#070B14] pl-10 pr-4 text-sm font-medium text-[#F8FAFC] placeholder:text-[#94A3B8]/50 focus:border-[#00F5D4] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#B9CAC4]">
                Senha
              </label>
              <div className="relative flex items-center">
                <Lock className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#00F5D4]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="min-h-[50px] w-full rounded-2xl border border-white/12 bg-[#070B14] pl-10 pr-12 text-sm font-medium text-[#F8FAFC] placeholder:text-[#94A3B8]/50 focus:border-[#00F5D4] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
                  className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-xl text-[#94A3B8] hover:text-[#F8FAFC]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-[#FF3366]/40 bg-[#FF3366]/12 px-4 py-3 text-xs font-semibold text-[#FFB4AB]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-[54px] w-full items-center justify-center rounded-full bg-[#00F5D4] font-display text-base font-extrabold text-[#070B14] shadow-[0_8px_28px_-4px_rgba(0,245,212,0.42)] transition active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'A verificar credenciais...' : 'Entrar no Painel'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
