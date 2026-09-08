import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i")
    .replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// 7 içecek kategorisi (yemek kategorileri sort_order 0-11 aralığında, dokunulmuyor)
const CATEGORIES = [
  { id: "kahveler", tr: "Sıcak Kahveler", en: "Hot Coffees", emoji: "☕", sort: 12 },
  { id: "turk-kahveleri", tr: "Türk Kahveleri", en: "Turkish Coffees", emoji: "🇹🇷", sort: 13 },
  { id: "soguk-kahveler", tr: "Soğuk Kahveler", en: "Cold Coffees", emoji: "🧊", sort: 14 },
  { id: "sicak-cikolatalar", tr: "Sıcak Çikolatalar", en: "Hot Chocolates", emoji: "🍫", sort: 15 },
  { id: "caylar", tr: "Çaylar", en: "Teas", emoji: "🫖", sort: 16 },
  { id: "soguk-icecekler", tr: "Soğuk İçecekler", en: "Cold Drinks", emoji: "🥤", sort: 17 },
  { id: "karnak-special", tr: "Karnak Special", en: "Karnak Special", emoji: "⭐", sort: 18 },
];

// [name_tr, name_en, price]
const ITEMS = {
  kahveler: [
    ["Espresso", "Espresso", 110],
    ["Americano", "Americano", 120],
    ["Doppio", "Doppio", 135],
    ["Macchiato", "Macchiato", 145],
    ["Long Black", "Long Black", 145],
    ["Espresso Macchiato", "Espresso Macchiato", 150],
    ["Cafe Latte", "Cafe Latte", 150],
    ["Cappuccino", "Cappuccino", 150],
    ["Latte Macchiato", "Latte Macchiato", 150],
    ["Flat White", "Flat White", 155],
    ["Cortado", "Cortado", 160],
    ["White Mocha", "White Mocha", 180],
    ["Cafe Mocha", "Cafe Mocha", 185],
    ["Lotus Latte", "Lotus Latte", 170],
    ["Red Eye", "Red Eye", 170],
    ["Filtre Kahve", "Filter Coffee", 130],
  ],
  "turk-kahveleri": [
    ["Türk Kahvesi", "Turkish Coffee", 120],
    ["Hindiba (Şekersiz)", "Chicory Coffee (Sugar-free)", 140],
    ["Fındıklı Türk Kahvesi", "Hazelnut Turkish Coffee", 140],
    ["Aromalı Türk Kahvesi", "Flavored Turkish Coffee", 140],
    ["Duble Çikolatalı Türk Kahvesi", "Double Chocolate Turkish Coffee", 140],
    ["Menengiç Kahvesi", "Menengiç Coffee", 130],
    ["Osmanlı Dibek Kahvesi", "Ottoman Dibek Coffee", 130],
    ["7 Çeşit Osmanlı Kahvesi", "7-Blend Ottoman Coffee", 240],
  ],
  "soguk-kahveler": [
    ["Iced Americano", "Iced Americano", 210],
    ["Iced Latte", "Iced Latte", 200],
    ["Iced Mocha", "Iced Mocha", 200],
    ["Iced White Mocha", "Iced White Mocha", 200],
    ["Iced Lotus Latte", "Iced Lotus Latte", 220],
    ["Freddo Cappuccino", "Freddo Cappuccino", 190],
    ["Freddo Espresso", "Freddo Espresso", 190],
    ["Frappe", "Frappe", 200],
    ["Cold Brew", "Cold Brew", 190],
    ["Smoothie", "Smoothie", 240],
    ["Frozen", "Frozen", 250],
    ["Milkshake", "Milkshake", 250],
  ],
  "sicak-cikolatalar": [
    ["Beyaz Çikolata", "White Chocolate", 170],
    ["Sütlü Çikolata", "Milk Chocolate", 170],
    ["Belçika Beyaz Çikolata", "Belgian White Chocolate", 220],
    ["Belçika Gold Çikolata", "Belgian Gold Chocolate", 220],
    ["Belçika Dark Çikolata", "Belgian Dark Chocolate", 220],
    ["Belçika Antep Fıstıklı Çikolata", "Belgian Pistachio Chocolate", 220],
    ["Belçika Karnak Special Çikolata", "Belgian Karnak Special Chocolate", 220],
  ],
  caylar: [
    ["Fincan Çay", "Cup of Tea", 70],
    ["Sütlü Çay", "Milk Tea", 70],
    ["Damla Çay", "Tea (Glass)", 35],
    ["Meyveli Çay", "Fruit Tea", 40],
    ["Gül Çayı", "Rose Tea", 170],
    ["Meyveli Bitki Çayı (Demlik)", "Fruit Herbal Tea (Pot)", 170],
  ],
  "soguk-icecekler": [
    ["Gazoz Çeşitleri", "Assorted Sodas", 125],
    ["Churchill", "Churchill", 90],
    ["Limonata", "Lemonade", 145],
    ["Maden Suyu", "Sparkling Mineral Water", 55],
    ["Su", "Water", 30],
    ["Meyveli Soda", "Fruit Soda", 65],
    ["Meyve Suyu", "Fruit Juice", 80],
    ["Fanta", "Fanta", 80],
    ["Coca-Cola", "Coca-Cola", 80],
    ["Sprite", "Sprite", 80],
    ["Fuse Tea", "Fuse Tea", 80],
    ["Red Bull", "Red Bull", 145],
  ],
  "karnak-special": [
    ["Karnak El Yapımı Ice Tea", "Karnak Homemade Iced Tea", 220],
    ["Belçika White Mocha", "Belgian White Mocha", 220],
    ["Belçika Dark Mocha", "Belgian Dark Mocha", 220],
    ["Iced Red Brew", "Iced Red Brew", 200],
    ["Iced Black Brew", "Iced Black Brew", 200],
  ],
};

const EMOJI_BY_CAT = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.emoji]));

async function main() {
  // 1) Yeni 7 kategoriyi kur (kahveler zaten var → adı güncellenir)
  const { error: catErr } = await supabase
    .from("categories")
    .upsert(
      CATEGORIES.map((c) => ({
        id: c.id, name_tr: c.tr, name_en: c.en, emoji: c.emoji, sort_order: c.sort,
      })),
      { onConflict: "id" },
    );
  if (catErr) throw catErr;

  // 2) Eski içecek kategorilerini sil (ürünleri cascade ile gider)
  const { error: delCatErr } = await supabase
    .from("categories")
    .delete()
    .in("id", ["sicak-icecekler", "mesrubatlar"]);
  if (delCatErr) throw delCatErr;

  // 3) "kahveler" (artık Sıcak Kahveler) içindeki eski ürünleri temizle
  const { error: delProdErr } = await supabase
    .from("products")
    .delete()
    .eq("category_id", "kahveler");
  if (delProdErr) throw delProdErr;

  // 4) Tüm yeni ürünleri ekle
  const rows = [];
  for (const cat of CATEGORIES) {
    const list = ITEMS[cat.id] ?? [];
    list.forEach(([tr, en, price], i) => {
      rows.push({
        id: `${cat.id}-${slugify(tr)}`,
        category_id: cat.id,
        name_tr: tr,
        name_en: en,
        emoji: EMOJI_BY_CAT[cat.id],
        price,
        campaign_active: false,
        campaign_price: null,
        out_of_stock: false,
        sort_order: i,
      });
    });
  }

  const { data, error } = await supabase
    .from("products")
    .upsert(rows, { onConflict: "id" })
    .select("category_id");
  if (error) throw error;

  const byCat = {};
  for (const r of data) byCat[r.category_id] = (byCat[r.category_id] ?? 0) + 1;
  console.log("Eklenen/güncellenen ürünler:");
  for (const c of CATEGORIES) console.log(`  ${c.tr}: ${byCat[c.id] ?? 0}`);
  console.log(`Toplam: ${data.length} ürün, ${CATEGORIES.length} kategori.`);
  console.log('Not: "Sıcak Kahveler" için "Ekstra Aroma +65₺ | Ekstra Süt +65₺" notu');
  console.log("     panelden kayan yazıya ya da bir ürün açıklamasına eklenebilir.");
}

main().catch((e) => {
  console.error("HATA:", e.message ?? e);
  process.exit(1);
});
