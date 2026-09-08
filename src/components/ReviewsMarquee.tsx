import type { Review } from "@/lib/menu-data";

// Menü sayfasında, afiş sliderının hemen altında sürekli sağdan sola kayan
// müşteri yorumları şeridi. İçerik admin panelden (💬 Müşteri Yorumları)
// yönetilir; tablo boşsa menu-data'daki varsayılan listeye düşülür.

const TINTS = [
  "bg-accent/12 text-accent",
  "bg-emerald-500/12 text-emerald-600",
  "bg-amber-500/15 text-amber-600",
  "bg-sky-500/12 text-sky-600",
];

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-[1px]" aria-label={`${n} / 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={`h-3 w-3 ${i < n ? "text-amber-500" : "text-line"}`}
          fill="currentColor"
        >
          <path d="m12 17.3-5.4 3.2 1.4-6.1-4.7-4.1 6.2-.6L12 4l2.5 5.7 6.2.6-4.7 4.1 1.4 6.1z" />
        </svg>
      ))}
    </span>
  );
}

function Card({ r, tint }: { r: Review; tint: string }) {
  return (
    <figure className="flex w-[248px] shrink-0 flex-col gap-2 rounded-2xl border border-line bg-surface p-3.5">
      <div className="flex items-center gap-2.5">
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px] font-extrabold ${tint}`}
        >
          {r.name.charAt(0)}
        </span>
        <div className="min-w-0">
          <figcaption className="truncate text-[12.5px] font-bold text-ink">
            {r.name}
          </figcaption>
          <Stars n={r.stars} />
        </div>
      </div>
      <blockquote className="line-clamp-3 text-[11.5px] leading-snug text-muted">
        {r.text}
      </blockquote>
    </figure>
  );
}

export default function ReviewsMarquee({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;

  // İki kopya art arda: %-50 kaydırmayla kesintisiz döngü (Ticker ile aynı teknik).
  const track = [...reviews, ...reviews];

  return (
    <div
      className="mb-4 overflow-hidden"
      style={{
        WebkitMaskImage:
          "linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent)",
        maskImage:
          "linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent)",
      }}
    >
      <div className="flex w-max items-stretch gap-3 animate-[ticker_60s_linear_infinite] hover:[animation-play-state:paused]">
        {track.map((r, i) => (
          <Card key={i} r={r} tint={TINTS[i % TINTS.length]} />
        ))}
      </div>
    </div>
  );
}
