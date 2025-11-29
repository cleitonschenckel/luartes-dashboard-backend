export default function handler(req, res) {
  const partnerId = process.env.PARTNER_ID;
  const redirectUrl = process.env.REDIRECT_URL;

  const authURL =
    'https://partner.sandbox.shopeemobile.com/api/v2/authenticate?' +
    `partner_id=${partnerId}` +
    `&redirect=${encodeURIComponent(redirectUrl)}`;

  return res.status(200).json({ url: authURL });
}
