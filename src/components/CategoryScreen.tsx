"use client";

import { useLocale, useTranslations } from "next-intl";
import Header from "./Header";
import CategoryTabsLink from "./CategoryTabsLink";
import ProductListRow from "./ProductListRow";
import SiteFooter from "./SiteFooter";
import SnowEffect from "./SnowEffect";
import type { Category, Product } from "@/data/menu";

export default function CategoryScreen({
  category,
  categories,
  products,
  logoUrl,
  menuMode,
}: {
  category: Category;
  categories: Category[];
  products: Product[];
  logoUrl?: string;
  menuMode?: string | null;
}) {
  const locale = useLocale() as "tr" | "en";
  const t = useTranslations("menu");

  return (
    <div className="doodle-bg flex min-h-screen flex-col">
      {menuMode === "snow" && <SnowEffect />}
      <div className="mx-auto w-full max-w-lg md:max-w-2xl lg:max-w-4xl">
        <Header logoUrl={logoUrl} />
      </div>

      <div className="mx-auto w-full max-w-lg md:max-w-2xl lg:max-w-4xl">
        <CategoryTabsLink categories={categories} activeId={category.id} />

        <div className="flex items-baseline justify-between px-5 pb-3 pt-1">
          <h2 className="relative font-heading text-[23px] font-extrabold tracking-tight text-ink">
            {category.name[locale]}
            <span className="absolute -bottom-1.5 left-0 h-[3px] w-8 rounded-full bg-accent" />
          </h2>
          <span className="text-[13px] font-semibold text-muted">
            {products.length} {t("items")}
          </span>
        </div>

        <main className="flex-1 space-y-3 px-5 pb-10">
          {products.length === 0 ? (
            <p className="pt-10 text-center text-sm text-muted">{t("empty")}</p>
          ) : (
            products.map((product, i) => (
              <ProductListRow key={product.id} product={product} index={i} />
            ))
          )}
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
