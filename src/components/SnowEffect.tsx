"use client";

import { useEffect, useState } from "react";

// Yılbaşı temalı "kar yağışı" — tamamen CSS animasyonlu, saf dekorasyon.
const FLAKE_COUNT = 28;

type Flake = {
  left: number;
  duration: number;
  delay: number;
  size: number;
  drift: number;
  opacity: number;
};

export default function SnowEffect() {
  // Rastgele değerler yalnızca istemcide üretilir — sunucu/istemci hydration
  // uyuşmazlığı olmasın diye ilk render'da boş başlar.
  const [flakes, setFlakes] = useState<Flake[]>([]);

  useEffect(() => {
    setFlakes(
      Array.from({ length: FLAKE_COUNT }, () => ({
        left: Math.random() * 100,
        duration: 8 + Math.random() * 10,
        delay: Math.random() * -18,
        size: 6 + Math.random() * 10,
        drift: 20 + Math.random() * 40,
        opacity: 0.5 + Math.random() * 0.5,
      })),
    );
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      {flakes.map((f, i) => (
        <span
          key={i}
          className="animate-snowfall absolute top-[-5%] rounded-full bg-white"
          style={
            {
              left: `${f.left}%`,
              width: `${f.size}px`,
              height: `${f.size}px`,
              opacity: f.opacity,
              animationDuration: `${f.duration}s`,
              animationDelay: `${f.delay}s`,
              "--drift": `${f.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
