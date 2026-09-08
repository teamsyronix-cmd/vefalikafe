"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";

const initialState: LoginState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="w-full max-w-sm space-y-4">
      <div>
        <label className="mb-1.5 block text-[13px] font-semibold text-muted">
          Kullanıcı Adı
        </label>
        <input
          name="id"
          type="text"
          autoComplete="username"
          required
          className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-[15px] text-ink outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-[13px] font-semibold text-muted">
          Şifre
        </label>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-[15px] text-ink outline-none focus:border-accent"
        />
      </div>

      {state.error && (
        <p className="rounded-xl bg-accent/10 px-3.5 py-2.5 text-[13px] font-semibold text-accent">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-accent py-3.5 font-heading text-[15px] font-bold text-white transition-opacity disabled:opacity-60"
      >
        {pending ? "Giriş yapılıyor…" : "Giriş Yap"}
      </button>
    </form>
  );
}
