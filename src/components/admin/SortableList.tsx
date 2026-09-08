"use client";

import { Children, createContext, useContext, useEffect, useRef, useState } from "react";

type DragContextValue = {
  startDrag: (id: string) => void;
};

const DragContext = createContext<DragContextValue | null>(null);

// Satırları sürükle-bırak ile yeniden sıralar. Sürükleme yalnızca <DragHandle>
// tutamacıyla başlar — satırın içindeki form alanlarına dokunmaz. Her satır,
// `ids` ile aynı sırada children olarak geçirilir. Bırakıldığında yeni sıra
// `onReorder`'a (bir server action) verilir.
export default function SortableList({
  ids,
  onReorder,
  children,
}: {
  ids: string[];
  onReorder: (orderedIds: string[]) => void | Promise<void>;
  children: React.ReactNode;
}) {
  const [order, setOrder] = useState(ids);
  const dragId = useRef<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const savedOrder = useRef(ids);

  // Sunucudan gelen yeni veri (ekleme/silme/revalidate) olduğunda senkron kal.
  useEffect(() => {
    setOrder(ids);
    savedOrder.current = ids;
  }, [ids]);

  // Children.toArray() React'in kendi anahtarlarına önek ekliyor (ör. ".$id"),
  // bu yüzden el.key ile eşleştirmek yerine `ids` ile aynı sırada, index
  // bazında eşliyoruz — ikisi de aynı dizi üzerinden aynı sırayla üretiliyor.
  const childArray = Children.toArray(children) as React.ReactElement[];
  const byId = new Map(ids.map((id, i) => [id, childArray[i]]));

  function startDrag(id: string) {
    dragId.current = id;
    setDraggingId(id);
  }

  function handleDragEnter(overId: string) {
    const draggedId = dragId.current;
    if (!draggedId || draggedId === overId) return;
    setOrder((prev) => {
      const from = prev.indexOf(draggedId);
      const to = prev.indexOf(overId);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      next.splice(from, 1);
      next.splice(to, 0, draggedId);
      return next;
    });
  }

  function handleDragEnd() {
    dragId.current = null;
    setDraggingId(null);
    setOrder((current) => {
      const changed =
        current.length !== savedOrder.current.length ||
        current.some((id, i) => id !== savedOrder.current[i]);
      if (changed) {
        savedOrder.current = current;
        onReorder(current);
      }
      return current;
    });
  }

  return (
    <DragContext.Provider value={{ startDrag }}>
      <div className="space-y-2.5" onDragEnd={handleDragEnd}>
        {order.map((id) => {
          const el = byId.get(id);
          if (!el) return null;
          return (
            <div
              key={id}
              onDragEnter={() => handleDragEnter(id)}
              onDragOver={(e) => e.preventDefault()}
              className={`transition-opacity ${draggingId === id ? "opacity-40" : ""}`}
            >
              {el}
            </div>
          );
        })}
      </div>
    </DragContext.Provider>
  );
}

// Satırların içine konacak, sürüklemeyi başlatan tutamaç (⣿ altı nokta).
export function DragHandle({ id }: { id: string }) {
  const ctx = useContext(DragContext);

  return (
    <span
      draggable
      onDragStart={(e) => {
        ctx?.startDrag(id);
        e.dataTransfer.effectAllowed = "move";
        // Firefox'ta dragstart'ın işlemesi için veri set edilmesi gerekiyor.
        e.dataTransfer.setData("text/plain", id);
      }}
      title="Basılı tutup sürükleyerek sırala"
      aria-label="Sürükleyerek sırala"
      className="grid h-10 w-9 shrink-0 cursor-grab touch-none select-none place-items-center rounded-xl bg-chip text-ink transition-colors hover:bg-line active:cursor-grabbing"
    >
      <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="currentColor">
        <circle cx="6" cy="5" r="1.6" />
        <circle cx="14" cy="5" r="1.6" />
        <circle cx="6" cy="10" r="1.6" />
        <circle cx="14" cy="10" r="1.6" />
        <circle cx="6" cy="15" r="1.6" />
        <circle cx="14" cy="15" r="1.6" />
      </svg>
    </span>
  );
}
