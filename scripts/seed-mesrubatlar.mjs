import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// menu.vefakar.com.tr/category/soguk-icecekler sayfasından çekilen ürünler ve
// fiyatları. Kategori adı istek üzerine "Meşrubatlar" olarak eklenir.
const CATEGORY_ID = "mesrubatlar";

const items = [
  ["mesrubat-fanta", "Fanta", "Fanta", 100],
  ["mesrubat-ice-tea", "Ice Tea", "Iced Tea", 100],
  ["mesrubat-sprite", "Sprite", "Sprite", 100],
  ["mesrubat-redbull", "Redbull Çeşitleri (250ml)", "Red Bull Varieties (250ml)", 150],
  ["mesrubat-cappy", "Cappy Meyve Suyu", "Cappy Fruit Juice", 100],
  ["mesrubat-sade-soda", "Sade Soda", "Plain Soda", 60],
  ["mesrubat-su", "Su", "Water", 40],
  ["mesrubat-churchill", "Churchill", "Churchill", 90],
  ["mesrubat-meyveli-soda", "Meyveli Soda", "Fruit Soda", 65],
  ["mesrubat-ayran", "Ayran", "Ayran", 80],
  ["mesrubat-beyoglu-gazoz", "Beyoğlu Gazoz (Klasik)", "Beyoğlu Soda (Classic)", 90],
  ["mesrubat-coca-cola", "Coca Cola", "Coca-Cola", 100],
  ["mesrubat-coca-cola-zero", "Coca Cola Zero", "Coca-Cola Zero", 100],
  ["mesrubat-ice-oralet", "Ice Oralet", "Iced Oralet", 140],
  ["mesrubat-ev-yapimi-limonlu-ice-tea", "Ev Yapımı Limonlu Ice Tea", "Homemade Lemon Iced Tea", 120],
  ["mesrubat-taze-sikilmis-meyveler", "Taze Sıkılmış Meyveler (Seçeceğiniz 3 Meyve)", "Freshly Squeezed Fruit (Choose 3)", 230],
  ["mesrubat-detox", "Detox", "Detox", 220],
  ["mesrubat-taze-portakal-suyu", "Taze Portakal Suyu", "Fresh Orange Juice", 200],
  ["mesrubat-taze-bogurtlen-suyu", "Taze Böğürtlen Suyu", "Fresh Blackberry Juice", 150],
  ["mesrubat-taze-limonata", "Taze Limonata", "Fresh Lemonade", 150],
  ["mesrubat-meyveli-limonata", "Meyveli Limonata", "Fruit Lemonade", 180],
  ["mesrubat-cool-lime", "Cool Lime", "Cool Lime", 180],
  ["mesrubat-cool-yesil-elma", "Cool Yeşil Elma (Ekşi)", "Cool Green Apple (Sour)", 180],
  ["mesrubat-cool-bogurtlen", "Cool Böğürtlen (Ekşi)", "Cool Blackberry (Sour)", 180],
  ["mesrubat-cool-berry-hibiscus", "Cool Berry Hibiscus", "Cool Berry Hibiscus", 180],
  ["mesrubat-cool-mango", "Cool Mango", "Cool Mango", 180],
  ["mesrubat-ottoman-ice-tea", "Ottoman İce Tea", "Ottoman Iced Tea", 200],
  ["mesrubat-buzlu-bardak", "Buzlu Bardak", "Cup of Ice", 10],
];

// Kategori sona eklensin diye mevcut kategori sayısını sort_order olarak kullan.
const { count } = await supabase
  .from("categories")
  .select("id", { count: "exact", head: true });

const { error: catErr } = await supabase.from("categories").upsert(
  {
    id: CATEGORY_ID,
    name_tr: "Meşrubatlar",
    name_en: "Beverages",
    emoji: "🥤",
    sort_order: count ?? 0,
  },
  { onConflict: "id" },
);
if (catErr) {
  console.error("CATEGORY ERROR:", catErr);
  process.exit(1);
}

const rows = items.map(([id, nameTr, nameEn, price], i) => ({
  id,
  category_id: CATEGORY_ID,
  name_tr: nameTr,
  name_en: nameEn,
  emoji: "🥤",
  price,
  out_of_stock: false,
  sort_order: i,
}));

const { data, error } = await supabase
  .from("products")
  .upsert(rows, { onConflict: "id" })
  .select();
if (error) {
  console.error("ERROR:", error);
  process.exit(1);
}
console.log(`"Meşrubatlar" kategorisi + ${data.length} ürün eklendi/güncellendi.`);
console.table(data.map((r) => ({ name: r.name_tr, price: r.price })));
