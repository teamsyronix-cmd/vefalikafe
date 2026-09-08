"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase-server";

export type CustomerAuthState = {
  error?: string;
  needsEmailConfirm?: boolean;
  success?: boolean;
};

export async function registerCustomerAction(
  _prev: CustomerAuthState,
  formData: FormData,
): Promise<CustomerAuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { error: "Ad, e-posta ve şifre gerekli." };
  }
  if (password.length < 6) {
    return { error: "Şifre en az 6 karakter olmalı." };
  }

  const supabase = await getSupabaseServer();
  // "name" burada auth.users.raw_user_meta_data içine yazılır — Postgres
  // tarafındaki on_auth_user_created tetikleyicisi bunu okuyup
  // customer_profiles satırını otomatik oluşturur (RLS/oturum durumundan
  // bağımsız, SECURITY DEFINER ile çalışır, bu yüzden burada elle insert
  // denemiyoruz — e-posta onayı bekleyen oturumsuz kayıtlarda RLS engeline
  // takılıp sessizce başarısız oluyordu).
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) {
    return { error: error.message.includes("already registered") || error.message.includes("already been registered")
      ? "Bu e-posta zaten kayıtlı."
      : "Kayıt sırasında bir hata oluştu." };
  }
  if (!data.user) {
    return { error: "Kayıt sırasında bir hata oluştu." };
  }

  if (!data.session) {
    // E-posta onayı açık olan projelerde oturum hemen başlamaz.
    return { needsEmailConfirm: true };
  }

  revalidatePath("/[locale]", "layout");
  return {};
}

export async function loginCustomerAction(
  _prev: CustomerAuthState,
  formData: FormData,
): Promise<CustomerAuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "E-posta ve şifre gerekli." };
  }

  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: "E-posta veya şifre hatalı." };
  }

  revalidatePath("/[locale]", "layout");
  return {};
}

export async function logoutCustomerAction() {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut();
  revalidatePath("/[locale]", "layout");
}

export async function updateCustomerProfileAction(
  _prev: CustomerAuthState,
  formData: FormData,
): Promise<CustomerAuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  if (!name || !email) {
    return { error: "Ad ve e-posta gerekli." };
  }

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Giriş yapmalısın." };

  if (email !== user.email) {
    const { error } = await supabase.auth.updateUser({ email });
    if (error) return { error: "E-posta güncellenemedi." };
  }

  const { error: profileErr } = await supabase
    .from("customer_profiles")
    .update({ name, email })
    .eq("id", user.id);
  if (profileErr) return { error: "Profil güncellenemedi." };

  revalidatePath("/[locale]", "layout");
  return { success: true };
}

export async function updateCustomerPasswordAction(
  _prev: CustomerAuthState,
  formData: FormData,
): Promise<CustomerAuthState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) {
    return { error: "Şifre en az 6 karakter olmalı." };
  }

  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "Şifre güncellenemedi." };

  return { success: true };
}
