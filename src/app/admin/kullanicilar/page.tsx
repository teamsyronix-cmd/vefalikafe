import Link from "next/link";
import { isOwner, requireManager } from "@/lib/auth";
import { getActivityLog } from "@/lib/activity";
import { getPanelUsers, getRecentLogins, getSiteSettings } from "@/lib/menu-data";
import type { ActivityEntry } from "@/lib/activity";
import type { PanelUser } from "@/lib/menu-data";
import ThemeToggle from "@/components/admin/ThemeToggle";
import PanelGlow from "@/components/PanelGlow";
import {
  addPanelUserAction,
  deletePanelUserAction,
  removeAdminAvatarAction,
  setPanelUserActiveAction,
  updateAdminProfileAction,
  updatePanelUserAction,
} from "../actions";

export const dynamic = "force-dynamic";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  });
}

function formatIp(ip: string | null): string {
  if (!ip) return "—";
  if (ip === "::1" || ip === "127.0.0.1" || ip === "::ffff:127.0.0.1") return "Yerel";
  return ip;
}

export default async function PanelUsersPage() {
  const session = await requireManager();
  const owner = isOwner(session);

  // Panel kullanıcıları + işlem kaydı yalnızca site sahibine açık; sıradan
  // müdür yalnızca kendi hesap bilgilerini görür.
  const [settings, recentLogins, panelUsers, activityLog] = await Promise.all([
    getSiteSettings(),
    getRecentLogins(1),
    owner ? getPanelUsers() : Promise.resolve<PanelUser[]>([]),
    owner ? getActivityLog(80) : Promise.resolve<ActivityEntry[]>([]),
  ]);
  const adminName = process.env.ADMIN_DISPLAY_NAME ?? "Yönetici";

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">

      <div className="mb-6 flex items-center justify-between gap-3">
        <Link href="/admin" className="text-[13px] font-bold text-muted">
          ← Panel
        </Link>
        <ThemeToggle />
      </div>

      <div className="mb-6">
        <p className="font-heading text-2xl font-extrabold text-ink">⚙️ Ayarlar</p>
        <p className="text-[13px] font-semibold text-muted">
          {owner
            ? "Hesap bilgileri, panel kullanıcıları ve işlem kaydı."
            : "Giriş yapan hesabın bilgileri."}
        </p>
      </div>

      {/* 👤 Kullanıcı Bilgileri — hesap e-postası ve profil fotoğrafı */}
      <div className="relative mb-8 overflow-hidden rounded-[28px] bg-surface p-5 shadow-card sm:p-7">
        <PanelGlow />
        <div className="relative z-[1]">
          <p className="font-heading text-lg font-extrabold text-ink">👤 Kullanıcı Bilgileri</p>
          <p className="mb-4 text-[13px] text-muted">
            Giriş yapan hesabın bilgileri ve profil fotoğrafı.
          </p>

          <form
            action={updateAdminProfileAction}
            className="flex flex-col gap-5 sm:flex-row sm:items-start"
          >
            <div className="flex shrink-0 flex-col items-center gap-2">
              <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-field">
                {settings.adminAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={settings.adminAvatarUrl}
                    alt="Profil fotoğrafı"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-9 w-9 text-muted"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21a8 8 0 0 0-16 0" />
                    <circle cx="12" cy="8" r="4.5" />
                  </svg>
                )}
              </div>
              <label className="cursor-pointer text-[11.5px] font-bold text-accent">
                Fotoğraf Seç
                <input name="avatar" type="file" accept="image/*" className="hidden" />
              </label>
              {settings.adminAvatarUrl && (
                <button
                  type="submit"
                  formAction={removeAdminAvatarAction}
                  className="text-[11.5px] font-bold text-muted"
                >
                  Fotoğrafı Kaldır
                </button>
              )}
            </div>

            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-[11.5px] font-bold uppercase tracking-[0.08em] text-muted">
                  Kullanıcı Adı
                </p>
                <p className="rounded-xl border border-line bg-field px-3 py-2 text-[14px] font-semibold text-ink">
                  {adminName}
                </p>
              </div>
              <div>
                <p className="mb-1 text-[11.5px] font-bold uppercase tracking-[0.08em] text-muted">
                  IP Adresi (Aktif Giriş)
                </p>
                <p className="rounded-xl border border-line bg-field px-3 py-2 text-[14px] font-semibold text-ink">
                  {formatIp(recentLogins[0]?.ip ?? null)}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="mb-1 text-[11.5px] font-bold uppercase tracking-[0.08em] text-muted">
                  E-posta Adresi
                </p>
                <input
                  name="email"
                  type="email"
                  defaultValue={settings.adminEmail ?? ""}
                  placeholder="ornek@vefali.com"
                  className="w-full rounded-xl border border-line bg-field px-3 py-2 text-[14px] text-ink outline-none focus:border-accent"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-xl bg-accent px-5 py-2.5 text-[13px] font-bold text-white"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {owner && (
      <div className="relative mb-8 overflow-hidden rounded-[28px] bg-surface p-5 shadow-card sm:p-7">
        <PanelGlow />
        <div className="relative z-[1]">
          <p className="font-heading text-lg font-extrabold text-ink">👥 Panel Kullanıcıları</p>
          <p className="mb-4 text-[13px] text-muted">
            Panele giriş yapabilecek hesaplar. <b>Yönetici</b> her şeyi yönetir;{" "}
            <b>garson</b> yalnızca sipariş ekranlarını görür. Sahibin sabit girişi
            ({process.env.ADMIN_ID ?? "—"}) bu listeden bağımsız, her zaman yönetici olarak çalışır.
          </p>

          {panelUsers.length === 0 ? (
            <p className="rounded-2xl bg-field p-3 text-[13px] text-muted">
              Henüz ek kullanıcı yok. Aşağıdan ekleyebilirsin.
            </p>
          ) : (
            <div className="space-y-2">
              {panelUsers.map((u) => (
                <form
                  key={u.id}
                  action={updatePanelUserAction}
                  className="flex flex-col gap-2 rounded-xl border border-line bg-field p-2.5 lg:flex-row lg:items-center"
                >
                  <input type="hidden" name="id" value={u.id} />
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px] font-extrabold ${
                        u.active ? "bg-accent/12 text-accent" : "bg-chip text-muted"
                      }`}
                    >
                      {u.username.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-bold text-ink">
                        {u.username}
                        {!u.active && (
                          <span className="ml-1.5 text-[11px] font-semibold text-muted">
                            (pasif)
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] font-semibold text-muted">
                        {formatTime(u.createdAt)} tarihinde eklendi
                      </p>
                    </div>
                  </div>

                  <select
                    name="role"
                    defaultValue={u.role}
                    className="min-w-0 rounded-xl border border-line bg-field px-2.5 py-2 text-[13px] text-ink outline-none focus:border-accent"
                  >
                    <option value="garson">Garson</option>
                    <option value="mudur">Yönetici</option>
                  </select>
                  <input
                    name="password"
                    type="text"
                    placeholder="Yeni şifre (boş = değişmez)"
                    className="min-w-0 rounded-xl border border-line bg-field px-3 py-2 text-[13px] text-ink outline-none focus:border-accent lg:w-52"
                  />

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="submit"
                      className="rounded-full bg-accent px-3.5 py-2 text-[12px] font-bold text-white"
                    >
                      Kaydet
                    </button>
                    <button
                      type="submit"
                      formAction={setPanelUserActiveAction.bind(null, u.id, !u.active)}
                      className="rounded-full bg-chip px-3 py-2 text-[11.5px] font-bold text-ink"
                    >
                      {u.active ? "Pasifleştir" : "Aktifleştir"}
                    </button>
                    <button
                      type="submit"
                      formAction={deletePanelUserAction.bind(null, u.id)}
                      className="rounded-full bg-field px-3 py-2 text-[11.5px] font-bold text-accent"
                    >
                      Sil
                    </button>
                  </div>
                </form>
              ))}
            </div>
          )}

          <form
            action={addPanelUserAction}
            className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_110px_auto]"
          >
            <input
              name="username"
              required
              placeholder="Kullanıcı adı"
              autoComplete="off"
              className="min-w-0 rounded-xl border border-line bg-field px-3 py-2 text-[13px] text-ink outline-none focus:border-accent"
            />
            <input
              name="password"
              type="text"
              required
              placeholder="Şifre (en az 6 karakter)"
              autoComplete="off"
              className="min-w-0 rounded-xl border border-line bg-field px-3 py-2 text-[13px] text-ink outline-none focus:border-accent"
            />
            <select
              name="role"
              defaultValue="garson"
              className="min-w-0 rounded-xl border border-line bg-field px-2.5 py-2 text-[13px] text-ink outline-none focus:border-accent"
            >
              <option value="garson">Garson</option>
              <option value="mudur">Yönetici</option>
            </select>
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-panel-solid px-4 py-2 text-[13px] font-bold text-white"
            >
              Kullanıcı Ekle
            </button>
          </form>
        </div>
      </div>
      )}

      {owner && (
      <div className="relative overflow-hidden rounded-[28px] bg-surface p-5 shadow-card sm:p-7">
        <PanelGlow />
        <div className="relative z-[1]">
          <p className="font-heading text-lg font-extrabold text-ink">📜 İşlem Kaydı</p>
          <p className="mb-4 text-[13px] text-muted">
            Panelde yapılan son işlemler — hangi kullanıcı, ne zaman, ne yaptı.
          </p>

          {activityLog.length === 0 ? (
            <p className="rounded-2xl bg-field p-3 text-[13px] text-muted">
              Henüz kayıt yok. (Tabloyu oluşturduktan sonra işlemler burada listelenir.)
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-[12.5px]">
                <thead>
                  <tr className="text-left text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                    <th className="pb-2 pr-3">Zaman</th>
                    <th className="pb-2 pr-3">Kullanıcı</th>
                    <th className="pb-2 pr-3">Rol</th>
                    <th className="pb-2 pr-3">İşlem</th>
                    <th className="pb-2">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLog.map((e) => (
                    <tr key={e.id} className="border-t border-line align-top">
                      <td className="whitespace-nowrap py-2 pr-3 text-muted">
                        {formatTime(e.createdAt)}
                      </td>
                      <td className="py-2 pr-3 font-bold text-ink">{e.actor}</td>
                      <td className="py-2 pr-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${
                            e.role === "mudur"
                              ? "bg-accent/12 text-accent"
                              : "bg-chip text-muted"
                          }`}
                        >
                          {e.role === "mudur" ? "yönetici" : e.role === "garson" ? "garson" : "—"}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-ink">{e.action}</td>
                      <td className="py-2 text-muted">{formatIp(e.ip)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
