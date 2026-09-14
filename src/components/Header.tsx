import LocaleSwitch from "./LocaleSwitch";
import AccountHeaderButton from "./AccountHeaderButton";

const ICON_BTN =
  "grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-chip text-ink transition-colors hover:bg-line sm:h-[38px] sm:w-[38px]";

const DEFAULT_INSTAGRAM_URL = "https://instagram.com/vefalikafe";
const DEFAULT_TIKTOK_URL = "https://www.tiktok.com/@vefalikafe";
const DEFAULT_MAPS_URL = "https://g.page/r/CTg5okISIz_UEAE/review";

export default function Header({
  logoUrl,
  instagramUrl,
  tiktokUrl,
  mapsUrl,
}: {
  logoUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  mapsUrl?: string;
}) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-2 bg-white px-3 py-3 sm:px-5 sm:py-4">
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {(instagramUrl ?? DEFAULT_INSTAGRAM_URL) && (
          <a
            href={instagramUrl ?? DEFAULT_INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className={ICON_BTN}
          >
            <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4.2" />
              <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
            </svg>
          </a>
        )}
        {(tiktokUrl ?? DEFAULT_TIKTOK_URL) && (
          <a
            href={tiktokUrl ?? DEFAULT_TIKTOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className={ICON_BTN}
          >
            <svg viewBox="0 0 24 24" className="h-[16px] w-[16px]" fill="currentColor">
              <path d="M16.5 3c.3 2.1 1.8 3.8 3.9 4.2v2.9c-1.4 0-2.7-.4-3.9-1.2v6.6a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v2.9a2.7 2.7 0 1 0 1.9 2.6V3h2.8z" />
            </svg>
          </a>
        )}
        {(mapsUrl ?? DEFAULT_MAPS_URL) && (
          <a
            href={mapsUrl ?? DEFAULT_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Google Haritalar'da aç"
            className={ICON_BTN}
          >
            <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21.5c3.9-4 6-7.1 6-10a6 6 0 1 0-12 0c0 2.9 2.1 6 6 10Z" />
              <circle cx="12" cy="11.3" r="2.3" />
            </svg>
          </a>
        )}
      </div>

      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt="Vefalı"
          className="h-8 w-auto max-w-[120px] shrink object-contain sm:h-9 sm:max-w-none"
        />
      ) : (
        <p className="font-heading text-lg font-extrabold tracking-tight text-ink">
          Vefalı
        </p>
      )}

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <AccountHeaderButton />
        <LocaleSwitch />
      </div>
    </header>
  );
}
