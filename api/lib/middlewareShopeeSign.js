// api/lib/middlewareShopeeSign.js
import crypto from "crypto";
import getValidToken from "./getValidToken.js";

export async function shopeeSignedFetch(path, method = "GET", body = null) {
  const partnerId = process.env.PARTNER_ID;
  const partnerKey = process.env.PARTNER_KEY;
  const shopId = process.env.SHOP_ID;

  const timestamp = Math.floor(Date.now() / 1000);

  const baseString = `${partnerId}${path}${timestamp}`;
  const sign = crypto.createHmac("sha256", partnerKey)
    .update(baseString)
    .digest("hex");

  const token = await getValidToken();

  const url =
    `https://partner.shopeemobile.com${path}` +
    `?partner_id=${partnerId}` +
    `&timestamp=${timestamp}` +
    `&sign=${sign}` +
    `&shop_id=${shopId}` +
    `&access_token=${token}`;

  const options = {
    method,
    headers: { "Content-Type": "application/json" }
  };

  if (body) options.body = JSON.stringify(body);

  const response = await fetch(url, options);
  const data = await response.json();

  return data;
}
