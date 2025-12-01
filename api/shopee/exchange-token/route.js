export const runtime = "nodejs"; // força Node de verdade

import crypto from "crypto";
import { saveTokens } from "../../../lib/tokenStore.js";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const shop_id = searchParams.get("shop_id");

    if (!code || !shop_id) {
      return Response.json(
        { error: "Missing code or shop_id" },
        { status: 400 }
      );
    }

    const partnerId = process.env.PARTNER_ID;
    const partnerKey = process.env.PARTNER_KEY;

    const timestamp = Math.floor(Date.now() / 1000);
    const path = "/api/v2/auth/token/get";

    // assinatura
    const baseString = `${partnerId}${path}${timestamp}`;
    const sign = crypto
      .createHmac("sha256", partnerKey)
      .update(baseString)
      .digest("hex");

    const url =
      `https://partner.shopeemobile.com${path}` +
      `?partner_id=${partnerId}&timestamp=${timestamp}&sign=${sign}`;

    const body = {
      code,
      shop_id: Number(shop_id),
      partner_id: Number(partnerId),
    };

    const shopeeResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await shopeeResponse.json();

    if (data.error) {
      return Response.json(
        { error: true, message: data.message, details: data },
        { status: 400 }
      );
    }

    await saveTokens({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expire_in: data.expire_in,
      shop_id: Number(shop_id),
    });

    return Response.json({
      success: true,
      tokens: data,
    });

  } catch (err) {
    return Response.json(
      { error: true, details: err.message },
      { status: 500 }
    );
  }
}
