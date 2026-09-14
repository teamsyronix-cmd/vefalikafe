"use client";

import { useActionState, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useCart } from "./CartProvider";
import { useCustomer } from "./CustomerProvider";
import { useStarsEnabled } from "./StarsSystemProvider";
import AuthModal from "./AuthModal";
import { placeOrderAction, type PlaceOrderState } from "@/app/actions/orders";

function formatPrice(price: number, locale: string) {
  return new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(price);
}

const INITIAL: PlaceOrderState = {};

export default function CartDrawer() {
  const locale = useLocale() as "tr" | "en";
  const { items, removeItem, setQty, clear, totalCount, totalPrice, isOpen, open, close } =
    useCart();
  const customer = useCustomer();
  const starsEnabled = useStarsEnabled();
  const [authOpen, setAuthOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [redeemReward, setRedeemReward] = useState(false);
  const [state, formAction, pending] = useActionState(placeOrderAction, INITIAL);

  useEffect(() => {
    if (state.success) {
      clear();
      setTableNumber("");
      setRedeemReward(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  const canRedeem = starsEnabled && !!customer && customer.stars >= 10;

  if (totalCount === 0 && !isOpen) return null;

  return (
    <>
      {/* Yüzen sepet butonu */}
      {totalCount > 0 && !isOpen && (
        <button
          type="button"
          onClick={open}
          className="fixed bottom-5 right-5 z-[140] flex items-center gap-2 rounded-full bg-accent px-5 py-3.5 text-white shadow-panel"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.5 3h2l2.6 12.6a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L21.5 7H6" />
          </svg>
          <span className="text-[14px] font-bold">{totalCount}</span>
          <span className="text-[14px] font-bold">{formatPrice(totalPrice, locale)}</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[160] flex items-end justify-center bg-black/50 sm:items-center" onClick={close}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-panel sm:max-w-md sm:rounded-[28px] sm:p-7"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="font-heading text-[19px] font-extrabold text-ink">Sepetim</p>
              <button
                type="button"
                onClick={close}
                aria-label="Kapat"
                className="grid h-8 w-8 place-items-center rounded-full bg-chip text-ink"
              >
                ✕
              </button>
            </div>

            {items.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">Sepetiniz boş.</p>
            ) : (
              <div className="space-y-2.5">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 rounded-2xl bg-surface p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-bold text-ink">
                        {locale === "tr" ? item.nameTr : item.nameEn}
                      </p>
                      <p className="text-[12.5px] font-semibold text-muted">
                        {formatPrice(item.price, locale)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQty(item.productId, item.qty - 1)}
                        className="grid h-7 w-7 place-items-center rounded-full bg-chip text-ink"
                      >
                        −
                      </button>
                      <span className="w-4 text-center text-[13px] font-bold text-ink">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(item.productId, item.qty + 1)}
                        className="grid h-7 w-7 place-items-center rounded-full bg-chip text-ink"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {items.length > 0 && (
              <>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                  <span className="text-[14px] font-bold text-ink">Toplam</span>
                  <span className="font-heading text-[18px] font-extrabold text-accent">
                    {formatPrice(totalPrice, locale)}
                  </span>
                </div>

                {!customer ? (
                  <button
                    type="button"
                    onClick={() => setAuthOpen(true)}
                    className="mt-4 w-full rounded-xl bg-accent py-3 text-[14px] font-bold text-white"
                  >
                    Sipariş vermek için giriş yap
                  </button>
                ) : (
                  <form action={formAction} className="mt-4 space-y-3">
                    <input type="hidden" name="items" value={JSON.stringify(items)} />
                    <input
                      name="table_number"
                      required
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="Masa No"
                      className="w-full rounded-xl border border-line bg-field px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-accent"
                    />
                    {canRedeem && (
                      <label className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                        <input
                          type="checkbox"
                          name="redeem_reward"
                          checked={redeemReward}
                          onChange={(e) => setRedeemReward(e.target.checked)}
                          className="h-4 w-4 accent-accent"
                        />
                        🎉 10 yıldızımı kullanarak bir ürünü bedava al
                      </label>
                    )}
                    {state.error && (
                      <p className="text-[12.5px] font-semibold text-accent">{state.error}</p>
                    )}
                    {state.success && (
                      <p className="text-[12.5px] font-semibold text-emerald-600">
                        Siparişin alındı! Afiyet olsun 🎉
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={pending}
                      className="w-full rounded-xl bg-accent py-3 text-[14px] font-bold text-white disabled:opacity-60"
                    >
                      {pending ? "Gönderiliyor..." : "Siparişi Ver"}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}
