import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";

// Görseli olmayan içecek kategorilerine kapak fotoğrafı atar (projedeki
// fotograflar/ klasöründen), Supabase Storage'a kopyalayarak.

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
const BUCKET = "menu-images";
const F = path.join(process.cwd(), "fotograflar");

const MAP = {
  "turk-kahveleri": "turkkahvesi.jpg",
  "soguk-kahveler": "icelatte.jpg",
  "sicak-cikolatalar": "icechocolate.jpg",
  "caylar": "chaitea.jpg",
  "soguk-icecekler": "mesrubat.jpg",
  "karnak-special": "wcm.jpg",
};

async function main() {
  let ok = 0;
  let fail = 0;

  for (const [id, file] of Object.entries(MAP)) {
    try {
      const buf = await readFile(path.join(F, file));
      const dest = `categories/${id}-${Date.now()}.jpg`;
      const up = await supabase.storage.from(BUCKET).upload(dest, buf, {
        contentType: "image/jpeg",
        upsert: true,
      });
      if (up.error) throw up.error;

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(dest);
      const { error } = await supabase
        .from("categories")
        .update({ image_url: pub.publicUrl })
        .eq("id", id);
      if (error) throw error;

      ok++;
      console.log(`✓ ${id}  ←  ${file}`);
    } catch (e) {
      fail++;
      console.log(`✗ ${id}  —  ${e.message ?? e}`);
    }
  }
  console.log(`\nBitti: ${ok} kategori kapağı eklendi, ${fail} başarısız.`);
}

main().catch((e) => {
  console.error("HATA:", e.message ?? e);
  process.exit(1);
});
