import type { TopProductsResult, TrendMetric, VisitStats } from "@/lib/menu-data";

// Küçük çizgi grafiği — tek seri, 2px çizgi, eksen yok (recessive). Marka bordo.
function Sparkline({ data, className }: { data: number[]; className?: string }) {
  const w = 120;
  const h = 32;
  const pad = 3;
  const max = Math.max(1, ...data);
  const step = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0;
  const pts = data.map(
    (v, i) => [pad + i * step, h - pad - (v / max) * (h - pad * 2)] as const,
  );
  const line = pts
    .map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(" ");
  const last = pts[pts.length - 1];
  const area = `${line} L${last[0].toFixed(1)} ${h} L${pts[0][0].toFixed(1)} ${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <path d={area} className="fill-accent/15" />
      <path
        d={line}
        className="fill-none stroke-accent"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function Delta({ pct }: { pct: number | null }) {
  if (pct === null) {
    return (
      <span className="rounded-full bg-chip px-1.5 py-0.5 text-[11px] font-bold text-muted">
        yeni
      </span>
    );
  }
  if (pct === 0) {
    return (
      <span className="rounded-full bg-chip px-1.5 py-0.5 text-[11px] font-bold text-muted">
        %0
      </span>
    );
  }
  const up = pct > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
        up ? "bg-emerald-500/15 text-emerald-500" : "bg-red-500/15 text-red-400"
      }`}
    >
      {up ? "▲" : "▼"} %{Math.abs(pct)}
    </span>
  );
}

function StatTile({
  label,
  metric,
  spark,
}: {
  label: string;
  metric: TrendMetric;
  spark: number[];
}) {
  return (
    <div className="rounded-2xl bg-field p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-muted">
          {label}
        </p>
        <Delta pct={metric.deltaPct} />
      </div>
      <p className="mt-1.5 font-heading text-[26px] font-extrabold leading-none text-ink">
        {metric.value.toLocaleString("tr-TR")}
      </p>
      {spark.length > 1 && <Sparkline data={spark} className="mt-2.5 h-8 w-full" />}
      <p className="mt-1.5 text-[10.5px] font-semibold text-muted">
        önceki dönem: {metric.prev.toLocaleString("tr-TR")}
      </p>
    </div>
  );
}

export function VisitStatCards({ stats }: { stats: VisitStats }) {
  const spark = stats.daily.map((d) => d.count);
  const spark7 = spark.slice(-7);
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <StatTile label="Son 24 Saat" metric={stats.last24h} spark={spark7} />
      <StatTile label="Son 7 Gün" metric={stats.last7d} spark={spark7} />
      <StatTile label="Son 30 Gün" metric={stats.last30d} spark={spark} />
    </div>
  );
}

export function TopProductsList({ data }: { data: TopProductsResult }) {
  if (data.items.length === 0) {
    return (
      <p className="rounded-2xl bg-field p-4 text-[13px] text-muted">
        {data.monthLabel} ayında henüz sipariş yok.
      </p>
    );
  }
  const max = Math.max(1, ...data.items.map((i) => i.quantity));

  return (
    <div className="space-y-3">
      {data.items.map((p, i) => (
        <div key={p.name} className="flex items-center gap-3">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-accent/15 text-[11px] font-extrabold text-accent">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="truncate text-[13px] font-bold text-ink">{p.name}</p>
              <p className="shrink-0 text-[12px] font-semibold text-muted">
                {p.quantity} adet
                {p.revenue > 0 && (
                  <span className="ml-1.5 text-[11px] text-muted/70">
                    · ₺{Math.round(p.revenue).toLocaleString("tr-TR")}
                  </span>
                )}
              </p>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-chip">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-deep to-accent"
                style={{ width: `${(p.quantity / max) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
