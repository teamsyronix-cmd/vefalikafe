// Bu dosya şimdilik örnek/statik veridir. Admin paneli + Supabase bağlandığında
// bu veriler veritabanından çekilecek, dosya yapısı (Category/Product) aynı kalacak.
//
// NOT: Fiyatlar henüz girilmedi (kaynak metinde yoktu) — `price` alanı bu yüzden
// opsiyonel bırakıldı. Fiyatlar gelince her ürüne `price: <sayı>` eklemek yeterli.

export type LocalizedText = {
  tr: string;
  en: string;
};

export type Product = {
  id: string;
  categoryId: string;
  name: LocalizedText;
  description?: LocalizedText;
  price?: number; // TL — henüz girilmedi
  emoji: string; // Görsel yüklenene kadar yer tutucu
  image?: string; // Supabase Storage URL'i (ileride)
  outOfStock?: boolean;
  campaignPrice?: number; // Kampanya (indirimli) fiyat
  campaignActive?: boolean; // Kampanya şu an yayında mı
};

export type Category = {
  id: string;
  name: LocalizedText;
  emoji: string; // Kategori fotoğrafı yüklenene kadar yer tutucu
  image?: string; // Supabase Storage URL'i (ileride) — ana ekrandaki büyük kategori kartının fotoğrafı
};

export const categories: Category[] = [
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

const SIDE_FRIES: LocalizedText = { tr: "Yanında patates ilave edilebilir", en: "Fries can be added on the side" };
const SERVED_WITH_FRIES: LocalizedText = { tr: "Yanında patates ile servis edilir", en: "Served with fries" };
const SERVED_WITH_SALAD_PASTA: LocalizedText = { tr: "Yanında salata ve makarna ile servis edilir", en: "Served with salad and pasta" };
const SERVED_WITH_RICE_SALAD: LocalizedText = { tr: "Yanında pilav ve salata ile servis edilir", en: "Served with rice and salad" };
const OMLET_GARNISH: LocalizedText = { tr: "Domates, salatalık ve maydonozla servis edilir", en: "Served with tomato, cucumber and parsley" };

export const products: Product[] = [
  // Gözleme
  { id: "gozleme-kasarli", categoryId: "gozleme", name: { tr: "Kaşarlı Gözleme", en: "Cheese Gözleme" }, description: SIDE_FRIES, emoji: "🧀" },
  { id: "gozleme-karisik", categoryId: "gozleme", name: { tr: "Karışık Gözleme", en: "Mixed Gözleme" }, description: SIDE_FRIES, emoji: "🫓", image: "/menu/category-gozleme.jpg" },
  { id: "gozleme-kavurmali", categoryId: "gozleme", name: { tr: "Kavurmalı Gözleme", en: "Sautéed Beef Gözleme" }, description: SIDE_FRIES, emoji: "🥘" },
  { id: "gozleme-patatesli", categoryId: "gozleme", name: { tr: "Patatesli Gözleme", en: "Potato Gözleme" }, emoji: "🥔" },

  // Omlet
  { id: "omlet-kasarli", categoryId: "omlet", name: { tr: "Kaşarlı Omlet", en: "Cheese Omelette" }, description: OMLET_GARNISH, emoji: "🍳", image: "/menu/category-omlet.jpg" },
  { id: "omlet-sade", categoryId: "omlet", name: { tr: "Sade Omlet", en: "Plain Omelette" }, description: OMLET_GARNISH, emoji: "🍳" },

  // Atıştırmalıklar
  { id: "kombo-tabagi", categoryId: "atistirmaliklar", name: { tr: "Kombo Tabağı", en: "Combo Platter" }, description: { tr: "Nugget, sosis, çıtır tavuk, sigara böreği, patates kızartması, kaşarlı kroket", en: "Nuggets, sausage, crispy chicken, cheese rolls, fries, cheese croquettes" }, emoji: "🍱", image: "/menu/category-atistirmaliklar.jpg" },
  { id: "sigara-boregi", categoryId: "atistirmaliklar", name: { tr: "Sigara Böreği", en: "Cheese Rolls (Sigara Böreği)" }, emoji: "🥟" },
  { id: "sosis-tabagi", categoryId: "atistirmaliklar", name: { tr: "Sosis Tabağı", en: "Sausage Platter" }, emoji: "🌭" },
  { id: "patates-kizartmasi", categoryId: "atistirmaliklar", name: { tr: "Patates Kızartması", en: "French Fries" }, emoji: "🍟" },

  // Tostlar
  { id: "tost-karisik", categoryId: "tostlar", name: { tr: "Karışık Tost", en: "Mixed Toast" }, emoji: "🥪", image: "/menu/category-tostlar.jpg" },
  { id: "tost-kasarli", categoryId: "tostlar", name: { tr: "Kaşarlı Tost", en: "Cheese Toast" }, emoji: "🧀" },
  { id: "tost-kavurmali", categoryId: "tostlar", name: { tr: "Kavurmalı Tost", en: "Sautéed Beef Toast" }, emoji: "🥘" },
  { id: "tost-beyaz-peynirli", categoryId: "tostlar", name: { tr: "Beyaz Peynirli Tost", en: "White Cheese Toast" }, emoji: "🧀" },

  // Pizza
  { id: "pizza-margarita", categoryId: "pizza", name: { tr: "Margarita", en: "Margherita" }, emoji: "🍕", image: "/menu/category-pizza.jpg" },
  { id: "pizza-karisik", categoryId: "pizza", name: { tr: "Karışık Pizza", en: "Mixed Pizza" }, emoji: "🍕" },
  { id: "pizza-kavurmali", categoryId: "pizza", name: { tr: "Kavurmalı Pizza", en: "Sautéed Beef Pizza" }, emoji: "🍕" },
  { id: "pizza-tonlu", categoryId: "pizza", name: { tr: "Ton Balıklı Pizza", en: "Tuna Pizza" }, emoji: "🐟" },

  // Hamburger
  { id: "cheeseburger", categoryId: "hamburger", name: { tr: "Cheeseburger", en: "Cheeseburger" }, emoji: "🍔", image: "/menu/category-hamburger.jpg" },
  { id: "chicken-burger", categoryId: "hamburger", name: { tr: "Chicken Burger", en: "Chicken Burger" }, emoji: "🍗" },
  { id: "double-burger", categoryId: "hamburger", name: { tr: "Double Burger", en: "Double Burger" }, description: SERVED_WITH_FRIES, emoji: "🍔" },
  { id: "klasik-burger", categoryId: "hamburger", name: { tr: "Klasik Burger", en: "Classic Burger" }, emoji: "🍔" },

  // Wrap
  { id: "wrap-kofte", categoryId: "wrap", name: { tr: "Köfte Wrap", en: "Meatball Wrap" }, description: SERVED_WITH_FRIES, emoji: "🌯", image: "/menu/category-wrap.jpg" },
  { id: "wrap-tavuk", categoryId: "wrap", name: { tr: "Tavuk Wrap", en: "Chicken Wrap" }, description: SERVED_WITH_FRIES, emoji: "🌯" },

  // Tavuk (soslu)
  { id: "tavuk-kori", categoryId: "tavuk", name: { tr: "Köri Soslu Tavuk", en: "Curry Chicken" }, description: SERVED_WITH_SALAD_PASTA, emoji: "🍛", image: "/menu/category-tavuk.jpg" },
  { id: "tavuk-soya", categoryId: "tavuk", name: { tr: "Soya Soslu Tavuk", en: "Soy Sauce Chicken" }, description: SERVED_WITH_SALAD_PASTA, emoji: "🍗" },
  { id: "tavuk-barbeku", categoryId: "tavuk", name: { tr: "Barbekü Soslu Tavuk", en: "BBQ Chicken" }, description: SERVED_WITH_SALAD_PASTA, emoji: "🍗" },
  { id: "tavuk-chili", categoryId: "tavuk", name: { tr: "Chili Soslu Tavuk", en: "Chili Sauce Chicken" }, description: SERVED_WITH_SALAD_PASTA, emoji: "🌶️" },

  // Makarna
  { id: "fettucini-alfredo", categoryId: "makarna", name: { tr: "Fettucini Alfredo", en: "Fettuccine Alfredo" }, emoji: "🍝" },
  { id: "penne-pesto", categoryId: "makarna", name: { tr: "Penne Pesto", en: "Penne Pesto" }, emoji: "🍝" },
  { id: "citir-tavuklu-penne", categoryId: "makarna", name: { tr: "Çıtır Tavuklu Penne", en: "Penne with Crispy Chicken" }, emoji: "🍝", image: "/menu/category-makarna.jpg" },

  // Ana Yemekler
  { id: "tavuk-pirzola", categoryId: "ana-yemekler", name: { tr: "Tavuk Pirzola", en: "Chicken Chop" }, description: SERVED_WITH_RICE_SALAD, emoji: "🍗" },
  { id: "izgara-kofte", categoryId: "ana-yemekler", name: { tr: "Izgara Köfte", en: "Grilled Meatballs" }, description: SERVED_WITH_RICE_SALAD, emoji: "🍖" },
  { id: "manti", categoryId: "ana-yemekler", name: { tr: "Mantı", en: "Turkish Dumplings (Mantı)" }, emoji: "🥟", image: "/menu/category-ana-yemekler.jpg" },

  // Salata
  { id: "sezar-salata", categoryId: "salata", name: { tr: "Sezar Salata", en: "Caesar Salad" }, emoji: "🥗" },
  { id: "citir-tavuklu-salata", categoryId: "salata", name: { tr: "Çıtır Tavuklu Salata", en: "Crispy Chicken Salad" }, emoji: "🥗" },
  { id: "ton-balikli-salata", categoryId: "salata", name: { tr: "Ton Balıklı Salata", en: "Tuna Salad" }, emoji: "🥗" },

  // Tatlı
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

export function getProductsByCategory(categoryId: string | null): Product[] {
  if (!categoryId) return products;
  return products.filter((p) => p.categoryId === categoryId);
}
