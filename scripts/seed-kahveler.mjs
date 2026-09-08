import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// vefakar.com.tr/category/kahve sitesinden alınan gerçek kampanya (satış) fiyatları.
// "price" alanı sahte/yüksek "eski fiyat" (üstü çizili gösterilecek), "campaignPrice"
// ise müşterinin gerçekte ödeyeceği (vefakar'daki) fiyat.
const items = [
  ["Türk Kahvesi", "Turkish Coffee", 140],
  ["Sütlü Filtre Kahve", "Filter Coffee with Milk", 180],
  ["Duble Türk Kahvesi", "Double Turkish Coffee", 200],
  ["Flat White", "Flat White", 190],
  ["Dibek Kahvesi", "Dibek Coffee", 140],
  ["Menengiç Kahvesi", "Menengiç Coffee", 140],
  ["Double Espresso", "Double Espresso", 180],
  ["Espresso Single", "Single Espresso", 140],
  ["Americano", "Americano", 180],
  ["Cortado", "Cortado", 200],
  ["Lungo", "Lungo", 180],
  ["Espresso Macchiato", "Espresso Macchiato", 190],
  ["Ristretto", "Ristretto", 180],
  ["Affogato", "Affogato", 210],
  ["Latte", "Latte", 200],
  ["Espresso Con Panna", "Espresso Con Panna", 210],
  ["Filtre Kahve", "Filter Coffee", 160],
  ["Cappuccino", "Cappuccino", 200],
  ["Sütlü Kahve", "Coffee with Milk", 200],
  ["Lotus Bisküvili Latte", "Lotus Biscuit Latte", 240],
  ["Mocha", "Mocha", 240],
  ["White Chocolate Mocha", "White Chocolate Mocha", 240],
  ["Chai Tea Latte", "Chai Tea Latte", 220],
  ["Aromalı Latte Macchiato", "Flavored Latte Macchiato", 240],
  ["Aromalar", "Flavor Shots", 40],
  ["Ice Americano", "Iced Americano", 220],
  ["Ice Latte", "Iced Latte", 240],
  ["Ice Filtre", "Iced Filter Coffee", 200],
  ["Ice Mocha", "Iced Mocha", 270],
  ["Ice Chocolate", "Iced Chocolate", 250],
  ["Coco Ice Cream Latte", "Coconut Ice Cream Latte", 250],
  ["Ice Mocha Strawberry", "Iced Strawberry Mocha", 260],
  ["Pistachio Chocolate Ice Latte", "Pistachio Chocolate Iced Latte", 250],
];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function fakeOriginalPrice(campaignPrice) {
  return Math.ceil((campaignPrice * 1.2) / 10) * 10;
}

const rows = items.map(([nameTr, nameEn, campaignPrice], i) => ({
  id: `kahve-${slugify(nameTr)}`,
  category_id: "kahveler",
  name_tr: nameTr,
  name_en: nameEn,
  emoji: "☕",
  price: fakeOriginalPrice(campaignPrice),
  campaign_price: campaignPrice,
  campaign_active: true,
  out_of_stock: false,
  sort_order: i,
}));

const { data, error } = await supabase.from("products").upsert(rows, { onConflict: "id" }).select();
if (error) {
  console.error("ERROR:", error);
  process.exit(1);
}
console.log(`Inserted/updated ${data.length} products.`);
console.table(
  data.map((r) => ({ name: r.name_tr, price: r.price, campaign_price: r.campaign_price })),
);
