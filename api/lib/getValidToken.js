import { loadTokens, saveTokens, isTokenExpired } from "./tokenStore.js";
import crypto from "crypto";

// Função auxiliar: faz refresh automático
async function refreshToken(stored) {
  const partnerId = process.env.PARTNER_ID;
  const partnerKey = process.env.PARTNER_KEY;

  const timestamp = Math.floor(Date.now() / 1000);
  const path = "/api/v2/auth/access_token/get";

  const baseString = `${partnerId}${path}${timestamp}`;
  const sign = crypto
    .createHmac("sha256", partnerKey)
    .update(baseString)
    .digest("hex");

  const url =
    `https://partner.shopeemobile.com${path}` +
    `?partner_id=${partnerId}` +
    `&timestamp=${timestamp}` +
    `&sign=${sign}`;

  const body = {
    refresh_token: stored.refresh_token,
    shop_id: stored.shop_id,
  };

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await resp.json();

  if (data.error && data.error !== "") {
    throw new Error("Erro ao atualizar token: " + data.message);
  }

  // salva novos tokens no Supabase
  await saveTokens({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expire_in: data.expire_in,
    shop_id: stored.shop_id,
  });

  return data.access_token;
}

// Função principal
export async function getValidToken() {
  const stored = await loadTokens();

  if (!stored) {
    throw new Error("Nenhum token salvo no banco. Autorize a Shopee uma vez.");
  }

  // Token ainda válido → retorna direto
  if (!isTokenExpired(stored)) {
    return stored.access_token;
  }

  // Token expirado → refresh automático
  return await refreshToken(stored);
}
