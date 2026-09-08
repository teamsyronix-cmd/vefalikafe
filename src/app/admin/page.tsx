import Link from "next/link";
import { isOwner, requireManager } from "@/lib/auth";
import {
  getAllBannerSlides,
  getAllReviews,
  getAnnouncementHistory,
  getCategories,
  getProducts,
  getRecentLogins,
  getSiteSettings,
  getTickerItems,
  getTopProductsThisMonth,
  getVisitStats,
} from "@/lib/menu-data";
import ThemeToggle from "@/components/admin/ThemeToggle";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import ToggleSwitch from "@/components/admin/ToggleSwitch";
import SettingsTabs from "@/components/admin/SettingsTabs";
import { VisitStatCards, TopProductsList } from "@/components/admin/DashboardStats";
import SortableList, { DragHandle } from "@/components/admin/SortableList";
import BackupImportButton from "@/components/admin/BackupImportButton";
import PanelGlow from "@/components/PanelGlow";
import PhotoPlaceholder from "@/components/PhotoPlaceholder";
import {
  addBannerSlideAction,
  addCategoryAction,
  addReviewAction,
  addTickerItemAction,
  deleteBannerSlideAction,
  deleteCategoryAction,
  deleteReviewAction,
  deleteTickerItemAction,
  moveBannerSlideAction,
  moveTickerItemAction,
  publishAnnouncementAction,
  updateLogoAction,
  reorderCategoriesAction,
  reorderReviewsAction,
  republishAnnouncementAction,
  setAnnouncementLiveAction,
  setBannerSlideLiveAction,
  setMaintenanceAction,
  setReviewLiveAction,
  setSnowModeAction,
  importSiteBackupAction,
  updateCategoryAction,
  updateReviewAction,
  updateTickerItemAction,
} from "./actions";

export const dynamic = "force-dynamic";

function greeting(): string {
  const hour = Number(
    new Intl.DateTimeFormat("tr-TR", {
      hour: "numeric",
      hour12: false,
      timeZone: "Europe/Istanbul",
    }).format(new Date()),
  );
  if (hour < 6) return "İyi geceler";
  if (hour < 12) return "Günaydın";
  if (hour < 18) return "İyi günler";
  return "İyi akşamlar";
}

function formatLoginTime(iso: string): string {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  });
}

// Yerel geliştirmede IP `::1` / `127.0.0.1` gelir — kullanıcıya "Yerel" göster.
function formatIp(ip: string | null): string {
  if (!ip) return "—";
  if (ip === "::1" || ip === "127.0.0.1" || ip === "::ffff:127.0.0.1") return "Yerel";
  return ip;
}

export default async function AdminDashboard() {
  const session = await requireManager();
  const owner = isOwner(session);

  const [
    categories,
    products,
    settings,
    history,
    tickerItems,
    recentLogins,
    visitStats,
    bannerSlides,
    reviews,
    topProducts,
  ] = await Promise.all([
    getCategories(),
    getProducts(),
    getSiteSettings(),
    getAnnouncementHistory(4),
    getTickerItems(),
    getRecentLogins(3),
    getVisitStats(),
    getAllBannerSlides(),
    getAllReviews(),
    getTopProductsThisMonth(4),
  ]);
  const adminName = process.env.ADMIN_DISPLAY_NAME ?? "Yönetici";

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">

      <div className="mb-6 flex items-center justify-end gap-2">
        <span className="mr-auto rounded-full bg-chip px-3 py-1.5 text-[12px] font-bold text-ink">
          {session.actor}
          <span className="ml-1.5 text-[11px] font-semibold text-accent">
            {session.role === "mudur" ? "yönetici" : "garson"}
          </span>
        </span>
        <Link
          href="/admin/kullanicilar"
          aria-label="Ayarlar"
          title="Ayarlar"
          className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-chip text-ink transition-colors hover:bg-line"
        >
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </Link>
        <ThemeToggle />
        <Link
          href="/tr"
          target="_blank"
          className="rounded-full bg-chip px-4 py-2 text-[13px] font-bold text-ink transition-colors hover:bg-line"
        >
          Siteyi Görüntüle ↗
        </Link>
      </div>

      <div className="relative mb-8 overflow-hidden rounded-[28px] bg-panel-solid p-6 text-white shadow-panel sm:p-8">
        <div className="relative z-[1] flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/15">
              {settings.adminAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.adminAvatarUrl}
                  alt="Profil fotoğrafı"
                  className="h-full w-full object-cover"
                />
              ) : (
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21a8 8 0 0 0-16 0" />
                  <circle cx="12" cy="8" r="4.5" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
                {greeting()}, {adminName} 👋
              </p>
              <p className="mt-1 text-[13px] font-semibold text-white/70">
                Vefalı menüsünü buradan güncelleyebilirsiniz.
              </p>
            </div>
          </div>

          {recentLogins.length > 0 && (
            <div className="min-w-[260px] sm:text-right">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/60">
                Son Girişler
              </p>
              <p className="mt-1 text-[13px] font-bold text-white">
                Aktif Giriş · {formatLoginTime(recentLogins[0].loggedInAt)}
                <span className="ml-1 font-semibold text-white/60">
                  · {formatIp(recentLogins[0].ip)}
                </span>
              </p>
              {recentLogins.length > 1 && (
                <div className="mt-1.5 space-y-0.5">
                  {recentLogins.slice(1, 3).map((rec, i) => (
                    <p key={i} className="text-[12px] font-semibold text-white/60">
                      {formatLoginTime(rec.loggedInAt)} · {formatIp(rec.ip)}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative z-[1] mt-6 flex flex-wrap gap-3">
          <div className="rounded-2xl bg-white/10 px-4 py-2.5">
            <p className="font-heading text-lg font-extrabold">{categories.length}</p>
            <p className="text-[11.5px] font-semibold text-white/70">Kategori</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-2.5">
            <p className="font-heading text-lg font-extrabold">{products.length}</p>
            <p className="text-[11.5px] font-semibold text-white/70">Ürün</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-2.5">
            <p className="font-heading text-lg font-extrabold">
              {products.filter((p) => !p.price).length}
            </p>
            <p className="text-[11.5px] font-semibold text-white/70">Fiyatsız</p>
          </div>

          {owner && (
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <a
                href="/admin/yedek"
                download
                className="flex items-center gap-1.5 rounded-2xl bg-white/15 px-4 py-2.5 text-[12.5px] font-bold text-white transition-colors hover:bg-white/25"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="M7 10l5 5 5-5" />
                  <path d="M12 15V3" />
                </svg>
                Site Yedeği Al
              </a>
              <BackupImportButton
                action={importSiteBackupAction}
                accept=".json,application/json"
                label="Yedek Yükle"
                confirmMessage="DİKKAT: Bu işlem kategori/ürün/fiyat/afiş/yorum/kayan yazı/ayar verilerini yedekteki hâliyle ÜZERİNE YAZAR. Devam edilsin mi?"
                className="flex items-center gap-1.5 rounded-2xl bg-white/15 px-4 py-2.5 text-[12.5px] font-bold text-white transition-colors hover:bg-white/25 disabled:opacity-60"
              />
            </div>
          )}
        </div>

        <span className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-accent/40 blur-2xl" />
        <span className="pointer-events-none absolute -bottom-14 right-24 h-32 w-32 rounded-full bg-accent/25 blur-2xl" />
      </div>

      {/* İstatistik — sekmelerin üstünde sabit */}
      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="relative overflow-hidden rounded-[28px] bg-surface p-5 shadow-card sm:p-6">
          <PanelGlow />
          <div className="relative z-[1]">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="font-heading text-lg font-extrabold text-ink">📊 Ziyaret İstatistiği</p>
                <p className="text-[12.5px] text-muted">Site girişleri ve dönemsel trend.</p>
              </div>
              <div className="text-right">
                <p className="font-heading text-xl font-extrabold text-ink">
                  {visitStats.total.toLocaleString("tr-TR")}
                </p>
                <p className="text-[10.5px] font-semibold text-muted">Toplam Giriş</p>
              </div>
            </div>
            <VisitStatCards stats={visitStats} />
          </div>
        </div>

        <div className="relative flex flex-col overflow-hidden rounded-[28px] bg-surface p-5 shadow-card sm:p-6">
          <PanelGlow />
          <div className="relative z-[1] flex h-full flex-col">
            <div className="flex items-center justify-between gap-2">
              <p className="font-heading text-lg font-extrabold text-ink">🔥 En Çok Sipariş</p>
              <span className="rounded-full bg-chip px-2 py-0.5 text-[10.5px] font-bold capitalize text-muted">
                {topProducts.monthLabel}
              </span>
            </div>
            <p className="mt-1 text-[12.5px] text-muted">
              Bu ay <b className="text-ink">{topProducts.totalOrders}</b> sipariş verildi.
            </p>
            <div className="mt-4 flex-1">
              <TopProductsList data={topProducts} />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Aktif Logo — kare kart */}
        <div className="relative flex flex-col overflow-hidden rounded-[28px] bg-surface p-5 shadow-card sm:p-6">
          <PanelGlow />
          <div className="relative z-[1] flex h-full flex-col">
            <p className="font-heading text-lg font-extrabold text-ink">🖼️ Aktif Logo</p>
            <p className="mt-1 text-[12.5px] text-muted">
              Menü sayfasının üstünde “Vefalı” yazısı yerine gösterilir.
            </p>

            <div className="mt-4 grid flex-1 place-items-center rounded-2xl bg-field p-5">
              {settings.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.logoUrl}
                  alt="Logo"
                  className="max-h-16 w-auto object-contain"
                />
              ) : (
                <span className="text-[13px] font-semibold text-muted">Logo yok</span>
              )}
            </div>

            <form
              action={updateLogoAction}
              className="mt-4 flex flex-wrap items-center gap-2"
            >
              <input
                name="image"
                type="file"
                accept="image/*"
                required
                className="min-w-0 flex-1 text-[12px] text-muted file:mr-2 file:rounded-full file:border-0 file:bg-chip file:px-3 file:py-1.5 file:text-[12px] file:font-bold file:text-ink"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-accent px-4 py-2 text-[13px] font-bold text-white transition-transform active:scale-[0.97]"
              >
                Değiştir
              </button>
            </form>
          </div>
        </div>

        {/* Menü Modları — kare kart, iOS tarzı anahtar */}
        <div className="relative flex flex-col overflow-hidden rounded-[28px] bg-surface p-5 shadow-card sm:p-6">
          <PanelGlow />
          <div className="relative z-[1] flex h-full flex-col">
            <p className="font-heading text-lg font-extrabold text-ink">🎛️ Menü Modları</p>
            <p className="mt-1 text-[12.5px] text-muted">
              Sitenin görünümünü özel bir temayla değiştirir.
            </p>

            <div className="mt-4 flex-1 space-y-2">
              <div className="flex items-center gap-3 rounded-2xl bg-field p-4">
                <span className="text-2xl">❄️</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold text-ink">Yılbaşı Teması</p>
                  <p className="text-[12px] text-muted">Menüde kar yağdırır.</p>
                </div>
                <ToggleSwitch
                  active={settings.menuMode === "snow"}
                  toggleAction={setSnowModeAction}
                />
              </div>

              <div
                className={`flex items-center gap-3 rounded-2xl p-4 transition-colors ${
                  settings.maintenance ? "bg-red-500/10" : "bg-field"
                }`}
              >
                <span className="text-2xl">🛠️</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold text-ink">Bakım Modu</p>
                  <p className="text-[12px] text-muted">
                    {settings.maintenance
                      ? "Menü kapalı — müşteriye bakım ekranı gösteriliyor."
                      : "Açınca tüm menü kapanır, bakım ekranı gösterilir."}
                  </p>
                </div>
                <ToggleSwitch
                  active={settings.maintenance}
                  toggleAction={setMaintenanceAction}
                  tone="danger"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <SettingsTabs
        design={
        <>
      <div className="relative mb-8 overflow-hidden rounded-[28px] bg-surface p-5 shadow-card sm:p-7">
        <PanelGlow />
        <div className="relative z-[1]">
          <p className="font-heading text-lg font-extrabold text-ink">🖼️ Afiş / Slider</p>
          <p className="mb-4 text-[13px] text-muted">
            Menü sayfasının en üstünde, arama kutusunun üzerinde kayan görsel şeridi.
            Duyuru ve etkinlik afişlerini buradan yükleyin. Tek afiş varsa sabit durur.
          </p>

          {bannerSlides.length === 0 ? (
            <p className="rounded-2xl bg-field p-3 text-[13px] text-muted">
              Henüz afiş eklenmedi.
            </p>
          ) : (
            <div className="space-y-2">
              {bannerSlides.map((slide, i) => (
                <div
                  key={slide.id}
                  className="flex items-center gap-2 rounded-xl border border-line bg-field p-2"
                >
                  <div className="flex shrink-0 items-center gap-1">
                    <form action={moveBannerSlideAction.bind(null, slide.id, "up")}>
                      <button
                        type="submit"
                        disabled={i === 0}
                        className="grid h-7 w-7 place-items-center rounded-full bg-chip text-ink disabled:opacity-30"
                      >
                        ↑
                      </button>
                    </form>
                    <form action={moveBannerSlideAction.bind(null, slide.id, "down")}>
                      <button
                        type="submit"
                        disabled={i === bannerSlides.length - 1}
                        className="grid h-7 w-7 place-items-center rounded-full bg-chip text-ink disabled:opacity-30"
                      >
                        ↓
                      </button>
                    </form>
                  </div>

                  <div className="h-12 w-[86px] shrink-0 overflow-hidden rounded-lg bg-chip">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={slide.image} alt="" className="h-full w-full object-cover" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-semibold text-ink">
                      {slide.link || "Bağlantısız afiş"}
                    </p>
                    <p className="text-[11px] font-semibold text-muted">
                      {slide.active ? "Yayında" : "Yayında değil"}
                    </p>
                  </div>

                  <form
                    action={setBannerSlideLiveAction.bind(null, slide.id, !slide.active)}
                    className="shrink-0"
                  >
                    <button
                      type="submit"
                      className={`rounded-full px-3 py-1.5 text-[11.5px] font-bold ${
                        slide.active
                          ? "bg-accent/10 text-accent"
                          : "bg-panel-solid text-white"
                      }`}
                    >
                      {slide.active ? "Yayından Kaldır" : "Yayına Al"}
                    </button>
                  </form>

                  <form action={deleteBannerSlideAction.bind(null, slide.id)}>
                    <ConfirmSubmitButton
                      confirmMessage="Bu afişi silmek istediğine emin misin?"
                      className="shrink-0 rounded-full bg-chip px-3 py-1.5 text-[11.5px] font-bold text-accent"
                    >
                      Sil
                    </ConfirmSubmitButton>
                  </form>
                </div>
              ))}
            </div>
          )}

          <form
            action={addBannerSlideAction}
            className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[auto_1fr_auto] sm:items-center"
          >
            <input
              name="image"
              type="file"
              accept="image/*"
              required
              className="min-w-0 text-[12px] text-muted file:mr-2 file:rounded-full file:border-0 file:bg-chip file:px-3 file:py-1.5 file:text-[12px] file:font-bold file:text-ink"
            />
            <input
              name="link"
              placeholder="Bağlantı (opsiyonel — örn. https://instagram.com/...)"
              className="min-w-0 rounded-xl border border-line bg-field px-3 py-2 text-[13px] text-ink outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-panel-solid px-4 py-2 text-[13px] font-bold text-white"
            >
              Afiş Ekle
            </button>
          </form>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Sol: yeni duyuru yayınlama */}
        <div className="relative overflow-hidden rounded-[28px] bg-surface p-5 shadow-card sm:p-7">
          <PanelGlow />
          <div className="relative z-[1]">
            <p className="font-heading text-lg font-extrabold text-ink">📣 Yeni Duyuru Yayınla</p>
            <p className="mb-4 text-[13px] text-muted">
              Gönderdiğinizde menü açıldığında müşteriye önce bu duyuru bir kutu içinde gösterilir.
            </p>

            <form action={publishAnnouncementAction} className="grid grid-cols-1 gap-2">
              <input
                name="title"
                placeholder="Başlık (örn. Bu Cuma Canlı Müzik!)"
                className="min-w-0 rounded-xl border border-line bg-field px-3 py-2 text-[14px] text-ink outline-none focus:border-accent"
              />
              <textarea
                name="message"
                placeholder="Mesaj (örn. Saat 21:00'de canlı müzikle sizlerleyiz, yerinizi ayırtmayı unutmayın.)"
                rows={3}
                className="min-w-0 resize-none rounded-xl border border-line bg-field px-3 py-2 text-[13px] text-ink outline-none focus:border-accent"
              />
              <input
                name="image"
                type="file"
                accept="image/*"
                className="min-w-0 text-[12px] text-muted file:mr-2 file:rounded-full file:border-0 file:bg-chip file:px-3 file:py-1.5 file:text-[12px] file:font-bold file:text-ink"
              />
              <button
                type="submit"
                className="mt-1 justify-self-end rounded-xl bg-accent px-5 py-2 text-[13px] font-bold text-white"
              >
                Yayınla
              </button>
            </form>
          </div>
        </div>

        {/* Sağ: yayındaki duyuru + geçmiş */}
        <div className="relative overflow-hidden rounded-[28px] bg-surface p-5 shadow-card sm:p-7">
          <PanelGlow />
          <div className="relative z-[1]">
          <p className="mb-3 font-heading text-lg font-extrabold text-ink">Yayındaki Duyuru</p>

          {settings.announcementTitle || settings.announcementMessage ? (
            <div className="flex gap-3 rounded-2xl bg-field p-3">
              {settings.announcementImage && (
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-chip">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={settings.announcementImage}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-bold text-ink">
                  {settings.announcementTitle || "(başlıksız)"}
                </p>
                <p className="line-clamp-2 text-[12.5px] text-muted">
                  {settings.announcementMessage}
                </p>
              </div>
              <form
                action={setAnnouncementLiveAction.bind(null, !settings.announcementEnabled)}
                className="shrink-0"
              >
                <button
                  type="submit"
                  className={`rounded-full px-3 py-1.5 text-[12px] font-bold ${
                    settings.announcementEnabled
                      ? "bg-accent/10 text-accent"
                      : "bg-panel-solid text-white"
                  }`}
                >
                  {settings.announcementEnabled ? "Yayından Kaldır" : "Yayına Al"}
                </button>
              </form>
            </div>
          ) : (
            <p className="rounded-2xl bg-field p-3 text-[13px] text-muted">
              Henüz bir duyuru yayınlanmadı.
            </p>
          )}

          <p className="mb-2 mt-5 text-[12px] font-bold uppercase tracking-[0.08em] text-muted">
            Son Duyurular
          </p>
          {history.length === 0 ? (
            <p className="text-[13px] text-muted">Geçmiş duyuru yok.</p>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2.5 rounded-xl border border-line bg-field px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-ink">
                      {item.title || "(başlıksız)"}
                    </p>
                    <p className="truncate text-[11.5px] text-muted">
                      {new Date(item.createdAt).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <form action={republishAnnouncementAction.bind(null, item.id)}>
                    <button
                      type="submit"
                      className="shrink-0 rounded-full bg-chip px-3 py-1.5 text-[11.5px] font-bold text-ink"
                    >
                      Tekrar Yayınla
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>

      <div className="relative mb-8 overflow-hidden rounded-[28px] bg-surface p-5 shadow-card sm:p-7">
        <PanelGlow />
        <div className="relative z-[1]">
        <p className="font-heading text-lg font-extrabold text-ink">🔤 Kayan Yazı</p>
        <p className="mb-4 text-[13px] text-muted">
          Menü sayfasının üstünde kayan bilgi şeridindeki satırlar (Wi-Fi, çalışma saatleri vb.).
        </p>

        <div className="space-y-2">
          {tickerItems.map((item, i) => (
            <div key={item.id} className="flex items-center gap-2 rounded-xl border border-line bg-field p-2">
              <div className="flex shrink-0 items-center gap-1">
                <form action={moveTickerItemAction.bind(null, item.id, "up")}>
                  <button
                    type="submit"
                    disabled={i === 0}
                    className="grid h-7 w-7 place-items-center rounded-full bg-chip text-ink disabled:opacity-30"
                  >
                    ↑
                  </button>
                </form>
                <form action={moveTickerItemAction.bind(null, item.id, "down")}>
                  <button
                    type="submit"
                    disabled={i === tickerItems.length - 1}
                    className="grid h-7 w-7 place-items-center rounded-full bg-chip text-ink disabled:opacity-30"
                  >
                    ↓
                  </button>
                </form>
              </div>

              <form
                action={updateTickerItemAction}
                className="flex min-w-0 flex-1 items-center gap-2"
              >
                <input type="hidden" name="id" value={item.id} />
                <input
                  name="text"
                  defaultValue={item.text}
                  className="min-w-0 flex-1 rounded-xl border border-line bg-field px-3 py-2 text-[13px] text-ink outline-none focus:border-accent"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-full bg-accent px-3.5 py-2 text-[12px] font-bold text-white"
                >
                  Kaydet
                </button>
              </form>

              <form action={deleteTickerItemAction.bind(null, item.id)}>
                <button
                  type="submit"
                  className="shrink-0 rounded-full bg-chip px-3 py-2 text-[11.5px] font-bold text-accent"
                >
                  Sil
                </button>
              </form>
            </div>
          ))}
        </div>

        <form action={addTickerItemAction} className="mt-3 flex gap-2">
          <input
            name="text"
            required
            placeholder="Yeni satır (örn. Kredi kartı geçerlidir)"
            className="min-w-0 flex-1 rounded-xl border border-line bg-field px-3 py-2 text-[13px] text-ink outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-panel-solid px-4 py-2 text-[13px] font-bold text-white"
          >
            Ekle
          </button>
        </form>
        </div>
      </div>

      <div className="relative mb-8 overflow-hidden rounded-[28px] bg-surface p-5 shadow-card sm:p-7">
        <PanelGlow />
        <div className="relative z-[1]">
          <p className="font-heading text-lg font-extrabold text-ink">💬 Müşteri Yorumları</p>
          <p className="mb-4 text-[13px] text-muted">
            Menü sayfasında, afiş sliderının altında sürekli kayan yorum şeridi. Yıldız
            1–5 arası. Yayında olmayan yorumlar şeritte gösterilmez.
          </p>

          {reviews.length === 0 ? (
            <p className="rounded-2xl bg-field p-3 text-[13px] text-muted">
              Henüz yorum eklenmedi.
            </p>
          ) : (
            <div className="max-h-[380px] overflow-y-auto rounded-2xl border border-line bg-field/40 p-2 [scrollbar-width:thin]">
              <SortableList
                ids={reviews.map((r) => String(r.id))}
                onReorder={reorderReviewsAction}
              >
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="flex flex-col gap-2 rounded-xl border border-line bg-field p-2.5 lg:flex-row lg:items-center"
                >
                  <DragHandle id={String(review.id)} />

                  <form
                    action={updateReviewAction}
                    className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-[140px_72px_1fr_auto]"
                  >
                    <input type="hidden" name="id" value={review.id} />
                    <input
                      name="name"
                      defaultValue={review.name}
                      placeholder="İsim"
                      className="min-w-0 rounded-xl border border-line bg-field px-3 py-2 text-[13px] text-ink outline-none focus:border-accent"
                    />
                    <select
                      name="stars"
                      defaultValue={review.stars}
                      className="min-w-0 rounded-xl border border-line bg-field px-2 py-2 text-[13px] text-ink outline-none focus:border-accent"
                    >
                      {[5, 4, 3, 2, 1].map((s) => (
                        <option key={s} value={s}>
                          {"★".repeat(s)}
                        </option>
                      ))}
                    </select>
                    <input
                      name="text"
                      defaultValue={review.text}
                      placeholder="Yorum metni"
                      className="min-w-0 rounded-xl border border-line bg-field px-3 py-2 text-[13px] text-ink outline-none focus:border-accent"
                    />
                    <button
                      type="submit"
                      className="shrink-0 rounded-full bg-accent px-3.5 py-2 text-[12px] font-bold text-white"
                    >
                      Kaydet
                    </button>
                  </form>

                  <div className="flex shrink-0 items-center gap-2">
                    <form action={setReviewLiveAction.bind(null, review.id, !review.active)}>
                      <button
                        type="submit"
                        className={`rounded-full px-3 py-1.5 text-[11.5px] font-bold ${
                          review.active
                            ? "bg-accent/10 text-accent"
                            : "bg-panel-solid text-white"
                        }`}
                      >
                        {review.active ? "Yayından Kaldır" : "Yayına Al"}
                      </button>
                    </form>
                    <form action={deleteReviewAction.bind(null, review.id)}>
                      <ConfirmSubmitButton
                        confirmMessage="Bu yorumu silmek istediğine emin misin?"
                        className="shrink-0 rounded-full bg-chip px-3 py-1.5 text-[11.5px] font-bold text-accent"
                      >
                        Sil
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </div>
              ))}
              </SortableList>
            </div>
          )}

          <form
            action={addReviewAction}
            className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[140px_72px_1fr_auto]"
          >
            <input
              name="name"
              required
              placeholder="İsim (örn. Elif K.)"
              className="min-w-0 rounded-xl border border-line bg-field px-3 py-2 text-[13px] text-ink outline-none focus:border-accent"
            />
            <select
              name="stars"
              defaultValue={5}
              className="min-w-0 rounded-xl border border-line bg-field px-2 py-2 text-[13px] text-ink outline-none focus:border-accent"
            >
              {[5, 4, 3, 2, 1].map((s) => (
                <option key={s} value={s}>
                  {"★".repeat(s)}
                </option>
              ))}
            </select>
            <input
              name="text"
              required
              placeholder="Yorum metni (örn. Limonata çok tazeydi, mekân tertemiz.)"
              className="min-w-0 rounded-xl border border-line bg-field px-3 py-2 text-[13px] text-ink outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-panel-solid px-4 py-2 text-[13px] font-bold text-white"
            >
              Yorum Ekle
            </button>
          </form>
        </div>
      </div>
        </>
        }
        menu={
        <>
      <div className="relative overflow-hidden rounded-[28px] bg-field p-5 shadow-panel sm:p-7">
        <PanelGlow />
        <div className="relative z-[1]">
        <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-muted">
          Kategoriler
        </p>
        <p className="mb-4 mt-1 text-[12px] text-muted">
          Sıralamak için soldaki tutamacı <span className="font-bold">basılı tutup sürükleyin</span>.
        </p>

        <div className="mb-4 rounded-2xl border-2 border-dashed border-line p-4">
          <p className="mb-3 text-[13px] font-bold text-ink">+ Yeni Kategori Ekle</p>
          <form
            action={addCategoryAction}
            className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto] lg:grid-cols-[1fr_1fr_60px_auto_auto]"
          >
            <input
              name="name_tr"
              placeholder="Ad (TR)"
              required
              className="min-w-0 rounded-xl border border-line bg-field px-3 py-2 text-[14px] text-ink outline-none focus:border-accent"
            />
            <input
              name="name_en"
              placeholder="Name (EN)"
              className="min-w-0 rounded-xl border border-line bg-field px-3 py-2 text-[14px] text-ink outline-none focus:border-accent"
            />
            <input
              name="emoji"
              placeholder="🍽️"
              className="w-16 min-w-0 rounded-xl border border-line bg-field px-3 py-2 text-center text-[16px] outline-none focus:border-accent"
            />
            <input
              name="image"
              type="file"
              accept="image/*"
              className="min-w-0 text-[12px] text-muted file:mr-2 file:rounded-full file:border-0 file:bg-chip file:px-3 file:py-1.5 file:text-[12px] file:font-bold file:text-ink lg:w-36"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-panel-solid px-4 py-2 text-[13px] font-bold text-white"
            >
              Ekle
            </button>
          </form>
        </div>

        <div className="max-h-[560px] overflow-y-auto rounded-2xl border border-line bg-surface/40 p-2 [scrollbar-width:thin]">
        <SortableList
          ids={categories.map((c) => c.id)}
          onReorder={reorderCategoriesAction}
        >
        {categories.map((category) => {
          const count = products.filter((p) => p.categoryId === category.id).length;
          return (
            <div
              key={category.id}
              className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card lg:flex-row lg:items-center"
            >
              <div className="flex shrink-0 items-center gap-3">
                <DragHandle id={category.id} />

                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-chip">
                  {category.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={category.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <PhotoPlaceholder className="h-7 w-7" />
                  )}
                </div>
              </div>

              <form
                action={updateCategoryAction}
                className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_60px_auto_auto]"
              >
                <input type="hidden" name="id" value={category.id} />
                <input
                  name="name_tr"
                  defaultValue={category.name.tr}
                  placeholder="Ad (TR)"
                  className="min-w-0 rounded-xl border border-line bg-field px-3 py-2 text-[14px] text-ink outline-none focus:border-accent"
                />
                <input
                  name="name_en"
                  defaultValue={category.name.en}
                  placeholder="Name (EN)"
                  className="min-w-0 rounded-xl border border-line bg-field px-3 py-2 text-[14px] text-ink outline-none focus:border-accent"
                />
                <input
                  name="emoji"
                  defaultValue={category.emoji}
                  className="w-14 min-w-0 rounded-xl border border-line bg-field px-3 py-2 text-center text-[16px] outline-none focus:border-accent"
                />
                <input
                  name="image"
                  type="file"
                  accept="image/*"
                  className="min-w-0 text-[12px] text-muted file:mr-2 file:rounded-full file:border-0 file:bg-chip file:px-3 file:py-1.5 file:text-[12px] file:font-bold file:text-ink lg:w-36"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-xl bg-accent px-4 py-2 text-[13px] font-bold text-white"
                >
                  Kaydet
                </button>
              </form>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/admin/${category.id}`}
                  className="rounded-full bg-panel-solid px-4 py-2 text-center text-[13px] font-bold text-white"
                >
                  Ürünler ({count}) →
                </Link>
                <form action={deleteCategoryAction.bind(null, category.id)}>
                  <ConfirmSubmitButton
                    confirmMessage={
                      count > 0
                        ? `"${category.name.tr}" kategorisini silmek istediğine emin misin? İçindeki ${count} ürün de birlikte silinecek.`
                        : `"${category.name.tr}" kategorisini silmek istediğine emin misin?`
                    }
                    className="rounded-full bg-field px-3 py-2 text-[12px] font-bold text-accent"
                  >
                    Sil
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>
          );
        })}
        </SortableList>
        </div>
        </div>
      </div>
        </>
        }
      />
    </div>
  );
}
