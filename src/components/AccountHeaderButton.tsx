"use client";

import { useState } from "react";
import { useCustomer } from "./CustomerProvider";
import { useStarsEnabled } from "./StarsSystemProvider";
import AccountModal from "./AccountModal";
import AuthModal from "./AuthModal";

// Header'daki "Hesabım" ikonu — giriş yapmışsa hesap/yıldız modalını,
// yapmamışsa giriş/kayıt modalını açar.
export default function AccountHeaderButton() {
  const customer = useCustomer();
  const starsEnabled = useStarsEnabled();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Hesabım"
        title="Hesabım"
        className="relative grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-chip text-ink transition-colors hover:bg-line sm:h-[38px] sm:w-[38px]"
      >
        <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21a8 8 0 0 0-16 0" />
          <circle cx="12" cy="8" r="4.5" />
        </svg>
        {starsEnabled && customer && customer.stars > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-extrabold text-white">
            {customer.stars}
          </span>
        )}
      </button>

      {open &&
        (customer ? (
          <AccountModal onClose={() => setOpen(false)} />
        ) : (
          <AuthModal onClose={() => setOpen(false)} />
        ))}
    </>
  );
}
