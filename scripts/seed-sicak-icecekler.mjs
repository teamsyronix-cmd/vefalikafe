import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// vefakar.com.tr/category/sicak-icecek sitesinden alınan ürünler ve fiyatları.
const items = [
  ["sicak-cay", "Çay", "Tea", 40],
  ["sicak-oralet", "Oralet", "Oralet", 40],
  ["sicak-fincan-cay", "Fincan Çay", "Cup of Tea", 60],
  ["sicak-fincan-oralet", "Fincan Oralet", "Cup of Oralet", 60],
  ["sicak-bitki-cayi", "Bitki Çayı (French Press)", "Herbal Tea (French Press)", 180],
  ["sicak-salep", "Salep", "Salep", 200],
  ["sicak-cikolata", "Sıcak Çikolata", "Hot Chocolate", 200],
  ["sicak-cikolatali-salep", "Çikolatalı Salep", "Chocolate Salep", 220],
  ["sicak-cikolata-aromali", "Aromalı Sıcak Çikolata", "Flavored Hot Chocolate", 230],
  ["sicak-cikolata-kremsantili", "Sıcak Çikolata (Krem Şantili)", "Hot Chocolate (Whipped Cream)", 230],
  ["sicak-sut", "Sıcak Süt", "Hot Milk", 120],
  ["sicak-cikolata-dondurmali", "Sıcak Çikolata (Dondurmalı)", "Hot Chocolate (with Ice Cream)", 240],
  ["sicak-salep-buyuk", "Büyük Boy Salep", "Large Salep", 270],
  ["sicak-cikolata-buyuk", "Büyük Boy Sıcak Çikolata", "Large Hot Chocolate", 270],
];

const rows = items.map(([id, nameTr, nameEn, price], i) => ({
  id,
  category_id: "sicak-icecekler",
  name_tr: nameTr,
  name_en: nameEn,
  emoji: "🍵",
  price,
  out_of_stock: false,
  sort_order: i,
}));

const { data, error } = await supabase.from("products").upsert(rows, { onConflict: "id" }).select();
if (error) {
  console.error("ERROR:", error);
  process.exit(1);
}
console.log(`Inserted/updated ${data.length} products.`);
console.table(data.map((r) => ({ name: r.name_tr, price: r.price })));
