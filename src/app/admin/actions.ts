"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  createAdminSession,
  destroyAdminSession,
  hashPassword,
  requireAdmin,
  requireManagerAction,
  requireOwnerAction,
  verifyAdminCredentials,
} from "@/lib/auth";
import { getSupabaseAdmin, MENU_IMAGES_BUCKET } from "@/lib/supabase";
import { withFlash } from "@/lib/flash";
import { logActivity } from "@/lib/activity";

function slugify(text: string, fallback: string): string {
  const slug = text
    .toLowerCase()
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${slug || fallback}-${Date.now().toString(36)}`;
}

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const id = String(formData.get("id") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!id || !password) {
    return { error: "Kullanıcı adı ve şifre gerekli." };
  }
  const session = await verifyAdminCredentials(id, password);
  if (!session) {
    return { error: "Kullanıcı adı veya şifre hatalı." };
  }

  await createAdminSession(session);

  // Giriş kaydı — hata olsa da girişi engellemesin diye ayrı yutuluyor.
  try {
    const hdrs = await headers();
    const ip =
      hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      hdrs.get("x-real-ip") ||
      null;
    await getSupabaseAdmin().from("login_log").insert({ ip_address: ip });
  } catch {
    // login_log tablosu henüz yoksa sessizce geç
  }
  await logActivity(
    `Panel girişi (${session.role === "mudur" ? "yönetici" : "garson"})`,
  );

  redirect(session.role === "mudur" ? "/admin" : "/admin/siparisler");
}

export async function logoutAction() {
  await logActivity("Panel çıkışı");
  await destroyAdminSession();
  redirect("/admin/login");
}

// İstemcideki hareketsizlik zamanlayıcısı, kullanıcı etkileşimde bulundukça
// bunu çağırır ve oturumu (10 dakika) tazeler.
export async function refreshSessionAction() {
  await requireAdmin();
  await createAdminSession();
}

async function uploadImage(file: File, folder: string, id: string) {
  const supabase = getSupabaseAdmin();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${folder}/${id}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(MENU_IMAGES_BUCKET)
    .upload(path, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    });
  if (error) throw error;

  const { data } = supabase.storage.from(MENU_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function revalidateAll() {
  revalidatePath("/admin");
  // Admin layout'u (header'daki site logosu dahil) tüm alt sayfalarda tazele.
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/[categoryId]", "page");
  revalidatePath("/[locale]", "layout");
}

// ---------- Panel Kullanıcıları (müdüre özel) ----------

const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,32}$/;

export async function addPanelUserAction(formData: FormData) {
  await requireOwnerAction();
  await createAdminSession();

  await withFlash(
    async () => {
      const username = String(formData.get("username") ?? "").trim();
      const password = String(formData.get("password") ?? "");
      const role = formData.get("role") === "mudur" ? "mudur" : "garson";

      if (!USERNAME_RE.test(username)) {
        throw new Error("Kullanıcı adı 3-32 karakter, harf/rakam/._- olmalı.");
      }
      if (password.length < 6) {
        throw new Error("Şifre en az 6 karakter olmalı.");
      }
      if (username === process.env.ADMIN_ID) {
        throw new Error("Bu kullanıcı adı ayrılmış.");
      }

      const supabase = getSupabaseAdmin();
      const { error } = await supabase
        .from("panel_users")
        .insert({ username, password_hash: hashPassword(password), role });
      if (error) {
        throw new Error(
          error.code === "23505"
            ? "Bu kullanıcı adı zaten var."
            : "Kullanıcı eklenemedi (tabloyu oluşturdunuz mu?).",
        );
      }
      revalidatePath("/admin");
    },
    `Panel kullanıcısı eklendi: ${String(formData.get("username") ?? "").trim()}`,
  );
}

export async function updatePanelUserAction(formData: FormData) {
  await requireOwnerAction();
  await createAdminSession();

  await withFlash(
    async () => {
      const id = Number(formData.get("id"));
      const role = formData.get("role") === "mudur" ? "mudur" : "garson";
      const password = String(formData.get("password") ?? "");
      if (!id) return;

      const update: Record<string, string> = { role };
      if (password) {
        if (password.length < 6) throw new Error("Şifre en az 6 karakter olmalı.");
        update.password_hash = hashPassword(password);
      }

      const supabase = getSupabaseAdmin();
      const { error } = await supabase.from("panel_users").update(update).eq("id", id);
      if (error) throw error;
      revalidatePath("/admin");
    },
    "Panel kullanıcısı güncellendi.",
  );
}

export async function setPanelUserActiveAction(id: number, active: boolean) {
  await requireOwnerAction();
  await createAdminSession();

  await withFlash(
    async () => {
      const supabase = getSupabaseAdmin();
      const { error } = await supabase
        .from("panel_users")
        .update({ active })
        .eq("id", id);
      if (error) throw error;
      revalidatePath("/admin");
    },
    active ? "Kullanıcı aktifleştirildi." : "Kullanıcı pasifleştirildi.",
  );
}

export async function deletePanelUserAction(id: number) {
  await requireOwnerAction();
  await createAdminSession();

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("panel_users").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/admin");
  }, "Panel kullanıcısı silindi.");
}

// ---------- Menü Modları ----------

export async function setMenuModeAction(mode: string | null) {
  await requireManagerAction();
  await createAdminSession();

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("site_settings")
      .update({ menu_mode: mode })
      .eq("id", "default");
    if (error) throw error;
    revalidateAll();
  }, mode ? "Mod aktif edildi." : "Mod kapatıldı.");
}

// Aç/kapa anahtarı için tek imzalı sarmalayıcı (enabled: boolean).
export async function setSnowModeAction(enabled: boolean) {
  return setMenuModeAction(enabled ? "snow" : null);
}

export async function setMaintenanceAction(enabled: boolean) {
  await requireManagerAction();
  await createAdminSession();

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("site_settings")
      .update({ maintenance: enabled })
      .eq("id", "default");
    if (error) throw error;
    revalidateAll();
  }, enabled ? "Bakım modu açıldı — menü kapatıldı." : "Bakım modu kapatıldı — menü açıldı.");
}

// ---------- Logo ----------

export async function updateLogoAction(formData: FormData) {
  await requireManagerAction();
  await createAdminSession();

  await withFlash(async () => {
    const file = formData.get("image") as File | null;
    if (!file || file.size === 0) return;

    const supabase = getSupabaseAdmin();
    const url = await uploadImage(file, "branding", "logo");
    const { error } = await supabase
      .from("site_settings")
      .update({ logo_url: url })
      .eq("id", "default");
    if (error) throw error;

    revalidateAll();
  }, "Logo güncellendi.");
}

// ---------- Hesap Ayarları ----------

export async function updateAdminProfileAction(formData: FormData) {
  await requireManagerAction();
  await createAdminSession();

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();
    const email = String(formData.get("email") ?? "").trim();

    const update: Record<string, string | null> = { admin_email: email || null };

    const file = formData.get("avatar") as File | null;
    if (file && file.size > 0) {
      update.admin_avatar_url = await uploadImage(file, "branding", "avatar");
    }

    const { error } = await supabase.from("site_settings").update(update).eq("id", "default");
    if (error) throw error;

    revalidateAll();
  }, "Hesap ayarları kaydedildi.");
}

export async function removeAdminAvatarAction() {
  await requireManagerAction();
  await createAdminSession();

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("site_settings")
      .update({ admin_avatar_url: null })
      .eq("id", "default");
    if (error) throw error;
    revalidateAll();
  }, "Profil fotoğrafı kaldırıldı.");
}

// ---------- Etkinlik Duyurusu ----------

export async function publishAnnouncementAction(formData: FormData) {
  await requireManagerAction();
  await createAdminSession();

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();
    const title = String(formData.get("title") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    if (!title && !message) return;

    let imageUrl: string | null = null;
    const file = formData.get("image") as File | null;
    if (file && file.size > 0) {
      imageUrl = await uploadImage(file, "announcements", `a-${Date.now()}`);
    }

    const { data: inserted, error: insErr } = await supabase
      .from("announcements")
      .insert({ title, message, image_url: imageUrl })
      .select()
      .single();
    if (insErr) throw insErr;

    const { error } = await supabase
      .from("site_settings")
      .update({
        announcement_enabled: true,
        announcement_title: inserted.title,
        announcement_message: inserted.message,
        announcement_image_url: inserted.image_url,
      })
      .eq("id", "default");
    if (error) throw error;

    revalidateAll();
  }, "Duyuru yayınlandı.");
}

export async function setAnnouncementLiveAction(enabled: boolean) {
  await requireManagerAction();
  await createAdminSession();

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("site_settings")
      .update({ announcement_enabled: enabled })
      .eq("id", "default");
    if (error) throw error;
    revalidateAll();
  }, enabled ? "Duyuru yayına alındı." : "Duyuru yayından kaldırıldı.");
}

export async function republishAnnouncementAction(id: number) {
  await requireManagerAction();
  await createAdminSession();

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();
    const { data: row, error: fetchErr } = await supabase
      .from("announcements")
      .select("*")
      .eq("id", id)
      .single();
    if (fetchErr) throw fetchErr;

    const { error } = await supabase
      .from("site_settings")
      .update({
        announcement_enabled: true,
        announcement_title: row.title,
        announcement_message: row.message,
        announcement_image_url: row.image_url,
      })
      .eq("id", "default");
    if (error) throw error;

    revalidateAll();
  }, "Duyuru tekrar yayınlandı.");
}

// ---------- Kayan Yazı (Ticker) ----------

export async function addTickerItemAction(formData: FormData) {
  await requireManagerAction();
  await createAdminSession();

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();
    const text = String(formData.get("text") ?? "").trim();
    if (!text) return;

    const { count } = await supabase
      .from("ticker_items")
      .select("id", { count: "exact", head: true });

    const { error } = await supabase
      .from("ticker_items")
      .insert({ text, sort_order: count ?? 0 });
    if (error) throw error;

    revalidateAll();
  }, "Satır eklendi.");
}

export async function updateTickerItemAction(formData: FormData) {
  await requireManagerAction();
  await createAdminSession();

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();
    const id = Number(formData.get("id"));
    const text = String(formData.get("text") ?? "").trim();
    if (!id || !text) return;

    const { error } = await supabase.from("ticker_items").update({ text }).eq("id", id);
    if (error) throw error;

    revalidateAll();
  }, "Satır kaydedildi.");
}

export async function deleteTickerItemAction(id: number) {
  await requireManagerAction();
  await createAdminSession();

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("ticker_items").delete().eq("id", id);
    if (error) throw error;
    revalidateAll();
  }, "Satır silindi.");
}

export async function moveTickerItemAction(id: number, direction: "up" | "down") {
  await requireManagerAction();
  await createAdminSession();
  const supabase = getSupabaseAdmin();

  const { data: rows, error } = await supabase
    .from("ticker_items")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  if (!rows) return;

  const idx = rows.findIndex((r) => r.id === id);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx === -1 || swapIdx < 0 || swapIdx >= rows.length) return;

  const a = rows[idx];
  const b = rows[swapIdx];

  await Promise.all([
    supabase.from("ticker_items").update({ sort_order: b.sort_order }).eq("id", a.id),
    supabase.from("ticker_items").update({ sort_order: a.sort_order }).eq("id", b.id),
  ]);

  revalidateAll();
}

// ---------- Afiş / Slider (menü üstü görsel şerit) ----------

export async function addBannerSlideAction(formData: FormData) {
  await requireManagerAction();
  await createAdminSession();

  await withFlash(async () => {
    const file = formData.get("image") as File | null;
    if (!file || file.size === 0) return;
    const link = String(formData.get("link") ?? "").trim();

    const supabase = getSupabaseAdmin();
    const url = await uploadImage(file, "banners", `b-${Date.now()}`);

    const { count } = await supabase
      .from("banner_slides")
      .select("id", { count: "exact", head: true });

    const { error } = await supabase
      .from("banner_slides")
      .insert({ image_url: url, link_url: link || null, sort_order: count ?? 0 });
    if (error) throw error;

    revalidateAll();
  }, "Afiş eklendi.");
}

export async function deleteBannerSlideAction(id: number) {
  await requireManagerAction();
  await createAdminSession();

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("banner_slides").delete().eq("id", id);
    if (error) throw error;
    revalidateAll();
  }, "Afiş silindi.");
}

export async function setBannerSlideLiveAction(id: number, active: boolean) {
  await requireManagerAction();
  await createAdminSession();

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("banner_slides")
      .update({ active })
      .eq("id", id);
    if (error) throw error;
    revalidateAll();
  }, active ? "Afiş yayına alındı." : "Afiş yayından kaldırıldı.");
}

export async function moveBannerSlideAction(id: number, direction: "up" | "down") {
  await requireManagerAction();
  await createAdminSession();
  const supabase = getSupabaseAdmin();

  const { data: rows, error } = await supabase
    .from("banner_slides")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  if (!rows) return;

  const idx = rows.findIndex((r) => r.id === id);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx === -1 || swapIdx < 0 || swapIdx >= rows.length) return;

  const a = rows[idx];
  const b = rows[swapIdx];

  await Promise.all([
    supabase.from("banner_slides").update({ sort_order: b.sort_order }).eq("id", a.id),
    supabase.from("banner_slides").update({ sort_order: a.sort_order }).eq("id", b.id),
  ]);

  revalidateAll();
}

// ---------- Müşteri Yorumları (kayan yorum şeridi) ----------

function clampStars(raw: FormDataEntryValue | null): number {
  const n = Math.round(Number(raw));
  if (!Number.isFinite(n)) return 5;
  return Math.min(5, Math.max(1, n));
}

export async function addReviewAction(formData: FormData) {
  await requireManagerAction();
  await createAdminSession();

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();
    const name = String(formData.get("name") ?? "").trim();
    const text = String(formData.get("text") ?? "").trim();
    if (!name || !text) return;
    const stars = clampStars(formData.get("stars"));

    const { count } = await supabase
      .from("reviews")
      .select("id", { count: "exact", head: true });

    const { error } = await supabase
      .from("reviews")
      .insert({ name, text, stars, sort_order: count ?? 0 });
    if (error) throw error;

    revalidateAll();
  }, "Yorum eklendi.");
}

export async function updateReviewAction(formData: FormData) {
  await requireManagerAction();
  await createAdminSession();

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();
    const id = Number(formData.get("id"));
    const name = String(formData.get("name") ?? "").trim();
    const text = String(formData.get("text") ?? "").trim();
    if (!id || !name || !text) return;
    const stars = clampStars(formData.get("stars"));

    const { error } = await supabase
      .from("reviews")
      .update({ name, text, stars })
      .eq("id", id);
    if (error) throw error;

    revalidateAll();
  }, "Yorum kaydedildi.");
}

export async function deleteReviewAction(id: number) {
  await requireManagerAction();
  await createAdminSession();

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) throw error;
    revalidateAll();
  }, "Yorum silindi.");
}

export async function setReviewLiveAction(id: number, active: boolean) {
  await requireManagerAction();
  await createAdminSession();

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("reviews").update({ active }).eq("id", id);
    if (error) throw error;
    revalidateAll();
  }, active ? "Yorum yayına alındı." : "Yorum yayından kaldırıldı.");
}

// Sürükle-bırak ile yeniden sıralama — istemciden hesaplanmış tam id listesini
// (string) alır ve sort_order'ı buna göre yeniden yazar.
export async function reorderReviewsAction(orderedIds: string[]) {
  await requireManagerAction();
  await createAdminSession();

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();
    const results = await Promise.all(
      orderedIds.map((id, index) =>
        supabase.from("reviews").update({ sort_order: index }).eq("id", Number(id)),
      ),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) throw failed.error;
    revalidateAll();
  }, "Yorum sıralaması güncellendi.");
}

// ---------- Sipariş Yönetimi ----------

// Bir masanın tüm aktif siparişlerini 'paid' (ödendi/kapandı) olarak işaretler.
// Yıldız, sipariş başına değil MASA OTURUMU başına verilir: masadaki tüm
// siparişleri veren her farklı müşteriye burada, kapanışta 1 yıldız eklenir —
// aynı oturumda 10 ürün de sipariş etse tek yıldız kazanır; masadan kalkıp
// başka zaman tekrar gelince (yeni oturum → yeni masa kapanışı) 2. yıldızı alır.
export async function closeTableTabAction(tableNumber: string) {
  await requireAdmin();
  await createAdminSession();

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();

    const { data: activeOrders, error: fetchErr } = await supabase
      .from("orders")
      .select("customer_id")
      .eq("table_number", tableNumber)
      .eq("status", "active");
    if (fetchErr) throw fetchErr;

    const { error } = await supabase
      .from("orders")
      .update({ status: "paid", closed_at: new Date().toISOString() })
      .eq("table_number", tableNumber)
      .eq("status", "active");
    if (error) throw error;

    const customerIds = Array.from(new Set((activeOrders ?? []).map((o) => o.customer_id)));
    await Promise.all(
      customerIds.map(async (customerId) => {
        const { data: profile } = await supabase
          .from("customer_profiles")
          .select("stars, lifetime_stars")
          .eq("id", customerId)
          .maybeSingle();
        await supabase
          .from("customer_profiles")
          .update({
            stars: (profile?.stars ?? 0) + 1,
            lifetime_stars: (profile?.lifetime_stars ?? 0) + 1,
          })
          .eq("id", customerId);
      }),
    );

    revalidatePath("/admin/siparisler");
    revalidatePath("/admin/siparis-gecmisi");
    revalidatePath("/admin/musteriler");
  }, `Masa ${tableNumber} kapatıldı.`);
}

// Tek bir siparişi "Teslim Edildi" olarak işaretler (masanın adisyonu hâlâ açık kalır).
export async function markOrderDeliveredAction(orderId: number) {
  await requireAdmin();
  await createAdminSession();

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("orders")
      .update({ delivered: true })
      .eq("id", orderId);
    if (error) throw error;
    revalidatePath("/admin/siparisler");
  }, "Sipariş teslim edildi olarak işaretlendi.");
}

// Yanlışlıkla verilen bir siparişi tamamen iptal eder (kalemleriyle birlikte siler).
export async function cancelOrderAction(orderId: number) {
  await requireAdmin();
  await createAdminSession();

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("orders").delete().eq("id", orderId);
    if (error) throw error;
    revalidatePath("/admin/siparisler");
  }, "Sipariş iptal edildi.");
}

// ---------- Müşteri Yönetimi ----------

// Bir müşteriye elle yıldız ekler (ör. unutulan bir siparişi telafi etmek için).
export async function addCustomerStarsAction(customerId: string, amount: number) {
  await requireManagerAction();
  await createAdminSession();

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();
    const { data: profile, error: fetchErr } = await supabase
      .from("customer_profiles")
      .select("stars, lifetime_stars")
      .eq("id", customerId)
      .maybeSingle();
    if (fetchErr) throw fetchErr;

    const newStars = Math.max(0, (profile?.stars ?? 0) + amount);
    const update: Record<string, number> = { stars: newStars };
    // Tüm-zamanlar sayacı yalnızca gerçekten kazanılan (pozitif) yıldızlarla artar.
    if (amount > 0) {
      update.lifetime_stars = (profile?.lifetime_stars ?? 0) + amount;
    }
    const { error } = await supabase
      .from("customer_profiles")
      .update(update)
      .eq("id", customerId);
    if (error) throw error;
    revalidatePath("/admin/musteriler");
  }, `${amount > 0 ? "+" : ""}${amount} yıldız eklendi.`);
}

// Gerçek şifreler geri döndürülemez şekilde hash'lendiği için (Supabase Auth,
// güvenlik gereği) GÖSTERİLEMEZ — bunun yerine admin üye için yeni bir şifre
// belirleyebilir (service_role ile, eski şifreyi bilmeye gerek kalmadan).
export async function resetCustomerPasswordAction(formData: FormData) {
  await requireManagerAction();
  await createAdminSession();

  await withFlash(async () => {
    const customerId = String(formData.get("customer_id") ?? "");
    const password = String(formData.get("password") ?? "");
    if (!customerId || !password) return;
    if (password.length < 6) throw new Error("Şifre en az 6 karakter olmalı.");

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.auth.admin.updateUserById(customerId, { password });
    if (error) throw error;
    revalidatePath("/admin/musteriler");
  }, "Şifre güncellendi.");
}

// Admin panelinden elle yeni bir müşteri hesabı oluşturur (e-posta onayına
// gerek kalmadan otomatik onaylı) — customer_profiles satırı, auth.users
// tetikleyicisi (on_auth_user_created) tarafından otomatik oluşturulur.
export async function addCustomerAction(formData: FormData) {
  await requireManagerAction();
  await createAdminSession();

  await withFlash(async () => {
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    if (!name || !email || !password) return;
    if (password.length < 6) throw new Error("Şifre en az 6 karakter olmalı.");

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });
    if (error) throw error;

    revalidatePath("/admin/musteriler");
  }, "Müşteri eklendi.");
}

// Bir müşteri hesabını (auth.users + customer_profiles, cascade ile) tamamen siler.
export async function deleteCustomerAction(customerId: string) {
  await requireManagerAction();
  await createAdminSession();

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.auth.admin.deleteUser(customerId);
    if (error) throw error;
    revalidatePath("/admin/musteriler");
  }, "Müşteri silindi.");
}

// ---------- Yedekleme (site sahibine özel) ----------

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

// Müşteri CSV yedeğini içe aktarır — yalnızca zaten kayıtlı müşterilerin
// ad / yıldız / toplam-yıldız alanları güncellenir (yeni auth kullanıcısı
// oluşturulmaz).
export async function importCustomersAction(formData: FormData) {
  await requireOwnerAction();
  await createAdminSession();

  await withFlash(async () => {
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) throw new Error("Dosya seçilmedi.");

    const text = (await file.text()).replace(/^﻿/, "");
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) throw new Error("Dosya boş görünüyor.");

    const header = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
    const iId = header.indexOf("id");
    const iName = header.indexOf("ad");
    const iStars = header.indexOf("yildiz");
    const iLife = header.indexOf("toplam_yildiz");
    if (iId === -1) throw new Error("CSV başlığında 'id' sütunu bulunamadı.");

    const UUID_RE = /^[0-9a-fA-F-]{32,40}$/;
    const rows = lines
      .slice(1)
      .map(parseCsvLine)
      .filter((c) => UUID_RE.test((c[iId] ?? "").trim()));
    if (rows.length === 0) throw new Error("Geçerli müşteri kaydı bulunamadı.");

    const supabase = getSupabaseAdmin();
    const ids = rows.map((c) => c[iId].trim());
    const { data: existing } = await supabase
      .from("customer_profiles")
      .select("id")
      .in("id", ids);
    const existSet = new Set((existing ?? []).map((r) => r.id as string));

    let updated = 0;
    let skipped = 0;
    for (const c of rows) {
      const id = c[iId].trim();
      if (!existSet.has(id)) {
        skipped++;
        continue;
      }
      const patch: Record<string, unknown> = {};
      if (iName !== -1) patch.name = (c[iName] ?? "").trim();
      if (iStars !== -1) patch.stars = Number(c[iStars]) || 0;
      if (iLife !== -1) patch.lifetime_stars = Number(c[iLife]) || 0;
      const { error } = await supabase
        .from("customer_profiles")
        .update(patch)
        .eq("id", id);
      if (error) skipped++;
      else updated++;
    }

    revalidatePath("/admin/musteriler");
    if (updated === 0) {
      throw new Error(
        `Güncellenen kayıt yok (${skipped} atlandı — panelde kayıtlı olmayan müşteriler).`,
      );
    }
  }, "Müşteri yedeği içe aktarıldı.");
}

// Site içeriği JSON yedeğini geri yükler. Kategori/ürün id bazında güncellenir;
// afiş / kayan yazı / yorum / duyuru tabloları silinip yeniden yazılır.
export async function importSiteBackupAction(formData: FormData) {
  await requireOwnerAction();
  await createAdminSession();

  await withFlash(async () => {
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) throw new Error("Dosya seçilmedi.");

    let backup: Record<string, unknown>;
    try {
      backup = JSON.parse(await file.text());
    } catch {
      throw new Error("Geçersiz JSON dosyası.");
    }
    const rowsOf = (k: string): Record<string, unknown>[] =>
      Array.isArray(backup[k]) ? (backup[k] as Record<string, unknown>[]) : [];

    const supabase = getSupabaseAdmin();

    const cats = rowsOf("categories");
    if (cats.length) {
      const { error } = await supabase.from("categories").upsert(cats, { onConflict: "id" });
      if (error) throw new Error("Kategoriler yüklenemedi: " + error.message);
    }

    const prods = rowsOf("products");
    if (prods.length) {
      const { error } = await supabase.from("products").upsert(prods, { onConflict: "id" });
      if (error) throw new Error("Ürünler yüklenemedi: " + error.message);
    }

    const settings = rowsOf("site_settings")[0];
    if (settings) {
      const { id, ...rest } = settings;
      void id;
      await supabase.from("site_settings").update(rest).eq("id", "default");
    }

    for (const table of ["banner_slides", "ticker_items", "reviews", "announcements"] as const) {
      const rows = rowsOf(table);
      await supabase.from(table).delete().gte("id", 0);
      if (rows.length) {
        const clean = rows.map(({ id, ...r }) => {
          void id;
          return r;
        });
        const { error } = await supabase.from(table).insert(clean);
        if (error) throw new Error(`${table} yüklenemedi: ` + error.message);
      }
    }

    revalidateAll();
  }, "Site yedeği içe aktarıldı.");
}

// ---------- Kategoriler ----------

export async function addCategoryAction(formData: FormData) {
  await requireManagerAction();
  await createAdminSession();

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();
    const nameTr = String(formData.get("name_tr") ?? "").trim();
    const nameEn = String(formData.get("name_en") ?? "").trim();
    const emoji = String(formData.get("emoji") ?? "🍽️").trim();
    if (!nameTr) return;

    const id = slugify(nameTr, "kategori");

    const { count } = await supabase
      .from("categories")
      .select("id", { count: "exact", head: true });

    const { error } = await supabase.from("categories").insert({
      id,
      name_tr: nameTr,
      name_en: nameEn || nameTr,
      emoji,
      sort_order: count ?? 0,
    });
    if (error) throw error;

    const file = formData.get("image") as File | null;
    if (file && file.size > 0) {
      const url = await uploadImage(file, "categories", id);
      const { error: imgErr } = await supabase
        .from("categories")
        .update({ image_url: url })
        .eq("id", id);
      if (imgErr) throw imgErr;
    }

    revalidateAll();
  }, "Kategori eklendi.");
}

export async function updateCategoryAction(formData: FormData) {
  await requireManagerAction();
  await createAdminSession(); // her işlemde oturumu 10 dakika daha uzatır

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();
    const id = String(formData.get("id"));
    const nameTr = String(formData.get("name_tr") ?? "").trim();
    const nameEn = String(formData.get("name_en") ?? "").trim();
    const emoji = String(formData.get("emoji") ?? "").trim();

    const { error } = await supabase
      .from("categories")
      .update({ name_tr: nameTr, name_en: nameEn, emoji })
      .eq("id", id);
    if (error) throw error;

    const file = formData.get("image") as File | null;
    if (file && file.size > 0) {
      const url = await uploadImage(file, "categories", id);
      const { error: imgErr } = await supabase
        .from("categories")
        .update({ image_url: url })
        .eq("id", id);
      if (imgErr) throw imgErr;
    }

    revalidateAll();
  }, "Kategori kaydedildi.");
}

export async function deleteCategoryAction(id: string) {
  await requireManagerAction();
  await createAdminSession(); // her işlemde oturumu 10 dakika daha uzatır

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();
    // products.category_id -> categories.id "on delete cascade" olduğu için
    // kategoriye ait ürünler de otomatik olarak silinir.
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
    revalidateAll();
  }, "Kategori silindi.");
}

// Sürükle-bırak ile yeniden sıralama — istemciden hesaplanmış tam id listesini alır
// ve sort_order'ı buna göre tek seferde yeniden yazar.
export async function reorderCategoriesAction(orderedIds: string[]) {
  await requireManagerAction();
  await createAdminSession();

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();
    const { error } = await Promise.all(
      orderedIds.map((id, index) =>
        supabase.from("categories").update({ sort_order: index }).eq("id", id),
      ),
    ).then((results) => {
      const failed = results.find((r) => r.error);
      return { error: failed?.error ?? null };
    });
    if (error) throw error;
    revalidateAll();
  }, "Kategori sıralaması güncellendi.");
}

export async function moveCategoryAction(id: string, direction: "up" | "down") {
  await requireManagerAction();
  await createAdminSession(); // her işlemde oturumu 10 dakika daha uzatır
  const supabase = getSupabaseAdmin();
  const { data: rows, error } = await supabase
    .from("categories")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  if (!rows) return;

  const idx = rows.findIndex((r) => r.id === id);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx === -1 || swapIdx < 0 || swapIdx >= rows.length) return;

  const a = rows[idx];
  const b = rows[swapIdx];

  await Promise.all([
    supabase.from("categories").update({ sort_order: b.sort_order }).eq("id", a.id),
    supabase.from("categories").update({ sort_order: a.sort_order }).eq("id", b.id),
  ]);

  revalidateAll();
}

// ---------- Ürünler ----------

export async function addProductAction(formData: FormData) {
  await requireManagerAction();
  await createAdminSession(); // her işlemde oturumu 10 dakika daha uzatır

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();
    const categoryId = String(formData.get("category_id"));
    const nameTr = String(formData.get("name_tr") ?? "").trim();
    const nameEn = String(formData.get("name_en") ?? "").trim();
    if (!nameTr || !categoryId) return;

    const id = slugify(nameTr, "urun");

    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category_id", categoryId);

    const { error } = await supabase.from("products").insert({
      id,
      category_id: categoryId,
      name_tr: nameTr,
      name_en: nameEn || nameTr,
      emoji: String(formData.get("emoji") ?? "🍽️"),
      sort_order: count ?? 0,
    });
    if (error) throw error;

    revalidateAll();
  }, "Ürün eklendi.");
}

export async function updateProductAction(formData: FormData) {
  await requireManagerAction();
  await createAdminSession(); // her işlemde oturumu 10 dakika daha uzatır

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();
    const id = String(formData.get("id"));
    const nameTr = String(formData.get("name_tr") ?? "").trim();
    const nameEn = String(formData.get("name_en") ?? "").trim();
    const descTr = String(formData.get("description_tr") ?? "").trim();
    const descEn = String(formData.get("description_en") ?? "").trim();
    const priceRaw = String(formData.get("price") ?? "").trim();
    const emoji = String(formData.get("emoji") ?? "").trim();
    const outOfStock = formData.get("out_of_stock") === "on";
    const campaignPriceRaw = String(formData.get("campaign_price") ?? "").trim();
    const campaignActive = formData.get("campaign_active") === "on";

    const { error } = await supabase
      .from("products")
      .update({
        name_tr: nameTr,
        name_en: nameEn,
        description_tr: descTr || null,
        description_en: descEn || null,
        price: priceRaw ? Number(priceRaw) : null,
        emoji,
        out_of_stock: outOfStock,
        campaign_price: campaignPriceRaw ? Number(campaignPriceRaw) : null,
        campaign_active: campaignActive,
      })
      .eq("id", id);
    if (error) throw error;

    const file = formData.get("image") as File | null;
    if (file && file.size > 0) {
      const url = await uploadImage(file, "products", id);
      const { error: imgErr } = await supabase
        .from("products")
        .update({ image_url: url })
        .eq("id", id);
      if (imgErr) throw imgErr;
    }

    revalidateAll();
  }, "Ürün kaydedildi.");
}

export async function deleteProductAction(id: string) {
  await requireManagerAction();
  await createAdminSession(); // her işlemde oturumu 10 dakika daha uzatır

  await withFlash(async () => {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    revalidateAll();
  }, "Ürün silindi.");
}

export async function moveProductAction(
  id: string,
  categoryId: string,
  direction: "up" | "down",
) {
  await requireManagerAction();
  await createAdminSession(); // her işlemde oturumu 10 dakika daha uzatır
  const supabase = getSupabaseAdmin();
  const { data: rows, error } = await supabase
    .from("products")
    .select("id, sort_order")
    .eq("category_id", categoryId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  if (!rows) return;

  const idx = rows.findIndex((r) => r.id === id);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx === -1 || swapIdx < 0 || swapIdx >= rows.length) return;

  const a = rows[idx];
  const b = rows[swapIdx];

  await Promise.all([
    supabase.from("products").update({ sort_order: b.sort_order }).eq("id", a.id),
    supabase.from("products").update({ sort_order: a.sort_order }).eq("id", b.id),
  ]);

  revalidateAll();
}
