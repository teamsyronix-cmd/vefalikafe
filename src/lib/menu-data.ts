import { getSupabaseAdmin } from "./supabase";
import type { Category, Product } from "@/data/menu";

type CategoryRow = {
  id: string;
  name_tr: string;
  name_en: string;
  emoji: string;
  image_url: string | null;
  sort_order: number;
};

type ProductRow = {
  id: string;
  category_id: string;
  name_tr: string;
  name_en: string;
  description_tr: string | null;
  description_en: string | null;
  price: number | null;
  emoji: string;
  image_url: string | null;
  out_of_stock: boolean;
  sort_order: number;
  campaign_price: number | null;
  campaign_active: boolean | null;
};

export type SiteSettings = {
  announcementEnabled: boolean;
  announcementTitle: string;
  announcementMessage: string;
  announcementImage?: string;
  logoUrl?: string;
  menuMode?: string | null;
  maintenance: boolean;
  adminEmail?: string;
  adminAvatarUrl?: string;
  socialInstagramUrl?: string;
  socialTiktokUrl?: string;
  socialMapsUrl?: string;
  starsEnabled: boolean;
};

function rowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: { tr: row.name_tr, en: row.name_en },
    emoji: row.emoji,
    image: row.image_url ?? undefined,
  };
}

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: { tr: row.name_tr, en: row.name_en },
    description:
      row.description_tr || row.description_en
        ? { tr: row.description_tr ?? "", en: row.description_en ?? "" }
        : undefined,
    price: row.price ?? undefined,
    emoji: row.emoji,
    image: row.image_url ?? undefined,
    outOfStock: row.out_of_stock,
    campaignPrice: row.campaign_price ?? undefined,
    campaignActive: row.campaign_active ?? false,
  };
}

export async function getCategories(): Promise<Category[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToCategory);
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToCategory(data) : null;
}

export async function getProducts(): Promise<Product[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToProduct);
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", categoryId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToProduct);
}

const EMPTY_SETTINGS: SiteSettings = {
  announcementEnabled: false,
  announcementTitle: "",
  announcementMessage: "",
  maintenance: false,
  starsEnabled: true,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();
  // Tablo henüz oluşturulmadıysa (kurulumun bu adımı atlanmışsa) sessizce
  // varsayılana düş — site bu yüzden çökmesin.
  if (error) return EMPTY_SETTINGS;
  return {
    announcementEnabled: data?.announcement_enabled ?? false,
    announcementTitle: data?.announcement_title ?? "",
    announcementMessage: data?.announcement_message ?? "",
    announcementImage: data?.announcement_image_url ?? undefined,
    logoUrl: data?.logo_url ?? undefined,
    menuMode: data?.menu_mode ?? null,
    maintenance: data?.maintenance ?? false,
    adminEmail: data?.admin_email ?? undefined,
    adminAvatarUrl: data?.admin_avatar_url ?? undefined,
    socialInstagramUrl: data?.social_instagram_url ?? undefined,
    socialTiktokUrl: data?.social_tiktok_url ?? undefined,
    socialMapsUrl: data?.social_maps_url ?? undefined,
    starsEnabled: data?.stars_enabled ?? true,
  };
}

export type AnnouncementHistoryItem = {
  id: number;
  title: string;
  message: string;
  image?: string;
  createdAt: string;
};

export async function getAnnouncementHistory(limit = 4): Promise<AnnouncementHistoryItem[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []).map((r) => ({
    id: r.id,
    title: r.title ?? "",
    message: r.message ?? "",
    image: r.image_url ?? undefined,
    createdAt: r.created_at,
  }));
}

export type TickerItem = {
  id: number;
  text: string;
};

// ticker_items tablosu henüz oluşturulmadıysa gösterilecek geçici liste.
const FALLBACK_TICKER: TickerItem[] = [
  { id: -1, text: "Açılış Saatleri: 08:00 – 23:00" },
  { id: -2, text: "Wi-Fi: Vefali_Misafir" },
  { id: -3, text: "Bize Google'da yorum bırakmayı unutmayın" },
];

export async function getTickerItems(): Promise<TickerItem[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("ticker_items")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error || !data || data.length === 0) return FALLBACK_TICKER;
  return data.map((r) => ({ id: r.id, text: r.text }));
}

// ---------- Afiş / Slider (menü üstü görsel şerit) ----------

export type BannerSlide = {
  id: number;
  image: string;
  link?: string;
};

export type BannerSlideAdmin = BannerSlide & {
  active: boolean;
  createdAt: string;
};

type BannerRow = {
  id: number;
  image_url: string;
  link_url: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
};

// Müşteriye gösterilen: yalnızca yayında olan afişler, sıralı.
export async function getBannerSlides(): Promise<BannerSlide[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("banner_slides")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  // banner_slides tablosu henüz oluşturulmadıysa sessizce boş dön.
  if (error) return [];
  return ((data ?? []) as BannerRow[]).map((r) => ({
    id: r.id,
    image: r.image_url,
    link: r.link_url ?? undefined,
  }));
}

// Admin panelinde gösterilen: yayında olmayanlar dahil hepsi.
export async function getAllBannerSlides(): Promise<BannerSlideAdmin[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("banner_slides")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) return [];
  return ((data ?? []) as BannerRow[]).map((r) => ({
    id: r.id,
    image: r.image_url,
    link: r.link_url ?? undefined,
    active: r.active,
    createdAt: r.created_at,
  }));
}

// ---------- Müşteri Yorumları (afiş sliderının altında kayan şerit) ----------

export type Review = {
  id: number;
  name: string;
  stars: number;
  text: string;
};

export type ReviewAdmin = Review & { active: boolean };

type ReviewRow = {
  id: number;
  name: string;
  stars: number;
  text: string;
  active: boolean;
  sort_order: number;
};

// reviews tablosu henüz oluşturulmadıysa / boşsa gösterilecek varsayılan liste.
const FALLBACK_REVIEWS: Review[] = [
  { id: -1, name: "Elif K.", stars: 5, text: "Taze limonata gerçekten günlük sıkılmış. Masalar sürekli siliniyor, mekân tertemiz." },
  { id: -2, name: "Burak T.", stars: 5, text: "Smash burger efsane, yanındaki patates çıtır çıtırdı. Servis de çok hızlı." },
  { id: -3, name: "Zeynep A.", stars: 4, text: "Kahveler için geliyorum; flat white kıvamında geliyor, personel güler yüzlü." },
  { id: -4, name: "Mert Y.", stars: 5, text: "Gözleme sıcacık ve bol malzemeli geldi. Fiyat/performans harika." },
  { id: -5, name: "Selin D.", stars: 5, text: "Sufle sıcak servis edildi, yanında dondurmayla birlikte tam kıvamında." },
  { id: -6, name: "Can Ö.", stars: 5, text: "Mutfak dışarıdan görünüyor, hijyene ne kadar önem verdikleri belli." },
  { id: -7, name: "Aslı M.", stars: 4, text: "Meyveli soda ve Beyoğlu gazozu buz gibiydi, sıcak günde birebir." },
  { id: -8, name: "Emre S.", stars: 5, text: "Saatlerce çalıştım, kimse rahatsız etmedi, Wi-Fi hızlı. Priz de bol." },
  { id: -9, name: "Deniz K.", stars: 5, text: "Ayran köpüklü ve gerçek. Kahvaltı tabağı çok doyurucu, her şey taze." },
  { id: -10, name: "Gizem B.", stars: 5, text: "Masaya gelen her şey kapalı geldi, çalışanlar eldivenli. Temizlik on numara." },
  { id: -11, name: "Kaan R.", stars: 5, text: "Cool Mango inanılmaz ferahlatıcı, sunumu da çok şık. Bayıldım." },
  { id: -12, name: "Nur H.", stars: 4, text: "Makarna porsiyonu büyük, sosu ev yapımı gibi. Kesinlikle tekrar geleceğiz." },
];

// Müşteriye gösterilen: yalnızca yayında olan yorumlar, sıralı. Tablo yoksa /
// boşsa varsayılan listeye düşer (şerit hiç boş kalmasın).
export async function getReviews(): Promise<Review[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error || !data || data.length === 0) return FALLBACK_REVIEWS;
  return (data as ReviewRow[]).map((r) => ({
    id: r.id,
    name: r.name,
    stars: r.stars,
    text: r.text,
  }));
}

// Admin panelinde gösterilen: yayında olmayanlar dahil hepsi.
export async function getAllReviews(): Promise<ReviewAdmin[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) return [];
  return (data as ReviewRow[]).map((r) => ({
    id: r.id,
    name: r.name,
    stars: r.stars,
    text: r.text,
    active: r.active,
  }));
}

// ---------- Panel Kullanıcıları (garson / müdür hesapları) ----------

export type PanelUser = {
  id: number;
  username: string;
  role: "garson" | "mudur";
  active: boolean;
  createdAt: string;
};

export async function getPanelUsers(): Promise<PanelUser[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("panel_users")
      .select("id, username, role, active, created_at")
      .order("created_at", { ascending: true });
    if (error) return [];
    return (data ?? []).map((r) => ({
      id: r.id,
      username: r.username,
      role: r.role === "mudur" ? "mudur" : "garson",
      active: r.active,
      createdAt: r.created_at,
    }));
  } catch {
    return [];
  }
}

export type LoginRecord = {
  loggedInAt: string;
  ip: string | null;
};

export async function getRecentLogins(limit = 5): Promise<LoginRecord[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("login_log")
    .select("*")
    .order("logged_in_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []).map((r) => ({
    loggedInAt: r.logged_in_at as string,
    ip: (r as { ip_address?: string | null }).ip_address ?? null,
  }));
}

// ---------- Site Ziyaretleri (İstatistik paneli) ----------

// Ana sayfa her açıldığında bir kayıt ekler — "site girişi" sayacı.
// Tablo henüz oluşturulmadıysa sessizce geçilir, sayfa akışını etkilemez.
export async function recordVisit(): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("site_visits").insert({});
  } catch {
    // site_visits tablosu henüz yoksa yut
  }
}

// Bir dönem + bir önceki eş dönem karşılaştırması. deltaPct, önceki dönem 0'sa null.
export type TrendMetric = { value: number; prev: number; deltaPct: number | null };

export type VisitStats = {
  last24h: TrendMetric;
  last7d: TrendMetric;
  last30d: TrendMetric;
  total: number;
  // Son 14 günün günlük ziyaret sayıları (en eskiden en yeniye) — grafik için.
  daily: { label: string; count: number }[];
};

function trend(value: number, prev: number): TrendMetric {
  return {
    value,
    prev,
    deltaPct: prev > 0 ? Math.round(((value - prev) / prev) * 100) : null,
  };
}

const ZERO_TREND: TrendMetric = { value: 0, prev: 0, deltaPct: null };
const EMPTY_VISIT_STATS: VisitStats = {
  last24h: ZERO_TREND,
  last7d: ZERO_TREND,
  last30d: ZERO_TREND,
  total: 0,
  daily: [],
};

const ISTANBUL_DAY_KEY = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" });
const ISTANBUL_DAY_LABEL = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
  timeZone: "Europe/Istanbul",
});

export async function getVisitStats(): Promise<VisitStats> {
  try {
    const supabase = getSupabaseAdmin();
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    const since60d = new Date(now - 60 * DAY).toISOString();

    // Son 60 günün ham kayıtları tek sorguda — dönem karşılaştırmalarını ve
    // günlük grafiği JS'te hesaplıyoruz (kafe QR menüsü için hacim küçük).
    const [recentRes, totalRes] = await Promise.all([
      supabase.from("site_visits").select("visited_at").gte("visited_at", since60d),
      supabase.from("site_visits").select("id", { count: "exact", head: true }),
    ]);

    const times = (recentRes.data ?? []).map((r) =>
      new Date(r.visited_at as string).getTime(),
    );
    const between = (loMsAgo: number, hiMsAgo: number) =>
      times.filter((t) => t > now - loMsAgo && t <= now - hiMsAgo).length;

    const last24h = trend(between(DAY, 0), between(2 * DAY, DAY));
    const last7d = trend(between(7 * DAY, 0), between(14 * DAY, 7 * DAY));
    const last30d = trend(between(30 * DAY, 0), between(60 * DAY, 30 * DAY));

    const countsByDay = new Map<string, number>();
    for (const t of times) {
      const key = ISTANBUL_DAY_KEY.format(new Date(t));
      countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
    }
    const daily: { label: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * DAY);
      const key = ISTANBUL_DAY_KEY.format(d);
      daily.push({ label: ISTANBUL_DAY_LABEL.format(d), count: countsByDay.get(key) ?? 0 });
    }

    return { last24h, last7d, last30d, total: totalRes.count ?? 0, daily };
  } catch {
    return EMPTY_VISIT_STATS;
  }
}

// ---------- Bu Ayın En Çok Sipariş Edilen Ürünleri ----------

export type TopProduct = {
  name: string;
  quantity: number;
  revenue: number;
};

export type TopProductsResult = {
  monthLabel: string;
  totalOrders: number;
  items: TopProduct[];
};

const ISTANBUL_MONTH_LABEL = new Intl.DateTimeFormat("tr-TR", {
  month: "long",
  year: "numeric",
  timeZone: "Europe/Istanbul",
});

export async function getTopProductsThisMonth(limit = 5): Promise<TopProductsResult> {
  const monthLabel = ISTANBUL_MONTH_LABEL.format(new Date());
  try {
    const supabase = getSupabaseAdmin();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: orders, error: ordersErr } = await supabase
      .from("orders")
      .select("id")
      .gte("created_at", monthStart);
    if (ordersErr || !orders || orders.length === 0) {
      return { monthLabel, totalOrders: orders?.length ?? 0, items: [] };
    }

    const orderIds = orders.map((o) => o.id);
    const { data: items, error: itemsErr } = await supabase
      .from("order_items")
      .select("product_name_tr, quantity, line_total")
      .in("order_id", orderIds);
    if (itemsErr || !items) {
      return { monthLabel, totalOrders: orders.length, items: [] };
    }

    const byName = new Map<string, TopProduct>();
    for (const it of items) {
      const name = (it.product_name_tr as string) || "?";
      const entry = byName.get(name) ?? { name, quantity: 0, revenue: 0 };
      entry.quantity += Number(it.quantity) || 0;
      entry.revenue += Number(it.line_total) || 0;
      byName.set(name, entry);
    }

    const top = Array.from(byName.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);

    return { monthLabel, totalOrders: orders.length, items: top };
  } catch {
    return { monthLabel, totalOrders: 0, items: [] };
  }
}
