import crypto from "crypto";
import { saveTokens } from "../../lib/tokenStore.js";

export default async function handler(req, res) {
  try {
    const { code, shop_id } = req.query;

    if (!code || !shop_id) {
      return res.status(400).json({
        error: "Missing code or shop_id"
      });
    }

    const partnerId = process.env.PARTNER_ID;
    const partnerKey = process.env.PARTNER_KEY;

    const timestamp = Math.floor(Date.now() / 1000);
    const path = "/api/v2/auth/token/get";

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
      code,
      shop_id: Number(shop_id)
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
        message: data.message,
        details: data
      });
    }

    // salvar tokens no Supabase
    await saveTokens({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expire_in: data.expire_in,
      shop_id: Number(shop_id)
    });

    return res.status(200).json({
      success: true,
      tokens: data
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      details: err.message
    });
  }
}
