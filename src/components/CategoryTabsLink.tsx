"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Category } from "@/data/menu";

export default function CategoryTabsLink({
  categories,
  activeId,
}: {
  categories: Category[];
  activeId: string;
}) {
  const locale = useLocale() as "tr" | "en";
  const t = useTranslations("menu");

  return (
    <div className="sticky top-[73px] z-30 flex items-center gap-2 overflow-x-auto bg-bg px-5 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Link
        href="/"
        className="flex shrink-0 items-center gap-1 rounded-full bg-chip py-2 pl-2.5 pr-3.5 font-heading text-[14px] font-bold text-ink"
      >
        <svg viewBox="0 0 24 24" className="h-[14px] w-[14px]" stroke="currentColor" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 6l-6 6 6 6" />
        </svg>
        {t("back")}
      </Link>

      {categories.map((cat) => {
        const isActive = cat.id === activeId;
        return (
          <Link
            key={cat.id}
            href={`/kategori/${cat.id}`}
            className={`shrink-0 rounded-full px-4 py-2 font-heading text-[14px] font-bold transition-colors ${
              isActive ? "bg-accent/12 text-ink" : "text-muted"
            }`}
          >
            {cat.name[locale]}
          </Link>
        );
      })}
    </div>
  );
}
