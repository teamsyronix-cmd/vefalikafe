"use client";

import { useEffect, useRef } from "react";
import { logoutAction, refreshSessionAction } from "@/app/admin/actions";

const MANAGER_IDLE_MS = 10 * 60 * 1000; // müdür: 10 dk hareketsizlikte çıkış
const REFRESH_THROTTLE_MS = 60 * 1000; // sunucuya en fazla dakikada bir tazeleme
const WAITER_HEARTBEAT_MS = 5 * 60 * 1000; // garson: 5 dk'da bir sessiz tazeleme

// Panel oturumunu canlı tutar. Müdür: 10 dk hareketsizlikte otomatik çıkış.
// Garson: hareketsizlikte ASLA atmaz — sekme açık kaldıkça periyodik tazeleme
// ile oturum süresi hep ileri kayar (tüm gün açık kalabilir).
export default function SessionKeeper({ role }: { role: "mudur" | "garson" }) {
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRefreshRef = useRef<number>(0);

  useEffect(() => {
    if (role === "garson") {
      refreshSessionAction().catch(() => {});
      const id = setInterval(() => {
        refreshSessionAction().catch(() => {});
      }, WAITER_HEARTBEAT_MS);
      return () => clearInterval(id);
    }

    function scheduleLogout() {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = setTimeout(() => {
        logoutAction();
      }, MANAGER_IDLE_MS);
    }

    function handleActivity() {
      scheduleLogout();
      const now = Date.now();
      if (now - lastRefreshRef.current > REFRESH_THROTTLE_MS) {
        lastRefreshRef.current = now;
        refreshSessionAction().catch(() => {
          // Oturum zaten geçersizse sunucu tarafı login'e yönlendirir.
        });
      }
    }

    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];
    events.forEach((ev) => window.addEventListener(ev, handleActivity, { passive: true }));
    scheduleLogout();

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleActivity));
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, [role]);

  return null;
}
