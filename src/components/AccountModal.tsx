"use client";

import { useActionState, useState } from "react";
import { useCustomer } from "./CustomerProvider";
import { useStarsEnabled } from "./StarsSystemProvider";
import CoffeeCup from "./CoffeeCup";
import {
  logoutCustomerAction,
  updateCustomerPasswordAction,
  updateCustomerProfileAction,
  type CustomerAuthState,
} from "@/app/actions/customer-auth";

const INITIAL: CustomerAuthState = {};

export default function AccountModal({ onClose }: { onClose: () => void }) {
  const customer = useCustomer();
  const starsEnabled = useStarsEnabled();
  const [profileState, profileAction, profilePending] = useActionState(
    updateCustomerProfileAction,
    INITIAL,
  );
  const [passwordState, passwordAction, passwordPending] = useActionState(
    updateCustomerPasswordAction,
    INITIAL,
  );
  const [newPassword, setNewPassword] = useState("");

  if (!customer) return null;

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/50 p-5"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[88vh] w-full max-w-sm overflow-y-auto rounded-[24px] bg-white p-6 shadow-panel"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Kapat"
          className="absolute right-4 top-4 z-[1] grid h-7 w-7 place-items-center rounded-full bg-chip text-ink"
        >
          ✕
        </button>

        <p className="mb-5 font-heading text-[19px] font-extrabold tracking-tight text-ink">
          Hesabım
        </p>

        {starsEnabled && (
          <>
            <div className="mb-2 flex justify-center rounded-2xl bg-surface py-5">
              <CoffeeCup stars={customer.stars} />
            </div>
            <p className="mb-6 text-center text-[12px] font-semibold text-muted">
              🏆 Tüm zamanlar kazandığın yıldız:{" "}
              <span className="font-bold text-ink">{customer.lifetimeStars}</span>
            </p>
            {customer.stars >= 10 && (
              <p className="mb-5 text-center text-[12.5px] font-bold text-accent">
                🎉 {Math.floor(customer.stars / 10)} bedava kahve/tatlı hakkın var — sipariş
                verirken kullanabilirsin!
              </p>
            )}
          </>
        )}

        <form action={profileAction} className="space-y-3">
          <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-muted">
            Bilgilerim
          </p>
          <input
            name="name"
            defaultValue={customer.name}
            required
            placeholder="Ad Soyad"
            className="w-full rounded-xl border border-line bg-field px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-accent"
          />
          <input
            name="email"
            type="email"
            defaultValue={customer.email}
            required
            placeholder="E-posta"
            className="w-full rounded-xl border border-line bg-field px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-accent"
          />
          {profileState.error && (
            <p className="text-[12.5px] font-semibold text-accent">{profileState.error}</p>
          )}
          {profileState.success && (
            <p className="text-[12.5px] font-semibold text-emerald-600">Bilgiler güncellendi.</p>
          )}
          <button
            type="submit"
            disabled={profilePending}
            className="w-full rounded-xl bg-accent py-2.5 text-[13.5px] font-bold text-white disabled:opacity-60"
          >
            {profilePending ? "Kaydediliyor..." : "Bilgileri Kaydet"}
          </button>
        </form>

        <form action={passwordAction} className="mt-5 space-y-3 border-t border-line pt-5">
          <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-muted">
            Şifre Değiştir
          </p>
          <input
            name="password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Yeni şifre (en az 6 karakter)"
            className="w-full rounded-xl border border-line bg-field px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-accent"
          />
          {passwordState.error && (
            <p className="text-[12.5px] font-semibold text-accent">{passwordState.error}</p>
          )}
          {passwordState.success && (
            <p className="text-[12.5px] font-semibold text-emerald-600">Şifre güncellendi.</p>
          )}
          <button
            type="submit"
            disabled={passwordPending || newPassword.length < 6}
            className="w-full rounded-xl bg-chip py-2.5 text-[13.5px] font-bold text-ink disabled:opacity-60"
          >
            {passwordPending ? "Güncelleniyor..." : "Şifreyi Güncelle"}
          </button>
        </form>

        <form action={logoutCustomerAction} className="mt-5">
          <button
            type="submit"
            className="w-full rounded-xl bg-field py-2.5 text-[13px] font-bold text-muted"
          >
            Çıkış Yap
          </button>
        </form>
      </div>
    </div>
  );
}
