import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    // Ürün görselleri Supabase Storage'dan geldiğinde buraya host eklenecek.
    remotePatterns: [],
  },
  experimental: {
    serverActions: {
      // Next.js'in varsayılan 1MB sınırı telefon fotoğrafları için çok düşük —
      // ürün/kategori/logo/duyuru görseli yüklerken "Bir şeyler ters gitti"
      // hatasına yol açıyordu. Sınırı yükseltiyoruz.
      bodySizeLimit: "10mb",
    },
  },
};

export default withNextIntl(nextConfig);
