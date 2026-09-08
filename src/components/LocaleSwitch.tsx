"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function LocaleSwitch() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex h-9 shrink-0 items-center gap-2 rounded-full border-[1.5px] border-line bg-surface px-2.5 font-heading text-[12.5px] font-extrabold tracking-wide sm:h-[38px] sm:gap-3 sm:px-3">
      <svg viewBox="0 0 24 24" className="hidden h-[15px] w-[15px] shrink-0 sm:block" stroke="currentColor" strokeWidth="2" fill="none">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
      </svg>
      {routing.locales.map((loc) => (
        <Link
          key={loc}
          href={pathname}
          locale={loc}
          className={loc === locale ? "text-accent" : "text-muted"}
        >
          {loc.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
