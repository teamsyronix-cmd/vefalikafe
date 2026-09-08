export default function Ticker({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  // İki kopya art arda dizilir, %-50 kaydırma ile kesintisiz döngü sağlanır.
  const track = [...items, ...items];

  return (
    <div
      className="mx-5 mt-3 h-[46px] overflow-hidden rounded-2xl border border-line"
      style={{
        background: "linear-gradient(100deg, var(--surface), var(--bg))",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
        maskImage:
          "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
      }}
    >
      <div className="flex h-full w-max animate-[ticker_22s_linear_infinite] items-center whitespace-nowrap">
        {track.map((item, i) => (
          <span
            key={i}
            className="flex items-center px-6 font-heading text-sm font-bold text-ink"
          >
            <span className="mr-2 text-[11px] text-accent">✦</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
