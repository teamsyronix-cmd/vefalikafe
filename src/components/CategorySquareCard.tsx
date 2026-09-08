"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import PhotoPlaceholder from "./PhotoPlaceholder";
import type { Category } from "@/data/menu";

// CategoryBanner'ın kare (1:1) varyantı — sadece belirli kategoriler
// (ör. Tatlılar, Kahveler) için, ana listenin altında yan yana gösterilir.
export default function CategorySquareCard({
  category,
  count,
  index,
  compact = false,
}: {
  category: Category;
  count: number;
  index: number;
  compact?: boolean;
}) {
  const locale = useLocale() as "tr" | "en";
  const t = useTranslations("menu");
  const hasImage = Boolean(category.image);

  return (
    <Link
      href={`/kategori/${category.id}`}
      className="animate-card-in group relative block aspect-square overflow-hidden rounded-2xl shadow-card transition-[transform,box-shadow] duration-300 ease-out hover:z-10 hover:scale-[1.035] hover:shadow-panel active:scale-[0.98]"
      style={{ animationDelay: `${Math.min(index * 60, 300)}ms` }}
    >
      {hasImage ? (
        <>
          <img
            src={category.image}
            alt={category.name[locale]}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, rgba(20,12,6,0) 42%, rgba(20,12,6,.78) 100%)",
            }}
          />
        </>
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-surface">
          <PhotoPlaceholder className={compact ? "h-10 w-10" : "h-14 w-14"} />
        </div>
      )}

      <div
        className={`absolute z-[1] flex flex-col gap-0.5 ${
          compact ? "inset-x-2.5 bottom-2.5" : "inset-x-3 bottom-3"
        } ${hasImage ? "text-white" : "text-ink"}`}
      >
        <h4
          className={`font-heading font-extrabold leading-tight tracking-tight ${
            compact ? "text-[12.5px]" : "text-[16px]"
          }`}
        >
          {category.name[locale]}
        </h4>
        <span
          className={`font-semibold ${compact ? "text-[10px]" : "text-[11px]"} ${
            hasImage ? "text-white/85" : "text-muted"
          }`}
        >
          {count} {t("items")}
        </span>
      </div>
    </Link>
  );
}
