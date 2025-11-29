import crypto from "crypto";

export default function handler(req, res) {
  const { code, shop_id } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Missing code" });
  }

  const PARTNER_ID = process.env.PARTNER_ID;
  const PARTNER_KEY = process.env.PARTNER_KEY;

  const timestamp = Math.floor(Date.now() / 1000);

  const path = "/api/shopee/get-token";
  const baseString = `${PARTNER_ID}${path}${timestamp}`;

  const sign = crypto
    .createHmac("sha256", PARTNER_KEY)
    .update(baseString)
    .digest("hex");

  return res.json({
    message: "Token endpoint working!",
    code,
    shop_id,
    timestamp,
    sign,
  });
}
