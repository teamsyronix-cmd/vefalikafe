"use client";

import { useState } from "react";
import type { CustomerRow } from "@/lib/orders-data";
import {
  addCustomerAction,
  addCustomerStarsAction,
  deleteCustomerAction,
  resetCustomerPasswordAction,
} from "@/app/admin/actions";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Istanbul",
  });
}

export default function CustomerManager({
  customers,
  canEdit = false,
}: {
  customers: CustomerRow[];
  canEdit?: boolean;
}) {
  const [editModeRaw, setEditMode] = useState(false);
  const editMode = canEdit && editModeRaw;

  return (
    <div>
      {canEdit ? (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setEditMode((v) => !v)}
            className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
              editMode ? "bg-accent text-white" : "bg-chip text-ink"
            }`}
          >
            {editMode ? "✕ Düzenlemeyi Kapat" : "✎ Üyeleri Düzenle"}
          </button>
        </div>
      ) : (
        <p className="mb-4 rounded-xl bg-chip px-4 py-2.5 text-[12px] font-semibold text-muted">
          👁 Görüntüleme modu — müşteri kayıtlarını yalnızca yönetici düzenleyebilir.
        </p>
      )}

      {editMode && (
        <p className="mb-4 rounded-xl bg-chip px-4 py-3 text-[12.5px] leading-snug text-muted">
          🔒 Güvenlik nedeniyle şifreler hiçbir zaman düz metin olarak saklanmaz/görüntülenemez.
          Bir üyenin şifresini unuttuysa, aşağıdan onun için yeni bir şifre belirleyebilirsin.
        </p>
      )}

      {editMode && (
        <form
          action={addCustomerAction}
          className="mb-5 grid grid-cols-1 gap-2 rounded-2xl border-2 border-dashed border-line p-4 sm:grid-cols-[1fr_1fr_1fr_auto]"
        >
          <p className="text-[13px] font-bold text-ink sm:col-span-4">+ Yeni Müşteri Ekle</p>
          <input
            name="name"
            required
            placeholder="Ad Soyad"
            className="min-w-0 rounded-xl border border-line bg-field px-3 py-2 text-[14px] text-ink outline-none focus:border-accent"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="E-posta"
            className="min-w-0 rounded-xl border border-line bg-field px-3 py-2 text-[14px] text-ink outline-none focus:border-accent"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Şifre (en az 6 karakter)"
            className="min-w-0 rounded-xl border border-line bg-field px-3 py-2 text-[14px] text-ink outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-panel-solid px-4 py-2 text-[13px] font-bold text-white"
          >
            Ekle
          </button>
        </form>
      )}

      {customers.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-8 text-center text-[13px] text-muted">
          Henüz kayıt olan müşteri yok.
        </p>
      ) : (
        <div className="space-y-2.5">
          {customers.map((c) => {
            const progress = c.stars % 10;
            const rewards = Math.floor(c.stars / 10);
            return (
              <div
                key={c.id}
                className="rounded-2xl border border-line bg-surface p-4 shadow-card"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-bold text-ink">
                      {c.name || "İsimsiz"}
                    </p>
                    <p className="truncate text-[12.5px] text-muted">{c.email}</p>
                    <p className="mt-0.5 text-[11px] text-muted">
                      Kayıt: {formatDate(c.createdAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <div className="w-32">
                      <div className="flex items-center justify-between text-[11px] font-bold text-muted">
                        <span>⭐ {c.stars}</span>
                        <span>{progress}/10</span>
                      </div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-chip">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${(progress / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                    {rewards > 0 && (
                      <span className="rounded-full bg-accent/15 px-3 py-1.5 text-[11.5px] font-bold text-accent">
                        🎁 {rewards}
                      </span>
                    )}

                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => addCustomerStarsAction(c.id, 1)}
                        title="1 yıldız ekle"
                        className="rounded-full bg-chip px-3 py-1.5 text-[12px] font-bold text-ink"
                      >
                        +1 ⭐
                      </button>
                    )}

                    {editMode && (
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            confirm(
                              `"${c.name || c.email}" müşterisini silmek istediğine emin misin? Bu işlem geri alınamaz.`,
                            )
                          ) {
                            deleteCustomerAction(c.id);
                          }
                        }}
                        className="rounded-full bg-field px-3 py-1.5 text-[12px] font-bold text-accent"
                      >
                        🗑 Sil
                      </button>
                    )}
                  </div>
                </div>

                {editMode && (
                  <form
                    action={resetCustomerPasswordAction}
                    className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3"
                  >
                    <input type="hidden" name="customer_id" value={c.id} />
                    <span className="text-[12px] font-bold text-muted">🔑 Yeni şifre:</span>
                    <input
                      name="password"
                      type="text"
                      placeholder="en az 6 karakter"
                      className="min-w-0 flex-1 rounded-xl border border-line bg-field px-3 py-1.5 text-[13px] text-ink outline-none focus:border-accent"
                    />
                    <button
                      type="submit"
                      className="shrink-0 rounded-xl bg-chip px-3 py-1.5 text-[12px] font-bold text-ink"
                    >
                      Şifreyi Sıfırla
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
