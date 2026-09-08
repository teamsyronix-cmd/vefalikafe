"use client";

import { useOptimistic, useTransition } from "react";

// iPhone tarzı animasyonlu aç/kapa anahtarı. Tıklayınca bilye anında kayar
// (optimistic), arkada verilen server action çalışır.
export default function ToggleSwitch({
  active,
  toggleAction,
  tone = "accent",
}: {
  active: boolean;
  toggleAction: (enabled: boolean) => Promise<void>;
  tone?: "accent" | "danger";
}) {
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(active);

  const onColor = tone === "danger" ? "bg-red-500" : "bg-accent";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={optimistic}
      aria-label="Aç / kapat"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          setOptimistic(!optimistic);
          await toggleAction(!optimistic);
        })
      }
      className={`relative h-[30px] w-[52px] shrink-0 rounded-full border border-black/10 transition-colors duration-300 ease-out disabled:opacity-60 ${
        optimistic ? onColor : "bg-line"
      }`}
    >
      <span
        className={`absolute left-[3px] top-[3px] grid h-[22px] w-[22px] place-items-center rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          optimistic ? "translate-x-[22px]" : "translate-x-0"
        }`}
      >
        {pending && (
          <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-line border-t-accent" />
        )}
      </span>
    </button>
  );
}
