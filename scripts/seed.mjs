// Tek seferlik kurulum betiği: Storage bucket oluşturur, mevcut yerel
// görselleri Supabase Storage'a yükler ve menü verisini tablolara aktarır.
// Çalıştırma: node --env-file=.env.local scripts/seed.mjs

import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY eksik.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

const BUCKET = "menu-images";
const PUBLIC_DIR = path.join(process.cwd(), "public", "menu");

const LOCAL_IMAGES = [
  "category-gozleme.jpg",
  "category-omlet.jpg",
  "category-atistirmaliklar.jpg",
  "category-tostlar.jpg",
  "category-pizza.jpg",
  "category-hamburger.jpg",
  "category-wrap.jpg",
  "category-tavuk.jpg",
  "category-makarna.jpg",
  "category-ana-yemekler.jpg",
  "category-salata.jpg",
  "category-tatli.jpg",
];

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (buckets?.some((b) => b.name === BUCKET)) {
    console.log(`Bucket '${BUCKET}' zaten var.`);
    return;
  }
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: "5MB",
  });
  if (error) throw error;
  console.log(`Bucket '${BUCKET}' oluşturuldu.`);
}

async function uploadImages() {
  const urlMap = {};
  for (const filename of LOCAL_IMAGES) {
    const filePath = path.join(PUBLIC_DIR, filename);
    const buffer = await readFile(filePath);
    const storagePath = filename;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    urlMap[`/menu/${filename}`] = data.publicUrl;
    console.log(`Yüklendi: ${filename}`);
  }
  return urlMap;
}

const SIDE_FRIES = { tr: "Yanında patates ilave edilebilir", en: "Fries can be added on the side" };
const SERVED_WITH_FRIES = { tr: "Yanında patates ile servis edilir", en: "Served with fries" };
const SERVED_WITH_SALAD_PASTA = { tr: "Yanında salata ve makarna ile servis edilir", en: "Served with salad and pasta" };
const SERVED_WITH_RICE_SALAD = { tr: "Yanında pilav ve salata ile servis edilir", en: "Served with rice and salad" };
const OMLET_GARNISH = { tr: "Domates, salatalık ve maydonozla servis edilir", en: "Served with tomato, cucumber and parsley" };

const categories = [
  { id: "gozleme", name: { tr: "Gözleme", en: "Gözleme (Turkish Crepe)" }, emoji: "🫓", image: "/menu/category-gozleme.jpg" },
  { id: "omlet", name: { tr: "Omlet", en: "Omelette" }, emoji: "🍳", image: "/menu/category-omlet.jpg" },
  { id: "atistirmaliklar", name: { tr: "Atıştırmalıklar", en: "Snacks" }, emoji: "🍟", image: "/menu/category-atistirmaliklar.jpg" },
  { id: "tostlar", name: { tr: "Tostlar", en: "Toasts" }, emoji: "🥪", image: "/menu/category-tostlar.jpg" },
  { id: "pizza", name: { tr: "Pizza", en: "Pizza" }, emoji: "🍕", image: "/menu/category-pizza.jpg" },
  { id: "hamburger", name: { tr: "Hamburger", en: "Burgers" }, emoji: "🍔", image: "/menu/category-hamburger.jpg" },
  { id: "wrap", name: { tr: "Wrap", en: "Wraps" }, emoji: "🌯", image: "/menu/category-wrap.jpg" },
  { id: "tavuk", name: { tr: "Tavuk", en: "Chicken" }, emoji: "🍗", image: "/menu/category-tavuk.jpg" },
  { id: "makarna", name: { tr: "Makarna", en: "Pasta" }, emoji: "🍝", image: "/menu/category-makarna.jpg" },
  { id: "ana-yemekler", name: { tr: "Ana Yemekler", en: "Main Courses" }, emoji: "🍽️", image: "/menu/category-ana-yemekler.jpg" },
  { id: "salata", name: { tr: "Salata", en: "Salads" }, emoji: "🥗", image: "/menu/category-salata.jpg" },
  { id: "tatli", name: { tr: "Tatlı", en: "Desserts" }, emoji: "🍰", image: "/menu/category-tatli.jpg" },
];

const products = [
  { id: "gozleme-kasarli", categoryId: "gozleme", name: { tr: "Kaşarlı Gözleme", en: "Cheese Gözleme" }, description: SIDE_FRIES, emoji: "🧀" },
  { id: "gozleme-karisik", categoryId: "gozleme", name: { tr: "Karışık Gözleme", en: "Mixed Gözleme" }, description: SIDE_FRIES, emoji: "🫓", image: "/menu/category-gozleme.jpg" },
  { id: "gozleme-kavurmali", categoryId: "gozleme", name: { tr: "Kavurmalı Gözleme", en: "Sautéed Beef Gözleme" }, description: SIDE_FRIES, emoji: "🥘" },
  { id: "gozleme-patatesli", categoryId: "gozleme", name: { tr: "Patatesli Gözleme", en: "Potato Gözleme" }, emoji: "🥔" },

  { id: "omlet-kasarli", categoryId: "omlet", name: { tr: "Kaşarlı Omlet", en: "Cheese Omelette" }, description: OMLET_GARNISH, emoji: "🍳", image: "/menu/category-omlet.jpg" },
  { id: "omlet-sade", categoryId: "omlet", name: { tr: "Sade Omlet", en: "Plain Omelette" }, description: OMLET_GARNISH, emoji: "🍳" },

  { id: "kombo-tabagi", categoryId: "atistirmaliklar", name: { tr: "Kombo Tabağı", en: "Combo Platter" }, description: { tr: "Nugget, sosis, çıtır tavuk, sigara böreği, patates kızartması, kaşarlı kroket", en: "Nuggets, sausage, crispy chicken, cheese rolls, fries, cheese croquettes" }, emoji: "🍱", image: "/menu/category-atistirmaliklar.jpg" },
  { id: "sigara-boregi", categoryId: "atistirmaliklar", name: { tr: "Sigara Böreği", en: "Cheese Rolls (Sigara Böreği)" }, emoji: "🥟" },
  { id: "sosis-tabagi", categoryId: "atistirmaliklar", name: { tr: "Sosis Tabağı", en: "Sausage Platter" }, emoji: "🌭" },
  { id: "patates-kizartmasi", categoryId: "atistirmaliklar", name: { tr: "Patates Kızartması", en: "French Fries" }, emoji: "🍟" },

  { id: "tost-karisik", categoryId: "tostlar", name: { tr: "Karışık Tost", en: "Mixed Toast" }, emoji: "🥪", image: "/menu/category-tostlar.jpg" },
  { id: "tost-kasarli", categoryId: "tostlar", name: { tr: "Kaşarlı Tost", en: "Cheese Toast" }, emoji: "🧀" },
  { id: "tost-kavurmali", categoryId: "tostlar", name: { tr: "Kavurmalı Tost", en: "Sautéed Beef Toast" }, emoji: "🥘" },
  { id: "tost-beyaz-peynirli", categoryId: "tostlar", name: { tr: "Beyaz Peynirli Tost", en: "White Cheese Toast" }, emoji: "🧀" },

  { id: "pizza-margarita", categoryId: "pizza", name: { tr: "Margarita", en: "Margherita" }, emoji: "🍕", image: "/menu/category-pizza.jpg" },
  { id: "pizza-karisik", categoryId: "pizza", name: { tr: "Karışık Pizza", en: "Mixed Pizza" }, emoji: "🍕" },
  { id: "pizza-kavurmali", categoryId: "pizza", name: { tr: "Kavurmalı Pizza", en: "Sautéed Beef Pizza" }, emoji: "🍕" },
  { id: "pizza-tonlu", categoryId: "pizza", name: { tr: "Ton Balıklı Pizza", en: "Tuna Pizza" }, emoji: "🐟" },

  { id: "cheeseburger", categoryId: "hamburger", name: { tr: "Cheeseburger", en: "Cheeseburger" }, emoji: "🍔", image: "/menu/category-hamburger.jpg" },
  { id: "chicken-burger", categoryId: "hamburger", name: { tr: "Chicken Burger", en: "Chicken Burger" }, emoji: "🍗" },
  { id: "double-burger", categoryId: "hamburger", name: { tr: "Double Burger", en: "Double Burger" }, description: SERVED_WITH_FRIES, emoji: "🍔" },
  { id: "klasik-burger", categoryId: "hamburger", name: { tr: "Klasik Burger", en: "Classic Burger" }, emoji: "🍔" },

  { id: "wrap-kofte", categoryId: "wrap", name: { tr: "Köfte Wrap", en: "Meatball Wrap" }, description: SERVED_WITH_FRIES, emoji: "🌯", image: "/menu/category-wrap.jpg" },
  { id: "wrap-tavuk", categoryId: "wrap", name: { tr: "Tavuk Wrap", en: "Chicken Wrap" }, description: SERVED_WITH_FRIES, emoji: "🌯" },

  { id: "tavuk-kori", categoryId: "tavuk", name: { tr: "Köri Soslu Tavuk", en: "Curry Chicken" }, description: SERVED_WITH_SALAD_PASTA, emoji: "🍛", image: "/menu/category-tavuk.jpg" },
  { id: "tavuk-soya", categoryId: "tavuk", name: { tr: "Soya Soslu Tavuk", en: "Soy Sauce Chicken" }, description: SERVED_WITH_SALAD_PASTA, emoji: "🍗" },
  { id: "tavuk-barbeku", categoryId: "tavuk", name: { tr: "Barbekü Soslu Tavuk", en: "BBQ Chicken" }, description: SERVED_WITH_SALAD_PASTA, emoji: "🍗" },
  { id: "tavuk-chili", categoryId: "tavuk", name: { tr: "Chili Soslu Tavuk", en: "Chili Sauce Chicken" }, description: SERVED_WITH_SALAD_PASTA, emoji: "🌶️" },

  { id: "fettucini-alfredo", categoryId: "makarna", name: { tr: "Fettucini Alfredo", en: "Fettuccine Alfredo" }, emoji: "🍝" },
  { id: "penne-pesto", categoryId: "makarna", name: { tr: "Penne Pesto", en: "Penne Pesto" }, emoji: "🍝" },
  { id: "citir-tavuklu-penne", categoryId: "makarna", name: { tr: "Çıtır Tavuklu Penne", en: "Penne with Crispy Chicken" }, emoji: "🍝", image: "/menu/category-makarna.jpg" },

  { id: "tavuk-pirzola", categoryId: "ana-yemekler", name: { tr: "Tavuk Pirzola", en: "Chicken Chop" }, description: SERVED_WITH_RICE_SALAD, emoji: "🍗" },
  { id: "izgara-kofte", categoryId: "ana-yemekler", name: { tr: "Izgara Köfte", en: "Grilled Meatballs" }, description: SERVED_WITH_RICE_SALAD, emoji: "🍖" },
  { id: "manti", categoryId: "ana-yemekler", name: { tr: "Mantı", en: "Turkish Dumplings (Mantı)" }, emoji: "🥟", image: "/menu/category-ana-yemekler.jpg" },

  { id: "sezar-salata", categoryId: "salata", name: { tr: "Sezar Salata", en: "Caesar Salad" }, emoji: "🥗" },
  { id: "citir-tavuklu-salata", categoryId: "salata", name: { tr: "Çıtır Tavuklu Salata", en: "Crispy Chicken Salad" }, emoji: "🥗" },
  { id: "ton-balikli-salata", categoryId: "salata", name: { tr: "Ton Balıklı Salata", en: "Tuna Salad" }, emoji: "🥗" },

  { id: "magnolya", categoryId: "tatli", name: { tr: "Magnolya", en: "Magnolia" }, emoji: "🍮" },
  { id: "sutlac", categoryId: "tatli", name: { tr: "Sütlaç", en: "Rice Pudding" }, emoji: "🍮" },
  { id: "supangle", categoryId: "tatli", name: { tr: "Supangle", en: "Chocolate Pudding (Supangle)" }, emoji: "🍫" },
  { id: "sufle", categoryId: "tatli", name: { tr: "Sufle", en: "Chocolate Soufflé" }, emoji: "🍫" },
  { id: "san-sebastian", categoryId: "tatli", name: { tr: "San Sebastian", en: "San Sebastian Cheesecake" }, emoji: "🍰" },
  { id: "balli-fistikli", categoryId: "tatli", name: { tr: "Ballı Fıstıklı", en: "Honey Pistachio" }, emoji: "🥜" },
  { id: "balli-cevizli", categoryId: "tatli", name: { tr: "Ballı Cevizli", en: "Honey Walnut" }, emoji: "🥜" },
  { id: "beyaz-browni", categoryId: "tatli", name: { tr: "Beyaz Browni", en: "White Chocolate Brownie" }, emoji: "🍫" },
  { id: "orman-meyveli", categoryId: "tatli", name: { tr: "Orman Meyveli", en: "Mixed Berry" }, emoji: "🍰" },
  { id: "fistikli-kadayif", categoryId: "tatli", name: { tr: "Fıstıklı Kadayıf", en: "Pistachio Kadayıf" }, emoji: "🥮" },
  { id: "soguk-baklava", categoryId: "tatli", name: { tr: "Soğuk Baklava", en: "Cold Baklava" }, emoji: "🍯" },
  { id: "sutlava", categoryId: "tatli", name: { tr: "Sütlava", en: "Sütlava" }, emoji: "🍯" },
  { id: "meyve-tabagi", categoryId: "tatli", name: { tr: "Meyve Tabağı", en: "Fruit Plate" }, description: { tr: "Sezonun meyveleri", en: "Seasonal fruits" }, emoji: "🍓" },
];

async function seed(urlMap) {
  const categoryRows = categories.map((c, i) => ({
    id: c.id,
    name_tr: c.name.tr,
    name_en: c.name.en,
    emoji: c.emoji,
    image_url: c.image ? urlMap[c.image] ?? null : null,
    sort_order: i,
  }));

  const { error: catErr } = await supabase
    .from("categories")
    .upsert(categoryRows, { onConflict: "id" });
  if (catErr) throw catErr;
  console.log(`${categoryRows.length} kategori yazıldı.`);

  const counters = {};
  const productRows = products.map((p) => {
    const order = counters[p.categoryId] ?? 0;
    counters[p.categoryId] = order + 1;
    return {
      id: p.id,
      category_id: p.categoryId,
      name_tr: p.name.tr,
      name_en: p.name.en,
      description_tr: p.description?.tr ?? null,
      description_en: p.description?.en ?? null,
      price: p.price ?? null,
      emoji: p.emoji,
      image_url: p.image ? urlMap[p.image] ?? null : null,
      out_of_stock: false,
      sort_order: order,
    };
  });

  const { error: prodErr } = await supabase
    .from("products")
    .upsert(productRows, { onConflict: "id" });
  if (prodErr) throw prodErr;
  console.log(`${productRows.length} ürün yazıldı.`);
}

const urlMap = await (async () => {
  await ensureBucket();
  return uploadImages();
})();
await seed(urlMap);
console.log("Tamamlandı.");
