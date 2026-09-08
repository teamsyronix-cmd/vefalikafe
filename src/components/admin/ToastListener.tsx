"use client";

import { useEffect, useState } from "react";
import type { Flash } from "@/lib/flash";

export default function ToastListener({ flash }: { flash: Flash | null }) {
  const [visible, setVisible] = useState<Flash | null>(null);

  useEffect(() => {
    if (!flash) return;
    setVisible(flash);
    const t = setTimeout(() => setVisible(null), 3200);
    return () => clearTimeout(t);
    // flash.id her yeni bildirimde değişir — aynı mesaj art arda gelse bile tetikler.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flash?.id]);

  if (!visible) return null;

  const isSuccess = visible.type === "success";

  return (
    <div className="pointer-events-none fixed inset-x-0 top-5 z-[200] flex justify-center px-5">
      <div
        className={`animate-card-in pointer-events-auto flex items-center gap-2.5 rounded-full px-4 py-3 text-[13.5px] font-bold text-white shadow-panel ${
          isSuccess ? "bg-[#1a7f4c]" : "bg-accent"
        }`}
      >
        <span
          className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${
            isSuccess ? "bg-white/25" : "bg-white/25"
          }`}
        >
          {isSuccess ? (
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          )}
        </span>
        {visible.message}
      </div>
    </div>
  );
}
