import { NextResponse } from "next/server";
import { getPanelSession, isOwner } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

// Müşteri yedeği — yalnızca site sahibine (dogukan / ADMIN_ID) açık. Tüm
// customer_profiles kayıtlarını CSV olarak indirtir.
function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const session = await getPanelSession();
  if (!isOwner(session)) {
    return new NextResponse("Bu işlem yalnızca site sahibine açıktır.", { status: 403 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("customer_profiles")
    .select("id, name, email, stars, lifetime_stars, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    return new NextResponse("Yedek alınamadı: " + error.message, { status: 500 });
  }

  const rows = data ?? [];
  const header = ["id", "ad", "eposta", "yildiz", "toplam_yildiz", "kayit_tarihi"];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [r.id, r.name ?? "", r.email ?? "", r.stars ?? 0, r.lifetime_stars ?? 0, r.created_at ?? ""]
        .map(csvCell)
        .join(","),
    ),
  ];
  // UTF-8 BOM (U+FEFF) → Excel Türkçe karakterleri doğru açsın
  const body = "﻿" + lines.join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  await logActivity(`Müşteri yedeği indirildi (${rows.length} kayıt)`);

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="vefali-musteriler-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
