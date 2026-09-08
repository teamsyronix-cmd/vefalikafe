"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
      <p className="font-heading text-xl font-extrabold text-ink">Bir şeyler ters gitti</p>
      <p className="max-w-sm text-[14px] text-muted">
        {error.message.includes("site_settings") || error.message.includes("schema cache")
          ? "Veritabanı tablosu henüz oluşturulmamış görünüyor. Supabase SQL Editor'de gerekli SQL'i çalıştırdığınızdan emin olun."
          : "İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin."}
      </p>
      <button
        onClick={() => reset()}
        className="rounded-full bg-accent px-5 py-2.5 text-[13px] font-bold text-white"
      >
        Tekrar Dene
      </button>
    </div>
  );
}
