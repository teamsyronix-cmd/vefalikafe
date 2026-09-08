"use client";

import { createBrowserClient } from "@supabase/ssr";

// Müşteri tarafı (tarayıcı) için — anon key kullanır, oturum çerezlerde tutulur.
// Giriş/kayıt/sepet gibi tüm müşteri işlemleri bu client üzerinden yapılır.
export function getSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
