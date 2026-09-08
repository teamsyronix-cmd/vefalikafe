"use client";

// Her yıldızda biraz daha dolan animasyonlu kahve fincanı — 10 yıldızda tam dolu.
export default function CoffeeCup({ stars }: { stars: number }) {
  const isFull = stars > 0 && stars % 10 === 0;
  const progress = isFull ? 10 : stars % 10;
  const fillPercent = (progress / 10) * 100;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-28 w-24">
        {/* buhar */}
        <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 gap-1.5 opacity-0 transition-opacity duration-500" style={{ opacity: fillPercent > 40 ? 0.6 : 0 }}>
          <span className="animate-steam h-4 w-1 rounded-full bg-muted/50" />
          <span className="animate-steam h-4 w-1 rounded-full bg-muted/50 [animation-delay:.4s]" />
          <span className="animate-steam h-4 w-1 rounded-full bg-muted/50 [animation-delay:.8s]" />
        </div>

        {/* kulp */}
        <div className="absolute -right-3.5 top-7 h-11 w-7 rounded-r-[16px] border-[3px] border-l-0 border-ink/20" />

        {/* fincan gövdesi */}
        <div className="absolute inset-x-0 top-3 bottom-0 overflow-hidden rounded-b-[22px] rounded-t-[8px] border-[3px] border-ink/20 bg-white">
          <div
            className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-[#8a5a35] to-[#3f2313] transition-[height] duration-700 ease-out"
            style={{ height: `${fillPercent}%` }}
          >
            <div className="absolute inset-x-0 top-0 h-1.5 bg-white/25" />
          </div>
          {isFull && (
            <div className="absolute inset-0 grid place-items-center bg-accent/85 text-[22px]">
              🎁
            </div>
          )}
        </div>

        {/* tabak */}
        <div className="absolute inset-x-[-6px] bottom-[-4px] h-2 rounded-full bg-ink/10" />
      </div>

      <div className="w-full max-w-[160px]">
        <div className="flex items-center justify-between text-[11px] font-bold text-muted">
          <span>⭐ Yıldızların</span>
          <span>{progress}/10</span>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-chip">
          <div
            className="h-full rounded-full bg-accent transition-all duration-700 ease-out"
            style={{ width: `${fillPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
