import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getCurrentCustomer } from "@/lib/supabase-server";
import { CustomerProvider } from "@/components/CustomerProvider";
import { CartProvider } from "@/components/CartProvider";
import CartDrawer from "@/components/CartDrawer";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();
  const customer = await getCurrentCustomer();

  return (
    <NextIntlClientProvider messages={messages}>
      <CustomerProvider initialCustomer={customer}>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </CustomerProvider>
    </NextIntlClientProvider>
  );
}
