import type { Metadata } from "next";
import AdminAmbientBg from "@/components/admin/AdminAmbientBg";
import AdminHeader from "@/components/admin/AdminHeader";
import SessionKeeper from "@/components/admin/SessionKeeper";
import ToastListener from "@/components/admin/ToastListener";
import { getFlash } from "@/lib/flash";
import { getPanelSession } from "@/lib/auth";
import { getSiteSettings } from "@/lib/menu-data";

export const metadata: Metadata = {
  title: "Yönetim Paneli | Vefalı",
};

// Sayfa boyanmadan önce kayıtlı tema tercihini uygular (flaş olmasın diye).
const NO_FLASH_SCRIPT = `(function(){
  try {
    var t = localStorage.getItem('vefali-admin-theme');
    if (t === 'light') {
      document.getElementById('admin-shell').setAttribute('data-admin-theme', 'light');
    }
  } catch (e) {}
})();`;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [flash, session, settings] = await Promise.all([
    getFlash(),
    getPanelSession(),
    getSiteSettings(),
  ]);

  return (
    <div id="admin-shell" data-admin-theme="dark" className="relative isolate min-h-screen bg-bg font-body">
      <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
      <AdminAmbientBg />
      <ToastListener flash={flash} />
      {session && <SessionKeeper role={session.role} />}
      <AdminHeader role={session?.role ?? "garson"} logoUrl={settings.logoUrl} />
      {children}
      <p className="pb-6 text-center text-[11.5px] font-semibold text-muted">
        © {new Date().getFullYear()} Vefalı · Doğukan Cödel tarafından yapılmıştır
      </p>
    </div>
  );
}
