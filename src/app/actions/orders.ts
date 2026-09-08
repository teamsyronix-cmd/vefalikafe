"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase-server";

export type PlaceOrderState = { error?: string; success?: boolean };

type CartItemInput = {
  productId: string;
  nameTr: string;
  nameEn: string;
  price: number;
  qty: number;
};

export async function placeOrderAction(
  _prev: PlaceOrderState,
  formData: FormData,
): Promise<PlaceOrderState> {
  const tableNumber = String(formData.get("table_number") ?? "").trim();
  const itemsRaw = String(formData.get("items") ?? "[]");
  const redeemReward = formData.get("redeem_reward") === "on";

  if (!tableNumber) return { error: "Masa numarası gerekli." };

  let items: CartItemInput[];
  try {
    items = JSON.parse(itemsRaw);
  } catch {
    return { error: "Sepet okunamadı." };
  }
  if (!items.length) return { error: "Sepetiniz boş." };

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sipariş vermek için giriş yapmalısın." };

  let currentStars = 0;
  try {
    const { data: profile } = await supabase
      .from("customer_profiles")
      .select("stars")
      .eq("id", user.id)
      .maybeSingle();
    currentStars = profile?.stars ?? 0;
  } catch {
    return { error: "Sipariş sistemi henüz hazır değil." };
  }

  const canRedeem = redeemReward && currentStars >= 10;
  let discountApplied = false;

  const lineItems = items.map((it) => {
    let lineTotal = it.price * it.qty;
    if (canRedeem && !discountApplied && it.price > 0) {
      lineTotal = it.price * (it.qty - 1);
      discountApplied = true;
    }
    return { ...it, lineTotal };
  });

  const totalAmount = lineItems.reduce((sum, it) => sum + it.lineTotal, 0);

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      customer_id: user.id,
      table_number: tableNumber,
      total_amount: totalAmount,
      reward_redeemed: canRedeem && discountApplied,
    })
    .select()
    .single();

  if (orderErr || !order) {
    return { error: "Sipariş oluşturulamadı, tekrar deneyin." };
  }

  const { error: itemsErr } = await supabase.from("order_items").insert(
    lineItems.map((it) => ({
      order_id: order.id,
      product_id: it.productId,
      product_name_tr: it.nameTr,
      product_name_en: it.nameEn,
      quantity: it.qty,
      unit_price: it.price,
      line_total: it.lineTotal,
    })),
  );

  if (itemsErr) {
    return { error: "Sipariş kalemleri kaydedilemedi." };
  }

  // Yıldız burada VERİLMEZ — sipariş başına değil, masa oturumu başına
  // verilir (bkz. closeTableTabAction). Burada yalnızca ödül kullanıldıysa
  // (redeem) daha önce biriktirilmiş yıldızlar düşülür.
  if (canRedeem && discountApplied) {
    await supabase
      .from("customer_profiles")
      .update({ stars: Math.max(0, currentStars - 10) })
      .eq("id", user.id);
  }

  revalidatePath("/admin/siparisler");
  revalidatePath("/[locale]", "layout");
  return { success: true };
}
