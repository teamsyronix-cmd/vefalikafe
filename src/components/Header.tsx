import LocaleSwitch from "./LocaleSwitch";
import AccountHeaderButton from "./AccountHeaderButton";

export default function Header({ logoUrl }: { logoUrl?: string }) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between bg-white px-5 py-4">
      <div className="flex items-center gap-2">
        <a
          href="https://instagram.com/vefalikafe"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="grid h-[38px] w-[38px] place-items-center rounded-[12px] bg-chip"
        >
          <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4.2" />
            <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
          </svg>
        </a>
        <a
          href="https://www.tiktok.com/@vefalikafe"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok"
          className="grid h-[38px] w-[38px] place-items-center rounded-[12px] bg-chip"
        >
          <svg viewBox="0 0 24 24" className="h-[16px] w-[16px]" fill="currentColor">
            <path d="M16.5 3c.3 2.1 1.8 3.8 3.9 4.2v2.9c-1.4 0-2.7-.4-3.9-1.2v6.6a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v2.9a2.7 2.7 0 1 0 1.9 2.6V3h2.8z" />
          </svg>
        </a>
        <a
          href="https://share.google/HmWAPfc3AyrufglqP"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Google Haritalar'da aç"
          className="grid h-[38px] w-[38px] place-items-center rounded-[12px] bg-chip"
        >
          <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21.5c3.9-4 6-7.1 6-10a6 6 0 1 0-12 0c0 2.9 2.1 6 6 10Z" />
            <circle cx="12" cy="11.3" r="2.3" />
          </svg>
        </a>
      </div>

      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="Vefalı" className="h-9 w-auto object-contain" />
      ) : (
        <p className="font-heading text-lg font-extrabold tracking-tight text-ink">
          Vefalı
        </p>
      )}

      <div className="flex items-center gap-2">
        <AccountHeaderButton />
        <LocaleSwitch />
      </div>
    </header>
  );
}
