"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BannerSlide } from "@/lib/menu-data";

const AUTOPLAY_MS = 4000;
const SWIPE_THRESHOLD = 40;

// Menü sayfasının en üstünde, "Ürün ara" kutusunun üzerinde duran kayan görsel
// şeridi. Admin panelden yüklenen duyuru / etkinlik afişlerini otomatik geçişli
// bir carousel olarak gösterir. Tek afiş varsa sade bir görsel gibi durur.
export default function BannerSlider({ slides }: { slides: BannerSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const count = slides.length;

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  useEffect(() => {
    if (count < 2 || paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [count, paused]);

  if (count === 0) return null;

  const onPointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
    setPaused(true);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const start = dragStartX.current;
    dragStartX.current = null;
    setPaused(false);
    if (start == null || count < 2) return;
    const delta = e.clientX - start;
    if (delta <= -SWIPE_THRESHOLD) go(index + 1);
    else if (delta >= SWIPE_THRESHOLD) go(index - 1);
  };

  return (
    <div
      className="animate-card-in relative mb-4 overflow-hidden rounded-[24px] bg-chip shadow-panel sm:rounded-[28px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        dragStartX.current = null;
        setPaused(false);
      }}
    >
      <div
        className="flex touch-pan-y transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide) => (
          <Slide key={slide.id} slide={slide} />
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Önceki afiş"
            onClick={() => go(index - 1)}
            className="absolute left-2 top-1/2 z-[2] grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/40"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Sonraki afiş"
            onClick={() => go(index + 1)}
            className="absolute right-2 top-1/2 z-[2] grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/40"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>

          <div className="absolute inset-x-0 bottom-2.5 z-[2] flex justify-center gap-1.5">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`${i + 1}. afişe git`}
                aria-current={i === index}
                onClick={() => go(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-5 bg-white" : "w-1.5 bg-white/55 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Slide({ slide }: { slide: BannerSlide }) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={slide.image}
      alt=""
      draggable={false}
      className="aspect-[16/6] h-full w-full select-none object-cover sm:aspect-[21/6]"
    />
  );

  if (!slide.link) {
    return <div className="min-w-full">{img}</div>;
  }

  const external = /^https?:\/\//i.test(slide.link);
  return (
    <a
      href={slide.link}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="block min-w-full"
      onClick={(e) => {
        // Kaydırma hareketini tıklama sanıp yönlendirme yapmasın.
        if (e.detail === 0) e.preventDefault();
      }}
    >
      {img}
    </a>
  );
}
