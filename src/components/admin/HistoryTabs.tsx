"use client";

import { useState } from "react";

// Sipariş Geçmişi sayfasındaki sekme değiştirici: "Sipariş Listesi" ve "Kazanç".
// İki görünüm de sunucuda render edilip buraya children olarak geçiyor.
export default function HistoryTabs({
  list,
  earnings,
}: {
  list: React.ReactNode;
  earnings: React.ReactNode;
}) {
  const [tab, setTab] = useState<"list" | "earnings">("list");

  const btn = (active: boolean) =>
    `rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
      active ? "bg-accent text-white" : "bg-chip text-muted"
    }`;

  return (
    <>
      <div className="mb-5 flex gap-2">
        <button type="button" onClick={() => setTab("list")} className={btn(tab === "list")}>
          Sipariş Listesi
        </button>
        <button
          type="button"
          onClick={() => setTab("earnings")}
          className={btn(tab === "earnings")}
        >
          Kazanç
        </button>
      </div>

      <div hidden={tab !== "list"}>{list}</div>
      <div hidden={tab !== "earnings"}>{earnings}</div>
    </>
  );
}
