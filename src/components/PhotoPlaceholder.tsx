// Görsel yüklenmemiş kategori/ürünler için nötr yer tutucu ikon — emoji
// ikonların yerine. Kendi kutusuna göre ölçeklenir.
export default function PhotoPlaceholder({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={`text-muted/35 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <circle cx="8.5" cy="10" r="1.6" />
      <path d="m4 17 4.5-4.5 3.5 3.5 3.5-3.5 4.5 4.5" />
    </svg>
  );
}
