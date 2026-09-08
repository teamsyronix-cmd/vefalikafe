import { headers } from "next/headers";
import { getSupabaseAdmin } from "./supabase";
import { getPanelSession } from "./auth";

// Bir panel işlemini (hangi kullanıcı, ne yaptı) kayıt altına alır. Hata olursa
// sessizce geçer — log yazımı asıl işlemi asla engellemez.
export async function logActivity(action: string, detail?: string) {
  try {
    const session = await getPanelSession();
    let ip: string | null = null;
    try {
      const hdrs = await headers();
      ip =
        hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        hdrs.get("x-real-ip") ||
        null;
    } catch {
      // headers() bazı bağlamlarda kullanılamayabilir
    }
    await getSupabaseAdmin().from("panel_activity_log").insert({
      actor: session?.actor ?? "?",
      role: session?.role ?? null,
      action,
      detail: detail ?? null,
      ip_address: ip,
    });
  } catch {
    // panel_activity_log tablosu henüz yoksa / yazım hatası → yut
  }
}

export type ActivityEntry = {
  id: number;
  actor: string;
  role: string | null;
  action: string;
  detail: string | null;
  ip: string | null;
  createdAt: string;
};

export async function getActivityLog(limit = 40): Promise<ActivityEntry[]> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("panel_activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return [];
    return (data ?? []).map((r) => ({
      id: r.id,
      actor: r.actor,
      role: r.role ?? null,
      action: r.action,
      detail: r.detail ?? null,
      ip: r.ip_address ?? null,
      createdAt: r.created_at,
    }));
  } catch {
    return [];
  }
}
