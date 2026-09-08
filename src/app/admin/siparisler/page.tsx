import { requireAdmin } from "@/lib/auth";
import { getActiveTableTabs } from "@/lib/orders-data";
import AutoRefresh from "@/components/admin/AutoRefresh";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import { cancelOrderAction, closeTableTabAction, markOrderDeliveredAction } from "../actions";

export const dynamic = "force-dynamic";

function formatPrice(n: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  });
}

export default async function ActiveOrdersPage() {
  await requireAdmin();
  const tabs = await getActiveTableTabs();

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <AutoRefresh intervalMs={8000} />
      <div className="mb-6">
        <p className="font-heading text-2xl font-extrabold text-ink">🧾 Aktif Siparişler</p>
        <p className="text-[13px] font-semibold text-muted">
          {tabs.length === 0 ? "Şu an açık masa yok." : `${tabs.length} masa açık — otomatik yenileniyor`}
        </p>
      </div>

      {tabs.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-8 text-center text-[13px] text-muted">
          Müşteri sipariş verdiğinde burada görünecek.
        </p>
      ) : (
        <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tabs.map((tab) => (
            <div
              key={tab.tableNumber}
              className="rounded-2xl border border-line bg-surface p-4 shadow-card"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="font-heading text-lg font-extrabold text-ink">
                  Masa {tab.tableNumber}
                </p>
                <form action={closeTableTabAction.bind(null, tab.tableNumber)}>
                  <ConfirmSubmitButton
                    confirmMessage={`Masa ${tab.tableNumber} kapatılsın mı? Toplam ${formatPrice(
                      tab.total,
                    )} ödendi olarak işaretlenecek.`}
                    className="rounded-full bg-accent px-4 py-2 text-[12.5px] font-bold text-white"
                  >
                    Masayı Kapat (Ödendi)
                  </ConfirmSubmitButton>
                </form>
              </div>

              <div className="max-h-[460px] space-y-3 overflow-y-auto pr-1 [scrollbar-width:thin]">
                {tab.orders.map((order) => (
                  <div key={order.id} className="rounded-xl bg-field p-3.5">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-[14px] font-bold text-ink">👤 {order.customerName}</p>
                        <p className="text-[11.5px] font-semibold text-muted">
                          {formatTime(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {order.rewardRedeemed && (
                          <span className="text-[11.5px] font-bold text-accent">
                            🎉 Ödül kullanıldı
                          </span>
                        )}
                        {order.delivered ? (
                          <span className="rounded-full bg-emerald-600/15 px-3 py-1 text-[11.5px] font-bold text-emerald-600">
                            ✅ Teslim Edildi
                          </span>
                        ) : (
                          <form action={markOrderDeliveredAction.bind(null, order.id)}>
                            <button
                              type="submit"
                              className="rounded-full bg-amber-500/15 px-3 py-1 text-[11.5px] font-bold text-amber-600"
                            >
                              🕓 Sipariş Bekliyor · Teslim Et
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      {order.items.map((it) => (
                        <div
                          key={it.id}
                          className="flex items-center justify-between text-[13.5px]"
                        >
                          <span className="text-ink">
                            {it.quantity}× {it.nameTr}
                          </span>
                          <span className="font-semibold text-ink">
                            {formatPrice(it.lineTotal)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-2.5 flex justify-end border-t border-line/60 pt-2">
                      <form action={cancelOrderAction.bind(null, order.id)}>
                        <ConfirmSubmitButton
                          confirmMessage="Bu sipariş iptal edilsin mi? Yanlış girilen sipariş için — kalıcı olarak silinir."
                          className="text-[11.5px] font-bold text-muted"
                        >
                          Siparişi İptal Et
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                <span className="text-[13px] font-bold text-ink">Adisyon Toplamı</span>
                <span className="font-heading text-[17px] font-extrabold text-accent">
                  {formatPrice(tab.total)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
