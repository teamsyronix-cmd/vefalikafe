"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Customer = {
  id: string;
  email: string;
  name: string;
  stars: number;
  lifetimeStars: number;
} | null;

const CustomerContext = createContext<Customer>(null);

// Sunucudan (Server Component) gelen ilk değeri alır ve her yeniden render'da
// (ör. giriş/kayıt/çıkış sonrası revalidate) senkron tutar.
export function CustomerProvider({
  initialCustomer,
  children,
}: {
  initialCustomer: Customer;
  children: React.ReactNode;
}) {
  const [customer, setCustomer] = useState(initialCustomer);

  useEffect(() => {
    setCustomer(initialCustomer);
  }, [initialCustomer]);

  return <CustomerContext.Provider value={customer}>{children}</CustomerContext.Provider>;
}

export function useCustomer() {
  return useContext(CustomerContext);
}
