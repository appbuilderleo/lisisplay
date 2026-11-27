import { formatMZN } from '../../lib/adminApi';

interface BarPoint {
  label: string;
  value: number;
  sublabel?: string;
}

export function BarSeriesChart({
  title,
  subtitle,
  data,
  color = '#00F5D4',
  valueFormatter = (v) => String(v),
}: {
  title: string;
  subtitle: string;
  data: BarPoint[];
  color?: string;
  valueFormatter?: (v: number) => string;
}) {
  const maxVal = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="glass-card rounded-3xl p-5">
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <div>
          <h3 className="font-display text-base font-extrabold text-[#F8FAFC]">{title}</h3>
          <p className="text-xs text-[#94A3B8]">{subtitle}</p>
        </div>
        {data.length > 0 && (
          <span className="font-display text-xs font-bold" style={{ color }}>
            Máx: {valueFormatter(maxVal)}
          </span>
        )}
      </div>

      {data.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-2xl bg-[#070B14]/70 text-xs text-[#94A3B8]">
          Sem registos neste período para o filtro selecionado.
        </div>
      ) : (
        <div className="flex h-44 items-end gap-2 overflow-x-auto pb-1 pt-4">
          {data.map((pt, i) => {
            const pct = Math.max(8, Math.round((pt.value / maxVal) * 100));
            return (
              <div
                key={`${pt.label}-${i}`}
                className="group flex min-w-[34px] flex-1 flex-col items-center gap-1.5"
              >
                <span className="text-[10px] font-bold tabular-nums text-[#B9CAC4] opacity-80 group-hover:text-[#F8FAFC]">
                  {valueFormatter(pt.value)}
                </span>
                <div className="flex h-28 w-full items-end justify-center rounded-xl bg-[#070B14]/80 p-1">
                  <div
                    className="w-full max-w-[30px] rounded-lg transition-all duration-300"
                    style={{
                      height: `${pct}%`,
                      background: `linear-gradient(180deg, ${color} 0%, ${color}66 100%)`,
                      boxShadow: `0 0 14px ${color}33`,
                    }}
                  />
                </div>
                <span className="font-display text-[10px] font-bold text-[#94A3B8]">
                  {pt.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const DONUT_COLORS = ['#00F5D4', '#FF6B35', '#19D8F2', '#00FFA3', '#FF3366'];

export function PaymentMethodsDonut({
  data,
}: {
  data: { method: string; count: number; revenue: number }[];
}) {
  const total = data.reduce((sum, d) => sum + d.revenue, 0);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;

  return (
    <div className="glass-card rounded-3xl p-5">
      <div className="mb-4">
        <h3 className="font-display text-base font-extrabold text-[#F8FAFC]">
          Receita por Método
        </h3>
        <p className="text-xs text-[#94A3B8]">Distribuição M-Pesa, e-Mola e outros</p>
      </div>

      {data.length === 0 || total === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-2xl bg-[#070B14]/70 text-xs text-[#94A3B8]">
          Sem pagamentos aprovados no filtro atual.
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
            <svg className="h-32 w-32 -rotate-90" viewBox="0 0 112 112">
              <circle
                cx="56"
                cy="56"
                r={radius}
                fill="none"
                stroke="#070B14"
                strokeWidth="14"
              />
              {data.map((slice, idx) => {
                const frac = slice.revenue / total;
                const dash = frac * circumference;
                const offset = -cumulativeOffset;
                cumulativeOffset += dash;
                return (
                  <circle
                    key={slice.method}
                    cx="56"
                    cy="56"
                    r={radius}
                    fill="none"
                    stroke={DONUT_COLORS[idx % DONUT_COLORS.length]}
                    strokeWidth="14"
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={offset}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold uppercase text-[#94A3B8]">Total</span>
              <span className="font-display text-xs font-extrabold text-[#F8FAFC]">
                {formatMZN(total)}
              </span>
            </div>
          </div>

          <ul className="w-full flex-1 space-y-2">
            {data.map((slice, idx) => {
              const pct = Math.round((slice.revenue / total) * 100);
              return (
                <li
                  key={slice.method}
                  className="flex items-center justify-between gap-2 rounded-xl bg-[#070B14]/75 px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }}
                    />
                    <span className="font-bold text-[#F8FAFC]">{slice.method}</span>
                    <span className="text-[#94A3B8]">({slice.count})</span>
                  </div>
                  <div className="text-right">
                    <span className="font-display font-extrabold text-[#00F5D4]">
                      {formatMZN(slice.revenue)}
                    </span>
                    <span className="ml-1.5 text-[10px] text-[#94A3B8]">{pct}%</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export function HorizontalRankChart({
  title,
  subtitle,
  items,
  color = '#FF6B35',
  unitLabel = '',
}: {
  title: string;
  subtitle: string;
  items: { label: string; value: number }[];
  color?: string;
  unitLabel?: string;
}) {
  const maxVal = Math.max(1, ...items.map((i) => i.value));

  return (
    <div className="glass-card rounded-3xl p-5">
      <div className="mb-4">
        <h3 className="font-display text-base font-extrabold text-[#F8FAFC]">{title}</h3>
        <p className="text-xs text-[#94A3B8]">{subtitle}</p>
      </div>

      {items.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-2xl bg-[#070B14]/70 text-xs text-[#94A3B8]">
          Ainda sem dados registados.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const pct = Math.max(6, Math.round((item.value / maxVal) * 100));
            return (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#F8FAFC]">{item.label}</span>
                  <span className="font-display font-extrabold" style={{ color }}>
                    {item.value}
                    {unitLabel ? ` ${unitLabel}` : ''}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#070B14]">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
