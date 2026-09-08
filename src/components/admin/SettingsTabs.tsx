"use client";

import { useState } from "react";

// İki büyük seçim kartı: "Tasarım Ayarları" ve "Menü Ayarları". Hangi kart
// seçilirse yalnızca o grubun panelleri gösterilir. Paneller sunucuda
// render edilip buraya children olarak geçiyor (server action'lar korunuyor).
export default function SettingsTabs({
  design,
  menu,
}: {
  design: React.ReactNode;
  menu: React.ReactNode;
}) {
  const [tab, setTab] = useState<"design" | "menu">("design");

  const card = (active: boolean) =>
    `relative flex items-center gap-3 overflow-hidden rounded-[24px] border-2 p-5 text-left transition-all duration-200 sm:p-6 ${
      active
        ? "border-accent bg-accent/10 shadow-card"
        : "border-line bg-surface hover:border-accent/40"
    }`;

  return (
    <div className="mb-8">
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button type="button" onClick={() => setTab("design")} className={card(tab === "design")}>
          <span className="text-3xl">🎨</span>
          <span className="min-w-0">
            <span className="block font-heading text-[16px] font-extrabold text-ink">
              Tasarım Ayarları
            </span>
            <span className="block text-[12px] text-muted">
              Logo, temalar, afiş, kayan yazı, yorumlar, duyuru
            </span>
          </span>
          <span
            className={`ml-auto grid h-6 w-6 shrink-0 place-items-center rounded-full text-[13px] font-extrabold transition-colors ${
              tab === "design" ? "bg-accent text-white" : "bg-chip text-muted"
            }`}
          >
            {tab === "design" ? "✓" : ""}
          </span>
        </button>

        <button type="button" onClick={() => setTab("menu")} className={card(tab === "menu")}>
          <span className="text-3xl">🍽️</span>
          <span className="min-w-0">
            <span className="block font-heading text-[16px] font-extrabold text-ink">
              Menü Ayarları
            </span>
            <span className="block text-[12px] text-muted">
              Kategoriler ve ürünler
            </span>
          </span>
          <span
            className={`ml-auto grid h-6 w-6 shrink-0 place-items-center rounded-full text-[13px] font-extrabold transition-colors ${
              tab === "menu" ? "bg-accent text-white" : "bg-chip text-muted"
            }`}
          >
            {tab === "menu" ? "✓" : ""}
          </span>
        </button>
      </div>

      <div hidden={tab !== "design"}>{design}</div>
      <div hidden={tab !== "menu"}>{menu}</div>
    </div>
  );
}
