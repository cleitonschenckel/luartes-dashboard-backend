import crypto from "crypto";
import { saveTokens, loadTokens } from "../../lib/tokenStore.js";

export default async function handler(req, res) {
  try {
    const stored = await loadTokens();

    if (!stored) {
      return res.status(400).json({ error: "Nenhum token salvo no Supabase" });
    }

    if (!stored.refresh_token) {
      return res.status(400).json({ error: "refresh_token ausente" });
    }

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
      `?partner_id=${partnerId}&timestamp=${timestamp}&sign=${sign}`;

    const body = {
      refresh_token: stored.refresh_token,
      shop_id: stored.shop_id
    };

    const shopeeResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await shopeeResponse.json();

    if (data.error && data.error !== "") {
      return res.status(400).json({
        error: true,
        message: data.message || "Erro na Shopee",
        details: data
      });
    }

    await saveTokens({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expire_in: data.expire_in,
      shop_id: stored.shop_id
    });

    return res.status(200).json({
      success: true,
      message: "Token atualizado com sucesso ✔️",
      new_tokens: data
    });

  } catch (e) {
    return res.status(500).json({
      error: true,
      details: e.message
    });
  }
}
