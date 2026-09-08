import { useTranslations, useLocale } from "next-intl";
import type { Product } from "@/data/menu";
import { useCart } from "./CartProvider";
import PhotoPlaceholder from "./PhotoPlaceholder";

function formatPrice(price: number, locale: string) {
  return new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ProductListRow({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const locale = useLocale() as "tr" | "en";
  const t = useTranslations("menu");
  const { addItem } = useCart();

  const isDiscounted =
    !product.outOfStock &&
    product.campaignActive &&
    !!product.campaignPrice &&
    !!product.price &&
    product.campaignPrice < product.price;

  const discountPercent = isDiscounted
    ? Math.round((1 - product.campaignPrice! / product.price!) * 100)
    : 0;

  const priceLabel = isDiscounted
    ? formatPrice(product.campaignPrice!, locale)
    : product.price
      ? formatPrice(product.price, locale)
      : t("priceSoon");

  return (
    <div
      className="animate-card-in flex items-center gap-3.5 rounded-[22px] bg-surface p-2.5 shadow-card"
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
    >
      <div className="relative grid h-[92px] w-[92px] shrink-0 place-items-center overflow-hidden rounded-[16px] bg-chip">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name[locale]}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <PhotoPlaceholder className="h-9 w-9" />
        )}
        {product.outOfStock && (
          <div className="absolute inset-0 grid place-items-center bg-ink/55">
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-ink">
              {t("outOfStock")}
            </span>
          </div>
        )}
        {isDiscounted && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
            %{discountPercent}
          </span>
        )}
      </div>

      <div className={`min-w-0 flex-1 ${product.outOfStock ? "opacity-45" : ""}`}>
        <h4 className="truncate font-heading text-[16px] font-bold text-ink">
          {product.name[locale]}
        </h4>
        {product.description && (
          <p className="mt-0.5 truncate text-[13px] text-muted">
            {product.description[locale]}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end pr-1">
        {isDiscounted && (
          <span className="text-[12px] font-semibold text-muted line-through">
            {formatPrice(product.price!, locale)}
          </span>
        )}
        <p
          className={`font-heading font-extrabold ${
            product.outOfStock
              ? "text-[16px] text-muted line-through"
              : product.price || isDiscounted
                ? "text-[16px] text-accent"
                : "text-[11.5px] font-bold text-muted"
          }`}
        >
          {priceLabel}
        </p>

        {!product.outOfStock && (product.price || isDiscounted) && (
          <button
            type="button"
            onClick={() =>
              addItem({
                productId: product.id,
                nameTr: product.name.tr,
                nameEn: product.name.en,
                price: isDiscounted ? product.campaignPrice! : product.price!,
              })
            }
            aria-label={t("addToCart")}
            title={t("addToCart")}
            className="mt-1.5 grid h-7 w-7 place-items-center rounded-full bg-accent text-white"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
