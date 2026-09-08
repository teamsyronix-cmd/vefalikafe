"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";

const MANAGER_NAV = [
  { href: "/admin", label: "Ana Sayfa" },
  { href: "/admin/siparisler", label: "Aktif Siparişler" },
  { href: "/admin/siparis-gecmisi", label: "Sipariş Geçmişi" },
  { href: "/admin/musteriler", label: "Müşteriler" },
];

// Garson menü/ayar sayfalarını göremez — yalnızca sipariş ekranları.
const WAITER_NAV = [
  { href: "/admin/siparisler", label: "Aktif Siparişler" },
  { href: "/admin/siparis-gecmisi", label: "Sipariş Geçmişi" },
  { href: "/admin/musteriler", label: "Müşteriler" },
];

export default function AdminHeader({
  role,
  logoUrl,
}: {
  role: "mudur" | "garson";
  logoUrl?: string;
}) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  const NAV = role === "mudur" ? MANAGER_NAV : WAITER_NAV;
  const home = role === "mudur" ? "/admin" : "/admin/siparisler";

  return (
    <div className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-3">
        {/* Site logosu — Aktif Logo panelinden değişince burası da değişir */}
        <Link href={home} className="flex shrink-0 items-center gap-2">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="Vefalı"
              className="admin-logo h-7 w-auto max-w-[130px] object-contain"
            />
          ) : (
            <span className="font-heading text-[15px] font-extrabold tracking-tight text-ink">
              Vefalı
            </span>
          )}
          <span className="hidden rounded-md bg-chip px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted sm:inline">
            Panel
          </span>
        </Link>

        <div className="h-5 w-px shrink-0 bg-line" />

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`admin-nav-link shrink-0 rounded-full px-4 py-2 text-[13px] font-bold ${
                  isActive ? "bg-accent text-white" : "text-muted"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form action={logoutAction} className="shrink-0">
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-full bg-chip px-3.5 py-2 text-[13px] font-bold text-muted"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="m16 17 5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            <span className="hidden sm:inline">Çıkış Yap</span>
          </button>
        </form>
      </div>
    </div>
  );
}
