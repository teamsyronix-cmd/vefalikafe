import Link from "next/link";
import { notFound } from "next/navigation";
import { requireManager } from "@/lib/auth";
import { getCategories, getCategoryById, getProductsByCategory } from "@/lib/menu-data";
import ThemeToggle from "@/components/admin/ThemeToggle";
import CategoryQuickSwitch from "@/components/admin/CategoryQuickSwitch";
import PhotoPlaceholder from "@/components/PhotoPlaceholder";
import {
  addProductAction,
  deleteProductAction,
  moveProductAction,
  updateProductAction,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminCategoryProducts({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  await requireManager();
  const { categoryId } = await params;

  const [category, products, categories] = await Promise.all([
    getCategoryById(categoryId),
    getProductsByCategory(categoryId),
    getCategories(),
  ]);

  if (!category) notFound();

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/admin" className="text-[13px] font-bold text-muted">
          ← Kategoriler
        </Link>
        <ThemeToggle />
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="shrink-0">
          <p className="font-heading text-2xl font-extrabold text-ink">{category.name.tr}</p>
          <p className="text-[13px] font-semibold text-muted">{products.length} ürün</p>
        </div>
        <div className="min-w-0 sm:max-w-[60%]">
          <CategoryQuickSwitch categories={categories} activeId={categoryId} />
        </div>
      </div>

      <div className="space-y-3">
        {products.map((product, i) => (
          <div key={product.id} className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex shrink-0 items-center gap-1.5 sm:flex-col">
                <form action={moveProductAction.bind(null, product.id, categoryId, "up")}>
                  <button
                    type="submit"
                    disabled={i === 0}
                    className="grid h-7 w-7 place-items-center rounded-full bg-chip text-ink disabled:opacity-30"
                  >
                    ↑
                  </button>
                </form>
                <form action={moveProductAction.bind(null, product.id, categoryId, "down")}>
                  <button
                    type="submit"
                    disabled={i === products.length - 1}
                    className="grid h-7 w-7 place-items-center rounded-full bg-chip text-ink disabled:opacity-30"
                  >
                    ↓
                  </button>
                </form>
              </div>

              <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-chip">
                {product.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <PhotoPlaceholder className="h-7 w-7" />
                )}
                {product.campaignActive && product.campaignPrice && (
                  <span className="absolute bottom-0 left-0 right-0 bg-accent py-0.5 text-center text-[9px] font-bold text-white">
                    İNDİRİM
                  </span>
                )}
              </div>

              <form
                action={updateProductAction}
                className="flex min-w-0 flex-1 flex-col gap-2 [&_input]:min-w-0"
              >
                <input type="hidden" name="id" value={product.id} />

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    name="name_tr"
                    defaultValue={product.name.tr}
                    placeholder="Ad (TR)"
                    className="rounded-xl border border-line bg-field px-3 py-2 text-[14px] text-ink outline-none focus:border-accent"
                  />
                  <input
                    name="name_en"
                    defaultValue={product.name.en}
                    placeholder="Name (EN)"
                    className="rounded-xl border border-line bg-field px-3 py-2 text-[14px] text-ink outline-none focus:border-accent"
                  />
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    name="description_tr"
                    defaultValue={product.description?.tr ?? ""}
                    placeholder="Açıklama (TR)"
                    className="rounded-xl border border-line bg-field px-3 py-2 text-[13px] text-ink outline-none focus:border-accent"
                  />
                  <input
                    name="description_en"
                    defaultValue={product.description?.en ?? ""}
                    placeholder="Description (EN)"
                    className="rounded-xl border border-line bg-field px-3 py-2 text-[13px] text-ink outline-none focus:border-accent"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-semibold text-muted">₺</span>
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      defaultValue={product.price ?? ""}
                      placeholder="Fiyat"
                      className="w-24 rounded-xl border border-line bg-field px-3 py-2 text-[14px] text-ink outline-none focus:border-accent"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-semibold text-accent">₺</span>
                    <input
                      name="campaign_price"
                      type="number"
                      step="0.01"
                      defaultValue={product.campaignPrice ?? ""}
                      placeholder="Kampanya"
                      className="w-24 rounded-xl border border-line bg-field px-3 py-2 text-[14px] text-ink outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <label className="flex items-center gap-2 text-[13px] font-semibold text-accent">
                    <input
                      type="checkbox"
                      name="campaign_active"
                      defaultChecked={product.campaignActive}
                      className="h-4 w-4 accent-accent"
                    />
                    Kampanya Aktif
                  </label>
                  <label className="flex items-center gap-2 text-[13px] font-semibold text-muted">
                    <input
                      type="checkbox"
                      name="out_of_stock"
                      defaultChecked={product.outOfStock}
                      className="h-4 w-4 accent-accent"
                    />
                    Tükendi
                  </label>
                  <input
                    name="emoji"
                    defaultValue={product.emoji}
                    hidden
                  />
                  <input
                    name="image"
                    type="file"
                    accept="image/*"
                    className="text-[12px] text-muted file:mr-2 file:rounded-full file:border-0 file:bg-chip file:px-3 file:py-1.5 file:text-[12px] file:font-bold file:text-ink"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    className="rounded-xl bg-accent px-4 py-2 text-[13px] font-bold text-white"
                  >
                    Kaydet
                  </button>
                </div>
              </form>

              <form action={deleteProductAction.bind(null, product.id)}>
                <button
                  type="submit"
                  className="shrink-0 rounded-full bg-field px-3 py-2 text-[12px] font-bold text-accent"
                >
                  Sil
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border-2 border-dashed border-line p-4">
        <p className="mb-3 text-[13px] font-bold text-ink">Yeni Ürün Ekle</p>
        <form action={addProductAction} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto_auto] [&_input]:min-w-0">
          <input type="hidden" name="category_id" value={categoryId} />
          <input
            name="name_tr"
            placeholder="Ad (TR)"
            required
            className="rounded-xl border border-line bg-field px-3 py-2 text-[14px] text-ink outline-none focus:border-accent"
          />
          <input
            name="name_en"
            placeholder="Name (EN)"
            className="rounded-xl border border-line bg-field px-3 py-2 text-[14px] text-ink outline-none focus:border-accent"
          />
          <input
            name="emoji"
            placeholder="🍽️"
            className="w-16 rounded-xl border border-line bg-field px-3 py-2 text-center text-[16px] outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="rounded-xl bg-panel-solid px-4 py-2 text-[13px] font-bold text-white"
          >
            Ekle
          </button>
        </form>
      </div>
    </div>
  );
}
