import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";

// Her içeceğe, projedeki gerçek kafe fotoğraflarından (fotograflar/ ve
// public/menu/) ürünle ilişkili bir görsel atar; Supabase Storage'a kopyalar.

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
const BUCKET = "menu-images";
const F = path.join(process.cwd(), "fotograflar"); // vefali-menu/fotograflar
const M = path.join(process.cwd(), "public", "menu");

const f = (name) => path.join(F, name);
const m = (name) => path.join(M, name);

// productId -> yerel dosya
const MAP = {
  // ---- Sıcak Kahveler ----
  "kahveler-espresso": f("espressosingle.jpg"),
  "kahveler-americano": f("americano.jpg"),
  "kahveler-doppio": f("doubleespresso.jpg"),
  "kahveler-macchiato": f("espressomachi.jpg"),
  "kahveler-long-black": f("americano.jpg"),
  "kahveler-espresso-macchiato": f("espressomachi.jpg"),
  "kahveler-cafe-latte": f("latte.jpg"),
  "kahveler-cappuccino": f("Cappuccino.jpg"),
  "kahveler-latte-macchiato": f("lattemach.jpg"),
  "kahveler-flat-white": f("flatwhite.jpg"),
  "kahveler-cortado": f("cortado.jpg"),
  "kahveler-white-mocha": f("wcm.jpg"),
  "kahveler-cafe-mocha": f("mocha.jpg"),
  "kahveler-lotus-latte": f("Lotus Bisküvili Latte.jpg"),
  "kahveler-red-eye": f("doubleespresso.jpg"),
  "kahveler-filtre-kahve": f("filtrekahve.jpg"),

  // ---- Türk Kahveleri ----
  "turk-kahveleri-turk-kahvesi": f("turkkahvesi.jpg"),
  "turk-kahveleri-hindiba-sekersiz": f("turkkahvesi.jpg"),
  "turk-kahveleri-findikli-turk-kahvesi": f("turkkahvesi.jpg"),
  "turk-kahveleri-aromali-turk-kahvesi": f("turkkahvesi.jpg"),
  "turk-kahveleri-duble-cikolatali-turk-kahvesi": f("doubletk.jpg"),
  "turk-kahveleri-menengic-kahvesi": f("menengic.jpg"),
  "turk-kahveleri-osmanli-dibek-kahvesi": f("dibek.jpg"),
  "turk-kahveleri-7-cesit-osmanli-kahvesi": f("dibek.jpg"),

  // ---- Soğuk Kahveler ----
  "soguk-kahveler-iced-americano": f("iceamericano.jpg"),
  "soguk-kahveler-iced-latte": f("icelatte.jpg"),
  "soguk-kahveler-iced-mocha": f("icemocha.jpg"),
  "soguk-kahveler-iced-white-mocha": f("icemocha.jpg"),
  "soguk-kahveler-iced-lotus-latte": f("icelatte.jpg"),
  "soguk-kahveler-freddo-cappuccino": f("icelatte.jpg"),
  "soguk-kahveler-freddo-espresso": f("iceamericano.jpg"),
  "soguk-kahveler-frappe": f("icemocha.jpg"),
  "soguk-kahveler-cold-brew": f("iceamericano.jpg"),
  "soguk-kahveler-smoothie": f("icestrw.jpg"),
  "soguk-kahveler-frozen": f("icestrw.jpg"),
  "soguk-kahveler-milkshake": f("icecoco.jpg"),

  // ---- Sıcak Çikolatalar ----
  "sicak-cikolatalar-beyaz-cikolata": f("icechocolate.jpg"),
  "sicak-cikolatalar-sutlu-cikolata": f("icechocolate.jpg"),
  "sicak-cikolatalar-belcika-beyaz-cikolata": f("icechocolate.jpg"),
  "sicak-cikolatalar-belcika-gold-cikolata": f("icechocolate.jpg"),
  "sicak-cikolatalar-belcika-dark-cikolata": f("icechocolate.jpg"),
  "sicak-cikolatalar-belcika-antep-fistikli-cikolata": f("Pistachio Chocolate Ice Latte.jpg"),
  "sicak-cikolatalar-belcika-karnak-special-cikolata": f("icechocolate.jpg"),

  // ---- Çaylar ----
  "caylar-fincan-cay": f("chaitea.jpg"),
  "caylar-sutlu-cay": f("chaitea.jpg"),
  "caylar-damla-cay": f("chaitea.jpg"),
  "caylar-meyveli-cay": f("chaitea.jpg"),
  "caylar-gul-cayi": f("chaitea.jpg"),
  "caylar-meyveli-bitki-cayi-demlik": f("chaitea.jpg"),

  // ---- Soğuk İçecekler ----
  "soguk-icecekler-gazoz-cesitleri": f("mesrubat.jpg"),
  "soguk-icecekler-churchill": f("mesrubat.jpg"),
  "soguk-icecekler-limonata": f("mesrubat.jpg"),
  "soguk-icecekler-maden-suyu": f("mesrubat.jpg"),
  "soguk-icecekler-su": f("mesrubat.jpg"),
  "soguk-icecekler-meyveli-soda": f("mesrubat.jpg"),
  "soguk-icecekler-meyve-suyu": f("mesrubat.jpg"),
  "soguk-icecekler-fanta": f("mesrubat.jpg"),
  "soguk-icecekler-coca-cola": f("mesrubat.jpg"),
  "soguk-icecekler-sprite": f("mesrubat.jpg"),
  "soguk-icecekler-fuse-tea": m("unmatched-iced-tea.jpg"),
  "soguk-icecekler-red-bull": f("mesrubat.jpg"),

  // ---- Karnak Special ----
  "karnak-special-karnak-el-yapimi-ice-tea": m("unmatched-iced-tea.jpg"),
  "karnak-special-belcika-white-mocha": f("wcm.jpg"),
  "karnak-special-belcika-dark-mocha": f("mocha.jpg"),
  "karnak-special-iced-red-brew": m("unmatched-iced-tea.jpg"),
  "karnak-special-iced-black-brew": f("iceamericano.jpg"),
};

async function main() {
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name_tr")
    .in("id", Object.keys(MAP));
  if (error) throw error;

  let ok = 0;
  let fail = 0;

  for (const p of products) {
    const src = MAP[p.id];
    try {
      const buf = await readFile(src);
      const dest = `products/icecek-${p.id}-${Date.now()}.jpg`;
      const up = await supabase.storage.from(BUCKET).upload(dest, buf, {
        contentType: "image/jpeg",
        upsert: true,
      });
      if (up.error) throw up.error;

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(dest);
      const { error: updErr } = await supabase
        .from("products")
        .update({ image_url: pub.publicUrl })
        .eq("id", p.id);
      if (updErr) throw updErr;

      ok++;
      console.log(`✓ ${p.name_tr}  ←  ${path.basename(src)}`);
    } catch (e) {
      fail++;
      console.log(`✗ ${p.name_tr}  —  ${e.message ?? e}`);
    }
  }

  console.log(`\nBitti: ${ok} görsel atandı, ${fail} başarısız.`);
}

main().catch((e) => {
  console.error("HATA:", e.message ?? e);
  process.exit(1);
});
