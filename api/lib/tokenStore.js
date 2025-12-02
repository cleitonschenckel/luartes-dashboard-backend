// api/lib/tokenStore.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const TABLE = "tokens";

export async function saveTokens(tokens) {
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    id: 1, // único registro
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expire_in: tokens.expire_in,
    shop_id: tokens.shop_id,

    created_at: now,
    updated_at: now
  };

  const { error } = await supabase
    .from(TABLE)
    .upsert(payload, { onConflict: "id" });

  if (error) {
    console.error("Erro ao salvar tokens no Supabase:", error);
    throw error;
  }

  return payload;
}

export async function loadTokens() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Erro ao carregar tokens:", error);
    return null;
  }

  return data;
}

export function isTokenExpired(token) {
  if (!token) return true;

  const now = Math.floor(Date.now() / 1000);
  const expiresAt = token.created_at + token.expire_in - 60; // margem 1 minuto

  return now >= expiresAt;
}
