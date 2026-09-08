import { NextResponse } from "next/server";
import { getPanelSession, isOwner } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

// Yedeğe alınan tablolar (müşteri/sipariş verisi hariç — o ayrı).
const TABLES = [
  "categories",
  "products",
  "site_settings",
  "banner_slides",
  "ticker_items",
  "reviews",
  "announcements",
] as const;

// Tüm site içeriği (menü, kategoriler, fiyatlar, afişler, yorumlar, ayarlar…)
// tek bir JSON dosyası olarak. Yalnızca site sahibine açık.
export async function GET() {
  const session = await getPanelSession();
  if (!isOwner(session)) {
    return new NextResponse("Bu işlem yalnızca site sahibine açıktır.", { status: 403 });
  }

  const supabase = getSupabaseAdmin();
  const backup: Record<string, unknown> = {
    _meta: {
      app: "vefali-menu",
      version: 1,
      createdAt: new Date().toISOString(),
    },
  };

  for (const table of TABLES) {
    const { data, error } = await supabase.from(table).select("*");
    if (error) {
      // Tablo yoksa (kurulumun bir adımı atlanmışsa) boş dizi ile geç.
      backup[table] = [];
      continue;
    }
    backup[table] = data ?? [];
  }

  const counts = TABLES.map(
    (t) => `${t}: ${(backup[t] as unknown[]).length}`,
  ).join(", ");
  await logActivity(`Site yedeği indirildi (${counts})`);

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="vefali-site-yedek-${date}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
