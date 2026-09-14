"use client";

import { createContext, useContext } from "react";

const StarsEnabledContext = createContext(true);

// Panelden "Yıldız Sistemi" kapatıldığında sitede yıldızlarla ilgili hiçbir
// şeyin (hesap rozeti, kahve fincanı, ödül mesajları, sepette ödül kullan
// seçeneği) görünmemesi için bu bayrağı ağacın en üstünden dağıtır.
export function StarsSystemProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <StarsEnabledContext.Provider value={enabled}>{children}</StarsEnabledContext.Provider>
  );
}

export function useStarsEnabled() {
  return useContext(StarsEnabledContext);
}
