import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server Component / Server Action içinden, giriş yapan müşterinin oturumunu
// okumak için — anon key + istemcinin çerezleri kullanılır (RLS ile korunur).
export async function getSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component render'ı içinde çerez set edilemez (Next.js
            // kısıtı) — Server Action / Route Handler içinde bu sorun olmaz.
          }
        },
      },
    },
  );
}

// Giriş yapmış müşterinin profilini (ad + yıldız) getirir, yoksa null döner.
// customer_profiles tablosu henüz oluşturulmadıysa sessizce null döner —
// site bu yüzden çökmesin.
export async function getCurrentCustomer() {
  try {
    const supabase = await getSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("customer_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    return {
      id: user.id,
      email: user.email ?? "",
      name: profile?.name ?? "",
      stars: profile?.stars ?? 0,
      lifetimeStars: profile?.lifetime_stars ?? profile?.stars ?? 0,
    };
  } catch {
    return null;
  }
}
