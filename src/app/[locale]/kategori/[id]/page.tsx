import { notFound } from "next/navigation";
import CategoryScreen from "@/components/CategoryScreen";
import MaintenanceScreen from "@/components/MaintenanceScreen";
import { getCategories, getCategoryById, getProductsByCategory, getSiteSettings } from "@/lib/menu-data";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [category, categories, categoryProducts, settings] = await Promise.all([
    getCategoryById(id),
    getCategories(),
    getProductsByCategory(id),
    getSiteSettings(),
  ]);

  if (settings.maintenance) {
    return <MaintenanceScreen logoUrl={settings.logoUrl} />;
  }

  if (!category) {
    notFound();
  }

  return (
    <CategoryScreen
      category={category}
      categories={categories}
      products={categoryProducts}
      logoUrl={settings.logoUrl}
      menuMode={settings.menuMode}
    />
  );
}
