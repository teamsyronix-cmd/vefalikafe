"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "vefali-admin-theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark") setTheme(saved);
    } catch {
      // localStorage kapalıysa varsayılan (koyu) ile devam
    }
  }, []);

  useEffect(() => {
    const el = document.getElementById("admin-shell");
    el?.setAttribute("data-admin-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // yoksay
    }
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      aria-label={theme === "dark" ? "Aydınlık temaya geç" : "Koyu temaya geç"}
      title={theme === "dark" ? "Aydınlık temaya geç" : "Koyu temaya geç"}
      className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-chip text-ink"
    >
      {theme === "dark" ? (
        // Güneş — aydınlık temaya geçmek için
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2.4M12 19.1v2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7" />
        </svg>
      ) : (
        // Ay — koyu temaya geçmek için
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z" />
        </svg>
      )}
    </button>
  );
}
