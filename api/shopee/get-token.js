import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const partnerId = process.env.PARTNER_ID;
  const partnerKey = process.env.PARTNER_KEY;
  const redirectUrl = process.env.REDIRECT_URL;

  if (!partnerId || !partnerKey || !redirectUrl) {
    return res.status(500).json({
      error: "MISSING_ENV",
      message: "Configure PARTNER_ID, PARTNER_KEY e REDIRECT_URL."
    });
  }

  const baseUrl = "https://partner.shopeemobile.com";
  const path = "/api/v2/shop/auth_partner";

  const timestamp = Math.floor(Date.now() / 1000);
  const signBase = `${partnerId}${path}${timestamp}`;

  const sign = crypto
    .createHmac("sha256", partnerKey)
    .update(signBase)
    .digest("hex");

  const authURL =
    `${baseUrl}${path}` +
    `?partner_id=${partnerId}` +
    `&timestamp=${timestamp}` +
    `&sign=${sign}` +
    `&redirect=${encodeURIComponent(redirectUrl)}`;

  return res.status(200).json({ url: authURL });
}
