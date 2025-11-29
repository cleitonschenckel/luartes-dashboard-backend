export default function handler(req, res) {
  const partnerId = process.env.PARTNER_ID;
  const partnerKey = process.env.PARTNER_KEY;
  const redirectUrl = process.env.REDIRECT_URL;

  if (!partnerId || !partnerKey || !redirectUrl) {
    return res.status(500).json({
      error: "Missing environment variables",
    });
  }

  return res.status(200).json({
    auth_url: `https://partner.shopeemobile.com/api/v2/shop/auth_partner?partner_id=${partnerId}&redirect=${redirectUrl}`,
  });
}
