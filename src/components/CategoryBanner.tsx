"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import PhotoPlaceholder from "./PhotoPlaceholder";
import type { Category } from "@/data/menu";

export default function CategoryBanner({
  category,
  count,
  index,
}: {
  category: Category;
  count: number;
  index: number;
}) {
  const locale = useLocale() as "tr" | "en";
  const t = useTranslations("menu");
  const hasImage = Boolean(category.image);

  return (
    <Link
      href={`/kategori/${category.id}`}
      className="animate-card-in group relative block h-[110px] overflow-hidden rounded-2xl shadow-card transition-[transform,box-shadow] duration-300 ease-out hover:z-10 hover:scale-[1.035] hover:shadow-panel active:scale-[0.98]"
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
              background:
                "linear-gradient(90deg, rgba(20,12,6,.68) 0%, rgba(20,12,6,.34) 46%, rgba(20,12,6,.04) 100%)",
            }}
          />
        </>
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-surface">
          <PhotoPlaceholder className="h-12 w-12" />
        </div>
      )}

      <div
        className={`absolute inset-y-0 left-5 z-[1] flex max-w-[72%] flex-col justify-center gap-1 ${
          hasImage ? "text-white" : "text-ink"
        }`}
      >
        <h4 className="font-heading text-[19px] font-extrabold leading-none tracking-tight">
          {category.name[locale]}
        </h4>
        <span
          className={`text-[12px] font-semibold ${hasImage ? "text-white/90" : "text-muted"}`}
        >
          {count} {t("items")}
        </span>
      </div>

      <span
        className={`absolute right-3.5 top-1/2 z-[1] grid h-[30px] w-[30px] -translate-y-1/2 place-items-center rounded-full backdrop-blur ${
          hasImage ? "bg-white/25" : "bg-chip"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className={`h-[15px] w-[15px] ${hasImage ? "stroke-white" : "stroke-ink"}`}
          fill="none"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </span>
    </Link>
  );
}
