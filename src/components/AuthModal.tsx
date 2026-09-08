"use client";

import { useActionState, useEffect, useState } from "react";
import { loginCustomerAction, registerCustomerAction, type CustomerAuthState } from "@/app/actions/customer-auth";

const INITIAL: CustomerAuthState = {};

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loginState, loginFormAction, loginPending] = useActionState(loginCustomerAction, INITIAL);
  const [registerState, registerFormAction, registerPending] = useActionState(
    registerCustomerAction,
    INITIAL,
  );

  // Başarılı girişte (hata yok, alan boş) modalı kapat.
  useEffect(() => {
    if (!loginPending && loginState === INITIAL) return;
    if (!loginPending && !loginState.error && loginState !== INITIAL) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginState, loginPending]);

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/50 p-5"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm overflow-hidden rounded-[24px] bg-white p-6 shadow-panel"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Kapat"
          className="absolute right-4 top-4 z-[1] grid h-7 w-7 place-items-center rounded-full bg-chip text-ink"
        >
          ✕
        </button>

        <div className="mb-5 flex gap-2 pr-9">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`flex-1 rounded-xl py-2.5 text-[13.5px] font-bold transition-colors ${
              tab === "login" ? "bg-accent text-white" : "bg-chip text-muted"
            }`}
          >
            Giriş Yap
          </button>
          <button
            type="button"
            onClick={() => setTab("register")}
            className={`flex-1 rounded-xl py-2.5 text-[13.5px] font-bold transition-colors ${
              tab === "register" ? "bg-accent text-white" : "bg-chip text-muted"
            }`}
          >
            Kayıt Ol
          </button>
        </div>

        {tab === "login" ? (
          <form action={loginFormAction} className="space-y-3">
            <input
              name="email"
              type="email"
              required
              placeholder="E-posta"
              className="w-full rounded-xl border border-line bg-field px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-accent"
            />
            <input
              name="password"
              type="password"
              required
              placeholder="Şifre"
              className="w-full rounded-xl border border-line bg-field px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-accent"
            />
            {loginState.error && (
              <p className="text-[12.5px] font-semibold text-accent">{loginState.error}</p>
            )}
            <button
              type="submit"
              disabled={loginPending}
              className="w-full rounded-xl bg-accent py-2.5 text-[13.5px] font-bold text-white disabled:opacity-60"
            >
              {loginPending ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>
        ) : (
          <form action={registerFormAction} className="space-y-3">
            <input
              name="name"
              required
              placeholder="Ad Soyad"
              className="w-full rounded-xl border border-line bg-field px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-accent"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="E-posta"
              className="w-full rounded-xl border border-line bg-field px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-accent"
            />
            <input
              name="password"
              type="password"
              required
              placeholder="Şifre (en az 6 karakter)"
              className="w-full rounded-xl border border-line bg-field px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-accent"
            />
            {registerState.error && (
              <p className="text-[12.5px] font-semibold text-accent">{registerState.error}</p>
            )}
            {registerState.needsEmailConfirm && (
              <p className="text-[12.5px] font-semibold text-emerald-600">
                Kayıt başarılı! E-postanı onaylayıp giriş yapabilirsin.
              </p>
            )}
            <button
              type="submit"
              disabled={registerPending}
              className="w-full rounded-xl bg-accent py-2.5 text-[13.5px] font-bold text-white disabled:opacity-60"
            >
              {registerPending ? "Kayıt oluşturuluyor..." : "Kayıt Ol"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
