"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Category } from "@/data/menu";

// Ürün yönetimi sayfasında kategori başlığının yanında, kategoriler arasında
// hızlı geçiş yapmak için yatayda kaydırılabilir küçük çip menü.
// Masaüstünde fare tekerleği dikey gelir — burada yatay kaydırmaya çeviriyoruz
// (React'in onWheel'i passive olduğundan preventDefault işe yaramıyor, bu yüzden
// native addEventListener + passive:false kullanıyoruz), ayrıca sürükleyerek de
// kaydırılabiliyor. Sürükleme takibi window üzerinden yapılıyor — setPointerCapture
// kullanmıyoruz çünkü o, click olayını linkten alıp kapsayıcı div'e yönlendiriyor
// ve bu da kategori linklerine tıklamayı tamamen kırıyordu. Dokunmatikte native çalışır.
export default function CategoryQuickSwitch({
  categories,
  activeId,
}: {
  categories: Category[];
  activeId: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragged = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      el.scrollLeft += e.deltaY !== 0 ? e.deltaY : e.deltaX;
      e.preventDefault();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const el = scrollerRef.current;
    if (!el || e.button !== 0) return;
    isDragging.current = true;
    dragged.current = false;
    startX.current = e.clientX;
    startScrollLeft.current = el.scrollLeft;

    const handleMove = (ev: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = ev.clientX - startX.current;
      if (Math.abs(dx) > 5) dragged.current = true;
      el.scrollLeft = startScrollLeft.current - dx;
    };
    const handleUp = () => {
      isDragging.current = false;
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  function handleClickCapture(e: React.MouseEvent) {
    // Sürükleme yapıldıysa linke tıklanmış gibi algılanıp sayfa değişmesin.
    if (dragged.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  return (
    <div
      ref={scrollerRef}
      onPointerDown={handlePointerDown}
      onClickCapture={handleClickCapture}
      className="flex max-w-full cursor-grab items-center gap-1.5 overflow-x-auto pb-1 active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {categories.map((cat) => {
        const isActive = cat.id === activeId;
        return (
          <Link
            key={cat.id}
            href={`/admin/${cat.id}`}
            draggable={false}
            className={`shrink-0 select-none rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition-colors ${
              isActive ? "bg-accent text-white" : "bg-chip text-muted"
            }`}
          >
            {cat.name.tr}
          </Link>
        );
      })}
    </div>
  );
}
