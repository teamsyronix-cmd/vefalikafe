"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export default function AnnouncementModal({
  title,
  message,
  image,
}: {
  title: string;
  message: string;
  image?: string;
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    // Duyuru ekrana gelince kısa bir konfeti patlaması.
    const colors = ["#7a1330", "#f3ece1", "#9a031e"];
    // Modal'ın arkasında kalmasın diye modal overlay'inden (z-100) daha yüksek bir katman.
    confetti({ particleCount: 70, spread: 65, origin: { y: 0.35 }, colors, zIndex: 300 });
    const t = setTimeout(() => {
      confetti({ particleCount: 40, spread: 90, origin: { y: 0.3 }, colors, zIndex: 300 });
    }, 200);
    return () => clearTimeout(t);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-ink/60 p-5 backdrop-blur-sm">
      <div className="animate-card-in relative w-full max-w-sm overflow-hidden rounded-[28px] bg-white shadow-panel">
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-40 w-full object-cover" />
        )}

        <div className="p-6">
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
            Duyuru
          </p>
          {title && (
            <h3 className="font-heading text-xl font-extrabold leading-tight text-ink">
              {title}
            </h3>
          )}
          {message && (
            <p className="mt-2 text-[14px] leading-relaxed text-muted">{message}</p>
          )}

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-5 w-full rounded-2xl bg-accent py-3 font-heading text-[14px] font-bold text-white"
          >
            Anladım
          </button>
        </div>

        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Kapat"
          className="absolute right-3.5 top-3.5 grid h-8 w-8 place-items-center rounded-full bg-white/80 text-ink backdrop-blur"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
