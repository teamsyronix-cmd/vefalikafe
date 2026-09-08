"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Header from "./Header";
import CategoryTabsLink from "./CategoryTabsLink";
import ProductListRow from "./ProductListRow";
import SiteFooter from "./SiteFooter";
import SnowEffect from "./SnowEffect";
import type { Category, Product } from "@/data/menu";

// Menüdeki "Ice" etiketli ürünler soğuk kahve sayılır (Ice Latte, Ice Americano,
// Pistachio Chocolate Ice Latte vb. — isim içinde herhangi bir yerde geçebilir).
function isColdCoffee(p: Product): boolean {
  return `${p.name.tr} ${p.name.en}`.toLowerCase().includes("ice");
}

export default function KahvelerScreen({
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
  const [tab, setTab] = useState<"hot" | "cold">("hot");

  const hotProducts = useMemo(() => products.filter((p) => !isColdCoffee(p)), [products]);
  const coldProducts = useMemo(() => products.filter(isColdCoffee), [products]);
  const list = tab === "hot" ? hotProducts : coldProducts;

  const isTr = locale === "tr";
  const hotLabel = isTr ? "Sıcak Kahveler" : "Hot Coffees";
  const coldLabel = isTr ? "Soğuk Kahveler" : "Cold Coffees";

  return (
    <div className="doodle-bg flex min-h-screen flex-col">
      {menuMode === "snow" && <SnowEffect />}
      <div className="mx-auto w-full max-w-lg md:max-w-2xl lg:max-w-4xl">
        <Header logoUrl={logoUrl} />
      </div>

      <div className="mx-auto w-full max-w-lg md:max-w-2xl lg:max-w-4xl">
        <CategoryTabsLink categories={categories} activeId={category.id} />

        <div className="px-5 pb-3 pt-1">
          <h2 className="relative font-heading text-[23px] font-extrabold tracking-tight text-ink">
            {category.name[locale]}
            <span className="absolute -bottom-1.5 left-0 h-[3px] w-8 rounded-full bg-accent" />
          </h2>
        </div>

        {/* Sıcak / Soğuk tema anahtarı */}
        <div className="px-5 pb-4">
          <div className="grid grid-cols-2 gap-2 rounded-[20px] bg-chip p-1.5 shadow-inner">
            <button
              type="button"
              onClick={() => setTab("hot")}
              className={`flex items-center justify-center gap-1.5 rounded-2xl py-3 text-[13.5px] font-bold transition-all duration-300 ${
                tab === "hot"
                  ? "bg-gradient-to-br from-[#c2410c] to-[#7c2d12] text-white shadow-[0_8px_20px_-8px_rgba(124,45,18,0.7)]"
                  : "text-muted"
              }`}
            >
              <span className="text-[16px]">☕</span>
              {hotLabel}
              <span
                className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10.5px] font-extrabold ${
                  tab === "hot" ? "bg-white/25" : "bg-white/70 text-ink"
                }`}
              >
                {hotProducts.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTab("cold")}
              className={`flex items-center justify-center gap-1.5 rounded-2xl py-3 text-[13.5px] font-bold transition-all duration-300 ${
                tab === "cold"
                  ? "bg-gradient-to-br from-[#0284c7] to-[#0c4a6e] text-white shadow-[0_8px_20px_-8px_rgba(12,74,110,0.7)]"
                  : "text-muted"
              }`}
            >
              <span className="text-[16px]">🧊</span>
              {coldLabel}
              <span
                className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10.5px] font-extrabold ${
                  tab === "cold" ? "bg-white/25" : "bg-white/70 text-ink"
                }`}
              >
                {coldProducts.length}
              </span>
            </button>
          </div>
        </div>

        <main className="flex-1 space-y-3 px-5 pb-10">
          {list.length === 0 ? (
            <p className="pt-10 text-center text-sm text-muted">{t("empty")}</p>
          ) : (
            list.map((product, i) => (
              <ProductListRow key={product.id} product={product} index={i} />
            ))
          )}
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
