"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import CategoryBanner from "./CategoryBanner";
import CategorySquareCard from "./CategorySquareCard";
import PhotoPlaceholder from "./PhotoPlaceholder";
import type { Category, Product } from "@/data/menu";

// Bu kategoriler ana listenin altında, yan yana kare kartlar olarak gösterilir.
const SQUARE_CATEGORY_IDS = ["tatli", "kahveler"];

function normalize(text: string) {
  return text.toLocaleLowerCase("tr").replace(/ı/g, "i").replace(/i̇/g, "i");
}

function formatPrice(price: number, locale: string) {
  return new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function SearchBox({
  categories,
  products,
}: {
  categories: Category[];
  products: Product[];
}) {
  const locale = useLocale() as "tr" | "en";
  const t = useTranslations("menu");
  const [query, setQuery] = useState("");
  const trimmed = query.trim();

  const longCategories = categories.filter((c) => !SQUARE_CATEGORY_IDS.includes(c.id));
  const squareCategories = SQUARE_CATEGORY_IDS.map((id) =>
    categories.find((c) => c.id === id),
  ).filter((c): c is Category => Boolean(c));

  const results = useMemo(() => {
    if (!trimmed) return [];
    const q = normalize(trimmed);
    return products.filter((p) => {
      const haystack = normalize(
        [p.name.tr, p.name.en, p.description?.tr ?? "", p.description?.en ?? ""].join(" "),
      );
      return haystack.includes(q);
    });
  }, [products, trimmed]);

  return (
    <div>
      <div className="relative mb-4">
        <div
          className="absolute inset-0 rounded-full bg-chip"
          style={{
            WebkitMaskImage: "linear-gradient(to right, black 55%, transparent 96%)",
            maskImage: "linear-gradient(to right, black 55%, transparent 96%)",
          }}
        />
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-4 top-1/2 z-[1] h-[18px] w-[18px] -translate-y-1/2 stroke-muted"
          fill="none"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="peer relative z-[1] w-full rounded-full border border-transparent bg-transparent py-3 pl-11 pr-10 text-[14px] font-semibold text-ink outline-none transition-colors placeholder:font-medium placeholder:text-muted focus:border-accent/30"
        />
        {trimmed && (
          <button
            type="button"
            aria-label="Temizle"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 z-[1] grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-ink"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" stroke="currentColor" fill="none" strokeWidth="2.6" strokeLinecap="round">
              <line x1="5" y1="5" x2="19" y2="19" />
              <line x1="19" y1="5" x2="5" y2="19" />
            </svg>
          </button>
        )}
      </div>

      {trimmed ? (
        <div className="space-y-3">
          <p className="px-1 text-[12px] font-semibold text-muted">
            {results.length} {t("searchResults")}
          </p>
          {results.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">{t("searchNoResults")}</p>
          ) : (
            results.map((product, i) => (
              <Link
                key={product.id}
                href={`/kategori/${product.categoryId}`}
                className="animate-card-in flex items-center gap-3.5 rounded-[22px] bg-surface p-2.5 shadow-card transition-transform duration-200 ease-out hover:scale-[1.015]"
                style={{ animationDelay: `${Math.min(i * 40, 300)}ms` }}
              >
                <div className="relative grid h-[64px] w-[64px] shrink-0 place-items-center overflow-hidden rounded-[14px] bg-chip">
                  {product.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image}
                      alt={product.name[locale]}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <PhotoPlaceholder className="h-6 w-6" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate font-heading text-[15px] font-bold text-ink">
                    {product.name[locale]}
                  </h4>
                  <p className="mt-0.5 truncate text-[12px] text-muted">
                    {categories.find((c) => c.id === product.categoryId)?.name[locale]}
                  </p>
                </div>
                {product.price ? (
                  <p className="shrink-0 font-heading text-[14px] font-extrabold text-accent">
                    {formatPrice(product.price, locale)}
                  </p>
                ) : null}
              </Link>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {squareCategories.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {squareCategories.map((category, i) => (
                <CategorySquareCard
                  key={category.id}
                  category={category}
                  count={products.filter((p) => p.categoryId === category.id).length}
                  index={i}
                />
              ))}
            </div>
          )}

          {longCategories.map((category, i) => (
            <CategoryBanner
              key={category.id}
              category={category}
              count={products.filter((p) => p.categoryId === category.id).length}
              index={squareCategories.length + i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
