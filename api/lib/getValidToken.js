// api/lib/getValidToken.js
import { loadTokens, saveTokens, isTokenExpired } from "./tokenStore.js";
import crypto from "crypto";

export default async function getValidToken() {
  let tokens = await loadTokens();

  if (!tokens) {
    throw new Error(
      "Nenhum token encontrado no Supabase. Acesse /api/shopee/auth para autorizar a Shopee."
    );
  }

  if (!isTokenExpired(tokens)) {
    return tokens.access_token;
  }

  // token expirado → renovar
  const partnerId = process.env.PARTNER_ID;
  const partnerKey = process.env.PARTNER_KEY;

  const timestamp = Math.floor(Date.now() / 1000);
  const path = "/api/v2/auth/access_token/get";
  const base = `${partnerId}${path}${timestamp}`;

  const sign = crypto.createHmac("sha256", partnerKey).update(base).digest("hex");

  const url =
    `https://partner.shopeemobile.com${path}` +
    `?partner_id=${partnerId}&timestamp=${timestamp}&sign=${sign}`;

  const body = {
    refresh_token: tokens.refresh_token,
    shop_id: tokens.shop_id,
  };

  const shopeeRes = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await shopeeRes.json();

  if (data.error) {
    throw new Error(`Erro ao renovar token: ${data.message}`);
  }

  // salvar novos tokens
  await saveTokens({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expire_in: data.expire_in,
    shop_id: tokens.shop_id,
  });

  return data.access_token;
}
