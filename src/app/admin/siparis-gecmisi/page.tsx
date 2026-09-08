import { requireAdmin } from "@/lib/auth";
import { getEarningsSummary, getOrderHistory } from "@/lib/orders-data";
import HistoryTabs from "@/components/admin/HistoryTabs";

export const dynamic = "force-dynamic";

function formatPrice(n: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  });
}

export default async function OrderHistoryPage() {
  const session = await requireAdmin();
  const isManager = session.role === "mudur";

  // Kazanç yalnızca müdüre gösterilir — garson için hesaplanmaz bile.
  const [orders, earnings] = await Promise.all([
    getOrderHistory(),
    isManager ? getEarningsSummary() : Promise.resolve(null),
  ]);

  const maxDaily = earnings ? Math.max(1, ...earnings.daily.map((d) => d.total)) : 1;

  const listView =
    orders.length === 0 ? (
      <p className="rounded-2xl border border-dashed border-line p-8 text-center text-[13px] text-muted">
        Henüz kapanmış (ödenmiş) sipariş yok.
      </p>
    ) : (
      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-2xl border border-line bg-surface p-4 shadow-card"
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[14px] font-bold text-ink">
                Masa {order.tableNumber} · {order.customerName}
              </p>
              <span className="text-[12px] font-semibold text-muted">
                {formatTime(order.closedAt ?? order.createdAt)}
              </span>
            </div>
            <div className="space-y-1">
              {order.items.map((it) => (
                <div key={it.id} className="flex items-center justify-between text-[13px]">
                  <span className="text-ink">
                    {it.quantity}× {it.nameTr}
                  </span>
                  <span className="font-semibold text-ink">{formatPrice(it.lineTotal)}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
              <span className="text-[12.5px] font-bold text-muted">Toplam</span>
              <span className="font-heading text-[15px] font-extrabold text-accent">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>
        ))}
      </div>
    );

  const earningsView = earnings && (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: "Bugün", data: earnings.today },
          { label: "Bu Hafta", data: earnings.week },
          { label: "Bu Ay", data: earnings.month },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-muted">
              {c.label}
            </p>
            <p className="mt-1.5 font-heading text-[24px] font-extrabold leading-none text-accent">
              {formatPrice(c.data.total)}
            </p>
            <p className="mt-1.5 text-[11px] font-semibold text-muted">
              {c.data.count} sipariş
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
        <div className="mb-3 flex items-end justify-between gap-3">
          <p className="font-heading text-[15px] font-extrabold text-ink">Son 14 Gün</p>
          <p className="text-[11px] font-semibold text-muted">
            Tüm zamanlar: {formatPrice(earnings.allTime.total)} · {earnings.allTime.count} sipariş
          </p>
        </div>
        <div className="space-y-1.5">
          {earnings.daily.map((d) => (
            <div key={d.label} className="flex items-center gap-3">
              <span className="w-14 shrink-0 text-[11px] font-semibold text-muted">
                {d.label}
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-chip">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent-deep to-accent"
                  style={{ width: `${(d.total / maxDaily) * 100}%` }}
                />
              </div>
              <span className="w-24 shrink-0 text-right text-[12px] font-bold text-ink">
                {formatPrice(d.total)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <div className="mb-6">
        <p className="font-heading text-2xl font-extrabold text-ink">📜 Sipariş Geçmişi</p>
        <p className="text-[13px] font-semibold text-muted">
          {orders.length} kapanmış sipariş
          {earnings && ` · bu ay ${formatPrice(earnings.month.total)} kazanç`}
        </p>
      </div>

      {earningsView ? (
        <HistoryTabs list={listView} earnings={earningsView} />
      ) : (
        listView
      )}
    </div>
  );
}
