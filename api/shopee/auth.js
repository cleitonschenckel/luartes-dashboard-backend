import crypto from "crypto";

export default function handler(req, res) {
  const partnerId = process.env.PARTNER_ID;
  const key = process.env.PARTNER_KEY;

  const timestamp = Math.floor(Date.now() / 1000);

  const redirect = process.env.REDIRECT_URL; 
  const path = "/api/v2/shop/auth_partner";

  const base = `${partnerId}${path}${timestamp}`;
  const sign = crypto.createHmac("sha256", key).update(base).digest("hex");

  const url =
    `https://partner.shopeemobile.com${path}` +
    `?partner_id=${partnerId}` +
    `&timestamp=${timestamp}` +
    `&sign=${sign}` +
    `&redirect=${encodeURIComponent(redirect)}`;

  return res.status(200).json({ login_url: url });
}
