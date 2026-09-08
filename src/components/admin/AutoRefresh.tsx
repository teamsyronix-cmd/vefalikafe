"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Sayfayı belirli aralıklarla sessizce yeniler (router.refresh) — tam sayfa
// yenileme yapmadan Server Component verisini güncel tutar. Aktif Siparişler
// gibi "canlı" olması istenen sayfalarda kullanılır.
export default function AutoRefresh({ intervalMs = 8000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
