"use client";

import { useActionState, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useCustomer } from "./CustomerProvider";
import AnnouncementModal from "./AnnouncementModal";
import {
  loginCustomerAction,
  registerCustomerAction,
  type CustomerAuthState,
} from "@/app/actions/customer-auth";

const INITIAL: CustomerAuthState = {};

type Announcement = { title: string; message: string; image?: string };

// Site açıldığında önce bu ekran gösterilir: estetik giriş/kayıt formu + "Menüye
// Devam Et" kartı. Devam Et'e basınca (ya da giriş/kayıt başarılı olunca) menü
// (children olarak zaten DOM'da hazır bekleyen içerik) açığa çıkar. Girişli
// kullanıcı bu ekranı hiç görmez, doğrudan menüye geçer. Duyuru penceresi de
// yalnızca bu ekran kapandıktan sonra (menü açılınca) gösterilir.
export default function WelcomeGate({
  children,
  announcement,
}: {
  children: React.ReactNode;
  announcement?: Announcement | null;
}) {
  const customer = useCustomer();
  const [manualDismiss, setManualDismiss] = useState(false);
  const t = useTranslations("welcome");

  // Girişli kullanıcı (ya da giriş/kayıt sonrası revalidate ile customer
  // dolduğunda) bu ekranı hiç görmez; "Menüye Devam Et" ile de elle kapatılır.
  const dismissed = manualDismiss || Boolean(customer);

  // Karşılama ekranı açıkken arka planı kilitle; menüye geçildiğinde her zaman
  // sayfanın en üstünden başlat (tarayıcının scroll geri yüklemesi yüzünden
  // menü eski kaydırma konumundan açılıyordu).
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo(0, 0);
    document.body.style.overflow = dismissed ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [dismissed]);

  return (
    <>
      {children}
      {dismissed && announcement && (
        <AnnouncementModal
          title={announcement.title}
          message={announcement.message}
          image={announcement.image}
        />
      )}
      {!dismissed && (
        <div className="fixed inset-0 z-[150] flex flex-col items-center justify-center gap-4 overflow-y-auto bg-bg px-4 py-6 sm:gap-6 sm:p-10">
          <div className="shrink-0 animate-card-in text-center">
            <p className="font-heading text-[26px] font-extrabold tracking-tight text-accent sm:text-[42px]">
              VEFALI
            </p>
            <p className="mt-0.5 text-[11.5px] font-semibold text-muted sm:mt-1 sm:text-[13px]">
              Dostluk Aynı Masada
            </p>
          </div>

          <div className="flex w-full max-w-sm flex-col items-center justify-center gap-3 sm:max-w-none sm:flex-row sm:gap-6">
            {/* Sol kart: estetik giriş / kayıt formu */}
            <div
              className="relative flex w-full shrink-0 animate-card-in flex-col justify-between overflow-hidden rounded-[24px] bg-white p-5 shadow-panel transition-shadow duration-300 focus-within:shadow-[0_0_0_3px_rgba(122,19,48,0.12),var(--shadow-panel)] sm:h-[440px] sm:max-w-sm sm:rounded-[28px] sm:p-8"
              style={{ animationDelay: "0.08s" }}
            >
              {/* Dekoratif, yumuşakça süzülen bordo ışık lekeleri */}
              <span className="animate-drift-a pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />
              <span className="animate-drift-c pointer-events-none absolute -bottom-14 -left-10 h-28 w-28 rounded-full bg-accent/[0.07] blur-2xl" />

              <div className="relative z-[1] flex h-full flex-col">
                <AuthForm onAuthed={() => setManualDismiss(true)} />
              </div>
            </div>

            {/* Menüye Devam Et */}
            <button
              type="button"
              onClick={() => setManualDismiss(true)}
              style={{ animationDelay: "0.16s" }}
              className="group relative flex w-full shrink-0 animate-card-in flex-col items-center justify-center gap-2 overflow-hidden rounded-[24px] bg-panel-solid p-7 text-white shadow-panel transition-transform duration-300 hover:scale-[1.015] sm:h-[440px] sm:max-w-sm sm:gap-3 sm:rounded-[28px] sm:p-8"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/giris-card-bg.jpg"
                alt=""
                className="absolute inset-0 h-full w-full scale-105 object-cover opacity-25 transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-panel-solid/80 via-panel-solid/70 to-panel-solid/95" />
              <span className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full bg-accent/40 blur-2xl" />
              <span className="pointer-events-none absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-accent/25 blur-2xl" />
              <div className="relative z-[1] grid h-12 w-12 place-items-center rounded-full bg-white/15 transition-transform duration-300 group-hover:translate-x-1 sm:h-16 sm:w-16">
                <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </div>
              <p className="relative z-[1] font-heading text-[18px] font-extrabold tracking-tight sm:text-[22px]">
                {t("continueTitle")}
              </p>
              <p className="relative z-[1] text-[12px] font-semibold text-white/70 sm:text-[13px]">
                {t("continueSubtitle")}
              </p>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function AuthForm({ onAuthed }: { onAuthed: () => void }) {
  const t = useTranslations("welcome");
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loginState, loginAction, loginPending] = useActionState(loginCustomerAction, INITIAL);
  const [registerState, registerAction, registerPending] = useActionState(
    registerCustomerAction,
    INITIAL,
  );

  const isLogin = tab === "login";
  const state = isLogin ? loginState : registerState;
  const pending = isLogin ? loginPending : registerPending;

  // Giriş başarılı (hata yok) ya da oturum açan kayıt tamamlandığında doğrudan
  // menüye geç — "Hoş geldin" ara ekranı gösterilmez.
  useEffect(() => {
    if (loginPending || loginState === INITIAL) return;
    if (!loginState.error) onAuthed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginState, loginPending]);

  useEffect(() => {
    if (registerPending || registerState === INITIAL) return;
    if (!registerState.error && !registerState.needsEmailConfirm) onAuthed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerState, registerPending]);

  return (
    <>
      <div>
        <p className="font-heading text-[18px] font-extrabold tracking-tight text-ink sm:text-[22px]">
          {t("formTitle")}
        </p>
        <p className="mt-2 text-[12.5px] leading-snug text-muted">{t("formSubtitle")}</p>
      </div>

      {/* Kayan pill'li sekme anahtarı */}
      <div className="relative mt-5 grid grid-cols-2 rounded-2xl bg-chip p-1">
        <span
          aria-hidden
          className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-xl bg-accent shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          style={{ transform: isLogin ? "translateX(0)" : "translateX(100%)" }}
        />
        <button
          type="button"
          onClick={() => setTab("login")}
          className={`relative z-[1] rounded-xl py-2.5 text-[13px] font-bold transition-colors duration-200 ${
            isLogin ? "text-white" : "text-muted"
          }`}
        >
          {t("loginTab")}
        </button>
        <button
          type="button"
          onClick={() => setTab("register")}
          className={`relative z-[1] rounded-xl py-2.5 text-[13px] font-bold transition-colors duration-200 ${
            !isLogin ? "text-white" : "text-muted"
          }`}
        >
          {t("registerTab")}
        </button>
      </div>

      {/* Sekmeye göre yeniden monte edilip beliriş animasyonunu tetikler */}
      <form
        key={tab}
        action={isLogin ? loginAction : registerAction}
        className="mt-4 flex flex-1 flex-col"
      >
        <div className="space-y-2.5">
          {!isLogin && (
            <Field
              style={{ animationDelay: "0s" }}
              name="name"
              required
              autoComplete="name"
              placeholder={t("namePlaceholder")}
              icon={
                <>
                  <circle cx="12" cy="8" r="3.4" />
                  <path d="M5.5 19c1.2-3.2 4-4.6 6.5-4.6s5.3 1.4 6.5 4.6" />
                </>
              }
            />
          )}
          <Field
            style={{ animationDelay: isLogin ? "0s" : "0.05s" }}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            icon={
              <>
                <rect x="3" y="5" width="18" height="14" rx="2.5" />
                <path d="m4 7 8 6 8-6" />
              </>
            }
          />
          <Field
            style={{ animationDelay: isLogin ? "0.05s" : "0.1s" }}
            name="password"
            type="password"
            required
            autoComplete={isLogin ? "current-password" : "new-password"}
            placeholder={isLogin ? t("passwordPlaceholder") : t("passwordHintPlaceholder")}
            icon={
              <>
                <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
                <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
              </>
            }
          />
        </div>

        {state.error && (
          <p className="mt-3 animate-form-swap text-[12.5px] font-semibold text-accent">
            {state.error}
          </p>
        )}
        {!isLogin && registerState.needsEmailConfirm && (
          <p className="mt-3 animate-form-swap text-[12.5px] font-semibold text-emerald-600">
            {t("registerSuccess")}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-[13.5px] font-bold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100"
        >
          {pending && (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          )}
          {isLogin
            ? pending
              ? t("loginPending")
              : t("loginCta")
            : pending
              ? t("registerPending")
              : t("registerCta")}
        </button>
      </form>
    </>
  );
}

function Field({
  icon,
  style,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode }) {
  return (
    <div className="relative animate-form-swap" style={style}>
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted transition-colors">
        <svg
          viewBox="0 0 24 24"
          className="h-[17px] w-[17px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {icon}
        </svg>
      </span>
      <input
        {...props}
        className="w-full rounded-xl border border-line bg-field py-2.5 pl-10 pr-3.5 text-[14px] text-ink outline-none transition-all duration-200 placeholder:text-muted/80 focus:border-accent focus:shadow-[0_0_0_3px_rgba(122,19,48,0.10)]"
      />
    </div>
  );
}
